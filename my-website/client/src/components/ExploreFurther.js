import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  </div>
);

function ExploreFurther() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const navigate = useNavigate();

  // Replace with your actual Pexels API key
  const PEXELS_API_KEY = 'YOUR_ACTUAL_PEXELS_API_KEY';
  const PEXELS_API_URL = 'https://api.pexels.com/videos/popular';

  const fetchVideos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${PEXELS_API_URL}?per_page=1`, {
        headers: {
          Authorization: PEXELS_API_KEY
        }
      });
      const data = await response.json();
      const backgroundVideo = data.videos[0].video_files.find(file => file.height === 1080).link;
      videoRef.current.src = backgroundVideo;
    } catch (err) {
      setError(`Error fetching videos from Pexels: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [navigate]);

  return (
    <div className="explore-further-container">
      <NavigationBar />
      <div className="main-content">
        <div className="video-tab-container">
          <video ref={videoRef} autoPlay muted loop className="video-tab"></video>
        </div>
        <ContentSection />
      </div>
      {isLoading && <div className="text-center mt-3">Loading...</div>}
      {error && <div className="text-danger text-center mt-3">{error}</div>}
    </div>
  );
}

export default ExploreFurther;

// Note: Make sure to update '../styles/ExploreFurther.css' to style the 'main-content' div accordingly.
