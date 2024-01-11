import { api } from '../api'; // Importing the Axios instance for Flask

const checkUploadStatus = async (userEmail) => {
    console.log('checking user upload status:', userEmail);
    try {
        const response = await api.get(`/auth/check-upload-status`, {userEmail});    
      console.log("Inside function:", response.data.uploadComplete) // Added
      if (response.data.uploadComplete===null){
        console.log('response data is null');
      }
      return response.data?.uploadComplete ?? null;
    } catch (error) {
        console.error('Error checking upload status:', error);
        return null; // Default to true to avoid continuous checks in case of an error
    }
  };
export default checkUploadStatus;
