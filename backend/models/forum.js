const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
    return sequelize.define('forum', {
        forum_id: {
            autoIncrement: true,
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        slug: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true
        },
        category: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'user',
                key: 'user_id'
            }
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        rules: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        banner_image: {
            type: DataTypes.STRING(500),
            allowNull: true
        },
        member_count: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        post_count: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        is_private: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        is_premium: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        karma_required: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        sequelize,
        tableName: 'forum',
        timestamps: false,
        indexes: [
            {
                name: "PRIMARY",
                unique: true,
                using: "BTREE",
                fields: [
                    { name: "forum_id" },
                ]
            },
            {
                name: "slug",
                unique: true,
                using: "BTREE",
                fields: [
                    { name: "slug" },
                ]
            },
            {
                name: "category",
                using: "BTREE",
                fields: [
                    { name: "category" },
                ]
            },
            {
                name: "created_by",
                using: "BTREE",
                fields: [
                    { name: "created_by" },
                ]
            }
        ]
    });
}; 