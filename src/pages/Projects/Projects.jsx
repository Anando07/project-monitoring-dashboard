import React, { useState, useEffect, useMemo } from "react";
import {
  FolderPlus,
  Building2,
  Landmark,
  Search,
  Printer,
  Trash2,
  Edit2,
  Eye,
  AlertCircle,
  RotateCcw,
  Loader,
  PlusCircle,
  Image as ImageIcon,
  X,
  Calendar,
  DollarSign
} from "lucide-react";
import {
  getAllProjects,
  createProject,
  updateProject,
  deleteProject,
  getAllMinistries,
  getDirectoratesByMinistry,
  getAllDirectorates
} from "../../services/ProjectService";

const PRIORITIES = ["High", "Medium", "Low"];
const STATUS_OPTIONS = ["Approved", "Unapproved"];
const MAX_IMAGE_BYTES = 1 * 1024 * 1024; // 1 MB

const priorityPillClass = (priority) => {
  const p = (priority || "").toUpperCase();
  if (p === "HIGH") return "bg-danger-subtle text-danger-emphasis border border-danger-subtle px-2 py-1";
  if (p === "MEDIUM") return "bg-warning-subtle text-warning-emphasis border border-warning-subtle px-2 py-1";
  return "bg-success-subtle text-success-emphasis border border-success-subtle px-2 py-1";
};

const statusPillClass = (status) => {
  const s = (status || "").toUpperCase();
  if (s === "APPROVED") return "bg-success-subtle text-success-emphasis border border-success-subtle px-2 py-1";
  if (s === "UNAPPROVED") return "bg-warning-subtle text-warning-emphasis border border-warning-subtle px-2 py-1";
  return "bg-danger-subtle text-danger-emphasis border border-danger-subtle px-2 py-1";
};

const approvedCalcDuration = (start, end) => {
  if (!start || !end) return "";
  const approvedStartDate = new Date(start);
  const approvedEndDate = new Date(end);
  const approvedDiffYears = (approvedEndDate - approvedStartDate) / (1000 * 60 * 60 * 24 * 365.25);
  if (isNaN(approvedDiffYears) || approvedDiffYears < 0) return "";
  return `${approvedDiffYears.toFixed(1)} yr`;
};

const revisedCalcDuration = (start, end) => {
  if (!start || !end) return "";
  const revisedStartDate = new Date(start);
  const revisedEndDate = new Date(end);
  const revisedDiffYears = (revisedEndDate - revisedStartDate) / (1000 * 60 * 60 * 24 * 365.25);
  if (isNaN(revisedDiffYears) || revisedDiffYears < 0) return "";
  return `${revisedDiffYears.toFixed(1)} yr`;
};

