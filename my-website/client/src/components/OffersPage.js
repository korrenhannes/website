import React from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationBar from './NavigationBar'; // Import the navigation bar component
import '../styles/NavigationBar.css'; // Ensure the styles for the navigation bar are imported
import PayPalButton from './PaypalButton';
import planImage from "../assets/planIcon2.jpg"

function OffersPage() {
  const navigate = useNavigate();

  //const handleSelectPlan = (plan) => {
   // navigate('/payment', { state: { plan } });
  //};

  return (
    <>
      <NavigationBar /> {/* Include the navigation bar at the top */}
      <div className="container mt-5" style={{ paddingTop: '60px' }}> {/* Add padding to the top */}
        <h1 className="text-center">Choose Your Plan</h1>
        <div className="row justify-content-center">
          
          {/* Plan A */}
          <div className="col-md-6">
            <div className="card mb-3" style={{ maxWidth: '540px' }}>
              <div className="row g-0">
                <div className="col-md-4">
                  <img src={planImage} className="img-fluid rounded-start" alt="Plan A" />
                </div>
                <div className="col-md-8">
                  <div className="card-body">
                    <h5 className="card-title">Plan A</h5>
                    <p className="card-text">Description of Plan A...</p>
                    <PayPalButton />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Plan B */}
          <div className="col-md-6">
            <div className="card" style={{ maxWidth: '540px' }}>
              <div className="row g-0">
                <div className="col-md-4">
                  <img src={planImage} className="img-fluid rounded-start" alt="Plan B" />
                </div>
                <div className="col-md-8">
                  <div className="card-body">
                    <h5 className="card-title">Plan B</h5>
                    <p className="card-text">Description of Plan B...</p>
                    <PayPalButton />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default OffersPage;
