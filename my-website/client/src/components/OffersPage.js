import React, { useState, useEffect  } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationBar from './NavigationBar'; // Import the navigation bar component
import '../styles/NavigationBar.css'; // Ensure the styles for the navigation bar are imported
import PayPalButton from './PaypalButton';
import '../styles/PlanSelection.css'; // Assume you have a corresponding CSS file for styles
import { jwtDecode } from 'jwt-decode';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import updatePlanRequest from './UpdatePlanService'; // Adjust the path as necessary



function OffersPage({isLoggedIn}) {
  const [selectedPlan, setSelectedPlan] = useState('basic');
  const [planDescription1, setPlanDescription1] = useState('This is the Basic plan, you get one additional video with smaller water mark');
  const [planDescription2, setPlanDescription2] = useState('Why you should choose the Basic plan');
  const [planDescription3, setPlanDescription3] = useState('Let me convince you');
  const [planHeading, setPlanHeading] = useState('Heading');
  const navigate = useNavigate();
  let userEmail ='';
  if (isLoggedIn){
     userEmail =  jwtDecode(localStorage.getItem('token')).email;
  } else {
     userEmail = 'Guest';
  }

  const plans = [
    { name: 'Basic', price: 'Free', quality: 'Good', title:'you get one additional video with smaller water mark', heading: 'Basic plan heading' },
    { name: 'Regular', price: '$27.99', quality: 'Better', title: 'you get 10 videos to edit', heading: 'Regular plan heading' },
    { name: 'Premium', price: '$79.99', quality: 'Best', title: 'you can edit as many videos as you want, unlimited!', heading: 'Premium plan heading' },
  ];

  const selectPlan = (plan) => {
    //console.log('selected plan:', selectedPlan, 'plan:', plan);
    setSelectedPlan(plan);
    const selected = plans.find(p => p.name.toLowerCase() === plan);
    setPlanDescription1(`this is the ${selected.name} plan,${selected.title} `);
    setPlanDescription2(`why you should choose the ${selected.name} plan `);
    setPlanDescription3(`let me convince you`);
    setPlanHeading(selected.heading);
   // console.log('selected plan2:', selectedPlan, 'plan2:', plan);
  };

  const handleNextClick = () => {
    if (isLoggedIn){
    console.log('email:',userEmail);
    updatePlanRequest(userEmail,selectedPlan);
    navigate('/cloud-api');
    } else {
      navigate('/signup')
    }
  };

  const handleSuccessfulPayment = () => {
    navigate('/cloud-api');
  };
  const renderButton = () => {
    if (!isLoggedIn){
      return <button className='next-button' onClick={handleNextClick} >sign up to get the right offer for you!</button>;
    }
    else if (selectedPlan !== 'basic'){
      return (
        <PayPalButton  
          amount={plans.find(p => p.name.toLowerCase() === selectedPlan).price.slice(1)} 
          onSuccessfulPayment={handleSuccessfulPayment} 
          selectedPlan={selectedPlan} 
          userEmail={userEmail}
        />
      );
    } else {
      return <button className="next-button" onClick={handleNextClick}>Next</button>;
    }
  };

  return (
    <div className="container-fluid">
      <div className="image-overlay"></div> {/* Add this line */}
      <div className="plan-selection">
        <h1>{planHeading}</h1>
        <h2>secondary</h2>
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
       {renderButton()}
      </div>
    </div>
  );
}

export default OffersPage;

