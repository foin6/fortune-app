import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import LifeChart from './LifeChart';
import YearDetailCard from './YearDetailCard';
import { generateLifeLine } from '../../utils/api';

/**
 * 人生K线结果页面
 * 主容器组件，负责数据获取和状态管理
 */
export default function LifeLineResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lifeLineData, setLifeLineData] = useState(null);
  const [selectedYearData, setSelectedYearData] = useState(null);
  const [currentAge, setCurrentAge] = useState(null);

  // 从location.state获取请求参数，如果没有则从URL参数获取
  const requestParams = useMemo(() => {
    console.log('📍 LifeLineResultPage - location 对象:', location);
    console.log('📍 LifeLineResultPage - location.pathname:', location.pathname);
    console.log('📍 LifeLineResultPage - location.search:', location.search);
    console.log('📍 LifeLineResultPage - location.state:', location.state);
    console.log('📍 LifeLineResultPage - location.state 类型:', typeof location.state);
    console.log('📍 LifeLineResultPage - location.state?.requestParams:', location.state?.requestParams);
    
    // 优先从 location.state 获取
    if (location.state && location.state.requestParams) {
      const params = location.state.requestParams;
      console.log('✅ 从 location.state 获取到参数:', params);
      console.log('✅ 参数详情:', JSON.stringify(params, null, 2));
      
      // 验证参数完整性
      if (params.year && params.month && params.day && params.lng && params.lat) {
        return params;
      } else {
        console.warn('⚠️ location.state 中的参数不完整:', params);
      }
    } else {
      console.warn('⚠️ location.state 或 location.state.requestParams 不存在');
    }
    
    // 尝试从URL参数获取（备用方案）
    const params = new URLSearchParams(location.search);
    if (params.get('year') && params.get('month') && params.get('day')) {
      const urlParams = {
        year: parseInt(params.get('year')),
        month: parseInt(params.get('month')),
        day: parseInt(params.get('day')),
        hour: parseInt(params.get('hour') || '12'),
        minute: parseInt(params.get('minute') || '0'),
        lng: parseFloat(params.get('lng')),
        lat: parseFloat(params.get('lat')),
        gender: params.get('gender') || 'male',
        name: params.get('name') || '用户',
      };
      console.log('✅ 从 URL 参数获取到参数:', urlParams);
      return urlParams;
    }
    
    console.error('❌ 未找到请求参数，location.state:', location.state, 'location.search:', location.search);
    return null;
  }, [location]);

  // 计算当前年龄
  useEffect(() => {
    if (requestParams && requestParams.year) {
      const birthYear = requestParams.year;
      const currentYear = new Date().getFullYear();
      const age = currentYear - birthYear;
      console.log('📅 计算当前年龄:', age, '(出生年份:', birthYear, ')');
      setCurrentAge(age);
    } else {
      console.warn('⚠️ requestParams 或 year 为空，无法计算年龄');
      setCurrentAge(null);
    }
  }, [requestParams]);

  // 获取人生K线数据
  useEffect(() => {
    const fetchLifeLineData = async () => {
      if (!requestParams) {
        console.warn('⚠️ requestParams 为空，无法获取数据');
        setError('缺少必要的参数，请重新填写表单');
        setLoading(false);
        return;
      }

      // 等待 currentAge 计算完成
      if (currentAge === null) {
        console.log('⏳ 等待 currentAge 计算...');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log('📡 调用 generateLifeLine API，参数:', requestParams);
        console.log('📡 当前年龄:', currentAge);
        const data = await generateLifeLine(requestParams);
        console.log('✅ API 返回数据:', data);
        setLifeLineData(data);

        // 设置默认选中的年份（当前年龄）
        if (data.chart_data && currentAge !== null) {
          const currentData = data.chart_data.find((d) => d.age === currentAge);
          if (currentData) {
            setSelectedYearData(currentData);
          } else if (data.chart_data.length > 0) {
            // 如果找不到当前年龄，选择第一个
            setSelectedYearData(data.chart_data[0]);
          }
        }
      } catch (err) {
        console.error('❌ 获取人生K线数据失败:', err);
        setError(err.message || '获取数据失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchLifeLineData();
  }, [requestParams, currentAge]);

  // 处理年份选择
  const handleYearSelect = (data) => {
    setSelectedYearData(data);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在生成人生K线图...</p>
          {requestParams && (
            <p className="text-sm text-gray-500 mt-2">
              参数: {requestParams.year}年{requestParams.month}月{requestParams.day}日
            </p>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">错误</h3>
            <p className="text-red-600 mb-4">{error}</p>
            {requestParams && (
              <div className="mb-4 p-3 bg-red-100 rounded text-sm">
                <p className="font-medium">请求参数:</p>
                <pre className="mt-2 text-xs overflow-auto">
                  {JSON.stringify(requestParams, null, 2)}
                </pre>
              </div>
            )}
            <button
              onClick={() => navigate('/kline')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              返回重新填写
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!lifeLineData) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">数据加载中...</p>
          {!requestParams && (
            <div className="mt-4">
              <p className="text-red-600 mb-2">缺少请求参数</p>
              <button
                onClick={() => navigate('/kline')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                返回填写表单
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const { user_profile, chart_data, summary } = lifeLineData;
  const { name, bazi } = user_profile || {};
  const { current_score, peaks = [], valleys = [] } = summary || {};
  
  // 从 peaks 和 valleys 数组中提取下一个高峰和低谷的年龄
  const next_peak_age = peaks.length > 0 ? peaks[0].age : null;
  const next_valley_age = valleys.length > 0 ? valleys[0].age : null;

  // 格式化出生信息
  const formatBirthInfo = () => {
    if (!requestParams) return '';
    const { year, month, day, hour, minute } = requestParams;
    const genderText = requestParams.gender === 'male' ? '男命' : '女命';
    return `${year}年${month}月${day}日${hour}时${minute || 0}分,${genderText}`;
  };

  return (
    <div className="flex-1 min-h-screen bg-gray-50">
      {/* 头部导航 */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/kline')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>返回</span>
          </button>
          <h1 className="text-xl font-semibold text-gray-900">人生K线图</h1>
          <div className="w-20"></div> {/* 占位，保持居中 */}
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* 命盘信息卡片 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">命盘信息</h2>
          <p className="text-sm text-gray-600 mb-6">{formatBirthInfo()}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* 当前运势 */}
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">{current_score || 0}</div>
              <div className="text-sm text-gray-600">
                {current_score >= 70 ? '吉' : current_score >= 50 ? '平' : '凶'}
              </div>
              <div className="text-xs text-gray-500 mt-1">当前运势</div>
            </div>

            {/* 5年趋势 */}
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">-17</div>
              <div className="text-sm text-orange-600">注意调整</div>
              <div className="text-xs text-gray-500 mt-1">5年趋势</div>
            </div>

            {/* 下个高峰 */}
            {next_peak_age && (
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">{next_peak_age}岁</div>
                <div className="text-sm text-gray-600">
                  还有{next_peak_age - (currentAge || 0)}年
                </div>
                <div className="text-xs text-gray-500 mt-1">下个高峰</div>
              </div>
            )}

            {/* 需注意 */}
            {next_valley_age && (
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-1">{next_valley_age}岁</div>
                <div className="text-sm text-gray-600">
                  还有{next_valley_age - (currentAge || 0)}年
                </div>
                <div className="text-xs text-gray-500 mt-1">需注意</div>
              </div>
            )}
          </div>

          {/* 四柱显示 */}
          {bazi && (
            <div className="mt-6 flex items-center gap-2">
              {bazi.split(' ').map((pillar, index) => (
                <span key={index} className="text-lg font-medium text-gray-700">
                  {pillar}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 图表区域 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">人生运势K线图</h2>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm">
                曲线图
              </button>
              <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                K线图
              </button>
            </div>
          </div>
          
          <LifeChart
            chartData={chart_data}
            currentAge={currentAge}
            onYearSelect={handleYearSelect}
          />
        </div>

        {/* 年份详情卡片 */}
        <YearDetailCard selectedData={selectedYearData} currentAge={currentAge} />
      </div>
    </div>
  );
}
