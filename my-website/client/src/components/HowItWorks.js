<<<<<<< HEAD
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NavigationBar from './NavigationBar';
import '../styles/FullScreen.css';
import '../styles/NavigationBar.css';
import '../styles/HowItWorks.css'; // Assuming you have a separate CSS file for this component

// Component for the "Dream Bigger" section
const DreamBiggerSection = () => (
    <div className="section dream-bigger">
      <h2>Dream Bigger</h2>
      <p>You're not just an influencer; you're a storyteller. Our software helps you tell your story more effectively, condensing long videos into impactful, engaging summaries.</p>
    </div>
  );
  
  
  // Component for "Ride the Wave of Efficiency"
  const EfficiencyWaveSection = () => (
    <div className="section efficiency-wave">
      <h2>Ride the Wave of Efficiency</h2>
      <p>Save hours of editing, produce more content faster, and adapt your videos to the ever-evolving landscape of social media with ease.</p>
    </div>
  );
  
  // Component for "Join the Revolution"
  const JoinRevolutionSection = () => (
    <div className="section join-revolution">
      <h2>Join the Revolution</h2>
      <p>Be the trendsetter, innovate your content, inspire your audience, and build your legacy with powerful and unforgettable content.</p>
    </div>
  );
  
function HowItWorks() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userPaymentPlan, setUserPaymentPlan] = useState('free');
  const backgroundVideoRef = useRef(null);
  const navigate = useNavigate();
  const touchStartRef = useRef(null);

  const PEXELS_API_KEY = 'hKTWEteFrhWt6vY5ItuDO4ZUwVx2jvnfr0wtDgeqhIyedZyDXVDutynu'; // Replace with your Pexels API key
  const PEXELS_API_URL = 'https://api.pexels.com/videos/popular';

  const fetchVideos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const randomPage = Math.floor(Math.random() * 10) + 1;
      const response = await axios.get(PEXELS_API_URL, {
        headers: {
          Authorization: PEXELS_API_KEY
        },
        params: {
          per_page: 2,
          page: randomPage
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

    const handleTouchStart = (e) => {
      touchStartRef.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      if (!touchStartRef.current) {
        return;
      }

      const touchEndY = e.touches[0].clientY;
      if (touchStartRef.current > touchEndY + 50) {
        navigate('/explore-further');
      } else if (touchStartRef.current < touchEndY - 50) {
        // Swiping up will navigate to the 'cloud-api' directory
        navigate('/cloud-api');
      }
    };

    const handleWheel = (e) => {
      if (e.deltaY > 100) { // Adjust threshold based on your preference
        navigate('/explore-further');
      } else if (e.deltaY < -100) {
        // Swiping up will navigate to the 'cloud-api' directory
        navigate('/cloud-api');
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('wheel', handleWheel);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return (
    <div className="full-screen-container">
      <NavigationBar />
      <video ref={backgroundVideoRef} autoPlay muted loop id="background-video"></video>
      <div className="foreground-content">
        <h1>Transform Your Content, Transform Your Influence</h1>
        <DreamBiggerSection />
        <EfficiencyWaveSection />
        <JoinRevolutionSection />
        {/* Additional sections as needed */}
      </div>
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
    </div>
  );
}

export default HowItWorks;
=======
import React from 'react';
import NavigationBar from './NavigationBar';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/HowItWorks.css';
import '../styles/NavigationBar.css';

const HowItWorks = () => {
  return (
    <div className="how-it-works-container">
      <NavigationBar />
      <div className="container my-5">
        <h1>It's time to Cliplt.</h1>
        <p className="lead">“Creating content has never been this easy” - With our simple 3 step process you can transform long videos into short and exciting content.</p>
        <h2 className="how-does-it-work">How does it work?</h2>
        <div className="row justify-content-center">
          <div className="col-md-4 step">
            <img src="/path-to-your-icons/upload-icon.png" alt="Upload" className="icon" />
            <h3>Upload.</h3>
            <p>Choose and upload a video of your choosing with a length of up to 2 hours.</p>
          </div>
          <div className="col-md-4 step">
            <img src="/path-to-your-icons/ai-icon.png" alt="Cliplt" className="icon" />
            <h3>Cliplt.</h3>
            <p>Using our advanced AI algorithm you can clip your video and edit it with 1,000+ options of customization including effects and audio.</p>
          </div>
          <div className="col-md-4 step">
            <img src="/path-to-your-icons/share-icon.png" alt="Share" className="icon" />
            <h3>Share it.</h3>
            <p>After choosing and clipping your videos you can simply share your new favorite edits in any platform and let your followers enjoy high-quality content.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
>>>>>>> 4353c732b80537dea39e20140b5e75195065be76
