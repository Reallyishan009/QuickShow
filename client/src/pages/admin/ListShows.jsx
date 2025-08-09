import React from 'react';
import { useEffect, useState } from 'react';
import { dummyShowsData } from '../../assets/assets';
import Loading from '../../components/Loading';
import Title from '../../components/admin/Title';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const ListShows = () => {
  const currency = import.meta.env.VITE_CURRENCY;
  const { axios, getToken, user, image_base_url } = useAppContext();

  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAllShows = async () => {
    try {
      const token = await getToken();
      console.log('Fetching all shows...'); // Debug log
      
      const { data } = await axios.get('/api/admin/shows', { // Changed endpoint
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }); 
      
      console.log('Shows API response:', data); // Debug log
      
      if (data.success) {
        setShows(data.shows || []);
        toast.success('Shows loaded successfully');
      } else {
        toast.error(data.message || 'Failed to fetch shows');
      }
    } catch (error) {
      console.error('Error fetching shows:', error);
      
      if (error.response) {
        console.error('Error status:', error.response.status);
        console.error('Error data:', error.response.data);
        toast.error(`Failed to load shows: ${error.response.status} - ${error.response.data?.message || 'Server error'}`);
      } else if (error.request) {
        toast.error('Network error - please check your connection');
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      getAllShows();
    } else {
      setLoading(false);
    }
  }, [user]);

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'N/A';
    return new Date(dateTime).toLocaleString();
  };

  const calculateEarnings = (occupiedSeats, showPrice) => {
    if (!occupiedSeats || !showPrice) return 0;
    const seatCount = typeof occupiedSeats === 'object' ? Object.keys(occupiedSeats).length : 0;
    return seatCount * showPrice;
  };

  return !loading ? (
    <>
      <Title text1='List' text2='Shows'/>
      <div className='max-w-4xl mt-6 overflow-x-auto'>
        {shows && shows.length > 0 ? (
          <table className='w-full border-collapse rounded-md overflow-hidden text-nowrap'>
            <thead>
              <tr className='bg-primary/20 text-left text-white'>
                <th className='p-2 font-medium pl-5'>Movie Name</th>
                <th className='p-2 font-medium'>Show Time</th>
                <th className='p-2 font-medium'>Total Bookings</th>
                <th className='p-2 font-medium'>Earnings</th>
              </tr>
            </thead>
            <tbody className='text-sm font-light'>
              {shows.map((show, index) => (
                <tr key={show.id || index} className='border-b border-primary/10 bg-primary/5 even:bg-primary/10'>
                  <td className='p-2 min-w-45 pl-5'>{show.movie?.title || 'Unknown Movie'}</td>
                  <td className='p-2'>{formatDateTime(show.showDateTime)}</td>
                  <td className='p-2'>{show.occupiedSeats ? Object.keys(show.occupiedSeats).length : 0}</td>
                  <td className='p-2'>{currency} {calculateEarnings(show.occupiedSeats, show.showPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className='text-center py-8'>
            <p className='text-gray-500'>No shows found</p>
          </div>
        )}
      </div>
    </>
  ) : <Loading/>;
};

export default ListShows;
