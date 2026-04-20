const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const LearningRecord = sequelize.define('LearningRecord', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  articleId: { type: DataTypes.INTEGER, allowNull: false },
  timeSpent: { type: DataTypes.INTEGER, defaultValue: 0 },
  viewedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

module.exports = LearningRecord;