import React from 'react';
import NavigationBar from './NavigationBar'; // Assuming you have a navigation bar component
import '../styles/FullScreen.css';
import '../styles/NavigationBar.css';
import '../styles/Support.css'; // New CSS file for support page
import CloudAPIPage from './CloudAPIPage';

function SupportPage() {

  return (
    <div className="full-screen-container-support">
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
  );
}

export default SupportPage;

