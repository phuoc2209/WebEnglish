// CommunityFeed.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageCircle,
  Heart,
  MessageSquare,
  Filter,
  ChevronRight,
} from 'lucide-react';
import { getAllPosts, togglePostLike } from '../../models/community.model';
import { useUserStore } from '../../store/userSlice';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoadingSpinner from '../../components/LoadingSpinner';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const POSTS_PER_PAGE = 10;

const CommunityFeed = () => {
  const { user } = useUserStore();
  const [selectedSort, setSelectedSort] = useState('recent');
  const [posts, setPosts] = useState([]);
  const [postReactions, setPostReactions] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchPosts = async (currentPage) => {
    setLoading(true);
    try {
      const response = await getAllPosts(currentPage, POSTS_PER_PAGE);
      const data = response.data || [];
      setPosts(data);
      setPostReactions(
        data.reduce((acc, post) => ({
          ...acc,
          [post.post_id]: post.user_reaction,
        }), {})
      );
      setTotalPages(response.pagination?.totalPages || 1);
      setError(null);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(page);
  }, [page]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  };

  const handleReaction = async (postId) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để thực hiện hành động này');
      return;
    }
    setLoading(true);
    try {
      const currentReaction = postReactions[postId];
      const newReaction = currentReaction === 'heart' ? null : 'heart';
      await togglePostLike(postId, user.user_id);
      setPostReactions((prev) => ({ ...prev, [postId]: newReaction }));
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.post_id === postId
            ? {
              ...post,
              hearts: newReaction === 'heart' ? post.hearts + 1 : post.hearts - 1,
              user_reaction: newReaction,
            }
            : post
        )
      );
      setError(null);
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
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <MessageCircle className="w-8 h-8" />
              <h1 className="text-2xl font-bold">Diễn đàn Cộng đồng</h1>
            </div>
            <button
              onClick={() => navigate('/community/create')}
              className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50"
              disabled={!user}
            >
              Tạo bài đăng
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <select
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
            >
              <option value="recent">Mới nhất</option>
              <option value="popular">Phổ biến</option>
            </select>
          </div>
        </div>

        {loading && <LoadingSpinner />}
        {error && <p className="text-red-500 text-center">{error}</p>}

        <div className="space-y-6">
          {Array.isArray(posts) && posts.length > 0 ? (
            posts.map((post) => {
              const user = post.user?.[0];
              return (
                <div key={post.post_id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center mb-4">
                    <img
                      src={user?.avatar_url }
                      alt="Avatar"
                      className="w-10 h-10 rounded-full object-cover mr-3"
                      onError={(e) => (e.target.src = 'https://via.placeholder.com/40')}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {user ? `${user.full_name}` : post.user.username || 'Ẩn danh'}
                      </p>
                      <p className="text-xs text-gray-500">
                        @{post.user.username || 'unknown'} • {formatDate(post.created_at)}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-800 mb-4 line-clamp-3">{post.content}</p>
                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <button
                      onClick={() => handleReaction(post.post_id)}
                      className={`flex items-center mr-4 ${postReactions[post.post_id] === 'heart' ? 'text-red-600' : 'text-gray-600'
                        }`}
                      disabled={loading}
                    >
                      <Heart
                        className={`w-4 h-4 mr-1 ${postReactions[post.post_id] === 'heart' ? 'fill-current' : ''
                          }`}
                      />
                      {post.hearts || 0}
                    </button>
                    <MessageSquare className="w-4 h-4 mr-1" /> {post.comments_count || 0}
                  </div>
                  <button
                    onClick={() =>
                      navigate(`/community/${post.post_id}`, {
                        state: { user_reaction: postReactions[post.post_id] },
                      })
                    }
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                  >
                    Xem chi tiết <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              );
            })
          ) : (
            !loading && (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900">Chưa có bài đăng nào</h3>
                <p className="text-gray-600">Hãy tạo bài đăng đầu tiên!</p>
              </div>
            )
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center space-x-2">
            {Array.from({ length: totalPages }, (_, idx) => (
              <button
                key={idx}
                onClick={() => setPage(idx + 1)}
                className={`px-3 py-2 rounded-lg ${page === idx + 1
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default CommunityFeed;
