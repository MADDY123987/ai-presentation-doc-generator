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

function App() {
  const [activePage, setActivePage] = useState("home");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("authUser");
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse authUser", e);
      }
    }
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
