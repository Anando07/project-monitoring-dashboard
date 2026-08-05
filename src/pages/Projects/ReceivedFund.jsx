import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Trash2,
  Pencil,
  Search,
  Printer,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader,
  FileText,
} from "lucide-react";

import {
  getAllReceivedFunds,
  createReceivedFund,
  updateReceivedFund,
  deleteReceivedFund,
} from "../../services/ReceivedFundService";
import { getAllProjects } from "../../services/ProjectService";

const PAGE_SIZE = 8;

// Helper function to format values directly stored in Lakhs
const formatLakhs = (val) => {
  const num = Number(val || 0);
  return `${num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 4 })} Lakhs Tk`;
};

// Dynamic fiscal year generator: 1971-1972 to 2142-2143
const FISCAL_YEAR_OPTIONS = Array.from({ length: 2143 - 1971 }, (_, index) => {
  const startYear = 1971 + index;
  const endYear = startYear + 1;
  return `${startYear}-${endYear}`;
});

// Calculate current fiscal year based on Bangladesh fiscal cycle (July 1 - June 30)
const getCurrentFiscalYear = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1; // July is 7
  const startYear = month >= 7 ? year : year - 1;
  return `${startYear}-${startYear + 1}`;
};

const EMPTY_FORM = {
  projectId: "",
  fundAmount: "",
  fiscalYear: getCurrentFiscalYear(),
  receivedDate: new Date().toISOString().split("T")[0],
};

