// src/App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import "./word.css";

import Navbar from "./components/Navbar.jsx";
import Home from "./components/home/Home.jsx";
import Footer from "./components/layout/Footer.jsx";
import PptGenerator from "./components/ppt/PptGenerator.jsx";
import WordGenerator from "./components/word/WordGenerator.jsx";
import AuthPage from "./components/auth/AuthPage.jsx";
import Dashboard from "./components/dashboard/Dashboard.jsx";

import { BASE_URL } from "./config"; // 🔥 uses Render backend

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  // Load user from storage at startup
  useEffect(() => {
    const storedUser = localStorage.getItem("authUser");
    if (storedUser) setCurrentUser(JSON.parse(storedUser));
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authEmail");
    localStorage.removeItem("authUser");
    setCurrentUser(null);
  };

  // 🔒 Protected Route
  const ProtectedRoute = ({ children }) =>
    currentUser ? children : <Navigate to="/login" replace />;

  return (
    <BrowserRouter>
      <div className="app">
        <Navbar user={currentUser} onLogout={handleLogout} />

        <main className="main">
          <div className="page-container">
            <Routes>
              <Route path="/" element={<Home />} />

              {/* PPT Generator */}
              <Route
                path="/ppt"
                element={
                  <ProtectedRoute>
                    <PptGenerator />
                  </ProtectedRoute>
                }
              />

              {/* DOCX Generator */}
              <Route
                path="/word"
                element={
                  <ProtectedRoute>
                    <WordGenerator />
                  </ProtectedRoute>
                }
              />

              {/* Dashboard */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard
                      user={currentUser}
                      onCreateProject={(kind) =>
                        window.location.href = kind === "ppt" ? "/ppt" : "/word"
                      }
                    />
                  </ProtectedRoute>
                }
              />

              {/* Login */}
              <Route
                path="/login"
                element={<AuthPage onLogin={handleLogin} />}
              />

              {/* default → Home */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
