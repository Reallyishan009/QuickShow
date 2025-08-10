// src/context/AppContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [shows, setShows] = useState([]);
    const [trailers, setTrailers] = useState([]);
    
    // ✅ Initialize favorites with a function to avoid render-time execution
    const [favouriteMovies, setFavouriteMovies] = useState(() => {
        try {
            const savedFavorites = localStorage.getItem('favoriteMovies');
            return savedFavorites ? JSON.parse(savedFavorites) : [];
        } catch (error) {
            console.error('Error loading favorites from localStorage:', error);
            localStorage.removeItem('favoriteMovies');
            return [];
        }
    });
    
    const image_base_url = 'https://image.tmdb.org/t/p/w500';

    const { user } = useUser();
    const { getToken } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // ✅ Simple add/remove favorite function
    const toggleFavorite = (movie) => {
        setFavouriteMovies(prev => {
            const isAlreadyFavorite = prev.some(fav => fav._id === movie._id);
            let newFavorites;
            
            if (isAlreadyFavorite) {
                // Remove from favorites
                newFavorites = prev.filter(fav => fav._id !== movie._id);
                toast.success('Removed from favorites');
            } else {
                // Add to favorites
                newFavorites = [...prev, movie];
                toast.success('Added to favorites');
            }
            
            // Save to localStorage
            try {
                localStorage.setItem('favoriteMovies', JSON.stringify(newFavorites));
            } catch (error) {
                console.error('Error saving favorites to localStorage:', error);
                toast.error('Failed to save favorite');
            }
            
            return newFavorites;
        });
    };

    // ✅ Check if movie is favorite
    const isFavorite = (movieId) => {
        return favouriteMovies.some(movie => movie._id === movieId);
    };

    // ✅ Fetch trailers through your secure backend API
    const fetchPopularTrailers = async () => {
        try {
            const response = await axios.get('/api/tmdb/popular-trailers');
            
            if (response.data.success) {
                setTrailers(response.data.trailers);
                console.log('Trailers fetched successfully:', response.data.trailers);
            } else {
                console.error('Failed to fetch trailers:', response.data.message);
                toast.error('Failed to fetch trailers');
            }
        } catch (error) {
            console.error('Error fetching trailers:', error);
            toast.error('Failed to fetch trailers');
        }
    };

    const fetchIsAdmin = async () => {
        try {
            const token = await getToken();
            const { data } = await axios.get('/api/admin/is-admin', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsAdmin(data.isAdmin);

            if (!data.isAdmin && location.pathname.startsWith('/admin')) {
                navigate('/');
                toast.error('You are not authorized to access this page');
            }
        } catch (error) {
            console.error('Error fetching admin status:', error);
            setIsAdmin(false);
        }
    };

    const fetchShows = async () => {
        try {
            const { data } = await axios.get('/api/show/all');
            if (data.success) {
                setShows(data.shows);
            } else {
                toast.error(data.message || 'Failed to fetch shows');
            }
        } catch (error) {
            console.error('Error fetching shows:', error);
        }
    };

    useEffect(() => {
        fetchShows();
    }, []);

    useEffect(() => {
        if (shows.length > 0) {
            fetchPopularTrailers();
        }
    }, [shows]);

    useEffect(() => {
        if (user) {
            fetchIsAdmin();
        } else {
            setIsAdmin(false);
        }
    }, [user]);

    const value = {
        axios,
        isAdmin,
        shows,
        favouriteMovies,
        trailers,
        toggleFavorite,
        isFavorite,
        fetchIsAdmin,
        fetchShows,
        fetchPopularTrailers,
        user,
        getToken,
        navigate,
        setIsAdmin,
        image_base_url
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);
