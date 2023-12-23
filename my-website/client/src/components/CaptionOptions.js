// CaptionOptions.js

import React from 'react';

function CaptionOptions({ captionStyle, setCaptionStyle }) {
  // Function to handle changes in individual caption style options
  const handleStyleChange = (option, value) => {
    setCaptionStyle({
      ...captionStyle,
      [option]: value,
    });
  };

  return (
    <div className="caption-options">
      <div className="option-group">
        <label>Auto caption:</label>
        <switch
          checked={captionStyle.autoCaption}
          onChange={(e) => handleStyleChange('autoCaption', e.target.checked)}
        />
      </div>
      <div className="option-group">
        <label>Caption position:</label>
        <button onClick={() => handleStyleChange('position', 'top')}>Top</button>
        <button onClick={() => handleStyleChange('position', 'middle')}>Middle</button>
        <button onClick={() => handleStyleChange('position', 'bottom')}>Bottom</button>
      </div>
      <div className="option-group">
        <label>Caption transition:</label>
        <button onClick={() => handleStyleChange('transition', 'karaoke')}>Karaoke</button>
        <button onClick={() => handleStyleChange('transition', 'popline')}>Popline</button>
        <button onClick={() => handleStyleChange('transition', 'pop')}>Pop</button>
        <button onClick={() => handleStyleChange('transition', 'scale')}>Scale</button>
        <button onClick={() => handleStyleChange('transition', 'slideLeft')}>Slide Left</button>
        <button onClick={() => handleStyleChange('transition', 'slideUp')}>Slide Up</button>
      </div>
      <div className="option-group">
        <label>Highlight color:</label>
        <input
          type="color"
          value={captionStyle.highlightColor}
          onChange={(e) => handleStyleChange('highlightColor', e.target.value)}
        />
      </div>
    </div>
  );
}

export default CaptionOptions;
