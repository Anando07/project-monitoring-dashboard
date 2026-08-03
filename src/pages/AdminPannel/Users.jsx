import React, { useState, useEffect, useMemo } from "react";
import {
  getAllUsers,
  createUserApi,
  updateUserApi,
  deleteUserApi,
  getAllRoles,
  getAllMinistries
} from "../../services/UserService";
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
  XCircle,
  Loader,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2 MB

const INITIAL_FORM_STATE = {
  id: null,
  name: "",
  designation: "",
  officeName: "",
  roleId: "",
  minDiv: "",
  email: "",
  number: "",
  active: true,
  avatar: ""
};

const USERS_PER_PAGE = 10;

function Users() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [ministries, setMinistries] = useState([]);

  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  // Search, Modal & Pagination States
  const [searchTerm, setSearchTerm] = useState("");
  const [viewItem, setViewItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch initial data from Database on load
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Reset pagination to page 1 whenever search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const fetchInitialData = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const [usersRes, rolesRes, ministriesRes] = await Promise.all([
        getAllUsers(),
        getAllRoles(),
        getAllMinistries()
      ]);

      setUsers(usersRes.data || []);
      setRoles(rolesRes.data || []);
      setMinistries(ministriesRes.data || []);

      if (rolesRes.data && rolesRes.data.length > 0) {
        setFormData((prev) => ({ ...prev, roleId: rolesRes.data[0].id }));
      }
      setLoading(false);
    } catch (error) {
      console.error("Failed to load initial data:", error);
      setApiError("Unable to fetch user list or reference data from server.");
      setLoading(false);
    }
  };

  const fetchUsers = () => {
    getAllUsers()
      .then((response) => setUsers(response.data || []))
      .catch((err) => console.error("Error refreshing users:", err));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "active") {
      setFormData((prev) => ({ ...prev, active: value === "true" }));
    } else if (name === "roleId") {
      setFormData((prev) => ({ ...prev, roleId: Number(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  // Image Upload Handler (aligned with Projects.jsx handleImagesChange pattern)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, avatar: "Please select a valid image file." }));
      e.target.value = "";
      return;
    }

    if (file.size > MAX_AVATAR_BYTES) {
      setErrors((prev) => ({ ...prev, avatar: "Image size should be less than 2MB." }));
      e.target.value = "";
      return;
    }

    if (errors.avatar) setErrors((prev) => ({ ...prev, avatar: null }));

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, avatar: reader.result }));
    };
    reader.readAsDataURL(file);

    e.target.value = "";
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, avatar: "" }));
    if (errors.avatar) setErrors((prev) => ({ ...prev, avatar: null }));
  };

  const handleReset = () => {
    setFormData({
      ...INITIAL_FORM_STATE,
      roleId: roles.length > 0 ? roles[0].id : ""
    });
    setErrors({});
    setIsEditing(false);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Full name is required.";
    if (!formData.designation.trim()) newErrors.designation = "Designation is required.";
    if (!formData.officeName.trim()) newErrors.officeName = "Office name is required.";
    if (!formData.minDiv) newErrors.minDiv = "Select a Ministry or Division.";
    if (!formData.roleId) newErrors.roleId = "Role Privilege is required.";
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Enter a valid email address.";
    }
    if (!formData.number.trim()) newErrors.number = "Phone number is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (isEditing) {
      updateUserApi(formData.id, formData)
        .then(() => {
          fetchUsers();
          handleReset();
        })
        .catch((error) => {
          console.error("Error updating user:", error);
          alert("Failed to update user. Check backend server.");
        });
    } else {
      createUserApi(formData)
        .then(() => {
          fetchUsers();
          handleReset();
        })
        .catch((error) => {
          console.error("Error creating user:", error);
          alert("Failed to save user. Check backend server.");
        });
    }
  };

  const handleEdit = (user) => {
    setFormData({
      id: user.id,
      name: user.name || "",
      designation: user.designation || "",
      officeName: user.officeName || "",
      roleId: user.roleId || (roles.length > 0 ? roles[0].id : ""),
      minDiv: user.minDiv || "",
      email: user.email || "",
      number: user.number || "",
      active: user.active ?? true,
      avatar: user.avatar || ""
    });
    setIsEditing(true);
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to remove this user account?")) {
      deleteUserApi(id)
        .then(() => {
          fetchUsers();
          if (formData.id === id) handleReset();
        })
        .catch((error) => {
          console.error("Error deleting user:", error);
          alert("Could not delete user.");
        });
    }
  };

  // Helper to resolve role name
  const getRoleName = (roleId, fallbackRoleName) => {
    if (fallbackRoleName) return fallbackRoleName;
    const found = roles.find((r) => r.id === roleId);
    return found ? found.roleName : "User";
  };

  // Helper to determine status boolean
  const isUserActive = (status) => {
    if (typeof status === "boolean") return status;
    if (typeof status === "string") return status.toLowerCase() === "active" || status === "true";
    return true;
  };

  // Search Filtering
  const filteredUsers = useMemo(() => {
    return users.filter((item) => {
      const query = searchTerm.toLowerCase();
      const roleName = getRoleName(item.roleId, item.roleName).toLowerCase();
      const statusString = isUserActive(item.active !== undefined ? item.active : item.status) ? "active" : "inactive";

      return (
        (item.name && item.name.toLowerCase().includes(query)) ||
        (item.designation && item.designation.toLowerCase().includes(query)) ||
        (item.officeName && item.officeName.toLowerCase().includes(query)) ||
        (item.minDiv && item.minDiv.toLowerCase().includes(query)) ||
        roleName.includes(query) ||
        statusString.includes(query) ||
        (item.email && item.email.toLowerCase().includes(query)) ||
        (item.number && item.number.toLowerCase().includes(query))
      );
    });
  }, [users, searchTerm, roles]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE) || 1;
  const currentUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * USERS_PER_PAGE;
    return filteredUsers.slice(startIndex, startIndex + USERS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  return (
    <div className="container-fluid py-4 bg-light">
      {/* User Input Form Card */}
      <div className="card shadow-sm mb-4 border-0">
        <div className="card-header bg-white d-flex justify-content-between align-items-center py-3 border-bottom">
          <h5 className="mb-0 text-primary fw-bold">
            {isEditing ? "Edit User Record" : "Add Director / Officer User"}
          </h5>
          <UserCheck className="text-primary" size={22} />
        </div>

        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            {/* Row 1: Name, Designation, Office */}
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label className="form-label fw-semibold">
                  Full Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Anando Kumar Biswas"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`form-control ${errors.name ? "is-invalid" : ""}`}
                />
                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold">
                  Designation <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="designation"
                  placeholder="e.g. Assistant Programmer"
                  value={formData.designation}
                  onChange={handleInputChange}
                  className={`form-control ${errors.designation ? "is-invalid" : ""}`}
                />
                {errors.designation && <div className="invalid-feedback">{errors.designation}</div>}
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold">
                  Office Name / Department <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="officeName"
                  placeholder="e.g. IRD HQ"
                  value={formData.officeName}
                  onChange={handleInputChange}
                  className={`form-control ${errors.officeName ? "is-invalid" : ""}`}
                />
                {errors.officeName && <div className="invalid-feedback">{errors.officeName}</div>}
              </div>
            </div>

            {/* Row 2: Ministry (DB), Email, Phone */}
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label className="form-label fw-semibold">
                  Ministry / Division <span className="text-danger">*</span>
                </label>
                <select
                  name="minDiv"
                  value={formData.minDiv}
                  onChange={handleInputChange}
                  className={`form-select ${errors.minDiv ? "is-invalid" : ""}`}
                >
                  <option value="">-- Select Ministry / Division --</option>
                  {ministries.map((m) => (
                    <option key={m.id || m.minName} value={m.minName}>
                      {m.minName}
                    </option>
                  ))}
                </select>
                {errors.minDiv && <div className="invalid-feedback">{errors.minDiv}</div>}
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold">
                  Email Address <span className="text-danger">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="abku07@gmail.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`form-control ${errors.email ? "is-invalid" : ""}`}
                />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold">
                  Phone Number <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="number"
                  placeholder="01790012288"
                  value={formData.number}
                  onChange={handleInputChange}
                  className={`form-control ${errors.number ? "is-invalid" : ""}`}
                />
                {errors.number && <div className="invalid-feedback">{errors.number}</div>}
              </div>
            </div>

            {/* Row 3: Role (DB), Status, Photo */}
            <div className="row g-3 mb-3 align-items-start">
              <div className="col-md-4">
                <label className="form-label fw-semibold">
                  Role Privilege <span className="text-danger">*</span>
                </label>
                <select
                  name="roleId"
                  value={formData.roleId}
                  onChange={handleInputChange}
                  className={`form-select ${errors.roleId ? "is-invalid" : ""}`}
                >
                  <option value="">-- Select Role --</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.roleName}
                    </option>
                  ))}
                </select>
                {errors.roleId && <div className="invalid-feedback">{errors.roleId}</div>}
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold">
                  User Status <span className="text-danger">*</span>
                </label>
                <select
                  name="active"
                  value={formData.active.toString()}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold">
                  Profile Photo <span className="text-muted small">(Optional, Max 2MB)</span>
                </label>
                <div className="d-flex align-items-center gap-2">
                  <div
                    className="border rounded-circle bg-light d-flex align-items-center justify-content-center overflow-hidden flex-shrink-0"
                    style={{ width: "44px", height: "44px" }}
                  >
                    {formData.avatar ? (
                      <img
                        src={formData.avatar}
                        alt="Preview"
                        className="w-100 h-100 object-fit-cover"
                      />
                    ) : (
                      <ImageIcon size={18} className="text-secondary" />
                    )}
                  </div>
                  <label className="btn btn-outline-secondary btn-sm mb-0 d-inline-flex align-items-center gap-1">
                    <Upload size={14} /> Upload Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="d-none"
                    />
                  </label>
                  {formData.avatar && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="btn btn-outline-danger btn-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
                {errors.avatar && <div className="text-danger small mt-1">{errors.avatar}</div>}
              </div>
            </div>

            {/* Form Actions */}
            <div className="d-flex justify-content-end align-items-center gap-2 pt-3 border-top mt-3">
              {isEditing && (
                <span className="badge bg-warning text-dark me-auto fs-6">
                  Editing Record
                </span>
              )}

              <button
                type="button"
                onClick={handleReset}
                className="btn btn-outline-secondary d-inline-flex align-items-center gap-1"
              >
                <RotateCcw size={15} /> Reset
              </button>

              <button
                type="submit"
                className="btn btn-primary d-inline-flex align-items-center gap-1 px-3"
              >
                <UserPlus size={16} /> {isEditing ? "Update User" : "Add User Record"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Directory Table Card */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white d-flex flex-wrap justify-content-between align-items-center py-3 gap-2 border-bottom">
          <div>
            <h5 className="mb-0 fw-bold text-dark">Director / Officer Directory</h5>
            <small className="text-muted">Total Records: {filteredUsers.length}</small>
          </div>
          <div className="d-flex align-items-center gap-2">
            <div className="input-group input-group-sm" style={{ width: "260px" }}>
              <span className="input-group-text bg-light border-end-0">
                <Search size={14} />
              </span>
              <input
                type="text"
                className="form-control bg-light border-start-0"
                placeholder="Search name, designation, status..."
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
                <p className="mt-2 text-muted">Fetching user data from database...</p>
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
                    <th style={{ width: "26%" }}>Name & Designation</th>
                    <th style={{ width: "25%" }}>Office & Ministry</th>
                    <th style={{ width: "16%" }}>Role</th>
                    <th style={{ width: "12%" }}>Status</th>
                    <th style={{ width: "13%" }}>Contact Info</th>
                    <th style={{ width: "8%" }} className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.length > 0 ? (
                    currentUsers.map((user) => {
                      const activeStatus = isUserActive(user.active !== undefined ? user.active : user.status);
                      return (
                        <tr key={user.id} style={{ verticalAlign: "middle" }}>
                          {/* 1. Name & Designation */}
                          <td className="align-middle">
                            <div className="d-flex align-items-center gap-2 py-1">
                              <div
                                className="border rounded-circle bg-light d-flex align-items-center justify-content-center overflow-hidden flex-shrink-0"
                                style={{ width: "40px", height: "40px" }}
                              >
                                {user.avatar ? (
                                  <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="w-100 h-100 object-fit-cover"
                                  />
                                ) : (
                                  <Shield size={18} className="text-secondary" />
                                )}
                              </div>
                              <div>
                                <div className="fw-bold text-dark lh-sm">{user.name}</div>
                                <small className="text-secondary fw-semibold d-block mt-1">{user.designation}</small>
                              </div>
                            </div>
                          </td>

                          {/* 2. Office & Ministry */}
                          <td className="align-middle">
                            <div className="fw-semibold text-dark d-flex align-items-center gap-1 lh-sm">
                              <Building size={13} className="text-muted flex-shrink-0" />
                              <span>{user.officeName || "N/A"}</span>
                            </div>
                            <small className="text-muted d-flex align-items-center gap-1 mt-1">
                              <Building2 size={12} className="flex-shrink-0" />
                              <span>{user.minDiv}</span>
                            </small>
                          </td>

                          {/* 3. Role */}
                          <td className="align-middle">
                            <span className=" bg-primary-subtle text-primary border border-primary-subtle px-2 py-1">
                              {getRoleName(user.roleId, user.roleName)}
                            </span>
                          </td>

                          {/* 4. Status */}
                          <td className="align-middle">
                            <span
                              className={` rounded-pill d-inline-flex align-items-center gap-1 px-2 py-1 ${
                                activeStatus
                                  ? "bg-success-subtle text-success border border-success-subtle"
                                  : "bg-danger-subtle text-danger border border-danger-subtle"
                              }`}
                              style={{ fontSize: "0.78rem" }}
                            >
                              {activeStatus ? <CheckCircle size={12} /> : <XCircle size={12} />}
                              <span>{activeStatus ? "Active" : "Inactive"}</span>
                            </span>
                          </td>

                          {/* 5. Contact Info */}
                          <td className="align-middle">
                            <small className="d-block text-dark font-monospace lh-sm">{user.email}</small>
                            <small className="d-block text-muted mt-1">{user.number}</small>
                          </td>

                          {/* 6. Actions */}
                          <td className="text-end align-middle">
                            <div className="btn-group btn-group-sm">
                              <button
                                onClick={() => setViewItem(user)}
                                className="btn btn-outline-secondary"
                                title="View Profile"
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                onClick={() => handleEdit(user)}
                                className="btn btn-outline-primary"
                                title="Edit User"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDelete(user.id)}
                                className="btn btn-outline-danger"
                                title="Delete User"
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
                      <td colSpan="6" className="text-center py-5 text-muted">
                        <AlertCircle size={32} className="mb-2" />
                        <p className="mb-0">No user records found matching your search parameters.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* 10 Items per Page Pagination Footer */}
        {!loading && !apiError && filteredUsers.length > 0 && (
          <div className="card-footer bg-white d-flex flex-wrap justify-content-between align-items-center py-3 border-top">
            <small className="text-muted">
              Showing {Math.min((currentPage - 1) * USERS_PER_PAGE + 1, filteredUsers.length)} to{" "}
              {Math.min(currentPage * USERS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length} entries
            </small>

            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                <button
                  className="page-item-link btn btn-sm btn-outline-secondary me-1"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={14} /> Prev
                </button>
              </li>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <li key={page} className="page-item me-1">
                  <button
                    className={`btn btn-sm ${
                      currentPage === page ? "btn-primary" : "btn-outline-secondary"
                    }`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                </li>
              ))}

              <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next <ChevronRight size={14} />
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Profile Detail View Modal */}
      {viewItem && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setViewItem(null)}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-light">
                <h5 className="modal-title fw-bold text-dark">Officer Profile Details</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setViewItem(null)}
                ></button>
              </div>

              <div className="modal-body p-4">
                <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
                  <div
                    className="border rounded-circle bg-light d-flex align-items-center justify-content-center overflow-hidden flex-shrink-0"
                    style={{ width: "56px", height: "56px" }}
                  >
                    {viewItem.avatar ? (
                      <img
                        src={viewItem.avatar}
                        alt={viewItem.name}
                        className="w-100 h-100 object-fit-cover"
                      />
                    ) : (
                      <Shield size={28} className="text-secondary" />
                    )}
                  </div>
                  <div>
                    <h5 className="mb-0 fw-bold">{viewItem.name}</h5>
                    <p className="text-muted mb-0">{viewItem.designation}</p>
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="text-muted small d-block mb-1">
                      <Building size={12} className="me-1" /> Office / Department
                    </label>
                    <p className="fw-semibold text-dark mb-0">{viewItem.officeName || "N/A"}</p>
                  </div>

                  <div className="col-md-6">
                    <label className="text-muted small d-block mb-1">
                      <Building2 size={12} className="me-1" /> Ministry / Division
                    </label>
                    <p className="fw-semibold text-dark mb-0">{viewItem.minDiv}</p>
                  </div>

                  <div className="col-md-6">
                    <label className="text-muted small d-block mb-1">
                      <Shield size={12} className="me-1" /> System Role
                    </label>
                    <p className="fw-semibold text-dark mb-0">{getRoleName(viewItem.roleId, viewItem.roleName)}</p>
                  </div>

                  <div className="col-md-6">
                    <label className="text-muted small d-block mb-1">
                      <UserCheck size={12} className="me-1" /> Status
                    </label>
                    <p className="fw-semibold text-dark mb-0">
                      {isUserActive(viewItem.active !== undefined ? viewItem.active : viewItem.status)
                        ? "Active"
                        : "Inactive"}
                    </p>
                  </div>

                  <div className="col-md-6">
                    <label className="text-muted small d-block mb-1">
                      <Mail size={12} className="me-1" /> Email Address
                    </label>
                    <p className="fw-semibold text-dark mb-0">{viewItem.email}</p>
                  </div>

                  <div className="col-md-6">
                    <label className="text-muted small d-block mb-1">
                      <Phone size={12} className="me-1" /> Phone Number
                    </label>
                    <p className="fw-semibold text-dark mb-0">{viewItem.number}</p>
                  </div>
                </div>
              </div>

              <div className="modal-footer bg-light">
                <button
                  type="button"
                  className="btn btn-secondary px-4"
                  onClick={() => setViewItem(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Printable / PDF Export Section */}
      <div className="pms-print-only">
        <style>{`
          @media screen {
            .pms-print-only {
              display: none !important;
            }
          }
          @media print {
            body * {
              visibility: hidden !important;
            }
            .pms-print-only, .pms-print-only * {
              visibility: visible !important;
            }
            .pms-print-only {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              display: block !important;
              padding: 20px !important;
              background: #fff !important;
            }
            .pms-print-table {
              width: 100% !important;
              border-collapse: collapse !important;
              margin-top: 15px !important;
            }
            .pms-print-table th, .pms-print-table td {
              border: 1px solid #000 !important;
              padding: 8px 10px !important;
              font-size: 12px !important;
              vertical-align: top !important;
            }
            .pms-print-table th {
              background-color: #f2f2f2 !important;
              font-weight: bold !important;
              -webkit-print-color-adjust: exact;
            }
          }
        `}</style>

        <h2 style={{ textAlign: "center", marginBottom: "4px" }}>Director / Officer Directory</h2>
        <p style={{ textAlign: "center", color: "#666", marginBottom: "20px", fontSize: "12px" }}>
          Date Generated: {new Date().toLocaleDateString()} | Total Users: {filteredUsers.length}
        </p>

        <table className="pms-print-table">
          <thead>
            <tr>
              <th style={{ width: "25%" }}>Name & Designation</th>
              <th style={{ width: "25%" }}>Office & Ministry</th>
              <th style={{ width: "15%" }}>Role</th>
              <th style={{ width: "15%" }}>Status</th>
              <th style={{ width: "20%" }}>Contact Info</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((item) => {
              const activeStatus = isUserActive(item.active !== undefined ? item.active : item.status);
              return (
                <tr key={item.id}>
                  <td>
                    <strong>{item.name}</strong>
                    <br />
                    <span>{item.designation}</span>
                  </td>
                  <td>
                    {item.officeName || "N/A"}
                    <br />
                    <span>{item.minDiv}</span>
                  </td>
                  <td>{getRoleName(item.roleId, item.roleName)}</td>
                  <td>{activeStatus ? "Active" : "Inactive"}</td>
                  <td>
                    {item.email}
                    <br />
                    {item.number}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Users;
