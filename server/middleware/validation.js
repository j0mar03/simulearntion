// Input Validation Middleware using Joi
const Joi = require('joi');

// Validation schemas
const schemas = {
  register: Joi.object({
    username: Joi.string()
      .alphanum()
      .min(3)
      .max(30)
      .required()
      .messages({
        'string.alphanum': 'Username must contain only letters and numbers',
        'string.min': 'Username must be at least 3 characters long',
        'string.max': 'Username must be at most 30 characters long',
        'any.required': 'Username is required'
      }),
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    password: Joi.string()
      .min(6)
      .max(100)
      .required()
      .messages({
        'string.min': 'Password must be at least 6 characters long',
        'string.max': 'Password is too long',
        'any.required': 'Password is required'
      })
  }),
  
  login: Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
  }),
  
  updateProfile: Joi.object({
    avatarConfig: Joi.object({
      body: Joi.string().valid('u1', 'u2', 'cape', 'scarf', 'none').required(),
      head: Joi.string().valid('cat', 'flower', 'halo', 'sun', 'none').required()
    }).required()
  }),
  
  analyticsSubmit: Joi.object({
    sessionId: Joi.string().required(),
    endTime: Joi.date().iso().required(),
    totalDurationSeconds: Joi.number().min(0).required(),
    engagementScore: Joi.number().min(0).max(100).required(),
    totalClicks: Joi.number().min(0).required(),
    timePerState: Joi.object().required(),
    quizAttempts: Joi.array().items(Joi.object()).required(),
    stateTransitions: Joi.array().items(Joi.object()).required(),
    topicsStudied: Joi.array().items(Joi.string()).required()
  })
};

// Generic validation middleware factory
const validate = (schemaName) => {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    
    if (!schema) {
      return res.status(500).json({
        error: 'Validation schema not found'
      });
    }
    
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Return all errors, not just the first one
      stripUnknown: true // Remove unknown fields
    });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }
    
    // Replace req.body with validated and sanitized data
    req.body = value;
    next();
  };
};

module.exports = { validate, schemas };
