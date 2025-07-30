'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Ticket extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Ticket belongs to Event
      Ticket.belongsTo(models.Event, {
        foreignKey: 'eventId',
        as: 'event'
      });

      // Ticket has many Attendees
      Ticket.hasMany(models.Attendee, {
        foreignKey: 'ticketId',
        as: 'attendees'
      });
    }
  }
  Ticket.init({
    eventId: DataTypes.INTEGER,
    type: DataTypes.STRING,
    price: DataTypes.FLOAT,
    quantity: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Ticket',
  });
  return Ticket;
};