import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Eye, BookOpen } from 'lucide-react';
import { getMyFortuneBooks, deleteFortuneBook } from '../utils/api';

/**
 * 命书列表组件（可复用）
 * 支持预览、删除和查看功能
 */
export default function FortuneBooksList({ onBookSelect, showPreview = true }) {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null); // 展开预览的命书ID

  // 加载命书列表
  const loadBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const booksData = await getMyFortuneBooks();
      setBooks(booksData);
    } catch (err) {
      console.error('加载命书列表失败:', err);
      setError(err.message || '加载命书列表失败');
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  // 删除命书
  const handleDelete = async (bookId, bookName, e) => {
    e.stopPropagation(); // 阻止事件冒泡
    
    if (!window.confirm(`确定要删除命书"${bookName}"吗？此操作不可恢复。`)) {
      return;
    }

    try {
      setDeletingId(bookId);
      await deleteFortuneBook(bookId);
      // 删除成功后重新加载列表
      await loadBooks();
      // 如果删除的是当前展开的，关闭展开
      if (expandedId === bookId) {
        setExpandedId(null);
      }
    } catch (err) {
      alert(`删除失败：${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  // 查看详情（跳转到报告页面）
  const handleView = (bookId, e) => {
    e.stopPropagation(); // 阻止事件冒泡
    navigate(`/result/${bookId}`);
  };

  // 切换预览展开/收起
  const togglePreview = (bookId, e) => {
    e.stopPropagation();
    setExpandedId(expandedId === bookId ? null : bookId);
  };

  // 选择命书（用于填充表单）
  const handleSelect = (book) => {
    if (onBookSelect) {
      onBookSelect(book);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2"></div>
          <p className="text-gray-600 text-sm">加载命书列表...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600 text-sm">{error}</p>
        <button
          onClick={loadBooks}
          className="mt-2 text-sm text-red-600 underline hover:text-red-800"
        >
          重试
        </button>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
        <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 mb-2">还没有保存的命书</p>
        <p className="text-gray-500 text-sm">创建新命书后，会显示在这里</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {books.map((book) => (
        <div
          key={book.id}
          className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all"
        >
          {/* 命书卡片头部 */}
          <div
            className="p-4 cursor-pointer"
            onClick={() => handleSelect(book)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                  {book.name || book.book_name || '未命名命书'}
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <span className="font-medium">姓名：</span>
                    {book.person_name || '未填写'}
                  </p>
                  {book.birth_details && (
                    <p>
                      <span className="font-medium">出生：</span>
                      {book.birth_details}
                    </p>
                  )}
                  {book.birth_date && !book.birth_details && (
                    <p>
                      <span className="font-medium">出生日期：</span>
                      {book.birth_date} {book.birth_time || ''}
                    </p>
                  )}
                </div>
              </div>
              
              {/* 操作按钮 */}
              <div className="flex gap-2 ml-4 flex-shrink-0">
                {showPreview && (
                  <button
                    onClick={(e) => togglePreview(book.id, e)}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    title="预览"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={(e) => handleView(book.id, e)}
                  className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  查看报告
                </button>
                <button
                  onClick={(e) => handleDelete(book.id, book.name || book.book_name, e)}
                  disabled={deletingId === book.id}
                  className={`p-2 rounded-lg transition-colors ${
                    deletingId === book.id
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                  }`}
                  title="删除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* 预览区域（展开时显示） */}
          {showPreview && expandedId === book.id && (
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="text-sm text-gray-700 space-y-2">
                <p>
                  <span className="font-medium">命书ID：</span>
                  {book.id}
                </p>
                {book.city && (
                  <p>
                    <span className="font-medium">出生地点：</span>
                    {book.city}
                  </p>
                )}
                {book.created_at && (
                  <p>
                    <span className="font-medium">创建时间：</span>
                    {new Date(book.created_at).toLocaleString('zh-CN')}
                  </p>
                )}
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={(e) => handleView(book.id, e)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  查看完整报告
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
