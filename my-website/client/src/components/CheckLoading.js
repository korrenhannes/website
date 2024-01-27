import { api } from '../api'; // Use your Axios instance
const checkLoadingProcess = async (userEmail) => {
    try {
      console.log("inside checking loading process function: ", userEmail);
      const response = await api.get(`/auth/check-loading-progress`, { userEmail });
      console.log("response inside checking loading func:", response.data);
      if (response.data.loadingProgress===null){
        console.log('response data is null');
      }return response.data?.loadingProgress ?? null;
    } catch (error) {
      console.error('Error checking loading process:', error);
      return null;
    }
  };
export default checkLoadingProcess;  