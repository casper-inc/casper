import { Router } from 'express';
import { RequestController } from '../controllers';
import { TripRequestMiddleware, AuthMiddleware } from '../middlewares';

const router = Router();

const { tripRequest } = RequestController;
const { onTripRequest, tripCheckUser, tripTypeChecker } = TripRequestMiddleware;
const { authenticate } = AuthMiddleware;

router.post('/request', authenticate, tripTypeChecker, onTripRequest, tripRequest);

export default router;
