'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Event extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Event belongs to User (organizer)
      Event.belongsTo(models.User, {
        foreignKey: 'organizerId',
        as: 'organizer'
      });

      // Event has many Tickets
      Event.hasMany(models.Ticket, {
        foreignKey: 'eventId',
        as: 'tickets'
      });

      // Event has many Attendees
      Event.hasMany(models.Attendee, {
        foreignKey: 'eventId',
        as: 'attendees'
      });

      // Event has many Forum posts
      Event.hasMany(models.Forum, {
        foreignKey: 'eventId',
        as: 'forumPosts'
      });

      // Event has many Polls
      Event.hasMany(models.Poll, {
        foreignKey: 'eventId',
        as: 'polls'
      });

      // Event has many Q&A entries
      Event.hasMany(models.QA, {
        foreignKey: 'eventId',
        as: 'qaEntries'
      });

      // Event has many Notifications
      Event.hasMany(models.Notification, {
        foreignKey: 'eventId',
        as: 'notifications'
      });
    }
  }
  Event.init({
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    date: DataTypes.DATE,
    time: DataTypes.STRING,
    location: DataTypes.STRING,
    category: DataTypes.STRING,
    privacy: DataTypes.STRING,
    organizerId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Event',
  });
  return Event;
};