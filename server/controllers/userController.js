import { clerkClient } from "@clerk/express";
import Booking from "../models/Booking.js";
import Movie from "../models/Movie.js";

//API CONTROLLER Function to get User Bookings
export const getUserBookings = async (req, res) => {
    try {
        const { userId } = req.auth();

        const bookings = await Booking.find({ user: userId })
            .populate({
                path: 'show',
                populate: { path: 'movie' }
            })
            .sort({ createdAt: -1 });
            
        res.json({ success: true, bookings });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

//API Controller Function to update Favorite Movie in Clerk User Metadata
export const updateFavorite = async (req, res) => {
    try {
        const { movieId } = req.body;
        const { userId } = req.auth(); // Fixed: Added missing userId declaration

        const user = await clerkClient.users.getUser(userId);

        // Initialize favoriteMovies array if it doesn't exist
        if (!user.privateMetadata.favoriteMovies) {
            user.privateMetadata.favoriteMovies = [];
        }

        // Toggle favorite movie
        if (!user.privateMetadata.favoriteMovies.includes(movieId)) {
            user.privateMetadata.favoriteMovies.push(movieId);
        } else {
            user.privateMetadata.favoriteMovies = user.privateMetadata.favoriteMovies.filter(id => id !== movieId);
        }

        await clerkClient.users.updateUser(user.id, {
            privateMetadata: user.privateMetadata
        });
        
        res.json({ success: true, message: "Favorite movie updated successfully" });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

//API Controller Function to get User's Favorite Movies
export const getFavorites = async (req, res) => {
    try {
        const { userId } = req.auth();
        const user = await clerkClient.users.getUser(userId);
        
        // Fixed: Use consistent property name (favoriteMovies)
        const favorites = user.privateMetadata.favoriteMovies || [];

        // Getting movies from database
        const movies = await Movie.find({ _id: { $in: favorites } });

        res.json({ success: true, movies });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};
