import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";
import { API_BASE_URL } from "../config/api";

function getInvitationList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.invitations)) return data.invitations;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function Invitations() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("received");
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [message, setMessage] = useState("");

  const redirectToLogin = () => navigate("/login", {
    replace: true,
    state: { from: "/invitations" }
  });

  const loadInvitations = async (tab = activeTab) => {
    const token = localStorage.getItem("token");
    if (!token) {
      redirectToLogin();
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(`${API_BASE_URL}/invitations/${tab}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        redirectToLogin();
        return;
      }
      if (!response.ok) throw new Error("Unable to load invitations.");

      const data = await response.json();
      setInvitations(getInvitationList(data));
    } catch (loadError) {
      console.error("Invitations error:", loadError);
      setError(loadError.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvitations(activeTab);
  }, [activeTab]);

  const respondToInvitation = async (invitation, responseAction) => {
    const invitationId = invitation.id ?? invitation.invitationId;
    if (invitationId == null) {
      setError("This invitation is missing its ID, so it cannot be updated.");
      return;
    }

    setUpdatingId(invitationId);
    setError("");
    setMessage("");
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/invitations/${invitationId}/${responseAction}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        redirectToLogin();
        return;
      }
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.message || `Unable to ${responseAction} this invitation.`);

      setInvitations((current) => current.map((item) =>
        (item.id ?? item.invitationId) === invitationId
          ? { ...item, status: responseAction === "accept" ? "ACCEPTED" : "REJECTED" }
          : item
      ));
      setMessage(data?.message || `Invitation ${responseAction === "accept" ? "accepted" : "rejected"}.`);
    } catch (actionError) {
      setError(actionError.message || "Unable to connect to the server.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="notifications-page">
      <header className="events-navbar">
        <Link to="/" className="events-logo"><span>🌿</span><span>Nature Event</span></Link>
        <nav className="events-nav-links">
          <Link to="/">Home</Link>
          <Link to="/events">Events</Link>
          <Link to="/events/create">Create Event</Link>
          <Link to="/my-events">My Events</Link>
          <Link to="/notifications">Notifications</Link>
          <Link to="/invitations" className="active">Invitations</Link>
        </nav>
        <div className="events-user-actions">
          <span className="events-user">🌱 {localStorage.getItem("username")}</span>
          <LogoutButton className="events-home-button events-logout-button" />
        </div>
      </header>

      <main className="notifications-content">
        <div className="invitations-heading">
          <div className="notifications-heading">
            <div>
              <p className="events-label">EVENT INVITATIONS</p>
              <h1>Invitations</h1>
              <p>Review invitations you have received and sent.</p>
            </div>
          </div>
          <div className="invitation-tabs" role="tablist" aria-label="Invitation lists">
            <button type="button" role="tab" aria-selected={activeTab === "received"}
              className={activeTab === "received" ? "active" : ""} onClick={() => setActiveTab("received")}>
              Received
            </button>
            <button type="button" role="tab" aria-selected={activeTab === "sent"}
              className={activeTab === "sent" ? "active" : ""} onClick={() => setActiveTab("sent")}>
              Sent
            </button>
          </div>
        </div>

        {error && <div className="notifications-error" role="alert">{error}</div>}
        {message && <div className="invitation-message" role="status">{message}</div>}

        {loading ? (
          <div className="notifications-empty">Loading invitations...</div>
        ) : invitations.length === 0 ? (
          <div className="notifications-empty">No {activeTab} invitations yet.</div>
        ) : (
          <div className="invitation-list">
            {invitations.map((invitation, index) => {
              const invitationId = invitation.id ?? invitation.invitationId;
              const eventId = invitation.eventId ?? invitation.event?.id;
              const eventTitle = invitation.eventTitle ?? invitation.event?.title ?? invitation.title ?? "Nature Event";
              const status = String(invitation.status ?? "PENDING").toUpperCase();
              const sender = invitation.inviter?.name ?? invitation.inviter?.username
                ?? invitation.sender?.name ?? invitation.sender?.username
                ?? invitation.invitedBy?.name ?? invitation.invitedBy?.username
                ?? invitation.invitedBy ?? "A community member";
              const recipient = invitation.invitee?.name ?? invitation.invitee?.username
                ?? invitation.recipient?.name ?? invitation.recipient?.username
                ?? invitation.username ?? "A community member";

              return (
                <article className="invitation-card" key={invitationId ?? index}>
                  <div className="invitation-card-copy">
                    <span className={`invitation-status status-${status.toLowerCase()}`}>{status}</span>
                    <h2>{eventTitle}</h2>
                    <p>{activeTab === "received" ? `Invited by ${sender}` : `Sent to ${recipient}`}</p>
                    {invitation.createdAt && <time dateTime={invitation.createdAt}>{new Date(invitation.createdAt).toLocaleString()}</time>}
                    {eventId != null && <Link to={`/events/${eventId}`}>View event</Link>}
                  </div>
                  {activeTab === "received" && status === "PENDING" && invitationId != null && (
                    <div className="invitation-actions">
                      <button type="button" onClick={() => respondToInvitation(invitation, "accept")}
                        disabled={updatingId === invitationId}>
                        {updatingId === invitationId ? "Updating..." : "Accept"}
                      </button>
                      <button type="button" className="invitation-reject"
                        onClick={() => respondToInvitation(invitation, "reject")}
                        disabled={updatingId === invitationId}>
                        Reject
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default Invitations;
