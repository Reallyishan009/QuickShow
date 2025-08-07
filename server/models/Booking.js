import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    user: { type: String, required: true, ref: 'User' },
    show: { type: String, required: true, ref: 'Show' }, // Fixed: ref should be 'Show', not 'User'
    amount: { type: Number, required: true },
    bookedSeats: { type: Array, required: true },
    isPaid: { type: Boolean, default: false },
    paymentLink: { type: String, default: "" }, // Fixed: default should be empty string, not false
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
