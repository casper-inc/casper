import { TripRequestValidation } from '../validation';
import { Helpers, ApiError } from '../utils';
import { UserService } from '../services';

const { errorResponse, tripTypeValidator } = Helpers;
const { tripRequest, statsRequest } = TripRequestValidation;
const { find } = UserService;

/**
 * Middleware for trip input validations
 */
export default class TripRequestMiddleware {
  /**
     * Middleware method for trip request validation
     * @param {object} req - The request from the endpoint.
     * @param {object} res - The response returned by the method.
     * @param {object} next - Call the next operation.
     * @returns {object} - Returns an object (error or response).
     */
  static async onTripRequest(req, res, next) {
    try {
      const validated = await tripRequest(req.body);
      const { email } = req.data;
      if (validated) {
        const {
          id, firstName, lastName, gender, lineManager, passportNo,
        } = await find({ email });
        const user = {
          firstName,
          lastName,
          gender,
          lineManager,
          passportNo,
        };
        req.body.requesterId = id;
        req.requester = user;
        return next();
      }
    } catch (error) {
      errorResponse(res, { code: error.status || 400, message: error.details[0].context.label });
    }
  }

  /**
     * Validation of requester keys
     * @param {string} value - Value of key to validate.
     * @param {param} key - The key to validate.
     * @returns {object} - Returns an object (error or response).
     */
  static tripUserChecker(value, key) {
    if (!key) {
      throw new ApiError(400, `Please update your profile with your ${value}`);
    }
  }

  /**
       * Middleware method for trip request validation
       * @param {object} req - The request from the endpoint.
       * @param {object} res - The response returned by the method.
       * @param {object} next - Call the next operation.
       * @returns {object} - Returns an object (error or response).
       */
  static async tripCheckUser(req, res, next) {
    try {
      const { tripUserChecker } = TripRequestMiddleware;
      const {
        requesterGender, requesterLineManager, requesterPassportNo
      } = req.requester;
      tripUserChecker('Gender', requesterGender);
      tripUserChecker('Line Manager', requesterLineManager);
      tripUserChecker('PassportNo', requesterPassportNo);
      next();
    } catch (error) {
      errorResponse(res, { code: error.status || 500, message: error.message });
    }
  }

  /**
  * Middleware method for trip stats request validation
  * @param {object} req - The request from the endpoint.
  * @param {object} res - The response returned by the method.
  * @param {object} next - Call the next operation.
  * @returns {object} - Returns an object (error or response).
  */
  static async tripStatsCheck(req, res, next) {
    try {
      const { start: startDate, end: endDate } = req.query;
      const validated = statsRequest({ startDate, endDate });
      if (validated) next();
    } catch (error) {
      errorResponse(res, { code: error.status || 500, message: error.message });
    }
  }

  /**
  * Middleware method for trip type validation
  * @param {object} req - The request from the endpoint.
  * @param {object} res - The response returned by the method.
  * @param {object} next - Call the next operation.
  * @returns {object} - Returns an object (error or response).
  */
  static tripTypeChecker(req, res, next) {
    const { tripType, tripDetails } = req.body;
    const { returnDate } = tripDetails[0];
    const details = tripDetails.length;
    try {
      switch (tripType) {
        case 'One-way': {
          const msg1 = 'You can only have 1 origin and 1 destination for a one-way trip';
          const msg2 = 'A one-way trip should have no return date';
          tripTypeValidator(details, returnDate, msg1, msg2, next);
          break;
        }

        case 'Round-Trip': {
          const msg1 = 'You can only have 1 origin and 1 destination for a Return-trip';
          const msg2 = 'A return trip must have a return date';
          tripTypeValidator(details, !returnDate, msg1, msg2, next);
          break;
        }

        case 'Multi-leg':
          if (details < 2 || details > 5) {
            throw new ApiError(400, 'A Multi-city trip must have a mininmum of 2 and a maximum of 5 trip details');
          }
          if (returnDate) {
            throw new ApiError(400, 'A Multi-city trip should have no return date');
          }
          return next();

        default:
          return next();
      }
    } catch (error) {
      errorResponse(res, { code: 400, message: error.message });
    }
  }
}
