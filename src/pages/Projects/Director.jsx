import React, { useState, useEffect, useMemo } from "react";
import "./Director.css";
import {
  Plus,
  Trash2,
  Pencil,
  Eye,
  X,
  UserCheck,
  Search,
  Printer,
  Filter,
  ChevronLeft,
  ChevronRight,
  User,
  Building,
  Mail,
  Phone,
  Briefcase,
  FolderKanban,
  Clock,
  Upload,
  FileText,
  ExternalLink,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Card Component                                                    */
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

/* ------------------------------------------------------------------ */
/* Options & Initial Data                                            */
/* ------------------------------------------------------------------ */

const PAGE_SIZE = 8;

const PROJECT_OPTIONS = [
  "Dhaka Metro Rail (MRT Line-6)",
  "Dhaka Elevated Expressway",
  "Padma Bridge Rail Link",
  "Bangabandhu Tunnel (Karnafuli)",
  "Dhaka-Chittagong Highway Expansion",
  "Smart National Fuel Management System",
];

const DUTY_ROLES = [
  "On Duty",
  "Current Duty",
  "Additional Duty",
  "Released",
  "Transferred",
];

const INITIAL_DIRECTORS = [
  {
    id: 1,
    name: "Engr. Md. Abul Kalam",
    designation: "Project Director",
    office: "Dhaka Transport Coordination Authority (DTCA)",
    contact: "+880 1711-000001",
    email: "pd.mrt@dtca.gov.bd",
    projectName: "Dhaka Metro Rail (MRT Line-6)",
    dutyRole: "On Duty",
    assignedDate: "2023-01-15",
    releaseDate: "",
    dutyGoName: "GO-MRT-2023-01.pdf",
    dutyGoUrl: "#",
    image: null,
    status: "Active",
  },
  {
    id: 2,
    name: "Engr. Md. Abul Kalam",
    designation: "Project Director",
    office: "Dhaka Transport Coordination Authority (DTCA)",
    contact: "+880 1711-000001",
    email: "pd.mrt@dtca.gov.bd",
    projectName: "Dhaka Elevated Expressway",
    dutyRole: "Additional Duty",
    assignedDate: "2023-06-01",
    releaseDate: "",
    dutyGoName: "GO-DEE-2023-45.pdf",
    dutyGoUrl: "#",
    image: null,
    status: "Active",
  },
  {
    id: 3,
    name: "Dr. Sharmin Akter",
    designation: "Additional Project Director",
    office: "Roads and Highways Department (RHD)",
    contact: "+880 1819-000002",
    email: "s.akter@rhd.gov.bd",
    projectName: "Smart National Fuel Management System",
    dutyRole: "Current Duty",
    assignedDate: "2024-02-01",
    releaseDate: "",
    dutyGoName: "GO-RHD-2024-09.pdf",
    dutyGoUrl: "#",
    image: null,
    status: "Active",
  },
];

const EMPTY_FORM = {
  name: "",
  designation: "",
  office: "",
  contact: "",
  email: "",
  projectName: "",
  dutyRole: "On Duty",
  assignedDate: new Date().toISOString().split("T")[0],
  releaseDate: "",
  dutyGoName: "",
  dutyGoUrl: null,
  image: null,
  status: "Active",
};

function Director() {
  const [directors, setDirectors] = useState(INITIAL_DIRECTORS);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [viewDirector, setViewDirector] = useState(null);

  /* Search & Filter States */
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dutyFilter, setDutyFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  /* Field Change Handler */
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

  /* Duty GO Document Handler */
  const handleGoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({
          ...prev,
          dutyGoName: file.name,
          dutyGoUrl: reader.result,
        }));
        if (errors.dutyGo) setErrors((prev) => ({ ...prev, dutyGo: null }));
      };
      reader.readAsDataURL(file);
    }
  };

  /* Form Validation */
  const validate = () => {
    const nextErrors = {};
    // Mandatory fields check
    if (!form.name.trim()) nextErrors.name = "Full name is required";
    if (!form.designation.trim()) nextErrors.designation = "Designation is required";
    if (!form.office.trim()) nextErrors.office = "Office/Department is required";
    if (!form.contact.trim()) nextErrors.contact = "Contact number is required";
    if (!form.projectName) nextErrors.projectName = "Please select a project";
    if (!form.dutyRole) nextErrors.dutyRole = "Duty Role is required";
    if (!form.assignedDate) nextErrors.assignedDate = "Assigned Date is required";
    if (!form.dutyGoName) nextErrors.dutyGo = "Duty GO file is required";

    if (!form.email.trim()) {
      nextErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = "Please enter a valid email address";
    }

    // Duplicate project check per director
    const isDuplicateProject = directors.some(
      (d) =>
        d.id !== editingId &&
        d.name.trim().toLowerCase() === form.name.trim().toLowerCase() &&
        d.projectName === form.projectName
    );

    if (isDuplicateProject) {
      nextErrors.projectName = "Director is already assigned to this project";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  /* Form Submission */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (editingId) {
      setDirectors((prev) =>
        prev.map((d) => (d.id === editingId ? { ...d, ...form } : d))
      );
    } else {
      const newEntry = {
        id: Date.now(),
        ...form,
      };
      setDirectors((prev) => [newEntry, ...prev]);
      setCurrentPage(1);
    }

    handleReset();
  };

  const handleReset = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setEditingId(null);
  };

  const handleEdit = (director) => {
    setForm({ ...director });
    setEditingId(director.id);
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => {
    setDirectors((prev) => prev.filter((d) => d.id !== id));
    if (editingId === id) handleReset();
  };

  const handlePrint = () => {
    window.print();
  };

  /* Search & Filter Logic */
  const filteredDirectors = useMemo(() => {
    return directors.filter((d) => {
      const query = searchTerm.toLowerCase().trim();
      const matchesSearch =
        d.name.toLowerCase().includes(query) ||
        d.designation.toLowerCase().includes(query) ||
        d.office.toLowerCase().includes(query) ||
        d.email.toLowerCase().includes(query) ||
        d.projectName.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || d.status === statusFilter;

      const matchesDuty =
        dutyFilter === "All" || d.dutyRole === dutyFilter;

      return matchesSearch && matchesStatus && matchesDuty;
    });
  }, [directors, searchTerm, statusFilter, dutyFilter]);

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
    <div className="dashboard-page">
      {/* ---------------- 3-Column Single Form ---------------- */}
      <Card
        className="no-print"
        title={editingId ? "Edit Director Record" : "Add Director Record"}
        action={<UserCheck size={18} className="card-action-icon" />}
      >
        <form className="project-form" onSubmit={handleSubmit} noValidate>
          <div className="form-grid form-grid-3">
            {/* Row 1 */}
            <div className="form-group">
              <label htmlFor="directorName">
                Full Name <span className="req-star">*</span>
              </label>
              <input
                id="directorName"
                type="text"
                placeholder="e.g. Engr. Md. Abul Kalam"
                value={form.name}
                onChange={handleChange("name")}
                className={errors.name ? "input-error" : ""}
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="designation">
                Designation <span className="req-star">*</span>
              </label>
              <input
                id="designation"
                type="text"
                placeholder="e.g. Project Director"
                value={form.designation}
                onChange={handleChange("designation")}
                className={errors.designation ? "input-error" : ""}
              />
              {errors.designation && (
                <span className="field-error">{errors.designation}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="office">
                Office / Department <span className="req-star">*</span>
              </label>
              <input
                id="office"
                type="text"
                placeholder="e.g. DTCA, Ministry of Transport"
                value={form.office}
                onChange={handleChange("office")}
                className={errors.office ? "input-error" : ""}
              />
              {errors.office && <span className="field-error">{errors.office}</span>}
            </div>

            {/* Row 2 */}
            <div className="form-group">
              <label htmlFor="contact">
                Contact Number <span className="req-star">*</span>
              </label>
              <input
                id="contact"
                type="text"
                placeholder="e.g. +880 1711-000000"
                value={form.contact}
                onChange={handleChange("contact")}
                className={errors.contact ? "input-error" : ""}
              />
              {errors.contact && (
                <span className="field-error">{errors.contact}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email">
                Email Address <span className="req-star">*</span>
              </label>
              <input
                id="email"
                type="email"
                placeholder="e.g. director@agency.gov.bd"
                value={form.email}
                onChange={handleChange("email")}
                className={errors.email ? "input-error" : ""}
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="projectName">
                Project Name <span className="req-star">*</span>
              </label>
              <select
                id="projectName"
                value={form.projectName}
                onChange={handleChange("projectName")}
                className={errors.projectName ? "input-error" : ""}
              >
                <option value="">-- Choose Project --</option>
                {PROJECT_OPTIONS.map((proj, idx) => (
                  <option key={idx} value={proj}>
                    {proj}
                  </option>
                ))}
              </select>
              {errors.projectName && (
                <span className="field-error">{errors.projectName}</span>
              )}
            </div>

            {/* Row 3 */}
            <div className="form-group">
              <label htmlFor="dutyRole">
                Duty Role <span className="req-star">*</span>
              </label>
              <select
                id="dutyRole"
                value={form.dutyRole}
                onChange={handleChange("dutyRole")}
              >
                {DUTY_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="assignedDate">
                Assigned Date <span className="req-star">*</span>
              </label>
              <input
                id="assignedDate"
                type="date"
                value={form.assignedDate}
                onChange={handleChange("assignedDate")}
                className={errors.assignedDate ? "input-error" : ""}
              />
              {errors.assignedDate && (
                <span className="field-error">{errors.assignedDate}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="releaseDate">
                Release Date <span className="optional-tag">(Optional)</span>
              </label>
              <input
                id="releaseDate"
                type="date"
                value={form.releaseDate}
                onChange={handleChange("releaseDate")}
              />
            </div>

            {/* Row 4 (Last Row) */}
            <div className="form-group">
              <label htmlFor="status">
                Account Status <span className="req-star">*</span>
              </label>
              <select
                id="status"
                value={form.status}
                onChange={handleChange("status")}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {/* LAST CELL 2: Duty GO Document Upload (Mandatory) */}
            <div className="form-group">
              <label htmlFor="dutyGoInput">
                Duty GO Document <span className="req-star">*</span>
              </label>
              <div className="file-upload-box">
                {form.dutyGoName ? (
                  <div className="uploaded-file-tag">
                    <FileText size={14} />
                    <span className="file-name-text" title={form.dutyGoName}>
                      {form.dutyGoName}
                    </span>
                    <button
                      type="button"
                      className="remove-file-btn"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          dutyGoName: "",
                          dutyGoUrl: null,
                        }))
                      }
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="dutyGoInput"
                    className={`file-input-label ${errors.dutyGo ? "input-error" : ""}`}
                  >
                    <Upload size={14} /> Attach Duty GO
                  </label>
                )}
                <input
                  id="dutyGoInput"
                  type="file"
                  accept=".pdf,.doc,.docx,image/*"
                  onChange={handleGoUpload}
                  className="file-input-hidden"
                />
              </div>
              {errors.dutyGo && (
                <span className="field-error">{errors.dutyGo}</span>
              )}
            </div>

            {/* LAST CELL 3: Director Image Upload (Optional) */}
            <div className="form-group">
              <label htmlFor="directorImage">
                Director Photo <span className="optional-tag">(Optional)</span>
              </label>
              <div className="image-upload-wrapper">
                {form.image ? (
                  <div className="image-preview-container">
                    <img src={form.image} alt="Preview" className="image-preview" />
                    <button
                      type="button"
                      className="image-remove-btn"
                      onClick={() => setForm((prev) => ({ ...prev, image: null }))}
                      title="Remove image"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <label htmlFor="directorImage" className="file-input-label">
                    <Upload size={14} /> Upload Photo
                  </label>
                )}
                <input
                  id="directorImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="file-input-hidden"
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            {editingId && (
              <span className="editing-badge">Editing ID: #{editingId}</span>
            )}
            <button
              type="button"
              className="button-secondary"
              onClick={handleReset}
            >
              {editingId ? "Cancel" : "Reset"}
            </button>
            <button type="submit" className="button-primary">
              {editingId ? <Pencil size={16} /> : <Plus size={16} />}
              {editingId ? "Update Record" : "Save Record"}
            </button>
          </div>
        </form>
      </Card>

      {/* ---------------- Table Display ---------------- */}
      <Card
        className="no-print"
        title={`Directors Directory (${filteredDirectors.length})`}
        action={
          <div className="header-actions">
            <div className="search-box">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search name, project, office..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <div className="filter-dropdown">
              <Filter size={16} className="filter-icon" />
              <select
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
            </div>

            <div className="filter-dropdown">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <button
              type="button"
              className="button-secondary print-btn"
              onClick={handlePrint}
            >
              <Printer size={16} />
              Print
            </button>
          </div>
        }
      >
        {filteredDirectors.length === 0 ? (
          <div className="empty-state">
            <User size={28} />
            <p>
              {directors.length === 0
                ? "No director records found. Add one above."
                : "No records match your current filter."}
            </p>
          </div>
        ) : (
          <>
            <div className="table-overflow">
              <table className="projects-table">
                <thead>
                  <tr>
                    <th>Photo</th>
                    <th>Director Info</th>
                    <th>Office & Contact</th>
                    <th>Assigned Project</th>
                    <th>Duty Role</th>
                    <th>Duty GO</th>
                    <th>Account Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pageDirectors.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="table-avatar">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="avatar-img" />
                          ) : (
                            <div className="avatar-placeholder">
                              <User size={16} />
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="director-name-cell">
                          <strong>{item.name}</strong>
                          <span className="sub-text">{item.designation}</span>
                        </div>
                      </td>
                      <td>
                        <div className="contact-cell">
                          <span>{item.office}</span>
                          <small>{item.contact}</small>
                          <small>{item.email}</small>
                        </div>
                      </td>
                      <td>
                        <span className="project-name-tag">
                          {item.projectName}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`duty-pill ${
                            item.dutyRole === "On Duty" ||
                            item.dutyRole === "Current Duty"
                              ? "duty-pill-green"
                              : item.dutyRole === "Additional Duty"
                              ? "duty-pill-blue"
                              : "duty-pill-red"
                          }`}
                        >
                          {item.dutyRole}
                        </span>
                      </td>
                      <td>
                        {item.dutyGoName ? (
                          <a
                            href={item.dutyGoUrl || "#"}
                            target="_blank"
                            rel="noreferrer"
                            className="go-file-badge"
                            title={item.dutyGoName}
                          >
                            <FileText size={13} />
                            <span>GO Doc</span>
                          </a>
                        ) : (
                          <span className="sub-text">N/A</span>
                        )}
                      </td>
                      <td>
                        <span
                          className={`status-pill ${
                            item.status === "Active"
                              ? "status-pill-green"
                              : "status-pill-red"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="table-action-cell">
                        <button
                          className="action-button"
                          onClick={() => setViewDirector(item)}
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="action-button action-button-edit"
                          onClick={() => handleEdit(item)}
                          title="Edit Record"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="action-button action-button-danger"
                          onClick={() => handleDelete(item.id)}
                          title="Delete Record"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
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

      {/* ---------------- Print Table View ---------------- */}
      <div className="print-table-wrapper">
        <h2 className="print-title">Directors Official Directory & Duty Roles</h2>
        <p className="print-subtitle">
          Generated on {new Date().toLocaleDateString("en-GB")} · Total Records:{" "}
          {filteredDirectors.length}
        </p>
        <table className="projects-table print-table">
          <thead>
            <tr>
              <th>Name & Designation</th>
              <th>Office</th>
              <th>Contact</th>
              <th>Assigned Project</th>
              <th>Duty Role</th>
              <th>Assigned Date</th>
              <th>Release Date</th>
              <th>Duty GO</th>
            </tr>
          </thead>
          <tbody>
            {filteredDirectors.map((item) => (
              <tr key={item.id}>
                <td>
                  <strong>{item.name}</strong>
                  <br />
                  <small>{item.designation}</small>
                </td>
                <td>{item.office}</td>
                <td>
                  {item.contact}
                  <br />
                  {item.email}
                </td>
                <td>{item.projectName}</td>
                <td>{item.dutyRole}</td>
                <td>{item.assignedDate || "N/A"}</td>
                <td>{item.releaseDate || "N/A"}</td>
                <td>{item.dutyGoName || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---------------- View Profile Modal ---------------- */}
      {viewDirector && (
        <div className="modal-overlay no-print" onClick={() => setViewDirector(null)}>
          <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Director Details</h2>
              <button
                className="modal-close"
                onClick={() => setViewDirector(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-profile-header">
                <div className="profile-avatar">
                  {viewDirector.image ? (
                    <img src={viewDirector.image} alt={viewDirector.name} className="avatar-img-lg" />
                  ) : (
                    <User size={32} />
                  )}
                </div>
                <div>
                  <h3>{viewDirector.name}</h3>
                  <p className="sub-text">{viewDirector.designation}</p>
                  <span
                    className={`status-pill ${
                      viewDirector.status === "Active"
                        ? "status-pill-green"
                        : "status-pill-red"
                    }`}
                  >
                    {viewDirector.status}
                  </span>
                </div>
              </div>

              <div className="modal-section">
                <h4>Contact Details</h4>
                <div className="modal-grid">
                  <div className="modal-item">
                    <label>
                      <Briefcase size={14} /> Designation
                    </label>
                    <p>{viewDirector.designation}</p>
                  </div>
                  <div className="modal-item">
                    <label>
                      <Building size={14} /> Office / Department
                    </label>
                    <p>{viewDirector.office}</p>
                  </div>
                  <div className="modal-item">
                    <label>
                      <Phone size={14} /> Contact
                    </label>
                    <p>{viewDirector.contact}</p>
                  </div>
                  <div className="modal-item">
                    <label>
                      <Mail size={14} /> Email
                    </label>
                    <p>{viewDirector.email}</p>
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <h4>Assigned Project & GO Details</h4>
                <div className="project-history-card">
                  <div className="proj-card-header">
                    <h5>
                      <FolderKanban size={16} /> {viewDirector.projectName}
                    </h5>
                    <span className="duty-badge">{viewDirector.dutyRole}</span>
                  </div>
                  <div className="proj-card-details">
                    <span>
                      <Clock size={12} /> Assigned Date: {viewDirector.assignedDate || "N/A"}
                    </span>
                    <span>
                      <Clock size={12} /> Release Date: {viewDirector.releaseDate || "N/A"}
                    </span>
                    {viewDirector.dutyGoName && (
                      <span className="go-modal-link">
                        <FileText size={12} /> Duty GO Document:{" "}
                        <a href={viewDirector.dutyGoUrl || "#"} target="_blank" rel="noreferrer">
                          {viewDirector.dutyGoName} <ExternalLink size={10} />
                        </a>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="button-secondary"
                onClick={() => setViewDirector(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Director;