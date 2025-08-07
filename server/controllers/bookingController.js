import Show from "../models/Show.js";
import Booking from "../models/Booking.js";

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

        res.json({ success: true, message: "Booked successfully", bookingId: booking._id });
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
