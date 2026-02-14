# Secure Test Environment Enforcement

A comprehensive secure testing platform with real-time violation tracking, event logging, and audit trail capabilities.

## 🎯 Features

- **User Authentication**: Register and login with JWT-based authentication
- **Secure Test Environment**: Monitored test-taking interface
- **Real-time Violation Tracking**: 
  - Tab switching detection
  - Window focus loss tracking
  - Fullscreen exit monitoring
  - Copy/paste detection
  - Keyboard shortcut monitoring
- **Event Logging System**:
  - Batch sending every 15 seconds
  - Offline persistence with localStorage
  - Immutable logs post-submission
- **Comprehensive Audit Trail**: View all events and violations
- **Production-ready**: Clean architecture with best practices

## 🏗️ Tech Stack

### Frontend
- React 18 with Vite
- Redux + Redux-Saga for state management
- React Router for navigation
- Tailwind CSS for styling
- Axios for API calls

### Backend
- Node.js + Express
- MySQL database
- JWT authentication
- RESTful API design
- Bcrypt for password hashing

## 📋 Prerequisites

- Node.js (v16 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

## 🚀 Quick Start

### Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Configure environment
# Edit .env file with your MySQL credentials
# Default settings:
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=
# DB_NAME=secure_test_db

# Run database migrations
npm run migrate

# Start backend server
npm run dev
```

Backend will run on http://localhost:5000

### Frontend Setup

```bash
# Open new terminal and navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on http://localhost:3000

## 🔐 Demo Credentials

**Email:** gaurav@ex.com  
**Password:** Test@123

## 📁 Project Structure

```
secure-test-environment/
├── backend/
│   ├── config/
│   │   └── database.js          # Database configuration
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   └── testController.js    # Test and logging logic
│   ├── middleware/
│   │   └── auth.js              # JWT authentication middleware
│   ├── migrations/
│   │   └── runMigrations.js     # Database schema setup
│   ├── routes/
│   │   ├── auth.js              # Auth routes
│   │   └── test.js              # Test routes
│   ├── .env                     # Environment variables
│   ├── package.json
│   └── server.js                # Express server
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Login.jsx        # Login page
    │   │   ├── Register.jsx     # Registration page
    │   │   ├── Home.jsx         # Test introduction
    │   │   ├── Test.jsx         # Test interface
    │   │   └── EventLogs.jsx    # Event logs viewer
    │   ├── redux/
    │   │   ├── slices/          # Redux slices
    │   │   ├── sagas/           # Redux sagas
    │   │   └── store.js         # Redux store
    │   ├── services/
    │   │   └── api.js           # API service layer
    │   ├── utils/
    │   │   └── eventLogger.js   # Event logging utility
    │   ├── App.jsx              # Main app component
    │   ├── main.jsx             # Entry point
    │   └── index.css            # Global styles
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```

## 🔄 Complete User Flow

1. **Registration** → User creates account
2. **Login** → User authenticates
3. **Home Page** → User sees test introduction with guidelines
4. **Start Test** → User clicks "Start Assessment"
5. **Test Environment** → 
   - Fullscreen mode activated
   - Violation tracking begins
   - Event logging starts (batch every 15s)
   - Questions displayed
6. **View Logs** → User can view all events and violations
7. **Submit Test** → Test submission with confirmation
8. **Logout** → User redirected to login



## 🔍 Key Features Explained

### Event Logging System
- Events are queued in Redux store
- Every 15 seconds, queued events are sent to backend in batch
- Events persist in localStorage during offline/refresh
- After submission, logs become immutable

### Violation Detection
- **Tab Switch**: Detected via `visibilitychange` event
- **Focus Loss**: Detected via `blur` event
- **Fullscreen Exit**: Detected via `fullscreenchange` event
- **Copy/Paste**: Detected via `copy` and `paste` events
- **Keyboard Shortcuts**: Monitored for suspicious keys (Ctrl+C, F12, etc.)

### Data Persistence
- User sessions: JWT tokens in localStorage
- Event queue: localStorage with attemptId key
- Database: All events permanently stored in MySQL

## 🛠️ Development Commands

### Backend
```bash
npm run dev      # Start with nodemon (auto-reload)
npm start        # Start production server
npm run migrate  # Run database migrations
```

### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
```

## 🔧 Environment Variables

### Backend (.env)
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=secure_test_db
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=24h
```

## 📊 Database Schema

### users
- id, name, email, password, created_at, updated_at

### test_attempts
- id, user_id, attempt_id, status, violation_count, started_at, submitted_at

### event_logs
- id, attempt_id, user_id, event_type, event_data, is_violation, question_id, timestamp, created_at


### Event Batching Not Working
- Check browser console for errors
- Verify backend is running
- Check network tab for API calls every 15 seconds


## 🎨 Customization

### Change Batch Interval
Edit `frontend/src/utils/eventLogger.js`:
```javascript
this.batchInterval = 15000; // Change to desired milliseconds
```

### Add New Event Types
1. Add event type in Test component
2. Update event logger to track it
3. Backend automatically handles any event type

## 📄 License

This project is created for educational and assessment purposes.

---

**Built using React, Redux-Saga, Node.js, and MySQL**
