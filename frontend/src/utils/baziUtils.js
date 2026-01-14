/**
 * 八字工具函数
 */

// 天干五行对应
const TIAN_GAN_WUXING = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水'
};

// 地支五行对应
const DI_ZHI_WUXING = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木',
  '辰': '土', '巳': '火', '午': '火', '未': '土',
  '申': '金', '酉': '金', '戌': '土', '亥': '水'
};

// 地支藏干
const DI_ZHI_CANG_GAN = {
  '子': [['癸', 5]],
  '丑': [['己', 5], ['癸', 3], ['辛', 1]],
  '寅': [['甲', 5], ['丙', 3], ['戊', 1]],
  '卯': [['乙', 5]],
  '辰': [['戊', 5], ['乙', 3], ['癸', 1]],
  '巳': [['丙', 5], ['戊', 3], ['庚', 1]],
  '午': [['丁', 5], ['己', 3]],
  '未': [['己', 5], ['丁', 3], ['乙', 1]],
  '申': [['庚', 5], ['壬', 3], ['戊', 1]],
  '酉': [['辛', 5]],
  '戌': [['戊', 5], ['辛', 3], ['丁', 1]],
  '亥': [['壬', 5], ['甲', 3]]
};

// 纳音五行
const NA_YIN = {
  '甲子': '金', '乙丑': '金', '丙寅': '火', '丁卯': '火',
  '戊辰': '木', '己巳': '木', '庚午': '土', '辛未': '土',
  '壬申': '金', '癸酉': '金', '甲戌': '火', '乙亥': '火',
  '丙子': '水', '丁丑': '水', '戊寅': '土', '己卯': '土',
  '庚辰': '金', '辛巳': '金', '壬午': '木', '癸未': '木',
  '甲申': '水', '乙酉': '水', '丙戌': '土', '丁亥': '土',
  '戊子': '火', '己丑': '火', '庚寅': '木', '辛卯': '木',
  '壬辰': '水', '癸巳': '水', '甲午': '金', '乙未': '金',
  '丙申': '火', '丁酉': '火', '戊戌': '木', '己亥': '木',
  '庚子': '土', '辛丑': '土', '壬寅': '金', '癸卯': '金',
  '甲辰': '火', '乙巳': '火', '丙午': '水', '丁未': '水',
  '戊申': '土', '己酉': '土', '庚戌': '金', '辛亥': '金',
  '壬子': '木', '癸丑': '木', '甲寅': '水', '乙卯': '水',
  '丙辰': '土', '丁巳': '土', '戊午': '火', '己未': '火',
  '庚申': '木', '辛酉': '木', '壬戌': '水', '癸亥': '水'
};

// 五行颜色映射
export const WUXING_COLORS = {
  '木': 'emerald',
  '火': 'red',
  '土': 'amber',
  '金': 'slate',
  '水': 'blue'
};

// 获取天干五行
export function getGanWuxing(gan) {
  return TIAN_GAN_WUXING[gan] || '';
}

// 获取地支五行
export function getZhiWuxing(zhi) {
  return DI_ZHI_WUXING[zhi] || '';
}

// 获取藏干
export function getCangGan(zhi) {
  return DI_ZHI_CANG_GAN[zhi] || [];
}

// 获取纳音
export function getNaYin(ganZhi) {
  return NA_YIN[ganZhi] || '';
}

// 五行颜色类名映射（完整类名，Tailwind需要）
const WUXING_TEXT_COLORS = {
  '木': 'text-emerald-600',
  '火': 'text-red-600',
  '土': 'text-amber-600',
  '金': 'text-slate-600',
  '水': 'text-blue-600'
};

const WUXING_BG_COLORS = {
  '木': 'bg-emerald-500',
  '火': 'bg-red-500',
  '土': 'bg-amber-500',
  '金': 'bg-slate-400',
  '水': 'bg-blue-500'
};

// 获取五行颜色类名
export function getWuxingColorClass(wuxing) {
  return WUXING_TEXT_COLORS[wuxing] || 'text-gray-600';
}

// 获取五行背景颜色类名
export function getWuxingBgColorClass(wuxing) {
  return WUXING_BG_COLORS[wuxing] || 'bg-gray-500';
}

