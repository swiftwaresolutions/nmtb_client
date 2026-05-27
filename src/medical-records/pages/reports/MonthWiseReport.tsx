import React, { useState } from "react";
import { Container, Card, Form, Button, Col, Spinner, Table } from "react-bootstrap";
import ReportHeader from "../../components/ReportHeader";
import { exportToExcel, formatReportDate } from "../../utils/reportUtils";
import { showValidationError } from "../../../utils/alertUtil";
import "../../styles/reportStyles.css";

const reportOptions = [
  { value: "total-patient", label: "Total Patient" },
  { value: "room-occupancy", label: "Room Occupancy" }
];

const monthOptions = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

const patientData = {
  newOP: { male: 792, female: 964 },
  repeatOP: { male: 2706, female: 4753 },
  inPatient: { male: 201, female: 287 }
};

const roomOccupancyData = [
  { wardName: "Ward A", totalPatients: 25 },
  { wardName: "Ward B", totalPatients: 18 },
  { wardName: "Ward C", totalPatients: 32 },
  { wardName: "Ward D", totalPatients: 22 },
  { wardName: "Ward E", totalPatients: 28 },
  { wardName: "ICU", totalPatients: 15 }
];

export default function MonthWiseReport() {
  const [selectedReport, setSelectedReport] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, index) => String(currentYear - index));
  const isTotalPatientReport = selectedReport === "total-patient";

  const handleReportTypeChange = (value: string) => {
    setSelectedReport(value);
    setSelectedYear("");
    setSelectedMonth("");
    setIsSubmitted(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) {
      showValidationError("Select a report type");
      return;
    }

    if (isTotalPatientReport || selectedReport === "room-occupancy") {
      if (!selectedYear) {
        showValidationError("Select the year");
        return;
      }
      if (!selectedMonth) {
        showValidationError("Select the month");
        return;
      }
    }

    setIsLoading(true);
    setIsSubmitted(true);
    setIsLoading(false);
  };

  const handleReset = () => {
    setSelectedReport("");
    setSelectedYear("");
    setSelectedMonth("");
    setIsSubmitted(false);
  };

  const handleExport = () => {
    if (!isSubmitted) {
      return;
    }

    if (isTotalPatientReport) {
      const exportData = [
        {
          "Patient Type": "New OP",
          Male: patientData.newOP.male,
          Female: patientData.newOP.female
        },
        {
          "Patient Type": "Repeat OP",
          Male: patientData.repeatOP.male,
          Female: patientData.repeatOP.female
        },
        {
          "Patient Type": "In Patient",
          Male: patientData.inPatient.male,
          Female: patientData.inPatient.female
        }
      ];

      exportToExcel(
        exportData,
        `Total_Patient_Report_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
        "Total Patient Report"
      );
      return;
    }

    if (selectedReport === "room-occupancy") {
      const exportData = roomOccupancyData.map((row) => ({
        "Ward Name": row.wardName,
        "Total Number Of Patients": row.totalPatients
      }));

      exportToExcel(
        exportData,
        `Room_Occupancy_Report_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
        "Room Occupancy Report"
      );
    }
  };

  const selectedLabel = reportOptions.find((option) => option.value === selectedReport)?.label || "-";

  return (
    <React.Fragment>
      <Container fluid className="px-4 py-3">
        <ReportHeader
          title="Month Wise Report"
          subtitle={isSubmitted ? `Selected: ${selectedLabel}` : "Choose a report type"}
          onExport={handleExport}
          showSearch={false}
          showSort={false}
          showPrint={false}
          showExport={isSubmitted && (isTotalPatientReport || selectedReport === "room-occupancy")}
        />

        <Card className="mb-4 shadow-sm no-print">
          <Card.Body>
            <Form className="row g-3 align-items-end" onSubmit={handleSubmit}>
              <Form.Group as={Col} md={6} controlId="monthWiseReportType">
                <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>Select Report Type</Form.Label>
                <Form.Select
                  value={selectedReport}
                  onChange={(event) => handleReportTypeChange(event.target.value)}
                >
                  <option value="">Select</option>
                  {reportOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              {isTotalPatientReport && (
                <>
                  <Form.Group as={Col} md={6} controlId="monthWiseYear">
                    <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>Select The Year</Form.Label>
                    <Form.Select
                      value={selectedYear}
                      onChange={(event) => setSelectedYear(event.target.value)}
                    >
                      <option value="">Select</option>
                      {yearOptions.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  <Form.Group as={Col} md={6} controlId="monthWiseMonth">
                    <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>Select The Month</Form.Label>
                    <Form.Select
                      value={selectedMonth}
                      onChange={(event) => setSelectedMonth(event.target.value)}
                    >
                      <option value="">Select</option>
                      {monthOptions.map((month) => (
                        <option key={month} value={month}>
                          {month}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </>
              )}
              {selectedReport === "room-occupancy" && (
                <>
                  <Form.Group as={Col} md={6} controlId="roomOccupancyYear">
                    <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>Select The Year</Form.Label>
                    <Form.Select
                      value={selectedYear}
                      onChange={(event) => setSelectedYear(event.target.value)}
                    >
                      <option value="">Select</option>
                      {yearOptions.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  <Form.Group as={Col} md={6} controlId="roomOccupancyMonth">
                    <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>Select The Month</Form.Label>
                    <Form.Select
                      value={selectedMonth}
                      onChange={(event) => setSelectedMonth(event.target.value)}
                    >
                      <option value="">Select</option>
                      {monthOptions.map((month) => (
                        <option key={month} value={month}>
                          {month}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </>
              )}
              <Form.Group as={Col} md={6} className="d-flex align-items-end gap-2">
                <Button type="submit" variant="primary" className="w-50" disabled={isLoading}>
                  {isLoading ? "Submitting..." : "Submit"}
                </Button>
                <Button type="button" variant="secondary" className="w-50" onClick={handleReset} disabled={isLoading}>
                  Reset
                </Button>
              </Form.Group>
            </Form>
          </Card.Body>
        </Card>

        {isLoading && (
          <div className="text-center py-5 text-muted">
            <Spinner animation="border" role="status" />
            <div className="mt-3">Loading month wise report...</div>
          </div>
        )}

        {isSubmitted && isTotalPatientReport && (
          <Card className="report-card" style={{ padding: "0.75rem" }}>
            <div className="fw-semibold">{selectedLabel}</div>
            <div className="text-muted mt-1">
              Month: {selectedMonth} | Year: {selectedYear}
            </div>
            <div className="mt-3" style={{ overflowX: "auto" }}>
              <Table bordered className="mb-0 text-center" style={{ minWidth: "600px" }}>
                <thead>
                  <tr>
                    <th>Patient Type</th>
                    <th colSpan={2}>Male</th>
                    <th colSpan={2}>Female</th>
                  </tr>
                  <tr>
                    <th></th>
                    <th>Count</th>
                    <th></th>
                    <th>Count</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>New OP</td>
                    <td>{patientData.newOP.male}</td>
                    <td></td>
                    <td>{patientData.newOP.female}</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td>Repeat OP</td>
                    <td>{patientData.repeatOP.male}</td>
                    <td></td>
                    <td>{patientData.repeatOP.female}</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td>In Patient</td>
                    <td>{patientData.inPatient.male}</td>
                    <td></td>
                    <td>{patientData.inPatient.female}</td>
                    <td></td>
                  </tr>
                </tbody>
              </Table>
            </div>
          </Card>
        )}

        {isSubmitted && selectedReport === "room-occupancy" && (
          <Card className="report-card" style={{ padding: "0.75rem" }}>
            <div className="fw-semibold">{selectedLabel}</div>
            <div className="text-muted mt-1">
              Month: {selectedMonth} | Year: {selectedYear}
            </div>
            <div className="mt-3" style={{ overflowX: "auto" }}>
              <Table bordered className="mb-0 text-center" style={{ minWidth: "500px" }}>
                <thead>
                  <tr>
                    <th>Ward Name</th>
                    <th>Total Number Of Patients</th>
                  </tr>
                </thead>
                <tbody>
                  {roomOccupancyData.map((row, index) => (
                    <tr key={index}>
                      <td>{row.wardName}</td>
                      <td>{row.totalPatients}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card>
        )}
      </Container>
    </React.Fragment>
  );
}

