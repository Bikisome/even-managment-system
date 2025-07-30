'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // User has many Events (as organizer)
      User.hasMany(models.Event, {
        foreignKey: 'organizerId',
        as: 'organizedEvents'
      });

      // User has many Attendees
      User.hasMany(models.Attendee, {
        foreignKey: 'userId',
        as: 'attendances'
      });

      // User has many Forum posts
      User.hasMany(models.Forum, {
        foreignKey: 'userId',
        as: 'forumPosts'
      });

      // User has many Q&A entries
      User.hasMany(models.QA, {
        foreignKey: 'userId',
        as: 'qaEntries'
      });

      // User has many Notifications
      User.hasMany(models.Notification, {
        foreignKey: 'userId',
        as: 'notifications'
      });
    }
  }
  User.init({
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    googleId: DataTypes.STRING,
    role: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};