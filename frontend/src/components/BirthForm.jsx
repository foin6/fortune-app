import { useState } from 'react';

// 中国主要城市经纬度字典
const CITY_COORDINATES = {
  // 直辖市
  '北京': { lng: 116.4074, lat: 39.9042 },
  '上海': { lng: 121.4737, lat: 31.2304 },
  '天津': { lng: 117.2008, lat: 39.0842 },
  '重庆': { lng: 106.5516, lat: 29.5630 },
  
  // 省会城市
  '南京': { lng: 118.7969, lat: 32.0603 },
  '杭州': { lng: 120.1551, lat: 30.2741 },
  '广州': { lng: 113.2644, lat: 23.1291 },
  '深圳': { lng: 114.0579, lat: 22.5431 },
  '成都': { lng: 104.0668, lat: 30.5728 },
  '武汉': { lng: 114.3162, lat: 30.5810 },
  '西安': { lng: 108.9398, lat: 34.3416 },
  '郑州': { lng: 113.6401, lat: 34.7566 },
  '济南': { lng: 117.1205, lat: 36.6519 },
  '沈阳': { lng: 123.4315, lat: 41.8057 },
  '长春': { lng: 125.3235, lat: 43.8171 },
  '哈尔滨': { lng: 126.5358, lat: 45.8021 },
  '石家庄': { lng: 114.5149, lat: 38.0428 },
  '太原': { lng: 112.5489, lat: 37.8706 },
  '呼和浩特': { lng: 111.7519, lat: 40.8414 },
  '合肥': { lng: 117.2272, lat: 31.8206 },
  '福州': { lng: 119.2965, lat: 26.0745 },
  '南昌': { lng: 115.8921, lat: 28.6765 },
  '长沙': { lng: 112.9388, lat: 28.2282 },
  '海口': { lng: 110.3308, lat: 20.0221 },
  '昆明': { lng: 102.7146, lat: 25.0492 },
  '贵阳': { lng: 106.6302, lat: 26.6477 },
  '拉萨': { lng: 91.1409, lat: 29.6456 },
  '兰州': { lng: 103.8343, lat: 36.0611 },
  '西宁': { lng: 101.7782, lat: 36.6171 },
  '银川': { lng: 106.2309, lat: 38.4872 },
  '乌鲁木齐': { lng: 87.6168, lat: 43.8256 },
  
  // 其他主要城市
  '苏州': { lng: 120.5853, lat: 31.2989 },
  '无锡': { lng: 120.3119, lat: 31.4912 },
  '宁波': { lng: 121.5440, lat: 29.8683 },
  '温州': { lng: 120.6994, lat: 28.0006 },
  '厦门': { lng: 118.1108, lat: 24.4798 },
  '青岛': { lng: 120.3826, lat: 36.0671 },
  '大连': { lng: 121.6147, lat: 38.9140 },
  '烟台': { lng: 121.3914, lat: 37.5393 },
  '珠海': { lng: 113.5767, lat: 22.2707 },
  '佛山': { lng: 113.1214, lat: 23.0215 },
  '东莞': { lng: 113.7518, lat: 23.0207 },
  '中山': { lng: 113.3928, lat: 22.5170 },
  '惠州': { lng: 114.4158, lat: 23.1118 },
  '南宁': { lng: 108.3669, lat: 22.8170 },
  '桂林': { lng: 110.2902, lat: 25.2736 },
  '柳州': { lng: 109.4158, lat: 24.3145 },
  '洛阳': { lng: 112.4540, lat: 34.6197 },
  '开封': { lng: 114.3076, lat: 34.7971 },
  '安阳': { lng: 114.3924, lat: 36.0974 },
  '邯郸': { lng: 114.4907, lat: 36.6123 },
  '保定': { lng: 115.4648, lat: 38.8739 },
  '唐山': { lng: 118.1802, lat: 39.6309 },
  '秦皇岛': { lng: 119.6005, lat: 39.9354 },
  '承德': { lng: 117.9633, lat: 40.9512 },
  '张家口': { lng: 114.8875, lat: 40.8244 },
  '大同': { lng: 113.3001, lat: 40.0768 },
  '包头': { lng: 109.8404, lat: 40.6574 },
  '赤峰': { lng: 118.8869, lat: 42.2578 },
  '通辽': { lng: 122.2631, lat: 43.6174 },
  '锦州': { lng: 121.1270, lat: 41.0951 },
  '营口': { lng: 122.2354, lat: 40.6670 },
  '盘锦': { lng: 122.0707, lat: 41.1199 },
  '阜新': { lng: 121.6703, lat: 42.0216 },
  '辽阳': { lng: 123.1724, lat: 41.2673 },
  '铁岭': { lng: 123.7268, lat: 42.2238 },
  '朝阳': { lng: 120.4504, lat: 41.5735 },
  '葫芦岛': { lng: 120.8369, lat: 40.7110 },
  '四平': { lng: 124.3508, lat: 43.1664 },
  '通化': { lng: 125.9365, lat: 41.7284 },
  '白城': { lng: 122.8387, lat: 45.6190 },
  '松原': { lng: 124.8253, lat: 45.1412 },
  '白山市': { lng: 126.4243, lat: 41.9430 },
  '延边': { lng: 129.5089, lat: 42.8912 },
  '齐齐哈尔': { lng: 123.9182, lat: 47.3543 },
  '牡丹江': { lng: 129.6329, lat: 44.5517 },
  '佳木斯': { lng: 130.3616, lat: 46.8096 },
  '大庆': { lng: 125.1031, lat: 46.5893 },
  '鸡西': { lng: 130.9693, lat: 45.2950 },
  '鹤岗': { lng: 130.2779, lat: 47.3499 },
  '双鸭山': { lng: 131.1591, lat: 46.6469 },
  '伊春': { lng: 128.8993, lat: 47.7275 },
  '七台河': { lng: 131.0031, lat: 45.7717 },
  '黑河': { lng: 127.4990, lat: 50.2450 },
  '绥化': { lng: 126.9849, lat: 46.6374 },
  '大兴安岭': { lng: 124.7115, lat: 52.3352 },
  
  // 国外主要城市
  // 美国
  '纽约': { lng: -74.0060, lat: 40.7128 },
  '洛杉矶': { lng: -118.2437, lat: 34.0522 },
  '芝加哥': { lng: -87.6298, lat: 41.8781 },
  '休斯顿': { lng: -95.3698, lat: 29.7604 },
  '旧金山': { lng: -122.4194, lat: 37.7749 },
  '华盛顿': { lng: -77.0369, lat: 38.9072 },
  '波士顿': { lng: -71.0589, lat: 42.3601 },
  '西雅图': { lng: -122.3321, lat: 47.6062 },
  '迈阿密': { lng: -80.1918, lat: 25.7617 },
  '拉斯维加斯': { lng: -115.1398, lat: 36.1699 },
  
  // 欧洲
  '伦敦': { lng: -0.1278, lat: 51.5074 },
  '巴黎': { lng: 2.3522, lat: 48.8566 },
  '柏林': { lng: 13.4050, lat: 52.5200 },
  '罗马': { lng: 12.4964, lat: 41.9028 },
  '马德里': { lng: -3.7038, lat: 40.4168 },
  '阿姆斯特丹': { lng: 4.9041, lat: 52.3676 },
  '维也纳': { lng: 16.3738, lat: 48.2082 },
  '苏黎世': { lng: 8.5417, lat: 47.3769 },
  '斯德哥尔摩': { lng: 18.0686, lat: 59.3293 },
  '哥本哈根': { lng: 12.5683, lat: 55.6761 },
  '莫斯科': { lng: 37.6173, lat: 55.7558 },
  '圣彼得堡': { lng: 30.3159, lat: 59.9343 },
  
  // 亚洲（除中国）
  '东京': { lng: 139.6503, lat: 35.6762 },
  '大阪': { lng: 135.5023, lat: 34.6937 },
  '首尔': { lng: 126.9780, lat: 37.5665 },
  '新加坡': { lng: 103.8198, lat: 1.3521 },
  '曼谷': { lng: 100.5018, lat: 13.7563 },
  '吉隆坡': { lng: 101.6869, lat: 3.1390 },
  '雅加达': { lng: 106.8451, lat: -6.2088 },
  '马尼拉': { lng: 120.9842, lat: 14.5995 },
  '河内': { lng: 105.8342, lat: 21.0285 },
  '胡志明市': { lng: 106.6297, lat: 10.8231 },
  '新德里': { lng: 77.2090, lat: 28.6139 },
  '孟买': { lng: 72.8777, lat: 19.0760 },
  '班加罗尔': { lng: 77.5946, lat: 12.9716 },
  '加尔各答': { lng: 88.3639, lat: 22.5726 },
  '迪拜': { lng: 55.2708, lat: 25.2048 },
  '多哈': { lng: 51.5310, lat: 25.2854 },
  '利雅得': { lng: 46.6753, lat: 24.7136 },
  '特拉维夫': { lng: 34.7818, lat: 32.0853 },
  
  // 大洋洲
  '悉尼': { lng: 151.2093, lat: -33.8688 },
  '墨尔本': { lng: 144.9631, lat: -37.8136 },
  '奥克兰': { lng: 174.7633, lat: -36.8485 },
  '惠灵顿': { lng: 174.7756, lat: -41.2865 },
  
  // 南美洲
  '圣保罗': { lng: -46.6333, lat: -23.5505 },
  '里约热内卢': { lng: -43.1729, lat: -22.9068 },
  '布宜诺斯艾利斯': { lng: -58.3816, lat: -34.6037 },
  '利马': { lng: -77.0428, lat: -12.0464 },
  '圣地亚哥': { lng: -70.6693, lat: -33.4489 },
  
  // 非洲
  '开罗': { lng: 31.2357, lat: 30.0444 },
  '约翰内斯堡': { lng: 28.0473, lat: -26.2041 },
  '拉各斯': { lng: 3.3792, lat: 6.5244 },
  '内罗毕': { lng: 36.8219, lat: -1.2921 },
  
  // 加拿大
  '多伦多': { lng: -79.3832, lat: 43.6532 },
  '温哥华': { lng: -123.1216, lat: 49.2827 },
  '蒙特利尔': { lng: -73.5673, lat: 45.5017 },
  '渥太华': { lng: -75.6972, lat: 45.4215 },
};

