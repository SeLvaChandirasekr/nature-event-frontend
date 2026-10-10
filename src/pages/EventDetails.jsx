import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";
import { API_BASE_URL } from "../config/api";

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const redirectToLogin = () => navigate("/login", { state: { from: `/events/${id}` } });

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [joined, setJoined] = useState(false);
  const [joinMessage, setJoinMessage] = useState("");
  const [messageIsSuccess, setMessageIsSuccess] = useState(false);
  const [invitePanelOpen, setInvitePanelOpen] = useState(false);
  const [inviteMessage, setInviteMessage] = useState("");
  const [participants, setParticipants] = useState([]);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [participantsLoaded, setParticipantsLoaded] = useState(false);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [participantsError, setParticipantsError] = useState("");

  // =========================================================
  // LOAD EVENT
  // =========================================================

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login", { state: { from: `/events/${id}` } });
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/events/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        if (
          response.status === 401 ||
          response.status === 403
        ) {
          localStorage.removeItem("token");
          redirectToLogin();
          return;
        }

        throw new Error("Unable to load event.");
      }

      const data = await response.json();

      console.log("Event details:", data);

      setEvent(data);
      fetchJoinStatus();

    } catch (error) {
      console.error("Event details error:", error);
      setError("Unable to load event details.");
    } finally {
      setLoading(false);
    }
  };

  const fetchJoinStatus = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/events/my-joined`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) return;

      const data = await response.json();
      const joinedEvents = Array.isArray(data)
        ? data
        : Array.isArray(data.content)
          ? data.content
          : Array.isArray(data.events)
            ? data.events
            : [];

      setJoined(joinedEvents.some((joinedEvent) =>
        String(joinedEvent.id ?? joinedEvent.eventId) === String(id)
      ));
    } catch (error) {
      console.error("Joined events error:", error);
    }
  };

  // =========================================================
  // JOIN EVENT
  // =========================================================

  const handleJoinEvent = async () => {
    setJoinMessage("");
    setJoining(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
          redirectToLogin();
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/events/${id}/join`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        if (
          response.status === 401 ||
          response.status === 403
        ) {
          localStorage.removeItem("token");
          redirectToLogin();
          return;
        }

        setMessageIsSuccess(false);
        setJoinMessage(
          data?.message || "Unable to join this event."
        );

        return;
      }

      setJoined(true);
      setMessageIsSuccess(true);

      setJoinMessage(
        data?.message ||
          "You joined this event successfully!"
      );

      // Refresh event information
      fetchEvent();

    } catch (error) {
      console.error("Join event error:", error);

      setMessageIsSuccess(false);
      setJoinMessage(
        "Unable to connect to the server."
      );

    } finally {
      setJoining(false);
    }
  };

  const handleLeaveEvent = async () => {
    setJoinMessage("");
    setLeaving(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
          redirectToLogin();
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/events/${id}/leave`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("token");
          redirectToLogin();
          return;
        }

        setMessageIsSuccess(false);
        setJoinMessage(data?.message || "Unable to leave this event.");
        return;
      }

      setJoined(false);
      setMessageIsSuccess(true);
      setJoinMessage(data?.message || "You left this event.");
      fetchEvent();
    } catch (error) {
      console.error("Leave event error:", error);
      setMessageIsSuccess(false);
      setJoinMessage("Unable to connect to the server.");
    } finally {
      setLeaving(false);
    }
  };

  const handleToggleInvitePanel = () => {
    const shouldOpen = !invitePanelOpen;
    setInvitePanelOpen(shouldOpen);
  };

  const eventInviteLink = `${window.location.origin}/events/${id}`;

  const handleCopyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(eventInviteLink);
      setInviteMessage("Event link copied. You can paste it into a message.");
    } catch (error) {
      console.error("Copy invite link error:", error);
      setInviteMessage("Copying failed. Select and copy the event link above.");
    }
  };

  const handleShareInviteLink = async () => {
    if (!navigator.share) {
      handleCopyInviteLink();
      return;
    }

    try {
      await navigator.share({
        title: `Join ${event.title}`,
        text: `You're invited to ${event.title}`,
        url: eventInviteLink
      });
      setInviteMessage("Choose an app to share your event link.");
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Share invite link error:", error);
        setInviteMessage("Unable to open sharing options. Copy the link instead.");
      }
    }
  };

  const handleToggleParticipants = async () => {
    if (participantsOpen) {
      setParticipantsOpen(false);
      return;
    }

    setParticipantsOpen(true);
    if (participantsLoaded || participantsLoading) return;

    setParticipantsLoading(true);
    setParticipantsError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        redirectToLogin();
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/events/${id}/participants`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        redirectToLogin();
        return;
      }
      if (!response.ok) throw new Error("Unable to load participants.");

      const data = await response.json();
      const participantList = Array.isArray(data)
        ? data
        : Array.isArray(data.content)
          ? data.content
          : Array.isArray(data.participants)
            ? data.participants
            : Array.isArray(data.data)
              ? data.data
              : [];

      setParticipants(participantList);
      setParticipantsLoaded(true);
    } catch (participantError) {
      console.error("Load participants error:", participantError);
      setParticipantsError(participantError.message || "Unable to connect to the server.");
    } finally {
      setParticipantsLoading(false);
    }
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) {
      return "Date not available";
    }

    try {
      return new Date(
        `${date}T00:00:00`
      ).toLocaleDateString(
        "en-IN",
        {
          day: "numeric",
          month: "long",
          year: "numeric"
        }
      );

    } catch {
      return date;
    }
  };

  // =========================================================
  // FORMAT EVENT TYPE
  // =========================================================

  const formatEventType = (type) => {
    if (!type) {
      return "Nature Event";
    }

    return type
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="event-details-page">

        <header className="events-navbar">

          <Link
            to="/"
            className="events-logo"
          >
            <span>🌿</span>
            <span>Nature Event</span>
          </Link>

          <nav className="events-nav-links">
            <Link to="/">Home</Link>
            <Link to="/events">Events</Link>
          </nav>

        </header>

        <main className="event-details-content">

          <div className="event-details-loading">
            🌱 Loading event...
          </div>

        </main>

      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error || !event) {
    return (
      <div className="event-details-page">

        <header className="events-navbar">

          <Link
            to="/"
            className="events-logo"
          >
            <span>🌿</span>
            <span>Nature Event</span>
          </Link>

          <nav className="events-nav-links">
            <Link to="/">Home</Link>
            <Link to="/events">Events</Link>
          </nav>

        </header>

        <main className="event-details-content">

          <Link
            to="/events"
            className="event-details-back"
          >
            ← Back to Events
          </Link>

          <div className="event-details-error">
            {error || "Event not found."}
          </div>

        </main>

      </div>
    );
  }

  // =========================================================
  // EVENT DETAILS PAGE
  // =========================================================

  return (
    <div className="event-details-page">

      {/* ================= NAVBAR ================= */}

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

          <Link
            to="/events"
            className="active"
          >
            Events
          </Link>

          <Link to="/notifications">Notifications</Link>
          <Link to="/invitations">Invitations</Link>
          <Link to="/my-events">My Events</Link>

          <Link to="/events/create">
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


      {/* ================= CONTENT ================= */}

      <main className="event-details-content">

        <Link
          to="/events"
          className="event-details-back"
        >
          ← Back to Events
        </Link>


        {/* ================= EVENT CARD ================= */}

        <div className="event-details-card">

          {/* ================= LEFT SIDE ================= */}

          <div className="event-details-image">

            <div className="event-details-image-overlay">

              <span>
                🌿
              </span>

              <strong>
                Nature Event
              </strong>

              <p>
                Together for nature
              </p>

            </div>

          </div>


          {/* ================= RIGHT SIDE ================= */}

          <div className="event-details-info">

            <div className="event-details-label">
              {formatEventType(event.eventType)}
            </div>

            <h1>
              {event.title}
            </h1>


            {/* ================= DESCRIPTION ================= */}

            <div className="event-details-description">

              <h3>
                About this event
              </h3>

              <p>
                {event.description}
              </p>

            </div>


            {/* ================= EVENT INFORMATION ================= */}

            <div className="event-info-grid">

              {/* ================= DATE ================= */}

              <div className="event-info-item">

                <span className="event-info-icon">
                  📅
                </span>

                <div>

                  <small>
                    Date
                  </small>

                  <strong>
                    {formatDate(event.eventDate)}
                  </strong>

                </div>

              </div>


              {/* ================= TIME ================= */}

              <div className="event-info-item">

                <span className="event-info-icon">
                  ⏰
                </span>

                <div>

                  <small>
                    Time
                  </small>

                  <strong>
                    {event.eventTime || "Not specified"}
                  </strong>

                </div>

              </div>


              {/* ================= LOCATION ================= */}

              <div className="event-info-item event-info-full">

                <span className="event-info-icon">
                  📍
                </span>

                <div>

                  <small>
                    Location
                  </small>

                  <strong>
                    {event.location}
                  </strong>

                </div>

              </div>


              {/* ================= PARTICIPANTS ================= */}

              <div className="event-info-item">

                <span className="event-info-icon">
                  👥
                </span>

                <div>

                  <small>
                    Participants
                  </small>

                  <strong>
                    {event.participantCount || 0}
                    {" / "}
                    {event.maxParticipants || "∞"}
                  </strong>

                </div>

              </div>


              {/* ================= STATUS ================= */}

              <div className="event-info-item">

                <span className="event-info-icon">
                  🌱
                </span>

                <div>

                  <small>
                    Status
                  </small>

                  <strong>
                    {event.status || "ACTIVE"}
                  </strong>

                </div>

              </div>

            </div>

            <button
              type="button"
              className="event-participants-toggle"
              onClick={handleToggleParticipants}
              aria-expanded={participantsOpen}
            >
              {participantsOpen ? "Hide participants" : "View participants"}
            </button>

            {participantsOpen && (
              <section className="event-participants-panel" aria-label="Event participants">
                <h3>Participants</h3>
                {participantsLoading ? (
                  <p className="event-participants-empty">Loading participants...</p>
                ) : participantsError ? (
                  <p className="event-participants-error" role="alert">{participantsError}</p>
                ) : participants.length === 0 ? (
                  <p className="event-participants-empty">No participants to show yet.</p>
                ) : (
                  <ul>
                    {participants.map((participant, index) => {
                      const name = typeof participant === "string"
                        ? participant
                        : participant.name
                          || participant.fullName
                          || participant.username
                          || participant.user?.name
                          || participant.user?.username
                          || "Participant";
                      const key = typeof participant === "string"
                        ? `${participant}-${index}`
                        : participant.id ?? participant.userId ?? participant.username ?? index;

                      return <li key={key} className="event-participant-item">{name}</li>;
                    })}
                  </ul>
                )}
              </section>
            )}


            {/* ================= JOIN MESSAGE ================= */}

            {joinMessage && (

              <div
                className={
                  messageIsSuccess
                    ? "event-join-success"
                    : "event-join-message"
                }
              >

                {messageIsSuccess ? "✓ " : "ℹ "}

                {joinMessage}

              </div>

            )}


            {/* ================= JOIN BUTTON ================= */}

            <button
              type="button"
              className={`event-join-button${joined ? " event-leave-button" : ""}`}
              onClick={joined ? handleLeaveEvent : handleJoinEvent}
              disabled={joining || leaving}
            >

              {joining || leaving
                ? (leaving ? "Leaving..." : "Joining...")
                : joined
                  ? "Leave Event"
                  : "🌱 Join Event"}

            </button>

            <button
              type="button"
              className="event-invite-toggle"
              onClick={handleToggleInvitePanel}
            >
              {invitePanelOpen ? "Close sharing options" : "Invite friends"}
            </button>

            {invitePanelOpen && (
              <section className="event-invite-panel" aria-label="Share this event">
                <h3>Share this event</h3>
                <p>Send this link to invite someone to view the event.</p>
                <input
                  className="event-invite-link"
                  aria-label="Event invite link"
                  value={eventInviteLink}
                  readOnly
                  onFocus={(event) => event.target.select()}
                />
                <div className="event-invite-actions">
                  <button type="button" onClick={handleCopyInviteLink}>Copy link</button>
                  <button type="button" onClick={handleShareInviteLink}>Share…</button>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Join me at ${event.title}: ${eventInviteLink}`)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    WhatsApp
                  </a>
                </div>
                {inviteMessage && <p className="event-invite-success" role="status">{inviteMessage}</p>}
              </section>
            )}

          </div>

        </div>

      </main>


      {/* ================= FOOTER ================= */}

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

export default EventDetails;
