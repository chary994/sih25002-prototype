# ai_demo/fall_simulator.py
import requests

BACKEND = "http://localhost:4000"

def simulate_fall(did, lat=12.9716, lng=77.5946):
    payload = {"touristId": did, "type": "fall_detected", "lat": lat, "lng": lng}
    r = requests.post(f"{BACKEND}/incident", json=payload)
    print("Response:", r.status_code, r.text)

if __name__ == "__main__":
    did = input("Enter tourist DID: ").strip()
    if not did:
        print("Need DID")
    else:
        simulate_fall(did)
