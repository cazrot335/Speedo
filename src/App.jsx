// src/App.jsx
import React, { useState, useRef } from "react";
import VectorSource from "ol/source/Vector";
import MapComponent from "./components/MapComponent";
import CurrentLocationMarker from "./components/CurrentLocationMarker";
import DestinationMarker from "./components/DestinationMarker";
import Route from "./components/Route";
import SpeedLimitMarkers from "./components/SpeedLimitMarkers";
import PlaceSearchForm from "./components/PlaceSearchForm";
import './components/style.css';

const App = () => {
  const [currentLocation, setCurrentLocation] = useState([0, 0]);
  const vectorSource = useRef(new VectorSource()).current;
  const [destinationMarker, setDestinationMarker] = useState(null);
  const [distance, setDistance] = useState(null);
  const [speedLimits, setSpeedLimits] = useState([]);
  const mapboxAccessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

  return (
    <div>
      <div className="map-container">
        <PlaceSearchForm setDestinationMarker={setDestinationMarker} vectorSource={vectorSource} />
        <MapComponent currentLocation={currentLocation} vectorSource={vectorSource} />
      </div>
      <CurrentLocationMarker vectorSource={vectorSource} setCurrentLocation={setCurrentLocation} />
      <DestinationMarker destinationMarker={destinationMarker} setDestinationMarker={setDestinationMarker} vectorSource={vectorSource} />
      <Route
        currentLocation={currentLocation}
        destinationMarker={destinationMarker}
        vectorSource={vectorSource}
        mapboxAccessToken={mapboxAccessToken}
        setDistance={setDistance}
        setSpeedLimits={setSpeedLimits}
      />
      <SpeedLimitMarkers speedLimits={speedLimits} vectorSource={vectorSource} />
      {distance !== null && (
        <div style={{ padding: "10px", background: "#fff", textAlign: "center" }}>
          Distance: {(distance / 1000).toFixed(2)} km
        </div>
      )}
    </div>
  );
};

export default App;
