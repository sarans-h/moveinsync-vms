const Joi = require('joi');
const Error = require('./error');

class Validation {
  static validate(schema, data, options = {}) {
    const { abortEarly = false, stripUnknown = true } = options;
    const result = schema.validate(data, { abortEarly, stripUnknown });
    if (result.error) {
      throw Error.Validation('Validation Error', result.error.details);
    }
    return result.value;
  }

  static schemas = {
    id: Joi.string().hex().length(24).required(),
    pagination: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      sortBy: Joi.string().default('createdAt'),
      sortOrder: Joi.string().valid('asc', 'desc').default('desc')
    }),
    search: Joi.object({
      query: Joi.string().min(1).required(),
      fields: Joi.array().items(Joi.string()).default([])
    }),
    dateRange: Joi.object({
      startDate: Joi.date().iso().required(),
      endDate: Joi.date().iso().min(Joi.ref('startDate')).required()
    }),
    coordinates: Joi.object({
      latitude: Joi.number().min(-90).max(90).required(),
      longitude: Joi.number().min(-180).max(180).required()
    }),
    address: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      country: Joi.string().required(),
      zipCode: Joi.string().required()
    }),
    contact: Joi.object({
      email: Joi.string().email().required(),
      phone: Joi.string().pattern(/^\+?[\d\s-]{10,}$/).required(),
      website: Joi.string().uri().allow('')
    }),
    businessHours: Joi.object({
      monday: Joi.object({
        open: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
        close: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required()
      }),
      tuesday: Joi.object({
        open: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
        close: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required()
      }),
      wednesday: Joi.object({
        open: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
        close: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required()
      }),
      thursday: Joi.object({
        open: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
        close: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required()
      }),
      friday: Joi.object({
        open: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
        close: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required()
      }),
      saturday: Joi.object({
        open: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
        close: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required()
      }),
      sunday: Joi.object({
        open: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
        close: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required()
      })
    }),
    user: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).required(),
      firstName: Joi.string().min(2).max(50).required(),
      lastName: Joi.string().min(2).max(50).required(),
      role: Joi.string().valid('user', 'admin').default('user'),
      isActive: Joi.boolean().default(true)
    }),
    vendor: Joi.object({
      name: Joi.string().min(2).max(100).required(),
      description: Joi.string().max(500),
      category: Joi.string().required(),
      address: Joi.object({
        street: Joi.string().required(),
        city: Joi.string().required(),
        state: Joi.string().required(),
        country: Joi.string().required(),
        zipCode: Joi.string().required()
      }).required(),
      contact: Joi.object({
        email: Joi.string().email().required(),
        phone: Joi.string().pattern(/^\+?[\d\s-]{10,}$/).required(),
        website: Joi.string().uri().allow('')
      }).required(),
      businessHours: Joi.object({
        monday: Joi.object({
          open: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
          close: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required()
        }),
        tuesday: Joi.object({
          open: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
          close: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required()
        }),
        wednesday: Joi.object({
          open: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
          close: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required()
        }),
        thursday: Joi.object({
          open: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
          close: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required()
        }),
        friday: Joi.object({
          open: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
          close: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required()
        }),
        saturday: Joi.object({
          open: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
          close: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required()
        }),
        sunday: Joi.object({
          open: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
          close: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required()
        })
      }).required(),
      isActive: Joi.boolean().default(true)
    }),
    product: Joi.object({
      name: Joi.string().min(2).max(100).required(),
      description: Joi.string().max(500),
      price: Joi.number().min(0).required(),
      category: Joi.string().required(),
      vendorId: Joi.string().hex().length(24).required(),
      isAvailable: Joi.boolean().default(true),
      images: Joi.array().items(Joi.string().uri()).default([]),
      attributes: Joi.object().default({})
    }),
    order: Joi.object({
      userId: Joi.string().hex().length(24).required(),
      items: Joi.array().items(
        Joi.object({
          productId: Joi.string().hex().length(24).required(),
          quantity: Joi.number().integer().min(1).required(),
          price: Joi.number().min(0).required()
        })
      ).min(1).required(),
      totalAmount: Joi.number().min(0).required(),
      status: Joi.string().valid('pending', 'processing', 'completed', 'cancelled').default('pending'),
      shippingAddress: Joi.object({
        street: Joi.string().required(),
        city: Joi.string().required(),
        state: Joi.string().required(),
        country: Joi.string().required(),
        zipCode: Joi.string().required()
      }).required(),
      paymentMethod: Joi.string().valid('credit_card', 'debit_card', 'paypal').required(),
      paymentStatus: Joi.string().valid('pending', 'completed', 'failed').default('pending')
    })
  };

  static validateId(id) {
    return this.validate(this.schemas.id, id);
  }

  static validatePagination(query) {
    return this.validate(this.schemas.pagination, query);
  }

  static validateSearch(query) {
    return this.validate(this.schemas.search, query);
  }

  static validateDateRange(range) {
    return this.validate(this.schemas.dateRange, range);
  }

  static validateCoordinates(coords) {
    return this.validate(this.schemas.coordinates, coords);
  }

  static validateAddress(address) {
    return this.validate(this.schemas.address, address);
  }

  static validateContact(contact) {
    return this.validate(this.schemas.contact, contact);
  }

  static validateBusinessHours(hours) {
    return this.validate(this.schemas.businessHours, hours);
  }

  static validateUser(user) {
    return this.validate(this.schemas.user, user);
  }

  static validateVendor(vendor) {
    return this.validate(this.schemas.vendor, vendor);
  }

  static validateProduct(product) {
    return this.validate(this.schemas.product, product);
  }

  static validateOrder(order) {
    return this.validate(this.schemas.order, order);
  }
}

module.exports = Validation; 