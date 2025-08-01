const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('exercisesubmission', {
    id: {
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
    exercise_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'exercise',
        key: 'exercise_id'
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
    tableName: 'exercisesubmission',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
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
        name: "exercise_id",
        using: "BTREE",
        fields: [
          { name: "exercise_id" },
        ]
      },
    ]
  });
};
