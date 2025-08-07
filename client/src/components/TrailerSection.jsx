import React, { useState } from 'react';
import { dummyTrailers } from '../assets/assets';
import BlurCircle from './BlurCircle';
import ReactPlayer from 'react-player';
import { PlayCircleIcon } from 'lucide-react';

const TrailerSection = () => {
  const [currentTrailer, setCurrentTrailer] = useState(dummyTrailers[0]);
   
  return (
    <div className='px-6 md:px-16 lg:px-24 xl:px-44 py-20 overflow-hidden'>
      <p className='text-gray-300 font-medium text-lg max-w-[960px] mx-auto'>Trailers</p>
      
      <div className='relative mt-6'>
        <BlurCircle top='-100px' right='-100px' />
        <div className="mx-auto w-full max-w-[960px] aspect-video">
          <ReactPlayer
            key={currentTrailer.id}
            url={currentTrailer.videoUrl}
            controls
            playing={false}    // Set to true if you want autoplay on change
            width="100%"
            height="100%"
            className="react-player"
          />
        </div>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mt-8 max-w-3xl mx-auto'>
        {dummyTrailers.map((trailer) => (
          <div
            key={trailer.id}
            className='relative opacity-100 hover:opacity-100 hover:-translate-y-1 duration-300 transition cursor-pointer h-40 md:h-60 group'
            onClick={() => setCurrentTrailer(trailer)}
          >
            <img
              src={trailer.image}
              alt={trailer.title || 'Trailer'}
              className='rounded-lg w-full h-full object-cover brightness-75'
            />
            <PlayCircleIcon
              strokeWidth={1.6}
              className='absolute top-1/2 left-1/2 w-8 h-8 md:w-12 md:h-12 transform -translate-x-1/2 -translate-y-1/2'
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrailerSection;
