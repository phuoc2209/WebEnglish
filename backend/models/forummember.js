const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
    return sequelize.define('forummember', {
        member_id: {
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
        role: {
            type: DataTypes.ENUM('admin', 'moderator', 'teacher', 'premium', 'free'),
            allowNull: false,
            defaultValue: 'free'
        },
        joined_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        is_banned: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        ban_reason: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        ban_expires_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        banned_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'user',
                key: 'user_id'
            }
        },
        karma_earned: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        posts_count: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        comments_count: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        badges: {
            type: DataTypes.JSON,
            allowNull: true
        }
    }, {
        sequelize,
        tableName: 'forummember',
        timestamps: false,
        indexes: [
            {
                name: "PRIMARY",
                unique: true,
                using: "BTREE",
                fields: [
                    { name: "member_id" },
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
                name: "unique_forum_user",
                unique: true,
                using: "BTREE",
                fields: [
                    { name: "forum_id" },
                    { name: "user_id" },
                ]
            }
        ]
    });
}; 