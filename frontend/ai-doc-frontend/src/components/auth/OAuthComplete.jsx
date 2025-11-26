// src/components/auth/OAuthComplete.jsx
import { useEffect } from "react";
import { BASE_URL } from "../../config";   // ✅ import shared base URL

// BASE_URL already has: https://ai-doc-backend-hecs.onrender.com/api/v1
// We just drop the /api/v1 part if your /users/me is not versioned.
// If your FastAPI route is /api/v1/users/me, this is perfect.
const API_BASE = BASE_URL;

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
        // save token so PPT / Word generator can use it
        localStorage.setItem("authToken", token);

        // fetch profile from the SAME backend
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

        // go to home
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
