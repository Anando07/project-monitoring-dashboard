import React, { useState, useMemo } from "react";
import "./Users.css";
import {
  UserPlus,
  Search,
  Printer,
  Trash2,
  Edit2,
  Eye,
  UserCheck,
  Building2,
  Mail,
  Phone,
  Shield,
  X,
  AlertCircle,
  Image as ImageIcon,
  Building,
  Upload,
  RotateCcw,
  CheckCircle,
  XCircle
} from "lucide-react";

// Predefined Ministry / Division List
const MINISTRIES_DIVISIONS = [
  "Road Transport and Highways Division",
  "Power Division",
  "Local Government Division",
  "Bridges Division",
  "Information and Communication Technology Division",
  "Ministry of Water Resources",
  "Ministry of Housing and Public Works"
];

// Updated User Roles
const USER_ROLES = [
  "Administrator",
  "Super Admin",
  "Admin",
  "Visitor",
  "Project Director",
  "Assistant Project Director",
  "Project Officer",
  "Project Engineer",
  "Project Supervisor",
  "Entry User",
  "User Add Role",
  "No Role",
];

const INITIAL_FORM_STATE = {
  id: null,
  fullName: "",
  designation: "",
  officeName: "",
  role: "Admin",
  ministryDivision: "",
  email: "",
  phone: "",
  status: "Active",
  avatar: ""
};

const INITIAL_USERS = [
  {
    id: 1,
    fullName: "A. S. M. Kabir",
    designation: "Director General",
    officeName: "Headquarters, Dhaka",
    role: "Super Admin",
    ministryDivision: "Road Transport and Highways Division",
    email: "asm.kabir@rthd.gov.bd",
    phone: "+880 1711-000000",
    status: "Active",
    avatar: ""
  },
  {
    id: 2,
    fullName: "Nusrat Jahan",
    designation: "Deputy Director (Planning)",
    officeName: "Planning & Development Wing",
    role: "Admin",
    ministryDivision: "Local Government Division",
    email: "nusrat.j@lgd.gov.bd",
    phone: "+880 1819-111222",
    status: "Inactive",
    avatar: ""
  }
];

