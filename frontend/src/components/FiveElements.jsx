import { motion } from 'framer-motion';
import { getWuxingBgColorClass } from '../utils/baziUtils';

/**
 * 五行能量分析组件
 * 参考图2：进度条展示五行能量
 */
export default function FiveElements({ wuxingEnergy, calculation }) {
  // 优先使用新格式的 five_elements 数组
  if (calculation && Array.isArray(calculation.five_elements) && calculation.five_elements.length > 0) {
    const fiveElements = calculation.five_elements;
    
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">五行能量分析</h2>

        {/* 五行进度条组 */}
        <div className="space-y-4 mb-6">
          {fiveElements.map((elem) => {
            const bgColorClass = getWuxingBgColorClass(elem.name);

            return (
              <div key={elem.name} className="flex items-center gap-4">
                {/* 左侧：五行名称和状态 */}
                <div className="w-20 flex items-center gap-2">
                  <span className="text-lg">{getWuxingEmoji(elem.name)}</span>
                  <div>
                    <div className="text-sm font-medium text-gray-700">{elem.name}</div>
                    <div className="text-xs text-gray-500">({elem.status})</div>
                  </div>
                </div>

                {/* 中间：进度条 */}
                <div className="flex-1">
                  <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full ${bgColorClass} rounded-full`}
                      style={{ backgroundColor: elem.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${elem.percent}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>

                {/* 右侧：数值和百分比 */}
                <div className="w-24 text-right">
                  <div className="text-sm font-medium text-gray-700">
                    {elem.value.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-500">{elem.percent}%</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 底部总结 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-2">
          {fiveElements.map(elem => {
            if (elem.status === '旺') {
              return (
                <div key={elem.name} className="text-sm text-gray-700">
                  <span className="font-medium">最旺五行：</span>
                  <span>{elem.name}（次旺有力）</span>
                </div>
              );
            }
            if (elem.status === '死') {
              return (
                <div key={elem.name} className="text-sm text-gray-700">
                  <span className="font-medium">最弱五行：</span>
                  <span>{elem.name}（数量最少，需补充）</span>
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>
    );
  }
  
  // 兼容旧格式
  if (!wuxingEnergy) {
    return null;
  }

  const { scores, percentages, strongest, weakest, missing: missingRaw } = wuxingEnergy;
  
  // 辅助函数：获取五行 emoji
  function getWuxingEmoji(wuxing) {
    const emojiMap = {
      '木': '🌳',
      '火': '🔥',
      '水': '💧',
      '土': '⛰️',
      '金': '⚙️'
    };
    return emojiMap[wuxing] || '⚪';
  }

  // 处理 missing 字段：可能是字符串（"五行齐全" 或 "缺金"）或数组（["金", "水"]）
  const missing = Array.isArray(missingRaw) 
    ? missingRaw 
    : (typeof missingRaw === 'string' && missingRaw !== '五行齐全' && missingRaw.startsWith('缺'))
      ? missingRaw.replace('缺', '').split('') // "缺金" -> ["金"]
      : []; // "五行齐全" 或其他 -> []

  // 五行配置
  const wuxingConfig = [
    { name: '木', key: '木', emoji: '🌳', status: '相' },
    { name: '火', key: '火', emoji: '🔥', status: '死' },
    { name: '水', key: '水', emoji: '💧', status: '旺' },
    { name: '土', key: '土', emoji: '⛰️', status: '囚' },
    { name: '金', key: '金', emoji: '⚙️', status: '休' },
  ];

  // 获取五行状态（简化版，实际需要根据月令计算）
  const getWuxingStatus = (wuxing) => {
    // 这里简化处理，实际应该根据月令和日主计算
    if (wuxing === strongest) return '旺';
    if (wuxing === weakest) return '死';
    return '相';
  };

  // 计算总分数
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">五行能量分析</h2>

      {/* 五行进度条组 */}
      <div className="space-y-4 mb-6">
        {wuxingConfig.map((config) => {
          const score = scores[config.key] || 0;
          const percentage = percentages[config.key] || 0;
          const status = getWuxingStatus(config.key);
          const bgColorClass = getWuxingBgColorClass(config.key);

          return (
            <div key={config.key} className="flex items-center gap-4">
              {/* 左侧：五行名称和状态 */}
              <div className="w-20 flex items-center gap-2">
                <span className="text-lg">{config.emoji}</span>
                <div>
                  <div className="text-sm font-medium text-gray-700">{config.name}</div>
                  <div className="text-xs text-gray-500">({status})</div>
                </div>
              </div>

              {/* 中间：进度条 */}
              <div className="flex-1">
                <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${bgColorClass} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* 右侧：数值和百分比 */}
              <div className="w-24 text-right">
                <div className="text-sm font-medium text-gray-700">
                  {score.toFixed(1)}
                </div>
                <div className="text-xs text-gray-500">{percentage}%</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 底部总结 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-2">
        <div className="text-sm text-gray-700">
          <span className="font-medium">最旺五行：</span>
          <span>{strongest}（次旺有力）</span>
        </div>
        <div className="text-sm text-gray-700">
          <span className="font-medium">最弱五行：</span>
          <span>{weakest}（数量最少，需补充）</span>
        </div>
        {missing && missing.length > 0 && (
          <div className="text-sm text-yellow-800 bg-yellow-100 rounded p-2 mt-2">
            <span className="font-medium">缺失五行：</span>
            命局中缺少{missing.join('、')}，建议在生活中适当补充相关元素。
          </div>
        )}
        {(!missing || missing.length === 0) && (
          <div className="text-sm text-green-800 bg-green-100 rounded p-2 mt-2">
            <span className="font-medium">五行状态：</span>
            五行齐全，能量分布较为均衡。
          </div>
        )}
        <div className="text-sm text-gray-600 mt-2">
          <span className="font-medium">平衡建议：</span>
          木旺之人宜多接触土元素(黄色、陶瓷)，以达到五行平衡。
        </div>
      </div>
    </div>
  );
}
