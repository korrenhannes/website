import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  </div>
);

function ExploreFurther() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();

    const handleTouchStart = (e) => {
      touchStartRef.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      if (!touchStartRef.current) {
        return;
      }

      const touchEndY = e.touches[0].clientY;
      if (touchStartRef.current > touchEndY + 50) {
        navigate('/next-page'); // Change to the path of the next page
      } else if (touchStartRef.current < touchEndY - 50) {
        navigate('/how-it-works'); // Swipe up to go back to 'HowItWorks' page
      }
    };

    const handleWheel = (e) => {
      if (e.deltaY > 100) {
        navigate('/next-page'); // Change to the path of the next page
      } else if (e.deltaY < -100) {
        navigate('/how-it-works'); // Swipe up to go back to 'HowItWorks' page
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
    </div>
  );
}

export default ExploreFurther
