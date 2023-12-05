import React from 'react';
import NavigationBar from './NavigationBar';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/HowItWorks.css';
import '../styles/NavigationBar.css';

const HowItWorks = () => {
  return (
    <div className="how-it-works-container">
      <NavigationBar />
      <div className="container text-center my-5">
        <h1>It's time to Cliplt.</h1>
        <p className="lead">“Creating content has never been this easy” - With our simple 3 step process you can transform long videos into short and exciting content.</p>
        <div className="row">
          <div className="col-md-4 step">
            {/* Update the src attribute to the correct path */}
            <img src="/Untitled.png" alt="Upload" className="icon" />
            <h3>Upload.</h3>
            <p>Choose and upload a video of your choosing with a length of up to 2 hours.</p>
          </div>
          <div className="col-md-4 step">
            {/* Update the src attribute to the correct path */}
            <img src="/Untitled.png" alt="Cliplt" className="icon" />
            <h3>Cliplt.</h3>
            <p>Using our advanced AI algorithm you can clip your video and edit it with 1,000+ options of customization including effects and audio.</p>
          </div>
          <div className="col-md-4 step">
            {/* Update the src attribute to the correct path */}
            <img src="/Untitled.png" alt="Share" className="icon" />
            <h3>Share it.</h3>
            <p>After choosing and clipping your videos you can simply share your new favorite edits in any platform and let your followers enjoy high-quality content.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
