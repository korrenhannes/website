import { api } from '../api'; // Use your Axios instance
const checkLoadingProcess = async (userEmail) => {
    try {
      const response = await api.get(`/auth/check-loading-progress`, { userEmail });
      if (response.data.loadingProgress===null){
      }return response.data?.loadingProgress ?? null;
    } catch (error) {
      console.error('Error checking loading process:', error);
      return null;
    }
  };
export default checkLoadingProcess;  