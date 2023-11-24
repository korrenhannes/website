import React from 'react';
import '../styles/Controls.css';

function VideoControls() {
  return (
    <div className="video-controls">
      <button className="control-btn">Like</button>
      <button className="control-btn">Comment</button>
      <button className="control-btn">Share</button>
    </div>
  );
}

export default VideoControls;
