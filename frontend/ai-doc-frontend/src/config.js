// src/config.js

// For versioned API (presentations, documents, etc.)
export const BASE_URL = "https://ai-doc-backend-hecs.onrender.com/api/v1";

// For auth endpoints which are at root (no /api/v1)
export const AUTH_BASE_URL = "https://ai-doc-backend-hecs.onrender.com";

export const PPT_THEMES = {
  "Bright Orange Modern": {
    theme_id: "ppt1",
    thumb: "/themes/img1.png",
    preview: "/themes/img1.png",
  },
  // ... rest unchanged
};
