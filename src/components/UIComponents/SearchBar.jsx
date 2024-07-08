import React, { useState, useEffect } from 'react';
import '../style.css';
import PlaceDetails from '../UIComponents/PlaceDetails'; // Import the footer component

const SearchBar = ({ placeName, setPlaceName, handlePlaceNameSubmit }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [distance, setDistance] = useState(null);
  const [climate, setClimate] = useState(null);
  const [currentLocation, setCurrentLocation] = useState([0, 0]); // Default value, should be replaced with actual current location

  // Function to fetch place suggestions from Nominatim API based on user input
  const fetchSuggestions = async (query) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&limit=2&format=json`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setSuggestions(data); // Update suggestions based on API response
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Function to handle user input changes
  const handlePlaceNameChange = (event) => {
    const query = event.target.value;
    setPlaceName(query);
    // Fetch suggestions based on the user-entered query
    fetchSuggestions(query);
  };

  // Function to handle the selection of a suggestion
  const handleSelectSuggestion = (suggestion) => {
    // Set the selected place and clear suggestions
    setSelectedPlace(suggestion);
    setSuggestions([]);
    
    // Calculate distance from current location (assuming current location is available as `currentLocation`)
    const distance = calculateDistance(currentLocation, [suggestion.lon, suggestion.lat]);
    setDistance(distance);

    // Fetch climate details for the selected place (replace with your actual API call)
    fetchClimateDetails(suggestion.lat, suggestion.lon).then(setClimate);

    // Update the input value to the selected place name
    setPlaceName(suggestion.display_name);
  };

  // Function to calculate distance (Haversine formula)
  const calculateDistance = (currentLocation, destination) => {
    const [lon1, lat1] = currentLocation;
    const [lon2, lat2] = destination;
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance.toFixed(2);
  };

  // Function to fetch climate details (replace with your actual API call)
  const fetchClimateDetails = async (lat, lon) => {
    // Fetch climate data from an API
    // ...
    return "Sunny"; // Example data
  };

  // Clear suggestions when placeName changes
  useEffect(() => {
    setSuggestions([]);
  }, [placeName]);

  // Get the current location of the device
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = [position.coords.longitude, position.coords.latitude];
          setCurrentLocation(coords);
        },
        (error) => {
          console.error("Error fetching geolocation:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  return (
    <>
      <form onSubmit={handlePlaceNameSubmit} className="place-search-form">
        <label className="relative block search-bar-container">
          <span className="absolute inset-y-0 left-0 flex items-center pl-2">
            <svg className="h-5 w-5 fill-slate-300" viewBox="0 0 20 20">
              {/* Your SVG icon */}
            </svg>
          </span>
          <input
            className="placeholder:italic placeholder:text-slate-400 block bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm search-input"
            placeholder="Search for a place"
            type="text"
            value={placeName}
            onChange={handlePlaceNameChange}
            required
          />
          <button className="search-button" type="submit">
            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0 0 24 24">
              <path d="M 10 2 C 5.589 2 2 5.589 2 10 C 2 14.411 5.589 18 10 18 C 11.936 18 13.713609 17.307203 15.099609 16.158203 L 20.720703 21.779297 C 20.866703 21.925297 21.058 22 21.25 22 C 21.442 22 21.633297 21.926297 21.779297 21.779297 C 22.072297 21.486297 22.072297 21.013703 21.779297 20.720703 L 16.158203 15.099609 C 17.307203 13.713609 18 11.936 18 10 C 18 5.589 14.411 2 10 2 z M 10 3.5 C 13.584 3.5 16.5 6.416 16.5 10 C 16.5 13.584 13.584 16.5 10 16.5 C 6.416 16.5 3.5 13.584 3.5 10 C 3.5 6.416 6.416 3.5 10 3.5 z M 10 5 A 5 5 0 0 0 10 15 A 5 5 0 0 0 10 5 z"></path>
            </svg>
          </button>
        </label>
        {/* Display suggestions */}
        <ul className="suggestions-list">
          {suggestions.map((suggestion) => (
            <li key={suggestion.place_id}>
              <button onClick={() => handleSelectSuggestion(suggestion)}>{suggestion.display_name}</button>
            </li>
          ))}
        </ul>
      </form>
      {/* Place Details Footer */}
      <PlaceDetails placeDetails={selectedPlace} distance={distance} climate={climate} />
    </>
  );
};

export default SearchBar;
