// routes/userRouter.js
import express from 'express';
import { getUserBookings, updateFavorite, getFavorites,testBookings } from '../controllers/userController.js';
import { clerkMiddleware } from '@clerk/express';

const userRouter = express.Router();

// All user routes require authentication
userRouter.use(clerkMiddleware);

// In userRouter.js
userRouter.get('/bookings', (req, res, next) => {
  console.log("[userRouter] /bookings route hit!");
  next();
}, getUserBookings);

userRouter.post('/update-favorites', updateFavorite);
userRouter.get('/favorites', getFavorites);
userRouter.get('/test-bookings', testBookings);
// Add to userRouter.js




export default userRouter;
