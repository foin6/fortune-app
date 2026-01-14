import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import BirthForm from '../components/BirthForm';
import LoadingScreen from '../components/LoadingScreen';
import ReportContainer from '../components/ReportContainer';
import Toast from '../components/Toast';
import { fetchBaziCalculation, fetchFortuneAnalysis, saveFortuneBook } from '../utils/api';
import { extractPersonalityTraits, extractEssenceText } from '../utils/baziUtils';

// 格式化出生时间函数（与api.js中的逻辑一致）
function formatBirthTime(hour, minute) {
  const hourStr = String(hour).padStart(2, '0');
  const minuteStr = (minute !== '' && minute !== null && minute !== undefined) 
    ? String(minute).padStart(2, '0') 
    : '00';
  return `${hourStr}:${minuteStr}`;
}

export default function CreateForm() {
  const navigate = useNavigate();
  
  // 状态管理
  const [step, setStep] = useState('form'); // 'form' | 'loading' | 'report'
  const [formData, setFormData] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null); // 成功提示消息
  const [analysisText, setAnalysisText] = useState(''); // AI 生成的文本分析
  const [personalityTraits, setPersonalityTraits] = useState([]); // 性格特质
  const [essenceText, setEssenceText] = useState(''); // 命理精华
  const [isSaving, setIsSaving] = useState(false); // 保存状态
  const [isSaved, setIsSaved] = useState(false); // 是否已保存
  const [showSaveDialog, setShowSaveDialog] = useState(false); // 显示保存对话框
  const [bookName, setBookName] = useState(''); // 命书名

  const handleSubmit = async (data) => {
    try {
      // 保存表单数据
      setFormData(data);
      setError(null);
      
      // 进入加载状态
      setStep('loading');
      
      // 1. 先调用后端 API 获取排盘数据（自动保存）
      // 生成默认命书名：姓名 + 日期
      const defaultBookName = `${data.name || '我的命书'} - ${data.year}-${data.month}-${data.day}`;
      const calculationData = {
        ...data,
        auto_save: true,  // 自动保存
        book_name: defaultBookName
      };
      const result = await fetchBaziCalculation(calculationData);
      
      // 保存计算结果
      setReportData(result);
      
          // 2. 使用后端返回的数据生成性格特质和命理精华
          const dayGan = result?.day_master_info?.name || result?.day_master || result?.chart?.day_gan || result?.gods?.day_gan || '';
          const dayWuxing = result?.day_master_info?.element || result?.gods?.day_wuxing || '';
          
          // 优先使用后端返回的 personality_tags 作为性格特质（直接使用根级别的字段）
          const backendTags = result?.personality_tags || result?.gods?.personality_tags || [];
          if (backendTags.length > 0) {
            setPersonalityTraits(Array.isArray(backendTags) ? backendTags : []);
          }
          
          // 优先使用后端返回的 essence_text 作为命理精华（直接使用根级别的字段）
          if (result?.essence_text) {
            setEssenceText(result.essence_text);
          } else if (dayGan && dayWuxing) {
            // 如果没有，根据后端数据生成
            const strengthStatus = result?.gods?.strength_status || '';
            const patternName = result?.gods?.pattern_name || '';
            const tags = backendTags;
            const tagsDesc = Array.isArray(tags) ? tags.slice(0, 3).join('、') : '';
            
            const parts = [];
            parts.push(`日主${dayGan}，五行属${dayWuxing}`);
            if (strengthStatus) parts.push(`日主${strengthStatus}`);
            if (patternName) parts.push(`格局为${patternName}`);
            if (tagsDesc) parts.push(`性格${tagsDesc}`);
            
            setEssenceText(parts.join('，') + '。');
          }
          
          // 转场到报告页面（立即显示，不等待 AI 分析）
          setStep('report');
          
          // 3. 异步调用 AI 分析接口获取更详细的文本分析（后台进行，不阻塞显示）
          // 如果 AI 分析成功，会用更准确的性格特质和命理精华更新显示
          let aiFullText = '';
          fetchFortuneAnalysis(data, {
            onText: (content) => {
              aiFullText += content;
              setAnalysisText(prev => prev + content);
            },
            onCalculation: (calcData) => {
              // 排盘数据已更新
            },
            onError: (errorMsg) => {
              console.error('AI 分析错误:', errorMsg);
              // AI 分析失败不影响显示，使用后端生成的基础数据
            },
            onComplete: () => {
              // 从 AI 生成的文本中提取更准确的性格特质和命理精华
              if (aiFullText && aiFullText.length > 50) {
                const traits = extractPersonalityTraits(aiFullText);
                const essence = extractEssenceText(aiFullText, dayGan, dayWuxing);
                
                // 如果 AI 提取成功，更新数据（覆盖后端生成的基础数据）
                if (traits.length > 0) {
                  setPersonalityTraits(traits);
                }
                if (essence && essence.length > 20) {
                  setEssenceText(essence);
                }
              }
            }
          });
    } catch (err) {
      // 错误处理：停留在表单状态并显示错误
      setError(err.message || '计算失败，请检查输入信息');
      setStep('form');
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  const resetStates = () => {
    setFormData(null);
    setReportData(null);
    setError(null);
    setAnalysisText('');
    setPersonalityTraits([]);
    setEssenceText('');
  };

  const handleBackToForm = () => {
    setStep('form');
    resetStates();
  };

  // 保存命书功能（保存命书信息和完整结果）
  const handleSave = async () => {
    if (!formData || !reportData) {
      setError('缺少必要的数据，无法保存');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      
      // 生成命书名：姓名 + 日期
      const bookName = `${formData.name || '我的命书'} - ${formData.year}-${formData.month}-${formData.day}`;
      
      // 使用完整的 reportData 作为 analysis_result
      // reportData 包含当前页面显示的所有排盘数据：
      // - chart: 四柱详情（天干、地支、藏干、纳音等）
      // - five_elements: 五行能量分析
      // - gods: 喜用神分析
      // - da_yun: 大运
      // - day_master_info: 日元信息
      // - ten_gods: 十神列表
      // - personality_tags: 性格特质
      // - essence_text: 命理精华
      // - true_solar_time: 真太阳时
      // - pillars: 四柱数据（新格式）
      // 等等所有在页面上显示的数据
      const completeAnalysisResult = {
        ...reportData, // 首先展开所有 reportData 中的字段
        // 确保包含页面显示的所有关键字段（如果 reportData 中没有则使用默认值）
        chart: reportData?.chart || {},
        five_elements: reportData?.five_elements || reportData?.five_elements_legacy || {},
        gods: reportData?.gods || {},
        da_yun: reportData?.da_yun || [],
        day_master_info: reportData?.day_master_info || {},
        ten_gods: reportData?.ten_gods || [],
        personality_tags: reportData?.personality_tags || personalityTraits || [],
        essence_text: reportData?.essence_text || essenceText || '',
        true_solar_time: reportData?.true_solar_time || '',
        pillars: reportData?.pillars || {},
        day_master: reportData?.day_master || reportData?.chart?.day_gan || '',
        // 生成时间
        generated_at: new Date().toISOString()
      };
      
      console.log('完整的排盘数据 (analysis_result):', completeAnalysisResult);
      
      // 准备保存的数据
      const bookData = {
        name: bookName,  // 命书名
        person_name: formData.name || '未命名',
        gender: formData.gender === '男(乾造)' || formData.gender === 'male' ? 'male' : 'female',
        birth_date: `${formData.year}-${String(formData.month).padStart(2, '0')}-${String(formData.day).padStart(2, '0')}`,
        birth_time: formatBirthTime(formData.hour, formData.minute),
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng),
        city: formData.city,
        // 排盘数据：直接发送对象，FastAPI 会自动处理 JSON 序列化
        analysis_result: completeAnalysisResult,
        // 包含完整的summary数据（reportData和llm_data）
        summary: JSON.stringify({
          bazi_report: reportData,
          llm_data: {
            personality_tags: personalityTraits,
            essence_text: essenceText,
            analysis_text: analysisText
          },
          generated_at: new Date().toISOString()
        })
      };
      
      console.log('准备保存的数据:', bookData);

      // 调用保存API
      const savedBook = await saveFortuneBook(bookData);
      
      // 确保获取到ID（优先使用new_id，兼容id）
      const bookId = savedBook.new_id || savedBook.id;
      
      // 打印 new_id 用于调试
      console.log('📋 保存成功，new_id:', bookId);
      console.log('📋 完整返回数据:', savedBook);
      
      if (!bookId) {
        console.error('❌ 保存失败：未获取到命书ID', savedBook);
        throw new Error('保存失败：未获取到命书ID，无法跳转。请检查后端是否返回了ID。');
      }
      
      // 标记为已保存
      setIsSaved(true);
      
      // 显示成功 toast 提示
      setSuccessMessage(`命书保存成功！ID: ${bookId}`);
      setError(null); // 清除错误消息
      
      console.log('✅ 命书已保存，ID:', bookId, savedBook);
      
      // 3秒后自动关闭成功提示
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      setError(err.message || '保存失败，请稍后重试');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateNew = () => {
    setStep('form');
    resetStates();
  };

  return (
    <div className="flex-1">
      {/* Toast 错误提示 */}
      <Toast
        message={error}
        onClose={() => setError(null)}
      />
      
      {/* Toast 成功提示 */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 max-w-md animate-in fade-in slide-in-from-top-5">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg
                className="w-5 h-5 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">{successMessage}</p>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="flex-shrink-0 text-green-400 hover:text-green-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      <AnimatePresence mode="wait">
        {/* 表单步骤 */}
        {step === 'form' && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="p-8"
          >
            <div className="max-w-3xl mx-auto">
              <h1 className="text-3xl font-bold mb-8 text-gray-900">
                创建我的八字命理
              </h1>
              <BirthForm onSubmit={handleSubmit} onCancel={handleCancel} />
            </div>
          </motion.div>
        )}

        {/* 加载步骤 */}
        {step === 'loading' && (
          <LoadingScreen key="loading" />
        )}

        {/* 报告步骤 */}
        {step === 'report' && reportData && formData && (
          <motion.div
            key="report"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ReportContainer
              calculation={reportData}
              name={formData.name}
              city={formData.city}
              trueSolarTime={reportData.true_solar_time}
              personalityTraits={personalityTraits}
              essenceText={essenceText}
            />
            
            {/* 操作按钮 */}
            <div className="max-w-6xl mx-auto px-4 pb-8">
              <div className="flex gap-4">
                <button
                  onClick={handleCreateNew}
                  className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  创建新的命理
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving || isSaved}
                  className={`px-6 py-3 rounded-lg transition-colors ${
                    isSaved
                      ? 'bg-green-600 text-white cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isSaving ? '保存中...' : isSaved ? '已保存' : '保存'}
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  返回首页
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
