import React, { useState, useEffect } from 'react'
import ReactPlayer from 'react-player'
import BlurCircle from './BlurCircle'
import { PlayCircle } from 'lucide-react'
import { useAppContext } from '../context/AppContext'
import axios from 'axios'

const TrailersSection = () => {
    const [currentTrailer, setCurrentTrailer] = useState(null)
    const [trailers, setTrailers] = useState([])
    const [loading, setLoading] = useState(true)
    const { shows } = useAppContext()

    const fetchTrailers = async () => {
        try {
            setLoading(true)
            const trailersData = []
            
            // Get trailers for the first 4 shows
            for (let i = 0; i < Math.min(4, shows.length); i++) {
                const show = shows[i]
                try {
                    const response = await axios.get(
                        `https://api.themoviedb.org/3/movie/${show.movie.id}/videos?api_key=${import.meta.env.VITE_TMDB_API_KEY || '6be9d0c3873af0899ce409eb2de46af2'}`
                    )
                    
                    const videos = response.data.results
                    const trailer = videos.find(video => 
                        video.type === 'Trailer' && video.site === 'YouTube'
                    ) || videos.find(video => video.site === 'YouTube')
                    
                    if (trailer) {
                        trailersData.push({
                            id: show.movie.id,
                            title: show.movie.title,
                            image: `https://img.youtube.com/vi/${trailer.key}/maxresdefault.jpg`,
                            videoUrl: `https://www.youtube.com/watch?v=${trailer.key}`,
                            poster: show.movie.poster_path
                        })
                    }
                } catch (error) {
                    console.log(`Error fetching trailer for ${show.movie.title}:`, error)
                }
            }
            
            setTrailers(trailersData)
            if (trailersData.length > 0) {
                setCurrentTrailer(trailersData[0])
            }
        } catch (error) {
            console.error('Error fetching trailers:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (shows.length > 0) {
            fetchTrailers()
        }
    }, [shows])

    if (loading) {
        return (
            <div className='px-6 md:px-16 lg:px-24 xl:px-44 py-20 overflow-hidden'>
                <p className='text-gray-300 font-medium text-lg max-w-[960px] mx-auto'>Trailers</p>
                <div className='flex justify-center items-center h-96'>
                    <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
                </div>
            </div>
        )
    }

    if (trailers.length === 0) {
        return (
            <div className='px-6 md:px-16 lg:px-24 xl:px-44 py-20 overflow-hidden'>
                <p className='text-gray-300 font-medium text-lg max-w-[960px] mx-auto'>Trailers</p>
                <div className='flex justify-center items-center h-96'>
                    <p className='text-gray-400'>No trailers available at the moment</p>
                </div>
            </div>
        )
    }

    return (
        <div className='px-6 md:px-16 lg:px-24 xl:px-44 py-20 overflow-hidden'>
            <p className='text-gray-300 font-medium text-lg max-w-[960px] mx-auto'>Latest Movie Trailers</p>

            <div className='relative mt-6'>
                <BlurCircle top='-100px' right='-100px'/>
                {currentTrailer && (
                    <ReactPlayer 
                        url={currentTrailer.videoUrl} 
                        controls={true} 
                        className="mx-auto max-w-full" 
                        width="960px" 
                        height="540px"
                        playing={false}
                    />
                )}
            </div>

            <div className='group grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mt-8 max-w-3xl mx-auto'>
                {trailers.map((trailer) => (
                    <div 
                        key={trailer.id} 
                        className={`relative group-hover:not-hover:opacity-50 hover:-translate-y-1 duration-300 transition max-md:h-60 md:max-h-60 cursor-pointer rounded-lg overflow-hidden ${
                            currentTrailer?.id === trailer.id ? 'ring-2 ring-primary' : ''
                        }`} 
                        onClick={() => setCurrentTrailer(trailer)}
                    >
                        <img 
                            src={trailer.image} 
                            alt={`${trailer.title} trailer`} 
                            className='rounded-lg w-full h-full object-cover brightness-75'
                        />
                        <PlayCircle strokeWidth={1.6} className="absolute top-1/2 left-1/2 w-5 md:w-8 h-5 md:h-8 transform -translate-x-1/2 -translate-y-1/2 text-white"/>
                        <div className='absolute bottom-2 left-2 right-2'>
                            <p className='text-white text-xs font-medium truncate'>{trailer.title}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default TrailersSection
