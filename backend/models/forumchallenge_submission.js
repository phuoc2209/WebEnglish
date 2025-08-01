const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const ForumChallengeSubmission = sequelize.define('forumchallenge_submission', {
        submission_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        challenge_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        media_url: {
            type: DataTypes.STRING(500)
        },
        submitted_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        is_approved: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        karma_earned: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        feedback: {
            type: DataTypes.TEXT
        }
    }, {
        tableName: 'forumchallenge_submission',
        timestamps: false
    });

    return ForumChallengeSubmission;
}; 