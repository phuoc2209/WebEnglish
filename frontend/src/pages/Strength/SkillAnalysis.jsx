import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BarChart2,
    BookOpen,
    Mic,
    Ear,
    FileText,
    Book,
    Pen,
    TrendingUp,
    Target,
    Award,
    ArrowRight,
    RefreshCw,
    AlertCircle,
    CheckCircle,
    Clock,
    Zap,
    Star,
    TrendingDown,
    Minus,
    Info,
    BarChart3
} from 'lucide-react';
import { useUserStore } from '../../store/userSlice';
import { getStrengthWeaknessByUserId } from '../../models/strengthWeakness.model';
import { getAverageScoresByUserId } from '../../models/skill.model';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast } from 'react-toastify';

const skillLabels = {
    listening: 'Nghe',
    speaking: 'Nói',
    reading: 'Đọc',
    writing: 'Viết',
};

const skillIcons = {
    listening: Ear,
    speaking: Mic,
    reading: BookOpen,
    writing: Pen,
};

const skillThresholds = {
    listening: 8.0,
    reading: 8.0,
    speaking: 7.5,
    writing: 7.5,
};

const SkillAnalysis = () => {
    const navigate = useNavigate();
    const { user } = useUserStore();
    const [strengths, setStrengths] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [avgScores, setAvgScores] = useState({});

    useEffect(() => {
        if (!user?.user_id) return;
        setLoading(true);

        const fetchData = async () => {
            try {
                // Lấy nhận xét tổng hợp
                const strengthsRes = await getStrengthWeaknessByUserId(user.user_id);
                if (strengthsRes.data && Array.isArray(strengthsRes.data)) {
                    const obj = {};
                    strengthsRes.data.forEach(item => {
                        obj[item.skill_type] = item;
                    });
                    setStrengths(obj);
                }

                // Lấy điểm trung bình từng kỹ năng
                const avgScoresRes = await getAverageScoresByUserId(user.user_id);
                if (avgScoresRes.data) {
                    setAvgScores(avgScoresRes.data);
                }

                setLoading(false);
            } catch (err) {
                setError(err.message || 'Lỗi');
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    if (loading) return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="flex items-center justify-center min-h-[60vh]">
                <LoadingSpinner />
            </div>
            <Footer />
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Có lỗi xảy ra</h3>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
            <Footer />
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center">
                        <div className="flex items-center justify-center mb-4">
                            <BarChart3 className="w-12 h-12 mr-3" />
                            <h1 className="text-4xl font-bold">Phân tích điểm mạnh yếu</h1>
                        </div>
                        <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                            Khám phá khả năng tiếng Anh của bạn qua phân tích chi tiết từng kỹ năng
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Standards Info Card */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
                    <div className="flex items-center mb-4">
                        <Target className="w-6 h-6 text-blue-600 mr-3" />
                        <h2 className="text-2xl font-bold text-gray-900">Tiêu chuẩn đánh giá</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-blue-50 rounded-xl p-4">
                            <h3 className="font-semibold text-blue-900 mb-2">Kỹ năng thụ động</h3>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-blue-700">Nghe (Listening)</span>
                                    <span className="font-bold text-blue-900">≥ 8.0/10</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-blue-700">Đọc (Reading)</span>
                                    <span className="font-bold text-blue-900">≥ 8.0/10</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-purple-50 rounded-xl p-4">
                            <h3 className="font-semibold text-purple-900 mb-2">Kỹ năng chủ động</h3>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-purple-700">Nói (Speaking)</span>
                                    <span className="font-bold text-purple-900">≥ 7.5/10</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-purple-700">Viết (Writing)</span>
                                    <span className="font-bold text-purple-900">≥ 7.5/10</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex items-start">
                            <Info className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-yellow-800">
                                <strong>Lưu ý:</strong> Kỹ năng Nói và Viết thường được đánh giá khắt khe hơn do yêu cầu về ngữ pháp, từ vựng và khả năng diễn đạt.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Skills Analysis Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {['listening', 'speaking', 'reading', 'writing'].map(skill => {
                        const skillData = avgScores[skill];
                        const avgDisplay = skillData?.average ? Number(skillData.average).toFixed(2) : '--';
                        const maxDisplay = skillData?.max ? Number(skillData.max).toFixed(1) : '--';
                        const min = skillData?.min ? Number(skillData.min).toFixed(1) : '--';
                        const trendDisplay = skillData?.trend ? Number(skillData.trend).toFixed(1) : '--';
                        const count = skillData?.count || 0;

                        // Đánh giá chi tiết theo từng mức điểm
                        const avg = skillData?.average || 0;
                        const max = skillData?.max || 0;
                        const trend = skillData?.trend || 0;
                        const stability = skillData?.stability || 0;

                        // Các mức điểm
                        const isExcellent = avg >= 9.0;
                        const isVeryGood = avg >= 8.5;
                        const isGood = avg >= skillThresholds[skill];
                        const isAboveAverage = avg >= 7.0;
                        const isAverage = avg >= 6.0;
                        const isBelowAverage = avg >= 5.0;
                        const isPoor = avg < 5.0;

                        // Các mức độ gần chuẩn
                        const isVeryNearThreshold = avg >= (skillThresholds[skill] - 0.2);
                        const isNearThreshold = avg >= (skillThresholds[skill] - 0.5);
                        const isModerateNear = avg >= (skillThresholds[skill] - 1.0);

                        // Đánh giá xu hướng và ổn định
                        const isRapidlyImproving = trend > 1.5;
                        const isImproving = trend > 0.5;
                        const isSlightlyImproving = trend > 0.2;
                        const isStagnant = Math.abs(trend) <= 0.2;
                        const isSlightlyDeclining = trend < -0.2;
                        const isDeclining = trend < -0.5;

                        const isHighlyStable = stability < 10;
                        const isStable = stability < 20;
                        const isUnstable = stability >= 30;

                        let isStrong = false;
                        let statusColor = '#ef4444';
                        let statusText = 'Cần cải thiện';
                        let statusBg = 'bg-red-50';
                        let statusBorder = 'border-red-200';

                        if (isExcellent) {
                            statusColor = '#059669';
                            statusText = 'Xuất sắc';
                            statusBg = 'bg-emerald-50';
                            statusBorder = 'border-emerald-200';
                            isStrong = true;
                        } else if (isVeryGood) {
                            statusColor = '#10b981';
                            statusText = 'Rất tốt';
                            statusBg = 'bg-green-50';
                            statusBorder = 'border-green-200';
                            isStrong = true;
                        } else if (isGood) {
                            statusColor = '#22c55e';
                            statusText = 'Giỏi';
                            statusBg = 'bg-green-50';
                            statusBorder = 'border-green-200';
                            isStrong = true;
                        } else if (isVeryNearThreshold) {
                            statusColor = '#10b981';
                            statusText = 'Gần đạt chuẩn';
                            statusBg = 'bg-green-50';
                            statusBorder = 'border-green-200';
                        } else if (isNearThreshold) {
                            if (isImproving) {
                                statusColor = '#10b981';
                                statusText = 'Tiến gần chuẩn';
                                statusBg = 'bg-green-50';
                                statusBorder = 'border-green-200';
                            } else {
                                statusColor = '#f59e0b';
                                statusText = 'Gần chuẩn';
                                statusBg = 'bg-yellow-50';
                                statusBorder = 'border-yellow-200';
                            }
                        } else if (isModerateNear) {
                            if (isRapidlyImproving) {
                                statusColor = '#10b981';
                                statusText = 'Cải thiện nhanh';
                                statusBg = 'bg-green-50';
                                statusBorder = 'border-green-200';
                            } else if (isImproving) {
                                statusColor = '#f59e0b';
                                statusText = 'Đang cải thiện';
                                statusBg = 'bg-yellow-50';
                                statusBorder = 'border-yellow-200';
                            } else {
                                statusColor = '#f59e0b';
                                statusText = 'Khá gần chuẩn';
                                statusBg = 'bg-yellow-50';
                                statusBorder = 'border-yellow-200';
                            }
                        } else if (isAboveAverage) {
                            if (isRapidlyImproving) {
                                statusColor = '#10b981';
                                statusText = 'Cải thiện nhanh';
                                statusBg = 'bg-green-50';
                                statusBorder = 'border-green-200';
                            } else if (isImproving) {
                                statusColor = '#f59e0b';
                                statusText = 'Đang cải thiện';
                                statusBg = 'bg-yellow-50';
                                statusBorder = 'border-yellow-200';
                            } else if (isStagnant) {
                                statusColor = '#f59e0b';
                                statusText = 'Trì trệ';
                                statusBg = 'bg-yellow-50';
                                statusBorder = 'border-yellow-200';
                            } else {
                                statusColor = '#f59e0b';
                                statusText = 'Trên trung bình';
                                statusBg = 'bg-yellow-50';
                                statusBorder = 'border-yellow-200';
                            }
                        } else if (isAverage) {
                            if (isRapidlyImproving) {
                                statusColor = '#10b981';
                                statusText = 'Cải thiện nhanh';
                                statusBg = 'bg-green-50';
                                statusBorder = 'border-green-200';
                            } else if (isImproving) {
                                statusColor = '#f59e0b';
                                statusText = 'Đang cải thiện';
                                statusBg = 'bg-yellow-50';
                                statusBorder = 'border-yellow-200';
                            } else if (isDeclining) {
                                statusColor = '#ef4444';
                                statusText = 'Đang giảm';
                                statusBg = 'bg-red-50';
                                statusBorder = 'border-red-200';
                            } else {
                                statusColor = '#f59e0b';
                                statusText = 'Trung bình';
                                statusBg = 'bg-yellow-50';
                                statusBorder = 'border-yellow-200';
                            }
                        } else if (isBelowAverage) {
                            if (isRapidlyImproving) {
                                statusColor = '#10b981';
                                statusText = 'Cải thiện nhanh';
                                statusBg = 'bg-green-50';
                                statusBorder = 'border-green-200';
                            } else if (isImproving) {
                                statusColor = '#f59e0b';
                                statusText = 'Đang cải thiện';
                                statusBg = 'bg-yellow-50';
                                statusBorder = 'border-yellow-200';
                            } else if (isDeclining) {
                                statusColor = '#ef4444';
                                statusText = 'Đang giảm';
                                statusBg = 'bg-red-50';
                                statusBorder = 'border-red-200';
                            } else {
                                statusColor = '#ef4444';
                                statusText = 'Dưới trung bình';
                                statusBg = 'bg-red-50';
                                statusBorder = 'border-red-200';
                            }
                        } else if (isPoor) {
                            if (isRapidlyImproving) {
                                statusColor = '#10b981';
                                statusText = 'Cải thiện nhanh';
                                statusBg = 'bg-green-50';
                                statusBorder = 'border-green-200';
                            } else if (isImproving) {
                                statusColor = '#f59e0b';
                                statusText = 'Đang cải thiện';
                                statusBg = 'bg-yellow-50';
                                statusBorder = 'border-yellow-200';
                            } else if (isDeclining) {
                                statusColor = '#ef4444';
                                statusText = 'Đang giảm';
                                statusBg = 'bg-red-50';
                                statusBorder = 'border-red-200';
                            } else {
                                statusColor = '#ef4444';
                                statusText = 'Yếu';
                                statusBg = 'bg-red-50';
                                statusBorder = 'border-red-200';
                            }
                        }

                        const SkillIcon = skillIcons[skill];

                        return (
                            <div key={skill} className={`${statusBg} ${statusBorder} border-2 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300`}>
                                {/* Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center">
                                        <div className="p-2 bg-white rounded-lg mr-3">
                                            <SkillIcon className="w-6 h-6" style={{ color: statusColor }} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">{skillLabels[skill]}</h3>
                                            <p className="text-sm text-gray-600 capitalize">{skill}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: statusColor, color: 'white' }}>
                                            {statusText}
                                        </span>
                                    </div>
                                </div>

                                {/* Score Display */}
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-600">Điểm trung bình</span>
                                        <span className="text-2xl font-bold" style={{ color: statusColor }}>
                                            {avgDisplay}/10
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div
                                            className="h-3 rounded-full transition-all duration-500"
                                            style={{
                                                width: `${(avg / 10) * 100}%`,
                                                backgroundColor: statusColor
                                            }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Statistics Grid */}
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-white rounded-lg p-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-600">Cao nhất</span>
                                            <span className="text-sm font-semibold text-gray-900">{maxDisplay}</span>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-lg p-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-600">Thấp nhất</span>
                                            <span className="text-sm font-semibold text-gray-900">{min}</span>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-lg p-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-600">Số bài</span>
                                            <span className="text-sm font-semibold text-gray-900">{count}</span>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-lg p-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-600">Xu hướng</span>
                                            <div className="flex items-center">
                                                {trend > 0 ? (
                                                    <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                                                ) : trend < 0 ? (
                                                    <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                                                ) : (
                                                    <Minus className="w-4 h-4 text-gray-600 mr-1" />
                                                )}
                                                <span className={`text-sm font-semibold ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                                                    {trendDisplay}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Recommendation */}
                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    <div className="flex items-start">
                                        {isStrong ? (
                                            <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                                        ) : (
                                            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                                        )}
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-1">
                                                {isStrong ? 'Điểm mạnh' : 'Cần cải thiện'}
                                            </h4>
                                            <p className="text-sm text-gray-600">
                                                {isExcellent && 'Bạn xuất sắc kỹ năng này! Hãy tiếp tục phát huy và chia sẻ kinh nghiệm!'}
                                                {isVeryGood && 'Bạn rất tốt kỹ năng này! Hãy tiếp tục duy trì và cải thiện!'}
                                                {isGood && 'Bạn giỏi kỹ năng này! Hãy tiếp tục phát huy!'}
                                                {isVeryNearThreshold && 'Bạn gần đạt chuẩn giỏi rồi, chỉ cần luyện tập thêm một chút!'}
                                                {isNearThreshold && isImproving && 'Bạn đang tiến gần chuẩn giỏi, hãy tiếp tục cố gắng!'}
                                                {isNearThreshold && !isImproving && 'Bạn gần chuẩn giỏi rồi, chỉ cần luyện tập thêm một chút!'}
                                                {isModerateNear && isRapidlyImproving && 'Bạn đang cải thiện nhanh! Hãy tiếp tục duy trì tốc độ này!'}
                                                {isModerateNear && isImproving && 'Bạn đang cải thiện tốt! Hãy tiếp tục luyện tập!'}
                                                {isAboveAverage && isRapidlyImproving && 'Bạn đang cải thiện nhanh! Rất ấn tượng!'}
                                                {isAboveAverage && isImproving && 'Bạn đang cải thiện tốt, hãy tiếp tục luyện tập!'}
                                                {isAboveAverage && isStagnant && 'Bạn cần luyện tập thêm để không bị trì trệ.'}
                                                {isAverage && isRapidlyImproving && 'Bạn đang cải thiện nhanh! Hãy tiếp tục!'}
                                                {isAverage && isImproving && 'Bạn đang cải thiện tốt, hãy tiếp tục luyện tập!'}
                                                {isAverage && isDeclining && 'Bạn cần chú ý cải thiện, đang có xu hướng giảm.'}
                                                {isBelowAverage && isRapidlyImproving && 'Bạn đang cải thiện nhanh! Rất tốt!'}
                                                {isBelowAverage && isImproving && 'Bạn đang cải thiện tốt, hãy tiếp tục luyện tập!'}
                                                {isBelowAverage && isDeclining && 'Bạn cần chú ý cải thiện, đang có xu hướng giảm.'}
                                                {isPoor && isRapidlyImproving && 'Bạn đang cải thiện nhanh! Hãy tiếp tục!'}
                                                {isPoor && isImproving && 'Bạn đang cải thiện tốt, hãy tiếp tục luyện tập!'}
                                                {isPoor && isDeclining && 'Bạn cần chú ý cải thiện, đang có xu hướng giảm.'}
                                                {!isExcellent && !isVeryGood && !isGood && !isVeryNearThreshold && !isNearThreshold && !isModerateNear && !isAboveAverage && !isAverage && !isBelowAverage && !isPoor && 'Bạn nên luyện tập thêm kỹ năng này để đạt chuẩn giỏi.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Button */}
                                <div className="mt-4">
                                    <button
                                        onClick={() => navigate(`/skills/${skill}`)}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                                    >
                                        <BookOpen className="w-4 h-4 mr-2" />
                                        Luyện tập kỹ năng này
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Summary Section */}
                <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                    <div className="flex items-center mb-4">
                        <Award className="w-6 h-6 text-purple-600 mr-3" />
                        <h2 className="text-2xl font-bold text-gray-900">Tóm tắt phân tích</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {['listening', 'speaking', 'reading', 'writing'].map(skill => {
                            const skillData = avgScores[skill];
                            const avg = skillData?.average || 0;
                            const threshold = skillThresholds[skill];
                            const isGood = avg >= threshold;

                            return (
                                <div key={skill} className="text-center p-4 rounded-lg bg-gray-50">
                                    <div className="text-2xl font-bold text-gray-900 mb-1">
                                        {skillData?.average ? Number(skillData.average).toFixed(1) : '--'}
                                    </div>
                                    <div className="text-sm text-gray-600 mb-2">{skillLabels[skill]}</div>
                                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${isGood ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {isGood ? 'Đạt chuẩn' : 'Chưa đạt'}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default SkillAnalysis; 