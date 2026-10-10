import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LocationMap from "../components/LocationMap";
import LogoutButton from "../components/LogoutButton";
import { API_BASE_URL } from "../config/api";

function CreateEvent() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventDate: "",
    eventTime: "",
    eventType: "",
    maxParticipants: "",
    location: ""
  });

  const [selectedCoordinates, setSelectedCoordinates] = useState({
    latitude: null,
    longitude: null
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login", {
        replace: true,
        state: { from: "/events/create" }
      });
      return;
    }

    setAuthChecked(true);
  }, [navigate]);

  // =========================================================
  // HANDLE INPUT CHANGE
  // =========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value
    }));

    setError("");
  };

  // =========================================================
  // HANDLE LOCATION SELECTED FROM MAP
  // =========================================================

  const handleLocationSelect = (locationData) => {
    setFormData((previousData) => ({
      ...previousData,
      location: locationData.address
    }));

    setSelectedCoordinates({
      latitude: locationData.latitude,
      longitude: locationData.longitude
    });

    setError("");
  };

  // =========================================================
  // CREATE EVENT
  // =========================================================

  const handleCreateEvent = async (event) => {
    event.preventDefault();

    setError("");

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", { state: { from: "/events/create" } });
      return;
    }

    if (!formData.location.trim()) {
      setError("Please search and select an event location.");
      return;
    }

    setLoading(true);

    try {
      const requestData = {
        title: formData.title,
        description: formData.description,
        eventDate: formData.eventDate,
        eventTime: formData.eventTime,
        eventType: formData.eventType,
        maxParticipants: Number(formData.maxParticipants),
        location: formData.location
      };

      console.log("Create Event Request:", requestData);

      const response = await fetch(
        `${API_BASE_URL}/events`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(requestData)
        }
      );

      // =====================================================
      // HANDLE ERROR
      // =====================================================

      if (!response.ok) {
        let message = "Unable to create event.";

        try {
          const errorData = await response.json();

          console.error(
            "Create event validation error:",
            errorData
          );

          if (errorData.message) {
            message = errorData.message;
          }

          if (errorData.errors) {
            const validationMessages = Object.values(
              errorData.errors
            );

            if (validationMessages.length > 0) {
              message = validationMessages.join(" ");
            }
          }
        } catch {
          // Ignore JSON parsing error
        }

        if (response.status === 401) {
          message =
            "Your session has expired. Please login again.";
        }

        if (response.status === 403) {
          message =
            "You are not authorized. Please login again.";
        }

        setError(message);
        return;
      }

      // =====================================================
      // SUCCESS
      // =====================================================

      const createdEvent = await response.json();

      console.log("Created event:", createdEvent);

      console.log(
        "Latitude:",
        selectedCoordinates.latitude
      );

      console.log(
        "Longitude:",
        selectedCoordinates.longitude
      );

      if (createdEvent.id) {
        navigate(`/events/${createdEvent.id}`);
      } else {
        navigate("/events");
      }

    } catch (error) {
      console.error("Create event error:", error);

      setError(
        "Unable to connect to the server."
      );

    } finally {
      setLoading(false);
    }
  };

  if (!authChecked) {
    return null;
  }

  return (
    <div className="create-event-page">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <header className="events-navbar">

        <Link
          to="/"
          className="events-logo"
        >
          <span>🌿</span>
          <span>Nature Event</span>
        </Link>

        <nav className="events-nav-links">

          <Link to="/">
            Home
          </Link>

          <Link to="/events">
            Events
          </Link>

          <Link to="/notifications">Notifications</Link>
          <Link to="/invitations">Invitations</Link>
          <Link to="/my-events">My Events</Link>

          <Link
            to="/events/create"
            className="active"
          >
            Create Event
          </Link>

        </nav>

        <div className="events-user-actions">

          <span className="events-user">
            🌱 {localStorage.getItem("username")}
          </span>

          <LogoutButton className="events-home-button events-logout-button" />

        </div>

      </header>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="create-event-content">

        <Link
          to="/events"
          className="create-event-back"
        >
          ← Back to Events
        </Link>


        {/* ===================================================
            PAGE HEADER
        =================================================== */}

        <div className="create-event-header">

          <div className="create-event-icon">
            🌱
          </div>

          <p className="create-event-label">
            CREATE • CONNECT • PROTECT
          </p>

          <h1>
            Create an Event
          </h1>

          <p>
            Bring people together and create an opportunity
            to make a positive difference for nature.
          </p>

        </div>


        {/* ===================================================
            FORM CARD
        =================================================== */}

        <div className="create-event-card">

          {error && (
            <div className="create-event-error">
              {error}
            </div>
          )}


          <form onSubmit={handleCreateEvent}>

            {/* =================================================
                EVENT TITLE
            ================================================= */}

            <div className="create-form-group">

              <label htmlFor="title">
                Event Title
              </label>

              <input
                id="title"
                name="title"
                type="text"
                placeholder="Example: Tree Planting Drive"
                value={formData.title}
                onChange={handleChange}
                disabled={loading}
                required
              />

            </div>


            {/* =================================================
                DESCRIPTION
            ================================================= */}

            <div className="create-form-group">

              <label htmlFor="description">
                Description
              </label>

              <textarea
                id="description"
                name="description"
                placeholder="Tell people about this event..."
                value={formData.description}
                onChange={handleChange}
                disabled={loading}
                rows="5"
                required
              />

            </div>


            {/* =================================================
                DATE + TIME
            ================================================= */}

            <div className="create-form-row">

              <div className="create-form-group">

                <label htmlFor="eventDate">
                  Event Date
                </label>

                <input
                  id="eventDate"
                  name="eventDate"
                  type="date"
                  value={formData.eventDate}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />

              </div>


              <div className="create-form-group">

                <label htmlFor="eventTime">
                  Event Time
                </label>

                <input
                  id="eventTime"
                  name="eventTime"
                  type="time"
                  value={formData.eventTime}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />

              </div>

            </div>


            {/* =================================================
                EVENT TYPE + PARTICIPANTS
            ================================================= */}

            <div className="create-form-row">

              <div className="create-form-group">

                <label htmlFor="eventType">
                  Event Type
                </label>

                <select
                  id="eventType"
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleChange}
                  disabled={loading}
                  required
                >

                  <option value="">
                    Select event type
                  </option>

                  <option value="PLANTING">
                    🌱 Tree Planting
                  </option>

                  <option value="CLEANING">
                    🧹 Cleanup Drive
                  </option>

                  <option value="AWARENESS">
                    📢 Nature Awareness
                  </option>

                  <option value="WILDLIFE">
                    🐦 Wildlife Protection
                  </option>

                  <option value="WATER_CONSERVATION">
                    💧 Water Conservation
                  </option>

                  <option value="OTHER">
                    🌿 Other
                  </option>

                </select>

              </div>


              <div className="create-form-group">

                <label htmlFor="maxParticipants">
                  Maximum Participants
                </label>

                <input
                  id="maxParticipants"
                  name="maxParticipants"
                  type="number"
                  min="1"
                  placeholder="Example: 50"
                  value={formData.maxParticipants}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />

              </div>

            </div>


            {/* =================================================
                LOCATION MAP
            ================================================= */}

            <div className="create-form-group">

              <label>
                Event Location
              </label>

              <LocationMap
                onLocationSelect={handleLocationSelect}
              />

            </div>


            {/* =================================================
                SELECTED LOCATION
            ================================================= */}

            {formData.location && (

              <div className="create-selected-location">

                <div>
                  <strong>
                    📍 Selected Event Location
                  </strong>
                </div>

                <p>
                  {formData.location}
                </p>


                {selectedCoordinates.latitude !== null &&
                  selectedCoordinates.longitude !== null && (

                    <div className="create-coordinates">

                      <span>
                        <strong>
                          Latitude:
                        </strong>{" "}
                        {selectedCoordinates.latitude.toFixed(6)}
                      </span>

                      <span>
                        <strong>
                          Longitude:
                        </strong>{" "}
                        {selectedCoordinates.longitude.toFixed(6)}
                      </span>

                    </div>

                  )}

              </div>

            )}


            {/* =================================================
                CREATE BUTTON
            ================================================= */}

            <button
              type="submit"
              className="create-event-button"
              disabled={loading}
            >

              {loading
                ? "Creating Event..."
                : "🌱 Create Event"}

            </button>

          </form>


          {/* =================================================
              CANCEL
          ================================================= */}

          <Link
            to="/events"
            className="create-event-cancel"
          >
            Cancel
          </Link>

        </div>

      </main>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="events-footer">

        <div>
          🌿 Nature Event
        </div>

        <p>
          Together for a greener tomorrow.
        </p>

      </footer>

    </div>
  );
}

export default CreateEvent;
