const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const ForumReport = sequelize.define('forumreport', {
        report_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        reporter_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        post_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        comment_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        reason: {
            type: DataTypes.ENUM('spam', 'inappropriate', 'offensive', 'irrelevant', 'duplicate', 'other'),
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT
        },
        status: {
            type: DataTypes.ENUM('pending', 'reviewed', 'resolved', 'dismissed'),
            defaultValue: 'pending'
        },
        reviewed_by: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        reviewed_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        action_taken: {
            type: DataTypes.ENUM('none', 'warning', 'delete', 'ban_user', 'ban_temporary'),
            defaultValue: 'none'
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'forumreport',
        timestamps: false
    });

    return ForumReport;
}; 