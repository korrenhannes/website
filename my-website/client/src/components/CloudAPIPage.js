import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/NavigationBar.css';
import styles from '../styles/FullScreen.module.css';
import chatPic from '../chatpic.webp'; // Update the path according to your file structure
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import SearchContainer from './SearchContainer'; // Adjust path as needed





function CloudAPIPage({ enableScrollHandling = true }) {
  const navigate = useNavigate();
  const touchStartRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  // State for video source URL
  const [backgroundImageLoaded, setBackgroundImageLoaded] = useState(false);


  useEffect(() => {
    const loadImage = new Image();
    loadImage.src = chatPic; // URL of your background image
    loadImage.onload = () => setBackgroundImageLoaded(true);
  }, []);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  useEffect(() => {
    if (!enableScrollHandling) {
      return;
    }
    const handleTouchStart = (e) => {
      touchStartRef.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      if (!touchStartRef.current) {
        return;
      }

      const touchEndY = e.touches[0].clientY;
      if (touchStartRef.current > touchEndY + 50) {
        navigate('/explore-further');
      }
    };

    const handleWheel = (e) => {
      if (e.deltaY > 100) {
        navigate('/explore-further');
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('wheel', handleWheel);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [navigate]);
  
  

  return (
    <div className={styles['full-screen-container']}>
      {/* Background Video */}
      <div >
        <LazyLoadImage
          alt="background"
          effect="blur"
          src={chatPic} // use your imported image here
          wrapperClassName={styles['background-image']}
        />
      </div>


      <div className={styles['foreground-content']}>
        <h1>Transform Long Videos into Viral Shorts with Ease.</h1>
        <SearchContainer isExploreFurther={false} isMobile={isMobile}/>
      </div>
    </div>

  );
}

export default CloudAPIPage;