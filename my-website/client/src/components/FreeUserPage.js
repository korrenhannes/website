import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { apiFlask } from '../api'; // Importing the Axios instance for Flask
import { jwtDecode } from 'jwt-decode';

import NavigationBar from './NavigationBar';
import '../styles/FreeUserPage.css';
import '../styles/NavigationBar.css';

function FreeUserPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videos, setVideos] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [userEmail, setUserEmail] = useState('');
  const [userVideosLoaded, setUserVideosLoaded] = useState(false);
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
          muted: true,
          controls: false,
          fluid: true,
          loop: false
        }, () => {
          console.log('Player is ready');
          fetchVideosFromGCloud();
        });

        playerRef.current.on('ended', () => {
          loadNextVideo();
        });
      }
    }, 0);

    return () => {
      if (playerRef.current) {
        playerRef.current.off('ended');
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [backgroundVideoRef]);

  const fetchVideosFromGCloud = async () => {
    setIsLoading(true);
    setError(null);

    let emailToUse = userEmail;

    if (!emailToUse) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = jwtDecode(token);
          emailToUse = decoded.email;
          setUserEmail(decoded.email);
        } catch (error) {
          console.error("Error decoding token:", error);
          setError('Authentication error. Please log in again.');
          setIsLoading(false);
          return;
        }
      }
    }
  
    if (!emailToUse) {
      setError('User email not found. Please log in again.');
      setIsLoading(false);
      return;
    }
  
    try {
      // Attempt to fetch videos from the 'CurrentRun' directory
      const response = await apiFlask.get('/signed-urls', {
        params: {
          directory: `${emailToUse}/CurrentRun`
        },
        headers: {
          'User-Email': emailToUse  // Include the User-Email header
        }
      });
  
      let signedUrls = response.data.signedUrls;
      if (!signedUrls || signedUrls.length === 0) {
        // If 'CurrentRun' is empty, fetch from the 'undefined' directory
        const responseFromUndefined = await apiFlask.get('/signed-urls', {
          params: {
            directory: `undefined/`
          },
          headers: {
            'User-Email': emailToUse  // Include the User-Email header
          }
        });

        signedUrls = responseFromUndefined.data.signedUrls;

        if (!signedUrls || signedUrls.length === 0) {
          setError('No videos found in Google Cloud Storage.');
          setIsLoading(false);
          return;
        }
      }

      setVideos(signedUrls);
      loadVideo(signedUrls[0]);
      setUserVideosLoaded(true);
    } catch (err) {
      setError(`Error fetching videos: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  
  
  
  const loadVideo = (videoUrl) => {
    console.log("Loading video URL:", videoUrl); // Log the URL being loaded
    playerRef.current.src({ src: videoUrl, type: 'video/mp4' });
    playerRef.current.load();
    const playPromise = playerRef.current.play();
  
    if (playPromise !== undefined) {
      playPromise.then(() => {
        // Automatic playback started successfully.
      }).catch(error => {
        console.error('Error attempting to play video:', error);
        // Handle the error for autoplay restrictions.
        // For example, show a play button to the user to start playback manually.
      });
    }
  };
  

  const loadNextVideo = async () => {
    let nextIndex = currentVideoIndex + 1;

    if (nextIndex >= videos.length) {
      nextIndex = 0;
      setCurrentVideoIndex(nextIndex);
      loadVideo(videos[nextIndex]);
    } else {
      setCurrentVideoIndex(nextIndex);
      loadVideo(videos[nextIndex]);
    }
  };

  

  const handleKeyPress = (event) => {
    if (event.keyCode === 13) { // 13 is the keycode for the Enter key
      if (!userVideosLoaded) {
        fetchVideosFromGCloud();
      } else {
        loadNextVideo();
      }
    }
};

useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
}, [currentVideoIndex, videos, userVideosLoaded]);

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
      </div>

      <div className="video-ui-overlay">
        {/* Elements for video title, user interaction, etc. */}
      </div>

      <button onClick={handleDownloadVideo} className="download-button">Download Video</button>

      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
    </div>
  );
}

export default FreeUserPage;