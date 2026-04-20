const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const LearningPath = sequelize.define('LearningPath', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  currentStage: { type: DataTypes.INTEGER, defaultValue: 1 },
  completedStages: { type: DataTypes.TEXT, defaultValue: '[]' },
  updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

module.exports = LearningPath;