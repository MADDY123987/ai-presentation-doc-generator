// src/components/auth/OAuthComplete.jsx
import { useEffect } from "react";
import { BASE_URL } from "../../config";

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
        localStorage.setItem("authToken", token);

        const meRes = await fetch(`${BASE_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const me = await meRes.json();

        if (!meRes.ok) {
          throw new Error(me.detail || "Failed to load user");
        }

        localStorage.setItem("authUser", JSON.stringify(me));
        localStorage.setItem("authEmail", me.email);

        if (onLogin) onLogin(me);

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
