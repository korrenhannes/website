import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import UserInfo from './UserInfo';
import NavigationBar from './NavigationBar';
import SubtitleEditor from './SubtitleEditor';
import HeadlineEditor from './HeadlineEditor';
import CaptionOptions from './CaptionOptions';
import '../styles/FullScreen.css';
import '../styles/NavigationBar.css';
// Add a new CSS import for the sidebar
import '../styles/Sidebar.css';

function RegularUserPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userPaymentPlan, setUserPaymentPlan] = useState('free');
  const [subtitles, setSubtitles] = useState([]); // Subtitles array
  const [headline, setHeadline] = useState(''); // Headline state
  const [captionStyle, setCaptionStyle] = useState({ // Caption style state
    position: 'bottom', // 'top', 'middle', 'bottom'
    transition: 'pop', // 'karaoke', 'popline', 'pop', 'scale', 'slideLeft', 'slideUp'
    highlightColor: '#04f827' // Highlight color for caption
  });
  const backgroundVideoRef = useRef(null);
  const navigate = useNavigate();

  const [showSubtitleEditor, setShowSubtitleEditor] = useState(false);
  const [showHeadlineEditor, setShowHeadlineEditor] = useState(false);
  const [showCaptionOptions, setShowCaptionOptions] = useState(false);

  const PEXELS_API_KEY = 'hKTWEteFrhWt6vY5ItuDO4ZUwVx2jvnfr0wtDgeqhIyedZyDXVDutynu'; // Replace with your Pexels API key
  const PEXELS_API_URL = 'https://api.pexels.com/videos/popular';

  const fetchVideos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Add a random factor to the API call, such as random page number
      const randomPage = Math.floor(Math.random() * 10) + 1; // Random page number between 1 and 10
      const response = await axios.get(PEXELS_API_URL, {
        headers: {
          Authorization: PEXELS_API_KEY
        },
        params: {
          per_page: 2,
          page: randomPage // Use the random page number
        }
      });
      const backgroundVideo = response.data.videos[0].video_files[0].link;
      backgroundVideoRef.current.src = backgroundVideo;
    } catch (err) {
      setError('Error fetching videos from Pexels: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

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


  useEffect(() => {
    fetchVideos();
    fetchUserPaymentPlan();

    // Double click event listener for fetching new video
    const handleDoubleClick = () => {
      fetchVideos();
    };

    window.addEventListener('dblclick', handleDoubleClick);

    return () => {
      window.removeEventListener('dblclick', handleDoubleClick);
    };
  }, []);

  const handleRedirection = () => {
    // Redirect based on payment plan
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

  const getCaptionStyle = () => {
    const style = {
      // Add other styles like color, transition effects based on captionStyle state
      color: captionStyle.highlightColor,
      // This example assumes you have predefined CSS classes for positions and transitions
      positionClass: `caption-${captionStyle.position}`, 
      transitionClass: `transition-${captionStyle.transition}`
    };
    return style;
  };

  const { positionClass, transitionClass } = getCaptionStyle();
  const toggleSubtitleEditor = () => setShowSubtitleEditor(!showSubtitleEditor);
  const toggleHeadlineEditor = () => setShowHeadlineEditor(!showHeadlineEditor);
  const toggleCaptionOptions = () => setShowCaptionOptions(!showCaptionOptions);

  return (
    <div className="full-screen-wrapper">
      <NavigationBar />
      <div className="sidebar">
        <button onClick={toggleSubtitleEditor}>Subtitles</button>
        <button onClick={toggleHeadlineEditor}>Headline</button>
        <button onClick={toggleCaptionOptions}>Caption Options</button>
      </div>
      <div className="full-screen-container">
        <video ref={backgroundVideoRef} autoPlay muted loop id="background-video"></video>
        <div className="foreground-content">
          {showSubtitleEditor && <SubtitleEditor subtitles={subtitles} setSubtitles={setSubtitles} videoRef={backgroundVideoRef} />}
          {showHeadlineEditor && <HeadlineEditor headline={headline} setHeadline={setHeadline} />}
          {showCaptionOptions && <CaptionOptions captionStyle={captionStyle} setCaptionStyle={setCaptionStyle} />}
          <div className="video-subtitles">
            {subtitles.find(sub => sub.startTime <= backgroundVideoRef.current.currentTime && sub.endTime >= backgroundVideoRef.current.currentTime)?.text}
          </div>
          <div className="video-headline">{headline}</div>
        </div>
        {isLoading && <p>Loading...</p>}
        {error && <p>Error: {error}</p>}
      </div>
    </div>
  );
}

export default RegularUserPage;