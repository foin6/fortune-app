import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, X, Loader2 } from 'lucide-react';
import { handleSSEStream, CHAT_DIVINATION_API } from '../utils/api';

/**
 * AI算命聊天室组件
 * @param {boolean} isOpen - 是否显示
 * @param {Function} onClose - 关闭回调（可选，如果是嵌入模式则不需要）
 * @param {string} initialMessage - 初始欢迎消息
 * @param {boolean} embedded - 是否为嵌入模式（非弹窗）
 * @param {Object} formData - 表单数据（可选，用于自动填充上下文）
 * @param {Object} calculation - 排盘计算结果（可选，用于自动填充上下文）
 */
export default function ChatInterface({ isOpen, onClose, initialMessage, embedded = false, formData = null, calculation = null }) {
  const [messages, setMessages] = useState([]); // UI显示的消息列表
  const [chatMessages, setChatMessages] = useState([]); // 完整的对话历史（用于发送给后端）
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [quickReplies, setQuickReplies] = useState([]);
  const [isStage2Complete, setIsStage2Complete] = useState(false); // 阶段2（排盘）是否完成
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // 快捷追问按钮（只在阶段2完成后显示）
  const quickQuestionButtons = [
    { text: '🔮 起大运', content: '请为我起大运' },
    { text: '💼 详批事业', content: '请详细分析我的事业运' },
    { text: '❤️ 详批姻缘', content: '请详细分析我的姻缘运' },
    { text: '📅 未来一年', content: '请分析我未来一年的运势' }
  ];

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 初始化欢迎消息
  useEffect(() => {
    if (initialMessage && messages.length === 0) {
      const welcomeMsg = {
        id: Date.now(),
        role: 'master',
        content: initialMessage,
        timestamp: new Date()
      };
      setMessages([welcomeMsg]);
      // 同步到对话历史（欢迎消息不发送给后端，所以不添加到chatMessages）
    }
  }, [initialMessage]);

  // 当有新的表单数据或计算结果时，自动发送给AI
  useEffect(() => {
    if (formData && calculation && messages.length > 0) {
      // 检查是否已经发送过系统消息（避免重复）
      const hasSystemMessage = messages.some(msg => 
        msg.content.includes('已收到您的八字信息') || 
        msg.content.includes('正在为您详细分析')
      );
      
      if (!hasSystemMessage) {
        // 显示一条系统消息，告知用户数据已接收
        // 注意：系统消息只用于UI显示，不加入对话历史（chatMessages）
        const systemMessage = {
          id: Date.now() + 1,
          role: 'master',
          content: `✅ 已收到您的八字信息，正在为您详细分析...`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, systemMessage]);
        // 不更新 chatMessages，因为这是系统提示消息
      }
    }
  }, [formData, calculation, messages.length]);

  // 发送消息
  const sendMessage = async (content) => {
    if (!content.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    // 更新UI显示的消息
    setMessages(prev => [...prev, userMessage]);
    
    // 构建完整的对话历史（包含当前用户消息）
    const userChatMessage = {
      role: 'user',
      content: content.trim()
    };
    
    // 使用函数式更新确保获取最新状态，并立即获取更新后的值
    let updatedChatMessages = [];
    setChatMessages(prev => {
      updatedChatMessages = [...prev, userChatMessage];
      return updatedChatMessages;
    });
    
    // 确保 updatedChatMessages 包含当前用户消息（防止异步问题）
    // 如果 updatedChatMessages 为空或最后一条消息不是当前消息，手动添加
    if (updatedChatMessages.length === 0 || 
        updatedChatMessages[updatedChatMessages.length - 1].content !== content.trim()) {
      updatedChatMessages = [...updatedChatMessages, userChatMessage];
    }
    
    // 验证 messages 不为空
    if (updatedChatMessages.length === 0) {
      console.error('❌ 错误：对话历史为空，无法发送请求');
      setIsLoading(false);
      return;
    }
    
    console.log('📤 准备发送对话历史，消息数量:', updatedChatMessages.length);
    console.log('📤 最后一条消息:', updatedChatMessages[updatedChatMessages.length - 1]);
    
    setInputValue('');
    setIsLoading(true);
    setQuickReplies([]);

    // 添加loading消息（仅用于UI显示，不加入对话历史）
    const loadingMessageId = Date.now() + 1;
    setMessages(prev => [...prev, {
      id: loadingMessageId,
      role: 'master',
      content: '大师正在翻阅命书...',
      isLoading: true,
      timestamp: new Date()
    }]);

    try {
      // 获取用户ID
      const userId = localStorage.getItem('userId') || `user_${Date.now()}`;
      
      // 获取八字数据（优先使用传入的calculation，否则从localStorage获取）
      let baziData = null;
      if (calculation) {
        baziData = calculation;
      } else {
        try {
          const savedBazi = localStorage.getItem('baziData');
          if (savedBazi) {
            baziData = JSON.parse(savedBazi);
          }
        } catch (e) {
          console.warn('解析八字数据失败:', e);
        }
      }
      
      // 转换消息格式：将 role 从 'assistant' 改为 'model'，'user' 保持不变
      const formattedMessages = updatedChatMessages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : msg.role,
        content: msg.content
      }));
      
      // 发送完整的对话历史给后端
      console.log('📤 发送完整对话历史:', formattedMessages);
      
      const response = await fetch(CHAT_DIVINATION_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: formattedMessages // 发送完整的对话历史数组，role为'user'或'model'
        }),
      });

      if (!response.ok) {
        // 尝试获取详细的错误信息
        let errorMessage = '请求失败';
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || `HTTP错误: ${response.status}`;
          console.error('❌ API错误响应:', errorData);
        } catch (e) {
          const errorText = await response.text();
          console.error('❌ API错误响应（文本）:', errorText);
          errorMessage = errorText || `HTTP错误: ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      // 流式接收响应
      let masterContent = '';
      await handleSSEStream(response, {
        onText: (text) => {
          masterContent += text;
          setMessages(prev => prev.map(msg => 
            msg.id === loadingMessageId 
              ? { ...msg, content: masterContent, isLoading: false }
              : msg
          ));
        },
        onError: (error) => {
          setMessages(prev => prev.map(msg => 
            msg.id === loadingMessageId 
              ? { ...msg, content: `错误：${error}`, isLoading: false }
              : msg
          ));
        },
        onComplete: () => {
          setIsLoading(false);
          // 将AI的回复同步到对话历史
          if (masterContent.trim()) {
            setChatMessages(prev => [...prev, {
              role: 'assistant',
              content: masterContent.trim()
            }]);
            console.log('✅ AI回复已添加到对话历史');
            
            // 检测阶段2是否完成（排盘完成）
            // 如果回复中包含排盘相关的关键词，认为阶段2完成
            const stage2Keywords = ['排盘', '八字', '四柱', '命盘', '分析完成', '概览', '命理分析'];
            const isStage2 = stage2Keywords.some(keyword => masterContent.includes(keyword));
            if (isStage2 && !isStage2Complete) {
              setIsStage2Complete(true);
              console.log('✅ 阶段2（排盘）已完成，快捷追问按钮已启用');
              
              // 标记这条消息为阶段2回复
              setMessages(prev => prev.map(msg => 
                msg.id === loadingMessageId 
                  ? { ...msg, isStage2: true }
                  : msg
              ));
            }
          }
          checkQuickReplies(masterContent);
        }
      });
    } catch (error) {
      console.error('发送消息失败:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === loadingMessageId 
          ? { ...msg, content: '抱歉，大师暂时无法回复，请稍后再试。', isLoading: false }
          : msg
      ));
      setIsLoading(false);
    }
  };

  // 检查是否需要显示快捷回复
  const checkQuickReplies = (content) => {
    const replies = [];
    
    if (content.includes('起大运') || content.includes('大运')) {
      replies.push('起大运');
    }
    if (content.includes('详细分析') || content.includes('深入分析')) {
      replies.push('详细分析');
    }
    if (content.includes('建议') || content.includes('如何')) {
      replies.push('给我建议');
    }
    
    setQuickReplies(replies);
  };

  // 处理快捷回复点击
  const handleQuickReply = (reply) => {
    sendMessage(reply);
  };

  // 处理回车发送
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  if (!isOpen) return null;

  // 嵌入模式：白色主题，与其他页面一致
  if (embedded) {
    return (
      <div className="h-full flex flex-col bg-white text-gray-900 overflow-hidden">
        {/* 1. 聊天头部 */}
        <div className="h-14 border-b border-gray-200 flex items-center justify-center font-serif text-amber-600 bg-white">
          <span className="text-2xl mr-2">☯</span>
          <span className="text-lg font-semibold">命理先知</span>
          <span className="text-xs text-amber-500 ml-2">· AI</span>
        </div>

        {/* 2. 消息列表 (核心区域) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'master' && (
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-amber-100 to-purple-100 border border-amber-300">
                  <span className="text-lg">☯</span>
                </div>
              )}
              
              <div
                className={`max-w-[85%] rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white p-4'
                    : (message.isStage2 || (message.role === 'master' && !message.isLoading && message.content.length > 500))
                      ? 'bg-white text-gray-900 border border-gray-200 shadow-sm p-3 text-sm' // 阶段2回复更紧凑
                      : 'bg-white text-gray-900 border border-gray-200 shadow-sm p-4'
                }`}
              >
                {message.isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                      <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                      <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                    </div>
                    <span className="text-amber-600">{message.content}</span>
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({node, ...props}) => <h1 className="text-lg font-bold mb-2 text-amber-600" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-base font-bold mb-2 text-amber-600" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-sm font-bold mb-1 text-amber-600" {...props} />,
                        p: ({node, ...props}) => <p className={`mb-2 last:mb-0 leading-relaxed ${message.role === 'user' ? 'text-white' : 'text-gray-700'}`} {...props} />,
                        ul: ({node, ...props}) => <ul className={`list-disc list-inside mb-2 space-y-1 ${message.role === 'user' ? 'text-white' : 'text-gray-700'}`} {...props} />,
                        ol: ({node, ...props}) => <ol className={`list-decimal list-inside mb-2 space-y-1 ${message.role === 'user' ? 'text-white' : 'text-gray-700'}`} {...props} />,
                        li: ({node, ...props}) => <li className="ml-2" {...props} />,
                        strong: ({node, ...props}) => <strong className={`font-bold ${message.role === 'user' ? 'text-white' : 'text-amber-600'}`} {...props} />,
                        em: ({node, ...props}) => <em className={`italic ${message.role === 'user' ? 'text-white/90' : 'text-amber-500'}`} {...props} />,
                        blockquote: ({node, ...props}) => <blockquote className={`border-l-4 pl-3 italic my-2 ${message.role === 'user' ? 'border-white/50 text-white/90' : 'border-amber-400 text-amber-700'}`} {...props} />,
                        code: ({node, ...props}) => <code className={`px-1.5 py-0.5 rounded text-sm ${message.role === 'user' ? 'bg-white/20 text-white' : 'bg-gray-100 text-amber-700'}`} {...props} />,
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>

              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 bg-blue-600">
                  我
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* 3. 输入区域 */}
        <div className="p-4 border-t border-gray-200 bg-white">
          {/* 快捷追问按钮 Chips（只在阶段2完成后显示） */}
          {isStage2Complete && (
            <div className="flex gap-2 mb-3 overflow-x-auto pb-2 hide-scrollbar">
              {quickQuestionButtons.map((button, index) => (
                <button
                  key={index}
                  onClick={() => sendMessage(button.content)}
                  disabled={isLoading}
                  className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-amber-500 text-gray-700 hover:text-white rounded-full transition-all duration-200 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 hover:border-amber-500"
                >
                  {button.text}
                </button>
              ))}
            </div>
          )}

          {/* 输入框 */}
          <div className="relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="向大师请教..."
              className="w-full bg-gray-50 rounded-full pl-4 pr-12 py-3 outline-none focus:ring-2 focus:ring-amber-500/50 text-gray-900 placeholder:text-gray-400 resize-none border border-gray-300 focus:border-amber-500 transition-all"
              rows={1}
              disabled={isLoading}
              style={{ 
                minHeight: '48px', 
                maxHeight: '120px',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
            />
            <button
              onClick={() => sendMessage(inputValue)}
              disabled={!inputValue.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // 弹窗模式（原有逻辑，保留兼容性）
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="w-full max-w-4xl h-[90vh] bg-white rounded-lg shadow-2xl flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              道
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">AI算命大师</h2>
              <p className="text-xs text-gray-500">在线为您答疑解惑</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>

        {/* 消息列表 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'master' && (
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  道
                </div>
              )}
              
              <div
                className={`max-w-[75%] rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-900 shadow-sm border border-gray-200'
                }`}
              >
                {message.isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{message.content}</span>
                  </div>
                ) : (
                  <div className={`prose prose-sm max-w-none ${
                    message.role === 'user' ? 'prose-invert' : ''
                  }`}>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({node, ...props}) => <h1 className={`text-lg font-bold mb-2 ${message.role === 'user' ? 'text-white' : 'text-gray-900'}`} {...props} />,
                        h2: ({node, ...props}) => <h2 className={`text-base font-bold mb-2 ${message.role === 'user' ? 'text-white' : 'text-gray-900'}`} {...props} />,
                        h3: ({node, ...props}) => <h3 className={`text-sm font-bold mb-1 ${message.role === 'user' ? 'text-white' : 'text-gray-900'}`} {...props} />,
                        p: ({node, ...props}) => <p className={`mb-2 last:mb-0 ${message.role === 'user' ? 'text-white' : 'text-gray-700'}`} {...props} />,
                        ul: ({node, ...props}) => <ul className={`list-disc list-inside mb-2 space-y-1 ${message.role === 'user' ? 'text-white' : 'text-gray-700'}`} {...props} />,
                        ol: ({node, ...props}) => <ol className={`list-decimal list-inside mb-2 space-y-1 ${message.role === 'user' ? 'text-white' : 'text-gray-700'}`} {...props} />,
                        li: ({node, ...props}) => <li className="ml-2" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                        em: ({node, ...props}) => <em className="italic" {...props} />,
                        blockquote: ({node, ...props}) => <blockquote className={`border-l-4 pl-3 italic ${message.role === 'user' ? 'border-white/50 text-white/90' : 'border-gray-300 text-gray-600'}`} {...props} />,
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>

              {message.role === 'user' && (
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  我
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* 快捷回复 */}
        {quickReplies.length > 0 && (
          <div className="px-4 py-2 border-t border-gray-200 bg-white">
            <div className="flex gap-2 flex-wrap">
              {quickReplies.map((reply, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickReply(reply)}
                  className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 输入区域 */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入您的问题..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={2}
              disabled={isLoading}
            />
            <button
              onClick={() => sendMessage(inputValue)}
              disabled={!inputValue.trim() || isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
