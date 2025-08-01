const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const ForumChallenge = sequelize.define('forumchallenge', {
        challenge_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        forum_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        challenge_type: {
            type: DataTypes.ENUM('writing', 'speaking', 'grammar', 'vocabulary', 'listening'),
            allowNull: false
        },
        start_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        end_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        karma_reward: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        badge_reward: {
            type: DataTypes.STRING(100)
        },
        requirements: {
            type: DataTypes.JSON
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        tableName: 'forumchallenge',
        timestamps: false
    });

    return ForumChallenge;
}; 