import axios from 'axios';

const checkUploadStatus = async (userEmail) => {
    try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/auth/check-upload-status`, {
            params: { email: userEmail }
        });    
      console.log("Inside function:", response.data.uploadComplete) // Added
      return response.data?.uploadComplete ?? null;
    } catch (error) {
        console.log('Error checking upload status:', error)
        console.error('Error checking upload status:', error);
        return null; // Default to true to avoid continuous checks in case of an error
    }
  };
export default checkUploadStatus;
