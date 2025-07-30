import React from 'react';
import './FareList.css';

const FareList = ({ fares }) => {
  return (
    <div className="fare-list">
      {fares.map((fare) => (
        <div key={fare.cabName} className="fare-card">
          <h3>{fare.cabName}</h3>
          <p>Fare: ₹{fare.fare}</p>
          <p>Estimated Time: {fare.estimatedTime}</p>
          <p>Distance: {fare.distance} km</p>
        </div>
      ))}
    </div>
  );
};

export default FareList;
