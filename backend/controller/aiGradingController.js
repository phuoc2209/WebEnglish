const fs = require('fs');
const path = require('path');
const cloudinary = require('../config/cloudinaryConfig');
const {
    transcribeWithWhisper,
    transcribeWithGoogle,
    gradeSpeakingWithGPT,
    gradeWritingWithGPT
} = require('../services/aiGradingService');

// Chấm điểm speaking
async function gradeSpeaking(req, res) {
    let cloudinaryResult = null;
    try {
        console.log('Speaking grading request received:', req.body);
        console.log('Audio file:', req.file);

        const audioFile = req.file;
        if (!audioFile) {
            console.log('No audio file uploaded');
            return res.status(400).json({ error: 'No audio file uploaded' });
        }

        // Kiểm tra định dạng file
        const allowedFormats = ['audio/wav', 'audio/webm', 'audio/mp3', 'audio/mp4', 'audio/mpeg', 'audio/ogg'];
        const fileMimeType = audioFile.mimetype;

        console.log('File MIME type:', fileMimeType);
        console.log('File extension:', audioFile.originalname);

        if (!allowedFormats.includes(fileMimeType)) {
            console.log('Unsupported file format:', fileMimeType);
            return res.status(400).json({
                error: `Unsupported file format: ${fileMimeType}. Supported formats: ${allowedFormats.join(', ')}`
            });
        }

        const audioPath = audioFile.path;
        console.log('Audio path:', audioPath);

        // Kiểm tra và đảm bảo file có extension đúng
        const fileExtension = path.extname(audioFile.originalname).toLowerCase();
        const supportedExtensions = ['.wav', '.webm', '.mp3', '.m4a', '.mp4', '.mpeg', '.mpga', '.oga', '.ogg'];

        if (!supportedExtensions.includes(fileExtension)) {
            console.log('Unsupported file extension:', fileExtension);
            return res.status(400).json({
                error: `Unsupported file extension: ${fileExtension}. Supported extensions: ${supportedExtensions.join(', ')}`
            });
        }

        // Upload lên Cloudinary trước khi xử lý
        console.log('Uploading to Cloudinary...');
        cloudinaryResult = await cloudinary.uploader.upload(audioPath, {
            folder: 'speaking-submissions',
            resource_type: 'video', // Cloudinary xử lý audio như video
            transformation: [
                { quality: 'auto' }
            ]
        });
        console.log('Cloudinary upload successful:', cloudinaryResult.secure_url);

        // Chọn engine: whisper hoặc google (mặc định whisper)
        const engine = req.body.engine || 'whisper';
        console.log('Using engine:', engine);

        let transcript = '';
        if (engine === 'google') {
            console.log('Using Google Speech-to-Text...');
            transcript = await transcribeWithGoogle(audioPath);
        } else {
            console.log('Using Whisper...');
            try {
                transcript = await transcribeWithWhisper(audioPath);
            } catch (whisperError) {
                console.log('Whisper failed, falling back to Google Speech-to-Text:', whisperError.message);
                transcript = await transcribeWithGoogle(audioPath);
            }
        }

        console.log('Transcript:', transcript);
        console.log('Starting GPT grading...');
        const grading = await gradeSpeakingWithGPT(transcript);
        console.log('GPT grading result:', grading);

        // Trả về kết quả với URL Cloudinary
        res.json({
            transcript,
            ...grading,
            audioUrl: cloudinaryResult.secure_url,
            audioPublicId: cloudinaryResult.public_id
        });
    } catch (err) {
        console.error('Error in gradeSpeaking:', err);

        // Xóa file từ Cloudinary nếu có lỗi
        if (cloudinaryResult && cloudinaryResult.public_id) {
            try {
                await cloudinary.uploader.destroy(cloudinaryResult.public_id, { resource_type: 'video' });
                console.log('Cleaned up Cloudinary file due to error');
            } catch (cleanupError) {
                console.error('Error cleaning up Cloudinary file:', cleanupError);
            }
        }

        res.status(500).json({ error: err.message });
    } finally {
        if (req.file && req.file.path) {
            console.log('Cleaning up local audio file:', req.file.path);
            fs.unlink(req.file.path, () => { });
        }
    }
}

// Chấm điểm writing
async function gradeWriting(req, res) {
    try {
        console.log('Writing grading request received:', req.body);
        const { text } = req.body;
        if (!text) {
            console.log('Missing text in request');
            return res.status(400).json({ error: 'Missing text' });
        }
        console.log('Starting AI grading for text:', text.substring(0, 100) + '...');
        const grading = await gradeWritingWithGPT(text);
        console.log('AI grading completed:', grading);
        res.json(grading);
    } catch (err) {
        console.error('Error in gradeWriting:', err);
        res.status(500).json({ error: err.message });
    }
}

module.exports = {
    gradeSpeaking,
    gradeWriting,
}; 