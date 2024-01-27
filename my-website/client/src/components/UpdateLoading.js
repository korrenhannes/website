// updateloadingprocess.js
const updateLoadingProcess = async (userEmail, loadingProgress) => {
    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/update-loading-progress`, {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: userEmail, loadingProgress: loadingProgress }),
        });
    
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
      console.error('Error updating loading process:', error);
    }
  };

  export default updateLoadingProcess;
  