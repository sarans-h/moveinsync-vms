const multer = require('multer');
const path = require('path');
const AppError = require('./appError');

class FileUpload {
  static ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
  static MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  static storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  static fileFilter = (req, file, cb) => {
    if (FileUpload.ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('Invalid file type. Only JPEG, PNG and GIF are allowed.', 400), false);
    }
  };

  static upload = multer({
    storage: FileUpload.storage,
    fileFilter: FileUpload.fileFilter,
    limits: {
      fileSize: FileUpload.MAX_FILE_SIZE
    }
  });

  static validateFile(file) {
    if (!file) {
      throw new AppError('No file uploaded', 400);
    }

    if (!FileUpload.ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      throw new AppError('Invalid file type. Only JPEG, PNG and GIF are allowed.', 400);
    }

    if (file.size > FileUpload.MAX_FILE_SIZE) {
      throw new AppError('File size exceeds 5MB limit', 400);
    }

    return true;
  }
}

module.exports = FileUpload; 