import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { createPost } from '../../models/community.model';
import { useUserStore } from '../../store/userSlice';
import { toast, ToastContainer } from 'react-toastify';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import 'react-toastify/dist/ReactToastify.css';

const CreatePost = () => {
  const { user } = useUserStore();
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('Vui lòng đăng nhập để tạo bài đăng');
      toast.error('Vui lòng đăng nhập để tạo bài đăng');
      return;
    }
    if (!content.trim()) {
      setError('Nội dung không được để trống');
      toast.error('Nội dung không được để trống');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await createPost({ content: content.trim() });
      setSuccess('Đã tạo bài đăng thành công!');
      toast.success('Đã tạo bài đăng thành công!');
      setTimeout(() => {
        setContent('');
        navigate('/community');
      }, 1500);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      <ToastContainer />
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/community')}
              className="flex items-center p-2 hover:bg-white/20 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5 mr-2" /> Quay lại
            </button>
            <h1 className="text-2xl font-bold">Tạo Bài đăng</h1>
            <div className="w-10" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          {user ? (
            <div className="flex items-center mb-4">
              <img
                src={user?.profile?.avatar_url || 'https://via.placeholder.com/48'}
                alt="Avatar"
                className="w-12 h-12 rounded-full object-cover mr-3"
                onError={(e) => (e.target.src = 'https://via.placeholder.com/48')}
              />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {user?.profile?.full_name || user?.username || 'Ẩn danh'}
                </p>
                <p className="text-xs text-gray-500">@{user?.username || 'unknown'}</p>
              </div>
            </div>
          ) : (
            <p className="text-red-500 mb-4">Vui lòng đăng nhập để tạo bài đăng.</p>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Bạn đang nghĩ gì? Chia sẻ với cộng đồng..."
              rows="6"
              disabled={loading || !user}
            />
            <div className="flex justify-end mt-4">
              <button
                type="submit"
                className={`flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 ${loading ? 'opacity-50' : ''}`}
                disabled={loading || !user}
              >
                <Save className="w-4 h-4 mr-2" /> Đăng bài
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CreatePost;
