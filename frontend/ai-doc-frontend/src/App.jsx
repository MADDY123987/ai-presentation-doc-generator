// src/App.jsx
import React, { useState, useEffect } from "react";
import "./App.css";
import "./word.css";

import Navbar from "./components/Navbar.jsx";
import Home from "./components/home/Home.jsx";
import Footer from "./components/layout/Footer.jsx";
import PptGenerator from "./components/ppt/PptGenerator.jsx";
import WordGenerator from "./components/word/WordGenerator.jsx";
import AuthPage from "./components/auth/AuthPage.jsx";
import Dashboard from "./components/dashboard/Dashboard.jsx";

const API_BASE = "http://127.0.0.1:8000/api/v1"; // local backend

function App() {
  const [activePage, setActivePage] = useState("home");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const handleStartup = async () => {
      const { pathname, search } = window.location;

      if (pathname === "/oauth-complete") {
        const params = new URLSearchParams(search);
        const accessTokenFromQuery = params.get("access_token");
        const code = params.get("code");
        const state = params.get("state");

        try {
          let token = null;

          if (accessTokenFromQuery) {
            token = accessTokenFromQuery;
          } else if (code && state) {
            const provider =
              sessionStorage.getItem("oauth_provider") || "google";

            const callbackUrl = `${API_BASE}/auth/${provider}/callback${search}`;

            const res = await fetch(callbackUrl, {
              method: "GET",
              headers: { "Content-Type": "application/json" },
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || "OAuth failed");

            token = data.access_token;
          } else {
            throw new Error("Invalid OAuth redirect");
          }

          if (!token) throw new Error("Token missing");

          localStorage.setItem("authToken", token);

          const meRes = await fetch(`${API_BASE}/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const me = await meRes.json();
          if (!meRes.ok) throw new Error("Load profile failed");

          localStorage.setItem("authUser", JSON.stringify(me));
          localStorage.setItem("authEmail", me.email || "");

          setCurrentUser(me);
          setActivePage("home");

          window.history.replaceState({}, "", "/");
        } catch {
          alert("Social login failed");
          window.history.replaceState({}, "", "/");
        }

        return;
      }

      const storedUser = localStorage.getItem("authUser");
      if (storedUser) setCurrentUser(JSON.parse(storedUser));
    };

    handleStartup();
  }, []);

  const changePage = (page) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
    changePage("home");
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authEmail");
    localStorage.removeItem("authUser");
    setCurrentUser(null);
    changePage("home");
  };

  // 👇 Dashboard tells App: "User clicked + New Project"
  const handleCreateProject = (kind) => {
    if (kind === "ppt") changePage("ppt");
    else changePage("word");
  };

  return (
    <div className="app">
      <Navbar
        activePage={activePage}
        onChangePage={changePage}
        user={currentUser}
        onLogout={handleLogout}
      />

      <main className="main">
        <div className="page-container">

          {activePage === "home" && (
            <Home
              onStartPpt={() => changePage("ppt")}
              onStartWord={() => changePage("word")}
            />
          )}

          {activePage === "ppt" && (
            <section className="page page-narrow">
              <PptGenerator />
            </section>
          )}

          {activePage === "word" && (
            <section className="page page-narrow">
              <WordGenerator />
            </section>
          )}

          {activePage === "dashboard" && (
            <section className="page page-narrow">
              <Dashboard
                user={currentUser}
                onCreateProject={handleCreateProject}
              />
            </section>
          )}

          {activePage === "login" && (
            <section className="page">
              <AuthPage
                onBackHome={() => changePage("home")}
                onLogin={handleLogin}
              />
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;
