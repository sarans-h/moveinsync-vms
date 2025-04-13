class ApiResponse {
  constructor(statusCode, message, data = null) {
    this.success = statusCode >= 200 && statusCode < 300;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }

  static success(data, message = 'Success', statusCode = 200) {
    return new ApiResponse(statusCode, message, data);
  }

  static error(message, statusCode = 400, errors = null) {
    return new ApiResponse(statusCode, message, errors);
  }

  static created(data, message = 'Resource created successfully') {
    return new ApiResponse(201, message, data);
  }

  static noContent(message = 'No content') {
    return new ApiResponse(204, message);
  }

  static badRequest(message, errors = null) {
    return new ApiResponse(400, message, errors);
  }

  static unauthorized(message = 'Unauthorized access') {
    return new ApiResponse(401, message);
  }

  static forbidden(message = 'Forbidden access') {
    return new ApiResponse(403, message);
  }

  static notFound(message = 'Resource not found') {
    return new ApiResponse(404, message);
  }

  static conflict(message, errors = null) {
    return new ApiResponse(409, message, errors);
  }

  static validationError(errors) {
    return new ApiResponse(422, 'Validation failed', errors);
  }

  static serverError(message = 'Internal server error') {
    return new ApiResponse(500, message);
  }
}

module.exports = ApiResponse; 