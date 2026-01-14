import { useNavigate } from 'react-router-dom';
import ChatFloatingButton from '../components/ChatFloatingButton';

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-12 text-gray-900">
          Welcome to Compass AI
        </h1>
        
        <button
          onClick={() => navigate('/create')}
          className="bg-black text-white px-12 py-5 rounded-lg text-xl font-medium hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          创建八字命理
        </button>
      </div>

      {/* 悬浮聊天按钮 */}
      <ChatFloatingButton />
    </div>
  );
}
