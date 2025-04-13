const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const Error = require('./error');

class Auth {
  static async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  static async comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
  }

  static generateToken(payload, secret, options = {}) {
    const {
      expiresIn = '1d',
      algorithm = 'HS256',
      issuer = 'vendor-service',
      audience = 'vendor-service'
    } = options;

    return jwt.sign(payload, secret, {
      expiresIn,
      algorithm,
      issuer,
      audience
    });
  }

  static verifyToken(token, secret, options = {}) {
    const {
      algorithms = ['HS256'],
      issuer = 'vendor-service',
      audience = 'vendor-service'
    } = options;

    try {
      return jwt.verify(token, secret, {
        algorithms,
        issuer,
        audience
      });
    } catch (error) {
      throw Error.Unauthorized('Invalid token');
    }
  }

  static decodeToken(token) {
    try {
      return jwt.decode(token);
    } catch (error) {
      throw Error.Unauthorized('Invalid token');
    }
  }

  static generateRefreshToken() {
    return crypto.randomBytes(40).toString('hex');
  }

  static generateResetToken() {
    return crypto.randomBytes(20).toString('hex');
  }

  static generateVerificationToken() {
    return crypto.randomBytes(20).toString('hex');
  }

  static hashToken(token) {
    return crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
  }

  static verifyResetToken(token, hash) {
    return this.hashToken(token) === hash;
  }

  static verifyVerificationToken(token, hash) {
    return this.hashToken(token) === hash;
  }

  static generatePasswordResetUrl(token, baseUrl) {
    return `${baseUrl}/reset-password?token=${token}`;
  }

  static generateVerificationUrl(token, baseUrl) {
    return `${baseUrl}/verify-email?token=${token}`;
  }

  static generatePassword() {
    return crypto.randomBytes(8).toString('hex');
  }

  static hashPasswordSync(password) {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
  }

  static comparePasswordSync(password, hash) {
    return bcrypt.compareSync(password, hash);
  }

  static generateTokenSync(payload, secret, options = {}) {
    const {
      expiresIn = '1d',
      algorithm = 'HS256',
      issuer = 'vendor-service',
      audience = 'vendor-service'
    } = options;

    return jwt.sign(payload, secret, {
      expiresIn,
      algorithm,
      issuer,
      audience
    });
  }

  static verifyTokenSync(token, secret, options = {}) {
    const {
      algorithms = ['HS256'],
      issuer = 'vendor-service',
      audience = 'vendor-service'
    } = options;

    try {
      return jwt.verify(token, secret, {
        algorithms,
        issuer,
        audience
      });
    } catch (error) {
      throw Error.Unauthorized('Invalid token');
    }
  }

  static decodeTokenSync(token) {
    try {
      return jwt.decode(token);
    } catch (error) {
      throw Error.Unauthorized('Invalid token');
    }
  }

  static generateRefreshTokenSync() {
    return crypto.randomBytes(40).toString('hex');
  }

  static generateResetTokenSync() {
    return crypto.randomBytes(20).toString('hex');
  }

  static generateVerificationTokenSync() {
    return crypto.randomBytes(20).toString('hex');
  }

  static hashTokenSync(token) {
    return crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
  }

  static verifyResetTokenSync(token, hash) {
    return this.hashTokenSync(token) === hash;
  }

  static verifyVerificationTokenSync(token, hash) {
    return this.hashTokenSync(token) === hash;
  }

  static generatePasswordResetUrlSync(token, baseUrl) {
    return `${baseUrl}/reset-password?token=${token}`;
  }

  static generateVerificationUrlSync(token, baseUrl) {
    return `${baseUrl}/verify-email?token=${token}`;
  }

  static generatePasswordSync() {
    return crypto.randomBytes(8).toString('hex');
  }

  static middleware(secret, options = {}) {
    return async (req, res, next) => {
      try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
          throw Error.Unauthorized('No token provided');
        }
        const decoded = this.verifyToken(token, secret, options);
        req.user = decoded;
        next();
      } catch (error) {
        next(error);
      }
    };
  }

  static roleMiddleware(roles) {
    return (req, res, next) => {
      try {
        if (!req.user) {
          throw Error.Unauthorized('No user found');
        }
        if (!roles.includes(req.user.role)) {
          throw Error.Forbidden('Insufficient permissions');
        }
        next();
      } catch (error) {
        next(error);
      }
    };
  }

  static ownerMiddleware(field = 'userId') {
    return (req, res, next) => {
      try {
        if (!req.user) {
          throw Error.Unauthorized('No user found');
        }
        if (req.user.role !== 'admin' && req.params[field] !== req.user.id) {
          throw Error.Forbidden('Insufficient permissions');
        }
        next();
      } catch (error) {
        next(error);
      }
    };
  }
}

module.exports = Auth; 