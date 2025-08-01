const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('skilllesson', {
    skill_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    skill_type: {
      type: DataTypes.ENUM('listening','speaking','reading','writing'),
      allowNull: true
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    reading_content: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    writing_prompt: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    suggested_vocabulary: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    examples: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'skilllesson',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "skill_id" },
        ]
      },
    ]
  });
};
