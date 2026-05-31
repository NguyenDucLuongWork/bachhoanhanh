# Admin Dashboard - API Integration Guide

## Overview
The admin dashboard is fully functional with CRUD operations (Create, Read, Update, Delete) and includes three main sections:
- **Users** - User management with roles (admin/user)
- **Data** - General data/project management
- **Sort Script** - Sorting and filtering demonstration

## Authentication

### Login Flow
The app uses OAuth2 password grant authentication. The login credentials are pre-filled:
- **URL**: `http://bachhoanhanh/auth/realms/bachhoanhanh/protocol/openid-connect/token`
- **Username**: `testuser`
- **Password**: `123456`
- **Client ID**: `gateway-client`

The access token is automatically stored in `localStorage` for subsequent requests.

## API Endpoints to Configure

Replace the demo endpoints in [src/utils/api.js](src/utils/api.js) with your actual API endpoints:

### 1. User Management
```javascript
// GET all users
fetchData('/api/users', token)

// CREATE new user
createData('/api/users', { name, email, role }, token)

// UPDATE user
updateData('/api/users', userId, { name, email, role }, token)

// DELETE user
deleteData('/api/users', userId, token)
```

### 2. Data Management
```javascript
// GET all data
fetchData('/api/data', token)

// CREATE new data
createData('/api/data', { title, description, status }, token)

// UPDATE data
updateData('/api/data', dataId, { title, description, status }, token)

// DELETE data
deleteData('/api/data', dataId, token)
```

### 3. Sort Script
```javascript
// GET sortable items
fetchData('/api/sort', token)
```

## Components Structure

```
src/
├── components/
│   ├── Login.jsx              # OAuth2 login form
│   ├── AdminDashboard.jsx     # Tab navigation & layout
│   ├── UserManagement.jsx     # Users CRUD
│   ├── DataManagement.jsx     # Data/Projects CRUD
│   └── SortManagement.jsx     # Sorting interface
├── utils/
│   └── api.js                 # API calls & auth
├── App.jsx                    # Main app component
└── main.jsx                   # Entry point
```

## Running the App

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# The app will be available at http://localhost:5173
```

## UI Features

### Login Page
- Clean, centered login form
- Pre-filled demo credentials
- Error handling with user feedback

### Admin Dashboard
- **Header** with logout button
- **Tab Navigation** for different sections
- **Table-based** interface for data management
- **CRUD Forms** for creating/editing items
- **Simple, responsive** design with Tailwind CSS

## Demo Data

The app includes fallback demo data so you can test the UI without a backend:
- **Users**: John Doe (admin), Jane Smith (user)
- **Data**: Project A, Project B
- **Sort Items**: Item Z, Item A, Item M, Item B

## Customization

### Change API Base URL
Edit [src/utils/api.js](src/utils/api.js):
```javascript
const API_BASE_URL = 'your-api-url-here';
```

### Add New Tabs
Edit [src/components/AdminDashboard.jsx](src/components/AdminDashboard.jsx) and create new component files.

### Update API Endpoints
Each endpoint call in the component files can be customized:
```javascript
// In UserManagement.jsx
fetchData('/your-endpoint', token)
```

## Error Handling

All API calls include try-catch blocks with fallback demo data for testing purposes. Update error messages as needed for your backend.

## Token Management

- Tokens are stored in `localStorage` with key `auth_token`
- Logout clears the token
- Auto-login on page reload if token exists
- Add token refresh logic if needed in [src/utils/api.js](src/utils/api.js)
