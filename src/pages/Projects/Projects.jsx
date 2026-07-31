import React, { useState } from "react";

import "./Projects.css";
import { Plus, Trash2, Eye, X, FolderPlus } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Reused from Dashboard.jsx so the visual language stays identical   */
/* ------------------------------------------------------------------ */

function Card({ title, action, children, className = "" }) {
  return (
    <div className={`dashboard-card ${className}`}>
      {(title || action) && (
        <div className="dashboard-card-header">
          <h3>{title}</h3>
          {action && <div className="card-action">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

const PRIORITIES = ["High", "Medium", "Low"];

const priorityPillClass = (priority) =>
  priority === "High"
    ? "status-pill-red"
    : priority === "Medium"
    ? "status-pill-amber"
    : "status-pill-green";

/* ------------------------------------------------------------------ */
/*  Fund sources are data-driven: to add a new funder (e.g. a new       */
/*  bilateral donor), add one entry here — the form, table, modal,     */
/*  and fund-type label all pick it up automatically.                  */
/* ------------------------------------------------------------------ */
const FUND_SOURCES = [
  { key: "fundGovt", label: "Government Fund", short: "GOV", tag: "Gov" },
  { key: "fundADB", label: "ADB Fund", short: "ADB", tag: "ADB" },
  { key: "fundWB", label: "World Bank Fund", short: "WB", tag: "WB" },
  { key: "fundIMF", label: "IMF Fund", short: "IMF", tag: "IMF" },
  { key: "fundJICA", label: "JICA Fund", short: "JICA", tag: "JICA" },
  { key: "fundCountry", label: "Other Country Fund", short: "COUNTRY", tag: "Country" },
  { key: "fundOthers", label: "Other Fund", short: "OTHERS", tag: "Other" },
];

// Builds the fund-source label from whichever funds are actually present,
// e.g. "GOV+WB", "ADB+IMF+JICA", "N/A". Driven entirely by FUND_SOURCES so
// every funder is represented correctly, not just the original three.
const getFundType = (project) => {
  const parts = FUND_SOURCES.filter((f) => project[f.key]).map((f) => f.short);
  return parts.length ? parts.join("+") : "N/A";
};

// years between two yyyy-mm-dd strings, formatted like "3.5 yr"
const calcDuration = (start, end) => {
  if (!start || !end) return "";
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffYears = (endDate - startDate) / (1000 * 60 * 60 * 24 * 365.25);
  if (isNaN(diffYears) || diffYears < 0) return "";
  return `${diffYears.toFixed(1)} yr`;
};

const formatDate = (isoDate) => {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const EMPTY_FORM = {
  name: "",
  pd: "",
  startDate: "",
  endDate: "",
  ...Object.fromEntries(FUND_SOURCES.map((f) => [f.key, ""])),
  statusPct: 0,
  priority: "Medium",
};

const SEED_PROJECTS = [
  {
    id: 1,
    name: "Padma Bridge Project",
    pd: "Md. Rahman",
    startDate: "2023-01-01",
    endDate: "2026-06-30",
    fundGovt: "৳ 55.00 Cr",
    fundADB: "৳ 25.00 Cr",
    fundWB: "৳ 20.00 Cr",
    fundIMF: "",
    fundJICA: "",
    fundCountry: "",
    fundOthers: "",
    statusPct: 90,
    priority: "High",
  },
  {
    id: 2,
    name: "ICT Infrastructure Project",
    pd: "Shamim Ahmed",
    startDate: "2022-09-10",
    endDate: "2026-05-25",
    fundGovt: "৳ 18.00 Cr",
    fundADB: "৳ 10.00 Cr",
    fundWB: "৳ 7.00 Cr",
    fundIMF: "",
    fundJICA: "",
    fundCountry: "",
    fundOthers: "",
    statusPct: 60,
    priority: "Medium",
  },
  {
    id: 3,
    name: "Dhaka Mass Transit (MRT) Extension",
    pd: "Nasrin Sultana",
    startDate: "2021-03-15",
    endDate: "2027-12-31",
    fundGovt: "৳ 40.00 Cr",
    fundADB: "",
    fundWB: "",
    fundIMF: "৳ 12.00 Cr",
    fundJICA: "৳ 65.00 Cr",
    fundCountry: "",
    fundOthers: "",
    statusPct: 45,
    priority: "High",
  },
];

function Projects() {
  const [projects, setProjects] = useState(SEED_PROJECTS);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [viewProject, setViewProject] = useState(null);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Project name is required";
    if (!form.pd.trim()) next.pd = "Project director is required";
    if (!form.startDate) next.startDate = "Start date is required";
    if (!form.endDate) next.endDate = "End date is required";
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      next.endDate = "End date must be after start date";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const newProject = {
      id: Date.now(),
      name: form.name.trim(),
      pd: form.pd.trim(),
      startDate: form.startDate,
      endDate: form.endDate,
      ...Object.fromEntries(
        FUND_SOURCES.map((f) => [f.key, form[f.key] ? `৳ ${form[f.key]} Cr` : ""])
      ),
      statusPct: Number(form.statusPct) || 0,
      priority: form.priority,
    };

    setProjects((prev) => [newProject, ...prev]);
    setForm(EMPTY_FORM);
  };

  const handleReset = () => {
    setForm(EMPTY_FORM);
    setErrors({});
  };

  const handleDelete = (id) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="dashboard-page">
      {/* ---------------- Create project form ---------------- */}
      <Card title="Create Project" action={<FolderPlus size={18} className="card-action-icon" />}>
        <form className="project-form" onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Project Name</label>
              <input
                id="name"
                type="text"
                placeholder="e.g. Padma Bridge Project"
                value={form.name}
                onChange={handleChange("name")}
                className={errors.name ? "input-error" : ""}
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="pd">Project Director (PD)</label>
              <input
                id="pd"
                type="text"
                placeholder="e.g. Md. Rahman"
                value={form.pd}
                onChange={handleChange("pd")}
                className={errors.pd ? "input-error" : ""}
              />
              {errors.pd && <span className="field-error">{errors.pd}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="startDate">Start Date</label>
              <input
                id="startDate"
                type="date"
                value={form.startDate}
                onChange={handleChange("startDate")}
                className={errors.startDate ? "input-error" : ""}
              />
              {errors.startDate && <span className="field-error">{errors.startDate}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="endDate">End Date</label>
              <input
                id="endDate"
                type="date"
                value={form.endDate}
                onChange={handleChange("endDate")}
                className={errors.endDate ? "input-error" : ""}
              />
              {errors.endDate && <span className="field-error">{errors.endDate}</span>}
            </div>

            {/* Fund source inputs, generated from FUND_SOURCES */}
            {FUND_SOURCES.map((f) => (
              <div className="form-group" key={f.key}>
                <label htmlFor={f.key}>{f.label} (Cr)</label>
                <input
                  id={f.key}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={form[f.key]}
                  onChange={handleChange(f.key)}
                />
              </div>
            ))}

            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select id="priority" value={form.priority} onChange={handleChange("priority")}>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group form-group-wide">
              <label htmlFor="statusPct">
                Status <span className="range-value">{form.statusPct}%</span>
              </label>
              <input
                id="statusPct"
                type="range"
                min="0"
                max="100"
                step="5"
                value={form.statusPct}
                onChange={handleChange("statusPct")}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="button-secondary" onClick={handleReset}>
              Reset
            </button>
            <button type="submit" className="button-primary">
              <Plus size={16} />
              Add Project
            </button>
          </div>
        </form>
      </Card>

      {/* ---------------- Project list ---------------- */}
      <Card title={`Projects (${projects.length})`}>
        {projects.length === 0 ? (
          <div className="empty-state">
            <FolderPlus size={28} />
            <p>No projects yet. Add one using the form above.</p>
          </div>
        ) : (
          <div className="table-overflow">
            <table className="projects-table">
              <thead>
                <tr>
                  <th>Project / PD</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Duration</th>
                  <th>Fund</th>
                  <th>Status (%)</th>
                  <th>Priority</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id}>
                    <td className="project-info-cell">
                      <div className="project-name">{project.name}</div>
                      <div className="project-pd">PD: {project.pd}</div>
                    </td>
                    <td>{formatDate(project.startDate)}</td>
                    <td>{formatDate(project.endDate)}</td>
                    <td>{calcDuration(project.startDate, project.endDate)}</td>
                    <td className="project-fund-cell">
                      <div className="fund-label">{getFundType(project)}</div>
                      <div className="fund-details">
                        {FUND_SOURCES.map(
                          (f) =>
                            project[f.key] && (
                              <span key={f.key}>
                                {f.tag}: {project[f.key]}
                              </span>
                            )
                        )}
                      </div>
                    </td>
                    <td>{project.statusPct}%</td>
                    <td>
                      <span className={`status-pill ${priorityPillClass(project.priority)}`}>
                        {project.priority}
                      </span>
                    </td>
                    <td className="table-action-cell">
                      <button
                        className="action-button"
                        onClick={() => setViewProject(project)}
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="action-button action-button-danger"
                        onClick={() => handleDelete(project.id)}
                        title="Delete Project"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ---------------- View modal (same pattern as Dashboard) ---------------- */}
      {viewProject && (
        <div className="modal-overlay" onClick={() => setViewProject(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{viewProject.name}</h2>
              <button className="modal-close" onClick={() => setViewProject(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-section">
                <h3>Project Information</h3>
                <div className="modal-grid">
                  <div className="modal-item">
                    <label>Project Director (PD)</label>
                    <p>{viewProject.pd}</p>
                  </div>
                  <div className="modal-item">
                    <label>Start Date</label>
                    <p>{formatDate(viewProject.startDate)}</p>
                  </div>
                  <div className="modal-item">
                    <label>End Date</label>
                    <p>{formatDate(viewProject.endDate)}</p>
                  </div>
                  <div className="modal-item">
                    <label>Duration</label>
                    <p>{calcDuration(viewProject.startDate, viewProject.endDate)}</p>
                  </div>
                  <div className="modal-item">
                    <label>Priority</label>
                    <p>
                      <span className={`status-pill ${priorityPillClass(viewProject.priority)}`}>
                        {viewProject.priority}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <h3>Funding Information</h3>
                <div className="modal-grid">
                  {FUND_SOURCES.map((f) => (
                    <div className="modal-item" key={f.key}>
                      <label>{f.label}</label>
                      <p>{viewProject[f.key] || "N/A"}</p>
                    </div>
                  ))}
                  <div className="modal-item">
                    <label>Fund Source</label>
                    <p>{getFundType(viewProject)}</p>
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <h3>Project Status</h3>
                <div className="modal-grid">
                  <div className="modal-item full-width">
                    <label>Progress</label>
                    <div className="progress-track" style={{ height: "8px", marginTop: "8px" }}>
                      <div
                        className="progress-fill"
                        style={{
                          width: `${viewProject.statusPct}%`,
                          backgroundColor:
                            viewProject.statusPct >= 75
                              ? "#22c55e"
                              : viewProject.statusPct >= 50
                              ? "#3b82f6"
                              : viewProject.statusPct >= 25
                              ? "#f59e0b"
                              : "#ef4444",
                        }}
                      />
                    </div>
                    <p style={{ marginTop: "8px", fontSize: "14px", fontWeight: "600" }}>
                      {viewProject.statusPct}% Complete
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="button-secondary" onClick={() => setViewProject(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Projects;
