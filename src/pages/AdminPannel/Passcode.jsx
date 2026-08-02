import React, { useState, useEffect, useMemo } from "react";
import {
  getAllPasscodes,
  createPasscodeApi,
  updatePasscodeApi,
  deletePasscodeApi
} from "../../services/PasscodeService";
import { getAllUsers } from "../../services/UserService";
import {
  KeyRound,
  Search,
  Printer,
  Trash2,
  Edit2,
  AlertCircle,
  RotateCcw,
  Check,
  Lock,
  Loader,
  Calendar,
  Shield,
  Building,
  Building2,
  Eye,
  EyeOff,
  X
} from "lucide-react";

const PASSWORD_RULES = [
  { key: "length", label: "At least 8 characters", test: (v) => v.length >= 8 },
  { key: "upper", label: "One uppercase letter (A-Z)", test: (v) => /[A-Z]/.test(v) },
  { key: "lower", label: "One lowercase letter (a-z)", test: (v) => /[a-z]/.test(v) },
  { key: "number", label: "One number (0-9)", test: (v) => /[0-9]/.test(v) },
  { key: "special", label: "One special character (!@#$...)", test: (v) => /[^A-Za-z0-9]/.test(v) }
];

const getPassedRules = (password) => PASSWORD_RULES.filter((r) => r.test(password));

const getStrengthLabel = (passedCount) => {
  if (passedCount <= 2) return "Weak";
  if (passedCount <= 4) return "Medium";
  return "Strong";
};

// Returns date string in YYYY-MM-DD format, defaulting to 3 months from now
const getDefaultExpiryDate = () => {
  const d = new Date();
  d.setMonth(d.getMonth() + 3);
  return d.toISOString().slice(0, 10);
};

const INITIAL_FORM_STATE = {
  userId: "",
  newPassword: "",
  confirmPassword: "",
  expiresAt: getDefaultExpiryDate()
};

