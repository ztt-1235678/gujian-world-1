const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Achievement = sequelize.define('Achievement', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  type: { type: DataTypes.STRING, allowNull: false },
  level: { type: DataTypes.INTEGER, defaultValue: 1 },
  unlockedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

module.exports = Achievement;