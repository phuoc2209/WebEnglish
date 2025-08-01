const { openaiApiKey, googleApiKey } = require('../config/aiConfig');
const { OpenAI } = require('openai');
const fs = require('fs');
const path = require('path');
const { SpeechClient } = require('@google-cloud/speech');

const openai = new OpenAI({ apiKey: openaiApiKey });

// --- Hàm kiểm tra đoạn văn có phải hoàn toàn tiếng Anh ---
function isPureEnglish(text) {
    // Cho phép: chữ cái tiếng Anh, số, dấu câu phổ biến, khoảng trắng
    const allowed = /^[a-zA-Z0-9\s.,!?'"()\-\n\r]+$/;
    return allowed.test(text.trim());
}

// Whisper (OpenAI) transcription
async function transcribeWithWhisper(audioPath) {
    const resp = await openai.audio.transcriptions.create({
        file: fs.createReadStream(audioPath),
        model: 'whisper-1',
        language: 'en',
    });
    return resp.text;
}

// Google Speech-to-Text transcription
async function transcribeWithGoogle(audioPath) {
    try {
        const client = new SpeechClient();

        const audioBytes = fs.readFileSync(audioPath).toString('base64');
        const audio = { content: audioBytes };
        const config = {
            encoding: 'WEBM_OPUS',
            sampleRateHertz: 48000,
            languageCode: 'en-US',
        };
        const request = { audio, config };

        const [response] = await client.recognize(request);
        const transcription = response.results
            .map(result => result.alternatives[0].transcript)
            .join('\n');

        return transcription;
    } catch (error) {
        console.error('Google Speech-to-Text error:', error);
        throw new Error('Failed to transcribe with Google Speech-to-Text');
    }
}

// Grade speaking with GPT
async function gradeSpeakingWithGPT(transcript) {
    if (!transcript || transcript.trim() === '') {
        return {
            contentScore: 0,
            grammarScore: 0,
            fluencyScore: 0,
            overall: 0,
            feedback: "Không có nội dung ghi âm để chấm điểm. Vui lòng thử lại và đảm bảo bạn nói rõ ràng."
        };
    }

    const prompt = `Bạn là giáo viên tiếng Anh. Dưới đây là nội dung một học sinh vừa nói trong bài kiểm tra kỹ năng nói:\n"Nội dung học viên: ${transcript}"\nHãy chấm điểm từ 0 đến 10 theo các tiêu chí và phản hồi bằng tiếng việt:\n1. Nội dung có đúng với chủ đề không?\n2. Ngữ pháp có chính xác không?\n3. Phát âm (nếu có transcript lỗi)?\n4. Tính lưu loát, tự nhiên.\nSau đó tổng kết và gợi ý cải thiện.\nTrả về kết quả JSON như sau:\n{\n  "contentScore": ...,\n  "grammarScore": ...,\n  "fluencyScore": ...,\n  "overall": ...,\n  "feedback": "..."\n}`;

    try {
        const gptResp = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.2
        });

        const content = gptResp.choices[0].message.content;
        const json = JSON.parse(content.match(/\{[\s\S]*\}/)[0]);
        return json;
    } catch (error) {
        console.error('GPT error in gradeSpeakingWithGPT:', error);
        return {
            contentScore: 0,
            grammarScore: 0,
            fluencyScore: 0,
            overall: 0,
            feedback: "Không thể chấm điểm bài nói do lỗi phân tích hoặc định dạng. Vui lòng thử lại."
        };
    }
}

// Grade writing with GPT
// --- Chấm điểm kỹ năng viết ---
async function gradeWritingWithGPT(text) {
    if (!text || text.trim().length < 20 || !isPureEnglish(text)) {
        return {
            grammarScore: 0,
            vocabularyScore: 0,
            coherenceScore: 0,
            structureScore: 0,
            overall: 0,
            feedback: "Đoạn văn phải hoàn toàn bằng tiếng Anh và có độ dài hợp lý để chấm điểm. Vui lòng thử lại."
        };
    }

    const prompt = `Bạn là giáo viên tiếng Anh. Dưới đây là đoạn văn học viên viết:\n"${text}"\nHãy chấm điểm kỹ năng viết theo thang điểm 10 theo các tiêu chí và phản hồi bằng tiếng Việt:\n- Ngữ pháp\n- Từ vựng\n- Tính mạch lạc\n- Cấu trúc đoạn văn\nNếu đoạn văn không phải tiếng Anh, hãy trả về điểm 0 và feedback cảnh báo. Trả về kết quả JSON như sau:\n{\n  "grammarScore": ...,\n  "vocabularyScore": ...,\n  "coherenceScore": ...,\n  "structureScore": ...,\n  "overall": ...,\n  "feedback": "..."\n}`;

    try {
        const gptResp = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.2
        });

        const content = gptResp.choices[0].message.content;
        const jsonMatch = content.match(/\{[\s\S]*\}/);

        if (!jsonMatch) throw new Error('GPT response not in JSON format');

        const json = JSON.parse(jsonMatch[0]);
        return json;
    } catch (error) {
        console.error('Error in gradeWritingWithGPT:', error);
        return {
            grammarScore: 0,
            vocabularyScore: 0,
            coherenceScore: 0,
            structureScore: 0,
            overall: 0,
            feedback: "Không thể chấm điểm kỹ năng viết vì nội dung không hợp lệ hoặc lỗi định dạng. Vui lòng thử lại với đoạn văn rõ ràng hơn."
        };
    }
}

module.exports = {
    transcribeWithWhisper,
    transcribeWithGoogle,
    gradeSpeakingWithGPT,
    gradeWritingWithGPT,
    isPureEnglish,
};
