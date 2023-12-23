import React, { useState, useEffect } from 'react';

const Countdown = () => {
  const [timeLeft, setTimeLeft] = useState(0);

  // Function to calculate the countdown duration
  const getRandomDuration = () => {
    const minDays = 3;
    const maxDays = 10;
    return Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays;
  };

  useEffect(() => {
    // Set initial countdown
    setTimeLeft(getRandomDuration() * 24 * 60 * 60 * 1000);

    const interval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1000) {
          return getRandomDuration() * 24 * 60 * 60 * 1000; // Reset the countdown
        }
        return prevTime - 1000;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Convert timeLeft to days, hours, minutes, and seconds
  const days = Math.floor(timeLeft / (24 * 60 * 60 * 1000));
  const hours = Math.floor((timeLeft % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((timeLeft % (60 * 1000)) / 1000);

  return (
    <div className="countdown">
      {`${days}d ${hours}h ${minutes}m ${seconds}s`}
    </div>
  );
};

export default Countdown;
