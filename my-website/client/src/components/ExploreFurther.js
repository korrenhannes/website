import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { apiFlask } from '../api'; // Assuming this is the correct import for your Flask API
import NavigationBar from './NavigationBar';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/NavigationBar.css';
import '../styles/ExploreFurther.css';
import { Controller, Scene } from 'react-scrollmagic-r18';


const ContentSection = ({ windowWidth }) => (
  <div className="content-section">
    {/* Render content-heading inside ContentSection for larger screens */}
    {windowWidth > 768 && (
      <h2 className="content-heading">“Content creation has never been this easy!”</h2>
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

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchVideosFromGCloud = async () => {
    setIsLoading(true);
    setError(null);

    // Retrieve userEmail from localStorage or another secure method
    const userEmail = localStorage.getItem('userEmail'); // Replace with actual method
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
    // Whenever the currentVideoIndex changes, load the new video
    if (videos.length > 0 && playerRef.current) {
      playerRef.current.src({ src: videos[currentVideoIndex], type: 'video/mp4' });
      playerRef.current.load();
      playerRef.current.play();
    }
  }, [currentVideoIndex, videos]);

  // Swipe event handlers
  const handleSwipe = (direction) => {
    // Placeholder functions - replace these with actual navigation logic
    const navigateUp = () => navigate('/how-it-works'); // Navigate to your next page
    const navigateDown = () => navigate('/cloud-api'); // Navigate to your previous page

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
      if (touchStartRef.current > touchEndY + 50) {
        handleSwipe('up');
      } else if (touchStartRef.current < touchEndY - 50) {
        handleSwipe('down');
      }
    };

    const handleWheel = (e) => {
      if (e.deltaY > 100) {
        handleSwipe('up');
      } else if (e.deltaY < -100) {
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
  }, []);

  return (
    <Controller>
      <Scene triggerHook="onCenter" duration={300} offset={-100}>
        {(progress) => (
          <div className="explore-further-container" style={{ opacity: progress, transform: `scale(${progress})` }}>
            <div className="main-content">
              {/* Render content-heading outside ContentSection for mobile screens */}
              {windowWidth <= 768 && (
                <h2 className="content-heading">“Content creation has never been this easy!”</h2>
              )}
              <div className="video-tab-container">
                <video ref={videoRef} className="video-js" />
              </div>
              <ContentSection windowWidth={windowWidth} />
            </div>
            {isLoading && <div className="text-center mt-3">Loading...</div>}
            {error && <div className="text-danger text-center mt-3">{error}</div>}
          </div>
    )}
    </Scene>
  </Controller>
  );
}

export default ExploreFurther;
