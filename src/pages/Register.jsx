import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";

function Register() {

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    city: "",
    bio: ""
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();


  // =========================================================
  // HANDLE INPUT CHANGE
  // =========================================================

  const handleChange = (event) => {

    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value
    });
  };


  // =========================================================
  // REGISTER
  // =========================================================

  const handleRegister = async (event) => {

    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {

      const response = await fetch(
        `${API_BASE_URL}/auth/register`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify(formData)
        }
      );


      // =====================================================
      // REGISTRATION FAILED
      // =====================================================

      if (!response.ok) {

        let errorMessage = "Registration failed";

        try {

          const errorData = await response.json();

          if (errorData.message) {
            errorMessage = errorData.message;
          }

        } catch {
          // Keep default error message
        }

        setError(errorMessage);

        return;
      }


      // =====================================================
      // REGISTRATION SUCCESS
      // =====================================================

      await response.json();

      setSuccess(
        "Registration successful! You can now login."
      );


      // Clear form

      setFormData({
        name: "",
        username: "",
        email: "",
        password: "",
        city: "",
        bio: ""
      });


    } catch (error) {

      console.error("Registration error:", error);

      setError(
        "Unable to connect to the server. Please try again."
      );

    } finally {

      setLoading(false);

    }
  };


  return (
    <div className="register-page">

      {/* Nature Background */}

      <div className="register-decoration register-decoration-one">
        🌿
      </div>

      <div className="register-decoration register-decoration-two">
        🌱
      </div>


      {/* Register Card */}

      <div className="register-card">

        {/* Logo */}

        <div className="register-logo">

          <span>🌿</span>

          <h1>
            Nature Event
          </h1>

        </div>


        <p className="register-subtitle">
          Join the movement 🌱
        </p>

        <p className="register-description">
          Create your account and start making a difference.
        </p>


        {/* Error */}

        {error && (
          <div className="register-error">
            {error}
          </div>
        )}


        {/* Success */}

        {success && (
          <div className="register-success">
            {success}
          </div>
        )}


        {/* Register Form */}

        <form onSubmit={handleRegister}>

          {/* Full Name */}

          <div className="form-group">

            <label htmlFor="name">
              Full Name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              required
            />

          </div>


          {/* Username */}

          <div className="form-group">

            <label htmlFor="username">
              Username
            </label>

            <input
              id="username"
              name="username"
              type="text"
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
              required
            />

          </div>


          {/* Email */}

          <div className="form-group">

            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              required
            />

          </div>


          {/* Password */}

          <div className="form-group">

            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              required
            />

          </div>


          {/* City */}

          <div className="form-group">

            <label htmlFor="city">
              City
            </label>

            <input
              id="city"
              name="city"
              type="text"
              placeholder="Your city"
              value={formData.city}
              onChange={handleChange}
              disabled={loading}
            />

          </div>


          {/* Bio */}

          <div className="form-group">

            <label htmlFor="bio">
              About You
            </label>

            <textarea
              id="bio"
              name="bio"
              placeholder="Tell us a little about yourself"
              value={formData.bio}
              onChange={handleChange}
              disabled={loading}
              rows="3"
            />

          </div>


          {/* Register Button */}

          <button
            type="submit"
            className="register-submit-button"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Create Account"
            }
          </button>

        </form>


        {/* Login */}

        <div className="register-login">

          <span>
            Already have an account?
          </span>

          <Link
            to="/login"
            state={{ from: location.state?.from, registered: Boolean(success) }}
            className="login-link"
          >
            Login
          </Link>

        </div>

      </div>

    </div>
  );
}

export default Register;
