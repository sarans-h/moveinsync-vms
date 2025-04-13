const { validationResult } = require('express-validator');
const AppError = require('../utils/appError');

exports.validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  console.log(errors);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => ({
      field: err.path,
      message: err.msg
    }));
    return next(new AppError('Validation Error', 400, errorMessages));
  }
  next();
}; 