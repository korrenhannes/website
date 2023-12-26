import React, { useState, useEffect, useRef } from 'react';
import NavigationBar from './NavigationBar';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/HowItWorks.css';
import '../styles/NavigationBar.css';
import { useNavigate } from 'react-router-dom';


// Import the icons using require
const uploadIcon = require('../assets/uploadIcon.png');
const clipIcon = require('../assets/clipIcon.png');
const shareIcon = require('../assets/shareIcon.png');

const HowItWorks = () => {
  const navigate = useNavigate();
  const touchStartRef = useRef(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const swipeThreshold = 100; // Increased threshold for swipe sensitivity
  const [swipeEnabled, setSwipeEnabled] = useState(false); // New state for swiping enabled



  useEffect(() => {
    // Delay enabling swipe functionality by 1 second
    const timer = setTimeout(() => {
      setSwipeEnabled(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleSwipe = (direction) => {
    if (!swipeEnabled) return; // Check if swiping is enabled

    // Placeholder functions - replace these with actual navigation logic
    const navigateUp = () => navigate('/support'); // Navigate to your next page
    const navigateDown = () => navigate('/explore-further'); // Navigate to your previous page
    if (direction === 'up') navigateUp();
    if (direction === 'down') navigateDown();
  };
  useEffect(() => {
    const handleTouchStart = (e) => {
      touchStartRef.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      if (!touchStartRef.current) return;
      const touchEndY = e.touches[0].clientY;
      if (touchStartRef.current > touchEndY + swipeThreshold) {
        handleSwipe('up');
      } else if (touchStartRef.current < touchEndY - swipeThreshold) {
        handleSwipe('down');
      }
    };

    const handleWheel = (e) => {
      if (e.deltaY > swipeThreshold) {
        handleSwipe('up');
      } else if (e.deltaY < -swipeThreshold) {
        handleSwipe('down');
      }
    };
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('wheel', handleWheel);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);
    };
  }, [navigate, swipeEnabled]); // Add swipeEnabled as a dependency
  
  return (
      <div className="how-it-works-container">
        <div className="container">
          <h1 className="text-white">ClipIt: Your Shortcut to Perfect Content.</h1>
          <p className="lead text-white">Crafted by a blend of AI specialists and seasoned content creators, our tool delivers your dream content in minutes.</p>
          <p className="lead text-white">Discover the magic in three easy steps. Transform your content effortlessly with ClipIt.</p>
          <h2 className="how-does-it-work">How does it work?</h2>
          <div className="row justify-content-start">
              <div className="card-little">
                <div className="card-body">
                  <img src={uploadIcon} alt="Upload" className="icon" />
                  <h3 className="card-title">Upload</h3>
                  {windowWidth >= 768 && (<p className="card-text">Choose and upload a video of your choosing with a length of up to 2 hours.</p>)}
                </div>
              </div>
              <div className="card-little">
                <div className="card-body">
                  <img src={clipIcon} alt="ClipIt" className="icon" />
                  <h3 className="card-title">ClipIt</h3>
                  {windowWidth >= 768 && ( <p className="card-text">Using our advanced AI algorithm you can clip your video and edit it.</p>)}
                </div>
              </div>
              <div className="card-little">
                <div className="card-body">
                  <img src={shareIcon} alt="Share It" className="icon" />
                  <h3 className="card-title">Share It</h3>
                  {windowWidth >= 768 && (<p className="card-text">Simply share your new favorite edits in any platform and let your followers enjoy high-quality content.</p>)}
                </div>
              </div>
          </div>
        </div>
      </div>
  );
};

export default HowItWorks;
