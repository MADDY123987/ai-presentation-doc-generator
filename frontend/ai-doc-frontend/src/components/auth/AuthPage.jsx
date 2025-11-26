import React, { useState } from "react";
import "./AuthPage.css";

const API_BASE = "http://127.0.0.1:8000"; // Backend URL

function AuthPage({ onBackHome, onLogin }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "register") {
        const res = await fetch(`${API_BASE}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Registration failed");

        alert("Registered successfully! Now log in.");
        setMode("login");
      } else {
        const form = new URLSearchParams();
        form.append("username", email);
        form.append("password", password);

        const res = await fetch(`${API_BASE}/auth/jwt/login`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: form.toString(),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Login failed");

        const token = data.access_token;
        if (!token) throw new Error("No access token received");

        localStorage.setItem("authToken", token);
        localStorage.setItem("authEmail", email);

        const meRes = await fetch(`${API_BASE}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const me = await meRes.json();
        if (!meRes.ok) throw new Error(me.detail || "Failed to load user");

        localStorage.setItem("authUser", JSON.stringify(me));
        if (onLogin) onLogin(me);

        alert("Logged in successfully!");
        if (onBackHome) onBackHome();
      }
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider) => {
    try {
      setLoading(true);

      // remember provider for /oauth-complete
      sessionStorage.setItem("oauth_provider", provider);

      const res = await fetch(`${API_BASE}/auth/${provider}/authorize`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to start OAuth");
      }

      if (!data.authorization_url) {
        throw new Error("No authorization_url from backend");
      }

      window.location.href = data.authorization_url;
    } catch (err) {
      console.error(err);
      alert(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page-card">
        <div className="auth-page-header">
          <button className="auth-back" onClick={onBackHome}>
            ← Back
          </button>

          <h1>{mode === "login" ? "Welcome back" : "Create your workspace"}</h1>
          <p>
            {mode === "login"
              ? "Sign in to access your AI tools."
              : "Sign up to save AI projects in one place."}
          </p>
        </div>

        <div className="auth-page-tabs">
          <button
            className={mode === "login" ? "auth-page-tab active" : "auth-page-tab"}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            className={mode === "register" ? "auth-page-tab active" : "auth-page-tab"}
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>

        <form className="auth-page-form" onSubmit={handleSubmit}>
          {mode === "register" && (
            <label>
              Name
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                required
              />
            </label>
          )}

          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </label>

          <button type="submit" className="auth-page-submit" disabled={loading}>
            {loading
              ? mode === "login"
                ? "Logging in..."
                : "Creating..."
              : mode === "login"
              ? "Login"
              : "Create account"}
          </button>
        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <div className="oauth-buttons">
          <button
            className="oauth-btn github"
            disabled={loading}
            onClick={() => handleOAuth("github")}
          >
            <img
              src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
              alt="GitHub"
              width="18"
              height="18"
            />
            GitHub Login
          </button>

          <button
            className="oauth-btn google"
            disabled={loading}
            onClick={() => handleOAuth("google")}
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              width="18"
              height="18"
            />
            Google Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
