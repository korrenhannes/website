import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

import UserInfo from './UserInfo';
import NavigationBar from './NavigationBar';
import SubtitleEditor from './SubtitleEditor';
import HeadlineEditor from './HeadlineEditor';
import CaptionOptions from './CaptionOptions';
import '../styles/FullScreen.css';
import '../styles/NavigationBar.css';
import '../styles/Sidebar.css';

function RegularUserPage() {
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
    // Initialize video.js player
    playerRef.current = videojs(backgroundVideoRef.current, {
      autoplay: true,
      controls: true,
      fluid: true,
    }, () => {
      console.log('Player is ready');
      fetchVideosFromGCloud();
    });

    // Dispose the player on dismount
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
      }
    };
  }, []);

  const fetchVideosFromGCloud = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:3000/api/signed-urls');
      const signedUrls = response.data.signedUrls;
      if (signedUrls && signedUrls.length > 0) {
        setVideos(signedUrls);
        // Set the source for the video player
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

  return (
    <div className="full-screen-container">
      <NavigationBar />
      <div className="sidebar">
        <button onClick={() => setShowSubtitleEditor(!showSubtitleEditor)}>Subtitles</button>
        <button onClick={() => setShowHeadlineEditor(!showHeadlineEditor)}>Headline</button>
        <button onClick={() => setShowCaptionOptions(!showCaptionOptions)}>Caption Options</button>
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

export default RegularUserPage;
