import api from './api';

class UploadService {
    async uploadAvatar(file) {
        try {
            const formData = new FormData();
            formData.append('avatar', file);

            const response = await api.post('/upload/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return response.data;
        } catch (error) {
            console.error('Upload avatar error:', error);
            throw new Error(error.response?.data?.message || 'Upload avatar failed');
        }
    }

    async uploadAudio(file) {
        try {
            const formData = new FormData();
            formData.append('audio', file);

            const response = await api.post('/upload/audio', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return response.data;
        } catch (error) {
            console.error('Upload audio error:', error);
            throw new Error(error.response?.data?.message || 'Upload audio failed');
        }
    }

    async uploadVideo(file) {
        try {
            const formData = new FormData();
            formData.append('video', file);

            const response = await api.post('/upload/video', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return response.data;
        } catch (error) {
            console.error('Upload video error:', error);
            throw new Error(error.response?.data?.message || 'Upload video failed');
        }
    }

    async deleteFile(publicId, type = 'image') {
        try {
            const response = await api.delete('/upload/delete', {
                data: { publicId, type }
            });
            return response.data;
        } catch (error) {
            console.error('Delete error:', error);
            throw new Error(error.response?.data?.message || 'Delete failed');
        }
    }

    async uploadImage(file) {
        // Use avatar endpoint for images since backend doesn't have a separate image endpoint
        return this.uploadAvatar(file);
    }

    async updateUserAvatar(userId, uploadResult) {
        try {
            const response = await api.put(`/users/${userId}/avatar`, {
                url: uploadResult.data.url,
                public_id: uploadResult.data.public_id
            });
            return response.data;
        } catch (error) {
            console.error('Update avatar error:', error);
            throw new Error(error.response?.data?.message || 'Update avatar failed');
        }
    }

    async submitSpeakingWithAudio(userId, skillId, content, audioUrl, audioPublicId) {
        try {
            // For now, we'll only submit the content since the backend doesn't support audio URLs yet
            const response = await api.post('/skills/speaking-submission', {
                userId: userId,
                skillId: skillId,
                content: content || 'Audio submission'
            });
            return response.data;
        } catch (error) {
            console.error('Submit speaking error:', error);
            throw new Error(error.response?.data?.message || 'Submit speaking failed');
        }
    }
}

export default new UploadService(); 