// 计算五行能量
export function calculateWuxingEnergy(calculation) {
  if (!calculation) {
    return null;
  }

  // 优先使用后端返回的 five_elements 数据（如果存在）
  if (calculation.five_elements && calculation.five_elements.scores) {
    // 处理 missing 字段：如果是字符串，转换为数组格式供组件使用
    const missingText = calculation.five_elements.missing || '五行齐全';
    const missingArray = typeof missingText === 'string' && missingText !== '五行齐全' && missingText.startsWith('缺')
      ? missingText.replace('缺', '').split('') // "缺金" -> ["金"]
      : []; // "五行齐全" -> []
    
    return {
      ...calculation.five_elements,
      missing: missingArray, // 转换为数组格式
      missingText: missingText // 保留原始文本
    };
  }

  // 否则从 chart.pillars 中计算
  const chart = calculation.chart || calculation;
  const pillars = chart.pillars || [];
  
  if (pillars.length === 0) {
    return null;
  }

  const wuxingScores = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };

  // 遍历四柱
  pillars.forEach((pillar) => {
    const gan = pillar.gan;
    const zhi = pillar.zhi;

    // 天干五行得分（5分）
    const ganWuxing = getGanWuxing(gan);
    if (ganWuxing) {
      wuxingScores[ganWuxing] += 5;
    }

    // 地支五行得分（5分）
    const zhiWuxing = getZhiWuxing(zhi);
    if (zhiWuxing) {
      wuxingScores[zhiWuxing] += 5;
    }

    // 藏干五行得分
    const cangGans = getCangGan(zhi);
    cangGans.forEach(([cangGan, score]) => {
      const cangWuxing = getGanWuxing(cangGan);
      if (cangWuxing) {
        wuxingScores[cangWuxing] += score;
      }
    });
  });

  // 计算百分比
  const totalScore = Object.values(wuxingScores).reduce((a, b) => a + b, 0);
  const percentages = {};
  Object.keys(wuxingScores).forEach(wuxing => {
    percentages[wuxing] = totalScore > 0 
      ? Math.round((wuxingScores[wuxing] / totalScore) * 100) 
      : 0;
  });

  // 找出最旺和最弱的五行
  const sorted = Object.entries(wuxingScores).sort((a, b) => b[1] - a[1]);
  const strongest = sorted[0]?.[0] || '';
  const weakest = sorted[sorted.length - 1]?.[0] || '';

  // 缺失的五行（返回数组格式）
  const missingArray = Object.entries(wuxingScores)
    .filter(([_, score]) => score === 0)
    .map(([wuxing]) => wuxing);

  return {
    scores: wuxingScores,
    percentages,
    strongest,
    weakest,
    missing: missingArray, // 返回数组格式供组件使用
    missingText: missingArray.length > 0 ? `缺${missingArray.join('')}` : '五行齐全' // 文本格式
  };
}

