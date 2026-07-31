import React, { useState, useMemo } from "react";
import "./PhysicalProgress.css";
import {
  Plus,
  Search,
  Printer,
  Trash2,
  Edit2,
  Eye,
  Activity,
  AlertCircle,
  FileText,
  X,
  Briefcase,
  Calendar
} from "lucide-react";

// Predefined Projects List
const EXISTING_PROJECTS = [
  { id: "p1", name: "Highway Expansion Phase 2" },
  { id: "p2", name: "Metro Rail Line Extension" },
  { id: "p3", name: "Smart City Fiber Network" },
  { id: "p4", name: "Central Water Treatment Facility" }
];

const INITIAL_FORM_STATE = {
  id: null,
  projectId: "",
  projectName: "",
  completedQty: "",
  workDetails: "",
  progressDate: new Date().toISOString().split("T")[0]
};

const INITIAL_PROGRESS_RECORDS = [
  {
    id: 1,
    projectId: "p1",
    projectName: "Highway Expansion Phase 2",
    completedQty: 45,
    workDetails: "Asphalt laying completed for Section A & B",
    progressDate: "2026-07-15"
  },
  {
    id: 2,
    projectId: "p2",
    projectName: "Metro Rail Line Extension",
    completedQty: 80,
    workDetails: "Concrete foundation and pillar casting for Sector 4",
    progressDate: "2026-07-20"
  }
];

