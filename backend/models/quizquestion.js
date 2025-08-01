const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('quizquestion', {
    question_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    quiz_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'quiz',
        key: 'quiz_id'
      }
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    difficulty: {
      type: DataTypes.ENUM('easy','medium','hard'),
      allowNull: true,
      defaultValue: "medium"
    }
  }, {
    sequelize,
    tableName: 'quizquestion',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "question_id" },
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
