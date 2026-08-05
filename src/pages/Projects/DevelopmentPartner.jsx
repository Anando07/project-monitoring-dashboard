import React, { useState, useEffect, useMemo } from "react";
import {
  getAllDevPartners,
  createDevPartnerApi,
  updateDevPartnerApi,
  deleteDevPartnerApi
} from "../../services/DevelopmentPartnerService";
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
  devPartnerName: ""
};

function DevelopmentPartner() {
  const [devPartners, setDevPartners] = useState([]);
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
      const res = await getAllDevPartners();
      setDevPartners(res.data || []);
    } catch (error) {
      console.error("Failed to load development partners:", error);
      setApiError("Unable to fetch development partner records from server.");
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
    if (!formData.devPartnerName || !formData.devPartnerName.trim()) {
      newErrors.devPartnerName = "Development partner name is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      devPartnerName: formData.devPartnerName.trim()
    };

    setSubmitting(true);

    if (editingId) {
      updateDevPartnerApi(editingId, payload)
        .then(() => {
          fetchData();
          handleReset();
        })
        .catch((err) => {
          console.error("Error updating development partner:", err);
          alert("Failed to update development partner in database.");
        })
        .finally(() => setSubmitting(false));
    } else {
      createDevPartnerApi(payload)
        .then(() => {
          fetchData();
          handleReset();
        })
        .catch((err) => {
          console.error("Error creating development partner:", err);
          alert("Failed to save development partner to database.");
        })
        .finally(() => setSubmitting(false));
    }
  };

  const handleEdit = (partner) => {
    setEditingId(partner.id);
    setFormData({
      devPartnerName: partner.devPartnerName || ""
    });
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => {
    if (window.confirm("Remove this development partner record? This cannot be undone.")) {
      deleteDevPartnerApi(id)
        .then(() => fetchData())
        .catch((err) => {
          console.error("Error deleting development partner:", err);
          alert("Could not delete development partner. It may be linked to existing records.");
        });
    }
  };

  const filteredDevPartners = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return devPartners.filter((p) =>
      (p.devPartnerName || "").toLowerCase().includes(query)
    );
  }, [devPartners, searchTerm]);

  return (
    <div className="container-fluid py-4 bg-light">
      {/* Create / Update Development Partner Form Card */}
      <div className="card shadow-sm mb-4 border-0">
        <div className="card-header bg-white d-flex justify-content-between align-items-center py-3 border-bottom">
          <h5 className="mb-0 text-primary fw-bold">
            {editingId ? "Update Development Partner" : "Add New Development Partner"}
          </h5>
          <Building2 className="text-primary" size={22} />
        </div>

        <div className="card-body p-4">
          <form onSubmit={handleSubmit} noValidate>
            <div className="row g-3 align-items-end">
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Development Partner Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="devPartnerName"
                  placeholder="e.g. World Bank / Asian Development Bank"
                  value={formData.devPartnerName}
                  onChange={handleInputChange}
                  className={`form-control ${errors.devPartnerName ? "is-invalid" : ""}`}
                />
                {errors.devPartnerName && (
                  <div className="invalid-feedback">{errors.devPartnerName}</div>
                )}
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
                  {editingId ? "Update Partner" : "Add Partner"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Directory Table Card */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white d-flex flex-wrap justify-content-between align-items-center py-3 gap-2 border-bottom">
          <div>
            <h5 className="mb-0 fw-bold text-dark">Development Partner Records</h5>
            <small className="text-muted">Total Records: {filteredDevPartners.length}</small>
          </div>
          <div className="d-flex align-items-center gap-2">
            <div className="input-group input-group-sm" style={{ width: "260px" }}>
              <span className="input-group-text bg-light border-end-0">
                <Search size={14} />
              </span>
              <input
                type="text"
                className="form-control bg-light border-start-0"
                placeholder="Search partner name..."
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
                <p className="mt-2 text-muted">Loading development partner records...</p>
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
                    <th style={{ width: "70%" }}>Development Partner Name</th>
                    <th style={{ width: "30%" }} className="text-end">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDevPartners.length > 0 ? (
                    filteredDevPartners.map((partner) => (
                      <tr key={partner.id} style={{ verticalAlign: "middle" }}>
                        <td className="align-middle">
                          <div className="d-flex align-items-center gap-2 py-1">
                            <div
                              className="border rounded-circle bg-light d-flex align-items-center justify-content-center overflow-hidden flex-shrink-0"
                              style={{ width: "38px", height: "38px" }}
                            >
                              <Building2 size={18} className="text-secondary" />
                            </div>
                            <span className="fw-bold text-dark">{partner.devPartnerName}</span>
                          </div>
                        </td>
                        <td className="text-end align-middle">
                          <div className="btn-group btn-group-sm">
                            <button
                              onClick={() => handleEdit(partner)}
                              className="btn btn-outline-primary"
                              title="Edit Partner"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(partner.id)}
                              className="btn btn-outline-danger"
                              title="Delete Partner"
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
                        <p className="mb-0">No development partner records found in database.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Printable View */}
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

        <h2 style={{ textAlign: "center", marginBottom: "4px" }}>
          Development Partner Directory Report
        </h2>
        <p style={{ textAlign: "center", color: "#666", marginBottom: "20px", fontSize: "12px" }}>
          Date Generated: {new Date().toLocaleDateString()} | Total Records: {filteredDevPartners.length}
        </p>

        <table className="pms-print-table">
          <thead>
            <tr>
              <th style={{ width: "100%" }}>Development Partner Name</th>
            </tr>
          </thead>
          <tbody>
            {filteredDevPartners.map((partner) => (
              <tr key={partner.id}>
                <td>{partner.devPartnerName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DevelopmentPartner;