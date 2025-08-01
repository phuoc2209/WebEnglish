import * as GameModel from '../models/game.model';

/**
 * Controller quản lý logic trò chơi học tập
 */
export class GameController {
  /**
   * Lấy tất cả trò chơi
   * @param {number} limit
   * @param {number} offset
   * @returns {Promise<GamesResponse>}
   */
  static async getAllGames(limit = 10, offset = 0) {
    if (limit < 1 || offset < 0) throw new Error('Limit hoặc offset không hợp lệ');
    try {
      return await GameModel.getAllGames(limit, offset);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi lấy danh sách trò chơi';
      throw new Error(message);
    }
  }

  /**
   * Lấy trò chơi theo ID
   * @param {number} id
   * @returns {Promise<GameResponse>}
   */
  static async getGameById(id) {
    if (!id || isNaN(id)) throw new Error('ID trò chơi không hợp lệ');
    try {
      return await GameModel.getGameById(id);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi lấy thông tin trò chơi';
      throw new Error(message);
    }
  }

  /**
   * Tạo trò chơi mới (admin)
   * @param {{title: string, description?: string}} data
   * @returns {Promise<GameResponse>}
   */
  static async createGame(data) {
    const { title } = data;
    if (!title || title.trim() === '') throw new Error('Tiêu đề không được để trống');
    if (title.length > 255) throw new Error('Tiêu đề quá dài (tối đa 255 ký tự)');
    try {
      return await GameModel.createGame(data);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi tạo trò chơi';
      throw new Error(message);
    }
  }

  /**
   * Cập nhật trò chơi (admin)
   * @param {number} id
   * @param {{title?: string, description?: string}} data
   * @returns {Promise<GameResponse>}
   */
  static async updateGame(id, data) {
    if (!id || isNaN(id)) throw new Error('ID trò chơi không hợp lệ');
    const { title } = data;
    if (title && (title.trim() === '' || title.length > 255)) throw new Error('Tiêu đề không hợp lệ (1-255 ký tự)');
    try {
      return await GameModel.updateGame(id, data);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi cập nhật trò chơi';
      throw new Error(message);
    }
  }

  /**
   * Xóa trò chơi (admin)
   * @param {number} id
   * @returns {Promise<GameResponse>}
   */
  static async deleteGame(id) {
    if (!id || isNaN(id)) throw new Error('ID trò chơi không hợp lệ');
    try {
      return await GameModel.deleteGame(id);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi xóa trò chơi';
      throw new Error(message);
    }
  }

  /**
   * Ghi nhận lượt chơi
   * @param {number} userId
   * @param {number} gameId
   * @param {number} score
   * @returns {Promise<GameplayResponse>}
   */
  static async recordGameplay(userId, gameId, score) {
    if (!userId || isNaN(userId)) throw new Error('ID người dùng không hợp lệ');
    if (!gameId || isNaN(gameId)) throw new Error('ID trò chơi không hợp lệ');
    if (score < 0 || isNaN(score)) throw new Error('Điểm số không hợp lệ');
    try {
      return await GameModel.recordGameplay({ userId, gameId, score });
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi ghi nhận lượt chơi';
      throw new Error(message);
    }
  }

  /**
   * Lấy lịch sử chơi game
   * @param {number} userId
   * @param {number|null} gameId
   * @returns {Promise<GameHistoryResponse>}
   */
  static async getUserGameHistory(userId, gameId = null) {
    if (!userId || isNaN(userId)) throw new Error('ID người dùng không hợp lệ');
    if (gameId && isNaN(gameId)) throw new Error('ID trò chơi không hợp lệ');
    try {
      return await GameModel.getUserGameHistory(userId, gameId);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi lấy lịch sử chơi game';
      throw new Error(message);
    }
  }

  /**
   * Lấy điểm cao nhất
   * @param {number} userId
   * @param {number} gameId
   * @returns {Promise<HighScoreResponse>}
   */
  static async getUserHighScore(userId, gameId) {
    if (!userId || isNaN(userId)) throw new Error('ID người dùng không hợp lệ');
    if (!gameId || isNaN(gameId)) throw new Error('ID trò chơi không hợp lệ');
    try {
      return await GameModel.getUserHighScore(userId, gameId);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi lấy điểm cao nhất';
      throw new Error(message);
    }
  }

  /**
   * Lấy bảng xếp hạng
   * @param {number} gameId
   * @param {number} limit
   * @returns {Promise<LeaderboardResponse>}
   */
  static async getGameLeaderboard(gameId, limit = 10) {
    if (!gameId || isNaN(gameId)) throw new Error('ID trò chơi không hợp lệ');
    if (limit < 1) throw new Error('Limit không hợp lệ');
    try {
      return await GameModel.getGameLeaderboard(gameId, limit);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi lấy bảng xếp hạng';
      throw new Error(message);
    }
  }

  /**
   * Lấy thống kê trò chơi
   * @param {number} gameId
   * @returns {Promise<StatsResponse>}
   */
  static async getGameStats(gameId) {
    if (!gameId || isNaN(gameId)) throw new Error('ID trò chơi không hợp lệ');
    try {
      return await GameModel.getGameStats(gameId);
    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi lấy thống kê trò chơi';
      throw new Error(message);
    }
  }
}