import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/HowItWorks.css';
import '../styles/NavigationBar.css';
import { useNavigate } from 'react-router-dom';

const uploadIcon = require('../assets/uploadIcon.png');
const clipIcon = require('../assets/clipIcon.png');
const shareIcon = require('../assets/shareIcon.png');

const ClipItShorts = () => {
  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="how-it-works-container">
      <Helmet>
        <title>How It Works - ClipIt: Your Shortcut to Viral Content</title>
        <meta name="description" content="Learn how ClipIt revolutionizes content creation with a simple three-step process: Upload, ClipIt, and Share." />
        <link rel="canonical" href="https://www.cliplt.com/clip-it-shorts" />
      </Helmet>
      <div className="container">
        <h1 className="text-white">ClipIt: Your Shortcut to Viral Content</h1>
        <p className="lead text-white">Crafted by a blend of AI specialists and seasoned content creators, our tool delivers your dream content in minutes.</p>
        {/* Responsive design for smaller screens */}
        {windowWidth <= 768 && (
          <div>
            <h2 className="how-does-it-work">How does it work?</h2>
            <div className="row justify-content-start">
              {/* Cards for steps */}
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
            </div>
          </div>
        )}
        <p className="lead text-white">Discover the magic in three easy steps. Transform your content effortlessly with ClipIt.</p>
        {/* Responsive design for larger screens */}
        {windowWidth >= 768 && (
          <div>
            <h2 className="how-does-it-work">How does it work?</h2>
            <div className="row justify-content-start">
              {/* Cards for steps with additional text */}
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
            </div>
          </div>
        )}
        {/* Blog section */}
        <div className="blog-section">
          {/* Blog content goes here */}
          <h2>Revolutionizing Social Media Content Creation with ClipIt</h2>
          <p>In today's digital era, the landscape of social media is rapidly evolving. Short-form videos have become a staple on platforms like Instagram, TikTok, and YouTube Shorts, capturing the attention of audiences worldwide. With this surge, the demand for quick, engaging, and creative content has skyrocketed.</p>
          
          {/* More detailed paragraphs and subheadings */}
          <h3>Understanding the Demand for Short-Form Content</h3>
          <p>Explore the reasons behind the popularity of short-form content, discussing user behavior, platform algorithms, and the impact on content creators. Include relevant statistics and studies.</p>
          
          <h3>The Role of AI in Modern Content Creation</h3>
          <p>Dive into how artificial intelligence is transforming the content creation landscape, specifically in video editing and production. Provide insights into AI-driven analytics, content personalization, and automated editing processes.</p>
          
          <h3>Introducing ClipIt: The AI-Powered Content Creation Tool</h3>
          <p>Present an in-depth overview of ClipIt, explaining how it uses AI to streamline the video editing process. Highlight its key features, such as ease of use, intelligent editing, and compatibility with popular social media platforms.</p>
          
          <h3>The Benefits of Using ClipIt for Content Creators</h3>
          <p>Detail the advantages of using ClipIt, including time savings, improved content quality, accessibility for creators of all skill levels, and the potential for increased engagement and reach on social media platforms.</p>
          
          <h3>Real-World Applications and Success Stories</h3>
          <p>Share case studies or testimonials from users who have successfully used ClipIt to enhance their social media presence. Discuss various scenarios where ClipIt can be particularly effective.</p>
          
          <h3>Future Developments and Continuous Improvement</h3>
          <p>Talk about the future roadmap for ClipIt, including planned updates, feature enhancements, and the ongoing commitment to adapting to changing social media trends and user needs.</p>
          
          <h3>Join the ClipIt Community: Inviting Beta Testers</h3>
          <p>Encourage readers to participate in the beta program, offering them a chance to be among the first to experience ClipIt's capabilities and contribute to its development with their feedback and suggestions.</p>
          
          {/* Conclusion */}
          <h3>Conclusion</h3>
          <p>Summarize the key points discussed in the blog, reiterate the value proposition of ClipIt, and end with a strong call to action inviting readers to try ClipIt and join the community of innovative content creators.</p>
        </div>
      </div>
    </div>
  );
};

export default ClipItShorts;
