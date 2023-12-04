import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { apiFlask } from '../api'; // Importing the Axios instance for Flask

import UserInfo from './UserInfo';
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
    // Initialize Video.js player
    const initVideoPlayer = () => {
      if (backgroundVideoRef.current) {
        playerRef.current = videojs(backgroundVideoRef.current, {
          autoplay: true,
          controls: true,
          fluid: true,
        }, () => {
          console.log('Player is ready');
          fetchVideosFromGCloud();
        });
      }
    };

    initVideoPlayer();

    return () => {
      // Dispose the player on dismount
      if (playerRef.current) {
        playerRef.current.dispose();
      }
    };
  }, []);

  const fetchVideosFromGCloud = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiFlask.get('/signed-urls'); // Using Flask Axios instance
      const signedUrls = response.data.signedUrls;
      if (signedUrls && signedUrls.length > 0) {
        setVideos(signedUrls);
        playerRef.current.src({ src: signedUrls[0], type: 'video/mp4' });
      } else {
        setError('No videos found in Google Cloud Storage.');
      }
    } catch (err) {
      setError(`Error fetching videos: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

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
