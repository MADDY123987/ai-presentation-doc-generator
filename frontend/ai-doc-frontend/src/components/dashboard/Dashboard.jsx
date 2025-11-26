// src/components/dashboard/Dashboard.jsx
import React, { useEffect, useState } from "react";
import "./dashboard.css";
import { BASE_URL, AUTH_BASE_URL } from "../../config";

// Use Render backend everywhere (no localhost)
// BASE_URL already includes /api/v1
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

  const handleDownload = async (url, filenameFallback = "file") => {
    try {
      const res = await fetch(url, { headers: getAuthHeaders() });
      if (!res.ok) return alert(`Download failed: ${res.status}`);

      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = window.URL.createObjectURL(blob);
      a.download = filenameFallback;
      a.click();
    } catch (err) {
      alert("Download error: " + (err.message || "Unknown error"));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE}/dashboard/items`, {
          headers: { Accept: "application/json", ...getAuthHeaders() },
        });

        if (res.status === 404) {
          setItems(null);
          setError("");
        } else {
          const data = await res.json();
          if (!res.ok) {
            setError(data.detail || "Backend error");
            setItems(null);
          } else {
            setItems(data);
            setError("");
          }
        }
      } catch (err) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const formatDate = (date) =>
    date ? new Date(date).toLocaleString() : "no date";

  const makePreviewText = (item) => {
    const MAX = 160;
    const text =
      item.summary ||
      item.preview ||
      (Array.isArray(item.content) ? item.content[0]?.title || "" : "") ||
      item.title ||
      item.topic ||
      item.name;
    return String(text).slice(0, MAX) + (String(text).length > MAX ? "…" : "");
  };

  const openReadMore = async (item, type = "presentation") => {
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
      setModalContent({ title: "Error", body: "Failed to load content." });
    } finally {
      setModalLoading(false);
    }
  };

  const handleCreate = (kind) => {
    setShowCreateMenu(false);
    if (onCreateProject) onCreateProject(kind);
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
        Failed: {error}
      </p>
    );

  return (
    <div className="dashboard-page">
      <header className="dashboard-header-main">
        <h1 className="dashboard-title-main">
          Welcome, {user?.email || "User"}
        </h1>

        <button className="dashboard-new-btn" onClick={() => setShowCreateMenu((v) => !v)}>
          + New project
        </button>

        {showCreateMenu && (
          <div className="dashboard-new-menu">
            <button onClick={() => handleCreate("ppt")}>
              Create PPT presentation
            </button>
            <button onClick={() => handleCreate("doc")}>
              Create Word document
            </button>
          </div>
        )}
      </header>

      {projects.length === 0 ? (
        <div className="dashboard-empty-shell">
          <p>You don't have projects yet.</p>
        </div>
      ) : (
        <section className="dashboard-projects">
          <div className="dashboard-table-header">
            <span>Title</span>
            <span>Type</span>
            <span>Created</span>
            <span>Actions</span>
          </div>

          <div className="dashboard-table-body">
            {projects.map((proj) => (
              <div className="dashboard-project-row" key={proj.id}>
                <span>{proj.title}</span>
                <span>{proj.kind}</span>
                <span>{formatDate(proj.created_at)}</span>
                <span>
                  <button onClick={() => openReadMore(proj.raw, proj.kind === "PPT" ? "presentation" : "document")}>
                    Open
                  </button>
                  {proj.downloadUrl && (
                    <button
                      onClick={() =>
                        handleDownload(proj.downloadUrl, `${proj.title}.${proj.ext}`)
                      }
                    >
                      Download
                    </button>
                  )}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {modalOpen && (
        <div className="dashboard-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="dashboard-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{modalContent.title}</h3>
            <pre style={{ whiteSpace: "pre-wrap", fontSize: 13 }}>
              {modalLoading ? "Loading…" : modalContent.body}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
