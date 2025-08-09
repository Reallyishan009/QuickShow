import React, { useState } from 'react';
import BlurCircle from './BlurCircle';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const DateSelect = ({ dateTime, showId }) => {
  const navigate = useNavigate();
  const dates = Object.keys(dateTime);
  const [selected, setSelected] = useState(null); // No pre-selection, initially null

  const onBookHandler = () => {
    if (!selected) {
      return toast('Please select a date before booking');
    }
    navigate(`/movies/${showId}/${selected}`);
    window.scrollTo(0, 0);
  };

  const handlePrevDate = () => {
    if (!selected) return;
    const currentIndex = dates.indexOf(selected);
    if (currentIndex > 0) {
      setSelected(dates[currentIndex - 1]);
    }
  };

  const handleNextDate = () => {
    if (!selected) return;
    const currentIndex = dates.indexOf(selected);
    if (currentIndex < dates.length - 1) {
      setSelected(dates[currentIndex + 1]);
    }
  };

  return (
    <div id='dateSelect' className='pt-30'>
      <div className='flex flex-col md:flex-row items-center justify-between gap-10 relative p-8 bg-primary/10 border border-primary/20 rounded-lg'>
        <BlurCircle top='-100px' left='-100px' />
        <BlurCircle top='100px' right='0px' />

        <div>
          <p className='text-lg font-semibold'>Choose Date</p>
          <div className='flex items-center gap-6 text-sm mt-5'>

            <button 
              onClick={handlePrevDate} 
              aria-label="Previous Date"
              disabled={!selected || dates.indexOf(selected) === 0}
              className="disabled:opacity-40"
            >
              <ChevronLeftIcon width={28} />
            </button>

            <span className='flex flex-wrap gap-4 md:max-w-lg'>
              {dates.map((date) => {
                const parsedDate = new Date(date);
                return (
                  <button
                    key={date}
                    aria-pressed={selected === date}
                    className={`flex flex-col items-center justify-center h-14 w-14 aspect-square rounded cursor-pointer transition-colors ${
                      selected === date ? 'bg-primary text-white' : 'bg-white text-black'
                    }`}
                    onClick={() => setSelected(date)}
                  >
                    <span>{parsedDate.getDate()}</span>
                    <span>{parsedDate.toLocaleDateString("en-US", { month: "short" })}</span>
                  </button>
                )
              })}
            </span>

            <button 
              onClick={handleNextDate} 
              aria-label="Next Date"
              disabled={!selected || dates.indexOf(selected) === dates.length - 1}
              className="disabled:opacity-40"
            >
              <ChevronRightIcon width={28} />
            </button>

          </div>
        </div>

        <button
          onClick={onBookHandler}
          disabled={!selected}
          className={`px-8 py-2 mt-6 rounded transition-all cursor-pointer ${
            selected
              ? 'bg-primary text-white hover:bg-primary/90'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          Book Now
        </button>
      </div>
    </div>
  );
};

export default DateSelect;
