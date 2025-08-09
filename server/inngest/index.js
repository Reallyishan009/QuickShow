// Remove this line completely - you don't need it
// import { User as ClerkUser } from "@clerk/express";

import { Inngest } from "inngest";
import mongoose from "mongoose";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";

const ensureDBConnection = async () => {
    if (mongoose.connection.readyState === 0) {
        try {
            await mongoose.connect(`${process.env.MONGODB_URI}/QuickShow`); // Use correct casing
            console.log('MongoDB connected in Inngest context');
        } catch (error) {
            console.error('MongoDB connection error in Inngest:', error);
            throw error;
        }
    }
};

// Create a client to send and receive events
export const inngest = new Inngest({ id: "movie-ticket-booking" });

// Inngest function to save user data to database
export const syncUserCreation = inngest.createFunction(
    {
        id: 'sync-user-from-clerk'
    },
    {
        event: 'clerk/user.created'
    },
    async ({ event }) => {
        try {
             await ensureDBConnection();
            const { id, first_name, last_name, email_addresses, image_url } = event.data;
            const userData = {
                _id: id,
                email: email_addresses[0].email_address,
                name: `${first_name} ${last_name}`,
                image: image_url
            };
            await User.create(userData);
            console.log(`User ${id} created successfully`);
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }
);

export const syncUserDeletion = inngest.createFunction(
    {
        id: 'delete-user-from-clerk'
    },
    {
        event: 'clerk/user.deleted'
    },
    async ({ event }) => {
        try {
             await ensureDBConnection();
            const { id } = event.data;
            await User.findByIdAndDelete(id);
            console.log(`User ${id} deleted successfully`);
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }
);

export const syncUserUpdation = inngest.createFunction(
    {
        id: 'update-user-from-clerk'
    },
    {
        event: 'clerk/user.updated'
    },
    async ({ event }) => {
        try {
             await ensureDBConnection();
            const { id, first_name, last_name, email_addresses, image_url } = event.data;
            const userData = {
                email: email_addresses[0].email_address,
                name: `${first_name} ${last_name}`,
                image: image_url
            };
            await User.findByIdAndUpdate(id, userData);
            console.log(`User ${id} updated successfully`);
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }
);

//ingest function to cancel booking and release seats of show after 10mintues of booking created if payment is not made
const releaseSeatsAndDeleteBooking = inngest.createFunction(
    {id: 'release-seats-and-delete-booking'},
    {
        event: 'app/checkpayment'
    },
    async({event,step})=>{
        const tenMinutesLater = new Date(Date.now() + 10 * 60 * 1000);
        await step.sleepUntil('wait-for-10-minutes',tenMinutesLater);

        await step.run('check-payment', async ({ run }) => {
            const bookingId = event.data.bookingId;
            const booking = await Booking.findById(bookingId)

            //if payment is not made, release seats and delete booking
            if (!booking.isPaid) {
                const show = await Show.findById(booking.show);
                booking.bookingSeats.forEach(seat => {
                    delete show.occupiedSeats[seat];
                });
                show.markModified('occupiedSeats');
                await show.save();
                await Booking.findByIdAndDelete(booking._id);
            }
        })
    }
)

export const functions = [syncUserCreation, syncUserDeletion, syncUserUpdation,releaseSeatsAndDeleteBooking];
