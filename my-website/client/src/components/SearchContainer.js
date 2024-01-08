import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/NavigationBar.css';
import { jwtDecode } from 'jwt-decode';
import Fingerprint2 from 'fingerprintjs2';
import styles from '../styles/FullScreen.module.css';
import chatPic from '../chatpic.webp'; // Update the path according to your file structure
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { Link } from 'react-router-dom';


function SearchContainer ({isExploreFurther, isMobile, isSupport}) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [userPaymentPlan, setUserPaymentPlan] = useState('free');
    const [file, setFile] = useState(null); // State to hold the selected file
    const navigate = useNavigate();
    const [showGuestAlert, setShowGuestAlert] = useState(false);
    const [showUserAlert, setShowUserAlert] = useState(false);
    const [lastSubmitTime, setLastSubmitTime] = useState(0);

    let userEmail = '';
    let userTokens = localStorage.getItem('guestToken');
    let SearchContainerStyle = styles['search-container'];
    let orWithLinesStyle = styles['or-with-lines'];

    if (isExploreFurther){
        SearchContainerStyle='search-container-exp';
        orWithLinesStyle ='or-with-lines-exp ';
    } else if (isSupport){
        SearchContainerStyle='search-container-sup';
        orWithLinesStyle ='or-with-lines-sup';
    }
    // Ref for the file input
    const fileInputRef = useRef(null);
  
    // Function to trigger file input click
    const handleButtonClick = () => {
     fileInputRef.current.click();
    };
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
        // Check if the selected file has a ".mp4" extension
        if (selectedFile.name.endsWith(".mp4")) {
            setFile(selectedFile);
            handleSearchSubmit(null, selectedFile); // Automatically submit after file selection
        } else {
            // Display an error message or handle the case where the file is not an MP4 file
            setError('Only MP4 files are allowed.');
        }
        }
    };
    // Function to check the upload status
  const checkUploadStatus = async () => {
    try {
      const response = await axios.get('/api/check-upload-status', {
        params: { email: userEmail }
      });
      console.log("Inside function:", response.data.uploadComplete) // Added
      return response.data.uploadComplete;
    } catch (error) {
      console.error('Error checking upload status:', error);
      return true; // Default to true to avoid continuous checks in case of an error
    }
  };
    const handleSearchSubmit = async (e, selectedFile = null) => {
        if (e) e.preventDefault();
        // Check if 5 minutes have passed since the last submission
        const currentTime = new Date().getTime();
        if (currentTime - lastSubmitTime < 5 * 60 * 1000) {
            console.log('Please wait for 5 minutes before trying again.');
            return; // Exit the function if 5 minutes haven't passed
        }

        // Update the last submit time
        setLastSubmitTime(currentTime);

        setIsLoading(true);
        
        const uploadComplete = await checkUploadStatus();
        if (!uploadComplete) {
            console.log('upload not complete');
            handleRedirection(); // Redirect the user if the upload is not complete
            setIsLoading(false);
            return; // Exit the function early
        }
        console.log('upload completed, continue');
        
        // Function to get unique computer id
        const getUniqueComputerId = async () => {
        let uniqueId = localStorage.getItem('uniqueComputerId');
        if (!uniqueId) {
            const components = await Fingerprint2.getPromise();
            const values = components.map(component => component.value);
            uniqueId = Fingerprint2.x64hash128(values.join(''), 31);
            localStorage.setItem('uniqueComputerId', uniqueId);
            if (!localStorage.getItem('guestToken')) {
            localStorage.setItem('guestToken', 1);
            }
        }
        return uniqueId;
        };
            // Retrieve the token from localStorage
        const token = localStorage.getItem('token');
        
        let tokenData = '';
        userEmail = await getUniqueComputerId();
        userTokens = localStorage.getItem('guestToken');
        console.log('token', token, 'type:', typeof token);
        // Check if the token is a string and not empty
        if (typeof token === 'string' && token !== '') {
        console.log('token not empty');
        tokenData = jwtDecode(token);
        console.log('token data:', tokenData);
        userEmail = tokenData.email;
        userTokens = parseInt(tokenData.tokens);
        console.log('user email:', userEmail, 'user tokens:', userTokens);
        } else{
            console.log('no user signed in', userEmail, userTokens);
        }
        if (!userEmail) {
        setError('User ID not found. Please log in again.');
        setIsLoading(false);
        return;
        }
        if (!userEmail.includes('@')){
            setShowGuestAlert(true); // Use prop function
            setIsLoading(false);
            return;
        }
        if (userTokens <= 0 || userTokens === null) {
            setShowUserAlert(true); // Use prop function
            setIsLoading(false);
            return;
        }
    
        // Immediately navigate to the next page
        handleRedirection();
    
        // Function to update tokens
        const updateTokens = async (email, tokens) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/update-tokens`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: email, tokens: tokens }),
            });
    
            if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            const responseData = await response.json();
            if (responseData.token) {
            localStorage.setItem('token', responseData.token);
            }
        } catch (error) {
            console.error('Error updating tokens:', error.message);
            setError('Error updating tokens');
        }
        };
        
        let payload;
        if (selectedFile) {
        console.log('selected file');
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('userEmail', userEmail);
        formData.append('folder_name', 'folder_check');
        payload = formData;
        } else {
        console.log('not selected file');
        payload = {
            link: searchQuery,
            folder_name: 'folder_check',
            userEmail: userEmail
        };
        }
    
        try {
        const config = { headers: {'Content-Type': 'multipart/form-data'} };
        console.log('form data',payload, config);
        const apiBaseUrl = process.env.REACT_APP_FLASK_API_URL;
        const response = await axios.post(`${apiBaseUrl}/process-youtube-video`, payload, config);
        console.log('Video processing started:', response.data);
        userTokens = userTokens - 1;
        await updateTokens(userEmail, userTokens);
        handleRedirection();
        } catch (error) {
        console.error('Error processing your request:', error.message);
        setError('Error processing your request. Please try again.');
        } finally {
        setIsLoading(false);
        }
    };
    
  

    const handleRedirection = () => {
        switch(userPaymentPlan) {
        case 'regular':
            navigate('/free-user');
            break;
        case 'premium':
            navigate('/free-user');
            break;
        default:
            navigate('/free-user');
        }
    };

    const handleLogoClick = () => {
        handleSearchSubmit();
    };
    const renderUploadButton=()=>{
        if(isMobile&&!isExploreFurther){
            return (
                <>
            <div className={orWithLinesStyle}>OR</div>
            <div className={styles['file-input-container']}>
                <input 
                    type="file" 
                    ref={fileInputRef} // Attach the ref here
                    className={styles['file-input']}
                    onChange={handleFileChange}
                    style={{ display: 'none' }} 
                />
                <button className={styles['upload-file-button']}
                    onClick={handleButtonClick} // Use this button to trigger the file input
                >Upload File</button>
            </div>
            </>);
        } else if (!isMobile){
            return (
                <>
            <div className={orWithLinesStyle}>OR</div>
            <div className={styles['file-input-container']}>
                <input 
                    type="file" 
                    ref={fileInputRef} // Attach the ref here
                    className={styles['file-input']}
                    onChange={handleFileChange}
                    style={{ display: 'none' }} 
                />
                <button className={styles['upload-file-button']}
                    onClick={handleButtonClick} // Use this button to trigger the file input
                >Upload File</button>
            </div>
            </>);
        }else{
            return;
        }
    }


return(
    <div className={SearchContainerStyle}>
        <form onSubmit={handleSearchSubmit} className={styles['search-form']}>
        <div className={styles['input-logo-container']}>
            <input
            type="text"
            id={styles['google-like-search']}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter YouTube Url To Try It"
            />
            <img
            src="\magnifying-glass_2015241.WebP"
            alt="Logo"
            className={styles['search-logo']}
            onClick={handleLogoClick}
            />
        </div>
        {showGuestAlert && (
            <div className={styles['guest-alert-overlay']}>
                <div className={styles['guest-alert']}>
                    <p>Hey there, amazing explorer of the digital universe! 🌟 We're thrilled you're here and can't wait to show you all the cool stuff ClipIt can do. But, hold on a sec - to get the full dazzling experience, would you mind hopping on board as a registered star traveler? It's super easy! Just <Link to="/signup" className={styles['nav-signup']}>click here to sign up</Link> and unlock a galaxy of content creation tools. Can't wait to see you on the other side! 🚀✨</p>
                </div>
            </div>
        )}


        {showUserAlert && (
            <p className="lead text-white">You used all your tokens for this month,<Link to="/offers" className="nav-signup">upgrade your subscription</Link> to get more tokens.</p>
        )}
        </form>
        {renderUploadButton()}
    </div>

);

}
export default SearchContainer;


 

