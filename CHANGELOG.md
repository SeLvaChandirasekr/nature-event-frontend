# Nature Event Frontend Change Log

## 2026-10-08

- Added a web app manifest, mobile safe-area viewport support, theme color, page description, and Nature Event SVG app icon as an installability foundation.
- Centralized frontend API requests in `src/config/api.js`; local requests still default to `http://localhost:8080`, and deployments can set `VITE_API_BASE_URL` to the backend origin.
- Added `.env.example` documenting the local API URL setting.
- Added a View Participants panel to event details, loading participants from `GET /api/events/{id}/participants` when opened.
- Added an Invitations page with received and sent lists, plus accept/reject actions for pending received invitations using the backend invitation endpoints.
- Added Invitations navigation links and responsive invitation styles.

## Earlier completed frontend work

- Fixed the create-event location search so it no longer submits the parent event form; the selected address is used as the event location.
- Added event keyword/location search, type and date filters, sorting, and pagination.
- Added event join/leave state, shareable event links, and login/register return paths for shared event URLs.
- Fixed the Create Event home action and logout behavior.
- Added notifications and My Events pages, including event edit, complete, cancel, and delete actions with backend status restrictions reflected in the UI.
- Confirmed by the user during the session: location and event search, create event, join/leave, logout, My Joined, delete, and editing active events work.

## Follow-up

- Manually verify the participants panel and `/invitations` page against a running backend. The invitation page shows records created through the backend; sharing an event URL remains a separate flow.
- Before Play Store release, deploy over HTTPS, configure the real API URL and backend CORS, provide required Android icon assets, and set up Android App Links for the deployed domain.
