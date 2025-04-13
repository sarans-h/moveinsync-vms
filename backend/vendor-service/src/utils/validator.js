const Joi = require('joi');

class Validator {
  static validate(schema, data) {
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      throw new Error(JSON.stringify(errors));
    }

    return value;
  }

  static schemas = {
    id: Joi.string().required().hex().length(24),
    
    pagination: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      sortBy: Joi.string(),
      sortOrder: Joi.string().valid('asc', 'desc').default('desc')
    }),

    search: Joi.object({
      query: Joi.string().min(1).required(),
      fields: Joi.array().items(Joi.string())
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
      zipCode: Joi.string().required(),
      coordinates: Joi.object({
        latitude: Joi.number().min(-90).max(90).required(),
        longitude: Joi.number().min(-180).max(180).required()
      })
    }),

    contact: Joi.object({
      email: Joi.string().email().required(),
      phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
      website: Joi.string().uri().allow('')
    }),

    businessHours: Joi.object({
      day: Joi.string().valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday').required(),
      open: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
      close: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
      isClosed: Joi.boolean().default(false)
    })
  };
}

module.exports = Validator; 