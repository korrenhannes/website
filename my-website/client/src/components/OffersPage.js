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
  const [planDescription1, setPlanDescription1] = useState('Complimentary Content Creation: Get started with no costs at all.');
  const [planDescription2, setPlanDescription2] = useState('Why you should choose the Basic plan');
  const [planDescription3, setPlanDescription3] = useState('Let me convince you');
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
      title:'Complimentary Content Creation: Get started with no costs at all.',
      description1: 'Enhanced Branding: Enjoy one additional video with a less intrusive watermark, ensuring your content looks clean and professional.',
      description2: 'Freedom to Explore: Test the waters of content creation with zero commitment.',
      heading: 'Basic Plan: Start Your Journey – For Free!',
      secondary: 'Dive into the world of content creation without any barriers. Our Basic Plan offers you:'
    },
    { 
      name: 'Regular', 
      price: '$27.99', 
      quality: 'Better', 
      title: 'More Content, More Impact: Create and share more with an increased video limit', 
      description1: 'Precision Editing: Access advanced tools for finer edits.',
      description2: 'Quality Assurance: Benefit from high-quality video outputs that make your content stand out.',
      heading: 'Regular Plan: The Content Creator Companion - Only $27.99' ,
      secondary: 'Dive into the world of content creation without any barriers. Our Regular Plan offers you:'
    },
    { 
      name: 'Premium', 
      price: '$79.99', 
      quality: 'Best', 
      title: 'Unlimited Creative Freedom: No limits on video creation – if you can imagine it, you can create it.',
      description1: 'Exclusive Access: First dibs on new features and tools, putting you ahead of the curve.',
      description2: 'Priority Support: Get your questions answered with priority customer service.', 
      heading: 'Premium Plan: The Ultimate Creator Suite - Just $79.99' ,
      secondary: 'Dive into the world of content creation without any barriers. Our Premium Plan offers you:'
    },
  ];

  const selectPlan = (plan) => {
    //console.log('selected plan:', selectedPlan, 'plan:', plan);
    setSelectedPlan(plan);
    const selected = plans.find(p => p.name.toLowerCase() === plan);
    setPlanDescription1(selected.title);
    setPlanDescription2(selected.description1);
    setPlanDescription3(selected.description2);
    setPlanHeading(selected.heading);
    setplanSecondary(selected.secondary);
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

