import React, { useState } from "react";
import { Container, Card, Row, Col, Form, Button, Table } from "react-bootstrap";
import MedicalRecordsApiService, {
  BedOccupancyReportItem,
} from "../../../api/medical-records/medical-records-api-service";
import { showErrorToast } from "../../../utils/alertUtil";

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const YEARS = Array.from({ length: 10 }, (_, i) => currentYear - i);

export default function BedOccupancyReport() {
  const [month, setMonth] = useState<number>(currentMonth);
  const [year, setYear] = useState<number>(currentYear);
  const [reportData, setReportData] = useState<BedOccupancyReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const apiService = new MedicalRecordsApiService();

  const handleFetch = async () => {
    setIsLoading(true);
    setHasSearched(true);
    try {
      const data = await apiService.fetchBedOccupancyReport(month, year);
      setReportData(Array.isArray(data) ? data : []);
    } catch {
      showErrorToast("Failed to fetch Bed Occupancy Report");
      setReportData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedMonthLabel = MONTHS.find((m) => m.value === month)?.label ?? "";

  const totalBeds = reportData.reduce((s, r) => s + (r.noOfBeds || 0), 0);
  const totalIp = reportData.reduce((s, r) => s + (r.totalNoOfIp || 0), 0);
  const totalDailyAvg = reportData.reduce((s, r) => s + (r.dailyAvg || 0), 0);

  return (
    <Container fluid className="mt-3">
      <Card className="p-3 mb-3">
        <h5 className="mb-3">Bed Occupancy Report</h5>
        <Row className="align-items-end g-2">
          <Col md={3}>
            <Form.Group>
              <Form.Label>Month</Form.Label>
              <Form.Select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
              >
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Year</Form.Label>
              <Form.Select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={2}>
            <Button
              variant="primary"
              className="w-100"
              onClick={handleFetch}
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Show Report"}
            </Button>
          </Col>
        </Row>
      </Card>

      {hasSearched && (
        <Card className="p-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="mb-0">
              Bed Occupancy — {selectedMonthLabel} {year}
            </h6>
            <span
              className="text-muted"
              style={{ fontSize: "var(--font-size-sm)" }}
            >
              {reportData.length} ward(s)
            </span>
          </div>

          {reportData.length === 0 ? (
            <p className="text-muted text-center py-3">
              No data found for the selected period.
            </p>
          ) : (
            <div className="table-responsive">
              <Table bordered hover size="sm" className="align-middle">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Ward Name</th>
                    <th className="text-center">No. of Beds</th>
                    <th className="text-center">No. of Days</th>
                    <th className="text-center">Total IP Admissions</th>
                    <th className="text-center">Daily Average</th>
                    <th className="text-center">Occupancy Rate (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((row, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{row.wardName}</td>
                      <td className="text-center">{row.noOfBeds}</td>
                      <td className="text-center">{row.noOfDays}</td>
                      <td className="text-center">{row.totalNoOfIp}</td>
                      <td className="text-center">{row.dailyAvg?.toFixed(2) ?? "—"}</td>
                      <td className="text-center">
                        {row.occupancyRate != null
                          ? `${row.occupancyRate.toFixed(2)}%`
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="table-secondary fw-semibold">
                  <tr>
                    <td colSpan={2}>Total</td>
                    <td className="text-center">{totalBeds}</td>
                    <td></td>
                    <td className="text-center">{totalIp}</td>
                    <td className="text-center">{totalDailyAvg.toFixed(2)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </Table>
            </div>
          )}
        </Card>
      )}
    </Container>
  );
}
