const sequelize = require("../config/database");
const initModels = require("../models/init-models");
const models = initModels(sequelize);
const { Op } = require("sequelize");

class AIController {
    // Phát hiện nội dung spam/không phù hợp
    static async detectInappropriateContent(content, contentType = "text") {
        try {
            // Danh sách từ khóa cấm
            const bannedWords = [
                "spam", "quảng cáo", "lừa đảo", "virus", "hack", "crack",
                "sex", "porn", "drug", "violence", "hate", "racism"
            ];

            const contentLower = content.toLowerCase();
            let spamScore = 0;
            let inappropriateScore = 0;
            let detectedIssues = [];

            // Kiểm tra từ khóa cấm
            for (const word of bannedWords) {
                if (contentLower.includes(word)) {
                    inappropriateScore += 10;
                    detectedIssues.push(`Chứa từ khóa cấm: ${word}`);
                }
            }

            // Kiểm tra spam (lặp lại nội dung)
            const words = content.split(/\s+/);
            const wordCount = {};
            words.forEach(word => {
                wordCount[word] = (wordCount[word] || 0) + 1;
            });

            const repeatedWords = Object.entries(wordCount)
                .filter(([word, count]) => count > 3 && word.length > 2)
                .length;

            if (repeatedWords > 5) {
                spamScore += 20;
                detectedIssues.push("Nội dung lặp lại nhiều từ");
            }

            // Kiểm tra độ dài quá ngắn hoặc quá dài
            if (content.length < 10) {
                spamScore += 15;
                detectedIssues.push("Nội dung quá ngắn");
            }

            if (content.length > 5000) {
                inappropriateScore += 5;
                detectedIssues.push("Nội dung quá dài");
            }

            // Kiểm tra link spam
            const urlRegex = /(https?:\/\/[^\s]+)/g;
            const urls = content.match(urlRegex) || [];
            if (urls.length > 3) {
                spamScore += 25;
                detectedIssues.push("Chứa quá nhiều link");
            }

            const totalScore = spamScore + inappropriateScore;
            const isInappropriate = totalScore > 30;
            const confidence = Math.min(totalScore, 100);

            return {
                is_inappropriate: isInappropriate,
                spam_score: spamScore,
                inappropriate_score: inappropriateScore,
                total_score: totalScore,
                confidence: confidence,
                detected_issues: detectedIssues,
                recommendation: isInappropriate ? "reject" : "approve"
            };
        } catch (error) {
            console.error(`Error in detectInappropriateContent: ${error.message}`);
            return {
                is_inappropriate: false,
                spam_score: 0,
                inappropriate_score: 0,
                total_score: 0,
                confidence: 0,
                detected_issues: [],
                recommendation: "approve"
            };
        }
    }

    // Phân tích phát âm
    static async analyzePronunciation(audioUrl, textToCompare) {
        try {
            // Giả lập phân tích AI (trong thực tế sẽ tích hợp với AI service)
            const analysis = {
                pronunciation_score: Math.floor(Math.random() * 30) + 70, // 70-100
                accuracy: Math.floor(Math.random() * 20) + 80, // 80-100
                fluency: Math.floor(Math.random() * 25) + 75, // 75-100
                intonation: Math.floor(Math.random() * 20) + 80, // 80-100
                word_analysis: [
                    {
                        word: "hello",
                        pronunciation: "həˈloʊ",
                        user_pronunciation: "həˈloʊ",
                        accuracy: 95,
                        feedback: "Phát âm tốt"
                    },
                    {
                        word: "world",
                        pronunciation: "wɜːld",
                        user_pronunciation: "wɜːld",
                        accuracy: 88,
                        feedback: "Cần cải thiện âm /ɜː/"
                    }
                ],
                overall_feedback: "Phát âm của bạn khá tốt, cần cải thiện một số âm cụ thể và tăng tốc độ nói.",
                suggestions: [
                    "Cải thiện phát âm âm /θ/ và /ð/",
                    "Tăng tốc độ nói tự nhiên hơn",
                    "Nhấn mạnh từ khóa trong câu",
                    "Luyện tập ngữ điệu câu"
                ]
            };

            return {
                status: "success",
                data: analysis,
                message: "Phân tích phát âm thành công"
            };
        } catch (error) {
            console.error(`Error in analyzePronunciation: ${error.message}`);
            throw new Error(error.message);
        }
    }

