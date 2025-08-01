const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const TeacherProfile = sequelize.define('teacher_profile', {
        profile_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true
        },
        bio: {
            type: DataTypes.TEXT
        },
        qualifications: {
            type: DataTypes.TEXT
        },
        experience_years: {
            type: DataTypes.INTEGER
        },
        specializations: {
            type: DataTypes.JSON
        },
        hourly_rate: {
            type: DataTypes.DECIMAL(10, 2)
        },
        is_verified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        rating: {
            type: DataTypes.DECIMAL(3, 2),
            defaultValue: 0
        },
        total_sessions: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'teacher_profile',
        timestamps: false
    });

    return TeacherProfile;
}; 