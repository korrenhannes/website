import React from 'react';

function CloudAPIPage() {
  const handleButtonClick = () => {
    // Logic to connect to the cloud API
    console.log('Connecting to Cloud API...');
    // Example: axios.get('https://your-cloud-api.com/data')
  };

  return (
    <div>
      <h1>Cloud API Interaction</h1>
      <button onClick={handleButtonClick}>Connect to Cloud API</button>
    </div>
  );
}

export default CloudAPIPage;
