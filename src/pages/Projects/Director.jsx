import { useState } from "react";
import "./Project.css";

function ProjectForm({ onSave, onClose }) {

  const [project, setProject] = useState({
    projectCode: "",
    projectName: "",
    shortName: "",
    ministry: "",
    division: "",
    department: "",
    implementingAgency: "",
    projectDirector: "",
    contractor: "",
    consultant: "",
    fundingSource: "",
    projectType: "",
    sector: "",
    location: "",
    district: "",
    upazila: "",
    startDate: "",
    endDate: "",
    revisedEndDate: "",
    totalBudget: "",
    govtFund: "",
    foreignFund: "",
    ownFund: "",
    expenditure: "",
    physicalProgress: "",
    financialProgress: "",
    status: "",
    priority: "",
    description: "",
    remarks: ""
  });

  const handleChange = (e) => {
    setProject({
      ...project,
      [e.target.name]: e.target.value
    });
  };

  const saveProject = () => {
    console.log(project);

    if(onSave){
      onSave(project);
    }
  };

  return (

<div className="modal-overlay">

<div className="modal-box large">

<h2>Add New Project</h2>

<div className="form-grid">

<div>
<label>Project Code</label>
<input
name="projectCode"
value={project.projectCode}
onChange={handleChange}
/>
</div>

<div>
<label>Project Name</label>
<input
name="projectName"
value={project.projectName}
onChange={handleChange}
/>
</div>

<div>
<label>Short Name</label>
<input
name="shortName"
value={project.shortName}
onChange={handleChange}
/>
</div>

<div>
<label>Ministry</label>
<input
name="ministry"
value={project.ministry}
onChange={handleChange}
/>
</div>

<div>
<label>Division</label>
<input
name="division"
value={project.division}
onChange={handleChange}
/>
</div>

<div>
<label>Department</label>
<input
name="department"
value={project.department}
onChange={handleChange}
/>
</div>

<div>
<label>Implementing Agency</label>
<input
name="implementingAgency"
value={project.implementingAgency}
onChange={handleChange}
/>
</div>

<div>
<label>Project Director</label>
<input
name="projectDirector"
value={project.projectDirector}
onChange={handleChange}
/>
</div>

<div>
<label>Contractor</label>
<input
name="contractor"
value={project.contractor}
onChange={handleChange}
/>
</div>

<div>
<label>Consultant</label>
<input
name="consultant"
value={project.consultant}
onChange={handleChange}
/>
</div>

<div>
<label>Funding Source</label>
<select
name="fundingSource"
value={project.fundingSource}
onChange={handleChange}
>
<option value="">Select</option>
<option>Government</option>
<option>Foreign Aid</option>
<option>PPP</option>
<option>Own Fund</option>
</select>
</div>

<div>
<label>Project Type</label>
<select
name="projectType"
value={project.projectType}
onChange={handleChange}
>
<option value="">Select</option>
<option>Investment</option>
<option>Development</option>
<option>Revenue</option>
</select>
</div>

<div>
<label>Sector</label>
<input
name="sector"
value={project.sector}
onChange={handleChange}
/>
</div>

<div>
<label>District</label>
<input
name="district"
value={project.district}
onChange={handleChange}
/>
</div>

<div>
<label>Upazila</label>
<input
name="upazila"
value={project.upazila}
onChange={handleChange}
/>
</div>

<div>
<label>Location</label>
<input
name="location"
value={project.location}
onChange={handleChange}
/>
</div>

<div>
<label>Start Date</label>
<input
type="date"
name="startDate"
value={project.startDate}
onChange={handleChange}
/>
</div>

<div>
<label>End Date</label>
<input
type="date"
name="endDate"
value={project.endDate}
onChange={handleChange}
/>
</div>

<div>
<label>Revised End Date</label>
<input
type="date"
name="revisedEndDate"
value={project.revisedEndDate}
onChange={handleChange}
/>
</div>

<div>
<label>Total Budget</label>
<input
type="number"
name="totalBudget"
value={project.totalBudget}
onChange={handleChange}
/>
</div>

<div>
<label>Government Fund</label>
<input
type="number"
name="govtFund"
value={project.govtFund}
onChange={handleChange}
/>
</div>

<div>
<label>Foreign Fund</label>
<input
type="number"
name="foreignFund"
value={project.foreignFund}
onChange={handleChange}
/>
</div>

<div>
<label>Own Fund</label>
<input
type="number"
name="ownFund"
value={project.ownFund}
onChange={handleChange}
/>
</div>

<div>
<label>Expenditure</label>
<input
type="number"
name="expenditure"
value={project.expenditure}
onChange={handleChange}
/>
</div>

<div>
<label>Physical Progress (%)</label>
<input
type="number"
name="physicalProgress"
value={project.physicalProgress}
onChange={handleChange}
/>
</div>

<div>
<label>Financial Progress (%)</label>
<input
type="number"
name="financialProgress"
value={project.financialProgress}
onChange={handleChange}
/>
</div>

<div>
<label>Status</label>
<select
name="status"
value={project.status}
onChange={handleChange}
>
<option value="">Select</option>
<option>Planning</option>
<option>Running</option>
<option>Completed</option>
<option>Suspended</option>
</select>
</div>

<div>
<label>Priority</label>
<select
name="priority"
value={project.priority}
onChange={handleChange}
>
<option>High</option>
<option>Medium</option>
<option>Low</option>
</select>
</div>

<div className="full-width">
<label>Description</label>
<textarea
rows="4"
name="description"
value={project.description}
onChange={handleChange}
/>
</div>

<div className="full-width">
<label>Remarks</label>
<textarea
rows="3"
name="remarks"
value={project.remarks}
onChange={handleChange}
/>
</div>

</div>

<div className="modal-footer">

<button className="save-btn" onClick={saveProject}>
Save Project
</button>

<button className="cancel-btn" onClick={onClose}>
Cancel
</button>

</div>

</div>

</div>

  );
}

export default ProjectForm;