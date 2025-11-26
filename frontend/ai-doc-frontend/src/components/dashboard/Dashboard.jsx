// src/components/dashboard/Dashboard.jsx
import React, { useEffect, useState } from "react";
import "./dashboard.css";
import { BASE_URL, AUTH_BASE_URL } from "../../config";

// API base: same as backend
const API_BASE = BASE_URL;      // e.g. https://ai-doc-backend-hecs.onrender.com/api/v1
const API_HOST = AUTH_BASE_URL; // e.g. https://ai-doc-backend-hecs.onrender.com

function Dashboard({ user, onCreateProject }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", body: "" });
  const [modalLoading, setModalLoading] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  // ---- auth helper ----
  const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // ---- download helper ----
  const handleDownload = async (url, filenameFallback = "file") => {
    try {
      const res = await fetch(url, { headers: getAuthHeaders() });
      if (!res.ok) {
        console.error("Download failed:", res.status, await res.text());
        alert(`Download failed: ${res.status}`);
        return;
      }

      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filenameFallback;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download error:", err);
      alert("Download error: " + (err.message || "Unknown error"));
    }
  };

  // ---- load dashboard items ----
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(`${API_BASE}/dashboard/items`, {
          headers: {
            Accept: "application/json",
            ...getAuthHeaders(),
          },
        });

        if (res.status === 404) {
          // Fresh user: no projects yet
          setItems(null);
          setError("");
        } else {
          const data = await res.json();
          if (!res.ok) {
            console.error("Dashboard error:", res.status, data);
            setError(
              data.detail || `Backend error: ${res.status} ${res.statusText}`
            );
            setItems(null);
          } else {
            setItems(data);
            setError("");
          }
        }
      } catch (err) {
        console.error("Dashboard fetch failed:", err);
        setError(err.message || "Unknown error");
        setItems(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const formatDate = (value) => {
    if (!value) return "no date";
    try {
      return new Date(value).toLocaleString();
    } catch {
      return String(value);
    }
  };

  const makePreviewText = (item) => {
    const MAX_CHARS = 160;
    if (!item) return "";

    const content =
      item.summary ||
      item.preview ||
      (Array.isArray(item.content) ? item.content[0]?.title : "") ||
      item.title ||
      item.topic ||
      item.name ||
      "";

    const s = String(content).trim();
    if (!s) return "";
    return s.length > MAX_CHARS ? s.slice(0, MAX_CHARS) + "…" : s;
  };

  const openReadMore = async (item, type = "presentation") => {
    setModalOpen(true);
    setModalLoading(true);
    setModalContent({ title: "Loading…", body: "" });

    try {
      const endpoint =
        type === "presentation"
          ? `${API_BASE}/presentations/${item.id}`
          : `${API_BASE}/documents/${item.id}`;

      const res = await fetch(endpoint, {
        headers: {
          Accept: "application/json",
          ...getAuthHeaders(),
        },
      });
      const data = await res.json();

      if (!res.ok) {
        setModalContent({
          title: "Failed to load",
          body: data.detail || `Error ${res.status}`,
        });
      } else {
        let bodyText = "";
        if (type === "presentation") {
          const slides = data.content || [];
          bodyText = slides
            .map((s, i) => {
              const t = s?.title ? `Title: ${s.title}` : "";
              const bullets =
                s?.bullets && s.bullets.length
                  ? `\n• ${s.bullets.join("\n• ")}`
                  : "";
              const left = s?.left ? `\nLeft: ${s.left}` : "";
              const right = s?.right ? `\nRight: ${s.right}` : "";
              return `Slide ${i + 1}\n${t}${bullets}${left}${right}`;
            })
            .join("\n\n");
        } else if (data.sections && Array.isArray(data.sections)) {
          bodyText = data.sections
            .map(
              (s, i) =>
                `Section ${i + 1} — ${s.title || ""}\n\n${
                  s.content || s.body || ""
                }`
            )
            .join("\n\n----\n\n");
        } else {
          bodyText =
            data.content || data.body || JSON.stringify(data, null, 2);
        }

        setModalContent({
          title: data.title || data.topic || item.title || `Project ${item.id}`,
          body: bodyText,
        });
      }
    } catch (err) {
      console.error("Read more error:", err);
      setModalContent({
        title: "Error",
        body: err.message || "Unknown error",
      });
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalContent({ title: "", body: "" });
  };

  const handleCreateClick = () => {
    setShowCreateMenu((v) => !v);
  };

  const handleCreate = (kind) => {
    setShowCreateMenu(false);
    if (onCreateProject) onCreateProject(kind); // App switches page
  };

  // ---- flatten projects ----
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
      downloadUrl:
        p.download_endpoint &&
        (p.download_endpoint.startsWith("http")
          ? p.download_endpoint
          : `${API_HOST}${p.download_endpoint}`),
    })),
    ...documents.map((d) => ({
      id: d.id,
      kind: (d.type || "DOCX").toUpperCase(),
      ext: (d.type || "docx").toLowerCase(),
      title: d.title || "Untitled document",
      created_at: d.created_at,
      preview: makePreviewText(d),
      raw: d,
      downloadUrl:
        d.download_endpoint &&
        (d.download_endpoint.startsWith("http")
          ? d.download_endpoint
          : `${API_HOST}${d.download_endpoint}`),
    })),
  ].sort((a, b) => {
    const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
    const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
    return tb - ta;
  });

  if (loading) {
    return (
      <div className="dashboard-page">
        <p className="dashboard-status">Loading dashboard…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <p className="dashboard-status dashboard-status-error">
          Error loading data: {error}
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header-main">
        <header className="dashboard-header">
          <h1 className="dashboard-title-main">
            Welcome, {user?.email || "User"}
          </h1>
          <p className="dashboard-subtitle">
            Quick view of your AI-generated decks and documents.
          </p>
        </header>

        <div className="dashboard-header-actions">
          <button className="dashboard-new-btn" onClick={handleCreateClick}>
            + New project
          </button>

          {showCreateMenu && (
            <div className="dashboard-new-menu">
              <button
                className="dashboard-new-menu-item"
                onClick={() => handleCreate("ppt")}
              >
                Create PPT presentation
              </button>
              <button
                className="dashboard-new-menu-item"
                onClick={() => handleCreate("doc")}
              >
                Create Word document
              </button>
            </div>
          )}
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="dashboard-empty-shell">
          <p className="dashboard-empty-title">
            You don&apos;t have projects yet.
          </p>
          <p className="dashboard-empty-sub">
            Click <strong>New project</strong> to generate your first PPT or
            Word document. It will show up here automatically.
          </p>
        </div>
      ) : (
        <section className="dashboard-projects">
          <div className="dashboard-table-header">
            <div className="dashboard-th-title">Title</div>
            <div className="dashboard-th-type">Type</div>
            <div className="dashboard-th-date">Created</div>
            <div className="dashboard-th-actions">Actions</div>
          </div>

          <div className="dashboard-table-body">
            {projects.map((proj) => {
              const item = proj.raw;
              const isPresentation = proj.kind === "PPT";

              return (
                <div
                  className="dashboard-project-row"
                  key={`${proj.kind}-${proj.id}`}
                >
                  <div className="dashboard-project-main">
                    <input
                      type="checkbox"
                      className="dashboard-checkbox"
                      disabled
                    />
                    <div className="dashboard-project-title-block">
                      <div className="dashboard-project-title-text">
                        {proj.title}
                      </div>
                      {proj.preview && (
                        <div className="dashboard-project-preview">
                          {proj.preview}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="dashboard-project-type-cell">
                    <span className="dashboard-type-pill">{proj.kind}</span>
                  </div>

                  <div className="dashboard-project-date">
                    {formatDate(proj.created_at)}
                  </div>

                  <div className="dashboard-project-actions">
                    <button
                      className="dashboard-row-btn"
                      onClick={() =>
                        openReadMore(
                          item,
                          isPresentation ? "presentation" : "document"
                        )
                      }
                    >
                      Open
                    </button>
                    {proj.downloadUrl && (
                      <button
                        className="dashboard-row-btn dashboard-row-btn-ghost"
                        onClick={() =>
                          handleDownload(
                            proj.downloadUrl,
                            `${proj.title || (isPresentation
                              ? "presentation"
                              : "document")}.${proj.ext}`
                          )
                        }
                      >
                        Download
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {modalOpen && (
        <div className="dashboard-modal-overlay" onClick={closeModal}>
          <div
            className="dashboard-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dashboard-modal-header">
              <div className="dashboard-modal-title">
                {modalContent.title}
              </div>
              <button
                className="dashboard-modal-close"
                onClick={closeModal}
              >
                Close
              </button>
            </div>

            {modalLoading ? (
              <div style={{ padding: 12 }}>Loading…</div>
            ) : (
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  margin: 0,
                  fontFamily: "inherit",
                  fontSize: 14,
                }}
              >
                {modalContent.body || "No additional content available."}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
6