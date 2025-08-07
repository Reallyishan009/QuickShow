import axios from 'axios';
import mongoose from 'mongoose';
import Movie from '../models/Movie.js';
import Show from '../models/Show.js';

//API to get now playing movies from TMDB API
export const getNowPlayingMovies = async (req, res) => {
    try {
        const { data } = await axios.get('https://api.themoviedb.org/3/movie/now_playing', {
            headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` }
        });

        const movies = data.results;
        res.json({ success: true, movies: movies });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

//API to add a new show to the database
export const addShow = async(req, res) => {
    try {
        const { movieId, showsInput, showPrice } = req.body;

        if (!movieId || !showsInput || !showPrice) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields: movieId, showsInput, or showPrice' 
            });
        }

        if (!Array.isArray(showsInput) || showsInput.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'showsInput must be a non-empty array' 
            });
        }

        let movie = await Movie.findById(movieId);
        if (!movie) {
            const [movieDetailsResponse, movieCreditsResponse] = await Promise.all([
                axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
                    headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` }
                }),
                axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits`, {
                    headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` }
                })
            ]);

            const movieApiData = movieDetailsResponse.data;
            const movieCreditsData = movieCreditsResponse.data;

            const movieDetails = {
                _id: movieId,
                title: movieApiData.title,
                overview: movieApiData.overview,
                poster_path: movieApiData.poster_path,
                backdrop_path: movieApiData.backdrop_path || "", // Provide default
                genres: movieApiData.genres || [],
                casts: movieCreditsData.cast || [],
                release_date: movieApiData.release_date,
                original_language: movieApiData.original_language,
                tagline: movieApiData.tagline || "",
                vote_average: movieApiData.vote_average,
                runtime: movieApiData.runtime,
            };

            movie = await Movie.create(movieDetails);
        }

        const showToCreate = [];
        showsInput.forEach(show => {
            const showDate = show.date;
            show.time.forEach((time) => {
                const dateTimeString = `${showDate}T${time}:00.000Z`; // More specific format
                const dateTime = new Date(dateTimeString);
                
                if (isNaN(dateTime.getTime())) {
                    throw new Error(`Invalid date/time: ${dateTimeString}`);
                }
                
                showToCreate.push({
                    movie: movieId, 
                    showDateTime: dateTime,
                    showPrice,
                    occupiedSeats: {}
                });
            });
        });

        if (showToCreate.length > 0) {
            await Show.insertMany(showToCreate);
        }
        res.json({ success: true, message: 'Show added successfully.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

//API to get all shows from database
export const getShows = async(req, res) => {
    try {
        const shows = await Show.find({
            showDateTime: { $gte: new Date() }
        }).populate('movie').sort({ showDateTime: 1 });

        console.log('Found shows:', shows.length);

        // Get unique movies using Map
        const uniqueMovies = new Map();
        shows.forEach(show => {
            if (show.movie && !uniqueMovies.has(show.movie._id.toString())) {
                uniqueMovies.set(show.movie._id.toString(), show.movie);
            }
        });

        const uniqueMovieArray = Array.from(uniqueMovies.values());
        console.log('Unique movies:', uniqueMovieArray.length);

        res.json({ 
            success: true, 
            shows: uniqueMovieArray 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

//API to get a single show from the database
export const getShow = async (req, res) => {
    try {
        const { movieId } = req.params;
        
        const shows = await Show.find({
            movie: movieId,
            showDateTime: { $gte: new Date() }
        });
        
        const movie = await Movie.findById(movieId);
        
        if (!movie) {
            return res.status(404).json({
                success: false,
                message: 'Movie not found'
            });
        }
        
        const dateTime = {};

        shows.forEach((show) => {
            const date = show.showDateTime.toISOString().split("T")[0];
            if (!dateTime[date]) {
                dateTime[date] = [];
            }
            dateTime[date].push({
                time: show.showDateTime,
                showId: show._id,
                showPrice: show.showPrice
            });
        });

        res.json({ success: true, movie, dateTime });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};


// Add this temporary debug function
export const checkDatabaseStatus = async (req, res) => {
    try {
        // Check connection status
        const connectionStatus = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting'
        };

        // Count documents in collections
        const movieCount = await Movie.countDocuments();
        const showCount = await Show.countDocuments();

        res.json({
            success: true,
            database: {
                connectionState: connectionStatus[mongoose.connection.readyState],
                databaseName: mongoose.connection.name,
                host: mongoose.connection.host,
                port: mongoose.connection.port
            },
            collections: {
                movies: movieCount,
                shows: showCount
            },
            mongooseVersion: mongoose.version,
            currentTime: new Date()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            connectionState: mongoose.connection.readyState
        });
    }
};