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
      <title>ClipIt: Your AI Video Wizard</title>
        <meta name="description" content="Join the ClipIt revolution! Unleash your creativity with our AI-powered video editing tool. It's time to make your videos sparkle!" />
        <link rel="canonical" href="https://www.cliplt.com/clip-it-shorts" />
      </Helmet>
      <div className="container">
        <h1 className="text-black">Welcome to ClipIt - Where Videos Get Their Magic!</h1>
        <p className="lead text-black">Dive into the enchanting world of ClipIt, where every video turns into a masterpiece. Whether you're a video virtuoso or just starting out, our AI genie is here to jazz up your content. Ready to make some editing magic?</p>
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
        <p className="lead text-black"></p>
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
          <h2>ClipIt Chronicles: The New Era of Social Media Storytelling</h2>
          <p>Step into the fast-paced world of digital storytelling, where platforms like Instagram, TikTok, and YouTube Shorts reign supreme. ClipIt is here to be your trusty sidekick, turning your creative sparks into blazing content!</p>
          
          <h3>Adapting to the Short-Form Content Wave</h3>
          <p>With the audience's preference shifting towards succinct and engaging videos, content creators must evolve their strategies. ClipIt offers a streamlined solution for crafting content that resonates with modern viewers, enabling creators to stay ahead in the competitive digital space.</p>
          
          <h3>AI: The Game Changer in Video Editing</h3>
          <p>ClipIt integrates cutting-edge AI to redefine video editing, transforming it from a time-consuming task to an avenue of creative exploration. This AI-powered approach not only streamlines the editing process but also offers personalized suggestions, making your content more impactful. Explore the impact of AI in video editing in this insightful article from <a href="https://www.technologyreview.com/2020/07/29/1005725/ai-video-editing/" target="_blank" rel="noopener noreferrer">MIT Technology Review</a>.</p>
          
          <h3>Experience the ClipIt Advantage</h3>
          <p>ClipIt is not just a tool; it's a partner in your creative journey. It democratizes video editing, making it accessible to all, regardless of skill level. Discover advanced editing techniques and stay ahead of the curve with resources from <a href="https://www.adobe.com/creativecloud/video/discover/best-video-editing-software.html" target="_blank" rel="noopener noreferrer">Adobe</a>.</p>
          
          <h3>Transforming Content Creation with ClipIt</h3>
          <p>ClipIt's innovative features significantly reduce editing time, offer AI-driven insights for better engagement, and open up the world of high-quality video editing to everyone. Enhance your editing skills with tips from <a href="https://www.videomaker.com/article/c10/17026-5-tips-for-better-video-editing/" target="_blank" rel="noopener noreferrer">VideoMaker</a>.</p>
          
          <h3>Real-World Impact of ClipIt</h3>
          <p>ClipIt has been a game-changer for diverse users, from influencers to small business owners. Our community's success stories demonstrate ClipIt's role in achieving remarkable online engagement and growth.</p>
          
          <h3>ClipIt's Continuous Evolution</h3>
          <p>Our commitment to innovation keeps ClipIt at the forefront of content creation technology. Stay updated on our latest developments and be part of our journey towards redefining video editing.</p>
          
          <h3>Become a ClipIt Superstar</h3>
          <p>Why just follow trends when you can set them? Join our beta program for early access to supercool features and help steer the ClipIt ship. We value your genius ideas in our quest to revolutionize digital content creation.</p>

          <h3>Unlock Your Epic Storytelling Powers with ClipIt</h3>
          <p>Are you ready to be the hero of your creative journey? ClipIt is more than a tool – it's your secret potion in the digital realm. Let's start this adventure together!</p>
        </div>
        <div className="ai-video-generators-section">
          <h2>Exploring AI-Powered Short Video Generators</h2>
          <p>The landscape of AI-driven video editing tools is diverse, offering a range of solutions for content creators. Let's delve into some of the leading AI short video generators that are shaping the future of digital storytelling.</p>

          <h3>1. ClipIt: Simplifying Video Editing</h3>
          <p>At the forefront of innovation, ClipIt leverages AI to automate video editing processes, making it easier for creators to focus on their story. Its intuitive design and powerful features offer a seamless experience from upload to share.</p>

          <h3>2. Lumen5: Transforming Text to Video</h3>
          <p>Lumen5 stands out for its ability to convert text content into engaging video formats. Ideal for social media content and marketing, it uses AI to suggest visuals and layouts based on the text input. Learn more about <a href="https://lumen5.com" target="_blank" rel="noopener noreferrer">Lumen5's text-to-video capabilities</a>.</p>

          <h3>3. Magisto: Smart Video Storytelling</h3>
          <p>Magisto employs AI to analyze and compile the best parts of your footage, creating compelling video narratives. It's widely used for creating quick social media posts and marketing videos. Discover more about <a href="https://www.magisto.com" target="_blank" rel="noopener noreferrer">Magisto's smart video storytelling</a>.</p>

          <h3>4. RunwayML: For the Creative Professionals</h3>
          <p>RunwayML is a favorite among creative professionals. It provides advanced tools for video editing, powered by machine learning, catering to high-end production needs. Explore <a href="https://runwayml.com" target="_blank" rel="noopener noreferrer">RunwayML's advanced editing tools</a>.</p>

          <h3>5. Synthesia: AI Video Generation</h3>
          <p>Synthesia excels in creating AI-generated videos from text inputs. It is particularly known for its ability to create videos with virtual avatars and synthetic voices, offering a unique approach to content creation. Learn about <a href="https://www.synthesia.io" target="_blank" rel="noopener noreferrer">Synthesia's AI video generation</a>.</p>

          <h3>6. Descript: Video Editing and Transcription</h3>
          <p>Descript goes beyond traditional video editing by offering transcription services. It's useful for podcasters and content creators who require both video editing and text manipulation. Find out more about <a href="https://www.descript.com" target="_blank" rel="noopener noreferrer">Descript's editing and transcription services</a>.</p>

          <h3>Conclusion</h3>
          <p>These AI video generators represent just a glimpse into the rapidly evolving world of digital content creation. As technology advances, we can expect more innovative tools to emerge, further simplifying and enhancing the video creation process.</p>
        </div>

      </div>
    </div>
  );
};

export default ClipItShorts;
