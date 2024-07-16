import React from 'react';
import '../style.css';

const PlaceDetails = ({ placeDetails, distance, climate }) => {
  if (!placeDetails) return null;

  return (
    <div className="place-details-footer">
      <h3>{placeDetails.display_name}</h3>
      <p><strong>Distance:</strong> {(distance / 1000).toFixed(2)} km</p>
      <p><strong>Climate:</strong> {climate}</p>
      {/* Add additional details as needed */}
    </div>
  );
};

export default PlaceDetails;

