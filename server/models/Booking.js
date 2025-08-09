// models/Booking.js
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  user: { type: String, required: true }, // Clerk userId as string
  show: { type: mongoose.Schema.Types.ObjectId, ref: 'Show', required: true }, // ObjectId reference
  amount: { type: Number, required: true },
  bookedSeats: [{ type: String, required: true }], // Array of seat numbers
  isPaid: { type: Boolean, default: false },
  paymentLink: { type: String, default: "" },
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
