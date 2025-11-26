// src/components/word/WordSectionEditor.jsx
import React, { useState } from "react";

function WordSectionEditor({ section, onRefine }) {
  const [prompt, setPrompt] = useState(
    "Make this more concise and formal, around 150 words."
  );

  return (
    <div className="word-section-card">
      {/* Header row */}
      <div className="word-section-header">
        <span className="word-section-badge">Section {section.order_index}</span>
        <span className="word-section-title">{section.title}</span>
      </div>

      {/* Content preview box */}
      <div className="word-section-preview">
        <div className="wsp-title">
          {section.title || "Section Title"}
        </div>
        <div className="wsp-body">
          {section.content || "Generated content will appear here"}
        </div>
      </div>

      {/* Refinement prompt */}
      <label className="word-section-field">
        <span className="word-section-label">Refinement Prompt (optional)</span>
        <textarea
          className="word-section-textarea"
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </label>

      {/* Footer action */}
      <div className="word-section-footer">
        <button
          className="word-refine-btn"
          onClick={() => onRefine(section.id, prompt)}
        >
          💡 Refine Section
        </button>
      </div>
    </div>
  );
}

export default WordSectionEditor;
