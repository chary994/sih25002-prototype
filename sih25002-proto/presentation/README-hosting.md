# Hosting & Single-link demo instructions

## Goal
Provide a single clickable link for judges that shows a working website (frontend + backend).

## Recommended (reliable) approach
1. Push code to GitHub (repo: sih25002-proto)
2. Deploy backend as a Web Service on Render (base directory: backend)
   - Build Command: npm install
   - Start Command: node index.js
3. Deploy frontend on Netlify (connect GitHub or drag 'frontend/build' folder)
   - Set environment variable on Netlify: REACT_APP_BACKEND_URL = https://<your-backend>.onrender.com
   - Re-deploy frontend
Now the Netlify link will call your Render backend -> full hosted working site.

## Quick fallback (if you don't deploy backend)
- Deploy frontend on Netlify (shows UI only) and keep backend + AI local for live demo on laptop.