function PhysicalProgress() {
  const [records, setRecords] = useState(INITIAL_PROGRESS_RECORDS);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  // Search & Modal States
  const [searchTerm, setSearchTerm] = useState("");
  const [viewItem, setViewItem] = useState(null);

  // Handle Project Selection
  const handleProjectSelect = (e) => {
    const selectedId = e.target.value;
    const project = EXISTING_PROJECTS.find((p) => p.id === selectedId);

    if (project) {
      setFormData((prev) => ({
        ...prev,
        projectId: project.id,
        projectName: project.name
      }));
      if (errors.projectId) setErrors((prev) => ({ ...prev, projectId: null }));
    } else {
      setFormData((prev) => ({
        ...prev,
        projectId: "",
        projectName: ""
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  // Form Validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.projectId) newErrors.projectId = "Please select a project.";

    const qty = parseFloat(formData.completedQty);
    if (!formData.completedQty || qty <= 0) {
      newErrors.completedQty = "Enter a valid completed quantity.";
    }

    if (!formData.workDetails.trim()) {
      newErrors.workDetails = "Details of completed work are required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (isEditing) {
      setRecords((prev) =>
        prev.map((item) =>
          item.id === formData.id
            ? {
                ...formData,
                completedQty: parseFloat(formData.completedQty)
              }
            : item
        )
      );
      setIsEditing(false);
    } else {
      const newRecord = {
        ...formData,
        id: Date.now(),
        completedQty: parseFloat(formData.completedQty)
      };
      setRecords((prev) => [newRecord, ...prev]);
    }

    setFormData(INITIAL_FORM_STATE);
  };

  const handleEdit = (item) => {
    setFormData({ ...item });
    setIsEditing(true);
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this physical progress record?")) {
      setRecords((prev) => prev.filter((item) => item.id !== id));
      if (formData.id === id) {
        setFormData(INITIAL_FORM_STATE);
        setIsEditing(false);
      }
    }
  };

  const handleCancelEdit = () => {
    setFormData(INITIAL_FORM_STATE);
    setIsEditing(false);
    setErrors({});
  };

  // Filtered List based on search
  const filteredRecords = useMemo(() => {
    return records.filter((item) => {
      return (
        item.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.workDetails.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [records, searchTerm]);

  return (
    <div className="dashboard-page">
      {/* Physical Work Input Form */}
      <div className="dashboard-card no-print">
        <div className="dashboard-card-header">
          <h3>{isEditing ? "Edit Physical Progress" : "Record Physical Progress"}</h3>
          <Activity className="card-action-icon" size={20} />
        </div>

        <form onSubmit={handleSubmit} className="project-form">
          <div className="form-grid form-grid-2">
            {/* Project Dropdown */}
            <div className="form-group">
              <label>
                Select Project <span className="req-star">*</span>
              </label>
              <select
                name="projectId"
                value={formData.projectId}
                onChange={handleProjectSelect}
                className={errors.projectId ? "input-error" : ""}
              >
                <option value="">-- Choose Project --</option>
                {EXISTING_PROJECTS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              {errors.projectId && <span className="field-error">{errors.projectId}</span>}
            </div>

            {/* Completed Quantity */}
            <div className="form-group">
              <label>
                Completed Quantity / Progress Amount <span className="req-star">*</span>
              </label>
              <input
                type="number"
                name="completedQty"
                placeholder="e.g. 25"
                value={formData.completedQty}
                onChange={handleInputChange}
                className={errors.completedQty ? "input-error" : ""}
              />
              {errors.completedQty && <span className="field-error">{errors.completedQty}</span>}
            </div>
          </div>

          {/* Details of Physical Work Done */}
          <div className="form-group">
            <label>
              Work Progress Details / Description <span className="req-star">*</span>
            </label>
            <input
              type="text"
              name="workDetails"
              placeholder="e.g. Excavation complete, 500m cabling installed..."
              value={formData.workDetails}
              onChange={handleInputChange}
              className={errors.workDetails ? "input-error" : ""}
            />
            {errors.workDetails && <span className="field-error">{errors.workDetails}</span>}
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            {isEditing && <span className="editing-badge">Editing Record #{formData.id}</span>}
            {isEditing && (
              <button type="button" onClick={handleCancelEdit} className="button-secondary">
                Cancel
              </button>
            )}
            <button type="submit" className="button-primary">
              <Plus size={16} /> {isEditing ? "Update Record" : "Add Physical Record"}
            </button>
          </div>
        </form>
      </div>

      {/* Physical Progress Table Ledger */}
      <div className="dashboard-card no-print">
        <div className="dashboard-card-header">
          <h3>Physical Work Progress Ledger</h3>
          <div className="header-actions">
            <div className="search-box">
              <Search size={14} className="search-icon" />
              <input
                type="text"
                placeholder="Search details or project..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button onClick={() => window.print()} className="button-secondary print-btn" title="Print Ledger">
              <Printer size={14} /> Print
            </button>
          </div>
        </div>

        <div className="table-overflow">
          <table className="projects-table">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Completed Work</th>
                <th>Work Progress Details</th>
                <th>Date</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length > 0 ? (
                filteredRecords.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span className="project-name-tag">{item.projectName}</span>
                    </td>
                    <td style={{ fontWeight: 600, color: "var(--primary-color)" }}>
                      +{item.completedQty}
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                        <FileText size={14} className="sub-text" />
                        <span>{item.workDetails}</span>
                      </div>
                    </td>
                    <td className="sub-text">{item.progressDate}</td>
                    <td>
                      <div className="table-action-cell" style={{ justifyContent: "flex-end" }}>
                        <button
                          onClick={() => setViewItem(item)}
                          className="action-button"
                          title="View Details"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => handleEdit(item)}
                          className="action-button action-button-edit"
                          title="Edit Record"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="action-button action-button-danger"
                          title="Delete Record"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">
                    <div className="empty-state">
                      <AlertCircle size={32} />
                      <p>No physical progress records found matching your search.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Detail Modal */}
      {viewItem && (
        <div className="modal-overlay" onClick={() => setViewItem(null)}>
          <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Physical Work Details</h2>
              <button className="modal-close" onClick={() => setViewItem(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-profile-header">
                <div className="profile-avatar">
                  <Briefcase size={28} />
                </div>
                <div>
                  <h3>{viewItem.projectName}</h3>
                  <span className="sub-text">Record ID: #{viewItem.id}</span>
                </div>
              </div>

              <div className="modal-grid">
                <div className="modal-item">
                  <label><Activity size={12} /> Logged Progress</label>
                  <p style={{ color: "var(--primary-color)" }}>
                    +{viewItem.completedQty}
                  </p>
                </div>

                <div className="modal-item">
                  <label><Calendar size={12} /> Date Recorded</label>
                  <p>{viewItem.progressDate}</p>
                </div>
              </div>

              <div className="project-history-card">
                <div className="proj-card-header">
                  <h5>Work Progress Description</h5>
                </div>
                <div className="proj-card-details">
                  <p style={{ margin: 0, fontSize: "0.9375rem", color: "var(--text-main)" }}>
                    {viewItem.workDetails}
                  </p>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="button-secondary" onClick={() => setViewItem(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print View Layout */}
      <div className="print-table-wrapper">
        <h1 className="print-title">Physical Progress Ledger</h1>
        <p className="print-subtitle">Date Generated: {new Date().toLocaleDateString()}</p>
        <table className="print-table" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Completed Work</th>
              <th>Work Progress Details</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {records.map((item) => (
              <tr key={item.id}>
                <td>{item.projectName}</td>
                <td>{item.completedQty}</td>
                <td>{item.workDetails}</td>
                <td>{item.progressDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default PhysicalProgress;