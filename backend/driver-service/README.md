# Driver Service

This service manages driver information and license documents.

## Features

- Driver profile management
- License document management
- Integration with auth service for user authentication

## API Endpoints

### Driver Management

- `POST /api/drivers` - Create a new driver
- `GET /api/drivers/:id` - Get a driver by ID
- `GET /api/drivers/user/:userId` - Get a driver by user ID
- `PUT /api/drivers/:id` - Update a driver
- `DELETE /api/drivers/:id` - Delete a driver

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=3003
MONGODB_URI=mongodb://localhost:27017/driver-service
JWT_SECRET=your_jwt_secret_key
AUTH_SERVICE_URL=http://localhost:3001
VENDOR_SERVICE_URL=http://localhost:3002
CLIENT_URL=http://localhost:3000
```

## Installation

1. Install dependencies:
   ```
   npm install
   ```

2. Start the service:
   ```
   npm start
   ```

3. For development:
   ```
   npm run dev
   ```

## Integration with Auth Service

The driver service works with the auth service, which handles user authentication. The driver model has a `userId` field that references the user in the auth service. 