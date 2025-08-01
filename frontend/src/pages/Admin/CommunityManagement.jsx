import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash, Eye, Flag, Heart, MessageCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import {adminCommunityService} from '../../services/admin.service';

const CommunityManagement = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPost, setSelectedPost] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('view'); // view, edit, delete
    const [activeTab, setActiveTab] = useState('posts'); // posts, reports
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (user?.role !== 'admin') {
            window.location.href = '/';
            return;
        }
        loadData();
    }, [user]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [postsResponse, reportsResponse] = await Promise.all([
                adminCommunityService.getAllPosts(),
                adminCommunityService.getReports()
            ]);

            setPosts(postsResponse.data?.rows || postsResponse.data || []);
            setReports(reportsResponse.data || []);
        } catch (error) {
            console.error('Error loading data:', error);
            setError('Không thể tải dữ liệu cộng đồng. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const filteredPosts = posts.filter(post =>
        post.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.user?.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleViewPost = (post) => {
        setSelectedPost(post);
        setModalType('view');
        setShowModal(true);
    };

    const handleEditPost = (post) => {
        setSelectedPost(post);
        setModalType('edit');
        setShowModal(true);
    };

    const handleDeletePost = (post) => {
        setSelectedPost(post);
        setModalType('delete');
        setShowModal(true);
    };

    const handleSavePost = async (postData) => {
        try {
            setProcessing(true);
            await adminCommunityService.updatePost(selectedPost.post_id, postData);
            setShowModal(false);
            loadData();
        } catch (error) {
            console.error('Error updating post:', error);
            alert('Có lỗi xảy ra khi cập nhật bài viết: ' + error.message);
        } finally {
            setProcessing(false);
        }
    };

    const handleDeleteConfirm = async () => {
        try {
            setProcessing(true);
            await adminCommunityService.deletePost(selectedPost.post_id);
            setShowModal(false);
            loadData();
        } catch (error) {
            console.error('Error deleting post:', error);
            alert('Có lỗi xảy ra khi xóa bài viết: ' + error.message);
        } finally {
            setProcessing(false);
        }
    };

    const handleResolveReport = async (reportId, action) => {
        try {
            setProcessing(true);
            await adminCommunityService.resolveReport(reportId, action);
            loadData();
        } catch (error) {
            console.error('Error resolving report:', error);
            alert('Có lỗi xảy ra khi giải quyết báo cáo: ' + error.message);
        } finally {
            setProcessing(false);
        }
    };

    const getStatusBadge = () => {
        // Since report table doesn't have status column, all reports are considered pending
        return (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                Chờ xử lý
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-600 text-lg mb-4">{error}</div>
                    <button
                        onClick={loadData}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Quản lý cộng đồng</h1>
                    <p className="mt-2 text-gray-600">Quản lý bài viết và báo cáo cộng đồng</p>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow-md mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8 px-6">
                            <button
                                onClick={() => setActiveTab('posts')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'posts'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Bài viết ({posts.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('reports')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'reports'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Báo cáo ({reports.length})
                            </button>
                        </nav>
                    </div>
                </div>

                {activeTab === 'posts' && (
                    <>
                        {/* Search */}
                        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm bài viết..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Posts List */}
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="divide-y divide-gray-200">
                                {filteredPosts.map((post) => (
                                    <div key={post.post_id} className="p-6 hover:bg-gray-50">
                                        <div className="flex items-start space-x-3">
                                            <div className="flex-shrink-0">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                    <span className="text-sm font-medium text-blue-600">
                                                        {post.user?.username?.charAt(0)?.toUpperCase() || 'U'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {post.user?.username}
                                                    </p>
                                                    <span className="text-sm text-gray-500">•</span>
                                                    <p className="text-sm text-gray-500">
                                                        {post.created_at ? new Date(post.created_at).toLocaleDateString() : 'N/A'}
                                                    </p>
                                                </div>
                                                <p className="text-sm text-gray-900 mb-3">{post.content}</p>
                                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                    <div className="flex items-center space-x-1">
                                                        <Heart className="h-4 w-4" />
                                                        <span>{post.hearts || 0}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <MessageCircle className="h-4 w-4" />
                                                        <span>{post.comments_count || 0}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleViewPost(post)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEditPost(post)}
                                                    className="text-green-600 hover:text-green-900"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeletePost(post)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <Trash className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'reports' && (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Bài viết
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Người báo cáo
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Lý do
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Trạng thái
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Ngày báo cáo
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Thao tác
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {reports.map((report) => (
                                        <tr key={report.report_id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 max-w-xs truncate">
                                                    {report.post?.content}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    bởi {report.post?.user?.username}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {report.user?.username}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {report.reason}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(report.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {report.reported_at ? new Date(report.reported_at).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleResolveReport(report.report_id, 'resolve')}
                                                        className="text-green-600 hover:text-green-900"
                                                        disabled={processing}
                                                    >
                                                        Giải quyết
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeletePost(report.post)}
                                                        className="text-red-600 hover:text-red-900"
                                                        disabled={processing}
                                                    >
                                                        <Trash className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Modal */}
                {showModal && selectedPost && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                            <div className="mt-3">
                                {modalType === 'view' && (
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Chi tiết bài viết</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">Tác giả:</label>
                                                <p className="text-sm text-gray-900">{selectedPost.user?.username}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">Nội dung:</label>
                                                <p className="text-sm text-gray-900 mt-1">{selectedPost.content}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">Ngày đăng:</label>
                                                <p className="text-sm text-gray-900">
                                                    {selectedPost.created_at ? new Date(selectedPost.created_at).toLocaleString() : 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">Tương tác:</label>
                                                <div className="flex space-x-4 mt-1 text-sm text-gray-600">
                                                    <span>❤️ {selectedPost.hearts || 0}</span>
                                                    <span>💬 {selectedPost.comments_count || 0}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {modalType === 'edit' && (
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Chỉnh sửa bài viết</h3>
                                        <form onSubmit={(e) => {
                                            e.preventDefault();
                                            handleSavePost(selectedPost);
                                        }}>
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-700">Nội dung:</label>
                                                    <textarea
                                                        value={selectedPost.content}
                                                        onChange={(e) => setSelectedPost({ ...selectedPost, content: e.target.value })}
                                                        rows={4}
                                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex justify-end space-x-3 mt-6">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowModal(false)}
                                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                                    disabled={processing}
                                                >
                                                    Hủy
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                                                    disabled={processing}
                                                >
                                                    {processing ? 'Đang lưu...' : 'Lưu'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {modalType === 'delete' && (
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Xác nhận xóa</h3>
                                        <p className="text-sm text-gray-600 mb-4">
                                            Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác.
                                        </p>
                                        <div className="flex justify-end space-x-3">
                                            <button
                                                onClick={() => setShowModal(false)}
                                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                                disabled={processing}
                                            >
                                                Hủy
                                            </button>
                                            <button
                                                onClick={handleDeleteConfirm}
                                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                                                disabled={processing}
                                            >
                                                {processing ? 'Đang xóa...' : 'Xóa'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommunityManagement; 