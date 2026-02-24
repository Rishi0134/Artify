import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { isAuthenticated, setStoredAuth } from "../utils/auth";
import "./Auth.css";

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError("");
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateForm = () => {
    const nextErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      nextErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      nextErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters";
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validateForm()) return;
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        formData
      );

      const userData = res?.data?.data;
      if (!userData?.token) {
        throw new Error("Invalid server response");
      }

      setStoredAuth({
        token: userData.token,
        user: {
          _id: userData._id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          profileImage: userData.profileImage || "",
          specialty: userData.specialty || "",
        },
      });

      if (userData.role === "artist") {
        navigate("/artist/dashboard");
      } else {
        navigate("/");
      }

    } catch (error) {
      const validationMessage = error?.response?.data?.errors?.[0]?.msg;
      setError(validationMessage || error?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Log in to continue exploring Artify.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-label" htmlFor="login-email">Email</label>
          <input
            className="auth-input"
            id="login-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            onChange={handleChange}
            required
          />
          {fieldErrors.email ? <p className="auth-field-error">{fieldErrors.email}</p> : null}

          <label className="auth-label" htmlFor="login-password">Password</label>
          <input
            className="auth-input"
            id="login-password"
            name="password"
            type="password"
            placeholder="Enter your password"
            onChange={handleChange}
            required
          />
          {fieldErrors.password ? <p className="auth-field-error">{fieldErrors.password}</p> : null}

          {error ? <p className="auth-error">{error}</p> : null}

          <button className="auth-button" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="auth-switch">
          Not registered yet? <Link to="/register">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
