import React, { useEffect } from 'react';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat } from 'ol/proj';

const DestinationMarker = ({ map, vectorSource, lon, lat }) => {
  useEffect(() => {
    if (map && vectorSource) {
      const clickedCoord = fromLonLat([lon, lat]);

      // Check if feature already exists and update or add accordingly
      let existingFeature = vectorSource.getFeatureById('destination-marker');
      if (existingFeature) {
        // Feature already exists, update coordinates
        existingFeature.getGeometry().setCoordinates(clickedCoord);
      } else {
        // Feature doesn't exist, create and add new feature
        const newFeature = new Feature({
          geometry: new Point(clickedCoord),
          id: 'destination-marker', // Use a unique identifier
        });
        vectorSource.addFeature(newFeature);
      }
    }
  }, [map, vectorSource, lon, lat]);

  return null; // DestinationMarker doesn't render anything directly
};

export default DestinationMarker;

