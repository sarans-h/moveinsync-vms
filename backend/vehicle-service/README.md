# Vehicle Service

This service is part of the MIS (Management Information System) platform and handles vehicle management operations.

## Features

- Vehicle onboarding and management
- Owner information tracking
- Driver assignment
- Vendor-specific vehicle management
- Comprehensive logging and error handling

## API Endpoints

### Vehicle Management

- `POST /api/vehicles` - Onboard a new vehicle
- `GET /api/vehicles` - Get all vehicles for a vendor (with pagination and search)
- `GET /api/vehicles/:id` - Get a single vehicle
- `PATCH /api/vehicles/:id` - Update vehicle information
- `DELETE /api/vehicles/:id` - Delete a vehicle (soft delete)

### Driver Assignment

- `POST /api/vehicles/:id/assign-driver` - Assign a driver to a vehicle
- `POST /api/vehicles/:id/unassign-driver` - Unassign a driver from a vehicle

## Authentication

All endpoints require authentication with a valid JWT token. The token can be provided in:
- Authorization header as `Bearer <token>`
- Cookie as `jwt` or `token`

## Authorization

Only vendors with the `vehicleOnboarding` permission can access these endpoints.

## Environment Variables

- `NODE_ENV` - Environment (development/production)
- `PORT` - Port to run the service on (default: 3002)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT token verification
- `JWT_EXPIRES_IN` - JWT token expiration time
- `VENDOR_SERVICE_URL` - URL of the vendor service
- `AUTH_SERVICE_URL` - URL of the auth service
- `CORS_ORIGIN` - CORS origin (default: http://localhost:3000)

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables in `.env` file
4. Start the service:
   ```
   npm start
   ```

## Development

For development, use:
```
npm run dev
```

## Testing

Run tests with:
```
npm test
``` 