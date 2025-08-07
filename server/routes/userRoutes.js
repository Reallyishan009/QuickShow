import express from 'express';
import { getUserBookings, updateFavorite, getFavorites } from '../controllers/userController.js';
import { clerkMiddleware } from '@clerk/express';

const userRouter = express.Router();

// All user routes require authentication
userRouter.use(clerkMiddleware);

userRouter.get('/bookings', getUserBookings);
userRouter.post('/update-favorites', updateFavorite);
userRouter.get('/favorites', getFavorites);

export default userRouter;
