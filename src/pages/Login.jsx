import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";

function Login() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();


  // =========================================================
  // LOGIN
  // =========================================================

  const handleLogin = async (event) => {

    event.preventDefault();

    setError("");
    setLoading(true);

    try {

      const response = await fetch(
        `${API_BASE_URL}/auth/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            username: username,
            password: password
          })
        }
      );


      // =====================================================
      // LOGIN FAILED
      // =====================================================

      if (!response.ok) {

        let errorMessage = "Invalid username or password";

        try {

          const errorData = await response.json();

          if (errorData.message) {
            errorMessage = errorData.message;
          }

        } catch {
          // Keep default message
        }

        setError(errorMessage);

        return;
      }


      // =====================================================
      // LOGIN SUCCESS
      // =====================================================

      const data = await response.json();

      console.log("Login successful:", data);


      // Save JWT token

      localStorage.setItem(
        "token",
        data.token
      );


      // Save username

      localStorage.setItem(
        "username",
        username
      );


      // Go to home page

      navigate(location.state?.from || "/");

    } catch (error) {

      console.error("Login error:", error);

      setError(
        "Unable to connect to the server. Please check whether the backend is running."
      );

    } finally {

      setLoading(false);

    }
  };


  return (
    <div className="login-page">

      {/* Nature Background */}

      <div className="login-decoration login-decoration-one">
        🌿
      </div>

      <div className="login-decoration login-decoration-two">
        🌱
      </div>


      {/* Login Card */}

      <div className="login-card">

        {/* Logo */}

        <div className="login-logo">

          <span>🌿</span>

          <h1>
            Nature Event
          </h1>

        </div>


        <p className="login-subtitle">
          Welcome back 🌱
        </p>

        <p className="login-description">
          Sign in and continue making a difference for nature.
        </p>


        {/* Error Message */}

        {error && (
          <div className="login-error">
            {error}
          </div>
        )}

        {location.state?.registered && (
          <div className="login-success" role="status">
            Account created. Sign in to continue to the event.
          </div>
        )}


        {/* Login Form */}

        <form onSubmit={handleLogin}>

          {/* Username */}

          <div className="form-group">

            <label htmlFor="username">
              Username
            </label>

            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(event) =>
                setUsername(event.target.value)
              }
              required
              disabled={loading}
            />

          </div>


          {/* Password */}

          <div className="form-group">

            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              required
              disabled={loading}
            />

          </div>


          {/* Login Button */}

          <button
            type="submit"
            className="login-submit-button"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>


        {/* Register */}

        <div className="login-register">

          <span>
            Don't have an account?
          </span>

          <Link
            to="/register"
            state={{ from: location.state?.from }}
            className="register-link"
          >
            Create Account
          </Link>

        </div>

      </div>

    </div>
  );
}

export default Login;
