import React, { useState } from "react";
import {
  showSuccessToast,
  showValidationError,
} from "../../../utils/alertUtil";
import {
  formatNumberDisplay,
  handleNumberBlur,
  handleNumberChange,
} from "../../../utils/numberInputUtil";

type ViewState = "enter" | "form" | "success";

export default function MLCregistration() {
  const [view, setView] = useState<ViewState>("enter");
  const [hinNo, setHinNo] = useState("HIN1023");
  const [mlcDate, setMlcDate] = useState("2026-02-18");
  const [injuryType, setInjuryType] = useState("Road Accident");
  const [natureOfInjury, setNatureOfInjury] = useState("Simple");
  const [injuryDimension, setInjuryDimension] = useState("5cm x 2cm");
  const [injuryDetails, setInjuryDetails] = useState(
    "Head injury due to bike accident"
  );
  const [firNo, setFirNo] = useState("FIR8899");
  const [policeOfficer, setPoliceOfficer] = useState("Inspector Ravi");
  const [policeStation, setPoliceStation] = useState("T Nagar PS");
  const [statement, setStatement] = useState(
    "Patient slipped and hit divider"
  );
  const [broughtBy, setBroughtBy] = useState("Public");
  const [doctorName, setDoctorName] = useState("Dr. Suresh");
  const [patientCondition, setPatientCondition] = useState("Stable");
  const [bodyPartAffected, setBodyPartAffected] = useState("Head");
  const [weaponUsed, setWeaponUsed] = useState("Bike");
  const [incidentDate, setIncidentDate] = useState("2026-02-18");
  const [incidentTime, setIncidentTime] = useState("00:00");
  const [remarks, setRemarks] = useState("Under observation");
  const [patientAge, setPatientAge] = useState<number>(35);

  const handleHinSubmit = () => {
    if (!hinNo.trim()) {
      showValidationError("Enter HIN Number");
      return;
    }
    setView("form");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    showSuccessToast("MLC registration saved");
    setView("success");
  };

  const handleReset = () => {
    setView("enter");
  };

  return (
    <div className="container mt-4">
      {view === "enter" && (
        <div className="card p-4">
          <h3 className="text-center mb-4">MLC Registration</h3>
          <div className="row align-items-center">
            <div className="col-md-4">
              <label className="form-label">Enter HIN</label>
            </div>
            <div className="col-md-5">
              <input
                className="form-control"
                value={hinNo}
                onChange={(event) => setHinNo(event.target.value)}
                placeholder="Enter HIN"
              />
            </div>
            <div className="col-md-3">
              <button
                type="button"
                className="btn btn-primary w-100"
                onClick={handleHinSubmit}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {view === "form" && (
        <div className="card p-4">
          <div style={{ maxHeight: "80vh", overflowY: "auto" }}>
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
              <h4 className="mb-0">Patient Details</h4>
              <button type="button" className="btn btn-outline-secondary" onClick={handleReset}>
                Back
              </button>
            </div>
  
            <div className="row g-2 mb-3">
              <div className="col-md-3 fw-semibold">Patient Name</div>
              <div className="col-md-3">Ramesh Kumar</div>
              <div className="col-md-3 fw-semibold">Age</div>
              <div className="col-md-3">{formatNumberDisplay(patientAge)}</div>
              <div className="col-md-3 fw-semibold">Sex</div>
              <div className="col-md-3">Male</div>
              <div className="col-md-3 fw-semibold">Address</div>
              <div className="col-md-3">Chennai, Tamil Nadu</div>
            </div>

            <hr />

            <h5 className="mb-3">Injury Details</h5>
            <form onSubmit={handleSubmit}>
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label className="form-label">MLC Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={mlcDate}
                  onChange={(event) => setMlcDate(event.target.value)}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Injury Type</label>
                <select
                  className="form-select"
                  value={injuryType}
                  onChange={(event) => setInjuryType(event.target.value)}
                >
                  <option value="Road Accident">Road Accident</option>
                  <option value="Assault">Assault</option>
                  <option value="Fall">Fall</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Nature of Injury</label>
                <select
                  className="form-select"
                  value={natureOfInjury}
                  onChange={(event) => setNatureOfInjury(event.target.value)}
                >
                  <option value="Simple">Simple</option>
                  <option value="Grievous">Grievous</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Injury Dimension</label>
                <input
                  className="form-control"
                  value={injuryDimension}
                  onChange={(event) => setInjuryDimension(event.target.value)}
                />
              </div>
              <div className="col-md-8">
                <label className="form-label">Injury Details</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={injuryDetails}
                  onChange={(event) => setInjuryDetails(event.target.value)}
                />
              </div>
            </div>

            <hr />

            <h5 className="mb-3">Police Details</h5>
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label className="form-label">FIR No</label>
                <input
                  className="form-control"
                  value={firNo}
                  onChange={(event) => setFirNo(event.target.value)}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Police Officer</label>
                <input
                  className="form-control"
                  value={policeOfficer}
                  onChange={(event) => setPoliceOfficer(event.target.value)}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Police Station</label>
                <input
                  className="form-control"
                  value={policeStation}
                  onChange={(event) => setPoliceStation(event.target.value)}
                />
              </div>
              <div className="col-md-12">
                <label className="form-label">Statement</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={statement}
                  onChange={(event) => setStatement(event.target.value)}
                />
              </div>
            </div>

            <hr />

            <h5 className="mb-3">Other Details</h5>
            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <label className="form-label">Brought By</label>
                <input
                  className="form-control"
                  value={broughtBy}
                  onChange={(event) => setBroughtBy(event.target.value)}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Doctor</label>
                <select
                  className="form-select"
                  value={doctorName}
                  onChange={(event) => setDoctorName(event.target.value)}
                >
                  <option value="Dr. Suresh">Dr. Suresh</option>
                  <option value="Dr. Meena">Dr. Meena</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Patient Condition</label>
                <input
                  className="form-control"
                  value={patientCondition}
                  onChange={(event) => setPatientCondition(event.target.value)}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Body Part Affected</label>
                <input
                  className="form-control"
                  value={bodyPartAffected}
                  onChange={(event) => setBodyPartAffected(event.target.value)}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Weapon Used</label>
                <input
                  className="form-control"
                  value={weaponUsed}
                  onChange={(event) => setWeaponUsed(event.target.value)}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Incident Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={incidentDate}
                  onChange={(event) => setIncidentDate(event.target.value)}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Incident Time</label>
                <input
                  type="time"
                  className="form-control"
                  value={incidentTime}
                  onChange={(event) => setIncidentTime(event.target.value)}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Remarks</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={remarks}
                  onChange={(event) => setRemarks(event.target.value)}
                />
              </div>
            </div>

              <div className="text-center">
                <button type="submit" className="btn btn-primary px-5">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {view === "success" && (
        <div className="card p-4 text-center">
          <h4 className="text-success mb-3">
            MLC Registration Successfully Added
          </h4>
          <button type="button" className="btn btn-secondary" onClick={handleReset}>
            Back
          </button>
        </div>
      )}
    </div>
  );
}
