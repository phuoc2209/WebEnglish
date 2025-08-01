import api from './api';

// User Management APIs
export const adminUserService = {
    // Lấy danh sách tất cả người dùng
    getAllUsers: async () => {
        const response = await api.get('/users');
        return response.data;
    },

    // Cập nhật thông tin người dùng
    updateUser: async (userId, userData) => {
        const response = await api.put(`/users/${userId}`, userData);
        return response.data;
    },

    // Xóa người dùng
    deleteUser: async (userId) => {
        const response = await api.delete(`/users/${userId}`);
        return response.data;
    },

    // Khóa tài khoản người dùng
    lockUser: async (userId) => {
        const response = await api.post(`/users/${userId}/lock`);
        return response.data;
    },

    // Mở khóa tài khoản người dùng
    unlockUser: async (userId) => {
        const response = await api.post(`/users/${userId}/unlock`);
        return response.data;
    }
};

// Lesson Management APIs
export const adminLessonService = {
    // Lấy danh sách bài học ngữ pháp
    getGrammarLessons: async (params = {}) => {
        const response = await api.get('/lessons/grammar', { params });
        return response.data;
    },

    // Lấy danh sách bài học từ vựng
    getVocabularyLessons: async (params = {}) => {
        const response = await api.get('/lessons/vocabulary', { params });
        return response.data;
    },

    // Lấy danh sách bài tập
    getExercises: async (params = {}) => {
        const response = await api.get('/lessons/exercises', { params });
        return response.data;
    },

    // Lấy danh sách bài học kỹ năng
    getSkills: async (params = {}) => {
        const response = await api.get('/skills', { params });
        return response.data;
    },

    // Tạo bài học ngữ pháp
    createGrammarLesson: async (lessonData) => {
        const response = await api.post('/lessons/grammar', lessonData);
        return response.data;
    },

    // Cập nhật bài học ngữ pháp
    updateGrammarLesson: async (lessonId, lessonData) => {
        const response = await api.put(`/lessons/grammar/${lessonId}`, lessonData);
        return response.data;
    },

    // Xóa bài học ngữ pháp
    deleteGrammarLesson: async (lessonId) => {
        const response = await api.delete(`/lessons/grammar/${lessonId}`);
        return response.data;
    },

    // Tạo bài học từ vựng
    createVocabularyLesson: async (lessonData) => {
        const response = await api.post('/lessons/vocabulary', lessonData);
        return response.data;
    },

    // Cập nhật bài học từ vựng
    updateVocabularyLesson: async (lessonId, lessonData) => {
        const response = await api.put(`/lessons/vocabulary/${lessonId}`, lessonData);
        return response.data;
    },

    // Xóa bài học từ vựng
    deleteVocabularyLesson: async (lessonId) => {
        const response = await api.delete(`/lessons/vocabulary/${lessonId}`);
        return response.data;
    },

    // Tạo bài tập
    createExercise: async (exerciseData) => {
        const response = await api.post('/lessons/exercises', exerciseData);
        return response.data;
    },

    // Cập nhật bài tập
    updateExercise: async (exerciseId, exerciseData) => {
        const response = await api.put(`/lessons/exercises/${exerciseId}`, exerciseData);
        return response.data;
    },

    // Xóa bài tập
    deleteExercise: async (exerciseId) => {
        const response = await api.delete(`/lessons/exercises/${exerciseId}`);
        return response.data;
    },

    // Tạo bài học kỹ năng
    createSkill: async (skillData) => {
        const response = await api.post('/skills', skillData);
        return response.data;
    },

    // Cập nhật bài học kỹ năng
    updateSkill: async (skillId, skillData) => {
        const response = await api.put(`/skills/${skillId}`, skillData);
        return response.data;
    },

    // Xóa bài học kỹ năng
    deleteSkill: async (skillId) => {
        const response = await api.delete(`/skills/${skillId}`);
        return response.data;
    }
};

// Community Management APIs
export const adminCommunityService = {
    // Lấy danh sách bài viết
    getAllPosts: async (params = {}) => {
        const response = await api.get('/community/posts', { params });
        return response.data;
    },

    // Lấy danh sách báo cáo
    getReports: async (params = {}) => {
        const response = await api.get('/community/reports', { params });
        return response.data;
    },

    // Xóa bài viết (admin)
    deletePost: async (postId) => {
        const response = await api.delete(`/community/admin/posts/${postId}`);
        return response.data;
    },

    // Cập nhật bài viết
    updatePost: async (postId, postData) => {
        const response = await api.put(`/community/posts/${postId}`, postData);
        return response.data;
    },

    // Giải quyết báo cáo
    resolveReport: async (reportId, action) => {
        const response = await api.post(`/community/reports/${reportId}/resolve`, { action });
        return response.data;
    },

    // Cảnh báo người dùng
    warnUser: async (userId, message) => {
        const response = await api.post(`/community/users/${userId}/warn`, { message });
        return response.data;
    }
};

