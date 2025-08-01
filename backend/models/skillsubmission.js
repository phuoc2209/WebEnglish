const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('skillsubmission', {
    submission_id: {
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
    skill_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'skilllesson',
        key: 'skill_id'
      }
    },
    skill_type: {
      type: DataTypes.ENUM('listening', 'reading', 'speaking', 'writing'),
      allowNull: true
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    options: {
      type: DataTypes.JSON,
      allowNull: true
    },
    user_answer: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    is_correct: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    audio_file: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ai_grading_result: {
      type: DataTypes.JSON,
      allowNull: true
    },
    submitted_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    score: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: null,
    },
  }, {
    sequelize,
    tableName: 'skillsubmission',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "submission_id" },
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
        name: "skill_id",
        using: "BTREE",
        fields: [
          { name: "skill_id" },
        ]
      },
    ]
  });
};
