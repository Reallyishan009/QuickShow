import React from 'react';
import { dummyBookingData } from '../../assets/assets';
import { useEffect, useState } from 'react';
import Title from '../../components/admin/Title';
import Loading from '../../components/Loading';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const ListBookings = () => {
  const currency = import.meta.env.VITE_CURRENCY;
  const { axios, getToken, user, image_base_url } = useAppContext();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAllBookings = async () => {
    try {
      const token = await getToken(); // Fixed: Resolve token first
      console.log('Fetching all bookings...');
      
      const { data } = await axios.get('/api/admin/bookings', {
        headers: {
          Authorization: `Bearer ${token}` // Fixed: Use resolved token
        }
      });
      
      console.log('Bookings API response:', data);
      
      if (data.success) {
        setBookings(data.bookings || []);
        toast.success('Bookings loaded successfully');
      } else {
        toast.error(data.message || 'Failed to fetch bookings');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      
      if (error.response) {
        console.error('Error status:', error.response.status);
        console.error('Error data:', error.response.data);
        toast.error(`Failed to load bookings: ${error.response.status}`);
      } else if (error.request) {
        toast.error('Network error - please check your connection');
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setLoading(false); // Fixed: Move to finally block
    }
  };

  const dateFormat = (dateTime) => {
    if (!dateTime) return 'N/A';
    return new Date(dateTime).toLocaleDateString();
  };

  const formatSeats = (bookedSeats) => {
    if (!bookedSeats || typeof bookedSeats !== 'object') return 'N/A';
    
    // Handle both array and object formats
    if (Array.isArray(bookedSeats)) {
      return bookedSeats.join(', ');
    } else {
      return Object.keys(bookedSeats).map(seat => bookedSeats[seat]).join(', ');
    }
  };

  useEffect(() => {
    if (user) {
      getAllBookings();
    } else {
      setLoading(false);
    }
  }, [user]);

  return !loading ? (
    <>
      <Title text1='List' text2='Bookings'/>
      <div className='max-w-4xl mt-6 overflow-x-auto'>
        {bookings && bookings.length > 0 ? (
          <table className='w-full border-collapse rounded-md overflow-hidden text-nowrap'>
            <thead>
              <tr className='bg-primary/20 text-left text-white'>
                <th className='p-2 font-medium pl-5'>User Name</th>
                <th className='p-2 font-medium'>Movie Name</th>
                <th className='p-2 font-medium'>Show Time</th>
                <th className='p-2 font-medium'>Seats</th>
                <th className='p-2 font-medium'>Amount</th>
              </tr>
            </thead>
            <tbody className='text-sm font-light'>
              {bookings.map((item, index) => (
                <tr key={item.id || index} className='border-b border-primary/10 bg-primary/5 even:bg-primary/10'>
                  <td className='p-2 min-w-45 pl-5'>{item.user?.name || 'Unknown User'}</td>
                  <td className='p-2'>{item.show?.movie?.title || 'Unknown Movie'}</td>
                  <td className='p-2'>{dateFormat(item.show?.showDateTime)}</td>
                  <td className='p-2'>{formatSeats(item.bookedSeats)}</td>
                  <td className='p-2'>{currency} {item.amount || '0'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className='text-center py-8'>
            <p className='text-gray-500'>No bookings found</p>
          </div>
        )}
      </div>
    </>
  ) : <Loading/>;
};

export default ListBookings;