function Passcode() {
  const [users, setUsers] = useState([]);
  const [records, setRecords] = useState([]);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});

  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const [usersRes, passcodesRes] = await Promise.all([
        getAllUsers().catch(() => ({ data: [] })),
        getAllPasscodes().catch(() => ({ data: [] }))
      ]);

      setUsers(usersRes.data || []);
      setRecords(passcodesRes.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Failed to load passcode data:", error);
      setApiError("Unable to fetch user or passcode records from server.");
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleReset = () => {
    setFormData({
      ...INITIAL_FORM_STATE,
      expiresAt: getDefaultExpiryDate()
    });
    setEditingId(null);
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const passedRules = getPassedRules(formData.newPassword);
  const strengthLabel = formData.newPassword ? getStrengthLabel(passedRules.length) : "";

  const validateForm = () => {
    const newErrors = {};

    if (!formData.userId) newErrors.userId = "Select a user to set password for.";

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required.";
    } else if (passedRules.length < PASSWORD_RULES.length) {
      newErrors.newPassword = "Password does not meet all strength requirements.";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm the new password.";
    } else if (formData.confirmPassword !== formData.newPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (!formData.expiresAt) newErrors.expiresAt = "Expiration date is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Format date as ISO LocalDateTime for backend
    const formattedExpiry = `${formData.expiresAt}T23:59:59`;

    const payload = {
      userId: Number(formData.userId),
      passcode: formData.newPassword,
      active: true,
      expiresAt: formattedExpiry
    };

    if (editingId) {
      updatePasscodeApi(editingId, payload)
        .then(() => {
          fetchData();
          handleReset();
        })
        .catch((err) => {
          console.error("Error updating passcode:", err);
          alert("Failed to update passcode in database.");
        });
    } else {
      createPasscodeApi(payload)
        .then(() => {
          fetchData();
          handleReset();
        })
        .catch((err) => {
          console.error("Error creating passcode:", err);
          alert("Failed to save passcode to database.");
        });
    }
  };

  const handleEdit = (record) => {
    const targetUserId = record.user?.id || record.userId;
    setEditingId(record.id);

    const existingDate = record.expiresAt
      ? String(record.expiresAt).slice(0, 10)
      : getDefaultExpiryDate();

    setFormData({
      userId: String(targetUserId),
      newPassword: "",
      confirmPassword: "",
      expiresAt: existingDate
    });
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => {
    if (window.confirm("Remove this password record?")) {
      deletePasscodeApi(id)
        .then(() => fetchData())
        .catch((err) => {
          console.error("Error deleting passcode:", err);
          alert("Could not delete passcode.");
        });
    }
  };

  // Safely resolves user metadata by looking up ID in the users list
  const resolveUserDetail = (record) => {
    const targetUserId = record.userId || (record.user ? record.user.id : null);

    const foundUser = users.find(
      (u) => String(u.id) === String(targetUserId)
    ) || {};

    return {
      userId: targetUserId || record.id,
      userName: foundUser.name || (targetUserId ? `User #${targetUserId}` : "Officer"),
      designation: foundUser.designation || "Officer",
      officeName: foundUser.officeName || "HQ",
      minDiv: foundUser.minDiv || "Internal Resources Division",
      roleName: foundUser.role?.roleName || foundUser.roleName || "User",
      expiresAt: record.expiresAt
        ? String(record.expiresAt).slice(0, 10)
        : getDefaultExpiryDate()
    };
  };

  const filteredRecords = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return records.filter((item) => {
      const details = resolveUserDetail(item);
      return (
        details.userName.toLowerCase().includes(query) ||
        details.designation.toLowerCase().includes(query) ||
        details.officeName.toLowerCase().includes(query) ||
        details.minDiv.toLowerCase().includes(query) ||
        details.roleName.toLowerCase().includes(query) ||
        String(details.userId).includes(query)
      );
    });
  }, [records, users, searchTerm]);

  return (
    <div className="container-fluid py-4 bg-light">
      {/* Reset Password Form Card */}
      <div className="card shadow-sm mb-4 border-0">
        <div className="card-header bg-white d-flex justify-content-between align-items-center py-3 border-bottom">
          <h5 className="mb-0 text-primary fw-bold">
            {editingId ? "Update User Password" : "Reset / Set User Password"}
          </h5>
          <KeyRound className="text-primary" size={22} />
        </div>

        <div className="card-body p-4">
          <form onSubmit={handleSubmit} noValidate>
            <div className="row g-3 mb-3">
              {/* 1. Select User Dropdown */}
              <div className="col-md-3">
                <label className="form-label fw-semibold">
                  Select User <span className="text-danger">*</span>
                </label>
                <select
                  name="userId"
                  value={formData.userId}
                  onChange={handleInputChange}
                  disabled={Boolean(editingId)}
                  className={`form-select ${errors.userId ? "is-invalid" : ""}`}
                >
                  <option value="">-- Select User --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.designation || "Officer"})
                    </option>
                  ))}
                </select>
                {errors.userId && <div className="invalid-feedback">{errors.userId}</div>}
              </div>

              {/* 2. New Password */}
              <div className="col-md-3">
                <label className="form-label fw-semibold">
                  New Password <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <Lock size={15} />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="newPassword"
                    placeholder="Enter new password"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className={`form-control ${errors.newPassword ? "is-invalid" : ""}`}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.newPassword && <div className="text-danger small mt-1">{errors.newPassword}</div>}
              </div>

              {/* 3. Confirm Password */}
              <div className="col-md-3">
                <label className="form-label fw-semibold">
                  Confirm Password <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <Lock size={15} />
                  </span>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Re-enter new password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                  >
                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <div className="text-danger small mt-1">{errors.confirmPassword}</div>
                )}
                {!errors.confirmPassword &&
                  formData.confirmPassword &&
                  formData.confirmPassword === formData.newPassword && (
                    <div className="text-success small mt-1 d-flex align-items-center gap-1">
                      <Check size={13} /> Passwords match
                    </div>
                  )}
              </div>

              {/* 4. Manual Expiration Date */}
              <div className="col-md-3">
                <label className="form-label fw-semibold">
                  Expiration Date <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <Calendar size={15} />
                  </span>
                  <input
                    type="date"
                    name="expiresAt"
                    value={formData.expiresAt}
                    onChange={handleInputChange}
                    className={`form-control ${errors.expiresAt ? "is-invalid" : ""}`}
                  />
                </div>
                {errors.expiresAt && <div className="text-danger small mt-1">{errors.expiresAt}</div>}
              </div>
            </div>

            {/* Live Password Strength Checklist */}
            {formData.newPassword && (
              <div className="bg-light border rounded p-3 mb-3">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="fw-semibold small">Password Strength:</span>
                  <span
                    className={`${
                      strengthLabel === "Strong"
                        ? "bg-success"
                        : strengthLabel === "Medium"
                        ? "bg-warning text-dark"
                        : "bg-danger"
                    }`}
                  >
                    {strengthLabel}
                  </span>
                </div>
                <div className="progress mb-3" style={{ height: "6px" }}>
                  <div
                    className={`progress-bar ${
                      strengthLabel === "Strong"
                        ? "bg-success"
                        : strengthLabel === "Medium"
                        ? "bg-warning"
                        : "bg-danger"
                    }`}
                    style={{ width: `${(passedRules.length / PASSWORD_RULES.length) * 100}%` }}
                  ></div>
                </div>

                <div className="row g-2">
                  {PASSWORD_RULES.map((rule) => {
                    const passed = rule.test(formData.newPassword);
                    return (
                      <div key={rule.key} className="col-md-4 col-6">
                        <small
                          className={`d-flex align-items-center gap-1 ${
                            passed ? "text-success fw-semibold" : "text-muted"
                          }`}
                        >
                          {passed ? <Check size={13} /> : <X size={13} />}
                          {rule.label}
                        </small>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Form Action Buttons */}
            <div className="d-flex justify-content-end align-items-center gap-2 pt-2 border-top">
              <button
                type="button"
                onClick={handleReset}
                className="btn btn-outline-secondary d-inline-flex align-items-center gap-1"
              >
                <RotateCcw size={15} /> Cancel / Reset
              </button>
              <button
                type="submit"
                className="btn btn-primary d-inline-flex align-items-center gap-1 px-3"
              >
                <KeyRound size={16} /> {editingId ? "Update Password" : "Set Password"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Passcode Directory Table Card */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white d-flex flex-wrap justify-content-between align-items-center py-3 gap-2 border-bottom">
          <div>
            <h5 className="mb-0 fw-bold text-dark">Password / Passcode Records</h5>
            <small className="text-muted">Total Records: {filteredRecords.length}</small>
          </div>
          <div className="d-flex align-items-center gap-2">
            <div className="input-group input-group-sm" style={{ width: "260px" }}>
              <span className="input-group-text bg-light border-end-0">
                <Search size={14} />
              </span>
              <input
                type="text"
                className="form-control bg-light border-start-0"
                placeholder="Search user, role, ministry..."
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
                <p className="mt-2 text-muted">Loading password records...</p>
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
                    <th style={{ width: "28%" }}>User Details</th>
                    <th style={{ width: "28%" }}>Office & Ministry</th>
                    <th style={{ width: "16%" }}>Role</th>
                    <th style={{ width: "16%" }}>Expiration Date</th>
                    <th style={{ width: "12%" }} className="text-end">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.length > 0 ? (
                    filteredRecords.map((record) => {
                      const details = resolveUserDetail(record);

                      return (
                        <tr key={record.id} style={{ verticalAlign: "middle" }}>
                          {/* 1. Name & Designation */}
                          <td className="align-middle">
                            <div className="d-flex align-items-center gap-2 py-1">
                              <div
                                className="border rounded-circle bg-light d-flex align-items-center justify-content-center overflow-hidden flex-shrink-0"
                                style={{ width: "38px", height: "38px" }}
                              >
                                <Shield size={18} className="text-secondary" />
                              </div>
                              <div>
                                <div className="d-flex align-items-center gap-1">
                                  <span className="fw-bold text-dark lh-sm">
                                    {details.userName}
                                  </span>
                                </div>
                                <small className="text-secondary fw-semibold d-block mt-1">
                                  {details.designation}
                                </small>
                              </div>
                            </div>
                          </td>

                          {/* 2. Office & Ministry */}
                          <td className="align-middle">
                            <div className="fw-semibold text-dark d-flex align-items-center gap-1 lh-sm">
                              <Building size={13} className="text-muted flex-shrink-0" />
                              <span>{details.officeName}</span>
                            </div>
                            <small className="text-muted d-flex align-items-center gap-1 mt-1">
                              <Building2 size={12} className="flex-shrink-0" />
                              <span>{details.minDiv}</span>
                            </small>
                          </td>

                          {/* 3. Role */}
                          <td className="align-middle">
                            <span className="bg-primary px-2 py-1">
                              {details.roleName}
                            </span>
                          </td>

                          {/* 4. Expiration Date */}
                          <td className="align-middle">
                            <span className="bg-warning text-dark border border-warning px-2 py-1 d-inline-flex align-items-center gap-1">
                              <Calendar size={12} />
                              {details.expiresAt}
                            </span>
                          </td>

                          {/* 5. Actions */}
                          <td className="text-end align-middle">
                            <div className="btn-group btn-group-sm">
                              <button
                                onClick={() => handleEdit(record)}
                                className="btn btn-outline-primary"
                                title="Reset / Update Password"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDelete(record.id)}
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
                      <td colSpan="5" className="text-center py-5 text-muted">
                        <AlertCircle size={32} className="mb-2" />
                        <p className="mb-0">No passcode records found in database.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Printable / PDF Export View */}
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

        <h2 style={{ textAlign: "center", marginBottom: "4px" }}>Passcode Directory Report</h2>
        <p style={{ textAlign: "center", color: "#666", marginBottom: "20px", fontSize: "12px" }}>
          Date Generated: {new Date().toLocaleDateString()} | Total Records: {filteredRecords.length}
        </p>

        <table className="pms-print-table">
          <thead>
            <tr>
              <th style={{ width: "30%" }}>Name & Designation</th>
              <th style={{ width: "30%" }}>Office & Ministry</th>
              <th style={{ width: "20%" }}>Role</th>
              <th style={{ width: "20%" }}>Expiration Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((item) => {
              const details = resolveUserDetail(item);
              return (
                <tr key={item.id}>
                  <td>
                    <strong>{details.userName}</strong>
                    <br />
                    <span>{details.designation}</span>
                  </td>
                  <td>
                    {details.officeName}
                    <br />
                    <span>{details.minDiv}</span>
                  </td>
                  <td>{details.roleName}</td>
                  <td>{details.expiresAt}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Passcode;
