import React, { useEffect } from "react";
import { fromLonLat, toLonLat } from "ol/proj";
import Feature from "ol/Feature";
import LineString from "ol/geom/LineString";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";

const Route = ({ currentLocation, destinationMarker, vectorSource, mapboxAccessToken, setDistance, setSpeedLimits }) => {
  useEffect(() => {
    if (currentLocation && destinationMarker) {
      const startCoords = toLonLat(currentLocation);
      const endCoords = toLonLat(destinationMarker.getGeometry().getCoordinates());

      // Fetch route data from Mapbox Directions API
      fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${startCoords[0]},${startCoords[1]};${endCoords[0]},${endCoords[1]}?geometries=geojson&access_token=${mapboxAccessToken}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            const routeCoordinates = route.geometry.coordinates.map(coord => fromLonLat(coord));
            const routeFeature = new Feature({
              geometry: new LineString(routeCoordinates),
            });

            routeFeature.setStyle(
              new Style({
                stroke: new Stroke({
                  color: "green",
                  width: 2,
                }),
              })
            );

            // Remove any existing route features
            vectorSource.getFeatures().forEach(feature => {
              if (feature.getGeometry().getType() === 'LineString') {
                vectorSource.removeFeature(feature);
              }
            });

            // Add the new route feature
            vectorSource.addFeature(routeFeature);

            // Update distance state
            setDistance(route.distance);

            // Mock function to get speed limits
            const speedLimitData = getSpeedLimitsForRoute(route.geometry.coordinates);
            setSpeedLimits(speedLimitData);
          } else {
            console.error("No route found");
            setDistance(null);
          }
        })
        .catch(error => {
          console.error('Error fetching route:', error);
          setDistance(null);
        });
    }
  }, [currentLocation, destinationMarker, vectorSource, mapboxAccessToken, setDistance, setSpeedLimits]);

  const getSpeedLimitsForRoute = (coordinates) => {
    // Mock speed limit data
    return coordinates.map(coord => {
      return {
        coord,
        speedLimit: Math.floor(Math.random() * 80) + 20 // Random speed limit between 20 and 100
      };
    });
  };

  return null;
};

export default Route;
