import React, { useCallback, useEffect, useState } from "react";
import { Container, Card, Form, Button, Row, Col, Badge } from "react-bootstrap";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../state/store";
import { MedicalRecordsApiService } from "../../../../../api/medical-records/medical-records-api-service";
import { showErrorToast, showSuccessToast, showWarningToast } from "../../../../../utils/alertUtil";
import ReportHeader from "../../../../components/ReportHeader";
import ReportTable from "../../../../components/ReportTable";
import {
  searchTableData,
  sortTableData,
  exportToExcel,
  printReport,
  formatReportDate
} from "../../../../utils/reportUtils";
import "../../../styles/reportStyles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faEye } from "@fortawesome/free-solid-svg-icons";
import MaternityDetailForm from "./MaternityDetailForm";

interface MaternityVerificationRow {
  slNo: number;
  patientName: string;
  status: string;
  opNo: string;
  ipNo: string;
  age: number;
  sex: string;
  department: string;
  ward: string;
  doctor: string;
  doa: string;
  summaryDate: string;
  createdBy: string;
  patId?: number;
  visitId?: number;
  ipId?: number;
  summaryId?: number;
}

function MaternityVerification() {
  const organization = useSelector((state: RootState) => state.appReducer.organization);
  const loginData = useSelector((state: RootState) => state.loginData);
  const apiService = new MedicalRecordsApiService();
  
  const today = new Date().toISOString().split('T')[0];
  const [fromDate, setFromDate] = useState<string>(today);
  const [toDate, setToDate] = useState<string>(today);
  const [filteredData, setFilteredData] = useState<MaternityVerificationRow[]>([]);
  const [displayedData, setDisplayedData] = useState<MaternityVerificationRow[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortKey, setSortKey] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState<boolean>(false);
  const [dataLoaded, setDataLoaded] = useState<boolean>(false);
  const [showDetailForm, setShowDetailForm] = useState<boolean>(false);
  const [selectedPatient, setSelectedPatient] = useState<MaternityVerificationRow | null>(null);

  const updateDisplayedData = useCallback(
    (
      records: MaternityVerificationRow[],
      search: string,
      sortK: string,
      sortDir: "asc" | "desc"
    ) => {
      let result: MaternityVerificationRow[] = records;

      if (search) {
        result = searchTableData(result, search, [
          "patientName",
          "opNo",
          "ipNo",
          "department",
          "ward",
          "doctor",
          "createdBy"
        ]);
      }

      if (sortK) {
        result = sortTableData(result, sortK as keyof MaternityVerificationRow, sortDir);
      }

      setDisplayedData(result);
    },
    []
  );

  useEffect(() => {
    updateDisplayedData(filteredData, searchTerm, sortKey, sortDirection);
  }, [filteredData, searchTerm, sortKey, sortDirection, updateDisplayedData]);

  // Fetch data on component mount
  useEffect(() => {
    fetchVerificationList();
  }, []);

  const fetchVerificationList = async () => {
    setLoading(true);

    try {
      // TODO: Replace with actual API endpoint for pending verification summaries
      // const response = await apiService.fetchMaternityVerificationList(fromDate, toDate);
      
      // Temporary mock data - replace with actual API call
      const mockData: MaternityVerificationRow[] = [
        {
          slNo: 1,
          patientName: "Sample Patient 1",
          status: "Pending Verification",
          opNo: "OP12345",
          ipNo: "IP67890",
          age: 28,
          sex: "Female",
          department: "Obstetrics",
          ward: "Maternity Ward",
          doctor: "Dr. Smith",
          doa: "2026-02-20",
          summaryDate: "2026-02-22",
          createdBy: "Nurse Jane",
          patId: 1,
          visitId: 1,
          ipId: 1,
          summaryId: 1
        }
      ];

      if (!mockData || mockData.length === 0) {
        showWarningToast("No summaries pending verification");
        setFilteredData([]);
        setDataLoaded(true);
        return;
      }

      setFilteredData(mockData);
      setDataLoaded(true);
      showSuccessToast("Verification list loaded successfully");
    } catch (error: any) {
      console.error("Error fetching verification list:", error);
      showErrorToast(
        error?.response?.data?.error || "Failed to fetch verification list"
      );
      setFilteredData([]);
      setDataLoaded(false);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    fetchVerificationList();
  };

  const handleReset = () => {
    setFromDate(today);
    setToDate(today);
    setSearchTerm("");
    setSortKey("");
    setSortDirection("asc");
    fetchVerificationList();
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const handleExport = () => {
    const exportData = displayedData.map((row) => ({
      "S.No": row.slNo,
      "Patient Name": row.patientName,
      "Status": row.status,
      "OP No": row.opNo,
      "IP No": row.ipNo,
      "Age": row.age,
      "Sex": row.sex,
      "Department": row.department,
      "Ward": row.ward,
      "Doctor": row.doctor,
      "Date of Admission": row.doa,
      "Summary Date": row.summaryDate,
      "Created By": row.createdBy
    }));

    exportToExcel(
      exportData,
      `Maternity_Verification_List_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
      "Maternity Verification"
    );
  };

  const renderStatusBadge = (status: string) => {
    const statusLower = (status || "").toLowerCase();
    const statusMap: { [key: string]: string } = {
      "pending verification": "bg-warning text-dark",
      "verified": "bg-success text-white",
      "rejected": "bg-danger text-white"
    };
    const badgeClass = statusMap[statusLower] || "bg-secondary text-white";
    
    return (
      <Badge bg="" className={`${badgeClass} fw-semibold`}>
        {status}
      </Badge>
    );
  };

  const handleRowClick = (record: MaternityVerificationRow) => {
    setSelectedPatient(record);
    setShowDetailForm(true);
  };

  const handleBackToList = () => {
    setShowDetailForm(false);
    setSelectedPatient(null);
    // Refresh data
    fetchVerificationList();
  };

  const columns = [
    {
      key: "slNo",
      label: "S. No",
      sortable: false,
      render: (value: number) => value
    },
    {
      key: "patientName",
      label: "Patient Name",
      sortable: true
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => renderStatusBadge(value)
    },
    {
      key: "opNo",
      label: "OP No",
      sortable: true
    },
    {
      key: "ipNo",
      label: "IP No",
      sortable: true
    },
    {
      key: "age",
      label: "Age",
      sortable: true
    },
    {
      key: "sex",
      label: "Sex",
      sortable: true
    },
    {
      key: "ward",
      label: "Ward",
      sortable: true
    },
    {
      key: "doctor",
      label: "Doctor",
      sortable: true
    },
    {
      key: "doa",
      label: "D.O.A",
      sortable: true
    },
    {
      key: "summaryDate",
      label: "Summary Date",
      sortable: true
    },
    {
      key: "createdBy",
      label: "Created By",
      sortable: true
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (_: any, record: MaternityVerificationRow) => (
        <Button 
          size="sm" 
          variant="outline-primary"
          onClick={(e) => {
            e.stopPropagation();
            handleRowClick(record);
          }}
        >
          <FontAwesomeIcon icon={faEye} className="me-1" />
          View
        </Button>
      )
    }
  ];

  // If showing detail form, render that instead
  if (showDetailForm && selectedPatient && selectedPatient.patId && selectedPatient.visitId && selectedPatient.ipId) {
    return (
      <MaternityDetailForm
        patient={{
          patId: selectedPatient.patId,
          visitId: selectedPatient.visitId,
          ipId: selectedPatient.ipId,
          patientName: selectedPatient.patientName,
          opNo: selectedPatient.opNo,
          ipNo: selectedPatient.ipNo,
          age: selectedPatient.age,
          sex: selectedPatient.sex,
          department: selectedPatient.department,
          ward: selectedPatient.ward,
          doctor: selectedPatient.doctor,
          doa: selectedPatient.doa,
          phone: ""
        }}
        onBack={handleBackToList}
        mode="verification"
      />
    );
  }

  return (
    <React.Fragment>
      <Container fluid className="px-4 py-3">
        <Card className="mb-3 shadow-sm">
          <Card.Header className="bg-primary text-white">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                Maternity Discharge Summary - Verification
              </h5>
            </div>
          </Card.Header>
        </Card>

        <ReportHeader
          title={`${organization?.name?.toUpperCase() || "HOSPITAL"} - Maternity Verification List`}
          subtitle={dataLoaded ? `Summaries Pending Verification (${displayedData.length})` : "Loading verification list..."}
          onPrint={printReport}
          onExport={handleExport}
          onSearch={handleSearch}
          showSearch={dataLoaded}
          showSort={false}
          showPrint={dataLoaded}
          showExport={dataLoaded}
        />

        <Card className="mb-4 shadow-sm no-print">
          <Card.Body>
            <Form className="row g-3 align-items-end" onSubmit={handleFilterSubmit}>
              <Form.Group as={Col} md={4} controlId="fromDate">
                <Form.Label style={{ fontWeight: 600 }}>From Date</Form.Label>
                <Form.Control 
                  type="date" 
                  value={fromDate} 
                  onChange={e => setFromDate(e.target.value)} 
                  required 
                  disabled={loading}
                />
              </Form.Group>
              <Form.Group as={Col} md={4} controlId="toDate">
                <Form.Label style={{ fontWeight: 600 }}>To Date</Form.Label>
                <Form.Control 
                  type="date" 
                  value={toDate} 
                  onChange={e => setToDate(e.target.value)} 
                  required 
                  disabled={loading}
                />
              </Form.Group>
              <Form.Group as={Col} md={4} className="d-flex align-items-end gap-2">
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="w-50"
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Search"}
                </Button>
                <Button 
                  type="button" 
                  variant="secondary" 
                  className="w-50" 
                  onClick={handleReset}
                  disabled={loading}
                >
                  Reset
                </Button>
              </Form.Group>
            </Form>
          </Card.Body>
        </Card>

        <Card className="report-card shadow-sm" style={{ padding: "0.75rem" }}>
          <div
            style={{
              height: "calc(100vh - 420px)",
              overflowY: "auto",
              overflowX: "auto",
              position: "relative"
            }}
          >
            <ReportTable
              data={displayedData}
              columns={columns}
              onSort={handleSort}
              onRowClick={handleRowClick}
              responsive={false}
              emptyMessage={
                loading
                  ? "Loading verification list..."
                  : searchTerm
                  ? "No records match your search criteria."
                  : dataLoaded
                  ? "No summaries pending verification."
                  : "Loading verification data..."
              }
            />
          </div>

          <div
            style={{
              padding: "0.5rem 1rem",
              borderTop: "2px solid #e0e0e0",
              background: "linear-gradient(to right, #f8f9fa, #ffffff)",
              textAlign: "start"
            }}
          >
            <Row className="align-items-center">
              <Col md={12}>
                <small className="text-muted" style={{ fontWeight: 500 }}>
                  Total Pending Verification: <strong>{displayedData.length}</strong>
                  {searchTerm && <span className="ms-2">(Filtered)</span>}
                  <span className="ms-3">|</span>
                  <span className="ms-3">
                    Date Range: <strong className="text-primary">{fromDate} to {toDate}</strong>
                  </span>
                </small>
              </Col>
            </Row>
          </div>
        </Card>
      </Container>
    </React.Fragment>
  );
}

export default MaternityVerification;
