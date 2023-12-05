import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationBar from './NavigationBar'; // Import the navigation bar component
import '../styles/NavigationBar.css'; // Ensure the styles for the navigation bar are imported
import PayPalButton from './PayPalButton';
import planImage from "../assets/planIcon2.jpg"
import '../styles/PlanSelection.css'; // Assume you have a corresponding CSS file for styles


function OffersPage() {
  const [selectedPlan, setSelectedPlan] = useState('basic');
  const [planDescription1, setPlanDescription1] = useState('this is the Basic plan,you get one additional video with smaller water mark');
  const [planDescription2, setPlanDescription2] = useState('why you should choose the Basic plan');
  const [planDescription3, setPlanDescription3] = useState('let me convince you');
  const navigate = useNavigate();

  const plans = [
    { name: 'Basic', price: 'free', quality: 'Good', title:'you get one additional video with smaller water mark' },
    { name: 'Standard', price: '27.99', quality: 'Better', title: 'you get 10 videos to edit' },
    { name: 'Premium', price: '79.99', quality: 'Best', title: 'you can edit as many videos as you want, unlimited!' },
  ];

  const selectPlan = (plan) => {
    setSelectedPlan(plan);
    const selected = plans.find(p => p.name.toLowerCase() === plan);
    setPlanDescription1(`this is the ${selected.name} plan,${selected.title} `);
    setPlanDescription2(`why you should choose the ${selected.name} plan `);
    setPlanDescription3(`let me convince you`);
  };

  const handleNextClick = () => {
    navigate('/cloud-api');
  };

  const handleSuccessfulPayment = () => {
    navigate('/cloud-api');
  };

  return (
    <div className="plan-selection">
      <NavigationBar />
      <h1>Choose the plan that’s right for you</h1>
      <ul>
        <li>{planDescription1}</li>
        <li>{planDescription2}</li>
        <li>{planDescription3}</li>
      </ul>
      <div className="plans">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`plan ${selectedPlan === plan.name.toLowerCase() ? 'selected' : ''}`}
            onClick={() => selectPlan(plan.name.toLowerCase())}
          >
            <div className="plan-name">{plan.name}</div>
            <div className="plan-price">{plan.price}</div>
          </div>
        ))}
      </div>
      <div className="plan-details">
        {/* ...Additional plan details here... */}
      </div>
      {selectedPlan === 'basic'? 
      <button className="next-button" onClick={handleNextClick}>Next</button>:
      (<PayPalButton className ='pay-button' amount={plans.find(p => p.name.toLowerCase() === selectedPlan).price} onSuccessfulPayment={handleSuccessfulPayment}/>)}
    </div>
  );
}

export default OffersPage;
