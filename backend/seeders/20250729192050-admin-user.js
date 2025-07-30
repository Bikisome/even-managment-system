'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Hash the password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash('admin123', saltRounds);

    // Create admin user
    await queryInterface.bulkInsert('Users', [{
      name: 'System Administrator',
      email: 'admin@manageevent.com',
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down (queryInterface, Sequelize) {
    // Remove admin user
    await queryInterface.bulkDelete('Users', {
      email: 'admin@manageevent.com'
    }, {});
  }
}; 