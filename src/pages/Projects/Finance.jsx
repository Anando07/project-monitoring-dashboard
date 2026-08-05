import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Trash2,
  Eye,
  Pencil,
  X,
  Landmark,
  Search,
  Printer,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader,
  RotateCcw,
} from "lucide-react";

const PAGE_SIZE = 10;

import { getAllProjects } from "../../services/ProjectService";
import {
  getAllFinanceRecords,
  createFinanceRecord,
  updateFinanceRecord,
  deleteFinanceRecord,
} from "../../services/FinanceService";

/* ------------------------------------------------------------------ */
/* Static Options                                                     */
/* ------------------------------------------------------------------ */

// Development partners / funding agencies & countries that can be a "Contributor Partner"
const FUNDING_AGENCIES_AND_COUNTRIES = [
  "Govt of Bangladesh (GoB)",
  "World Bank (WB)",
  "International Monetary Fund (IMF)",
  "Asian Development Bank (ADB)",
  "Japan International Cooperation Agency (JICA)",
  "Asian Infrastructure Investment Bank (AIIB)",
  "Islamic Development Bank (IsDB)",
  "United States (USAID)",
  "United Kingdom (FCDO / DFID)",
  "China (Exim Bank of China)",
  "India (Line of Credit - LoC)",
  "Germany (GIZ / KfW)",
  "France (AFD)",
  "European Union (EU)",
  "South Korea (EDCF / KOICA)",
  "Saudi Arabia (SFD)",
  "United Arab Emirates (ADFD)",
  "Kuwait (KFAED)",
  "Australia (DFAT)",
  "Canada (GAC)",
  "Nordic Development Fund (NDF)",
  "Other Foreign Grant / Loan",
];


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
  contributors: [{ contributorPartner: "Govt of Bangladesh (GoB)", approvedFund: "", revisedFund: "" }],
};

