import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Heart, PlayCircle, Star, Calendar, Clock, Globe, DollarSign } from 'lucide-react'
import BlurCircle from '../components/BlurCircle.jsx'
import TrailerPlayer from '../components/TrailerPlayer.jsx'
import Loading from '../components/Loading.jsx'
import axios from 'axios'

const TMDBMovieDetails = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const [movie, setMovie] = useState(null)
    const [credits, setCredits] = useState(null)
    const [similarMovies, setSimilarMovies] = useState([])
    const [showTrailer, setShowTrailer] = useState(false)
    const [loading, setLoading] = useState(true)
    
    const image_base_url = import.meta.env.VITE_TMDB_IMAGE_BASE_URL

    const fetchMovieDetails = async () => {
        try {
            setLoading(true)
            
            // Fetch movie details, credits, and similar movies
            const [movieResponse, creditsResponse, similarResponse] = await Promise.all([
                axios.get(`https://api.themoviedb.org/3/movie/${id}?api_key=${import.meta.env.VITE_TMDB_API_KEY || '6be9d0c3873af0899ce409eb2de46af2'}`),
                axios.get(`https://api.themoviedb.org/3/movie/${id}/credits?api_key=${import.meta.env.VITE_TMDB_API_KEY || '6be9d0c3873af0899ce409eb2de46af2'}`),
                axios.get(`https://api.themoviedb.org/3/movie/${id}/similar?api_key=${import.meta.env.VITE_TMDB_API_KEY || '6be9d0c3873af0899ce409eb2de46af2'}`)
            ])

            setMovie(movieResponse.data)
            setCredits(creditsResponse.data)
            setSimilarMovies(similarResponse.data.results.slice(0, 6))
        } catch (error) {
            console.error('Error fetching movie details:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (id) {
            fetchMovieDetails()
        }
    }, [id])

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount)
    }

    const formatRuntime = (minutes) => {
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        return `${hours}h ${mins}m`
    }

    if (loading) return <Loading />

    if (!movie) {
        return (
            <div className='flex flex-col items-center justify-center h-screen'>
                <h1 className='text-3xl font-bold text-center text-white'>Movie not found</h1>
                <button 
                    onClick={() => navigate('/movies')}
                    className='mt-4 px-6 py-2 bg-primary hover:bg-primary-dull text-white rounded-lg transition-colors'
                >
                    Back to Movies
                </button>
            </div>
        )
    }

    return (
        <div className='px-6 md:px-16 lg:px-40 pt-30 md:pt-50'>
            <div className='flex flex-col md:flex-row gap-8 max-w-6xl mx-auto'>
                <img 
                    src={`${image_base_url}${movie.poster_path}`} 
                    alt={movie.title} 
                    className='max-md:mx-auto rounded-xl h-104 max-w-70 object-cover'
                />

                <div className='relative flex flex-col gap-3'>
                    <BlurCircle top="-100px" left="-100px"/>
                    
                    {/* Status Badge */}
                    <div className='flex gap-2 mb-2'>
                        <span className='px-3 py-1 bg-primary/20 text-primary text-sm rounded-full'>
                            {movie.status}
                        </span>
                        {movie.adult && (
                            <span className='px-3 py-1 bg-red-600/20 text-red-400 text-sm rounded-full'>
                                18+
                            </span>
                        )}
                    </div>

                    <h1 className='text-4xl font-semibold max-w-96 text-balance text-white'>{movie.title}</h1>
                    
                    {movie.tagline && (
                        <p className='text-primary italic text-lg'>{movie.tagline}</p>
                    )}

                    <div className='flex items-center gap-2 text-gray-300'>
                        <Star className="w-5 h-5 text-primary fill-primary"/>
                        {movie.vote_average.toFixed(1)} ({movie.vote_count.toLocaleString()} votes)
                    </div>

                    <p className='text-gray-400 mt-2 text-sm leading-tight max-w-xl'>{movie.overview}</p>

                    {/* Movie Info */}
                    <div className='grid grid-cols-2 gap-4 mt-4'>
                        <div className='flex items-center gap-2 text-gray-300'>
                            <Clock className="w-4 h-4"/>
                            <span>{formatRuntime(movie.runtime)}</span>
                        </div>
                        <div className='flex items-center gap-2 text-gray-300'>
                            <Calendar className="w-4 h-4"/>
                            <span>{new Date(movie.release_date).getFullYear()}</span>
                        </div>
                        <div className='flex items-center gap-2 text-gray-300'>
                            <Globe className="w-4 h-4"/>
                            <span>{movie.original_language.toUpperCase()}</span>
                        </div>
                        {movie.budget > 0 && (
                            <div className='flex items-center gap-2 text-gray-300'>
                                <DollarSign className="w-4 h-4"/>
                                <span>{formatCurrency(movie.budget)}</span>
                            </div>
                        )}
                    </div>

                    {/* Genres */}
                    <div className='mt-4'>
                        <div className='flex flex-wrap gap-2'>
                            {movie.genres.map((genre) => (
                                <span key={genre.id} className='px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded-full'>
                                    {genre.name}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className='flex items-center flex-wrap gap-4 mt-6'>
                        <button 
                            onClick={() => setShowTrailer(!showTrailer)}
                            className='flex items-center gap-2 px-7 py-3 text-sm bg-gray-800 hover:bg-gray-900 transition rounded-md font-medium cursor-pointer active:scale-95'
                        >
                            <PlayCircle className="w-5 h-5"/>
                            {showTrailer ? 'Hide Trailer' : 'Watch Trailer'}
                        </button>
                        
                        <button 
                            onClick={() => navigate('/theaters')}
                            className='px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer active:scale-95'
                        >
                            Find Theaters
                        </button>
                        
                        <button className='bg-gray-700 p-2.5 rounded-full transition cursor-pointer active:scale-95'>
                            <Heart className='w-5 h-5'/>
                        </button>
                    </div>
                </div>
            </div>

            {/* Trailer Player Section */}
            <div className='mt-12'>
                <TrailerPlayer 
                    movieId={movie.id}
                    movieTitle={movie.title}
                    onClose={() => setShowTrailer(false)}
                    isVisible={showTrailer}
                />
            </div>

            {/* Cast Section */}
            {credits && credits.cast.length > 0 && (
                <div className='mt-20'>
                    <p className='text-lg font-medium mb-8 text-white'>Cast</p>
                    <div className='overflow-x-auto no-scrollbar pb-4'>
                        <div className='flex items-center gap-4 w-max px-4'>
                            {credits.cast.slice(0, 12).map((cast, index) => (
                                <div key={index} className='flex flex-col items-center text-center'>
                                    <img 
                                        src={cast.profile_path ? `${image_base_url}${cast.profile_path}` : '/api/placeholder/80/80'} 
                                        alt={cast.name} 
                                        className='rounded-full h-20 w-20 aspect-square object-cover'
                                    />
                                    <p className='font-medium text-xs mt-3 text-white max-w-20 truncate'>{cast.name}</p>
                                    <p className='text-xs text-gray-400 max-w-20 truncate'>{cast.character}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Production Info */}
            {movie.production_companies.length > 0 && (
                <div className='mt-16'>
                    <p className='text-lg font-medium mb-6 text-white'>Production</p>
                    <div className='flex flex-wrap gap-4'>
                        {movie.production_companies.slice(0, 4).map((company) => (
                            <div key={company.id} className='flex items-center gap-3 bg-gray-800 rounded-lg p-4'>
                                {company.logo_path && (
                                    <img 
                                        src={`${image_base_url}${company.logo_path}`}
                                        alt={company.name}
                                        className='h-8 w-auto object-contain'
                                    />
                                )}
                                <span className='text-white text-sm'>{company.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Similar Movies */}
            {similarMovies.length > 0 && (
                <div className='mt-20'>
                    <p className='text-lg font-medium mb-8 text-white'>Similar Movies</p>
                    <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4'>
                        {similarMovies.map((similarMovie) => (
                            <div 
                                key={similarMovie.id}
                                className='group cursor-pointer'
                                onClick={() => {
                                    navigate(`/tmdb-movie/${similarMovie.id}`)
                                    scrollTo(0, 0)
                                }}
                            >
                                <div className='relative overflow-hidden rounded-lg'>
                                    <img 
                                        src={`${image_base_url}${similarMovie.poster_path}`}
                                        alt={similarMovie.title}
                                        className='w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300'
                                    />
                                    <div className='absolute top-2 right-2 bg-black/70 text-white text-xs font-medium px-2 py-1 rounded flex items-center gap-1'>
                                        <Star className='w-3 h-3 fill-yellow-400 text-yellow-400' />
                                        {similarMovie.vote_average.toFixed(1)}
                                    </div>
                                </div>
                                <h3 className='text-white font-medium mt-2 text-sm truncate'>{similarMovie.title}</h3>
                                <p className='text-gray-400 text-xs'>{new Date(similarMovie.release_date).getFullYear()}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className='flex justify-center mt-20'>
                <button 
                    onClick={() => {navigate('/movies'); scrollTo(0,0)}} 
                    className='px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer'
                >
                    Explore More Movies
                </button>
            </div>
        </div>
    )
}

export default TMDBMovieDetails