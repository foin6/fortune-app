import { useEffect, useRef } from 'react';

/**
 * 流式文本显示组件（打字机效果）
 */
export default function ResultStream({ text, isStreaming }) {
  const textRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (textRef.current) {
      textRef.current.textContent = text;
    }
    // 自动滚动到底部
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [text]);

  return (
    <div
      ref={containerRef}
      className="bg-white rounded-lg shadow-md p-6 max-h-[600px] overflow-y-auto"
    >
      <div className="prose max-w-none">
        <div
          ref={textRef}
          className="text-gray-800 whitespace-pre-wrap leading-relaxed"
        >
          {text}
        </div>
        {isStreaming && (
          <span className="inline-block w-2 h-5 bg-gray-900 ml-1 animate-pulse">
            |
          </span>
        )}
      </div>
    </div>
  );
}
