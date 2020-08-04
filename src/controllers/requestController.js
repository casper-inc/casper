import { RequestService, UserService } from '../services';
import {
  Helpers, Mailer, Notification, ApiError
} from '../utils';

const {
  getRequests, getRequest, updateAnyRequest,
  getRequestByIdUserId, createTripRequest, searchByTime
} = RequestService;

const { successResponse, errorResponse } = Helpers;
const { find } = UserService;
const { sendMail } = Mailer;

/**
 * A collection of methods that controls user requests.
 *
 * @class RequestController
 */
export default class RequestController {
  /**
 *  assign a role to a user
 * @static
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @returns { JSON } - A JSON object containing success or failure details.
 * @memberof RequestController
 */
  static async getUserRequests(req, res) {
    try {
      const { id } = req.data;
      const requests = await getRequests(id);
      if (!requests.length) {
        return errorResponse(res, { code: 404, message: 'You have made no request yet' });
      }
      return successResponse(res, requests, 200);
    } catch (e) {
      errorResponse(res, { code: 500, message: e.message });
    }
  }

  /**
*  Gets trip request stats within a timeframe
* @static
* @param {Request} req - The request from the endpoint.
* @param {Response} res - The response returned by the method.
* @returns { JSON } - A JSON object containing success or failure details.
* @memberof RequestController
*/
  static async getTripRequestsStats(req, res) {
    try {
      const { start: startDate, end: endDate } = req.query;
      const { id } = req.data;
      const result = await searchByTime(startDate, endDate, id);
      return successResponse(res, result, 200);
    } catch (err) {
      errorResponse(res, { code: 500, message: err.message });
    }
  }

  /**
   *  creates a one way trip request
   * @static
   * @param {Request} req - The request from the endpoint.
   * @param {Response} res - The response returned by the method.
   * @returns { JSON } - A JSON object containing success or failure details.
   * @memberof RequestController
   */
  static async oneWayTripRequest(req, res) {
    try {
      const { body, data: { id } } = req;
      const { requester } = req;
      const oneWayTrip = await createTripRequest({ ...body });
      delete body.returnDate;
      const { managerId } = oneWayTrip;
      const manager = await find({ id: managerId });
      const user = await find({ id });
      const {
        emailNotify, email, firstName
      } = manager;
      const staffName = `${user.firstName} ${user.lastName}`;
      const dashboardLink = `${req.protocol}s://${req.get('host')}/api/users/${managerId.id}`;
      if (emailNotify) {
        await sendMail({
          email, emailTemplateId: 'd-4fa2b9e8173d4e4ba6b3d5f5e4c14308', firstName, urlLink: dashboardLink, staffName
        });
      }
      const notificationData = {
        message: `${staffName} created a new travel request`,
        url: 'https://casper.com/users/trip/3'
      };
      await Notification.notify(notificationData, [manager]);
      return successResponse(res, { ...oneWayTrip, ...requester }, 201);
    } catch (error) {
      errorResponse(res, {});
    }
  }

  /**
   * Get requests.
   *
   * @static
   * @param {Request} req - The request from the endpoint.
   * @param {Response} res - The response returned by the method.
   * @returns { JSON } A JSON response with the new user's profile update.
   * @memberof RequestController
   */
  static async getRequest(req, res) {
    try {
      const statusId = Number(req.params.statusId);
      const requests = await getRequest(req.data.id, statusId);
      if (!requests) throw new ApiError(404, 'No requests available');
      successResponse(res, requests, 200);
    } catch (error) {
      errorResponse(res, { code: error.status, message: `getRequest: ${error.message}` });
    }
  }

  /**
   * Get requests.
   *
   * @static
   * @param {Request} req - The request from the endpoint.
   * @param {Response} res - The response returned by the method.
   * @returns { JSON } A JSON response with the new user's profile update.
   * @memberof RequestController
   */
  static async getRequestByIdUserId(req, res) {
    try {
      const { requestId } = req.params;
      const requests = await getRequestByIdUserId(req.data.id, requestId);
      if (!requests) throw new ApiError(404, 'No requests available');
      successResponse(res, requests, 200);
    } catch (error) {
      errorResponse(res, { code: error.status, message: `getRequest: ${error.message}` });
    }
  }

  /**
   * Updates request.
   *
   * @static
   * @param {Request} req - The request from the endpoint.
   * @param {Response} res - The response returned by the method.
   * @returns { JSON } A JSON response with the new user's profile update.
   * @memberof RequestController
   */
  static async updateRequest(req, res) {
    try {
      const { requestId } = req.params;
      const updateRequest = await updateAnyRequest(req.body, { id: requestId });
      successResponse(res, updateRequest, 200);
    } catch (error) {
      errorResponse(res, { code: error.status, message: `updateRequest: ${error.message}` });
    }
  }

  /**
   * Updates request.
   *
   * @static
   * @param {Request} req - The request from the endpoint.
   * @param {Response} res - The response returned by the method.
   * @returns { JSON } A JSON response with the new user's profile update.
   * @memberof RequestController
   */
  static async updateUserRequest(req, res) {
    try {
      const { requestId } = req.params;
      const updateRequest = await updateAnyRequest(req.body, { id: requestId });
      successResponse(res, updateRequest, 200);
    } catch (error) {
      errorResponse(res, { code: error.status, message: `updateRequest: ${error.message}` });
    }
  }
}
