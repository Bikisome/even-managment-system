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
        as: 'Event'
      });

      // QA belongs to User
      QA.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
    }
  }
  QA.init({
    eventId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    question: DataTypes.TEXT,
    answer: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'QA',
  });
  return QA;
};