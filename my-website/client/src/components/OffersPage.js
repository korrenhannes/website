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
        
        {/* Plan A */}
        <div className="col-md-6">
          <div className="card mb-3" style={{ maxWidth: '540px' }}>
            <div className="row g-0">
              <div className="col-md-4">
                <img src="path_to_plan_a_image.jpg" className="img-fluid rounded-start" alt="Plan A" />
              </div>
              <div className="col-md-8">
                <div className="card-body">
                  <h5 className="card-title">Plan A</h5>
                  <p className="card-text">Description of Plan A...</p>
                  <button className="btn btn-primary" onClick={() => handleSelectPlan('Plan A')}>Select Plan A</button>
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
                <img src="path_to_plan_b_image.jpg" className="img-fluid rounded-start" alt="Plan B" />
              </div>
              <div className="col-md-8">
                <div className="card-body">
                  <h5 className="card-title">Plan B</h5>
                  <p className="card-text">Description of Plan B...</p>
                  <button className="btn btn-primary" onClick={() => handleSelectPlan('Plan B')}>Select Plan B</button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default OffersPage;
