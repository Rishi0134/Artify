import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { isAuthenticated, setStoredAuth } from "../utils/auth";
import "./Auth.css";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError("");
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const nameRegex = /^[A-Za-z\s]{2,50}$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;

    if (!formData.name.trim()) {
      errors.name = "Full name is required";
    } else if (!nameRegex.test(formData.name.trim())) {
      errors.name = "Name must be 2-50 letters";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "Invalid email format";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (!passwordRegex.test(formData.password)) {
      errors.password =
        "Password must be 6+ characters with letters and numbers";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm password";
    } else if (confirmPassword !== formData.password) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      // ✅ PRODUCTION SAFE (NO LOCALHOST)
      const response = await axios.post("/api/auth/register", formData);

      const userData = response?.data?.data;

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
        },
      });

      if (userData.role === "artist") {
        navigate("/artist/dashboard");
      } else {
        navigate("/login");
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.errors?.[0]?.msg ||
          "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Create Account</h2>

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            className="auth-input"
            onChange={handleChange}
            required
          />
          {fieldErrors.name && (
            <p className="auth-field-error">{fieldErrors.name}</p>
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            className="auth-input"
            onChange={handleChange}
            required
          />
          {fieldErrors.email && (
            <p className="auth-field-error">{fieldErrors.email}</p>
          )}

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="auth-input"
            onChange={handleChange}
            required
          />
          {fieldErrors.password && (
            <p className="auth-field-error">{fieldErrors.password}</p>
          )}

          <input
            type="password"
            placeholder="Confirm Password"
            className="auth-input"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setFieldErrors((prev) => ({
                ...prev,
                confirmPassword: "",
              }));
            }}
            required
          />
          {fieldErrors.confirmPassword && (
            <p className="auth-field-error">
              {fieldErrors.confirmPassword}
            </p>
          )}

          <select
            name="role"
            className="auth-select"
            onChange={handleChange}
          >
            <option value="customer">Customer</option>
            <option value="artist">Artist</option>
          </select>

          {error && <p className="auth-error">{error}</p>}

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? "Creating..." : "Register"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;