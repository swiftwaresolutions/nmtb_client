import React, { useEffect, useMemo, useState } from "react";
import { Container, Card, Form, Button, Row, Col, Spinner, Modal } from "react-bootstrap";
import ReportHeader from "../../components/ReportHeader";
import ReportTable from "../../components/ReportTable";
import SearchInput from "../../../components/SearchInput";
import { useTableSearch } from "../../../hooks/useTableSearch";
import {
  exportToExcel,
  formatReportDate,
  printReport,
  sortTableData,
} from "../../utils/reportUtils";
import "../../styles/reportStyles.css";

interface BirthReportRow {
  slNo: number;
  mrdNo: string;
  babyName: string;
  gender: string;
  dob: string;
  birthTime: string;
  motherMrdNo: string;
  motherName: string;
  address: string;
  city: string;
  district: string;
  state: string;
  contact: string;
  patientType: string;
  religion: string;
  idNo: string;
  insurance: string;
  createdDate: string;
}

export default function BirthReport() {
  const today = new Date().toISOString().split("T")[0];

  const [fromDate, setFromDate] = useState<string>(today);
  const [toDate, setToDate] = useState<string>(today);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [tableData, setTableData] = useState<BirthReportRow[]>([]);
  const [displayedData, setDisplayedData] = useState<BirthReportRow[]>([]);
  const [sortKey, setSortKey] = useState<keyof BirthReportRow | "">("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<BirthReportRow | null>(null);

  const { filteredData, searchTerm, setSearchTerm, resultCount, totalCount } = useTableSearch({
    data: tableData,
    searchFields: [
      "mrdNo",
      "babyName",
      "gender",
      "dob",
      "birthTime",
      "motherMrdNo",
      "motherName",
      "address",
      "city",
      "district",
      "state",
      "contact",
      "patientType",
      "religion",
      "insurance",
      "createdDate",
    ],
  });

  useEffect(() => {
    const sorted = sortKey ? sortTableData(filteredData, sortKey, sortDirection) : filteredData;
    setDisplayedData(sorted);
  }, [filteredData, sortKey, sortDirection]);

  const columns = useMemo(
    () => [
      {
        key: "slNo",
        label: "S.No",
        sortable: true,
        render: (_: BirthReportRow, __: BirthReportRow, idx: number) => idx + 1,
      },
      {
        key: "mrdNo",
        label: "MRD.NO",
        sortable: true,
        render: (value: string, record: BirthReportRow) => (
          <button
            type="button"
            className="btn btn-link p-0"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedRow(record);
              setShowDetailsModal(true);
            }}
          >
            {value}
          </button>
        ),
      },
      { key: "babyName", label: "Baby Name", sortable: true },
      { key: "gender", label: "Gender", sortable: true },
      { key: "dob", label: "DOB", sortable: true },
      { key: "birthTime", label: "Time", sortable: true },
      { key: "motherMrdNo", label: "Mothers MRD NO", sortable: true },
      { key: "motherName", label: "Mother Name", sortable: true },
      { key: "address", label: "Address", sortable: false },
      { key: "city", label: "City", sortable: true },
      { key: "district", label: "District", sortable: true },
      { key: "state", label: "State", sortable: true },
      { key: "contact", label: "Contact", sortable: true },
      { key: "patientType", label: "Patient Type", sortable: true },
      { key: "religion", label: "Religion", sortable: true },
      { key: "idNo", label: "ID NO", sortable: true },
      { key: "insurance", label: "Insurance", sortable: true },
      { key: "createdDate", label: "Created Date", sortable: true },
    ],
    []
  );

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsSubmitted(true);
    const dummyData: BirthReportRow[] = [
      {
        slNo: 1,
        mrdNo: "MRD-10540",
        babyName: "B/O Arun Kumar",
        gender: "Male",
        dob: "02/02/2026",
        birthTime: "03:15 AM",
        motherMrdNo: "MRD-10240",
        motherName: "Lakshmi K",
        address: "Kazi, Ernakulam",
        city: "Kazi",
        district: "Ernakulam",
        state: "Kerala",
        contact: "9876543210",
        patientType: "IP",
        religion: "Hindu",
        idNo: "ID-001",
        insurance: "AROGYA PLUS",
        createdDate: "02/02/2026",
      },
      {
        slNo: 2,
        mrdNo: "MRD-10541",
        babyName: "B/O Anjali",
        gender: "Female",
        dob: "03/02/2026",
        birthTime: "08:45 AM",
        motherMrdNo: "MRD-10241",
        motherName: "Priya M",
        address: "Bangalore Urban",
        city: "Bangalore",
        district: "Bangalore Urban",
        state: "Karnataka",
        contact: "9876543211",
        patientType: "IP",
        religion: "Hindu",
        idNo: "ID-002",
        insurance: "AROGYA PLUS",
        createdDate: "03/02/2026",
      },
      {
        slNo: 3,
        mrdNo: "MRD-10542",
        babyName: "B/O Vikram",
        gender: "Male",
        dob: "04/02/2026",
        birthTime: "10:30 PM",
        motherMrdNo: "MRD-10242",
        motherName: "Sudha N",
        address: "Kochi Urban",
        city: "Kochi",
        district: "Ernakulam",
        state: "Kerala",
        contact: "9876543212",
        patientType: "IP",
        religion: "Christian",
        idNo: "ID-003",
        insurance: "AROGYA PLUS",
        createdDate: "04/02/2026",
      },
    ];

    setTableData(dummyData);
    setSortKey("");
    setSortDirection("asc");
    setIsLoading(false);
  };

  const handleReset = () => {
    setFromDate(today);
    setToDate(today);
    setIsSubmitted(false);
    setTableData([]);
    setDisplayedData([]);
    setSearchTerm("");
    setSortKey("");
    setSortDirection("asc");
    setShowDetailsModal(false);
    setSelectedRow(null);
  };

  const handleSort = (key: string, direction: "asc" | "desc") => {
    setSortKey(key as keyof BirthReportRow);
    setSortDirection(direction);
  };

  const handlePrint = () => {
    printReport();
  };

  const handleExport = () => {
    const exportData = displayedData.map((_, index) => ({
      "S.No": index + 1,
      "MRD NO": displayedData[index]?.mrdNo,
      "Baby Name": displayedData[index]?.babyName,
      "Gender": displayedData[index]?.gender,
      "DOB": displayedData[index]?.dob,
      "Birth Time": displayedData[index]?.birthTime,
      "Mother MRD NO": displayedData[index]?.motherMrdNo,
      "Mother Name": displayedData[index]?.motherName,
      "Address": displayedData[index]?.address,
      "City": displayedData[index]?.city,
      "District": displayedData[index]?.district,
      "State": displayedData[index]?.state,
      "Contact": displayedData[index]?.contact,
      "Patient Type": displayedData[index]?.patientType,
      "Religion": displayedData[index]?.religion,
      "ID NO": displayedData[index]?.idNo,
      "Insurance": displayedData[index]?.insurance,
      "Created Date": displayedData[index]?.createdDate,
    }));

    exportToExcel(
      exportData,
      `Birth_Report_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
      "Birth Report"
    );
  };

  const handleModalPrint = () => {
    const detailsElement = document.getElementById("birth-report-modal-details");
    if (!detailsElement) return;

    const printWindow = window.open("", "BirthReportPrint", "width=900,height=700");
    if (!printWindow) return;

    printWindow.document.write(
      `<!doctype html><html><head><title>Birth Report Details</title></head><body>${detailsElement.innerHTML}</body></html>`
    );
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const emptyMessage = !isSubmitted
    ? "No data loaded. Please select date range and click Submit."
    : searchTerm
      ? "No records match your search criteria."
      : "No records found.";

  return (
    <React.Fragment>
      <Container fluid className="px-4 py-3">
        <ReportHeader
          title="Birth Register Details"
          subtitle={isSubmitted ? `${formatReportDate(fromDate, "DD/MM/YYYY")} To ${formatReportDate(toDate, "DD/MM/YYYY")}` : "Select date range and click Submit"}
          onPrint={handlePrint}
          onExport={handleExport}
          showSearch={false}
          showSort={false}
          showPrint={displayedData.length > 0}
          showExport={displayedData.length > 0}
        />

        <Card className="mb-4 shadow-sm no-print">
          <Card.Body>
            <Form className="row g-3 align-items-end" onSubmit={handleFilterSubmit}>
              <Form.Group as={Col} md={4} controlId="fromDate">
                <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>From Date</Form.Label>
                <Form.Control
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group as={Col} md={4} controlId="toDate">
                <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>To Date</Form.Label>
                <Form.Control
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group as={Col} md={4} className="d-flex align-items-end gap-2">
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

        {isSubmitted && (
          <Row className="mb-3 no-print">
            <Col>
              <SearchInput
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                placeholder="Search by name, MRD no, mother name, city..."
                resultCount={resultCount}
                totalCount={totalCount}
              />
            </Col>
          </Row>
        )}

        {isLoading ? (
          <div className="text-center py-5 text-muted">
            <Spinner animation="border" role="status" />
            <div className="mt-3">Loading birth report...</div>
          </div>
        ) : (
          <Card className="report-card" style={{ padding: "0.75rem" }}>
            <div
              style={{
                maxHeight: "calc(115vh - 500px)",
                minHeight: "350px",
                overflowY: "auto",
                overflowX: "auto",
                position: "relative",
              }}
            >
              <ReportTable
                data={displayedData}
                columns={columns}
                onSort={handleSort}
                responsive={false}
                emptyMessage={emptyMessage}
              />
            </div>

            <div
              style={{
                padding: "0.5rem 1rem",
                borderTop: "2px solid #e0e0e0",
                background: "linear-gradient(to right, #f8f9fa, #ffffff)",
                textAlign: "start",
              }}
            >
              <small className="text-muted" style={{ fontWeight: "var(--font-weight-medium)" }}>
                Total Data Rows: <strong>{displayedData.length}</strong>
                {searchTerm && <span className="ms-2">(Filtered from {filteredData.length})</span>}
              </small>
            </div>
          </Card>
        )}
      </Container>

      <Modal
        show={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
        size="xl"
        centered
        className="birth-details-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Birth Record Details - MRD.NO: {selectedRow?.mrdNo}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRow ? (
            <div id="birth-report-modal-details" style={{ padding: "1rem" }}>
              {/* Baby Information Section */}
              <Row className="g-3 mb-4">
                <Col xs={12}>
                  <h6 style={{ fontWeight: "var(--font-weight-semibold)", borderBottom: "2px solid #007bff", paddingBottom: "0.5rem" }}>
                    Baby Information
                  </h6>
                </Col>
                <Col md={6}>
                  <div className="detail-row">
                    <strong>Baby Name:</strong> 
                    <span style={{ marginLeft: "0.5rem" }}>{selectedRow.babyName}</span>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="detail-row">
                    <strong>Gender:</strong> 
                    <span style={{ marginLeft: "0.5rem" }}>{selectedRow.gender}</span>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="detail-row">
                    <strong>Date of Birth (DOB):</strong> 
                    <span style={{ marginLeft: "0.5rem" }}>{selectedRow.dob}</span>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="detail-row">
                    <strong>Birth Time:</strong> 
                    <span style={{ marginLeft: "0.5rem" }}>{selectedRow.birthTime}</span>
                  </div>
                </Col>
              </Row>

              {/* Mother Information Section */}
              <Row className="g-3 mb-4">
                <Col xs={12}>
                  <h6 style={{ fontWeight: "var(--font-weight-semibold)", borderBottom: "2px solid #28a745", paddingBottom: "0.5rem" }}>
                    Mother Information
                  </h6>
                </Col>
                <Col md={6}>
                  <div className="detail-row">
                    <strong>Mother MRD NO:</strong> 
                    <span style={{ marginLeft: "0.5rem" }}>{selectedRow.motherMrdNo}</span>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="detail-row">
                    <strong>Mother Name:</strong> 
                    <span style={{ marginLeft: "0.5rem" }}>{selectedRow.motherName}</span>
                  </div>
                </Col>
              </Row>

              {/* Address Information Section */}
              <Row className="g-3 mb-4">
                <Col xs={12}>
                  <h6 style={{ fontWeight: "var(--font-weight-semibold)", borderBottom: "2px solid #dc3545", paddingBottom: "0.5rem" }}>
                    Address Information
                  </h6>
                </Col>
                <Col md={12}>
                  <div className="detail-row">
                    <strong>Address:</strong> 
                    <span style={{ marginLeft: "0.5rem" }}>{selectedRow.address}</span>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="detail-row">
                    <strong>City:</strong> 
                    <span style={{ marginLeft: "0.5rem" }}>{selectedRow.city}</span>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="detail-row">
                    <strong>District:</strong> 
                    <span style={{ marginLeft: "0.5rem" }}>{selectedRow.district}</span>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="detail-row">
                    <strong>State:</strong> 
                    <span style={{ marginLeft: "0.5rem" }}>{selectedRow.state}</span>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="detail-row">
                    <strong>Contact:</strong> 
                    <span style={{ marginLeft: "0.5rem" }}>{selectedRow.contact}</span>
                  </div>
                </Col>
              </Row>

              {/* Clinical Information Section */}
              <Row className="g-3 mb-4">
                <Col xs={12}>
                  <h6 style={{ fontWeight: "var(--font-weight-semibold)", borderBottom: "2px solid #ffc107", paddingBottom: "0.5rem" }}>
                    Clinical Information
                  </h6>
                </Col>
                <Col md={6}>
                  <div className="detail-row">
                    <strong>Patient Type:</strong> 
                    <span style={{ marginLeft: "0.5rem" }}>{selectedRow.patientType}</span>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="detail-row">
                    <strong>Religion:</strong> 
                    <span style={{ marginLeft: "0.5rem" }}>{selectedRow.religion}</span>
                  </div>
                </Col>
              </Row>

              {/* Administrative Information Section */}
              <Row className="g-3 mb-4">
                <Col xs={12}>
                  <h6 style={{ fontWeight: "var(--font-weight-semibold)", borderBottom: "2px solid #6f42c1", paddingBottom: "0.5rem" }}>
                    Administrative Information
                  </h6>
                </Col>
                <Col md={6}>
                  <div className="detail-row">
                    <strong>MRD NO:</strong> 
                    <span style={{ marginLeft: "0.5rem", fontWeight: "var(--font-weight-medium)", color: "#0056b3" }}>{selectedRow.mrdNo}</span>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="detail-row">
                    <strong>ID NO:</strong> 
                    <span style={{ marginLeft: "0.5rem" }}>{selectedRow.idNo}</span>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="detail-row">
                    <strong>Insurance:</strong> 
                    <span style={{ marginLeft: "0.5rem" }}>{selectedRow.insurance}</span>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="detail-row">
                    <strong>Created Date:</strong> 
                    <span style={{ marginLeft: "0.5rem" }}>{selectedRow.createdDate}</span>
                  </div>
                </Col>
              </Row>
            </div>
          ) : (
            <div className="text-muted text-center py-4">
              <i className="bi bi-inbox"></i>
              <div>No details available.</div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleModalPrint}>
            <i className="bi bi-printer"></i> Print
          </Button>
        </Modal.Footer>
      </Modal>
    </React.Fragment>
  );
}
