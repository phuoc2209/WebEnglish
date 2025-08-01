const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('answersubmission', {
    submission_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    attempt_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'testattempt',
        key: 'attempt_id'
      }
    },
    question_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'quizquestion',
        key: 'question_id'
      }
    },
    user_answer: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    is_correct: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'answersubmission',
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
        name: "attempt_id",
        using: "BTREE",
        fields: [
          { name: "attempt_id" },
        ]
      },
      {
        name: "question_id",
        using: "BTREE",
        fields: [
          { name: "question_id" },
        ]
      },
    ]
  });
};
