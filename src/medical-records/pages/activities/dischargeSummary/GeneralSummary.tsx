import React, { useCallback, useEffect, useState } from "react";
import { Container, Card, Form, Button, Row, Col, Badge, Tabs, Tab } from "react-bootstrap";
import { useSelector } from "react-redux";
import { RootState } from "../../../../state/store";
import { MedicalRecordsApiService } from "../../../../api/medical-records/medical-records-api-service";
import { showErrorToast, showSuccessToast, showWarningToast } from "../../../../utils/alertUtil";
import ReportHeader from "../../../components/ReportHeader";
import ReportTable from "../../../components/ReportTable";
import {
  searchTableData,
  sortTableData,
  exportToExcel,
  printReport,
  formatReportDate
} from "../../../utils/reportUtils";
import "../../../styles/reportStyles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faPrint, faHospitalUser } from "@fortawesome/free-solid-svg-icons";
import GeneralDetailForm from "./component/GeneralDetailForm";
import GeneralVerificationTab from "./component/GeneralVerificationTab";
import GeneralPrintTab from "./component/GeneralPrintTab";
import GeneralSummaryPrint from "./component/GeneralSummaryPrint";

interface GeneralPatientRow {
  slNo: number;
  patientName: string;
  status: string;
  opNo: string;
  ipNo: string;
  age: string | number;
  sex: string;
  department: string;
  ward: string;
  doctor: string;
  doa: string;
  phone: string;
  patId?: number;
  visitId?: number;
  ipId?: number;
  summaryData?: any;
  guardianName?: string;
  guardianType?: string;
}