    // Kiểm tra ngữ pháp
    static async checkGrammar(text) {
        try {
            // Giả lập kiểm tra ngữ pháp AI
            const grammarCheck = {
                overall_score: Math.floor(Math.random() * 20) + 80, // 80-100
                errors: [
                    {
                        type: "grammar",
                        message: "Sử dụng thì quá khứ đơn thay vì hiện tại hoàn thành",
                        suggestion: "I went to school yesterday instead of I have gone to school yesterday",
                        position: { start: 10, end: 15 },
                        severity: "medium"
                    },
                    {
                        type: "spelling",
                        message: "Sai chính tả",
                        suggestion: "beautiful instead of beautifull",
                        position: { start: 25, end: 35 },
                        severity: "low"
                    }
                ],
                suggestions: [
                    "Sử dụng cấu trúc câu đa dạng hơn",
                    "Thêm từ nối để mạch lạc hơn",
                    "Kiểm tra thì của động từ"
                ],
                corrected_text: "I went to school yesterday and studied English. The weather was beautiful.",
                word_count: text.split(/\s+/).length,
                sentence_count: text.split(/[.!?]+/).length - 1
            };

            return {
                status: "success",
                data: grammarCheck,
                message: "Kiểm tra ngữ pháp thành công"
            };
        } catch (error) {
            console.error(`Error in checkGrammar: ${error.message}`);
            throw new Error(error.message);
        }
    }

