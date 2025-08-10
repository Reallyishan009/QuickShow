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
    const [trailers, setTrailers] = useState([]);
    
    // ✅ Keep image_base_url (safe to expose)
    const image_base_url = 'https://image.tmdb.org/t/p/w500';
    // ❌ Remove tmdb_api_key (security risk)

    const { user } = useUser();
    const { getToken } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // ✅ NEW: Fetch trailers through your secure backend API
    const fetchPopularTrailers = async () => {
        try {
            const response = await axios.get('/api/tmdb/popular-trailers');
            
            if (response.data.success) {
                setTrailers(response.data.trailers);
            } else {
                toast.error('Failed to fetch trailers');
            }
        } catch (error) {
            console.error('Error fetching trailers:', error);
            toast.error('Failed to fetch trailers');
        }
    };

    // ✅ NEW: Fetch trailers for specific shows through backend
    const fetchTrailersForShows = async () => {
        try {
            if (shows && shows.length > 0) {
                const trailerPromises = shows.slice(0, 4).map(async (show) => {
                    if (show.tmdb_id || show.id) {
                        try {
                            const response = await axios.get(`/api/tmdb/movie/${show.tmdb_id || show.id}/trailers`);
                            return response.data.success ? response.data.trailers : [];
                        } catch (error) {
                            console.error(`Error fetching trailers for show ${show.id}:`, error);
                            return [];
                        }
                    }
                    return [];
                });
                
                const trailerArrays = await Promise.all(trailerPromises);
                const allTrailers = trailerArrays.flat().slice(0, 4);
                
                if (allTrailers.length > 0) {
                    setTrailers(allTrailers);
                } else {
                    await fetchPopularTrailers();
                }
            } else {
                await fetchPopularTrailers();
            }
        } catch (error) {
            console.error('Error fetching show trailers:', error);
            await fetchPopularTrailers();
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

    const fetchFavouriteMovies = async () => {
        try {
            const token = await getToken();
            const { data } = await axios.get('/api/user/favorites', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setFavouriteMovies(data.movies);
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

    // ✅ UPDATED: Fetch trailers after shows are loaded
    useEffect(() => {
        if (shows.length > 0) {
            fetchTrailersForShows();
        } else {
            fetchPopularTrailers();
        }
    }, [shows]);

    useEffect(() => {
        if (user) {
            fetchIsAdmin();
            fetchFavouriteMovies();
        } else {
            setIsAdmin(false);
            setFavouriteMovies([]);
        }
    }, [user]);

    const value = {
        axios,
        isAdmin,
        shows,
        favouriteMovies,
        trailers, // ✅ Keep trailers state
        fetchFavouriteMovies,
        fetchIsAdmin,
        fetchShows,
        fetchPopularTrailers, // ✅ NEW: Secure backend function
        fetchTrailersForShows, // ✅ NEW: Secure backend function
        user,
        getToken,
        navigate,
        setIsAdmin,
        image_base_url
        // ❌ Remove tmdb_api_key and fetchTrailers (insecure)
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);
