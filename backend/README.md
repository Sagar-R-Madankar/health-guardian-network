
# Health Guardian Network - Backend

This directory contains the backend code for the Health Guardian Network application, including:

1. Node.js/Express API server (`server.js`)
2. Python machine learning model for disease prediction (`model.py`)

## Database Setup

The application uses MySQL as the database. You'll need to set up a MySQL server and create a database called `health_guardian_db`.

### Database Tables

The following tables are automatically created when the server starts:

- `users` - Stores user information (admin and regular users)
- `donors` - Stores donor information, linked to users
- `diseases` - Stores disease prediction results from the ML model
- `alerts` - Stores health alerts created by admins
- `notifications` - Stores system notifications for users

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=health_guardian_db
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

## Python Dependencies

For the ML model, you'll need to install:

```bash
pip install pandas numpy scikit-learn xgboost joblib
```

## Node.js Dependencies

Install the required Node.js packages:

```bash
npm install express mysql2 cors bcrypt jsonwebtoken multer
```

## Running the Server

```bash
node server.js
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login

### Users
- `GET /api/user` - Get current user info

### Donors
- `POST /api/donors` - Register as a donor
- `GET /api/donors` - Get all donors
- `POST /api/donors/:id/contact` - Contact a donor (admin only)

### Disease Prediction
- `POST /api/predictions` - Run disease prediction model (admin only)
- `GET /api/diseases` - Get all predicted diseases

### Alerts
- `POST /api/alerts` - Create a new alert (admin only)
- `GET /api/alerts` - Get all alerts
- `PATCH /api/alerts/:id` - Update alert status

### Notifications
- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications/:id` - Mark notification as read
