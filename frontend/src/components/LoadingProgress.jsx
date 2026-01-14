import { useState, useEffect } from 'react';

/**
 * 加载进度组件
 * 显示文字轮播效果，模拟处理进度
 */
export default function LoadingProgress() {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const steps = [
    '正在排盘...',
    '正在推演大运流年...',
    '正在计算五行生克...',
    '正在生成可视化图表...',
  ];

  useEffect(() => {
    // 文字轮播：每2秒切换一次
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 2000);

    // 进度条：模拟0-100%的进度
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          return 95; // 保持在95%，等待真实数据
        }
        return prev + Math.random() * 3; // 随机增长
      });
    }, 300);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md px-6">
        {/* 进度条 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {steps[currentStep]}
            </span>
            <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            >
              <div className="h-full w-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* 步骤指示器 */}
        <div className="flex justify-center gap-2">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full transition-all duration-500 ${
                index === currentStep
                  ? 'bg-blue-600 w-8'
                  : index < currentStep
                  ? 'bg-blue-400'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* 提示文字 */}
        <p className="text-center text-sm text-gray-500 mt-6">
          正在为您生成专属的人生K线图，请稍候...
        </p>
      </div>
    </div>
  );
}
