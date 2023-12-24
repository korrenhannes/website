import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import 'video.js/dist/video-js.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/NavigationBar.css';
import '../styles/ExploreFurther.css';
import { PAGE_CONTEXT } from './constants'; // Import the constants
import ShowVideo from './ShowVideo';

import { motion } from 'framer-motion'; // Import motion


const ContentSection = ({ windowWidth }) => (
  <div className="content-section">
    {windowWidth > 768 && (
      <h2 className="content-heading">“Content Creation Has Never Been This Easy!”</h2>
    )}
    <p className="content-description">With our innovative algorithm, you will be able to make your favorite podcasts and videos into content for your viewers with a push of a button.</p>
    <button className="cliplt-button">Cliplt</button>
    <div className="video-thumbnails">
      {[...Array(5)].map((_, index) => (
        <div key={index} className="video-thumbnail"></div>
      ))}
    </div>
  </div>
);

function ExploreFurther() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videos, setVideos] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videoRef = useRef(null);
  const navigate = useNavigate();
  const playerRef = useRef(null);
  const touchStartRef = useRef(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [currentVideoUrl, setCurrentVideoUrl] = useState(''); // State for the current video URL
  const swipeThreshold = 100; // Increased threshold for swipe sensitivity
  const [swipeEnabled, setSwipeEnabled] = useState(false); // New state for swiping enabled
  const [swipeDirection, setSwipeDirection] = useState(null); // State for swipe direction

  // Animation variants for Framer Motion
  const variants = {
    initial: {
      y: swipeDirection === 'up' ? '100vh' : '0'
    },
    animate: {
      y: 0
    },
    exit: {
      y: swipeDirection === 'up' ? '0' : '-100vh'
    }
  };

  useEffect(() => {
    // Delay enabling swipe functionality by 1 second
    const timer = setTimeout(() => {
      setSwipeEnabled(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);



  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const updateCurrentVideoUrl = (url) => {
    setCurrentVideoUrl(url);
  };

  
  // Swipe event handlers
  const handleSwipe = (direction) => {
    if (!swipeEnabled) return; // Check if swiping is enabled

    const navigateUp = () => {
      setSwipeDirection(1);
      setTimeout(() => navigate('/how-it-works'), 500); // Delay for animation
    };
    const navigateDown = () => {
      setSwipeDirection(-1);
      setTimeout(() => navigate('/cloud-api'), 500); // Delay for animation
    };

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

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('wheel', handleWheel);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [navigate, swipeEnabled]); // Add swipeEnabled as a dependency

  return (
    <motion.div
      className="explore-further-container"
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.5 }}
    >
      <div className="main-content">
        {windowWidth <= 768 && (
          <h2 className="content-heading">“Content Creation Has Never Been This Easy!”</h2>
        )}
        <ShowVideo pageContext={PAGE_CONTEXT.EXPLORE_FURTHER} updateVideoUrl={updateCurrentVideoUrl} />
        <ContentSection windowWidth={windowWidth} />
      </div>
      {isLoading && <div className="text-center mt-3">Loading...</div>}
      {error && <div className="text-danger text-center mt-3">{error}</div>}
    </motion.div>
  );
}

export default ExploreFurther;