import React, { useState, useEffect } from 'react';
import { Search, Eye, Download, Filter, DollarSign, CreditCard } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import  {adminTransactionService}  from '../../services/admin.service';

const TransactionManagement = () => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterMethod, setFilterMethod] = useState('all');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalTransactions: 0,
        totalCount: 0
    });

    useEffect(() => {
        if (user?.role !== 'admin') {
            window.location.href = '/';
            return;
        }
        loadTransactions();
        loadStats();
    }, [user]);

    const loadTransactions = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = {};
            if (filterStatus !== 'all') params.status = filterStatus;
            if (filterMethod !== 'all') params.payment_method = filterMethod;
            if (dateRange.start) params.start_date = dateRange.start;
            if (dateRange.end) params.end_date = dateRange.end;
            if (searchTerm) params.search = searchTerm;

            const response = await adminTransactionService.getAllPayments(params);
            setTransactions(response.data || []);
        } catch (error) {
            console.error('Error loading transactions:', error);
            setError('Không thể tải danh sách giao dịch. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const response = await adminTransactionService.getPaymentStats();
            setStats({
                totalRevenue: response.data?.totalRevenue || 0,
                totalTransactions: response.data?.totalTransactions || 0,
                totalCount: response.data?.totalCount || 0
            });
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    const handleViewTransaction = (transaction) => {
        setSelectedTransaction(transaction);
        setShowModal(true);
    };

    const handleExportTransactions = async () => {
        try {
            const params = {};
            if (filterStatus !== 'all') params.status = filterStatus;
            if (filterMethod !== 'all') params.payment_method = filterMethod;
            if (dateRange.start) params.start_date = dateRange.start;
            if (dateRange.end) params.end_date = dateRange.end;

            const blob = await adminTransactionService.exportPayments(params);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `transactions_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error exporting transactions:', error);
            alert('Có lỗi xảy ra khi xuất dữ liệu: ' + error.message);
        }
    };

    const getStatusBadge = (status) => {
        const colors = {
            completed: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            failed: 'bg-red-100 text-red-800',
            cancelled: 'bg-gray-100 text-gray-800'
        };
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
                {status}
            </span>
        );
    };

    const getMethodBadge = (method) => {
        const colors = {
            momo: 'bg-pink-100 text-pink-800',
            credit_card: 'bg-blue-100 text-blue-800',
            bank_transfer: 'bg-green-100 text-green-800'
        };
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[method] || 'bg-gray-100 text-gray-800'}`}>
                {method}
            </span>
        );
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
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
                        onClick={loadTransactions}
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
                    <h1 className="text-3xl font-bold text-gray-900">Quản lý giao dịch</h1>
                    <p className="mt-2 text-gray-600">Quản lý tất cả giao dịch thanh toán trong hệ thống</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-green-100 rounded-full">
                                <DollarSign className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Tổng doanh thu</p>
                                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-blue-100 rounded-full">
                                <CreditCard className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Giao dịch thành công</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalTransactions}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-yellow-100 rounded-full">
                                <Filter className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Tổng giao dịch</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalCount}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm giao dịch..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="completed">Hoàn thành</option>
                            <option value="pending">Đang xử lý</option>
                            <option value="failed">Thất bại</option>
                            <option value="cancelled">Đã hủy</option>
                        </select>
                        <select
                            value={filterMethod}
                            onChange={(e) => setFilterMethod(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">Tất cả phương thức</option>
                            <option value="momo">MoMo</option>
                            <option value="credit_card">Thẻ tín dụng</option>
                            <option value="bank_transfer">Chuyển khoản</option>
                        </select>
                        <button
                            onClick={handleExportTransactions}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Xuất Excel
                        </button>
                    </div>

                    {/* Date Range Filter */}
                    <div className="mt-4 flex gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700">Từ ngày:</label>
                            <input
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Đến ngày:</label>
                            <input
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={loadTransactions}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                            >
                                Lọc
                            </button>
                        </div>
                    </div>
                </div>

                {/* Transactions Table */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Mã giao dịch
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Người dùng
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Gói dịch vụ
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Số tiền
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Phương thức
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
                                {transactions.map((transaction) => (
                                    <tr key={transaction.payment_id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {transaction.transaction_code || transaction.payment_id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {transaction.user?.full_name || transaction.user?.username}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {transaction.user?.email}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {transaction.package?.name || transaction.service_package?.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {formatCurrency(transaction.amount)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getMethodBadge(transaction.payment_method)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(transaction.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {transaction.created_at ? new Date(transaction.created_at).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleViewTransaction(transaction)}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal */}
                {showModal && selectedTransaction && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                            <div className="mt-3">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Chi tiết giao dịch</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Mã giao dịch:</label>
                                        <p className="text-sm text-gray-900">{selectedTransaction.transaction_code || selectedTransaction.payment_id}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Người dùng:</label>
                                        <p className="text-sm text-gray-900">{selectedTransaction.user?.full_name || selectedTransaction.user?.username}</p>
                                        <p className="text-sm text-gray-500">{selectedTransaction.user?.email}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Gói dịch vụ:</label>
                                        <p className="text-sm text-gray-900">{selectedTransaction.package?.name || selectedTransaction.service_package?.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Số tiền:</label>
                                        <p className="text-sm font-medium text-gray-900">{formatCurrency(selectedTransaction.amount)}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Phương thức thanh toán:</label>
                                        <div className="mt-1">{getMethodBadge(selectedTransaction.payment_method)}</div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Trạng thái:</label>
                                        <div className="mt-1">{getStatusBadge(selectedTransaction.status)}</div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Ngày tạo:</label>
                                        <p className="text-sm text-gray-900">
                                            {selectedTransaction.created_at ? new Date(selectedTransaction.created_at).toLocaleString() : 'N/A'}
                                        </p>
                                    </div>
                                    {selectedTransaction.paid_at && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Ngày hoàn thành:</label>
                                            <p className="text-sm text-gray-900">
                                                {new Date(selectedTransaction.paid_at).toLocaleString()}
                                            </p>
                                        </div>
                                    )}
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
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransactionManagement; 