export default function BirthForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    calendar: 'solar', // 'solar' 或 'lunar'
    year: '',
    month: '',
    day: '',
    hour: '',
    minute: '',
    gender: '男(乾造)',
    city: '',
    lng: '',
    lat: '',
    useTrueSolarTime: false,
  });

  const [showSolarTimeInfo, setShowSolarTimeInfo] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // 清除该字段的错误
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // 使用 Nominatim API 获取城市经纬度（用于字典中没有的城市）
  const fetchCityCoordinates = async (cityName) => {
    try {
      // 先验证地名格式，确保是有效的地名
      if (!isValidPlaceName(cityName)) {
        return null;
      }

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}&limit=5`,
        {
          headers: {
            'User-Agent': 'FortuneApp/1.0' // Nominatim 要求设置 User-Agent
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('API请求失败');
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        // 验证返回的结果是否真的是一个城市/地点
        // 检查结果的类型和重要性，确保是有效的地理位置
        const validResult = data.find(result => {
          const type = result.type || '';
          const importance = result.importance || 0;
          const displayName = result.display_name || '';
          
          // 检查类型是否为城市、城镇、村庄等有效地点类型
          const validTypes = ['city', 'town', 'village', 'municipality', 'administrative', 'state', 'country'];
          const hasValidType = validTypes.some(validType => 
            type.toLowerCase().includes(validType) || 
            displayName.toLowerCase().includes(validType)
          );
          
          // 重要性阈值：城市通常重要性 > 0.3
          // 同时检查显示名称是否包含输入的城市名（避免返回不相关的地点）
          const nameMatches = displayName.toLowerCase().includes(cityName.toLowerCase()) ||
                             cityName.toLowerCase().includes(displayName.split(',')[0].toLowerCase());
          
          return (hasValidType || importance > 0.3) && nameMatches;
        });
        
        if (validResult) {
          return {
            lng: parseFloat(validResult.lon),
            lat: parseFloat(validResult.lat)
          };
        }
        
        // 如果没有找到完全匹配的，但第一个结果的重要性很高，也可以使用
        if (data[0].importance > 0.5) {
          return {
            lng: parseFloat(data[0].lon),
            lat: parseFloat(data[0].lat)
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('获取城市坐标失败:', error);
      return null;
    }
  };

  const handleLocate = async () => {
    const cityName = formData.city.trim();
    
    if (!cityName) {
      alert('请先输入城市名称');
      return;
    }

    // 尝试精确匹配
    let coordinates = CITY_COORDINATES[cityName];
    
    // 如果精确匹配失败，尝试模糊匹配（去除"市"、"省"等后缀）
    if (!coordinates) {
      const normalizedCity = cityName.replace(/[省市县区]$/, '');
      coordinates = CITY_COORDINATES[normalizedCity];
    }
    
    // 如果还是找不到，尝试包含匹配
    if (!coordinates) {
      const matchedCity = Object.keys(CITY_COORDINATES).find(key => 
        key.includes(cityName) || cityName.includes(key)
      );
      if (matchedCity) {
        coordinates = CITY_COORDINATES[matchedCity];
      }
    }

    // 如果字典中找不到，先验证地名格式，再使用 Nominatim API 查询
    if (!coordinates) {
      // 先验证地名格式
      if (!isValidPlaceName(cityName)) {
        alert('请输入有效的地名，不能包含数字或特殊符号');
        return;
      }
      
      try {
        const apiCoordinates = await fetchCityCoordinates(cityName);
        if (apiCoordinates) {
          coordinates = apiCoordinates;
        } else {
          alert(`未找到城市"${cityName}"的有效坐标信息。请检查城市名称是否正确，或手动输入经纬度。`);
          return;
        }
      } catch (error) {
        console.error('API查询失败:', error);
        alert(`查询城市"${cityName}"的坐标时出错。请手动输入经纬度。`);
        return;
      }
    }

    if (coordinates) {
      setFormData((prev) => ({
        ...prev,
        lng: coordinates.lng, // 确保是 number 类型
        lat: coordinates.lat, // 确保是 number 类型
      }));
    } else {
      // 如果都找不到，尝试使用浏览器地理定位 API 作为最后备选
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
            alert(`未找到城市"${cityName}"的坐标信息，且无法获取当前位置。请手动输入经纬度，或检查城市名称是否正确。`);
          }
        );
      } else {
        alert(`未找到城市"${cityName}"的坐标信息。请手动输入经纬度，或检查城市名称是否正确。`);
      }
    }
  };

  // 验证是否为有效的地名格式
  const isValidPlaceName = (name) => {
    if (!name || !name.trim()) return false;
    
    // 地名应该只包含中文、英文、空格、连字符、撇号等常见地名字符
    // 不允许包含数字（除非是地名的一部分，如"第1大街"等特殊情况，但这里我们严格限制）
    // 不允许包含特殊符号（除了常见的连字符、撇号等）
    const placeNamePattern = /^[\u4e00-\u9fa5a-zA-Z\s\-'·.]+$/;
    
    // 检查是否包含数字（严格限制）
    const hasNumbers = /\d/.test(name);
    
    // 检查是否包含特殊符号（除了允许的）
    const hasInvalidChars = !placeNamePattern.test(name);
    
    return !hasNumbers && !hasInvalidChars && name.trim().length >= 1;
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = '请输入命书名称';
    if (!formData.year) newErrors.year = '请输入年份';
    if (!formData.month) newErrors.month = '请输入月份';
    if (!formData.day) newErrors.day = '请输入日期';
    if (!formData.hour && formData.hour !== 0) newErrors.hour = '请输入小时';
    // 分钟允许为空，为空时自动转换为 00
    
    // 验证出生地点：必须是有效的地名
    if (!formData.city.trim()) {
      newErrors.city = '请输入出生地点';
    } else if (!isValidPlaceName(formData.city)) {
      newErrors.city = '出生地点只能输入地名，不能包含数字或特殊符号';
    }
    
    if (!formData.lng) newErrors.lng = '请输入经度';
    if (!formData.lat) newErrors.lat = '请输入纬度';

    // 验证日期范围
    if (formData.year && (formData.year < 1900 || formData.year > 2100)) {
      newErrors.year = '年份范围应在1900-2100之间';
    }
    if (formData.month && (formData.month < 1 || formData.month > 12)) {
      newErrors.month = '月份范围应在1-12之间';
    }
    if (formData.day && (formData.day < 1 || formData.day > 31)) {
      newErrors.day = '日期范围应在1-31之间';
    }
    if (formData.hour !== '' && (formData.hour < 0 || formData.hour > 23)) {
      newErrors.hour = '小时范围应在0-23之间';
    }
    // 分钟允许为空，如果填写了则验证范围
    if (formData.minute !== '' && formData.minute !== null && formData.minute !== undefined && (formData.minute < 0 || formData.minute > 59)) {
      newErrors.minute = '分钟范围应在0-59之间';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 命书名称 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          命书名称 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="我的命书、妈妈的命书、张三"
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        <p className="mt-1 text-sm text-gray-500">
          给这个命书起个名字,方便以后查找和切换
        </p>
        {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
      </div>

      {/* 历法类型 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          历法类型
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleChange('calendar', 'solar')}
            className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
              formData.calendar === 'solar'
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            阳历(公历)
          </button>
          <button
            type="button"
            onClick={() => handleChange('calendar', 'lunar')}
            className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
              formData.calendar === 'lunar'
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            阴历(农历)
          </button>
        </div>
      </div>

      {/* 出生日期 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          出生日期 <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="number"
              value={formData.year}
              onChange={(e) => handleChange('year', parseInt(e.target.value) || '')}
              placeholder="年"
              min="1900"
              max="2100"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 ${
                errors.year ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.year && <p className="mt-1 text-xs text-red-500">{errors.year}</p>}
          </div>
          <div className="flex-1">
            <input
              type="number"
              value={formData.month}
              onChange={(e) => handleChange('month', parseInt(e.target.value) || '')}
              placeholder="月"
              min="1"
              max="12"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 ${
                errors.month ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.month && <p className="mt-1 text-xs text-red-500">{errors.month}</p>}
          </div>
          <div className="flex-1">
            <input
              type="number"
              value={formData.day}
              onChange={(e) => handleChange('day', parseInt(e.target.value) || '')}
              placeholder="日"
              min="1"
              max="31"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 ${
                errors.day ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.day && <p className="mt-1 text-xs text-red-500">{errors.day}</p>}
          </div>
        </div>
      </div>

      {/* 出生时间 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          出生时间 <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="number"
              value={formData.hour}
              onChange={(e) => handleChange('hour', parseInt(e.target.value) || '')}
              placeholder="时"
              min="0"
              max="23"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 ${
                errors.hour ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.hour && <p className="mt-1 text-xs text-red-500">{errors.hour}</p>}
          </div>
          <div className="flex-1">
            <input
              type="number"
              value={formData.minute}
              onChange={(e) => {
                const value = e.target.value;
                // 允许为空字符串，否则转换为数字
                handleChange('minute', value === '' ? '' : (parseInt(value) || ''));
              }}
              placeholder="分（可选，为空时默认为00）"
              min="0"
              max="59"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 ${
                errors.minute ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.minute && <p className="mt-1 text-xs text-red-500">{errors.minute}</p>}
          </div>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          请使用24小时制,如下午3点30分输入 15:30。分钟可以为空，为空时自动使用 00（如：12:00）
        </p>
      </div>

      {/* 性别 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          性别
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleChange('gender', '男(乾造)')}
            className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
              formData.gender === '男(乾造)'
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            男(乾造)
          </button>
          <button
            type="button"
            onClick={() => handleChange('gender', '女(坤造)')}
            className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
              formData.gender === '女(坤造)'
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            女(坤造)
          </button>
        </div>
      </div>

      {/* 出生地点 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          出生地点 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.city}
          onChange={(e) => {
            const value = e.target.value;
            // 实时验证，但不阻止输入（让用户先输入完整）
            handleChange('city', value);
          }}
          onBlur={(e) => {
            // 失去焦点时进行验证
            if (e.target.value.trim() && !isValidPlaceName(e.target.value)) {
              setErrors((prev) => ({
                ...prev,
                city: '出生地点只能输入地名，不能包含数字或特殊符号'
              }));
            }
          }}
          placeholder="北京、纽约、伦敦等"
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 ${
            errors.city ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.city && <p className="mt-1 text-sm text-red-500">{errors.city}</p>}
      </div>

      {/* 经纬度 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          经纬度 <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-4 mb-2">
          <div className="flex-1">
            <input
              type="number"
              step="0.0001"
              value={formData.lng}
              onChange={(e) => handleChange('lng', e.target.value === '' ? '' : parseFloat(e.target.value))}
              placeholder="经度(E)"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 ${
                errors.lng ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.lng && <p className="mt-1 text-xs text-red-500">{errors.lng}</p>}
          </div>
          <div className="flex-1">
            <input
              type="number"
              step="0.0001"
              value={formData.lat}
              onChange={(e) => handleChange('lat', e.target.value === '' ? '' : parseFloat(e.target.value))}
              placeholder="纬度(N)"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 ${
                errors.lat ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.lat && <p className="mt-1 text-xs text-red-500">{errors.lat}</p>}
          </div>
          <button
            type="button"
            onClick={handleLocate}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors whitespace-nowrap"
          >
            定位
          </button>
        </div>
        <p className="text-sm text-gray-500">
          推荐使用定位按钮获取精确坐标,或手动输入经纬度以确保真太阳时计算准确
        </p>
      </div>

      {/* 真太阳时选项 */}
      <div>
        <button
          type="button"
          onClick={() => setShowSolarTimeInfo(!showSolarTimeInfo)}
          className="text-sm text-gray-600 hover:text-gray-900 underline"
        >
          {showSolarTimeInfo ? '收起' : '展开'} 真太阳时选项
        </button>
        {showSolarTimeInfo && (
          <div className="mt-2 p-4 bg-gray-50 rounded-lg">
            <label className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                checked={formData.useTrueSolarTime}
                onChange={(e) => handleChange('useTrueSolarTime', e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium text-gray-700">使用真太阳时</span>
            </label>
            <div className="text-sm text-gray-600 space-y-2">
              <p>
                <strong>什么是真太阳时？</strong>
                <br />
                真太阳时是根据太阳实际位置计算的时间，不同经度的地区会有差异。例如，北京时间12:50，在沈阳的真太阳时约为13:04。
              </p>
              <p>
                <strong>是否需要使用真太阳时？</strong>
                <br />
                传统命理学派对此有不同看法。如果您的出生时间接近时辰交界（如13:00），建议尝试两种方式，看哪个更符合您的实际情况。大多数在线排盘工具默认不使用真太阳时。
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 底部按钮 */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          className="flex-1 bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          创建个人命理
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          取消
        </button>
      </div>
    </form>
  );
}
