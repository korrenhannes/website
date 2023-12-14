import React, { useState, useEffect } from 'react';
import NavigationBar from './NavigationBar'; // Import the navigation bar component
import '../styles/AffiliateDashboard.css'; // CSS for styling the affiliate dashboard
import { api } from '../api';

function AffiliateDashboardPage() {
  const [affiliateData, setAffiliateData] = useState({
    totalReferrals: 0,
    earnings: 0.0,
    referredUsers: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAffiliateData = async () => {
      try {
        setIsLoading(true);
        const response = await api.getAffiliateData(); // Fetch data from the backend
        if (response && response.data) {
          setAffiliateData(response.data); // Ensure data is set correctly
        } else {
          setError('No data received from the server.');
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAffiliateData();
  }, []);

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  // Check for valid earnings and provide a fallback
  const validEarnings = affiliateData.earnings || 0;

  return (
    <div className="affiliate-dashboard">
      <NavigationBar />
      <h1 className="dashboard-header">Affiliate Dashboard</h1>
      <div className="dashboard-content">
        <div className="statistics">
          <div className="stat-item">
            <label>Total Referrals:</label>
            <span>{affiliateData.totalReferrals}</span>
          </div>
          <div className="stat-item">
            <label>Earnings:</label>
            <span>${validEarnings.toFixed(2)}</span> {/* Use validEarnings instead */}
          </div>
        </div>
        <div className="referred-users">
          <h2>Referred Users</h2>
          <ul>
            {affiliateData.referredUsers.length > 0 ? (
              affiliateData.referredUsers.map((user, index) => (
                <li key={index}>
                  {user.email} - Referred on: {new Date(user.referredDate).toLocaleDateString()}
                </li>
              ))
            ) : (
              <p>No referred users yet.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AffiliateDashboardPage;