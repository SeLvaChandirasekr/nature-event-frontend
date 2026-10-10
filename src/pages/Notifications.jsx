import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";
import { API_BASE_URL } from "../config/api";

function getNotificationList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.notifications)) return data.notifications;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);

  const redirectToLogin = () => navigate("/login", {
    replace: true,
    state: { from: "/notifications" }
  });

  const loadNotifications = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      redirectToLogin();
      return;
    }

    setLoading(true);
    setError("");

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [listResponse, countResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/notifications`, { headers }),
        fetch(`${API_BASE_URL}/notifications/unread/count`, { headers })
      ]);

      if (listResponse.status === 401 || listResponse.status === 403 ||
          countResponse.status === 401 || countResponse.status === 403) {
        localStorage.removeItem("token");
        redirectToLogin();
        return;
      }
      if (!listResponse.ok) throw new Error("Unable to load notifications.");

      const listData = await listResponse.json();
      setNotifications(getNotificationList(listData));

      if (countResponse.ok) {
        const countData = await countResponse.json().catch(() => 0);
        const count = typeof countData === "number"
          ? countData
          : Number(countData?.unreadCount ?? countData?.count ?? 0);
        setUnreadCount(Number.isFinite(count) ? count : 0);
      }
    } catch (loadError) {
      console.error("Notifications error:", loadError);
      setError(loadError.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markNotificationRead = async (notificationId) => {
    setUpdatingId(notificationId);
    setError("");
    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/${notificationId}/read`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        }
      );
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        redirectToLogin();
        return;
      }
      if (!response.ok) throw new Error("Unable to mark this notification as read.");

      setNotifications((current) => current.map((notification) =>
        (notification.id ?? notification.notificationId) === notificationId
          ? { ...notification, isRead: true, read: true }
          : notification
      ));
      setUnreadCount((count) => Math.max(0, count - 1));
    } catch (updateError) {
      setError(updateError.message || "Unable to connect to the server.");
    } finally {
      setUpdatingId(null);
    }
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        redirectToLogin();
        return;
      }
      if (!response.ok) throw new Error("Unable to mark notifications as read.");

      setNotifications((current) => current.map((notification) => ({
        ...notification,
        isRead: true,
        read: true
      })));
      setUnreadCount(0);
    } catch (updateError) {
      setError(updateError.message || "Unable to connect to the server.");
    } finally {
      setMarkingAll(false);
    }
  };

  const notificationIsRead = (notification) => {
    const readValue = notification.isRead ?? notification.read ?? notification.status;
    if (typeof readValue === "boolean") return readValue;
    if (typeof readValue === "string") return readValue.toLowerCase() === "read" || readValue.toLowerCase() === "true";
    return Boolean(notification.readAt);
  };

  return (
    <div className="notifications-page">
      <header className="events-navbar">
        <Link to="/" className="events-logo">
          <span>🌿</span>
          <span>Nature Event</span>
        </Link>
        <nav className="events-nav-links">
          <Link to="/">Home</Link>
          <Link to="/events">Events</Link>
          <Link to="/events/create">Create Event</Link>
          <Link to="/my-events">My Events</Link>
          <Link to="/notifications" className="active">Notifications</Link>
          <Link to="/invitations">Invitations</Link>
        </nav>
        <div className="events-user-actions">
          <span className="events-user">🌱 {localStorage.getItem("username")}</span>
          <LogoutButton className="events-home-button events-logout-button" />
        </div>
      </header>

      <main className="notifications-content">
        <div className="notifications-heading">
          <div>
            <p className="events-label">STAY UP TO DATE</p>
            <h1>Notifications</h1>
            <p>You have {unreadCount} unread {unreadCount === 1 ? "notification" : "notifications"}.</p>
          </div>
          <button type="button" onClick={markAllRead} disabled={markingAll || unreadCount === 0}>
            {markingAll ? "Marking all read..." : "Mark all as read"}
          </button>
        </div>

        {error && <div className="notifications-error" role="alert">{error}</div>}

        {loading ? (
          <div className="notifications-empty">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="notifications-empty">You’re all caught up. No notifications yet.</div>
        ) : (
          <div className="notifications-list">
            {notifications.map((notification) => {
              const isRead = notificationIsRead(notification);
      const notificationId = notification.id ?? notification.notificationId;
              const message = notification.message || notification.content || notification.description || "You have a new update.";
              const title = notification.title || notification.type || "Nature Event update";

              return (
                <article className={`notification-card${isRead ? " is-read" : " is-unread"}`} key={notificationId}>
                  <div className="notification-copy">
                    <h2>{title}</h2>
                    <p>{message}</p>
                    {notification.createdAt && (
                      <time dateTime={notification.createdAt}>
                        {new Date(notification.createdAt).toLocaleString()}
                      </time>
                    )}
                    {notification.eventId && (
                      <Link to={`/events/${notification.eventId}`}>View event</Link>
                    )}
                  </div>
                  {!isRead && notificationId != null && (
                    <button
                      type="button"
                      onClick={() => markNotificationRead(notificationId)}
                      disabled={updatingId === notificationId}
                    >
                      {updatingId === notificationId ? "Updating..." : "Mark as read"}
                    </button>
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

export default Notifications;
