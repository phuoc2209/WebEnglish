import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Heart, MessageSquare, Flag, Send, ArrowLeft, Edit, Trash } from 'lucide-react';
import {
  getPostById,
  createComment,
  updateComment,
  deleteComment,
  togglePostLike,
  reportPost
} from '../../models/community.model';
import { useUserStore } from '../../store/userSlice';
import { toast, ToastContainer } from 'react-toastify';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import 'react-toastify/dist/ReactToastify.css';

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { user } = useUserStore();
  const [post, setPost] = useState(null);
  const [comment, setComment] = useState('');
  const [reaction, setReaction] = useState(state?.user_reaction || null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const response = await getPostById(postId);
        setPost(response.data);
        setReaction(response.data.user_reaction);
        setError(null);
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [postId]);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleString('vi-VN', {
      dateStyle: 'short',
      timeStyle: 'short',
    });

  const handleReaction = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để thực hiện hành động này');
      return;
    }
    setLoading(true);
    try {
      const newReaction = reaction === 'heart' ? null : 'heart';
      await togglePostLike(postId, user.user_id);
      setReaction(newReaction);
      setPost((prev) => ({
        ...prev,
        hearts: newReaction === 'heart' ? prev.hearts + 1 : prev.hearts - 1,
        user_reaction: newReaction,
      }));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Vui lòng đăng nhập để bình luận');
    if (!comment.trim()) return toast.error('Bình luận không được để trống');
    setLoading(true);
    try {
      const response = await createComment(postId, { content: comment.trim() });
      setPost((prev) => ({
        ...prev,
        comments: [
          ...prev.comments,
          {
            ...response.data,
            user: {
              user_id: user.user_id,
              username: user.username,
              profiles: user.profile ? [user.profile] : [],
            },
          },
        ],
      }));
      setComment('');
      toast.success('Đã thêm bình luận');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReport = async () => {
    if (!user) return toast.error('Vui lòng đăng nhập để báo cáo');
    const reason = prompt('Lý do báo cáo bài đăng:');
    if (reason && reason.trim()) {
      setLoading(true);
      try {
        await reportPost(postId, { reason: reason.trim() });
        toast.success('Đã gửi báo cáo. Cảm ơn bạn!');
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    } else {
      toast.error('Lý do báo cáo không được để trống');
    }
  };

  const startEditComment = (comment) => {
    setEditingCommentId(comment.comment_id);
    setEditingContent(comment.content);
  };

  const cancelEdit = () => {
    setEditingCommentId(null);
    setEditingContent('');
  };

  const saveEditedComment = async () => {
    if (!editingContent.trim()) {
      toast.error('Nội dung không được để trống');
      return;
    }
    setLoading(true);
    try {
      await updateComment(editingCommentId, { content: editingContent.trim() });
      setPost((prev) => ({
        ...prev,
        comments: prev.comments.map((c) =>
          c.comment_id === editingCommentId ? { ...c, content: editingContent } : c
        ),
      }));
      toast.success('Đã cập nhật bình luận');
      cancelEdit();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    const confirm = window.confirm('Bạn có chắc muốn xóa bình luận này?');
    if (!confirm) return;
    setLoading(true);
    try {
      await deleteComment(commentId);
      setPost((prev) => ({
        ...prev,
        comments: prev.comments.filter((c) => c.comment_id !== commentId),
      }));
      toast.success('Đã xóa bình luận');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !post) return <p className="text-center">Đang tải...</p>;
  if (error && !post) return <p className="text-red-500 text-center">{error}</p>;

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
            <h1 className="text-2xl font-bold">Chi tiết Bài đăng</h1>
            <div className="w-10"></div>
          </div>
        </div>

        {post && (
          <>
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex items-center mb-4">
                <img
                  src={post.user?.profiles?.[0]?.avatar_url || 'https://via.placeholder.com/48'}
                  alt="Avatar"
                  className="w-12 h-12 rounded-full object-cover mr-3"
                  onError={(e) => (e.target.src = 'https://via.placeholder.com/48')}
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {post.user?.profiles?.[0]?.full_name || post.user?.username || 'Ẩn danh'}
                  </p>
                  <p className="text-xs text-gray-500">
                    @{post.user?.username || 'unknown'} • {formatDate(post.created_at)}
                  </p>
                </div>
              </div>
              <p className="text-gray-800 mb-4">{post.content}</p>
              <div className="flex items-center text-sm text-gray-600 mb-4">
                <button
                  onClick={handleReaction}
                  className={`flex items-center mr-4 ${reaction === 'heart' ? 'text-red-600' : 'text-gray-600'}`}
                  disabled={loading}
                >
                  <Heart
                    className={`w-4 h-4 mr-1 ${reaction === 'heart' ? 'fill-current' : ''}`}
                  />
                  {post.hearts || 0}
                </button>
                <MessageSquare className="w-4 h-4 mr-1" /> {post.comments_count || 0}
                {user && (
                  <button
                    onClick={handleReport}
                    className="ml-auto flex items-center text-gray-500 hover:text-red-600"
                    disabled={loading}
                  >
                    <Flag className="w-4 h-4 mr-1" /> Báo cáo
                  </button>
                )}
              </div>
            </div>

            {/* Comments Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Bình luận ({post.comments?.length || 0})</h3>

              {/* Add Comment Form */}
              {user && (
                <form onSubmit={handleCommentSubmit} className="mb-6">
                  <div className="flex items-start space-x-3">
                    <img
                      src={user?.profile?.avatar_url || 'https://via.placeholder.com/32'}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full object-cover"
                      onError={(e) => (e.target.src = 'https://via.placeholder.com/32')}
                    />
                    <div className="flex-1">
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Viết bình luận..."
                        rows="3"
                        disabled={loading}
                      />
                      <button
                        type="submit"
                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        disabled={loading || !comment.trim()}
                      >
                        <Send className="w-4 h-4 inline mr-1" /> Gửi
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Comments List */}
              <div className="space-y-4">
                {post.comments && post.comments.length > 0 ? (
                  post.comments.map((comment) => (
                    <div key={comment.comment_id} className="border-b border-gray-100 pb-4 last:border-b-0">
                      {editingCommentId === comment.comment_id ? (
                        <div className="flex items-start space-x-3">
                          <img
                            src={comment.user?.profiles?.[0]?.avatar_url || 'https://via.placeholder.com/32'}
                            alt="Avatar"
                            className="w-8 h-8 rounded-full object-cover"
                            onError={(e) => (e.target.src = 'https://via.placeholder.com/32')}
                          />
                          <div className="flex-1">
                            <textarea
                              value={editingContent}
                              onChange={(e) => setEditingContent(e.target.value)}
                              className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows="2"
                            />
                            <div className="mt-2 space-x-2">
                              <button
                                onClick={saveEditedComment}
                                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                                disabled={loading}
                              >
                                Lưu
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                                disabled={loading}
                              >
                                Hủy
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start space-x-3">
                          <img
                            src={comment.user?.profiles?.[0]?.avatar_url || 'https://via.placeholder.com/32'}
                            alt="Avatar"
                            className="w-8 h-8 rounded-full object-cover"
                            onError={(e) => (e.target.src = 'https://via.placeholder.com/32')}
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <p className="text-sm font-medium text-gray-900">
                                {comment.user?.profiles?.[0]?.full_name || comment.user?.username || 'Ẩn danh'}
                              </p>
                              <p className="text-xs text-gray-500">{formatDate(comment.created_at)}</p>
                            </div>
                            <p className="text-gray-800 text-sm">{comment.content}</p>
                            {user && (user.user_id === comment.user_id || user.role === 'admin') && (
                              <div className="mt-2 space-x-2">
                                <button
                                  onClick={() => startEditComment(comment)}
                                  className="text-blue-600 hover:text-blue-800 text-xs"
                                  disabled={loading}
                                >
                                  <Edit className="w-3 h-3 inline mr-1" /> Sửa
                                </button>
                                <button
                                  onClick={() => handleDeleteComment(comment.comment_id)}
                                  className="text-red-600 hover:text-red-800 text-xs"
                                  disabled={loading}
                                >
                                  <Trash className="w-3 h-3 inline mr-1" /> Xóa
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">Chưa có bình luận nào</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default PostDetail;
