/**
 * 八字四柱显示组件
 */
export default function BaziDisplay({ calculation }) {
  if (!calculation || !calculation.si_zhu) {
    return null;
  }

  const { si_zhu, shi_shen } = calculation;

  const columns = [
    { label: '年柱', value: si_zhu.year, shiShen: shi_shen.year_shi_shen },
    { label: '月柱', value: si_zhu.month, shiShen: shi_shen.month_shi_shen },
    { label: '日柱', value: si_zhu.day, shiShen: shi_shen.day_shi_shen },
    { label: '时柱', value: si_zhu.hour, shiShen: shi_shen.hour_shi_shen },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">八字四柱</h2>
      <div className="grid grid-cols-4 gap-4">
        {columns.map((col) => (
          <div key={col.label} className="text-center">
            <div className="text-sm text-gray-500 mb-2">{col.label}</div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {col.value}
            </div>
            <div className="text-xs text-gray-400">{col.shiShen}</div>
          </div>
        ))}
      </div>
      {calculation.true_solar_time && (
        <div className="mt-4 text-sm text-gray-600">
          真太阳时: {calculation.true_solar_time}
        </div>
      )}
    </div>
  );
}
