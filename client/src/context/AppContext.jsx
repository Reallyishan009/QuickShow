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
    const [favouriteMovies, setFavouriteMovies] = useState([]);

    const { user } = useUser();
    const { getToken } = useAuth();
    const location = useLocation();
    const navigate = useNavigate(); // ✅ Fixed: Add the missing hook

    const fetchIsAdmin = async () => {
        try {
            const token = await getToken();
            const { data } = await axios.get('/api/admin/is-admin', { // ✅ Fixed: correct endpoint
                headers: { Authorization: `Bearer ${token}` }});
            setIsAdmin(data.isAdmin);

            if (!data.isAdmin && location.pathname.startsWith('/admin')) {
                navigate('/'); // ✅ This will now work
                toast.error('You are not authorized to access this page');
            }
        } catch (error) {
            console.error('Error fetching admin status:', error);
            setIsAdmin(false); // ✅ Set to false on error
        }
    };

    const fetchShows = async () => {
        try {
            const { data } = await axios.get('/api/show/all'); // ✅ Fixed: correct endpoint
            if (data.success) {
                setShows(data.shows);
            } else {
                toast.error(data.message || 'Failed to fetch shows');
            }
        } catch (error) {
            console.error('Error fetching shows:', error);
        }
    };

    const fetchFavouriteMovies = async () => {
        try {
            const token = await getToken();
            const { data } = await axios.get('/api/user/favorites', { // ✅ Fixed: correct endpoint
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setFavouriteMovies(data.movies); // ✅ Fixed: correct property name
            } else {
                toast.error(data.message || 'Failed to fetch favourite movies');
            }
        } catch (error) {
            console.error('Error fetching favourite movies:', error);
            toast.error('Failed to fetch favourite movies');
        }
    };

    useEffect(() => {
        fetchShows();
    }, []);

    useEffect(() => {
        if (user) {
            fetchIsAdmin();
            fetchFavouriteMovies();
        } else {
            // Reset states when user logs out
            setIsAdmin(false);
            setFavouriteMovies([]);
        }
    }, [user]);

    const value = {
        axios,
        isAdmin,
        shows,
        favouriteMovies,
        fetchFavouriteMovies,
        fetchIsAdmin,
        fetchShows,
        user,
        getToken,
        navigate,
        setIsAdmin
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

// ✅ Fixed: Correct export syntax
export const useAppContext = () => useContext(AppContext);
