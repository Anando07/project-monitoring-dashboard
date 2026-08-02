import React, { useState, useEffect, useMemo } from "react";
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
    <div className={`card shadow-sm mb-4 ${className}`}>
      {(title || action) && (
        <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h3 className="h5 mb-0">{title}</h3>
          {action && <div className="card-action">{action}</div>}
        </div>
      )}
      <div className="card-body">{children}</div>
    </div>
  );
}

const PRIORITIES = ["High", "Medium", "Low"];
const STATUS_OPTIONS = ["Approved", "Unapproved", "Processing"];
const PAGE_SIZE = 10;
const MAX_IMAGE_BYTES = 1 * 1024 * 1024; // 1 MB per image

const priorityPillClass = (priority) =>
  priority === "High"
    ? "bg-danger-subtle text-danger-emphasis"
    : priority === "Medium"
    ? "bg-warning-subtle text-warning-emphasis"
    : "bg-success-subtle text-success-emphasis";

const statusPillClass = (status) =>
  status === "Approved"
    ? "bg-success-subtle text-success-emphasis"
    : status === "Processing"
    ? "bg-warning-subtle text-warning-emphasis"
    : "bg-danger-subtle text-danger-emphasis";

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
  ministry: "",
  directorate: "",
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
  { id: 1, name: "Padma Bridge Project", ministry: "Ministry of Road Transport and Bridges", directorate: "Bridges Division", startDate: "2023-01-01", endDate: "2026-06-30", totalBudget: "৳ 100.00 Cr", priority: "High", status: "Approved", images: [] },
  { id: 2, name: "ICT Infrastructure Project", ministry: "Ministry of Posts, Telecommunications and Information Technology", directorate: "ICT Division", startDate: "2022-09-10", endDate: "2026-05-25", totalBudget: "৳ 35.00 Cr", priority: "Medium", status: "Processing", images: [] },
  { id: 3, name: "Dhaka Mass Transit (MRT) Extension", ministry: "Ministry of Road Transport and Bridges", directorate: "Dhaka Mass Transit Company", startDate: "2021-03-15", endDate: "2027-12-31", totalBudget: "৳ 117.00 Cr", priority: "High", status: "Approved", images: [] },
  { id: 4, name: "Rural Electrification Phase II", ministry: "Ministry of Power, Energy and Mineral Resources", directorate: "Rural Electrification Board", startDate: "2022-01-10", endDate: "2025-12-20", totalBudget: "৳ 28.50 Cr", priority: "Medium", status: "Approved", images: [] },
  { id: 5, name: "Coastal Embankment Improvement", ministry: "Ministry of Water Resources", directorate: "Bangladesh Water Development Board", startDate: "2023-05-01", endDate: "2026-04-30", totalBudget: "৳ 42.00 Cr", priority: "High", status: "Processing", images: [] },
  { id: 6, name: "Digital Land Survey Project", ministry: "Ministry of Land", directorate: "Land Reforms Board", startDate: "2022-11-15", endDate: "2025-08-31", totalBudget: "৳ 19.75 Cr", priority: "Low", status: "Unapproved", images: [] },
  { id: 7, name: "Primary Healthcare Modernization", ministry: "Ministry of Health and Family Welfare", directorate: "Directorate General of Health Services", startDate: "2023-02-20", endDate: "2026-02-19", totalBudget: "৳ 31.20 Cr", priority: "Medium", status: "Approved", images: [] },
  { id: 8, name: "Urban Water Supply Upgrade", ministry: "Ministry of Local Government, Rural Development and Cooperatives", directorate: "Dhaka WASA", startDate: "2021-07-01", endDate: "2025-06-30", totalBudget: "৳ 58.40 Cr", priority: "High", status: "Processing", images: [] },
  { id: 9, name: "Skills Development Training Center", ministry: "Ministry of Education", directorate: "Directorate of Technical Education", startDate: "2023-09-01", endDate: "2026-08-31", totalBudget: "৳ 12.90 Cr", priority: "Low", status: "Approved", images: [] },
  { id: 10, name: "River Dredging Program", ministry: "Ministry of Shipping", directorate: "Bangladesh Inland Water Transport Authority", startDate: "2022-04-12", endDate: "2025-10-15", totalBudget: "৳ 46.60 Cr", priority: "Medium", status: "Unapproved", images: [] },
  { id: 11, name: "Agricultural Research Institute Upgrade", ministry: "Ministry of Agriculture", directorate: "Bangladesh Agricultural Research Institute", startDate: "2023-03-01", endDate: "2026-02-28", totalBudget: "৳ 22.10 Cr", priority: "Low", status: "Approved", images: [] },
  { id: 12, name: "National Highway Widening Project", ministry: "Ministry of Road Transport and Bridges", directorate: "Roads and Highways Department", startDate: "2021-01-01", endDate: "2027-01-01", totalBudget: "৳ 89.00 Cr", priority: "High", status: "Processing", images: [] },
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
      ministry: form.ministry.trim(),
      directorate: form.directorate.trim(),
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
      ministry: project.ministry || "",
      directorate: project.directorate || "",
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
  const filteredProjects = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return projects;
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        (p.ministry || "").toLowerCase().includes(term) ||
        (p.directorate || "").toLowerCase().includes(term)
    );
  }, [projects, searchTerm]);

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
    <div className="container-fluid py-3">
      {/* ---------------- Create / Edit project form ---------------- */}
      <Card
        className="no-print"
        title={editingId ? "Edit Project" : "Create Project"}
        action={<FolderPlus size={18} />}
      >
        <form onSubmit={handleSubmit} noValidate>
          {/* Row 1: name, ministry, directorate */}
          <div className="row g-3">
            <div className="col-12 col-md-4">
              <label htmlFor="name" className="form-label">Project Name</label>
              <input
                id="name"
                type="text"
                placeholder="e.g. Padma Bridge Project"
                value={form.name}
                onChange={handleChange("name")}
                className={`form-control ${errors.name ? "is-invalid" : ""}`}
              />
              {errors.name && <div className="invalid-feedback">{errors.name}</div>}
            </div>

            <div className="col-12 col-md-4">
              <label htmlFor="ministry" className="form-label">Ministry</label>
              <input
                id="ministry"
                type="text"
                placeholder="e.g. Ministry of Road Transport and Bridges"
                value={form.ministry}
                onChange={handleChange("ministry")}
                className="form-control"
              />
            </div>

            <div className="col-12 col-md-4">
              <label htmlFor="directorate" className="form-label">Directorate</label>
              <input
                id="directorate"
                type="text"
                placeholder="e.g. Roads and Highways Department"
                value={form.directorate}
                onChange={handleChange("directorate")}
                className="form-control"
              />
            </div>
          </div>

          {/* Row 2: dates, budget, priority, status */}
          <div className="row g-3 mt-1">
            <div className="col-12 col-md-4">
              <label htmlFor="startDate" className="form-label">Start Date</label>
              <input
                id="startDate"
                type="date"
                value={form.startDate}
                onChange={handleChange("startDate")}
                className={`form-control ${errors.startDate ? "is-invalid" : ""}`}
              />
              {errors.startDate && <div className="invalid-feedback">{errors.startDate}</div>}
            </div>

            <div className="col-12 col-md-4">
              <label htmlFor="endDate" className="form-label">End Date</label>
              <input
                id="endDate"
                type="date"
                value={form.endDate}
                onChange={handleChange("endDate")}
                className={`form-control ${errors.endDate ? "is-invalid" : ""}`}
              />
              {errors.endDate && <div className="invalid-feedback">{errors.endDate}</div>}
            </div>

            <div className="col-12 col-md-4">
              <label htmlFor="totalBudget" className="form-label">Total Budget (Cr)</label>
              <input
                id="totalBudget"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.totalBudget}
                onChange={handleChange("totalBudget")}
                className={`form-control ${errors.totalBudget ? "is-invalid" : ""}`}
              />
              {errors.totalBudget && <div className="invalid-feedback">{errors.totalBudget}</div>}
            </div>

            <div className="col-12 col-md-6">
              <label htmlFor="priority" className="form-label">Priority</label>
              <select id="priority" value={form.priority} onChange={handleChange("priority")} className="form-select">
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-6">
              <label htmlFor="status" className="form-label">Status</label>
              <select id="status" value={form.status} onChange={handleChange("status")} className="form-select">
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Images: own full-width row */}
          <div className="mt-3">
            <label htmlFor="projectImages" className="form-label">
              <ImageIcon size={14} className="me-1" />
              Images <span className="text-muted small">(max 1 MB each)</span>
            </label>
            <input
              id="projectImages"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImagesChange}
              className="form-control"
            />
            {errors.images && <div className="text-danger small mt-1">{errors.images}</div>}

            {form.images.length > 0 && (
              <div className="d-flex flex-wrap gap-2 mt-2">
                {form.images.map((src, idx) => (
                  <div key={idx} className="position-relative" style={{ width: 72, height: 72 }}>
                    <img
                      src={src}
                      alt={`Preview ${idx + 1}`}
                      className="w-100 h-100 rounded border"
                      style={{ objectFit: "cover" }}
                    />
                    <button
                      type="button"
                      className="btn btn-sm btn-danger rounded-circle position-absolute top-0 end-0 p-0 d-flex align-items-center justify-content-center"
                      style={{ width: 20, height: 20, transform: "translate(30%, -30%)" }}
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

          <div className="d-flex align-items-center justify-content-end gap-2 mt-3">
            {editingId && (
              <span className="badge text-bg-info me-auto">
                Editing: {form.name || "untitled project"}
              </span>
            )}
            <button type="button" className="btn btn-outline-secondary" onClick={handleReset}>
              {editingId ? "Cancel" : "Reset"}
            </button>
            <button type="submit" className="btn btn-primary d-inline-flex align-items-center gap-1">
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
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <div className="input-group input-group-sm" style={{ minWidth: 220 }}>
              <span className="input-group-text"><Search size={14} /></span>
              <input
                type="text"
                className="form-control"
                placeholder="Search name, ministry, directorate..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <button type="button" className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1" onClick={handlePrint}>
              <Printer size={16} />
              Print
            </button>
          </div>
        }
      >
        {filteredProjects.length === 0 ? (
          <div className="text-center text-muted py-5">
            <FolderPlus size={28} className="mb-2" />
            <p className="mb-0">
              {projects.length === 0
                ? "No projects yet. Add one using the form above."
                : "No projects match your search."}
            </p>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Photo</th>
                    <th>Project Name</th>
                    <th>Ministry</th>
                    <th>Directorate</th>
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
                          <img
                            src={project.images[0]}
                            alt={project.name}
                            className="rounded border"
                            style={{ width: 40, height: 40, objectFit: "cover" }}
                          />
                        ) : (
                          <div
                            className="d-flex align-items-center justify-content-center rounded border bg-light text-muted"
                            style={{ width: 40, height: 40 }}
                          >
                            <ImageIcon size={18} />
                          </div>
                        )}
                      </td>
                      <td className="fw-semibold">{project.name}</td>
                      <td>{project.ministry || <span className="text-muted">—</span>}</td>
                      <td>{project.directorate || <span className="text-muted">—</span>}</td>
                      <td>{formatDate(project.startDate)}</td>
                      <td>{formatDate(project.endDate)}</td>
                      <td>{calcDuration(project.startDate, project.endDate)}</td>
                      <td>{project.totalBudget}</td>
                      <td>
                        <span className={`badge rounded-pill ${priorityPillClass(project.priority)}`}>
                          {project.priority}
                        </span>
                      </td>
                      <td>
                        <span className={`badge rounded-pill ${statusPillClass(project.status)}`}>
                          {project.status}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => setViewProject(project)}
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEdit(project)}
                            title="Edit Project"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(project.id)}
                            title="Delete Project"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* -------- Pagination: 10 rows per page -------- */}
            {totalPages > 1 && (
              <nav className="d-flex align-items-center justify-content-center gap-3 mt-2">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="small text-muted">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  <ChevronRight size={16} />
                </button>
              </nav>
            )}
          </>
        )}
      </Card>

      {/* ---------------- Print-only table: every project, no pagination ---------------- */}
      <div className="print-table-wrapper d-none d-print-block">
        <h2>All Projects</h2>
        <p className="text-muted">
          Generated {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
          {" · "}
          {filteredProjects.length} project{filteredProjects.length !== 1 ? "s" : ""}
        </p>
        <table className="table table-bordered table-sm">
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Ministry</th>
              <th>Directorate</th>
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
                <td>{project.ministry}</td>
                <td>{project.directorate}</td>
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
        <div
          className="modal d-block no-print"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => setViewProject(null)}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{viewProject.name}</h5>
                <button type="button" className="btn-close" onClick={() => setViewProject(null)} />
              </div>

              <div className="modal-body">
                {viewProject.images && viewProject.images.length > 0 && (
                  <div className="mb-3">
                    <h6>Images</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {viewProject.images.map((src, idx) => (
                        <img
                          key={idx}
                          src={src}
                          alt={`${viewProject.name} ${idx + 1}`}
                          className="rounded border"
                          style={{ width: 90, height: 90, objectFit: "cover" }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <h6>Project Information</h6>
                <div className="row g-3">
                  <div className="col-6 col-md-4">
                    <div className="text-muted small">Ministry</div>
                    <div>{viewProject.ministry || "—"}</div>
                  </div>
                  <div className="col-6 col-md-4">
                    <div className="text-muted small">Directorate</div>
                    <div>{viewProject.directorate || "—"}</div>
                  </div>
                  <div className="col-6 col-md-4">
                    <div className="text-muted small">Total Budget</div>
                    <div>{viewProject.totalBudget}</div>
                  </div>
                  <div className="col-6 col-md-4">
                    <div className="text-muted small">Start Date</div>
                    <div>{formatDate(viewProject.startDate)}</div>
                  </div>
                  <div className="col-6 col-md-4">
                    <div className="text-muted small">End Date</div>
                    <div>{formatDate(viewProject.endDate)}</div>
                  </div>
                  <div className="col-6 col-md-4">
                    <div className="text-muted small">Duration</div>
                    <div>{calcDuration(viewProject.startDate, viewProject.endDate)}</div>
                  </div>
                  <div className="col-6 col-md-4">
                    <div className="text-muted small">Priority</div>
                    <span className={`badge rounded-pill ${priorityPillClass(viewProject.priority)}`}>
                      {viewProject.priority}
                    </span>
                  </div>
                  <div className="col-6 col-md-4">
                    <div className="text-muted small">Status</div>
                    <span className={`badge rounded-pill ${statusPillClass(viewProject.status)}`}>
                      {viewProject.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setViewProject(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Projects;
