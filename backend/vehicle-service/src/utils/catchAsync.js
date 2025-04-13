const { logger } = require('./logger');

module.exports = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(err => {
      logger.error('Unhandled error:', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
      });
      next(err);
    });
  };
}; 