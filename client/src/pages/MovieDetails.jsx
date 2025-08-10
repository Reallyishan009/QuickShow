import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dummyDateTimeData, dummyShowsData } from '../assets/assets';
import BlurCircle from '../components/BlurCircle';
import { Heart, PlayCircleIcon, StarIcon } from 'lucide-react';
import timeFormat from '../lib/timeFormat';
import DateSelect from '../components/DateSelect';
import MovieCard from '../components/MovieCard';
import Loading from '../components/Loading';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const MovieDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [dateTime, setDateTime] = useState({});
  
  const { shows, axios, getToken, user, fetchFavouriteMovies, favouriteMovies, image_base_url } = useAppContext();

  // Check if movie is in favorites
  useEffect(() => {
    if (favouriteMovies && id && show) {
      const isMovieInFavorites = favouriteMovies.some(movie => 
        String(movie._id) === String(show._id) || 
        String(movie.id) === String(show._id) ||
        String(movie._id) === String(id) ||
        String(movie.id) === String(id)
      );
      setIsFavorite(isMovieInFavorites);
    }
  }, [favouriteMovies, id, show]);

  const getShow = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      
      const response = await axios.get(`/api/show/${id}`, {
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      if (response.data.success && response.data.movie) {
        setShow(response.data.movie);
        // Set dateTime from API response
        setDateTime(response.data.dateTime || {});
      } else {
        toast.error('Failed to load movie details');
      }

    } catch (error) {
      console.error('Error fetching show:', error);
      toast.error('Failed to load movie details');
    } finally {
      setLoading(false);
    }
  };

  const handleFavourite = async () => {
    try {
      if (!user) {
      toast.error('Please log in to add to favourites');
        }
      const response = await axios.post(
        '/api/user/update-favorites',
        { movieId: id },
        { 
          headers: { 
            Authorization: `Bearer ${await getToken()}`
          }
        }
      );
      
      if (data.success) {
        await fetchFavouriteMovies();
        toast.success(data.message)
      } else {
        toast.error('Failed to update favorites');
      }
      setIsFavorite(true);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    if (id) {
      getShow();
    }
  }, [id]);

  if (loading) {
    return <Loading />;
  }

  if (!show) {
    return (
      <div className='flex flex-col items-center justify-center h-screen space-y-4'>
        <div className='text-6xl'>🎬</div>
        <h2 className='text-2xl font-bold'>Movie Not Found</h2>
        <p className='text-gray-500'>The movie you're looking for doesn't exist or has been removed.</p>
        <button 
          onClick={() => navigate('/movies')}
          className='px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors'
        >
          Browse Movies
        </button>
      </div>
    );
  }

  return (
    <div className='px-6 md:px-16 lg:px-40 pt-30 md:pt-50'>
      <div className='flex flex-col md:flex-row gap-8 max-w-6xl mx-auto'>
        <img 
          src={image_base_url + show.poster_path} 
          alt={show.title} 
          className='max-md:mx-auto rounded-xl h-104 max-w-70 object-cover'
          onError={(e) => {
            e.target.src = '/placeholder-poster.jpg';
          }}
        />

        <div className='relative flex flex-col gap-3'>
          <BlurCircle top='-100px' left='-100px'/>
          <p className='text-primary'>English</p>
          <h1 className='text-4xl font-semibold max-w-96 text-balance'>
            {show.title || 'Unknown Movie'}
          </h1>
          <div className='flex items-center gap-2 text-gray-300'>
            <StarIcon className='w-5 h-5 text-primary fill-primary' />
            {show.vote_average?.toFixed(1) || 'N/A'} User Rating
          </div>

          <p className='text-gray-400 mt-2 text-sm leading-tight max-w-xl'>
            {show.overview || 'No description available'}
          </p>
          <p>
            {show.runtime ? timeFormat(show.runtime) : 'N/A'} · {' '}
            {show.genres?.map(genre => genre.name).join(', ') || 'Unknown'} · {' '}
            {show.release_date?.split("-")[0] || 'Unknown'}
          </p>
          <div className='flex items-center flex-wrap gap-4 mt-4'>
            <button className='flex items-center gap-2 px-7 py-3 text-sm bg-gray-800 hover:bg-gray-900 transition rounded-md font-medium cursor-pointer active:scale-95'>
              <PlayCircleIcon className='w-5 h-5'/>
              Watch Trailer
            </button>

            <a href='#dateSelect' className='px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer'>
              Buy Tickets
            </a>
            
            <button 
              onClick={handleFavourite} 
              disabled={!show || !show._id}
              className={`p-2.5 rounded-full transition cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                isFavorite 
                  ? 'bg-primary/20 hover:bg-primary/30' 
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <Heart 
                className={`w-5 h-5 transition-colors ${
                      favouriteMovies.find(movie=> movie._id===id)
                    ? 'fill-primary text-primary' 
                    : 'text-gray-300 hover:text-primary'
                }`} 
              />
            </button>
          </div>
        </div>
      </div>

      <p className='text-lg font-medium mt-20'>Your Favourite Cast</p>
      <div className='overflow-x-auto no-scrollbar mt-8 pb-4'>
        <div className='flex items-center gap-4 w-max px-4'> 
          {show.casts && show.casts.length > 0 ? (
            show.casts.slice(0, 12).map((cast, index) => (
              <div key={index} className='flex flex-col items-center text-center'>
                <img 
                  src={image_base_url + cast.profile_path} 
                  alt={cast.name} 
                  className='rounded-full h-20 md:h-20 aspect-square object-cover'
                  onError={(e) => {
                    e.target.src = '/placeholder-avatar.jpg';
                  }}
                />
                <p className='font-medium text-xs mt-2'>{cast.name}</p>
              </div>
            ))
          ) : (
            <p className='text-gray-500'>Cast information not available</p>
          )}
        </div>
      </div>

      {/* Fixed DateSelect section */}
      <div id="dateSelect">
        <DateSelect 
          dateTime={dateTime}
          showId={id} 
        />
      </div>

      <p className='text-lg font-medium mt-20 mb-8'>
        You May Also Like
      </p>
      <div className='flex flex-wrap max-sm:justify-center gap-8'>
        {shows && shows.length > 0 ? (
          shows.slice(0, 4).map((movie, index) => (
            <MovieCard key={movie.id || movie._id || index} movie={movie} />
          ))
        ) : (
          <p className='text-gray-500'>No recommendations available</p>
        )}
      </div>
      <div className='flex justify-center mt-20'>
        <button 
          onClick={() => {
            navigate('/movies'); 
            window.scrollTo(0, 0);
          }} 
          className='px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer'
        >
          Show More
        </button>
      </div>
    </div>
  );
};

export default MovieDetails;
