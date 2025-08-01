import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Mic,
    MicOff,
    Play,
    Pause,
    Trash2,
    Send,
    ArrowLeft,
    Volume2,
    BookOpen,
    Lightbulb
} from 'lucide-react';
import { getSkillLessonById, submitSkillSubmissionWithFormData } from '../../models/skill.model';
import { gradeSpeaking } from '../../services/ai.service';
import { useCheckAuth } from '../../hooks/useCheckAuth';
import { useUserStore } from '../../store/userSlice';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import LoadingSpinner from '../../components/LoadingSpinner';

const SpeakingExercise = () => {
    const { skillId } = useParams();
    const navigate = useNavigate();
    const { user } = useUserStore();
    const [lesson, setLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [audioUrl, setAudioUrl] = useState(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [aiGradingResult, setAiGradingResult] = useState(null);
    const [showGradingResult, setShowGradingResult] = useState(false);

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const audioRef = useRef(null);
    const recordingIntervalRef = useRef(null);

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

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Ưu tiên wav, fallback về webm nếu không hỗ trợ
            const isWavSupported = MediaRecorder.isTypeSupported('audio/wav');
            const mimeType = isWavSupported ? 'audio/wav' : 'audio/webm';
            const fileExtension = isWavSupported ? 'wav' : 'webm';
            const options = { mimeType };

            mediaRecorderRef.current = new MediaRecorder(stream, options);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = () => {
                // Đảm bảo file có extension đúng
                const blob = new Blob(audioChunksRef.current, { type: mimeType });
                const fileName = `recording.${fileExtension}`;
                const file = new File([blob], fileName, { type: mimeType });
                setAudioBlob(file);
                setAudioUrl(URL.createObjectURL(blob));
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setRecordingTime(0);

            recordingIntervalRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (err) {
            console.error('Error starting recording:', err);
            setError('Không thể truy cập microphone. Vui lòng kiểm tra quyền truy cập.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
            }
        }
    };

    const playRecording = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const deleteRecording = () => {
        setAudioBlob(null);
        setAudioUrl(null);
        setRecordingTime(0);
        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSubmit = async () => {
        if (!audioBlob) {
            setError('Vui lòng ghi âm trước khi nộp bài.');
            return;
        }
        // Thêm kiểm tra và log chi tiết về audioBlob
        if (!(audioBlob instanceof File)) {
            setError('Lỗi: File ghi âm không hợp lệ. Hãy thử ghi lại.');
            console.error('audioBlob is not a File:', audioBlob);
            return;
        }
        if (audioBlob.size === 0) {
            setError('Lỗi: File ghi âm bị rỗng. Hãy thử ghi lại.');
            console.error('audioBlob size is 0:', audioBlob);
            return;
        }
        console.log('audioBlob info:', {
            name: audioBlob.name,
            type: audioBlob.type,
            size: audioBlob.size
        });
        setIsSubmitting(true);
        setError(null);
        try {
            // Chấm điểm AI trước
            console.log('Starting AI grading...');
            const aiResult = await gradeSpeaking(audioBlob, 'whisper');
            console.log('AI grading result:', aiResult);
            setAiGradingResult(aiResult);

            // Nộp bài với kết quả AI
            const formData = new FormData();

            // Đảm bảo file có tên và extension đúng
            const fileExtension = audioBlob.type === 'audio/wav' ? 'wav' : 'webm';
            const fileName = `recording.${fileExtension}`;
            formData.append('audio', audioBlob, fileName);

            formData.append('user_id', user?.user_id);
            formData.append('skill_id', skillId);
            formData.append('skill_type', 'speaking');
            formData.append('submitted_at', new Date().toISOString());

            // Thêm kết quả AI và audio URL vào submission
            formData.append('ai_grading_result', JSON.stringify(aiResult));
            if (aiResult.audioUrl) {
                formData.append('audio_url', aiResult.audioUrl);
            }
            if (aiResult.audioPublicId) {
                formData.append('audio_public_id', aiResult.audioPublicId);
            }

            const response = await submitSkillSubmissionWithFormData(formData);
            console.log('Submission response:', response);

            // Hiển thị kết quả chấm điểm
            setShowGradingResult(true);
        } catch (err) {
            console.error('Submit error:', err);
            setError('Lỗi khi nộp bài. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50">
                <Navbar />
                <div className="flex items-center justify-center min-h-screen">
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50">
                <Navbar />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="text-red-500 text-xl mb-4">{error}</div>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
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
            <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50">
                <Navbar />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="text-red-500 text-xl mb-4">Không tìm thấy bài học</div>
                        <button
                            onClick={() => navigate('/speaking')}
                            className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
                        >
                            Quay lại
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50">
            <Navbar />

            {/* Header */}
            <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="flex items-center mb-4">
                        <button
                            onClick={() => navigate('/speaking')}
                            className="flex items-center text-teal-100 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Quay lại
                        </button>
                    </div>
                    <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
                    <p className="text-teal-100">{lesson.description}</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Lesson Content */}
                    <div className="space-y-6">
                        {/* Speaking Topic */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center mb-4">
                                <Mic className="w-6 h-6 text-teal-600 mr-2" />
                                <h2 className="text-xl font-semibold">Speaking Topic</h2>
                            </div>

                            <div className="bg-teal-50 rounded-lg p-4 mb-4">
                                <h3 className="font-semibold text-teal-800 mb-2">Topic:</h3>
                                <p className="text-teal-700">{lesson.title || 'Practice your speaking skills'}</p>
                            </div>

                            {lesson.speaking_prompt && (
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-800 mb-2">Instructions:</h3>
                                    <p className="text-gray-700 whitespace-pre-wrap">{lesson.speaking_prompt}</p>
                                </div>
                            )}
                        </div>

                        {/* Vocabulary Suggestions */}
                        {lesson.suggested_vocabulary && (
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <div className="flex items-center mb-4">
                                    <BookOpen className="w-6 h-6 text-teal-600 mr-2" />
                                    <h2 className="text-xl font-semibold">Suggested Vocabulary</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {lesson.suggested_vocabulary.split(',').map((word, index) => (
                                        <div key={index} className="bg-gray-50 rounded-lg p-3">
                                            <span className="font-medium text-gray-800">{word.trim()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Examples */}
                        {lesson.examples && (
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <div className="flex items-center mb-4">
                                    <Lightbulb className="w-6 h-6 text-teal-600 mr-2" />
                                    <h2 className="text-xl font-semibold">Examples</h2>
                                </div>

                                <div className="space-y-3">
                                    {lesson.examples.split('\n').map((example, index) => (
                                        <div key={index} className="bg-gray-50 rounded-lg p-3">
                                            <p className="text-gray-700 italic">"{example.trim()}"</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Recording */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center mb-6">
                                <Volume2 className="w-6 h-6 text-teal-600 mr-2" />
                                <h2 className="text-xl font-semibold">Record Your Speech</h2>
                            </div>

                            {/* Recording Status */}
                            <div className="text-center mb-6">
                                {isRecording && (
                                    <div className="flex items-center justify-center space-x-2 text-red-600 mb-2">
                                        <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                                        <span className="font-medium">Recording...</span>
                                    </div>
                                )}
                                <div className="text-2xl font-mono text-gray-800">
                                    {formatTime(recordingTime)}
                                </div>
                            </div>

                            {/* Recording Controls */}
                            <div className="flex justify-center space-x-4 mb-6">
                                {!isRecording ? (
                                    <button
                                        onClick={startRecording}
                                        className="flex items-center px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                                    >
                                        <Mic className="w-5 h-5 mr-2" />
                                        Start Recording
                                    </button>
                                ) : (
                                    <button
                                        onClick={stopRecording}
                                        className="flex items-center px-6 py-3 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors"
                                    >
                                        <MicOff className="w-5 h-5 mr-2" />
                                        Stop Recording
                                    </button>
                                )}
                            </div>

                            {/* Playback Controls */}
                            {audioUrl && (
                                <div className="space-y-4">
                                    <div className="flex justify-center space-x-4">
                                        <button
                                            onClick={playRecording}
                                            className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                                        >
                                            {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                                            {isPlaying ? 'Pause' : 'Play'}
                                        </button>

                                        <button
                                            onClick={deleteRecording}
                                            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete
                                        </button>
                                    </div>

                                    <audio
                                        ref={audioRef}
                                        src={audioUrl}
                                        onEnded={() => setIsPlaying(false)}
                                        className="w-full"
                                    />
                                </div>
                            )}

                            {/* Submit Button */}
                            <div className="mt-6">
                                <button
                                    onClick={handleSubmit}
                                    disabled={!audioBlob || isSubmitting}
                                    className="w-full flex items-center justify-center px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4 mr-2" />
                                            Submit Recording
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Tips */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-semibold mb-4">Speaking Tips</h3>
                            <ul className="space-y-2 text-gray-700 mb-4">
                                <li className="flex items-start">
                                    <span className="text-teal-600 mr-2">•</span>
                                    Speak clearly and at a moderate pace
                                </li>
                                <li className="flex items-start">
                                    <span className="text-teal-600 mr-2">•</span>
                                    Use the suggested vocabulary in your speech
                                </li>
                                <li className="flex items-start">
                                    <span className="text-teal-600 mr-2">•</span>
                                    Practice pronunciation of difficult words
                                </li>
                                <li className="flex items-start">
                                    <span className="text-teal-600 mr-2">•</span>
                                    Try to speak for at least 30 seconds
                                </li>
                            </ul>

                            <div className="bg-blue-50 rounded-lg p-3">
                                <h4 className="text-sm font-semibold text-blue-800 mb-1">Technical Requirements:</h4>
                                <p className="text-xs text-blue-700">
                                    Supported audio formats: WAV, WebM, MP3, MP4, MPEG, OGG (Max 10MB)
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Grading Result Modal */}
            {showGradingResult && aiGradingResult && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-teal-600">AI Grading Result</h2>
                                <button
                                    onClick={() => {
                                        setShowGradingResult(false);
                                        navigate('/speaking');
                                    }}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Transcript */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-2">Transcript:</h3>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-gray-700 italic">"{aiGradingResult.transcript || 'No transcript available'}"</p>
                                </div>
                            </div>

                            {/* Audio URL from Cloudinary */}
                            {aiGradingResult.audioUrl && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold mb-2">Audio Recording:</h3>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <audio controls className="w-full" src={aiGradingResult.audioUrl}>
                                            Your browser does not support the audio element.
                                        </audio>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Audio saved to cloud storage
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Scores */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-teal-50 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-teal-600">{aiGradingResult.contentScore || 0}/10</div>
                                    <div className="text-sm text-teal-700">Content</div>
                                </div>
                                <div className="bg-teal-50 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-teal-600">{aiGradingResult.grammarScore || 0}/10</div>
                                    <div className="text-sm text-teal-700">Grammar</div>
                                </div>
                                <div className="bg-teal-50 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-teal-600">{aiGradingResult.fluencyScore || 0}/10</div>
                                    <div className="text-sm text-teal-700">Fluency</div>
                                </div>
                                <div className="bg-teal-600 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-white">{aiGradingResult.overall || 0}/10</div>
                                    <div className="text-sm text-teal-100">Overall</div>
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
                                        navigate('/speaking');
                                    }}
                                    className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                                >
                                    Back to Lessons
                                </button>
                                <button
                                    onClick={() => {
                                        setShowGradingResult(false);
                                        setAiGradingResult(null);
                                        deleteRecording();
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                                >
                                    Try Again
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

export default SpeakingExercise; 