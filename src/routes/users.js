import { Router } from 'express';
import { Permissions } from '../utils';
import { UserController, RoleController, RequestController } from '../controllers';
import {
  AuthMiddleware, RoleMiddleware, UserMiddleware, RequestMiddleware, TripRequestMiddleware
} from '../middlewares';

const router = Router();

const { verifyRoles } = RoleMiddleware;
const { supplierAdmin, companyAdminManager } = Permissions;
const { updateUserRole } = RoleController;
const {
  userProfile, updateProfile
} = UserController;
const {
  getRequest, updateRequest, getUserRequests,
  getRequestByIdUserId, updateUserRequest, getTripRequestsStats
} = RequestController;
const { isAuthenticated, authenticate } = AuthMiddleware;
const { onUpdateProfile } = UserMiddleware;
const { onRequestStatus, isUsersOwnIsStatus } = RequestMiddleware;
const { tripStatsCheck } = TripRequestMiddleware;

router.get('/:userId', authenticate, isAuthenticated, userProfile);
router.put('/:userId', authenticate, isAuthenticated, onUpdateProfile, updateProfile);

router.get('/requests', authenticate, getUserRequests);
router.get('/requests/:statusId', authenticate, verifyRoles(companyAdminManager), onRequestStatus, getRequest);// get request by userId in the token and specifying status in param
router.patch('/requests/:requestId', authenticate, verifyRoles(companyAdminManager), onRequestStatus, updateRequest); // update requests by specifying request id in params
router.get('/requests/:requestId/edit', authenticate, isUsersOwnIsStatus, onRequestStatus, getRequestByIdUserId);// get a single request by userId and requestId
router.put('/requests/:requestId/update', authenticate, isUsersOwnIsStatus, onRequestStatus, updateUserRequest);
router.get('/request/stats', authenticate, tripStatsCheck, getTripRequestsStats);

router.patch('/role', authenticate, verifyRoles(supplierAdmin), updateUserRole);

export default router;
