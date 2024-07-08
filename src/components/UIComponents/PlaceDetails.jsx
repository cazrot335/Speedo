import React from 'react';
import '../style.css'; // Create a separate CSS file for styling

const PlaceDetails = ({ placeDetails, distance, climate }) => {
  if (!placeDetails) return null;

  return (
    <div className="place-details-footer">
      <h3>{placeDetails.display_name}</h3>
      <p>Distance: {distance} km</p>
      <p>Description: {placeDetails.description}</p>
      <p>Climate: {climate}</p>
    </div>
  );
};

export default PlaceDetails;
