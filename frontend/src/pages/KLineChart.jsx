import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import { getMyFortuneBooks, generateKLineChart } from '../utils/api';

// 城市经纬度字典（复用BirthForm的逻辑）
const CITY_COORDINATES = {
  '北京': { lng: 116.4074, lat: 39.9042 },
  '上海': { lng: 121.4737, lat: 31.2304 },
  '南京': { lng: 118.7969, lat: 32.0603 },
  '广州': { lng: 113.2644, lat: 23.1291 },
  '深圳': { lng: 114.0579, lat: 22.5431 },
  '成都': { lng: 104.0668, lat: 30.5728 },
  '武汉': { lng: 114.3162, lat: 30.5810 },
  '西安': { lng: 108.9398, lat: 34.3416 },
  '纽约': { lng: -74.0060, lat: 40.7128 },
  '伦敦': { lng: -0.1278, lat: 51.5074 },
  '巴黎': { lng: 2.3522, lat: 48.8566 },
  '东京': { lng: 139.6503, lat: 35.6762 },
  '新加坡': { lng: 103.8198, lat: 1.3521 },
};

/**
 * 人生K线图页面
 * 支持两种输入方式：选择已有命书 或 手动填写
 */
export default function KLineChart() {
  const navigate = useNavigate();
  const [inputMode, setInputMode] = useState('manual'); // 'existing' 或 'manual'
  const [fortuneBooks, setFortuneBooks] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 手动填写表单数据
  const [formData, setFormData] = useState({
    name: '', // 姓名
    calendar: 'solar', // 'solar' 或 'lunar'
    year: '',
    month: '',
    day: '',
    hour: '0',
    gender: 'female',
    city: '北京',
    lat: '',
    lng: '',
    useTrueSolarTime: false,
  });

  // 组件加载时立即请求命书列表
  useEffect(() => {
    fetchFortuneBooks();
  }, []); // 组件挂载时立即执行

  // 当切换到"选择已有命书"模式时，如果列表为空则重新加载
  useEffect(() => {
    if (inputMode === 'existing' && fortuneBooks.length === 0 && !loading) {
      fetchFortuneBooks();
    }
  }, [inputMode]);

  // 获取命书列表
  const fetchFortuneBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const books = await getMyFortuneBooks();
      setFortuneBooks(books);
    } catch (err) {
      console.error('获取命书列表错误:', err);
      setError('获取命书列表失败，请稍后重试');
      setFortuneBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // 定位功能（复用BirthForm的逻辑）
  const handleLocate = async () => {
    const cityName = formData.city.trim();
    
    if (!cityName) {
      setError('请先输入城市名称');
      return;
    }

    // 尝试从字典中查找
    let coordinates = CITY_COORDINATES[cityName];
    
    // 如果字典中找不到，尝试模糊匹配
    if (!coordinates) {
      const normalizedCity = cityName.replace(/[省市县区]$/, '');
      coordinates = CITY_COORDINATES[normalizedCity];
    }

    if (coordinates) {
      setFormData((prev) => ({
        ...prev,
        lng: coordinates.lng,
        lat: coordinates.lat,
      }));
    } else {
      // 如果字典中找不到，使用浏览器地理定位 API
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setFormData((prev) => ({
              ...prev,
              lat: parseFloat(position.coords.latitude.toFixed(4)),
              lng: parseFloat(position.coords.longitude.toFixed(4)),
            }));
          },
          (error) => {
            setError(`未找到城市"${cityName}"的坐标信息。请手动输入经纬度。`);
          }
        );
      } else {
        setError(`未找到城市"${cityName}"的坐标信息。请手动输入经纬度。`);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);
      console.log('📤 开始提交表单，准备调用 /api/generate-kline');

      let payload;

      if (inputMode === 'existing') {
        // 方式A：选择已有命书
        if (!selectedBookId) {
          setError('请选择一个命书');
          setLoading(false);
          return;
        }
        payload = { book_id: parseInt(selectedBookId) };
      } else {
        // 方式B：手动填写
        // 验证必填字段
        if (!formData.year || !formData.month || !formData.day || !formData.city || !formData.lat || !formData.lng) {
          setError('请填写完整的出生信息');
          setLoading(false);
          return;
        }

        // 格式化日期和时间
        const birthDate = `${formData.year}-${String(formData.month).padStart(2, '0')}-${String(formData.day).padStart(2, '0')}`;
        const birthTime = `${String(formData.hour).padStart(2, '0')}:00`;

        payload = {
          name: formData.name || `用户${Date.now()}`,
          gender: formData.gender === 'male' ? 'male' : 'female',
          birth_date: birthDate,
          birth_time: birthTime,
          lat: parseFloat(formData.lat),
          lng: parseFloat(formData.lng),
          city: formData.city,
        };
      }

      console.log('📤 调用 generateKLineChart API，payload:', payload);

      // 先跳转到加载页面
      navigate('/kline-loading', {
        state: { payload },
        replace: false
      });
    } catch (err) {
      console.error('❌ 生成K线图失败:', err);
      setError(err.message || '生成K线图失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-8">
      <div className="max-w-3xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-700">人生K线图</h2>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            生成你的人生运势图
          </h1>
          <p className="text-gray-600">
            基于八字命理,可视化展现人生起伏
          </p>
        </div>

        {/* Tab切换控件 */}
        <div className="mb-6">
          <div className="flex gap-2 border-b border-gray-200">
            <button
              type="button"
              onClick={() => setInputMode('existing')}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                inputMode === 'existing'
                  ? 'border-b-2 border-black text-black'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              选择已有命书
            </button>
            <button
              type="button"
              onClick={() => setInputMode('manual')}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                inputMode === 'manual'
                  ? 'border-b-2 border-black text-black'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              手动填写
            </button>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* 表单内容 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 方式A：选择已有命书 */}
          {inputMode === 'existing' && (
            <div className="space-y-4">
              {loading && fortuneBooks.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2"></div>
                    <p className="text-gray-600 text-sm">加载命书列表...</p>
                  </div>
                </div>
              ) : fortuneBooks.length === 0 ? (
                <div className="p-8 text-center border border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-gray-600 mb-4">暂无历史命书，请手动填写下方表单</p>
                  <button
                    type="button"
                    onClick={() => setInputMode('manual')}
                    className="text-sm text-gray-700 underline hover:text-gray-900"
                  >
                    切换到手动填写模式
                  </button>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    选择命书 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedBookId}
                    onChange={(e) => setSelectedBookId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  >
                    <option value="">请选择命书</option>
                    {fortuneBooks.map((book) => {
                      // 格式化显示：姓名 - 出生日期 - 命书名称
                      const displayName = book.person_name || book.name || '未命名';
                      const birthDate = book.birth_date || '';
                      const bookName = book.book_name || `${displayName}的命书`;
                      const displayText = birthDate 
                        ? `${displayName} - ${birthDate} - ${bookName}`
                        : `${displayName} - ${bookName}`;
                      
                      return (
                        <option key={book.id} value={book.id}>
                          {displayText}
                        </option>
                      );
                    })}
                  </select>
                  <p className="mt-2 text-sm text-gray-500">
                    从您之前创建的命书中选择一个
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 方式B：手动填写表单 */}
          {inputMode === 'manual' && (
            <div className="space-y-6">
              {/* 姓名 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  姓名
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  placeholder="请输入姓名（可选）"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>

              {/* 历法类型 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  历法
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleFormChange('calendar', 'solar')}
                    className={`flex-1 px-4 py-3 rounded-lg border transition-colors ${
                      formData.calendar === 'solar'
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-sm font-medium">公历</div>
                    <div className="text-xs text-gray-500 mt-1">阳历/新历</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFormChange('calendar', 'lunar')}
                    className={`flex-1 px-4 py-3 rounded-lg border transition-colors ${
                      formData.calendar === 'lunar'
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-sm font-medium">农历</div>
                    <div className="text-xs text-gray-500 mt-1">阴历/旧历</div>
                  </button>
                </div>
              </div>

              {/* 出生日期 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  出生日期 <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => handleFormChange('year', e.target.value)}
                    placeholder="年"
                    min="1900"
                    max="2100"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    required
                  />
                  <input
                    type="number"
                    value={formData.month}
                    onChange={(e) => handleFormChange('month', e.target.value)}
                    placeholder="月"
                    min="1"
                    max="12"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    required
                  />
                  <input
                    type="number"
                    value={formData.day}
                    onChange={(e) => handleFormChange('day', e.target.value)}
                    placeholder="日"
                    min="1"
                    max="31"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    required
                  />
                </div>
              </div>

              {/* 出生时间 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  出生时间 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.hour}
                  onChange={(e) => handleFormChange('hour', e.target.value)}
                  placeholder="时 (0-23)"
                  min="0"
                  max="23"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  required
                />
              </div>

              {/* 性别 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  性别
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleFormChange('gender', 'male')}
                    className={`flex-1 px-4 py-3 rounded-lg border transition-colors ${
                      formData.gender === 'male'
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    男
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFormChange('gender', 'female')}
                    className={`flex-1 px-4 py-3 rounded-lg border transition-colors ${
                      formData.gender === 'female'
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    女
                  </button>
                </div>
              </div>

              {/* 出生地点 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  出生地点 <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleFormChange('city', e.target.value)}
                    placeholder="北京"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleLocate}
                    className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    title="定位"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* 经纬度 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  经纬度 <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.lng}
                    onChange={(e) => handleFormChange('lng', e.target.value)}
                    placeholder="经度(E)"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    required
                  />
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.lat}
                    onChange={(e) => handleFormChange('lat', e.target.value)}
                    placeholder="纬度(N)"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    required
                  />
                </div>
              </div>

              {/* 真太阳时选项 */}
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.useTrueSolarTime}
                    onChange={(e) => handleFormChange('useTrueSolarTime', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">使用真太阳时</span>
                </label>
              </div>
            </div>
          )}

          {/* 提交按钮 */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>生成中...</span>
                </>
              ) : (
                <>
                  <span>生成K线图</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </div>

          {/* 免责声明 */}
          <p className="text-xs text-gray-500 text-center">
            数据仅用于计算,不会保存或分享
          </p>
        </form>
      </div>
    </div>
  );
}
