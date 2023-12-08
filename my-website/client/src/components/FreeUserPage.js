import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { apiFlask } from '../api'; // Importing the Axios instance for Flask

import NavigationBar from './NavigationBar';
import '../styles/FullScreen.css';
import '../styles/NavigationBar.css';

function FreeUserPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videos, setVideos] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videoContainerRef = useRef(null); // Ref for the video container
  const backgroundVideoRef = useRef(null);
  const socket = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    socket.current = io('http://localhost:3000');
    socket.current.on('connect', () => console.log('Connected to socket.io server'));
    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    setTimeout(() => {
      if (backgroundVideoRef.current && !playerRef.current) {
        playerRef.current = videojs(backgroundVideoRef.current, {
          autoplay: true,
          muted: true, // Mute the video initially
          controls: false, // Hide default controls to create custom ones
          fluid: true, // Set to true to maintain aspect ratio
          loop: false // Set to false if you don't want the video to loop
        }, () => {
          console.log('Player is ready');
          fetchVideosFromGCloud();
        });

        // Add event listener for video end
        playerRef.current.on('ended', () => {
          loadNextVideo();
        });
      }
    }, 0);

    return () => {
      if (playerRef.current) {
        playerRef.current.off('ended'); // Remove the event listener for video end
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [backgroundVideoRef]);

  // Fetch videos from Google Cloud
  const fetchVideosFromGCloud = async () => {
    setIsLoading(true);
    setError(null);
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      setError('User email not found. Please log in again.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiFlask.get(`/signed-urls?email=${encodeURIComponent(userEmail)}`);
      const signedUrls = response.data.signedUrls;
      if (signedUrls && signedUrls.length > 0) {
        setVideos(signedUrls);
        loadVideo(signedUrls[0]); // Load the first video from the list
      } else {
        setError('No videos found in Google Cloud Storage.');
      }
    } catch (err) {
      setError(`Error fetching videos: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadVideo = (videoUrl) => {
    playerRef.current.src({ src: videoUrl, type: 'video/mp4' });
    playerRef.current.load();
    playerRef.current.play().catch(e => console.error('Error playing video:', e));
  };

  const loadNextVideo = () => {
    if (!videos || videos.length === 0) {
      console.error('Error: Video list is empty or not loaded');
      return;
    }
    const nextIndex = (currentVideoIndex + 1) % videos.length;
    setCurrentVideoIndex(nextIndex);
    loadVideo(videos[nextIndex]);
  };

  // Double Tap Handler
  const handleDoubleTap = (() => {
    let lastTap = 0;
    return function(event) {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;
      if (tapLength < 500 && tapLength > 0) {
        loadNextVideo();
      }
      lastTap = currentTime;
    };
  })();

  const handleKeyPress = (event) => {
    if (event.keyCode === 13) {
      loadNextVideo();
    }
  };

  useEffect(() => {
    const videoElement = backgroundVideoRef.current;
    if (videoElement) {
      videoElement.addEventListener('dblclick', handleDoubleTap);
      videoElement.addEventListener('touchend', handleDoubleTap);
    }

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      if (videoElement) {
        videoElement.removeEventListener('dblclick', handleDoubleTap);
        videoElement.removeEventListener('touchend', handleDoubleTap);
      }
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [currentVideoIndex, videos]);

  const handleDownloadVideo = async () => {
    if (!playerRef.current) {
      console.error("No video player found");
      return;
    }
    const currentVideoUrl = playerRef.current.currentSrc();
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
    <div className="full-screen-container">
      <NavigationBar />

      <div className="video-container" ref={videoContainerRef}>
        <video ref={backgroundVideoRef} className="video-js vjs-big-play-centered" id="background-video"></video>
        {/* Add your custom controls here if needed */}
      </div>

      {/* Overlay for UI, e.g., video info, like/share/comment buttons */}
      <div className="video-ui-overlay">
        {/* Elements for video title, user interaction, etc. */}
      </div>

      {/* Download Button */}
      <button onClick={handleDownloadVideo} className="download-button">Download Video</button>

      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
    </div>
  );
}

export default FreeUserPage;
