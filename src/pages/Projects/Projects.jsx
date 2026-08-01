import React, { useState, useEffect, useMemo } from "react";
import "./Projects.css";
import {
  Plus,
  Trash2,
  Eye,
  Pencil,
  X,
  FolderPlus,
  Search,
  Printer,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

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
const STATUS_OPTIONS = ["Approved", "Unapproved", "Processing"];
const PAGE_SIZE = 10;
const MAX_IMAGE_BYTES = 1 * 1024 * 1024; // 1 MB per image

const priorityPillClass = (priority) =>
  priority === "High"
    ? "status-pill-red"
    : priority === "Medium"
    ? "status-pill-amber"
    : "status-pill-green";

const statusPillClass = (status) =>
  status === "Approved"
    ? "status-pill-green"
    : status === "Processing"
    ? "status-pill-amber"
    : "status-pill-red";

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

// Pulls the raw number back out of a formatted string like "৳ 100.00 Cr"
// so an existing project's budget can be dropped back into the number input.
const parseBudgetNumber = (formatted) => {
  if (!formatted) return "";
  const match = String(formatted).match(/[\d.]+/);
  return match ? match[0] : "";
};

const EMPTY_FORM = {
  name: "",
  startDate: "",
  endDate: "",
  totalBudget: "",
  priority: "Medium",
  status: "Approved",
  images: [],
};

// 12 seed rows so pagination (10/page) is visible without having to add
// projects manually — page 1 shows 10, page 2 shows the remaining 2.
const SEED_PROJECTS = [
  { id: 1, name: "Padma Bridge Project", startDate: "2023-01-01", endDate: "2026-06-30", totalBudget: "৳ 100.00 Cr", priority: "High", status: "Approved", images: [] },
  { id: 2, name: "ICT Infrastructure Project", startDate: "2022-09-10", endDate: "2026-05-25", totalBudget: "৳ 35.00 Cr", priority: "Medium", status: "Processing", images: [] },
  { id: 3, name: "Dhaka Mass Transit (MRT) Extension", startDate: "2021-03-15", endDate: "2027-12-31", totalBudget: "৳ 117.00 Cr", priority: "High", status: "Approved", images: [] },
  { id: 4, name: "Rural Electrification Phase II", startDate: "2022-01-10", endDate: "2025-12-20", totalBudget: "৳ 28.50 Cr", priority: "Medium", status: "Approved", images: [] },
  { id: 5, name: "Coastal Embankment Improvement", startDate: "2023-05-01", endDate: "2026-04-30", totalBudget: "৳ 42.00 Cr", priority: "High", status: "Processing", images: [] },
  { id: 6, name: "Digital Land Survey Project", startDate: "2022-11-15", endDate: "2025-08-31", totalBudget: "৳ 19.75 Cr", priority: "Low", status: "Unapproved", images: [] },
  { id: 7, name: "Primary Healthcare Modernization", startDate: "2023-02-20", endDate: "2026-02-19", totalBudget: "৳ 31.20 Cr", priority: "Medium", status: "Approved", images: [] },
  { id: 8, name: "Urban Water Supply Upgrade", startDate: "2021-07-01", endDate: "2025-06-30", totalBudget: "৳ 58.40 Cr", priority: "High", status: "Processing", images: [] },
  { id: 9, name: "Skills Development Training Center", startDate: "2023-09-01", endDate: "2026-08-31", totalBudget: "৳ 12.90 Cr", priority: "Low", status: "Approved", images: [] },
  { id: 10, name: "River Dredging Program", startDate: "2022-04-12", endDate: "2025-10-15", totalBudget: "৳ 46.60 Cr", priority: "Medium", status: "Unapproved", images: [] },
  { id: 11, name: "Agricultural Research Institute Upgrade", startDate: "2023-03-01", endDate: "2026-02-28", totalBudget: "৳ 22.10 Cr", priority: "Low", status: "Approved", images: [] },
  { id: 12, name: "National Highway Widening Project", startDate: "2021-01-01", endDate: "2027-01-01", totalBudget: "৳ 89.00 Cr", priority: "High", status: "Processing", images: [] },
];

function Projects() {
  const [projects, setProjects] = useState(SEED_PROJECTS);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [viewProject, setViewProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState(null);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const oversized = files.filter((f) => f.size > MAX_IMAGE_BYTES);
    const valid = files.filter(
      (f) => f.type.startsWith("image/") && f.size <= MAX_IMAGE_BYTES
    );

    if (oversized.length > 0) {
      setErrors((prev) => ({
        ...prev,
        images: `${oversized.length} image${oversized.length > 1 ? "s" : ""} skipped — 1 MB max per image.`,
      }));
    } else if (errors.images) {
      setErrors((prev) => ({ ...prev, images: null }));
    }

    valid.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setForm((prev) => ({ ...prev, images: [...prev.images, reader.result] }));
      };
      reader.readAsDataURL(file);
    });

    // allow re-selecting the same file(s) later
    e.target.value = "";
  };

  const removeImage = (index) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Project name is required";
    if (!form.startDate) next.startDate = "Start date is required";
    if (!form.endDate) next.endDate = "End date is required";
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      next.endDate = "End date must be after start date";
    }
    if (!form.totalBudget || Number(form.totalBudget) <= 0) {
      next.totalBudget = "Total budget is required";
    }
    setErrors((prev) => ({ ...next, images: prev.images }));
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const projectData = {
      name: form.name.trim(),
      startDate: form.startDate,
      endDate: form.endDate,
      totalBudget: `৳ ${Number(form.totalBudget).toFixed(2)} Cr`,
      priority: form.priority,
      status: form.status,
      images: form.images,
    };

    if (editingId) {
      setProjects((prev) =>
        prev.map((p) => (p.id === editingId ? { ...p, ...projectData } : p))
      );
    } else {
      setProjects((prev) => [{ id: Date.now(), ...projectData }, ...prev]);
      setCurrentPage(1);
    }

    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const handleReset = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setEditingId(null);
  };

  const handleEdit = (project) => {
    setForm({
      name: project.name,
      startDate: project.startDate,
      endDate: project.endDate,
      totalBudget: parseBudgetNumber(project.totalBudget),
      priority: project.priority,
      status: project.status,
      images: project.images || [],
    });
    setEditingId(project.id);
    setErrors({});
  };

  const handleDelete = (id) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (editingId === id) handleReset();
  };

  const handlePrint = () => {
    window.print();
  };

  /* -------- Search + pagination -------- */
  const filteredProjects = useMemo(
    () => projects.filter((p) => p.name.toLowerCase().includes(searchTerm.trim().toLowerCase())),
    [projects, searchTerm]
  );

  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / PAGE_SIZE));

  // keep the current page in range whenever the underlying data or filter shrinks it
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const pageProjects = filteredProjects.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="dashboard-page">
      {/* ---------------- Create / Edit project form ---------------- */}
      <Card
        className="no-print"
        title={editingId ? "Edit Project" : "Create Project"}
        action={<FolderPlus size={18} className="card-action-icon" />}
      >
        <form className="project-form" onSubmit={handleSubmit} noValidate>
          {/* 3 fields x 2 rows */}
          <div className="form-grid form-grid-3">
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

            <div className="form-group">
              <label htmlFor="totalBudget">Total Budget (Cr)</label>
              <input
                id="totalBudget"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.totalBudget}
                onChange={handleChange("totalBudget")}
                className={errors.totalBudget ? "input-error" : ""}
              />
              {errors.totalBudget && <span className="field-error">{errors.totalBudget}</span>}
            </div>

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

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select id="status" value={form.status} onChange={handleChange("status")}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Images: own full-width row, separate from the 3x2 grid */}
          <div className="form-group form-group-wide image-upload-group">
            <label htmlFor="projectImages">
              <ImageIcon size={14} className="label-icon" />
              Images <span className="label-hint">(max 1 MB each)</span>
            </label>
            <input
              id="projectImages"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImagesChange}
            />
            {errors.images && <span className="field-error">{errors.images}</span>}

            {form.images.length > 0 && (
              <div className="image-preview-list">
                {form.images.map((src, idx) => (
                  <div key={idx} className="image-preview-item">
                    <img src={src} alt={`Preview ${idx + 1}`} />
                    <button
                      type="button"
                      className="image-preview-remove"
                      onClick={() => removeImage(idx)}
                      title="Remove image"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-actions">
            {editingId && (
              <span className="editing-badge">Editing: {form.name || "untitled project"}</span>
            )}
            <button type="button" className="button-secondary" onClick={handleReset}>
              {editingId ? "Cancel" : "Reset"}
            </button>
            <button type="submit" className="button-primary">
              {editingId ? <Pencil size={16} /> : <Plus size={16} />}
              {editingId ? "Save Changes" : "Add Project"}
            </button>
          </div>
        </form>
      </Card>

      {/* ---------------- Project list ---------------- */}
      <Card
        className="no-print"
        title={`Projects (${filteredProjects.length})`}
        action={
          <div className="header-actions">
            <div className="search-box">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search by project name..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <button type="button" className="button-secondary print-btn" onClick={handlePrint}>
              <Printer size={16} />
              Print
            </button>
          </div>
        }
      >
        {filteredProjects.length === 0 ? (
          <div className="empty-state">
            <FolderPlus size={28} />
            <p>
              {projects.length === 0
                ? "No projects yet. Add one using the form above."
                : "No projects match your search."}
            </p>
          </div>
        ) : (
          <>
            <div className="table-overflow">
              <table className="projects-table">
                <thead>
                  <tr>
                    <th>Photo</th>
                    <th>Project Name</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Duration</th>
                    <th>Total Budget</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pageProjects.map((project) => (
                    <tr key={project.id}>
                      <td>
                        {project.images && project.images.length > 0 ? (
                          <img className="table-photo" src={project.images[0]} alt={project.name} />
                        ) : (
                          <div className="table-photo-placeholder">
                            <ImageIcon size={18} />
                          </div>
                        )}
                      </td>
                      <td className="project-info-cell">
                        <div className="project-name">{project.name}</div>
                      </td>
                      <td>{formatDate(project.startDate)}</td>
                      <td>{formatDate(project.endDate)}</td>
                      <td>{calcDuration(project.startDate, project.endDate)}</td>
                      <td>{project.totalBudget}</td>
                      <td>
                        <span className={`status-pill ${priorityPillClass(project.priority)}`}>
                          {project.priority}
                        </span>
                      </td>
                      <td>
                        <span className={`status-pill ${statusPillClass(project.status)}`}>
                          {project.status}
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
                          className="action-button action-button-edit"
                          onClick={() => handleEdit(project)}
                          title="Edit Project"
                        >
                          <Pencil size={16} />
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

            {/* -------- Pagination: 10 rows per page -------- */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  type="button"
                  className="pagination-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="pagination-info">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  className="pagination-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </Card>

      {/* ---------------- Print-only table: every project, no pagination ---------------- */}
      <div className="print-table-wrapper">
        <h2 className="print-title">All Projects</h2>
        <p className="print-subtitle">
          Generated {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
          {" · "}
          {filteredProjects.length} project{filteredProjects.length !== 1 ? "s" : ""}
        </p>
        <table className="projects-table print-table">
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Duration</th>
              <th>Total Budget</th>
              <th>Priority</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.map((project) => (
              <tr key={project.id}>
                <td>{project.name}</td>
                <td>{formatDate(project.startDate)}</td>
                <td>{formatDate(project.endDate)}</td>
                <td>{calcDuration(project.startDate, project.endDate)}</td>
                <td>{project.totalBudget}</td>
                <td>{project.priority}</td>
                <td>{project.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---------------- View modal ---------------- */}
      {viewProject && (
        <div className="modal-overlay no-print" onClick={() => setViewProject(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{viewProject.name}</h2>
              <button className="modal-close" onClick={() => setViewProject(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {viewProject.images && viewProject.images.length > 0 && (
                <div className="modal-section">
                  <h3>Images</h3>
                  <div className="image-preview-list">
                    {viewProject.images.map((src, idx) => (
                      <div key={idx} className="image-preview-item image-preview-item-static">
                        <img src={src} alt={`${viewProject.name} ${idx + 1}`} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="modal-section">
                <h3>Project Information</h3>
                <div className="modal-grid">
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
                    <label>Total Budget</label>
                    <p>{viewProject.totalBudget}</p>
                  </div>
                  <div className="modal-item">
                    <label>Priority</label>
                    <p>
                      <span className={`status-pill ${priorityPillClass(viewProject.priority)}`}>
                        {viewProject.priority}
                      </span>
                    </p>
                  </div>
                  <div className="modal-item">
                    <label>Status</label>
                    <p>
                      <span className={`status-pill ${statusPillClass(viewProject.status)}`}>
                        {viewProject.status}
                      </span>
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
