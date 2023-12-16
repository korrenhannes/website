import React, { useEffect } from 'react';
import '../styles/NavigationBar.css';
import '../styles/Support.css';
import CloudAPIPage from './CloudAPIPage';
import { useNavigate } from 'react-router-dom';

function SupportPage() {
  const navigate = useNavigate();

  const handleScrollSupportPage = (e) => {
    if (e.deltaY < 0) {
      navigate('/how-it-works');
    }
  };

  useEffect(() => {
    window.addEventListener('wheel', handleScrollSupportPage);
    return () => {
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
  );
}

export default SupportPage;
