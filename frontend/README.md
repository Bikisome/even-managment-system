# Event Management System - Frontend

A modern, responsive React application for managing events, built with Vite, Tailwind CSS, and React Router.

## Features

### 🔐 Authentication
- User registration and login
- JWT token-based authentication
- Protected routes
- User profile management

### 📅 Event Management
- Create, edit, and delete events
- Event discovery with search and filtering
- Event details with comprehensive information
- Event status tracking (upcoming/past)

### 🎫 Ticketing System
- Create and manage event tickets
- Ticket availability checking
- Attendee registration
- Payment processing integration

### 👥 Attendee Management
- View event attendees (organizer only)
- Registration tracking
- Attendee communication tools

### 💬 Engagement Features
- Event forums for discussions
- Polls and voting
- Q&A sessions
- Real-time notifications

### 📊 Dashboard
- Overview statistics
- Recent events
- Quick actions
- Performance metrics

## Tech Stack

- **React 19** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **React Hot Toast** - Toast notifications
- **Lucide React** - Icon library
- **Date-fns** - Date manipulation

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.jsx      # Main layout with navigation
│   └── ProtectedRoute.jsx # Route protection component
├── context/            # React context providers
│   └── AuthContext.jsx # Authentication context
├── pages/              # Page components
│   ├── Login.jsx       # Login page
│   ├── Register.jsx    # Registration page
│   ├── Dashboard.jsx   # Dashboard page
│   ├── Events.jsx      # Events listing page
│   ├── EventDetail.jsx # Event details page
│   ├── CreateEvent.jsx # Event creation page
│   ├── EditEvent.jsx   # Event editing page
│   ├── MyEvents.jsx    # User's events page
│   ├── MyRegistrations.jsx # User's registrations page
│   └── Profile.jsx     # User profile page
├── services/           # API services
│   └── api.js         # API client and endpoints
├── App.jsx            # Main app component
├── main.jsx           # App entry point
└── index.css          # Global styles
```

## API Integration

The frontend integrates with a RESTful API backend. All API calls are centralized in `src/services/api.js` and include:

- Authentication endpoints
- Event CRUD operations
- Ticket management
- Attendee registration
- Payment processing
- Forum and engagement features

## Key Features

### Responsive Design
- Mobile-first approach
- Responsive navigation
- Adaptive layouts for all screen sizes

### User Experience
- Intuitive navigation
- Loading states
- Error handling
- Toast notifications
- Form validation

### Security
- JWT token authentication
- Protected routes
- Automatic token refresh
- Secure API communication

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### API Base URL

The API base URL can be configured in `src/services/api.js`:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the repository or contact the development team.
