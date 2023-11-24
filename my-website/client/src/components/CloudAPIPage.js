import React, { useState } from 'react';
import axios from 'axios';
import { useSwipeable } from 'react-swipeable';
import VideoControls from './VideoControls';
import UserInfo from './UserInfo';
import '../styles/FullScreen.css';

function CloudAPIPage() {
  const [apiData, setApiData] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);


  const handleButtonClick = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get('https://your-rest-api.com/data');
      setApiData(response.data.videos);
      setCurrentVideoIndex(0);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => setCurrentVideoIndex(index => Math.min(index + 1, apiData.length - 1)),
    onSwipedRight: () => setCurrentVideoIndex(index => Math.max(index - 1, 0)),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });

  return (
    <div className="full-screen-container">
      <button onClick={handleButtonClick} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Load Videos'}
      </button>
      {error && <p>Error: {error}</p>}
      {apiData.length > 0 && (
        <div {...handlers} className="video-container">
          <video key={apiData[currentVideoIndex].id} autoPlay loop controls>
            <source src={apiData[currentVideoIndex].url} type="video/mp4" />
          </video>
          <UserInfo user={apiData[currentVideoIndex].user} description={apiData[currentVideoIndex].description} />
          <VideoControls />
        </div>
      )}
    </div>
  );
}

export default CloudAPIPage;
