import React, { useState, useEffect } from 'react';
import BlurCircle from './BlurCircle.jsx';
import ReactPlayer from 'react-player';
import { PlayCircleIcon } from 'lucide-react';
import { useAppContext } from '../context/AppContext.jsx';

const TrailerSection = () => {
  const { trailers } = useAppContext(); // ✅ Remove fetchPopularTrailers - it's called automatically in context
  const [currentTrailer, setCurrentTrailer] = useState(null);

  // Set the first trailer as current when trailers are loaded
  useEffect(() => {
    if (trailers && trailers.length > 0 && !currentTrailer) {
      setCurrentTrailer(trailers[0]);
    }
  }, [trailers, currentTrailer]);

  // ✅ ADDED: Reset current trailer when trailers change
  useEffect(() => {
    if (trailers && trailers.length > 0) {
      setCurrentTrailer(trailers[0]);
    }
  }, [trailers]);

  // Handle case when no trailers are available
  if (!trailers || trailers.length === 0) {
    return (
      <div className='px-6 md:px-16 lg:px-24 xl:px-44 py-20 overflow-hidden'>
        <p className='text-gray-300 font-medium text-lg max-w-[960px] mx-auto'>Trailers</p>
        <div className='flex items-center justify-center h-64 text-gray-500'>
          <div className="animate-pulse">Loading trailers...</div>
        </div>
      </div>
    );
  }
   
  return (
    <div className='px-6 md:px-16 lg:px-24 xl:px-44 py-20 overflow-hidden'>
      <p className='text-gray-300 font-medium text-lg max-w-[960px] mx-auto'>Trailers</p>
      
      <div className='relative mt-6'>
        <BlurCircle top='-100px' right='-100px' />
        <div className="mx-auto w-full max-w-[960px] aspect-video">
          {currentTrailer && (
            <ReactPlayer
              key={currentTrailer.id}
              url={currentTrailer.videoUrl}
              controls
              playing={false}
              width="100%"
              height="100%"
              className="react-player"
            />
          )}
        </div>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mt-8 max-w-3xl mx-auto'>
        {trailers.map((trailer) => (
          <div
            key={trailer.id}
            className={`relative hover:-translate-y-1 duration-300 transition cursor-pointer h-40 md:h-60 group ${
              currentTrailer?.id === trailer.id ? 'ring-2 ring-primary' : ''
            }`} // ✅ ADDED: Visual indicator for current trailer
            onClick={() => setCurrentTrailer(trailer)}
          >
            <img
              src={trailer.image}
              alt={trailer.title || 'Trailer'}
              className='rounded-lg w-full h-full object-cover brightness-75'
              onError={(e) => {
                e.target.src = '/placeholder-trailer.jpg';
              }}
            />
            <PlayCircleIcon
              strokeWidth={1.6}
              className='absolute top-1/2 left-1/2 w-8 h-8 md:w-12 md:h-12 transform -translate-x-1/2 -translate-y-1/2'
            />
            <div className='absolute bottom-2 left-2 right-2'>
              <p className='text-white text-xs font-medium truncate bg-black/50 px-2 py-1 rounded'>
                {trailer.title}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrailerSection;
