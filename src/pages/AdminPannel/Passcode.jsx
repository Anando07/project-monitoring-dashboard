import React, { useState, useMemo } from "react";
import "./Passcode.css";
import {
  KeyRound,
  Search,
  Printer,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  UserCheck,
  Shield,
  X,
  AlertCircle,
  RotateCcw,
  Check,
  Lock
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Mirrors the Users directory this page issues passwords against.    */
/*  Each password record is tied back to one of these by user_id.      */
/* ------------------------------------------------------------------ */
const USERS_LIST = [
  {
    id: 1,
    fullName: "A. S. M. Kabir",
    designation: "Director General",
    ministryDivision: "Road Transport and Highways Division",
    role: "Super Admin"
  },
  {
    id: 2,
    fullName: "Nusrat Jahan",
    designation: "Deputy Director (Planning)",
    ministryDivision: "Local Government Division",
    role: "Admin"
  },
  {
    id: 3,
    fullName: "Shamim Ahmed",
    designation: "Project Director",
    ministryDivision: "Power Division",
    role: "Project Director"
  }
];

// Each rule's `test` runs against the live password on every keystroke so
// the checklist below the field updates in real time.
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

const strengthClass = (label) =>
  label === "Strong" ? "strength-strong" : label === "Medium" ? "strength-medium" : "strength-weak";

const INITIAL_FORM_STATE = {
  userId: "",
  newPassword: "",
  confirmPassword: ""
};

const INITIAL_RECORDS = [
  {
    id: 1,
    userId: 1,
    fullName: "A. S. M. Kabir",
    designation: "Director General",
    ministryDivision: "Road Transport and Highways Division",
    role: "Super Admin",
    password: "Kabir@2026!Strong",
    strength: "Strong",
    updatedAt: "2026-06-14"
  }
];

function Passcode() {
  const [records, setRecords] = useState(INITIAL_RECORDS);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [viewItem, setViewItem] = useState(null);
  const [viewPasswordVisible, setViewPasswordVisible] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM_STATE);
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const passedRules = getPassedRules(formData.newPassword);
  const strengthLabel = formData.newPassword ? getStrengthLabel(passedRules.length) : "";

  const validateForm = () => {
    const newErrors = {};

    if (!formData.userId) newErrors.userId = "Select a user to reset the password for.";

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const user = USERS_LIST.find((u) => u.id === Number(formData.userId));
    const today = new Date().toISOString().slice(0, 10);

    const recordData = {
      userId: user.id,
      fullName: user.fullName,
      designation: user.designation,
      ministryDivision: user.ministryDivision,
      role: user.role,
      password: formData.newPassword,
      strength: strengthLabel,
      updatedAt: today
    };

    // One active password record per user: overwrite if this user already
    // has one, otherwise create a new entry — mirrors how a real reset
    // replaces the previous credential rather than stacking duplicates.
    setRecords((prev) => {
      const existing = prev.find((r) => r.userId === user.id);
      if (existing) {
        return prev.map((r) => (r.userId === user.id ? { ...r, ...recordData, id: r.id } : r));
      }
      return [{ id: Date.now(), ...recordData }, ...prev];
    });

    handleReset();
  };

  const handleEdit = (record) => {
    setFormData({ userId: String(record.userId), newPassword: "", confirmPassword: "" });
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => {
    if (window.confirm("Remove this password record?")) {
      setRecords((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const filteredRecords = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return records.filter(
      (item) =>
        item.fullName.toLowerCase().includes(query) ||
        item.ministryDivision.toLowerCase().includes(query) ||
        item.role.toLowerCase().includes(query) ||
        String(item.userId).includes(query)
    );
  }, [records, searchTerm]);

  return (
    <div className="dashboard-page">
      {/* -------------------- Reset password form -------------------- */}
      <div className="dashboard-card no-print">
        <div className="dashboard-card-header">
          <h3>Reset User Password</h3>
          <KeyRound className="card-action-icon" size={20} />
        </div>

        <form onSubmit={handleSubmit} className="project-form" noValidate>
          <div className="form-grid form-grid-3">
            <div className="form-group">
              <label>
                Select User <span className="req-star">*</span>
              </label>
              <select
                name="userId"
                value={formData.userId}
                onChange={handleInputChange}
                className={errors.userId ? "input-error" : ""}
              >
                <option value="">-- Select a user (user_id) --</option>
                {USERS_LIST.map((u) => (
                  <option key={u.id} value={u.id}>
                    #{u.id} — {u.fullName} ({u.role})
                  </option>
                ))}
              </select>
              {errors.userId && <span className="field-error">{errors.userId}</span>}
            </div>

            <div className="form-group">
              <label>
                New Password <span className="req-star">*</span>
              </label>
              <div className="password-field-wrapper">
                <Lock size={14} className="password-lock-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="newPassword"
                  placeholder="Enter new password"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className={errors.newPassword ? "input-error" : ""}
                />
                <button
                  type="button"
                  className="eye-toggle-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.newPassword && <span className="field-error">{errors.newPassword}</span>}
            </div>

            <div className="form-group">
              <label>
                Confirm Password <span className="req-star">*</span>
              </label>
              <div className="password-field-wrapper">
                <Lock size={14} className="password-lock-icon" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Re-enter new password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={errors.confirmPassword ? "input-error" : ""}
                />
                <button
                  type="button"
                  className="eye-toggle-btn"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  title={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="field-error">{errors.confirmPassword}</span>
              )}
              {!errors.confirmPassword &&
                formData.confirmPassword &&
                formData.confirmPassword === formData.newPassword && (
                  <span className="field-success">
                    <Check size={12} /> Passwords match
                  </span>
                )}
            </div>
          </div>

          {/* Live strength meter + requirement checklist */}
          {formData.newPassword && (
            <div className="password-strength-panel">
              <div className="strength-meter-row">
                <span className="strength-meter-label">Password strength:</span>
                <span className={`strength-badge ${strengthClass(strengthLabel)}`}>
                  {strengthLabel}
                </span>
              </div>
              <div className="strength-bar-track">
                <div
                  className={`strength-bar-fill ${strengthClass(strengthLabel)}`}
                  style={{ width: `${(passedRules.length / PASSWORD_RULES.length) * 100}%` }}
                />
              </div>

              <ul className="password-rules-list">
                {PASSWORD_RULES.map((rule) => {
                  const passed = rule.test(formData.newPassword);
                  return (
                    <li key={rule.key} className={passed ? "rule-passed" : "rule-pending"}>
                      {passed ? <Check size={13} /> : <X size={13} />}
                      {rule.label}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div className="form-actions">
            <button type="button" onClick={handleReset} className="button-secondary" title="Reset Form">
              <RotateCcw size={15} /> Reset
            </button>
            <button type="submit" className="button-primary">
              <KeyRound size={16} /> Set Password
            </button>
          </div>
        </form>
      </div>

      {/* -------------------- Records table -------------------- */}
      <div className="dashboard-card no-print">
        <div className="dashboard-card-header">
          <h3>Password Records</h3>
          <div className="header-actions">
            <div className="search-box">
              <Search size={14} className="search-icon" />
              <input
                type="text"
                placeholder="Search by user, role, ministry..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button onClick={() => window.print()} className="button-secondary print-btn" title="Print Records">
              <Printer size={14} /> Print
            </button>
          </div>
        </div>

        <div className="table-overflow">
          <table className="projects-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Ministry / Role</th>
                <th>Password</th>
                <th>Strength</th>
                <th>Last Updated</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <tr key={record.id}>
                    <td>
                      <div className="project-name-tag">{record.fullName}</div>
                      <span className="sub-text">user_id: #{record.userId}</span>
                    </td>
                    <td>
                      <div className="sub-text">{record.ministryDivision}</div>
                      <span className="duty-pill duty-pill-blue">{record.role}</span>
                    </td>
                    <td>
                      <span className="masked-password">
                        {"•".repeat(Math.min(record.password.length, 10))}
                      </span>
                    </td>
                    <td>
                      <span className={`strength-badge ${strengthClass(record.strength)}`}>
                        {record.strength}
                      </span>
                    </td>
                    <td>
                      <span className="sub-text">{record.updatedAt}</span>
                    </td>
                    <td>
                      <div className="table-action-cell" style={{ justifyContent: "flex-end" }}>
                        <button
                          onClick={() => {
                            setViewItem(record);
                            setViewPasswordVisible(false);
                          }}
                          className="action-button"
                          title="View Record"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => handleEdit(record)}
                          className="action-button action-button-edit"
                          title="Reset Again"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(record.id)}
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
                  <td colSpan="6">
                    <div className="empty-state">
                      <AlertCircle size={32} />
                      <p>No password records found matching your search.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* -------------------- View modal -------------------- */}
      {viewItem && (
        <div className="modal-overlay" onClick={() => setViewItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Password Record</h2>
              <button className="modal-close" onClick={() => setViewItem(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-profile-header">
                <div
                  className="profile-avatar"
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#e2e8f0"
                  }}
                >
                  <Shield size={24} />
                </div>
                <div>
                  <h3>{viewItem.fullName}</h3>
                  <p className="sub-text" style={{ margin: 0 }}>
                    user_id: #{viewItem.userId} — {viewItem.role}
                  </p>
                </div>
              </div>

              <div className="modal-grid">
                <div className="modal-item">
                  <label>
                    <UserCheck size={12} /> Ministry / Division
                  </label>
                  <p>{viewItem.ministryDivision}</p>
                </div>

                <div className="modal-item">
                  <label>Strength</label>
                  <p>
                    <span className={`strength-badge ${strengthClass(viewItem.strength)}`}>
                      {viewItem.strength}
                    </span>
                  </p>
                </div>

                <div className="modal-item full-width">
                  <label>
                    <Lock size={12} /> Password
                  </label>
                  <div className="password-field-wrapper password-view-wrapper">
                    <input
                      type={viewPasswordVisible ? "text" : "password"}
                      value={viewItem.password}
                      readOnly
                    />
                    <button
                      type="button"
                      className="eye-toggle-btn"
                      onClick={() => setViewPasswordVisible((prev) => !prev)}
                      title={viewPasswordVisible ? "Hide password" : "Show password"}
                    >
                      {viewPasswordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="modal-item">
                  <label>Last Updated</label>
                  <p>{viewItem.updatedAt}</p>
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

      {/* -------------------- Print view -------------------- */}
      <div className="print-table-wrapper">
        <h1 className="print-title">Password Records</h1>
        <p className="print-subtitle">Date Generated: {new Date().toLocaleDateString()}</p>
        <table className="print-table" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>User</th>
              <th>user_id</th>
              <th>Ministry / Division</th>
              <th>Role</th>
              <th>Strength</th>
              <th>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {records.map((item) => (
              <tr key={item.id}>
                <td>{item.fullName}</td>
                <td>#{item.userId}</td>
                <td>{item.ministryDivision}</td>
                <td>{item.role}</td>
                <td>{item.strength}</td>
                <td>{item.updatedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Passcode;
