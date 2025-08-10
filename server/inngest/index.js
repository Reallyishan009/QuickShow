// Remove this line completely - you don't need it
// import { User as ClerkUser } from "@clerk/express";


import { Inngest } from "inngest";
import mongoose from "mongoose";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import sendEmail from "../configs/nodeMailer.js";


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


// Inngest function to cancel booking and release seats of show after 10 minutes of booking created if payment is not made
const releaseSeatsAndDeleteBooking = inngest.createFunction(
    {id: 'release-seats-and-delete-booking'},
    {
        event: 'app/checkpayment'
    },
    async({event,step})=>{
        const tenMinutesLater = new Date(Date.now() + 10 * 60 * 1000);
        await step.sleepUntil('wait-for-10-minutes',tenMinutesLater);


        await step.run('check-payment', async () => {
            await ensureDBConnection();
            const bookingId = event.data.bookingId;
            const booking = await Booking.findById(bookingId);


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
        });
    }
);


// Inngest function to send email when user books a show
const sendBookingConfirmationEmail = inngest.createFunction(
    {id:"send-booking-confirmation-email"},
    {event:"app/show.booked"},
    async({event,step})=>{
        await step.run('send-email', async () => {
            await ensureDBConnection();
            const {bookingId} = event.data;
            const booking = await Booking.findById(bookingId).populate({
                path:'show',
                populate: {path: 'movie', model:'Movie'}
            }).populate('user');


            await sendEmail ({
                to: booking.user.email,
                subject: `Payment Confirmation: "${booking.show.movie.title}" booked`,
                body: ` <div style="font-family: Arial,sans-serif;line-height:1.5;">
                        <h2>Hi ${booking.user.name}</h2>
                        <p>Your booking for <strong style="color: #F8565;">"${booking.show.movie.title}"</strong> is confirmed.</p>
                        <p>
                            <strong>Date:</strong> ${new Date(booking.show.showDateTime).toLocaleDateString('en-US',{timeZone:'Asia/Kolkata'})}<br/>
                            <strong>Time:</strong> ${new Date(booking.show.showDateTime).toLocaleTimeString('en-US',{timeZone:'Asia/Kolkata'})}<br/>
                        </p>
                        <p>Enjoy the Show! 🫰🏻</p>
                        <p>Thanks for booking with us!<br/>-QuickShow Team(Regards:Ishan Tripathi)</p>
                        </div>`
            });
        });
    }
);

//Inngest Fucntion to send Reminders

const sendShowReminders= inngest.createFunction(
    {id:"send-show-reminders"},
    {cron: '0 */8 * * *'}, //every 8 hours
    async()=>{
        const now = new Date();
        const in8Hours = new Date(now.getTime() + 8*60*60*1000);
        const windowStart = new Date(in8Hours.getTime()-10*60*1000 );
        const reminderTasks = await step.run("prepare-reminder-tasks",async()=>{
            const shows = await Show.find({
                showTime: {$gte: windowStart, $lte:in8Hours},
            }).populate('movie');

            const tasks =[];
            for(const show of shows){
                if(!show.movie || !show.occupiedSeats)continue;

                const userIds = [...new set(Object.values(show.occupiedSeats))];
                if(userIds.length===0)continue;

                const users = await User.find({_id:{$in:userIds}}).select("name email");

                for(const user of users){
                    tasks.push({
                        userEmail: user.email,
                        userName: user.name,
                        movieTitle: show.movie.title,
                        showTime: show.showTime,

                    })
                }
            }

            return tasks;
        })

        if(reminderTasks.length===0){
            return {sent:0,message:'No reminders to send'}
        }

        //send reminders emails

        const results = await step.run('send-all-reminders',async ()=>{
            return await Promise.allSettled(
                reminderTasks.map(tasks=>sendEmail({
                    to:tasks.userEmail,
                    subject:`Reminder: Your movie"${task.movieTitle}" starts soon!`,    
                    body: `<div style="font-family: Arial, sans-serif; padding: 20px;">
                                <h2>Hello ${task.userName},</h2>
                                <p>This is a quick reminder that your movie:</p>
                                <h3 style="color: #F84565;">"${task.movieTitle}"</h3>
                                <p>is scheduled for <strong>${new Date(task.showTime).toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata' })}</strong> at <strong>${new Date(task.showTime).toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' })}</strong>.</p>
                                <p>It starts in approximately <strong>8 hours</strong> - make sure you're ready!</p>
                                <br/>
                                <p>Enjoy the show!<br/>QuickShow Team</p>
                            </div>
`
                }))
            )
        })

        const sent = results.filter(r=>r.status==='fulfilled').length;
        const failed = results.length -sent;

        return {
            sent,failed,message:`Sent${sent} reminder(s),${failed} failed.`
        }
    }
)

//inngest function to send notification when new show is added
const sendNewShowNotifications = inngest.createFunction(
    {id:'send-new-show-notifications'},
    {event:'app/show.added'},
    async ({event})=>{
        const { movieTitle} =event.data;

        const users = await User.find({})

        for(const user of users){
            const userEmail = user.email;
            const userName = user.email;


            const subject =  `New Show Added: ${movieTitle}`
            const body =`<div style="font-family: Arial, sans-serif; padding: 20px;">
                            <h2>Hi ${userName},</h2>
                            <p>We've just added a new show to our library:</p>
                            <h3 style="color: #F84565;">"${movieTitle}"</h3>
                            <p>Visit our website</p>
                            <br/>
                            <p>Thanks,<br/>QuickShow Team</p>
                        </div>
                        `;

            await sendEmail({
            to: userEmail,
            subject,
            body,
        })

        }
        return {message:'Notification sent.'}
        
    }
)



export const functions = [
    syncUserCreation, 
    syncUserDeletion,
    syncUserUpdation,releaseSeatsAndDeleteBooking,
    sendBookingConfirmationEmail,
    sendShowReminders,
    sendNewShowNotifications
];
