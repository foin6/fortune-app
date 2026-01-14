import { getWuxingBgColorClass, getWuxingColorClass } from '../utils/baziUtils';

// 辅助函数：根据天干获取五行
function getWuxingFromGan(gan) {
  const ganWuxingMap = {
    '甲': '木', '乙': '木',
    '丙': '火', '丁': '火',
    '戊': '土', '己': '土',
    '庚': '金', '辛': '金',
    '壬': '水', '癸': '水'
  };
  return ganWuxingMap[gan] || '';
}

/**
 * 喜用神分析组件
 * 参考图3：卡片布局展示用神、喜神、忌神、仇神、闲神
 */
export default function GodsAnalysis({ yongShen, wuxingEnergy, calculation }) {
  // 优先使用新格式的 gods_analysis 数据
  if (calculation && calculation.gods_analysis) {
    const godsAnalysis = calculation.gods_analysis;
    const chart = calculation.chart || {};
    const dayGan = calculation.day_master || chart.day_gan || '';
    const dayWuxing = getWuxingFromGan(dayGan);
    
    const godCards = [
      {
        type: '用神',
        wuxing: godsAnalysis.yong_shen?.name || '',
        description: godsAnalysis.yong_shen?.desc || '命局最需要的五行',
        bgColor: getWuxingBgColorClass(godsAnalysis.yong_shen?.name || ''),
        textColor: getWuxingColorClass(godsAnalysis.yong_shen?.name || '')
      },
      {
        type: '喜神',
        wuxing: godsAnalysis.xi_shen?.name || '',
        description: godsAnalysis.xi_shen?.desc || '对命局有利的五行',
        bgColor: getWuxingBgColorClass(godsAnalysis.xi_shen?.name || ''),
        textColor: getWuxingColorClass(godsAnalysis.xi_shen?.name || '')
      },
      {
        type: '忌神',
        wuxing: godsAnalysis.ji_shen?.name || '',
        description: godsAnalysis.ji_shen?.desc || '对命局不利的五行',
        bgColor: getWuxingBgColorClass(godsAnalysis.ji_shen?.name || ''),
        textColor: getWuxingColorClass(godsAnalysis.ji_shen?.name || '')
      },
      {
        type: '仇神',
        wuxing: godsAnalysis.chou_shen?.name || '',
        description: godsAnalysis.chou_shen?.desc || '生助忌神的五行',
        bgColor: getWuxingBgColorClass(godsAnalysis.chou_shen?.name || ''),
        textColor: getWuxingColorClass(godsAnalysis.chou_shen?.name || '')
      },
      {
        type: '闲神',
        wuxing: godsAnalysis.xian_shen?.name || '',
        description: godsAnalysis.xian_shen?.desc || '对命局影响较小',
        bgColor: getWuxingBgColorClass(godsAnalysis.xian_shen?.name || ''),
        textColor: getWuxingColorClass(godsAnalysis.xian_shen?.name || '')
      }
    ].filter(card => card.wuxing); // 只显示有值的卡片
    
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">喜用神分析</h2>

        {/* 卡片网格 */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {godCards.map((card) => (
            <div
              key={card.type}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow relative"
            >
              {/* 左侧色条 */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${card.bgColor} rounded-l-lg`} />
              
              <div className="ml-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-3 h-3 rounded-full ${card.bgColor}`} />
                  <h3 className="font-medium text-gray-900">{card.type}</h3>
                </div>
                <div className={`text-2xl font-bold mb-2 ${card.textColor}`}>
                  {card.wuxing}
                </div>
                <div className="text-xs text-gray-500">{card.description}</div>
              </div>
            </div>
          ))}
        </div>

        {/* 综合分析 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-gray-700 mb-2">
            <span className="font-medium">日主{dayGan}({dayWuxing})</span>
            {godsAnalysis.yong_shen?.name && (
              <span>，用神取{godsAnalysis.yong_shen.name}，{godsAnalysis.ji_shen?.name && `忌神为${godsAnalysis.ji_shen.name}`}。</span>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // 兼容旧格式
  if (!yongShen || !wuxingEnergy) {
    return null;
  }

  const { dayGan, dayWuxing, isStrong, usefulGod, tabooGod, tongDangScore, yiDangScore } = yongShen;

  // 计算喜神（对命局有利的五行）
  // 简化处理：用神的生助者为喜神
  const shengWo = {
    '木': '水', '火': '木', '土': '火',
    '金': '土', '水': '金'
  };
  const xiShen = shengWo[usefulGod] || '';

  // 计算仇神（生助忌神的五行）
  const chouShen = shengWo[tabooGod] || '';

  // 计算闲神（对命局影响较小的五行）
  const allWuxing = ['木', '火', '土', '金', '水'];
  const xianShen = allWuxing.find(wx => 
    wx !== usefulGod && 
    wx !== xiShen && 
    wx !== tabooGod && 
    wx !== chouShen
  ) || '';

  // 计算综合评分（简化算法）
  const totalScore = tongDangScore + yiDangScore;
  const balanceScore = totalScore > 0 
    ? Math.round((Math.min(tongDangScore, yiDangScore) / totalScore) * 100)
    : 50;

  // 卡片配置
  const godCards = [
    {
      type: '用神',
      wuxing: usefulGod,
      description: '命局最需要的五行',
      bgColor: getWuxingBgColorClass(usefulGod),
      textColor: getWuxingColorClass(usefulGod)
    },
    {
      type: '喜神',
      wuxing: xiShen,
      description: '对命局有利的五行',
      bgColor: getWuxingBgColorClass(xiShen),
      textColor: getWuxingColorClass(xiShen)
    },
    {
      type: '忌神',
      wuxing: tabooGod,
      description: '对命局不利的五行',
      bgColor: getWuxingBgColorClass(tabooGod),
      textColor: getWuxingColorClass(tabooGod)
    },
    {
      type: '仇神',
      wuxing: chouShen,
      description: '生助忌神的五行',
      bgColor: getWuxingBgColorClass(chouShen),
      textColor: getWuxingColorClass(chouShen)
    },
  ];

  // 如果有闲神，也添加
  if (xianShen) {
    godCards.push({
      type: '闲神',
      wuxing: xianShen,
      description: '对命局影响较小',
      bgColor: getWuxingBgColorClass(xianShen),
      textColor: getWuxingColorClass(xianShen)
    });
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">喜用神分析</h2>

      {/* 日主强弱 */}
      <div className="mb-6">
        <div className="text-sm text-gray-600 mb-2">
          <span className="font-medium">日主强弱：</span>
          <span className="text-gray-800">{isStrong ? '偏强' : '偏弱'}</span>
        </div>
      </div>

      {/* 卡片网格 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {godCards.map((card) => (
          <div
            key={card.type}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow relative"
          >
            {/* 左侧色条 */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${card.bgColor} rounded-l-lg`} />
            
            <div className="ml-3">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${card.bgColor}`} />
                <h3 className="font-medium text-gray-900">{card.type}</h3>
              </div>
              <div className={`text-2xl font-bold mb-2 ${card.textColor}`}>
                {card.wuxing || '-'}
              </div>
              <div className="text-xs text-gray-500">{card.description}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 综合分析 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="text-sm text-gray-700 mb-2">
          <span className="font-medium">日主{dayGan}({dayWuxing})</span>
          {isStrong ? '日主偏强' : '日主偏弱'}，但生于寒暑之月，调候为急，优先取调候用神。
        </div>
        <div className="text-sm text-gray-700 mb-2">
          <span className="font-medium">用神取{usefulGod}，忌神为{tabooGod}。</span>
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-blue-200">
          <span className="text-sm font-medium text-gray-700">综合评分：</span>
          <span className="text-2xl font-bold text-blue-600">{balanceScore}分</span>
        </div>
      </div>

      {/* 开运建议 */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">开运建议</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div>
            <span className="font-medium">幸运颜色：</span>
            黑色、蓝色、绿色、青色
          </div>
          <div>
            <span className="font-medium">有利方位：</span>
            北方
          </div>
          <div>
            <span className="font-medium">适宜行业：</span>
            物流、旅游、水产、贸易、咨询
          </div>
          <div>
            <span className="font-medium">佩戴饰品：</span>
            与水五行相关的材质
          </div>
        </div>
      </div>
    </div>
  );
}
