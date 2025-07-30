'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Hash the password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash('organizer123', saltRounds);

    // Create organizer user
    await queryInterface.bulkInsert('Users', [{
      name: 'Event Organizer',
      email: 'organizer@manageevent.com',
      password: hashedPassword,
      role: 'organizer',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down (queryInterface, Sequelize) {
    // Remove organizer user
    await queryInterface.bulkDelete('Users', {
      email: 'organizer@manageevent.com'
    }, {});
  }
}; 