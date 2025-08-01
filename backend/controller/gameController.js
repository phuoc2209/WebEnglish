const sequelize = require("../config/database");
const initModels = require("../models/init-models");
const models = initModels(sequelize);

/**
 * Controller quản lý trò chơi học tập trên website học tiếng Anh
 */
class GameController {
  /**
   * Lấy danh sách tất cả trò chơi với phân trang
   * @param {Object} req - Yêu cầu HTTP
   * @param {number} limit - Số lượng bản ghi mỗi trang
   * @param {number} offset - Vị trí bắt đầu
   * @returns {Promise<Object>} - Danh sách trò chơi
   * @throws {Error} - Nếu truy vấn thất bại
   */
  static async getAll(req, limit = 10, offset = 0) {
    try {
      if (limit < 1 || offset < 0) throw new Error("Limit và offset phải là số dương");

      const games = await models.game.findAll({
        limit,
        offset,
        include: [
          {
            model: models.gamecontent,
            as: "gamecontents",
            attributes: ["content_id", "game_id", "pair_id", "image_url"],
          },
        ],
        attributes: ["game_id", "title"],
      });

      return {
        status: "success",
        data: games,
        message: "Lấy danh sách trò chơi thành công",
      };
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error in getAll: ${error.message}`);
      throw new Error(error.message);
    }
  }

  /**
   * Lấy thông tin trò chơi theo ID
   * @param {Object} req - Yêu cầu HTTP
   * @param {number} id - ID trò chơi
   * @returns {Promise<Object>} - Thông tin trò chơi
   * @throws {Error} - Nếu trò chơi không tồn tại hoặc truy vấn thất bại
   */
  static async getById(req, id) {
    try {
      if (!id || isNaN(id)) throw new Error("ID trò chơi không hợp lệ");

      const game = await models.game.findByPk(id, {
        include: [
          {
            model: models.gamecontent,
            as: "gamecontents",
            attributes: ["content_id", "game_id", "pair_id", "image_url"],
          },
        ],
        attributes: ["game_id", "title"],
      });
      if (!game) throw new Error("Không tìm thấy trò chơi");

      return {
        status: "success",
        data: game,
        message: "Lấy thông tin trò chơi thành công",
      };
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error in getById: ${error.message}`);
      throw new Error(error.message);
    }
  }

  /**
   * Tạo trò chơi mới (admin only)
   * @param {Object} req - Yêu cầu HTTP
   * @param {Object} data - Dữ liệu trò chơi
   * @returns {Promise<Object>} - Trò chơi vừa tạo
   * @throws {Error} - Nếu dữ liệu không hợp lệ hoặc truy vấn thất bại
   */
  static async create(req, data) {
    if (!req.user || req.user.role !== "admin") throw new Error("Quyền bị từ chối. Chỉ admin mới được thực hiện hành động này.");
    try {
      const { title } = data;
      if (!title || title.trim() === "") throw new Error("Tiêu đề không được để trống");
      if (title.length > 255) throw new Error("Tiêu đề quá dài (tối đa 255 ký tự)");

      const game = await models.game.create({
        title,
      });

      return {
        status: "success",
        data: game,
        message: "Tạo trò chơi thành công",
      };
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error in create: ${error.message}`);
      throw new Error(error.message);
    }
  }

  /**
   * Cập nhật thông tin trò chơi (admin only)
   * @param {Object} req - Yêu cầu HTTP
   * @param {number} id - ID trò chơi
   * @param {Object} data - Dữ liệu cập nhật
   * @returns {Promise<Object>} - Trò chơi đã cập nhật
   * @throws {Error} - Nếu dữ liệu không hợp lệ hoặc truy vấn thất bại
   */
  static async update(req, id, data) {
    if (!req.user || req.user.role !== "admin") throw new Error("Quyền bị từ chối. Chỉ admin mới được thực hiện hành động này.");
    try {
      if (!id || isNaN(id)) throw new Error("ID trò chơi không hợp lệ");
      const { title } = data;
      if (title && (title.trim() === "" || title.length > 255)) throw new Error("Tiêu đề không hợp lệ (1-255 ký tự)");

      const [updated] = await models.game.update(
        {
          title: title || undefined,
        },
        { where: { game_id: id } }
      );
      if (!updated) throw new Error("Không tìm thấy trò chơi để cập nhật");

      const game = await this.getById(req, id);
      return game;
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error in update: ${error.message}`);
      throw new Error(error.message);
    }
  }

  /**
   * Xóa trò chơi (admin only)
   * @param {Object} req - Yêu cầu HTTP
   * @param {number} id - ID trò chơi
   * @returns {Promise<Object>} - Kết quả xóa
   * @throws {Error} - Nếu dữ liệu không hợp lệ hoặc truy vấn thất bại
   */
  static async delete(req, id) {
    if (!req.user || req.user.role !== "admin") throw new Error("Quyền bị từ chối. Chỉ admin mới được thực hiện hành động này.");
    const transaction = await sequelize.transaction();
    try {
      if (!id || isNaN(id)) throw new Error("ID trò chơi không hợp lệ");

      await models.gamecontent.destroy({ where: { game_id: id }, transaction });
      await models.gameplay.destroy({ where: { game_id: id }, transaction });
      const deleted = await models.game.destroy({ where: { game_id: id }, transaction });
      if (!deleted) throw new Error("Không tìm thấy trò chơi để xóa");

      await transaction.commit();
      return {
        status: "success",
        data: null,
        message: "Xóa trò chơi thành công",
      };
    } catch (error) {
      await transaction.rollback();
      console.error(`[${new Date().toISOString()}] Error in delete: ${error.message}`);
      throw new Error(error.message);
    }
  }

  /**
   * Ghi nhận lượt chơi của người dùng
   * @param {Object} req - Yêu cầu HTTP
   * @param {number} userId - ID người dùng
   * @param {number} gameId - ID trò chơi
   * @param {number} score - Điểm số
   * @returns {Promise<Object>} - Thông tin lượt chơi
   * @throws {Error} - Nếu dữ liệu không hợp lệ hoặc truy vấn thất bại
   */
  static async recordGameplay(req, userId, gameId, score) {
    try {
      if (!userId || isNaN(userId)) throw new Error("ID người dùng không hợp lệ");
      if (!gameId || isNaN(gameId)) throw new Error("ID trò chơi không hợp lệ");
      if (score < 0 || isNaN(score)) throw new Error("Điểm số không hợp lệ");
      if (req.user.user_id !== userId) throw new Error("Không có quyền ghi nhận lượt chơi cho người dùng này");

      const user = await models.user.findByPk(userId);
      if (!user) throw new Error("Không tìm thấy người dùng");
      const game = await models.game.findByPk(gameId);
      if (!game) throw new Error("Không tìm thấy trò chơi");

      const gameplay = await models.gameplay.create({
        user_id: userId,
        game_id: gameId,
        score,
        played_at: new Date(),
      });

      return {
        status: "success",
        data: gameplay,
        message: "Ghi nhận lượt chơi thành công",
      };
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error in recordGameplay: ${error.message}`);
      throw new Error(error.message);
    }
  }

  /**
   * Lấy lịch sử chơi game của người dùng
   * @param {Object} req - Yêu cầu HTTP
   * @param {number} userId - ID người dùng
   * @param {number} [gameId] - ID trò chơi (tùy chọn)
   * @returns {Promise<Object>} - Lịch sử chơi game
   * @throws {Error} - Nếu dữ liệu không hợp lệ hoặc truy vấn thất bại
   */
  static async getUserGameHistory(req, userId, gameId = null) {
    try {
      if (!userId || isNaN(userId)) throw new Error("ID người dùng không hợp lệ");
      if (gameId && isNaN(gameId)) throw new Error("ID trò chơi không hợp lệ");

      // Cho phép user xem lịch sử của chính mình hoặc admin xem lịch sử của bất kỳ ai
      const currentUserId = parseInt(req.user?.user_id);
      const requestedUserId = parseInt(userId);

      if (currentUserId !== requestedUserId && req.user?.role !== "admin") {
        throw new Error("Không có quyền truy cập lịch sử chơi game của người dùng này");
      }

      const whereClause = { user_id: userId };
      if (gameId) whereClause.game_id = gameId;

      const gameplays = await models.gameplay.findAll({
        where: whereClause,
        include: [
          {
            model: models.game,
            as: "game",
            attributes: ["game_id", "title"],
          },
        ],
        order: [["played_at", "DESC"]],
        attributes: ["id", "user_id", "game_id", "score", "played_at"],
      });

      return {
        status: "success",
        data: gameplays,
        message: "Lấy lịch sử chơi game thành công",
      };
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error in getUserGameHistory: ${error.message}`);
      throw new Error(error.message);
    }
  }

  /**
   * Lấy điểm cao nhất của người dùng trong một trò chơi
   * @param {Object} req - Yêu cầu HTTP
   * @param {number} userId - ID người dùng
   * @param {number} gameId - ID trò chơi
   * @returns {Promise<Object>} - Điểm cao nhất
   * @throws {Error} - Nếu dữ liệu không hợp lệ hoặc truy vấn thất bại
   */
  static async getUserHighScore(req, userId, gameId) {
    try {
      if (!userId || isNaN(userId)) throw new Error("ID người dùng không hợp lệ");
      if (!gameId || isNaN(gameId)) throw new Error("ID trò chơi không hợp lệ");
      if (req.user.user_id !== userId && req.user.role !== "admin") throw new Error("Không có quyền truy cập điểm cao của người dùng này");

      const highScore = await models.gameplay.findOne({
        where: { user_id: userId, game_id: gameId },
        order: [["score", "DESC"]],
        attributes: ["id", "user_id", "game_id", "score", "played_at"],
      });

      return {
        status: "success",
        data: highScore || null,
        message: highScore ? "Lấy điểm cao nhất thành công" : "Chưa có điểm số cho trò chơi này",
      };
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error in getUserHighScore: ${error.message}`);
      throw new Error(error.message);
    }
  }

  /**
   * Lấy bảng xếp hạng của trò chơi
   * @param {Object} req - Yêu cầu HTTP
   * @param {number} gameId - ID trò chơi
   * @param {number} [limit=10] - Số bản ghi tối đa
   * @returns {Promise<Object>} - Bảng xếp hạng
   * @throws {Error} - Nếu dữ liệu không hợp lệ hoặc truy vấn thất bại
   */
  static async getGameLeaderboard(req, gameId, limit = 10) {
    try {
      if (!gameId || isNaN(gameId)) throw new Error("ID trò chơi không hợp lệ");
      if (limit < 1) throw new Error("Limit không hợp lệ");

      const leaderboard = await models.gameplay.findAll({
        where: { game_id: gameId },
        include: [
          {
            model: models.user,
            as: "user",
            attributes: ["user_id", "username"],
          },
        ],
        order: [["score", "DESC"], ["played_at", "ASC"]],
        limit,
        attributes: ["id", "user_id", "game_id", "score", "played_at"],
      });

      return {
        status: "success",
        data: leaderboard,
        message: "Lấy bảng xếp hạng thành công",
      };
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error in getGameLeaderboard: ${error.message}`);
      throw new Error(error.message);
    }
  }

  /**
   * Lấy thống kê của trò chơi
   * @param {Object} req - Yêu cầu HTTP
   * @param {number} gameId - ID trò chơi
   * @returns {Promise<Object>} - Thống kê trò chơi
   * @throws {Error} - Nếu dữ liệu không hợp lệ hoặc truy vấn thất bại
   */
  static async getGameStats(req, gameId) {
    try {
      if (!gameId || isNaN(gameId)) throw new Error("ID trò chơi không hợp lệ");

      const stats = await models.gameplay.findOne({
        where: { game_id: gameId },
        attributes: [
          [sequelize.fn("COUNT", sequelize.col("id")), "total_plays"],
          [sequelize.fn("AVG", sequelize.col("score")), "avg_score"],
          [sequelize.fn("MAX", sequelize.col("score")), "max_score"],
          [sequelize.fn("MIN", sequelize.col("score")), "min_score"],
        ],
      });

      return {
        status: "success",
        data: stats || { total_plays: 0, avg_score: 0, max_score: 0, min_score: 0 },
        message: "Lấy thống kê trò chơi thành công",
      };
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error in getGameStats: ${error.message}`);
      throw new Error(error.message);
    }
  }
}

module.exports = GameController;