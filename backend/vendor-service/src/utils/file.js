const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class File {
  static async read(filePath) {
    try {
      return await fs.readFile(filePath, 'utf8');
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
      throw error;
    }
  }

  static async write(filePath, data) {
    try {
      await fs.writeFile(filePath, data, 'utf8');
    } catch (error) {
      console.error(`Error writing to file ${filePath}:`, error);
      throw error;
    }
  }

  static async append(filePath, data) {
    try {
      await fs.appendFile(filePath, data, 'utf8');
    } catch (error) {
      console.error(`Error appending to file ${filePath}:`, error);
      throw error;
    }
  }

  static async delete(filePath) {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error(`Error deleting file ${filePath}:`, error);
      throw error;
    }
  }

  static async exists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  static async createDirectory(dirPath) {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      console.error(`Error creating directory ${dirPath}:`, error);
      throw error;
    }
  }

  static async deleteDirectory(dirPath) {
    try {
      await fs.rmdir(dirPath, { recursive: true });
    } catch (error) {
      console.error(`Error deleting directory ${dirPath}:`, error);
      throw error;
    }
  }

  static async listDirectory(dirPath) {
    try {
      return await fs.readdir(dirPath);
    } catch (error) {
      console.error(`Error listing directory ${dirPath}:`, error);
      throw error;
    }
  }

  static async getStats(filePath) {
    try {
      return await fs.stat(filePath);
    } catch (error) {
      console.error(`Error getting stats for file ${filePath}:`, error);
      throw error;
    }
  }

  static async copy(sourcePath, destinationPath) {
    try {
      await fs.copyFile(sourcePath, destinationPath);
    } catch (error) {
      console.error(`Error copying file from ${sourcePath} to ${destinationPath}:`, error);
      throw error;
    }
  }

  static async move(sourcePath, destinationPath) {
    try {
      await fs.rename(sourcePath, destinationPath);
    } catch (error) {
      console.error(`Error moving file from ${sourcePath} to ${destinationPath}:`, error);
      throw error;
    }
  }

  static async getHash(filePath, algorithm = 'sha256') {
    try {
      const fileBuffer = await fs.readFile(filePath);
      const hashSum = crypto.createHash(algorithm);
      hashSum.update(fileBuffer);
      return hashSum.digest('hex');
    } catch (error) {
      console.error(`Error getting hash for file ${filePath}:`, error);
      throw error;
    }
  }

  static getExtension(filePath) {
    return path.extname(filePath).toLowerCase();
  }

  static getFileName(filePath) {
    return path.basename(filePath);
  }

  static getDirectoryName(filePath) {
    return path.dirname(filePath);
  }

  static joinPaths(...paths) {
    return path.join(...paths);
  }

  static isAbsolute(filePath) {
    return path.isAbsolute(filePath);
  }

  static resolvePath(filePath) {
    return path.resolve(filePath);
  }

  static normalizePath(filePath) {
    return path.normalize(filePath);
  }
}

module.exports = File; 