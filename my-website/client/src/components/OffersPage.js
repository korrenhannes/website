import React from 'react';
import { useNavigate } from 'react-router-dom';

function OffersPage() {
  const navigate = useNavigate();

  const handleSelectPlan = (plan) => {
    navigate('/payment', { state: { plan } });
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center">Choose Your Plan</h1>
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card p-4">
            <div className="mb-3">
              <h2>Plan A</h2>
              <p>Description of Plan A...</p>
              <button className="btn btn-primary w-100" onClick={() => handleSelectPlan('Plan A')}>Select Plan A</button>
            </div>
            <div className="mb-3">
              <h2>Plan B</h2>
              <p>Description of Plan B...</p>
              <button className="btn btn-primary w-100" onClick={() => handleSelectPlan('Plan B')}>Select Plan B</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OffersPage;
