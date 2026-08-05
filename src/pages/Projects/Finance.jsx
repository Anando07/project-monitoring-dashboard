import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Trash2,
  Eye,
  Pencil,
  Landmark,
  Search,
  Printer,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader,
  RotateCcw,
} from "lucide-react";

import { getAllProjects } from "../../services/ProjectService";
import { getAllDevPartners } from "../../services/DevelopmentPartnerService";
import {
  getAllFinanceRecords,
  createFinanceRecord,
  updateFinanceRecord,
  deleteFinanceRecord,
} from "../../services/FinanceService";

const PAGE_SIZE = 10;

const formatDate = (isoDate) => {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const formatDateTime = (isoDateTime) => {
  if (!isoDateTime) return "—";
  const d = new Date(isoDateTime);
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const EMPTY_FORM = {
  projectId: "",
  developmentPartnerId: "",
  totalApprovedFund: "",
  totalRevisedFund: "",
};

function Finance() {
  const [projects, setProjects] = useState([]);
  const [devPartners, setDevPartners] = useState([]);
  const [financeRecords, setFinanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [viewFinance, setViewFinance] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const [projRes, partnerRes, finRes] = await Promise.all([
        getAllProjects().catch(() => ({ data: [] })),
        getAllDevPartners().catch(() => ({ data: [] })),
        getAllFinanceRecords().catch(() => ({ data: [] })),
      ]);

      setProjects(projRes.data || []);
      setDevPartners(partnerRes.data || []);
      setFinanceRecords(finRes.data || []);
    } catch (error) {
      console.error("Failed to load finance records:", error);
      setApiError("Unable to fetch project or finance records from server.");
    } finally {
      setLoading(false);
    }
  };

  const fetchFinanceList = async () => {
    try {
      const res = await getAllFinanceRecords();
      setFinanceRecords(res.data || []);
    } catch (error) {
      console.error("Error refreshing finance records:", error);
    }
  };

  const projectsMap = useMemo(() => {
    const map = {};
    projects.forEach((p) => (map[p.id] = p));
    return map;
  }, [projects]);

  /* Selected project and baseline budgets */
  const selectedProject = projectsMap[form.projectId] || null;
  const projectApprovedBudget = Number(selectedProject?.approvedBudget || 0);

  const hasProjectRevisedBudget =
    selectedProject?.revisedBudget != null &&
    selectedProject?.revisedBudget !== "" &&
    Number(selectedProject.revisedBudget) > 0;

  const projectRevisedBudget = hasProjectRevisedBudget
    ? Number(selectedProject.revisedBudget)
    : null;

  /* Funds already committed across partners for this project (excluding editing record) */
  const alreadyAllocated = useMemo(() => {
    const relevant = financeRecords.filter(
      (r) => String(r.projectId) === String(form.projectId) && r.id !== editingId
    );
    return {
      approved: relevant.reduce((sum, r) => sum + Number(r.totalApprovedFund || 0), 0),
      revised: relevant.reduce((sum, r) => sum + Number(r.totalRevisedFund || 0), 0),
    };
  }, [financeRecords, form.projectId, editingId]);

  /* Unallocated budget pool */
  const unallocatedApprovedPool = Math.max(0, projectApprovedBudget - alreadyAllocated.approved);
  const unallocatedRevisedPool =
    projectRevisedBudget === null
      ? null
      : Math.max(0, projectRevisedBudget - alreadyAllocated.revised);

  /* Entered partner amounts */
  const enteredApproved = Number(form.totalApprovedFund || 0);
  const enteredRevised = Number(form.totalRevisedFund || 0);

  /* Overbudget checks */
  const isExceedingApproved = enteredApproved > unallocatedApprovedPool + 0.0001;
  const isExceedingRevised =
    unallocatedRevisedPool !== null && enteredRevised > unallocatedRevisedPool + 0.0001;
  const isExceedingBudget = isExceedingApproved || isExceedingRevised;

  /* Form Field Change Handler */
  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  /* Project Selection Handler */
  const handleProjectSelect = (e) => {
    const selectedProjId = e.target.value;
    const proj = projectsMap[selectedProjId];
    const projHasRevised =
      proj?.revisedBudget != null &&
      proj?.revisedBudget !== "" &&
      Number(proj.revisedBudget) > 0;

    setForm((prev) => ({
      ...prev,
      projectId: selectedProjId,
      totalRevisedFund: projHasRevised ? prev.totalRevisedFund : "0",
    }));

    if (errors.projectId) setErrors((prev) => ({ ...prev, projectId: null }));
    if (errors.totalRevisedFund) setErrors((prev) => ({ ...prev, totalRevisedFund: null }));
  };

  /* Validation Logic */
  const validate = () => {
    const next = {};

    if (!form.projectId) next.projectId = "Please select a project";
    if (!form.developmentPartnerId) next.developmentPartnerId = "Please select a development partner";

    const approvedNum = Number(form.totalApprovedFund || 0);
    const revisedNum = Number(form.totalRevisedFund || 0);

    // Require AT LEAST one fund field to be greater than 0
    if (approvedNum <= 0 && revisedNum <= 0) {
      next.form = "Please enter either an Approved Fund or a Revised Fund amount";
    }

    // Only validate Approved Fund cap if an amount was actually entered
    if (form.totalApprovedFund !== "" && approvedNum > 0) {
      if (approvedNum > unallocatedApprovedPool) {
        next.totalApprovedFund = `Exceeds unallocated approved budget (${unallocatedApprovedPool.toFixed(2)} available)`;
      }
    }

    // Validate Revised Fund if project supports it
    if (hasProjectRevisedBudget && form.totalRevisedFund !== "" && revisedNum > 0) {
      if (
        unallocatedRevisedPool !== null &&
        revisedNum > unallocatedRevisedPool
      ) {
        next.totalRevisedFund = `Exceeds unallocated revised budget (${unallocatedRevisedPool.toFixed(2)} available)`;
      }
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      projectId: Number(form.projectId),
      developmentPartnerId: Number(form.developmentPartnerId),
      totalApprovedFund: form.totalApprovedFund ? Number(form.totalApprovedFund) : 0,
      totalRevisedFund: hasProjectRevisedBudget && form.totalRevisedFund ? Number(form.totalRevisedFund) : 0,
    };

    setSubmitting(true);

    const request = editingId
      ? updateFinanceRecord(editingId, payload)
      : createFinanceRecord(payload);

    request
      .then(() => {
        fetchFinanceList();
        handleReset();
        if (!editingId) setCurrentPage(1);
      })
      .catch((err) => {
        console.error("Error saving finance record:", err);
        const message =
          err.response?.data?.message ||
          "Failed to save record — contribution may exceed available project budget.";
        setErrors((prev) => ({ ...prev, form: message }));
      })
      .finally(() => setSubmitting(false));
  };

  const handleReset = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setEditingId(null);
  };

  const handleEdit = (record) => {
    const proj = projectsMap[record.projectId];
    const projHasRevised =
      proj?.revisedBudget != null &&
      proj?.revisedBudget !== "" &&
      Number(proj.revisedBudget) > 0;

    setForm({
      projectId: String(record.projectId || ""),
      developmentPartnerId: String(record.developmentPartnerId || ""),
      totalApprovedFund: String(record.totalApprovedFund || "0"),
      totalRevisedFund: projHasRevised ? String(record.totalRevisedFund || "0") : "0",
    });
    setEditingId(record.id);
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Remove this development partner funding record?")) return;
    deleteFinanceRecord(id)
      .then(() => {
        fetchFinanceList();
        if (editingId === id) handleReset();
      })
      .catch((err) => {
        console.error("Error deleting finance record:", err);
        alert("Could not delete record.");
      });
  };

  const handlePrint = () => {
    window.print();
  };

  /* Filter and Pagination */
  const filteredFinances = useMemo(
    () =>
      financeRecords.filter((f) => {
        const pName = (f.projectName || "").toLowerCase();
        const partnerName = (f.devPartnerName || "").toLowerCase();
        const q = searchTerm.trim().toLowerCase();
        return pName.includes(q) || partnerName.includes(q);
      }),
    [financeRecords, searchTerm]
  );

  const totalPages = Math.max(1, Math.ceil(filteredFinances.length / PAGE_SIZE));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const pageFinances = filteredFinances.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="container-fluid py-4 bg-light">
      {/* ---------------- Form ---------------- */}
      <div className="card shadow-sm mb-4 border-0 d-print-none">
        <div className="card-header bg-white d-flex justify-content-between align-items-center py-3 border-bottom">
          <h5 className="mb-0 text-primary fw-bold">
            {editingId ? "Edit Partner Funding Allocation" : "Record Partner Funding Allocation"}
          </h5>
          <Landmark className="text-primary" size={22} />
        </div>

        <div className="card-body p-4">
          <form onSubmit={handleSubmit} noValidate>
            {errors.form && (
              <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 mb-3">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span className="small">{errors.form}</span>
              </div>
            )}

            <div className="row g-3">
              {/* Select Project */}
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Project <span className="text-danger">*</span>
                </label>
                <select
                  value={form.projectId}
                  onChange={handleProjectSelect}
                  className={`form-select ${errors.projectId ? "is-invalid" : ""}`}
                >
                  <option value="">-- Select Project --</option>
                  {projects.map((proj) => (
                    <option key={proj.id} value={proj.id}>
                      {proj.projectName}
                    </option>
                  ))}
                </select>
                {errors.projectId && <div className="invalid-feedback">{errors.projectId}</div>}

                {selectedProject && (
                  <div className="form-text mt-2 p-2 bg-light rounded border">
                    <div>Approved Budget: <strong>৳ {projectApprovedBudget.toFixed(2)} Lakhs TK</strong></div>
                    <div>
                      Revised Budget:{" "}
                      <strong>
                        {hasProjectRevisedBudget
                          ? `৳ ${projectRevisedBudget.toFixed(2)} Lakhs TK`
                          : "Not set (0)"}
                      </strong>
                    </div>
                    <div className="text-muted small mt-1">
                      Already Allocated — Approved: <strong>৳ {alreadyAllocated.approved.toFixed(2)} Lakhs TK</strong>
                      {" | "}
                      Revised: <strong>৳ {alreadyAllocated.revised.toFixed(2)} Lakhs TK</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Select Development Partner */}
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Development Partner <span className="text-danger">*</span>
                </label>
                <select
                  value={form.developmentPartnerId}
                  onChange={handleChange("developmentPartnerId")}
                  className={`form-select ${errors.developmentPartnerId ? "is-invalid" : ""}`}
                >
                  <option value="">-- Select Development Partner --</option>
                  {devPartners.map((partner) => (
                    <option key={partner.id} value={partner.id}>
                      {partner.devPartnerName}
                    </option>
                  ))}
                </select>
                {errors.developmentPartnerId && (
                  <div className="invalid-feedback">{errors.developmentPartnerId}</div>
                )}
              </div>

              {/* Partner Approved Fund (Optional if inserting Revised Fund) */}
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Approved Fund (Lakhs TK)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={form.totalApprovedFund}
                  onChange={handleChange("totalApprovedFund")}
                  className={`form-control ${errors.totalApprovedFund || isExceedingApproved ? "is-invalid" : ""}`}
                />
                {errors.totalApprovedFund && (
                  <div className="invalid-feedback">{errors.totalApprovedFund}</div>
                )}
              </div>

              {/* Partner Revised Fund */}
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Revised Fund (Lakhs TK)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={hasProjectRevisedBudget ? form.totalRevisedFund : "0"}
                  onChange={handleChange("totalRevisedFund")}
                  readOnly={!hasProjectRevisedBudget}
                  disabled={!hasProjectRevisedBudget}
                  className={`form-control ${!hasProjectRevisedBudget ? "bg-secondary-subtle" : ""} ${errors.totalRevisedFund || isExceedingRevised ? "is-invalid" : ""}`}
                />
                {!hasProjectRevisedBudget && form.projectId && (
                  <small className="text-muted d-block mt-1">
                    Revised budget is not set for this project. Set to 0.
                  </small>
                )}
                {errors.totalRevisedFund && (
                  <div className="invalid-feedback">{errors.totalRevisedFund}</div>
                )}
              </div>

              {/* Pool Status Indicators */}
              {selectedProject && (
                <div className="col-12 mt-2">
                  <div
                    className={`alert ${isExceedingApproved ? "alert-danger" : "alert-light border"} d-flex justify-content-between align-items-center py-2 px-3 mb-2`}
                  >
                    <span className="small">Entered Approved / Unallocated Approved Budget:</span>
                    <strong className={isExceedingApproved ? "text-danger" : "text-success"}>
                      ৳ {enteredApproved.toFixed(2)} / ৳ {unallocatedApprovedPool.toFixed(2)} Lakhs TK
                    </strong>
                  </div>
                  <div
                    className={`alert ${isExceedingRevised ? "alert-danger" : "alert-light border"} d-flex justify-content-between align-items-center py-2 px-3 mb-0`}
                  >
                    <span className="small">Entered Revised / Unallocated Revised Budget:</span>
                    <strong className={isExceedingRevised ? "text-danger" : "text-success"}>
                      ৳ {enteredRevised.toFixed(2)} /{" "}
                      {unallocatedRevisedPool !== null
                        ? `৳ ${unallocatedRevisedPool.toFixed(2)} Lakhs TK`
                        : "No revised budget (0)"}
                    </strong>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="col-12 d-flex justify-content-end align-items-center gap-2 mt-4 pt-2 border-top">
                {editingId && (
                  <span className="badge bg-primary-subtle text-primary-emphasis border border-primary-subtle me-auto px-2 py-2">
                    Editing Record ID: #{editingId}
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleReset}
                  className="btn btn-outline-secondary d-inline-flex align-items-center gap-1"
                  disabled={submitting}
                >
                  <RotateCcw size={15} /> {editingId ? "Cancel" : "Reset"}
                </button>
                <button
                  type="submit"
                  className="btn btn-primary d-inline-flex align-items-center gap-1 px-3"
                  disabled={isExceedingBudget || submitting}
                >
                  {submitting ? (
                    <Loader size={16} className="spinner-border spinner-border-sm border-0" />
                  ) : editingId ? (
                    <Pencil size={16} />
                  ) : (
                    <Plus size={16} />
                  )}
                  {editingId ? "Save Changes" : "Record Contribution"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* ---------------- Table ---------------- */}
      <div className="card shadow-sm border-0 d-print-none">
        <div className="card-header bg-white d-flex flex-wrap justify-content-between align-items-center py-3 gap-2 border-bottom">
          <div>
            <h5 className="mb-0 fw-bold text-dark">Financial Records</h5>
            <small className="text-muted">Total Records: {filteredFinances.length}</small>
          </div>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <div className="input-group input-group-sm" style={{ width: "260px" }}>
              <span className="input-group-text bg-light border-end-0">
                <Search size={14} />
              </span>
              <input
                type="text"
                className="form-control bg-light border-start-0"
                placeholder="Search project or partner..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <button
              type="button"
              onClick={handlePrint}
              className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1"
            >
              <Printer size={14} /> Print
            </button>
          </div>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            {loading ? (
              <div className="text-center py-5">
                <Loader size={28} className="spinner-border text-primary border-0" />
                <p className="mt-2 text-muted">Loading records...</p>
              </div>
            ) : apiError ? (
              <div className="text-center py-5 text-danger">
                <AlertCircle size={32} />
                <p className="mt-2 fw-semibold">{apiError}</p>
              </div>
            ) : filteredFinances.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <Landmark size={28} />
                <p className="mt-2">No financial records found.</p>
              </div>
            ) : (
              <>
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th>Project Name</th>
                      <th>Development Partner</th>
                      <th>Approved Fund (Lakhs TK)</th>
                      <th>Revised Fund (Lakhs TK)</th>
                      <th>Created</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageFinances.map((item) => (
                      <tr key={item.id}>
                        <td className="fw-semibold text-dark">{item.projectName || "—"}</td>
                        <td>{item.devPartnerName || "—"}</td>
                        <td className="fw-semibold text-success">
                          ৳ {Number(item.totalApprovedFund || 0).toFixed(2)}
                        </td>
                        <td className="fw-semibold text-success">
                          ৳ {Number(item.totalRevisedFund || 0).toFixed(2)}
                        </td>
                        <td>
                          <small className="text-muted d-block">{formatDateTime(item.createdAt)}</small>
                        </td>
                        <td className="text-end">
                          <div className="btn-group btn-group-sm">
                            <button
                              onClick={() => setViewFinance(item)}
                              className="btn btn-outline-secondary"
                              title="View Record"
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

                {totalPages > 1 && (
                  <nav className="d-flex justify-content-center py-3">
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
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ---------------- Print View ---------------- */}
      <div className="d-none d-print-block">
        <h4 className="fw-bold mb-1">Project Financial Report</h4>
        <p className="text-muted small mb-3">
          Generated {formatDate(new Date())} · {filteredFinances.length} record(s)
        </p>
        <table className="table table-bordered table-sm">
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Development Partner</th>
              <th>Approved Contribution (Lakhs TK)</th>
              <th>Revised Contribution (Lakhs TK)</th>
            </tr>
          </thead>
          <tbody>
            {filteredFinances.map((item) => (
              <tr key={item.id}>
                <td>{item.projectName || "—"}</td>
                <td>{item.devPartnerName || "—"}</td>
                <td>৳ {Number(item.totalApprovedFund || 0).toFixed(2)}</td>
                <td>৳ {Number(item.totalRevisedFund || 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---------------- Modal ---------------- */}
      {viewFinance && (
        <div className="modal fade show d-block d-print-none" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-md modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-light">
                <h5 className="modal-title fw-bold text-primary">{viewFinance.projectName}</h5>
                <button type="button" className="btn-close" onClick={() => setViewFinance(null)}></button>
              </div>

              <div className="modal-body p-4">
                <div className="row g-3">
                  <div className="col-12">
                    <strong className="d-block text-muted small">Development Partner</strong>
                    <span>{viewFinance.devPartnerName || "N/A"}</span>
                  </div>
                  <div className="col-6">
                    <strong className="d-block text-muted small">Approved Contribution (Lakhs TK)</strong>
                    <span className="text-success fw-bold">
                      ৳ {Number(viewFinance.totalApprovedFund || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="col-6">
                    <strong className="d-block text-muted small">Revised Contribution (Lakhs TK)</strong>
                    <span className="text-success fw-bold">
                      ৳ {Number(viewFinance.totalRevisedFund || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="col-6">
                    <strong className="d-block text-muted small">Created At</strong>
                    <span>{formatDateTime(viewFinance.createdAt)}</span>
                  </div>
                  <div className="col-6">
                    <strong className="d-block text-muted small">Updated At</strong>
                    <span>{formatDateTime(viewFinance.updatedAt)}</span>
                  </div>
                </div>
              </div>

              <div className="modal-footer bg-light">
                <button className="btn btn-secondary" onClick={() => setViewFinance(null)}>
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

export default Finance;