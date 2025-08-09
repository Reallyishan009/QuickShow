import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dummyDateTimeData, dummyShowsData, assets } from '../assets/assets';
import { ArrowRightIcon, ClockIcon } from 'lucide-react';
import Loading from '../components/Loading';
import isoTimeFormat from '../lib/isoTimeFormat';
import BlurCircle from '../components/BlurCircle';
import toast from 'react-hot-toast';
import { useAppContext } from '../context/AppContext';

const SeatLayout = () => {
  // Seat rows grouped
  const groupRows = [['A', 'B'], ['C', 'D'], ['E', 'F'], ['G', 'H'], ['I', 'J']];

  // Route parameters
  const { id, date } = useParams();

  // State
  const [selectSeats, setSelectSeats] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [show, setShow] = useState(null);
  const [occupiedSeats, setOccupiedSeats] = useState([]);

  const navigate = useNavigate();
  const { axios, getToken, user } = useAppContext();

  // Render seats of a row
  const renderSeats = (row, count = 9) => (
    <div key={row} className="flex gap-2 mt-2">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {Array.from({ length: count }, (_, i) => {
          const seatId = `${row}${i + 1}`;
          const isSelected = selectSeats.includes(seatId);
          const isOccupied = occupiedSeats.includes(seatId);

          return (
            <button
              key={seatId}
              onClick={() => handleSeatClick(seatId)}
              disabled={isOccupied}
              className={`h-8 w-8 rounded border border-primary/60 cursor-pointer backdrop-blur-sm transition-colors duration-300 ${
                isOccupied
                  ? 'bg-gray-400 cursor-not-allowed'
                  : isSelected
                    ? 'bg-primary text-white'
                    : 'hover:bg-primary/20'
              }`}
            >
              {seatId}
            </button>
          );
        })}
      </div>
    </div>
  );

  // Handle seat click with checks
  const handleSeatClick = (seatId) => {
    if (!selectedTime) {
      toast.error('Please select a time first');
      return;
    }

    if (occupiedSeats.includes(seatId)) {
      toast.error('This seat is already occupied');
      return;
    }

    if (!selectSeats.includes(seatId) && selectSeats.length >= 5) {
      toast.error('You can only select up to 5 seats');
      return;
    }

    setSelectSeats(prev =>
      prev.includes(seatId) ? prev.filter(seat => seat !== seatId) : [...prev, seatId]
    );
  };

  // Fetch show details from backend
  const getShow = async () => {
    try {
      const { data } = await axios.get(`/api/show/${id}`);
      if (data.success) {
        setShow(data);
      } else {
        toast.error('Failed to load show details');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load show details');
    }
  };

  // Fetch occupied seats for selected show time
  const getOccupiedSeats = async () => {
    if (!selectedTime || !selectedTime.showId) return; // Defensive check

    try {
      const { data } = await axios.get(`/api/booking/occupied-seats/${selectedTime.showId}`);
      if (data.success) {
        // occupiedSeats is an object; convert keys to array
        const occupiedSeatIds = Object.keys(data.occupiedSeats || {});
        setOccupiedSeats(occupiedSeatIds);
        setSelectSeats([]); // Clear selections when seats update
      } else {
        toast.error(data.message || 'Failed to fetch occupied seats');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch occupied seats');
    }
  };

  // Booking tickets API call
  const bookTickets = async () => {
    try {
      if (!user) {
        toast.error('Please login to book tickets');
        return;
      }
      if (!selectedTime || selectSeats.length === 0) {
        toast.error('Please select a time and at least one seat');
        return;
      }

      const token = await getToken();

      console.log("[bookTickets] Sending booking request with data:", {
      showId: selectedTime.showId,
      selectedSeats: selectSeats,
        });

      const { data } = await axios.post('/api/booking/create',
        {
          showId: selectedTime.showId,
          selectedSeats: selectSeats,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (data.success) {
        window.location.href = data.url;  // Redirect to Stripe payment page
      } else {
        toast.error(data.message || 'Failed to book tickets');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to book tickets');
    }
  };

  // Load show data on mount or when id changes
  useEffect(() => {
    getShow();
  }, [id]);

  // Load occupied seats when selected time changes
  useEffect(() => {
    getOccupiedSeats();
  }, [selectedTime]);

  if (!show) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col md:flex-row px-6 md:px-16 lg:px-40 py-30 md:pt-50">
      {/* Available Timings */}
      <div className="w-60 bg-primary/10 border border-primary/20 rounded-lg py-10 h-max md:sticky md:top-30">
        <p className="text-lg font-semibold px-6">Available Timings</p>
        <div className="mt-5 space-y-1">
          {show.dateTime && show.dateTime[date] ? show.dateTime[date].map((time, idx) => {
            const timeStr = typeof time === 'string' ? time : (time.time || time.showTime || '');
            const isSelected = selectedTime
              ? (typeof selectedTime === 'string' ? selectedTime === timeStr : selectedTime.time === timeStr)
              : false;

            return (
              <div
                key={timeStr || idx}
                onClick={() => setSelectedTime(time)}
                className={`flex items-center gap-2 px-6 py-2 w-max rounded-r-md cursor-pointer transition ${
                  isSelected ? 'bg-primary text-white' : 'hover:bg-primary/20'
                }`}
              >
                <ClockIcon className="w-4 h-4" />
                <p className="text-sm">{isoTimeFormat(timeStr)}</p>
              </div>
            );
          }) : (
            <p className="px-6 text-gray-500 text-sm">No show times available for this date.</p>
          )}
        </div>
      </div>

      {/* Seat layout */}
      <div className='relative flex-1 flex flex-col items-center max-md:mt-16'>
        <BlurCircle top='-100px' left='-100px' />
        <BlurCircle bottom='0' right='0' />
        <h1 className='text-2xl font-semibold mb-4'>Select Your Seats</h1>
        <img src={assets.screenImage} alt='Cinema screen' />
        <p className='text-gray-400 text-sm mb-6'>SCREEN SIDE</p>

        <div className='flex flex-col items-center mt-10 text-xs text-gray-300'>
          <div className='grid grid-cols-2 md:grid-cols-1 gap-8 md:gap-2 mb-6'>
            {groupRows[0].map(row => renderSeats(row))}
          </div>

          <div className='grid grid-cols-2 gap-11'>
            {groupRows.slice(1).map((group, idx) => (
              <div key={idx}>
                {group.map(row => renderSeats(row))}
              </div>
            ))}
          </div>
        </div>

        

        <button
          onClick={bookTickets}
          disabled={!selectedTime || selectSeats.length === 0}
          className={`flex items-center gap-1 mt-20 px-10 py-3 text-sm rounded-full font-medium cursor-pointer active:scale-95 transition ${
            !selectedTime || selectSeats.length === 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-primary hover:bg-primary-dull'
          }`}
        >
          Proceed to Checkout
          <ArrowRightIcon strokeWidth={3} className='w-4 h-4' />
        </button>
      </div>
    </div>
  );
};

export default SeatLayout;
