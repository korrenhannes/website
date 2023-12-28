import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { PAGE_CONTEXT } from './constants'; // Import the constants
import ShowVideo from './ShowVideo';



import '../styles/NavigationBar.css';
import styles from '../styles/FreeUserPage.module.css';
import NextVideoButton from './NextVideoButton'; // Import the custom button

// Register the custom button with Video.js
videojs.registerComponent('NextVideoButton', NextVideoButton);


function FreeUserPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentVideoUrl, setCurrentVideoUrl] = useState(''); // State for the current video URL
  const socket = useRef(null);

  useEffect(() => {
    socket.current = io('https://young-beach-38748-bf9fd736b27e.herokuapp.com');
    socket.current.on('connect', () => console.log('Connected to socket.io server'));
    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, []);
  const updateCurrentVideoUrl = (url) => {
    setCurrentVideoUrl(url);
  };

  const handleDownloadVideo = async () => {
    const videoUrl = currentVideoUrl;
    if (!videoUrl) {
      console.error("No video player found");
      return;
    }
    if (!currentVideoUrl) {
      console.error("No video is currently being played");
      return;
    }
    try {
      const response = await fetch(currentVideoUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const videoBlob = await response.blob();
      const localUrl = window.URL.createObjectURL(videoBlob);
      const a = document.createElement('a');
      a.href = localUrl;
      a.download = currentVideoUrl.split('/').pop();
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(localUrl);
    } catch (error) {
      console.error("Error downloading video:", error);
    }
  };


  return (
    <div className={styles.fullScreenContainer}>
      <ShowVideo pageContext={PAGE_CONTEXT.FREE_USER} updateVideoUrl={updateCurrentVideoUrl} />

      <div className={styles.videouioverlay}>
        {/* Elements for video title, user interaction, etc. */}
      </div>
      <button onClick={handleDownloadVideo} className={styles.downloadbutton}>Download Video</button>
      {error && <p>Error: {error}</p>}
    </div>
  );
}

export default FreeUserPage;