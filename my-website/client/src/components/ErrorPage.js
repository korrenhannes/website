import React from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import '../styles/ErrorPage.css';

const ErrorPage = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/cloud-api');
  };

  return (
    <div className="error-container">
      <Helmet>
        <title>404 Not Found - Revolutionize Your Social Media with ClipIt Shorts AI</title>
        <meta name="description" content="Encountered a 404 error at ClipIt? Discover how our AI-powered tool is changing the game in social media content creation." />
      </Helmet>
      
      <h1>404 - ClipIt Shorts AI Page Not Found</h1>
      <p>Oops! The page you are looking for does not exist. It might have been moved or deleted. But don't worry, we've got something interesting for you!</p>
      <button onClick={handleGoBack} className="go-back-btn">
        Go Back to Home
      </button>

      <div className="blog-section">
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

        <p>Don't let a 404 dampen your spirits. Instead, embrace the opportunity to revolutionize your content creation process with ClipIt. Visit our website to learn more and become a part of our beta program. Together, let's set new standards in social media content creation.</p>
      </div>
    </div>
  );
}

export default ErrorPage;
