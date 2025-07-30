# Event Management System API Testing Guide

This document provides comprehensive testing examples for all API endpoints.

## 🔐 Authentication Testing

### 1. User Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. User Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### 3. Get User Profile
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📅 Event Management Testing

### 1. Create Event
```bash
curl -X POST http://localhost:5000/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Tech Conference 2024",
    "description": "Annual technology conference featuring industry leaders",
    "date": "2024-06-15",
    "time": "09:00",
    "location": "Convention Center, New York",
    "category": "conference",
    "privacy": "public"
  }'
```

### 2. Get All Events
```bash
curl -X GET "http://localhost:5000/api/events?q=conference&category=conference&page=1&limit=10"
```

### 3. Get Event by ID
```bash
curl -X GET http://localhost:5000/api/events/1
```

### 4. Update Event
```bash
curl -X PUT http://localhost:5000/api/events/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Updated Tech Conference 2024",
    "description": "Updated description"
  }'
```

## 🎫 Ticket Management Testing

### 1. Create Ticket
```bash
curl -X POST http://localhost:5000/api/tickets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "eventId": 1,
    "name": "Early Bird Ticket",
    "description": "Limited early bird pricing",
    "price": 99.99,
    "quantity": 100,
    "type": "early-bird"
  }'
```

### 2. Get Event Tickets
```bash
curl -X GET http://localhost:5000/api/tickets/event/1
```

### 3. Check Ticket Availability
```bash
curl -X GET http://localhost:5000/api/tickets/check-availability/1
```

## 👥 Attendee Registration Testing

### 1. Register for Event
```bash
curl -X POST http://localhost:5000/api/attendees/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "eventId": 1,
    "ticketId": 1,
    "quantity": 2
  }'
```

### 2. Get My Registrations
```bash
curl -X GET http://localhost:5000/api/attendees/my-registrations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Get Event Attendees (Organizer Only)
```bash
curl -X GET http://localhost:5000/api/attendees/event/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 💳 Payment Processing Testing

### 1. Process Payment
```bash
curl -X POST http://localhost:5000/api/payments/process \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "eventId": 1,
    "ticketId": 1,
    "quantity": 1,
    "paymentMethod": "stripe",
    "paymentToken": "tok_visa"
  }'
```

### 2. Get Payment History
```bash
curl -X GET http://localhost:5000/api/payments/history \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Process Refund
```bash
curl -X POST http://localhost:5000/api/payments/refund/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "reason": "Event cancelled"
  }'
```

## 💬 Forum Testing

### 1. Create Forum Post
```bash
curl -X POST http://localhost:5000/api/forums \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "eventId": 1,
    "title": "Discussion about speakers",
    "content": "What speakers are you most excited to see?"
  }'
```

### 2. Get Event Forum Posts
```bash
curl -X GET "http://localhost:5000/api/forums/event/1?page=1&limit=10"
```

### 3. Update Forum Post
```bash
curl -X PUT http://localhost:5000/api/forums/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Updated title",
    "content": "Updated content"
  }'
```

## 📊 Poll Testing

### 1. Create Poll
```bash
curl -X POST http://localhost:5000/api/polls \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "eventId": 1,
    "question": "What is your favorite programming language?",
    "options": ["JavaScript", "Python", "Java", "C++"]
  }'
```

### 2. Get Event Polls
```bash
curl -X GET http://localhost:5000/api/polls/event/1
```

### 3. Vote on Poll
```bash
curl -X POST http://localhost:5000/api/polls/1/vote \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "selectedOption": "JavaScript"
  }'
```

## ❓ Q&A Testing

### 1. Ask Question
```bash
curl -X POST http://localhost:5000/api/qa \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "eventId": 1,
    "question": "Will there be networking sessions?"
  }'
```

### 2. Get Event Q&A
```bash
curl -X GET "http://localhost:5000/api/qa/event/1?status=pending&page=1&limit=10"
```

### 3. Answer Question (Organizer Only)
```bash
curl -X POST http://localhost:5000/api/qa/1/answer \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "answer": "Yes, there will be dedicated networking sessions after each keynote."
  }'
```

## 🔔 Notification Testing

### 1. Create Notification (Organizer Only)
```bash
curl -X POST http://localhost:5000/api/notifications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "eventId": 1,
    "title": "Event Update",
    "message": "The event schedule has been updated",
    "type": "info",
    "targetUsers": [1, 2, 3]
  }'
```

### 2. Get My Notifications
```bash
curl -X GET "http://localhost:5000/api/notifications?isRead=false&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Mark Notification as Read
```bash
curl -X PUT http://localhost:5000/api/notifications/1/read \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Get Unread Count
```bash
curl -X GET http://localhost:5000/api/notifications/unread-count \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 👤 User Management Testing

### 1. Get All Users (Admin Only)
```bash
curl -X GET "http://localhost:5000/api/users?role=user&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. Get User by ID
```bash
curl -X GET http://localhost:5000/api/users/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Update User
```bash
curl -X PUT http://localhost:5000/api/users/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Updated Name",
    "email": "updated@example.com"
  }'
```

## 🔍 Search and Filtering Examples

### Event Search with Multiple Filters
```bash
curl -X GET "http://localhost:5000/api/events?q=conference&category=conference&location=New York&date=2024-06-15&page=1&limit=20"
```

### Notification Filtering
```bash
curl -X GET "http://localhost:5000/api/notifications?isRead=false&type=info&page=1&limit=5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Payment History Filtering
```bash
curl -X GET "http://localhost:5000/api/payments/history?status=confirmed&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🧪 Testing Scripts

### Automated Testing with curl
```bash
#!/bin/bash

# Test user registration
echo "Testing user registration..."
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }')

echo $REGISTER_RESPONSE

# Extract token from response
TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

echo "Token: $TOKEN"

# Test event creation
echo "Testing event creation..."
curl -X POST http://localhost:5000/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Test Event",
    "description": "Test event description",
    "date": "2024-12-31",
    "time": "18:00",
    "location": "Test Location",
    "category": "workshop",
    "privacy": "public"
  }'
```

## 📊 Response Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## 🔧 Common Issues and Solutions

### 1. JWT Token Issues
- Ensure token is included in Authorization header
- Check token expiration
- Verify token format: `Bearer <token>`

### 2. Validation Errors
- Check required fields
- Verify data types and formats
- Ensure email format is valid

### 3. Permission Errors
- Verify user role has required permissions
- Check if user owns the resource
- Ensure admin access for admin-only endpoints

### 4. Database Connection Issues
- Verify database is running
- Check connection credentials
- Ensure database exists

## 📝 Testing Checklist

- [ ] User registration and login
- [ ] Event CRUD operations
- [ ] Ticket management
- [ ] Attendee registration
- [ ] Payment processing
- [ ] Forum functionality
- [ ] Poll creation and voting
- [ ] Q&A sessions
- [ ] Notification system
- [ ] User management
- [ ] Search and filtering
- [ ] Error handling
- [ ] Authentication and authorization
- [ ] Input validation
- [ ] Rate limiting

## 🚀 Performance Testing

### Load Testing with Apache Bench
```bash
# Test event listing endpoint
ab -n 1000 -c 10 http://localhost:5000/api/events

# Test authenticated endpoint
ab -n 100 -c 5 -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/auth/profile
```

### Memory Usage Monitoring
```bash
# Monitor Node.js process
ps aux | grep node

# Monitor memory usage
node --inspect server.js
```

This testing guide covers all major API endpoints and provides practical examples for testing the Event Management System. 