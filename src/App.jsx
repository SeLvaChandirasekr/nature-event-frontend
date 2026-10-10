import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import CreateEvent from "./pages/CreateEvent";
import Notifications from "./pages/Notifications";
import Invitations from "./pages/Invitations";
import MyEvents from "./pages/MyEvents";
import LogoutButton from "./components/LogoutButton";
import "./index.css";

function Home() {
  const isLoggedIn = Boolean(localStorage.getItem("token"));

  return (
    <div className="app">

      {/* =====================================================
          NAVBAR
          ===================================================== */}

      <header className="navbar">

        <div className="logo">
          <span className="logo-icon">🌿</span>
          <span>Nature Event</span>
        </div>


        <nav className="nav-links">

          <a href="#events">
            Events
          </a>

          <a href="#about">
            About
          </a>

          <a href="#contact">
            Contact
          </a>

          {isLoggedIn && <Link to="/notifications">Notifications</Link>}
          {isLoggedIn && <Link to="/invitations">Invitations</Link>}
          {isLoggedIn && <Link to="/my-events">My Events</Link>}

        </nav>


        <div className="nav-actions">
          {isLoggedIn ? (
            <>
              <span className="home-user-name">{localStorage.getItem("username")}</span>
              <LogoutButton className="home-logout-button" />
            </>
          ) : (
            <>
              <Link to="/login">
                <button className="login-button">Login</button>
              </Link>
              <Link to="/register">
                <button className="register-button">Join Us</button>
              </Link>
            </>
          )}

        </div>

      </header>


      {/* =====================================================
          HERO
          ===================================================== */}

      <main>

        <section className="hero">

          <div className="hero-content">

            <p className="hero-label">
              🌱 CONNECT • PARTICIPATE • PROTECT
            </p>

            <h1>
              Make a Difference
              <br />
              <span>for Nature.</span>
            </h1>

            <p className="hero-description">
              Discover meaningful environmental events, connect with
              your community, and take action for a greener tomorrow.
            </p>


            <div className="hero-buttons">

              <Link to="/events">
                <button className="primary-button">
                  Explore Events
                </button>
              </Link>


              <Link to="/events/create">
                <button className="secondary-button">
                  Create an Event
                </button>
              </Link>

            </div>

          </div>


          {/* Hero Visual */}

          <div className="hero-visual">

            <div className="nature-circle">
              🌳
            </div>

            <div className="floating-card card-one">
              🌱 Plant a Tree
            </div>

            <div className="floating-card card-two">
              🌍 Clean Our Community
            </div>

          </div>

        </section>


        {/* ===================================================
            ABOUT / MISSION
            =================================================== */}

        <section
          className="intro"
          id="about"
        >

          <p className="section-label">
            OUR MISSION
          </p>

          <h2>
            Small actions can create
            <br />
            a greener world.
          </h2>

          <p>
            Nature Event brings people together to participate in
            environmental activities such as tree planting, clean-up
            drives, community events, and more.
          </p>

        </section>


        {/* ===================================================
            CATEGORIES
            =================================================== */}

        <section
          className="categories"
          id="events"
        >

          <div className="category-card">

            <div className="category-icon">
              🌳
            </div>

            <h3>
              Tree Planting
            </h3>

            <p>
              Help create greener spaces in your community.
            </p>

          </div>


          <div className="category-card">

            <div className="category-icon">
              🧹
            </div>

            <h3>
              Clean-up Drives
            </h3>

            <p>
              Work together to keep our surroundings clean.
            </p>

          </div>


          <div className="category-card">

            <div className="category-icon">
              🌱
            </div>

            <h3>
              Community Events
            </h3>

            <p>
              Connect with people who care about nature.
            </p>

          </div>

        </section>

      </main>


      {/* =====================================================
          FOOTER
          ===================================================== */}

      <footer id="contact">

        <div className="footer-logo">
          🌿 Nature Event
        </div>

        <p>
          Together for a greener tomorrow.
        </p>

        <p className="copyright">
          © 2026 Nature Event
        </p>

      </footer>

    </div>
  );
}


/* =========================================================
   APP ROUTES
   ========================================================= */

function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* Home */}

        <Route
          path="/"
          element={<Home />}
        />


        {/* Login */}

        <Route
          path="/login"
          element={<Login />}
        />


        {/* Register */}

        <Route
          path="/register"
          element={<Register />}
        />


        {/* Events */}

        <Route
          path="/events"
          element={<Events />}
        />

        <Route
          path="/notifications"
          element={<Notifications />}
        />

        <Route
          path="/invitations"
          element={<Invitations />}
        />

        <Route
          path="/my-events"
          element={<MyEvents />}
        />

        <Route
          path="/my-created"
          element={<MyEvents />}
        />

        <Route
          path="/my-joined"
          element={<MyEvents />}
        />

         <Route
    path="/events/:id"
    element={<EventDetails />}
  />
<Route
  path="/events/create"
  element={<CreateEvent />}
/>

      </Routes>

    </BrowserRouter>

  );
}

export default App;
