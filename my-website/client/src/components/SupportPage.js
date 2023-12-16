import React, { useEffect } from 'react';
import '../styles/FullScreen.css';
import '../styles/NavigationBar.css';
import '../styles/Support.css'; // New CSS file for support page
import CloudAPIPage from './CloudAPIPage';
import { useNavigate } from 'react-router-dom';
import { Controller, Scene } from 'react-scrollmagic-r18';




function SupportPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Customize scrolling behavior for the Support Page
    const handleScroll = (e) => {
      if (e.deltaY < 100) {
        navigate('/how-it-works');
      }
    };

    // Add a scroll event listener for the Support Page
    window.addEventListener('wheel', handleScroll);

    // Remove the event listener when the component unmounts
    return () => {
      window.removeEventListener('wheel', handleScroll);
    };
  }, []);
  return (
    <Controller>
    <Scene triggerHook="onCenter" duration={300} offset={-100}>
      {(progress) => (
        <div className="full-screen-container-support" style={{ opacity: progress, transform: `scale(${progress})` }}>
          <footer className="top-half">
            <CloudAPIPage />
          </footer>
          <footer className="support-footer">
            <div className="footer-content">
              <div className="footer-section company-info">
                <h4>Company (put info and contact)</h4>
                <ul>
                  <li><a href="/our-story">Our story</a></li>
                  <li><a href="/affiliate">Become an affiliate</a></li>
                  <li><a href="/media-assets">clipIt media assets</a></li>
                  <li><a href="/contact">Contact us</a></li>
                </ul>
              </div>
              
              <div className="footer-section best-practices">
                <h4>our buttons (put all buttons from nav bar)</h4>
                <ul>
                  <li><a href="/guide/turn-videos-into-shorts">How to Turn Long Videos into Viral Shorts</a></li>
                  <li><a href="/guide/create-videos">Create Videos in Alex Hormozi Style</a></li>
                  <li><a href="/guide/how-opusclip-works">How Does OpusClip Work</a></li>
                </ul>
              </div>
            </div>
          </footer>
        </div>
    )}
    </Scene>
  </Controller>
  );
}

export default SupportPage;

