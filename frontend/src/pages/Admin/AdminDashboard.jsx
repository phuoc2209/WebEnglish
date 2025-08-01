import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, MessageCircle, CreditCard, BookOpen, TrendingUp, Activity } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { useAuth } from '../../hooks/useAuth';
import {adminDashboardService} from '../../services/admin.service';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalPosts: 0,
        totalTransactions: 0,
        totalLessons: 0
    });
    const [userStats, setUserStats] = useState([]);
    const [transactionStats, setTransactionStats] = useState([]);
    const [transactionTimeline, setTransactionTimeline] = useState([]);
    const [lessonStats, setLessonStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user?.role !== 'admin') {
            window.location.href = '/';
            return;
        }
        loadDashboardData();
    }, [user]);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Lấy thống kê tổng quan
            const dashboardResponse = await adminDashboardService.getDashboardStats();
            console.log('📊 Dashboard response:', dashboardResponse);

            if (dashboardResponse.status === 'error') {
                throw new Error(dashboardResponse.message || 'Lỗi khi tải dữ liệu dashboard');
            }
            // Giả lập dữ liệu trả về tương tự như cũ
            const data = dashboardResponse.data || {};

            setStats({
                totalUsers: data.totalUsers || 0,
                totalPosts: data.totalPosts || 0,
                totalTransactions: data.totalTransactions || 0,
                totalLessons: data.totalLessons || 0
            });

            setUserStats(data.userStats || []);
            setTransactionStats(data.transactionStats || []);
            setTransactionTimeline(data.transactionTimeline || []);
            setLessonStats(data.lessonStats || []);

        } catch (error) {
            console.error('Error loading dashboard data:', error);
            setError(`Không thể tải dữ liệu dashboard: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, icon: Icon, color, link }) => (
        <Link to={link} className="block">
            <div className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow ${color}`}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">{title}</p>
                        <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                        <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                </div>
            </div>
        </Link>
    );

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

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
                        onClick={loadDashboardData}
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
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="mt-2 text-gray-600">Quản lý hệ thống học tiếng Anh</p>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Tổng người dùng"
                        value={stats.totalUsers}
                        icon={Users}
                        color="hover:border-blue-500"
                        link="/admin/users"
                    />
                    <StatCard
                        title="Bài viết cộng đồng"
                        value={stats.totalPosts}
                        icon={MessageCircle}
                        color="hover:border-green-500"
                        link="/admin/community"
                    />
                    <StatCard
                        title="Giao dịch"
                        value={stats.totalTransactions}
                        icon={CreditCard}
                        color="hover:border-yellow-500"
                        link="/admin/transactions"
                    />
                    <StatCard
                        title="Bài học"
                        value={stats.totalLessons}
                        icon={BookOpen}
                        color="hover:border-purple-500"
                        link="/admin/lessons"
                    />
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Thao tác nhanh</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Link to="/admin/users" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                            <Users className="h-5 w-5 text-blue-600 mr-3" />
                            <span className="text-sm font-medium">Quản lý người dùng</span>
                        </Link>
                        <Link to="/admin/community" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                            <MessageCircle className="h-5 w-5 text-green-600 mr-3" />
                            <span className="text-sm font-medium">Quản lý cộng đồng</span>
                        </Link>
                        <Link to="/admin/lessons" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                            <BookOpen className="h-5 w-5 text-purple-600 mr-3" />
                            <span className="text-sm font-medium">Quản lý bài học</span>
                        </Link>
                        <Link to="/admin/transactions" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                            <CreditCard className="h-5 w-5 text-yellow-600 mr-3" />
                            <span className="text-sm font-medium">Quản lý giao dịch</span>
                        </Link>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* User Distribution Chart */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <Users className="h-5 w-5 text-blue-600 mr-2" />
                            Phân bố người dùng
                        </h3>
                        {userStats.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={userStats}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ role, count }) => `${role} (${count})`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="count"
                                    >
                                        {userStats.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-64 text-gray-500">
                                <div className="text-center">
                                    <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                    <p>Chưa có dữ liệu người dùng</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Transaction Timeline Chart */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                            Xu hướng giao dịch (7 ngày)
                        </h3>
                        {transactionTimeline.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={transactionTimeline}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(value) => {
                                            const date = new Date(value);
                                            return `${date.getDate()}/${date.getMonth() + 1}`;
                                        }}
                                    />
                                    <YAxis yAxisId="left" />
                                    <YAxis yAxisId="right" orientation="right" />
                                    <Tooltip
                                        formatter={(value, name) => [
                                            name === 'transactions' ? `${value} giao dịch` : `${value.toLocaleString()} VNĐ`,
                                            name === 'transactions' ? 'Số giao dịch' : 'Doanh thu'
                                        ]}
                                        labelFormatter={(value) => {
                                            const date = new Date(value);
                                            return date.toLocaleDateString('vi-VN');
                                        }}
                                    />
                                    <Legend />
                                    <Line
                                        yAxisId="left"
                                        type="monotone"
                                        dataKey="transactions"
                                        stroke="#8884d8"
                                        strokeWidth={2}
                                        dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                                        activeDot={{ r: 6 }}
                                        name="Số giao dịch"
                                    />
                                    <Line
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#82ca9d"
                                        strokeWidth={2}
                                        dot={{ fill: '#82ca9d', strokeWidth: 2, r: 4 }}
                                        activeDot={{ r: 6 }}
                                        name="Doanh thu"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-64 text-gray-500">
                                <div className="text-center">
                                    <TrendingUp className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                    <p>Chưa có dữ liệu giao dịch</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Lesson Distribution Chart */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <BookOpen className="h-5 w-5 text-purple-600 mr-2" />
                        Phân bố bài học
                    </h3>
                    {lessonStats.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={lessonStats}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="type" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="count" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-64 text-gray-500">
                            <div className="text-center">
                                <BookOpen className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                <p>Chưa có dữ liệu bài học</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard; 