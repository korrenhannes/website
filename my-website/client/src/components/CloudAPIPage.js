import React, { useState } from 'react';
import axios from 'axios';

function CloudAPIPage() {
  const [apiData, setApiData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleButtonClick = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Replace with your REST API endpoint
      const response = await axios.get('https://your-rest-api.com/data');
      setApiData(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1>Cloud API Interaction</h1>
      <button onClick={handleButtonClick} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Connect to Cloud API'}
      </button>
      {error && <p>Error: {error}</p>}
      {apiData && <pre>{JSON.stringify(apiData, null, 2)}</pre>}
    </div>
  );
}

export default CloudAPIPage;
