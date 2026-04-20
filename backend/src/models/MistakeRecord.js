const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const MistakeRecord = sequelize.define('MistakeRecord', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  quizId: { type: DataTypes.INTEGER, allowNull: false },
  userAnswer: { type: DataTypes.INTEGER },
  correctAnswer: { type: DataTypes.STRING },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

module.exports = MistakeRecord;