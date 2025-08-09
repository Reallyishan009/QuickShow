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
userRouter.get('/db-test', async (req, res) => {
  try {
    console.log("[db-test] Testing database connection");
    const count = await mongoose.connection.db.stats();
    res.json({ success: true, message: "Database connected", stats: count });
  } catch (error) {
    console.error("[db-test] Database error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});



export default userRouter;
