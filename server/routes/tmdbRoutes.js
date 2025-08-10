import express from 'express';
import axios from 'axios';

const router = express.Router();

// Get popular movie trailers
router.get('/popular-trailers', async (req, res) => {
    try {
        // Get popular movies first
        const moviesResponse = await axios.get(
            `https://api.themoviedb.org/3/movie/popular?api_key=${process.env.TMDB_API_KEY}&page=1`
        );
        
        const popularMovies = moviesResponse.data.results.slice(0, 4);
        
        // Get trailers for each movie
        const trailerPromises = popularMovies.map(async (movie) => {
            try {
                const videosResponse = await axios.get(
                    `https://api.themoviedb.org/3/movie/${movie.id}/videos?api_key=${process.env.TMDB_API_KEY}`
                );
                
                const videos = videosResponse.data.results;
                const trailer = videos.find(video => 
                    video.type === 'Trailer' && video.site === 'YouTube'
                ) || videos[0];
                
                if (trailer) {
                    return {
                        id: trailer.id,
                        movieId: movie.id,
                        title: movie.title,
                        videoUrl: `https://www.youtube.com/watch?v=${trailer.key}`,
                        image: `https://image.tmdb.org/t/p/w500${movie.backdrop_path}`,
                        key: trailer.key
                    };
                }
                return null;
            } catch (error) {
                console.error(`Error fetching trailer for movie ${movie.id}:`, error);
                return null;
            }
        });
        
        const trailers = await Promise.all(trailerPromises);
        const validTrailers = trailers.filter(trailer => trailer !== null);
        
        res.json({
            success: true,
            trailers: validTrailers
        });
        
    } catch (error) {
        console.error('Error fetching popular trailers:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch trailers'
        });
    }
});

// Get trailers for specific movie
router.get('/movie/:movieId/trailers', async (req, res) => {
    try {
        const { movieId } = req.params;
        
        const [videosResponse, movieResponse] = await Promise.all([
            axios.get(`https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${process.env.TMDB_API_KEY}`),
            axios.get(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${process.env.TMDB_API_KEY}`)
        ]);
        
        const videos = videosResponse.data.results;
        const movie = movieResponse.data;
        
        const trailers = videos
            .filter(video => video.type === 'Trailer' && video.site === 'YouTube')
            .map(trailer => ({
                id: trailer.id,
                movieId: movieId,
                title: movie.title,
                videoUrl: `https://www.youtube.com/watch?v=${trailer.key}`,
                image: `https://image.tmdb.org/t/p/w500${movie.backdrop_path}`,
                key: trailer.key
            }));
        
        res.json({
            success: true,
            trailers: trailers
        });
        
    } catch (error) {
        console.error('Error fetching movie trailers:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch movie trailers'
        });
    }
});

export default router;
