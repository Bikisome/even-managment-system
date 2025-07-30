'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Attendee extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Attendee belongs to User
      Attendee.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });

      // Attendee belongs to Event
      Attendee.belongsTo(models.Event, {
        foreignKey: 'eventId',
        as: 'event'
      });

      // Attendee belongs to Ticket
      Attendee.belongsTo(models.Ticket, {
        foreignKey: 'ticketId',
        as: 'ticket'
      });
    }
  }
  Attendee.init({
    userId: DataTypes.INTEGER,
    eventId: DataTypes.INTEGER,
    ticketId: DataTypes.INTEGER,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Attendee',
  });
  return Attendee;
};