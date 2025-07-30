# Database Setup Guide

This guide provides instructions for setting up the database for the Event Management System.

## 🎯 Quick Start Options

### Option 1: SQLite (Recommended for Development)
**Easiest setup - no installation required**

### Option 2: MySQL
**Production-ready database**

---

## 🚀 Option 1: SQLite Setup (Recommended)

### 1. Install SQLite Dependencies
```bash
npm install sqlite3
```

### 2. Create Environment File
```bash
cp env.example .env
```

### 3. Update .env for SQLite
```env
# Database Configuration for SQLite
DB_DIALECT=sqlite
DB_HOST=
DB_USER=
DB_PASS=
DB_NAME=
DB_PORT=
```

### 4. Update Sequelize Config
Replace the content of `config/config.js` with:

```javascript
require('dotenv').config({ path: '.env' });

module.exports = {
  development: {
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false
  },
  test: {
    dialect: 'sqlite',
    storage: './test-database.sqlite',
    logging: false
  },
  production: {
    dialect: 'sqlite',
    storage: './production-database.sqlite',
    logging: false
  },
};
```

### 5. Run Database Setup
```bash
# Create database and run migrations
npm run db:migrate

# Seed with sample data (optional)
npm run db:seed
```

### 6. Start the Application
```bash
npm run dev
```

**✅ SQLite is now ready!**

---

## 🗄️ Option 2: MySQL Setup

### 1. Install MySQL

#### Windows:
1. Download MySQL Community Server from [MySQL Downloads](https://dev.mysql.com/downloads/mysql/)
2. Run the installer
3. Choose "Developer Default" or "Server only"
4. Set root password (remember this!)
5. Complete installation

#### macOS:
```bash
brew install mysql
brew services start mysql
```

#### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

### 2. Create Environment File
```bash
cp env.example .env
```

### 3. Update .env for MySQL
```env
# Database Configuration for MySQL
DB_DIALECT=mysql
DB_HOST=localhost
DB_USER=root
DB_PASS=your-mysql-root-password
DB_NAME=event_management
DB_PORT=3306
```

### 4. Create Database
```bash
# Connect to MySQL
mysql -u root -p

# In MySQL console:
CREATE DATABASE event_management;
CREATE DATABASE event_management_test;
EXIT;
```

### 5. Run Database Setup
```bash
# Install dependencies
npm install

# Run migrations
npm run db:migrate

# Seed with sample data (optional)
npm run db:seed
```

### 6. Start the Application
```bash
npm run dev
```

**✅ MySQL is now ready!**

---

## 🔧 Troubleshooting

### Common Issues:

#### 1. "getaddrinfo ENOTFOUND" Error
**Solution:** 
- For MySQL: Ensure MySQL service is running
- For SQLite: Check file permissions

#### 2. "Access denied" Error (MySQL)
**Solution:**
```bash
# Reset MySQL root password
mysql -u root -p
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
FLUSH PRIVILEGES;
EXIT;
```

#### 3. "Database doesn't exist" Error
**Solution:**
```bash
# Create database manually
mysql -u root -p -e "CREATE DATABASE event_management;"
```

#### 4. SQLite Permission Errors
**Solution:**
```bash
# Check file permissions
ls -la database.sqlite

# Fix permissions if needed
chmod 666 database.sqlite
```

### Database Commands:

#### MySQL Commands:
```bash
# Start MySQL service
sudo service mysql start  # Linux
brew services start mysql # macOS

# Connect to MySQL
mysql -u root -p

# Show databases
SHOW DATABASES;

# Use database
USE event_management;

# Show tables
SHOW TABLES;
```

#### SQLite Commands:
```bash
# Connect to SQLite database
sqlite3 database.sqlite

# Show tables
.tables

# Show schema
.schema

# Exit
.quit
```

---

## 📊 Database Schema

The system creates the following tables:

- **users** - User accounts and profiles
- **events** - Event information
- **tickets** - Ticket types and pricing
- **attendees** - Event registrations
- **forums** - Discussion forum posts
- **polls** - Interactive polls
- **qa** - Question and answer sessions
- **notifications** - User notifications

---

## 🔄 Switching Between Databases

### From MySQL to SQLite:
1. Update `.env` file
2. Update `config/config.js`
3. Run `npm run db:migrate`

### From SQLite to MySQL:
1. Install MySQL
2. Update `.env` file
3. Update `config/config.js`
4. Create MySQL database
5. Run `npm run db:migrate`

---

## 🚀 Production Deployment

### For Production:
- Use MySQL or PostgreSQL
- Set up proper database backups
- Configure connection pooling
- Use environment-specific configurations

### Environment Variables for Production:
```env
NODE_ENV=production
DB_DIALECT=mysql
DB_HOST=your-production-db-host
DB_USER=your-production-db-user
DB_PASS=your-production-db-password
DB_NAME=your-production-db-name
DB_PORT=3306
```

---

## 📝 Quick Reference

| Database | Setup Time | Performance | Production Ready |
|----------|------------|-------------|------------------|
| SQLite   | 5 minutes  | Good        | No               |
| MySQL    | 15 minutes | Excellent   | Yes              |

**Recommendation:** Use SQLite for development, MySQL for production. 