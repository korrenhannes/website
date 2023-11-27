// HeadlineEditor.js

import React from 'react';

function HeadlineEditor({ headline, setHeadline }) {
  return (
    <input
      type="text"
      placeholder="Edit Headline"
      value={headline}
      onChange={(e) => setHeadline(e.target.value)}
      className="headline-editor"
    />
  );
}

export default HeadlineEditor;
