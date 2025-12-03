# Smart Tourist Safety

## What is included
- backend/ (Node.js + Express + SQLite + Socket.IO)
- frontend/ (React app using Leaflet map)
- ai_demo/ (Python fall simulator)
- solidity/ (Remix contract for DID demo)
- presentation/ (place to put slides/screenshots/video)

## Quick start (local demo)
1. Run backend:
   cd backend
   npm install
   node index.js
   # Backend runs on http://localhost:4000

2. Run frontend (in a new terminal):
   cd frontend
   npm install
   npm start
   # Open http://localhost:3000 in browser

3. Optional: AI simulator (in another terminal):
   cd ai_demo
   pip install -r requirements.txt
   python fall_simulator.py
   # Enter DID printed by frontend registration to simulate a fall

## GitHub & Hosting
- Push this folder to GitHub. See presentation/README-hosting.md for steps to host frontend (Netlify) and backend (Render).
