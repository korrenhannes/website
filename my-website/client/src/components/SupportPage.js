import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { apiFlask } from '../api'; // Importing the Axios instance for Flask
import { useNavigate } from 'react-router-dom';
import NavigationBar from './NavigationBar';
import SubtitleEditor from './SubtitleEditor';
import HeadlineEditor from './HeadlineEditor';
import CaptionOptions from './CaptionOptions';
import '../styles/FullScreen.css';
import '../styles/NavigationBar.css';
import '../styles/Sidebar.css';

function SupportPage() {
    const navigate = useNavigate();
    const touchStartRef = useRef(0);
    const handleSwipe = (direction) => {
      // Placeholder functions - replace these with actual navigation logic
      const navigateDown = () => navigate('/how-it-works'); // Navigate to your previous page
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
      <div className="full-screen-container">
        <NavigationBar /> {/* Make sure to style this component to match the image */}
        <div className="sidebar">
          {/* Populate with actual links and category names */}
          <h3>Company</h3>
          <a href="/blog">Blog</a>
          {/* ... other links */}
          <h3>Best Practices</h3>
          <a href="/how-to-videos">How to Turn Long Videos into Viral Shorts</a>
          {/* ... other links */}
        </div>
        <div className="content">
          <h1>this is the support of <span className="text-primary">ClipIt</span>.</h1>
          {/* The rest of your content */}
        </div>
      </div>
    );
}

export default SupportPage;
