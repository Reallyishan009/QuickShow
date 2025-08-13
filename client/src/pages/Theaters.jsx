import React, { useState, useEffect } from 'react'
import { MapPin, Clock, Star, Phone, Navigation, Filter } from 'lucide-react'
import BlurCircle from '../components/BlurCircle.jsx'
import axios from 'axios'

const Theaters = () => {
  const [theaters, setTheaters] = useState([])
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCity, setSelectedCity] = useState('Mumbai')
  const image_base_url = import.meta.env.VITE_TMDB_IMAGE_BASE_URL

  // Dummy theater data for Indian cities
  const theaterData = {
    Mumbai: [
      {
        id: 1,
        name: "PVR Phoenix Mills",
        address: "High Street Phoenix, Lower Parel, Mumbai",
        distance: "2.3 km",
        phone: "+91 22 6671 7777",
        rating: 4.2,
        screens: 8,
        facilities: ["IMAX", "4DX", "Dolby Atmos", "Recliner Seats"],
        showtimes: ["10:00 AM", "1:30 PM", "5:00 PM", "8:30 PM", "11:45 PM"]
      },
      {
        id: 2,
        name: "INOX Megaplex",
        address: "R City Mall, Ghatkopar West, Mumbai",
        distance: "5.7 km",
        phone: "+91 22 6671 8888",
        rating: 4.0,
        screens: 12,
        facilities: ["IMAX", "Dolby Atmos", "Premium Seats"],
        showtimes: ["9:45 AM", "1:15 PM", "4:45 PM", "8:15 PM", "11:30 PM"]
      },
      {
        id: 3,
        name: "Cinepolis Fun Republic",
        address: "Fun Republic Mall, Andheri West, Mumbai",
        distance: "8.1 km",
        phone: "+91 22 6671 9999",
        rating: 4.3,
        screens: 10,
        facilities: ["4DX", "VIP Lounge", "Dolby Atmos"],
        showtimes: ["10:30 AM", "2:00 PM", "5:30 PM", "9:00 PM"]
      }
    ],
    Delhi: [
      {
        id: 4,
        name: "PVR Select City Walk",
        address: "Select City Walk, Saket, New Delhi",
        distance: "3.2 km",
        phone: "+91 11 4166 7777",
        rating: 4.4,
        screens: 11,
        facilities: ["IMAX", "Director's Cut", "Dolby Atmos"],
        showtimes: ["10:15 AM", "1:45 PM", "5:15 PM", "8:45 PM", "12:00 AM"]
      },
      {
        id: 5,
        name: "INOX Nehru Place",
        address: "Nehru Place, New Delhi",
        distance: "6.8 km",
        phone: "+91 11 4166 8888",
        rating: 3.9,
        screens: 6,
        facilities: ["Dolby Atmos", "Premium Seats"],
        showtimes: ["11:00 AM", "2:30 PM", "6:00 PM", "9:30 PM"]
      }
    ],
    Bangalore: [
      {
        id: 6,
        name: "PVR Forum Mall",
        address: "Forum Mall, Koramangala, Bangalore",
        distance: "4.5 km",
        phone: "+91 80 4166 7777",
        rating: 4.1,
        screens: 9,
        facilities: ["IMAX", "Gold Class", "Dolby Atmos"],
        showtimes: ["10:00 AM", "1:30 PM", "5:00 PM", "8:30 PM"]
      }
    ]
  }

  const cities = ['Mumbai', 'Delhi', 'Bangalore']

  const fetchMovies = async () => {
    try {
      setLoading(true)
      const response = await axios.get(
        `https://api.themoviedb.org/3/movie/now_playing?api_key=${import.meta.env.VITE_TMDB_API_KEY || '6be9d0c3873af0899ce409eb2de46af2'}&page=1`
      )
      setMovies(response.data.results.slice(0, 6))
    } catch (error) {
      console.error('Error fetching movies:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setTheaters(theaterData[selectedCity] || [])
    fetchMovies()
  }, [selectedCity])

  const TheaterCard = ({ theater }) => (
    <div className='bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-colors'>
      <div className='flex justify-between items-start mb-4'>
        <div>
          <h3 className='text-xl font-bold text-white mb-2'>{theater.name}</h3>
          <div className='flex items-center gap-2 text-gray-400 mb-2'>
            <MapPin className='w-4 h-4' />
            <span className='text-sm'>{theater.address}</span>
          </div>
          <div className='flex items-center gap-4 text-sm text-gray-400'>
            <div className='flex items-center gap-1'>
              <Navigation className='w-4 h-4' />
              <span>{theater.distance}</span>
            </div>
            <div className='flex items-center gap-1'>
              <Phone className='w-4 h-4' />
              <span>{theater.phone}</span>
            </div>
          </div>
        </div>
        <div className='text-right'>
          <div className='flex items-center gap-1 mb-2'>
            <Star className='w-4 h-4 fill-yellow-400 text-yellow-400' />
            <span className='text-white font-medium'>{theater.rating}</span>
          </div>
          <p className='text-sm text-gray-400'>{theater.screens} Screens</p>
        </div>
      </div>

      {/* Facilities */}
      <div className='mb-4'>
        <div className='flex flex-wrap gap-2'>
          {theater.facilities.map((facility, index) => (
            <span key={index} className='px-3 py-1 bg-primary/20 text-primary text-xs rounded-full'>
              {facility}
            </span>
          ))}
        </div>
      </div>

      {/* Showtimes */}
      <div className='mb-4'>
        <h4 className='text-white font-medium mb-2 flex items-center gap-2'>
          <Clock className='w-4 h-4' />
          Show Times
        </h4>
        <div className='flex flex-wrap gap-2'>
          {theater.showtimes.map((time, index) => (
            <button key={index} className='px-3 py-1 bg-gray-700 hover:bg-primary text-white text-sm rounded transition-colors'>
              {time}
            </button>
          ))}
        </div>
      </div>

      {/* Movies showing */}
      <div>
        <h4 className='text-white font-medium mb-3'>Now Showing</h4>
        <div className='grid grid-cols-3 gap-3'>
          {movies.slice(0, 3).map((movie) => (
            <div key={movie.id} className='group cursor-pointer'>
              <img 
                src={`${image_base_url}${movie.poster_path}`}
                alt={movie.title}
                className='w-full h-24 object-cover rounded-lg group-hover:scale-105 transition-transform'
              />
              <p className='text-xs text-gray-300 mt-1 truncate'>{movie.title}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className='relative min-h-screen pt-32 pb-20 px-6 md:px-16 lg:px-40 xl:px-44'>
      <BlurCircle top="100px" left="0px"/>
      <BlurCircle bottom="200px" right="100px"/>
      
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-4xl font-bold text-white mb-4'>Theaters Near You(this is just for show)</h1>
        <p className='text-gray-400 text-lg'>(Actual booking will happen on Movies page [click through navbar])Find the best cinemas and book your favorite movies</p>
      </div>

      {/* City Filter */}
      <div className='mb-8'>
        <div className='flex items-center gap-4 mb-4'>
          <Filter className='w-5 h-5 text-primary' />
          <h2 className='text-xl font-semibold text-white'>Select City</h2>
        </div>
        <div className='flex gap-3'>
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-6 py-2 rounded-full font-medium transition-colors ${
                selectedCity === city 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Theaters List */}
      <div className='mb-8'>
        <h2 className='text-2xl font-bold text-white mb-6'>
          Theaters in {selectedCity} ({theaters.length})
        </h2>
        
        {loading ? (
          <div className='grid gap-6'>
            {[...Array(3)].map((_, index) => (
              <div key={index} className='animate-pulse bg-gray-800 rounded-xl p-6'>
                <div className='bg-gray-700 h-6 rounded mb-4 w-1/3'></div>
                <div className='bg-gray-700 h-4 rounded mb-2 w-2/3'></div>
                <div className='bg-gray-700 h-4 rounded mb-4 w-1/2'></div>
                <div className='bg-gray-700 h-20 rounded'></div>
              </div>
            ))}
          </div>
        ) : (
          <div className='grid gap-6'>
            {theaters.map((theater) => (
              <TheaterCard key={theater.id} theater={theater} />
            ))}
          </div>
        )}
      </div>

      {/* Featured Movies */}
      <div>
        <h2 className='text-2xl font-bold text-white mb-6'>Featured Movies</h2>
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4'>
          {movies.map((movie) => (
            <div key={movie.id} className='group cursor-pointer'>
              <div className='relative overflow-hidden rounded-lg'>
                <img 
                  src={`${image_base_url}${movie.poster_path}`}
                  alt={movie.title}
                  className='w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300'
                />
                <div className='absolute top-2 right-2 bg-black/70 text-white text-xs font-medium px-2 py-1 rounded flex items-center gap-1'>
                  <Star className='w-3 h-3 fill-yellow-400 text-yellow-400' />
                  {movie.vote_average.toFixed(1)}
                </div>
              </div>
              <h3 className='text-white font-medium mt-2 text-sm truncate'>{movie.title}</h3>
              <p className='text-gray-400 text-xs'>{new Date(movie.release_date).getFullYear()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Theaters