import React, { useState, useEffect, useRef } from 'react';
<<<<<<< HEAD
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
=======
import io from 'socket.io-client';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { apiFlask } from '../api'; // Importing the Axios instance for Flask
>>>>>>> 4353c732b80537dea39e20140b5e75195065be76

import UserInfo from './UserInfo';
import NavigationBar from './NavigationBar';
import SubtitleEditor from './SubtitleEditor';
import HeadlineEditor from './HeadlineEditor';
import CaptionOptions from './CaptionOptions';
import '../styles/FullScreen.css';
import '../styles/NavigationBar.css';
import '../styles/Sidebar.css';

<<<<<<< HEAD
function RegularUserPage() {
  
  const [showSubtitleEditor, setShowSubtitleEditor] = useState(false);
  const [showHeadlineEditor, setShowHeadlineEditor] = useState(false);
  const [showCaptionOptions, setShowCaptionOptions] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userPaymentPlan, setUserPaymentPlan] = useState('free');
=======
function FreeUserPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videos, setVideos] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [showSubtitleEditor, setShowSubtitleEditor] = useState(false);
  const [showHeadlineEditor, setShowHeadlineEditor] = useState(false);
  const [showCaptionOptions, setShowCaptionOptions] = useState(false);
>>>>>>> 4353c732b80537dea39e20140b5e75195065be76
  const [subtitles, setSubtitles] = useState([]);
  const [headline, setHeadline] = useState('');
  const [captionStyle, setCaptionStyle] = useState({
    position: 'bottom',
    transition: 'pop',
    highlightColor: '#04f827'
  });
  const [activeComponent, setActiveComponent] = useState(null);
  const backgroundVideoRef = useRef(null);
<<<<<<< HEAD
  const navigate = useNavigate();
  const socket = useRef(null);

  const videoOptions = {
    autoplay: true,
    controls: true,
    fluid: true,
    sources: [{
      src: '', // Initially empty, will be set upon fetching video
      type: 'video/mp4'
    }]
  };

  // Initialize Socket.IO client
  useEffect(() => {
    socket.current = io('http://localhost:3000');

    socket.current.on('connect', () => {
      console.log('Connected to socket.io server');
    });

    return () => {
      socket.current.disconnect();
    };
  }, []);

  // Initialize video.js player
  useEffect(() => {
    const player = videojs(backgroundVideoRef.current, videoOptions);

    return () => {
      player.dispose();
    };
  }, []);

  // Fetch videos and user payment plan
  useEffect(() => {
    fetchVideos();
    fetchUserPaymentPlan();

    const handleDoubleClick = () => {
      fetchVideos();
    };

    window.addEventListener('dblclick', handleDoubleClick);

    return () => {
      window.removeEventListener('dblclick', handleDoubleClick);
    };
  }, []);

  const fetchVideos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const randomPage = Math.floor(Math.random() * 10) + 1;
      const response = await axios.get('https://api.pexels.com/videos/popular', {
        headers: { Authorization: 'Your_Pexels_API_Key' },
        params: { per_page: 2, page: randomPage }
      });
      const backgroundVideo = response.data.videos[0].video_files[0].link;

      // Update video source in video.js player
      const player = videojs(backgroundVideoRef.current);
      player.src({ src: backgroundVideo, type: 'video/mp4' });
    } catch (err) {
      setError('Error fetching videos: ' + err.message);
=======
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
    try {
      const response = await apiFlask.get('/signed-urls');
      const signedUrls = response.data.signedUrls;
      if (signedUrls && signedUrls.length > 0) {
        setVideos(signedUrls);
        loadVideo(signedUrls[0]); // Load the first video from the list
      } else {
        setError('No videos found in Google Cloud Storage.');
      }
    } catch (err) {
      setError(`Error fetching videos: ${err.message}`);
>>>>>>> 4353c732b80537dea39e20140b5e75195065be76
    } finally {
      setIsLoading(false);
    }
  };

<<<<<<< HEAD
  const fetchUserPaymentPlan = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, defaulting to free plan');
        setUserPaymentPlan('free');
        return;
      }
  
      const response = await axios.get('http://localhost:3000/api/user/payment-plan', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (response && response.data && response.data.paymentPlan) {
        setUserPaymentPlan(response.data.paymentPlan);
      } else {
        console.log('No payment plan info found, defaulting to free plan');
        setUserPaymentPlan('free');
      }
    } catch (error) {
      console.error('Error fetching user payment plan:', error.message);
      setUserPaymentPlan('free');
    }
  };

  const handleSetActiveComponent = (component) => {
    setActiveComponent(activeComponent === component ? null : component);
  };

  const toggleSubtitleEditor = () => {
    setShowSubtitleEditor(!showSubtitleEditor);
  };

  const toggleHeadlineEditor = () => {
    setShowHeadlineEditor(!showHeadlineEditor);
  };

  const toggleCaptionOptions = () => {
    setShowCaptionOptions(!showCaptionOptions);
  };

  const getCaptionStyle = () => {
    return {
      color: captionStyle.highlightColor,
      positionClass: `caption-${captionStyle.position}`,
      transitionClass: `transition-${captionStyle.transition}`
    };
  };

  const handleRedirection = () => {
    switch(userPaymentPlan) {
      case 'regular':
        navigate('/regular-user');
        break;
      case 'premium':
        navigate('/premium-user');
        break;
      default:
        navigate('/free-user'); // Default or non-registered users
    }
  };
  
  
=======
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
>>>>>>> 4353c732b80537dea39e20140b5e75195065be76

  return (
    <div className="full-screen-container">
      <NavigationBar />
      <div className="sidebar">
<<<<<<< HEAD
        <button onClick={() => handleSetActiveComponent('subtitles')}>Subtitles</button>
        <button onClick={() => handleSetActiveComponent('headline')}>Headline</button>
        <button onClick={() => handleSetActiveComponent('captionOptions')}>Caption Options</button>
=======
        <button onClick={toggleSubtitleEditor}>Subtitles</button>
        <button onClick={toggleHeadlineEditor}>Headline</button>
        <button onClick={toggleCaptionOptions}>Caption Options</button>
>>>>>>> 4353c732b80537dea39e20140b5e75195065be76
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

<<<<<<< HEAD
export default RegularUserPage;
=======
export default FreeUserPage;
>>>>>>> 4353c732b80537dea39e20140b5e75195065be76
