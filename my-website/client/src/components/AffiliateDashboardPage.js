import React, { useState, useEffect } from 'react';
import NavigationBar from './NavigationBar'; // Import the navigation bar component
import '../styles/LoginForm.css'; // CSS for styling the affiliate dashboard
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
        const data = await api.getAffiliateData(); // Fetch data from the backend
        setAffiliateData(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAffiliateData();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="affiliate-dashboard">
      <NavigationBar />
      <h1>Affiliate Dashboard</h1>
      <div className="dashboard-content">
        <div className="statistics">
          <div className="stat-item">
            <label>Total Referrals:</label>
            <span>{affiliateData.totalReferrals}</span>
          </div>
          <div className="stat-item">
            <label>Earnings:</label>
            <span>${affiliateData.earnings.toFixed(2)}</span>
          </div>
        </div>
        <div className="referred-users">
          <h2>Referred Users</h2>
          {affiliateData.referredUsers.length > 0 ? (
            <ul>
              {affiliateData.referredUsers.map((user, index) => (
                <li key={index}>{user.email} - Referred on: {new Date(user.referredDate).toLocaleDateString()}</li>
              ))}
            </ul>
          ) : (
            <p>No referred users yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AffiliateDashboardPage;
