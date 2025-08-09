import Show from "../models/Show.js";
import Booking from "../models/Booking.js";
import stripe  from "stripe";

const checkSeatsAvailability = async (showId, selectedSeats) => {
    try {
        const showData = await Show.findById(showId);   
        if (!showData) {
            return false;
        }
        const occupiedSeats = showData.occupiedSeats || {};
        const isAnySeatTaken = selectedSeats.some(seat => occupiedSeats[seat]);
        
        return !isAnySeatTaken;
    } catch (error) {
        console.log(error.message);
        return false;
    }
};

export const createBooking = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { showId, selectedSeats } = req.body;
        const { origin } = req.headers;

        const isAvailable = await checkSeatsAvailability(showId, selectedSeats);

        if (!isAvailable) {
            return res.status(400).json({ message: "Selected seats are not available" });

        }



        const show = await Show.findById(showId).populate('movie');

        const booking = await Booking.create({
            user: userId,
            show: showId,
            amount: show.showPrice * selectedSeats.length, // Fixed: use showPrice instead of price
            bookedSeats: selectedSeats
        });

        // Mark seats as occupied
        selectedSeats.forEach((seat) => {
            show.occupiedSeats[seat] = userId;
        }); // Fixed: added closing parenthesis and changed map to forEach

        show.markModified('occupiedSeats'); // Fixed: use 'show' instead of 'showData'
        await show.save();

        //stripe payment integration can be added here
        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

        //creating line items  to for stripe
        const line_items =[{
            price_data:{
                currency:'usd',
                product_data:{
                        name:show.movie.title
                },
                unit_amount: Math.floor(booking.amount * 100) // Convert to cents
            },
            quantity: 1
        }]

        const session = await stripeInstance.checkout.sessions.create({
            line_items: line_items,
            mode: 'payment',
            success_url: `${origin}/loading/my-bookings`,
            cancel_url: `${origin}/my-bookings`,
            metadata:{
                bookingId: booking._id.toString(),
            },
            expires_at: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour expiration
        });

        booking.paymentLink = session.url; // Store the payment link in the booking
        await booking.save();

        res.json({ success: true, url:session.url });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getOccupiedSeats = async (req, res) => {
    try {
        const { showId } = req.params;
        const showData = await Show.findById(showId);

        if (!showData) {
            return res.status(404).json({ success: false, message: "Show not found" });
        }

        const occupiedSeats = showData.occupiedSeats || {};
        res.json({ success: true, occupiedSeats });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};
