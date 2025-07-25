import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

// Use Vite env if provided, else fallback
const API_BASE =
  import.meta.env.VITE_EMPLOYEE_API?.replace(/\/$/, "") ||
  "http://localhost:8000/api";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    role: "EMPLOYEE",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({
      ...p,
      [name]: name === "role" ? value.toUpperCase() : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = {
        email: form.email,
        password: form.password,
      };
      const res = await axios.post(`${API_BASE}/auth/login`, payload, {
        withCredentials: true,
      });

      console.log("LOGIN OK:", res.data);

      // Save token to localStorage (for axios interceptor)
      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
      }

      navigate("/dashboard");
    } catch (err) {
      console.error("LOGIN ERR:", err);
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.msg ||
          "Login failed."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "var(--color-cream)" }}
    >
      <div
        className="w-full max-w-md rounded-xl shadow-lg p-8 animate-fadeIn"
        style={{
          backgroundColor: "#fff",
          border: "1px solid var(--color-pastel)",
        }}
      >
        <h1
          className="text-3xl font-bold text-center mb-6"
          style={{ color: "var(--color-sage)" }}
        >
          Welcome Back
        </h1>

        {error && (
          <div
            className="mb-4 text-sm px-3 py-2 rounded"
            style={{ backgroundColor: "#ffe3e3", color: "#b91c1c" }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role (visual) */}
          <div>
            <label className="block text-sm mb-1" style={{ color: "#555" }}>
              Login as
            </label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
              style={{
                backgroundColor: "var(--color-cream)",
                borderColor: "var(--color-pastel)",
                color: "#333",
              }}
            >
              <option value="EMPLOYEE">Employee</option>
              <option value="HR">HR</option>
            </select>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm mb-1" style={{ color: "#555" }}>
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="you@company.com"
              className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
              style={{
                backgroundColor: "var(--color-cream)",
                borderColor: "var(--color-pastel)",
                color: "#333",
              }}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm mb-1" style={{ color: "#555" }}>
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
              style={{
                backgroundColor: "var(--color-cream)",
                borderColor: "var(--color-pastel)",
                color: "#333",
              }}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold shadow-md transition-transform duration-200 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              backgroundColor: "var(--color-sage)",
              color: "#fff",
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm" style={{ color: "#666" }}>
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="font-medium hover:underline"
            style={{ color: "var(--color-sage)" }}
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
