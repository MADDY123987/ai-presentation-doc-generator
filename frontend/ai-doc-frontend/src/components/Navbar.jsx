// src/components/Navbar.jsx
import React from "react";
import { NavLink } from "react-router-dom";

function Navbar({ user, onLogout }) {
  const displayName = user?.name || user?.email || "Guest";
  const initial =
    (user?.name && user.name[0]) ||
    (user?.email && user.email[0]) ||
    "G";

  const isLoggedIn = !!user;

  const linkClass = ({ isActive }) =>
    isActive ? "nav-link nav-link-active" : "nav-link";

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* LEFT: Logo → Home */}
        <NavLink to="/" className="nav-left">
          <div className="nav-logo-dot">PAI</div>
          <div className="nav-logo-text">
            <span>Presentations AI</span>
            <small>Docs & Slides Studio</small>
          </div>
        </NavLink>

        {/* CENTER: Tabs — use NavLink so Router controls active state */}
        <div className="nav-center">
          <NavLink to="/" className={linkClass} end>
            Home
          </NavLink>

          <NavLink to="/dashboard" className={linkClass}>
            Dashboard
          </NavLink>

          <NavLink to="/ppt" className={linkClass}>
            PPT Generator
          </NavLink>

          <NavLink to="/word" className={linkClass}>
            Word Generator
          </NavLink>
        </div>

        {/* RIGHT: User + Login/Logout */}
        <div className="nav-right">
          <div className="nav-user-pill">
            <div className="nav-user-avatar">{initial}</div>
            <span>{displayName}</span>
          </div>

          {!isLoggedIn ? (
            <NavLink to="/login" className="nav-login-btn">
              Login
            </NavLink>
          ) : (
            <button className="nav-login-btn" onClick={onLogout}>
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
