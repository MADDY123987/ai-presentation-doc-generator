// src/components/dashboard/Dashboard.jsx
import React, { useEffect, useState } from "react";
import "./dashboard.css";
import { BASE_URL, AUTH_BASE_URL } from "../../config";

// BASE_URL includes /api/v1
const API_BASE = BASE_URL;
const API_HOST = AUTH_BASE_URL;

function Dashboard({ user, onCreateProject }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", body: "" });
  const [modalLoading, setModalLoading] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handleDownload = async (url, filename = "file") => {
    try {
      const res = await fetch(url, { headers: getAuthHeaders() });
      if (!res.ok) return alert("Download failed: " + res.status);

      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = window.URL.createObjectURL(blob);
      a.download = filename;
      a.click();
    } catch (err) {
      alert("Download error: " + err.message);
    }
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch(`${API_BASE}/dashboard/items`, {
          headers: { Accept: "application/json", ...getAuthHeaders() },
        });

        if (res.status === 404) {
          setItems(null);
          return;
        }

        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Backend error");

        setItems(data);
        setError("");
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user]);

  const formatDate = (d) =>
    d ? new Date(d).toLocaleString() : "No date";

  const makePreviewText = (item) => {
    const text =
      item.summary ||
      item.preview ||
      item.title ||
      item.topic ||
      item.name ||
      "";
    const trimmed = text.toString().trim();
    return trimmed.length > 160 ? trimmed.slice(0, 160) + "…" : trimmed;
  };

  const openReadMore = async (item, type) => {
    setModalOpen(true);
    setModalLoading(true);

    try {
      const endpoint =
        type === "presentation"
          ? `${API_BASE}/presentations/${item.id}`
          : `${API_BASE}/documents/${item.id}`;

      const res = await fetch(endpoint, {
        headers: getAuthHeaders(),
      });

      const data = await res.json();
      setModalContent({
        title: data.title || data.topic || `${type} #${item.id}`,
        body: JSON.stringify(data, null, 2),
      });
    } catch {
      setModalContent({
        title: "Error",
        body: "Unable to load full content.",
      });
    } finally {
      setModalLoading(false);
    }
  };

  const handleCreate = (kind) => {
    setShowCreateMenu(false);
    onCreateProject?.(kind);
  };

  const presentations = items?.presentations || [];
  const documents = items?.projects || items?.documents || [];

  const projects = [
    ...presentations.map((p) => ({
      id: p.id,
      kind: "PPT",
      ext: "pptx",
      title: p.title || p.topic || "Untitled deck",
      created_at: p.created_at,
      preview: makePreviewText(p),
      raw: p,
      downloadUrl: p.download_endpoint
        ? p.download_endpoint.startsWith("http")
          ? p.download_endpoint
          : `${API_HOST}${p.download_endpoint}`
        : null,
    })),
    ...documents.map((d) => ({
      id: d.id,
      kind: "DOCX",
      ext: "docx",
      title: d.title || "Untitled document",
      created_at: d.created_at,
      preview: makePreviewText(d),
      raw: d,
      downloadUrl: d.download_endpoint
        ? d.download_endpoint.startsWith("http")
          ? d.download_endpoint
          : `${API_HOST}${d.download_endpoint}`
        : null,
    })),
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  if (loading) return <p className="dashboard-status">Loading…</p>;
  if (error)
    return (
      <p className="dashboard-status dashboard-status-error">
        {error}
      </p>
    );

  return (
    <div className="dashboard-page">
      <div className="dashboard-header-main">
        <h1 className="dashboard-title-main">
          Welcome, {user?.email || "User"}
        </h1>
        <button
          className="dashboard-new-btn"
          onClick={() => setShowCreateMenu((v) => !v)}
        >
          + New project
        </button>

        {showCreateMenu && (
          <div className="dashboard-new-menu">
            <button onClick={() => handleCreate("ppt")}>📽️ PPT</button>
            <button onClick={() => handleCreate("doc")}>📄 Word</button>
          </div>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="dashboard-empty-shell">
          No projects yet — create one!
        </div>
      ) : (
        <section className="dashboard-projects">
          <div className="dashboard-table-header">
            <span>Title</span>
            <span>Type</span>
            <span>Created</span>
            <span>Actions</span>
          </div>

          {projects.map((p) => (
            <div key={p.id} className="dashboard-project-row">
              <span>{p.title}</span>
              <span>{p.kind}</span>
              <span>{formatDate(p.created_at)}</span>
              <span>
                <button
                  onClick={() =>
                    openReadMore(
                      p.raw,
                      p.kind === "PPT" ? "presentation" : "document"
                    )
                  }
                >
                  Open
                </button>
                {p.downloadUrl && (
                  <button
                    onClick={() =>
                      handleDownload(p.downloadUrl, `${p.title}.${p.ext}`)
                    }
                  >
                    Download
                  </button>
                )}
              </span>
            </div>
          ))}
        </section>
      )}

      {modalOpen && (
        <div className="dashboard-modal-overlay"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="dashboard-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>{modalContent.title}</h3>
            <pre className="dashboard-modal-body">
              {modalLoading ? "Loading…" : modalContent.body}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
