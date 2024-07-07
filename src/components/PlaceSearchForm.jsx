import React, { useState } from "react";
import { fromLonLat } from "ol/proj";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import Icon from "ol/style/Icon";
import Style from "ol/style/Style";
import createColoredMarker from "./createColoredMarker"; // Utility function to create colored markers
import ButtonIcon from "./UIComponents/ButtonIcon"; // Import your ButtonIcon component

const PlaceSearchForm = ({ setDestinationMarker, vectorSource }) => {
  const [placeName, setPlaceName] = useState('');

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

          // Update or create the destination marker
          let newDestinationMarker;
          newDestinationMarker = new Feature({
            geometry: new Point(clickedCoord),
          });

          // Set the style for the destination marker
          newDestinationMarker.setStyle(
            new Style({
              image: new Icon({
                src: createColoredMarker("red"), // Use the custom colored marker
                anchor: [0.5, 1],
                imgSize: [20, 20],
              }),
            })
          );

          setDestinationMarker(newDestinationMarker);
          vectorSource.addFeature(newDestinationMarker);
        } else {
          console.error("Place not found");
        }
      })
      .catch(error => {
        console.error('Error fetching place:', error);
      });
  };

  return (
    <form onSubmit={handlePlaceNameSubmit}>
      <input
        type="text"
        value={placeName}
        onChange={(e) => setPlaceName(e.target.value)}
        placeholder="Enter place name"
        required
      />
      <ButtonIcon /> {/* Replace the button with ButtonIcon component */}
    </form>
  );
};

export default PlaceSearchForm;

