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

function SearchContainer ({isExploreFurther, isMobile}) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [userPaymentPlan, setUserPaymentPlan] = useState('free');
    const [file, setFile] = useState(null); // State to hold the selected file
    const navigate = useNavigate();
    let SearchContainerStyle = styles['search-container'];
    let orWithLinesStyle = styles['or-with-lines'];
    if (isExploreFurther){
        SearchContainerStyle='search-container-exp';
        orWithLinesStyle ='or-with-lines-exp ';
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
    const handleSearchSubmit = async (e, selectedFile = null) => {
        if (e) e.preventDefault();
        setIsLoading(true);
    
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
        let userEmail = await getUniqueComputerId();
        let userTokens = localStorage.getItem('guestToken');
        console.log('token', token, 'type:', typeof token);
        // Check if the token is a string and not empty
        if (typeof token === 'string' && token !== '') {
        console.log('token not empty');
        tokenData = jwtDecode(token);
        console.log('token data:', tokenData);
        userEmail = tokenData.email;
        userTokens = parseInt(tokenData.tokens);
        console.log('user email:', userEmail, 'user tokens:', userTokens);
        }
        if (!userEmail) {
        setError('User ID not found. Please log in again.');
        setIsLoading(false);
        return;
        }
        if (userTokens <= 0) {
        setError('No more tokens, need to upgrade subscription');
        setIsLoading(false);
        return;
        }
    
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
        // const apiBaseUrl = process.env.REACT_APP_FLASK_API_URL || 'http://localhost:5000';
        const apiBaseUrl = 'https://localhost:5000';
        const response = await axios.post(`${apiBaseUrl}/api/process-youtube-video`, payload, config);
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
            src="\magnifying-glass_2015241.png"
            alt="Logo"
            className={styles['search-logo']}
            onClick={handleLogoClick}
            />
        </div>
        </form>
        {renderUploadButton()}
    </div>

);

}
export default SearchContainer;


 

