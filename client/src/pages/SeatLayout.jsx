import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dummyDateTimeData, dummyShowsData, assets } from '../assets/assets';
import { ArrowRightIcon, ClockIcon } from 'lucide-react';
import Loading from '../components/Loading';
import isoTimeFormat from '../lib/isoTimeFormat';
import BlurCircle from '../components/BlurCircle';
import toast from 'react-hot-toast';

const SeatLayout = () => {
  const groupRows = [['A', 'B'], ['C', 'D'], ['E', 'F'], ['G', 'H'], ['I', 'J']];
  const { id, date } = useParams();
  const [selectSeats, setSelectSeats] = useState([]);
  const [selectTime, setSelectTime] = useState(null);
  const [show, setShow] = useState(null);
  const navigate = useNavigate();

  const renderSeats = (row, count = 9) => {
    return (
      <div key={row} className="flex gap-2 mt-2">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {Array.from({ length: count }, (_, i) => {
            const seatId = `${row}${i + 1}`;
            return (
              <button
                key={seatId}
                onClick={() => handleSeatClick(seatId)}
                className={`h-8 w-8 rounded border border-primary/60 cursor-pointer backdrop-blur-sm transition-colors duration-300 ${
                  selectSeats.includes(seatId)
                    ? 'bg-[#F84565] text-white ring-2 ring-primary/40'
                    : 'bg-white/30 text-white hover:bg-primary/40'
                }`}
              >
                {seatId}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const handleSeatClick = (seatId) => {
    if (!selectTime) {
      return toast('Please select a time first');
    }
    if (!selectSeats.includes(seatId) && selectSeats.length >= 5) {
      return toast('You can only select up to 5 seats');
    }
    setSelectSeats(prev =>
      prev.includes(seatId) ? prev.filter(seat => seat !== seatId) : [...prev, seatId]
    );
  };

  const getShow = async () => {
    const foundShow = dummyShowsData.find((show) => show._id === id);
    if (foundShow) {
      setShow({
        movie: foundShow,
        dateTime: dummyDateTimeData,
      });
    }
  };

  const handleProceedToCheckout = () => {
    if (!selectTime) {
      return toast('Please select a show time');
    }
    if (selectSeats.length === 0) {
      return toast('Please select at least one seat');
    }
    navigate('/my-bookings');
  };

  useEffect(() => {
    getShow();
  }, []);

  return show ? (
    <div className="flex flex-col md:flex-row px-6 md:px-16 lg:px-40 py-30 md:pt-50">
      {/* Available Timings */}
      <div className="w-60 bg-primary/10 border border-primary/20 rounded-lg py-10 h-max md:sticky md:top-30">
        <p className="text-lg font-semibold px-6">Available Timings</p>
        <div className="mt-5 space-y-1">
          {show.dateTime[date] && show.dateTime[date].map((time) => (
            <div
              onClick={() => setSelectTime(time)}
              key={time}
              className={`flex items-center gap-2 px-6 py-2 w-max rounded-r-md cursor-pointer transition ${
                selectTime === time ? 'bg-primary text-white' : 'hover:bg-primary/20'
              }`}
            >
              <ClockIcon className="w-4 h-4" />
              <p className="text-sm">{isoTimeFormat(time)}</p>
            </div>
          ))}
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

        {/* Selected seats display */}
        {selectSeats.length > 0 && (
          <div className='mt-8 text-center'>
            <p className='text-sm text-gray-400'>Selected Seats: {selectSeats.join(', ')}</p>
            <p className='text-sm text-gray-400'>Total: {selectSeats.length} seat(s)</p>
          </div>
        )}

        <button
          onClick={handleProceedToCheckout}
          disabled={!selectTime || selectSeats.length === 0}
          className={`flex items-center gap-1 mt-20 px-10 py-3 text-sm rounded-full font-medium cursor-pointer active:scale-95 transition ${
            selectTime && selectSeats.length > 0
              ? 'bg-primary hover:bg-primary-dull'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          Proceed to Checkout
          <ArrowRightIcon strokeWidth={3} className='w-4 h-4' />
        </button>
      </div>
    </div>
  ) : (
    <Loading />
  );
};

export default SeatLayout;