// 计算用神分析
export function calculateYongShen(calculation, wuxingEnergy) {
  if (!calculation || !wuxingEnergy) {
    return null;
  }

  // 支持两种数据结构：calculation.day_gan 或 calculation.chart.day_gan
  const dayGan = calculation.day_gan || calculation.chart?.day_gan;
  const dayWuxing = getGanWuxing(dayGan);

  // 生我的五行（印）
  const shengWo = {
    '木': '水', '火': '木', '土': '火',
    '金': '土', '水': '金'
  };

  // 我生的五行（食伤）
  const woSheng = {
    '木': '火', '火': '土', '土': '金',
    '金': '水', '水': '木'
  };

  // 我克的五行（财）
  const woKe = {
    '木': '土', '火': '金', '土': '水',
    '金': '木', '水': '火'
  };

  // 克我的五行（官杀）
  const keWo = {
    '木': '金', '火': '水', '土': '木',
    '金': '火', '水': '土'
  };

  const yinWuxing = shengWo[dayWuxing] || '';
  const biJieWuxing = dayWuxing; // 同我
  const shiShangWuxing = woSheng[dayWuxing] || '';
  const caiWuxing = woKe[dayWuxing] || '';
  const guanShaWuxing = keWo[dayWuxing] || '';

  // 计算同党和异党得分
  const tongDangScore = 
    (wuxingEnergy.scores[yinWuxing] || 0) +
    (wuxingEnergy.scores[biJieWuxing] || 0);

  const yiDangScore = 
    (wuxingEnergy.scores[shiShangWuxing] || 0) +
    (wuxingEnergy.scores[caiWuxing] || 0) +
    (wuxingEnergy.scores[guanShaWuxing] || 0);

  const isStrong = tongDangScore > yiDangScore;

  // 计算用神和忌神
  let usefulGod = '';
  let tabooGod = '';

  if (isStrong) {
    // 日主强，喜用神为异党（泄、耗、克）
    if (wuxingEnergy.scores[shiShangWuxing] > 0) {
      usefulGod = shiShangWuxing;
    } else if (wuxingEnergy.scores[caiWuxing] > 0) {
      usefulGod = caiWuxing;
    } else if (wuxingEnergy.scores[guanShaWuxing] > 0) {
      usefulGod = guanShaWuxing;
    }
    tabooGod = yinWuxing || biJieWuxing;
  } else {
    // 日主弱，喜用神为同党（生、扶）
    if (wuxingEnergy.scores[yinWuxing] > 0) {
      usefulGod = yinWuxing;
    } else {
      usefulGod = biJieWuxing;
    }
    tabooGod = shiShangWuxing || caiWuxing || guanShaWuxing;
  }

  return {
    dayGan,
    dayWuxing,
    isStrong,
    usefulGod,
    tabooGod,
    tongDangScore,
    yiDangScore
  };
}

/**
 * 从流式文本中提取性格特质
 * @param {string} text - 流式文本内容
 * @returns {string[]} 性格特质数组
 */
export function extractPersonalityTraits(text) {
  if (!text) return [];
  
  // 尝试从文本中提取性格特质
  // 常见的性格特质关键词
  const traitKeywords = [
    '热情', '光明', '积极', '乐观', '开朗', '活泼',
    '稳重', '内敛', '沉静', '理性', '冷静', '谨慎',
    '果断', '勇敢', '坚毅', '执着', '专注', '细致',
    '温和', '善良', '包容', '大度', '豁达', '随和'
  ];
  
  const foundTraits = [];
  traitKeywords.forEach(trait => {
    if (text.includes(trait) && !foundTraits.includes(trait)) {
      foundTraits.push(trait);
    }
  });
  
  // 限制返回3-5个特质
  return foundTraits.slice(0, 5);
}

/**
 * 从流式文本中提取命理精华（第一段关于日主的描述）
 * @param {string} text - 流式文本内容
 * @param {string} dayGan - 日元天干
 * @param {string} dayWuxing - 日主五行
 * @returns {string} 命理精华文本
 */
export function extractEssenceText(text, dayGan, dayWuxing) {
  if (!text || !dayGan) return '';
  
  // 尝试找到包含日主信息的段落
  // 支持多种分隔符：句号、感叹号、换行、段落分隔
  const sentences = text.split(/[。！\n\n\n]/).filter(s => s.trim());
  
  // 优先查找包含"日主"关键词的句子
  for (const sentence of sentences) {
    if (sentence.includes('日主') && (sentence.includes(dayGan) || sentence.includes(dayWuxing))) {
      // 如果句子长度合适（15-200字），返回它
      if (sentence.length >= 15 && sentence.length <= 200) {
        return sentence.trim() + (sentence.endsWith('。') ? '' : '。');
      }
    }
  }
  
  // 其次查找包含日主天干或五行的句子
  for (const sentence of sentences) {
    if (sentence.includes(dayGan) || sentence.includes(dayWuxing)) {
      // 如果句子长度合适（20-150字），返回它
      if (sentence.length >= 20 && sentence.length <= 150) {
        return sentence.trim() + (sentence.endsWith('。') ? '' : '。');
      }
    }
  }
  
  // 如果没找到，返回第一段（如果长度合适）
  if (sentences.length > 0 && sentences[0].length >= 20 && sentences[0].length <= 200) {
    return sentences[0].trim() + (sentences[0].endsWith('。') ? '' : '。');
  }
  
  return '';
}
