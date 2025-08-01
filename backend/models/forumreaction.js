const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
    return sequelize.define('forumreaction', {
        reaction_id: {
            autoIncrement: true,
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        post_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'forumpost',
                key: 'post_id'
            }
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'user',
                key: 'user_id'
            }
        },
        type: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        sequelize,
        tableName: 'forumreaction',
        timestamps: false,
        indexes: [
            {
                name: "PRIMARY",
                unique: true,
                using: "BTREE",
                fields: [
                    { name: "reaction_id" },
                ]
            },
            {
                name: "post_id",
                using: "BTREE",
                fields: [
                    { name: "post_id" },
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
                name: "unique_user_post_reaction",
                unique: true,
                using: "BTREE",
                fields: [
                    { name: "user_id" },
                    { name: "post_id" },
                    { name: "type" },
                ]
            }
        ]
    });
}; 