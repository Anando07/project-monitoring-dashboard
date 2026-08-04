import React, { useState } from "react";
import "./Dashboard.css";

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  ClipboardList,
  PlayCircle,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronRight,
  MapPin,
  Eye,
  X,
} from "lucide-react";

const STAT_CARDS = [
  {
    label: "Total Projects",
    value: 125,
    icon: ClipboardList,
    iconBg: "#2563eb",
    iconColor: "#ffffff",
    footer: "View all projects",
    footerColor: "#64748b",
  },
  {
    label: "Running Projects",
    value: 82,
    icon: PlayCircle,
    iconBg: "#16a34a",
    iconColor: "#ffffff",
    footer: "65.60% of total",
    footerColor: "#16a34a",
  },
  {
    label: "Completed Projects",
    value: 31,
    icon: CheckCircle2,
    iconBg: "#7c3aed",
    iconColor: "#ffffff",
    footer: "24.80% of total",
    footerColor: "#7c3aed",
  },
  {
    label: "Delayed Projects",
    value: 12,
    icon: Clock,
    iconBg: "#f59e0b",
    iconColor: "#ffffff",
    footer: "9.60% of total",
    footerColor: "#f59e0b",
  },
  {
    label: "Cancelled Projects",
    value: 5,
    icon: XCircle,
    iconBg: "#ef4444",
    iconColor: "#ffffff",
    footer: "View all projects",
    footerColor: "#64748b",
  },
];

const STATUS_DATA = [
  { name: "Running", value: 82, color: "#22C55E" },
  { name: "Completed", value: 31, color: "#7C3AED" },
  { name: "Delayed", value: 12, color: "#F59E0B" },
  { name: "Cancelled", value: 5, color: "#EF4444" },
];

const FINANCIALS = [
  {
    label: "Total Budget",
    value: "৳ 500.00 Cr",
    iconBg: "#eff6ff",
    iconColor: "#1d4ed8",
  },
  {
    label: "Total Expenditure",
    value: "৳ 380.45 Cr",
    iconBg: "#ecfdf5",
    iconColor: "#16a34a",
  },
  {
    label: "Remaining Budget",
    value: "৳ 119.55 Cr",
    iconBg: "#fffbeb",
    iconColor: "#d97706",
  },
];

const FIN_PROGRESS = [
  { name: "Road", Budget: 150, Expenditure: 110, Remaining: 40 },
  { name: "Education", Budget: 120, Expenditure: 95, Remaining: 45 },
  { name: "Health", Budget: 140, Expenditure: 105, Remaining: 50 },
  { name: "ICT", Budget: 100, Expenditure: 75, Remaining: 40 },
  { name: "Others", Budget: 105, Expenditure: 60, Remaining: 45 },
];

const PHYSICAL_PROGRESS = [
  { name: "Dhaka Metro Rail Project", pct: 75, fillColor: "#16a34a" },
  { name: "Padma Bridge Project", pct: 90, fillColor: "#16a34a" },
  { name: "ICT Infrastructure Project", pct: 60, fillColor: "#f59e0b" },
  { name: "District Hospital Construction", pct: 45, fillColor: "#f59e0b" },
  { name: "Rural Road Development", pct: 30, fillColor: "#ef4444" },
];

const MAP_PINS = [
  { name: "Rangpur", top: "18%", left: "38%", status: "running" },
  { name: "Sylhet", top: "30%", left: "78%", status: "completed" },
  { name: "Rajshahi", top: "38%", left: "22%", status: "running" },
  { name: "Dhaka", top: "48%", left: "55%", status: "running" },
  { name: "Khulna", top: "68%", left: "28%", status: "delayed" },
  { name: "Chattogram", top: "78%", left: "68%", status: "delayed" },
];

const PIN_COLOR = {
  completed: "#22c55e",
  running: "#f59e0b",
  delayed: "#ef4444",
};

