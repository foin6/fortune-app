/**
 * 年份详情卡片组件
 * 显示当前选中年份的详细信息
 */
export default function YearDetailCard({ selectedData, currentAge }) {
  if (!selectedData) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p className="text-gray-500 text-center">请选择年份查看详情</p>
      </div>
    );
  }

  const { age, year, score, gan_zhi, da_yun, details } = selectedData;
  
  // 根据分数判断吉凶
  const getFortuneLabel = (score) => {
    if (score >= 70) return { label: '吉', color: 'text-green-600', bgColor: 'bg-green-50' };
    if (score >= 50) return { label: '平', color: 'text-gray-600', bgColor: 'bg-gray-50' };
    return { label: '凶', color: 'text-red-600', bgColor: 'bg-red-50' };
  };

  const fortune = getFortuneLabel(score);

  // 格式化干支信息（从顶层字段获取，不是从details）
  const ganZhi = gan_zhi || '';
  const daYun = da_yun || '';
  
  // details 可能是字符串或对象，需要处理
  let detailsObj = {};
  if (typeof details === 'string') {
    // 如果是字符串，尝试解析（如果后端返回的是JSON字符串）
    try {
      detailsObj = JSON.parse(details);
    } catch {
      // 如果解析失败，使用空对象
      detailsObj = {};
    }
  } else if (typeof details === 'object' && details !== null) {
    detailsObj = details;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* 标题行 */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {age}岁 {year}年 {ganZhi} {daYun}
          </h3>
        </div>
        <div className={`px-4 py-2 rounded-lg ${fortune.bgColor}`}>
          <div className={`text-2xl font-bold ${fortune.color}`}>
            {score}分
          </div>
          <div className={`text-sm font-medium ${fortune.color}`}>
            {fortune.label}
          </div>
        </div>
      </div>

      {/* 详情网格 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {/* 财运 */}
        {detailsObj.wealth && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">财运</div>
            <div className="text-sm font-medium text-gray-900">{detailsObj.wealth}</div>
            {detailsObj.wealth_advice && (
              <div className="text-xs text-green-600 mt-1">宜 {detailsObj.wealth_advice}</div>
            )}
          </div>
        )}

        {/* 人际 */}
        {detailsObj.interpersonal && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">人际</div>
            <div className="text-sm font-medium text-gray-900">{detailsObj.interpersonal}</div>
            {detailsObj.interpersonal_advice && (
              <div className="text-xs text-green-600 mt-1">宜 {detailsObj.interpersonal_advice}</div>
            )}
          </div>
        )}

        {/* 感情 */}
        {detailsObj.relationship && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">感情</div>
            <div className="text-sm font-medium text-gray-900">{detailsObj.relationship}</div>
            {detailsObj.relationship_advice && (
              <div className="text-xs text-green-600 mt-1">宜 {detailsObj.relationship_advice}</div>
            )}
          </div>
        )}

        {/* 健康 */}
        {detailsObj.health && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">健康</div>
            <div className="text-sm font-medium text-gray-900">{detailsObj.health}</div>
            {detailsObj.health_advice && (
              <div className="text-xs text-red-600 mt-1">忌 {detailsObj.health_advice}</div>
            )}
          </div>
        )}
        
        {/* 如果没有详细信息，显示 details 字符串 */}
        {!detailsObj.wealth && !detailsObj.interpersonal && !detailsObj.relationship && !detailsObj.health && details && (
          <div className="col-span-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-700">{typeof details === 'string' ? details : JSON.stringify(details)}</div>
          </div>
        )}
      </div>
    </div>
  );
}
