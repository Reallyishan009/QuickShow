import React, { useState, useEffect } from 'react'
import { Star, Calendar, Clock, TrendingUp, Award } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import axios from 'axios'

const MovieSections = () => {
    const navigate = useNavigate()
    const { image_base_url } = useAppContext()
    const [topRatedMovies, setTopRatedMovies] = useState([])
    const [recentMovies, setRecentMovies] = useState([])
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
            
            // Fetch now playing (recent) movies
            const recentResponse = await axios.get(
                `https://api.themoviedb.org/3/movie/now_playing?api_key=${import.meta.env.VITE_TMDB_API_KEY || '6be9d0c3873af0899ce409eb2de46af2'}&page=1`
            )

            setTopRatedMovies(topRatedResponse.data.results.slice(0, 8))
            setPopularMovies(popularResponse.data.results.slice(0, 8))
            setRecentMovies(recentResponse.data.results.slice(0, 8))
        } catch (error) {
            console.error('Error fetching movies from TMDB:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMoviesFromTMDB()
    }, [])

    const MovieCard = ({ movie, rank, showRank = false }) => (
        <div 
            className='relative group cursor-pointer transition-all duration-300 hover:scale-105'
            onClick={() => navigate(`/movies/${movie.id}`)}
        >
            <div className='relative overflow-hidden rounded-lg bg-gray-800'>
                <img 
                    src={`${image_base_url}${movie.poster_path}`}
                    alt={movie.title}
                    className='w-full h-80 object-cover group-hover:scale-110 transition-transform duration-300'
                />
                
                {/* Rank Badge */}
                {showRank && (
                    <div className='absolute top-2 left-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded'>
                        #{rank}
                    </div>
                )}
                
                {/* Rating Badge */}
                <div className='absolute top-2 right-2 bg-black/70 text-white text-xs font-medium px-2 py-1 rounded flex items-center gap-1'>
                    <Star className='w-3 h-3 fill-yellow-400 text-yellow-400' />
                    {movie.vote_average.toFixed(1)}
                </div>
                
                {/* Overlay */}
                <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
                
                {/* Movie Info Overlay */}
                <div className='absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300'>
                    <h3 className='font-semibold text-sm mb-1 overflow-hidden'>{movie.title}</h3>
                    <div className='flex items-center gap-2 text-xs text-gray-300 mb-2'>
                        <Calendar className='w-3 h-3' />
                        {new Date(movie.release_date).getFullYear()}
                    </div>
                    <p className='text-xs text-gray-300 line-clamp-2 overflow-hidden'>{movie.overview}</p>
                </div>
            </div>
        </div>
    )

    const MovieSection = ({ title, movies, icon: Icon, showRank = false }) => (
        <div className='mb-16'>
            <div className='flex items-center gap-3 mb-6'>
                <Icon className='w-6 h-6 text-primary' />
                <h2 className='text-2xl font-bold text-white'>{title}</h2>
            </div>
            
            {loading ? (
                <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4'>
                    {[...Array(8)].map((_, index) => (
                        <div key={index} className='animate-pulse'>
                            <div className='bg-gray-700 h-80 rounded-lg mb-2'></div>
                            <div className='bg-gray-700 h-4 rounded mb-1'></div>
                            <div className='bg-gray-700 h-3 rounded w-3/4'></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4'>
                    {movies.map((movie, index) => (
                        <MovieCard 
                            key={movie.id} 
                            movie={movie} 
                            rank={index + 1}
                            showRank={showRank}
                        />
                    ))}
                </div>
            )}
        </div>
    )

    return (
        <div className='px-6 md:px-16 lg:px-40 xl:px-44 py-12'>
            {/* Top Rated Movies */}
            <MovieSection 
                title="Top Rated Movies"
                movies={topRatedMovies}
                icon={Award}
                showRank={true}
            />
            
            {/* Popular Movies */}
            <MovieSection 
                title="Popular Movies"
                movies={popularMovies}
                icon={TrendingUp}
            />
            
            {/* Recent Movies */}
            <MovieSection 
                title="Now Playing"
                movies={recentMovies}
                icon={Clock}
            />
        </div>
    )
}

export default MovieSections