import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
<<<<<<< HEAD
import NavigationBar from './NavigationBar';
import '../styles/FullScreen.css';
import '../styles/NavigationBar.css';
import '../styles/ExploreFurther.css'; // Make sure you have this CSS file

// Component for "Expand Your Reach"
const ExpandReachSection = () => (
  <div className="section expand-reach">
    <h2>Expand Your Reach</h2>
    <p>Discover new strategies to enhance your online presence and connect with a wider audience. We provide the tools and insights to help you grow exponentially.</p>
  </div>
);

// Component for "Embrace Innovation"
const EmbraceInnovationSection = () => (
  <div className="section embrace-innovation">
    <h2>Embrace Innovation</h2>
    <p>Stay ahead of the curve with our cutting-edge features. We continuously evolve our platform to give you a competitive advantage in the digital world.</p>
  </div>
);

// Component for "Build Stronger Connections"
const BuildConnectionsSection = () => (
  <div className="section build-connections">
    <h2>Build Stronger Connections</h2>
    <p>Engage with your audience more effectively. Our tools help you understand your audience better, enabling you to create more meaningful and impactful content.</p>
=======
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { apiFlask } from '../api'; // Assuming this is the correct import for your Flask API
import NavigationBar from './NavigationBar';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/NavigationBar.css';
import '../styles/ExploreFurther.css';

const ContentSection = () => (
  <div className="content-section">
    <h2 className="content-heading">“Content creation has never been this easy!”</h2>
    <p className="content-description">With our innovative algorithm, you will be able to make your favorite podcasts and videos into content for your viewers with a push of a button.</p>
    <button className="cliplt-button">Cliplt</button>
    <div className="video-thumbnails">
      {[...Array(5)].map((_, index) => (
        <div key={index} className="video-thumbnail"></div>
      ))}
    </div>
>>>>>>> 4353c732b80537dea39e20140b5e75195065be76
  </div>
);

function ExploreFurther() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
<<<<<<< HEAD
  const backgroundVideoRef = useRef(null);
  const navigate = useNavigate();
  const touchStartRef = useRef(null);

  const PEXELS_API_KEY = 'hKTWEteFrhWt6vY5ItuDO4ZUwVx2jvnfr0wtDgeqhIyedZyDXVDutynu'; // Replace with your actual Pexels API key
  const PEXELS_API_URL = 'https://api.pexels.com/videos/popular';

  const fetchVideos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const randomPage = Math.floor(Math.random() * 10) + 1;
      const response = await fetch(PEXELS_API_URL, {
        headers: {
          Authorization: PEXELS_API_KEY
        },
        params: {
          per_page: 2,
          page: randomPage
        }
      });
      const data = await response.json();
      const backgroundVideo = data.videos[0].video_files[0].link;
      backgroundVideoRef.current.src = backgroundVideo;
    } catch (err) {
      setError('Error fetching videos from Pexels: ' + err.message);
=======
  const [videos, setVideos] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videoRef = useRef(null);
  const navigate = useNavigate();
  const playerRef = useRef(null);
  const touchStartRef = useRef(0);

  const fetchVideosFromGCloud = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiFlask.get('/signed-urls');
      const signedUrls = response.data.signedUrls;
      if (signedUrls && signedUrls.length > 0) {
        setVideos(signedUrls); // Save the list of video URLs
        setTimeout(() => {
          if (videoRef.current && !playerRef.current) {
            playerRef.current = videojs(videoRef.current, {
              autoplay: true,
              muted: true,
              controls: true,
              fluid: true,
              sources: [{ src: signedUrls[currentVideoIndex], type: 'video/mp4' }]
            });

            playerRef.current.on('ended', () => {
              // Increment the index or loop back to the start
              const nextVideoIndex = (currentVideoIndex + 1) % signedUrls.length;
              setCurrentVideoIndex(nextVideoIndex); // Update the state to the new index
            });
          }
        }, 0);
      } else {
        setError('No videos found in Google Cloud Storage.');
      }
    } catch (err) {
      setError(`Error fetching videos from Google Cloud: ${err.message}`);
>>>>>>> 4353c732b80537dea39e20140b5e75195065be76
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
<<<<<<< HEAD
    fetchVideos();

=======
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
>>>>>>> 4353c732b80537dea39e20140b5e75195065be76
    const handleTouchStart = (e) => {
      touchStartRef.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
<<<<<<< HEAD
      if (!touchStartRef.current) {
        return;
      }

      const touchEndY = e.touches[0].clientY;
      if (touchStartRef.current > touchEndY + 50) {
        navigate('/next-page'); // Change to the path of the next page
      } else if (touchStartRef.current < touchEndY - 50) {
        navigate('/how-it-works'); // Swipe up to go back to 'HowItWorks' page
=======
      if (!touchStartRef.current) return;
      const touchEndY = e.touches[0].clientY;
      if (touchStartRef.current > touchEndY + 50) {
        handleSwipe('up');
      } else if (touchStartRef.current < touchEndY - 50) {
        handleSwipe('down');
>>>>>>> 4353c732b80537dea39e20140b5e75195065be76
      }
    };

    const handleWheel = (e) => {
      if (e.deltaY > 100) {
<<<<<<< HEAD
        navigate('/next-page'); // Change to the path of the next page
      } else if (e.deltaY < -100) {
        navigate('/how-it-works'); // Swipe up to go back to 'HowItWorks' page
=======
        handleSwipe('up');
      } else if (e.deltaY < -100) {
        handleSwipe('down');
>>>>>>> 4353c732b80537dea39e20140b5e75195065be76
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
<<<<<<< HEAD
    <div className="full-screen-container">
      <NavigationBar />
      <video ref={backgroundVideoRef} autoPlay muted loop id="background-video"></video>
      <div className="foreground-content">
        <h1>Next-Level Content Creation</h1>
        <ExpandReachSection />
        <EmbraceInnovationSection />
        <BuildConnectionsSection />
        {/* Additional sections as needed */}
      </div>
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
=======
    <div className="explore-further-container">
      <NavigationBar />
      <div className="main-content">
        <div className="video-tab-container">
          <video ref={videoRef} className="video-js" />
        </div>
        <ContentSection />
      </div>
      {isLoading && <div className="text-center mt-3">Loading...</div>}
      {error && <div className="text-danger text-center mt-3">{error}</div>}
>>>>>>> 4353c732b80537dea39e20140b5e75195065be76
    </div>
  );
}

<<<<<<< HEAD
export default ExploreFurther
=======
export default ExploreFurther;
>>>>>>> 4353c732b80537dea39e20140b5e75195065be76
