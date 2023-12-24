import React, { useEffect } from 'react';
import { useComplaints } from './contexts/ComplaintsContext';

function ComplaintsPage() {
  const { complaints } = useComplaints();

  // Debugging: Log the current complaints to the console
  console.log("Current complaints on ComplaintsPage:", complaints);

  // Additional Debugging: Log when ComplaintsPage rerenders
  useEffect(() => {
    console.log("ComplaintsPage rerendered");
  });

  return (
    <div>
      <h2>Complaints</h2>
      {complaints.length > 0 ? (
        complaints.map((complaint, index) => (
          <p key={index}>{complaint}</p>
        ))
      ) : (
        <p>No complaints to show.</p> // Message when there are no complaints
      )}
    </div>
  );
}

export default ComplaintsPage;