function ReceivedFund() {
  const [projects, setProjects] = useState([]);
  const [receivedFunds, setReceivedFunds] = useState([]);

  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [formError, setFormError] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const [projRes, fundRes] = await Promise.all([
        getAllProjects().catch(() => ({ data: [] })),
        getAllReceivedFunds().catch(() => ({ data: [] })),
      ]);
      setProjects(projRes.data || []);
      setReceivedFunds(fundRes.data || []);
    } catch (err) {
      setApiError("Failed to fetch initial data from server.");
    } finally {
      setLoading(false);
    }
  };

  const selectedProjectInfo = useMemo(() => {
    if (!form.projectId) return null;
    const proj = projects.find((p) => String(p.id) === String(form.projectId));
    if (!proj) return null;

    const appBudget = Number(proj.approvedBudget || 0);
    const revBudget = Number(proj.revisedBudget || 0);

    // If Revised Budget exists and > 0, cap on Revised Budget; otherwise Approved Budget
    const isRevisedValid = revBudget > 0;
    const effectiveBudget = isRevisedValid ? revBudget : appBudget;

    // Sum already received funds (in Lakhs) for this project excluding current editing item
    const alreadyReceived = receivedFunds
      .filter((f) => String(f.projectId) === String(form.projectId) && f.id !== editingId)
      .reduce((sum, f) => sum + Number(f.fundAmount || 0), 0);

    const remainingAllowed = Math.max(0, effectiveBudget - alreadyReceived);

    return {
      approvedBudget: appBudget,
      revisedBudget: revBudget,
      effectiveBudget,
      alreadyReceived,
      remainingAllowed,
      isRevised: isRevisedValid,
    };
  }, [form.projectId, projects, receivedFunds, editingId]);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormError(null);
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.projectId) nextErrors.projectId = "Please select a project";
    if (!form.fundAmount || Number(form.fundAmount) <= 0) {
      nextErrors.fundAmount = "Enter a valid positive amount";
    }
    if (!form.fiscalYear) nextErrors.fiscalYear = "Fiscal year is required";
    if (!form.receivedDate) nextErrors.receivedDate = "Received date is required";

    if (selectedProjectInfo) {
      const enteringAmt = Number(form.fundAmount || 0);
      if (enteringAmt > selectedProjectInfo.remainingAllowed) {
        nextErrors.fundAmount = `Amount exceeds max remaining limit (${formatLakhs(selectedProjectInfo.remainingAllowed)})`;
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setFormError(null);
    try {
      const payload = {
        ...form,
        fundAmount: Number(form.fundAmount),
      };

      if (editingId) {
        const res = await updateReceivedFund(editingId, payload);
        setReceivedFunds((prev) =>
          prev.map((item) => (item.id === editingId ? res.data : item))
        );
      } else {
        const res = await createReceivedFund(payload);
        setReceivedFunds((prev) => [res.data, ...prev]);
        setCurrentPage(1);
      }

      handleReset();
    } catch (err) {
      const msg = err.response?.data || "Server validation failed.";
      setFormError(typeof msg === "string" ? msg : JSON.stringify(msg));
    }
  };

  const handleReset = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setFormError(null);
    setEditingId(null);
  };

  const handleEdit = (item) => {
    setForm({
      projectId: String(item.projectId),
      fundAmount: String(item.fundAmount),
      fiscalYear: item.fiscalYear,
      receivedDate: item.receivedDate,
    });
    setEditingId(item.id);
    setErrors({});
    setFormError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this received fund record?")) return;
    try {
      await deleteReceivedFund(id);
      setReceivedFunds((prev) => prev.filter((item) => item.id !== id));
      if (editingId === id) handleReset();
    } catch (err) {
      alert("Failed to delete the record.");
    }
  };

  const filteredFunds = useMemo(() => {
    return receivedFunds.filter((item) => {
      const q = searchTerm.toLowerCase().trim();
      return (
        (item.projectName || "").toLowerCase().includes(q) ||
        (item.fiscalYear || "").toLowerCase().includes(q) ||
        String(item.fundAmount).includes(q)
      );
    });
  }, [receivedFunds, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredFunds.length / PAGE_SIZE));
  const pageFunds = filteredFunds.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="container-fluid py-4 bg-light min-vh-100">
      {/* Form Card */}
      <div className="card shadow-sm border-0 mb-4 d-print-none">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center border-bottom">
          <h5 className="mb-0 text-primary fw-bold">
            {editingId ? "Edit Received Fund Record" : "Add Received Fund"}
          </h5>
          <DollarSign className="text-primary" size={20} />
        </div>

        <div className="card-body p-4">
          {loading ? (
            <div className="text-center py-4">
              <Loader size={24} className="spinner-border text-primary border-0" />
              <p className="mt-2 text-muted small">Loading records...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              {formError && (
                <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 mb-3">
                  <AlertCircle size={16} />
                  <span className="small">{formError}</span>
                </div>
              )}

              <div className="row g-3">
                {/* Project Selection */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Select Project <span className="text-danger">*</span>
                  </label>
                  <select
                    value={form.projectId}
                    onChange={handleChange("projectId")}
                    className={`form-select ${errors.projectId ? "is-invalid" : ""}`}
                  >
                    <option value="">-- Choose Project --</option>
                    {projects.map((p) => {
                      const appB = Number(p.approvedBudget || 0);
                      const revB = Number(p.revisedBudget || 0);
                      return (
                        <option key={p.id} value={p.id}>
                          {p.projectName} | Approved: {formatLakhs(appB)}
                          {revB > 0 ? ` | Revised: ${formatLakhs(revB)}` : ""}
                        </option>
                      );
                    })}
                  </select>
                  {errors.projectId && <div className="invalid-feedback">{errors.projectId}</div>}
                </div>

                {/* Fiscal Year */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Fiscal Year <span className="text-danger">*</span>
                  </label>
                  <select
                    value={form.fiscalYear}
                    onChange={handleChange("fiscalYear")}
                    className={`form-select ${errors.fiscalYear ? "is-invalid" : ""}`}
                  >
                    {FISCAL_YEAR_OPTIONS.map((fy) => (
                      <option key={fy} value={fy}>
                        {fy}
                      </option>
                    ))}
                  </select>
                  {errors.fiscalYear && <div className="invalid-feedback">{errors.fiscalYear}</div>}
                </div>

                {/* Fund Amount */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Fund Amount (in Lakhs Tk) <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 40"
                    value={form.fundAmount}
                    onChange={handleChange("fundAmount")}
                    className={`form-control ${errors.fundAmount ? "is-invalid" : ""}`}
                  />
                  {errors.fundAmount && <div className="invalid-feedback">{errors.fundAmount}</div>}
                </div>

                {/* Received Date */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Received Date <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.receivedDate}
                    onChange={handleChange("receivedDate")}
                    className={`form-control ${errors.receivedDate ? "is-invalid" : ""}`}
                  />
                  {errors.receivedDate && <div className="invalid-feedback">{errors.receivedDate}</div>}
                </div>

                {/* Budget Breakdown Box */}
                {selectedProjectInfo && (
                  <div className="col-12">
                    <div className="p-3 bg-light border rounded">
                      <div className="row text-center g-2">
                        <div className="col-md-3">
                          <small className="text-muted d-block">Approved Budget</small>
                          <strong className="text-dark">
                            {formatLakhs(selectedProjectInfo.approvedBudget)}
                          </strong>
                        </div>
                        <div className="col-md-3">
                          <small className="text-muted d-block">Revised Budget</small>
                          <strong className={selectedProjectInfo.isRevised ? "text-primary fw-bold" : "text-muted"}>
                            {selectedProjectInfo.isRevised
                              ? formatLakhs(selectedProjectInfo.revisedBudget)
                              : "N/A"}
                          </strong>
                        </div>
                        <div className="col-md-3">
                          <small className="text-muted d-block">Already Received</small>
                          <strong className="text-info">
                            {formatLakhs(selectedProjectInfo.alreadyReceived)}
                          </strong>
                        </div>
                        <div className="col-md-3">
                          <small className="text-muted d-block">
                            Max Remaining Limit ({selectedProjectInfo.isRevised ? "Revised" : "Approved"})
                          </small>
                          <strong className="text-success">
                            {formatLakhs(selectedProjectInfo.remainingAllowed)}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="col-12 d-flex justify-content-end gap-2 mt-3 pt-2 border-top">
                  {editingId && (
                    <span className="badge bg-primary-subtle text-primary border me-auto p-2">
                      Editing Record ID: #{editingId}
                    </span>
                  )}
                  <button type="button" className="btn btn-outline-secondary" onClick={handleReset}>
                    {editingId ? "Cancel" : "Reset"}
                  </button>
                  <button type="submit" className="btn btn-primary d-inline-flex align-items-center gap-1">
                    {editingId ? <Pencil size={16} /> : <Plus size={16} />}
                    {editingId ? "Update Received Fund" : "Save Received Fund"}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Directory Table */}
      <div className="card shadow-sm border-0 d-print-none">
        <div className="card-header bg-white py-3 d-flex flex-wrap justify-content-between align-items-center gap-2 border-bottom">
          <h5 className="mb-0 fw-bold text-dark">
            Received Funds Directory <span className="badge bg-secondary ms-1">{filteredFunds.length}</span>
          </h5>

          <div className="d-flex align-items-center gap-2">
            <div className="input-group input-group-sm" style={{ width: "260px" }}>
              <span className="input-group-text bg-light border-end-0">
                <Search size={14} />
              </span>
              <input
                type="text"
                className="form-control bg-light border-start-0"
                placeholder="Search by project or year..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <button
              type="button"
              className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
              onClick={() => window.print()}
            >
              <Printer size={14} /> Print
            </button>
          </div>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            {filteredFunds.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <FileText size={32} className="mb-2" />
                <p className="mb-0">No received fund records found.</p>
              </div>
            ) : (
              <table className="table table-hover align-middle mb-0">
                <thead className="table-dark">
                  <tr>
                    <th>Project Name & Budget Breakdown</th>
                    <th>Fiscal Year</th>
                    <th>Received Amount</th>
                    <th>Received Date</th>
                    <th>Created At</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageFunds.map((item) => {
                    const matchedProj = projects.find((p) => String(p.id) === String(item.projectId));
                    const appB = matchedProj ? Number(matchedProj.approvedBudget || 0) : null;
                    const revB = matchedProj ? Number(matchedProj.revisedBudget || 0) : null;

                    return (
                      <tr key={item.id}>
                        <td>
                          <strong className="d-block text-dark">{item.projectName}</strong>
                          <div className="small text-muted">
                            {appB !== null && <span>Approved: {formatLakhs(appB)}</span>}
                            {revB !== null && revB > 0 && (
                              <span className="ms-2 text-primary">| Revised: {formatLakhs(revB)}</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-primary-subtle text-primary border p-2">{item.fiscalYear}</span>
                        </td>
                        <td>
                          <span className="fw-bold text-success">{formatLakhs(item.fundAmount)}</span>
                        </td>
                        <td>{item.receivedDate}</td>
                        <td>
                          <small className="text-muted">
                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-GB") : "—"}
                          </small>
                        </td>
                        <td className="text-end">
                          <div className="btn-group btn-group-sm">
                            <button onClick={() => handleEdit(item)} className="btn btn-outline-primary">
                              <Pencil size={14} />
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="btn btn-outline-danger">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {totalPages > 1 && (
            <div className="d-flex justify-content-center py-3 border-top">
              <nav>
                <ul className="pagination pagination-sm mb-0">
                  <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                    <button className="page-link" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>
                      <ChevronLeft size={14} />
                    </button>
                  </li>
                  <li className="page-item disabled">
                    <span className="page-link text-dark">
                      Page {currentPage} of {totalPages}
                    </span>
                  </li>
                  <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                    <button className="page-link" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}>
                      <ChevronRight size={14} />
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReceivedFund;