import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationBar from './NavigationBar'; // Import the navigation bar component
import '../styles/NavigationBar.css'; // Ensure the styles for the navigation bar are imported
import PayPalButton from './PaypalButton';
import '../styles/PlanSelection.css'; // Assume you have a corresponding CSS file for styles
import { jwtDecode } from 'jwt-decode';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS




function OffersPage() {
  const [selectedPlan, setSelectedPlan] = useState('basic');
  const [planDescription1, setPlanDescription1] = useState('this is the Basic plan,you get one additional video with smaller water mark');
  const [planDescription2, setPlanDescription2] = useState('why you should choose the Basic plan');
  const [planDescription3, setPlanDescription3] = useState('let me convince you');
  const navigate = useNavigate();
  const userEmail = jwtDecode(localStorage.getItem('token')).email;


  const plans = [
    { name: 'Basic', price: 'free', quality: 'Good', title:'you get one additional video with smaller water mark' },
    { name: 'Standard', price: '27.99', quality: 'Better', title: 'you get 10 videos to edit' },
    { name: 'Premium', price: '79.99', quality: 'Best', title: 'you can edit as many videos as you want, unlimited!' },
  ];

  const selectPlan = (plan) => {
    //console.log('selected plan:', selectedPlan, 'plan:', plan);
    setSelectedPlan(plan);
    const selected = plans.find(p => p.name.toLowerCase() === plan);
    setPlanDescription1(`this is the ${selected.name} plan,${selected.title} `);
    setPlanDescription2(`why you should choose the ${selected.name} plan `);
    setPlanDescription3(`let me convince you`);
   // console.log('selected plan2:', selectedPlan, 'plan2:', plan);
  };

  const handleNextClick = () => {
    console.log('email:',userEmail);
    const updatePlanRequest = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/update-plan`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: userEmail, paymentPlan: selectedPlan }),
        });
    
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
    
        const responseData = await response.json();
        console.log('Plan updated:', responseData);
      } catch (error) {
        console.error('Error updating plan:', error);
      }
    };
    
    updatePlanRequest();
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
      {
        selectedPlan !== 'basic' ? (
          <PayPalButton  
            amount={plans.find(p => p.name.toLowerCase() === selectedPlan).price} 
            onSuccessfulPayment={handleSuccessfulPayment} 
            selectedPlan={selectedPlan} 
            userEmail={userEmail}
          />
        ) : (
          <button className="next-button" onClick={handleNextClick}>Next</button>
        )
      }
    </div>
  );
}

export default OffersPage;

