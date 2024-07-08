import React, { useState } from "react";
import { fromLonLat } from "ol/proj";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import Icon from "ol/style/Icon";
import Style from "ol/style/Style";
import createColoredMarker from "./createColoredMarker";
import SearchBar from "./UIComponents/SearchBar"; // Import the SearchBar component

const PlaceSearchForm = ({ setDestinationMarker, vectorSource }) => {
  const [placeName, setPlaceName] = useState('');
  const [destinationMarker, setDestinationMarkerState] = useState(null); // State to hold the destination marker

  const handlePlaceNameSubmit = (event) => {
    event.preventDefault();

    // Fetch place data from Nominatim API
    fetch(`https://nominatim.openstreetmap.org/search?q=${placeName}&format=json&limit=1`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data.length > 0) {
          const { lon, lat } = data[0];
          const clickedCoord = fromLonLat([parseFloat(lon), parseFloat(lat)]);

          // Create a new destination marker
          const newDestinationMarker = new Feature({
            geometry: new Point(clickedCoord),
          });

          // Set the style for the destination marker
          newDestinationMarker.setStyle(
            new Style({
              image: new Icon({
                src: createColoredMarker("red"),
                anchor: [0.5, 1],
                imgSize: [20, 20],
              }),
            })
          );

          // Remove existing marker if it exists
          if (destinationMarker) {
            vectorSource.removeFeature(destinationMarker);
          }

          // Add new marker to the vector source and set it as the current destination marker
          vectorSource.addFeature(newDestinationMarker);
          setDestinationMarker(newDestinationMarker);
          setDestinationMarkerState(newDestinationMarker); // Update local state
        } else {
          console.error("Place not found");
        }
      })
      .catch(error => {
        console.error('Error fetching place:', error);
      });
  };

  return (
    <SearchBar
      placeName={placeName}
      setPlaceName={setPlaceName}
      handlePlaceNameSubmit={handlePlaceNameSubmit}
    />
  );
};

export default PlaceSearchForm;

