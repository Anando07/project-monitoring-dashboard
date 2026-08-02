import React, { useState, useEffect, useMemo } from "react";
import {
  getAllDirectorates,
  createDirectorateApi,
  updateDirectorateApi,
  deleteDirectorateApi
} from "../../services/DirectorateService";
import { getAllMinistries } from "../../services/MinistryService";
import {
  Landmark,
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
  ministryId: "",
  dirName: ""
};

function Directorate() {
  const [ministries, setMinistries] = useState([]);
  const [directorates, setDirectorates] = useState([]);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});

  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [ministryFilter, setMinistryFilter] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const [ministriesRes, directoratesRes] = await Promise.all([
        getAllMinistries().catch(() => ({ data: [] })),
        getAllDirectorates().catch(() => ({ data: [] }))
      ]);
      setMinistries(ministriesRes.data || []);
      setDirectorates(directoratesRes.data || []);
    } catch (error) {
      console.error("Failed to load directorate data:", error);
      setApiError("Unable to fetch ministry or directorate records from server.");
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
    if (!formData.ministryId) newErrors.ministryId = "Select the parent ministry.";
    if (!formData.dirName || !formData.dirName.trim()) {
      newErrors.dirName = "Directorate name is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      ministryId: Number(formData.ministryId),
      dirName: formData.dirName.trim()
    };

    setSubmitting(true);

    if (editingId) {
      updateDirectorateApi(editingId, payload)
        .then(() => {
          fetchData();
          handleReset();
        })
        .catch((err) => {
          console.error("Error updating directorate:", err);
          const message =
            err.response?.data?.message || "Failed to update directorate in database.";
          alert(message);
        })
        .finally(() => setSubmitting(false));
    } else {
      createDirectorateApi(payload)
        .then(() => {
          fetchData();
          handleReset();
        })
        .catch((err) => {
          console.error("Error creating directorate:", err);
          const message =
            err.response?.data?.message || "Failed to save directorate to database.";
          alert(message);
        })
        .finally(() => setSubmitting(false));
    }
  };

  const handleEdit = (directorate) => {
    setEditingId(directorate.id);
    setFormData({
      ministryId: String(directorate.ministryId || ""),
      dirName: directorate.dirName || ""
    });
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => {
    if (window.confirm("Remove this directorate record? This cannot be undone.")) {
      deleteDirectorateApi(id)
        .then(() => fetchData())
        .catch((err) => {
          console.error("Error deleting directorate:", err);
          alert("Could not delete directorate.");
        });
    }
  };

  const filteredDirectorates = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return directorates.filter((d) => {
      const matchesSearch =
        (d.dirName || "").toLowerCase().includes(query) ||
        (d.ministryName || "").toLowerCase().includes(query);
      const matchesMinistry = ministryFilter ? String(d.ministryId) === ministryFilter : true;
      return matchesSearch && matchesMinistry;
    });
  }, [directorates, searchTerm, ministryFilter]);

  return (
    <div className="container-fluid py-4 bg-light">
      {/* Create / Update Directorate Form Card */}
      <div className="card shadow-sm mb-4 border-0">
        <div className="card-header bg-white d-flex justify-content-between align-items-center py-3 border-bottom">
          <h5 className="mb-0 text-primary fw-bold">
            {editingId ? "Update Directorate" : "Add New Directorate"}
          </h5>
          <Landmark className="text-primary" size={22} />
        </div>

        <div className="card-body p-4">
          <form onSubmit={handleSubmit} noValidate>
            <div className="row g-3 align-items-end">
              {/* Parent Ministry */}
              <div className="col-md-4">
                <label className="form-label fw-semibold">
                  Parent Ministry <span className="text-danger">*</span>
                </label>
                <select
                  name="ministryId"
                  value={formData.ministryId}
                  onChange={handleInputChange}
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

              {/* Directorate Name */}
              <div className="col-md-4">
                <label className="form-label fw-semibold">
                  Directorate Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="dirName"
                  placeholder="e.g. Directorate of Human Resources"
                  value={formData.dirName}
                  onChange={handleInputChange}
                  className={`form-control ${errors.dirName ? "is-invalid" : ""}`}
                />
                {errors.dirName && <div className="invalid-feedback">{errors.dirName}</div>}
              </div>

              <div className="col-md-4 d-flex justify-content-end gap-2">
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
                  {editingId ? "Update Directorate" : "Add Directorate"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Directorate Directory Table Card */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white d-flex flex-wrap justify-content-between align-items-center py-3 gap-2 border-bottom">
          <div>
            <h5 className="mb-0 fw-bold text-dark">Directorate Records</h5>
            <small className="text-muted">Total Records: {filteredDirectorates.length}</small>
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
                placeholder="Search directorate or ministry..."
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
                <p className="mt-2 text-muted">Loading directorate records...</p>
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
                    <th style={{ width: "40%" }}>Directorate Name</th>
                    <th style={{ width: "35%" }}>Ministry</th>
                    <th style={{ width: "25%" }} className="text-end">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDirectorates.length > 0 ? (
                    filteredDirectorates.map((directorate) => (
                      <tr key={directorate.id} style={{ verticalAlign: "middle" }}>
                        <td className="align-middle">
                          <div className="d-flex align-items-center gap-2 py-1">
                            <div
                              className="border rounded-circle bg-light d-flex align-items-center justify-content-center overflow-hidden flex-shrink-0"
                              style={{ width: "38px", height: "38px" }}
                            >
                              <Landmark size={18} className="text-secondary" />
                            </div>
                            <span className="fw-bold text-dark">{directorate.dirName}</span>
                          </div>
                        </td>
                        <td className="align-middle">
                          <span className="d-flex align-items-center gap-1 text-muted">
                            <Building2 size={13} className="flex-shrink-0" />
                            {directorate.ministryName}
                          </span>
                        </td>
                        <td className="text-end align-middle">
                          <div className="btn-group btn-group-sm">
                            <button
                              onClick={() => handleEdit(directorate)}
                              className="btn btn-outline-primary"
                              title="Edit Directorate"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(directorate.id)}
                              className="btn btn-outline-danger"
                              title="Delete Directorate"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center py-5 text-muted">
                        <AlertCircle size={32} className="mb-2" />
                        <p className="mb-0">No directorate records found in database.</p>
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

        <h2 style={{ textAlign: "center", marginBottom: "4px" }}>Directorate Directory Report</h2>
        <p style={{ textAlign: "center", color: "#666", marginBottom: "20px", fontSize: "12px" }}>
          Date Generated: {new Date().toLocaleDateString()} | Total Records: {filteredDirectorates.length}
        </p>

        <table className="pms-print-table">
          <thead>
            <tr>
              <th style={{ width: "50%" }}>Directorate Name</th>
              <th style={{ width: "50%" }}>Ministry</th>
            </tr>
          </thead>
          <tbody>
            {filteredDirectorates.map((directorate) => (
              <tr key={directorate.id}>
                <td>{directorate.dirName}</td>
                <td>{directorate.ministryName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Directorate;
