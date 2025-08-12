import Booking from "../models/Booking.js";
import { inngest } from "../inngest/index.js";

// Debug endpoint to check booking status and manually update
export const debugBookings = async (req, res) => {
  try {
    // Get all bookings with their current status
    const bookings = await Booking.find({})
      .populate({
        path: "show",
        populate: { path: "movie" },
      })
      .sort({ createdAt: -1 });

    const bookingInfo = bookings.map((booking) => ({
      id: booking._id,
      movieTitle: booking.show?.movie?.title || "Unknown",
      amount: booking.amount,
      isPaid: booking.isPaid,
      paymentLink: booking.paymentLink ? "Has Link" : "No Link",
      createdAt: booking.createdAt,
      seats: booking.bookedSeats,
    }));

    res.json({
      success: true,
      totalBookings: bookings.length,
      paidBookings: bookings.filter((b) => b.isPaid).length,
      unpaidBookings: bookings.filter((b) => !b.isPaid).length,
      bookings: bookingInfo,
    });
  } catch (error) {
    console.error("Debug bookings error:", error);
    res.json({ success: false, message: error.message });
  }
};

// Manually mark a booking as paid and trigger email
export const manuallyMarkPaid = async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.json({ success: false, message: "Booking ID is required" });
    }

    console.log("🔧 Manually marking booking as paid:", bookingId);

    // Update booking status
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        isPaid: true,
        paymentLink: "",
      },
      { new: true }
    );

    if (!updatedBooking) {
      return res.json({ success: false, message: "Booking not found" });
    }

    console.log("✅ Booking marked as paid:", bookingId);

    // Trigger email confirmation
    try {
      await inngest.send({
        name: "app/show.booked",
        data: { bookingId },
      });
      console.log("📧 Email confirmation event sent");
    } catch (inngestError) {
      console.error("❌ Failed to send email event:", inngestError);
    }

    res.json({
      success: true,
      message: "Booking marked as paid and email triggered",
      booking: {
        id: updatedBooking._id,
        isPaid: updatedBooking.isPaid,
        amount: updatedBooking.amount,
      },
    });
  } catch (error) {
    console.error("Manual mark paid error:", error);
    res.json({ success: false, message: error.message });
  }
};

// Get all unpaid bookings that might need fixing
export const getUnpaidBookings = async (req, res) => {
  try {
    const unpaidBookings = await Booking.find({ isPaid: false })
      .populate({
        path: "show",
        populate: { path: "movie" },
      })
      .sort({ createdAt: -1 });

    const bookingInfo = unpaidBookings.map((booking) => ({
      id: booking._id,
      movieTitle: booking.show?.movie?.title || "Unknown",
      amount: booking.amount,
      seats: booking.bookedSeats,
      createdAt: booking.createdAt,
      hasPaymentLink: !!booking.paymentLink,
      paymentLink: booking.paymentLink,
    }));

    res.json({
      success: true,
      count: unpaidBookings.length,
      unpaidBookings: bookingInfo,
    });
  } catch (error) {
    console.error("Get unpaid bookings error:", error);
    res.json({ success: false, message: error.message });
  }
};

// Test email sending directly
export const testEmailDirect = async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.json({ success: false, message: "Booking ID is required" });
    }

    console.log("📧 Testing direct email for booking:", bookingId);

    // Import email function and test directly
    const sendEmail = (await import("../configs/nodeMailer.js")).default;
    const { clerkClient } = await import("@clerk/express");

    const booking = await Booking.findById(bookingId).populate({
      path: "show",
      populate: { path: "movie" },
    });

    if (!booking) {
      return res.json({ success: false, message: "Booking not found" });
    }

    // Get user info
    const user = await clerkClient.users.getUser(booking.user);
    const userName = (user.firstName || "") + " " + (user.lastName || "");
    const userEmail = user.emailAddresses[0]?.emailAddress;

    if (!userEmail) {
      return res.json({ success: false, message: "User email not found" });
    }

    // Send test email
    const emailResult = await sendEmail({
      to: userEmail,
      subject: `🎬 Test: Booking Confirmed - "${booking.show.movie.title}"`,
      body: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #F84565;">🎬 QuickShow - Test Email</h2>
                    <p>Hi <strong>${
                      userName.trim() || "Movie Lover"
                    }</strong>,</p>
                    <p>This is a test email to verify email functionality.</p>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #F84565;">Booking Details:</h3>
                        <p><strong>Movie:</strong> ${
                          booking.show.movie.title
                        }</p>
                        <p><strong>Amount:</strong> $${booking.amount}</p>
                        <p><strong>Seats:</strong> ${booking.bookedSeats.join(
                          ", "
                        )}</p>
                        <p><strong>Status:</strong> ${
                          booking.isPaid ? "PAID" : "PENDING"
                        }</p>
                    </div>
                    <p>If you received this email, the email system is working correctly!</p>
                    <p>— QuickShow Team</p>
                </div>
            `,
    });

    console.log("✅ Test email sent successfully");

    res.json({
      success: true,
      message: "Test email sent successfully",
      emailResult: emailResult.messageId,
      sentTo: userEmail,
    });
  } catch (error) {
    console.error("Test email error:", error);
    res.json({ success: false, message: error.message });
  }
};

// Trigger email via Inngest (to test the actual email function)
export const triggerEmailViaInngest = async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.json({ success: false, message: "Booking ID is required" });
    }

    console.log("🧪 Triggering email via Inngest for booking:", bookingId);

    // Trigger the Inngest email function
    await inngest.send({
      name: "app/show.booked",
      data: { bookingId },
    });

    res.json({
      success: true,
      message: "Email event triggered via Inngest",
      bookingId,
    });
  } catch (error) {
    console.error("Trigger email via Inngest error:", error);
    res.json({ success: false, message: error.message });
  }
};
