import { getGanWuxing, getZhiWuxing } from '../utils/baziUtils';

/**
 * 基础八字排盘组件
 * 5列布局：标签列 + 年、月、日、时四柱
 */
export default function BasicBaziChart({ calculation, name, city, trueSolarTime }) {
  if (!calculation) {
    return null;
  }

  const chart = calculation.chart || calculation;
  const pillars = chart.pillars || [];
  
  if (pillars.length === 0) {
    return null;
  }

  // 构建四柱数据
  const pillarData = pillars.map((pillar, index) => {
    const labels = ['年柱', '月柱', '日柱', '时柱'];
    return {
      label: labels[index] || pillar.name || '',
      gan: pillar.gan || '',
      zhi: pillar.zhi || '',
      ganZhi: pillar.gan_zhi || '',
      shiShen: pillar.shi_shen || '',
      cangGan: pillar.cang_gan || [],
      naYin: pillar.na_yin || '',
      xingYun: pillar.xing_yun || '',
      ziZuo: pillar.zi_zuo || '',
      kongWang: pillar.kong_wang || '',
      shenSha: pillar.shen_sha || '',
      ganWuxing: pillar.gan_wuxing || getGanWuxing(pillar.gan),
      zhiWuxing: pillar.zhi_wuxing || getZhiWuxing(pillar.zhi),
    };
  });

  // 获取五行颜色类名（严格按照要求：木-绿，火-红，土-黄/棕，金-灰，水-蓝）
  const getWuxingColor = (wuxing) => {
    const colors = {
      '木': 'text-green-600 font-bold',      // 绿
      '火': 'text-red-600 font-bold',        // 红
      '土': 'text-amber-600 font-bold',      // 黄/棕
      '金': 'text-gray-600 font-bold',       // 灰
      '水': 'text-blue-600 font-bold',       // 蓝
    };
    return colors[wuxing] || 'text-gray-700';
  };

  // 获取藏干字符串
  const getCangGanStr = (cangGan) => {
    if (!cangGan || cangGan.length === 0) return '-';
    return cangGan.map(cg => {
      const gan = cg.gan || cg;
      return gan;
    }).join(' ');
  };

  // 表格行配置
  const rows = [
    { 
      label: '主星', 
      getValue: (p) => p.shiShen || '-',
      isShiShen: true
    },
    { 
      label: '天干', 
      getValue: (p) => p.gan,
      isGan: true,
      getWuxing: (p) => p.ganWuxing
    },
    { 
      label: '地支', 
      getValue: (p) => p.zhi,
      isZhi: true,
      getWuxing: (p) => p.zhiWuxing
    },
    { 
      label: '藏干', 
      getValue: (p) => getCangGanStr(p.cangGan)
    },
    { 
      label: '副星', 
      getValue: (p) => p.shiShen || '-',
      isShiShen: true
    },
    { 
      label: '星运', 
      getValue: (p) => p.xingYun || '-'
    },
    { 
      label: '自坐', 
      getValue: (p) => p.ziZuo || '-'
    },
    { 
      label: '空亡', 
      getValue: (p) => p.kongWang || '-'
    },
    { 
      label: '纳音', 
      getValue: (p) => p.naYin || '-'
    },
    { 
      label: '神煞', 
      getValue: (p) => p.shenSha || '-'
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <h2 className="text-2xl font-bold text-gray-900">基础八字排盘</h2>
          {name && (
            <span className="text-sm text-gray-500">{name}</span>
          )}
          {city && (
            <span className="text-sm text-gray-500">{city}</span>
          )}
          {trueSolarTime && (
            <span className="text-sm text-gray-500">真太阳时: {trueSolarTime}</span>
          )}
        </div>
      </div>

      {/* 八字排盘表格 */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 bg-gray-100 px-4 py-3 text-left text-sm font-semibold text-gray-800 min-w-[100px]">
                项目
              </th>
              {pillarData.map((pillar) => (
                <th
                  key={pillar.label}
                  className={`border border-gray-300 bg-gray-100 px-4 py-3 text-center text-sm font-semibold text-gray-800 ${
                    pillar.label === '日柱' ? 'bg-purple-100 border-purple-300' : ''
                  }`}
                >
                  {pillar.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr 
                key={row.label} 
                className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
              >
                {/* 标签列 */}
                <td className="border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50">
                  {row.label}
                </td>
                
                {/* 四柱数据列 */}
                {pillarData.map((pillar, colIndex) => {
                  const value = row.getValue(pillar);
                  const isDayPillar = pillar.label === '日柱';
                  
                  // 判断是否需要五行配色
                  let cellClassName = 'border border-gray-300 px-4 py-3 text-center text-sm';
                  if (row.isGan || row.isZhi) {
                    const wuxing = row.getWuxing ? row.getWuxing(pillar) : '';
                    cellClassName += ` ${getWuxingColor(wuxing)}`;
                  } else {
                    cellClassName += ' text-gray-700';
                  }

                  // 日柱高亮
                  if (isDayPillar) {
                    cellClassName += ' bg-purple-50';
                  }

                  return (
                    <td key={`${pillar.label}-${row.label}`} className={cellClassName}>
                      {value || '-'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
