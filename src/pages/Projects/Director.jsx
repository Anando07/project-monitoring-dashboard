import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Trash2,
  Pencil,
  Eye,
  X,
  UserCheck,
  Search,
  Printer,
  ChevronLeft,
  ChevronRight,
  User,
  AlertCircle,
  Loader,
} from "lucide-react";

// Services (adjust import paths to match your project structure)
import {
    getAllDirectors,
    createDirector,
    updateDirector,
    deleteDirector
} from "../../services/DirectorService";
import { getAllMinistries } from "../../services/MinistryService";
import { getAllDirectorates } from "../../services/DirectorateService";
import { getAllProjects } from "../../services/ProjectService";

const PAGE_SIZE = 8;

const DUTY_ROLES = [
  "On Duty",
  "Current Duty",
  "Additional Duty",
  "Released",
  "Transferred",
];

const EMPTY_FORM = {
  name: "",
  designation: "",
  ministryId: "",
  directorateId: "",
  contact: "",
  email: "",
  projectId: "",
  dutyRole: "On Duty",
  assignedDate: new Date().toISOString().split("T")[0],
  releaseDate: "",
  image: null,
};

function Director() {
  // Database State
  const [ministries, setMinistries] = useState([]);
  const [directorates, setDirectorates] = useState([]);
  const [projects, setProjects] = useState([]);
  const [directors, setDirectors] = useState([]);

  // UI State
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [viewDirector, setViewDirector] = useState(null);

  /* Search & Filter States */
  const [searchTerm, setSearchTerm] = useState("");
  const [dutyFilter, setDutyFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch initial relational data from backend REST APIs
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const [minRes, dirRes, projRes, directorRes] =
        await Promise.all([
            getAllMinistries(),
            getAllDirectorates(),
            getAllProjects(),
            getAllDirectors()
        ]);

        setMinistries(minRes.data);
        setDirectorates(dirRes.data);
        setProjects(projRes.data);
        setDirectors(directorRes.data);
    } catch (error) {
      console.error("Failed to fetch initial data:", error);
      setApiError("Unable to load ministries, directorates, or projects from server.");
    } finally {
      setLoading(false);
    }
  };

  /* Filter Directorates dynamically based on selected Ministry */
  const availableDirectorates = useMemo(() => {
    if (!form.ministryId) return [];
    return directorates.filter(
      (d) => String(d.ministry?.id || d.ministryId) === String(form.ministryId)
    );
  }, [directorates, form.ministryId]);

  /* Handle Ministry Selection Changes */
  const handleMinistryChange = (e) => {
    const selectedMinId = e.target.value;
    setForm((prev) => ({
      ...prev,
      ministryId: selectedMinId,
      directorateId: "", // Reset directorate when ministry changes
    }));
    if (errors.ministryId) setErrors((prev) => ({ ...prev, ministryId: null }));
  };

  /* Generic Field Change Handler */
  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  /* Image Upload Handler */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  /* Form Validation */
  const validate = () => {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = "Full name is required";
    if (!form.designation.trim()) nextErrors.designation = "Designation is required";
    if (!form.ministryId) nextErrors.ministryId = "Please select a Ministry";
    if (!form.contact.trim()) nextErrors.contact = "Contact number is required";
    if (!form.projectId) nextErrors.projectId = "Please select a Project";
    if (!form.dutyRole) nextErrors.dutyRole = "Duty Role is required";
    if (!form.assignedDate) nextErrors.assignedDate = "Assigned Date is required";

    if (!form.email.trim()) {
      nextErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = "Please enter a valid email address";
    }

    const isDuplicateProject = directors.some(
      (d) =>
        d.id !== editingId &&
        d.dirName.trim().toLowerCase() === form.name.trim().toLowerCase() &&
        String(d.projectId) === String(form.projectId)
    );

    if (isDuplicateProject) {
      nextErrors.projectId = "Director is already assigned to this project";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  /* Form Submission */
  const handleSubmit = async (e) => {

      e.preventDefault();

      if (!validate()) return;

      const payload = {

          dirName: form.name,

          dirDesignation: form.designation,

          ministryId: Number(form.ministryId),

          directorateId: form.directorateId
              ? Number(form.directorateId)
              : null,

          contact: form.contact,

          email: form.email,

          projectId: Number(form.projectId),

          dutyRole: form.dutyRole,

          assignedDate: form.assignedDate,

          releaseDate: form.releaseDate || null,

          image: form.image
      };

      try {

          if (editingId) {

              await updateDirector(editingId, payload);

          } else {

              await createDirector(payload);

          }

          fetchInitialData();

          handleReset();

      } catch (error) {

          console.log(error);

          alert("Save Failed");

      }

  };
  const handleReset = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setEditingId(null);
  };

  const handleEdit = (director) => {
    setForm({
      name: director.dirName || "",
      designation: director.dirDesignation || "",
      ministryId: String(director.ministryId || ""),
      directorateId: String(director.directorateId || ""),
      contact: director.contact || "",
      email: director.email || "",
      projectId: String(director.projectId || ""),
      dutyRole: director.dutyRole || "On Duty",
      assignedDate: director.assignedDate || "",
      releaseDate: director.releaseDate || "",
      image: director.image || null,
    });
    setEditingId(director.id);
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {

      if (!window.confirm("Delete?")) return;

      try{

          await deleteDirector(id);

          fetchInitialData();

      }catch(e){

          alert("Delete Failed");

      }

  }

  const handlePrint = () => {
    window.print();
  };

  /* Search & Filter Logic */
  const filteredDirectors = useMemo(() => {
    return directors.filter((d) => {
      const query = searchTerm.toLowerCase().trim();
      const matchesSearch =
        (d.dirName || "").toLowerCase().includes(query) ||
        (d.dirDesignation || "").toLowerCase().includes(query) ||
        (d.ministryName || "").toLowerCase().includes(query) ||
        (d.directorateName || "").toLowerCase().includes(query) ||
        (d.email || "").toLowerCase().includes(query) ||
        (d.projectName || "").toLowerCase().includes(query);

      const matchesDuty = dutyFilter === "All" || d.dutyRole === dutyFilter;

      return matchesSearch && matchesDuty;
    });
  }, [directors, searchTerm, dutyFilter]);

  /* Pagination */
  const totalPages = Math.max(1, Math.ceil(filteredDirectors.length / PAGE_SIZE));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const pageDirectors = filteredDirectors.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="container-fluid py-4 bg-light min-vh-100">
      {/* ---------------- Form Card ---------------- */}
      <div className="card shadow-sm border-0 mb-4 d-print-none">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center border-bottom">
          <h5 className="mb-0 text-primary fw-bold">
            {editingId ? "Edit Director Record" : "Add Director Record"}
          </h5>
          <UserCheck className="text-primary" size={20} />
        </div>

        <div className="card-body p-4">
          {loading ? (
            <div className="text-center py-4">
              <Loader size={24} className="spinner-border text-primary border-0" />
              <p className="mt-2 text-muted small">Loading Ministries & Directorates...</p>
            </div>
          ) : apiError ? (
            <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3">
              <AlertCircle size={16} />
              <span className="small">{apiError}</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className="row g-3">
                {/* Full Name */}
                <div className="col-md-4">
                  <label className="form-label fw-semibold">
                    Full Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Engr. Md. Abul Kalam"
                    value={form.name}
                    onChange={handleChange("name")}
                    className={`form-control ${errors.name ? "is-invalid" : ""}`}
                  />
                  {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>

                {/* Designation */}
                <div className="col-md-4">
                  <label className="form-label fw-semibold">
                    Designation <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Project Director"
                    value={form.designation}
                    onChange={handleChange("designation")}
                    className={`form-control ${errors.designation ? "is-invalid" : ""}`}
                  />
                  {errors.designation && <div className="invalid-feedback">{errors.designation}</div>}
                </div>

                {/* Dynamic Ministry Dropdown */}
                <div className="col-md-4">
                  <label className="form-label fw-semibold">
                    Ministry <span className="text-danger">*</span>
                  </label>
                  <select
                    value={form.ministryId}
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

                {/* Dynamic Directorate Dropdown (Filtered by selected Ministry) */}
                <div className="col-md-4">
                  <label className="form-label fw-semibold">
                    Directorate <span className="text-muted fw-normal">(Optional)</span>
                  </label>
                  <select
                    value={form.directorateId}
                    onChange={handleChange("directorateId")}
                    disabled={!form.ministryId}
                    className="form-select"
                  >
                    <option value="">
                      {!form.ministryId
                        ? "-- Select Ministry First --"
                        : "-- Select Directorate --"}
                    </option>
                    {availableDirectorates.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.dirName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Contact Number */}
                <div className="col-md-4">
                  <label className="form-label fw-semibold">
                    Contact Number <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +880 1711-000000"
                    value={form.contact}
                    onChange={handleChange("contact")}
                    className={`form-control ${errors.contact ? "is-invalid" : ""}`}
                  />
                  {errors.contact && <div className="invalid-feedback">{errors.contact}</div>}
                </div>

                {/* Email Address */}
                <div className="col-md-4">
                  <label className="form-label fw-semibold">
                    Email Address <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. director@agency.gov.bd"
                    value={form.email}
                    onChange={handleChange("email")}
                    className={`form-control ${errors.email ? "is-invalid" : ""}`}
                  />
                  {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>

                {/* Dynamic Project Dropdown */}
                <div className="col-md-4">
                  <label className="form-label fw-semibold">
                    Project Name <span className="text-danger">*</span>
                  </label>
                  <select
                    value={form.projectId}
                    onChange={handleChange("projectId")}
                    className={`form-select ${errors.projectId ? "is-invalid" : ""}`}
                  >
                    <option value="">-- Choose Project --</option>
                    {projects.map((proj) => (
                      <option key={proj.id} value={proj.id}>
                        {proj.projectName}
                      </option>
                    ))}
                  </select>
                  {errors.projectId && <div className="invalid-feedback">{errors.projectId}</div>}
                </div>

                {/* Duty Role */}
                <div className="col-md-4">
                  <label className="form-label fw-semibold">
                    Duty Role <span className="text-danger">*</span>
                  </label>
                  <select
                    value={form.dutyRole}
                    onChange={handleChange("dutyRole")}
                    className="form-select"
                  >
                    {DUTY_ROLES.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Assigned Date */}
                <div className="col-md-4">
                  <label className="form-label fw-semibold">
                    Assigned Date <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.assignedDate}
                    onChange={handleChange("assignedDate")}
                    className={`form-control ${errors.assignedDate ? "is-invalid" : ""}`}
                  />
                  {errors.assignedDate && <div className="invalid-feedback">{errors.assignedDate}</div>}
                </div>

                {/* Release Date */}
                <div className="col-md-4">
                  <label className="form-label fw-semibold">
                    Release Date <span className="text-muted fw-normal">(Optional)</span>
                  </label>
                  <input
                    type="date"
                    value={form.releaseDate}
                    onChange={handleChange("releaseDate")}
                    className="form-control"
                  />
                </div>

                {/* Director Photo Upload */}
                <div className="col-md-4">
                  <label className="form-label fw-semibold">
                    Director Photo <span className="text-muted fw-normal">(Optional)</span>
                  </label>
                  {form.image ? (
                    <div className="d-flex align-items-center gap-2">
                      <img
                        src={form.image}
                        alt="Preview"
                        className="rounded border"
                        style={{ width: "38px", height: "38px", objectFit: "cover" }}
                      />
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => setForm((prev) => ({ ...prev, image: null }))}
                      >
                        <X size={14} /> Remove
                      </button>
                    </div>
                  ) : (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="form-control"
                    />
                  )}
                </div>

                {/* Form Action Buttons */}
                <div className="col-12 d-flex justify-content-end align-items-center gap-2 mt-4 pt-2 border-top">
                  {editingId && (
                    <span className="badge bg-primary-subtle text-primary border me-auto p-2">
                      Editing Record ID: #{editingId}
                    </span>
                  )}
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={handleReset}
                  >
                    {editingId ? "Cancel" : "Reset"}
                  </button>
                  <button type="submit" className="btn btn-primary d-inline-flex align-items-center gap-1">
                    {editingId ? <Pencil size={16} /> : <Plus size={16} />}
                    {editingId ? "Update Record" : "Save Record"}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* ---------------- Directory Table ---------------- */}
      <div className="card shadow-sm border-0 d-print-none">
        <div className="card-header bg-white py-3 d-flex flex-wrap justify-content-between align-items-center gap-2 border-bottom">
          <h5 className="mb-0 fw-bold text-dark">
            Directors Directory <span className="badge bg-secondary ms-1">{filteredDirectors.length}</span>
          </h5>

          <div className="d-flex align-items-center gap-2 flex-wrap">
            {/* Search Input */}
            <div className="input-group input-group-sm" style={{ width: "260px" }}>
              <span className="input-group-text bg-light border-end-0">
                <Search size={14} />
              </span>
              <input
                type="text"
                className="form-control bg-light border-start-0"
                placeholder="Search director, ministry, project..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            {/* Duty Role Filter */}
            <select
              className="form-select form-select-sm"
              style={{ width: "160px" }}
              value={dutyFilter}
              onChange={(e) => {
                setDutyFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All Duty Roles</option>
              {DUTY_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>

            <button
              type="button"
              className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
              onClick={handlePrint}
            >
              <Printer size={14} /> Print
            </button>
          </div>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            {filteredDirectors.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <User size={32} className="mb-2" />
                <p className="mb-0">
                  {directors.length === 0
                    ? "No director records found. Add one above."
                    : "No records match your filter."}
                </p>
              </div>
            ) : (
              <table className="table table-hover align-middle mb-0">
                <thead className="table-dark">
                  <tr>
                    <th>Photo</th>
                    <th>Director Info</th>
                    <th>Ministry &amp; Directorate</th>
                    <th>Contact</th>
                    <th>Assigned Project</th>
                    <th>Duty Role</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageDirectors.map((item) => (
                    <tr key={item.id}>
                      <td>
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.dirName}
                            className="rounded-circle border"
                            style={{ width: "36px", height: "36px", objectFit: "cover" }}
                          />
                        ) : (
                          <div
                            className="rounded-circle bg-secondary-subtle text-secondary d-flex align-items-center justify-content-center"
                            style={{ width: "36px", height: "36px" }}
                          >
                            <User size={18} />
                          </div>
                        )}
                      </td>
                      <td>
                        <strong className="d-block text-dark">{item.dirName}</strong>
                        <small className="text-muted">{item.dirDesignation}</small>
                      </td>
                      <td>
                        <span className="d-block small fw-semibold text-dark">{item.ministryName}</span>
                        <small className="text-muted d-block">{item.directorateName || "—"}</small>
                      </td>
                      <td>
                        <span className="d-block small">{item.contact}</span>
                        <small className="text-muted d-block">{item.email}</small>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border fw-normal p-2">
                          {item.projectName}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            item.dutyRole === "On Duty" || item.dutyRole === "Current Duty"
                              ? "bg-success-subtle text-success border border-success-subtle"
                              : item.dutyRole === "Additional Duty"
                              ? "bg-primary-subtle text-primary border border-primary-subtle"
                              : "bg-danger-subtle text-danger border border-danger-subtle"
                          }`}
                        >
                          {item.dutyRole}
                        </span>
                      </td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button
                            onClick={() => setViewDirector(item)}
                            className="btn btn-outline-secondary"
                            title="View Profile"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => handleEdit(item)}
                            className="btn btn-outline-primary"
                            title="Edit Record"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="btn btn-outline-danger"
                            title="Delete Record"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center py-3 border-top">
              <nav>
                <ul className="pagination pagination-sm mb-0">
                  <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                    <button
                      type="button"
                      className="page-link"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    >
                      <ChevronLeft size={14} />
                    </button>
                  </li>
                  <li className="page-item disabled">
                    <span className="page-link text-dark">
                      Page {currentPage} of {totalPages}
                    </span>
                  </li>
                  <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                    <button
                      type="button"
                      className="page-link"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    >
                      <ChevronRight size={14} />
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* ---------------- Print Mode Table ---------------- */}
      <div className="d-none d-print-block">
        <h3 className="fw-bold mb-1">Directors Official Directory</h3>
        <p className="text-muted small mb-3">
          Generated on {new Date().toLocaleDateString("en-GB")} · Total Records: {filteredDirectors.length}
        </p>
        <table className="table table-bordered table-sm">
          <thead>
            <tr>
              <th>Name &amp; Designation</th>
              <th>Ministry</th>
              <th>Directorate</th>
              <th>Contact</th>
              <th>Assigned Project</th>
              <th>Duty Role</th>
              <th>Assigned Date</th>
              <th>Release Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredDirectors.map((item) => (
              <tr key={item.id}>
                <td>
                  <strong>{item.dirName}</strong>
                  <br />
                  <small>{item.DirNesignation}</small>
                </td>
                <td>{item.ministryName}</td>
                <td>{item.directorateName || "N/A"}</td>
                <td>
                  {item.contact}
                  <br />
                  {item.email}
                </td>
                <td>{item.projectName}</td>
                <td>{item.dutyRole}</td>
                <td>{item.assignedDate || "N/A"}</td>
                <td>{item.releaseDate || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---------------- View Profile Modal ---------------- */}
      {viewDirector && (
        <div className="modal fade show d-block d-print-none" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-light py-3">
                <h5 className="modal-title fw-bold text-primary">Director Profile</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setViewDirector(null)}
                ></button>
              </div>

              <div className="modal-body p-4">
                <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
                  {viewDirector.image ? (
                    <img
                      src={viewDirector.image}
                      alt={viewDirector.dirName}
                      className="rounded-circle border"
                      style={{ width: "64px", height: "64px", objectFit: "cover" }}
                    />
                  ) : (
                    <div
                      className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center"
                      style={{ width: "64px", height: "64px" }}
                    >
                      <User size={32} />
                    </div>
                  )}
                  <div>
                    <h4 className="mb-0 fw-bold">{viewDirector.dirName}</h4>
                    <span className="text-muted">{viewDirector.dirDesignation}</span>
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <strong className="d-block text-muted small">Ministry</strong>
                    <span className="fw-semibold">{viewDirector.ministryName}</span>
                  </div>
                  <div className="col-md-6">
                    <strong className="d-block text-muted small">Directorate</strong>
                    <span>{viewDirector.directorateName || "N/A"}</span>
                  </div>
                  <div className="col-md-6">
                    <strong className="d-block text-muted small">Contact Number</strong>
                    <span>{viewDirector.contact}</span>
                  </div>
                  <div className="col-md-6">
                    <strong className="d-block text-muted small">Email Address</strong>
                    <span>{viewDirector.email}</span>
                  </div>
                  <div className="col-md-6">
                    <strong className="d-block text-muted small">Assigned Project</strong>
                    <span className="fw-semibold">{viewDirector.projectName}</span>
                  </div>
                  <div className="col-md-6">
                    <strong className="d-block text-muted small">Duty Role</strong>
                    <span>{viewDirector.dutyRole}</span>
                  </div>
                  <div className="col-md-6">
                    <strong className="d-block text-muted small">Assigned Date</strong>
                    <span>{viewDirector.assignedDate || "N/A"}</span>
                  </div>
                  <div className="col-md-6">
                    <strong className="d-block text-muted small">Release Date</strong>
                    <span>{viewDirector.releaseDate || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div className="modal-footer bg-light py-2">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setViewDirector(null)}
                >
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

export default Director;