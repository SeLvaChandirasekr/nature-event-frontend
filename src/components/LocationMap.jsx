import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker icon issue in React/Vite
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});

const defaultPosition = [20.5937, 78.9629];

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click: async (event) => {
      const { lat, lng } = event.latlng;

      onLocationSelect({
        latitude: lat,
        longitude: lng,
        address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      });

      // Reverse geocoding using OpenStreetMap Nominatim
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=jsonv2`
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        if (data.display_name) {
          onLocationSelect({
            latitude: lat,
            longitude: lng,
            address: data.display_name
          });
        }
      } catch (error) {
        console.error("Reverse geocoding error:", error);
      }
    }
  });

  return null;
}

function MapCenter({ position }) {
  const map = useMap();

  if (position) {
    map.setView(position, 15);
  }

  return null;
}

function LocationMap({ onLocationSelect }) {
  const [searchText, setSearchText] = useState("");
  const [position, setPosition] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const handleMapLocationSelect = (location) => {
    setPosition([location.latitude, location.longitude]);
    setSelectedAddress(location.address);

    if (onLocationSelect) {
      onLocationSelect(location);
    }
  };

  const handleSearch = async () => {
    

    if (!searchText.trim()) {
      setSearchError("Please enter a location.");
      return;
    }

    setSearching(true);
    setSearchError("");

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
          searchText
        )}&limit=1`
      );

      if (!response.ok) {
        throw new Error("Unable to search location.");
      }

      const results = await response.json();

      if (!results || results.length === 0) {
        setSearchError("Location not found. Try another search.");
        return;
      }

      const result = results[0];

      const latitude = Number(result.lat);
      const longitude = Number(result.lon);
      const address = result.display_name;

      handleMapLocationSelect({
        latitude,
        longitude,
        address
      });
    } catch (error) {
      console.error("Location search error:", error);
      setSearchError("Unable to search location.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="location-map-container">
      <div className="location-map-search">
        <div className="location-map-search-form">
          <input
            type="text"
            placeholder="🔎 Search for a location..."
            value={searchText}
            aria-label="Search for an event location"
            onChange={(event) => setSearchText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleSearch();
              }
            }}
          />

          <button type="button" onClick={handleSearch} disabled={searching}>
            {searching ? "Searching..." : "Search"}
          </button>
        </div>

        {searchError && (
          <p className="location-map-error">{searchError}</p>
        )}
      </div>

      <div className="location-map">
        <MapContainer
          center={position || defaultPosition}
          zoom={position ? 15 : 5}
          scrollWheelZoom={true}
          style={{
            height: "400px",
            width: "100%",
            borderRadius: "16px"
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapClickHandler
            onLocationSelect={handleMapLocationSelect}
          />

          {position && (
            <>
              <Marker position={position}>
                <Popup>
                  <strong>Selected Event Location</strong>
                  <br />
                  {selectedAddress}
                </Popup>
              </Marker>

              <MapCenter position={position} />
            </>
          )}
        </MapContainer>
      </div>

      {position && (
        <div className="selected-location">
          <div className="selected-location-title">
            📍 Selected Location
          </div>

          <p>{selectedAddress}</p>

          <div className="coordinates">
            <span>
              <strong>Latitude:</strong>{" "}
              {position[0].toFixed(6)}
            </span>

            <span>
              <strong>Longitude:</strong>{" "}
              {position[1].toFixed(6)}
            </span>
          </div>
        </div>
      )}

      {!position && (
        <p className="map-help-text">
          🔎 Search for a place or click anywhere on the map to select
          your event location.
        </p>
      )}
    </div>
  );
}

export default LocationMap;
