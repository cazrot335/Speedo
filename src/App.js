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
import Text from "ol/style/Text";
import Fill from "ol/style/Fill";
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
  const [distance, setDistance] = useState(null);
  const [speedLimits, setSpeedLimits] = useState([]);
  const mapboxAccessToken = "sk.eyJ1IjoiY2F6cm90MzM1IiwiYSI6ImNseTh5aDE4cDBraTMya3M2ajdrNzV4NnkifQ.g_LPmWADVqli_5zqaIPxXg"; // Your Mapbox access token

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
          const endCoords = [parseFloat(lon), parseFloat(lat)];

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
        } else {
          console.error("Place not found");
          setDistance(null);
        }
      })
      .catch(error => {
        console.error('Error fetching place:', error);
        setDistance(null);
      });
  };

  const getSpeedLimitsForRoute = (coordinates) => {
    // Mock speed limit data
    return coordinates.map(coord => {
      return {
        coord,
        speedLimit: Math.floor(Math.random() * 80) + 20 // Random speed limit between 20 and 100
      };
    });
  };

  useEffect(() => {
    if (mapInstanceRef.current) {
      // Clear previous speed limit markers
      vectorSource.getFeatures().forEach(feature => {
        if (feature.get('isSpeedLimit')) {
          vectorSource.removeFeature(feature);
        }
      });

      // Add new speed limit markers
      speedLimits.forEach(limit => {
        const speedLimitMarker = new Feature({
          geometry: new Point(fromLonLat(limit.coord)),
          isSpeedLimit: true
        });

        speedLimitMarker.setStyle(
          new Style({
            text: new Text({
              text: `${limit.speedLimit} km/h`,
              font: '12px Calibri,sans-serif',
              fill: new Fill({ color: '#000' }),
              stroke: new Stroke({
                color: '#fff', width: 2
              }),
              offsetY: -15,
            })
          })
        );

        vectorSource.addFeature(speedLimitMarker);
      });
    }
  }, [speedLimits, vectorSource]);

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
      <div ref={mapRef} style={{ width: "100%", height: "85vh" }} />
      {distance !== null && (
        <div style={{ padding: "10px", background: "#fff", textAlign: "center" }}>
          Distance: {(distance / 1000).toFixed(2)} km
        </div>
      )}
    </div>
  );
};

export default OpenLayersMap;
