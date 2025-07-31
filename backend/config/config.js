require('dotenv').config({ path: '.env' });

module.exports = {
  dialect: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root', 
  password: 'Bikram@2021', // Updated password
  database: 'event_management_dev',
  logging: false,
}; 