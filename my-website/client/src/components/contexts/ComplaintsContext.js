import React, { createContext, useState, useContext, useEffect } from 'react';

const ComplaintsContext = createContext({
  complaints: [],
  addComplaint: () => {}
});

export const useComplaints = () => useContext(ComplaintsContext);

export const ComplaintsProvider = ({ children }) => {
  const [complaints, setComplaints] = useState([]);

  const addComplaint = (complaint) => {
    if (complaint.trim() !== '') {
      setComplaints(prevComplaints => [...prevComplaints, complaint]);
    }
  };

  useEffect(() => {
    console.log("Complaints updated:", complaints);
  }, [complaints]);

  return (
    <ComplaintsContext.Provider value={{ complaints, addComplaint }}>
      {children}
    </ComplaintsContext.Provider>
  );
};
