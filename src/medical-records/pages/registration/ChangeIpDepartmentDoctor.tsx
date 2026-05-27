import React, { useState } from "react";
import {
  showSuccessToast,
  showValidationError,
  showErrorToast,
} from "../../../utils/alertUtil";
import MedicalRecordsApiService, {
  IpVisitPatientDetailsItem,
} from "../../../api/medical-records/medical-records-api-service";
import {
  SystemAdminApiService,
  ConsultantItem,
  DepartmentItem,
} from "../../../api/system-admin/system-admin-api-service";

type ViewState = "enter" | "list" | "success";

export default function ChangeIpDepartmentDoctor() {
  const [view, setView] = useState<ViewState>("enter");
  const [opNo, setOpNo] = useState("");
  const [ipVisits, setIpVisits] = useState<IpVisitPatientDetailsItem[]>([]);
  const [isFetching, setIsFetching] = useState(false);

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
      const [ipDetails, consultantsData, departmentsData] = await Promise.all([
        mrApiService.fetchPatientDetailsForIpVisit(opNo.trim()),
        adminApiService.fetchAllConsultants(),
        adminApiService.fetchAllDepartments(),
      ]);

      const ipOnlyVisits = ipDetails.filter((v) => v.ipNo && v.ipId);
      if (ipOnlyVisits.length === 0) {
        showValidationError("No IP visit details found for the given OP No");
        return;
      }

      setIpVisits(ipOnlyVisits);
      const consultantList = consultantsData?.data || consultantsData || [];
      setConsultants(Array.isArray(consultantList) ? consultantList : []);
      setDepartments(departmentsData);
      setView("list");
    } catch {
      showErrorToast("Failed to fetch IP visit details");
    } finally {
      setIsFetching(false);
    }
  };

  const handleRowClick = (visit: IpVisitPatientDetailsItem) => {
    setEditingVisitId(visit.visitId);
    setEditDepartment(visit.deptId ? String(visit.deptId) : "");
    setEditDoctor(visit.docId ? String(visit.docId) : "");
  };

  const handleCancelEdit = () => {
    setEditingVisitId(null);
    setEditDepartment("");
    setEditDoctor("");
  };

  const handleSaveRow = async (visit: IpVisitPatientDetailsItem) => {
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
      ipId: Number(visit.ipId),
      deptId: Number(editDepartment),
      doctorId: Number(editDoctor),
    };

    try {
      await mrApiService.saveChangeIpDepartmentDoctor(payload);

      // Re-fetch fresh data from server
      const freshIpDetails = await mrApiService.fetchPatientDetailsForIpVisit(opNo.trim());
      setIpVisits(freshIpDetails.filter((v) => v.ipNo && v.ipId));
      setEditingVisitId(null);
      showSuccessToast("IP Department/Doctor changed successfully");
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
    setIpVisits([]);
    setConsultants([]);
    setDepartments([]);
    setEditingVisitId(null);
    setEditDepartment("");
    setEditDoctor("");
    setIsFetching(false);
    setIsSaving(false);
    setView("enter");
  };

  const ipVisitRows = ipVisits;

  return (
    <div className="container mt-4">
      {view === "enter" && (
        <div className="card p-4">
          <h3 className="text-center mb-4">Change IP Department / Doctor</h3>
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

      {view === "list" && (
        <div className="card p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="mb-0">Change IP Department / Doctor</h4>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={handleReset}
            >
              Back
            </button>
          </div>

          <div className="row g-2 mb-3">
            <div className="col-md-3 fw-semibold">OP No</div>
            <div className="col-md-3">{ipVisits[0]?.opNo || opNo}</div>
            <div className="col-md-3 fw-semibold">Patient Name</div>
            <div className="col-md-3">{ipVisits[0]?.patientName || "-"}</div>
            <div className="col-md-3 fw-semibold">Age</div>
            <div className="col-md-3">{ipVisits[0]?.age || "-"}</div>
            <div className="col-md-3 fw-semibold">Sex</div>
            <div className="col-md-3">{ipVisits[0]?.sex || "-"}</div>
            <div className="col-md-3 fw-semibold">IP No</div>
            <div className="col-md-3">{ipVisits[0]?.ipNo || "-"}</div>
            <div className="col-md-3 fw-semibold">Admit Date & Time</div>
            <div className="col-md-3">
              {ipVisits[0]?.admitDateTime ? new Date(ipVisits[0].admitDateTime).toLocaleString() : "-"}
            </div>
          </div>

          <hr />

          <p className="text-muted mb-2" style={{ fontSize: "var(--font-size-sm)" }}>
            Click the row to edit the Department and Doctor.
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
                {ipVisitRows.map((visit, index) =>
                  editingVisitId === visit.visitId ? (
                    <tr key={visit.visitId} className="table-warning">
                      <td>{index + 1}</td>
                      <td>{visit.visitId}</td>
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
                      <td>{new Date(visit.visitDateTime).toLocaleString()}</td>
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
                      key={visit.visitId}
                      style={{ cursor: "pointer" }}
                      onClick={() => handleRowClick(visit)}
                    >
                      <td>{index + 1}</td>
                      <td>{visit.visitId}</td>
                      <td>{visit.doctorName || "-"}</td>
                      <td>
                        {visit.visitDateTime ? new Date(visit.visitDateTime).toLocaleString() : "-"}
                      </td>
                      <td>{visit.departmentName || "-"}</td>
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

      {view === "success" && (
        <div className="card p-4 text-center">
          <h4 className="text-success mb-3">
            IP Department / Doctor Changed Successfully
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
