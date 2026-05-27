import React, { useState } from "react";
import { Container, Card, Form, Button, Table, Badge } from "react-bootstrap";
import { faCalendarCheck } from "@fortawesome/free-solid-svg-icons";
import PageHeader from "../../../../components/PageHeader";
import { MedicalRecordsApiService, OpVisitItem } from "../../../../api/medical-records/medical-records-api-service";
import { SystemAdminApiService, PatientDetailsItem } from "../../../../api/system-admin/system-admin-api-service";
import { showErrorToast } from "../../../../utils/alertUtil";

const VisitCheck: React.FC = () => {
  const medicalRecordsApi = new MedicalRecordsApiService();
  const systemAdminApi = new SystemAdminApiService();

  const [opNo, setOpNo] = useState("");
  const [patientDetails, setPatientDetails] = useState<PatientDetailsItem | null>(null);
  const [visits, setVisits] = useState<OpVisitItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!opNo.trim()) {
      showErrorToast("Please enter OP Number");
      return;
    }

    setLoading(true);
    setSearchPerformed(true);
    setPatientDetails(null);
    setVisits([]);

    try {
      const [patientResponse, visitsResponse] = await Promise.all([
        systemAdminApi.fetchPatientDetails(opNo.trim()),
        medicalRecordsApi.fetchOpVisitsByOpNo(opNo.trim()),
      ]);

      if (patientResponse) {
        setPatientDetails(patientResponse);
      }

      const data = Array.isArray(visitsResponse) ? visitsResponse : [];
      setVisits(data);

      if (data.length === 0) {
        showErrorToast("No visits found for this patient");
      }
    } catch (error: any) {
      console.error("Error loading patient data:", error);
      showErrorToast(error?.response?.data?.error || "Failed to load patient data");
      setPatientDetails(null);
      setVisits([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setOpNo("");
    setPatientDetails(null);
    setVisits([]);
    setSearchPerformed(false);
  };

  const formatDateTime = (datetime: string) => {
    try {
      const date = new Date(datetime);
      return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return datetime;
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        minHeight: 0,
        overflow: "hidden",
      }}
    >
      <PageHeader
        icon={faCalendarCheck}
        title="Visit Check"
        subtitle="Search patient visit history by OP number"
      />

      <div
        className="content-body"
        style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "1.5rem" }}
      >
        <Container fluid>
          {/* ── Search Bar + Patient Info ── */}
          <Card
            className="shadow-sm mb-3"
            style={{ borderRadius: "10px", border: "1px solid #e2e8f0" }}
          >
            <Card.Body className="py-3 px-4">
              <div className="d-flex align-items-center gap-4 flex-wrap">
                {/* Search inputs */}
                <Form onSubmit={handleSearch} className="flex-shrink-0">
                  <div className="d-flex align-items-end gap-2">
                    <div>
                      <Form.Label
                        className="text-muted mb-1"
                        style={{
                          fontSize: "var(--font-size-xs)",
                          fontWeight: "var(--font-weight-semibold)",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        OP Number
                      </Form.Label>
                      <div className="input-group" style={{ width: "220px" }}>
                        <span
                          className="input-group-text bg-white"
                          style={{ borderRight: "none", color: "#94a3b8" }}
                        >
                          <i className="fas fa-search"></i>
                        </span>
                        <Form.Control
                          type="text"
                          placeholder="e.g. 26-4"
                          value={opNo}
                          onChange={(e) => setOpNo(e.target.value)}
                          disabled={loading}
                          autoFocus
                          style={{ borderLeft: "none" }}
                        />
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={loading || !opNo.trim()}
                      style={{ padding: "7px 18px" }}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Searching...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-search me-1"></i>Search
                        </>
                      )}
                    </Button>
                    {searchPerformed && (
                      <Button
                        variant="outline-secondary"
                        onClick={handleReset}
                        disabled={loading}
                        style={{ padding: "7px 14px" }}
                      >
                        <i className="fas fa-times"></i>
                      </Button>
                    )}
                  </div>
                </Form>

                {/* Patient info — shown inline to the right */}
                {searchPerformed && patientDetails && !loading && (
                  <div
                    className="d-flex align-items-center flex-wrap gap-3"
                    style={{
                      borderLeft: "2px solid #bfdbfe",
                      paddingLeft: "1.25rem",
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <span
                      className="badge bg-primary"
                      style={{
                        fontSize: "var(--font-size-sm)",
                        padding: "5px 10px",
                        borderRadius: "6px",
                      }}
                    >
                      {patientDetails.displayNumber}
                    </span>
                    <span
                      style={{
                        fontWeight: "var(--font-weight-semibold)",
                        fontSize: "var(--font-size-base)",
                        color: "#1e293b",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <i className="fas fa-user-circle me-2 text-primary opacity-75"></i>
                      {patientDetails.name}
                    </span>
                    <span
                      className="text-muted"
                      style={{
                        fontSize: "var(--font-size-sm)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <i
                        className={`fas ${
                          patientDetails.sex === "Male"
                            ? "fa-mars text-primary"
                            : "fa-venus text-danger"
                        } me-1`}
                      ></i>
                      {patientDetails.sex}
                    </span>
                    <span
                      className="text-muted"
                      style={{
                        fontSize: "var(--font-size-sm)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <i className="fas fa-birthday-cake me-1 text-warning"></i>
                      {patientDetails.age}
                    </span>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>

          {/* Visit Table */}
          {searchPerformed && (
            <Card
              className="shadow-sm"
              style={{ borderRadius: "10px", border: "1px solid #e2e8f0" }}
            >
              <Card.Header
                className="d-flex align-items-center justify-content-between py-2 px-3"
                style={{
                  background: "#f8fafc",
                  borderBottom: "1px solid #e2e8f0",
                  borderRadius: "10px 10px 0 0",
                }}
              >
                <div className="d-flex align-items-center gap-2">
                  <div
                    style={{
                      width: "4px",
                      height: "20px",
                      background: "#2563eb",
                      borderRadius: "2px",
                    }}
                  ></div>
                  <span
                    style={{
                      fontWeight: "var(--font-weight-semibold)",
                      fontSize: "var(--font-size-base)",
                      color: "#1e293b",
                    }}
                  >
                    Visit History
                  </span>
                  {visits.length > 0 && (
                    <Badge
                      style={{
                        fontSize: "var(--font-size-xs)",
                        padding: "3px 10px",
                        borderRadius: "20px",
                        background: "var(--page-secondary-color)",
                        color: "var(--page-primary-color)",
                      }}
                    >
                      {visits.length} {visits.length === 1 ? "Visit" : "Visits"}
                    </Badge>
                  )}
                </div>
              </Card.Header>
              <Card.Body className="p-0">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <div className="mt-2 text-muted small">Loading visit details...</div>
                  </div>
                ) : visits.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    <i
                      className="fas fa-calendar-times opacity-25 mb-2"
                      style={{ fontSize: "2rem", display: "block" }}
                    ></i>
                    <div className="small">
                      No visits found for OP Number: <strong>{opNo}</strong>
                    </div>
                  </div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <Table className="mb-0" hover>
                      <thead
                        style={{
                          background: "#f8fafc",
                          fontSize: "var(--font-size-xs)",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          color: "#64748b",
                        }}
                      >
                        <tr>
                          <th className="ps-4 py-2 border-0" style={{ width: "4%" }}>
                            #
                          </th>
                          <th className="py-2 border-0">OP No</th>
                          <th className="py-2 border-0">IP No</th>
                          <th className="py-2 border-0">Name</th>
                          <th className="py-2 border-0">DOB</th>
                          <th className="py-2 border-0">Guardian Name</th>
                          <th className="py-2 border-0">Phone No</th>
                          <th className="py-2 border-0">Address</th>
                          <th className="py-2 border-0">Visit Date &amp; Time</th>
                          <th className="py-2 border-0">Doctor</th>
                        </tr>
                      </thead>
                      <tbody style={{ fontSize: "var(--font-size-sm)" }}>
                        {visits.map((visit, index) => (
                          <tr
                            key={visit.opVisitId}
                            style={{ borderBottom: "1px solid #f1f5f9" }}
                          >
                            <td className="ps-4 py-2 align-middle text-muted">
                              {index + 1}
                            </td>
                            <td className="py-2 align-middle">{visit.opNo || "—"}</td>
                            <td className="py-2 align-middle">{visit.ipNo || "—"}</td>
                            <td className="py-2 align-middle">
                              <i className="fas fa-user-circle me-2 text-primary opacity-75"></i>
                              {visit.patientName || "—"}
                            </td>
                            <td className="py-2 align-middle">{visit.dob || "—"}</td>
                            <td className="py-2 align-middle">{visit.guardianName || "—"}</td>
                            <td className="py-2 align-middle">
                              {visit.phone ? (
                                <><i className="fas fa-phone me-1 text-success opacity-75"></i>{visit.phone}</>
                              ) : "—"}
                            </td>
                            <td className="py-2 align-middle">{visit.address || "—"}</td>
                            <td className="py-2 align-middle">
                              <i className="fas fa-calendar-alt me-2 text-info opacity-75"></i>
                              {formatDateTime(visit.datetime)}
                            </td>
                            <td className="py-2 align-middle">
                              <i className="fas fa-user-md me-2 text-primary opacity-75"></i>
                              {visit.doctorName}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card.Body>
            </Card>
          )}
        </Container>
      </div>
    </div>
  );
};

export default VisitCheck;
