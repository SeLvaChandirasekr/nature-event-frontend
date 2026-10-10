import { useEffect, useState } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const defaultPosition = [20.5937, 78.9629];

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function MapController({ position }) {
  const map = useMap();

  useEffect(() => {
    if (!position) {
      return;
    }

    map.setView(position, 15);
  }, [map, position]);

  return null;
}

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click: async (event) => {
      const { lat, lng } = event.latlng;

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
        );

        if (!response.ok) {
          throw new Error("Unable to get location details");
        }

        const data = await response.json();

        onLocationSelect({
          address: data.display_name || `${lat}, ${lng}`,
          latitude: lat,
          longitude: lng
        });
      } catch (error) {
        onLocationSelect({
          address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          latitude: lat,
          longitude: lng
        });
      }
    }
  });

  return null;
}

function LocationMap({ onLocationSelect }) {
  const [searchText, setSearchText] = useState("");
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  const handleSearch = async () => {
    const query = searchText.trim();

    if (!query) {
      setSearchError("Please enter a location.");
      return;
    }

    setLoading(true);
    setSearchError("");

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(
          query
        )}`
      );

      if (!response.ok) {
        throw new Error("Location search failed");
      }

      const results = await response.json();

      if (!results.length) {
        setSearchError("Location not found. Try another search.");
        return;
      }

      const result = results[0];

      const latitude = Number(result.lat);
      const longitude = Number(result.lon);

      const newPosition = [latitude, longitude];

      setPosition(newPosition);
      setSearchText(result.display_name);

      onLocationSelect({
        address: result.display_name,
        latitude,
        longitude
      });
    } catch (error) {
      console.error("Location search error:", error);
      setSearchError("Unable to search location. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSearch();
    }
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      setSearchError("Geolocation is not supported by your browser.");
      return;
    }

    setLoading(true);
    setSearchError("");

    navigator.geolocation.getCurrentPosition(
      async (location) => {
        const latitude = location.coords.latitude;
        const longitude = location.coords.longitude;

        const newPosition = [latitude, longitude];

        setPosition(newPosition);

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          );

          const data = await response.json();

          const address =
            data.display_name ||
            `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

          setSearchText(address);

          onLocationSelect({
            address,
            latitude,
            longitude
          });
        } catch (error) {
          const address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

          setSearchText(address);

          onLocationSelect({
            address,
            latitude,
            longitude
          });
        } finally {
          setLoading(false);
        }
      },
      () => {
        setLoading(false);
        setSearchError("Unable to get your current location.");
      }
    );
  };

  return (
    <div className="location-map-wrapper">
      <div className="location-search">
        <input
          type="text"
          value={searchText}
          onChange={(event) => {
            setSearchText(event.target.value);
            setSearchError("");
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search for a location..."
          disabled={loading}
        />

        <button
          type="button"
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? "Searching..." : "Search"}
        </button>

        <button
          type="button"
          onClick={handleCurrentLocation}
          disabled={loading}
        >
          Use My Location
        </button>
      </div>

      {searchError && (
        <div className="location-search-error">
          {searchError}
        </div>
      )}

      <MapContainer
        center={defaultPosition}
        zoom={5}
        scrollWheelZoom={true}
        style={{
          width: "100%",
          height: "350px"
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController position={position} />

        <MapClickHandler
          onLocationSelect={(locationData) => {
            setPosition([
              locationData.latitude,
              locationData.longitude
            ]);

            setSearchText(locationData.address);
            onLocationSelect(locationData);
          }}
        />

        {position && (
          <Marker
            position={position}
            icon={markerIcon}
          />
        )}
      </MapContainer>
    </div>
  );
}

export default LocationMap;