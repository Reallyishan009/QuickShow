import { inngest } from "../inngest/index.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js"
import stripe from 'stripe'


// Function to check availability of selected seats for a movie
const checkSeatsAvailability = async (showId, selectedSeats)=>{
    try {
        const showData = await Show.findById(showId)
        if(!showData) return false;

        const occupiedSeats = showData.occupiedSeats;

        const isAnySeatTaken = selectedSeats.some(seat => occupiedSeats[seat]);

        return !isAnySeatTaken;
    } catch (error) {
        console.log(error.message);
        return false;
    }
}

export const createBooking = async (req, res)=>{
    try {
        const {userId} = req.auth();
        const {showId, selectedSeats} = req.body;
        const { origin } = req.headers;

        // Check if the seat is available for the selected show
        const isAvailable = await checkSeatsAvailability(showId, selectedSeats)

        if(!isAvailable){
            return res.json({success: false, message: "Selected Seats are not available."})
        }

        // Get the show details
        const showData = await Show.findById(showId).populate('movie');

        // Create a new booking
        const booking = await Booking.create({
            user: userId,
            show: showId,
            amount: showData.showPrice * selectedSeats.length,
            bookedSeats: selectedSeats
        })

        selectedSeats.map((seat)=>{
            showData.occupiedSeats[seat] = userId;
        })

        showData.markModified('occupiedSeats');

        await showData.save();

         // Stripe Gateway Initialize
         const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)

         // Creating line items to for Stripe
         const line_items = [{
            price_data: {
                currency: 'usd',
                product_data:{
                    name: showData.movie.title
                },
                unit_amount: Math.floor(booking.amount) * 100
            },
            quantity: 1
         }]

         const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/my-bookings`,
            line_items: line_items,
            mode: 'payment',
            metadata: {
                bookingId: booking._id.toString()
            },
            expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // Expires in 30 minutes
         })

         booking.paymentLink = session.url
         await booking.save()

         // Run Inngest Sheduler Function to check payment status after 10 minutes
         await inngest.send({
            name: "app/checkpayment",
            data: {
                bookingId: booking._id.toString()
            }
         })

         res.json({success: true, url: session.url})

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

export const getOccupiedSeats = async (req, res)=>{
    try {
        
        const {showId} = req.params;
        const showData = await Show.findById(showId)

        const occupiedSeats = Object.keys(showData.occupiedSeats)

        res.json({success: true, occupiedSeats})

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// Verify payment and update booking status
export const verifyPayment = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { sessionId } = req.body;

        if (!sessionId) {
            return res.json({ success: false, message: 'Session ID is required' });
        }

        // Initialize Stripe
        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
        
        // Retrieve the session from Stripe
        const session = await stripeInstance.checkout.sessions.retrieve(sessionId);
        
        if (!session) {
            return res.json({ success: false, message: 'Invalid session' });
        }

        // Get booking ID from session metadata
        const bookingId = session.metadata.bookingId;
        
        // Find the booking
        const booking = await Booking.findById(bookingId).populate({
            path: 'show',
            populate: { path: 'movie' }
        });

        if (!booking) {
            return res.json({ success: false, message: 'Booking not found' });
        }

        // Check if payment was successful
        if (session.payment_status === 'paid' && !booking.isPaid) {
            // Update booking status
            await Booking.findByIdAndUpdate(bookingId, {
                isPaid: true,
                paymentLink: ""
            });

            // Send confirmation email
            await inngest.send({
                name: "app/show.booked",
                data: { bookingId: bookingId }
            });

            console.log(`✅ Payment verified and booking updated: ${bookingId}`);
        }

        // Return booking details
        const updatedBooking = await Booking.findById(bookingId).populate({
            path: 'show',
            populate: { path: 'movie' }
        });

        res.json({
            success: true,
            booking: {
                id: updatedBooking._id,
                movieTitle: updatedBooking.show.movie.title,
                amount: updatedBooking.amount,
                seats: updatedBooking.bookedSeats,
                isPaid: updatedBooking.isPaid,
                showDateTime: updatedBooking.show.showDateTime
            },
            paymentStatus: session.payment_status
        });

    } catch (error) {
        console.error('Payment verification error:', error);
        res.json({ success: false, message: error.message });
    }
}