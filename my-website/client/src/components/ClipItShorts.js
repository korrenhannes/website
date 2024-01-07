import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import NavigationBar from './NavigationBar';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/HowItWorks.css';
import '../styles/NavigationBar.css';
import { useNavigate } from 'react-router-dom';


// Import the icons using require
const uploadIcon = require('../assets/uploadIcon.png');
const clipIcon = require('../assets/clipIcon.png');
const shareIcon = require('../assets/shareIcon.png');

const ClipItShorts = () => {
  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

 
  return (
      <div className="how-it-works-container">
        <Helmet>
          <title>How It Works - ClipIt: Your Shortcut to Viral Content</title>
          <meta name="description" content="Learn how ClipIt revolutionizes content creation with a simple three-step process: Upload, ClipIt, and Share." />
          <link rel="canonical" href="https://www.cliplt.com/how-it-works" />
        </Helmet>
        <div className="container">
          <h1 className="text-white">ClipIt: Your Shortcut to Viral Content.</h1>
          <p className="lead text-white">Crafted by a blend of AI specialists and seasoned content creators, our tool delivers your dream content in minutes.</p>
          {windowWidth <= 768 && (<h2 className="how-does-it-work">How does it work?</h2>
          )}
          {windowWidth <= 768 && (
          <div className="row justify-content-start">
            <div className="card-little">
              <div className="card-body">
                <img src={uploadIcon} alt="Upload" className="icon" />
                <h3 className="card-title">Upload</h3>
              </div>
            </div>
            <div className="card-little">
              <div className="card-body">
                <img src={clipIcon} alt="ClipIt" className="icon" />
                <h3 className="card-title">ClipIt</h3>
              </div>
            </div>
            <div className="card-little">
              <div className="card-body">
                <img src={shareIcon} alt="Share" className="icon" />
                <h3 className="card-title">Share</h3>
              </div>
            </div>
        </div>)}
          <p className="lead text-white">Discover the magic in three easy steps. Transform your content effortlessly with ClipIt.</p>
          {windowWidth >= 768 && (<h2 className="how-does-it-work">How does it work?</h2>)}
          {windowWidth >= 768 && (<div className="row justify-content-start">
              <div className="card-little">
                <div className="card-body">
                  <img src={uploadIcon} alt="Upload" className="icon" />
                  <h3 className="card-title">Upload</h3>
                  <p className="card-text">Choose and upload a video of your choosing with a length of up to 2 hours.</p>
                </div>
              </div>
              <div className="card-little">
                <div className="card-body">
                  <img src={clipIcon} alt="ClipIt" className="icon" />
                  <h3 className="card-title">ClipIt</h3>
                  <p className="card-text">Using our advanced AI algorithm you can clip your video and edit it.</p>
                </div>
              </div>
              <div className="card-little">
                <div className="card-body">
                  <img src={shareIcon} alt="Share" className="icon" />
                  <h3 className="card-title">Share</h3>
                  <p className="card-text">Simply share your new favorite edits in any platform and let your followers enjoy high-quality content.</p>
                </div>
              </div>
          </div>)}
          <div className="blog-section" style={{ display: 'none' }}>
          <h2>Revolutionizing Social Media Content Creation with ClipIt</h2>
          <p>In today's digital era, the landscape of social media is rapidly evolving. Short-form videos have become a staple on platforms like Instagram, TikTok, and YouTube Shorts, capturing the attention of audiences worldwide. With this surge, the demand for quick, engaging, and creative content has skyrocketed.</p>
          
          <p>Understanding this need, we developed ClipIt - a state-of-the-art AI tool designed to transform the way content is created for social media. It's not just an editing tool; it's a revolutionary approach to content creation, tailored for the dynamics of today's social media platforms.</p>
          
          <h3>The Power of AI in Content Creation</h3>
          <p>ClipIt harnesses the latest advancements in AI technology to analyze and condense long videos into compelling short clips. Our algorithm intelligently picks out the most captivating moments, ensuring that your content is not only engaging but also resonates with your audience's preferences.</p>
          
          <h3>From Novice to Pro: ClipIt for Every Creator</h3>
          <p>ClipIt is designed for everyone - from individuals just stepping into the world of content creation to seasoned professionals looking for an edge in their work. Its intuitive interface makes it easy for anyone to create high-quality content, while its advanced features offer depth for those who want to dive deeper into creative possibilities.</p>

          <h3>Embracing the Future of Social Media</h3>
          <p>As social media continues to evolve, ClipIt is at the forefront, continually adapting and improving. Our commitment to innovation ensures that ClipIt remains an essential tool for content creators navigating the ever-changing social media landscape.</p>
          
          <h3>Join Our Beta Program</h3>
          <p>Be part of the future of social media content creation. Our beta program is an opportunity to get early access to ClipIt and contribute to its development. Your feedback and insights are invaluable in shaping a tool that meets the diverse needs of content creators around the globe.</p>
        </div>
      </div>
    </div>
  );
};

export default ClipItShorts;