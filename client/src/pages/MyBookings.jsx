// pages/MyBookings.jsx
import React, { useEffect, useState } from 'react';
import BlurCircle from '../components/BlurCircle';
import Loading from '../components/Loading';
import timeFormat from '../lib/timeFormat';
import { dateFormat } from '../lib/dateFormat';
import { useAppContext } from '../context/AppContext';
import { Link } from 'react-router-dom';

const MyBookings = () => {
  const currency = import.meta.env.VITE_CURRENCY;
  const { axios, getToken, user, image_base_url } = useAppContext();

  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getMyBookings = async () => {
  console.log("[getMyBookings] Starting booking fetch process");
  setIsLoading(true);
  
  try {
    const token = await getToken();
    console.log("[getMyBookings] Auth token obtained:", !!token);
    console.log("[getMyBookings] Token length:", token ? token.length : 0);

    console.log("[getMyBookings] Making API request to /api/user/bookings");
    const startTime = Date.now();
    
    const { data } = await axios.get("/api/user/bookings", {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 30000,
    });
    
    const endTime = Date.now();
    console.log(`[getMyBookings] API request completed in ${endTime - startTime}ms`);
    console.log("[getMyBookings] Full API response:", data);

    if (data && data.success) {
      console.log(`[getMyBookings] Success: ${data.bookings ? data.bookings.length : 'no bookings array'} bookings`);
      if (data.bookings && data.bookings.length > 0) {
        console.log("[getMyBookings] First booking sample:", data.bookings[0]);
      }
      setBookings(data.bookings || []);
    } else {
      console.warn("[getMyBookings] API returned success:false or no success field");
      setBookings([]);
    }
  } catch (error) {
    console.error("[getMyBookings] Error details:", {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status
    });
    setBookings([]);
  } finally {
    console.log("[getMyBookings] Setting loading to false");
    setIsLoading(false);
  }
};

  // Fetch bookings when user logs in or changes
  useEffect(() => {
    if (user) {
      console.log("[MyBookings] User detected, fetching bookings");
      getMyBookings();
    } else {
      console.log("[MyBookings] No user signed in");
      setBookings([]);
      setIsLoading(false);
    }
  }, [user]);

  if (isLoading) return <Loading />;

  return (
    <div className="relative px-6 md:px-16 lg:px-40 pt-30 md:pt-40 min-h-[80vh]">
      <BlurCircle top="100px" left="100px" />
      <BlurCircle bottom="0px" left="600px" />
      <h1 className="text-lg font-semibold mb-4">My Bookings</h1>

      {bookings.length === 0 && (
        <p className="text-center mt-6 text-gray-400">You have no bookings yet.</p>
      )}

      {bookings.map((item) => (
        <div 
          key={item._id || item.id} 
          className='flex flex-col md:flex-row justify-between bg-primary/8 border border-primary/20 rounded-lg mt-4 p-2 max-w-3xl'
        >
          <div className='flex flex-col md:flex-row'>
            <img
              src={image_base_url + item.show.movie.poster_path}
              alt={item.show.movie.title}
              className="md:max-w-[180px] aspect-video h-auto object-cover object-bottom rounded"
              onError={(e) => { e.target.src = '/placeholder-poster.jpg'; }}
            />
            <div className="flex flex-col p-4">
              <p className="text-lg font-semibold">{item.show.movie.title}</p>
              <p className="text-gray-400 text-sm">{timeFormat(item.show.movie.runtime)}</p>
              <p className="text-gray-400 text-sm mt-auto">{dateFormat(item.show.showDateTime)}</p>
            </div>
          </div>

          <div className='flex flex-col md:items-end md:text-right justify-between p-4'>
            <div className='flex items-center gap-4'>
              <p className='text-2xl font-semibold mb-3'>{currency}{item.amount}</p>
              {!item.isPaid && 
                <Link to={item.paymentLink} className='bg-primary px-4 py-1.5 mb-3 text-sm rounded-full font-medium cursor-pointer hover:bg-primary-dull transition'>
                  Pay Now
                </Link>
              }
            </div>
            <div className='text-sm'>
              <p><span className='text-gray-400'>Total Tickets:</span> {item.bookedSeats.length}</p>
              <p><span className='text-gray-400'>Seat Number:</span> {item.bookedSeats.join(", ")}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MyBookings;
