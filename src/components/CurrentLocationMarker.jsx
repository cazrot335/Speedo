import React, { useEffect } from "react";
import { fromLonLat } from "ol/proj";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import Icon from "ol/style/Icon";
import Style from "ol/style/Style";
import createColoredMarker from "./createColoredMarker"; // Utility function to create colored markers

const CurrentLocationMarker = ({ vectorSource, setCurrentLocation }) => {
  useEffect(() => {
    let watchId;

    // Function to handle success of geolocation
    const handlePositionUpdate = (position) => {
      const coords = [position.coords.longitude, position.coords.latitude];
      console.log("Current location:", coords);
      const transformedCoords = fromLonLat(coords); // Transform to map projection
      setCurrentLocation(transformedCoords);

      // Create or update the marker feature for the current location
      const currentLocationMarker = new Feature({
        geometry: new Point(transformedCoords),
      });

      // Set the style for the current location marker
      currentLocationMarker.setStyle(
        new Style({
          image: new Icon({
            src: createColoredMarker("blue"), // Use the custom colored marker
            anchor: [0.5, 1],
            imgSize: [20, 20],
          }),
        })
      );

      // Clear previous features and add the updated current location marker to the vector source
      vectorSource.clear();
      vectorSource.addFeature(currentLocationMarker);
    };

    // Function to handle errors in geolocation
    const handlePositionError = (error) => {
      console.error("Error fetching geolocation:", error);
    };

    // Get the current location of the device
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(handlePositionUpdate, handlePositionError);
    } else {
      console.error("Geolocation is not supported by this browser.");
    }

    // Clean up function to clear the watch position on component unmount
    return () => {
      if (watchId !== undefined) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [vectorSource, setCurrentLocation]);

  return null;
};

export default CurrentLocationMarker;

