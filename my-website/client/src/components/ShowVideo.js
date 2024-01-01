import React, { useState, useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { apiFlask } from '../api'; // Importing the Axios instance for Flask
import { jwtDecode } from 'jwt-decode';
import { PAGE_CONTEXT } from './constants'; // Import the constants
import styles from '../styles/FreeUserPage.module.css';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import axios from 'axios';



function ShowVideo({pageContext, updateVideoUrl }){
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [videos, setVideos] = useState([]);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [userEmail, setUserEmail] = useState('');
    const [userVideosLoaded, setUserVideosLoaded] = useState(false);
    const videoContainerRef = useRef(null); // Ref for the video container
    const backgroundVideoRef = useRef(null);
    const playerRef = useRef(null);
    const navigate = useNavigate(); // Initialize useNavigate
    const [isMuted, setIsMuted] = useState(true); // New state for mute control


    let videoContainerStyle= styles.videocontainer1;
    if (pageContext===PAGE_CONTEXT.EXPLORE_FURTHER){
        videoContainerStyle='video-tab-container ';
    }
  useEffect(() => {
    setTimeout(() => {
      if (backgroundVideoRef.current && !playerRef.current) {
        playerRef.current = videojs(backgroundVideoRef.current, {
          autoplay: true,
          muted: true,
          controls: true,
          fluid: true,
          loop: true,
          preload: true
        }, () => {
          console.log('Player is ready');
          fetchVideosFromGCloud();
          playerRef.current.addClass('vjs-waiting'); // Add waiting class when setting up player
          playerRef.current.bigPlayButton.hide();
          playerRef.current.controlBar.hide();
          const controlBarChildren = playerRef.current.controlBar.children();
          controlBarChildren.forEach(component => {
            // You may want to keep some components like 'ProgressControl'
           
              component.hide();
            
          });
          // ... inside your useEffect after the player is ready
          playerRef.current.controlBar.pictureInPictureToggle.hide();

        });
  
        playerRef.current.on('ended', () => {
          fetchVideosFromGCloud();
        });
  
        // Handle 'nextVideo' event
        playerRef.current.on('nextVideo', () => {
          loadNextVideo();
        });
        
      }
    }, 0);
  

    return () => {
      if (playerRef.current) {
        playerRef.current.off('ended');
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [backgroundVideoRef]);

  // Function to check the upload status
  const checkUploadStatus = async () => {
    try {
      const response = await axios.get('/api/check-upload-status', {
        params: { email: userEmail }
      });
      return response.data.uploadComplete;
    } catch (error) {
      console.error('Error checking upload status:', error);
      return true; // Default to true to avoid continuous checks in case of an error
    }
  };

  const fetchVideosFromGCloud = async () => {
    setIsLoading(true);
    setError(null);
    let emailToUse = userEmail;

    // Check for email in the state, if not present, decode from the token
    if (!emailToUse) {
    const token = localStorage.getItem('token');
    if (token) {
        try {
        const decoded = jwtDecode(token);
        emailToUse = decoded.email;
        setUserEmail(decoded.email);
        } catch (error) {
        console.error("Error decoding token:", error);
        setError('Authentication error. Please log in again.');
        setIsLoading(false);
        return;
        }
    }
    }
    
    // Fetch the signed URLs
    try {
      console.log(emailToUse, 'fetching video');
      let response = await apiFlask.get('/signed-urls', {
        params: {
          directory: `undefined`
        },
        headers: {
          'User-Email': `clipitguest@gmail.com`
        }
      });;
      let signedUrls = response.data.signedUrls;
      if (pageContext===PAGE_CONTEXT.FREE_USER){
        response = await apiFlask.get('/signed-urls', {
            params: {
              directory: `${emailToUse}/CurrentRun`
            },
            headers: {
              'User-Email': emailToUse
            }
          });
          signedUrls = response.data.signedUrls;
      } else  if (pageContext===PAGE_CONTEXT.MY_VIDEOS) {
        response = await apiFlask.get('/signed-urls', {
            params: {
              directory: `${emailToUse}/PreviousRuns`
            },
            headers: {
              'User-Email': emailToUse
            }
          });
          signedUrls = response.data.signedUrls;
      }  
      // Fallback to undefined directory if no URLs found
      if (!signedUrls || signedUrls.length === 0) {
        console.log('signed urls is still empty, fetching from undefined');
        const responseFromUndefined = await apiFlask.get('/signed-urls', {
          params: {
            directory: `undefined`
          },
          headers: {
            'User-Email': emailToUse
          }
        });
  
        signedUrls = responseFromUndefined.data.signedUrls;
        console.log('signed urls from undefined:', signedUrls);
        if (!signedUrls || signedUrls.length === 0) {
          setError('No videos found in Google Cloud Storage.');
          setIsLoading(false);
          return;
        }
      }
  
      setVideos(signedUrls);
      //remember to make it show videos randommly and not in order with Math.floor(Math.random()*(signedUrls.length-1))+1
      setCurrentVideoIndex(0); // Reset the index to start from the first video
      loadVideo(signedUrls[0]); // Load the first video
      console.log('videos loaded, setting usersvideosloade to true');
      setUserVideosLoaded(true);

      // Modified health check logic
      for (let i = 1; i <= 10; i++) {
        setTimeout(async () => {
          try {
            const uploadComplete = await checkUploadStatus();
            if (!uploadComplete) {
              console.log(`Calling health endpoint at ${i * 10} minutes`);
              const healthResponse = await axios.get('/api/health', {
                headers: {
                  'Cache-Control': 'no-cache',
                },
              });
              console.log('Health check response:', healthResponse);
            } else {
              console.log('Upload completed, skipping health check');
            }
          } catch (error) {
            console.error('Error calling health endpoint:', error);
          }
        }, 600000 * i); // 600000 milliseconds = 10 minutes
      }
    } catch (err) {
      setError(`Error fetching videos: ${err.message}`);
      console.error('Error fetching videos:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  
  
  const loadVideo = (videoUrl) => {
    if (!videoUrl) {
      console.error('Invalid video URL');
      return;
    }
    setIsLoading(true); // Start loading
    console.log("Loading video URL:", videoUrl);
    playerRef.current.src({ src: videoUrl, type: 'video/mp4' });
    playerRef.current.load();
    updateVideoUrl(videoUrl);
    playerRef.current.on('loadeddata', () => {
      setIsLoading(false); // Video is loaded
    });
    const playPromise = playerRef.current.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        console.log('Automatic playback started successfully.');
        playerRef.current.removeClass('vjs-waiting'); // Remove waiting class when playback starts
      }).catch(error => {
        console.error('Error attempting to play video:', error);
      });
    }
  };
  

  const loadNextVideo = () => {
    setCurrentVideoIndex(prevIndex => {
      // Check if the videos array is empty
      if (videos.length === 0) {
        console.error('Videos array is empty.');
        return prevIndex; // Return the previous index if the array is empty
      }
  
      let nextIndex = (prevIndex + 1) % videos.length;
  
      const nextVideoUrl = videos[nextIndex];
      if (nextVideoUrl) {
        console.log('Next video URL:', nextVideoUrl);
        loadVideo(nextVideoUrl);
      } else {
        console.error('Invalid video URL at index:', nextIndex);
      }
  
      return nextIndex;
    });
  };
  const loadPreviousVideo = () => {
    setCurrentVideoIndex(prevIndex => {
      // Check if the videos array is empty
      if (videos.length === 0) {
        console.error('Videos array is empty.');
        return prevIndex; // Return the previous index if the array is empty
      }
  
      let nextIndex = (prevIndex - 1) % videos.length;
  
      const nextVideoUrl = videos[nextIndex];
      if (nextVideoUrl) {
        console.log('Next video URL:', nextVideoUrl);
        loadVideo(nextVideoUrl);
      } else {
        console.error('Invalid video URL at index:', nextIndex);
      }
  
      return nextIndex;
    });
  };
  

  const handleKeyPress = (event) => {
    if (event.keyCode === 13) { // 13 is the keycode for the Enter key
        loadNextVideo();
    }
  };
  const handleVideoPress = (event) => {
    if (event.target.className.includes('unmuteButton')) {
      return;
    }
    // Get the bounding rectangle of the container
    const rect = videoContainerRef.current.getBoundingClientRect();
    
    // Calculate the midpoint of the container
    const midpoint = rect.left + (rect.width / 2);
  
    // Determine if the click is on the left or right side
    if (event.clientX < midpoint) {
      // Left side clicked
      loadPreviousVideo();
    } else  {
      // Right side clicked
      loadNextVideo();
    }
  };
  

useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
}, [currentVideoIndex, videos, userVideosLoaded]);


const toggleMute = () => {
  if (playerRef.current) {
    const newState = !isMuted;
    playerRef.current.muted(newState);
    setIsMuted(newState);
  }
};
const UnmuteButton = ({ isMuted, toggleMute }) => (
  <button className={styles.unmuteButton} onClick={toggleMute}>
    {isMuted ? '🔇' : '🔊'}
  </button>
);



return (
    <div className={videoContainerStyle} ref={videoContainerRef} onClick={handleVideoPress}>
        <video ref={backgroundVideoRef} className="video-js vjs-big-play-centered vjs-fluid" id="background-video"></video>
        <UnmuteButton isMuted={isMuted} toggleMute={toggleMute} />
    </div>
);
}
export default ShowVideo;

