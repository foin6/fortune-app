import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import ChatInterface from './ChatInterface';

/**
 * 悬浮聊天按钮组件
 */
export default function ChatFloatingButton() {
  const [isOpen, setIsOpen] = useState(false);

  // 初始欢迎消息
  const welcomeMessage = `# 欢迎来到AI算命聊天室

您好！我是AI算命大师，擅长**八字命理**、**紫微斗数**、**奇门遁甲**等传统命理分析。

## 我可以为您提供：

- 📊 **八字排盘**：详细分析您的生辰八字
- 🔮 **运势预测**：预测未来运势走向
- 💡 **人生建议**：根据命理给出专业建议
- ❓ **答疑解惑**：回答您关于命理的任何问题

请告诉我您的出生信息，或者直接问我问题，我会为您详细解答。

> 💬 提示：您可以问我"起大运"、"详细分析"等问题，我会根据您的需求提供相应的服务。`;

  return (
    <>
      {/* 悬浮按钮 */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 flex items-center justify-center z-40"
          aria-label="打开聊天"
        >
          <MessageCircle className="w-8 h-8" />
        </button>
      )}

      {/* 聊天界面 */}
      <ChatInterface
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        initialMessage={welcomeMessage}
      />
    </>
  );
}
