import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash, Eye, Plus, Crown, Star } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import {adminServicePackageService}  from '../../services/admin.service';

const ServiceManagement = () => {
    const { user } = useAuth();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedService, setSelectedService] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('view'); // view, edit, delete, add
    const [filterStatus, setFilterStatus] = useState('all');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (user?.role !== 'admin') {
            window.location.href = '/';
            return;
        }
        loadServices();
    }, [user]);

    const loadServices = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await adminServicePackageService.getAllPackagesWithSubscribers();
            setServices(response.data || []);
        } catch (error) {
            console.error('Error loading services:', error);
            setError('Không thể tải danh sách gói dịch vụ. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const filteredServices = services.filter(service => {
        const matchesSearch = (service.name || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || service.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const handleViewService = (service) => {
        setSelectedService(service);
        setModalType('view');
        setShowModal(true);
    };

    const handleEditService = (service) => {
        setSelectedService(service);
        setModalType('edit');
        setShowModal(true);
    };

    const handleDeleteService = (service) => {
        setSelectedService(service);
        setModalType('delete');
        setShowModal(true);
    };

    const handleAddService = () => {
        setSelectedService({
            name: '',
            description: '',
            price: 0,
            duration_days: 30,
            status: 'active'
        });
        setModalType('add');
        setShowModal(true);
    };

    const handleSaveService = async (serviceData) => {
        try {
            setProcessing(true);

            if (modalType === 'add') {
                await adminServicePackageService.createPackage(serviceData);
            } else {
                await adminServicePackageService.updatePackage(selectedService.package_id, serviceData);
            }

            setShowModal(false);
            loadServices();
        } catch (error) {
            console.error('Error saving service:', error);
            alert('Có lỗi xảy ra khi lưu gói dịch vụ: ' + error.message);
        } finally {
            setProcessing(false);
        }
    };

    const handleDeleteConfirm = async () => {
        try {
            setProcessing(true);
            await adminServicePackageService.deletePackage(selectedService.package_id);
            setShowModal(false);
            loadServices();
        } catch (error) {
            console.error('Error deleting service:', error);
            alert('Có lỗi xảy ra khi xóa gói dịch vụ: ' + error.message);
        } finally {
            setProcessing(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const getStatusBadge = (status) => {
        const colors = {
            active: 'bg-green-100 text-green-800',
            inactive: 'bg-red-100 text-red-800'
        };
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
                {status}
            </span>
        );
    };

    const getPriceBadge = (price) => {
        if (price >= 200000) {
            return <Crown className="h-4 w-4 text-yellow-500" />;
        } else if (price >= 100000) {
            return <Star className="h-4 w-4 text-blue-500" />;
        }
        return null;
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
                        onClick={loadServices}
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
                    <h1 className="text-3xl font-bold text-gray-900">Quản lý gói dịch vụ</h1>
                    <p className="mt-2 text-gray-600">Quản lý tất cả gói dịch vụ trong hệ thống</p>
                </div>

                {/* Search and Actions */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm gói dịch vụ..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">Tất cả trạng thái</option>
                                <option value="active">Đang hoạt động</option>
                                <option value="inactive">Không hoạt động</option>
                            </select>
                            <button
                                onClick={handleAddService}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Thêm gói dịch vụ
                            </button>
                        </div>
                    </div>
                </div>

                {/* Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredServices.map((service) => (
                        <div key={service.package_id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center space-x-2">
                                        {getPriceBadge(service.price)}
                                        <h3 className="text-lg font-medium text-gray-900">{service.name || 'Không tên'}</h3>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleViewService(service)}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleEditService(service)}
                                            className="text-green-600 hover:text-green-900"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteService(service)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <Trash className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                <p className="text-sm text-gray-600 mb-4">{service.description || 'Không có mô tả'}</p>

                                <div className="flex items-center justify-between mb-4">
                                    <div className="text-2xl font-bold text-gray-900">
                                        {formatCurrency(service.price || 0)}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {service.duration_days || 30} ngày
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Tính năng:</h4>
                                    <ul className="text-sm text-gray-600 space-y-1">
                                        {(() => {
                                            // Mock features nếu không có từ backend
                                            const features = service.features || [
                                                'Truy cập tất cả bài học',
                                                'Bài tập không giới hạn',
                                                'Hỗ trợ 24/7'
                                            ];
                                            return features.slice(0, 3).map((feature, index) => (
                                                <li key={index} className="flex items-center">
                                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                                                    {feature}
                                                </li>
                                            ));
                                        })()}
                                        {service.features && service.features.length > 3 && (
                                            <li className="text-blue-600 text-xs">
                                                +{service.features.length - 3} tính năng khác
                                            </li>
                                        )}
                                    </ul>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        {getStatusBadge(service.status || 'active')}
                                        <span className="text-sm text-gray-500">
                                            {service.subscribers_count || 0} người đăng ký
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Tạo: {service.created_at ? new Date(service.created_at).toLocaleDateString() : 'N/A'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Modal */}
                {showModal && selectedService && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                            <div className="mt-3">
                                {modalType === 'view' && (
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Chi tiết gói dịch vụ</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">Tên gói:</label>
                                                <p className="text-sm text-gray-900">{selectedService.name || 'Không tên'}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">Mô tả:</label>
                                                <p className="text-sm text-gray-900">{selectedService.description || 'Không có mô tả'}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">Giá:</label>
                                                <p className="text-sm font-medium text-gray-900">{formatCurrency(selectedService.price || 0)}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">Thời hạn:</label>
                                                <p className="text-sm text-gray-900">{selectedService.duration_days || 30} ngày</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">Trạng thái:</label>
                                                <div className="mt-1">{getStatusBadge(selectedService.status || 'active')}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {(modalType === 'edit' || modalType === 'add') && (
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                                            {modalType === 'add' ? 'Thêm gói dịch vụ mới' : 'Chỉnh sửa gói dịch vụ'}
                                        </h3>
                                        <form onSubmit={(e) => {
                                            e.preventDefault();
                                            handleSaveService(selectedService);
                                        }}>
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-700">Tên gói:</label>
                                                    <input
                                                        type="text"
                                                        value={selectedService.name || ''}
                                                        onChange={(e) => setSelectedService({ ...selectedService, name: e.target.value })}
                                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-700">Mô tả:</label>
                                                    <textarea
                                                        value={selectedService.description || ''}
                                                        onChange={(e) => setSelectedService({ ...selectedService, description: e.target.value })}
                                                        rows={3}
                                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-700">Giá (VND):</label>
                                                    <input
                                                        type="number"
                                                        value={selectedService.price || 0}
                                                        onChange={(e) => setSelectedService({ ...selectedService, price: parseInt(e.target.value) })}
                                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        min="0"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-700">Thời hạn (ngày):</label>
                                                    <input
                                                        type="number"
                                                        value={selectedService.duration_days || 30}
                                                        onChange={(e) => setSelectedService({ ...selectedService, duration_days: parseInt(e.target.value) })}
                                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        min="1"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-700">Trạng thái:</label>
                                                    <select
                                                        value={selectedService.status || 'active'}
                                                        onChange={(e) => setSelectedService({ ...selectedService, status: e.target.value })}
                                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    >
                                                        <option value="active">Đang hoạt động</option>
                                                        <option value="inactive">Không hoạt động</option>
                                                    </select>
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
                                                    {processing ? 'Đang lưu...' : (modalType === 'add' ? 'Thêm' : 'Lưu')}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {modalType === 'delete' && (
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Xác nhận xóa</h3>
                                        <p className="text-sm text-gray-600 mb-4">
                                            Bạn có chắc chắn muốn xóa gói dịch vụ "{selectedService.name || 'Không tên'}"? Hành động này không thể hoàn tác.
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

export default ServiceManagement; 