import React, { useState, useEffect } from 'react'
import { Star, TrendingUp, Award } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import timeFormat from '../lib/timeFormat'
import axios from 'axios'

const MovieSections = () => {
    const navigate = useNavigate()
    const { image_base_url } = useAppContext()
    const [topRatedMovies, setTopRatedMovies] = useState([])
    const [popularMovies, setPopularMovies] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchMoviesFromTMDB = async () => {
        try {
            setLoading(true)
            
            // Fetch top rated movies
            const topRatedResponse = await axios.get(
                `https://api.themoviedb.org/3/movie/top_rated?api_key=${import.meta.env.VITE_TMDB_API_KEY || '6be9d0c3873af0899ce409eb2de46af2'}&page=1`
            )
            
            // Fetch popular movies
            const popularResponse = await axios.get(
                `https://api.themoviedb.org/3/movie/popular?api_key=${import.meta.env.VITE_TMDB_API_KEY || '6be9d0c3873af0899ce409eb2de46af2'}&page=1`
            )

            setTopRatedMovies(topRatedResponse.data.results.slice(0, 5))
            setPopularMovies(popularResponse.data.results.slice(0, 4))
        } catch (error) {
            console.error('Error fetching movies from TMDB:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMoviesFromTMDB()
    }, [])

    // Movie card with same styling as Now Showing in Theaters
    const TMDBMovieCard = ({ movie }) => (
        <div className='flex flex-col justify-between p-3 bg-gray-800 rounded-2xl hover:-translate-y-1 transition duration-300 w-66'>
            <img 
                onClick={() => { navigate(`/movies/${movie.id}`); scrollTo(0, 0) }}
                src={image_base_url + movie.backdrop_path} 
                alt={movie.title} 
                className='rounded-lg h-52 w-full object-cover object-right-bottom cursor-pointer'
            />

            <p className='font-semibold mt-2 truncate'>{movie.title}</p>

            <p className='text-sm text-gray-400 mt-2'>
                {new Date(movie.release_date).getFullYear()} • {movie.genre_ids ? 'Movie' : 'Drama'} • {movie.runtime ? timeFormat(movie.runtime) : '2h 0m'}
            </p>

            <div className='flex items-center justify-between mt-4 pb-3'>
                <button 
                    onClick={() => { navigate(`/movies/${movie.id}`); scrollTo(0, 0) }} 
                    className='px-4 py-2 text-xs bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer'
                >
                    View Details
                </button>

                <p className='flex items-center gap-1 text-sm text-gray-400 mt-1 pr-1'>
                    <Star className="w-4 h-4 text-primary fill-primary"/>
                    {movie.vote_average.toFixed(1)}
                </p>
            </div>
        </div>
    )

    const MovieSection = ({ title, movies, icon: Icon }) => (
        <div className='px-6 md:px-16 lg:px-40 xl:px-44 mb-16'>
            <h2 className='text-2xl font-bold text-white my-6 flex items-center gap-3'>
                <span className='w-1 h-8 bg-primary rounded'></span>
                <Icon className='w-6 h-6 text-primary' />
                {title}
            </h2>
            
            {loading ? (
                <div className='flex flex-wrap max-sm:justify-center gap-8'>
                    {[...Array(5)].map((_, index) => (
                        <div key={index} className='animate-pulse w-66'>
                            <div className='bg-gray-700 h-52 rounded-lg mb-2'></div>
                            <div className='bg-gray-700 h-4 rounded mb-2'></div>
                            <div className='bg-gray-700 h-3 rounded w-3/4 mb-2'></div>
                            <div className='bg-gray-700 h-8 rounded'></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className='flex flex-wrap max-sm:justify-center gap-8'>
                    {movies.map((movie) => (
                        <TMDBMovieCard key={movie.id} movie={movie} />
                    ))}
                </div>
            )}
        </div>
    )

    return (
        <div>
            {/* Top Rated Movies */}
            <MovieSection 
                title="Top Rated Movies"
                movies={topRatedMovies}
                icon={Award}
            />
            
            {/* Popular Movies */}
            <MovieSection 
                title="Popular Movies"
                movies={popularMovies}
                icon={TrendingUp}
            />
        </div>
    )
}

export default MovieSections