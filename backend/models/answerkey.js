const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('answerkey', {
    answer_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    question_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'quizquestion',
        key: 'question_id'
      }
    },
    option_text: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    is_correct: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    explanation: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'answerkey',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "answer_id" },
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
