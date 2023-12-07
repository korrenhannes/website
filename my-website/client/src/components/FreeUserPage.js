import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { apiFlask } from '../api'; // Importing the Axios instance for Flask

import NavigationBar from './NavigationBar';
import SubtitleEditor from './SubtitleEditor';
import HeadlineEditor from './HeadlineEditor';
import CaptionOptions from './CaptionOptions';
import '../styles/FullScreen.css';
import '../styles/NavigationBar.css';
import '../styles/Sidebar.css';

function FreeUserPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videos, setVideos] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [showSubtitleEditor, setShowSubtitleEditor] = useState(false);
  const [showHeadlineEditor, setShowHeadlineEditor] = useState(false);
  const [showCaptionOptions, setShowCaptionOptions] = useState(false);
  const [subtitles, setSubtitles] = useState([]);
  const [headline, setHeadline] = useState('');
  const [captionStyle, setCaptionStyle] = useState({
    position: 'bottom',
    transition: 'pop',
    highlightColor: '#04f827'
  });
  const [activeComponent, setActiveComponent] = useState(null);
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
          controls: true,
          fluid: false,
          aspectRatio: "16:9"
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

  const fetchVideosFromGCloud = async () => {
    setIsLoading(true);
    setError(null);

    // Retrieve userEmail from localStorage or another secure method
    const userEmail = localStorage.getItem('userEmail'); // Replace this with your actual method of retrieving the user's email
    if (!userEmail) {
      setError('User email not found. Please log in again.');
      setIsLoading(false);
      return;
    }

    try {
      // Update the request URL to include the userEmail as a query parameter
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
    playerRef.current.load(); // Load the new source
    playerRef.current.play().catch(e => console.error('Error playing video:', e));
  }

  const loadNextVideo = () => {
    if (!videos || videos.length === 0) {
      console.error('Error: Video list is empty or not loaded');
      return;
    }

    const nextIndex = (currentVideoIndex + 1) % videos.length;
    setCurrentVideoIndex(nextIndex);
    loadVideo(videos[nextIndex]);
  };

  // Custom Double Tap Handler
  const handleDoubleTap = (function() {
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

  // Handling the Enter key press to load the next video
  const handleKeyPress = (event) => {
    if (event.keyCode === 13) { // keyCode 13 is the Enter key
      loadNextVideo();
    }
  };

  useEffect(() => {
    const videoElement = backgroundVideoRef.current;
    if (videoElement) {
      videoElement.addEventListener('dblclick', handleDoubleTap); // Use 'dblclick' for desktop
      videoElement.addEventListener('touchend', handleDoubleTap); // 'touchend' for touch devices
    }

    // Add keypress event listener
    window.addEventListener('keydown', handleKeyPress);

    return () => {
      if (videoElement) {
        videoElement.removeEventListener('dblclick', handleDoubleTap);
        videoElement.removeEventListener('touchend', handleDoubleTap);
      }
      // Remove keypress event listener
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [currentVideoIndex, videos]);

  const handleSetActiveComponent = (component) => setActiveComponent(activeComponent === component ? null : component);
  const toggleSubtitleEditor = () => setShowSubtitleEditor(!showSubtitleEditor);
  const toggleHeadlineEditor = () => setShowHeadlineEditor(!showHeadlineEditor);
  const toggleCaptionOptions = () => setShowCaptionOptions(!showCaptionOptions);

  const getCaptionStyle = () => ({
    color: captionStyle.highlightColor,
    positionClass: `caption-${captionStyle.position}`,
    transitionClass: `transition-${captionStyle.transition}`
  });

  return (
    <div className="full-screen-container">
      <NavigationBar />
      <div className="sidebar">
        <button onClick={toggleSubtitleEditor}>Subtitles</button>
        <button onClick={toggleHeadlineEditor}>Headline</button>
        <button onClick={toggleCaptionOptions}>Caption Options</button>
        <div className="sidebar-content">
          {activeComponent === 'subtitles' && <SubtitleEditor subtitles={subtitles} setSubtitles={setSubtitles} videoRef={backgroundVideoRef} />}
          {activeComponent === 'headline' && <HeadlineEditor headline={headline} setHeadline={setHeadline} />}
          {activeComponent === 'captionOptions' && <CaptionOptions captionStyle={captionStyle} setCaptionStyle={setCaptionStyle} />}
        </div>
      </div>
      <video ref={backgroundVideoRef} className="video-js" id="background-video"></video>
      <div className="foreground-content">
        <div className="video-subtitles">
          {subtitles.find(sub => sub.startTime <= backgroundVideoRef.current.currentTime && sub.endTime >= backgroundVideoRef.current.currentTime)?.text}
        </div>
        <div className="video-headline">{headline}</div>
      </div>
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
    </div>
  );
}

export default FreeUserPage;
