import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash, Eye, Plus, Book, Play, Headphones } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { adminLessonService } from '../../services/admin.service';
import * as XLSX from 'xlsx';

const LessonManagement = () => {
    const { user } = useAuth();
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('view'); // view, edit, delete, add
    const [filterType, setFilterType] = useState('all'); // all, listening, speaking, reading, writing
    const [processing, setProcessing] = useState(false);
    const [lessonType, setLessonType] = useState('grammar'); // grammar, vocabulary, skills

    // State cho import câu hỏi
    const [importedQuestionsText, setImportedQuestionsText] = useState('');
    const [parsedQuestions, setParsedQuestions] = useState([]);

    useEffect(() => {
        if (user?.role !== 'admin') {
            window.location.href = '/';
            return;
        }
        loadLessons();
    }, [user, lessonType]);

    const loadLessons = async () => {
        try {
            setLoading(true);
            setError(null);

            let response;
            switch (lessonType) {
                case 'grammar':
                    response = await adminLessonService.getGrammarLessons();
                    break;
                case 'vocabulary':
                    response = await adminLessonService.getVocabularyLessons();
                    break;
                case 'skills':
                    response = await adminLessonService.getSkills();
                    break;
                default:
                    response = await adminLessonService.getGrammarLessons();
            }

            setLessons(response.data?.rows || response.data || []);
        } catch (error) {
            console.error('Error loading lessons:', error);
            setError('Không thể tải danh sách bài học. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const filteredLessons = lessons.filter(lesson => {
        const matchesSearch = lesson.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lesson.content?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterType === 'all' || lesson.lesson_type === filterType || lesson.skill_type === filterType;
        return matchesSearch && matchesFilter;
    });

    const handleViewLesson = (lesson) => {
        setSelectedLesson(lesson);
        setModalType('view');
        setShowModal(true);
    };

    const handleEditLesson = (lesson) => {
        setSelectedLesson(lesson);
        setModalType('edit');
        setShowModal(true);
    };

    const handleDeleteLesson = (lesson) => {
        setSelectedLesson(lesson);
        setModalType('delete');
        setShowModal(true);
    };

    const handleAddLesson = () => {
        setSelectedLesson({
            title: '',
            content: '',
            meaning: '',
            usage: '',
            examples: '',
            lesson_type: lessonType,
            skill_type: lessonType === 'skills' ? 'listening' : undefined
        });
        setModalType('add');
        setShowModal(true);
    };

    const handleSaveLesson = async (lessonData) => {
        try {
            setProcessing(true);

            switch (lessonType) {
                case 'grammar':
                    if (modalType === 'add') {
                        await adminLessonService.createGrammarLesson(lessonData);
                    } else {
                        await adminLessonService.updateGrammarLesson(selectedLesson.lesson_id, lessonData);
                    }
                    break;
                case 'vocabulary':
                    if (modalType === 'add') {
                        await adminLessonService.createVocabularyLesson(lessonData);
                    } else {
                        await adminLessonService.updateVocabularyLesson(selectedLesson.lesson_id, lessonData);
                    }
                    break;
                case 'skills':
                    if (modalType === 'add') {
                        await adminLessonService.createSkill(lessonData);
                    } else {
                        await adminLessonService.updateSkill(selectedLesson.skill_id, lessonData);
                    }
                    break;
            }

            setShowModal(false);
            loadLessons();
        } catch (error) {
            console.error('Error saving lesson:', error);
            alert('Có lỗi xảy ra khi lưu bài học: ' + error.message);
        } finally {
            setProcessing(false);
        }
    };

    const handleDeleteConfirm = async () => {
        try {
            setProcessing(true);

            switch (lessonType) {
                case 'grammar':
                    await adminLessonService.deleteGrammarLesson(selectedLesson.lesson_id);
                    break;
                case 'vocabulary':
                    await adminLessonService.deleteVocabularyLesson(selectedLesson.lesson_id);
                    break;
                case 'skills':
                    await adminLessonService.deleteSkill(selectedLesson.skill_id);
                    break;
            }

            setShowModal(false);
            loadLessons();
        } catch (error) {
            console.error('Error deleting lesson:', error);
            alert('Có lỗi xảy ra khi xóa bài học: ' + error.message);
        } finally {
            setProcessing(false);
        }
    };

    const getTypeIcon = (type) => {
        const icons = {
            listening: Headphones,
            speaking: Play,
            reading: Book,
            writing: Book,
            grammar: Book,
            vocabulary: Book
        };
        const Icon = icons[type] || Book;
        return <Icon className="h-4 w-4" />;
    };

    const getTypeBadge = (type) => {
        const colors = {
            listening: 'bg-blue-100 text-blue-800',
            speaking: 'bg-green-100 text-green-800',
            reading: 'bg-purple-100 text-purple-800',
            writing: 'bg-yellow-100 text-yellow-800',
            grammar: 'bg-indigo-100 text-indigo-800',
            vocabulary: 'bg-pink-100 text-pink-800'
        };
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[type] || 'bg-gray-100 text-gray-800'}`}>
                {type}
            </span>
        );
    };

    const getDifficultyBadge = (level) => {
        const colors = {
            beginner: 'bg-green-100 text-green-800',
            intermediate: 'bg-yellow-100 text-yellow-800',
            advanced: 'bg-red-100 text-red-800'
        };
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[level] || 'bg-gray-100 text-gray-800'}`}>
                {level}
            </span>
        );
    };

    // Hàm parse câu hỏi từ text
    const handleParseQuestions = () => {
        // Định dạng: Câu hỏi|Đáp án A;Đáp án B;Đáp án C|Đáp án đúng
        const lines = importedQuestionsText.split('\n').map(l => l.trim()).filter(Boolean);
        const questions = lines.map(line => {
            const [question, options, correct_answer] = line.split('|');
            return {
                question: question?.trim() || '',
                options: options ? options.split(';').map(o => o.trim()) : [],
                correct_answer: correct_answer?.trim() || ''
            };
        }).filter(q => q.question && q.options.length > 0 && q.correct_answer);
        setParsedQuestions(questions);
    };

    // Hàm xử lý import file Excel (.xlsx)
    const handleImportFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.name.endsWith('.xlsx')) {
            alert('Chỉ hỗ trợ file .xlsx');
            return;
        }
        const reader = new FileReader();
        reader.onload = (evt) => {
            const data = evt.target.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, blankrows: false });
            // rows: mảng các dòng, mỗi dòng là mảng các ô
            const optionKeys = ['a', 'b', 'c', 'd'];
            const questions = rows.map(row => {
                const optionsArr = row[1] ? row[1].toString().split(';').map(o => o.trim()) : [];
                const optionsObj = {};
                optionsArr.forEach((opt, idx) => {
                    if (optionKeys[idx]) optionsObj[optionKeys[idx]] = opt;
                });
                return {
                    question: row[0]?.toString().trim() || '',
                    options: optionsObj,
                    correct_answer: row[2]?.toString().trim() || ''
                };
            }).filter(q => q.question && Object.keys(q.options).length > 0 && q.correct_answer);
            setParsedQuestions(questions);
        };
        reader.readAsBinaryString(file);
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
                        onClick={loadLessons}
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
                    <h1 className="text-3xl font-bold text-gray-900">Quản lý bài học</h1>
                    <p className="mt-2 text-gray-600">Quản lý tất cả bài học trong hệ thống</p>
                </div>

                {/* Lesson Type Tabs */}
                <div className="bg-white rounded-lg shadow-md mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8 px-6">
                            <button
                                onClick={() => setLessonType('grammar')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${lessonType === 'grammar'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Ngữ pháp
                            </button>
                            <button
                                onClick={() => setLessonType('vocabulary')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${lessonType === 'vocabulary'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Từ vựng
                            </button>
                            <button
                                onClick={() => setLessonType('skills')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${lessonType === 'skills'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Kỹ năng
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Search and Actions */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm bài học..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            {lessonType === 'skills' && (
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">Tất cả loại</option>
                                    <option value="listening">Listening</option>
                                    <option value="speaking">Speaking</option>
                                    <option value="reading">Reading</option>
                                    <option value="writing">Writing</option>
                                </select>
                            )}
                            <button
                                onClick={handleAddLesson}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Thêm bài học
                            </button>
                        </div>
                    </div>
                </div>

                {/* Lessons Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredLessons.map((lesson) => (
                        <div key={lesson.lesson_id || lesson.skill_id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center space-x-2">
                                        {getTypeIcon(lesson.lesson_type || lesson.skill_type)}
                                        {getTypeBadge(lesson.lesson_type || lesson.skill_type)}
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleViewLesson(lesson)}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleEditLesson(lesson)}
                                            className="text-green-600 hover:text-green-900"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteLesson(lesson)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <Trash className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-lg font-medium text-gray-900 mb-2">{lesson.title}</h3>
                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{lesson.content || lesson.description}</p>

                                <div className="text-xs text-gray-500">
                                    ID: {lesson.lesson_id || lesson.skill_id}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Modal */}
                {showModal && selectedLesson && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                            <div className="mt-3">
                                {modalType === 'view' && (
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Chi tiết bài học</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">Tiêu đề:</label>
                                                <p className="text-sm text-gray-900">{selectedLesson.title}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">Nội dung:</label>
                                                <p className="text-sm text-gray-900">{selectedLesson.content || selectedLesson.description}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">Loại bài học:</label>
                                                <div className="mt-1">{getTypeBadge(selectedLesson.lesson_type || selectedLesson.skill_type)}</div>
                                            </div>
                                            {selectedLesson.meaning && (
                                                <div>
                                                    <label className="text-sm font-medium text-gray-700">Nghĩa:</label>
                                                    <p className="text-sm text-gray-900">{selectedLesson.meaning}</p>
                                                </div>
                                            )}
                                            {selectedLesson.usage && (
                                                <div>
                                                    <label className="text-sm font-medium text-gray-700">Cách sử dụng:</label>
                                                    <p className="text-sm text-gray-900">{selectedLesson.usage}</p>
                                                </div>
                                            )}
                                            {selectedLesson.examples && (
                                                <div>
                                                    <label className="text-sm font-medium text-gray-700">Ví dụ:</label>
                                                    <p className="text-sm text-gray-900">{selectedLesson.examples}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {(modalType === 'edit' || modalType === 'add') && (
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                                            {modalType === 'add' ? 'Thêm bài học mới' : 'Chỉnh sửa bài học'}
                                        </h3>
                                        <form onSubmit={(e) => {
                                            e.preventDefault();
                                            // Khi lưu, gửi kèm parsedQuestions nếu có
                                            handleSaveLesson({
                                                ...selectedLesson,
                                                questions: parsedQuestions
                                            });
                                        }}>
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-700">Tiêu đề:</label>
                                                    <input
                                                        type="text"
                                                        value={selectedLesson.title}
                                                        onChange={(e) => setSelectedLesson({ ...selectedLesson, title: e.target.value })}
                                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        required
                                                        placeholder={
                                                            lessonType === 'grammar' ? 'Ví dụ: Present Simple' :
                                                                lessonType === 'vocabulary' ? 'Ví dụ: Family Members' :
                                                                    'Ví dụ: Basic Listening Practice'
                                                        }
                                                    />
                                                </div>

                                                {/* Form fields for Grammar */}
                                                {lessonType === 'grammar' && (
                                                    <>
                                                        <div>
                                                            <label className="text-sm font-medium text-gray-700">Nội dung ngữ pháp:</label>
                                                            <textarea
                                                                value={selectedLesson.content || ''}
                                                                onChange={(e) => setSelectedLesson({ ...selectedLesson, content: e.target.value })}
                                                                rows={4}
                                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                required
                                                                placeholder="Nhập giải thích chi tiết về cấu trúc ngữ pháp..."
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-sm font-medium text-gray-700">Ý nghĩa và cách dùng:</label>
                                                            <textarea
                                                                value={selectedLesson.meaning || ''}
                                                                onChange={(e) => setSelectedLesson({ ...selectedLesson, meaning: e.target.value })}
                                                                rows={3}
                                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                placeholder="Giải thích khi nào và như thế nào sử dụng cấu trúc này..."
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-sm font-medium text-gray-700">Các trường hợp sử dụng:</label>
                                                            <textarea
                                                                value={selectedLesson.usage || ''}
                                                                onChange={(e) => setSelectedLesson({ ...selectedLesson, usage: e.target.value })}
                                                                rows={3}
                                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                placeholder="Liệt kê các trường hợp sử dụng cụ thể..."
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-sm font-medium text-gray-700">Ví dụ minh họa:</label>
                                                            <textarea
                                                                value={selectedLesson.examples || ''}
                                                                onChange={(e) => setSelectedLesson({ ...selectedLesson, examples: e.target.value })}
                                                                rows={3}
                                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                placeholder="Mỗi dòng một ví dụ. Nên có ví dụ cho mỗi dạng câu (khẳng định, phủ định, nghi vấn)..."
                                                            />
                                                        </div>
                                                    </>
                                                )}

                                                {/* Form fields for Vocabulary */}
                                                {lessonType === 'vocabulary' && (
                                                    <>
                                                        <div>
                                                            <label className="text-sm font-medium text-gray-700">Danh sách từ vựng:</label>
                                                            <div className="mt-1 text-xs text-gray-500 mb-1">
                                                                Mỗi dòng một từ, định dạng: "Từ tiếng Anh – nghĩa tiếng Việt"
                                                            </div>
                                                            <textarea
                                                                value={selectedLesson.content || ''}
                                                                onChange={(e) => setSelectedLesson({ ...selectedLesson, content: e.target.value })}
                                                                rows={5}
                                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                                                                required
                                                                placeholder="Father – bố&#13;&#10;Mother – mẹ&#13;&#10;Brother – anh/em trai"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-sm font-medium text-gray-700">Giải thích thêm (nếu có):</label>
                                                            <textarea
                                                                value={selectedLesson.meaning || ''}
                                                                onChange={(e) => setSelectedLesson({ ...selectedLesson, meaning: e.target.value })}
                                                                rows={2}
                                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                placeholder="Thêm giải thích về cách dùng các từ nếu cần..."
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-sm font-medium text-gray-700">Ví dụ câu:</label>
                                                            <div className="mt-1 text-xs text-gray-500 mb-1">
                                                                Mỗi dòng một câu ví dụ kèm nghĩa
                                                            </div>
                                                            <textarea
                                                                value={selectedLesson.examples || ''}
                                                                onChange={(e) => setSelectedLesson({ ...selectedLesson, examples: e.target.value })}
                                                                rows={3}
                                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                placeholder="My father is a doctor.(Bố tôi là bác sĩ.)&#13;&#10;I love my mother.(Tôi yêu mẹ.)"
                                                            />
                                                        </div>
                                                    </>
                                                )}

                                                {/* Form fields for Skills */}
                                                {lessonType === 'skills' && (
                                                    <>
                                                        <div>
                                                            <label className="text-sm font-medium text-gray-700">Loại kỹ năng:</label>
                                                            <select
                                                                value={selectedLesson.skill_type}
                                                                onChange={(e) => setSelectedLesson({ ...selectedLesson, skill_type: e.target.value })}
                                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                required
                                                            >
                                                                <option value="listening">Listening (Nghe)</option>
                                                                <option value="speaking">Speaking (Nói)</option>
                                                                <option value="reading">Reading (Đọc)</option>
                                                                <option value="writing">Writing (Viết)</option>
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="text-sm font-medium text-gray-700">Mô tả bài học:</label>
                                                            <textarea
                                                                value={selectedLesson.description || ''}
                                                                onChange={(e) => setSelectedLesson({ ...selectedLesson, description: e.target.value })}
                                                                rows={3}
                                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                required
                                                                placeholder="Mô tả ngắn gọn về nội dung và mục tiêu của bài học..."
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-sm font-medium text-gray-700">Từ vựng gợi ý:</label>
                                                            <div className="mt-1 text-xs text-gray-500 mb-1">
                                                                Các từ vựng quan trọng trong bài, phân cách bằng dấu phẩy
                                                            </div>
                                                            <input
                                                                type="text"
                                                                value={selectedLesson.suggested_vocabulary || ''}
                                                                onChange={(e) => setSelectedLesson({ ...selectedLesson, suggested_vocabulary: e.target.value })}
                                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                placeholder="important, necessary, essential"
                                                            />
                                                        </div>
                                                        {selectedLesson.skill_type === 'reading' && (
                                                            <div>
                                                                <label className="text-sm font-medium text-gray-700">Nội dung bài đọc:</label>
                                                                <textarea
                                                                    value={selectedLesson.reading_content || ''}
                                                                    onChange={(e) => setSelectedLesson({ ...selectedLesson, reading_content: e.target.value })}
                                                                    rows={5}
                                                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                    placeholder="Nhập nội dung bài đọc..."
                                                                />
                                                            </div>
                                                        )}
                                                        {selectedLesson.skill_type === 'writing' && (
                                                            <div>
                                                                <label className="text-sm font-medium text-gray-700">Đề bài viết:</label>
                                                                <textarea
                                                                    value={selectedLesson.writing_prompt || ''}
                                                                    onChange={(e) => setSelectedLesson({ ...selectedLesson, writing_prompt: e.target.value })}
                                                                    rows={3}
                                                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                    placeholder="Nhập đề bài viết..."
                                                                />
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                                {/* Import câu hỏi cho bài tập */}
                                                {['grammar', 'vocabulary', 'skills'].includes(lessonType) && (
                                                    <>
                                                        <div>
                                                            <label className="text-sm font-medium text-gray-700">Import câu hỏi từ file Excel (.xlsx):</label>
                                                            <input
                                                                type="file"
                                                                accept=".xlsx"
                                                                className="block mt-1"
                                                                onChange={handleImportFile}
                                                            />
                                                            <div className="mt-1 text-xs text-gray-500 mb-1">
                                                                File phải có 3 cột: Câu hỏi | Đáp án (cách nhau bằng dấu ;) | Đáp án đúng<br />
                                                                Ví dụ: What is the capital of France? | Paris;London;Berlin;Rome | Paris
                                                            </div>
                                                            {/* Hiển thị preview nếu có */}
                                                            {parsedQuestions.length > 0 && (
                                                                <ul className="mt-2 text-xs max-h-32 overflow-y-auto bg-gray-50 p-2 rounded">
                                                                    {parsedQuestions.map((q, idx) => (
                                                                        <li key={idx} className="mb-1">{q.question} ({Object.values(q.options).join(', ')}) - Đáp án: {q.correct_answer}</li>
                                                                    ))}
                                                                </ul>
                                                            )}
                                                        </div>
                                                    </>
                                                )}
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
                                            Bạn có chắc chắn muốn xóa bài học "{selectedLesson.title}"? Hành động này không thể hoàn tác.
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

export default LessonManagement; 