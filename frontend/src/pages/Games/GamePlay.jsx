import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    RotateCcw,
    Home,
    Clock,
    Star,
    Trophy,
    CheckCircle,
    XCircle,
    Heart,
    Zap,
    Target,
    ArrowLeft
} from 'lucide-react';
import { getGameById, recordGameplay } from '../../models/game.model';
import { useUserStore } from '../../store/userSlice';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import LoadingSpinner from '../../components/LoadingSpinner';

const GamePlay = () => {
    const { gameId } = useParams();
    const navigate = useNavigate();
    const { user } = useUserStore();

    // Game state
    const [game, setGame] = useState(null);
    const [cards, setCards] = useState([]);
    const [flippedCards, setFlippedCards] = useState([]);
    const [matchedPairs, setMatchedPairs] = useState([]);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameCompleted, setGameCompleted] = useState(false);
    const [score, setScore] = useState(0);
    const [moves, setMoves] = useState(0);
    const [time, setTime] = useState(0);
    const [lives, setLives] = useState(3);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Timer
    useEffect(() => {
        let interval = null;
        if (gameStarted && !gameCompleted) {
            interval = setInterval(() => {
                setTime(prevTime => prevTime + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [gameStarted, gameCompleted]);

    // Load game data
    useEffect(() => {
        loadGame();
    }, [gameId]);

    const loadGame = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await getGameById(gameId);
            if (response.status === 'success') {
                setGame(response.data);
                initializeGame(response.data.gamecontents);
            } else {
                setError(response.message || 'Không thể tải thông tin game');
            }
        } catch (err) {
            setError(err.message || 'Lỗi kết nối đến máy chủ');
            toast.error(err.message || 'Lỗi kết nối đến máy chủ');
        } finally {
            setLoading(false);
        }
    };

    const initializeGame = (gameContents) => {
        // Create pairs of cards from game content
        const cardPairs = [];
        const pairGroups = {};

        // Group content by pair_id
        gameContents.forEach(content => {
            if (!pairGroups[content.pair_id]) {
                pairGroups[content.pair_id] = [];
            }
            pairGroups[content.pair_id].push(content);
        });

        // Create card pairs
        Object.values(pairGroups).forEach((pair, index) => {
            if (pair.length >= 2) {
                // Create two cards for each pair
                cardPairs.push(
                    {
                        id: `card-${index}-1`,
                        pairId: pair[0].pair_id,
                        imageUrl: pair[0].image_url,
                        isFlipped: false,
                        isMatched: false
                    },
                    {
                        id: `card-${index}-2`,
                        pairId: pair[0].pair_id,
                        imageUrl: pair[1]?.image_url || pair[0].image_url,
                        isFlipped: false,
                        isMatched: false
                    }
                );
            }
        });

        // Shuffle cards
        const shuffledCards = shuffleArray(cardPairs);
        setCards(shuffledCards);
    };

    const shuffleArray = (array) => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    };

    const startGame = () => {
        setGameStarted(true);
        setTime(0);
        setMoves(0);
        setScore(0);
        setLives(3);
        setMatchedPairs([]);
        setFlippedCards([]);
        setGameCompleted(false);
    };

    const handleCardClick = (cardId) => {
        if (!gameStarted || gameCompleted) return;

        const card = cards.find(c => c.id === cardId);
        if (!card || card.isFlipped || card.isMatched) return;

        // Flip the card
        const updatedCards = cards.map(c =>
            c.id === cardId ? { ...c, isFlipped: true } : c
        );
        setCards(updatedCards);

        const newFlippedCards = [...flippedCards, cardId];
        setFlippedCards(newFlippedCards);

        // Check for match
        if (newFlippedCards.length === 2) {
            setMoves(prev => prev + 1);

            const [firstId, secondId] = newFlippedCards;
            const firstCard = cards.find(c => c.id === firstId);
            const secondCard = cards.find(c => c.id === secondId);

            if (firstCard.pairId === secondCard.pairId) {
                // Match found
                setTimeout(() => {
                    const matchedCards = updatedCards.map(c =>
                        newFlippedCards.includes(c.id) ? { ...c, isMatched: true } : c
                    );
                    setCards(matchedCards);
                    setMatchedPairs(prev => [...prev, firstCard.pairId]);
                    setScore(prev => prev + 100);
                    setFlippedCards([]);

                    // Check if game is completed
                    if (matchedCards.every(c => c.isMatched)) {
                        completeGame();
                    }
                }, 500);
            } else {
                // No match
                setTimeout(() => {
                    const resetCards = updatedCards.map(c =>
                        newFlippedCards.includes(c.id) ? { ...c, isFlipped: false } : c
                    );
                    setCards(resetCards);
                    setFlippedCards([]);
                    setLives(prev => prev - 1);

                    if (lives <= 1) {
                        gameOver();
                    }
                }, 1000);
            }
        }
    };

    const completeGame = async () => {
        setGameCompleted(true);
        const finalScore = score + (lives * 50) + Math.max(0, 300 - time * 2);
        setScore(finalScore);

        // Save game result
        if (user?.user_id) {
            try {
                await recordGameplay({ userId: user.user_id, gameId: parseInt(gameId), score: finalScore });
                toast.success('Kết quả đã được lưu!');
            } catch (err) {
                console.error('Failed to save game result:', err);
            }
        }

        toast.success('Chúc mừng! Bạn đã hoàn thành game!');
    };

    const gameOver = () => {
        setGameCompleted(true);
        toast.error('Hết mạng! Hãy thử lại!');
    };

    const resetGame = () => {
        if (game) {
            initializeGame(game.gamecontents);
        }
        setGameStarted(false);
        setGameCompleted(false);
        setScore(0);
        setMoves(0);
        setTime(0);
        setLives(3);
        setMatchedPairs([]);
        setFlippedCards([]);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getProgressPercentage = () => {
        if (!cards.length) return 0;
        return (matchedPairs.length / (cards.length / 2)) * 100;
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
                            onClick={() => navigate('/games')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Quay lại danh sách game
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

            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/games')}
                                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{game?.title || 'Game Ghép Cặp'}</h1>
                                <p className="text-gray-600">Ghép các cặp hình ảnh giống nhau</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => navigate('/games')}
                                className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg flex items-center gap-2"
                            >
                                <Home className="w-4 h-4" />
                                Trang chủ
                            </button>
                            <button
                                onClick={resetGame}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Chơi lại
                            </button>
                        </div>
                    </div>
                </div>

                {/* Game Stats */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <Clock className="w-5 h-5 text-blue-500" />
                                <span className="text-sm text-gray-600">Thời gian</span>
                            </div>
                            <div className="text-xl font-bold text-gray-900">{formatTime(time)}</div>
                        </div>

                        <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <Target className="w-5 h-5 text-green-500" />
                                <span className="text-sm text-gray-600">Lượt đi</span>
                            </div>
                            <div className="text-xl font-bold text-gray-900">{moves}</div>
                        </div>

                        <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <Trophy className="w-5 h-5 text-yellow-500" />
                                <span className="text-sm text-gray-600">Điểm</span>
                            </div>
                            <div className="text-xl font-bold text-gray-900">{score}</div>
                        </div>

                        <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <Heart className="w-5 h-5 text-red-500" />
                                <span className="text-sm text-gray-600">Mạng</span>
                            </div>
                            <div className="text-xl font-bold text-gray-900">{lives}</div>
                        </div>

                        <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <CheckCircle className="w-5 h-5 text-purple-500" />
                                <span className="text-sm text-gray-600">Tiến độ</span>
                            </div>
                            <div className="text-xl font-bold text-gray-900">
                                {Math.round(getProgressPercentage())}%
                            </div>
                        </div>
                    </div>
                </div>

                {/* Game Start Screen */}
                {!gameStarted && !gameCompleted && (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                        <div className="text-6xl mb-6">🧩</div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Sẵn sàng chơi?</h2>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                            Ghép các cặp hình ảnh giống nhau để luyện tập từ vựng tiếng Anh.
                            Bạn có 3 mạng và cần hoàn thành càng nhanh càng tốt!
                        </p>
                        <button
                            onClick={startGame}
                            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 text-lg font-semibold flex items-center gap-2 mx-auto"
                        >
                            Bắt đầu chơi
                        </button>
                    </div>
                )}

                {/* Game Completed Screen */}
                {gameCompleted && (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                        <div className="text-6xl mb-6">🎉</div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            {lives > 0 ? 'Chúc mừng!' : 'Game Over!'}
                        </h2>
                        <p className="text-gray-600 mb-8">
                            {lives > 0
                                ? 'Bạn đã hoàn thành game thành công!'
                                : 'Hết mạng rồi! Hãy thử lại nhé!'
                            }
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-lg mx-auto">
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">{formatTime(time)}</div>
                                <div className="text-sm text-gray-600">Thời gian</div>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">{moves}</div>
                                <div className="text-sm text-gray-600">Lượt đi</div>
                            </div>
                            <div className="text-center p-4 bg-purple-50 rounded-lg">
                                <div className="text-2xl font-bold text-purple-600">{score}</div>
                                <div className="text-sm text-gray-600">Điểm số</div>
                            </div>
                        </div>

                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={resetGame}
                                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                            >
                                Chơi lại
                            </button>
                            <button
                                onClick={() => navigate('/games')}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                Về danh sách game
                            </button>
                        </div>
                    </div>
                )}

                {/* Game Board */}
                {gameStarted && !gameCompleted && (
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {cards.map((card) => (
                                <div
                                    key={card.id}
                                    onClick={() => handleCardClick(card.id)}
                                    className={`aspect-square rounded-lg cursor-pointer transition-all duration-300 transform ${card.isFlipped || card.isMatched
                                        ? 'rotate-y-180'
                                        : 'hover:scale-105'
                                        } ${card.isMatched
                                            ? 'opacity-50'
                                            : card.isFlipped
                                                ? 'bg-white shadow-lg'
                                                : 'bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg'
                                        }`}
                                >
                                    <div className="w-full h-full flex items-center justify-center">
                                        {card.isFlipped || card.isMatched ? (
                                            <img
                                                src={card.imageUrl}
                                                alt="Card"
                                                className="w-full h-full object-cover rounded-lg"
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/150x150?text=Image';
                                                }}
                                            />
                                        ) : (
                                            <div className="text-white text-4xl">?</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Progress Bar */}
                {gameStarted && (
                    <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Tiến độ</span>
                            <span className="text-sm text-gray-500">
                                {matchedPairs.length} / {cards.length / 2} cặp
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${getProgressPercentage()}%` }}
                            ></div>
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default GamePlay; 