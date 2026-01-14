import { getGanWuxing, getZhiWuxing, getCangGan, getNaYin, getWuxingColorClass } from '../utils/baziUtils';

/**
 * 八字排盘图表组件
 * 参考图1：网格布局，中间有圆形日元展示
 */
export default function BaziChart({ calculation, name, city, trueSolarTime }) {
  if (!calculation) {
    return null;
  }

  const chart = calculation.chart || calculation;
  const pillars = chart.pillars || [];
  const si_zhu = chart.si_zhu || {};
  const shi_shen = chart.shi_shen || {};
  
  if (pillars.length === 0) {
    return null;
  }

  const dayGan = chart.day_gan || '';
  const dayZhi = chart.day_zhi || '';
  const dayWuxing = getGanWuxing(dayGan);

  // 构建四柱数据（从 pillars 数组中提取）
  const pillarData = [
    { key: 'year', label: '年柱', pillar: pillars[0] },
    { key: 'month', label: '月柱', pillar: pillars[1] },
    { key: 'day', label: '日柱', pillar: pillars[2] },
    { key: 'hour', label: '时柱', pillar: pillars[3] },
  ].map(({ key, label, pillar }) => ({
    key,
    label,
    gan: pillar?.gan || '',
    zhi: pillar?.zhi || '',
    ganZhi: pillar?.gan_zhi || si_zhu[key] || '',
    shiShen: shi_shen[`${key}_shi_shen`] || pillar?.shi_shen || '',
    cangGan: pillar?.cang_gan || [],
    naYin: pillar?.na_yin || '',
    xingYun: pillar?.xing_yun || '',
    kongWang: pillar?.kong_wang || '',
    shenSha: pillar?.shen_sha || '',
    pillar: pillar, // 保留原始 pillar 数据
  }));

  // 获取藏干字符串（从 pillar.cangGan 或计算）
  const getCangGanStr = (pillar) => {
    if (pillar.cangGan && pillar.cangGan.length > 0) {
      return pillar.cangGan.map(cg => cg.gan || cg).join(' ');
    }
    const cangGans = getCangGan(pillar.zhi);
    return cangGans.map(([gan, score]) => gan).join(' ');
  };

  // 获取纳音（从 pillar.naYin 或计算）
  const getNaYinStr = (pillar) => {
    return pillar.naYin || getNaYin(pillar.ganZhi) || '-';
  };

  // 表格行数据
  const rows = [
    { label: '主星', getValue: (p) => p.shiShen },
    { label: '天干', getValue: (p) => p.gan, isGan: true },
    { label: '地支', getValue: (p) => p.zhi, isZhi: true },
    { label: '藏干', getValue: (p) => getCangGanStr(p) },
    { label: '副星', getValue: (p) => p.shiShen },
    { label: '星运', getValue: (p) => p.xingYun || '-' },
    { label: '自坐', getValue: (p) => p.key === 'day' ? p.zhi : '-' },
    { label: '空亡', getValue: (p) => p.kongWang || '-' },
    { label: '纳音', getValue: (p) => getNaYinStr(p) },
    { label: '神煞', getValue: (p) => p.shenSha || '-' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">{name || '我的命书'}</h2>
          <span className="text-sm text-gray-500">{city || ''}</span>
          {trueSolarTime && (
            <span className="text-sm text-gray-500">真太阳时: {trueSolarTime}</span>
          )}
        </div>
      </div>

      {/* 八字排盘表格 */}
      <div className="relative">
        <div className="grid grid-cols-5 gap-4">
          {/* 标签列 */}
          <div className="space-y-2">
            {rows.map((row) => (
              <div
                key={row.label}
                className="h-12 flex items-center text-sm font-medium text-gray-600"
              >
                {row.label}
              </div>
            ))}
          </div>

          {/* 四柱列 */}
          {pillarData.map((pillar, colIndex) => {
            const isDayPillar = pillar.key === 'day';
            return (
              <div
                key={pillar.key}
                className={`space-y-2 ${isDayPillar ? 'border-2 border-purple-200 rounded-lg p-2 bg-purple-50/30' : ''}`}
              >
                {/* 列标题 */}
                <div className="h-12 flex items-center justify-center text-sm font-medium text-gray-600 mb-2">
                  {pillar.label}
                </div>

                {/* 数据行 */}
                {rows.map((row, rowIndex) => {
                  const value = row.getValue(pillar);
                  const isGan = row.isGan && rowIndex === 1; // 天干行
                  const isZhi = row.isZhi && rowIndex === 2; // 地支行
                  const isDayGan = isDayPillar && isGan; // 日柱天干（日元）

                  return (
                    <div
                      key={`${pillar.key}-${row.label}`}
                      className="h-12 flex items-center justify-center text-sm"
                    >
                      {isDayGan ? (
                        // 日元圆形展示
                        <div className="relative">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg">
                            <div className="text-center">
                              <div className="text-white font-bold text-lg">{dayGan}</div>
                              <div className="text-white text-xs">{dayWuxing}</div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className={`text-center ${isGan || isZhi ? getWuxingColorClass(isGan ? getGanWuxing(value) : getZhiWuxing(value)) : 'text-gray-700'}`}>
                          {value || '-'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
