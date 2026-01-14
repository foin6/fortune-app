/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    // 五行颜色类名
    'text-emerald-600',
    'text-red-600',
    'text-amber-600',
    'text-slate-600',
    'text-blue-600',
    'bg-emerald-500',
    'bg-red-500',
    'bg-amber-500',
    'bg-slate-400',
    'bg-blue-500',
  ],
}
