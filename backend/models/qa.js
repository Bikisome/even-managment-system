'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class QA extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // QA belongs to Event
      QA.belongsTo(models.Event, {
        foreignKey: 'eventId',
        as: 'event'
      });

      // QA belongs to User (questioner)
      QA.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'questioner'
      });

      // QA belongs to User (answerer)
      QA.belongsTo(models.User, {
        foreignKey: 'answererId',
        as: 'answerer'
      });
    }
  }
  QA.init({
    eventId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    answererId: DataTypes.INTEGER,
    question: DataTypes.TEXT,
    answer: DataTypes.TEXT,
    status: DataTypes.STRING,
    answeredAt: DataTypes.DATE,
    upvotes: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'QA',
  });
  return QA;
};