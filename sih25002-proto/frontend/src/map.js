import React from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

export default function MapView({ incidents, touristPos }) {
  const center = touristPos || [12.9716, 77.5946];
  return (
    <MapContainer center={center} zoom={13} style={{height:500}}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {touristPos && <Marker position={touristPos}><Popup>Your location</Popup></Marker>}
      {incidents.map(i => (
        <Circle key={i.id} center={[i.lat, i.lng]} radius={40} pathOptions={{color:'red'}}></Circle>
      ))}
    </MapContainer>
  );
}
