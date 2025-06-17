import React, { useState, useEffect } from "react";
import GoogleMapComponent from "../components/GoogleMapComponent";
import Navbar from "../components/navbar";
import "../styles/nearbygarages.css";
import axios from "axios";

const NearbyGarages = () => {
  const [nearbyGarages, setNearbyGarages] = useState([]);
  const [selectedGarage, setSelectedGarage] = useState(null);
  const [userLocation, setUserLocation] = useState({ lat: 19.076, lng: 72.8777 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    const fetchGarages = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`http://localhost:3333/api/garages?lat=${userLocation.lat}&lng=${userLocation.lng}&radius=10`);
        if (response.data.status === 'success' && Array.isArray(response.data.data)) {
          const garagesWithDistance = response.data.data
            .map(garage => ({
              ...garage,
              distance: calculateDistance(
                userLocation.lat,
                userLocation.lng,
                garage.lat,
                garage.lng
              )
            }))
            .sort((a, b) => a.distance - b.distance);
          setNearbyGarages(garagesWithDistance);
        } else {
          throw new Error('Invalid garage data format');
        }
      } catch (err) {
        console.error("Error fetching garages:", err);
        setError(err.message || 'Failed to fetch garage data');
        setNearbyGarages([]);
      } finally {
        setLoading(false);
      }
    };

    if (userLocation.lat && userLocation.lng) {
      fetchGarages();
    }
  }, [userLocation]);

  return (
    <div className="nearby-garages-container">
      <Navbar />
      
      <div className="nearby-garages-content">
        <div className="map-section">
          <GoogleMapComponent
            location={userLocation}
            nearbyGarages={nearbyGarages}
            onLocationChange={setUserLocation}
            onGarageSelect={setSelectedGarage}
          />
        </div>
        <div className="list-section">
          <h2 className="nearby-garages-title">Nearby Garages</h2>
          {error ? (
            <p className="error-message">{error}</p>
          ) : loading ? (
            <p>Loading garages...</p>
          ) : nearbyGarages.length === 0 ? (
            <p>No garages found nearby.</p>
          ) : (
            <ul className="garage-list">
              {nearbyGarages.map((garage, index) => (
                <li
                  key={index}
                  className={`garage-item ${selectedGarage?.name === garage.name ? 'selected' : ''}`}
                  onClick={() => setSelectedGarage(garage)}
                >
                  <div className="garage-name">{garage.name}</div>
                  <div className="garage-info">{garage.address}</div>
                  <div className="garage-info">📞 {garage.contact}</div>
                  <div className="garage-info">
                    📍 Distance: {garage.distance.toFixed(1)} km
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default NearbyGarages;