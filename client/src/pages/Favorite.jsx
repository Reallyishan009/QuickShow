import React from 'react';
import { dummyShowsData } from '../assets/assets';
import MovieCard from '../components/MovieCard';
import BlurCircle from '../components/BlurCircle';
import { useAppContext } from '../context/AppContext';
import Loading from '../components/Loading';

const Favorite = () => {
  const { favouriteMovies, user } = useAppContext(); // Fixed: Use favouriteMovies (with 'u')
  
  // Show loading if user exists but favouriteMovies is still loading
  if (user && !favouriteMovies) {
    return <Loading />;
  }

  return favouriteMovies && favouriteMovies.length > 0 ? (
    <div className='relative my-40 mb-60 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]'>
      <BlurCircle top='150px' left='0px' />
      <BlurCircle bottom='50px' right='50px' />

      <h1 className='text-lg font-medium my-4'>
        Your Favorite Movies ({favouriteMovies.length})
      </h1>
      <div className='flex flex-wrap max-sm:justify-center gap-8'>
        {favouriteMovies.map((movie) => (
          <MovieCard movie={movie} key={movie._id || movie.id} />
        ))}
      </div>
    </div>
  ) : (
    <div className='flex flex-col items-center justify-center h-screen'>
      <div className='text-center space-y-4'>
        <div className='text-6xl mb-4'>💔</div>
        <h1 className='text-3xl font-bold text-center'>No Favorite Movies Yet</h1>
        <p className='text-gray-400 mt-2'>Start adding movies to your favorites!</p>
        <div className='mt-6'>
          <a 
            href='/' 
            className='bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-all inline-block'
          >
            Browse Movies
          </a>
        </div>
      </div>
    </div>
  );
};

export default Favorite;
