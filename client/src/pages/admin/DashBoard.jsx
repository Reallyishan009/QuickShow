import { ChartLineIcon, CircleDollarSignIcon, PlayCircleIcon, StarIcon, UserIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { dummyDashboardData } from '../../assets/assets';
import Title from '../../components/admin/Title';
import Loading from '../../components/Loading';
import BlurCircle from '../../components/BlurCircle';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const DashBoard = () => {
  const { axios, getToken, user, image_base_url } = useAppContext();
  const currency = import.meta.env.VITE_CURRENCY;

  const [dashboardData, setDashboardData] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    activeShows: [],
    totalUser: 0,
  });

  const [loading, setLoading] = useState(true);

  // Add safety check - this prevents the undefined error
  const safeData = dashboardData || {
    totalBookings: 0,
    totalRevenue: 0,
    activeShows: [],
    totalUser: 0,
  };

  const dashboardCards = [
    {title: 'Total Bookings', value: safeData.totalBookings || '0', icon: ChartLineIcon},
    {title: 'Total Revenue', value: (currency || '') + (safeData.totalRevenue || '0'), icon: CircleDollarSignIcon},
    {title: 'Active Shows', value: safeData.activeShows.length || '0', icon: PlayCircleIcon},
    {title: 'Total Users', value: safeData.totalUser || '0', icon: UserIcon},
  ];

  const fetchDashboardData = async () => {
  try {
    const token = await getToken();
    console.log('Fetching dashboard data...'); // Debug log
    
    const { data } = await axios.get('/api/admin/dashboard', {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });

    console.log('Dashboard API response:', data); // Debug log

    if (data.success) {
      // FIXED: Change from data.dashboardData to data.data
      if (data.data) {
        setDashboardData(data.data);
      } else {
        console.warn('data is undefined in API response');
        toast.error('Invalid data received from server');
      }
    } else {
      toast.error(data.message || 'Failed to fetch dashboard data');
    }
  } catch (error) {
    console.error('Dashboard fetch error:', error);
    toast.error('An error occurred while fetching dashboard data');
  } finally {
    setLoading(false);
  }
};


  useEffect(() => { 
    if (user) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const dateFormat = (dateTime) => {
    if (!dateTime) return 'Date not available';
    return new Date(dateTime).toLocaleDateString();
  };

  return !loading ? (
    <>
      <Title text1='Admin' text2='Dashboard'/>

      <div className='relative flex flex-wrap gap-4 mt-6'>
        <BlurCircle top='-100px' left='0' />
        <div className='flex flex-wrap gap-4 w-full'>
          {dashboardCards.map((card, index) => (
            <div key={index} className='flex items-center justify-between px-4 py-2 bg-primary/10 border border-primary/20 rounded-md flex-1 min-w-0 max-w-xs'>
              <div>
                <h1 className='text-sm'>{card.title}</h1>
                <p className='text-xl font-medium mt-1'>{card.value}</p>
              </div>
              <card.icon className='w-6 h-6'/>
            </div>
          ))}
        </div>
      </div>

      <p className='mt-10 text-lg font-medium'>Active Shows</p>

      <div className='relative flex flex-wrap gap-6 mt-4 max-w-5xl'>
        <BlurCircle top='-100px' left='0' />
        <div className='flex flex-wrap gap-4 w-full'>
          {safeData.activeShows && safeData.activeShows.length > 0 ? (
            safeData.activeShows.map((show, index) => (
              <div key={index} className='w-55 rounded-lg overflow-hidden h-full pb-3 bg-primary/10 border border-primary/20 hover:-translate-y-1 transition duration-300'>
                <img 
                  src={image_base_url + show.movie.poster_path} 
                  alt='' 
                  className='h-60 w-full object-cover'
                  onError={(e) => {
                    e.target.src = '/placeholder-poster.jpg';
                  }}
                />
                <p className='font-medium p-2 truncate'>{show.movie.title}</p>
                <div className='px-2'>
                  <p className='text-lg font-medium'>{currency} {show.showPrice}</p>
                  <p className='flex items-center gap-1 text-sm text-gray-400 mt-1'>
                    <StarIcon className='w-4 h-4 text-primary fill-primary'/>
                    {show.movie.vote_average.toFixed(1)}
                  </p>
                </div>
                <p className='px-2 pt-2 text-sm text-gray-500'>{dateFormat(show.showDateTime)}</p>
              </div>
            ))
          ) : (
            <div className='w-full text-center py-8'>
              <p className='text-gray-500'>No active shows found</p>
            </div>
          )}
        </div>
      </div>
    </>
  ) : <Loading/>;
};

export default DashBoard;
