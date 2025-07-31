'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Poll extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Poll belongs to Event
      Poll.belongsTo(models.Event, {
        foreignKey: 'eventId',
        as: 'event'
      });

      // Poll belongs to User (creator)
      Poll.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'creator'
      });
    }
  }
  Poll.init({
    eventId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    question: DataTypes.STRING,
    options: DataTypes.TEXT,
    votes: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Poll',
  });
  return Poll;
};