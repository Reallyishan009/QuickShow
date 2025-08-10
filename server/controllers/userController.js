// controllers/userController.js
import Booking from "../models/Booking.js";
import Movie from "../models/Movie.js";

export const getUserBookings = async (req, res) => {
  try {
    const { userId } = req.auth();
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    
    res.json({ success: true, bookings: [] });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateFavorite = async (req, res) => {
  try {
    const { movieId } = req.body;
    console.log('🔍 Favorite update for movie:', movieId);
    
    res.json({
      success: true,
      message: 'Favorite updated successfully'
    });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getFavorites = async (req, res) => {
  try {
    res.json({ success: true, movies: [] });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const testBookings = async (req, res) => {
  try {
    const { userId } = req.auth();
    
    res.json({ 
      success: true, 
      message: "Test successful",
      userId: userId 
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
