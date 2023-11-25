import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSwipeable } from 'react-swipeable';
import VideoControls from './VideoControls';
import UserInfo from './UserInfo';
import NavigationBar from './NavigationBar'; // Import the navigation bar component
import '../styles/FullScreen.css';
import '../styles/NavigationBar.css'; // Import the navigation bar styles

function CloudAPIPage() {
  const [apiData, setApiData] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const backgroundVideoRef = useRef(null);

  const PEXELS_API_KEY = 'hKTWEteFrhWt6vY5ItuDO4ZUwVx2jvnfr0wtDgeqhIyedZyDXVDutynu'; // Replace with your Pexels API key
  const PEXELS_API_URL = 'https://api.pexels.com/videos/popular'; // Pexels popular videos endpoint

  const fetchVideos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(PEXELS_API_URL, {
        headers: {
          Authorization: PEXELS_API_KEY
        },
        params: {
          per_page: 1 // Fetching only one video for background
        }
      });
      const backgroundVideo = response.data.videos[0].video_files[0].link;
      backgroundVideoRef.current.src = backgroundVideo; // Set the source of the background video
    } catch (err) {
      setError('Error fetching videos from Pexels: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handlers = useSwipeable({
    onSwipedLeft: () => setCurrentVideoIndex(index => Math.min(index + 1, apiData.length - 1)),
    onSwipedRight: () => setCurrentVideoIndex(index => Math.max(index - 1, 0)),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });

  return (
    <div className="full-screen-container">
      <NavigationBar /> {/* Include the navigation bar at the top */}
      <video ref={backgroundVideoRef} autoPlay muted loop id="background-video">
        {/* Video source will be set dynamically */}
      </video>
      <div className="foreground-content">
        <h1>Swipe Right®</h1>
        <button onClick={() => {/* logic to handle account creation */}}>
          Create account
        </button>
      </div>
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {apiData.length > 0 && (
        <div {...handlers} className="video-container">
          {apiData.map((video, index) => (
            <div key={video.id} className={index === currentVideoIndex ? 'video-card active' : 'video-card'}>
              <video autoPlay loop controls preload={index === currentVideoIndex + 1 ? "auto" : "none"}>
                <source src={video.url} type="video/mp4" />
              </video>
              <UserInfo user={video.user} description={video.description} />
              <VideoControls />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CloudAPIPage;
