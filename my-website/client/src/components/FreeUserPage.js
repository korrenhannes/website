import React, { useState, useEffect, useRef, useCallback  } from 'react';
import io from 'socket.io-client';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { PAGE_CONTEXT } from './constants'; // Import the constants
import ShowVideo from './ShowVideo';
import checkUploadStatus from './CheckUploadStatus';
import { jwtDecode } from 'jwt-decode';
import checkLoadingProcess from './CheckLoading';
import updateLoadingProcess from './UpdateLoading';



import '../styles/NavigationBar.css';
import styles from '../styles/FreeUserPage.module.css';
import NextVideoButton from './NextVideoButton'; // Import the custom button

// Register the custom button with Video.js
videojs.registerComponent('NextVideoButton', NextVideoButton);


function FreeUserPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentVideoUrl, setCurrentVideoUrl] = useState(''); // State for the current video URL
  const socket = useRef(null);
  const [loadingProgress, setLoadingProgress] = useState(0); // New state for loading progress
  const [uploadCheckInterval, setUploadCheckInterval] = useState(null);
  const [refreshVideos, setRefreshVideos] = useState(null);
  const [initialLoadingProgress, setInitialLoadingProgress] = useState(0);
  const [showInitialLoader, setShowInitialLoader] = useState(true); // State to control visibility of the initial loader
  const [initialLoaderETA, setInitialLoaderETA] = useState('ETA until example video: 30 seconds');
 // const [mainLoaderETA, setMainLoaderETA] = useState('ETA until your video is ready: 60 minutes');


  useEffect(() => {
    socket.current = io('https://young-beach-38748-bf9fd736b27e.herokuapp.com');
    socket.current.on('connect', () => console.log('Connected to socket.io server'));
    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, []);
  const [userEmail, setUserEmail] = useState('');
  const calculateMainLoaderETA = (progress) => {
    const totalTime = 60; // Total time for main loader in minutes
    const remainingTime = totalTime - (progress / 100) * totalTime;
    return `ETA until your video is ready: ${Math.ceil(remainingTime)} minutes`;
  };
  const [mainLoaderETA, setMainLoaderETA] = useState(calculateMainLoaderETA(loadingProgress));
  useEffect(() => {
    // This will set the initial ETA based on the first received loading progress
    setMainLoaderETA(calculateMainLoaderETA(loadingProgress));
  }, [loadingProgress]); // Depend on loadingProgress so it updates when loadingProgress changes
  
  // Update ETA for the initial loader
  useEffect(() => {
    const updateETA = () => {
      const totalTime = 30; // Total time for initial loader in seconds
      const remainingTime = totalTime - (initialLoadingProgress / 100) * totalTime;
      setInitialLoaderETA(`ETA until example video: ${Math.ceil(remainingTime)} seconds`);
    };

    const etaInterval = setInterval(updateETA, 1000); // Update every 5 minutes
    return () => clearInterval(etaInterval);
  }, [initialLoadingProgress]);

  // Update ETA for the main loader
  useEffect(() => {
    const updateETA = () => {
      setMainLoaderETA(calculateMainLoaderETA(loadingProgress));
    };

    const etaInterval = setInterval(updateETA, 300000); // Update every 5 minutes
    return () => clearInterval(etaInterval);
  }, [loadingProgress]);
  useEffect(() => {
    const initializeLoadingProgress = async () => {
      //console.log("checking loading progress");
      if (userEmail) {
       // console.log("user is logged in");
        const uploadComplete = await checkUploadStatus(userEmail);
        const progress = await checkLoadingProcess(userEmail);
        //console.log("upload complete?", uploadComplete, "progress?", progress);
        if (!uploadComplete&&progress===100){
          //console.log("upload not complete but loading bar finished");
          await updateLoadingProcess(userEmail, 50);
          setLoadingProgress(50);
        }else if (progress !== null) {
          //console.log("setting loading process to ", progress);
          setLoadingProgress(progress);
        }
      }
    };
  
    initializeLoadingProgress();
  }, [userEmail]);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserEmail(decoded.email);
      } catch (error) {
        console.error("Error decoding token:", error);
        setError('Authentication error. Please log in again.');
        return;
      }
    }
    const initialLoaderInterval = setInterval(() => {
      setInitialLoadingProgress((prevProgress) => {
        const newProgress = prevProgress + 100 / 60; // Update for 30 seconds
        if (newProgress >= 100) {
          clearInterval(initialLoaderInterval);
          setShowInitialLoader(false); // Hide initial loader and show main loader
        }
        return newProgress;
      });
    }, 1000); // Update every second

    return () => clearInterval(initialLoaderInterval);
  }, []);
  const handleSetRefreshFunction = useCallback((refreshFunction) => {
    setRefreshVideos(() => refreshFunction);
  }, []);
  useEffect(() => {
    // Start the upload status check only if on the Free User Page
    if (!showInitialLoader &&userEmail) {
      const intervalId = setInterval(async () => {
        //console.log('checking if upload is completed');
        const uploadComplete = await checkUploadStatus(userEmail);
        if (uploadComplete) {
          //console.log('upload is completed, reset the interval', uploadComplete);
          clearInterval(intervalId);
          setUploadCheckInterval(null);
          await updateLoadingProcess(userEmail, 100);
          setLoadingProgress(100);
          if (refreshVideos) {
            refreshVideos(); // Refresh the videos
        }
        } else {
          // Update loading progress (for a total duration of 40 minutes)
          const newProgress = Math.min(loadingProgress + (100 / 240), 100);
          //console.log("loading bar new progress: ", newProgress, loadingProgress);
          await updateLoadingProcess(userEmail, newProgress);
          //console.log("updated the loading bar");
          setLoadingProgress(prevProgress => Math.min(prevProgress + (100 / 360), 100));
        }
      }, 10000); // Check every 10 seconds

      setUploadCheckInterval(intervalId);
    }

    return () => {
      if (uploadCheckInterval) {
        clearInterval(uploadCheckInterval);
      }
    };
  }, [userEmail, refreshVideos, showInitialLoader, loadingProgress]);


  const updateCurrentVideoUrl = (url) => {
    setCurrentVideoUrl(url);
  };

  const handleDownloadVideo = async () => {
    const videoUrl = currentVideoUrl;
    if (!videoUrl) {
      console.error("No video URL found");
      return;
    }
  
    try {
      // Fetch the video
      const response = await fetch(videoUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      // Create a blob from the response
      const videoBlob = await response.blob();
  
      // Extract the base URL (before any query parameters)
      const baseUrl = videoUrl.split('?')[0];
  
      // Extracting the filename from the base URL
      let filename = baseUrl.split('/').pop();
  
      // Ensure the filename ends with '.mp4'
      if (!filename.endsWith('.mp4')) {
        filename += '.mp4';
      }
  
      // Create an anchor element and trigger download
      const a = document.createElement('a');
      a.href = window.URL.createObjectURL(videoBlob);
      a.download = filename; // Set the download attribute to the filename
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  
      // Clean up the blob URL
      window.URL.revokeObjectURL(a.href);
    } catch (error) {
      console.error("Error downloading video:", error);
    }
  };
  

  return (
    <div className={styles.fullScreenContainer}>
       {showInitialLoader && (
        <>
        {window.innerWidth > 768 ? (
          <>
          <p className={styles.etaText}>{initialLoaderETA}</p> {/* ETA Text above the loader */}
          <div className={styles.initialLoaderContainer}>
            <div className={styles.initialLoader} style={{ height: `${initialLoadingProgress}%` }}></div>
          </div>
          </>
        ) : (
          <>
            <p className={styles.etaText}>{initialLoaderETA}</p> {/* ETA Text above the loader */}
            <div className={styles.horizontalLoaderContainer2}>
              <div className={styles.horizontalLoader2} style={{ width: `${initialLoadingProgress}%` }}></div>
            </div>
          </>
        )}
        </>
      )}
      {!showInitialLoader && loadingProgress < 100 && (
        <>
         <p  className="lead text-black">{mainLoaderETA}</p>
          {window.innerWidth < 768 ? (
             <>
             <p className={styles.etaText}>{mainLoaderETA}</p> {/* ETA Text above the loader */} 
            <div className={styles.horizontalLoaderContainer}>
              <div className={styles.horizontalLoader} style={{ width: `${loadingProgress}%` }}></div>
            </div>
            </>
          ) : (
            <>
            <p className={styles.etaText}>{mainLoaderETA}</p> {/* ETA Text above the loader */}
            <div className={styles.verticalLoaderContainer}>
              <div className={styles.verticalLoader} style={{ height: `${loadingProgress}%` }}></div>
            </div>
            </>
          )}
        </>
      )}
      <ShowVideo 
      pageContext={PAGE_CONTEXT.FREE_USER} 
      updateVideoUrl={updateCurrentVideoUrl} 
      isMobilePage={true}
      onRefresh={handleSetRefreshFunction}
      />

      <div className={styles.videouioverlay}>
        {/* Elements for video title, user interaction, etc. */}
      </div>
      <button onClick={handleDownloadVideo} className={styles.downloadbutton}>Download Video</button>
      {error && <p>Error: {error}</p>}
    </div>
  );
}

export default FreeUserPage;