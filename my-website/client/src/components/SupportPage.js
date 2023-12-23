import React, { useState, useEffect, useRef } from 'react';
import '../styles/NavigationBar.css';
import '../styles/Support.css';
import CloudAPIPage from './CloudAPIPage';
import { useNavigate } from 'react-router-dom';

function SupportPage() {
  const navigate = useNavigate();
  const touchStartRef = useRef(0);
  const touchEndRef = useRef(0);  // Added a ref for touch end position
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const handleSwipe = () => {
    // Calculate the vertical swipe distance
    const distance = touchEndRef.current - touchStartRef.current;

    // Swipe up
    if (distance < -50) {
      navigate('/next-page');
    }
    // Swipe down
    else if (distance > 50) {
      navigate('/how-it-works');
    }
  };

  useEffect(() => {
    const handleTouchStart = (e) => {
      touchStartRef.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
      touchEndRef.current = e.changedTouches[0].clientY;
      handleSwipe(); // Call handleSwipe on touch end
    };

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('resize', handleResize);
    
    const handleScrollSupportPage = (e) => {
      if (e.deltaY < 0) {
        navigate('/how-it-works');
      }
    };

    window.addEventListener('wheel', handleScrollSupportPage);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('wheel', handleScrollSupportPage);
    };
  }, [navigate]);
  
  return (
    <div className="support-page">
      <video autoPlay loop muted className="support-background-video">
        <source src="/path-to-your-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <footer className="top-half">
        <CloudAPIPage enableScrollHandling={false} />
      </footer>
      <footer className="support-footer">
        <div className="footer-content">
          <div className="footer-section company-info">
            <h4>Company (put info and contact)</h4>
            <ul>
              <li><a href="/affiliate">Contact us</a></li>
              <li><a href="/contact">Become an affiliate</a></li>
            </ul>
          </div>
          <div className="footer-section best-practices">
            <h4>share your thoughts</h4>
            <ul>
              <li><a href="/affiliate">    Contact us</a></li>
              <li><a href="/guide/turn-videos-into-shorts">Our WhatsUp: 972527242424 </a></li>
              <li><a href="/guide/create-videos">Our mail: korren@clipitshorts.com</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default SupportPage;
