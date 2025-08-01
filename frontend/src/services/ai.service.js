import api from './api';

export async function gradeSpeaking(audioFile, engine = 'whisper') {
    try {
        if (!audioFile || audioFile.size === 0) {
            throw new Error('Không có file âm thanh hoặc file bị trống.');
        }
        const formData = new FormData();
        formData.append('audio', audioFile);
        formData.append('engine', engine);

        console.log('Sending speaking grading request...');
        const res = await fetch('/api/ai/speaking/grade', {
            method: 'POST',
            body: formData,
        });

        console.log('Speaking grading response status:', res.status);

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            console.error('Speaking grading error:', errorData);
            throw new Error(errorData.error || `HTTP ${res.status}: Lỗi khi chấm điểm speaking`);
        }

        const result = await res.json();
        console.log('Speaking grading result:', result);
        return result;
    } catch (error) {
        console.error('Speaking grading error:', error);
        throw new Error(`Lỗi khi chấm điểm speaking: ${error.message}`);
    }
}

export async function gradeWriting(text) {
    try {
        console.log('Sending writing grading request...');
        const res = await api.post('/ai/writing/grade', { text });
        console.log('Writing grading result:', res.data);

        if (res.data && res.data.error) throw new Error(res.data.error);
        return res.data;
    } catch (error) {
        console.error('Writing grading error:', error);
        throw new Error(`Lỗi khi chấm điểm writing: ${error.message}`);
    }
} 