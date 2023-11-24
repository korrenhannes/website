import React, { useState } from 'react';
import axios from 'axios';
import { useSwipeable } from 'react-swipeable';

function CloudAPIPage() {
  const [apiData, setApiData] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleButtonClick = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get('https://your-rest-api.com/data');
      setApiData(response.data.videos); // Assuming the API sends an object with a 'videos' array
      setCurrentVideoIndex(0); // Reset to the first video
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
    <div>
      <h1>Cloud API Interaction</h1>
      <button onClick={handleButtonClick} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Connect to Cloud API'}
      </button>
      {error && <p>Error: {error}</p>}

      {apiData.length > 0 && (
        <div {...handlers} className="video-container">
          {/* Displaying the current video */}
          {/* Adjust the video element as needed based on your API data structure */}
          <video key={apiData[currentVideoIndex].id} controls>
            <source src={apiData[currentVideoIndex].url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}
    </div>
  );
}

export default CloudAPIPage;
