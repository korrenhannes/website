import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSwipeable } from 'react-swipeable';
import VideoControls from './VideoControls';
import UserInfo from './UserInfo';
import '../styles/FullScreen.css';

function CloudAPIPage() {
  const [apiData, setApiData] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const loaderRef = useRef(null);

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
          per_page: 10 // Number of videos per request
        }
      });
      const videos = response.data.videos.map(video => ({
        id: video.id,
        url: video.video_files[0].link, // Taking the first video file. Adjust according to your needs.
        user: video.user, // Contains user information
        description: video.url // Using video URL as description
      }));
      setApiData(videos);
      setCurrentVideoIndex(0);
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
      <button onClick={fetchVideos} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Reload Videos'}
      </button>
      {error && <p>Error: {error}</p>}
      {apiData.length > 0 && (
        <div {...handlers} className="video-container">
          {apiData.map((video, index) => (
            <div key={video.id} style={{ display: index === currentVideoIndex ? 'block' : 'none' }}>
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
