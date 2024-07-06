import React, { useEffect, useRef, useState } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { fromLonLat, toLonLat } from "ol/proj";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import LineString from "ol/geom/LineString";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Icon from "ol/style/Icon";
import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";
import "ol/ol.css";

const createColoredMarker = (color) => {
  const canvas = document.createElement("canvas");
  const size = 20;
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");

  context.beginPath();
  context.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI, false);
  context.fillStyle = color;
  context.fill();

  return canvas.toDataURL();
};

const OpenLayersMap = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [currentLocation, setCurrentLocation] = useState([0, 0]);
  const vectorSource = useRef(new VectorSource()).current;
  const [destinationMarker, setDestinationMarker] = useState(null);
  const [placeName, setPlaceName] = useState('');
  const mapboxAccessToken = "sk.eyJ1IjoiY2F6cm90MzM1IiwiYSI6ImNseTh5aDE4cDBraTMya3M2ajdrNzV4NnkifQ.g_LPmWADVqli_5zqaIPxXg"; // Your Mapbox access token
  const openWeatherApiKey = "511d249cc2c0a8b993b73a70024572ed"; // Your OpenWeatherMap API key

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

    // Get the current location of the device
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = [position.coords.longitude, position.coords.latitude];
          console.log("Current location:", coords);
          const transformedCoords = fromLonLat(coords); // Transform to map projection
          setCurrentLocation(transformedCoords);
          map.getView().setCenter(transformedCoords);

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

    // Clean up function to remove the map on component unmount
    return () => {
      map.setTarget(null);
    };
  }, [vectorSource]);

  // Update map view when currentLocation changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.getView().setCenter(currentLocation);
    }
  }, [currentLocation]);

  // Handle form submission
  const handlePlaceNameSubmit = (event) => {
    event.preventDefault();

    // Fetch place data from OpenWeatherMap API
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${placeName}&appid=${openWeatherApiKey}&units=metric`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        const { lon, lat } = data.coord;
        const clickedCoord = fromLonLat([lon, lat]);

        // Update or create the destination marker
        let newDestinationMarker;
        if (destinationMarker) {
          destinationMarker.getGeometry().setCoordinates(clickedCoord);
          newDestinationMarker = destinationMarker;
        } else {
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
        }

        // Get current location in longitude and latitude
        const startCoords = toLonLat(currentLocation);
        const endCoords = [lon, lat];

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
              const routeCoordinates = data.routes[0].geometry.coordinates.map(coord => fromLonLat(coord));
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
            } else {
              console.error("No route found");
            }
          })
          .catch(error => console.error('Error fetching route:', error));
      })
      .catch(error => console.error('Error fetching place:', error));
  };

  return (
    <div>
      <form onSubmit={handlePlaceNameSubmit}>
        <input
          type="text"
          value={placeName}
          onChange={(e) => setPlaceName(e.target.value)}
          placeholder="Enter place name"
          required
        />
        <button type="submit">Go</button>
      </form>
      <div ref={mapRef} style={{ width: "100%", height: "90vh" }} />
    </div>
  );
};

export default OpenLayersMap;



