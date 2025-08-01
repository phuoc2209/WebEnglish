import api from './api';

class UploadService {
    // Upload avatar
    async uploadAvatar(file) {
        const formData = new FormData();
        formData.append('avatar', file);

        const response = await api.post('/upload/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }

    // Upload audio cho speaking
    async uploadAudio(file) {
        const formData = new FormData();
        formData.append('audio', file);

        const response = await api.post('/upload/audio', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }

    // Upload video cho listening
    async uploadVideo(file) {
        const formData = new FormData();
        formData.append('video', file);

        const response = await api.post('/upload/video', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }

    // Upload nhiều file
    async uploadMultiple(files) {
        const formData = new FormData();
        files.forEach((file, index) => {
            formData.append('files', file);
        });

        const response = await api.post('/upload/multiple', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }

    // Xóa file từ Cloudinary
    async deleteFile(publicId, resourceType = 'image') {
        const response = await api.delete('/upload/delete', {
            data: {
                public_id: publicId,
                resource_type: resourceType,
            },
        });
        return response.data;
    }

    // Cập nhật avatar cho user
    async updateUserAvatar(userId, uploadResult) {
        const response = await api.put(`/users/${userId}/avatar`, {
            url: uploadResult.data.url,
            public_id: uploadResult.data.public_id,
        });
        return response.data;
    }

    // Nộp bài speaking với audio
    async submitSpeakingWithAudio(userId, skillId, content, audioUrl, audioPublicId) {
        const response = await api.post('/skills/speaking-submission', {
            userId,
            skillId,
            content,
            audio_url: audioUrl,
            audio_public_id: audioPublicId,
        });
        return response.data;
    }

    // Cập nhật video cho bài listening (admin only)
    async updateListeningVideo(skillId, videoUrl, videoPublicId) {
        const response = await api.put(`/skills/${skillId}/video`, {
            video_url: videoUrl,
            video_public_id: videoPublicId,
        });
        return response.data;
    }

    // Lấy video của bài listening
    async getListeningVideo(skillId) {
        const response = await api.get(`/skills/${skillId}/video`);
        return response.data;
    }
}

export default new UploadService(); 