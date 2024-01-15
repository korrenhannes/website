import React, { useState, useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { apiFlask } from '../api'; // Importing the Axios instance for Flask
import { jwtDecode } from 'jwt-decode';
import { PAGE_CONTEXT } from './constants'; // Import the constants
import styles from '../styles/FreeUserPage.module.css';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import checkUploadStatus from './CheckUploadStatus';




function ShowVideo({pageContext, updateVideoUrl, isMobilePage, onRefresh  }){
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
    


    const isMobileDevice = () => {
      return /Mobi|Android|iPhone/i.test(navigator.userAgent);
    }
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
          preload: 'auto',
          responsive: true, // Makes the player responsive

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

  const handleScroll = (event) => {
    if (isMobileDevice()) {
      if (event.deltaY > 0) {
        loadNextVideo();
      } else {
        loadPreviousVideo();
      }
    }
  };

  useEffect(() => {
    const videoContainer = videoContainerRef.current;
    if (isMobilePage && isMobileDevice()) {
      videoContainer.addEventListener('wheel', handleScroll);
      videoContainer.removeEventListener('click', handleVideoPress);
    } else {
      videoContainer.removeEventListener('wheel', handleScroll);
      videoContainer.addEventListener('click', handleVideoPress);
    }
    return () => {
      videoContainer.removeEventListener('wheel', handleScroll);
      videoContainer.removeEventListener('click', handleVideoPress);
    };
  }, [isMobilePage]);

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


      // Handle different video loading strategies based on page context
      if (pageContext !== PAGE_CONTEXT.EXPLORE_FURTHER) {
        // Load from the first video
        setCurrentVideoIndex(0);
        loadVideo(signedUrls[0]);
      } else {
        // Load a random video
        const randomIndex = Math.floor(Math.random() * signedUrls.length);
        setCurrentVideoIndex(randomIndex);
        loadVideo(signedUrls[randomIndex]);
      }
      console.log('videos loaded, setting usersvideosloade to true');
      setUserVideosLoaded(true);

      // Modified health check logic
      for (let i = 1; i <= 12; i++) {
        setTimeout(async () => {
          try {
            console.log(" before the Just before");
            const uploadComplete = await checkUploadStatus(userEmail);
            console.log("Just before function:", uploadComplete);
            if (uploadComplete) { // !uploadComplete
              console.log('Upload completed, skipping health check');

            } else {
              
              // Trying to override some logic to still call health checks. Need to change later
              console.log(`Calling health endpoint at ${i * 10} minutes`);
              const healthResponse = await apiFlask.get('/health', {
                headers: {
                  'Cache-Control': 'no-cache',
                },
              });


            }
          } catch (error) {
            console.error('Error calling health endpoint:', error);
          }
        }, 300000 * i); // 600000 milliseconds = 10 minutes
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

    // Modify this part to handle chunked streaming
    playerRef.current.src({
        src: videoUrl,
        type: 'video/mp4',
    });

    playerRef.current.load();
    updateVideoUrl(videoUrl);

    playerRef.current.on('loadeddata', () => {
        setIsLoading(false); // Video is loaded
    });

    const playPromise = playerRef.current.play();
    if (playPromise !== undefined) {
        playPromise.then(() => {
            console.log('Automatic playback started successfully.');
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
      if (nextIndex < 0) {
            // If the new index is negative, loop back to the last video
            nextIndex = videos.length - 1;
      }
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
    if (pageContext !== PAGE_CONTEXT.EXPLORE_FURTHER) {
        // Original behavior for Free User Page
        if (event.clientX < midpoint) {
            loadPreviousVideo();
        } else {
            loadNextVideo();
        }
    } else {
        // Random video loading for other pages
        if (event.clientX < midpoint) {
            loadRandomVideo();
        } else {
            loadRandomVideo();
        }
    }
};

const loadRandomVideo = () => {
    if (videos.length === 0) {
        console.error('Videos array is empty.');
        return;
    }
    const randomIndex = Math.floor(Math.random() * videos.length);
    setCurrentVideoIndex(randomIndex);
    loadVideo(videos[randomIndex]);
};
 
const refreshVideos = async () => {
  await fetchVideosFromGCloud();
  // Any additional logic if needed
};

useEffect(() => {
  if(onRefresh) {
      onRefresh(refreshVideos); // Pass the refresh function to the parent
  }
}, [onRefresh]);
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
    <div 
    className={videoContainerStyle} 
    ref={videoContainerRef} 
    onClick={handleVideoPress} 
    onTouchEnd={handleVideoPress}
    >
        <video 
        ref={backgroundVideoRef} 
        className="video-js vjs-big-play-centered vjs-fluid" 
        id="background-video"
        playsInline 
        ></video>
        <UnmuteButton isMuted={isMuted} toggleMute={toggleMute} />
    </div>
);
}

export default ShowVideo;

