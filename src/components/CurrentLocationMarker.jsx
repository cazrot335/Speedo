import React, { useEffect } from "react";
import { fromLonLat } from "ol/proj";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import Icon from "ol/style/Icon";
import Style from "ol/style/Style";
import createColoredMarker from "./createColoredMarker"; // Utility function to create colored markers

const CurrentLocationMarker = ({ vectorSource, setCurrentLocation }) => {
  useEffect(() => {
    // Get the current location of the device
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = [position.coords.longitude, position.coords.latitude];
          console.log("Current location:", coords);
          const transformedCoords = fromLonLat(coords); // Transform to map projection
          setCurrentLocation(transformedCoords);

          // Create a marker feature for the current location
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

          // Add the current location marker to the vector source
          vectorSource.addFeature(currentLocationMarker);
        },
        (error) => {
          console.error("Error fetching geolocation:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, [vectorSource, setCurrentLocation]);

  return null;
};

export default CurrentLocationMarker;
