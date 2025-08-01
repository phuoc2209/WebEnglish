import React, { useState, useRef } from 'react';
import uploadService from '../services/upload.service';

const AudioRecorder = ({ onAudioUpload, skillId, userId }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [audioUrl, setAudioUrl] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef(null);
    const timerRef = useRef(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;

            const chunks = [];
            mediaRecorder.ondataavailable = (event) => {
                chunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/wav' });
                setAudioBlob(blob);
                const url = URL.createObjectURL(blob);
                setAudioUrl(url);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);
            setError('');
            setSuccess('');

            // Timer
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (error) {
            console.error('Error accessing microphone:', error);
            setError('Không thể truy cập microphone. Vui lòng kiểm tra quyền truy cập.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }
    };

    const uploadAudio = async () => {
        if (!audioBlob || !skillId || !userId) {
            setError('Vui lòng ghi âm trước khi upload');
            return;
        }

        setUploading(true);
        setError('');
        setSuccess('');

        try {
            // Tạo file từ blob
            const file = new File([audioBlob], 'recording.wav', { type: 'audio/wav' });

            // Upload lên Cloudinary
            const uploadResult = await uploadService.uploadAudio(file);

            if (uploadResult.success) {
                // Nộp bài speaking với audio
                const submissionResult = await uploadService.submitSpeakingWithAudio(
                    userId,
                    skillId,
                    '', // Không có content text
                    uploadResult.data.url,
                    uploadResult.data.public_id
                );

                if (submissionResult.status === 'success') {
                    setSuccess('Nộp bài speaking thành công!');
                    if (onAudioUpload) {
                        onAudioUpload(uploadResult.data.url);
                    }
                } else {
                    setError('Có lỗi xảy ra khi nộp bài');
                }
            } else {
                setError(uploadResult.message || 'Upload thất bại');
            }
        } catch (error) {
            console.error('Upload error:', error);
            setError('Có lỗi xảy ra khi upload audio. Vui lòng thử lại.');
        } finally {
            setUploading(false);
        }
    };

    const resetRecording = () => {
        setAudioBlob(null);
        setAudioUrl(null);
        setRecordingTime(0);
        setError('');
        setSuccess('');
        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Ghi âm bài speaking</h3>

            {/* Recording status */}
            <div className="mb-4 text-center">
                {isRecording && (
                    <div className="flex items-center justify-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-red-600 font-medium">Đang ghi âm</span>
                        <span className="text-gray-600">{formatTime(recordingTime)}</span>
                    </div>
                )}
            </div>

            {/* Audio player */}
            {audioUrl && (
                <div className="mb-4">
                    <audio controls className="w-full">
                        <source src={audioUrl} type="audio/wav" />
                        Trình duyệt của bạn không hỗ trợ phát audio.
                    </audio>
                </div>
            )}

            {/* Error/Success messages */}
            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                    {success}
                </div>
            )}

            {/* Control buttons */}
            <div className="flex gap-2">
                {!isRecording && !audioBlob && (
                    <button
                        onClick={startRecording}
                        className="flex-1 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
                    >
                        Bắt đầu ghi âm
                    </button>
                )}

                {isRecording && (
                    <button
                        onClick={stopRecording}
                        className="flex-1 bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
                    >
                        Dừng ghi âm
                    </button>
                )}

                {audioBlob && !isRecording && (
                    <>
                        <button
                            onClick={uploadAudio}
                            disabled={uploading}
                            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {uploading ? 'Đang upload...' : 'Nộp bài'}
                        </button>
                        <button
                            onClick={resetRecording}
                            disabled={uploading}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                        >
                            Ghi lại
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default AudioRecorder; 