const PROJECTS = [
  {
    name: "Padma Bridge Project",
    pd: "Md. Rahman",
    startDate: "01 Jan 2023",
    endDate: "30 Jun 2026",
    fundGovt: "৳ 55.00 Cr",
    fundADB: "৳ 25.00 Cr",
    fundWB: "৳ 20.00 Cr",
    duration: "3.5 yr",
    statusPct: 90,
    priority: "High",
  },
  {
    name: "Dhaka Metro Rail Project",
    pd: "Anika Sultana",
    startDate: "15 Mar 2022",
    endDate: "10 Dec 2025",
    fundGovt: "৳ 120.00 Cr",
    fundADB: "৳ 30.00 Cr",
    fundWB: "৳ 40.00 Cr",
    duration: "3.8 yr",
    statusPct: 75,
    priority: "High",
  },
  {
    name: "National Highway Project",
    pd: "Fahim Khan",
    startDate: "05 Jul 2021",
    endDate: "12 Sep 2025",
    fundGovt: "৳ 60.00 Cr",
    fundADB: "৳ 15.00 Cr",
    fundWB: "৳ 10.00 Cr",
    duration: "4.2 yr",
    statusPct: 50,
    priority: "Medium",
  },
  {
    name: "District Hospital Construction",
    pd: "Rita Akter",
    startDate: "20 Feb 2023",
    endDate: "18 Nov 2025",
    fundGovt: "৳ 28.00 Cr",
    fundADB: "৳ 8.00 Cr",
    fundWB: "৳ 4.00 Cr",
    duration: "2.8 yr",
    statusPct: 45,
    priority: "Medium",
  },
  {
    name: "ICT Infrastructure Project",
    pd: "Shamim Ahmed",
    startDate: "10 Sep 2022",
    endDate: "25 May 2026",
    fundGovt: "৳ 18.00 Cr",
    fundADB: "৳ 10.00 Cr",
    fundWB: "৳ 7.00 Cr",
    duration: "3.7 yr",
    statusPct: 60,
    priority: "Medium",
  },
  {
    name: "Rural Road Development",
    pd: "Nusrat Jahan",
    startDate: "01 Nov 2022",
    endDate: "05 Apr 2026",
    fundGovt: "৳ 24.00 Cr",
    fundADB: "৳ 6.00 Cr",
    fundWB: "৳ 3.50 Cr",
    duration: "3.4 yr",
    statusPct: 65,
    priority: "High",
  },
];

const RECENT_ACTIVITIES = [
  {
    text: "Padma Bridge Project – Progress updated",
    time: "10:30 AM",
    icon: CheckCircle2,
    iconColor: "#16a34a",
    bgColor: "#ecfdf5",
  },
  {
    text: "ICT Infrastructure Project – New document added",
    time: "09:45 AM",
    icon: ClipboardList,
    iconColor: "#1d4ed8",
    bgColor: "#eff6ff",
  },
  {
    text: "District Hospital – Budget approved",
    time: "09:20 AM",
    icon: Clock,
    iconColor: "#d97706",
    bgColor: "#fffbeb",
  },
  {
    text: "Rural Road Development – Delay reported",
    time: "08:50 AM",
    icon: XCircle,
    iconColor: "#dc2626",
    bgColor: "#fee2e2",
  },
];

const MILESTONES = [
  { day: "25", month: "MAY", text: "Dhaka Metro Rail – Trial Operation", date: "25 May 2024" },
  { day: "10", month: "JUN", text: "National Highway – Phase 1 Completion", date: "10 Jun 2024" },
  { day: "30", month: "JUN", text: "ICT Infrastructure – Final Delivery", date: "30 Jun 2024" },
];

const RISK_DATA = [
  { name: "High", value: 8, color: "#ef4444" },
  { name: "Medium", value: 10, color: "#f59e0b" },
  { name: "Low", value: 7, color: "#22c55e" },
];

const getFundType = (project) => {
  const hasGov = Boolean(project.fundGovt);
  const hasADB = Boolean(project.fundADB);
  const hasWB = Boolean(project.fundWB);
  if (hasGov && hasWB && !hasADB) return "GOV+WB";
  if (!hasGov && hasADB) return "ADB";
  if (hasGov && hasADB && hasWB) return "GOV+ADB+WB";
  if (hasGov) return "GOV";
  return "N/A";
};

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

function ViewAllButton({ label = "View All" }) {
  return <button className="button-secondary button-xs">{label}</button>;
}

