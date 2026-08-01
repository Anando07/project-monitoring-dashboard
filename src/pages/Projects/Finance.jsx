import React, { useState, useEffect, useMemo } from "react";
import "./Finance.css";
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
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Reused Card Component                                             */
/* ------------------------------------------------------------------ */

function Card({ title, action, children, className = "" }) {
  return (
    <div className={`dashboard-card ${className}`}>
      {(title || action) && (
        <div className="dashboard-card-header">
          <h3>{title}</h3>
          {action && <div className="card-action">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Master Options & Target Budgets                                   */
/* ------------------------------------------------------------------ */

// Reference table mapping projects to their maximum allowed target budget (in Cr BDT)
const PROJECT_TARGET_BUDGETS = {
  "Padma Bridge Project": 100.0,
  "Dhaka Mass Transit (MRT) Extension": 120.0,
  "ICT Infrastructure Project": 40.0,
  "Rural Electrification Phase II": 75.0,
  "Coastal Embankment Improvement": 50.0,
  "Digital Land Survey Project": 25.0,
  "Primary Healthcare Modernization": 60.0,
  "Urban Water Supply Upgrade": 30.0,
  "Skills Development Training Center": 15.0,
  "River Dredging Program": 45.0,
  "Agricultural Research Institute Upgrade": 20.0,
  "National Highway Widening Project": 150.0,
};

const DATABASE_PROJECTS = Object.keys(PROJECT_TARGET_BUDGETS);

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

const PAYMENT_STATUSES = ["Disbursed", "Pending", "Processing", "Partial"];
const PAGE_SIZE = 10;

const statusPillClass = (status) =>
  status === "Disbursed"
    ? "status-pill-green"
    : status === "Pending"
    ? "status-pill-red"
    : "status-pill-amber";

const formatDate = (isoDate) => {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const EMPTY_FORM = {
  projectName: DATABASE_PROJECTS[0] || "",
  fiscalYear: "2025-2026",
  disbursementDate: "",
  status: "Disbursed",
  funders: [{ agency: "Govt of Bangladesh (GoB)", amount: "" }],
};

const SEED_FINANCES = [
  {
    id: 1,
    projectName: "Padma Bridge Project",
    fiscalYear: "2024-2025",
    disbursementDate: "2024-06-15",
    status: "Disbursed",
    funders: [{ agency: "Govt of Bangladesh (GoB)", amount: 50.0 }],
    receivedFundTotal: 50.0,
  },
  {
    id: 2,
    projectName: "Dhaka Mass Transit (MRT) Extension",
    fiscalYear: "2025-2026",
    disbursementDate: "2025-01-10",
    status: "Processing",
    funders: [
      { agency: "Govt of Bangladesh (GoB)", amount: 20.0 },
      { agency: "Japan International Cooperation Agency (JICA)", amount: 40.0 },
    ],
    receivedFundTotal: 60.0,
  },
  {
    id: 3,
    projectName: "ICT Infrastructure Project",
    fiscalYear: "2025-2026",
    disbursementDate: "2025-03-20",
    status: "Pending",
    funders: [
      { agency: "Govt of Bangladesh (GoB)", amount: 10.0 },
      { agency: "World Bank (WB)", amount: 15.0 },
    ],
    receivedFundTotal: 25.0,
  },
];

function Finance() {
  const [finances, setFinances] = useState(SEED_FINANCES);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [viewFinance, setViewFinance] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState(null);

  /* Target Budget for Currently Selected Project */
  const selectedProjectMaxBudget = useMemo(() => {
    return PROJECT_TARGET_BUDGETS[form.projectName] || 0;
  }, [form.projectName]);

  /* Total funds already allocated/received for this project across all prior records */
  const alreadyAllocatedForProject = useMemo(() => {
    return finances
      .filter((item) => item.projectName === form.projectName && item.id !== editingId)
      .reduce((sum, item) => {
        const itemSum = item.funders.reduce((fSum, f) => fSum + (Number(f.amount) || 0), 0);
        return sum + itemSum;
      }, 0);
  }, [finances, form.projectName, editingId]);

  /* Next Max Amount Available to receive for this project */
  const nextAvailableAmount = useMemo(() => {
    return Math.max(0, selectedProjectMaxBudget - alreadyAllocatedForProject);
  }, [selectedProjectMaxBudget, alreadyAllocatedForProject]);

  /* Calculate Currently Entered Amount in Form */
  const calculatedFormTotal = useMemo(() => {
    return form.funders.reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
  }, [form.funders]);

  const isExceedingBudget = calculatedFormTotal > nextAvailableAmount + 0.0001;

  /* Form Field Handlers */
  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleFunderChange = (index, field, value) => {
    setForm((prev) => {
      const updatedFunders = [...prev.funders];
      updatedFunders[index] = { ...updatedFunders[index], [field]: value };
      return { ...prev, funders: updatedFunders };
    });
    if (errors.funders) setErrors((prev) => ({ ...prev, funders: null }));
  };

  const addFunderRow = () => {
    const availableAgency =
      FUNDING_AGENCIES_AND_COUNTRIES.find(
        (agency) => !form.funders.some((f) => f.agency === agency)
      ) || FUNDING_AGENCIES_AND_COUNTRIES[0];

    setForm((prev) => ({
      ...prev,
      funders: [...prev.funders, { agency: availableAgency, amount: "" }],
    }));
  };

  const removeFunderRow = (index) => {
    if (form.funders.length === 1) return;
    setForm((prev) => ({
      ...prev,
      funders: prev.funders.filter((_, i) => i !== index),
    }));
  };

  /* Validation */
  const validate = () => {
    const next = {};
    if (!form.projectName) next.projectName = "Please select a project";
    if (!form.fiscalYear.trim()) next.fiscalYear = "Fiscal year is required";
    if (!form.disbursementDate) next.disbursementDate = "Disbursement date is required";

    let funderErr = null;
    form.funders.forEach((f) => {
      if (!f.amount || Number(f.amount) <= 0) {
        funderErr = "Please specify a valid amount for all selected agencies.";
      }
    });

    if (!funderErr && isExceedingBudget) {
      funderErr = `Entered amount (৳ ${calculatedFormTotal.toFixed(
        2
      )} Cr) exceeds remaining allowable limit of ৳ ${nextAvailableAmount.toFixed(2)} Cr.`;
    }

    if (funderErr) next.funders = funderErr;

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const financeData = {
      projectName: form.projectName,
      fiscalYear: form.fiscalYear,
      disbursementDate: form.disbursementDate,
      status: form.status,
      funders: form.funders.map((f) => ({
        agency: f.agency,
        amount: Number(f.amount),
      })),
      receivedFundTotal: calculatedFormTotal,
    };

    if (editingId) {
      setFinances((prev) =>
        prev.map((item) => (item.id === editingId ? { ...item, ...financeData } : item))
      );
    } else {
      setFinances((prev) => [{ id: Date.now(), ...financeData }, ...prev]);
      setCurrentPage(1);
    }

    handleReset();
  };

  const handleReset = () => {
    setForm({
      ...EMPTY_FORM,
      projectName: DATABASE_PROJECTS[0] || "",
    });
    setErrors({});
    setEditingId(null);
  };

  const handleEdit = (record) => {
    setForm({
      projectName: record.projectName,
      fiscalYear: record.fiscalYear,
      disbursementDate: record.disbursementDate,
      status: record.status,
      funders: record.funders.map((f) => ({ agency: f.agency, amount: String(f.amount) })),
    });
    setEditingId(record.id);
    setErrors({});
  };

  const handleDelete = (id) => {
    setFinances((prev) => prev.filter((p) => p.id !== id));
    if (editingId === id) handleReset();
  };

  const handlePrint = () => {
    window.print();
  };

  /* Search & Pagination */
  const filteredFinances = useMemo(
    () =>
      finances.filter(
        (f) =>
          f.projectName.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
          f.funders.some((agency) =>
            agency.agency.toLowerCase().includes(searchTerm.trim().toLowerCase())
          )
      ),
    [finances, searchTerm]
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
    <div className="dashboard-page">
      {/* ---------------- Create / Edit Finance Form ---------------- */}
      <Card
        className="no-print"
        title={editingId ? "Edit Funding Disbursement" : "Record Next Received Fund"}
        action={<Landmark size={18} className="card-action-icon" />}
      >
        <form className="project-form" onSubmit={handleSubmit} noValidate>
          <div className="form-grid form-grid-3">
            <div className="form-group">
              <label htmlFor="projectName">Project Name (From Database)</label>
              <select
                id="projectName"
                value={form.projectName}
                onChange={handleChange("projectName")}
                className={errors.projectName ? "input-error" : ""}
              >
                {DATABASE_PROJECTS.map((proj, idx) => (
                  <option key={idx} value={proj}>
                    {proj}
                  </option>
                ))}
              </select>
              <small style={{ color: "#666", marginTop: "4px", display: "block" }}>
                Target Budget: <strong>৳ {selectedProjectMaxBudget.toFixed(2)} Cr</strong> |
                Prev. Received: <strong>৳ {alreadyAllocatedForProject.toFixed(2)} Cr</strong>
              </small>
              {errors.projectName && <span className="field-error">{errors.projectName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="fiscalYear">Fiscal Year</label>
              <input
                id="fiscalYear"
                type="text"
                placeholder="e.g. 2025-2026"
                value={form.fiscalYear}
                onChange={handleChange("fiscalYear")}
                className={errors.fiscalYear ? "input-error" : ""}
              />
              {errors.fiscalYear && <span className="field-error">{errors.fiscalYear}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="disbursementDate">Disbursement Date</label>
              <input
                id="disbursementDate"
                type="date"
                value={form.disbursementDate}
                onChange={handleChange("disbursementDate")}
                className={errors.disbursementDate ? "input-error" : ""}
              />
              {errors.disbursementDate && (
                <span className="field-error">{errors.disbursementDate}</span>
              )}
            </div>
          </div>

          <div className="funding-section">
            <div className="funding-section-header">
              <label className="funding-label">
                <DollarSign size={16} /> Received Amount Breakdown by Agency / Country (Cr BDT)
              </label>
              <button
                type="button"
                className="button-secondary add-funder-btn"
                onClick={addFunderRow}
              >
                <Plus size={14} /> Add Funder / Country
              </button>
            </div>

            {errors.funders && (
              <span className="field-error" style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "8px" }}>
                <AlertCircle size={14} /> {errors.funders}
              </span>
            )}

            <div className="funder-rows-list">
              {form.funders.map((funder, idx) => (
                <div key={idx} className="funder-row">
                  <div className="form-group flex-2">
                    <label>Funding Agency / Country</label>
                    <select
                      value={funder.agency}
                      onChange={(e) => handleFunderChange(idx, "agency", e.target.value)}
                    >
                      {FUNDING_AGENCIES_AND_COUNTRIES.map((agency, aIdx) => (
                        <option key={aIdx} value={agency}>
                          {agency}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group flex-1">
                    <label>Received Amount (Cr BDT)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={funder.amount}
                      onChange={(e) => handleFunderChange(idx, "amount", e.target.value)}
                      className={isExceedingBudget ? "input-error" : ""}
                    />
                  </div>

                  {form.funders.length > 1 && (
                    <button
                      type="button"
                      className="remove-funder-btn"
                      onClick={() => removeFunderRow(idx)}
                      title="Remove Funder"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div
              className="calculated-total-bar"
              style={{
                borderColor: isExceedingBudget ? "#ef4444" : undefined,
                backgroundColor: isExceedingBudget ? "#fef2f2" : undefined,
              }}
            >
              <span>Current Tranche Total / Max Receivable Cap:</span>
              <strong style={{ color: isExceedingBudget ? "#dc2626" : "#16a34a" }}>
                ৳ {calculatedFormTotal.toFixed(2)} Cr / ৳ {nextAvailableAmount.toFixed(2)} Cr
              </strong>
            </div>
          </div>

          <div className="form-grid form-grid-1" style={{ marginTop: "1rem" }}>
            <div className="form-group">
              <label htmlFor="status">Disbursement Status</label>
              <select id="status" value={form.status} onChange={handleChange("status")}>
                {PAYMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-actions">
            {editingId && (
              <span className="editing-badge">Editing: {form.projectName}</span>
            )}
            <button type="button" className="button-secondary" onClick={handleReset}>
              {editingId ? "Cancel" : "Reset"}
            </button>
            <button type="submit" className="button-primary" disabled={isExceedingBudget}>
              {editingId ? <Pencil size={16} /> : <Plus size={16} />}
              {editingId ? "Save Changes" : "Record Fund"}
            </button>
          </div>
        </form>
      </Card>

      {/* ---------------- Finance List Table ---------------- */}
      <Card
        className="no-print"
        title={`Financial Records (${filteredFinances.length})`}
        action={
          <div className="header-actions">
            <div className="search-box">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search project or donor..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <button type="button" className="button-secondary print-btn" onClick={handlePrint}>
              <Printer size={16} />
              Print
            </button>
          </div>
        }
      >
        {filteredFinances.length === 0 ? (
          <div className="empty-state">
            <Landmark size={28} />
            <p>
              {finances.length === 0
                ? "No financial records found. Add one above."
                : "No records match your search."}
            </p>
          </div>
        ) : (
          <>
            <div className="table-overflow">
              <table className="projects-table">
                <thead>
                  <tr>
                    <th>Project Name</th>
                    <th>Total Budget</th>
                    <th>Fiscal Year</th>
                    <th>Disbursement Date</th>
                    <th>Funding Sources & Amounts</th>
                    <th>Received Fund Total</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pageFinances.map((item) => {
                    const totalBudget = PROJECT_TARGET_BUDGETS[item.projectName] || 0;
                    return (
                      <tr key={item.id}>
                        <td className="project-info-cell">
                          <div className="project-name">{item.projectName}</div>
                        </td>
                        <td>
                          <strong>৳ {totalBudget.toFixed(2)} Cr</strong>
                        </td>
                        <td>{item.fiscalYear}</td>
                        <td>{formatDate(item.disbursementDate)}</td>
                        <td>
                          <div className="funder-pills-container">
                            {item.funders.map((f, i) => (
                              <span key={i} className="funder-pill">
                                {f.agency}: <strong>৳{Number(f.amount).toFixed(2)} Cr</strong>
                              </span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <strong style={{ color: "#0d9488" }}>
                            ৳ {item.receivedFundTotal.toFixed(2)} Cr
                          </strong>
                        </td>
                        <td>
                          <span className={`status-pill ${statusPillClass(item.status)}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="table-action-cell">
                          <button
                            className="action-button"
                            onClick={() => setViewFinance(item)}
                            title="View Breakdown"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="action-button action-button-edit"
                            onClick={() => handleEdit(item)}
                            title="Edit Record"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            className="action-button action-button-danger"
                            onClick={() => handleDelete(item.id)}
                            title="Delete Record"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  type="button"
                  className="pagination-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="pagination-info">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  className="pagination-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </Card>

      {/* ---------------- Print Table Format ---------------- */}
      <div className="print-table-wrapper">
        <h2 className="print-title">Project Financial Report</h2>
        <p className="print-subtitle">
          Generated {formatDate(new Date())} · {filteredFinances.length} record(s)
        </p>
        <table className="projects-table print-table">
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Total Budget</th>
              <th>Fiscal Year</th>
              <th>Disbursement Date</th>
              <th>Funders & Allocation</th>
              <th>Received Fund Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredFinances.map((item) => {
              const totalBudget = PROJECT_TARGET_BUDGETS[item.projectName] || 0;
              return (
                <tr key={item.id}>
                  <td>{item.projectName}</td>
                  <td>৳ {totalBudget.toFixed(2)} Cr</td>
                  <td>{item.fiscalYear}</td>
                  <td>{formatDate(item.disbursementDate)}</td>
                  <td>
                    {item.funders
                      .map((f) => `${f.agency} (৳${Number(f.amount).toFixed(2)} Cr)`)
                      .join(", ")}
                  </td>
                  <td>৳ {item.receivedFundTotal.toFixed(2)} Cr</td>
                  <td>{item.status}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ---------------- Detail View Modal ---------------- */}
      {viewFinance && (
        <div className="modal-overlay no-print" onClick={() => setViewFinance(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{viewFinance.projectName}</h2>
              <button className="modal-close" onClick={() => setViewFinance(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-section">
                <h3>Tranche Funding Breakdown</h3>
                <table className="projects-table modal-breakdown-table">
                  <thead>
                    <tr>
                      <th>Agency / Country</th>
                      <th>Received Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewFinance.funders.map((f, i) => (
                      <tr key={i}>
                        <td>{f.agency}</td>
                        <td>৳ {Number(f.amount).toFixed(2)} Cr</td>
                      </tr>
                    ))}
                    <tr className="modal-total-row">
                      <td><strong>Tranche Received Total</strong></td>
                      <td><strong>৳ {viewFinance.receivedFundTotal.toFixed(2)} Cr</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="modal-section">
                <h3>Disbursement Information</h3>
                <div className="modal-grid">
                  <div className="modal-item">
                    <label>Total Target Budget</label>
                    <p>
                      <strong>
                        ৳ {(PROJECT_TARGET_BUDGETS[viewFinance.projectName] || 0).toFixed(2)} Cr
                      </strong>
                    </p>
                  </div>
                  <div className="modal-item">
                    <label>Fiscal Year</label>
                    <p>{viewFinance.fiscalYear}</p>
                  </div>
                  <div className="modal-item">
                    <label>Disbursement Date</label>
                    <p>{formatDate(viewFinance.disbursementDate)}</p>
                  </div>
                  <div className="modal-item">
                    <label>Status</label>
                    <p>
                      <span className={`status-pill ${statusPillClass(viewFinance.status)}`}>
                        {viewFinance.status}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="button-secondary" onClick={() => setViewFinance(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Finance;