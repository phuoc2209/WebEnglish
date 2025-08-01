const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('exercise', {
    exercise_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    lesson_type: {
      type: DataTypes.ENUM('grammar','vocab','skill'),
      allowNull: true
    },
    lesson_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'lesson',
        key: 'lesson_id'
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
    question: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    correct_answer: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    options: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'exercise',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "exercise_id" },
        ]
      },
      {
        name: "lesson_id",
        using: "BTREE",
        fields: [
          { name: "lesson_id" },
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