function Users() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  // Search & Modal States
  const [searchTerm, setSearchTerm] = useState("");
  const [viewItem, setViewItem] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  // Image File Upload Handler (Optional Field)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, avatar: "Image size should be less than 2MB." }));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, avatar: reader.result }));
        if (errors.avatar) setErrors((prev) => ({ ...prev, avatar: null }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, avatar: "" }));
  };

  // Reset Form Handler
  const handleReset = () => {
    setFormData(INITIAL_FORM_STATE);
    setErrors({});
    setIsEditing(false);
  };

  // Strict Validation: All non-image fields are required
  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required.";
    if (!formData.designation.trim()) newErrors.designation = "Designation is required.";
    if (!formData.officeName.trim()) newErrors.officeName = "Office name / Wing is required.";
    if (!formData.ministryDivision) newErrors.ministryDivision = "Select a Ministry or Division.";
    if (!formData.role) newErrors.role = "Role Privilege is required.";
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Enter a valid email address.";
    }
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required.";
    if (!formData.status) newErrors.status = "User Status is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (isEditing) {
      setUsers((prev) =>
        prev.map((item) => (item.id === formData.id ? { ...formData } : item))
      );
      setIsEditing(false);
    } else {
      const newUser = {
        ...formData,
        id: Date.now()
      };
      setUsers((prev) => [newUser, ...prev]);
    }

    setFormData(INITIAL_FORM_STATE);
    setErrors({});
  };

  const handleEdit = (item) => {
    setFormData({ ...item });
    setIsEditing(true);
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to remove this user account?")) {
      setUsers((prev) => prev.filter((item) => item.id !== id));
      if (formData.id === id) {
        handleReset();
      }
    }
  };

  // Search Filtering
  const filteredUsers = useMemo(() => {
    return users.filter((item) => {
      const query = searchTerm.toLowerCase();
      return (
        item.fullName.toLowerCase().includes(query) ||
        item.designation.toLowerCase().includes(query) ||
        (item.officeName && item.officeName.toLowerCase().includes(query)) ||
        item.ministryDivision.toLowerCase().includes(query) ||
        item.role.toLowerCase().includes(query) ||
        item.status.toLowerCase().includes(query)
      );
    });
  }, [users, searchTerm]);

  return (
    <div className="dashboard-page">
      {/* User Input Form Card */}
      <div className="dashboard-card no-print">
        <div className="dashboard-card-header">
          <h3>{isEditing ? "Edit User Record" : "Add Director / Officer User"}</h3>
          <UserCheck className="card-action-icon" size={20} />
        </div>

        <form onSubmit={handleSubmit} className="project-form">
          {/* Row 1: Full Name, Designation, Office Name */}
          <div className="form-grid form-grid-3">
            {/* Full Name */}
            <div className="form-group">
              <label>
                Full Name <span className="req-star">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                placeholder="e.g. A. S. M. Kabir"
                value={formData.fullName}
                onChange={handleInputChange}
                className={errors.fullName ? "input-error" : ""}
              />
              {errors.fullName && <span className="field-error">{errors.fullName}</span>}
            </div>

            {/* Designation */}
            <div className="form-group">
              <label>
                Designation <span className="req-star">*</span>
              </label>
              <input
                type="text"
                name="designation"
                placeholder="e.g. Director General / Additional Secretary"
                value={formData.designation}
                onChange={handleInputChange}
                className={errors.designation ? "input-error" : ""}
              />
              {errors.designation && <span className="field-error">{errors.designation}</span>}
            </div>

            {/* Office Name */}
            <div className="form-group">
              <label>
                Office Name / Department / Wing <span className="req-star">*</span>
              </label>
              <input
                type="text"
                name="officeName"
                placeholder="e.g. HQ Secretariat / Planning Division"
                value={formData.officeName}
                onChange={handleInputChange}
                className={errors.officeName ? "input-error" : ""}
              />
              {errors.officeName && <span className="field-error">{errors.officeName}</span>}
            </div>
          </div>

          {/* Row 2: Ministry, Email, Phone Number */}
          <div className="form-grid form-grid-3">
            {/* Ministry / Division */}
            <div className="form-group">
              <label>
                Ministry / Division <span className="req-star">*</span>
              </label>
              <select
                name="ministryDivision"
                value={formData.ministryDivision}
                onChange={handleInputChange}
                className={errors.ministryDivision ? "input-error" : ""}
              >
                <option value="">-- Select Ministry / Division --</option>
                {MINISTRIES_DIVISIONS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              {errors.ministryDivision && (
                <span className="field-error">{errors.ministryDivision}</span>
              )}
            </div>

            {/* Email */}
            <div className="form-group">
              <label>
                Email Address <span className="req-star">*</span>
              </label>
              <input
                type="email"
                name="email"
                placeholder="official@domain.gov.bd"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? "input-error" : ""}
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            {/* Phone Number */}
            <div className="form-group">
              <label>
                Phone Number <span className="req-star">*</span>
              </label>
              <input
                type="text"
                name="phone"
                placeholder="+880 1700-000000"
                value={formData.phone}
                onChange={handleInputChange}
                className={errors.phone ? "input-error" : ""}
              />
              {errors.phone && <span className="field-error">{errors.phone}</span>}
            </div>
          </div>

          {/* Row 3: Role Privilege, Status (Before Image Field), Profile Photo Upload */}
          <div className="form-grid form-grid-3" style={{ marginTop: "0.5rem", alignItems: "flex-start" }}>
            {/* Role Privilege */}
            <div className="form-group">
              <label>
                Role Privilege <span className="req-star">*</span>
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className={errors.role ? "input-error" : ""}
              >
                {USER_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              {errors.role && <span className="field-error">{errors.role}</span>}
            </div>

            {/* Status Field (Positioned directly before Profile Photo) */}
            <div className="form-group">
              <label>
                User Status <span className="req-star">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className={errors.status ? "input-error" : ""}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              {errors.status && <span className="field-error">{errors.status}</span>}
            </div>

            {/* Profile Photo (Optional Field) */}
            <div className="form-group">
              <label>
                Profile Photo <span className="sub-text">(Optional, Max 2MB)</span>
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    backgroundColor: "#f1f5f9",
                    border: "1px dashed #cbd5e1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    flexShrink: 0
                  }}
                >
                  {formData.avatar ? (
                    <img
                      src={formData.avatar}
                      alt="Preview"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <ImageIcon size={18} style={{ color: "#94a3b8" }} />
                  )}
                </div>

                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <label className="button-secondary" style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}>
                    <Upload size={14} /> Upload Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: "none" }}
                    />
                  </label>
                  {formData.avatar && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="button-secondary"
                      style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem", color: "#ef4444" }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
              {errors.avatar && <span className="field-error">{errors.avatar}</span>}
            </div>
          </div>

          {/* Form Actions with Reset Button */}
          <div className="form-actions">
            {isEditing && <span className="editing-badge">Editing User #{formData.id}</span>}

            <button
              type="button"
              onClick={handleReset}
              className="button-secondary"
              title="Reset Form"
            >
              <RotateCcw size={15} /> Reset
            </button>

            <button type="submit" className="button-primary">
              <UserPlus size={16} /> {isEditing ? "Update User" : "Add User Record"}
            </button>
          </div>
        </form>
      </div>

      {/* Directory Table Card */}
      <div className="dashboard-card no-print">
        <div className="dashboard-card-header">
          <h3>Director / Officer Directory</h3>
          <div className="header-actions">
            <div className="search-box">
              <Search size={14} className="search-icon" />
              <input
                type="text"
                placeholder="Search name, status, role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button
              onClick={() => window.print()}
              className="button-secondary print-btn"
              title="Print User List"
            >
              <Printer size={14} /> Print
            </button>
          </div>
        </div>

        <div className="table-overflow">
          <table className="projects-table">
            <thead>
              <tr>
                <th>Officer Details</th>
                <th>Designation & Office</th>
                <th>Ministry & Role</th>
                <th>Status</th>
                <th>Contact Information</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div
                          style={{
                            width: "38px",
                            height: "38px",
                            borderRadius: "50%",
                            backgroundColor: "#e2e8f0",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                            flexShrink: 0
                          }}
                        >
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.fullName}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          ) : (
                            <Shield size={18} style={{ color: "#64748b" }} />
                          )}
                        </div>
                        <div>
                          <div className="project-name-tag">{user.fullName}</div>
                          <span className="sub-text">ID: #{user.id}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{user.designation}</div>
                      {user.officeName && (
                        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginTop: "0.2rem" }} className="sub-text">
                          <Building size={12} />
                          <span>{user.officeName}</span>
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                        <Building2 size={14} className="sub-text" />
                        <span>{user.ministryDivision}</span>
                      </div>
                      <span className="duty-pill duty-pill-blue" style={{ marginTop: "0.25rem", display: "inline-block" }}>{user.role}</span>
                    </td>
                    <td>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.3rem",
                          padding: "0.2rem 0.55rem",
                          borderRadius: "9999px",
                          fontSize: "0.75rem",
                          fontWeight: 500,
                          backgroundColor: user.status === "Active" ? "#dcfce7" : "#fef2f2",
                          color: user.status === "Active" ? "#166534" : "#991b1b"
                        }}
                      >
                        {user.status === "Active" ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        {user.status}
                      </span>
                    </td>
                    <td>
                      <div className="sub-text">{user.email}</div>
                      <div className="sub-text">{user.phone}</div>
                    </td>
                    <td>
                      <div className="table-action-cell" style={{ justifyContent: "flex-end" }}>
                        <button
                          onClick={() => setViewItem(user)}
                          className="action-button"
                          title="View Profile"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => handleEdit(user)}
                          className="action-button action-button-edit"
                          title="Edit User"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="action-button action-button-danger"
                          title="Delete User"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">
                    <div className="empty-state">
                      <AlertCircle size={32} />
                      <p>No user records found matching your search parameters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Profile Detail View Modal */}
      {viewItem && (
        <div className="modal-overlay" onClick={() => setViewItem(null)}>
          <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Officer Profile Details</h2>
              <button className="modal-close" onClick={() => setViewItem(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-profile-header">
                <div
                  className="profile-avatar"
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#e2e8f0"
                  }}
                >
                  {viewItem.avatar ? (
                    <img
                      src={viewItem.avatar}
                      alt={viewItem.fullName}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <Shield size={28} />
                  )}
                </div>
                <div>
                  <h3>{viewItem.fullName}</h3>
                  <p className="sub-text" style={{ margin: 0 }}>
                    {viewItem.designation}
                  </p>
                </div>
              </div>

              <div className="modal-grid">
                <div className="modal-item">
                  <label>
                    <Building size={12} /> Office / Department
                  </label>
                  <p>{viewItem.officeName || "N/A"}</p>
                </div>

                <div className="modal-item">
                  <label>
                    <Building2 size={12} /> Ministry / Division
                  </label>
                  <p>{viewItem.ministryDivision}</p>
                </div>

                <div className="modal-item">
                  <label>
                    <Shield size={12} /> System Role
                  </label>
                  <p>{viewItem.role}</p>
                </div>

                <div className="modal-item">
                  <label>
                    <UserCheck size={12} /> Status
                  </label>
                  <p>{viewItem.status}</p>
                </div>

                <div className="modal-item">
                  <label>
                    <Mail size={12} /> Email Address
                  </label>
                  <p style={{ fontSize: "0.875rem" }}>{viewItem.email}</p>
                </div>

                <div className="modal-item">
                  <label>
                    <Phone size={12} /> Phone Number
                  </label>
                  <p style={{ fontSize: "0.875rem" }}>{viewItem.phone}</p>
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
        <h1 className="print-title">Director / Officer Directory</h1>
        <p className="print-subtitle">Date Generated: {new Date().toLocaleDateString()}</p>
        <table className="print-table" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Designation</th>
              <th>Office Name</th>
              <th>Ministry / Division</th>
              <th>Role</th>
              <th>Status</th>
              <th>Contact Details</th>
            </tr>
          </thead>
          <tbody>
            {users.map((item) => (
              <tr key={item.id}>
                <td>{item.fullName}</td>
                <td>{item.designation}</td>
                <td>{item.officeName || "-"}</td>
                <td>{item.ministryDivision}</td>
                <td>{item.role}</td>
                <td>{item.status}</td>
                <td>
                  {item.email} | {item.phone}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Users;