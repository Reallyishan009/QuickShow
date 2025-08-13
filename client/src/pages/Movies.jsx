import React from 'react'
import MovieCard from '../components/MovieCard.jsx'
import BlurCircle from '../components/BlurCircle.jsx'
import MovieSections from '../components/MovieSections.jsx'
import { useAppContext } from '../context/AppContext.jsx'

const Movies = () => {

  const { shows } = useAppContext()

  return (
    <div className='relative my-40 mb-60 overflow-hidden min-h-[80vh]'>
      <BlurCircle top="150px" left="0px"/>
      <BlurCircle bottom="50px" right="50px"/>

      {/* Now Showing Section - Your Database Movies */}
      <div className='px-6 md:px-16 lg:px-40 xl:px-44 mb-16'>
        <h1 className='text-2xl font-bold text-white my-6 flex items-center gap-3'>
          <span className='w-1 h-8 bg-primary rounded'></span>
          Now Showing in Theaters
        </h1>
        
        {shows.length > 0 ? (
          <div className='flex flex-wrap max-sm:justify-center gap-8'>
            {shows.map((movie)=> (
              <MovieCard movie={movie} key={movie._id}/>
            ))}
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center py-20'>
            <h2 className='text-xl font-medium text-gray-400 text-center'>No movies currently showing</h2>
            <p className='text-gray-500 text-center mt-2'>Check back soon for new releases!</p>
          </div>
        )}
      </div>

      {/* IMDB-Style Movie Sections */}
      <MovieSections />
    </div>
  )
}

export default Movies
