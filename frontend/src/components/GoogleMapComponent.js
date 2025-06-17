import React, { useState, useEffect } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  Circle,
  InfoWindow,
} from "@react-google-maps/api";

const defaultLocation = { lat: 19.076, lng: 72.8777 }; // Mumbai
const mapContainerStyle = {
  width: "100%",
  height: "500px",
};

const GoogleMapComponent = ({ location, nearbyGarages, onLocationChange, onGarageSelect }) => {
  const [selectedGarage, setSelectedGarage] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapInstance, setMapInstance] = useState(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleMapError = (error) => {
    console.error('Google Maps Error:', error);
    setError(`Error loading map: ${error.message}. Please check your internet connection.`);
    setIsLoading(false);
  };

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    setRetryCount(prev => prev + 1);
    window.location.reload();
  };

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
    const getLocation = async () => {
      try {
        if (!navigator.geolocation) {
          throw new Error("Geolocation is not supported by your browser");
        }

        const position = await new Promise((resolve, reject) => {
          const locationTimeout = setTimeout(() => {
            reject(new Error('Location request timed out. Please check your location settings.'));
          }, 15000);

          navigator.geolocation.getCurrentPosition(
            (position) => {
              clearTimeout(locationTimeout);
              resolve(position);
            },
            (error) => {
              clearTimeout(locationTimeout);
              reject(new Error(`Location error: ${error.message}`));
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0
            }
          );
        });

        const currentCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        console.log("Detected Current Location:", currentCoords);
        onLocationChange(currentCoords);
      } catch (err) {
        console.error("Geolocation error:", err);
        setError(err.message || "Unable to retrieve your location");
        onLocationChange(defaultLocation);
      }
    };

    getLocation();
  }, [onLocationChange]);

  return (
    <div className="map-container">
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <p>Loading Maps...</p>
          </div>
        </div>
      )}
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button 
            onClick={handleRetry} 
            className="retry-button"
            disabled={retryCount >= 3}
          >
            {retryCount >= 3 ? 'Please try again later' : 'Retry'}
          </button>
        </div>
      )}
      <LoadScript
        googleMapsApiKey="AIzaSyBNLrJhOMz6idD05pzfn5lhA-TAw-mAZCU"
        onError={handleMapError}
        onLoad={() => {
          console.log('Google Maps script loaded successfully');
          setIsLoading(false);
          setError(null);
        }}
        onUnmount={() => {
          setMapInstance(null);
          setIsMapLoaded(false);
        }}
      >
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={location}
          zoom={12}
          options={{
            zoomControl: true,
            streetViewControl: true,
            mapTypeControl: true,
            fullscreenControl: true,
            gestureHandling: 'cooperative',
            clickableIcons: false,
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
              }
            ]
          }}
          onLoad={(map) => {
            console.log('Map instance loaded successfully');
            setMapInstance(map);
            setIsMapLoaded(true);
            map.setOptions({
              maxZoom: 18,
              minZoom: 8,
              mapTypeId: 'roadmap',
              mapTypeControl: true,
              mapTypeControlOptions: {
                style: window.google.maps.MapTypeControlStyle.DROPDOWN_MENU,
                position: window.google.maps.ControlPosition.TOP_RIGHT
              }
            });
          }}
          onUnmount={() => setMapInstance(null)}
        >
          {/* ✅ Current Location Marker (fixed) */}
          {isMapLoaded && (
            <Marker
              position={location}
              icon={{
                url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                scaledSize: new window.google.maps.Size(40, 40),
                origin: new window.google.maps.Point(0, 0),
                anchor: new window.google.maps.Point(20, 20)
              }}
              animation={window.google.maps.Animation.DROP}
            />
          )}

          {/* 10km Radius Circle */}
          {isMapLoaded && (
            <Circle
              center={location}
              radius={10000}
              options={{
                fillColor: "#4285f4",
                fillOpacity: 0.2,
                strokeColor: "#4285f4",
                strokeOpacity: 0.8,
                strokeWeight: 2,
              }}
            />
          )}

          {/* Nearby Garage Markers */}
          {isMapLoaded && nearbyGarages && Array.isArray(nearbyGarages) && nearbyGarages.length > 0 && nearbyGarages.map((garage, index) => {
            try {
              if (!garage || typeof garage !== 'object') return null;

              const lat = typeof garage.lat === 'string' ? parseFloat(garage.lat) : garage.lat;
              const lng = typeof garage.lng === 'string' ? parseFloat(garage.lng) : garage.lng;

              if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0 || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
                console.error('Invalid garage coordinates:', garage);
                return null;
              }

              const distance = calculateDistance(location.lat, location.lng, lat, lng);
              if (distance > 10) return null;

              return (
                <Marker
                  key={index}
                  position={{ lat, lng }}
                  icon={{
                    url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                    scaledSize: new window.google.maps.Size(32, 32),
                    origin: new window.google.maps.Point(0, 0),
                    anchor: new window.google.maps.Point(16, 32)
                  }}
                  animation={
                    selectedGarage?.lat === lat && selectedGarage?.lng === lng
                      ? window.google.maps.Animation.BOUNCE
                      : window.google.maps.Animation.DROP
                  }
                  onClick={() => {
                    setSelectedGarage(garage);
                    onGarageSelect(garage);
                    if (mapInstance) {
                      mapInstance.panTo({ lat, lng });
                    }
                  }}
                />
              );
            } catch (error) {
              console.error('Error rendering garage marker:', error);
              return null;
            }
          })}

          {/* Garage Info Window */}
          {isMapLoaded && selectedGarage && (
            <InfoWindow
              position={{ lat: selectedGarage.lat, lng: selectedGarage.lng }}
              onCloseClick={() => setSelectedGarage(null)}
            >
              <div>
                <h3>📍 {selectedGarage.name}</h3>
                <p>{selectedGarage.address}</p>
                <p>📞 {selectedGarage.contact}</p>
                <p>
                  📍 Distance:{" "}
                  {calculateDistance(
                    location.lat,
                    location.lng,
                    selectedGarage.lat,
                    selectedGarage.lng
                  ).toFixed(1)}{" "}
                  km
                </p>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default GoogleMapComponent;
