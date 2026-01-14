import { useMemo, useCallback, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';


/**
 * 自定义当前年龄标注
 */
const CurrentAgeDot = ({ cx, cy, payload }) => {
  if (payload.isCurrentAge) {
    return (
      <g>
        <line
          x1={cx}
          y1={0}
          x2={cx}
          y2={cy}
          stroke="#3b82f6"
          strokeWidth={2}
          strokeDasharray="5 5"
        />
        <circle
          cx={cx}
          cy={cy}
          r={6}
          fill="#3b82f6"
          stroke="#ffffff"
          strokeWidth={2}
        />
        <text
          x={cx}
          y={cy - 15}
          textAnchor="middle"
          fontSize={12}
          fill="#3b82f6"
          fontWeight="bold"
        >
          今年{payload.age}岁
        </text>
      </g>
    );
  }
  return null;
};

/**
 * 防抖函数
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * 自定义标注点组件（峰值）
 */
const PeakDot = ({ cx, cy, payload }) => {
  if (!payload.isPeak) return null;
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill="#10b981"
        stroke="#ffffff"
        strokeWidth={2}
      />
      <text
        x={cx}
        y={cy - 15}
        textAnchor="middle"
        fontSize={12}
        fill="#10b981"
        fontWeight="bold"
      >
        {payload.age}岁峰
      </text>
    </g>
  );
};

/**
 * 自定义标注点组件（谷值）
 */
const ValleyDot = ({ cx, cy, payload }) => {
  if (!payload.isValley) return null;
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill="#ef4444"
        stroke="#ffffff"
        strokeWidth={2}
      />
      <text
        x={cx}
        y={cy + 20}
        textAnchor="middle"
        fontSize={12}
        fill="#ef4444"
        fontWeight="bold"
      >
        {payload.age}岁谷
      </text>
    </g>
  );
};

/**
 * 人生K线图表组件
 */
export default function LifeChart({ chartData, currentAge, onYearSelect }) {
  const [hoveredX, setHoveredX] = useState(null);
  const [hoveredData, setHoveredData] = useState(null);

  // 处理鼠标移动事件（带防抖）
  const debouncedHandleMouseMove = useMemo(
    () => debounce((e) => {
      if (e && e.activePayload && e.activePayload[0]) {
        const data = e.activePayload[0].payload;
        setHoveredX(e.activeCoordinate?.x || null);
        setHoveredData(data);
        if (onYearSelect) {
          onYearSelect(data);
        }
      }
    }, 50),
    [onYearSelect]
  );
  
  const handleMouseMove = useCallback((e) => {
    debouncedHandleMouseMove(e);
  }, [debouncedHandleMouseMove]);

  // 处理鼠标离开事件
  const handleMouseLeave = useCallback(() => {
    setHoveredX(null);
    setHoveredData(null);
    // 恢复默认选中当前年龄
    if (currentAge !== null && chartData) {
      const currentData = chartData.find((d) => d.age === currentAge);
      if (currentData && onYearSelect) {
        onYearSelect(currentData);
      }
    }
  }, [currentAge, chartData, onYearSelect]);

  // 格式化X轴标签
  const formatXAxis = (tickItem) => {
    return `${tickItem}岁`;
  };

  // 根据分数获取颜色
  const getScoreColor = (score) => {
    if (score >= 70) return '#10b981'; // 绿色 - 吉
    if (score >= 50) return '#f59e0b'; // 橙色 - 平
    return '#ef4444'; // 红色 - 凶
  };

  // 初始化时选中当前年龄
  useMemo(() => {
    if (currentAge !== null && chartData && onYearSelect) {
      const currentData = chartData.find((d) => d.age === currentAge);
      if (currentData) {
        onYearSelect(currentData);
      }
    }
  }, [currentAge, chartData, onYearSelect]);

  if (!chartData || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">暂无数据</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
        >
          <defs>
            {/* 渐变填充定义 */}
            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity={0.8} />
              <stop offset="50%" stopColor="#fb923c" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#fed7aa" stopOpacity={0.2} />
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          
          <XAxis
            dataKey="age"
            type="number"
            scale="linear"
            domain={[0, 100]}
            tickFormatter={formatXAxis}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            ticks={[0, 20, 40, 60, 80, 100]}
          />
          
          <YAxis
            hide={true}
            domain={['dataMin - 10', 'dataMax + 10']}
          />
          
          <Tooltip
            content={<></>}
            cursor={false}
          />
          
          {/* 鼠标悬停时的参考线 */}
          {hoveredX !== null && (
            <ReferenceLine
              x={hoveredData?.age}
              stroke="#3b82f6"
              strokeWidth={2}
              strokeDasharray="5 5"
            />
          )}
          
          {/* 当前年龄参考线 */}
          {currentAge !== null && (
            <ReferenceLine
              x={currentAge}
              stroke="#3b82f6"
              strokeWidth={2}
              strokeDasharray="5 5"
            />
          )}
          
          {/* 面积图 */}
          <Area
            type="monotone"
            dataKey="score"
            stroke="#f97316"
            strokeWidth={2}
            fill="url(#colorScore)"
            dot={false}
            activeDot={{ r: 6, fill: '#3b82f6' }}
          />
          
          {/* 峰值标注点 */}
          <Area
            type="monotone"
            dataKey="score"
            stroke="none"
            fill="none"
            dot={<PeakDot />}
            activeDot={false}
          />
          
          {/* 谷值标注点 */}
          <Area
            type="monotone"
            dataKey="score"
            stroke="none"
            fill="none"
            dot={<ValleyDot />}
            activeDot={false}
          />
          
          {/* 当前年龄标注 */}
          <Area
            type="monotone"
            dataKey="score"
            stroke="none"
            fill="none"
            dot={<CurrentAgeDot />}
            activeDot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
      
      {/* 图例 */}
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-sm text-gray-600">吉</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-400"></div>
          <span className="text-sm text-gray-600">平</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-sm text-gray-600">凶</span>
        </div>
      </div>
    </div>
  );
}
