import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { apiFlask } from '../api'; // Assuming this is the correct import for your Flask API
import NavigationBar from './NavigationBar';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/NavigationBar.css';
import '../styles/ExploreFurther.css';

const ContentSection = () => (
  <div className="content-section">
    <h2 className="content-heading">“Content creation has never been this easy!”</h2>
    <p className="content-description">With our innovative algorithm, you will be able to make your favorite podcasts and videos into content for your viewers with a push of a button.</p>
    <button className="cliplt-button">Cliplt</button>
    <div className="video-thumbnails">
      {[...Array(5)].map((_, index) => (
        <div key={index} className="video-thumbnail"></div>
      ))}
    </div>
  </div>
);

function ExploreFurther() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videos, setVideos] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videoRef = useRef(null);
  const navigate = useNavigate();
  const playerRef = useRef(null);

  const fetchVideosFromGCloud = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiFlask.get('/signed-urls');
      const signedUrls = response.data.signedUrls;
      if (signedUrls && signedUrls.length > 0) {
        setVideos(signedUrls); // Save the list of video URLs
        setTimeout(() => {
          if (videoRef.current && !playerRef.current) {
            playerRef.current = videojs(videoRef.current, {
              autoplay: true,
              muted: true,
              controls: true,
              fluid: true,
              sources: [{ src: signedUrls[currentVideoIndex], type: 'video/mp4' }]
            });

            playerRef.current.on('ended', () => {
              // Increment the index or loop back to the start
              const nextVideoIndex = (currentVideoIndex + 1) % signedUrls.length;
              setCurrentVideoIndex(nextVideoIndex); // Update the state to the new index
            });
          }
        }, 0);
      } else {
        setError('No videos found in Google Cloud Storage.');
      }
    } catch (err) {
      setError(`Error fetching videos from Google Cloud: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideosFromGCloud();

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [navigate]);

  useEffect(() => {
    // Whenever the currentVideoIndex changes, load the new video
    if (videos.length > 0 && playerRef.current) {
      playerRef.current.src({ src: videos[currentVideoIndex], type: 'video/mp4' });
      playerRef.current.load();
      playerRef.current.play();
    }
  }, [currentVideoIndex, videos]);

  return (
    <div className="explore-further-container">
      <NavigationBar />
      <div className="main-content">
        <div className="video-tab-container">
          <video ref={videoRef} className="video-js" />
        </div>
        <ContentSection />
      </div>
      {isLoading && <div className="text-center mt-3">Loading...</div>}
      {error && <div className="text-danger text-center mt-3">{error}</div>}
    </div>
  );
}

export default ExploreFurther;
