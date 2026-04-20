const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const WorldSave = sequelize.define('WorldSave', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  worldName: { type: DataTypes.STRING, defaultValue: '我的古建世界' },
  worldData: { type: DataTypes.TEXT, allowNull: false },
  isPublic: { type: DataTypes.BOOLEAN, defaultValue: false },
  shareCode: { type: DataTypes.STRING, unique: true },
  score: { type: DataTypes.INTEGER, defaultValue: 0 },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

module.exports = WorldSave;