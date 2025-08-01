const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
    return sequelize.define('forumpost', {
        post_id: {
            autoIncrement: true,
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        forum_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'forum',
                key: 'forum_id'
            }
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'user',
                key: 'user_id'
            }
        },
        title: {
            type: DataTypes.STRING(500),
            allowNull: false
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        post_type: {
            type: DataTypes.ENUM('text', 'image', 'video', 'poll', 'lesson', 'challenge'),
            allowNull: false,
            defaultValue: 'text'
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        is_pinned: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        is_locked: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        view_count: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        comment_count: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        upvote_count: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        downvote_count: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        karma_earned: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        is_approved: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        is_premium: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        tags: {
            type: DataTypes.JSON,
            allowNull: true
        },
        media_urls: {
            type: DataTypes.JSON,
            allowNull: true
        },
        poll_data: {
            type: DataTypes.JSON,
            allowNull: true
        },
        lesson_data: {
            type: DataTypes.JSON,
            allowNull: true
        },
        challenge_data: {
            type: DataTypes.JSON,
            allowNull: true
        }
    }, {
        sequelize,
        tableName: 'forumpost',
        timestamps: false,
        indexes: [
            {
                name: "PRIMARY",
                unique: true,
                using: "BTREE",
                fields: [
                    { name: "post_id" },
                ]
            },
            {
                name: "forum_id",
                using: "BTREE",
                fields: [
                    { name: "forum_id" },
                ]
            },
            {
                name: "user_id",
                using: "BTREE",
                fields: [
                    { name: "user_id" },
                ]
            },
            {
                name: "created_at",
                using: "BTREE",
                fields: [
                    { name: "created_at" },
                ]
            },
            {
                name: "is_pinned",
                using: "BTREE",
                fields: [
                    { name: "is_pinned" },
                ]
            }
        ]
    });
}; 