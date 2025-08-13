import React, { useState, useEffect } from 'react'
import { ArrowRight, Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import timeFormat from '../lib/timeFormat'

const HeroSection = () => {
    const navigate = useNavigate()
    const { shows, image_base_url } = useAppContext()
    const [currentMovieIndex, setCurrentMovieIndex] = useState(0)
    const [currentMovie, setCurrentMovie] = useState(null)

    // Auto-rotate movies every 5 seconds
    useEffect(() => {
        if (shows.length > 0) {
            const interval = setInterval(() => {
                setCurrentMovieIndex((prevIndex) => 
                    prevIndex === shows.length - 1 ? 0 : prevIndex + 1
                )
            }, 5000)
            return () => clearInterval(interval)
        }
    }, [shows.length])

    // Update current movie when index changes
    useEffect(() => {
        if (shows.length > 0) {
            setCurrentMovie(shows[currentMovieIndex])
        }
    }, [currentMovieIndex, shows])

    const nextMovie = () => {
        setCurrentMovieIndex((prevIndex) => 
            prevIndex === shows.length - 1 ? 0 : prevIndex + 1
        )
    }

    const prevMovie = () => {
        setCurrentMovieIndex((prevIndex) => 
            prevIndex === 0 ? shows.length - 1 : prevIndex - 1
        )
    }

    const goToMovieDetails = () => {
        if (currentMovie) {
            navigate(`/movies/${currentMovie._id}`)
        }
    }

    if (!currentMovie) {
        return (
            <div className='flex flex-col items-start justify-center gap-4 px-6 md:px-16 lg:px-36 bg-gradient-to-r from-gray-900 to-black h-screen'>
                <div className='animate-pulse'>
                    <div className='h-8 bg-gray-700 rounded w-48 mb-4'></div>
                    <div className='h-16 bg-gray-700 rounded w-96 mb-4'></div>
                    <div className='h-4 bg-gray-700 rounded w-64 mb-2'></div>
                    <div className='h-4 bg-gray-700 rounded w-80'></div>
                </div>
            </div>
        )
    }

    return (
        <div 
            className='relative flex flex-col items-start justify-center gap-4 px-6 md:px-16 lg:px-36 h-screen bg-cover bg-center'
            style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${image_base_url}${currentMovie.backdrop_path})`
            }}
        >
            {/* Navigation Arrows */}
            <button 
                onClick={prevMovie}
                className='absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 p-3 rounded-full transition-all z-10'
            >
                <ChevronLeft className='w-6 h-6 text-white' />
            </button>
            <button 
                onClick={nextMovie}
                className='absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 p-3 rounded-full transition-all z-10'
            >
                <ChevronRight className='w-6 h-6 text-white' />
            </button>

            {/* Movie Logo/Title */}
            <div className="mt-20">
                {currentMovie.tagline && (
                    <p className="text-primary text-sm font-medium mb-2">{currentMovie.tagline}</p>
                )}
            </div>

            <h1 className='text-5xl md:text-[70px] md:leading-18 font-semibold max-w-110 text-white'>
                {currentMovie.title}
            </h1>

            <div className='flex items-center gap-4 text-gray-300'>
                <span>{currentMovie.genres?.map(genre => genre.name).join(' | ') || 'Movie'}</span>
                <div className='flex items-center gap-1'>
                    <Calendar className='w-4.5 h-4.5'/> 
                    {currentMovie.release_date ? new Date(currentMovie.release_date).getFullYear() : 'TBA'}
                </div>
                <div className='flex items-center gap-1'>
                    <Clock className='w-4.5 h-4.5'/> 
                    {currentMovie.runtime ? timeFormat(currentMovie.runtime) : 'TBA'}
                </div>
            </div>

            <p className='max-w-md text-gray-300 leading-relaxed'>
                {currentMovie.overview || 'An exciting movie experience awaits you.'}
            </p>

            <div className='flex items-center gap-4'>
                <button 
                    onClick={goToMovieDetails}
                    className='flex items-center gap-2 px-8 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer'
                >
                    Book Now
                    <ArrowRight className="w-5 h-5"/>
                </button>
                <button 
                    onClick={() => navigate('/movies')} 
                    className='flex items-center gap-2 px-6 py-3 text-sm bg-gray-800/80 hover:bg-gray-700/80 transition rounded-full font-medium cursor-pointer text-white'
                >
                    Explore Movies
                </button>
            </div>

            {/* Movie Indicators */}
            <div className='absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2'>
                {shows.slice(0, 5).map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentMovieIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                            index === currentMovieIndex ? 'bg-primary w-8' : 'bg-gray-500'
                        }`}
                    />
                ))}
            </div>
        </div>
    )
}

export default HeroSection
