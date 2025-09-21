// backend/index.js
const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const crypto = require("crypto");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// --- DB Setup ---
const db = new sqlite3.Database("./tourists.db");
db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS tourists (id INTEGER PRIMARY KEY, name TEXT, did TEXT)");
  db.run("CREATE TABLE IF NOT EXISTS incidents (id INTEGER PRIMARY KEY, touristId TEXT, type TEXT, lat REAL, lng REAL, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)");
});

// Utility: make a DID
function makeDID(name) {
  return "did:sih:" + crypto.createHash('sha256').update(name + Date.now().toString()).digest('hex').slice(0,16);
}

// Register tourist
app.post("/register", (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "name required" });
  const did = makeDID(name);
  db.run("INSERT INTO tourists (name, did) VALUES (?, ?)", [name, did], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, name, did });
  });
});

// Create incident (from SOS or AI)
app.post("/incident", (req, res) => {
  const { touristId, type, lat, lng } = req.body;
  db.run("INSERT INTO incidents (touristId, type, lat, lng) VALUES (?, ?, ?, ?)",
    [touristId, type, lat, lng],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      const incident = { id: this.lastID, touristId, type, lat, lng, timestamp: new Date().toISOString() };
      io.emit("newIncident", incident);
      res.json(incident);
    });
});

// Get incidents
app.get("/incidents", (req, res) => {
  db.all("SELECT * FROM incidents ORDER BY timestamp DESC LIMIT 200", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get tourists
app.get("/tourists", (req, res) => {
  db.all("SELECT * FROM tourists ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`✅ Backend running at http://localhost:${PORT}`));
