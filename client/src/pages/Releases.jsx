import React, { useState, useEffect } from 'react'
import { Calendar, Clock, Star, TrendingUp, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import BlurCircle from '../components/BlurCircle.jsx'
import axios from 'axios'

const Releases = () => {
    const navigate = useNavigate()
    const [upcomingMovies, setUpcomingMovies] = useState([])
    const [newReleases, setNewReleases] = useState([])
    const [loading, setLoading] = useState(true)
    const image_base_url = import.meta.env.VITE_TMDB_IMAGE_BASE_URL

    const fetchReleases = async () => {
        try {
            setLoading(true)
            
            // Fetch upcoming movies
            const upcomingResponse = await axios.get(
                `https://api.themoviedb.org/3/movie/upcoming?api_key=${import.meta.env.VITE_TMDB_API_KEY || '6be9d0c3873af0899ce409eb2de46af2'}&page=1`
            )
            
            // Fetch latest releases (now playing)
            const nowPlayingResponse = await axios.get(
                `https://api.themoviedb.org/3/movie/now_playing?api_key=${import.meta.env.VITE_TMDB_API_KEY || '6be9d0c3873af0899ce409eb2de46af2'}&page=1`
            )

            setUpcomingMovies(upcomingResponse.data.results.slice(0, 12))
            setNewReleases(nowPlayingResponse.data.results.slice(0, 12))
        } catch (error) {
            console.error('Error fetching releases:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchReleases()
    }, [])

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        })
    }

    const isComingSoon = (releaseDate) => {
        return new Date(releaseDate) > new Date()
    }

    const MovieCard = ({ movie, isUpcoming = false }) => (
        <div className='group relative bg-gray-900 rounded-xl overflow-hidden hover:scale-105 transition-all duration-300 cursor-pointer'>
            <div className='relative'>
                <img 
                    src={`${image_base_url}${movie.poster_path}`}
                    alt={movie.title}
                    className='w-full h-96 object-cover group-hover:scale-110 transition-transform duration-300'
                />
                
                {/* Status Badge */}
                <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold ${
                    isUpcoming 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-green-600 text-white'
                }`}>
                    {isUpcoming ? 'Coming Soon' : 'Now Playing'}
                </div>
                
                {/* Rating Badge */}
                <div className='absolute top-3 right-3 bg-black/70 text-white text-xs font-medium px-2 py-1 rounded flex items-center gap-1'>
                    <Star className='w-3 h-3 fill-yellow-400 text-yellow-400' />
                    {movie.vote_average.toFixed(1)}
                </div>
                
                {/* Gradient Overlay */}
                <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent' />
            </div>
            
            {/* Movie Info */}
            <div className='p-4'>
                <h3 className='text-white font-bold text-lg mb-2 line-clamp-2'>{movie.title}</h3>
                
                <div className='flex items-center gap-4 text-gray-400 text-sm mb-3'>
                    <div className='flex items-center gap-1'>
                        <Calendar className='w-4 h-4' />
                        {formatDate(movie.release_date)}
                    </div>
                </div>
                
                <p className='text-gray-300 text-sm line-clamp-3 mb-4'>{movie.overview}</p>
                
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                        <div className='flex items-center gap-1 text-yellow-400'>
                            <Star className='w-4 h-4 fill-current' />
                            <span className='text-sm font-medium'>{movie.vote_average.toFixed(1)}</span>
                        </div>
                        <span className='text-gray-500 text-sm'>({movie.vote_count} votes)</span>
                    </div>
                    
                    {!isUpcoming && (
                        <button 
                            onClick={() => navigate(`/movies/${movie.id}`)}
                            className='px-4 py-2 bg-primary hover:bg-primary-dull text-white text-sm rounded-lg transition-colors'
                        >
                            Book Now
                        </button>
                    )}
                </div>
            </div>
        </div>
    )

    const LoadingSkeleton = () => (
        <div className='animate-pulse bg-gray-800 rounded-xl overflow-hidden'>
            <div className='bg-gray-700 h-96 w-full'></div>
            <div className='p-4'>
                <div className='bg-gray-700 h-6 rounded mb-2'></div>
                <div className='bg-gray-700 h-4 rounded mb-2 w-3/4'></div>
                <div className='bg-gray-700 h-3 rounded mb-1'></div>
                <div className='bg-gray-700 h-3 rounded mb-1'></div>
                <div className='bg-gray-700 h-3 rounded w-1/2'></div>
            </div>
        </div>
    )

    return (
        <div className='relative min-h-screen pt-32 pb-20 px-6 md:px-16 lg:px-40 xl:px-44'>
            <BlurCircle top="100px" left="0px"/>
            <BlurCircle bottom="200px" right="100px"/>
            
            {/* Page Header */}
            <div className='text-center mb-12'>
                <h1 className='text-4xl md:text-5xl font-bold text-white mb-4'>
                    Movie Releases
                </h1>
                <p className='text-gray-400 text-lg max-w-2xl mx-auto'>
                    Stay updated with the latest movie releases and upcoming blockbusters
                </p>
            </div>

            {/* New Releases Section */}
            <section className='mb-16'>
                <div className='flex items-center gap-3 mb-8'>
                    <Zap className='w-7 h-7 text-green-500' />
                    <h2 className='text-3xl font-bold text-white'>New Releases</h2>
                    <div className='flex-1 h-px bg-gradient-to-r from-green-500 to-transparent'></div>
                </div>
                
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                    {loading ? (
                        [...Array(8)].map((_, index) => (
                            <LoadingSkeleton key={index} />
                        ))
                    ) : (
                        newReleases.map((movie) => (
                            <MovieCard key={movie.id} movie={movie} isUpcoming={false} />
                        ))
                    )}
                </div>
            </section>

            {/* Upcoming Movies Section */}
            <section>
                <div className='flex items-center gap-3 mb-8'>
                    <TrendingUp className='w-7 h-7 text-blue-500' />
                    <h2 className='text-3xl font-bold text-white'>Coming Soon</h2>
                    <div className='flex-1 h-px bg-gradient-to-r from-blue-500 to-transparent'></div>
                </div>
                
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                    {loading ? (
                        [...Array(8)].map((_, index) => (
                            <LoadingSkeleton key={index} />
                        ))
                    ) : (
                        upcomingMovies.map((movie) => (
                            <MovieCard key={movie.id} movie={movie} isUpcoming={true} />
                        ))
                    )}
                </div>
            </section>

            {/* Call to Action */}
            <div className='text-center mt-16'>
                <div className='bg-gradient-to-r from-primary/20 to-blue-600/20 rounded-2xl p-8 border border-primary/30'>
                    <h3 className='text-2xl font-bold text-white mb-4'>
                        Don't Miss Out!
                    </h3>
                    <p className='text-gray-300 mb-6 max-w-2xl mx-auto'>
                        Be the first to book tickets for upcoming releases. Get notified when your favorite movies are available for booking.
                    </p>
                    <button 
                        onClick={() => navigate('/movies')}
                        className='px-8 py-3 bg-primary hover:bg-primary-dull text-white font-medium rounded-full transition-colors'
                    >
                        Explore All Movies
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Releases