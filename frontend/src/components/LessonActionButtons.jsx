import React from 'react';
import { Play, RotateCcw, Eye, BookOpen } from 'lucide-react';

const LessonActionButtons = ({
    lessonProgress,
    onStart,
    onContinue,
    onReview,
    onRetry,
    isLoading = false
}) => {
    const { progress, hasUnfinishedProgress } = lessonProgress || {};
    const isCompleted = progress?.status === 'completed';
    const isInProgress = progress?.status === 'in_progress' || hasUnfinishedProgress;
    const progressPercent = progress?.progress_percent || 0;

    return (
        <div className="space-y-3">
            {/* Progress Bar */}
            {(isInProgress || isCompleted) && (
                <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Tiến độ</span>
                        <span>{Math.round(progressPercent)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progressPercent}%` }}
                        ></div>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
                {!isInProgress && !isCompleted && (
                    <button
                        onClick={onStart}
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center gap-2 font-medium disabled:opacity-50"
                    >
                        <Play className="w-4 h-4" />
                        Bắt đầu học
                    </button>
                )}

                {isInProgress && !isCompleted && (
                    <>
                        <button
                            onClick={onContinue}
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 flex items-center justify-center gap-2 font-medium disabled:opacity-50"
                        >
                            <BookOpen className="w-4 h-4" />
                            Tiếp tục học ({Math.round(progressPercent)}%)
                        </button>

                        <button
                            onClick={onReview}
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center justify-center gap-2 font-medium disabled:opacity-50"
                        >
                            <Eye className="w-4 h-4" />
                            Xem lại câu trả lời
                        </button>
                    </>
                )}

                {isCompleted && (
                    <>
                        <button
                            onClick={onReview}
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center justify-center gap-2 font-medium disabled:opacity-50"
                        >
                            <Eye className="w-4 h-4" />
                            Xem lại câu trả lời và điểm số
                        </button>

                        <button
                            onClick={onRetry}
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 px-4 rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-300 flex items-center justify-center gap-2 font-medium disabled:opacity-50"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Làm lại bài học
                        </button>
                    </>
                )}
            </div>

            {/* Status Info */}
            {isInProgress && (
                <div className="text-center text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                    <p>Bạn đã hoàn thành {Math.round(progressPercent)}% bài học này</p>
                    <p className="text-xs mt-1">Nhấn "Tiếp tục học" để tiếp tục từ điểm dừng</p>
                </div>
            )}

            {isCompleted && (
                <div className="text-center text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
                    <p>Chúc mừng! Bạn đã hoàn thành bài học này</p>
                    <p className="text-xs mt-1">Điểm số: {Math.round(progressPercent)}%</p>
                </div>
            )}
        </div>
    );
};

export default LessonActionButtons; 