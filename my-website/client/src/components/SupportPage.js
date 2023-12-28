import React, { useState, useEffect, useRef } from 'react';
import '../styles/NavigationBar.css';
import '../styles/Support.css';
import CloudAPIPage from './CloudAPIPage';
import { useNavigate } from 'react-router-dom';
import ComplaintsPage from './ComplaintsPage';
import { useComplaints } from './contexts/ComplaintsContext'; // Import useComplaints
import { ComplaintsProvider } from './contexts/ComplaintsContext';
import SearchContainer from './SearchContainer'; // Adjust path as needed


function SupportPage() {
  const navigate = useNavigate();
  const touchStartRef = useRef(0);
  const touchEndRef = useRef(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isWritingTabVisible, setIsWritingTabVisible] = useState(false);
  const [complaintText, setComplaintText] = useState('');

  // Use the useComplaints hook to access the addComplaint function
  const { addComplaint } = useComplaints();

  const toggleWritingTab = () => {
    setIsWritingTabVisible(!isWritingTabVisible);
  };

  const handleSubmit = (event) => {
    if (event.key === 'Enter' && complaintText.trim() !== '') {
      addComplaint(complaintText.trim()); // Add the complaint to the context
      setComplaintText('');
      setIsWritingTabVisible(false);
    }
  };
  

  const handleSwipe = () => {
    const distance = touchEndRef.current - touchStartRef.current;

    if (distance < -50) {
      navigate('/support');
    } else if (distance > 50) {
      navigate('/how-it-works');
    }
  };

  useEffect(() => {
    const handleTouchStart = (e) => {
      touchStartRef.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
      touchEndRef.current = e.changedTouches[0].clientY;
      handleSwipe();
    };

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('resize', handleResize);

    const handleScrollSupportPage = (e) => {
      if (e.deltaY < 0) {
        navigate('/how-it-works');
      }
    };

    window.addEventListener('wheel', handleScrollSupportPage);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('wheel', handleScrollSupportPage);
    };
  }, [navigate]);

  return (
    <div className="support-page">
      <footer className="top-half">
      <div className="image-overlay-sup"></div> {/* Add this line */}
        <h1>Simply ClipIt!</h1>
        <SearchContainer isExploreFurther={false} isMobile={false} isSupport={true}/>
      </footer>
      <footer className="support-footer">
        <div className="footer-content">
          <div className="footer-section company-info">
            <h4>More info</h4>
            <ul>
              <li>
                <button onClick={toggleWritingTab} className="contact-link">Contact us</button>
              </li>
              <li><a href="/partner">Become an affiliate</a></li>
            </ul>
          </div>
          <div className="footer-section best-practices">
            <h4>Available 24/7</h4>
            <ul>
              <li>Call Us: +972527242424</li>
              <li>Email: korren@clipitshorts.com</li>
            </ul>
          </div>
        </div>
      </footer>
      {isWritingTabVisible && (
        <textarea
          value={complaintText}
          onChange={(e) => setComplaintText(e.target.value)}
          onKeyDown={handleSubmit}
          className="complaint-textarea"
          placeholder="Enter your complaint..."
        />
      )}
    </div>
  );
}

export default SupportPage;
