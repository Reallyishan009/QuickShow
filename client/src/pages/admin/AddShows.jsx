import React, { useState, useEffect } from 'react';
import Title from '../../components/admin/Title';
import { StarIcon, CheckIcon, DeleteIcon } from 'lucide-react';
import { dummyShowsData } from '../../assets/assets';
import Loading from '../../components/Loading';
import { kConverter } from '../../lib/kconverter';
import { useAppContext } from '../../context/AppContext.jsx';
import toast from 'react-hot-toast';

const AddShows = () => {
  const { axios, getToken, user, image_base_url } = useAppContext();
  const currency = import.meta.env.VITE_CURRENCY;
  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [dateTimeSelection, setDateTimeSelection] = useState({});
  const [dateTimeInput, setDateTimeInput] = useState('');
  const [showPrice, setShowPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch now playing movies
  const fetchNowPlayingMovies = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get('/api/show/now-playing', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (data.success) {
        setNowPlayingMovies(data.movies);
      }
    } catch (error) {
      console.error('Error fetching now playing movies:', error);
      toast.error('Failed to fetch movies');
    }
  };

  useEffect(() => {
    fetchNowPlayingMovies();
  }, []);

  // Validate if selected date-time is in the future
  const isValidDateTime = (dateTime) => {
    const now = new Date();
    const selected = new Date(dateTime);
    return selected > now;
  };

  // Add date and time to selection (avoid duplicates) - FIXED: Remove toast from state setter
  const handleDateTimeAdd = () => {
    if (!dateTimeInput) {
      toast.error('Please select a date and time');
      return;
    }

    if (!isValidDateTime(dateTimeInput)) {
      toast.error('Please select a future date and time');
      return;
    }

    const [date, time] = dateTimeInput.split('T');
    if (!date || !time) return;

    setDateTimeSelection((prev) => {
      const times = prev[date] || [];
      if (!times.includes(time)) {
        // Don't call toast here - it causes render issues
        return { ...prev, [date]: [...times, time] };
      } else {
        // Don't call toast here either
        return prev;
      }
    });

    // Call toast AFTER state update, not inside it
    const times = dateTimeSelection[date] || [];
    if (!times.includes(time)) {
      toast.success('Show time added successfully!');
    } else {
      toast.error('This time slot is already added');
    }

    setDateTimeInput(''); // Clear input after adding
  };

  // Remove specific time from date, remove date if no times left - FIXED: Remove toast from state setter
  const handleRemoveTime = (date, time) => {
    setDateTimeSelection((prev) => {
      const filteredTimes = prev[date].filter((t) => t !== time);
      if (filteredTimes.length === 0) {
        const { [date]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [date]: filteredTimes };
    });

    // Call toast AFTER state update
    toast.success('Show time removed');
  };

  // Handle form submission - FIXED: Backend expects different data structure
  const handleSubmit = async () => {
    // Validation
    if (!selectedMovie) {
      toast.error('Please select a movie');
      return;
    }
    if (!showPrice || showPrice <= 0) {
      toast.error('Please enter a valid show price');
      return;
    }
    if (Object.keys(dateTimeSelection).length === 0) {
      toast.error('Please add at least one show time');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Get the selected movie details
      const selectedMovieData = nowPlayingMovies.find(movie => movie.id === selectedMovie);
      
      // Convert to the format your backend expects based on the error message
      // Backend seems to expect each show to have 'time' as an array
      const showsArray = [];
      Object.entries(dateTimeSelection).forEach(([date, times]) => {
        showsArray.push({
          date: date,
          time: times, // Keep as array since backend does time.forEach
          datetime: times.map(time => `${date}T${time}`) // Array of full datetime strings
        });
      });

      const payload = {
        movieId: selectedMovie,
        movieTitle: selectedMovieData?.title,
        moviePoster: selectedMovieData?.poster_path,
        showsInput: showsArray,
        showPrice: Number(showPrice),
        createdBy: user?.id || user?._id,
        status: 'active',
        theater: "Default Theater",
        totalShows: Object.values(dateTimeSelection).flat().length
      };

      console.log('=== DEBUG INFO ===');
      console.log('Date-time selection object:', dateTimeSelection);
      console.log('Converted shows array:', showsArray);
      console.log('Final payload being sent:', JSON.stringify(payload, null, 2));

      const token = await getToken();
      console.log('Token exists:', !!token);

      const response = await axios.post('/api/show/add', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Full server response:', response);
      console.log('Response data:', response.data);

      if (response.data && response.data.success) {
        // Reset form
        setSelectedMovie(null);
        setShowPrice('');
        setDateTimeSelection({});
        
        // Show success toast
        toast.success('🎉 Show added successfully!', {
          duration: 4000,
        });
        
        console.log('Show added successfully to database');
      } else {
        const errorMessage = response.data?.message || 'Failed to add show - Unknown error';
        toast.error(`❌ ${errorMessage}`);
        console.error('Server returned error:', response.data);
      }
    } catch (error) {
      console.error('=== ERROR DETAILS ===');
      console.error('Full error object:', error);
      
      if (error.response) {
        console.error('Error status:', error.response.status);
        console.error('Error data:', error.response.data);
        console.error('Error headers:', error.response.headers);
        
        const errorMessage = error.response.data?.message || `Server error (${error.response.status})`;
        toast.error(`❌ Failed to add show: ${errorMessage}`);
      } else if (error.request) {
        console.error('No response received:', error.request);
        toast.error('❌ Network error - please check your connection');
      } else {
        console.error('Request setup error:', error.message);
        toast.error('❌ An unexpected error occurred');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if form is valid for submission
  const isFormValid = selectedMovie && showPrice > 0 && Object.keys(dateTimeSelection).length > 0;

  return nowPlayingMovies.length > 0 ? (
    <>
      <Title text1="Add" text2="Shows" />
      <p className="mt-10 text-lg font-medium">Select a movie to add a show</p>

      <div className="overflow-x-auto mt-4">
        <div className="group flex flex-wrap gap-4 mt-4 w-max">
          {nowPlayingMovies.map((movie) => (
            <div
              key={movie.id}
              className={`relative max-w-40 cursor-pointer group-hover:not-hover:opacity-40 hover:translate-y-1 transition duration-300 ${
                selectedMovie === movie.id ? 'opacity-100 ring-2 ring-primary' : 'opacity-80'
              }`}
              onClick={() => {
                setSelectedMovie(movie.id);
                toast.success(`✅ Selected: ${movie.title}`, { duration: 2000 });
              }}
            >
              <div className="relative rounded-lg overflow-hidden">
                <img
                  src={image_base_url + movie.poster_path}
                  alt={movie.title}
                  className="w-full object-cover brightness-90"
                  onError={(e) => {
                    e.target.src = '/placeholder-poster.jpg';
                  }}
                />
                <div className="text-sm flex items-center justify-between p-2 bg-black/70 w-full absolute bottom-0 left-0">
                  <p className="flex items-center gap-1 text-gray-400">
                    <StarIcon className="w-4 h-4 text-primary fill-primary" />
                    {movie.vote_average?.toFixed(1) || 'N/A'}
                  </p>
                  <p className="text-gray-300">{kConverter(movie.vote_count || 0)} Votes</p>
                </div>
              </div>
              {selectedMovie === movie.id && (
                <div className="absolute top-2 right-2 flex items-center justify-center bg-primary h-6 w-6 rounded">
                  <CheckIcon className="w-4 h-4 text-white" strokeWidth={2.5} />
                </div>
              )}
              <p className="font-medium truncate mt-1">{movie.title}</p>
              <p className="text-gray-400 text-sm">{movie.release_date}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Show price input */}
      <div className="mt-8 max-w-xs">
        <label className="block text-sm font-medium mb-2">Show Price *</label>
        <div className="inline-flex items-center gap-2 border border-gray-600 rounded-md px-3 py-2">
          <p className="text-gray-400 text-sm">{currency}</p>
          <input
            min={0}
            step="0.01"
            type="number"
            value={showPrice}
            onChange={(e) => setShowPrice(e.target.value)}
            placeholder="Enter show price"
            className="outline-none bg-transparent"
          />
        </div>
      </div>

      {/* Date/time input */}
      <div className="mt-8 max-w-xs">
        <label className="block text-sm font-medium mb-2">Show Date & Time *</label>
        <div className="inline-flex gap-5 border border-gray-600 rounded-md p-1 pl-3 rounded-lg">
          <input
            type="datetime-local"
            value={dateTimeInput}
            onChange={(e) => setDateTimeInput(e.target.value)}
            className="outline-none rounded-md bg-transparent"
            min={new Date().toISOString().slice(0, 16)}
          />
          <button
            type="button"
            className="bg-primary/80 text-white px-3 py-2 text-sm rounded-lg hover:bg-primary cursor-pointer disabled:opacity-50"
            onClick={handleDateTimeAdd}
            disabled={!dateTimeInput}
          >
            Add Time
          </button>
        </div>
      </div>

      {/* Display selected times */}
      {Object.keys(dateTimeSelection).length > 0 && (
        <div className='mt-6 max-w-md'>
          <h2 className='mb-3 font-medium'>Selected Show Times:</h2>
          <ul className='space-y-3'>
            {Object.entries(dateTimeSelection).map(([date, times]) => (
              <li key={date}>
                <div className='font-medium text-sm text-gray-600 mb-1'>
                  {new Date(date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
                <div className='flex flex-wrap gap-2 text-sm'>
                  {times.map((time) => (
                    <div key={time} className='border border-primary px-3 py-1 flex items-center rounded-md bg-primary/5'>
                      <span className='text-primary font-medium'>
                        {new Date(`${date}T${time}`).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </span>
                      <DeleteIcon 
                        onClick={() => handleRemoveTime(date, time)} 
                        width={16} 
                        className='ml-2 text-red-500 hover:text-red-700 cursor-pointer transition-colors' 
                      />
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Submit button */}
      <button 
        onClick={handleSubmit}
        disabled={!isFormValid || isSubmitting}
        className='bg-primary text-white px-8 py-3 mt-8 rounded-lg hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-medium'
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
            Adding Show...
          </span>
        ) : (
          'Add Show'
        )}
      </button>

      {/* Form validation feedback */}
      {!isFormValid && (
        <div className="mt-4 text-sm text-gray-500">
          <p>Please complete all required fields:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            {!selectedMovie && <li>Select a movie</li>}
            {(!showPrice || showPrice <= 0) && <li>Enter a valid show price</li>}
            {Object.keys(dateTimeSelection).length === 0 && <li>Add at least one show time</li>}
          </ul>
        </div>
      )}
    </>
  ) : (
    <Loading />
  );
};

export default AddShows;