function GeneralSummary() {
  const organization = useSelector((state: RootState) => state.appReducer.organization);
  const apiService = new MedicalRecordsApiService();
  const getTodayDate = () => new Date().toISOString().split("T")[0];

  const [filteredData, setFilteredData] = useState<GeneralPatientRow[]>([]);
  const [displayedData, setDisplayedData] = useState<GeneralPatientRow[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterName, setFilterName] = useState<string>("");
  const [filterOpNo, setFilterOpNo] = useState<string>("");
  const [filterIpNo, setFilterIpNo] = useState<string>("");
  const [filterWard, setFilterWard] = useState<string>("");
  const [sortKey, setSortKey] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState<boolean>(false);
  const [dataLoaded, setDataLoaded] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("activeip");
  const [showDetailForm, setShowDetailForm] = useState<boolean>(false);
  const [selectedPatient, setSelectedPatient] = useState<GeneralPatientRow | null>(null);
  const [showPrintView, setShowPrintView] = useState<boolean>(false);
  const [printPatient, setPrintPatient] = useState<GeneralPatientRow | null>(null);
  const [tabRefreshKey, setTabRefreshKey] = useState<number>(0);
  const [isRoughCopyPrint, setIsRoughCopyPrint] = useState<boolean>(false);
  const [fromDate, setFromDate] = useState<string>(getTodayDate());
  const [toDate, setToDate] = useState<string>(getTodayDate());

  const canViewActiveIP = true;
  const canVerify = true;
  const canPrint = true;

  //const isObstetricsDepartment = (departmentName: string) =>
    //departmentName.toLowerCase().includes("obstet");

  const updateDisplayedData = useCallback(
    (records: GeneralPatientRow[], search: string, sortK: string, sortDir: "asc" | "desc", nameFilter: string, opNoFilter: string, ipNoFilter: string, wardFilter: string) => {
      let result = records;
      
      // Apply individual filters
      if (nameFilter) {
        result = result.filter(row => 
          row.patientName.toLowerCase().includes(nameFilter.toLowerCase())
        );
      }
      if (opNoFilter) {
        result = result.filter(row => 
          row.opNo.toLowerCase().includes(opNoFilter.toLowerCase())
        );
      }
      if (ipNoFilter) {
        result = result.filter(row => 
          row.ipNo.toLowerCase().includes(ipNoFilter.toLowerCase())
        );
      }
      if (wardFilter) {
        result = result.filter(row => 
          row.ward.toLowerCase().includes(wardFilter.toLowerCase())
        );
      }
      
      // Apply search term
      if (search) {
        result = searchTableData(result, search, [
          "patientName", "opNo", "ipNo", "department", "ward", "doctor", "phone"
        ]);
      }
      
      // Apply sorting
      if (sortK) {
        result = sortTableData(result, sortK as keyof GeneralPatientRow, sortDir);
      }
      setDisplayedData(result);
    },
    []
  );

  useEffect(() => {
    const dataToDisplay = activeTab === 'activeip' ? filteredData : [];
    updateDisplayedData(dataToDisplay, searchTerm, sortKey, sortDirection, filterName, filterOpNo, filterIpNo, filterWard);
  }, [filteredData, searchTerm, sortKey, sortDirection, filterName, filterOpNo, filterIpNo, filterWard, updateDisplayedData, activeTab]);

  useEffect(() => {
    fetchActivePatients();
  }, []);

  useEffect(() => {
    if (activeTab === 'print' || activeTab === 'verification') {
      setTabRefreshKey(prev => prev + 1);
    }
  }, [activeTab]);

  const fetchActivePatients = async (fromDateParam: string = fromDate, toDateParam: string = toDate) => {
    setLoading(true);
    try {
      const response = await apiService.fetchIpPatientsForSummary(fromDateParam, toDateParam);
      const data = response?.data || response || [];

      if (!data || data.length === 0) {
        showWarningToast("No active IP patients found");
        setFilteredData([]);
        setDataLoaded(true);
        return;
      }

      // Filter: exclude departmentId=8 and dischargeSummaryExists=1
      const filteredPatients = Array.isArray(data)
        ? data.filter(
            (patient: any) =>
              patient.dischargeSummaryExists === 0 &&
              patient.dischargeSummaryVerified === 0 
              //&& patient.departmentId !== 8
          )
        : [];

      const transformedData: GeneralPatientRow[] = filteredPatients.map((patient: any, index: number) => ({
        slNo: index + 1,
        patientName: patient.patientName || '',
        status: 'Admitted',
        opNo: patient.opNo || '',
        ipNo: patient.ipNo || '',
        age: patient.age || '',
        sex: patient.gender || '',
        department: patient.departmentName || '',
        ward: patient.admittedWard || '',
        doctor: patient.admittedDoctorName || '',
        doa: patient.admitDate || '',
        phone: patient.mobileNumber || '',
        patId: patient.patId || 0,
        visitId: patient.opVisitId || 0,
        ipId: patient.ipId || 0,
        guardianName: patient.guardianName || '',
        guardianType: patient.guardianType || ''
      }));

      setFilteredData(transformedData);
      setDataLoaded(true);
      showSuccessToast("Patients loaded successfully");
    } catch (error: any) {
      console.error("Error fetching active IP patients:", error);
      showErrorToast(
        error?.response?.data?.error || "Failed to fetch active IP patients"
      );
      setFilteredData([]);
      setDataLoaded(false);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (activeTab === "activeip") {
      fetchActivePatients();
    }
    setTabRefreshKey(prev => prev + 1);
  };

  const handleReset = () => {
    const today = getTodayDate();
    setFromDate(today);
    setToDate(today);
    setFilterName("");
    setFilterOpNo("");
    setFilterIpNo("");
    setFilterWard("");
    setSearchTerm("");
    setSortKey("");
    setSortDirection("asc");
    fetchActivePatients(today, today);
    setTabRefreshKey(prev => prev + 1);
  };

  const handleSearch = (term: string) => setSearchTerm(term);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const handleExport = () => {
    const exportData = displayedData.map(row => ({
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
      "Phone": row.phone
    }));
    exportToExcel(
      exportData,
      `General_Summary_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
      "General Summary"
    );
  };

  const renderStatusBadge = (status: string) => {
    const statusLower = (status || "").toLowerCase();
    const statusMap: { [key: string]: string } = {
      admitted: "bg-success text-white",
      occupied: "bg-warning text-dark",
      "bill prepared": "bg-info text-dark",
      "bill paid": "bg-primary text-white",
      discharged: "bg-danger text-white"
    };
    const badgeClass = statusMap[statusLower] || "bg-secondary text-white";
    return (
      <Badge bg="" className={`${badgeClass} fw-semibold`}>
        {status}
      </Badge>
    );
  };

  const handleRowClick = (record: GeneralPatientRow) => {
    setSelectedPatient(record);
    setShowDetailForm(true);
  };

  const handleBackToList = () => {
    setShowDetailForm(false);
    setSelectedPatient(null);
    fetchActivePatients();
  };

  const handlePrintPatient = (patient: GeneralPatientRow) => {
    setIsRoughCopyPrint(false);
    setPrintPatient(patient);
    setShowPrintView(true);
  };

  const handleBackFromPrint = () => {
    setShowPrintView(false);
    setPrintPatient(null);
    setIsRoughCopyPrint(false);
  };

  const handleRoughCopyPrint = (patient: any) => {
    setIsRoughCopyPrint(true);
    setPrintPatient(patient);
    setShowPrintView(true);
  };

  const columns = [
    { key: "slNo", label: "S. No", sortable: false, render: (value: number) => value },
    { key: "patientName", label: "Patient Name", sortable: true },
    { key: "status", label: "Status", sortable: true, render: (value: string) => renderStatusBadge(value) },
    { key: "opNo", label: "OP No", sortable: true },
    { key: "ipNo", label: "IP No", sortable: true },
    { key: "age", label: "Age", sortable: true },
    { key: "sex", label: "Sex", sortable: true },
    { key: "department", label: "Department", sortable: true },
    { key: "ward", label: "Ward", sortable: true },
    { key: "doctor", label: "Doctor", sortable: true },
    {
      key: "doa",
      label: "D.O.A",
      sortable: true,
      render: (value: string) => {
        if (!value) return "";
        const datePart = value.split(" ")[0];
        const [y, m, d] = datePart.split("-");
        return `${d}-${m}-${y}`;
      }
    },
    { key: "phone", label: "Phone", sortable: true }
  ];

  // Print view
  if (showPrintView && printPatient) {
    return (
      <GeneralSummaryPrint
        patient={printPatient}
        onBack={handleBackFromPrint}
        isRoughCopy={isRoughCopyPrint}
      />
    );
  }

  // Detail form
  if (showDetailForm && selectedPatient && selectedPatient.patId && selectedPatient.visitId && selectedPatient.ipId) {
    const mode = "verification";

    return (
      <GeneralDetailForm
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
          phone: selectedPatient.phone,
          summaryData: selectedPatient.summaryData
        }}
        onBack={handleBackToList}
        mode={mode}
      />
    );
  }

  return (
    <React.Fragment>
      <Container fluid className="px-4 py-3">
        <ReportHeader
          title={`${organization?.name?.toUpperCase() || "HOSPITAL"} - General Discharge Summary`}
          subtitle={dataLoaded ? "All Active IP Patients" : "Loading patients..."}
          onPrint={printReport}
          onExport={handleExport}
          onSearch={handleSearch}
          showSearch={dataLoaded}
          showSort={false}
          showPrint={dataLoaded}
          showExport={dataLoaded}
        />

        <Card className="shadow-sm">
          <Card.Header className="bg-white">
            <Form className="row g-3 align-items-end" onSubmit={handleFilterSubmit}>
              <Form.Group as={Col} md={3} controlId="fromDate">
                <Form.Label style={{ fontWeight: 'var(--font-weight-semibold)' }}>From Date</Form.Label>
                <Form.Control
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  disabled={loading}
                />
              </Form.Group>
              <Form.Group as={Col} md={3} controlId="toDate">
                <Form.Label style={{ fontWeight: 'var(--font-weight-semibold)' }}>To Date</Form.Label>
                <Form.Control
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  disabled={loading}
                />
              </Form.Group>
              <Form.Group as={Col} md={3} className="d-flex align-items-end gap-2">
                <Button type="submit" variant="primary" className="w-50" disabled={loading}>
                  {loading ? "Loading..." : "Submit"}
                </Button>
                <Button type="button" variant="secondary" className="w-50" onClick={handleReset} disabled={loading}>
                  Reset
                </Button>
              </Form.Group>
            </Form>

            <Tabs
              activeKey={activeTab}
              onSelect={k => k && setActiveTab(k)}
              className="mt-3 mb-0"
              style={{ borderBottom: "2px solid #e0e0e0" }}
            >
              {canViewActiveIP && (
                <Tab
                  eventKey="activeip"
                  title={<span><FontAwesomeIcon icon={faHospitalUser} className="me-2" />Active IP</span>}
                />
              )}
              {canVerify && (
                <Tab
                  eventKey="verification"
                  title={<span><FontAwesomeIcon icon={faCheckCircle} className="me-2" />Verification</span>}
                />
              )}
              {canPrint && (
                <Tab
                  eventKey="print"
                  title={<span><FontAwesomeIcon icon={faPrint} className="me-2" />Print</span>}
                />
              )}
            </Tabs>
          </Card.Header>

          <Card.Body>

        {/* Tab Content */}
        {activeTab === "verification" ? (
          <GeneralVerificationTab
            key={`verification-${tabRefreshKey}`}
            onPatientSelect={handleRowClick}
            onPrintPatient={handleRoughCopyPrint}
            fromDate={fromDate}
            toDate={toDate}
          />
        ) : activeTab === "print" ? (
          <GeneralPrintTab
            key={`print-${tabRefreshKey}`}
            onPatientSelect={handlePrintPatient}
            onEditPatient={handleRowClick}
            fromDate={fromDate}
            toDate={toDate}
          />
        ) : (
          <div className="report-card" style={{ padding: "0.75rem" }}>
            <div
              style={{
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
                    ? "Loading data..."
                    : searchTerm
                    ? "No records match your search criteria."
                    : dataLoaded
                    ? "No active IP patients found."
                    : "Loading patient data..."
                }
              />
            </div>
          </div>
        )}

          </Card.Body>

          <Card.Footer
            style={{
              borderTop: "2px solid #e0e0e0",
              background: "linear-gradient(to right, #f8f9fa, #ffffff)",
              textAlign: "start"
            }}
          >
            <Row className="align-items-center">
              <Col md={12}>
                <small className="text-muted" style={{ fontWeight: 500 }}>
                  {activeTab === "activeip"
                    ? `Total Active IP Patients: ${displayedData.length}`
                    : activeTab === "verification"
                    ? "Verification Patients"
                    : "Approved Patients for Print"}
                  <span className="ms-3">|</span>
                  <span className="ms-3">Date Range: {fromDate} to {toDate}</span>
                </small>
              </Col>
            </Row>
          </Card.Footer>
        </Card>
      </Container>
    </React.Fragment>
  );
}

export default GeneralSummary;
