import React, { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import MapView from "./map";

// backend base can be overridden by environment variable REACT_APP_BACKEND_URL
const BACKEND = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
const socket = io(BACKEND);

export default function App() {
  const [name, setName] = useState("");
  const [did, setDid] = useState("");
  const [position, setPosition] = useState([12.9716, 77.5946]);
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    axios.get(`${BACKEND}/incidents`).then(r => setIncidents(r.data)).catch(()=>{});
    socket.on("newIncident", inc => setIncidents(prev => [inc, ...prev]));
    return () => socket.disconnect();
  }, []);

  const register = async () => {
    if (!name) return alert("Enter name");
    const res = await axios.post(`${BACKEND}/register`, { name });
    setDid(res.data.did);
    alert("Registered: " + res.data.did);
  };

  const sendSOS = async () => {
    if (!did) return alert("Register first");
    await axios.post(`${BACKEND}/incident`, { touristId: did, type: "SOS", lat: position[0], lng: position[1]});
    alert("SOS sent");
  };

  const startGPS = () => {
    if (!navigator.geolocation) return alert("Geolocation not available");
    navigator.geolocation.getCurrentPosition(p => {
      setPosition([p.coords.latitude, p.coords.longitude]);
      alert("Location obtained");
    }, err => alert("GPS error: " + err.message), { enableHighAccuracy: true });
  };

  return (
    <div style={{padding:20, fontFamily:'Arial'}}>
      <h2>Smart Tourist Safety — Demo</h2>
      <div style={{marginBottom:10}}>
        <input placeholder="Your name" value={name} onChange={e=>setName(e.target.value)} />
        <button onClick={register} style={{marginLeft:8}}>Register (Create DID)</button>
      </div>
      <div style={{marginBottom:10}}>
        <button onClick={startGPS}>Get Current Location</button>
        <button onClick={sendSOS} style={{marginLeft:8}}>Send SOS</button>
      </div>

      <div style={{display:'flex', gap:20}}>
        <div style={{flex:1}}>
          <MapView incidents={incidents} touristPos={position} />
        </div>
        <div style={{width:320}}>
          <h3>Incidents</h3>
          <div style={{maxHeight:420, overflow:'auto'}}>
            {incidents.map(i => (
              <div key={i.id} style={{borderBottom:'1px solid #ddd', padding:8}}>
                <b>{i.type}</b><br/>
                {i.touristId}<br/>
                {i.lat && `${i.lat.toFixed(5)}, ${i.lng.toFixed(5)}`}<br/>
                <small>{i.timestamp || ''}</small>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{marginTop:12}}>
        <small>DID: <span style={{fontFamily:'monospace'}}>{did || 'Not registered'}</span></small>
      </div>
    </div>
  );
}