// Transaction Management APIs
export const adminTransactionService = {
    // Lấy danh sách tất cả giao dịch
    getAllPayments: async (params = {}) => {
        const response = await api.get('/payments', { params });
        return response.data;
    },

    // Lấy thống kê giao dịch
    getPaymentStats: async () => {
        const response = await api.get('/payments/stats');
        return response.data;
    },

    // Xuất dữ liệu giao dịch
    exportPayments: async (params = {}) => {
        const response = await api.get('/payments/export', {
            params,
            responseType: 'blob'
        });
        return response.data;
    }
};

// Service Package Management APIs
export const adminServicePackageService = {
    // Lấy danh sách gói dịch vụ
    getAllPackages: async (params = {}) => {
        const response = await api.get('/service-packages', { params });
        return response.data;
    },

    // Lấy danh sách gói dịch vụ với số lượng đăng ký (admin)
    getAllPackagesWithSubscribers: async (params = {}) => {
        const response = await api.get('/service-packages/admin/with-subscribers', { params });
        return response.data;
    },

    // Tạo gói dịch vụ mới
    createPackage: async (packageData) => {
        const response = await api.post('/service-packages', packageData);
        return response.data;
    },

    // Cập nhật gói dịch vụ
    updatePackage: async (packageId, packageData) => {
        const response = await api.put(`/service-packages/${packageId}`, packageData);
        return response.data;
    },

    // Xóa gói dịch vụ
    deletePackage: async (packageId) => {
        const response = await api.delete(`/service-packages/${packageId}`);
        return response.data;
    }
};

// Dashboard APIs
export const adminDashboardService = {
    // Lấy thống kê tổng quan
    getDashboardStats: async () => {
        const response = await api.get('/admin/dashboard/stats');
        return response.data;
    },

    // Lấy thống kê người dùng
    getUserStats: async () => {
        const response = await api.get('/admin/dashboard/users');
        return response.data;
    },

    // Lấy thống kê bài học
    getLessonStats: async () => {
        const response = await api.get('/admin/dashboard/lessons');
        return response.data;
    },

    // Lấy thống kê giao dịch
    getTransactionStats: async () => {
        const response = await api.get('/admin/dashboard/transactions');
        return response.data;
    }
};

// Quiz Management APIs
export const adminQuizService = {
    // Lấy danh sách quiz
    getAllQuizzes: async (params = {}) => {
        const response = await api.get('/tests/quizzes', { params });
        return response.data;
    },

    // Lấy quiz theo ID
    getQuizById: async (quizId) => {
        const response = await api.get(`/tests/quizzes/${quizId}`);
        return response.data;
    },

    // Tạo quiz mới
    createQuiz: async (quizData) => {
        const response = await api.post('/tests/quizzes', quizData);
        return response.data;
    },

    // Cập nhật quiz
    updateQuiz: async (quizId, quizData) => {
        const response = await api.put(`/tests/quizzes/${quizId}`, quizData);
        return response.data;
    },

    // Xóa quiz
    deleteQuiz: async (quizId) => {
        const response = await api.delete(`/tests/quizzes/${quizId}`);
        return response.data;
    },

    // Validate file Excel
    validateQuizFile: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/tests/quizzes/validate', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Import quiz từ file Excel
    importQuiz: async (file, quizData) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', quizData.title);
        formData.append('description', quizData.description || '');
        formData.append('is_public', quizData.is_public || false);
        formData.append('user_id', quizData.user_id);

        const response = await api.post('/tests/quizzes/import', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Lấy thống kê quiz
    getQuizStatistics: async (quizId) => {
        const response = await api.get(`/tests/statistics/${quizId}`);
        return response.data;
    },

    // Generate random quiz
    generateRandomQuiz: async (questionsConfig) => {
        const response = await api.post('/tests/quizzes/generate', questionsConfig);
        return response.data;
    },

    // Create quiz with random questions
    createQuizWithRandomQuestions: async (quizData, questionsConfig) => {
        const response = await api.post('/tests/quizzes/random', {
            ...quizData,
            ...questionsConfig
        });
        return response.data;
    }
};

export const adminForumService = {
    getAllForums: async (params = {}) => {
        const response = await api.get('/admin/forums', { params });
        return response.data;
    },
    approveForum: async (forumId) => {
        const response = await api.put(`/admin/forums/${forumId}/approve`);
        return response.data;
    },
    rejectForum: async (forumId, reason) => {
        const response = await api.put(`/admin/forums/${forumId}/reject`, { reason });
        return response.data;
    },
    deleteForum: async (forumId) => {
        const response = await api.delete(`/admin/forums/${forumId}`);
        return response.data;
    },
    getAllReports: async (params = {}) => {
        const response = await api.get('/admin/reports', { params });
        return response.data;
    },
    handleReport: async (reportId, action, reason) => {
        const response = await api.put(`/admin/reports/${reportId}/handle`, { action, reason });
        return response.data;
    },
    getAllChallenges: async (params = {}) => {
        const response = await api.get('/admin/challenges', { params });
        return response.data;
    },
    deleteChallenge: async (challengeId) => {
        const response = await api.delete(`/admin/challenges/${challengeId}`);
        return response.data;
    },
    getAllSubmissions: async (params = {}) => {
        const response = await api.get('/admin/submissions', { params });
        return response.data;
    },
    deleteSubmission: async (submissionId) => {
        const response = await api.delete(`/admin/submissions/${submissionId}`);
        return response.data;
    },
}; 