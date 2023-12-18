import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { apiFlask } from '../api'; // Importing the Axios instance for Flask
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom'; // Import useNavigate


import '../styles/NavigationBar.css';
import styles from '../styles/FreeUserPage.module.css';
import NextVideoButton from './NextVideoButton'; // Import the custom button

// Register the custom button with Video.js
videojs.registerComponent('NextVideoButton', NextVideoButton);

function FreeUserPage() {
  const navigate = useNavigate(); // Initialize useNavigate
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
          controls: true,
          fluid: true,
          loop: true,
          preload: true
        }, () => {
          console.log('Player is ready');
          // Add NextVideoButton to the player
          playerRef.current.getChild('controlBar').addChild('NextVideoButton', {});
          
          fetchVideosFromGCloud();
        });
  
        playerRef.current.on('ended', () => {
          fetchVideosFromGCloud();
        });
  
        // Handle 'nextVideo' event
        playerRef.current.on('nextVideo', () => {
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
  
    // Check for email in the state, if not present, decode from the token
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
  
    // Redirect if email is not found
    if (!emailToUse) {
      setError('User email not found. Redirecting to signup...');
      setIsLoading(false);
      navigate('/signup');
      return;
    }
  
    // Fetch the signed URLs
    try {
      console.log(emailToUse, 'fetching video');
      const response = await apiFlask.get('/signed-urls', {
        params: {
          directory: `${emailToUse}/CurrentRun`
        },
        headers: {
          'User-Email': emailToUse
        }
      });
  
      let signedUrls = response.data.signedUrls;
  
      // Fallback to undefined directory if no URLs found
      if (!signedUrls || signedUrls.length === 0) {
        const responseFromUndefined = await apiFlask.get('/signed-urls', {
          params: {
            directory: `undefined/`
          },
          headers: {
            'User-Email': emailToUse
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
      setCurrentVideoIndex(0); // Reset the index to start from the first video
      loadVideo(signedUrls[0]); // Load the first video
      setUserVideosLoaded(true);
    } catch (err) {
      setError(`Error fetching videos: ${err.message}`);
      console.error('Error fetching videos:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  
  
  const loadVideo = (videoUrl) => {
    if (!videoUrl) {
      console.error('Invalid video URL');
      return;
    }
  
    console.log("Loading video URL:", videoUrl);
    playerRef.current.src({ src: videoUrl, type: 'video/mp4' });
    playerRef.current.load();
  
    const playPromise = playerRef.current.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        // Automatic playback started successfully.
      }).catch(error => {
        console.error('Error attempting to play video:', error);
      });
    }
  };
  

  const loadNextVideo = () => {
    setCurrentVideoIndex(prevIndex => {
      // Check if the videos array is empty
      if (videos.length === 0) {
        console.error('Videos array is empty.');
        return prevIndex; // Return the previous index if the array is empty
      }
  
      let nextIndex = (prevIndex + 1) % videos.length;
  
      const nextVideoUrl = videos[nextIndex];
      if (nextVideoUrl) {
        console.log('Next video URL:', nextVideoUrl);
        loadVideo(nextVideoUrl);
      } else {
        console.error('Invalid video URL at index:', nextIndex);
      }
  
      return nextIndex;
    });
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
    <div className={styles.fullScreenContainer}>
      <div className={styles.videocontainer1} ref={videoContainerRef}>
        <video ref={backgroundVideoRef} className="video-js vjs-big-play-centered vjs-fluid" id="background-video"></video>
        <button onClick={handleDownloadVideo} className={styles.downloadbutton}>Download Video</button>

      </div>

      <div className={styles.videouioverlay}>
        {/* Elements for video title, user interaction, etc. */}
      </div>


      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
    </div>
  );
}

export default FreeUserPage;