import React from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import '../styles/ErrorPage.css';

const ErrorPage = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/home');
  };

  return (
    <div className="error-container">
      <Helmet>
        <title>404 Not Found - Revolutionize Your Social Media with ClipIt Shorts AI</title>
        <meta name="description" content="Encountered a 404 error at ClipIt? Discover how our AI-powered tool is changing the game in social media content creation." />
        <link rel="canonical" href="https://www.cliplt.com/404" /> 
        <meta name="robots" content="noindex, follow" /> 
      </Helmet>
      
      <h1>404 - ClipIt Shorts AI Page Not Found</h1>
      <p>Oops! The page you are looking for does not exist. It might have been moved or deleted. But don't worry, we've got something interesting for you!</p>
      <button onClick={handleGoBack} className="go-back-btn">
        Go Back to Home
      </button>

      <div className="blog-section">
        <p>Don't let a 404 dampen your spirits. Instead, embrace the opportunity to revolutionize your content creation process with ClipIt. Visit our website to learn more and become a part of our beta program. Together, let's set new standards in social media content creation.</p>
      </div>
    </div>
  );
}

export default ErrorPage;