function Dashboard() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const statusTotal = STATUS_DATA.reduce((sum, item) => sum + item.value, 0);
  const riskTotal = RISK_DATA.reduce((sum, item) => sum + item.value, 0);

  const handleViewDetails = (project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedProject(null), 300);
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-toolbar">
        <button className="toolbar-button toolbar-button-secondary">
          <span>01 Jan 2024 – 31 Dec 2024</span>
          <ChevronRight size={14} />
        </button>
        <button className="toolbar-button toolbar-button-primary">Filter</button>
      </div>

      <div className="stats-grid">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="stat-card">
              <div className="stat-card-top">
                <div className="stat-card-icon" style={{ backgroundColor: card.iconBg, color: card.iconColor }}>
                  <Icon size={18} />
                </div>
                <p className="stat-card-label">{card.label}</p>
              </div>
              <div className="stat-card-value">{card.value}</div>
              <div className="stat-card-footer">
                <span style={{ color: card.footerColor }}>{card.footer}</span>
                <ChevronRight size={12} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="dashboard-grid dashboard-grid-3">
        <Card title="Projects by Status" action={<ViewAllButton label="View Report" />}>
          <div className="status-chart-body">
            <div className="status-chart-card">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={STATUS_DATA} innerRadius={44} outerRadius={74} dataKey="value" stroke="none">
                    {STATUS_DATA.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="status-legend">
              {STATUS_DATA.map((status) => {
                const pct = ((status.value / statusTotal) * 100).toFixed(1);
                return (
                  <div key={status.name} className="status-legend-item">
                    <div className="status-legend-left">
                      <span className="status-dot" style={{ backgroundColor: status.color }} />
                      <span>{status.name}</span>
                    </div>
                    <span className="status-legend-value">{status.value} ({pct}%)</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        <Card title="Financial Overview (Tk.)">
          <div className="finance-grid">
            {FINANCIALS.map((item) => (
              <div key={item.label} className="finance-item">
                <div className="finance-icon" style={{ backgroundColor: item.iconBg, color: item.iconColor }}>
                  ৳
                </div>
                <div>
                  <p className="finance-label">{item.label}</p>
                  <p className="finance-value">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Financial Progress" action={<ViewAllButton label="View Report" />}>
          <div className="chart-wrapper chart-height-medium">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={FIN_PROGRESS} barGap={8}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                <Bar dataKey="Budget" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Expenditure" fill="#22C55E" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Remaining" fill="#F59E0B" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="dashboard-grid dashboard-grid-2">
        <Card title="Physical Progress" action={<ViewAllButton />}>
          <div className="progress-list">
            {PHYSICAL_PROGRESS.map((item) => (
              <div key={item.name} className="progress-row">
                <div className="progress-row-label">
                  <span>{item.name}</span>
                  <span>{item.pct}%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${item.pct}%`, backgroundColor: item.fillColor }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Projects on Map">
          <div className="map-panel">
            {MAP_PINS.map((pin) => (
              <div key={pin.name} className="map-pin" style={{ top: pin.top, left: pin.left }}>
                <MapPin size={20} style={{ color: PIN_COLOR[pin.status] }} />
                <span className="map-pin-label">{pin.name}</span>
              </div>
            ))}
          </div>
          <div className="map-legend">
            <div className="legend-pill">
              <span className="legend-dot legend-dot-completed" /> Completed
            </div>
            <div className="legend-pill">
              <span className="legend-dot legend-dot-running" /> Running
            </div>
            <div className="legend-pill">
              <span className="legend-dot legend-dot-delayed" /> Delayed
            </div>
          </div>
        </Card>
      </div>

      <div className="dashboard-grid dashboard-grid-3">
        <Card title="Recent Activities" action={<ViewAllButton />}>
          <ul className="activity-list">
            {RECENT_ACTIVITIES.map((activity) => {
              const Icon = activity.icon;
              return (
                <li key={activity.text} className="activity-item">
                  <span className="activity-icon" style={{ backgroundColor: activity.bgColor, color: activity.iconColor }}>
                    <Icon size={16} />
                  </span>
                  <div className="activity-copy">
                    <p>{activity.text}</p>
                  </div>
                  <span className="activity-time">{activity.time}</span>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card title="Upcoming Milestones" action={<ViewAllButton />}>
          <ul className="milestones-list">
            {MILESTONES.map((milestone) => (
              <li key={milestone.text} className="milestone-item">
                <div className="milestone-pill">
                  <span className="milestone-day">{milestone.day}</span>
                  <span className="milestone-month">{milestone.month}</span>
                </div>
                <div>
                  <p>{milestone.text}</p>
                  <p className="milestone-date">{milestone.date}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Risk Summary" action={<ViewAllButton />}>
          <div className="risk-summary-body">
            <div className="risk-chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={RISK_DATA} innerRadius={40} outerRadius={60} dataKey="value" stroke="none">
                    {RISK_DATA.map((risk) => (
                      <Cell key={risk.name} fill={risk.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="risk-chart-center">
                <span>{riskTotal}</span>
                <span>Total Risks</span>
              </div>
            </div>
            <div className="risk-list">
              {RISK_DATA.map((risk) => {
                const pct = Math.round((risk.value / riskTotal) * 100);
                return (
                  <div key={risk.name} className="risk-item">
                    <div className="risk-label">
                      <span className="risk-dot" style={{ backgroundColor: risk.color }} />
                      <span>{risk.name}</span>
                    </div>
                    <span>{risk.value} ({pct}%)</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>

      <div className="dashboard-grid">
        <Card title="Project Table" action={<ViewAllButton label="View All" />}>
          <div className="table-overflow">
            <table className="projects-table">
              <thead>
                <tr>
                  <th>Project / PD</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Duration</th>
                  <th>Fund</th>
                  <th>Status (%)</th>
                  <th>Priority</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {PROJECTS.map((project) => {
                  const fundType = getFundType(project);
                  return (
                    <tr key={project.name}>
                      <td className="project-info-cell">
                        <div className="project-name">{project.name}</div>
                        <div className="project-pd">PD: {project.pd}</div>
                      </td>
                      <td>{project.startDate}</td>
                      <td>{project.endDate}</td>
                      <td>{project.duration}</td>
                      <td className="project-fund-cell">
                        <div className="fund-label">{fundType}</div>
                        <div className="fund-details">
                          {project.fundGovt && <span>Gov: {project.fundGovt}</span>}
                          {project.fundADB && <span>ADB: {project.fundADB}</span>}
                          {project.fundWB && <span>WB: {project.fundWB}</span>}
                        </div>
                      </td>
                      <td>{project.statusPct}%</td>
                      <td>
                        <span className={`status-pill ${project.priority === "High" ? "status-pill-red" : project.priority === "Medium" ? "status-pill-amber" : "status-pill-green"}`}>
                          {project.priority}
                        </span>
                      </td>
                      <td className="table-action-cell">
                        <button
                          className="action-button"
                          onClick={() => handleViewDetails(project)}
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {isModalOpen && selectedProject && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedProject.name}</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-section">
                <h3>Project Information</h3>
                <div className="modal-grid">
                  <div className="modal-item">
                    <label>Project Name</label>
                    <p>{selectedProject.name}</p>
                  </div>
                  <div className="modal-item">
                    <label>Project Director (PD)</label>
                    <p>{selectedProject.pd}</p>
                  </div>
                  <div className="modal-item">
                    <label>Start Date</label>
                    <p>{selectedProject.startDate}</p>
                  </div>
                  <div className="modal-item">
                    <label>End Date</label>
                    <p>{selectedProject.endDate}</p>
                  </div>
                  <div className="modal-item">
                    <label>Duration</label>
                    <p>{selectedProject.duration}</p>
                  </div>
                  <div className="modal-item">
                    <label>Priority</label>
                    <p>
                      <span className={`status-pill ${selectedProject.priority === "High" ? "status-pill-red" : selectedProject.priority === "Medium" ? "status-pill-amber" : "status-pill-green"}`}>
                        {selectedProject.priority}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <h3>Funding Information</h3>
                <div className="modal-grid">
                  <div className="modal-item">
                    <label>Government Fund</label>
                    <p>{selectedProject.fundGovt || "N/A"}</p>
                  </div>
                  <div className="modal-item">
                    <label>ADB Fund</label>
                    <p>{selectedProject.fundADB || "N/A"}</p>
                  </div>
                  <div className="modal-item">
                    <label>World Bank Fund</label>
                    <p>{selectedProject.fundWB || "N/A"}</p>
                  </div>
                  <div className="modal-item">
                    <label>Fund Source</label>
                    <p>{getFundType(selectedProject)}</p>
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <h3>Project Status</h3>
                <div className="modal-grid">
                  <div className="modal-item full-width">
                    <label>Progress</label>
                    <div className="progress-track" style={{ height: "8px", marginTop: "8px" }}>
                      <div
                        className="progress-fill"
                        style={{
                          width: `${selectedProject.statusPct}%`,
                          backgroundColor: selectedProject.statusPct >= 75 ? "#22c55e" : selectedProject.statusPct >= 50 ? "#3b82f6" : selectedProject.statusPct >= 25 ? "#f59e0b" : "#ef4444",
                        }}
                      />
                    </div>
                    <p style={{ marginTop: "8px", fontSize: "14px", fontWeight: "600" }}>{selectedProject.statusPct}% Complete</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="button-secondary" onClick={handleCloseModal}>
                Close
              </button>
              <button className="button-primary">
                Edit Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;