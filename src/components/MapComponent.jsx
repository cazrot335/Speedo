import React, { useEffect, useRef } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import VectorLayer from 'ol/layer/Vector';
import "ol/ol.css";
import './style.css'; // Import the CSS file

const MapComponent = ({ currentLocation, vectorSource }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    // Initialize the map only once
    const map = new Map({
      view: new View({
        center: currentLocation,
        zoom: 12,
      }),
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        new VectorLayer({
          source: vectorSource,
        }),
      ],
      target: mapRef.current,
    });
    mapInstanceRef.current = map;

    // Clean up function to remove the map on component unmount
    return () => {
      map.setTarget(null);
    };
  }, [currentLocation, vectorSource]);

  // Update map view when currentLocation changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.getView().setCenter(currentLocation);
    }
  }, [currentLocation]);

  return <div ref={mapRef} className="map-container" />;
};

export default MapComponent;

