import React, { useState, useEffect } from 'react';
import {
    Plus, Edit, Trash, Eye, Search, Upload, Download,
    FileText, CheckCircle, XCircle, AlertCircle, Users,
    BarChart3, Clock, Target
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import  {adminQuizService} from '../../services/admin.service';

const QuizManagement = () => {
    const { user } = useAuth();
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [processing, setProcessing] = useState(false);

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('create'); // create, edit, view, delete
    const [selectedQuiz, setSelectedQuiz] = useState(null);

    // Import states
    const [showImportModal, setShowImportModal] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [importData, setImportData] = useState({
        title: '',
        description: '',
        is_public: false,
        user_id: user?.user_id || 1
    });
    const [validationResult, setValidationResult] = useState(null);
    const [validating, setValidating] = useState(false);

    // Quiz creation states
    const [quizQuestions, setQuizQuestions] = useState({
        easy: 0,
        medium: 0,
        hard: 0
    });

    useEffect(() => {
        if (user?.role !== 'admin') {
            window.location.href = '/';
            return;
        }
        loadQuizzes();
    }, [user]);

    const loadQuizzes = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('🔄 Đang tải danh sách quiz...');
            console.log('👤 User:', user);

            // Kiểm tra authentication
            if (!user) {
                throw new Error('Chưa đăng nhập');
            }

            // Lấy tất cả quiz bằng cách set pageSize lớn
            const response = await adminQuizService.getAllQuizzes({ pageSize: 1000 });
            console.log('📊 Response từ API:', response);

            if (response.status === 'error') {
                throw new Error(response.message || 'Lỗi từ server');
            }

            const quizData = response.data?.rows || [];
            console.log('📝 Dữ liệu quiz:', quizData);
            console.log('📊 Số lượng quiz:', quizData.length);

            setQuizzes(quizData);
        } catch (error) {
            console.error('❌ Error loading quizzes:', error);
            setError(`Không thể tải danh sách quiz: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateQuiz = () => {
        setModalType('create');
        setSelectedQuiz({
            title: '',
            description: '',
            is_public: false
        });
        setShowModal(true);
    };

    const handleEditQuiz = (quiz) => {
        setModalType('edit');
        setSelectedQuiz({ ...quiz });
        setShowModal(true);
    };

    const handleViewQuiz = (quiz) => {
        setModalType('view');
        setSelectedQuiz(quiz);
        setShowModal(true);
    };

    const handleDeleteQuiz = (quiz) => {
        setModalType('delete');
        setSelectedQuiz(quiz);
        setShowModal(true);
    };

    const handleSaveQuiz = async (quizData) => {
        try {
            setProcessing(true);
            if (modalType === 'create') {
                // Kiểm tra số câu hỏi
                const totalQuestions = quizQuestions.easy + quizQuestions.medium + quizQuestions.hard;
                if (totalQuestions === 0) {
                    alert('Vui lòng nhập ít nhất 1 câu hỏi!');
                    setProcessing(false);
                    return;
                }

                // Tạo quiz với câu hỏi ngẫu nhiên
                await adminQuizService.createQuizWithRandomQuestions(quizData, quizQuestions);
                alert(`Đã tạo quiz thành công với ${totalQuestions} câu hỏi ngẫu nhiên!`);
            } else {
                await adminQuizService.updateQuiz(selectedQuiz.quiz_id, quizData);
            }
            setShowModal(false);
            loadQuizzes();
        } catch (error) {
            console.error('Error saving quiz:', error);
            alert('Có lỗi xảy ra khi lưu quiz: ' + error.message);
        } finally {
            setProcessing(false);
        }
    };

    const handleDeleteConfirm = async () => {
        try {
            setProcessing(true);
            await adminQuizService.deleteQuiz(selectedQuiz.quiz_id);
            setShowModal(false);
            loadQuizzes();
        } catch (error) {
            console.error('Error deleting quiz:', error);
            alert('Có lỗi xảy ra khi xóa quiz: ' + error.message);
        } finally {
            setProcessing(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setImportFile(file);
        setValidationResult(null);
    };

    const handleValidateFile = async () => {
        if (!importFile) {
            alert('Vui lòng chọn file Excel');
            return;
        }

        try {
            setValidating(true);
            const response = await adminQuizService.validateQuizFile(importFile);
            setValidationResult(response.data);
        } catch (error) {
            console.error('Error validating file:', error);
            alert('Có lỗi xảy ra khi kiểm tra file: ' + error.message);
        } finally {
            setValidating(false);
        }
    };

    const handleImportQuiz = async () => {
        if (!importFile || !validationResult?.isValid) {
            alert('Vui lòng chọn file và kiểm tra file trước');
            return;
        }

        try {
            setProcessing(true);
            await adminQuizService.importQuiz(importFile, importData);
            setShowImportModal(false);
            setImportFile(null);
            setValidationResult(null);
            setImportData({
                title: '',
                description: '',
                is_public: false,
                user_id: user?.user_id || 1
            });
            loadQuizzes();
            alert('Import quiz thành công!');
        } catch (error) {
            console.error('Error importing quiz:', error);
            alert('Có lỗi xảy ra khi import quiz: ' + error.message);
        } finally {
            setProcessing(false);
        }
    };

    const downloadTemplate = () => {
        // Tạo template Excel đơn giản
        const template = [
            ['Question', 'Option 1', 'Option 2', 'Option 3', 'Option 4', 'Correct Answer', 'Difficulty'],
            ['What is the capital of England?', 'London', 'Paris', 'Berlin', 'Madrid', 'A', 'easy'],
            ['Which tense is used for actions happening now?', 'Past Simple', 'Present Continuous', 'Future Perfect', 'Present Perfect', 'B', 'medium']
        ];

        // Tạo file CSV thay vì Excel (đơn giản hơn)
        const csvContent = template.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'quiz_template.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const filteredQuizzes = quizzes.filter(quiz =>
        quiz.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'easy': return 'bg-green-100 text-green-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'hard': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
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
                        onClick={loadQuizzes}
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
                    <h1 className="text-3xl font-bold text-gray-900">Quản lý Quiz</h1>
                    <p className="mt-2 text-gray-600">Quản lý bài kiểm tra và câu hỏi</p>
                    {/* Debug info */}
                    <div className="mt-2 text-sm text-gray-500">
                        📊 Đã tải: {quizzes.length} quiz | 🔍 Đang tìm kiếm: {searchTerm ? `"${searchTerm}"` : 'Tất cả'} |
                        📋 Hiển thị: {filteredQuizzes.length} quiz
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={handleCreateQuiz}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Tạo Quiz
                            </button>
                            <button
                                onClick={() => setShowImportModal(true)}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                Import Excel
                            </button>
                            <button
                                onClick={downloadTemplate}
                                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Tải Template
                            </button>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm quiz..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Quizzes List */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Quiz
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Trạng thái
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Số câu hỏi
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredQuizzes.map((quiz) => (
                                    <tr key={quiz.quiz_id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{quiz.title}</div>
                                                <div className="text-sm text-gray-500">{quiz.description}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${quiz.is_public ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {quiz.is_public ? 'Công khai' : 'Riêng tư'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {quiz.quizquestions?.length || 0} câu hỏi
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleViewQuiz(quiz)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEditQuiz(quiz)}
                                                    className="text-green-600 hover:text-green-900"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteQuiz(quiz)}
                                                    className="text-red-600 hover:text-red-900"
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

                {/* Quiz Modal */}
                {showModal && selectedQuiz && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                            <div className="mt-3">
                                {modalType === 'create' && (
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Tạo Quiz mới</h3>
                                        <form onSubmit={(e) => {
                                            e.preventDefault();
                                            handleSaveQuiz(selectedQuiz);
                                        }}>
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-700">Tiêu đề:</label>
                                                    <input
                                                        type="text"
                                                        value={selectedQuiz.title}
                                                        onChange={(e) => setSelectedQuiz({ ...selectedQuiz, title: e.target.value })}
                                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-700">Mô tả:</label>
                                                    <textarea
                                                        value={selectedQuiz.description}
                                                        onChange={(e) => setSelectedQuiz({ ...selectedQuiz, description: e.target.value })}
                                                        rows={3}
                                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>

                                                {/* Số câu hỏi theo độ khó */}
                                                <div>
                                                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                                                        Số câu hỏi theo độ khó: <span className="text-red-500">*</span>
                                                    </label>
                                                    <div className="grid grid-cols-3 gap-3">
                                                        <div>
                                                            <label className="text-xs text-gray-600">Dễ</label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={quizQuestions.easy}
                                                                onChange={(e) => setQuizQuestions({ ...quizQuestions, easy: parseInt(e.target.value) || 0 })}
                                                                className="mt-1 block w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                required
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs text-gray-600">Trung bình</label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={quizQuestions.medium}
                                                                onChange={(e) => setQuizQuestions({ ...quizQuestions, medium: parseInt(e.target.value) || 0 })}
                                                                className="mt-1 block w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                required
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs text-gray-600">Khó</label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={quizQuestions.hard}
                                                                onChange={(e) => setQuizQuestions({ ...quizQuestions, hard: parseInt(e.target.value) || 0 })}
                                                                className="mt-1 block w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                    <p className={`text-xs mt-1 ${(quizQuestions.easy + quizQuestions.medium + quizQuestions.hard) === 0 ? 'text-red-500' : 'text-gray-500'}`}>
                                                        Tổng: {quizQuestions.easy + quizQuestions.medium + quizQuestions.hard} câu hỏi
                                                        {(quizQuestions.easy + quizQuestions.medium + quizQuestions.hard) === 0 && ' (Vui lòng nhập ít nhất 1 câu hỏi)'}
                                                    </p>
                                                </div>

                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedQuiz.is_public}
                                                        onChange={(e) => setSelectedQuiz({ ...selectedQuiz, is_public: e.target.checked })}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    />
                                                    <label className="ml-2 text-sm text-gray-700">Công khai</label>
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
                                                    disabled={processing || (quizQuestions.easy + quizQuestions.medium + quizQuestions.hard) === 0}
                                                >
                                                    {processing ? 'Đang lưu...' : 'Tạo'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {modalType === 'edit' && (
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Chỉnh sửa Quiz</h3>
                                        <form onSubmit={(e) => {
                                            e.preventDefault();
                                            handleSaveQuiz(selectedQuiz);
                                        }}>
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-700">Tiêu đề:</label>
                                                    <input
                                                        type="text"
                                                        value={selectedQuiz.title}
                                                        onChange={(e) => setSelectedQuiz({ ...selectedQuiz, title: e.target.value })}
                                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-700">Mô tả:</label>
                                                    <textarea
                                                        value={selectedQuiz.description}
                                                        onChange={(e) => setSelectedQuiz({ ...selectedQuiz, description: e.target.value })}
                                                        rows={3}
                                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedQuiz.is_public}
                                                        onChange={(e) => setSelectedQuiz({ ...selectedQuiz, is_public: e.target.checked })}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    />
                                                    <label className="ml-2 text-sm text-gray-700">Công khai</label>
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
                                                    {processing ? 'Đang lưu...' : 'Cập nhật'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {modalType === 'view' && (
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Chi tiết Quiz</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">Tiêu đề:</label>
                                                <p className="text-sm text-gray-900 mt-1">{selectedQuiz.title}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">Mô tả:</label>
                                                <p className="text-sm text-gray-900 mt-1">{selectedQuiz.description}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">Trạng thái:</label>
                                                <p className="text-sm text-gray-900 mt-1">
                                                    {selectedQuiz.is_public ? 'Công khai' : 'Riêng tư'}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">Số câu hỏi:</label>
                                                <p className="text-sm text-gray-900 mt-1">
                                                    {selectedQuiz.quizquestions?.length || 0} câu hỏi
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

                                {modalType === 'delete' && (
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Xác nhận xóa</h3>
                                        <p className="text-sm text-gray-600 mb-4">
                                            Bạn có chắc chắn muốn xóa quiz "{selectedQuiz.title}"? Hành động này không thể hoàn tác.
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

                {/* Import Modal */}
                {showImportModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
                            <div className="mt-3">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Import Quiz từ Excel</h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Chọn file Excel:</label>
                                        <input
                                            type="file"
                                            accept=".xlsx,.xls"
                                            onChange={handleFileChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Tiêu đề Quiz:</label>
                                            <input
                                                type="text"
                                                value={importData.title}
                                                onChange={(e) => setImportData({ ...importData, title: e.target.value })}
                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Mô tả:</label>
                                        <textarea
                                            value={importData.description}
                                            onChange={(e) => setImportData({ ...importData, description: e.target.value })}
                                            rows={2}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={importData.is_public}
                                            onChange={(e) => setImportData({ ...importData, is_public: e.target.checked })}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label className="ml-2 text-sm text-gray-700">Công khai</label>
                                    </div>

                                    {importFile && (
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={handleValidateFile}
                                                className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 flex items-center"
                                                disabled={validating}
                                            >
                                                {validating ? (
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                ) : (
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                )}
                                                {validating ? 'Đang kiểm tra...' : 'Kiểm tra file'}
                                            </button>
                                        </div>
                                    )}

                                    {validationResult && (
                                        <div className={`p-4 rounded-lg ${validationResult.isValid
                                            ? 'bg-green-50 border border-green-200'
                                            : 'bg-red-50 border border-red-200'
                                            }`}>
                                            <div className="flex items-center">
                                                {validationResult.isValid ? (
                                                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                                                ) : (
                                                    <XCircle className="h-5 w-5 text-red-600 mr-2" />
                                                )}
                                                <span className={`font-medium ${validationResult.isValid ? 'text-green-800' : 'text-red-800'
                                                    }`}>
                                                    {validationResult.isValid ? 'File hợp lệ' : 'File không hợp lệ'}
                                                </span>
                                            </div>
                                            {validationResult.questions && (
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Số câu hỏi: {validationResult.questions.length}
                                                </p>
                                            )}
                                            {validationResult.errors && validationResult.errors.length > 0 && (
                                                <div className="mt-2">
                                                    <p className="text-sm font-medium text-red-800">Lỗi:</p>
                                                    <ul className="text-sm text-red-700 mt-1 space-y-1">
                                                        {validationResult.errors.map((error, index) => (
                                                            <li key={index}>• {error}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex justify-end space-x-3 mt-6">
                                        <button
                                            onClick={() => {
                                                setShowImportModal(false);
                                                setImportFile(null);
                                                setValidationResult(null);
                                            }}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                            disabled={processing}
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            onClick={handleImportQuiz}
                                            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                                            disabled={processing || !validationResult?.isValid}
                                        >
                                            {processing ? 'Đang import...' : 'Import Quiz'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizManagement; 