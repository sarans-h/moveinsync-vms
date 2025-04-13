# Authentication Service

This is the authentication microservice for the Vendor Cab and Driver Onboarding System. It handles user authentication, authorization, and session management.

## Features

- User registration and login
- JWT-based authentication
- Role-based access control
- Password management
- Token refresh mechanism
- Rate limiting
- Request validation
- Error handling
- Logging

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. Clone the repository
2. Navigate to the auth-service directory:
   ```bash
   cd backend/auth-service
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create environment file:
   ```bash
   cp .env.example .env
   ```

5. Update the environment variables in `.env` file with your configuration

## Running the Service

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Running Tests
```bash
npm test
```

## API Endpoints

### Public Endpoints

#### Register User
```
POST /api/auth/register
```
Request body:
```json
{
  "email": "user@example.com",
  "password": "Password123",
  "role": "vendor",
  "vendorId": "vendor_id_here"
}
```

#### Login
```
POST /api/auth/login
```
Request body:
```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

#### Refresh Token
```
POST /api/auth/refresh-token
```
Request body:
```json
{
  "token": "your_jwt_token"
}
```

### Protected Endpoints

#### Get Current User
```
GET /api/auth/me
```
Headers:
```
Authorization: Bearer your_jwt_token
```

#### Update Password
```
PATCH /api/auth/update-password
```
Headers:
```
Authorization: Bearer your_jwt_token
```
Request body:
```json
{
  "currentPassword": "CurrentPassword123",
  "newPassword": "NewPassword123"
}
```

## Error Handling

The service uses a centralized error handling system. All errors are returned in the following format:

```json
{
  "status": "error",
  "message": "Error message here"
}
```

## Security Features

- Password hashing using bcrypt
- JWT token-based authentication
- Rate limiting to prevent brute force attacks
- Input validation and sanitization
- CORS protection
- Secure password requirements
- Token expiration and refresh mechanism

## Logging

The service uses Winston for logging with the following levels:
- error: For errors and exceptions
- warn: For warning messages
- info: For general information
- debug: For debugging information

Logs are written to both console and files:
- `logs/error.log`: Contains error logs
- `logs/combined.log`: Contains all logs

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License. 