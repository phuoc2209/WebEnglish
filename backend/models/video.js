const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('video', {
    video_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    skill_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'skilllesson',
        key: 'skill_id'
      }
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    video_url: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    transcript: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'video',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "video_id" },
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
