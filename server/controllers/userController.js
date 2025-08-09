// userController.js
import { clerkClient } from "@clerk/express";
import Booking from "../models/Booking.js";
import Movie from "../models/Movie.js";

export const getUserBookings = async (req, res) => {
  console.log("[getUserBookings] Route handler started");
  
  try {
    console.log("[getUserBookings] Trying to get userId from req.auth()");
    const { userId } = req.auth();
    console.log(`[getUserBookings] UserId obtained: ${userId}`);
    
    // Skip database query for now - just return a simple response
    console.log("[getUserBookings] Sending simple response");
    res.json({ 
      success: true, 
      message: "Route working", 
      userId: userId,
      bookings: [] 
    });
    
  } catch (error) {
    console.error(`[getUserBookings] Error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};


// Your existing updateFavorite and getFavorites functions remain unchanged
export const updateFavorite = async (req, res) => {
  try {
    const { movieId } = req.body;
    const { userId } = req.auth();

    console.log('🔍 Update favorites called for user:', userId, 'movie:', movieId);

    const user = await clerkClient.users.getUser(userId);
    console.log('🔍 Current user metadata:', user.privateMetadata);

    let privateMetadata = user.privateMetadata;
    
    if (!privateMetadata.favoriteMovies) {
      privateMetadata.favoriteMovies = [];
    }

    const movieIdStr = String(movieId);
    const currentFavorites = privateMetadata.favoriteMovies;

    const isCurrentlyFavorite = currentFavorites.includes(movieIdStr);
    
    if (!isCurrentlyFavorite) {
      privateMetadata.favoriteMovies.push(movieIdStr);
      console.log('✅ Added to favorites:', movieIdStr);
    } else {
      privateMetadata.favoriteMovies = currentFavorites.filter(id => String(id) !== movieIdStr);
      console.log('❌ Removed from favorites:', movieIdStr);
    }

    await clerkClient.users.updateUser(userId, {
      privateMetadata: privateMetadata
    });

    console.log('🔍 Updated metadata:', privateMetadata);

    res.json({ 
      success: true, 
      message: isCurrentlyFavorite ? "Removed from favorites" : "Added to favorites",
      favoriteMovies: privateMetadata.favoriteMovies,
      action: isCurrentlyFavorite ? "removed" : "added"
    });

  } catch (error) {
    console.error('❌ Update favorites error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFavorites = async (req, res) => {
  try {
    const { userId } = req.auth();
    const user = await clerkClient.users.getUser(userId);

    console.log('🔍 Getting favorites for user:', userId);

    const favorites = user.privateMetadata?.favoriteMovies || [];
    console.log('🔍 Favorite movie IDs:', favorites);

    if (favorites.length === 0) {
      return res.json({ success: true, movies: [] });
    }

    const movies = await Movie.find({ _id: { $in: favorites } });
    console.log('🔍 Found movies:', movies.length);

    res.json({ success: true, movies });

  } catch (error) {
    console.error('❌ Get favorites error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// In userController.js, add this simple test endpoint
export const testBookings = async (req, res) => {
  try {
    const { userId } = req.auth();
    console.log(`[testBookings] Testing for userId: ${userId}`);
    
    // Simple count without population
    const count = await Booking.countDocuments({ user: userId });
    console.log(`[testBookings] Found ${count} bookings for user`);
    
    res.json({ 
      success: true, 
      message: "Backend is working", 
      userId: userId,
      bookingCount: count 
    });
  } catch (error) {
    console.error(`[testBookings] Error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};
