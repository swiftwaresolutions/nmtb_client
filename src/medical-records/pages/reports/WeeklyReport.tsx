import React, { useState } from "react";
import { Container, Card, Form, Button, Col, Table } from "react-bootstrap";
import ReportHeader from "../../components/ReportHeader";
import { exportToExcel, formatReportDate } from "../../utils/reportUtils";
import { showValidationError } from "../../../utils/alertUtil";
import "../../styles/reportStyles.css";

type WeeklyReportOption = {
  value: string;
  label: string;
};

const weeklyReportOptions: WeeklyReportOption[] = [
  { value: "department-op", label: "Department [OP]" },
  { value: "doctor-op", label: "Doctor [OP]" },
  { value: "general-op", label: "General [OP]" },
  { value: "department-ip", label: "Department [IP]" },
  { value: "doctor-ip", label: "Doctor [IP]" },
  { value: "general-ip", label: "General [IP]" }
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

const departmentOptions = [
  "General Medicine",
  "Pediatrics",
  "Orthopedics",
  "Surgery",
  "Obstetrics & Gynecology",
  "Dermatology"
];

const doctorOptions = [
  "Dr. Priya",
  "Dr. Arun",
  "Dr. Leela",
  "Dr. Rahim",
  "Dr. Meera",
  "Dr. Suresh"
];

const weeklyDummyRows = [
  { day: "Monday", week1: 12, week2: 15, week3: 11, week4: 18, week5: 7 },
  { day: "Tuesday", week1: 10, week2: 14, week3: 13, week4: 16, week5: 6 },
  { day: "Wednesday", week1: 9, week2: 12, week3: 10, week4: 14, week5: 5 },
  { day: "Thursday", week1: 11, week2: 13, week3: 12, week4: 15, week5: 6 },
  { day: "Friday", week1: 14, week2: 16, week3: 15, week4: 19, week5: 8 },
  { day: "Saturday", week1: 8, week2: 10, week3: 9, week4: 12, week5: 4 },
  { day: "Sunday", week1: 6, week2: 8, week3: 7, week4: 9, week5: 3 }
];

export default function WeeklyReport() {
  const [selectedReport, setSelectedReport] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, index) => String(currentYear - index));
  const isDepartmentReport = selectedReport === "department-op" || selectedReport === "department-ip";
  const isDoctorReport = selectedReport === "doctor-op" || selectedReport === "doctor-ip";
  const isGeneralReport = selectedReport === "general-op" || selectedReport === "general-ip";

  const handleReportTypeChange = (value: string) => {
    setSelectedReport(value);
    setSelectedYear("");
    setSelectedMonth("");
    setSelectedDepartment("");
    setSelectedDoctor("");
    setIsSubmitted(false);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedReport) {
      showValidationError("Select a weekly report option");
      return;
    }

    if (isDepartmentReport) {
      if (!selectedYear) {
        showValidationError("Select the year");
        return;
      }
      if (!selectedMonth) {
        showValidationError("Select the month");
        return;
      }
      if (!selectedDepartment) {
        showValidationError("Select the department");
        return;
      }
    }

    if (isDoctorReport) {
      if (!selectedYear) {
        showValidationError("Select the year");
        return;
      }
      if (!selectedMonth) {
        showValidationError("Select the month");
        return;
      }
      if (!selectedDoctor) {
        showValidationError("Select the doctor");
        return;
      }
    }

    if (isGeneralReport) {
      if (!selectedYear) {
        showValidationError("Select the year");
        return;
      }
      if (!selectedMonth) {
        showValidationError("Select the month");
        return;
      }
    }

    setIsSubmitting(true);
    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  const handleReset = () => {
    setSelectedReport("");
    setSelectedYear("");
    setSelectedMonth("");
    setSelectedDepartment("");
    setSelectedDoctor("");
    setIsSubmitted(false);
  };

  const handleExport = () => {
    if (!isSubmitted) {
      return;
    }

    if (isGeneralReport) {
      const exportData = weeklyDummyRows.map((row) => ({
        Month: selectedMonth,
        Year: selectedYear,
        Day: row.day,
        "1st Week": row.week1,
        "2nd Week": row.week2,
        "3rd Week": row.week3,
        "4th Week": row.week4,
        "5th Week": row.week5
      }));

      exportToExcel(
        exportData,
        `Weekly_Report_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
        "Weekly Report"
      );
      return;
    }

    if (isDoctorReport) {
      const exportData = weeklyDummyRows.map((row) => ({
        "Doctor Name": selectedDoctor,
        Month: selectedMonth,
        Year: selectedYear,
        Day: row.day,
        "1st Week": row.week1,
        "2nd Week": row.week2,
        "3rd Week": row.week3,
        "4th Week": row.week4,
        "5th Week": row.week5
      }));

      exportToExcel(
        exportData,
        `Weekly_Report_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
        "Weekly Report"
      );
      return;
    }

    if (!isDepartmentReport) {
      return;
    }

    const exportData = weeklyDummyRows.map((row) => ({
      "Department Name": selectedDepartment,
      Month: selectedMonth,
      Year: selectedYear,
      Day: row.day,
      "1st Week": row.week1,
      "2nd Week": row.week2,
      "3rd Week": row.week3,
      "4th Week": row.week4,
      "5th Week": row.week5
    }));

    exportToExcel(
      exportData,
      `Weekly_Report_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
      "Weekly Report"
    );
  };

  const selectedLabel = weeklyReportOptions.find((option) => option.value === selectedReport)?.label || "-";

  return (
    <React.Fragment>
      <Container fluid className="px-4 py-3">
        <ReportHeader
          title="Weekly Report"
          subtitle={isSubmitted ? `Selected: ${selectedLabel}` : "Choose a weekly report"}
          onExport={handleExport}
          showSearch={false}
          showSort={false}
          showPrint={false}
          showExport={isSubmitted && (isDepartmentReport || isDoctorReport || isGeneralReport)}
        />

        <Card className="mb-4 shadow-sm no-print">
          <Card.Body>
            <Form className="row g-3 align-items-end" onSubmit={handleSubmit}>
              <Form.Group as={Col} md={6} controlId="weeklyReportType">
                <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>Weekly Report Type</Form.Label>
                <Form.Select
                  value={selectedReport}
                  onChange={(event) => handleReportTypeChange(event.target.value)}
                >
                  <option value="">Select</option>
                  {weeklyReportOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              {isDepartmentReport && (
                <>
                  <Form.Group as={Col} md={6} controlId="weeklyReportYear">
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
                  <Form.Group as={Col} md={6} controlId="weeklyReportMonth">
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
                  <Form.Group as={Col} md={6} controlId="weeklyReportDepartment">
                    <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>Select The Department</Form.Label>
                    <Form.Select
                      value={selectedDepartment}
                      onChange={(event) => setSelectedDepartment(event.target.value)}
                    >
                      <option value="">Select</option>
                      {departmentOptions.map((department) => (
                        <option key={department} value={department}>
                          {department}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </>
              )}
              {isDoctorReport && (
                <>
                  <Form.Group as={Col} md={6} controlId="weeklyReportDoctorYear">
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
                  <Form.Group as={Col} md={6} controlId="weeklyReportDoctorMonth">
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
                  <Form.Group as={Col} md={6} controlId="weeklyReportDoctor">
                    <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>Select The Doctor</Form.Label>
                    <Form.Select
                      value={selectedDoctor}
                      onChange={(event) => setSelectedDoctor(event.target.value)}
                    >
                      <option value="">Select</option>
                      {doctorOptions.map((doctor) => (
                        <option key={doctor} value={doctor}>
                          {doctor}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </>
              )}
              {isGeneralReport && (
                <>
                  <Form.Group as={Col} md={6} controlId="weeklyReportGeneralYear">
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
                  <Form.Group as={Col} md={6} controlId="weeklyReportGeneralMonth">
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
                <Button type="submit" variant="primary" className="w-50" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
                <Button type="button" variant="secondary" className="w-50" onClick={handleReset} disabled={isSubmitting}>
                  Reset
                </Button>
              </Form.Group>
            </Form>
          </Card.Body>
        </Card>

        {isSubmitted && (
          <Card className="report-card" style={{ padding: "0.75rem" }}>
            <div className="fw-semibold">{selectedLabel}</div>
            {isDepartmentReport && (
              <>
                <div className="text-muted mt-1">
                  Department Name: {selectedDepartment}
                </div>
                <div className="text-muted">Month: {selectedMonth}</div>
                <div className="text-muted">Year: {selectedYear}</div>
                <div className="mt-3" style={{ overflowX: "auto" }}>
                  <Table bordered className="mb-0 text-center" style={{ minWidth: "700px" }}>
                    <thead>
                      <tr>
                        <th>Day</th>
                        <th>1st Week</th>
                        <th>2nd Week</th>
                        <th>3rd Week</th>
                        <th>4th Week</th>
                        <th>5th Week</th>
                      </tr>
                    </thead>
                    <tbody>
                      {weeklyDummyRows.map((row) => (
                        <tr key={row.day}>
                          <td>{row.day}</td>
                          <td>{row.week1}</td>
                          <td>{row.week2}</td>
                          <td>{row.week3}</td>
                          <td>{row.week4}</td>
                          <td>{row.week5}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </>
            )}
            {isDoctorReport && (
              <>
                <div className="text-muted mt-1">Doctor Name: {selectedDoctor}</div>
                <div className="text-muted">Month: {selectedMonth}</div>
                <div className="text-muted">Year: {selectedYear}</div>
                <div className="mt-3" style={{ overflowX: "auto" }}>
                  <Table bordered className="mb-0 text-center" style={{ minWidth: "700px" }}>
                    <thead>
                      <tr>
                        <th>Day</th>
                        <th>1st Week</th>
                        <th>2nd Week</th>
                        <th>3rd Week</th>
                        <th>4th Week</th>
                        <th>5th Week</th>
                      </tr>
                    </thead>
                    <tbody>
                      {weeklyDummyRows.map((row) => (
                        <tr key={row.day}>
                          <td>{row.day}</td>
                          <td>{row.week1}</td>
                          <td>{row.week2}</td>
                          <td>{row.week3}</td>
                          <td>{row.week4}</td>
                          <td>{row.week5}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </>
            )}
            {isGeneralReport && (
              <>
                <div className="text-muted mt-1">Month: {selectedMonth}</div>
                <div className="text-muted">Year: {selectedYear}</div>
                <div className="mt-3" style={{ overflowX: "auto" }}>
                  <Table bordered className="mb-0 text-center" style={{ minWidth: "700px" }}>
                    <thead>
                      <tr>
                        <th>Day</th>
                        <th>1st Week</th>
                        <th>2nd Week</th>
                        <th>3rd Week</th>
                        <th>4th Week</th>
                        <th>5th Week</th>
                      </tr>
                    </thead>
                    <tbody>
                      {weeklyDummyRows.map((row) => (
                        <tr key={row.day}>
                          <td>{row.day}</td>
                          <td>{row.week1}</td>
                          <td>{row.week2}</td>
                          <td>{row.week3}</td>
                          <td>{row.week4}</td>
                          <td>{row.week5}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </>
            )}
          </Card>
        )}
      </Container>
    </React.Fragment>
  );
}
