# Vendor Management and Vehicle Assignment System

A comprehensive microservices-based system for managing vendors, drivers, and vehicles with hierarchical vendor relationships and role-based access control.

## System Architecture

The system is built using a microservices architecture with the following components:

### Backend Services
1. **Auth Service** (Port: 3001)
   - User authentication and authorization
   - JWT token management
   - Role-based access control

2. **Admin Service** (Port: 3006)
   - Vendor management
   - Driver management
   - Vehicle management
   - Entity relationships

3. **Vendor Service**
   - Vendor hierarchy management
   - Vendor permissions
   - Vendor operations

4. **Driver Service**
   - Driver registration
   - License management
   - Driver status tracking

5. **Vehicle Service**
   - Vehicle registration
   - Vehicle assignment
   - Vehicle status management

6. **Assignment Service**
   - Driver-Vehicle assignments
   - Assignment history
   - Status tracking

### Frontend
- React-based web application
- Tailwind CSS for styling
- Role-based dashboards
- Responsive design

## Features

### Vendor Management
- Hierarchical vendor structure (National → Regional → State → City → Local)
- Identity-based vendor tracking
- Permission management
- Vendor status monitoring

### Driver Management
- Driver registration and profiling
- License and document management
- Emergency contact information
- Vehicle assignment tracking

### Vehicle Management
- Vehicle registration
- Owner information management
- Driver assignment
- Status tracking

### Authentication & Authorization
- JWT-based authentication
- Role-based access control
- Secure password management
- Token refresh mechanism

## Technology Stack

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose ODM
- JWT for authentication


### Frontend
- React.js
- Tailwind CSS
- Axios for API calls
- React Router for navigation

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone [repository-url]
```

2. Install dependencies for all services

```bash
# Install backend service dependencies
cd backend/auth-service && npm install
cd ../admin-service && npm install
cd ../vendor-service && npm install
cd ../driver-service && npm install
cd ../vehicle-service && npm install
cd ../assignment-service && npm install

# Install frontend dependencies
cd ../../frontend && npm install
```

3. Set up environment variables
- Copy `.env.example` to `.env` in each service directory
- Update the variables with your configuration

4. Start the services

```bash
# Start backend services (from respective directories)
npm run dev

# Start frontend (from frontend directory)
npm run dev
```

## API Documentation

### Auth Service Endpoints
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - User login
- GET `/api/auth/me` - Get current user
- POST `/api/auth/refresh-token` - Refresh JWT token

### Admin Service Endpoints
- GET `/api/admin/entities` - Get all entities by identity
- CRUD operations for vendors, drivers, and vehicles

### Other Services
- Vendor service endpoints
- Driver service endpoints
- Vehicle service endpoints
- Assignment service endpoints

## Security Features
- Password hashing with bcrypt
- JWT token authentication
- Rate limiting
- Input validation
- CORS protection
- Error handling


## License
This project is licensed under the MIT License.

## Acknowledgments
- Node.js community
- React.js community
- MongoDB team
- All contributors


