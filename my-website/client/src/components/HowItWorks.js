import React, { useState, useEffect, useRef } from 'react';
import NavigationBar from './NavigationBar';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/HowItWorks.css';
import '../styles/NavigationBar.css';
import { useNavigate } from 'react-router-dom';

// Import the icons using require
const uploadIcon = require('../assets/uploadIcon.png');
const clipIcon = require('../assets/clipIcon.png');
const shareIcon = require('../assets/shareIcon.png');

const HowItWorks = () => {
  const navigate = useNavigate();
  const touchStartRef = useRef(0);
  const handleSwipe = (direction) => {
    // Placeholder functions - replace these with actual navigation logic
    const navigateUp = () => navigate('/support'); // Navigate to your next page
    const navigateDown = () => navigate('/explore-further'); // Navigate to your previous page
    if (direction === 'up') navigateUp();
    if (direction === 'down') navigateDown();
  };
  useEffect(() => {
    const handleTouchStart = (e) => {
      touchStartRef.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      if (!touchStartRef.current) return;
      const touchEndY = e.touches[0].clientY;
      if (touchStartRef.current > touchEndY + 50) {
        handleSwipe('up');
      } else if (touchStartRef.current < touchEndY - 50) {
        handleSwipe('down');
      }
    };

    const handleWheel = (e) => {
      if (e.deltaY > 100) {
        handleSwipe('up');
      } else if (e.deltaY < -100) {
        handleSwipe('down');
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
    <div className="how-it-works-container">
      <NavigationBar />
      <div className="container">
        <h1 className="text-black">It's time to <span className="text-primary">ClipIt</span>.</h1>
        <p className="lead text-black">“Creating content has never been this easy" - </p>
        <p className="lead text-black">With our simple 3 step process you can transform long videos into short and exciting content.</p>
        <h2 className="how-does-it-work text-primary">How does it work?</h2>
        <div className="row justify-content-start">
          <div className="col-md-4">
            <div className="card">
              <div className="card-body">
                <img src={uploadIcon} alt="Upload" className="icon" />
                <h3 className="card-title">Upload</h3>
                <p className="card-text">Choose and upload a video of your choosing with a length of up to 2 hours.</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card">
              <div className="card-body">
                <img src={clipIcon} alt="ClipIt" className="icon" />
                <h3 className="card-title">ClipIt</h3>
                <p className="card-text">Using our advanced AI algorithm you can clip your video and edit it with 1,000+ options of customization including effects and audio.</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card">
              <div className="card-body">
                <img src={shareIcon} alt="Share It" className="icon" />
                <h3 className="card-title">Share It</h3>
                <p className="card-text">After choosing and clipping your videos you can simply share your new favorite edits in any platform and let your followers enjoy high-quality content.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;