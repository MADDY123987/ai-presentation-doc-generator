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

function App() {
  const [currentUser, setCurrentUser] = useState(null);

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

              <Route
                path="/ppt"
                element={
                  <ProtectedRoute>
                    <PptGenerator />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/word"
                element={
                  <ProtectedRoute>
                    <WordGenerator />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard
                      user={currentUser}
                      onCreateProject={(kind) => {
                        window.location.href = kind === "ppt" ? "/ppt" : "/word";
                      }}
                    />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/login"
                element={<AuthPage onLogin={handleLogin} />}
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
