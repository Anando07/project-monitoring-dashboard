import React, { useState, useMemo } from "react";
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
  X,
  DollarSign,
  Briefcase,
  Calendar
} from "lucide-react";

// Predefined Projects List with allocated total budgets
const EXISTING_PROJECTS = [
  { id: "p1", name: "Highway Expansion Phase 2", category: "Infrastructure", totalBudget: 500000 },
  { id: "p2", name: "Metro Rail Line Extension", category: "Transport", totalBudget: 1200000 },
  { id: "p3", name: "Smart City Grid Automation", category: "Technology", totalBudget: 750000 },
  { id: "p4", name: "Central Water Treatment Plant", category: "Public Works", totalBudget: 450000 }
];

const INITIAL_FORM_STATE = {
  id: null,
  projectId: "",
  projectName: "",
  totalBudget: 0,
  expenseAmount: "",
  purpose: "",
  expenseDate: new Date().toISOString().split("T")[0]
};

const INITIAL_EXPENSES = [
  {
    id: 1,
    projectId: "p1",
    projectName: "Highway Expansion Phase 2",
    totalBudget: 500000,
    expenseAmount: 45000,
    purpose: "Heavy Machinery Fuel & Maintenance",
    expenseDate: "2026-07-15"
  },
  {
    id: 2,
    projectId: "p2",
    projectName: "Metro Rail Line Extension",
    totalBudget: 1200000,
    expenseAmount: 120000,
    purpose: "Steel Beam Procurement",
    expenseDate: "2026-07-20"
  }
];
function FinancialProgress() {
  const [expenses, setExpenses] = useState(INITIAL_EXPENSES);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  // Search & Modal States
  const [searchTerm, setSearchTerm] = useState("");
  const [viewItem, setViewItem] = useState(null);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  // Calculate current total spent for a specific project
  const getProjectSpentTotal = (projectId, excludeExpenseId = null) => {
    return expenses
      .filter((exp) => exp.projectId === projectId && exp.id !== excludeExpenseId)
      .reduce((acc, curr) => acc + Number(curr.expenseAmount || 0), 0);
  };

  // Handle Project Selection & Auto-fill Total Budget
  const handleProjectSelect = (e) => {
    const selectedId = e.target.value;
    const project = EXISTING_PROJECTS.find((p) => p.id === selectedId);

    if (project) {
      setFormData((prev) => ({
        ...prev,
        projectId: project.id,
        projectName: project.name,
        totalBudget: project.totalBudget
      }));
      if (errors.projectId) setErrors((prev) => ({ ...prev, projectId: null }));
    } else {
      setFormData((prev) => ({
        ...prev,
        projectId: "",
        projectName: "",
        totalBudget: 0
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  // Form Validation including Budget Overflow Check
  const validateForm = () => {
    const newErrors = {};
    if (!formData.projectId) newErrors.projectId = "Please select a project.";
    
    const amount = parseFloat(formData.expenseAmount);
    if (!formData.expenseAmount || amount <= 0) {
      newErrors.expenseAmount = "Enter a valid expense amount.";
    } else if (formData.projectId) {
      // Validate that total expenses do not exceed Total Allocated Budget
      const currentSpent = getProjectSpentTotal(formData.projectId, formData.id);
      const remainingBudget = formData.totalBudget - currentSpent;

      if (amount > remainingBudget) {
        newErrors.expenseAmount = `Expense exceeds available budget! Remaining: ${formatCurrency(remainingBudget)}`;
      }
    }

    if (!formData.purpose.trim()) {
      newErrors.purpose = "Purpose of expense is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (isEditing) {
      setExpenses((prev) =>
        prev.map((item) =>
          item.id === formData.id
            ? {
                ...formData,
                expenseAmount: parseFloat(formData.expenseAmount),
                totalBudget: parseFloat(formData.totalBudget)
              }
            : item
        )
      );
      setIsEditing(false);
    } else {
      const newExpense = {
        ...formData,
        id: Date.now(),
        expenseAmount: parseFloat(formData.expenseAmount),
        totalBudget: parseFloat(formData.totalBudget)
      };
      setExpenses((prev) => [newExpense, ...prev]);
    }

    setFormData(INITIAL_FORM_STATE);
  };

  const handleEdit = (item) => {
    setFormData({ ...item });
    setIsEditing(true);
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this expense record?")) {
      setExpenses((prev) => prev.filter((item) => item.id !== id));
      if (formData.id === id) {
        setFormData(INITIAL_FORM_STATE);
        setIsEditing(false);
      }
    }
  };

  const handleCancelEdit = () => {
    setFormData(INITIAL_FORM_STATE);
    setIsEditing(false);
    setErrors({});
  };

  // Filtered List based on search
  const filteredExpenses = useMemo(() => {
    return expenses.filter((item) => {
      return (
        item.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.purpose.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [expenses, searchTerm]);

  return (
    <div className="dashboard-page">
      {/* Main Expense Entry Form */}
      <div className="dashboard-card no-print">
        <div className="dashboard-card-header">
          <h3>{isEditing ? "Edit Project Expense" : "Record Project Expense"}</h3>
          <PieChart className="card-action-icon" size={20} />
        </div>

        <form onSubmit={handleSubmit} className="project-form">
          <div className="form-grid form-grid-3">
            {/* Project Dropdown */}
            <div className="form-group">
              <label>
                Select Project <span className="req-star">*</span>
              </label>
              <select
                name="projectId"
                value={formData.projectId}
                onChange={handleProjectSelect}
                className={errors.projectId ? "input-error" : ""}
              >
                <option value="">-- Choose Project --</option>
                {EXISTING_PROJECTS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              {errors.projectId && <span className="field-error">{errors.projectId}</span>}
            </div>

            {/* Total Budget (Read-Only) */}
            <div className="form-group">
              <label>Total Allocated Budget ($)</label>
              <input
                type="text"
                value={formData.totalBudget ? formatCurrency(formData.totalBudget) : "Select a project"}
                readOnly
                style={{ backgroundColor: "var(--bg-primary)", cursor: "not-allowed" }}
              />
            </div>

            {/* Expense Amount */}
            <div className="form-group">
              <label>
                Expense Amount ($) <span className="req-star">*</span>
              </label>
              <input
                type="number"
                name="expenseAmount"
                placeholder="0.00"
                value={formData.expenseAmount}
                onChange={handleInputChange}
                className={errors.expenseAmount ? "input-error" : ""}
              />
              {errors.expenseAmount && <span className="field-error">{errors.expenseAmount}</span>}
            </div>
          </div>

          {/* Purpose of Expense */}
          <div className="form-group">
            <label>
              Purpose of Expense <span className="req-star">*</span>
            </label>
            <input
              type="text"
              name="purpose"
              placeholder="e.g. Fuel for machinery, Office supplies, Vendor payment..."
              value={formData.purpose}
              onChange={handleInputChange}
              className={errors.purpose ? "input-error" : ""}
            />
            {errors.purpose && <span className="field-error">{errors.purpose}</span>}
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            {isEditing && <span className="editing-badge">Editing Record #{formData.id}</span>}
            {isEditing && (
              <button type="button" onClick={handleCancelEdit} className="button-secondary">
                Cancel
              </button>
            )}
            <button type="submit" className="button-primary">
              <Plus size={16} /> {isEditing ? "Update Expense" : "Add Expense Record"}
            </button>
          </div>
        </form>
      </div>

      {/* Expense List Table Bellow */}
      <div className="dashboard-card no-print">
        <div className="dashboard-card-header">
          <h3>Expense Transactions Ledger</h3>
          <div className="header-actions">
            <div className="search-box">
              <Search size={14} className="search-icon" />
              <input
                type="text"
                placeholder="Search purpose or project..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button onClick={() => window.print()} className="button-secondary print-btn" title="Print Ledger">
              <Printer size={14} /> Print
            </button>
          </div>
        </div>

        <div className="table-overflow">
          <table className="projects-table">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Total Budget</th>
                <th>Expense Amount</th>
                <th>Purpose of Expense</th>
                <th>Date</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span className="project-name-tag">{item.projectName}</span>
                    </td>
                    <td style={{ fontWeight: 500, color: "var(--text-muted)" }}>
                      {formatCurrency(item.totalBudget)}
                    </td>
                    <td style={{ fontWeight: 600, color: "var(--danger-color)" }}>
                      {formatCurrency(item.expenseAmount)}
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                        <FileText size={14} className="sub-text" />
                        <span>{item.purpose}</span>
                      </div>
                    </td>
                    <td className="sub-text">{item.expenseDate}</td>
                    <td>
                      <div className="table-action-cell" style={{ justifyContent: "flex-end" }}>
                        <button
                          onClick={() => setViewItem(item)}
                          className="action-button"
                          title="View Details"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => handleEdit(item)}
                          className="action-button action-button-edit"
                          title="Edit Record"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="action-button action-button-danger"
                          title="Delete Expense"
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
                      <p>No expense records found matching your search.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Detail Modal */}
      {viewItem && (
        <div className="modal-overlay" onClick={() => setViewItem(null)}>
          <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Expense Record Details</h2>
              <button className="modal-close" onClick={() => setViewItem(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-profile-header">
                <div className="profile-avatar">
                  <Briefcase size={28} />
                </div>
                <div>
                  <h3>{viewItem.projectName}</h3>
                  <span className="sub-text">Record ID: #{viewItem.id}</span>
                </div>
              </div>

              <div className="modal-grid">
                <div className="modal-item">
                  <label><DollarSign size={12} /> Total Allocated Budget</label>
                  <p>{formatCurrency(viewItem.totalBudget)}</p>
                </div>

                <div className="modal-item">
                  <label><DollarSign size={12} /> Expense Amount</label>
                  <p style={{ color: "var(--danger-color)" }}>{formatCurrency(viewItem.expenseAmount)}</p>
                </div>

                <div className="modal-item">
                  <label><Calendar size={12} /> Date Recorded</label>
                  <p>{viewItem.expenseDate}</p>
                </div>

                <div className="modal-item">
                  <label><DollarSign size={12} /> Total Project Expenses</label>
                  <p>{formatCurrency(getProjectSpentTotal(viewItem.projectId))}</p>
                </div>
              </div>

              <div className="project-history-card">
                <div className="proj-card-header">
                  <h5>Purpose of Expense</h5>
                </div>
                <div className="proj-card-details">
                  <p style={{ margin: 0, fontSize: "0.9375rem", color: "var(--text-main)" }}>
                    {viewItem.purpose}
                  </p>
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

      {/* Print View Layout */}
      <div className="print-table-wrapper">
        <h1 className="print-title">Project Expense Ledger</h1>
        <p className="print-subtitle">Date Generated: {new Date().toLocaleDateString()}</p>
        <table className="print-table" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Total Budget</th>
              <th>Expense Amount</th>
              <th>Purpose</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((item) => (
              <tr key={item.id}>
                <td>{item.projectName}</td>
                <td>{formatCurrency(item.totalBudget)}</td>
                <td>{formatCurrency(item.expenseAmount)}</td>
                <td>{item.purpose}</td>
                <td>{item.expenseDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default FinancialProgress;