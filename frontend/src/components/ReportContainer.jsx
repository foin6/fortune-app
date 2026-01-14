import { motion } from 'framer-motion';
import BaziChart from './BaziChart';
import BasicBaziChart from './BasicBaziChart';
import FiveElements from './FiveElements';
import GodsAnalysis from './GodsAnalysis';
import DayMasterVisualization from './DayMasterVisualization';
import { calculateWuxingEnergy, calculateYongShen } from '../utils/baziUtils';

/**
 * 命理报告容器组件
 * 使用 framer-motion 实现滑动浮现动画
 */
export default function ReportContainer({ calculation, name, city, trueSolarTime, personalityTraits = [], essenceText = '' }) {
  if (!calculation) {
    return null;
  }

  // 计算五行能量和用神分析
  const wuxingEnergy = calculateWuxingEnergy(calculation);
  const yongShen = wuxingEnergy ? calculateYongShen(calculation, wuxingEnergy) : null;

  // 动画配置
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 30 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.6, -0.05, 0.01, 0.99]
      }
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gray-50 py-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-6xl mx-auto px-4 space-y-6">
        {/* 基础八字排盘卡片 */}
        <motion.div variants={cardVariants}>
          <BasicBaziChart 
            calculation={calculation}
            name={name}
            city={city}
            trueSolarTime={trueSolarTime}
          />
        </motion.div>

        {/* 命盘核心可视化 */}
        <motion.div variants={cardVariants}>
          <DayMasterVisualization 
            calculation={calculation}
            personalityTraits={personalityTraits}
            essenceText={essenceText}
          />
        </motion.div>

        {/* 五行能量分析卡片 */}
        {(calculation.five_elements || wuxingEnergy) && (
          <motion.div variants={cardVariants}>
            <FiveElements 
              wuxingEnergy={wuxingEnergy} 
              calculation={calculation}
            />
          </motion.div>
        )}

        {/* 喜用神分析卡片 */}
        {(calculation.gods_analysis || (yongShen && wuxingEnergy)) && (
          <motion.div variants={cardVariants}>
            <GodsAnalysis 
              yongShen={yongShen}
              wuxingEnergy={wuxingEnergy}
              calculation={calculation}
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
