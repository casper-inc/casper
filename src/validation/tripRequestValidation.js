import joi from '@hapi/joi';
import joiExtension from '@hapi/joi-date';
import { ApiError } from '../utils';

const Joi = joi.extend(joiExtension);
const dateObj = new Date();
const month = dateObj.getMonth() + 1;
const today = dateObj.getDate();
const year = dateObj.getFullYear();

const newdate = `${year}-${month}-${today}`;

/**
   * This class holds all methods used for trip request validation
   * Functions:
   * 1) TripRequestValidation - validates user trip request.
   */
export default class TripRequestValidation {
  /**
       * Validates Trip Request paramenters
       *
       * @param {object} tripObject - The request object
       * @param {object} res - The request response object
       * @returns {object} - returns an object (error or response).
       */
  static async tripRequest(tripObject) {
    const { tripType } = tripObject;
    const tripDetailsSchema = tripType === 'Round-Trip' ? {
      origin: joi.string().min(3).max(25).required()
        .label('Please enter a valid origin'),
      destination: joi.string().min(3).max(25).required()
        .label('Please enter a valid destination'),
      departureDate: Joi.date().format('YYYY-MM-DD').min(newdate).required()
        .label('Please enter a valid departure date'),
      returnDate: Joi.date().format('YYYY-MM-DD').min(Joi.ref('departureDate')).required()
        .label('Please enter a valid return date')
    } : {
      origin: joi.string().min(3).max(25).required()
        .label('Please enter a valid origin'),
      destination: joi.string().min(3).max(25).required()
        .label('Please enter a valid destination'),
      departureDate: Joi.date().format('YYYY-MM-DD').min(newdate).required()
        .label('Please enter a valid departure date')
    };
    const schema = {
      managerId: joi.number().integer().positive().required()
        .label('Please input a valid manager id'),
      purpose: joi.string().min(3).max(250).required()
        .label('Please add a short and valid purpose'),
      rememberMe: joi.boolean()
        .label('Value must be a boolean, true or false'),
      tripType: Joi.string().valid('One-way', 'Round-Trip', 'Multi-leg').required()
        .label('Trip type must be One-way, Round-Trip or Multi-leg'),
      extraInfo: joi.string().min(3).max(1000).regex(/^[\w',-\\/.\s]*$/)
        .required()
        .label('Please fill in a valid Address'),
      tripDetails: joi.array().items(joi.object(tripDetailsSchema)).required()
        .label('Please add valid trip details')
    };
    const { error } = joi.validate({ ...tripObject }, schema);
    if (error) {
      throw error;
    }
    return true;
  }

  /**
  * Validates Trip stats Request paramenters
  *
  * @param {object} body - The request object
  * @param {object} res - The request response object
  * @returns {object} - returns an object (error or response).
  */
  static statsRequest(body) {
    const schema = {
      startDate: Joi.date()
        .format('YYYY-MM-DD')
        .required()
        .error(TripRequestValidation.validateTripStats('startDate')),
      endDate: Joi.date()
        .format('YYYY-MM-DD')
        .min(body.startDate)
        .required()
        .error(TripRequestValidation.validateTripStats('endDate'))
    };
    const { error } = Joi.validate({ ...body }, schema);
    if (error) {
      throw new ApiError(400, error.details[0].message);
    }
    return true;
  }

  /**
   * Validates trip request stats keys
   * @param {string} key - The key to validate
   * @returns {Error} Returns a descriptive error message
   */
  static validateTripStats(key) {
    return (errors) => {
      errors.forEach((err) => {
        switch (err.type) {
          case 'any.required':
            err.message = `${key} is required!`;
            break;
          case 'date.format':
            err.message = `${key} should be in this format ${err.context.format}`;
            break;
          case 'date.base':
            err.message = `${key} should not be empty`;
            break;
          case 'date.min':
            err.message = `${key} must be larger than or equal to ${key === 'startDate' ? 'today' : 'startDate'}`;
            break;
          default:
            break;
        }
      });
      return errors;
    };
  }
}
