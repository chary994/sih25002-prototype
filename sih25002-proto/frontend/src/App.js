import React, { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import MapView from "./map";

// Use env var if set (for hosted backend); otherwise use localhost for local demo
const BACKEND = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";

export default function App() {
  const [name, setName] = useState("");
  const [did, setDid] = useState("");
  const [position, setPosition] = useState([12.9716, 77.5946]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    // fetch existing incidents
    axios.get(`${BACKEND}/incidents`)
      .then(r => { if (mounted) setIncidents(r.data || []); })
      .catch(() => { /* ignore on startup */ });

    // connect socket inside effect so BACKEND env var works reliably
    const socket = io(BACKEND, { transports: ["websocket", "polling"] });

    socket.on("connect", () => console.log("socket connected:", socket.id));
    socket.on("newIncident", (inc) => {
      setIncidents(prev => [inc, ...prev]);
    });

    return () => {
      mounted = false;
      socket.disconnect();
    };
  }, []); // empty deps — runs on mount

  // register tourist -> backend generates DID
  const register = async () => {
    if (!name.trim()) return alert("Enter name");
    setLoading(true);
    try {
      const res = await axios.post(`${BACKEND}/register`, { name: name.trim() });
      setDid(res.data.did);
      alert("Registered: " + res.data.did);
    } catch (err) {
      alert("Register failed: " + (err?.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  // send SOS
  const sendSOS = async () => {
    if (!did) return alert("Register first");
    try {
      await axios.post(`${BACKEND}/incident`, {
        touristId: did,
        type: "SOS",
        lat: position[0],
        lng: position[1]
      });
      alert("SOS sent");
    } catch (err) {
      alert("Failed to send SOS: " + (err?.message || err));
    }
  };

  // simulate fall (useful during presentation)
  const simulateFall = async () => {
    if (!did) return alert("Register first");
    try {
      await axios.post(`${BACKEND}/incident`, {
        touristId: did,
        type: "fall_detected",
        lat: position[0],
        lng: position[1]
      });
      alert("Simulated fall event sent");
    } catch (err) {
      alert("Failed to simulate fall: " + (err?.message || err));
    }
  };

  // get current browser geolocation
  const startGPS = () => {
    if (!navigator.geolocation) return alert("Geolocation not available");
    navigator.geolocation.getCurrentPosition(
      p => {
        setPosition([p.coords.latitude, p.coords.longitude]);
        alert("Location obtained");
      },
      err => alert("GPS error: " + err.message),
      { enableHighAccuracy: true }
    );
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif", maxWidth: 1100, margin: "0 auto" }}>
      <h2>Smart Tourist Safety — Demo</h2>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
        <input
          placeholder="Your name"
          value={name}
          onChange={e => setName(e.target.value)}
          style={{ padding: 8, fontSize: 14 }}
        />
        <button onClick={register} disabled={loading} style={{ padding: "8px 12px" }}>
          {loading ? "Registering..." : "Register (Create DID)"}
        </button>

        <div style={{ marginLeft: 12 }}>
          <small>DID: </small>
          <code style={{ fontFamily: "monospace" }}>{did || "Not registered"}</code>
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <button onClick={startGPS} style={{ padding: "8px 12px" }}>Get Current Location</button>
        <button onClick={sendSOS} style={{ padding: "8px 12px", marginLeft: 8 }}>Send SOS</button>
        <button onClick={simulateFall} style={{ padding: "8px 12px", marginLeft: 8 }}>Simulate Fall</button>
      </div>

      <div style={{ display: "flex", gap: 20 }}>
        <div style={{ flex: 1 }}>
          <MapView incidents={incidents} touristPos={position} />
        </div>

        <div style={{ width: 360 }}>
          <h3>Incidents (most recent first)</h3>
          <div style={{ maxHeight: 520, overflow: "auto", border: "1px solid #eee", padding: 8, borderRadius: 4 }}>
            {incidents.length === 0 && <div style={{ color: "#666" }}>No incidents yet</div>}
            {incidents.map(i => (
              <div key={i.id} style={{ borderBottom: "1px solid #f0f0f0", padding: "8px 4px" }}>
                <div style={{ fontWeight: 600 }}>{i.type}</div>
                <div style={{ fontFamily: "monospace", fontSize: 12, marginTop: 4 }}>{i.touristId}</div>
                {i.lat !== undefined && <div style={{ fontSize: 12, color: "#333" }}>{i.lat.toFixed(5)}, {i.lng.toFixed(5)}</div>}
                <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>{i.timestamp || ""}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 12, fontSize: 12, color: "#666" }}>
        <div>Backend: <code>{BACKEND}</code></div>
        <div>Tip: Use <strong>Simulate Fall</strong> to create an incident without running extra scripts.</div>
      </div>
    </div>
  );
}
