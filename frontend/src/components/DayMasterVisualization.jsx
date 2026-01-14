import { motion } from 'framer-motion';
import { ChevronUp } from 'lucide-react';
import { useState } from 'react';

/**
 * 命盘核心可视化组件
 * 显示日元和十神的环绕布局
 */
export default function DayMasterVisualization({ calculation, personalityTraits = [], essenceText = '' }) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!calculation) {
    return null;
  }

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

  // 优先使用后端返回的 day_master_info 数据
  const dayMasterInfo = calculation.day_master_info || {};
  const dayGan = dayMasterInfo.name || calculation.day_master || calculation.chart?.day_gan || '';
  const dayWuxing = dayMasterInfo.element || calculation.gods?.day_wuxing || getWuxingFromGan(dayGan) || '';

  // 优先使用后端返回的 ten_gods 数组
  let displayShiShen = [];
  if (calculation.ten_gods && Array.isArray(calculation.ten_gods) && calculation.ten_gods.length > 0) {
    // 直接使用后端返回的十神数组
    displayShiShen = calculation.ten_gods.filter(god => god && god !== '日主');
  } else {
    // 兼容旧格式：从数据中收集十神
    const allShiShen = new Set();
    
    // 优先使用新格式的 pillars 数据
    if (calculation.pillars) {
      const pillars = calculation.pillars;
      ['year', 'month', 'day', 'hour'].forEach(key => {
        const pillar = pillars[key];
        if (pillar && pillar.main_star && pillar.main_star !== '日主') {
          allShiShen.add(pillar.main_star);
        }
      });
    }
    
    // 兼容旧格式：从四柱的十神配置中收集
    const chart = calculation.chart || {};
    if (chart.shi_shen) {
      const shiShenObj = chart.shi_shen;
      if (shiShenObj.year_shi_shen && shiShenObj.year_shi_shen !== '日主') {
        allShiShen.add(shiShenObj.year_shi_shen);
      }
      if (shiShenObj.month_shi_shen && shiShenObj.month_shi_shen !== '日主') {
        allShiShen.add(shiShenObj.month_shi_shen);
      }
      if (shiShenObj.hour_shi_shen && shiShenObj.hour_shi_shen !== '日主') {
        allShiShen.add(shiShenObj.hour_shi_shen);
      }
    }

    // 兼容旧格式：从四柱详情中收集（包括藏干的十神）
    if (chart.pillars && Array.isArray(chart.pillars)) {
      chart.pillars.forEach((pillar) => {
        if (pillar.shi_shen && pillar.shi_shen !== '日主') {
          allShiShen.add(pillar.shi_shen);
        }
      });
    }

    // 转换为数组并排序（按十神顺序）
    const shiShenOrder = ['正官', '偏官', '七杀', '正印', '偏印', '比肩', '劫财', '食神', '伤官', '正财', '偏财'];
    const shiShenList = Array.from(allShiShen).sort((a, b) => {
      const indexA = shiShenOrder.indexOf(a);
      const indexB = shiShenOrder.indexOf(b);
      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });

    displayShiShen = shiShenList;
  }

  // 优先使用后端返回的 personality_tags
  const backendPersonalityTraits = calculation.personality_tags || calculation.gods?.personality_tags || [];
  const finalPersonalityTraits = personalityTraits.length > 0 ? personalityTraits : backendPersonalityTraits;

  // 优先使用后端返回的 essence_text
  const backendEssenceText = calculation.essence_text || '';
  const finalEssenceText = essenceText || backendEssenceText;

  // 计算环绕位置（响应式半径，根据数组长度自动调整）
  const getOrbitPosition = (index, total) => {
    // 根据数组长度和屏幕大小动态调整半径，防止重叠
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    
    // 基础半径
    let baseRadius;
    if (total <= 4) {
      baseRadius = isMobile ? 80 : 110;  // 少量元素，使用较小半径
    } else if (total <= 6) {
      baseRadius = isMobile ? 100 : 140;  // 中等数量
    } else if (total <= 8) {
      baseRadius = isMobile ? 110 : 150;  // 较多元素
    } else {
      baseRadius = isMobile ? 120 : 160;  // 大量元素，使用较大半径
    }
    
    // 计算角度（均匀分布）
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2; // 从顶部开始
    const x = Math.cos(angle) * baseRadius;
    const y = Math.sin(angle) * baseRadius;
    return { x, y, radius: baseRadius };
  };

  // 五行颜色映射
  const wuxingColors = {
    '木': 'from-emerald-400 to-emerald-600',
    '火': 'from-purple-400 via-purple-500 to-purple-600',
    '土': 'from-amber-400 to-amber-600',
    '金': 'from-slate-400 to-slate-600',
    '水': 'from-blue-400 to-blue-600'
  };

  const centerGradient = wuxingColors[dayWuxing] || 'from-purple-400 via-purple-500 to-purple-600';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-xl shadow-sm p-6 mb-6"
    >
      {/* 标题栏 */}
      <div
        className="flex items-center justify-between mb-6 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span className="w-2 h-2 bg-black rounded-full"></span>
          命盘的核心: 日元
        </h2>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronUp className="w-5 h-5 text-gray-500" />
        </motion.div>
      </div>

      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* 环绕布局容器 */}
          <div className="relative flex items-center justify-center py-8 md:py-12 min-h-[350px] md:min-h-[400px] overflow-hidden">
            {/* 中心圆 */}
            <motion.div
              className="relative z-10"
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              <div
                className={`w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br ${centerGradient} flex flex-col items-center justify-center text-white shadow-xl relative`}
                style={{
                  boxShadow: '0 0 30px rgba(139, 92, 246, 0.4), 0 0 60px rgba(139, 92, 246, 0.2)'
                }}
              >
                {/* 呼吸灯效果 */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400/30 to-blue-400/30"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                />
                <div className="relative z-10 text-center">
                  <div className="text-3xl md:text-4xl font-bold mb-1">{dayGan}</div>
                  <div className="text-base md:text-lg font-medium">{dayWuxing}</div>
                </div>
              </div>
            </motion.div>

            {/* 环绕的十神气泡 */}
            {displayShiShen.length > 0 ? (
              displayShiShen.map((shiShen, index) => {
                const position = getOrbitPosition(index, displayShiShen.length);
                return (
                  <motion.div
                    key={shiShen}
                    className="absolute z-0"
                    style={{
                      left: `calc(50% + ${position.x}px)`,
                      top: `calc(50% + ${position.y}px)`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: 1,
                      scale: 1
                    }}
                    transition={{
                      delay: index * 0.1,
                      duration: 0.5,
                      type: 'spring',
                      stiffness: 200
                    }}
                  >
                    <motion.div
                      className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center text-gray-700 text-xs md:text-sm font-medium shadow-md hover:shadow-lg transition-shadow"
                      animate={{
                        y: [0, -6, 0]
                      }}
                      transition={{
                        duration: 2 + index * 0.2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: index * 0.1
                      }}
                      whileHover={{ scale: 1.1 }}
                    >
                      <span className="text-center px-1">{shiShen}</span>
                    </motion.div>
                  </motion.div>
                );
              })
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                暂无十神数据
              </div>
            )}
          </div>

          {/* 性格特质标签 - 优先使用后端返回的数据 */}
          {finalPersonalityTraits && finalPersonalityTraits.length > 0 && (
            <div className="mt-8 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">性格特质</h3>
              <div className="flex flex-wrap gap-2">
                {finalPersonalityTraits.map((trait, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-medium shadow-sm"
                  >
                    {trait}
                  </motion.span>
                ))}
              </div>
            </div>
          )}

          {/* 命理精华文本 - 优先使用后端返回的数据 */}
          {finalEssenceText && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">命理精华</h3>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-gray-700 leading-relaxed"
              >
                {finalEssenceText}
              </motion.p>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
