import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";
import { API_BASE_URL } from "../config/api";

function Events() {

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const emptyFilters = { keyword: "", location: "", eventType: "", startDate: "", endDate: "" };
  const [filters, setFilters] = useState(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [sortBy, setSortBy] = useState("eventDate");
  const [sortDirection, setSortDirection] = useState("asc");
  const [totalPages, setTotalPages] = useState(null);
  const [hasNextPage, setHasNextPage] = useState(false);


  const fetchEvents = async (nextFilters = appliedFilters, options = {}) => {

    const requestedPage = options.page ?? page;
    const requestedPageSize = options.pageSize ?? pageSize;
    const requestedSortBy = options.sortBy ?? sortBy;
    const requestedSortDirection = options.sortDirection ?? sortDirection;

    setLoading(true);
    setError("");

    try {

      const token = localStorage.getItem("token");

      const query = new URLSearchParams();
      if (nextFilters.keyword.trim()) {
        query.set("keyword", nextFilters.keyword.trim());
      }
      if (nextFilters.location.trim()) {
        query.set("location", nextFilters.location.trim());
      }
      if (nextFilters.eventType) {
        query.set("eventType", nextFilters.eventType);
      }
      if (nextFilters.startDate) {
        query.set("startDate", nextFilters.startDate);
      }
      if (nextFilters.endDate) {
        query.set("endDate", nextFilters.endDate);
      }
      query.set("page", String(requestedPage));
      query.set("size", String(requestedPageSize));
      query.set("sortBy", requestedSortBy);
      query.set("sortDirection", requestedSortDirection);

      const queryString = query.toString();
      const endpoint = `${API_BASE_URL}/events/search?${queryString}`;

      const response = await fetch(
        endpoint,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {

        if (response.status === 401) {
          setError("Your session has expired. Please login again.");
        } else {
          setError("Unable to load events.");
        }

        return;
      }

      const data = await response.json();

      const eventList = Array.isArray(data)
        ? data
        : Array.isArray(data.content)
          ? data.content
          : Array.isArray(data.events)
            ? data.events
            : [];

      setEvents(eventList);
      setPage(Number.isInteger(data.number) ? data.number : requestedPage);
      setTotalPages(Number.isFinite(data.totalPages) ? data.totalPages : null);
      setHasNextPage(
        typeof data.last === "boolean"
          ? !data.last
          : eventList.length >= requestedPageSize
      );

    } catch (error) {

      console.error("Events error:", error);

      setError(
        "Unable to connect to the server."
      );

    } finally {

      setLoading(false);

    }
  };

  const handleFilterSubmit = (event) => {
    event.preventDefault();
    const nextFilters = { ...filters };
    setAppliedFilters(nextFilters);
    setPage(0);
    fetchEvents(nextFilters, { page: 0 });
  };

  const handleClearFilters = () => {
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setPage(0);
    fetchEvents(emptyFilters, { page: 0 });
  };

  const handlePageChange = (nextPage) => {
    setPage(nextPage);
    fetchEvents(appliedFilters, { page: nextPage });
  };

  const handlePageSizeChange = (event) => {
    const nextPageSize = Number(event.target.value);
    setPageSize(nextPageSize);
    setPage(0);
    fetchEvents(appliedFilters, { page: 0, pageSize: nextPageSize });
  };

  const handleSortChange = (event) => {
    const [nextSortBy, nextSortDirection] = event.target.value.split(":");
    setSortBy(nextSortBy);
    setSortDirection(nextSortDirection);
    setPage(0);
    fetchEvents(appliedFilters, {
      page: 0,
      sortBy: nextSortBy,
      sortDirection: nextSortDirection
    });
  };


  useEffect(() => {
    fetchEvents();
  }, []);


  return (
    <div className="events-page">

      {/* Navbar */}

      <header className="events-navbar">

        <Link to="/" className="events-logo">
          <span>🌿</span>
          <span>Nature Event</span>
        </Link>

        <nav className="events-nav-links">

          <Link to="/">
            Home
          </Link>

          <Link to="/events" className="active">
            Events
          </Link>

          <Link to="/notifications">Notifications</Link>
          <Link to="/invitations">Invitations</Link>
          <Link to="/my-events">My Events</Link>

        </nav>

        <div className="events-user-actions">

          <span className="events-user">
            🌱 {localStorage.getItem("username")}
          </span>

          <LogoutButton className="events-home-button events-logout-button" />

        </div>

      </header>


      {/* Page Header */}

      <section className="events-header">

        <p className="events-label">
          🌱 CONNECT • PARTICIPATE • PROTECT
        </p>

        <h1>
          Discover Events
        </h1>

        <p>
          Find environmental events and join people
          working together for a greener world.
        </p>

      </section>


      {/* Events */}

      <main className="events-content">

        <form className="events-filter-form" onSubmit={handleFilterSubmit}>
          <label>
            <span>Search events</span>
            <input
              type="search"
              placeholder="Event name or keyword"
              value={filters.keyword}
              onChange={(event) => setFilters((current) => ({ ...current, keyword: event.target.value }))}
            />
          </label>
          <label>
            <span>Location</span>
            <input
              type="search"
              placeholder="City or place"
              value={filters.location}
              onChange={(event) => setFilters((current) => ({ ...current, location: event.target.value }))}
            />
          </label>
          <label>
            <span>Event type</span>
            <select
              value={filters.eventType}
              onChange={(event) => setFilters((current) => ({ ...current, eventType: event.target.value }))}
            >
              <option value="">All event types</option>
              <option value="PLANTING">Tree Planting</option>
              <option value="CLEANING">Cleanup Drive</option>
              <option value="AWARENESS">Nature Awareness</option>
              <option value="WILDLIFE">Wildlife Protection</option>
              <option value="WATER_CONSERVATION">Water Conservation</option>
              <option value="OTHER">Other</option>
            </select>
          </label>
          <label>
            <span>From date</span>
            <input
              type="date"
              max={filters.endDate || undefined}
              value={filters.startDate}
              onChange={(event) => setFilters((current) => ({ ...current, startDate: event.target.value }))}
            />
          </label>
          <label>
            <span>To date</span>
            <input
              type="date"
              min={filters.startDate || undefined}
              value={filters.endDate}
              onChange={(event) => setFilters((current) => ({ ...current, endDate: event.target.value }))}
            />
          </label>
          <div className="events-filter-actions">
            <button type="submit" disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </button>
            <button type="button" className="events-clear-filters" onClick={handleClearFilters} disabled={loading}>
              Clear
            </button>
          </div>
        </form>

        <div className="events-results-toolbar">
          <label>
            <span>Sort by</span>
            <select value={`${sortBy}:${sortDirection}`} onChange={handleSortChange} disabled={loading}>
              <option value="eventDate:asc">Date: earliest first</option>
              <option value="eventDate:desc">Date: latest first</option>
              <option value="title:asc">Title: A to Z</option>
              <option value="title:desc">Title: Z to A</option>
            </select>
          </label>
          <label>
            <span>Events per page</span>
            <select value={pageSize} onChange={handlePageSizeChange} disabled={loading}>
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
            </select>
          </label>
        </div>

        {loading && (
          <div className="events-message">

            <div className="events-loading-icon">
              🌿
            </div>

            <p>
              Loading events...
            </p>

          </div>
        )}


        {!loading && error && (
          <div className="events-message events-error">

            <div className="events-message-icon">
              🌱
            </div>

            <h3>
              Something went wrong
            </h3>

            <p>
              {error}
            </p>

            <button
              onClick={() => fetchEvents(appliedFilters)}
              className="events-retry-button"
            >
              Try Again
            </button>

          </div>
        )}


        {!loading && !error && events.length === 0 && (
          <div className="events-message">

            <div className="events-message-icon">
              🌳
            </div>

            <h3>
              {Object.values(appliedFilters).some(Boolean) ? "No matching events" : "No events yet"}
            </h3>

            <p>
              {Object.values(appliedFilters).some(Boolean)
                ? "Try a different keyword or location."
                : "Be the first person to create a nature event."}
            </p>

          </div>
        )}


        {!loading && !error && events.length > 0 && (

          <div className="events-grid">

            {events.map((event) => (

              <div
                className="event-card"
                key={event.id}
              >

                <div className="event-card-image">
                  🌿
                </div>

                <div className="event-card-content">

                  <div className="event-card-category">
                    🌱 Nature Event
                  </div>

                  <h2>
                    {event.title}
                  </h2>

                  <p className="event-description">
                    {event.description}
                  </p>

                  <div className="event-info">

                    <div>
                      📅 {event.eventDate || "Date not available"}
                    </div>

                    <div>
                      📍 {event.location || "Location not available"}
                    </div>

                  </div>

                  <Link
                    to={`/events/${event.id}`}
                    className="view-event-button"
                  >
                    View Event →
                  </Link>

                </div>

              </div>

            ))}

          </div>

        )}

        {!loading && !error && (totalPages === null ? page > 0 || hasNextPage : totalPages > 1) && (
          <nav className="events-pagination" aria-label="Event pages">
            <button type="button" onClick={() => handlePageChange(page - 1)} disabled={loading || page === 0}>
              Previous
            </button>
            <span>
              Page {page + 1}{totalPages !== null ? ` of ${Math.max(totalPages, 1)}` : ""}
            </span>
            <button
              type="button"
              onClick={() => handlePageChange(page + 1)}
              disabled={loading || (totalPages !== null ? page + 1 >= totalPages : !hasNextPage)}
            >
              Next
            </button>
          </nav>
        )}

      </main>


      {/* Footer */}

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

export default Events;
