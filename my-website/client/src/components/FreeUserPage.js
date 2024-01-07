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
      console.error("No video URL found");
      return;
    }
  
    try {
      // Fetch the video
      const response = await fetch(videoUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      // Create a blob from the response
      const videoBlob = await response.blob();
  
      // Extract the base URL (before any query parameters)
      const baseUrl = videoUrl.split('?')[0];
  
      // Extracting the filename from the base URL
      let filename = baseUrl.split('/').pop();
  
      // Ensure the filename ends with '.mp4'
      if (!filename.endsWith('.mp4')) {
        filename += '.mp4';
      }
  
      // Create an anchor element and trigger download
      const a = document.createElement('a');
      a.href = window.URL.createObjectURL(videoBlob);
      a.download = filename; // Set the download attribute to the filename
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  
      // Clean up the blob URL
      window.URL.revokeObjectURL(a.href);
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