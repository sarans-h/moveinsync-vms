const crypto = require('crypto');

class String {
  static capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  static camelCase(str) {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
        index === 0 ? word.toLowerCase() : word.toUpperCase()
      )
      .replace(/\s+/g, '');
  }

  static snakeCase(str) {
    return str
      .replace(/([A-Z])/g, ' $1')
      .toLowerCase()
      .replace(/\s+/g, '_');
  }

  static kebabCase(str) {
    return str
      .replace(/([A-Z])/g, ' $1')
      .toLowerCase()
      .replace(/\s+/g, '-');
  }

  static pascalCase(str) {
    return str
      .replace(/\w+/g, word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .replace(/\s+/g, '');
  }

  static titleCase(str) {
    return str
      .toLowerCase()
      .replace(/(?:^|\s)\w/g, word => word.toUpperCase());
  }

  static truncate(str, length, suffix = '...') {
    if (str.length <= length) return str;
    return str.slice(0, length).trim() + suffix;
  }

  static slugify(str) {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  static random(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  static uuid() {
    return crypto.randomUUID();
  }

  static hash(str, algorithm = 'sha256') {
    return crypto.createHash(algorithm).update(str).digest('hex');
  }

  static base64Encode(str) {
    return Buffer.from(str).toString('base64');
  }

  static base64Decode(str) {
    return Buffer.from(str, 'base64').toString();
  }

  static escape(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  static unescape(str) {
    return str
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'");
  }

  static stripHtml(str) {
    return str.replace(/<[^>]*>/g, '');
  }

  static countWords(str) {
    return str.trim().split(/\s+/).length;
  }

  static countCharacters(str) {
    return str.length;
  }

  static countLines(str) {
    return str.split('\n').length;
  }

  static isPalindrome(str) {
    const clean = str.toLowerCase().replace(/[^a-z0-9]/g, '');
    return clean === clean.split('').reverse().join('');
  }

  static isEmail(str) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(str);
  }

  static isUrl(str) {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  }

  static isPhoneNumber(str) {
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    return phoneRegex.test(str);
  }

  static isCreditCard(str) {
    const cardRegex = /^[\d\s-]{13,19}$/;
    return cardRegex.test(str);
  }

  static isHexColor(str) {
    const hexRegex = /^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/;
    return hexRegex.test(str);
  }

  static isIPv4(str) {
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipv4Regex.test(str)) return false;
    return str.split('.').every(num => parseInt(num) >= 0 && parseInt(num) <= 255);
  }

  static isIPv6(str) {
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    return ipv6Regex.test(str);
  }

  static isMACAddress(str) {
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    return macRegex.test(str);
  }

  static isPostalCode(str) {
    const postalRegex = /^\d{5}(-\d{4})?$/;
    return postalRegex.test(str);
  }

  static isSSN(str) {
    const ssnRegex = /^\d{3}-\d{2}-\d{4}$/;
    return ssnRegex.test(str);
  }

  static isISBN(str) {
    const isbnRegex = /^(?:\d{9}[\dX]|\d{13})$/;
    return isbnRegex.test(str);
  }

  static isUUID(str) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }
}

module.exports = String; 