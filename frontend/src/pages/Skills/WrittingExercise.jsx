import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Edit3,
    Save,
    Send,
    ArrowLeft,
    FileText,
    Lightbulb,
    Clock,
    BookOpen,
    CheckCircle
} from 'lucide-react';
import { getSkillLessonById, submitSkillSubmission } from '../../models/skill.model';
import { gradeWriting } from '../../services/ai.service';
import { useCheckAuth } from '../../hooks/useCheckAuth';
import { useUserStore } from '../../store/userSlice';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import LoadingSpinner from '../../components/LoadingSpinner';

const WrittingExercise = () => {
    const { skillId } = useParams();
    const navigate = useNavigate();
    const { user } = useUserStore();
    const [lesson, setLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [essay, setEssay] = useState('');
    const [wordCount, setWordCount] = useState(0);
    const [writingTime, setWritingTime] = useState(0);
    const [isWriting, setIsWriting] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [startTime, setStartTime] = useState(null);
    const [usedVocabulary, setUsedVocabulary] = useState(new Set());
    const [aiGradingResult, setAiGradingResult] = useState(null);
    const [showGradingResult, setShowGradingResult] = useState(false);

    const writingIntervalRef = useRef(null);

    useCheckAuth();

    useEffect(() => {
        const fetchLesson = async () => {
            setLoading(true);
            setError(null);
            try {
                if (!user?.user_id) throw new Error('Vui lòng đăng nhập để xem bài học');
                const token = localStorage.getItem('token');
                if (!token) {
                    localStorage.removeItem('token');
                    throw new Error('Không tìm thấy token. Vui lòng đăng nhập lại.');
                }
                const response = await getSkillLessonById(skillId);
                console.log('Lesson response:', response);
                if (response.status === 'success') {
                    setLesson(response.data);
                } else {
                    throw new Error(response.message);
                }
            } catch (err) {
                console.error('Fetch lesson error:', err.message);
                let errorMessage = err.message || 'Lỗi khi tải bài học';
                if (err.message.includes('Không có quyền')) {
                    errorMessage = 'Không có quyền truy cập. Vui lòng đăng nhập lại.';
                    localStorage.removeItem('token');
                    navigate('/login');
                }
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };
        fetchLesson();
    }, [skillId, user?.user_id, navigate]);

    useEffect(() => {
        // Calculate word count
        const words = essay.trim().split(/\s+/).filter(word => word.length > 0);
        setWordCount(words.length);

        // Track used vocabulary
        if (lesson?.suggested_vocabulary) {
            const suggestedWords = lesson.suggested_vocabulary.split(',').map(word => word.trim().toLowerCase());
            const essayWords = essay.toLowerCase().split(/\s+/);
            const used = new Set();

            suggestedWords.forEach(word => {
                if (essayWords.includes(word)) {
                    used.add(word);
                }
            });

            setUsedVocabulary(used);
        }
    }, [essay, lesson?.suggested_vocabulary]);

    useEffect(() => {
        if (isWriting && startTime) {
            writingIntervalRef.current = setInterval(() => {
                const elapsed = Math.round((Date.now() - startTime) / 1000);
                setWritingTime(elapsed);
            }, 1000);
        } else {
            if (writingIntervalRef.current) {
                clearInterval(writingIntervalRef.current);
            }
        }

        return () => {
            if (writingIntervalRef.current) {
                clearInterval(writingIntervalRef.current);
            }
        };
    }, [isWriting, startTime]);

    const startWriting = () => {
        setIsWriting(true);
        setStartTime(Date.now());
    };

    const handleEssayChange = (e) => {
        setEssay(e.target.value);
        if (!isWriting && e.target.value.length > 0) {
            startWriting();
        }
    };

    const handleSave = () => {
        localStorage.setItem(`essay_${skillId}`, essay);
        alert('Bài viết đã được lưu!');
    };

    const handleSubmit = async () => {
        if (!essay.trim()) {
            setError('Vui lòng viết bài trước khi nộp.');
            return;
        }

        if (wordCount < 50) {
            setError('Bài viết phải có ít nhất 50 từ.');
            return;
        }

        setIsSubmitting(true);
        setError(null);
        try {
            // Chấm điểm AI trước
            console.log('Starting AI grading...');
            const aiResult = await gradeWriting(essay);
            console.log('AI grading result:', aiResult);
            setAiGradingResult(aiResult);

            // Nộp bài với kết quả AI
            const submissionData = {
                user_id: user?.user_id,
                skill_id: skillId,
                skill_type: 'writing',
                content: essay,
                word_count: wordCount,
                writing_time: writingTime,
                submitted_at: new Date().toISOString(),
                ai_grading_result: JSON.stringify(aiResult),
                score: aiResult.overall // Thêm trường score
            };

            const response = await submitSkillSubmission(submissionData);
            console.log('Submission response:', response);

            // Hiển thị kết quả chấm điểm
            setShowGradingResult(true);

            // Clear saved essay
            localStorage.removeItem(`essay_${skillId}`);
        } catch (err) {
            console.error('Submit error:', err);
            setError('Lỗi khi nộp bài. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRetry = () => {
        setEssay('');
        setWordCount(0);
        setWritingTime(0);
        setIsWriting(false);
        setStartTime(null);
        setIsSubmitted(false);
        setError(null);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const loadSavedEssay = () => {
        const savedEssay = localStorage.getItem(`essay_${skillId}`);
        if (savedEssay) {
            setEssay(savedEssay);
            if (savedEssay.length > 0) {
                startWriting();
            }
        }
    };

    useEffect(() => {
        loadSavedEssay();
    }, [skillId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
                <Navbar />
                <div className="flex items-center justify-center min-h-screen">
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
                <Navbar />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="text-red-500 text-xl mb-4">{error}</div>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                        >
                            Thử lại
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!lesson) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
                <Navbar />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="text-red-500 text-xl mb-4">Không tìm thấy bài học</div>
                        <button
                            onClick={() => navigate('/writting')}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                        >
                            Quay lại
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
            <Navbar />

            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="flex items-center mb-4">
                        <button
                            onClick={() => navigate('/writting')}
                            className="flex items-center text-green-100 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Quay lại
                        </button>
                    </div>
                    <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
                    <p className="text-green-100">{lesson.description}</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Writing Prompt */}
                    <div className="space-y-6">
                        {/* Writing Topic */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center mb-4">
                                <Edit3 className="w-6 h-6 text-green-600 mr-2" />
                                <h2 className="text-xl font-semibold">Writing Topic</h2>
                            </div>

                            <div className="bg-green-50 rounded-lg p-4 mb-4">
                                <h3 className="font-semibold text-green-800 mb-2">Topic:</h3>
                                <p className="text-green-700">{lesson.title || 'Practice your writing skills'}</p>
                            </div>

                            {lesson.writing_prompt && (
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-800 mb-2">Instructions:</h3>
                                    <p className="text-gray-700 whitespace-pre-wrap">{lesson.writing_prompt}</p>
                                </div>
                            )}
                        </div>

                        {/* Writing Tips */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center mb-4">
                                <Lightbulb className="w-6 h-6 text-green-600 mr-2" />
                                <h2 className="text-xl font-semibold">Writing Tips</h2>
                            </div>

                            <ul className="space-y-2 text-gray-700 mb-4">
                                <li className="flex items-start">
                                    <span className="text-green-600 mr-2">•</span>
                                    Plan your essay before writing
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-600 mr-2">•</span>
                                    Use clear and concise language
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-600 mr-2">•</span>
                                    Include an introduction, body, and conclusion
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-600 mr-2">•</span>
                                    Check your grammar and spelling
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-600 mr-2">•</span>
                                    Aim for at least 50 words
                                </li>
                            </ul>

                            {/* Suggested Vocabulary */}
                            {lesson.suggested_vocabulary && (
                                <div className="border-t pt-4">
                                    <h3 className="font-semibold text-green-800 mb-3">Suggested Vocabulary</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {lesson.suggested_vocabulary.split(',').map((word, index) => {
                                            const wordTrimmed = word.trim();
                                            const isUsed = usedVocabulary.has(wordTrimmed.toLowerCase());
                                            return (
                                                <span
                                                    key={index}
                                                    className={`px-3 py-1 rounded-full text-sm font-medium ${isUsed
                                                        ? 'bg-green-200 text-green-900 border-2 border-green-300'
                                                        : 'bg-green-100 text-green-800'
                                                        }`}
                                                >
                                                    {wordTrimmed}
                                                    {isUsed && <span className="ml-1">✓</span>}
                                                </span>
                                            );
                                        })}
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                        <p className="text-xs text-gray-500">Try to use these words in your essay</p>
                                        <p className="text-xs text-green-600 font-medium">
                                            Used: {usedVocabulary.size}/{lesson.suggested_vocabulary.split(',').length}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Examples */}
                        {lesson.examples && (
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <div className="flex items-center mb-4">
                                    <BookOpen className="w-6 h-6 text-green-600 mr-2" />
                                    <h2 className="text-xl font-semibold">Example Essays</h2>
                                </div>

                                <div className="space-y-3">
                                    {lesson.examples.split('\n').map((example, index) => (
                                        <div key={index} className="bg-gray-50 rounded-lg p-3">
                                            <p className="text-gray-700 italic text-sm">"{example.trim()}"</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Writing Area */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center">
                                    <FileText className="w-6 h-6 text-green-600 mr-2" />
                                    <h2 className="text-xl font-semibold">Your Essay</h2>
                                </div>
                                {isWriting && (
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Clock className="w-4 h-4 mr-1" />
                                        <span>Writing time: {formatTime(writingTime)}</span>
                                    </div>
                                )}
                            </div>

                            {!isSubmitted ? (
                                <div className="space-y-4">
                                    <textarea
                                        value={essay}
                                        onChange={handleEssayChange}
                                        placeholder="Start writing your essay here..."
                                        className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        disabled={isSubmitting}
                                    />

                                    <div className="flex items-center justify-between text-sm text-gray-600">
                                        <span>Word count: {wordCount}</span>
                                        <span>Minimum: 50 words</span>
                                    </div>

                                    <div className="flex space-x-3">
                                        <button
                                            onClick={handleSave}
                                            disabled={!essay.trim() || isSubmitting}
                                            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <Save className="w-4 h-4 mr-2" />
                                            Save Draft
                                        </button>

                                        <button
                                            onClick={handleSubmit}
                                            disabled={!essay.trim() || wordCount < 50 || isSubmitting}
                                            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    Submitting...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-4 h-4 mr-2" />
                                                    Submit Essay
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center space-y-6">
                                    <div className="flex items-center justify-center text-green-600 mb-4">
                                        <CheckCircle className="w-16 h-16" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-green-600">Essay Submitted Successfully!</h3>
                                    <div className="bg-gray-50 rounded-lg p-4 text-left">
                                        <h4 className="font-semibold mb-2">Submission Details:</h4>
                                        <p className="text-sm text-gray-600">Word count: {wordCount}</p>
                                        <p className="text-sm text-gray-600">Writing time: {formatTime(writingTime)}</p>
                                        {lesson.suggested_vocabulary && (
                                            <p className="text-sm text-gray-600">
                                                Vocabulary used: {usedVocabulary.size}/{lesson.suggested_vocabulary.split(',').length} suggested words
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <button
                                            onClick={handleRetry}
                                            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                        >
                                            Write Another Essay
                                        </button>
                                        <button
                                            onClick={() => navigate('/writting')}
                                            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                                        >
                                            Back to Lessons
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Writing Stats */}
                        {isWriting && !isSubmitted && (
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h3 className="text-lg font-semibold mb-4">Writing Statistics</h3>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">{wordCount}</div>
                                        <div className="text-sm text-gray-600">Words</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">{formatTime(writingTime)}</div>
                                        <div className="text-sm text-gray-600">Time</div>
                                    </div>
                                </div>

                                {/* Vocabulary Usage Stats */}
                                {lesson.suggested_vocabulary && (
                                    <div className="border-t pt-4">
                                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Vocabulary Usage</h4>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Suggested words used:</span>
                                            <span className="text-sm font-medium text-green-600">
                                                {usedVocabulary.size}/{lesson.suggested_vocabulary.split(',').length}
                                            </span>
                                        </div>
                                        {usedVocabulary.size > 0 && (
                                            <div className="mt-2">
                                                <div className="text-xs text-gray-500 mb-1">Used words:</div>
                                                <div className="flex flex-wrap gap-1">
                                                    {Array.from(usedVocabulary).map((word, index) => (
                                                        <span
                                                            key={index}
                                                            className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs"
                                                        >
                                                            {word}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* AI Grading Result Modal */}
            {showGradingResult && aiGradingResult && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-green-600">AI Grading Result</h2>
                                <button
                                    onClick={() => {
                                        setShowGradingResult(false);
                                        navigate('/writting');
                                    }}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Writing Stats */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-2">Writing Statistics:</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-green-50 rounded-lg p-3 text-center">
                                        <div className="text-xl font-bold text-green-600">{wordCount}</div>
                                        <div className="text-sm text-green-700">Words</div>
                                    </div>
                                    <div className="bg-green-50 rounded-lg p-3 text-center">
                                        <div className="text-xl font-bold text-green-600">{formatTime(writingTime)}</div>
                                        <div className="text-sm text-green-700">Time</div>
                                    </div>
                                    <div className="bg-green-50 rounded-lg p-3 text-center">
                                        <div className="text-xl font-bold text-green-600">{usedVocabulary.size}</div>
                                        <div className="text-sm text-green-700">Vocab Used</div>
                                    </div>
                                </div>
                            </div>

                            {/* Scores */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-green-50 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-green-600">{aiGradingResult.grammarScore || 0}/10</div>
                                    <div className="text-sm text-green-700">Grammar</div>
                                </div>
                                <div className="bg-green-50 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-green-600">{aiGradingResult.vocabularyScore || 0}/10</div>
                                    <div className="text-sm text-green-700">Vocabulary</div>
                                </div>
                                <div className="bg-green-50 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-green-600">{aiGradingResult.coherenceScore || 0}/10</div>
                                    <div className="text-sm text-green-700">Coherence</div>
                                </div>
                                <div className="bg-green-50 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-green-600">{aiGradingResult.structureScore || 0}/10</div>
                                    <div className="text-sm text-green-700">Structure</div>
                                </div>
                                <div className="bg-green-600 rounded-lg p-4 text-center col-span-2">
                                    <div className="text-2xl font-bold text-white">{aiGradingResult.overall || 0}/10</div>
                                    <div className="text-sm text-green-100">Overall Score</div>
                                </div>
                            </div>

                            {/* Feedback */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-2">Feedback:</h3>
                                <div className="bg-green-50 rounded-lg p-4">
                                    <p className="text-green-700">{aiGradingResult.feedback || 'No feedback available'}</p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-4">
                                <button
                                    onClick={() => {
                                        setShowGradingResult(false);
                                        navigate('/writting');
                                    }}
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    Back to Lessons
                                </button>
                                <button
                                    onClick={() => {
                                        setShowGradingResult(false);
                                        setAiGradingResult(null);
                                        handleRetry();
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                                >
                                    Write Another Essay
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default WrittingExercise; 