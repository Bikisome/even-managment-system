# Database Setup Guide

This guide provides instructions for setting up the database for the Event Management System.

## 🎯 Quick Start Options


### 1.  .env for MySQL
```env
# Database Configuration for MySQL
DB_DIALECT=mysql
DB_HOST=localhost
DB_USER=root
DB_PASS=your-mysql-root-password
DB_NAME=event_management
DB_PORT=3306
```

### 2. Create Database
```bash
# Connect to MySQL
mysql -u root -p

# In MySQL console:
CREATE DATABASE event_management;
EXIT;
```

### 3. Run Database Setup
```bash
# Install dependencies
npm install

# Run migrations
npm run db:migrate

# Seed with sample data (optional)
npm run db:seed
```

### 4. Start the Application
```bash
npm run dev
```

#### 5. "Database doesn't exist" Error
**Solution:**
```bash
# Create database manually
mysql -u root -p -e "CREATE DATABASE event_management;"

# Connect to MySQL
mysql -u root -p

# Show databases
SHOW DATABASES;

# Use database
USE event_management;

# Show tables
SHOW TABLES;
```

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


### Environment Variables
```env
DB_HOST=your-production-db-host
DB_USER=your-production-db-user
DB_PASS=your-production-db-password
DB_NAME=your-production-db-name
DB_PORT=3306
```