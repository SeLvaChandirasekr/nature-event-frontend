import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";
import { API_BASE_URL } from "../config/api";

function getEventList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.events)) return data.events;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function MyEvents() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = location.pathname === "/my-joined" ? "joined" : "created";
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");

  const redirectToLogin = () => navigate("/login", {
    replace: true,
    state: { from: location.pathname }
  });

  useEffect(() => {
    const loadEvents = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        redirectToLogin();
        return;
      }

      setLoading(true);
      setError("");
      try {
        const response = await fetch(
          `${API_BASE_URL}/events/my-${activeTab}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("token");
          redirectToLogin();
          return;
        }
        if (!response.ok) throw new Error("Unable to load your events.");

        setEvents(getEventList(await response.json()));
        setActionError("");
      } catch (loadError) {
        console.error("My events error:", loadError);
        setError(loadError.message || "Unable to connect to the server.");
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [activeTab, navigate, reloadKey]);

  const beginEdit = (event) => {
    setEditingEvent(event);
    setEditForm({
      title: event.title || "",
      description: event.description || "",
      eventDate: event.eventDate || "",
      eventTime: event.eventTime || "",
      eventType: event.eventType || "OTHER",
      location: event.location || "",
      maxParticipants: event.maxParticipants ?? ""
    });
    setActionError("");
  };

  const handleEditChange = (changeEvent) => {
    const { name, value } = changeEvent.target;
    setEditForm((current) => ({ ...current, [name]: value }));
  };

  const handleUpdateEvent = async (submitEvent) => {
    submitEvent.preventDefault();
    if (!editingEvent || !editForm) return;

    setSavingEdit(true);
    setActionError("");
    setActionMessage("");
    try {
      const response = await fetch(`${API_BASE_URL}/events/${editingEvent.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...editForm,
          maxParticipants: Number(editForm.maxParticipants)
        })
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        redirectToLogin();
        return;
      }
      if (!response.ok) {
        const responseData = await response.json().catch(() => null);
        throw new Error(responseData?.message || "Unable to update this event.");
      }

      setEditingEvent(null);
      setEditForm(null);
      setActionMessage("Event updated successfully.");
      setReloadKey((key) => key + 1);
    } catch (updateError) {
      setActionError(updateError.message || "Unable to connect to the server.");
    } finally {
      setSavingEdit(false);
    }
  };

  const updateEventStatus = async (event, action) => {
    setActionLoadingId(event.id);
    setActionError("");
    setActionMessage("");
    try {
      const response = await fetch(`${API_BASE_URL}/events/${event.id}/${action}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        redirectToLogin();
        return;
      }
      if (!response.ok) {
        const responseData = await response.json().catch(() => null);
        throw new Error(responseData?.message || `Unable to ${action} this event.`);
      }

      setActionMessage(action === "complete" ? "Event marked as complete." : "Event canceled.");
      setReloadKey((key) => key + 1);
    } catch (actionRequestError) {
      setActionError(actionRequestError.message || "Unable to connect to the server.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const deleteEvent = async (event) => {
    const confirmed = window.confirm(`Delete “${event.title}”? This action cannot be undone.`);
    if (!confirmed) return;

    setActionLoadingId(event.id);
    setActionError("");
    setActionMessage("");
    try {
      const response = await fetch(`${API_BASE_URL}/events/${event.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        redirectToLogin();
        return;
      }
      if (!response.ok) {
        const responseData = await response.json().catch(() => null);
        throw new Error(responseData?.message || "Unable to delete this event.");
      }

      setActionMessage("Event deleted.");
      setReloadKey((key) => key + 1);
    } catch (deleteError) {
      setActionError(deleteError.message || "Unable to connect to the server.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const title = activeTab === "created" ? "Events I Created" : "Events I Joined";

  return (
    <div className="my-events-page">
      <header className="events-navbar">
        <Link to="/" className="events-logo">
          <span>🌿</span>
          <span>Nature Event</span>
        </Link>
        <nav className="events-nav-links">
          <Link to="/">Home</Link>
          <Link to="/events">Events</Link>
          <Link to="/events/create">Create Event</Link>
          <Link to="/my-events" className="active">My Events</Link>
          <Link to="/notifications">Notifications</Link>
          <Link to="/invitations">Invitations</Link>
        </nav>
        <div className="events-user-actions">
          <span className="events-user">🌱 {localStorage.getItem("username")}</span>
          <LogoutButton className="events-home-button events-logout-button" />
        </div>
      </header>

      <section className="events-header">
        <p className="events-label">YOUR NATURE EVENT ACTIVITY</p>
        <h1>My Events</h1>
        <p>Keep track of the events you organize and the ones you join.</p>
      </section>

      <main className="events-content my-events-content">
        <div className="my-events-tabs" role="tablist" aria-label="My events">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "created"}
            className={activeTab === "created" ? "active" : ""}
            onClick={() => navigate("/my-created")}
          >
            Created
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "joined"}
            className={activeTab === "joined" ? "active" : ""}
            onClick={() => navigate("/my-joined")}
          >
            Joined
          </button>
        </div>

        <h2 className="my-events-list-title">{title}</h2>
        {actionMessage && <p className="my-events-action-success" role="status">{actionMessage}</p>}
        {actionError && <p className="my-events-action-error" role="alert">{actionError}</p>}

        {loading ? (
          <div className="events-message"><p>Loading your events...</p></div>
        ) : error ? (
          <div className="events-message events-error">
            <h3>Couldn’t load your events</h3>
            <p>{error}</p>
            <button type="button" className="events-retry-button" onClick={() => setReloadKey((key) => key + 1)}>
              Try Again
            </button>
          </div>
        ) : events.length === 0 ? (
          <div className="events-message">
            <div className="events-message-icon">🌱</div>
            <h3>{activeTab === "created" ? "No events created yet" : "No events joined yet"}</h3>
            <p>{activeTab === "created" ? "Create an event and bring your community together." : "Explore events and join one that interests you."}</p>
            <Link className="view-event-button my-events-empty-link" to={activeTab === "created" ? "/events/create" : "/events"}>
              {activeTab === "created" ? "Create an Event" : "Explore Events"}
            </Link>
          </div>
        ) : (
          <div className="events-grid">
            {events.map((event) => (
              <article className="event-card" key={event.id}>
                <div className="event-card-image">🌿</div>
                <div className="event-card-content">
                  <div className="event-card-category">{event.eventType?.replaceAll("_", " ") || "Nature Event"}</div>
                  <h2>{event.title}</h2>
                  <p className="event-description">{event.description}</p>
                  <div className="event-info">
                    <div>📅 {event.eventDate || "Date not available"}</div>
                    <div>📍 {event.location || "Location not available"}</div>
                    {event.status && <div>Status: {event.status}</div>}
                  </div>
                  {activeTab === "created" && (
                    <div className="my-event-actions">
                      {String(event.status || "ACTIVE").toUpperCase() === "ACTIVE" && (
                        <>
                          <button type="button" onClick={() => beginEdit(event)} disabled={actionLoadingId === event.id}>
                            Edit
                          </button>
                          <button
                            type="button"
                            className="complete-event-action"
                            onClick={() => updateEventStatus(event, "complete")}
                            disabled={actionLoadingId === event.id}
                          >
                            {actionLoadingId === event.id ? "Updating..." : "Complete"}
                          </button>
                          <button
                            type="button"
                            className="cancel-event-action"
                            onClick={() => updateEventStatus(event, "cancel")}
                            disabled={actionLoadingId === event.id}
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {String(event.status || "ACTIVE").toUpperCase() !== "COMPLETED" && (
                        <button
                          type="button"
                          className="delete-event-action"
                          onClick={() => deleteEvent(event)}
                          disabled={actionLoadingId === event.id}
                        >
                          {actionLoadingId === event.id ? "Working..." : "Delete"}
                        </button>
                      )}
                    </div>
                  )}
                  <Link to={`/events/${event.id}`} className="view-event-button">View Event →</Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {editingEvent && editForm && (
          <div className="event-edit-backdrop" role="presentation" onMouseDown={(event) => {
            if (event.target === event.currentTarget && !savingEdit) {
              setEditingEvent(null);
              setEditForm(null);
            }
          }}>
            <section className="event-edit-dialog" role="dialog" aria-modal="true" aria-labelledby="event-edit-title">
              <div className="event-edit-heading">
                <h2 id="event-edit-title">Edit event</h2>
                <button type="button" onClick={() => { setEditingEvent(null); setEditForm(null); }} disabled={savingEdit} aria-label="Close edit form">×</button>
              </div>
              <form onSubmit={handleUpdateEvent}>
                <label>
                  Event title
                  <input name="title" value={editForm.title} onChange={handleEditChange} required />
                </label>
                <label>
                  Description
                  <textarea name="description" value={editForm.description} onChange={handleEditChange} rows="3" required />
                </label>
                <div className="event-edit-row">
                  <label>
                    Event date
                    <input type="date" name="eventDate" value={editForm.eventDate} onChange={handleEditChange} required />
                  </label>
                  <label>
                    Event time
                    <input type="time" name="eventTime" value={editForm.eventTime} onChange={handleEditChange} required />
                  </label>
                </div>
                <div className="event-edit-row">
                  <label>
                    Event type
                    <select name="eventType" value={editForm.eventType} onChange={handleEditChange} required>
                      <option value="PLANTING">Tree Planting</option>
                      <option value="CLEANING">Cleanup Drive</option>
                      <option value="AWARENESS">Nature Awareness</option>
                      <option value="WILDLIFE">Wildlife Protection</option>
                      <option value="WATER_CONSERVATION">Water Conservation</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </label>
                  <label>
                    Maximum participants
                    <input type="number" name="maxParticipants" min="1" value={editForm.maxParticipants} onChange={handleEditChange} required />
                  </label>
                </div>
                <label>
                  Location
                  <input name="location" value={editForm.location} onChange={handleEditChange} required />
                </label>
                {actionError && <p className="my-events-action-error" role="alert">{actionError}</p>}
                <div className="event-edit-actions">
                  <button type="button" className="event-edit-close" onClick={() => { setEditingEvent(null); setEditForm(null); }} disabled={savingEdit}>
                    Close
                  </button>
                  <button type="submit" disabled={savingEdit}>
                    {savingEdit ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default MyEvents;
