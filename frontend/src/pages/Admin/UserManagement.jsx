import React, { useState, useEffect } from 'react';
import { Search, Eye, UserPlus, Lock, Unlock, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { adminUserService } from '../../services/admin.service';

const UserManagement = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('view'); // view, lock, unlock
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (user?.role !== 'admin') {
            window.location.href = '/';
            return;
        }
        loadUsers();
    }, [user]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await adminUserService.getAllUsers();
            setUsers(response.data || []);
        } catch (error) {
            console.error('Error loading users:', error);
            setError('Không thể tải danh sách người dùng. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleViewUser = (user) => {
        setSelectedUser(user);
        setModalType('view');
        setShowModal(true);
    };

    const handleLockUser = (user) => {
        setSelectedUser(user);
        setModalType('lock');
        setShowModal(true);
    };

    const handleUnlockUser = (user) => {
        setSelectedUser(user);
        setModalType('unlock');
        setShowModal(true);
    };

    const handleLockConfirm = async () => {
        try {
            setProcessing(true);
            await adminUserService.lockUser(selectedUser.user_id);
            setShowModal(false);
            loadUsers(); // Reload users
        } catch (error) {
            console.error('Error locking user:', error);
            alert('Có lỗi xảy ra khi khóa tài khoản: ' + error.message);
        } finally {
            setProcessing(false);
        }
    };

    const handleUnlockConfirm = async () => {
        try {
            setProcessing(true);
            await adminUserService.unlockUser(selectedUser.user_id);
            setShowModal(false);
            loadUsers(); // Reload users
        } catch (error) {
            console.error('Error unlocking user:', error);
            alert('Có lỗi xảy ra khi mở khóa tài khoản: ' + error.message);
        } finally {
            setProcessing(false);
        }
    };

    const getRoleBadge = (role) => {
        const colors = {
            admin: 'bg-red-100 text-red-800',
            student: 'bg-green-100 text-green-800'
        };
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[role] || 'bg-gray-100 text-gray-800'}`}>
                {role}
            </span>
        );
    };

    const getStatusBadge = (isLocked) => {
        if (isLocked) {
            return (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                    Đã khóa
                </span>
            );
        }
        return (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                Hoạt động
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
                        onClick={loadUsers}
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
                    <h1 className="text-3xl font-bold text-gray-900">Quản lý người dùng</h1>
                    <p className="mt-2 text-gray-600">Quản lý tất cả người dùng trong hệ thống</p>
                </div>

                {/* Search and Actions */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm người dùng..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
                            <UserPlus className="mr-2 h-4 w-4" />
                            Thêm người dùng
                        </button>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Người dùng
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Vai trò
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Trạng thái
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ngày tạo
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredUsers.map((user) => (
                                    <tr key={user.user_id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                        <span className="text-sm font-medium text-blue-600">
                                                            {user.full_name?.charAt(0) || user.username?.charAt(0)?.toUpperCase() || 'U'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{user.full_name || user.username}</div>
                                                    <div className="text-sm text-gray-500">@{user.username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {user.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getRoleBadge(user.role)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(user.is_locked)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleViewUser(user)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="Xem chi tiết"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                {user.is_locked ? (
                                                    <button
                                                        onClick={() => handleUnlockUser(user)}
                                                        className="text-green-600 hover:text-green-900"
                                                        title="Mở khóa tài khoản"
                                                    >
                                                        <Unlock className="h-4 w-4" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleLockUser(user)}
                                                        className="text-red-600 hover:text-red-900"
                                                        title="Khóa tài khoản"
                                                    >
                                                        <Lock className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal */}
                {showModal && selectedUser && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                            <div className="mt-3">
                                {modalType === 'view' && (
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin người dùng</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">Tên đầy đủ:</label>
                                                <p className="text-sm text-gray-900">{selectedUser.full_name || 'Chưa cập nhật'}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">Username:</label>
                                                <p className="text-sm text-gray-900">{selectedUser.username}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">Email:</label>
                                                <p className="text-sm text-gray-900">{selectedUser.email}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">Vai trò:</label>
                                                <div className="mt-1">{getRoleBadge(selectedUser.role)}</div>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">Trạng thái:</label>
                                                <div className="mt-1">{getStatusBadge(selectedUser.is_locked)}</div>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">Ngày tạo:</label>
                                                <p className="text-sm text-gray-900">
                                                    {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleString() : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex justify-end mt-6">
                                            <button
                                                onClick={() => setShowModal(false)}
                                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                            >
                                                Đóng
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {modalType === 'lock' && (
                                    <div>
                                        <div className="flex items-center mb-4">
                                            <AlertTriangle className="w-6 h-6 text-yellow-600 mr-2" />
                                            <h3 className="text-lg font-medium text-gray-900">Khóa tài khoản</h3>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-4">
                                            Bạn có chắc chắn muốn khóa tài khoản của "{selectedUser.username}"?
                                            Người dùng sẽ không thể đăng nhập cho đến khi tài khoản được mở khóa.
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
                                                onClick={handleLockConfirm}
                                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                                                disabled={processing}
                                            >
                                                {processing ? 'Đang khóa...' : 'Khóa tài khoản'}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {modalType === 'unlock' && (
                                    <div>
                                        <div className="flex items-center mb-4">
                                            <Unlock className="w-6 h-6 text-green-600 mr-2" />
                                            <h3 className="text-lg font-medium text-gray-900">Mở khóa tài khoản</h3>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-4">
                                            Bạn có chắc chắn muốn mở khóa tài khoản của "{selectedUser.username}"?
                                            Người dùng sẽ có thể đăng nhập lại bình thường.
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
                                                onClick={handleUnlockConfirm}
                                                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                                                disabled={processing}
                                            >
                                                {processing ? 'Đang mở khóa...' : 'Mở khóa tài khoản'}
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

export default UserManagement; 