const formatDate = (isoDate) => {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const INITIAL_FORM_STATE = {
  projectName: "",
  ministryId: "",
  directorateId: "",
  approvedStartDate: "",
  approvedEndDate: "",
  approvedBudget: "",
  revisedStartDate: "",
  revisedEndDate: "",
  revisedBudget: "",
  priority: "Medium",
  status: "Approved",
  images: []
};

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [ministries, setMinistries] = useState([]);
  const [directorates, setDirectorates] = useState([]);
  const [allDirectoratesMap, setAllDirectoratesMap] = useState({});
  const [ministriesMap, setMinistriesMap] = useState({});

  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [viewProject, setViewProject] = useState(null);

  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [ministryFilter, setMinistryFilter] = useState("");

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const [minRes, dirRes, projRes] = await Promise.all([
        getAllMinistries().catch(() => ({ data: [] })),
        getAllDirectorates().catch(() => ({ data: [] })),
        getAllProjects().catch(() => ({ data: [] }))
      ]);

      const minData = minRes.data || [];
      const dirData = dirRes.data || [];
      const projData = projRes.data || [];

      setMinistries(minData);
      setProjects(projData);

      const minMap = {};
      minData.forEach((m) => (minMap[m.id] = m.minName));
      setMinistriesMap(minMap);

      const dirMap = {};
      dirData.forEach((d) => (dirMap[d.id] = d.dirName));
      setAllDirectoratesMap(dirMap);
    } catch (error) {
      console.error("Failed to load project records:", error);
      setApiError("Unable to fetch project, ministry, or directorate records from server.");
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectsList = async () => {
    try {
      const res = await getAllProjects();
      setProjects(res.data || []);
    } catch (error) {
      console.error("Error refreshing projects:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleMinistryChange = async (e) => {
    const selectedMinistryId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      ministryId: selectedMinistryId,
      directorateId: ""
    }));

    if (errors.ministryId) setErrors((prev) => ({ ...prev, ministryId: null }));

    if (selectedMinistryId) {
      try {
        const res = await getDirectoratesByMinistry(selectedMinistryId);
        setDirectorates(res.data || []);
      } catch (err) {
        console.error("Failed to fetch directorates for ministry:", err);
        setDirectorates([]);
      }
    } else {
      setDirectorates([]);
    }
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const oversized = files.filter((f) => f.size > MAX_IMAGE_BYTES);
    const valid = files.filter((f) => f.type.startsWith("image/") && f.size <= MAX_IMAGE_BYTES);

    if (oversized.length > 0) {
      setErrors((prev) => ({
        ...prev,
        images: `${oversized.length} image(s) skipped — 1 MB max per image.`
      }));
    } else if (errors.images) {
      setErrors((prev) => ({ ...prev, images: null }));
    }

    valid.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({ ...prev, images: [...prev.images, reader.result] }));
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  };

  const removeImage = (index) => {
    setFormData((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM_STATE);
    setEditingId(null);
    setErrors({});
    setDirectorates([]);
  };

  const validateForm = () => {
    const newErrors = {};

    // Required Field Validations
    if (!formData.projectName || !formData.projectName.trim()) {
      newErrors.projectName = "Project name is required.";
    }
    if (!formData.ministryId) {
      newErrors.ministryId = "Select parent ministry.";
    }

    // Approved Dates & Budget (Required)
    if (!formData.approvedStartDate) {
      newErrors.approvedStartDate = "Start date is required.";
    }
    if (!formData.approvedEndDate) {
      newErrors.approvedEndDate = "End date is required.";
    }
    if (
      formData.approvedStartDate &&
      formData.approvedEndDate &&
      formData.approvedEndDate < formData.approvedStartDate
    ) {
      newErrors.approvedEndDate = "End date must be after start date.";
    }
    if (!formData.approvedBudget || Number(formData.approvedBudget) <= 0) {
      newErrors.approvedBudget = "Valid approved budget is required.";
    }

    // Revised Dates (Optional: Validated only if both values exist)
    if (
      formData.revisedStartDate &&
      formData.revisedEndDate &&
      formData.revisedEndDate < formData.revisedStartDate
    ) {
      newErrors.revisedEndDate = "Revised end date must be after revised start date.";
    }

    // Revised Budget (Optional: Validated only if entered)
    if (formData.revisedBudget && Number(formData.revisedBudget) <= 0) {
      newErrors.revisedBudget = "Valid revised budget is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      projectName: formData.projectName.trim(),
      ministryId: Number(formData.ministryId),
      directorateId: formData.directorateId ? Number(formData.directorateId) : null,
      approvedStartDate: formData.approvedStartDate,
      approvedEndDate: formData.approvedEndDate,
      approvedBudget: Number(formData.approvedBudget),
      revisedStartDate: formData.revisedStartDate ? formData.revisedStartDate : null,
      revisedEndDate: formData.revisedEndDate ? formData.revisedEndDate : null,
      revisedBudget: formData.revisedBudget ? Number(formData.revisedBudget) : null,
      priority: formData.priority.toUpperCase(),
      status: formData.status.toUpperCase(),
      images: formData.images
    };

    setSubmitting(true);

    if (editingId) {
      updateProject(editingId, payload)
        .then(() => {
          fetchProjectsList();
          handleReset();
        })
        .catch((err) => {
          console.error("Error updating project:", err);
          const message = err.response?.data?.message || "Failed to update project in database.";
          alert(message);
        })
        .finally(() => setSubmitting(false));
    } else {
      createProject(payload)
        .then(() => {
          fetchProjectsList();
          handleReset();
        })
        .catch((err) => {
          console.error("Error creating project:", err);
          const message = err.response?.data?.message || "Failed to save project to database.";
          alert(message);
        })
        .finally(() => setSubmitting(false));
    }
  };

  const handleEdit = async (project) => {
    setEditingId(project.id);
    setErrors({});

    if (project.ministryId) {
      try {
        const res = await getDirectoratesByMinistry(project.ministryId);
        setDirectorates(res.data || []);
      } catch (err) {
        console.error(err);
      }
    }

    setFormData({
      projectName: project.projectName || "",
      ministryId: String(project.ministryId || ""),
      directorateId: String(project.directorateId || ""),
      approvedStartDate: project.approvedStartDate || "",
      approvedEndDate: project.approvedEndDate || "",
      approvedBudget: project.approvedBudget || "",
      revisedStartDate: project.revisedStartDate || "",
      revisedEndDate: project.revisedEndDate || "",
      revisedBudget: project.revisedBudget || "",
      priority: project.priority
        ? project.priority.charAt(0) + project.priority.slice(1).toLowerCase()
        : "Medium",
      status: project.status
        ? project.status.charAt(0) + project.status.slice(1).toLowerCase()
        : "Approved",
      images: project.images || []
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => {
    if (window.confirm("Remove this project record? This action cannot be undone.")) {
      deleteProject(id)
        .then(() => fetchProjectsList())
        .catch((err) => {
          console.error("Error deleting project:", err);
          alert("Could not delete project record.");
        });
    }
  };

  const filteredProjects = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return projects.filter((p) => {
      const minName = (ministriesMap[p.ministryId] || "").toLowerCase();
      const dirName = (allDirectoratesMap[p.directorateId] || "").toLowerCase();
      const pName = (p.projectName || "").toLowerCase();

      const matchesSearch = pName.includes(query) || minName.includes(query) || dirName.includes(query);
      const matchesMinistry = ministryFilter ? String(p.ministryId) === ministryFilter : true;

      return matchesSearch && matchesMinistry;
    });
  }, [projects, searchTerm, ministryFilter, ministriesMap, allDirectoratesMap]);

  return (
    <div className="container-fluid py-4 bg-light">
      {/* Create / Update Project Form Card */}
      <div className="card shadow-sm mb-4 border-0">
        <div className="card-header bg-white d-flex justify-content-between align-items-center py-3 border-bottom">
          <h5 className="mb-0 text-primary fw-bold">
            {editingId ? "Update Project Record" : "Add New Project"}
          </h5>
          <FolderPlus className="text-primary" size={22} />
        </div>

        <div className="card-body p-4">
          <form onSubmit={handleSubmit} noValidate>
            <div className="row g-3">
              {/* Row 1: Name, Ministry, Directorate */}
              <div className="col-md-4">
                <label className="form-label fw-semibold">
                  Project Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="projectName"
                  placeholder="e.g. Padma Bridge Project"
                  value={formData.projectName}
                  onChange={handleInputChange}
                  className={`form-control ${errors.projectName ? "is-invalid" : ""}`}
                />
                {errors.projectName && <div className="invalid-feedback">{errors.projectName}</div>}
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold">
                  Parent Ministry <span className="text-danger">*</span>
                </label>
                <select
                  name="ministryId"
                  value={formData.ministryId}
                  onChange={handleMinistryChange}
                  className={`form-select ${errors.ministryId ? "is-invalid" : ""}`}
                >
                  <option value="">-- Select Ministry --</option>
                  {ministries.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.minName}
                    </option>
                  ))}
                </select>
                {errors.ministryId && <div className="invalid-feedback">{errors.ministryId}</div>}
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold">
                  Directorate <span className="text-muted fw-normal">(Optional)</span>
                </label>
                <select
                  name="directorateId"
                  value={formData.directorateId}
                  onChange={handleInputChange}
                  disabled={!formData.ministryId}
                  className="form-select"
                >
                  <option value="">
                    {formData.ministryId ? "-- Select Directorate --" : "Select Ministry First"}
                  </option>
                  {directorates.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.dirName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Row 2: Approved Dates & Budget */}
              <div className="col-md-4">
                <label className="form-label fw-semibold">
                  Approved Start Date <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  name="approvedStartDate"
                  value={formData.approvedStartDate}
                  onChange={handleInputChange}
                  className={`form-control ${errors.approvedStartDate ? "is-invalid" : ""}`}
                />
                {errors.approvedStartDate && <div className="invalid-feedback">{errors.approvedStartDate}</div>}
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold">
                  Approved End Date <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  name="approvedEndDate"
                  value={formData.approvedEndDate}
                  onChange={handleInputChange}
                  className={`form-control ${errors.approvedEndDate ? "is-invalid" : ""}`}
                />
                {errors.approvedEndDate && <div className="invalid-feedback">{errors.approvedEndDate}</div>}
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold">
                  Approved Budget (Lakhs of TK) <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="approvedBudget"
                  placeholder="0.00"
                  value={formData.approvedBudget}
                  onChange={handleInputChange}
                  className={`form-control ${errors.approvedBudget ? "is-invalid" : ""}`}
                />
                {errors.approvedBudget && <div className="invalid-feedback">{errors.approvedBudget}</div>}
              </div>

              {/* Row 3: Revised Dates & Budget (Optional) */}
              <div className="col-md-4">
                <label className="form-label fw-semibold">
                  Revised Start Date <span className="text-muted fw-normal">(Optional)</span>
                </label>
                <input
                  type="date"
                  name="revisedStartDate"
                  value={formData.revisedStartDate}
                  onChange={handleInputChange}
                  className={`form-control ${errors.revisedStartDate ? "is-invalid" : ""}`}
                />
                {errors.revisedStartDate && <div className="invalid-feedback">{errors.revisedStartDate}</div>}
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold">
                  Revised End Date <span className="text-muted fw-normal">(Optional)</span>
                </label>
                <input
                  type="date"
                  name="revisedEndDate"
                  value={formData.revisedEndDate}
                  onChange={handleInputChange}
                  className={`form-control ${errors.revisedEndDate ? "is-invalid" : ""}`}
                />
                {errors.revisedEndDate && <div className="invalid-feedback">{errors.revisedEndDate}</div>}
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold">
                  Revised Budget (Lakhs of TK) <span className="text-muted fw-normal">(Optional)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="revisedBudget"
                  placeholder="0.00"
                  value={formData.revisedBudget}
                  onChange={handleInputChange}
                  className={`form-control ${errors.revisedBudget ? "is-invalid" : ""}`}
                />
                {errors.revisedBudget && <div className="invalid-feedback">{errors.revisedBudget}</div>}
              </div>

              {/* Row 4: Priority & Status */}
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Priority <span className="text-danger">*</span>
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Status <span className="text-danger">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Row 5: Images & Actions */}
              <div className="col-12 mt-3">
                <label className="form-label fw-semibold d-flex align-items-center gap-1">
                  <ImageIcon size={15} /> Attach Images <span className="text-muted fw-normal">(Optional, max 1 MB each)</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImagesChange}
                  className="form-control"
                />
                {errors.images && <div className="text-danger small mt-1">{errors.images}</div>}

                {formData.images.length > 0 && (
                  <div className="d-flex flex-wrap gap-2 mt-2">
                    {formData.images.map((src, idx) => (
                      <div key={idx} className="position-relative" style={{ width: 68, height: 68 }}>
                        <img
                          src={src}
                          alt={`Preview ${idx + 1}`}
                          className="w-100 h-100 rounded border shadow-sm"
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

              <div className="col-12 d-flex justify-content-end gap-2 mt-4 pt-2 border-top">
                <button
                  type="button"
                  onClick={handleReset}
                  className="btn btn-outline-secondary d-inline-flex align-items-center gap-1"
                  disabled={submitting}
                >
                  <RotateCcw size={15} /> Cancel / Reset
                </button>
                <button
                  type="submit"
                  className="btn btn-primary d-inline-flex align-items-center gap-1 px-3"
                  disabled={submitting}
                >
                  {submitting ? (
                    <Loader size={16} className="spinner-border spinner-border-sm border-0" />
                  ) : editingId ? (
                    <Edit2 size={16} />
                  ) : (
                    <PlusCircle size={16} />
                  )}
                  {editingId ? "Update Project" : "Add Project"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Project Directory Table Card */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white d-flex flex-wrap justify-content-between align-items-center py-3 gap-2 border-bottom">
          <div>
            <h5 className="mb-0 fw-bold text-dark">Project Records</h5>
            <small className="text-muted">Total Records: {filteredProjects.length}</small>
          </div>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <select
              className="form-select form-select-sm"
              style={{ width: "200px" }}
              value={ministryFilter}
              onChange={(e) => setMinistryFilter(e.target.value)}
            >
              <option value="">All Ministries</option>
              {ministries.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.minName}
                </option>
              ))}
            </select>
            <div className="input-group input-group-sm" style={{ width: "240px" }}>
              <span className="input-group-text bg-light border-end-0">
                <Search size={14} />
              </span>
              <input
                type="text"
                className="form-control bg-light border-start-0"
                placeholder="Search project or ministry..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => window.print()}
              className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1"
            >
              <Printer size={14} /> Print List
            </button>
          </div>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            {loading ? (
              <div className="text-center py-5">
                <Loader size={28} className="spinner-border text-primary border-0" />
                <p className="mt-2 text-muted">Loading project records...</p>
              </div>
            ) : apiError ? (
              <div className="text-center py-5 text-danger">
                <AlertCircle size={32} />
                <p className="mt-2 fw-semibold">{apiError}</p>
              </div>
            ) : (
              <table className="table table-hover align-middle mb-0">
                <thead className="table-dark">
                  <tr>
                    <th>Project Name</th>
                    <th>Ministry & Directorate</th>
                    <th>Approved Timeline</th>
                    <th>Approved Budget</th>
                    <th>Revised Timeline</th>
                    <th>Revised Budget</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.length > 0 ? (
                    filteredProjects.map((project) => {
                      const minName = ministriesMap[project.ministryId] || "—";
                      const dirName = allDirectoratesMap[project.directorateId] || "—";
                      const formattedPriority = project.priority
                        ? project.priority.charAt(0) + project.priority.slice(1).toLowerCase()
                        : "";
                      const formattedStatus = project.status
                        ? project.status.charAt(0) + project.status.slice(1).toLowerCase()
                        : "";

                      const revisedDuration = revisedCalcDuration(project.revisedStartDate, project.revisedEndDate);

                      return (
                        <tr key={project.id}>
                          <td className="align-middle">
                            <div className="d-flex align-items-center gap-2 py-1">
                              {project.images && project.images.length > 0 ? (
                                <img
                                  src={project.images[0]}
                                  alt={project.projectName}
                                  className="rounded-circle border flex-shrink-0"
                                  style={{ width: "38px", height: "38px", objectFit: "cover" }}
                                />
                              ) : (
                                <div
                                  className="border rounded-circle bg-light d-flex align-items-center justify-content-center flex-shrink-0"
                                  style={{ width: "38px", height: "38px" }}
                                >
                                  <FolderPlus size={18} className="text-secondary" />
                                </div>
                              )}
                              <div>
                                <span className="fw-bold text-dark d-block">{project.projectName}</span>
                                {project.images && project.images.length > 0 && (
                                  <small className="text-muted">{project.images.length} photo(s)</small>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="align-middle">
                            <span className="d-flex align-items-center gap-1 text-dark fw-semibold small">
                              <Building2 size={13} className="text-secondary flex-shrink-0" />
                              {minName}
                            </span>
                            <span className="d-flex align-items-center gap-1 text-muted small mt-1">
                              <Landmark size={12} className="flex-shrink-0" />
                              {dirName}
                            </span>
                          </td>
                          <td className="align-middle">
                            <span className="d-flex align-items-center gap-1 text-muted small">
                              <Calendar size={13} className="flex-shrink-0" />
                              {formatDate(project.approvedStartDate)} - {formatDate(project.approvedEndDate)}
                            </span>
                            <small className="text-secondary d-block mt-1">
                              Duration: {approvedCalcDuration(project.approvedStartDate, project.approvedEndDate)}
                            </small>
                          </td>
                          <td className="align-middle fw-semibold text-dark">
                            ৳ {Number(project.approvedBudget || 0).toFixed(2)} Lakhs
                          </td>
                          <td className="align-middle">
                            {project.revisedStartDate || project.revisedEndDate ? (
                              <>
                                <span className="d-flex align-items-center gap-1 text-muted small">
                                  <Calendar size={13} className="flex-shrink-0" />
                                  {formatDate(project.revisedStartDate) || "—"} - {formatDate(project.revisedEndDate) || "—"}
                                </span>
                                {revisedDuration && (
                                  <small className="text-secondary d-block mt-1">
                                    Duration: {revisedDuration}
                                  </small>
                                )}
                              </>
                            ) : (
                              <span className="text-muted small">—</span>
                            )}
                          </td>
                          <td className="align-middle fw-semibold text-dark">
                            {project.revisedBudget ? `৳ ${Number(project.revisedBudget).toFixed(2)} Lakhs` : "—"}
                          </td>
                          <td className="align-middle">
                            <span className={priorityPillClass(formattedPriority)}>
                              {formattedPriority}
                            </span>
                          </td>
                          <td className="align-middle">
                            <span className={statusPillClass(formattedStatus)}>
                              {formattedStatus}
                            </span>
                          </td>
                          <td className="text-end align-middle">
                            <div className="btn-group btn-group-sm">
                              <button
                                onClick={() => setViewProject(project)}
                                className="btn btn-outline-secondary"
                                title="View Details"
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                onClick={() => handleEdit(project)}
                                className="btn btn-outline-primary"
                                title="Edit Record"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDelete(project.id)}
                                className="btn btn-outline-danger"
                                title="Delete Record"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="9" className="text-center py-4 text-muted">
                        No projects found matching the criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* View Details Modal */}
      {viewProject && (
        <div className="modal fade show d-block tab-index-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-light">
                <h5 className="modal-title fw-bold text-primary">{viewProject.projectName}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setViewProject(null)}
                ></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-3">
                  <div className="col-md-6">
                    <strong className="d-block text-muted small">Parent Ministry</strong>
                    <span>{ministriesMap[viewProject.ministryId] || "—"}</span>
                  </div>
                  <div className="col-md-6">
                    <strong className="d-block text-muted small">Directorate</strong>
                    <span>{allDirectoratesMap[viewProject.directorateId] || "—"}</span>
                  </div>
                  <div className="col-md-6">
                    <strong className="d-block text-muted small">Approved Timeline</strong>
                    <span>{formatDate(viewProject.approvedStartDate)} to {formatDate(viewProject.approvedEndDate)}</span>
                  </div>
                  <div className="col-md-6">
                    <strong className="d-block text-muted small">Approved Budget</strong>
                    <span>৳ {Number(viewProject.approvedBudget || 0).toFixed(2)} Lakhs</span>
                  </div>
                  <div className="col-md-6">
                    <strong className="d-block text-muted small">Revised Timeline</strong>
                    <span>
                      {viewProject.revisedStartDate || viewProject.revisedEndDate
                        ? `${formatDate(viewProject.revisedStartDate) || "—"} to ${formatDate(viewProject.revisedEndDate) || "—"}`
                        : "—"}
                    </span>
                  </div>
                  <div className="col-md-6">
                    <strong className="d-block text-muted small">Revised Budget</strong>
                    <span>{viewProject.revisedBudget ? `৳ ${Number(viewProject.revisedBudget).toFixed(2)} Lakhs` : "—"}</span>
                  </div>
                  <div className="col-md-6">
                    <strong className="d-block text-muted small">Priority</strong>
                    <span className={priorityPillClass(viewProject.priority)}>{viewProject.priority}</span>
                  </div>
                  <div className="col-md-6">
                    <strong className="d-block text-muted small">Status</strong>
                    <span className={statusPillClass(viewProject.status)}>{viewProject.status}</span>
                  </div>
                  {viewProject.images && viewProject.images.length > 0 && (
                    <div className="col-12 mt-3">
                      <strong className="d-block text-muted small mb-2">Attached Images</strong>
                      <div className="d-flex flex-wrap gap-2">
                        {viewProject.images.map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt={`Project attachment ${idx + 1}`}
                            className="rounded border shadow-sm"
                            style={{ width: "90px", height: "90px", objectFit: "cover" }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer bg-light">
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