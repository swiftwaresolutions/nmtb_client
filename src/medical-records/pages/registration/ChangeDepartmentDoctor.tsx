import React, { useState } from "react";
import {
  showSuccessToast,
  showValidationError,
  showErrorToast,
} from "../../../utils/alertUtil";
import MedicalRecordsApiService, {
  OpVisitItem,
} from "../../../api/medical-records/medical-records-api-service";
import { SystemAdminApiService, ConsultantItem, DepartmentItem, PatientDetailsItem } from "../../../api/system-admin/system-admin-api-service";

type ViewState = "enter" | "list" | "success";

export default function ChangeDepartmentDoctor() {
  const [view, setView] = useState<ViewState>("enter");
  const [opNo, setOpNo] = useState("");
  const [opVisits, setOpVisits] = useState<OpVisitItem[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  // Patient details
  const [patientDetails, setPatientDetails] = useState<PatientDetailsItem | null>(null);

  // Dropdown lists
  const [consultants, setConsultants] = useState<ConsultantItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);

  // Inline edit state
  const [editingVisitId, setEditingVisitId] = useState<number | null>(null);
  const [editDepartment, setEditDepartment] = useState("");
  const [editDoctor, setEditDoctor] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const mrApiService = new MedicalRecordsApiService();
  const adminApiService = new SystemAdminApiService();

  const handleHinSubmit = async () => {
    if (!opNo.trim()) {
      showValidationError("Enter OP No");
      return;
    }
    setIsFetching(true);
    try {
      const [visitsData, consultantsData, departmentsData, patientData] = await Promise.all([
        mrApiService.fetchOpVisitsByOpNo(opNo.trim()),
        adminApiService.fetchAllConsultants(),
        adminApiService.fetchAllDepartments(),
        adminApiService.fetchPatientDetails(opNo.trim()),
      ]);
      if (!visitsData || visitsData.length === 0) {
        showValidationError("No visits found for the given OP No");
        return;
      }
      setOpVisits(visitsData);
      const consultantList = consultantsData?.data || consultantsData || [];
      setConsultants(Array.isArray(consultantList) ? consultantList : []);
      setDepartments(departmentsData);
      setPatientDetails(patientData || null);
      setView("list");
    } catch {
      showErrorToast("Failed to fetch OP visit details");
    } finally {
      setIsFetching(false);
    }
  };

  const handleRowClick = (visit: OpVisitItem) => {
    setEditingVisitId(visit.opVisitId);
    setEditDepartment(patientDetails?.departmentId ? String(patientDetails.departmentId) : "");
    setEditDoctor(String(visit.doctorId));
  };

  const handleCancelEdit = () => {
    setEditingVisitId(null);
    setEditDepartment("");
    setEditDoctor("");
  };

  const handleSaveRow = async (visit: OpVisitItem) => {
    if (!editDepartment) {
      showValidationError("Please select a Department");
      return;
    }
    if (!editDoctor) {
      showValidationError("Please select a Doctor");
      return;
    }
    setIsSaving(true);
    const payload = {
      visitId: visit.opVisitId,
      deptId: Number(editDepartment),
      doctorId: Number(editDoctor),
    };
    try {
      await mrApiService.saveChangeDepartmentDoctor(payload);
      // Re-fetch fresh data from server
      const [visitsData, patientData] = await Promise.all([
        mrApiService.fetchOpVisitsByOpNo(opNo.trim()),
        adminApiService.fetchPatientDetails(opNo.trim()),
      ]);
      setOpVisits(Array.isArray(visitsData) ? visitsData : []);
      setPatientDetails(patientData || null);
      setEditingVisitId(null);
      showSuccessToast("Department/Doctor changed successfully");
      setView("success");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Failed to save changes";
      showErrorToast(String(msg));
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setOpNo("");
    setOpVisits([]);
    setPatientDetails(null);
    setConsultants([]);
    setDepartments([]);
    setEditingVisitId(null);
    setEditDepartment("");
    setEditDoctor("");
    setIsFetching(false);
    setIsSaving(false);
    setView("enter");
  };

  return (
    <div className="container mt-4">
      {/* ── ENTER VIEW ── */}
      {view === "enter" && (
        <div className="card p-4">
          <h3 className="text-center mb-4">Change Department / Doctor</h3>
          <div className="row align-items-center">
            <div className="col-md-4">
              <label className="form-label">Enter OP No</label>
            </div>
            <div className="col-md-5">
              <input
                className="form-control"
                value={opNo}
                onChange={(e) => setOpNo(e.target.value)}
                placeholder="Enter OP No"
                onKeyDown={(e) => e.key === "Enter" && handleHinSubmit()}
              />
            </div>
            <div className="col-md-3">
              <button
                type="button"
                className="btn btn-primary w-100"
                onClick={handleHinSubmit}
                disabled={isFetching}
              >
                {isFetching ? "Loading..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── LIST VIEW ── */}
      {view === "list" && (
        <div className="card p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="mb-0">Change Department / Doctor</h4>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={handleReset}
            >
              Back
            </button>
          </div>

          {/* Patient Details */}
          <div className="row g-2 mb-3">
            <div className="col-md-3 fw-semibold">OP No</div>
            <div className="col-md-3">{opNo}</div>
            <div className="col-md-3 fw-semibold">Patient Name</div>
            <div className="col-md-3">{patientDetails?.name || "—"}</div>
            <div className="col-md-3 fw-semibold">Age</div>
            <div className="col-md-3">{patientDetails?.age || "—"}</div>
            <div className="col-md-3 fw-semibold">Sex</div>
            <div className="col-md-3">{patientDetails?.sex || "—"}</div>
          </div>

          <hr />

          <p className="text-muted mb-2" style={{ fontSize: "var(--font-size-sm)" }}>
            Click a row to edit the Department and Doctor.
          </p>

          <div className="table-responsive">
            <table className="table table-bordered table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Visit ID</th>
                  <th>Doctor Name</th>
                  <th>Visit Date &amp; Time</th>
                  <th>Department</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {opVisits.map((visit, index) =>
                  editingVisitId === visit.opVisitId ? (
                    <tr key={visit.opVisitId} className="table-warning">
                      <td>{index + 1}</td>
                      <td>{visit.opVisitId}</td>
                      <td>
                        <select
                          className="form-select form-select-sm"
                          value={editDoctor}
                          onChange={(e) => setEditDoctor(e.target.value)}
                        >
                          <option value="">-- Select Doctor --</option>
                          {consultants.map((c) => (
                            <option key={c.id} value={String(c.id)}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>{new Date(visit.datetime).toLocaleString()}</td>
                      <td>
                        <select
                          className="form-select form-select-sm"
                          value={editDepartment}
                          onChange={(e) => setEditDepartment(e.target.value)}
                        >
                          <option value="">-- Select Department --</option>
                          {departments.map((d) => (
                            <option key={d.id} value={String(d.id)}>
                              {d.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <button
                          className="btn btn-success btn-sm me-1"
                          onClick={() => handleSaveRow(visit)}
                          disabled={isSaving}
                        >
                          {isSaving ? "Saving..." : "Save"}
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={handleCancelEdit}
                          disabled={isSaving}
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ) : (
                    <tr
                      key={visit.opVisitId}
                      style={{ cursor: "pointer" }}
                      onClick={() => handleRowClick(visit)}
                    >
                      <td>{index + 1}</td>
                      <td>{visit.opVisitId}</td>
                      <td>{visit.doctorName}</td>
                      <td>{new Date(visit.datetime).toLocaleString()}</td>
                      <td>{visit.departmentName}</td>
                      <td>
                        <span className="text-primary" style={{ fontSize: "var(--font-size-sm)" }}>
                          Click to edit
                        </span>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── SUCCESS VIEW ── */}
      {view === "success" && (
        <div className="card p-4 text-center">
          <h4 className="text-success mb-3">
            Department / Doctor Changed Successfully
          </h4>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleReset}
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
}
