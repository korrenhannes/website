import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/ClipItShorts.css';
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
    <div className="clip-how-it-works-container">
      <Helmet>
        <title>How It Works - ClipIt: Your Shortcut to Viral Content</title>
        <meta name="description" content="Learn how ClipIt revolutionizes content creation with a simple three-step process: Upload, ClipIt, and Share." />
        <link rel="canonical" href="https://www.cliplt.com/clip-it-shorts" />
      </Helmet>
      <div className="container">
        <h1 className="text-black">ClipIt: Your Shortcut to Viral Content</h1>
        <p className="lead text-black">Crafted by a blend of AI specialists and seasoned content creators, our tool delivers your dream content in minutes.</p>
        {/* Responsive design for smaller screens */}
        {windowWidth <= 768 && (
          <div>
            <h2 className="how-does-it-work">How does it work?</h2>
            <div className="row justify-content-start">
              {/* Cards for steps */}
              <div className="card-little2">
                <div className="card-body">
                  <img src={uploadIcon} alt="Upload" className="icon" />
                  <h3 className="card-title">Upload</h3>
                </div>
              </div>
              <div className="card-little2">
                <div className="card-body">
                  <img src={clipIcon} alt="ClipIt" className="icon" />
                  <h3 className="card-title">ClipIt</h3>
                </div>
              </div>
              <div className="card-little2">
                <div className="card-body">
                  <img src={shareIcon} alt="Share" className="icon" />
                  <h3 className="card-title">Share</h3>
                </div>
              </div>
            </div>
          </div>
        )}
        <p className="lead text-black">Discover the magic in three easy steps. Transform your content effortlessly with ClipIt.</p>
        {/* Responsive design for larger screens */}
        {windowWidth >= 768 && (
          <div>
            <h2 className="how-does-it-work">How does it work?</h2>
            <div className="row justify-content-start">
              {/* Cards for steps with additional text */}
              <div className="card-little2">
                <div className="card-body">
                  <img src={uploadIcon} alt="Upload" className="icon" />
                  <h3 className="card-title">Upload</h3>
                  <p className="card-text1">Choose and upload a video of your choosing with a length of up to 2 hours.</p>
                </div>
              </div>
              <div className="card-little2">
                <div className="card-body">
                  <img src={clipIcon} alt="ClipIt" className="icon" />
                  <h3 className="card-title">ClipIt</h3>
                  <p className="card-text1">Using our advanced AI algorithm you can clip your video and edit it.</p>
                </div>
              </div>
              <div className="card-little2">
                <div className="card-body">
                  <img src={shareIcon} alt="Share" className="icon" />
                  <h3 className="card-title">Share</h3>
                  <p className="card-text1">Simply share your new favorite edits in any platform and let your followers enjoy high-quality content.</p>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Blog section */}
        <div className="blog-section">
          <h2>Revolutionizing Social Media Content Creation with ClipIt</h2>
          <p>As we delve into the era of digital transformation, the demand for quick, impactful, and engaging content is at an all-time high. Platforms like <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>, <a href="https://www.tiktok.com" target="_blank" rel="noopener noreferrer">TikTok</a>, and <a href="https://www.youtube.com/shorts" target="_blank" rel="noopener noreferrer">YouTube Shorts</a> are driving a new wave of short-form video content, making it essential for content creators to rapidly adapt and evolve.</p>
          
          <h3>Understanding the Demand for Short-Form Content</h3>
          <p>The shift towards short-form content is not just a trend but a reflection of changing audience preferences. Today's users seek quick, digestible content that fits into their fast-paced lifestyles. This shift has challenged content creators to rethink their strategies and find tools that can keep up with these demands. ClipIt emerges as a solution in this changing landscape, offering an efficient way to create compelling content that resonates with contemporary audiences.</p>
          
          <h3>The Role of AI in Modern Content Creation</h3>
          <p>The advent of AI in content creation marks a significant turning point. AI technologies like those in ClipIt are not just about automation; they're about enhancing creativity and delivering personalized content experiences. By analyzing large datasets, AI can identify trends, suggest edits, and even predict what type of content is likely to perform well, making it an indispensable tool for modern content creators.</p>
          
          <h3>Introducing ClipIt: The AI-Powered Content Creation Tool</h3>
          <p>ClipIt stands at the intersection of technology and creativity. It harnesses the power of AI to simplify the content creation process. From automatically editing long videos to creating engaging short clips, ClipIt is designed to help creators focus more on their creative expression and less on the tedious aspects of video editing. Its intuitive interface ensures that even those with minimal editing experience can produce high-quality content.</p>
          
          <h3>The Benefits of Using ClipIt for Content Creators</h3>
          <p>ClipIt offers a multitude of benefits for content creators. Firstly, it drastically reduces the time and effort involved in editing. Secondly, its AI-driven insights help in creating content that is more likely to engage and captivate the target audience. Lastly, it democratizes content creation, making high-quality video editing accessible to everyone, regardless of their technical expertise.</p>
          
          <h3>Real-World Applications and Success Stories</h3>
          <p>ClipIt has already made a significant impact in various domains. From social media influencers to small businesses, many have leveraged its capabilities to enhance their online presence. Success stories from our community highlight how ClipIt has enabled creators to achieve remarkable engagement and growth on social media platforms.</p>
          
          <h3>Future Developments and Continuous Improvement</h3>
          <p>At ClipIt, we are committed to continuous improvement and innovation. We constantly update our algorithms to align with the latest trends and user preferences. Our roadmap includes exciting new features and enhancements that will further redefine the landscape of content creation.</p>
          
          <h3>Join the ClipIt Community: Inviting Beta Testers</h3>
          <p>We invite you to join our beta program and be part of the future of social media content creation. As a beta tester, you will have early access to the latest features and the opportunity to shape the future of ClipIt. Your feedback is crucial in helping us create a tool that meets the evolving needs of the digital content world.</p>
          
          <h3>Conclusion</h3>
          <p>ClipIt is more than just a tool; it's a gateway to unlocking your creative potential in the digital age. Whether you're a professional content creator or just starting, ClipIt is designed to elevate your content creation process. We invite you to explore ClipIt and experience the future of content creation.</p>
        </div>
      </div>
    </div>
  );
};

export default ClipItShorts;
