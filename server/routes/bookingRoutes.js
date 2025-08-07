import express from 'express';
import  {
    createBooking,
    getOccupiedSeats
} from '../controllers/bookingController.js';

const   bookingRouter = express.Router();

bookingRouter.post('/create', createBooking);
bookingRouter.get('/occupied-seats/:showId', getOccupiedSeats);

export default bookingRouter;