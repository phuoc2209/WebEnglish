import api from '../services/api';

/**
 * @typedef {Object} GameContent
 * @property {number} content_id
 * @property {number} game_id
 * @property {string} question
 * @property {string[]} options
 * @property {string} correct_answer
 * @property {string|null} hint
 */

/**
 * @typedef {Object} Game
 * @property {number} game_id
 * @property {string} title
 * @property {string} description
 * @property {GameContent[]} gamecontents
 */

/**
 * @typedef {Object} Gameplay
 * @property {number} id
 * @property {number} user_id
 * @property {number} game_id
 * @property {number} score
 * @property {string} played_at
 * @property {Game} game
 */

/**
 * @typedef {Object} GameStats
 * @property {number} total_plays
 * @property {number} avg_score
 * @property {number} max_score
 * @property {number} min_score
 */

/**
 * @typedef {Object} GamesResponse
 * @property {"success"|"error"} status
 * @property {Game[]} data
 * @property {string} message
 * @property {Object} pagination
 * @property {number} pagination.limit
 * @property {number} pagination.offset
 * @property {number} pagination.count
 */

/**
 * @typedef {Object} GameResponse
 * @property {"success"|"error"} status
 * @property {Game} data
 * @property {string} message
 */

/**
 * @typedef {Object} GameplayResponse
 * @property {"success"|"error"} status
 * @property {Gameplay} data
 * @property {string} message
 */

/**
 * @typedef {Object} GameHistoryResponse
 * @property {"success"|"error"} status
 * @property {Gameplay[]} data
 * @property {string} message
 */

/**
 * @typedef {Object} HighScoreResponse
 * @property {"success"|"error"} status
 * @property {Gameplay|null} data
 * @property {string} message
 */

/**
 * @typedef {Object} LeaderboardResponse
 * @property {"success"|"error"} status
 * @property {Gameplay[]} data
 * @property {string} message
 */

/**
 * @typedef {Object} StatsResponse
 * @property {"success"|"error"} status
 * @property {GameStats} data
 * @property {string} message
 */

/**
 * Lấy tất cả trò chơi với phân trang
 * @param {number} limit
 * @param {number} offset
 * @returns {Promise<GamesResponse>}
 */
export async function getAllGames(limit = 10, offset = 0) {
  try {
    const response = await api.get('/games', { params: { limit, offset } });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }
}

/**
 * Lấy trò chơi theo ID
 * @param {number} id
 * @returns {Promise<GameResponse>}
 */
export async function getGameById(id) {
  try {
    const response = await api.get(`/games/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }
}

/**
 * Tạo trò chơi mới (admin)
 * @param {{title: string, description?: string}} data
 * @returns {Promise<GameResponse>}
 */
export async function createGame(data) {
  try {
    const response = await api.post('/games', data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }
}

/**
 * Cập nhật trò chơi (admin)
 * @param {number} id
 * @param {{title?: string, description?: string}} data
 * @returns {Promise<GameResponse>}
 */
export async function updateGame(id, data) {
  try {
    const response = await api.put(`/games/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }
}

/**
 * Xóa trò chơi (admin)
 * @param {number} id
 * @returns {Promise<GameResponse>}
 */
export async function deleteGame(id) {
  try {
    const response = await api.delete(`/games/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }
}

/**
 * Ghi nhận lượt chơi
 * @param {{userId: number, gameId: number, score: number}} data
 * @returns {Promise<GameplayResponse>}
 */
export async function recordGameplay(data) {
  try {
    const response = await api.post('/games/play', data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }
}

/**
 * Lấy lịch sử chơi game của người dùng
 * @param {number} userId
 * @param {number|null} gameId
 * @returns {Promise<GameHistoryResponse>}
 */
export async function getUserGameHistory(userId, gameId = null) {
  try {
    const params = gameId ? { gameId } : {};
    const response = await api.get(`/games/history/${userId}`, { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }
}

/**
 * Lấy điểm cao nhất của người dùng cho một trò chơi
 * @param {number} userId
 * @param {number} gameId
 * @returns {Promise<HighScoreResponse>}
 */
export async function getUserHighScore(userId, gameId) {
  try {
    const response = await api.get(`/games/user/${userId}/highscore/${gameId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }
}

/**
 * Lấy bảng xếp hạng cho một trò chơi
 * @param {number} gameId
 * @param {number} limit
 * @returns {Promise<LeaderboardResponse>}
 */
export async function getGameLeaderboard(gameId, limit = 10) {
  try {
    const response = await api.get(`/games/${gameId}/leaderboard`, { params: { limit } });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }
}

/**
 * Lấy thống kê trò chơi
 * @param {number} gameId
 * @returns {Promise<StatsResponse>}
 */
export async function getGameStats(gameId) {
  try {
    const response = await api.get(`/games/${gameId}/stats`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kết nối đến máy chủ");
  }
}