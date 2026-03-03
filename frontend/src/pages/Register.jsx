import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { isAuthenticated, setStoredAuth } from "../utils/auth";
import "./Auth.css";

const Register = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer"
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
    const nameRegex = /^[A-Za-z\s]{2,50}$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;

    if (!formData.name.trim()) {
      nextErrors.name = "Full name is required";
    } else if (!nameRegex.test(formData.name.trim())) {
      nextErrors.name = "Name should be 2-50 letters (spaces allowed)";
    }

    if (!formData.email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      nextErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      nextErrors.password = "Password is required";
    } else if (!passwordRegex.test(formData.password)) {
      nextErrors.password = "Password must be 6+ chars with letters and numbers";
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your password";
    } else if (confirmPassword !== formData.password) {
      nextErrors.confirmPassword = "Passwords do not match";
    }

    if (!["customer", "artist"].includes(formData.role)) {
      nextErrors.role = "Please select a valid account type";
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
      const res = await axios.post("http://localhost:5000/api/auth/register", formData);
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
        navigate("/login");
      }
    } catch (error) {
      const validationMessage = error?.response?.data?.errors?.[0]?.msg;
      setError(validationMessage || error?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Join Artify and start your journey.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-label" htmlFor="register-name">Full Name</label>
          <input
            className="auth-input"
            id="register-name"
            name="name"
            placeholder="Your name"
            onChange={handleChange}
            required
          />
          {fieldErrors.name ? <p className="auth-field-error">{fieldErrors.name}</p> : null}

          <label className="auth-label" htmlFor="register-email">Email</label>
          <input
            className="auth-input"
            id="register-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            onChange={handleChange}
            required
          />
          {fieldErrors.email ? <p className="auth-field-error">{fieldErrors.email}</p> : null}

          <label className="auth-label" htmlFor="register-password">Password</label>
          <input
            className="auth-input"
            id="register-password"
            name="password"
            type="password"
            placeholder="Create a strong password"
            onChange={handleChange}
            required
          />
          {fieldErrors.password ? <p className="auth-field-error">{fieldErrors.password}</p> : null}

          <label className="auth-label" htmlFor="register-confirm-password">Confirm Password</label>
          <input
            className="auth-input"
            id="register-confirm-password"
            name="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => {
              setError("");
              setFieldErrors((prev) => ({ ...prev, confirmPassword: "" }));
              setConfirmPassword(e.target.value);
            }}
            required
          />
          {fieldErrors.confirmPassword ? <p className="auth-field-error">{fieldErrors.confirmPassword}</p> : null}

          <label className="auth-label" htmlFor="register-role">Account Type</label>
          <select
            className="auth-select"
            id="register-role"
            name="role"
            onChange={handleChange}
          >
            <option value="customer">Customer</option>
            <option value="artist">Artist</option>
          </select>
          {fieldErrors.role ? <p className="auth-field-error">{fieldErrors.role}</p> : null}

          {error ? <p className="auth-error">{error}</p> : null}

          <button className="auth-button" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
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
