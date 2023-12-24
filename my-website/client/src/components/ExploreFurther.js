import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import 'video.js/dist/video-js.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/NavigationBar.css';
import '../styles/ExploreFurther.css';
import { PAGE_CONTEXT } from './constants'; // Import the constants
import ShowVideo from './ShowVideo';



const ContentSection = ({ windowWidth }) => (
  <div className="content-section">
    {/* Render content-heading inside ContentSection for larger screens */}
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
  }, [navigate]);

  return (
      <div className="explore-further-container">
        <div className="main-content">
          {/* Render content-heading outside ContentSection for mobile screens */}
          {windowWidth <= 768 && (
            <h2 className="content-heading">“Content Creation Has Never Been This Easy!”</h2>
          )}
          <ShowVideo pageContext={PAGE_CONTEXT.EXPLORE_FURTHER} updateVideoUrl={updateCurrentVideoUrl} />
          <ContentSection windowWidth={windowWidth} />
        </div>
        {error && <div className="text-danger text-center mt-3">{error}</div>}
      </div>

  );
}

export default ExploreFurther;
