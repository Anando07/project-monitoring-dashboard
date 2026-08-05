import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Search,
  Printer,
  Trash2,
  Edit2,
  Eye,
  PieChart,
  AlertCircle,
  FileText,
  Briefcase,
  Loader,
  Pencil,
} from "lucide-react";

import {
  getAllFinancialProgress,
  createFinancialProgress,
  updateFinancialProgress,
  deleteFinancialProgress,
} from "../../services/FinancialProgressService";

import { getAllProjects } from "../../services/ProjectService";

const INITIAL_FORM_STATE = {
  id: null,
  projectId: "",
  projectName: "",
  totalBudget: "",
  expenseAmount: "",
  purpose: "",
  expenseDate: new Date().toISOString().split("T")[0],
};

const formatNumber = (val) => {
  const num = Number(val || 0);
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

function FinancialProgress() {
  const [projects, setProjects] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewItem, setViewItem] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [projRes, expRes] = await Promise.all([
        getAllProjects().catch(() => ({ data: [] })),
        getAllFinancialProgress().catch(() => ({ data: [] })),
      ]);
      setProjects(projRes.data || []);
      setExpenses(expRes.data || []);
    } catch (err) {
      console.error("Failed to fetch records from backend:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateEffectiveBudget = (proj) => {
    if (!proj) return 0;
    const revB = Number(proj.revisedBudget || 0);
    const appB = Number(proj.approvedBudget || 0);
    return revB > 0 ? revB : appB;
  };

  const getProjectSpentTotal = (projectId, excludeExpenseId = null) => {
    return expenses
      .filter(
        (exp) =>
          String(exp.projectId) === String(projectId) &&
          exp.id !== excludeExpenseId
      )
      .reduce((acc, curr) => acc + Number(curr.expenseAmount || 0), 0);
  };

  const handleProjectSelect = (e) => {
    const selectedId = e.target.value;
    const project = projects.find((p) => String(p.id) === String(selectedId));

    if (project) {
      const effectiveBudget = calculateEffectiveBudget(project);
      setFormData((prev) => ({
        ...prev,
        projectId: String(project.id),
        projectName: project.projectName,
        totalBudget: effectiveBudget,
      }));
      if (errors.projectId) setErrors((prev) => ({ ...prev, projectId: null }));
    } else {
      setFormData((prev) => ({
        ...prev,
        projectId: "",
        projectName: "",
        totalBudget: "",
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError(null);
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.projectId) newErrors.projectId = "Please select a project.";

    const amount = parseFloat(formData.expenseAmount);
    if (!formData.expenseAmount || isNaN(amount) || amount <= 0) {
      newErrors.expenseAmount = "Enter a valid positive expense amount.";
    } else if (formData.projectId) {
      const currentSpent = getProjectSpentTotal(formData.projectId, formData.id);
      const totalCap = Number(formData.totalBudget || 0);
      const remainingBudget = Math.max(0, totalCap - currentSpent);

      if (amount > remainingBudget) {
        newErrors.expenseAmount = `Expense exceeds limit! Max remaining: ${formatNumber(remainingBudget)} Lakhs Tk`;
      }
    }

    if (!formData.purpose || !formData.purpose.trim()) {
      newErrors.purpose = "Purpose of expense is required.";
    }
    if (!formData.expenseDate) {
      newErrors.expenseDate = "Date is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setFormError(null);
    const payload = {
      projectId: Number(formData.projectId),
      expenseAmount: Number(formData.expenseAmount),
      purpose: formData.purpose.trim(),
      expenseDate: formData.expenseDate,
    };

    try {
      if (isEditing) {
        const res = await updateFinancialProgress(formData.id, payload);
        setExpenses((prev) =>
          prev.map((item) => (item.id === formData.id ? res.data : item))
        );
      } else {
        const res = await createFinancialProgress(payload);
        setExpenses((prev) => [res.data, ...prev]);
      }
      handleCancelEdit();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        "Failed to save financial record.";
      setFormError(typeof msg === "string" ? msg : JSON.stringify(msg));
    }
  };

  const handleEdit = (item) => {
    const matchedProj = projects.find(
      (p) => String(p.id) === String(item.projectId)
    );
    const effectiveBudget = calculateEffectiveBudget(matchedProj);

    setFormData({
      id: item.id,
      projectId: String(item.projectId),
      projectName: item.projectName,
      totalBudget: effectiveBudget,
      expenseAmount: String(item.expenseAmount),
      purpose: item.purpose,
      expenseDate: item.expenseDate,
    });
    setIsEditing(true);
    setErrors({});
    setFormError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense record?"))
      return;
    try {
      await deleteFinancialProgress(id);
      setExpenses((prev) => prev.filter((item) => item.id !== id));
      if (formData.id === id) handleCancelEdit();
    } catch (err) {
      alert("Failed to delete record.");
    }
  };

  const handleCancelEdit = () => {
    setFormData(INITIAL_FORM_STATE);
    setIsEditing(false);
    setErrors({});
    setFormError(null);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=900,height=650");
    if (!printWindow) return;

    const rowsHtml = filteredExpenses
      .map(
        (exp) => `
      <tr>
        <td><strong>${exp.projectName}</strong></td>
        <td>${formatNumber(exp.totalBudget)}</td>
        <td style="color: #dc3545; font-weight: bold;">${formatNumber(exp.expenseAmount)}</td>
        <td>${exp.purpose}</td>
        <td>${exp.expenseDate}</td>
      </tr>
    `
      )
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Financial Progress Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #212529; }
            h2 { margin-bottom: 5px; }
            p { font-size: 12px; color: #6c757d; margin-top: 0; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #dee2e6; padding: 8px 10px; text-align: left; font-size: 12px; }
            th { background-color: #212529; color: #fff; }
            tr:nth-child(even) { background-color: #f8f9fa; }
          </style>
        </head>
        <body>
          <h2>Project Expense Ledger</h2>
          <p>Generated on: ${new Date().toLocaleDateString()} | Total Records: ${filteredExpenses.length}</p>
          <table>
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Total Budget (in Lakhs Tk)</th>
                <th>Expense Amount (in Lakhs Tk)</th>
                <th>Purpose</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml.length > 0 ? rowsHtml : '<tr><td colspan="5" style="text-align:center;">No expense records available</td></tr>'}
            </tbody>
          </table>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const filteredExpenses = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();
    return expenses.filter(
      (item) =>
        (item.projectName || "").toLowerCase().includes(query) ||
        (item.purpose || "").toLowerCase().includes(query)
    );
  }, [expenses, searchTerm]);

  return (
    <div className="container-fluid py-4 bg-light min-vh-100">
      {/* Entry Form */}
      <div className="card shadow-sm border-0 mb-4 d-print-none">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center border-bottom">
          <h5 className="mb-0 text-primary fw-bold">
            {isEditing ? "Edit Financial Progress Record" : "Record Financial Progress / Expense"}
          </h5>
          <PieChart className="text-primary" size={20} />
        </div>

        <div className="card-body p-4">
          {formError && (
            <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 mb-3">
              <AlertCircle size={16} />
              <span className="small">{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="row g-3">
              {/* Clean Project Dropdown */}
              <div className="col-md-4">
                <label className="form-label fw-semibold">
                  Select Project <span className="text-danger">*</span>
                </label>
                <select
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleProjectSelect}
                  className={`form-select ${errors.projectId ? "is-invalid" : ""}`}
                >
                  <option value="">-- Choose Project --</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.projectName}
                    </option>
                  ))}
                </select>
                {errors.projectId && <div className="invalid-feedback">{errors.projectId}</div>}
              </div>

              {/* Total Budget Display */}
              <div className="col-md-4">
                <label className="form-label fw-semibold">Total Allocated Budget (in Lakhs Tk)</label>
                <input
                  type="text"
                  className="form-control bg-light"
                  value={
                    formData.totalBudget !== "" ? formatNumber(formData.totalBudget) : "Select a project"
                  }
                  readOnly
                />
              </div>

              {/* Expense Amount */}
              <div className="col-md-4">
                <label className="form-label fw-semibold">
                  Expense Amount (in Lakhs Tk) <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="expenseAmount"
                  placeholder="0.00"
                  value={formData.expenseAmount}
                  onChange={handleInputChange}
                  className={`form-control ${errors.expenseAmount ? "is-invalid" : ""}`}
                />
                {errors.expenseAmount && <div className="invalid-feedback">{errors.expenseAmount}</div>}
              </div>

              {/* Purpose */}
              <div className="col-md-8">
                <label className="form-label fw-semibold">
                  Purpose of Expense <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="purpose"
                  placeholder="e.g. Fuel for machinery, Vendor payment, Steel procurement..."
                  value={formData.purpose}
                  onChange={handleInputChange}
                  className={`form-control ${errors.purpose ? "is-invalid" : ""}`}
                />
                {errors.purpose && <div className="invalid-feedback">{errors.purpose}</div>}
              </div>

              {/* Expense Date */}
              <div className="col-md-4">
                <label className="form-label fw-semibold">
                  Expense Date <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  name="expenseDate"
                  value={formData.expenseDate}
                  onChange={handleInputChange}
                  className={`form-control ${errors.expenseDate ? "is-invalid" : ""}`}
                />
                {errors.expenseDate && <div className="invalid-feedback">{errors.expenseDate}</div>}
              </div>

              {/* Actions */}
              <div className="col-12 d-flex justify-content-end gap-2 mt-4 pt-2 border-top">
                {isEditing && (
                  <span className="badge bg-primary-subtle text-primary border me-auto p-2 align-self-center">
                    Editing Record ID: #{formData.id}
                  </span>
                )}
                {isEditing && (
                  <button type="button" className="btn btn-outline-secondary" onClick={handleCancelEdit}>
                    Cancel
                  </button>
                )}
                <button type="submit" className="btn btn-primary d-inline-flex align-items-center gap-1">
                  {isEditing ? <Pencil size={16} /> : <Plus size={16} />}
                  {isEditing ? "Update Expense Record" : "Add Expense Record"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Directory Table */}
      <div className="card shadow-sm border-0 d-print-none">
        <div className="card-header bg-white py-3 d-flex flex-wrap justify-content-between align-items-center gap-2 border-bottom">
          <h5 className="mb-0 fw-bold text-dark">
            Expense Transactions Ledger <span className="badge bg-secondary ms-1">{filteredExpenses.length}</span>
          </h5>

          <div className="d-flex align-items-center gap-2">
            <div className="input-group input-group-sm" style={{ width: "260px" }}>
              <span className="input-group-text bg-light border-end-0">
                <Search size={14} />
              </span>
              <input
                type="text"
                className="form-control bg-light border-start-0"
                placeholder="Search purpose or project..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button
              type="button"
              className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
              onClick={handlePrint}
            >
              <Printer size={14} /> Print
            </button>
          </div>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            {loading ? (
              <div className="text-center py-5 text-muted">
                <Loader size={24} className="spinner-border text-primary border-0" />
                <p className="mt-2 small">Loading records...</p>
              </div>
            ) : filteredExpenses.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <AlertCircle size={32} className="mb-2" />
                <p className="mb-0">No expense records found.</p>
              </div>
            ) : (
              <table className="table table-hover align-middle mb-0">
                <thead className="table-dark">
                  <tr>
                    <th>Project Name</th>
                    <th>Total Budget (in Lakhs Tk)</th>
                    <th>Expense Amount (in Lakhs Tk)</th>
                    <th>Purpose of Expense</th>
                    <th>Expense Date</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong className="text-dark">{item.projectName}</strong>
                      </td>
                      <td className="fw-semibold text-secondary">
                        {formatNumber(item.totalBudget)}
                      </td>
                      <td className="fw-bold text-danger">
                        {formatNumber(item.expenseAmount)}
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-1">
                          <FileText size={14} className="text-muted" />
                          <span>{item.purpose}</span>
                        </div>
                      </td>
                      <td>{item.expenseDate}</td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button
                            onClick={() => setViewItem(item)}
                            className="btn btn-outline-info"
                            title="View Details"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => handleEdit(item)}
                            className="btn btn-outline-primary"
                            title="Edit Record"
                          >
                            <Edit2 size={14} />
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
            )}
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {viewItem && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setViewItem(null)}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-light">
                <h5 className="modal-title fw-bold text-primary">Expense Record Details</h5>
                <button type="button" className="btn-close" onClick={() => setViewItem(null)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
                  <div className="p-3 bg-primary-subtle text-primary rounded-circle">
                    <Briefcase size={24} />
                  </div>
                  <div>
                    <h5 className="mb-0 fw-bold">{viewItem.projectName}</h5>
                    <small className="text-muted">Record ID: #{viewItem.id}</small>
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-6">
                    <small className="text-muted d-block">Total Allocated Budget</small>
                    <strong className="fs-6 text-dark">{formatNumber(viewItem.totalBudget)} Lakhs Tk</strong>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block">Expense Amount</small>
                    <strong className="fs-6 text-danger">{formatNumber(viewItem.expenseAmount)} Lakhs Tk</strong>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block">Total Project Expenses</small>
                    <strong className="fs-6 text-info">
                      {formatNumber(getProjectSpentTotal(viewItem.projectId))} Lakhs Tk
                    </strong>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block">Date Recorded</small>
                    <strong className="fs-6 text-dark">{viewItem.expenseDate}</strong>
                  </div>
                  <div className="col-12 mt-3">
                    <div className="p-3 bg-light rounded border">
                      <small className="text-muted d-block mb-1 fw-semibold">Purpose of Expense</small>
                      <p className="mb-0 text-dark">{viewItem.purpose}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer bg-light py-2">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setViewItem(null)}>
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

export default FinancialProgress;