const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const PremiumSubscription = sequelize.define('premium_subscription', {
        subscription_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        plan_type: {
            type: DataTypes.ENUM('basic', 'pro', 'teacher'),
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
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        features: {
            type: DataTypes.JSON
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'premium_subscription',
        timestamps: false
    });

    return PremiumSubscription;
}; 