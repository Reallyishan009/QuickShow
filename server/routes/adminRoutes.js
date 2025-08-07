import express from 'express';
import { protectAdmin } from '../middleware/auth.js'; // ✅ Add .js extension
import { isAdmin, getDashboardData, getAllShows, getAllBookings } from '../controllers/adminController.js';

const adminRouter = express.Router();

adminRouter.get('/is-admin', isAdmin); // ✅ Remove protectAdmin from here
adminRouter.get('/dashboard', protectAdmin, getDashboardData);
adminRouter.get('/shows', protectAdmin, getAllShows);
adminRouter.get('/bookings', protectAdmin, getAllBookings);

export default adminRouter;