    // Tạo câu hỏi tự động từ nội dung
    static async generateQuestions(content, difficulty = "medium", count = 5) {
        try {
            // Giả lập tạo câu hỏi AI
            const questions = [];
            const questionTypes = ["multiple_choice", "true_false", "fill_blank"];

            for (let i = 0; i < count; i++) {
                const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];

                let question = {
                    id: i + 1,
                    type: questionType,
                    difficulty: difficulty,
                    points: difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3
                };

                switch (questionType) {
                    case "multiple_choice":
                        question.question = "What is the main topic of this text?";
                        question.options = [
                            "Technology",
                            "Education",
                            "Environment",
                            "Health"
                        ];
                        question.correct_answer = 1;
                        break;

                    case "true_false":
                        question.question = "The text mentions the importance of learning English.";
                        question.correct_answer = true;
                        break;

                    case "fill_blank":
                        question.question = "Learning English helps you to _____ better job opportunities.";
                        question.correct_answer = "find";
                        question.hints = ["verb", "synonym of discover"];
                        break;
                }

                questions.push(question);
            }

            return {
                status: "success",
                data: {
                    questions,
                    total_points: questions.reduce((sum, q) => sum + q.points, 0),
                    estimated_time: count * 2 // 2 phút mỗi câu
                },
                message: "Tạo câu hỏi thành công"
            };
        } catch (error) {
            console.error(`Error in generateQuestions: ${error.message}`);
            throw new Error(error.message);
        }
    }

    // Dịch thuật AI
    static async translateText(text, fromLang = "en", toLang = "vi") {
        try {
            // Giả lập dịch thuật AI
            const translations = {
                "en-vi": {
                    "Hello world": "Xin chào thế giới",
                    "How are you?": "Bạn khỏe không?",
                    "I love learning English": "Tôi thích học tiếng Anh"
                },
                "vi-en": {
                    "Xin chào thế giới": "Hello world",
                    "Bạn khỏe không?": "How are you?",
                    "Tôi thích học tiếng Anh": "I love learning English"
                }
            };

            const translationKey = `${fromLang}-${toLang}`;
            const translation = translations[translationKey]?.[text] || `[Translated: ${text}]`;

            return {
                status: "success",
                data: {
                    original_text: text,
                    translated_text: translation,
                    from_language: fromLang,
                    to_language: toLang,
                    confidence: Math.floor(Math.random() * 20) + 80
                },
                message: "Dịch thuật thành công"
            };
        } catch (error) {
            console.error(`Error in translateText: ${error.message}`);
            throw new Error(error.message);
        }
    }

    // Tạo tóm tắt nội dung
    static async summarizeContent(content, maxLength = 200) {
        try {
            // Giả lập tóm tắt AI
            const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
            const summary = sentences.slice(0, 3).join(". ") + ".";

            return {
                status: "success",
                data: {
                    original_length: content.length,
                    summary_length: summary.length,
                    summary: summary,
                    key_points: [
                        "Điểm chính 1",
                        "Điểm chính 2",
                        "Điểm chính 3"
                    ],
                    reading_time: Math.ceil(content.length / 200) // 200 ký tự/phút
                },
                message: "Tạo tóm tắt thành công"
            };
        } catch (error) {
            console.error(`Error in summarizeContent: ${error.message}`);
            throw new Error(error.message);
        }
    }

    // Gợi ý nội dung liên quan
    static async suggestRelatedContent(content, contentType = "post", limit = 5) {
        try {
            // Giả lập gợi ý AI
            const suggestions = [];

            for (let i = 0; i < limit; i++) {
                suggestions.push({
                    id: i + 1,
                    title: `Nội dung liên quan ${i + 1}`,
                    type: contentType,
                    relevance_score: Math.floor(Math.random() * 30) + 70,
                    tags: ["english", "learning", "grammar"],
                    preview: "Đây là nội dung liên quan được AI gợi ý...",
                    created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
                });
            }

            return {
                status: "success",
                data: suggestions,
                message: "Gợi ý nội dung thành công"
            };
        } catch (error) {
            console.error(`Error in suggestRelatedContent: ${error.message}`);
            throw new Error(error.message);
        }
    }

    // Phân tích cảm xúc của comment
    static async analyzeSentiment(text) {
        try {
            // Giả lập phân tích cảm xúc AI
            const positiveWords = ["good", "great", "excellent", "amazing", "love", "like", "happy"];
            const negativeWords = ["bad", "terrible", "awful", "hate", "dislike", "sad", "angry"];

            const textLower = text.toLowerCase();
            let positiveCount = 0;
            let negativeCount = 0;

            positiveWords.forEach(word => {
                if (textLower.includes(word)) positiveCount++;
            });

            negativeWords.forEach(word => {
                if (textLower.includes(word)) negativeCount++;
            });

            let sentiment = "neutral";
            let score = 0;

            if (positiveCount > negativeCount) {
                sentiment = "positive";
                score = Math.min((positiveCount - negativeCount) * 20, 100);
            } else if (negativeCount > positiveCount) {
                sentiment = "negative";
                score = Math.min((negativeCount - positiveCount) * 20, 100);
            }

            return {
                status: "success",
                data: {
                    sentiment,
                    score,
                    positive_words: positiveCount,
                    negative_words: negativeCount,
                    confidence: Math.floor(Math.random() * 20) + 80
                },
                message: "Phân tích cảm xúc thành công"
            };
        } catch (error) {
            console.error(`Error in analyzeSentiment: ${error.message}`);
            throw new Error(error.message);
        }
    }

    // Tạo bài tập tự động
    static async generateExercise(content, skillType = "grammar", difficulty = "medium") {
        try {
            // Giả lập tạo bài tập AI
            const exercise = {
                id: Date.now(),
                title: `Bài tập ${skillType} - ${difficulty}`,
                skill_type: skillType,
                difficulty: difficulty,
                content: content,
                questions: [],
                time_limit: difficulty === "easy" ? 300 : difficulty === "medium" ? 600 : 900,
                total_points: 0
            };

            const questionCount = difficulty === "easy" ? 5 : difficulty === "medium" ? 8 : 12;

            for (let i = 0; i < questionCount; i++) {
                const question = {
                    id: i + 1,
                    type: "multiple_choice",
                    question: `Câu hỏi ${i + 1} về ${skillType}`,
                    options: ["A", "B", "C", "D"],
                    correct_answer: Math.floor(Math.random() * 4),
                    explanation: "Giải thích đáp án",
                    points: difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3
                };

                exercise.questions.push(question);
                exercise.total_points += question.points;
            }

            return {
                status: "success",
                data: exercise,
                message: "Tạo bài tập thành công"
            };
        } catch (error) {
            console.error(`Error in generateExercise: ${error.message}`);
            throw new Error(error.message);
        }
    }
}

module.exports = AIController; 