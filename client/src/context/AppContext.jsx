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
    const image_base_url = import.meta.env.VITE_TMDB_IMAGE_BASE_URL ;
    const tmdb_api_key = import.meta.env.VITE_TMDB_API_KEY;

    const { user } = useUser();
    const { getToken } = useAuth();
    const location = useLocation();
    const navigate = useNavigate(); // ✅ Fixed: Add the missing hook


    const fetchTrailers = async (movieIds = []) => {
        try {
            const trailerPromises = movieIds.slice(0, 4).map(async (movieId) => {
                const response = await axios.get(
                    `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${tmdb_api_key}`
                );
                
                const videos = response.data.results;
                const trailer = videos.find(video => 
                    video.type === 'Trailer' && video.site === 'YouTube'
                ) || videos[0]; // Fallback to first video if no trailer found

                if (trailer) {
                    // Also get movie details for thumbnail
                    const movieResponse = await axios.get(
                        `https://api.themoviedb.org/3/movie/${movieId}?api_key=${tmdb_api_key}`
                    );
                    
                    return {
                        id: trailer.id,
                        movieId: movieId,
                        title: movieResponse.data.title,
                        videoUrl: `https://www.youtube.com/watch?v=${trailer.key}`,
                        image: `${image_base_url}${movieResponse.data.backdrop_path}`,
                        key: trailer.key
                    };
                }
                return null;
            });

            const trailerResults = await Promise.all(trailerPromises);
            const validTrailers = trailerResults.filter(trailer => trailer !== null);
            setTrailers(validTrailers);
        } catch (error) {
            console.error('Error fetching trailers:', error);
            toast.error('Failed to fetch trailers');
        }
    };



    const fetchPopularTrailers = async () => {
        try {
            const response = await axios.get(
                `https://api.themoviedb.org/3/movie/popular?api_key=${tmdb_api_key}&page=1`
            );
            
            const popularMovieIds = response.data.results.slice(0, 4).map(movie => movie.id);
            await fetchTrailers(popularMovieIds);
        } catch (error) {
            console.error('Error fetching popular movies:', error);
            toast.error('Failed to fetch popular trailers');
        }
    };

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
        fetchPopularTrailers(); // ✅ Fetch trailers on component mount
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
        setIsAdmin,
        image_base_url,
        tmdb_api_key,
        trailers,
        fetchTrailers, // ✅ Add fetchTrailers function
        fetchPopularTrailers, // ✅ Add fetchPopularTrailers function
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

// ✅ Fixed: Correct export syntax
export const useAppContext = () => useContext(AppContext);
