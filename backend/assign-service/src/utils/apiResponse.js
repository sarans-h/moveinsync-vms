class ApiResponse {
  static success(data, message = 'Success', statusCode = 200) {
    return {
      success: true,
      statusCode,
      message,
      data
    };
  }

  static error(message, statusCode = 500, errors = null) {
    return {
      success: false,
      statusCode,
      message,
      errors
    };
  }

  static paginated(data, page, limit, total, message = 'Success') {
    return {
      success: true,
      message,
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
}

module.exports = ApiResponse; 