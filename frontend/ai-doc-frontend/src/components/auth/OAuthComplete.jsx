// src/components/auth/OAuthComplete.jsx
import { useEffect } from "react";

const API_BASE = "http://127.0.0.1:8000";

function OAuthComplete({ onLogin }) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("access_token");

    if (!token) {
      console.error("No access token in URL");
      return;
    }

    (async () => {
      try {
        // save token
        localStorage.setItem("authToken", token);

        // get user profile
        const meRes = await fetch(`${API_BASE}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const me = await meRes.json();

        if (!meRes.ok) {
          throw new Error(me.detail || "Failed to load user");
        }

        localStorage.setItem("authUser", JSON.stringify(me));
        localStorage.setItem("authEmail", me.email);

        if (onLogin) onLogin(me);

        // go to home (or dashboard)
        window.location.href = "/";
      } catch (err) {
        console.error(err);
        alert("OAuth login failed");
      }
    })();
  }, [onLogin]);

  return (
    <div style={{ color: "white", padding: "40px", textAlign: "center" }}>
      Finishing login...
    </div>
  );
}

export default OAuthComplete;
