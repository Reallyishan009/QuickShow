// Remove this line completely - you don't need it
// import { User as ClerkUser } from "@clerk/express";

import { Inngest } from "inngest";
import mongoose from "mongoose";
import User from "../models/User.js";

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

export const functions = [syncUserCreation, syncUserDeletion, syncUserUpdation];
