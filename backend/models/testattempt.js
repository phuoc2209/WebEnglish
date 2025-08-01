const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('testattempt', {
    attempt_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'user',
        key: 'user_id'
      }
    },
    quiz_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'quiz',
        key: 'quiz_id'
      }
    },
    started_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    score: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'testattempt',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "attempt_id" },
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
        name: "quiz_id",
        using: "BTREE",
        fields: [
          { name: "quiz_id" },
        ]
      },
    ]
  });
};
