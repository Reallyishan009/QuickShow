import React, { useEffect, useState } from 'react'
import { dummyBookingData } from '../assets/assets'
import Loading from '../components/Loading.jsx'
import BlurCircle from '../components/BlurCircle.jsx'
import timeFormat from '../lib/timeFormat'
import { dateFormat } from '../lib/dateFormat'
import { useAppContext } from '../context/AppContext.jsx'
import { Link } from 'react-router-dom'

const MyBookings = () => {
  const currency = import.meta.env.VITE_CURRENCY

  const { axios, getToken, user, image_base_url} = useAppContext()

  const [bookings, setBookings] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const getMyBookings = async () =>{
    try {
      const {data} = await axios.get('/api/user/bookings', {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })
        if (data.success && data.bookings) {
          // Filter out any invalid bookings
          const validBookings = data.bookings.filter(booking => 
            booking && 
            booking.show && 
            booking.show.movie && 
            booking.bookedSeats
          )
          setBookings(validBookings)
        } else {
          setBookings([])
        }

    } catch (error) {
      console.error('Error fetching bookings:', error)
      setBookings([])
    }
    setIsLoading(false)
  }

  useEffect(()=>{
    if(user){
      getMyBookings()
    }
    
  },[user])


  return !isLoading ? (
    <div className='relative px-6 md:px-16 lg:px-40 pt-30 md:pt-40 min-h-[80vh]'>
      <BlurCircle top="100px" left="100px"/>
      <div>
        <BlurCircle bottom="0px" left="600px"/>
      </div>
      <h1 className='text-lg font-semibold mb-4'>My Bookings</h1>

      {bookings.filter(item => item && item.show && item.show.movie).map((item,index)=>(
        <div key={index} className='flex flex-col md:flex-row justify-between bg-primary/8 border border-primary/20 rounded-lg mt-4 p-2 max-w-3xl'>
          <div className='flex flex-col md:flex-row'>
            <img 
              src={item.show.movie.poster_path ? image_base_url + item.show.movie.poster_path : '/api/placeholder/300/450'} 
              alt={item.show.movie.title || 'Movie Poster'} 
              className='md:max-w-45 aspect-video h-auto object-cover object-bottom rounded'
            />
            <div className='flex flex-col p-4'>
              <p className='text-lg font-semibold'>{item.show.movie.title || 'Movie Title'}</p>
              <p className='text-gray-400 text-sm'>{item.show.movie.runtime ? timeFormat(item.show.movie.runtime) : 'Duration N/A'}</p>
              <p className='text-gray-400 text-sm mt-auto'>{item.show.showDateTime ? dateFormat(item.show.showDateTime) : 'Date N/A'}</p>
            </div>
          </div>

          <div className='flex flex-col md:items-end md:text-right justify-between p-4'>
            <div className='flex items-center gap-4'>
              <p className='text-2xl font-semibold mb-3'>{currency}{item.amount || 0}</p>
              {!item.isPaid && item.paymentLink && (
                <Link to={item.paymentLink} className='bg-primary px-4 py-1.5 mb-3 text-sm rounded-full font-medium cursor-pointer'>
                  Pay Now
                </Link>
              )}
            </div>
            <div className='text-sm'>
              <p><span className='text-gray-400'>Total Tickets:</span> {item.bookedSeats ? item.bookedSeats.length : 0}</p>
              <p><span className='text-gray-400'>Seat Number:</span> {item.bookedSeats ? item.bookedSeats.join(", ") : 'N/A'}</p>
            </div>
          </div>

        </div>
      ))}

      {bookings.length === 0 && (
        <div className='flex flex-col items-center justify-center py-20'>
          <h2 className='text-xl font-medium text-gray-400 text-center'>No bookings found</h2>
          <p className='text-gray-500 text-center mt-2'>Your movie bookings will appear here after you make a purchase.</p>
          <Link 
            to='/movies' 
            className='mt-4 px-6 py-2 bg-primary hover:bg-primary-dull text-white rounded-lg transition-colors'
          >
            Browse Movies
          </Link>
        </div>
      )}

    </div>
  ) : <Loading />
}

export default MyBookings
