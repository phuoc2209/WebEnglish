const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('learningprogress', {
    progress_id: {
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
    lesson_type: {
      type: DataTypes.ENUM('vocabulary', 'grammar', 'speaking', 'listening', 'reading', 'writing'),
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
    status: {
      type: DataTypes.ENUM('not started', 'in progress', 'completed'),
      allowNull: true,
      defaultValue: "not started"
    },
    progress_percent: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      defaultValue: 0.00
    },
    last_accessed_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'learningprogress',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "progress_id" },
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
