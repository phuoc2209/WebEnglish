const express = require("express");
const router = express.Router();
const AIController = require("../controller/aiController");
const { authenticateToken, authenticateUser } = require("../middlewares/authMiddleware");

// Phát hiện nội dung không phù hợp
router.post("/detect-content", authenticateUser, async (req, res) => {
    try {
        const { content, content_type } = req.body;
        const result = await AIController.detectInappropriateContent(content, content_type);
        res.json({
            status: "success",
            data: result
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
});

// Phân tích phát âm
router.post("/analyze-pronunciation", authenticateUser, async (req, res) => {
    try {
        const { audio_url, text_to_compare } = req.body;
        const result = await AIController.analyzePronunciation(audio_url, text_to_compare);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
});

// Kiểm tra ngữ pháp
router.post("/check-grammar", authenticateUser, async (req, res) => {
    try {
        const { text } = req.body;
        const result = await AIController.checkGrammar(text);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
});

// Tạo câu hỏi tự động
router.post("/generate-questions", authenticateUser, async (req, res) => {
    try {
        const { content, difficulty, count } = req.body;
        const result = await AIController.generateQuestions(content, difficulty, count);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
});

// Dịch thuật
router.post("/translate", authenticateUser, async (req, res) => {
    try {
        const { text, from_lang, to_lang } = req.body;
        const result = await AIController.translateText(text, from_lang, to_lang);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
});

// Tạo tóm tắt nội dung
router.post("/summarize", authenticateUser, async (req, res) => {
    try {
        const { content, max_length } = req.body;
        const result = await AIController.summarizeContent(content, max_length);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
});

// Gợi ý nội dung liên quan
router.post("/suggest-content", authenticateUser, async (req, res) => {
    try {
        const { content, content_type, limit } = req.body;
        const result = await AIController.suggestRelatedContent(content, content_type, limit);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
});

// Phân tích cảm xúc
router.post("/analyze-sentiment", authenticateUser, async (req, res) => {
    try {
        const { text } = req.body;
        const result = await AIController.analyzeSentiment(text);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
});

// Tạo bài tập tự động
router.post("/generate-exercise", authenticateUser, async (req, res) => {
    try {
        const { content, skill_type, difficulty } = req.body;
        const result = await AIController.generateExercise(content, skill_type, difficulty);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
});

module.exports = router; 