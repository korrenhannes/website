import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { apiFlask } from '../api'; // Assuming this is the correct import for your Flask API
import NavigationBar from './NavigationBar';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/NavigationBar.css';
import '../styles/ExploreFurther.css';

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
  const swipeThreshold = 100; // Increased threshold for swipe sensitivity
  const [swipeEnabled, setSwipeEnabled] = useState(false); // New state for swiping enabled

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

  const fetchVideosFromGCloud = async () => {
    setIsLoading(true);
    setError(null);

    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      setError('User email not found. Please log in again.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiFlask.get(`/signed-urls?email=${encodeURIComponent(userEmail)}`);
      const signedUrls = response.data.signedUrls;
      if (signedUrls && signedUrls.length > 0) {
        setVideos(signedUrls);
        setTimeout(() => {
          if (videoRef.current && !playerRef.current) {
            playerRef.current = videojs(videoRef.current, {
              autoplay: true,
              muted: true,
              controls: true,
              fluid: true,
              sources: [{ src: signedUrls[0], type: 'video/mp4' }]
            });

            playerRef.current.on('ended', () => {
              const nextVideoIndex = (currentVideoIndex + 1) % signedUrls.length;
              setCurrentVideoIndex(nextVideoIndex);
            });
          }
        }, 0);
      } else {
        setError('No videos found in Google Cloud Storage.');
      }
    } catch (err) {
      setError(`Error fetching videos: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideosFromGCloud();

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [navigate]);

  useEffect(() => {
    if (videos.length > 0 && playerRef.current) {
      playerRef.current.src({ src: videos[currentVideoIndex], type: 'video/mp4' });
      playerRef.current.load();
      playerRef.current.play();
    }
  }, [currentVideoIndex, videos]);

  const handleSwipe = (direction) => {
    if (!swipeEnabled) return; // Check if swiping is enabled

    const navigateUp = () => navigate('/how-it-works');
    const navigateDown = () => navigate('/cloud-api');

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
    <div className="explore-further-container">
      <div className="main-content">
        {windowWidth <= 768 && (
          <h2 className="content-heading">“Content Creation Has Never Been This Easy!”</h2>
        )}
        <div className="video-tab-container">
          <video ref={videoRef} className="video-js" />
        </div>
        <ContentSection windowWidth={windowWidth} />
      </div>
      {isLoading && <div className="text-center mt-3">Loading...</div>}
      {error && <div className="text-danger text-center mt-3">{error}</div>}
    </div>
  );
}

export default ExploreFurther;
