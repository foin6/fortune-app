import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyFortuneBooks, deleteFortuneBook } from '../utils/api';

export default function FortuneBooksList() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // 加载命书列表
  const loadBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyFortuneBooks();
      setBooks(data);
    } catch (err) {
      setError(err.message || '加载命书列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  // 删除命书
  const handleDelete = async (bookId, bookName) => {
    if (!window.confirm(`确定要删除命书"${bookName}"吗？此操作不可恢复。`)) {
      return;
    }

    try {
      setDeletingId(bookId);
      await deleteFortuneBook(bookId);
      // 删除成功后重新加载列表
      await loadBooks();
    } catch (err) {
      alert(`删除失败：${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  // 查看详情
  const handleView = (bookId) => {
    navigate(`/result/${bookId}`);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8">
      <div className="max-w-6xl mx-auto">
        {/* 标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">我的命书</h1>
          <p className="text-gray-600">管理您保存的命书记录</p>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* 命书列表 */}
        {books.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-gray-600 mb-4">还没有保存的命书</p>
            <button
              onClick={() => navigate('/create')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              创建新命书
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {books.map((book) => (
              <div
                key={book.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {book.name}
                    </h3>
                    <p className="text-gray-600 mb-1">
                      <span className="font-medium">姓名：</span>
                      {book.person_name}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">出生信息：</span>
                      {book.birth_details}
                    </p>
                  </div>
                  <div className="flex gap-3 ml-4">
                    <button
                      onClick={() => handleView(book.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      查看详情
                    </button>
                    <button
                      onClick={() => handleDelete(book.id, book.name)}
                      disabled={deletingId === book.id}
                      className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                        deletingId === book.id
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-red-600 text-white hover:bg-red-700'
                      }`}
                    >
                      {deletingId === book.id ? '删除中...' : '删除'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
