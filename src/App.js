import * as React from 'react';
import { useState, useCallback, useEffect } from 'react';
import { render } from 'react-dom';
import MapGL from 'react-map-gl';
import { GeolocateControl } from "mapbox-gl"
import 'mapbox-gl/dist/mapbox-gl.css';
import MapboxDraw from '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import * as turf from '@turf/turf';

const TOKEN = 'pk.eyJ1IjoiYWIzMzMzIiwiYSI6ImNsYzhucm1yaDMwNDQzeHA5dGM1aWo3czgifQ.5Wo5fDbSWf82b3mqLsn9Gg'; // Set your mapbox token here

export default function App() {
  const [hasLocationPermission, setHasLocationPermission] = useState(true);

  const [features, setFeatures] = useState({});
  const [viewport, setViewport] = useState({
    longitude: -91.874,
    latitude: 42.76,
    zoom: 12
  });
  const [lat, setLat] = useState(25.38764429272866);
  const [lng, setLng] = useState(51.52128155397327);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      setViewport({
        longitude: position.coords.longitude,
        latitude: position.coords.latitude,
        zoom: 14
      });
    });
  }, []);

  const mapRef = useCallback(map => {
    if (map) {
      const draw = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          polygon: true,
          trash: true
        }
      });
      map.addControl(draw, 'top-left');
      map.on('draw.create', e => setFeatures(e.features));
      map.on('draw.update', e => setFeatures(e.features));
      map.on('draw.delete', e => setFeatures(e.features));

      const geolocateControl = new GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserLocation: hasLocationPermission
      });
      map.addControl(geolocateControl);

      geolocateControl.on('geolocate', () => {
        setHasLocationPermission(true);
      });
    }
  }, []);

  const handleLatChange = e => setLat(e.target.value);
  const handleLngChange = e => setLng(e.target.value);

  const handleCheck = () => {
    const point = turf.point([parseFloat(lng), parseFloat(lat)]);
    const polygon = features[Object.keys(features)[0]];
    const inside = turf.booleanPointInPolygon(point, polygon.geometry);
    alert(inside ? 'Inside' : 'Outside');
  };

  return (
    <div>
      <MapGL
        ref={mapRef}
        {...viewport}
        style={{ height: "80vh" }}
        scrollZoom={true}
        mapboxAccessToken={TOKEN}
        mapStyle="mapbox://styles/mapbox/light-v11"
        mapboxApiAccessToken={TOKEN}
        onViewportChange={setViewport}
      />
      <div className="flex flex-row space-x-4 mt-4 justify-center items-end">
        <div className="flex flex-col">
          <label className="text-gray-700 font-bold mb-2" htmlFor="latitude">
            Latitude:
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="latitude"
            type="text"
            value={lat}
            onChange={handleLatChange}
            placeholder="Enter latitude"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-gray-700 font-bold mb-2" htmlFor="longitude">
            Longitude:
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="longitude"
            type="text"
            value={lng}
            onChange={handleLngChange}
            placeholder="Enter longitude"
          />
        </div>
        <button style={{ width: "10%", height: "54px" }} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" onClick={handleCheck}>
          Check
        </button>
      </div>

    </div>
  );
}

export function renderToDom(container) {
  render(<App />, container);
}