function Finance() {
  const [projects, setProjects] = useState([]);
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
      const [projRes, finRes] = await Promise.all([
        getAllProjects().catch(() => ({ data: [] })),
        getAllFinanceRecords().catch(() => ({ data: [] })),
      ]);
      setProjects(projRes.data || []);
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

  /* Project currently selected in the form */
  const selectedProject = projectsMap[form.projectId] || null;
  const projectApprovedBudget = Number(selectedProject?.approvedBudget || 0);
  const hasRevisedBudget = selectedProject?.revisedBudget != null && selectedProject?.revisedBudget !== "";
  const projectRevisedBudget = hasRevisedBudget ? Number(selectedProject.revisedBudget) : null;

  /* Funds already allocated to this project by OTHER finance records (excludes the one being edited) */
  const alreadyAllocated = useMemo(() => {
    const relevant = financeRecords.filter(
      (r) => String(r.projectId) === String(form.projectId) && r.id !== editingId
    );
    return {
      approved: relevant.reduce((sum, r) => sum + Number(r.totalApprovedFund || 0), 0),
      revised: relevant.reduce((sum, r) => sum + Number(r.totalRevisedFund || 0), 0),
    };
  }, [financeRecords, form.projectId, editingId]);

  const nextAvailableApproved = Math.max(0, projectApprovedBudget - alreadyAllocated.approved);
  const nextAvailableRevised =
    projectRevisedBudget === null ? null : Math.max(0, projectRevisedBudget - alreadyAllocated.revised);

  /* Totals currently entered in the form */
  const calculatedFormTotals = useMemo(() => {
    return form.contributors.reduce(
      (acc, c) => ({
        approved: acc.approved + (Number(c.approvedFund) || 0),
        revised: acc.revised + (Number(c.revisedFund) || 0),
      }),
      { approved: 0, revised: 0 }
    );
  }, [form.contributors]);

  const isExceedingApproved = calculatedFormTotals.approved > nextAvailableApproved + 0.0001;
  const isExceedingRevised =
    nextAvailableRevised !== null && calculatedFormTotals.revised > nextAvailableRevised + 0.0001;
  const isExceedingBudget = isExceedingApproved || isExceedingRevised;

  /* Form Field Handlers */
  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleContributorChange = (index, field, value) => {
    setForm((prev) => {
      const updated = [...prev.contributors];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, contributors: updated };
    });
    if (errors.contributors) setErrors((prev) => ({ ...prev, contributors: null }));
  };

  const addContributorRow = () => {
    const availablePartner =
      FUNDING_AGENCIES_AND_COUNTRIES.find(
        (partner) => !form.contributors.some((c) => c.contributorPartner === partner)
      ) || FUNDING_AGENCIES_AND_COUNTRIES[0];

    setForm((prev) => ({
      ...prev,
      contributors: [...prev.contributors, { contributorPartner: availablePartner, approvedFund: "", revisedFund: "" }],
    }));
  };

  const removeContributorRow = (index) => {
    if (form.contributors.length === 1) return;
    setForm((prev) => ({
      ...prev,
      contributors: prev.contributors.filter((_, i) => i !== index),
    }));
  };

  /* Validation */
  const validate = () => {
    const next = {};
    if (!form.projectId) next.projectId = "Please select a project";

    let contributorErr = null;
    form.contributors.forEach((c) => {
      if (!c.approvedFund || Number(c.approvedFund) <= 0) {
        contributorErr = "Please specify a valid Approved Fund for all contributor partners.";
      }
      if (c.revisedFund !== "" && c.revisedFund !== null && Number(c.revisedFund) < 0) {
        contributorErr = "Revised Fund cannot be negative.";
      }
    });

    if (!contributorErr && isExceedingApproved) {
      contributorErr = `Approved fund total (৳ ${calculatedFormTotals.approved.toFixed(
        2
      )} Lakhs) exceeds the remaining Approved Budget of ৳ ${nextAvailableApproved.toFixed(2)} Lakhs for this project.`;
    }
    if (!contributorErr && isExceedingRevised) {
      contributorErr = `Revised fund total (৳ ${calculatedFormTotals.revised.toFixed(
        2
      )} Lakhs) exceeds the remaining Revised Budget of ৳ ${nextAvailableRevised.toFixed(2)} Lakhs for this project.`;
    }

    if (contributorErr) next.contributors = contributorErr;

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
        projectId: Number(form.projectId),
        contributors: form.contributors.map(c => ({
            id: c.id || null,
            contributorPartner: c.contributorPartner,
            approvedFund: Number(c.approvedFund),
            revisedFund:
                c.revisedFund === "" ? 0 : Number(c.revisedFund)
        }))
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
          err.response?.data?.message || "Failed to save this record — it may exceed the project's budget.";
        setErrors((prev) => ({ ...prev, contributors: message }));
      })
      .finally(() => setSubmitting(false));
  };

  const handleReset = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setEditingId(null);
  };

  const handleEdit = (record) => {
    setForm({
        projectId: String(record.projectId),
        contributors: record.contributors.map(c => ({
            id: c.id,
            contributorPartner: c.contributorPartner,
            approvedFund: String(c.approvedFund),
            revisedFund: String(c.revisedFund)
        }))
    });
    setEditingId(record.id);
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Remove this finance record? This action cannot be undone.")) return;
    deleteFinanceRecord(id)
      .then(() => {
        fetchFinanceList();
        if (editingId === id) handleReset();
      })
      .catch((err) => {
        console.error("Error deleting finance record:", err);
        alert("Could not delete finance record.");
      });
  };

  const handlePrint = () => {
    window.print();
  };

  /* Search & Pagination */
  const filteredFinances = useMemo(
    () =>
      financeRecords.filter(
        (f) =>
          (f.projectName || "").toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
          f.contributors.some((c) =>
            (c.contributorPartner || "").toLowerCase().includes(searchTerm.trim().toLowerCase())
          )
      ),
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
      {/* ---------------- Create / Edit Finance Form ---------------- */}
      <div className="card shadow-sm mb-4 border-0 d-print-none">
        <div className="card-header bg-white d-flex justify-content-between align-items-center py-3 border-bottom">
          <h5 className="mb-0 text-primary fw-bold">
            {editingId ? "Edit Development Partner Fund" : "Record Development Partner Fund"}
          </h5>
          <Landmark className="text-primary" size={22} />
        </div>

        <div className="card-body p-4">
          <form onSubmit={handleSubmit} noValidate>
            <div className="row g-3">
              {/* Project / Fiscal Year / Disbursement Date */}
              <div className="col-md-4">
                <label className="form-label fw-semibold">
                  Project <span className="text-danger">*</span>
                </label>
                <select
                  value={form.projectId}
                  onChange={handleChange("projectId")}
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
                  <div className="form-text">
                    Approved Budget: <strong>৳ {projectApprovedBudget.toFixed(2)} Lakhs</strong>
                    {" · "}
                    Revised Budget:{" "}
                    <strong>{projectRevisedBudget !== null ? `৳ ${projectRevisedBudget.toFixed(2)} Lakhs` : "—"}</strong>
                    <br />
                    Already Received — Approved: <strong>৳ {alreadyAllocated.approved.toFixed(2)} Lakhs</strong>
                    {" · "}
                    Revised: <strong>৳ {alreadyAllocated.revised.toFixed(2)} Lakhs</strong>
                  </div>
                )}
              </div>

              {/* Contributor Partners */}
              <div className="col-12 mt-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label className="form-label fw-semibold d-flex align-items-center gap-1 mb-0">
                    <DollarSign size={16} /> Development Partner Contributions (Approved &amp; Revised Fund, Lakhs TK)
                  </label>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                    onClick={addContributorRow}
                    disabled={!form.projectId}
                  >
                    <Plus size={14} /> Add Contributor Partner
                  </button>
                </div>

                {errors.contributors && (
                  <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3">
                    <AlertCircle size={16} className="flex-shrink-0" />
                    <span className="small">{errors.contributors}</span>
                  </div>
                )}

                {form.contributors.map((contributor, idx) => (
                  <div className="row g-2 align-items-end mb-2 p-2 border rounded bg-white" key={idx}>
                    <div className="col-md-5">
                      <label className="form-label small text-muted mb-1">Contributor Partner</label>
                      <select
                        className="form-select form-select-sm"
                        value={contributor.contributorPartner}
                        onChange={(e) => handleContributorChange(idx, "contributorPartner", e.target.value)}
                      >
                        {FUNDING_AGENCIES_AND_COUNTRIES.map((agency, aIdx) => (
                          <option key={aIdx} value={agency}>
                            {agency}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-3">
                      <label className="form-label small text-muted mb-1">Approved Fund (Lakhs TK)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={contributor.approvedFund}
                        onChange={(e) => handleContributorChange(idx, "approvedFund", e.target.value)}
                        className={`form-control form-control-sm ${isExceedingApproved ? "is-invalid" : ""}`}
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label small text-muted mb-1">Revised Fund (Lakhs TK)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={contributor.revisedFund}
                        onChange={(e) => handleContributorChange(idx, "revisedFund", e.target.value)}
                        className={`form-control form-control-sm ${isExceedingRevised ? "is-invalid" : ""}`}
                      />
                    </div>

                    <div className="col-md-1 d-flex justify-content-end">
                      {form.contributors.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => removeContributorRow(idx)}
                          title="Remove Contributor"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                <div
                  className={`alert ${isExceedingApproved ? "alert-danger" : "alert-light border"} d-flex justify-content-between align-items-center py-2 px-3 mb-2 mt-2`}
                >
                  <span className="small">Approved Total / Remaining Approved Cap:</span>
                  <strong className={isExceedingApproved ? "text-danger" : "text-success"}>
                    ৳ {calculatedFormTotals.approved.toFixed(2)} / ৳ {nextAvailableApproved.toFixed(2)} Lakhs
                  </strong>
                </div>
                <div
                  className={`alert ${isExceedingRevised ? "alert-danger" : "alert-light border"} d-flex justify-content-between align-items-center py-2 px-3 mb-0`}
                >
                  <span className="small">Revised Total / Remaining Revised Cap:</span>
                  <strong className={isExceedingRevised ? "text-danger" : "text-success"}>
                    ৳ {calculatedFormTotals.revised.toFixed(2)} /{" "}
                    {nextAvailableRevised !== null ? `৳ ${nextAvailableRevised.toFixed(2)} Lakhs` : "No cap set"}
                  </strong>
                </div>
              </div>
              <div className="col-12 d-flex justify-content-end align-items-center gap-2 mt-4 pt-2 border-top">
                {editingId && (
                  <span className="badge bg-primary-subtle text-primary-emphasis border border-primary-subtle me-auto px-2 py-2">
                    Editing: {selectedProject?.projectName || ""}
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
                  {editingId ? "Save Changes" : "Record Fund"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* ---------------- Finance List Table ---------------- */}
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
                <p className="mt-2 text-muted">Loading finance records...</p>
              </div>
            ) : apiError ? (
              <div className="text-center py-5 text-danger">
                <AlertCircle size={32} />
                <p className="mt-2 fw-semibold">{apiError}</p>
              </div>
            ) : filteredFinances.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <Landmark size={28} />
                <p className="mt-2">
                  {financeRecords.length === 0
                    ? "No financial records found. Add one above."
                    : "No records match your search."}
                </p>
              </div>
            ) : (
              <>
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th>Project Name</th>
                      <th>Approved Budget</th>
                      <th>Revised Budget</th>
                      <th>Contributor Partners</th>
                      <th>Approved Fund Received</th>
                      <th>Revised Fund Received</th>
                      <th>Created</th>
                      <th>Updated</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageFinances.map((item) => (
                      <tr key={item.id}>
                        <td className="fw-semibold text-dark">{item.projectName}</td>
                        <td className="fw-semibold">৳ {Number(item.projectApprovedBudget || 0).toFixed(2)} Lakhs</td>
                        <td>
                          {item.projectRevisedBudget != null
                            ? `৳ ${Number(item.projectRevisedBudget).toFixed(2)} Lakhs`
                            : "—"}
                        </td>
                        <td>
                          <div className="d-flex flex-wrap gap-1">
                            {item.contributors.map((c, i) => (
                              <span
                                key={i}
                                className="badge bg-light text-dark border small fw-normal px-2 py-1"
                              >
                                {c.contributorPartner}: A৳{Number(c.approvedFund).toFixed(2)} / R৳
                                {Number(c.revisedFund || 0).toFixed(2)}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="fw-semibold text-success">
                          ৳ {Number(item.totalApprovedFund || 0).toFixed(2)} Lakhs
                        </td>
                        <td className="fw-semibold text-success">
                          ৳ {Number(item.totalRevisedFund || 0).toFixed(2)} Lakhs
                        </td>
                        
                        <td>
                          <small className="text-muted d-block">{formatDateTime(item.createdAt)}</small>
                          <small className="text-muted">by {item.createdBy || "—"}</small>
                        </td>
                        <td>
                          <small className="text-muted d-block">{formatDateTime(item.updatedAt)}</small>
                          <small className="text-muted">by {item.updatedBy || "—"}</small>
                        </td>
                        <td className="text-end">
                          <div className="btn-group btn-group-sm">
                            <button
                              onClick={() => setViewFinance(item)}
                              className="btn btn-outline-secondary"
                              title="View Breakdown"
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

      {/* ---------------- Print Table Format ---------------- */}
      <div className="d-none d-print-block">
        <h4 className="fw-bold mb-1">Project Financial Report</h4>
        <p className="text-muted small mb-3">
          Generated {formatDate(new Date())} · {filteredFinances.length} record(s)
        </p>
        <table className="table table-bordered table-sm">
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Approved Budget</th>
              <th>Revised Budget</th>
              <th>Contributor Partners (Approved / Revised)</th>
              <th>Approved Fund Received</th>
              <th>Revised Fund Received</th>
              <th>Created At</th>
              <th>Created By</th>
            </tr>
          </thead>
          <tbody>
            {filteredFinances.map((item) => (
              <tr key={item.id}>
                <td>{item.projectName}</td>
                <td>৳ {Number(item.projectApprovedBudget || 0).toFixed(2)} Lakhs</td>
                <td>{item.projectRevisedBudget != null ? `৳ ${Number(item.projectRevisedBudget).toFixed(2)} Lakhs` : "—"}</td>
                <td>
                  {item.contributors
                    .map(
                      (c) =>
                        `${c.contributorPartner} (A:৳${Number(c.approvedFund).toFixed(2)} / R:৳${Number(
                          c.revisedFund || 0
                        ).toFixed(2)})`
                    )
                    .join(", ")}
                </td>
                <td>৳ {Number(item.totalApprovedFund || 0).toFixed(2)} Lakhs</td>
                <td>৳ {Number(item.totalRevisedFund || 0).toFixed(2)} Lakhs</td>
                <td>{item.createdBy || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---------------- Detail View Modal ---------------- */}
      {viewFinance && (
        <div className="modal fade show d-block d-print-none" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-light">
                <h5 className="modal-title fw-bold text-primary">{viewFinance.projectName}</h5>
                <button type="button" className="btn-close" onClick={() => setViewFinance(null)}></button>
              </div>

              <div className="modal-body p-4">
                <h6 className="fw-bold text-muted mb-2">Development Partner Contributions</h6>
                <div className="table-responsive mb-4">
                  <table className="table table-bordered table-sm mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Contributor Partner</th>
                        <th>Approved Fund</th>
                        <th>Revised Fund</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewFinance.contributors.map((c, i) => (
                        <tr key={i}>
                          <td>{c.contributorPartner}</td>
                          <td>৳ {Number(c.approvedFund).toFixed(2)} Lakhs</td>
                          <td>৳ {Number(c.revisedFund || 0).toFixed(2)} Lakhs</td>
                        </tr>
                      ))}
                      <tr className="table-light fw-bold">
                        <td>Total Received</td>
                        <td>৳ {Number(viewFinance.totalApprovedFund || 0).toFixed(2)} Lakhs</td>
                        <td>৳ {Number(viewFinance.totalRevisedFund || 0).toFixed(2)} Lakhs</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h6 className="fw-bold text-muted mb-2">Disbursement Information</h6>
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <strong className="d-block text-muted small">Project Approved Budget</strong>
                    <span>৳ {Number(viewFinance.projectApprovedBudget || 0).toFixed(2)} Lakhs</span>
                  </div>
                  <div className="col-md-6">
                    <strong className="d-block text-muted small">Project Revised Budget</strong>
                    <span>
                      {viewFinance.projectRevisedBudget != null
                        ? `৳ ${Number(viewFinance.projectRevisedBudget).toFixed(2)} Lakhs`
                        : "—"}
                    </span>
                  </div>
                  <div className="col-md-6">
                    <strong className="d-block text-muted small">Fiscal Year</strong>
                    <span>{viewFinance.fiscalYear}</span>
                  </div>
                  <div className="col-md-6">
                    <strong className="d-block text-muted small">Disbursement Date</strong>
                    <span>{formatDate(viewFinance.disbursementDate)}</span>
                  </div>
                </div>

                <h6 className="fw-bold text-muted mb-2">Record Audit Trail</h6>
                <div className="row g-3">
                  <div className="col-md-6">
                    <strong className="d-block text-muted small">Created At</strong>
                    <span>{formatDateTime(viewFinance.createdAt)}</span>
                  </div>
                  <div className="col-md-6">
                    <strong className="d-block text-muted small">Created By</strong>
                    <span>{viewFinance.createdBy || "—"}</span>
                  </div>
                  <div className="col-md-6">
                    <strong className="d-block text-muted small">Updated At</strong>
                    <span>{formatDateTime(viewFinance.updatedAt)}</span>
                  </div>
                  <div className="col-md-6">
                    <strong className="d-block text-muted small">Updated By</strong>
                    <span>{viewFinance.updatedBy || "—"}</span>
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