import React, { useState, useEffect } from 'react'
import ReactPlayer from 'react-player'
import { X } from 'lucide-react'
import axios from 'axios'

const TrailerPlayer = ({ movieId, movieTitle, onClose, isVisible }) => {
    const [trailerUrl, setTrailerUrl] = useState('')
    const [loading, setLoading] = useState(true)

    const fetchTrailer = async () => {
        try {
            setLoading(true)
            const response = await axios.get(
                `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${import.meta.env.VITE_TMDB_API_KEY || '6be9d0c3873af0899ce409eb2de46af2'}`
            )
            
            const videos = response.data.results
            const trailer = videos.find(video => 
                video.type === 'Trailer' && video.site === 'YouTube'
            ) || videos.find(video => video.site === 'YouTube')
            
            if (trailer) {
                setTrailerUrl(`https://www.youtube.com/watch?v=${trailer.key}`)
            }
        } catch (error) {
            console.error('Error fetching trailer:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (isVisible && movieId) {
            fetchTrailer()
        }
    }, [movieId, isVisible])

    if (!isVisible) return null

    return (
        <div className='w-full max-w-4xl mx-auto mb-8'>
            <div className='flex items-center justify-between mb-4'>
                <h3 className='text-xl font-semibold text-white'>
                    {movieTitle} - Official Trailer
                </h3>
                <button 
                    onClick={onClose}
                    className='p-2 hover:bg-gray-800 rounded-full transition-colors'
                >
                    <X className='w-5 h-5 text-gray-400' />
                </button>
            </div>
            
            <div className='relative bg-black rounded-lg overflow-hidden'>
                {loading ? (
                    <div className='flex justify-center items-center h-96'>
                        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
                    </div>
                ) : trailerUrl ? (
                    <ReactPlayer 
                        url={trailerUrl} 
                        controls={true} 
                        className="mx-auto" 
                        width="100%" 
                        height="500px"
                        playing={true}
                    />
                ) : (
                    <div className='flex justify-center items-center h-96'>
                        <p className='text-gray-400'>Trailer not available</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default TrailerPlayer