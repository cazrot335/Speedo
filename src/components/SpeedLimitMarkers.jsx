import React, { useEffect } from "react";
import { fromLonLat } from "ol/proj";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import Style from "ol/style/Style";
import Text from "ol/style/Text";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";

const SpeedLimitMarkers = ({ speedLimits, vectorSource }) => {
  useEffect(() => {
    if (speedLimits.length > 0) {
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

  return null;
};

export default SpeedLimitMarkers;
