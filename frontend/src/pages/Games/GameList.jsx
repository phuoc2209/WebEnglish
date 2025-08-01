import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Play,
    Clock,
    Star,
    Trophy,
    Search,
    Filter,
    Grid,
    List,
    Target,
    Zap,
    Brain,
    Eye
} from 'lucide-react';
import { getAllGames, getUserGameHistory } from '../../models/game.model';
import { useUserStore } from '../../store/userSlice';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import LoadingSpinner from '../../components/LoadingSpinner';

const GameList = () => {
    const navigate = useNavigate();
    const { user } = useUserStore();
    const [games, setGames] = useState([]);
    const [userHistory, setUserHistory] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [filter, setFilter] = useState('all'); // 'all', 'played', 'unplayed'

    useEffect(() => {
        loadGames();
    }, []);

    const loadGames = async () => {
        try {
            setLoading(true);
            setError(null);

            const gamesResponse = await getAllGames();
            if (gamesResponse.status === 'success') {
                setGames(gamesResponse.data);

                // Load user history if logged in
                if (user?.user_id) {
                    const historyResponse = await getUserGameHistory(user.user_id);
                    if (historyResponse.status === 'success') {
                        const historyMap = {};
                        historyResponse.data.forEach(record => {
                            historyMap[record.game_id] = record;
                        });
                        setUserHistory(historyMap);
                    }
                }
            } else {
                setError(gamesResponse.message || 'Không thể tải danh sách game');
            }
        } catch (err) {
            setError(err.message || 'Lỗi kết nối đến máy chủ');
            toast.error(err.message || 'Lỗi kết nối đến máy chủ');
        } finally {
            setLoading(false);
        }
    };

    const getGameIcon = (gameType) => {
        switch (gameType) {
            case 'memory':
                return <Brain className="w-6 h-6 text-blue-500" />;
            case 'matching':
                return <Eye className="w-6 h-6 text-green-500" />;
            case 'speed':
                return <Zap className="w-6 h-6 text-yellow-500" />;
            default:
                return <Target className="w-6 h-6 text-purple-500" />;
        }
    };

    const getGameDifficulty = (difficulty) => {
        const stars = [];
        for (let i = 0; i < 3; i++) {
            stars.push(
                <Star
                    key={i}
                    className={`w-4 h-4 ${i < difficulty ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                />
            );
        }
        return stars;
    };

    const getGameStatus = (gameId) => {
        if (!user?.user_id) return 'unplayed';
        const history = userHistory[gameId];
        if (!history) return 'unplayed';
        return history.score > 0 ? 'completed' : 'played';
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'played':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'completed':
                return 'Đã hoàn thành';
            case 'played':
                return 'Đã chơi';
            default:
                return 'Chưa chơi';
        }
    };

    const filteredGames = games.filter(game => {
        const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'all' ||
            (filter === 'played' && getGameStatus(game.game_id) !== 'unplayed') ||
            (filter === 'unplayed' && getGameStatus(game.game_id) === 'unplayed');

        return matchesSearch && matchesFilter;
    });

    const handlePlayGame = (gameId) => {
        navigate(`/games/${gameId}/play`);
    };

    const handleViewHistory = (gameId) => {
        navigate(`/games/${gameId}/history`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <Navbar />
                <div className="flex items-center justify-center min-h-screen">
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <Navbar />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="text-red-500 text-6xl mb-4">🎮</div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Có lỗi xảy ra</h2>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button
                            onClick={loadGames}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Thử lại
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <Navbar />
            <ToastContainer />

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="text-center">
                        <div className="text-6xl mb-4">🎮</div>
                        <h1 className="text-3xl font-bold mb-2">Trò Chơi Học Tập</h1>
                        <p className="text-lg opacity-90">
                            Học tiếng Anh thông qua các trò chơi thú vị và tương tác
                        </p>
                    </div>
                </div>

                {/* Controls */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        {/* Search */}
                        <div className="flex-1 max-w-md">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm game..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="flex gap-2">
                            <select
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            >
                                <option value="all">Tất cả game</option>
                                <option value="played">Đã chơi</option>
                                <option value="unplayed">Chưa chơi</option>
                            </select>

                            {/* View Mode */}
                            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-purple-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <Grid className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`px-3 py-2 ${viewMode === 'list' ? 'bg-purple-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <List className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Games Grid/List */}
                {filteredGames.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                        <div className="text-6xl mb-4">🎯</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy game</h3>
                        <p className="text-gray-600 mb-4">
                            {searchTerm || filter !== 'all'
                                ? 'Không có game nào phù hợp với bộ lọc của bạn'
                                : 'Chưa có game nào được tạo'
                            }
                        </p>
                        {(searchTerm || filter !== 'all') && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilter('all');
                                }}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                            >
                                Xóa bộ lọc
                            </button>
                        )}
                    </div>
                ) : (
                    <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                        {filteredGames.map((game) => {
                            const status = getGameStatus(game.game_id);
                            const history = userHistory[game.game_id];

                            return (
                                <div
                                    key={game.game_id}
                                    className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow ${viewMode === 'list' ? 'flex' : ''
                                        }`}
                                >
                                    {/* Game Image/Icon */}
                                    <div className={`bg-gradient-to-br from-purple-500 to-pink-500 p-6 text-white ${viewMode === 'list' ? 'w-32 flex-shrink-0' : ''
                                        }`}>
                                        <div className="text-center">
                                            <div className="text-4xl mb-2">🧩</div>
                                            <h3 className="font-semibold text-lg">{game.title}</h3>
                                        </div>
                                    </div>

                                    {/* Game Content */}
                                    <div className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                {getGameIcon('memory')}
                                                <span className="text-sm text-gray-600">Ghép cặp hình ảnh</span>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                                                {getStatusText(status)}
                                            </span>
                                        </div>

                                        <p className="text-gray-600 mb-4">
                                            Ghép các cặp hình ảnh giống nhau để luyện tập từ vựng tiếng Anh
                                        </p>

                                        {/* Game Stats */}
                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-500">Độ khó:</span>
                                                <div className="flex">
                                                    {getGameDifficulty(2)}
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-500">Thời gian:</span>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4 text-gray-400" />
                                                    <span>3-5 phút</span>
                                                </div>
                                            </div>
                                            {history && (
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-500">Điểm cao nhất:</span>
                                                    <div className="flex items-center gap-1">
                                                        <Trophy className="w-4 h-4 text-yellow-500" />
                                                        <span className="font-semibold">{history.score}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handlePlayGame(game.game_id)}
                                                className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2"
                                            >
                                                <Play className="w-4 h-4" />
                                                {status === 'unplayed' ? 'Chơi ngay' : 'Chơi lại'}
                                            </button>
                                            {history && (
                                                <button
                                                    onClick={() => handleViewHistory(game.game_id)}
                                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                                >
                                                    <Trophy className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Stats Section */}
                {user?.user_id && (
                    <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-yellow-500" />
                            Thống kê của bạn
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">
                                    {Object.keys(userHistory).length}
                                </div>
                                <div className="text-sm text-gray-600">Game đã chơi</div>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">
                                    {Object.values(userHistory).filter(h => h.score > 0).length}
                                </div>
                                <div className="text-sm text-gray-600">Game hoàn thành</div>
                            </div>
                            <div className="text-center p-4 bg-purple-50 rounded-lg">
                                <div className="text-2xl font-bold text-purple-600">
                                    {Object.values(userHistory).reduce((sum, h) => sum + h.score, 0)}
                                </div>
                                <div className="text-sm text-gray-600">Tổng điểm</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default GameList; 