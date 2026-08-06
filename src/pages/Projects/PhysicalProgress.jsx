import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Search,
  Printer,
  Trash2,
  Edit2,
  Eye,
  Activity,
  AlertCircle,
  Briefcase,
  RotateCcw,
  Loader,
  Layers,
  Target,
  TrendingUp,
  CheckCircle2,
  PieChart,
  Save,
  X,
} from "lucide-react";

import { getAllProjects } from "../../services/ProjectService";
import {
  getAllPhysicalProgress,
  createPhysicalProgress,
  updatePhysicalProgress,
  deletePhysicalProgress,
  getProjectWorkParameters,
  saveProjectWorkParameters,
  updateProjectWorkParameter,
  deleteProjectWorkParameter,
} from "../../services/PhysicalProgressService";

function PhysicalProgress() {
  const [projects, setProjects] = useState([]);
  const [progressRecords, setProgressRecords] = useState([]);
  const [activeProjectParameters, setActiveProjectParameters] = useState([]);

  const [activeTab, setActiveTab] = useState("LOG_PROGRESS");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  // Stage 1: Target Setup State
  const [targetProjectId, setTargetProjectId] = useState("");
  const [savedParameters, setSavedParameters] = useState([]); // already-persisted parameters for selected project
  const [targetParameters, setTargetParameters] = useState([
    { parameterName: "", weightagePercentage: "" },
  ]); // rows for adding NEW parameters only
  const [targetErrors, setTargetErrors] = useState({});
  const [targetsLoading, setTargetsLoading] = useState(false);

  // Inline edit state for existing (saved) parameters
  const [editingParamId, setEditingParamId] = useState(null);
  const [editRowData, setEditRowData] = useState({
    parameterName: "",
    weightagePercentage: "",
  });
  const [rowActionError, setRowActionError] = useState(null);

  // Stage 2: Logging Form State
  const [formData, setFormData] = useState({
    id: null,
    projectId: "",
    projectName: "",
    progressDate: new Date().toISOString().split("T")[0],
    projectWorkParameterId: "",
    completedPercentage: "",
    remarks: "",
  });
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProjectFilter, setSelectedProjectFilter] = useState("");
  const [viewItem, setViewItem] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [projRes, progRes] = await Promise.all([
        getAllProjects().catch(() => ({ data: [] })),
        getAllPhysicalProgress().catch(() => ({ data: [] })),
      ]);
      setProjects(projRes.data || []);
      setProgressRecords(progRes.data || []);
    } catch (err) {
      console.error("Failed to fetch initial data:", err);
    } finally {
      setLoading(false);
    }
  };

  // ========================================================================
  // STAGE 1: Target Setup Handlers
  // ========================================================================

  const handleTargetProjectSelect = async (e) => {
    const pId = e.target.value;
    setTargetProjectId(pId);
    setTargetErrors({});
    setRowActionError(null);
    setEditingParamId(null);
    setTargetParameters([{ parameterName: "", weightagePercentage: "" }]);

    if (pId) {
      setTargetsLoading(true);
      try {
        const res = await getProjectWorkParameters(pId);
        setSavedParameters(res.data || []);
      } catch (err) {
        setSavedParameters([]);
      } finally {
        setTargetsLoading(false);
      }
    } else {
      setSavedParameters([]);
    }
  };

  const refreshSavedParameters = async (pId) => {
    try {
      const res = await getProjectWorkParameters(pId);
      setSavedParameters(res.data || []);
      return res.data || [];
    } catch (err) {
      return [];
    }
  };

  // ---- Add-new-row handlers (targetParameters) ----

  const handleAddTargetRow = () => {
    setTargetParameters((prev) => [
      ...prev,
      { parameterName: "", weightagePercentage: "" },
    ]);
  };

  const handleRemoveTargetRow = (index) => {
    setTargetParameters((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTargetChange = (index, field, value) => {
    const updated = [...targetParameters];
    updated[index][field] = value;
    setTargetParameters(updated);
  };

  const savedTotalPercentage = useMemo(() => {
    return savedParameters.reduce(
      (sum, p) => sum + Number(p.weightagePercentage || 0),
      0
    );
  }, [savedParameters]);

  const validateTargets = () => {
    const errs = {};
    if (!targetProjectId) errs.targetProjectId = "Select a project.";

    // Only validate rows that the user has actually started filling in.
    const activeRows = targetParameters.filter(
      (p) => p.parameterName.trim() !== "" || p.weightagePercentage !== ""
    );

    const rowErrs = [];
    let newRowsTotal = 0;

    activeRows.forEach((param, idx) => {
      const rErr = {};
      if (!param.parameterName || !param.parameterName.trim()) {
        rErr.parameterName = "Parameter name is required.";
      }
      const val = parseFloat(param.weightagePercentage);
      if (isNaN(val) || val <= 0 || val > 100) {
        rErr.weightagePercentage = "Invalid target %";
      } else {
        newRowsTotal += val;
      }
      if (Object.keys(rErr).length > 0) rowErrs[idx] = rErr;
    });

    if (rowErrs.length > 0) errs.rowErrs = rowErrs;

    // Nothing to add and nothing already saved -> nothing to submit.
    if (activeRows.length === 0 && savedParameters.length === 0) {
      errs.total = "Add at least one parameter.";
    } else if (activeRows.length > 0) {
      const combinedTotal = savedTotalPercentage + newRowsTotal;
      if (Math.abs(combinedTotal - 100) > 0.01) {
        errs.total = `Total target weightage (existing + new) must sum to 100%. Current: ${combinedTotal.toFixed(
          1
        )}%`;
      }
    }

    setTargetErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveTargets = async (e) => {
    e.preventDefault();
    if (!validateTargets()) return;

    const activeRows = targetParameters.filter(
      (p) => p.parameterName.trim() !== "" && p.weightagePercentage !== ""
    );

    // Nothing new to add — no-op.
    if (activeRows.length === 0) {
      setActiveTab("LOG_PROGRESS");
      return;
    }

    const combinedPayload = [
      ...savedParameters.map((p) => ({
        id: p.id,
        parameterName: p.parameterName,
        weightagePercentage: p.weightagePercentage,
      })),
      ...activeRows.map((p) => ({
        parameterName: p.parameterName.trim(),
        weightagePercentage: Number(p.weightagePercentage),
      })),
    ];

    try {
      const res = await saveProjectWorkParameters(targetProjectId, combinedPayload);
      setSavedParameters(res.data || []);
      setTargetParameters([{ parameterName: "", weightagePercentage: "" }]);
      alert("Parameter target configuration saved to database successfully!");

      if (String(formData.projectId) === String(targetProjectId)) {
        setActiveProjectParameters(res.data || []);
      }

      setActiveTab("LOG_PROGRESS");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to save configuration.";
      alert(msg);
    }
  };

  // ---- Existing-parameter inline edit/delete handlers (savedParameters) ----

  const startEditParam = (param) => {
    setEditingParamId(param.id);
    setEditRowData({
      parameterName: param.parameterName,
      weightagePercentage: String(param.weightagePercentage),
    });
    setRowActionError(null);
  };

  const cancelEditParam = () => {
    setEditingParamId(null);
    setEditRowData({ parameterName: "", weightagePercentage: "" });
    setRowActionError(null);
  };

  const saveEditParam = async (paramId) => {
    const val = parseFloat(editRowData.weightagePercentage);

    if (!editRowData.parameterName || !editRowData.parameterName.trim()) {
      setRowActionError("Parameter name is required.");
      return;
    }
    if (isNaN(val) || val <= 0 || val > 100) {
      setRowActionError("Enter a valid weightage between 1 and 100.");
      return;
    }

    try {
      const res = await updateProjectWorkParameter(paramId, {
        parameterName: editRowData.parameterName.trim(),
        weightagePercentage: val,
      });
      setSavedParameters((prev) =>
        prev.map((p) => (p.id === paramId ? res.data : p))
      );

      if (String(formData.projectId) === String(targetProjectId)) {
        setActiveProjectParameters((prev) =>
          prev.map((p) => (p.id === paramId ? res.data : p))
        );
      }

      cancelEditParam();
    } catch (err) {
      setRowActionError(
        err.response?.data?.message || "Failed to update parameter."
      );
    }
  };

  const handleDeleteParam = async (param) => {
    if (
      !window.confirm(
        `Delete parameter "${param.parameterName}"? This cannot be undone.`
      )
    )
      return;

    try {
      await deleteProjectWorkParameter(param.id);
      setSavedParameters((prev) => prev.filter((p) => p.id !== param.id));

      if (String(formData.projectId) === String(targetProjectId)) {
        setActiveProjectParameters((prev) =>
          prev.filter((p) => p.id !== param.id)
        );
        if (String(formData.projectWorkParameterId) === String(param.id)) {
          setFormData((prev) => ({
            ...prev,
            projectWorkParameterId: "",
            completedPercentage: "",
          }));
        }
      }
      setRowActionError(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete parameter.");
    }
  };

  // ========================================================================
  // STAGE 2: Progress Logging Handlers
  // ========================================================================

  const handleProgressProjectSelect = async (e) => {
    const selectedId = e.target.value;
    const project = projects.find((p) => String(p.id) === String(selectedId));

    if (project) {
      setFormData((prev) => ({
        ...prev,
        projectId: String(project.id),
        projectName: project.projectName,
        projectWorkParameterId: "",
        completedPercentage: "",
      }));

      try {
        const res = await getProjectWorkParameters(project.id);
        setActiveProjectParameters(res.data || []);
      } catch (err) {
        setActiveProjectParameters([]);
      }

      if (errors.projectId) setErrors((prev) => ({ ...prev, projectId: null }));
    } else {
      handleCancelReset();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  // Fetch parameter object matching selected ID
  const selectedParameterObj = useMemo(() => {
    if (!formData.projectWorkParameterId || activeProjectParameters.length === 0)
      return null;
    return activeProjectParameters.find(
      (p) => String(p.id) === String(formData.projectWorkParameterId)
    );
  }, [formData.projectWorkParameterId, activeProjectParameters]);

  const currentTargetWeightage = useMemo(() => {
    return selectedParameterObj
      ? Number(selectedParameterObj.weightagePercentage || 0)
      : 0;
  }, [selectedParameterObj]);

  const currentAlreadyCompleted = useMemo(() => {
    return selectedParameterObj
      ? Number(selectedParameterObj.alreadyCompletedPercentage || 0)
      : 0;
  }, [selectedParameterObj]);

  const maxAllowedGain = useMemo(() => {
    return Math.max(0, currentTargetWeightage - currentAlreadyCompleted);
  }, [currentTargetWeightage, currentAlreadyCompleted]);

  const validateProgressForm = () => {
    const newErrors = {};
    if (!formData.projectId) newErrors.projectId = "Please select a project.";
    if (!formData.progressDate) newErrors.progressDate = "Date is required.";
    if (!formData.projectWorkParameterId)
      newErrors.projectWorkParameterId = "Please select a parameter.";

    const pct = parseFloat(formData.completedPercentage);
    if (isNaN(pct) || pct <= 0) {
      newErrors.completedPercentage = "Enter a valid positive percentage.";
    } else if (formData.projectWorkParameterId && pct > maxAllowedGain) {
      newErrors.completedPercentage = `Exceeds limit! Max gain allowed is ${maxAllowedGain.toFixed(
        2
      )}%`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitProgress = async (e) => {
    e.preventDefault();
    if (!validateProgressForm()) return;

    setFormError(null);
    const payload = {
      projectId: Number(formData.projectId),
      projectWorkParameterId: Number(formData.projectWorkParameterId),
      progressDate: formData.progressDate,
      completedPercentage: Number(formData.completedPercentage),
      remarks: formData.remarks ? formData.remarks.trim() : "",
    };

    try {
      if (isEditing) {
        const res = await updatePhysicalProgress(formData.id, payload);
        setProgressRecords((prev) =>
          prev.map((item) => (item.id === formData.id ? res.data : item))
        );
      } else {
        const res = await createPhysicalProgress(payload);
        setProgressRecords((prev) => [res.data, ...prev]);
      }
      handleCancelReset();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to save record.";
      setFormError(msg);
    }
  };

  const handleEdit = async (item) => {
    if (item.projectId) {
      try {
        const res = await getProjectWorkParameters(item.projectId);
        setActiveProjectParameters(res.data || []);
      } catch (err) {
        setActiveProjectParameters([]);
      }
    }

    setFormData({
      id: item.id,
      projectId: String(item.projectId),
      projectName: item.projectName,
      progressDate: item.progressDate,
      projectWorkParameterId: String(item.projectWorkParameterId),
      completedPercentage: String(item.completedPercentage),
      remarks: item.remarks || "",
    });
    setIsEditing(true);
    setActiveTab("LOG_PROGRESS");
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this physical progress record?")) return;
    try {
      await deletePhysicalProgress(id);
      setProgressRecords((prev) => prev.filter((item) => item.id !== id));
      if (formData.id === id) handleCancelReset();
    } catch (err) {
      alert("Failed to delete record.");
    }
  };

  const handleCancelReset = () => {
    setFormData({
      id: null,
      projectId: "",
      projectName: "",
      progressDate: new Date().toISOString().split("T")[0],
      projectWorkParameterId: "",
      completedPercentage: "",
      remarks: "",
    });
    setActiveProjectParameters([]);
    setIsEditing(false);
    setErrors({});
    setFormError(null);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=900,height=650");
    if (!printWindow) return;

    const rowsHtml = filteredRecords
      .map(
        (rec) => `
        <tr>
          <td><strong>${rec.projectName || "—"}</strong></td>
          <td>${rec.progressDate}</td>
          <td>${rec.parameterName}</td>
          <td style="color:#198754; font-weight:bold;">+${rec.completedPercentage}%</td>
          <td>${rec.remarks || "—"}</td>
        </tr>
      `
      )
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Physical Progress Ledger</title>
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
          <h2>Physical Progress Reports</h2>
          <p>Generated on: ${new Date().toLocaleDateString()} | Records: ${filteredRecords.length}</p>
          <table>
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Progress Date</th>
                <th>Parameter Name</th>
                <th>Gain (%)</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml.length > 0 ? rowsHtml : '<tr><td colspan="5" style="text-align:center;">No records available</td></tr>'}
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

  const filteredRecords = useMemo(() => {
    return progressRecords.filter((item) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        (item.projectName || "").toLowerCase().includes(q) ||
        (item.parameterName || "").toLowerCase().includes(q) ||
        (item.remarks || "").toLowerCase().includes(q);
      const matchesProject = selectedProjectFilter
        ? String(item.projectId) === selectedProjectFilter
        : true;
      return matchesSearch && matchesProject;
    });
  }, [progressRecords, searchTerm, selectedProjectFilter]);

  return (
    <div className="container-fluid py-4 bg-light min-vh-100">
      {/* Navigation Tabs */}
      <div className="d-flex gap-2 mb-3 d-print-none">
        <button
          className={`btn ${activeTab === "LOG_PROGRESS" ? "btn-primary" : "btn-outline-primary"} d-inline-flex align-items-center gap-1`}
          onClick={() => setActiveTab("LOG_PROGRESS")}
        >
          <TrendingUp size={16} /> Log Physical Progress
        </button>
        <button
          className={`btn ${activeTab === "SET_TARGETS" ? "btn-primary" : "btn-outline-primary"} d-inline-flex align-items-center gap-1`}
          onClick={() => setActiveTab("SET_TARGETS")}
        >
          <Target size={16} /> Configure Parameter Targets
        </button>
      </div>

      {/* STAGE 1: TARGET CONFIGURATION */}
      {activeTab === "SET_TARGETS" && (
        <div className="card shadow-sm border-0 mb-4 d-print-none">
          <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center border-bottom">
            <h5 className="mb-0 text-primary fw-bold">Define Parameter Targets (Baseline)</h5>
            <Target className="text-primary" size={20} />
          </div>

          <div className="card-body p-4">
            <form onSubmit={handleSaveTargets} noValidate>
              <div className="row g-3">
                <div className="col-md-12">
                  <label className="form-label fw-semibold">
                    Select Project <span className="text-danger">*</span>
                  </label>
                  <select
                    value={targetProjectId}
                    onChange={handleTargetProjectSelect}
                    className={`form-select ${targetErrors.targetProjectId ? "is-invalid" : ""}`}
                  >
                    <option value="">-- Choose Project --</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.projectName}
                      </option>
                    ))}
                  </select>
                  {targetErrors.targetProjectId && (
                    <div className="invalid-feedback">{targetErrors.targetProjectId}</div>
                  )}
                </div>

                {/* EXISTING (SAVED) PARAMETERS — VIEW / EDIT / DELETE */}
                {targetProjectId && (
                  <div className="col-12 mt-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <label className="form-label fw-semibold mb-0 d-flex align-items-center gap-1">
                        <Layers size={16} /> Existing Parameters for this Project
                      </label>
                      <span
                        className={`badge ${
                          Math.abs(savedTotalPercentage - 100) < 0.01
                            ? "bg-success"
                            : "bg-secondary"
                        }`}
                      >
                        Current Total: {savedTotalPercentage.toFixed(1)}%
                      </span>
                    </div>

                    {rowActionError && (
                      <div className="alert alert-danger py-2 px-3 small mb-2">
                        {rowActionError}
                      </div>
                    )}

                    {targetsLoading ? (
                      <div className="text-center py-4 text-muted">
                        <Loader size={20} />
                        <p className="mt-2 small mb-0">Loading parameters...</p>
                      </div>
                    ) : savedParameters.length === 0 ? (
                      <div className="alert alert-light border py-2 px-3 small mb-0 text-muted">
                        No parameters configured yet for this project. Add some below.
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-sm table-bordered align-middle mb-0 bg-white">
                          <thead className="table-light">
                            <tr>
                              <th>Parameter Name</th>
                              <th style={{ width: "140px" }}>Target %</th>
                              <th style={{ width: "160px" }}>Already Completed %</th>
                              <th style={{ width: "130px" }} className="text-end">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {savedParameters.map((param) => {
                              const isRowEditing = editingParamId === param.id;
                              const alreadyDone = Number(
                                param.alreadyCompletedPercentage || 0
                              );
                              return (
                                <tr key={param.id}>
                                  <td>
                                    {isRowEditing ? (
                                      <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        value={editRowData.parameterName}
                                        onChange={(e) =>
                                          setEditRowData((prev) => ({
                                            ...prev,
                                            parameterName: e.target.value,
                                          }))
                                        }
                                      />
                                    ) : (
                                      param.parameterName
                                    )}
                                  </td>
                                  <td>
                                    {isRowEditing ? (
                                      <div className="input-group input-group-sm">
                                        <input
                                          type="number"
                                          step="0.1"
                                          min="1"
                                          max="100"
                                          className="form-control"
                                          value={editRowData.weightagePercentage}
                                          onChange={(e) =>
                                            setEditRowData((prev) => ({
                                              ...prev,
                                              weightagePercentage: e.target.value,
                                            }))
                                          }
                                        />
                                        <span className="input-group-text">%</span>
                                      </div>
                                    ) : (
                                      `${param.weightagePercentage}%`
                                    )}
                                  </td>
                                  <td className="text-muted">{alreadyDone}%</td>
                                  <td className="text-end">
                                    {isRowEditing ? (
                                      <div className="btn-group btn-group-sm">
                                        <button
                                          type="button"
                                          className="btn btn-outline-success"
                                          title="Save"
                                          onClick={() => saveEditParam(param.id)}
                                        >
                                          <Save size={14} />
                                        </button>
                                        <button
                                          type="button"
                                          className="btn btn-outline-secondary"
                                          title="Cancel"
                                          onClick={cancelEditParam}
                                        >
                                          <X size={14} />
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="btn-group btn-group-sm">
                                        <button
                                          type="button"
                                          className="btn btn-outline-primary"
                                          title="Edit Parameter"
                                          onClick={() => startEditParam(param)}
                                        >
                                          <Edit2 size={14} />
                                        </button>
                                        <button
                                          type="button"
                                          className="btn btn-outline-danger"
                                          title={
                                            alreadyDone > 0
                                              ? "Cannot delete — progress already logged"
                                              : "Delete Parameter"
                                          }
                                          disabled={alreadyDone > 0}
                                          onClick={() => handleDeleteParam(param)}
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* ADD NEW PARAMETERS */}
                {targetProjectId && (
                  <div className="col-12 mt-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <label className="form-label fw-semibold mb-0 d-flex align-items-center gap-1">
                        <Plus size={16} /> Add New Parameters
                      </label>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                        onClick={handleAddTargetRow}
                      >
                        <Plus size={14} /> Add Parameter Row
                      </button>
                    </div>

                    {targetErrors.total && (
                      <div className="alert alert-warning py-2 px-3 small mb-3">
                        {targetErrors.total}
                      </div>
                    )}

                    {targetParameters.map((param, index) => {
                      const rowErr = targetErrors.rowErrs?.[index] || {};
                      return (
                        <div
                          key={index}
                          className="row g-2 align-items-start mb-2 p-2 bg-white border rounded"
                        >
                          <div className="col-md-7">
                            <input
                              type="text"
                              placeholder="Parameter Name (e.g., Piling, Deck Slab, Excavation)"
                              value={param.parameterName}
                              onChange={(e) =>
                                handleTargetChange(index, "parameterName", e.target.value)
                              }
                              className={`form-control form-control-sm ${
                                rowErr.parameterName ? "is-invalid" : ""
                              }`}
                            />
                            {rowErr.parameterName && (
                              <div className="invalid-feedback">{rowErr.parameterName}</div>
                            )}
                          </div>

                          <div className="col-md-3">
                            <div className="input-group input-group-sm">
                              <input
                                type="number"
                                min="1"
                                max="100"
                                step="0.1"
                                placeholder="Target %"
                                value={param.weightagePercentage}
                                onChange={(e) =>
                                  handleTargetChange(index, "weightagePercentage", e.target.value)
                                }
                                className={`form-control ${
                                  rowErr.weightagePercentage ? "is-invalid" : ""
                                }`}
                              />
                              <span className="input-group-text">%</span>
                            </div>
                            {rowErr.weightagePercentage && (
                              <div className="text-danger small mt-1">{rowErr.weightagePercentage}</div>
                            )}
                          </div>

                          <div className="col-md-2 text-end">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleRemoveTargetRow(index)}
                              disabled={targetParameters.length === 1}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="col-12 d-flex justify-content-end gap-2 mt-4 pt-2 border-top">
                  <button
                    type="submit"
                    className="btn btn-primary d-inline-flex align-items-center gap-1"
                    disabled={!targetProjectId}
                  >
                    <Plus size={16} /> Save Parameter Configuration
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STAGE 2: LOG PHYSICAL PROGRESS FORM */}
      {activeTab === "LOG_PROGRESS" && (
        <div className="card shadow-sm border-0 mb-4 d-print-none">
          <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center border-bottom">
            <h5 className="mb-0 text-primary fw-bold">
              {isEditing ? "Edit Physical Progress Record" : "Log Dated Physical Progress"}
            </h5>
            <Activity className="text-primary" size={20} />
          </div>

          <div className="card-body p-4">
            {formError && (
              <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 mb-3">
                <AlertCircle size={16} />
                <span className="small">{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitProgress} noValidate>
              <div className="row g-3">
                {/* Select Project */}
                <div className="col-md-8">
                  <label className="form-label fw-semibold">
                    Select Project <span className="text-danger">*</span>
                  </label>
                  <select
                    name="projectId"
                    value={formData.projectId}
                    onChange={handleProgressProjectSelect}
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

                {/* Progress Date */}
                <div className="col-md-4">
                  <label className="form-label fw-semibold">
                    Progress Date <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    name="progressDate"
                    value={formData.progressDate}
                    onChange={handleInputChange}
                    className={`form-control ${errors.progressDate ? "is-invalid" : ""}`}
                  />
                  {errors.progressDate && (
                    <div className="invalid-feedback">{errors.progressDate}</div>
                  )}
                </div>

                {/* Select Parameter */}
                <div className="col-md-3">
                  <label className="form-label fw-semibold">
                    Parameter Name <span className="text-danger">*</span>
                  </label>
                  {formData.projectId ? (
                    activeProjectParameters.length > 0 ? (
                      <select
                        name="projectWorkParameterId"
                        value={formData.projectWorkParameterId}
                        onChange={handleInputChange}
                        className={`form-select ${errors.projectWorkParameterId ? "is-invalid" : ""}`}
                      >
                        <option value="">-- Select Parameter --</option>
                        {activeProjectParameters.map((param) => (
                          <option key={param.id} value={param.id}>
                            {param.parameterName}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="alert alert-warning py-2 px-3 mb-0 small d-flex align-items-center justify-content-between">
                        <span>No parameters configured.</span>
                        <button
                          type="button"
                          className="btn btn-sm btn-warning text-dark fw-bold ms-2"
                          onClick={() => {
                            setTargetProjectId(formData.projectId);
                            setActiveTab("SET_TARGETS");
                          }}
                        >
                          Configure
                        </button>
                      </div>
                    )
                  ) : (
                    <select className="form-select" disabled>
                      <option>-- Select Project First --</option>
                    </select>
                  )}
                  {errors.projectWorkParameterId && (
                    <div className="invalid-feedback d-block">{errors.projectWorkParameterId}</div>
                  )}
                </div>

                {/* Display Target Weightage (%) directly from database */}
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Target Weightage (%)</label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control bg-light text-primary fw-bold"
                      value={formData.projectWorkParameterId ? `${currentTargetWeightage}%` : "—"}
                      readOnly
                    />
                    <span className="input-group-text bg-light border-start-0 text-primary">
                      <PieChart size={14} />
                    </span>
                  </div>
                </div>

                {/* Display Already Completed (%) directly from database */}
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Already Completed (%)</label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control bg-light text-muted fw-bold"
                      value={formData.projectWorkParameterId ? `${currentAlreadyCompleted}%` : "—"}
                      readOnly
                    />
                    <span className="input-group-text bg-light border-start-0 text-muted">
                      <CheckCircle2 size={14} />
                    </span>
                  </div>
                </div>

                {/* New Completed Progress Gain (%) Input */}
                <div className="col-md-3">
                  <label className="form-label fw-semibold">
                    New Progress Gain (%) <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max={maxAllowedGain > 0 ? maxAllowedGain : 0}
                      name="completedPercentage"
                      placeholder={`Max: ${maxAllowedGain.toFixed(1)}%`}
                      value={formData.completedPercentage}
                      onChange={handleInputChange}
                      className={`form-control ${errors.completedPercentage ? "is-invalid" : ""}`}
                      disabled={!formData.projectWorkParameterId || maxAllowedGain <= 0}
                    />
                    <span className="input-group-text">%</span>
                  </div>
                  {errors.completedPercentage && (
                    <div className="text-danger small mt-1">{errors.completedPercentage}</div>
                  )}
                  {formData.projectWorkParameterId && (
                    <small className="text-muted d-block mt-1">
                      Max Gain Allowed: <strong>{maxAllowedGain.toFixed(2)}%</strong>
                    </small>
                  )}
                </div>

                {/* Remarks */}
                <div className="col-12 mt-3">
                  <label className="form-label fw-semibold">Remarks / Description</label>
                  <input
                    type="text"
                    name="remarks"
                    placeholder="e.g. Completed section 2 casting..."
                    value={formData.remarks}
                    onChange={handleInputChange}
                    className="form-control"
                  />
                </div>

                {/* Form Actions */}
                <div className="col-12 d-flex justify-content-end gap-2 mt-4 pt-2 border-top">
                  {isEditing && (
                    <span className="badge bg-primary-subtle text-primary border me-auto p-2 align-self-center">
                      Editing Record ID: #{formData.id}
                    </span>
                  )}
                  <button
                    type="button"
                    className="btn btn-outline-secondary d-inline-flex align-items-center gap-1"
                    onClick={handleCancelReset}
                  >
                    <RotateCcw size={15} /> {isEditing ? "Cancel" : "Reset"}
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary d-inline-flex align-items-center gap-1"
                    disabled={formData.projectWorkParameterId && maxAllowedGain <= 0}
                  >
                    <Plus size={16} />
                    {isEditing ? "Update Progress Log" : "Add Progress Log"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIRECTORY TABLE */}
      <div className="card shadow-sm border-0 d-print-none">
        <div className="card-header bg-white py-3 d-flex flex-wrap justify-content-between align-items-center gap-2 border-bottom">
          <h5 className="mb-0 fw-bold text-dark">
            Physical Progress Ledger{" "}
            <span className="badge bg-secondary ms-1">{filteredRecords.length}</span>
          </h5>

          <div className="d-flex align-items-center gap-2 flex-wrap">
            <select
              className="form-select form-select-sm"
              style={{ width: "200px" }}
              value={selectedProjectFilter}
              onChange={(e) => setSelectedProjectFilter(e.target.value)}
            >
              <option value="">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.projectName}
                </option>
              ))}
            </select>

            <div className="input-group input-group-sm" style={{ width: "220px" }}>
              <span className="input-group-text bg-light border-end-0">
                <Search size={14} />
              </span>
              <input
                type="text"
                className="form-control bg-light border-start-0"
                placeholder="Search parameter..."
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
            ) : filteredRecords.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <AlertCircle size={32} className="mb-2" />
                <p className="mb-0">No physical progress records found.</p>
              </div>
            ) : (
              <table className="table table-hover align-middle mb-0">
                <thead className="table-dark">
                  <tr>
                    <th>Project Name</th>
                    <th>Date</th>
                    <th>Parameter Name</th>
                    <th>Progress Gain (%)</th>
                    <th>Remarks</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong className="text-dark">{item.projectName || "—"}</strong>
                      </td>
                      <td>{item.progressDate}</td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          {item.parameterName}
                        </span>
                      </td>
                      <td>
                        <span className="fw-bold text-success">
                          +{item.completedPercentage}%
                        </span>
                      </td>
                      <td>
                        <small className="text-muted">{item.remarks || "—"}</small>
                      </td>
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
                <h5 className="modal-title fw-bold text-primary">Physical Progress Details</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setViewItem(null)}
                ></button>
              </div>
              <div className="modal-body p-4">
                <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
                  <div className="p-3 bg-primary-subtle text-primary rounded-circle">
                    <Briefcase size={24} />
                  </div>
                  <div>
                    <h5 className="mb-0 fw-bold">{viewItem.projectName || "—"}</h5>
                    <small className="text-muted">Recorded Date: {viewItem.progressDate}</small>
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-6">
                    <small className="text-muted d-block">Parameter Name</small>
                    <strong className="fs-6 text-dark">{viewItem.parameterName}</strong>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block">Progress Gain</small>
                    <strong className="fs-6 text-success">+{viewItem.completedPercentage}%</strong>
                  </div>
                  {viewItem.remarks && (
                    <div className="col-12 mt-2">
                      <div className="p-3 bg-light rounded border">
                        <small className="text-muted d-block mb-1 fw-semibold">Remarks</small>
                        <p className="mb-0 text-dark">{viewItem.remarks}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer bg-light py-2">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setViewItem(null)}
                >
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

export default PhysicalProgress;
