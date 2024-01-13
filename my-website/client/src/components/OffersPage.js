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
  const [planDescription1, setPlanDescription1] = useState('Start Your Creative Journey - Absolutely Free!');
  const [planDescription2, setPlanDescription2] = useState('Boost Your Brand: Create videos with a professional touch and minimal watermarking.');
  const [planDescription3, setPlanDescription3] = useState('Explore Without Limits: Experiment with content creation, no strings attached.');
  const [planHeading, setPlanHeading] = useState('Basic Plan: Start Your Journey – For Free!');
  const [planSecondary, setplanSecondary] = useState('Dive into the world of content creation without any barriers. Our Basic Plan offers you:');

  const navigate = useNavigate();
  let userEmail ='';
  if (isLoggedIn){
     userEmail =  jwtDecode(localStorage.getItem('token')).email;
  } else {
     userEmail = 'Guest';
  }

  const plans = [
    {
      name: 'Basic',
      price: 'Free',
      quality: 'Good',
      title: 'Start Your Creative Journey - Absolutely Free!',
      description1: 'Boost Your Brand: Create videos with a professional touch and minimal watermarking.',
      description2: 'Explore Without Limits: Experiment with content creation, no strings attached.',
      heading: 'Step into the World of Content Creation with Our Basic Plan - It’s on Us!',
      secondary: 'Embark on your content creation journey with zero cost. The Basic Plan offers you an array of features to get started:'
    },
    { 
      name: 'Regular', 
      price: '$27.99', 
      quality: 'Better', 
      title: 'Enhance Your Impact: Unlock More Creations for Just $27.99!', 
      description1: 'Master Your Craft: Gain access to advanced editing tools for premium content creation.',
      description2: 'Quality that Speaks: Elevate your videos with high-definition output.',
      heading: 'Take Your Content to the Next Level with the Regular Plan!',
      secondary: 'Step up your game for only $27.99. The Regular Plan introduces you to advanced features for enhanced content creation:'
    },
    { 
      name: 'Premium', 
      price: '$79.99', 
      quality: 'Best', 
      title: 'Unlimited Possibilities: Create Without Boundaries!',
      description1: 'Exclusive Features: Be the first to explore cutting-edge tools in content creation.',
      description2: 'Priority Support: Experience our dedicated customer service, always there to assist you.',
      heading: 'Join the Elite with Our Premium Plan - The Ultimate Creative Suite!',
      secondary: 'For just $79.99, gain unlimited access to our most exclusive features. The Premium Plan is designed for those who want to lead in content creation:'
    },
  ];


  const selectPlan = (plan) => {
    setSelectedPlan(plan);
    // Other code if necessary
  };

  useEffect(() => {
    const selected = plans.find(p => p.name.toLowerCase() === selectedPlan);
    if (selected) {
      setPlanDescription1(selected.title);
      setPlanDescription2(selected.description1);
      setPlanDescription3(selected.description2);
      setPlanHeading(selected.heading);
      setplanSecondary(selected.secondary);
    }
  }, [selectedPlan]); // This hook is dependent on selectedPlan

  const handleNextClick = () => {
    if (isLoggedIn){
    console.log('email:',userEmail);
    updatePlanRequest(userEmail,selectedPlan);
    navigate('/home');
    } else {
      navigate('/signup')
    }
  };

  const handleSuccessfulPayment = () => {
    navigate('/home');
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
        <h2>{planSecondary}</h2>
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

