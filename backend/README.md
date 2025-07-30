# Event Management System API

A comprehensive RESTful API for managing events, users, tickets, and attendee engagement features.

## 🚀 Features

### Core Features
- **User Authentication & Authorization**: Secure JWT-based authentication with role-based access control
- **Event Management**: Create, update, delete, and search events with advanced filtering
- **Ticketing System**: Manage ticket types, pricing, and availability
- **Attendee Registration**: Secure event registration with payment processing
- **Payment Processing**: Integrated payment system with refund capabilities
- **Real-time Notifications**: Event updates and communication system

### Engagement Features
- **Discussion Forums**: Interactive forums for event discussions
- **Live Polls**: Real-time polling system for attendee feedback
- **Q&A Sessions**: Live question and answer functionality
- **Social Login**: Google OAuth integration

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express-validator
- **Documentation**: Swagger/OpenAPI
- **Security**: Helmet, CORS, Rate Limiting
- **Payment**: Stripe integration (simulated)

## 📋 Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## 📁 Environment Setup

The application uses a `.env` file in the root directory for configuration. Make sure to:
1. Copy `env.example` to `.env`
2. Update the values in `.env` with your actual configuration
3. Never commit the `.env` file to version control

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd event-management-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory (copy from env.example):
   ```bash
   cp env.example .env
   # Edit .env with your actual values
   ```

4. **Database Setup**
   ```bash
   # Create database
   mysql -u root -p -e "CREATE DATABASE event_management;"
   
   # Run migrations
   npm run db:migrate
   
   # Seed data (optional)
   npm run db:seed
   ```

5. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 📚 API Documentation

The API documentation is available at: `http://localhost:5000/api/docs`

### Base URL
```
http://localhost:5000/api
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### User Roles
- **user**: Regular event attendees
- **organizer**: Event organizers with management privileges
- **admin**: System administrators with full access

## 📡 API Endpoints

### Authentication (`/auth`)
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/google` - Google OAuth login
- `GET /auth/profile` - Get user profile
- `PUT /auth/profile` - Update user profile

### Users (`/users`)
- `GET /users` - Get all users (admin only)
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user (admin only)
- `GET /users/:id/events` - Get user's organized events
- `GET /users/:id/registrations` - Get user's event registrations

### Events (`/events`)
- `GET /events` - Get all events with filtering
- `POST /events` - Create new event
- `GET /events/:id` - Get event by ID
- `PUT /events/:id` - Update event
- `DELETE /events/:id` - Delete event
- `GET /events/:id/attendees` - Get event attendees
- `GET /events/my-events` - Get user's events

### Tickets (`/tickets`)
- `GET /tickets/event/:eventId` - Get event tickets
- `POST /tickets` - Create ticket type
- `GET /tickets/:id` - Get ticket by ID
- `PUT /tickets/:id` - Update ticket
- `DELETE /tickets/:id` - Delete ticket
- `GET /tickets/check-availability/:id` - Check ticket availability

### Attendees (`/attendees`)
- `POST /attendees/register` - Register for event
- `GET /attendees/my-registrations` - Get user's registrations
- `GET /attendees/:id` - Get registration by ID
- `PUT /attendees/:id` - Update registration
- `DELETE /attendees/:id` - Cancel registration
- `GET /attendees/event/:eventId` - Get event attendees

### Forums (`/forums`)
- `GET /forums/event/:eventId` - Get event forum posts
- `POST /forums` - Create forum post
- `GET /forums/:id` - Get forum post by ID
- `PUT /forums/:id` - Update forum post
- `DELETE /forums/:id` - Delete forum post
- `GET /forums/my-posts` - Get user's forum posts

### Polls (`/polls`)
- `GET /polls/event/:eventId` - Get event polls
- `POST /polls` - Create poll
- `GET /polls/:id` - Get poll by ID
- `PUT /polls/:id` - Update poll
- `DELETE /polls/:id` - Delete poll
- `POST /polls/:id/vote` - Vote on poll

### Q&A (`/qa`)
- `GET /qa/event/:eventId` - Get event Q&A
- `POST /qa` - Ask question
- `GET /qa/:id` - Get Q&A by ID
- `PUT /qa/:id` - Update Q&A
- `DELETE /qa/:id` - Delete Q&A
- `POST /qa/:id/answer` - Answer question
- `GET /qa/my-questions` - Get user's questions

### Notifications (`/notifications`)
- `POST /notifications` - Create notification
- `GET /notifications` - Get user's notifications
- `GET /notifications/:id` - Get notification by ID
- `PUT /notifications/:id/read` - Mark as read
- `PUT /notifications/read-all` - Mark all as read
- `DELETE /notifications/:id` - Delete notification
- `GET /notifications/unread-count` - Get unread count

### Payments (`/payments`)
- `POST /payments/process` - Process payment
- `POST /payments/refund/:registrationId` - Process refund
- `GET /payments/history` - Get payment history
- `GET /payments/:registrationId` - Get payment details

## 🔍 Search and Filtering

### Event Search
```
GET /api/events?q=conference&category=conference&location=New York&date=2024-01-01&page=1&limit=10
```

### Query Parameters
- `q`: Search query (title, description, location)
- `category`: Event category filter
- `location`: Location filter
- `date`: Date filter
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 50)

## 💳 Payment Integration

The API includes simulated payment processing. In production, integrate with:
- **Stripe**: Credit card payments
- **PayPal**: PayPal payments
- **Other providers**: As needed

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Different permissions for users, organizers, and admins
- **Input Validation**: Comprehensive request validation
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Protection**: Cross-origin resource sharing protection
- **Helmet Security**: Security headers

## 📊 Database Schema

### Core Tables
- **users**: User accounts and profiles
- **events**: Event information
- **tickets**: Ticket types and pricing
- **attendees**: Event registrations
- **forums**: Discussion forum posts
- **polls**: Interactive polls
- **qa**: Question and answer sessions
- **notifications**: User notifications

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 📦 Scripts

```bash
# Development
npm run dev

# Production
npm start

# Database
npm run db:migrate
npm run db:seed
npm run db:reset

# Testing
npm test
```

## 🚀 Deployment

### Environment Variables
Set the following environment variables for production:

```env
NODE_ENV=production
PORT=5000
JWT_SECRET=your-production-jwt-secret
DB_HOST=your-database-host
DB_USER=your-database-user
DB_PASS=your-database-password
DB_NAME=your-database-name
DB_PORT=3306
FRONTEND_URL=https://your-frontend-domain.com
```

### PM2 Deployment
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start server.js --name "event-management-api"

# Monitor
pm2 monit

# Logs
pm2 logs
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the API documentation at `/api/docs`

## 🔄 Version History

- **v1.0.0**: Initial release with core features
- Complete event management system
- User authentication and authorization
- Ticketing and payment processing
- Engagement features (forums, polls, Q&A)
- Real-time notifications

---

**Built with ❤️ for event organizers and attendees** 