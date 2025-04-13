class ApiResponse {
  constructor(statusCode, message, data = null) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }

  static success(data = null, message = 'Operation successful') {
    return new ApiResponse(200, message, data);
  }

  static created(data = null, message = 'Resource created successfully') {
    return new ApiResponse(201, message, data);
  }

  static noContent(message = 'Operation completed successfully') {
    return new ApiResponse(204, message);
  }

  static badRequest(message = 'Bad request', errors = null) {
    return new ApiResponse(400, message, errors);
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiResponse(401, message);
  }

  static forbidden(message = 'Forbidden') {
    return new ApiResponse(403, message);
  }

  static notFound(message = 'Resource not found') {
    return new ApiResponse(404, message);
  }

  static conflict(message = 'Resource conflict') {
    return new ApiResponse(409, message);
  }

  static error(message = 'Internal server error', errors = null) {
    return new ApiResponse(500, message, errors);
  }

  toJSON() {
    return {
      statusCode: this.statusCode,
      message: this.message,
      data: this.data,
      timestamp: this.timestamp
    };
  }
}

module.exports = ApiResponse; 