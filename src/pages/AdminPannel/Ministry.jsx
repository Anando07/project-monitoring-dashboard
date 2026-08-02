import React, { useState, useEffect, useMemo } from "react";
import {
  getAllMinistries,
  createMinistryApi,
  updateMinistryApi,
  deleteMinistryApi
} from "../../services/MinistryService";
import {
  Building2,
  Search,
  Printer,
  Trash2,
  Edit2,
  AlertCircle,
  RotateCcw,
  Loader,
  PlusCircle
} from "lucide-react";

const INITIAL_FORM_STATE = {
  minName: ""
};

function Ministry() {
  const [ministries, setMinistries] = useState([]);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});

  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const res = await getAllMinistries();
      setMinistries(res.data || []);
    } catch (error) {
      console.error("Failed to load ministries:", error);
      setApiError("Unable to fetch ministry records from server.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM_STATE);
    setEditingId(null);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.minName || !formData.minName.trim()) {
      newErrors.minName = "Ministry name is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      minName: formData.minName.trim()
    };

    setSubmitting(true);

    if (editingId) {
      updateMinistryApi(editingId, payload)
        .then(() => {
          fetchData();
          handleReset();
        })
        .catch((err) => {
          console.error("Error updating ministry:", err);
          alert("Failed to update ministry in database.");
        })
        .finally(() => setSubmitting(false));
    } else {
      createMinistryApi(payload)
        .then(() => {
          fetchData();
          handleReset();
        })
        .catch((err) => {
          console.error("Error creating ministry:", err);
          alert("Failed to save ministry to database.");
        })
        .finally(() => setSubmitting(false));
    }
  };

  const handleEdit = (ministry) => {
    setEditingId(ministry.id);
    setFormData({
      minName: ministry.minName || ""
    });
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => {
    if (window.confirm("Remove this ministry record? This cannot be undone.")) {
      deleteMinistryApi(id)
        .then(() => fetchData())
        .catch((err) => {
          console.error("Error deleting ministry:", err);
          alert("Could not delete ministry. It may be linked to existing records.");
        });
    }
  };

  const filteredMinistries = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return ministries.filter((m) => (m.minName || "").toLowerCase().includes(query));
  }, [ministries, searchTerm]);

  return (
    <div className="container-fluid py-4 bg-light">
      {/* Create / Update Ministry Form Card */}
      <div className="card shadow-sm mb-4 border-0">
        <div className="card-header bg-white d-flex justify-content-between align-items-center py-3 border-bottom">
          <h5 className="mb-0 text-primary fw-bold">
            {editingId ? "Update Ministry" : "Add New Ministry"}
          </h5>
          <Building2 className="text-primary" size={22} />
        </div>

        <div className="card-body p-4">
          <form onSubmit={handleSubmit} noValidate>
            <div className="row g-3 align-items-end">
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Ministry Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="minName"
                  placeholder="e.g. Ministry of Public Administration"
                  value={formData.minName}
                  onChange={handleInputChange}
                  className={`form-control ${errors.minName ? "is-invalid" : ""}`}
                />
                {errors.minName && <div className="invalid-feedback">{errors.minName}</div>}
              </div>

              <div className="col-md-6 d-flex justify-content-end gap-2">
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
                  {editingId ? "Update Ministry" : "Add Ministry"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Ministry Directory Table Card */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white d-flex flex-wrap justify-content-between align-items-center py-3 gap-2 border-bottom">
          <div>
            <h5 className="mb-0 fw-bold text-dark">Ministry Records</h5>
            <small className="text-muted">Total Records: {filteredMinistries.length}</small>
          </div>
          <div className="d-flex align-items-center gap-2">
            <div className="input-group input-group-sm" style={{ width: "260px" }}>
              <span className="input-group-text bg-light border-end-0">
                <Search size={14} />
              </span>
              <input
                type="text"
                className="form-control bg-light border-start-0"
                placeholder="Search ministry name..."
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
                <p className="mt-2 text-muted">Loading ministry records...</p>
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
                    <th style={{ width: "70%" }}>Ministry Name</th>
                    <th style={{ width: "30%" }} className="text-end">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMinistries.length > 0 ? (
                    filteredMinistries.map((ministry) => (
                      <tr key={ministry.id} style={{ verticalAlign: "middle" }}>
                        <td className="align-middle">
                          <div className="d-flex align-items-center gap-2 py-1">
                            <div
                              className="border rounded-circle bg-light d-flex align-items-center justify-content-center overflow-hidden flex-shrink-0"
                              style={{ width: "38px", height: "38px" }}
                            >
                              <Building2 size={18} className="text-secondary" />
                            </div>
                            <span className="fw-bold text-dark">{ministry.minName}</span>
                          </div>
                        </td>
                        <td className="text-end align-middle">
                          <div className="btn-group btn-group-sm">
                            <button
                              onClick={() => handleEdit(ministry)}
                              className="btn btn-outline-primary"
                              title="Edit Ministry"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(ministry.id)}
                              className="btn btn-outline-danger"
                              title="Delete Ministry"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2" className="text-center py-5 text-muted">
                        <AlertCircle size={32} className="mb-2" />
                        <p className="mb-0">No ministry records found in database.</p>
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

        <h2 style={{ textAlign: "center", marginBottom: "4px" }}>Ministry Directory Report</h2>
        <p style={{ textAlign: "center", color: "#666", marginBottom: "20px", fontSize: "12px" }}>
          Date Generated: {new Date().toLocaleDateString()} | Total Records: {filteredMinistries.length}
        </p>

        <table className="pms-print-table">
          <thead>
            <tr>
              <th style={{ width: "100%" }}>Ministry Name</th>
            </tr>
          </thead>
          <tbody>
            {filteredMinistries.map((ministry) => (
              <tr key={ministry.id}>
                <td>{ministry.minName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Ministry;
