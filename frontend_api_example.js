/**
 * 前端 API 调用示例代码
 * 供新 chat 参考使用
 */

// ==================== 基础配置 ====================
const API_BASE_URL = 'http://localhost:8000';
const FORTUNE_API = `${API_BASE_URL}/api/fortune`;

// ==================== 请求数据格式 ====================
const exampleRequestData = {
  name: "张三",
  gender: "male",  // 或 "female", "男", "女"
  birth_date: "1990-05-15",  // 格式: YYYY-MM-DD
  birth_time: "14:30",  // 格式: HH:MM (24小时制)
  lat: 39.9042,  // 纬度（北纬为正）
  lng: 116.4074,  // 经度（东经为正）
  city: "北京"
};

// ==================== 响应处理函数 ====================

/**
 * 处理流式响应
 * @param {Response} response - Fetch API 响应对象
 * @param {Object} callbacks - 回调函数对象
 * @param {Function} callbacks.onText - 接收到文本内容时调用
 * @param {Function} callbacks.onChartData - 接收到图表数据时调用
 * @param {Function} callbacks.onCalculation - 接收到排盘数据时调用
 * @param {Function} callbacks.onError - 发生错误时调用
 * @param {Function} callbacks.onComplete - 流结束时调用
 */
async function handleSSEStream(response, callbacks = {}) {
  const {
    onText,
    onChartData,
    onCalculation,
    onError,
    onComplete
  } = callbacks;

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        if (onComplete) onComplete();
        break;
      }

      // 解码数据并添加到缓冲区
      buffer += decoder.decode(value, { stream: true });
      
      // 按行分割处理
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // 保留最后一个可能不完整的行

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          
          // 检查结束标记
          if (data === '[DONE]') {
            if (onComplete) onComplete();
            return;
          }

          // 解析 JSON
          try {
            const json = JSON.parse(data);
            
            // 根据类型分发处理
            switch (json.type) {
              case 'text':
                if (onText) onText(json.content);
                break;
              
              case 'chart_data':
                if (onChartData) onChartData(json.data);
                break;
              
              case 'calculation':
                if (onCalculation) onCalculation(json.data);
                break;
              
              default:
                if (json.error) {
                  if (onError) onError(json.error);
                }
                break;
            }
          } catch (e) {
            console.error('Parse JSON error:', e, 'Data:', data);
          }
        }
      }
    }
  } catch (error) {
    if (onError) onError(error.message || 'Stream read error');
  }
}

// ==================== React Hook 示例 ====================

/**
 * React Hook: 使用命理分析 API
 * 
 * 使用示例:
 * ```jsx
 * const { 
 *   loading, 
 *   error, 
 *   text, 
 *   chartData, 
 *   calculation, 
 *   fetchAnalysis 
 * } = useFortuneAnalysis();
 * 
 * const handleSubmit = async (formData) => {
 *   await fetchAnalysis(formData);
 * };
 * ```
 */
function useFortuneAnalysis() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [text, setText] = React.useState('');
  const [chartData, setChartData] = React.useState(null);
  const [calculation, setCalculation] = React.useState(null);

  const fetchAnalysis = async (formData) => {
    setLoading(true);
    setError(null);
    setText('');
    setChartData(null);
    setCalculation(null);

    try {
      // 转换表单数据为 API 格式
      const requestData = {
        name: formData.name,
        gender: formData.gender === '男' || formData.gender === 'male' ? 'male' : 'female',
        birth_date: `${formData.year}-${String(formData.month).padStart(2, '0')}-${String(formData.day).padStart(2, '0')}`,
        birth_time: `${String(formData.hour).padStart(2, '0')}:${String(formData.minute).padStart(2, '0')}`,
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng),
        city: formData.city,
      };

      const response = await fetch(FORTUNE_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // 处理流式响应
      await handleSSEStream(response, {
        onText: (content) => {
          setText(prev => prev + content);
        },
        onChartData: (data) => {
          setChartData(data);
        },
        onCalculation: (data) => {
          setCalculation(data);
        },
        onError: (errorMsg) => {
          setError(errorMsg);
          setLoading(false);
        },
        onComplete: () => {
          setLoading(false);
        },
      });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    text,
    chartData,
    calculation,
    fetchAnalysis,
  };
}

// ==================== 完整调用示例 ====================

/**
 * 完整调用示例（非 React）
 */
async function exampleCall() {
  try {
    const response = await fetch(FORTUNE_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(exampleRequestData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // 处理流式响应
    await handleSSEStream(response, {
      onText: (content) => {
        console.log('Text chunk:', content);
        // 在页面上追加显示
        // document.getElementById('result').innerHTML += content;
      },
      onChartData: (data) => {
        console.log('Chart data:', data);
        // 渲染图表
        // renderChart(data);
      },
      onCalculation: (data) => {
        console.log('Calculation result:', data);
        // 显示八字四柱
        // displayBazi(data);
      },
      onError: (errorMsg) => {
        console.error('Error:', errorMsg);
        alert('错误: ' + errorMsg);
      },
      onComplete: () => {
        console.log('Stream completed');
      },
    });
  } catch (error) {
    console.error('Request failed:', error);
    alert('请求失败: ' + error.message);
  }
}

// ==================== 导出 ====================
// 如果使用 ES6 模块
// export { useFortuneAnalysis, handleSSEStream, exampleCall };

// 如果使用 CommonJS
// module.exports = { useFortuneAnalysis, handleSSEStream, exampleCall };
