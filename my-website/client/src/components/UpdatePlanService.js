// updatePlanService.js
const updatePlanRequest = async (userEmail, selectedPlan, subscriptionID) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/update-plan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: userEmail, paymentPlan: selectedPlan, subscriptionID:subscriptionID }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const responseData = await response.json();
      console.log('Plan updated:', responseData);
  
      if (responseData.token) {
        localStorage.setItem('token', responseData.token);
        // Optionally, decode and use the new token data
        // const updatedUserInfo = jwtDecode(responseData.token);
        // Use updatedUserInfo as needed
      }
    } catch (error) {
      console.error('Error updating plan:', error);
    }
  };
  
  export default updatePlanRequest;
  