class Error extends global.Error {
  constructor(message, code = 'INTERNAL_ERROR', status = 500, details = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.status = status;
    this.details = details;
    this.timestamp = new Date();
    Error.captureStackTrace(this, this.constructor);
  }

  static BadRequest(message, details = {}) {
    return new Error(message, 'BAD_REQUEST', 400, details);
  }

  static Unauthorized(message = 'Unauthorized', details = {}) {
    return new Error(message, 'UNAUTHORIZED', 401, details);
  }

  static Forbidden(message = 'Forbidden', details = {}) {
    return new Error(message, 'FORBIDDEN', 403, details);
  }

  static NotFound(message = 'Not Found', details = {}) {
    return new Error(message, 'NOT_FOUND', 404, details);
  }

  static Conflict(message, details = {}) {
    return new Error(message, 'CONFLICT', 409, details);
  }

  static Validation(message, details = {}) {
    return new Error(message, 'VALIDATION_ERROR', 422, details);
  }

  static TooManyRequests(message = 'Too Many Requests', details = {}) {
    return new Error(message, 'TOO_MANY_REQUESTS', 429, details);
  }

  static Internal(message = 'Internal Server Error', details = {}) {
    return new Error(message, 'INTERNAL_ERROR', 500, details);
  }

  static NotImplemented(message = 'Not Implemented', details = {}) {
    return new Error(message, 'NOT_IMPLEMENTED', 501, details);
  }

  static ServiceUnavailable(message = 'Service Unavailable', details = {}) {
    return new Error(message, 'SERVICE_UNAVAILABLE', 503, details);
  }

  static GatewayTimeout(message = 'Gateway Timeout', details = {}) {
    return new Error(message, 'GATEWAY_TIMEOUT', 504, details);
  }

  static isOperational(error) {
    if (error instanceof Error) {
      return error.status < 500;
    }
    return false;
  }

  static toJSON(error) {
    return {
      name: error.name,
      message: error.message,
      code: error.code,
      status: error.status,
      details: error.details,
      timestamp: error.timestamp,
      stack: error.stack
    };
  }

  static fromJSON(json) {
    const error = new Error(json.message, json.code, json.status, json.details);
    error.name = json.name;
    error.timestamp = new Date(json.timestamp);
    error.stack = json.stack;
    return error;
  }

  static wrap(error, message, code, status, details = {}) {
    if (error instanceof Error) {
      return error;
    }
    return new Error(message || error.message, code, status, {
      ...details,
      originalError: error
    });
  }

  static handle(error, req, res, next) {
    if (error instanceof Error) {
      return res.status(error.status).json(Error.toJSON(error));
    }
    const wrapped = Error.wrap(
      error,
      'Internal Server Error',
      'INTERNAL_ERROR',
      500
    );
    return res.status(wrapped.status).json(Error.toJSON(wrapped));
  }

  static async handleAsync(fn) {
    return async (req, res, next) => {
      try {
        await fn(req, res, next);
      } catch (error) {
        next(error);
      }
    };
  }

  static log(error, req = null) {
    const errorJSON = Error.toJSON(error);
    if (req) {
      errorJSON.request = {
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: req.body,
        query: req.query,
        params: req.params
      };
    }
    console.error(JSON.stringify(errorJSON, null, 2));
  }

  static format(error) {
    return {
      message: error.message,
      code: error.code,
      status: error.status,
      details: error.details
    };
  }

  static isError(error) {
    return error instanceof Error;
  }

  static isHttpError(error) {
    return error instanceof Error && typeof error.status === 'number';
  }

  static isValidationError(error) {
    return (
      error instanceof Error &&
      error.code === 'VALIDATION_ERROR' &&
      error.status === 422
    );
  }

  static isNotFoundError(error) {
    return (
      error instanceof Error &&
      error.code === 'NOT_FOUND' &&
      error.status === 404
    );
  }

  static isUnauthorizedError(error) {
    return (
      error instanceof Error &&
      error.code === 'UNAUTHORIZED' &&
      error.status === 401
    );
  }

  static isForbiddenError(error) {
    return (
      error instanceof Error &&
      error.code === 'FORBIDDEN' &&
      error.status === 403
    );
  }

  static isConflictError(error) {
    return (
      error instanceof Error &&
      error.code === 'CONFLICT' &&
      error.status === 409
    );
  }

  static isTooManyRequestsError(error) {
    return (
      error instanceof Error &&
      error.code === 'TOO_MANY_REQUESTS' &&
      error.status === 429
    );
  }

  static isInternalError(error) {
    return (
      error instanceof Error &&
      error.code === 'INTERNAL_ERROR' &&
      error.status === 500
    );
  }

  static isServiceUnavailableError(error) {
    return (
      error instanceof Error &&
      error.code === 'SERVICE_UNAVAILABLE' &&
      error.status === 503
    );
  }

  static isGatewayTimeoutError(error) {
    return (
      error instanceof Error &&
      error.code === 'GATEWAY_TIMEOUT' &&
      error.status === 504
    );
  }
}

module.exports = Error; 