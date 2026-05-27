import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  Button,
  Table,
  Badge,
  Alert,
  Spinner,
  ButtonGroup,
  Nav,
  Collapse,
  ProgressBar,
  Popover,
  Overlay,
  OverlayTrigger,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { routerPathNames } from "../../../../routes/routerPathNames";
import SearchInput from "../../../../components/SearchInput";
import { useTableSearch } from "../../../../hooks/useTableSearch";
import { LaboratoryApiService } from "../../../../api/laboratory/laboratory-api-service";
import { handleError } from "../../../../utils/errorUtil";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Check } from "react-bootstrap-icons";
import { InputGroup, Form } from "react-bootstrap";
import {
  faFlask,
  faKeyboard,
  faCheckDouble,
  faPrint,
  faVial,
  faChevronDown,
  faChevronUp,
  faFilter,
  faInfoCircle,
  faCheckCircle,
  faTimesCircle,
  faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";

// Import child components
import SpecimenReceipt from "./components/SpecimenReceipt";
import EnterResults from "./components/EnterResults";
import ResultVerification from "./components/ResultVerification";
import PrintResults from "./components/PrintResults";
import Print from "./components/Print";
import CulturePrint from "./components/CulturePrint";
import EditTestResult from "./components/EditTestResult";

// Import shared types
import type {
  BilledTest,
  PatientWithTests,
  WorkflowStage,
  ActiveView,
  DateGroup,
} from "./types";
import PageHeader from "../../../../components/PageHeader";
import { RootState } from "../../../../state/store";
import {
  extractHeaderAndMenuIds,
  laboratoryMenuConfig,
  labWorkflowButtonAccessCodes,
  LabWorkflowActionKey,
} from "../../../config/menu.config";

const LabWorkflow: React.FC = () => {
  const themePrimary = "var(--page-primary-color)";
  const themeSecondary = "var(--page-secondary-color)";
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { moduleDetails } = useSelector((state: RootState) => state.appReducer);
  const laboratoryApiService = new LaboratoryApiService();

  const [patients, setPatients] = useState<PatientWithTests[]>([]);
  const [loading, setLoading] = useState(false);
  const [customInput, setCustomInput] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<WorkflowStage>("all");
  const [collapsedDates, setCollapsedDates] = useState<Set<string>>(new Set());
  const [activeView, setActiveView] = useState<ActiveView>("list");
  const [selectedPatient, setSelectedPatient] = useState<PatientWithTests | null>(null);
  const [selectedEditTest, setSelectedEditTest] = useState<BilledTest | null>(null);
  const [activeStatusPopoverKey, setActiveStatusPopoverKey] = useState<string | null>(null);
  const [printSelection, setPrintSelection] = useState<{
    patient: PatientWithTests;
    tests: BilledTest[];
  } | null>(null);
  const statusBadgeRefs = React.useRef<Record<string, HTMLSpanElement | null>>({});

  const {
    filteredData: filteredPatients,
    searchTerm,
    setSearchTerm,
    resultCount,
    totalCount,
  } = useTableSearch({
    data: patients,
    searchFields: ["name", "phoneNumber", "opNumber"],
  });

  const labMenuIdSet = useMemo(() => {
    const modData = moduleDetails.find(
      (mod) => mod.modId === laboratoryMenuConfig.moduleId
    );
    if (!modData) return new Set<number>();
    const { menuIds } = extractHeaderAndMenuIds(modData);
    return new Set(menuIds);
  }, [moduleDetails]);

  const hasWorkflowButtonAccess = (stage: LabWorkflowActionKey): boolean => {
    const requiredIds = labWorkflowButtonAccessCodes[stage];
    if (!Array.isArray(requiredIds) || requiredIds.length === 0) return true;
    return requiredIds.some((id) => labMenuIdSet.has(id));
  };

  useEffect(() => {
    fetchPatientsWithBilledTests(null);
  }, []);

  const fetchPatientsWithBilledTests = async (opno: string | null = null) => {
    setLoading(true);
    try {
      const data: any[] = await laboratoryApiService.fetchAllLabTestSpecimen(opno);

      // Map API response to PatientWithTests[]
      const mapped: PatientWithTests[] = Array.isArray(data)
        ? data.map((p: any) => ({
            uhid: p.patId ? String(p.patId) : p.opNumber || "",
            opNumber: p.opNumber || "",
            name: p.name || "",
            age: p.age || 0,
            gender: p.gender || "",
            phoneNumber: p.phoneNumber ? String(p.phoneNumber) : "",
            visitId: p.visitId || 0,
            patId: p.patId || 0,
            billNumber: p.billNumber || 0,
            billTime: p.billTime || "",
            userName: p.userName || "",
            billNo: p.billNo || "",
            billDate: p.billDate || "",
            total: p.total ?? 0,
            paid: p.paid ?? 0,
            isIp: p.isIp ?? 0,
            docName: p.docName || "",
            note: p.note || "",
            tests: Array.isArray(p.tests)
              ? p.tests.map((t: any) => ({
                  testRegId: t.testRegId || 0,
                  testId: t.testId ?? 0,
                  testName: t.testName || "",
                  isCulture: t.isCulture ?? 0,
                  specimen: t.specimenName || "",
                  specimenName: t.specimenName || "",
                  specimenReceived:
                    t.specimenReceived === 1 || t.specimenReceived === true,
                  resultEntered:
                    t.resultEntered === 1 || t.resultEntered === true,
                  resultVerified:
                    t.resultVerified === 1 || t.resultVerified === true,
                  resultPrinted:
                    t.resultPrinted === 1 || t.resultPrinted === true,
                  deptName: t.deptName || "",
                  rate: t.rate || 0,
                }))
              : [],
          }))
        : [];

      setPatients(mapped);
    } catch (error) {
      console.error("Error fetching patients:", error);
      handleError(dispatch, error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToSpecimenReceipt = (patient: PatientWithTests) => {
    setSelectedPatient(patient);
    setActiveView("specimenReceipt");
  };

  const navigateToEnterResults = (patient: PatientWithTests) => {
    setSelectedPatient(patient);
    setActiveView("enterResults");
  };

  const navigateToVerifyResults = (patient: PatientWithTests) => {
    setSelectedPatient(patient);
    setActiveView("verifyResults");
  };

  const navigateToPrintResults = (patient: PatientWithTests) => {
    setSelectedPatient(patient);
    setActiveView("printResults");
  };

  const navigateToEditTest = (test: BilledTest) => {
    setSelectedEditTest(test);
    setActiveView("editTestResult");
  };

  const handleBackToList = () => {
    setActiveView("list");
    setSelectedPatient(null);
    setSelectedEditTest(null);
    setPrintSelection(null);
    // Refresh patient list after completing workflow step
    fetchPatientsWithBilledTests(null);
  };  

  const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleCustomSubmit();
      }
    };

  const handleCustomSubmit = async () => {
    try {
      const payload = customInput.trim() === "" ? null : customInput;
      // Clear search term and reset filter to show all results from custom query
      setSearchTerm("");
      setActiveFilter("all");
      await fetchPatientsWithBilledTests(payload);
    } catch (err) {
      handleError(dispatch, err);
    }
  };

  // Group by bill date (date-wise, then bill-wise)
  const dateGroups = useMemo((): DateGroup[] => {
    // Group patients by billDate
    const groups: { [date: string]: PatientWithTests[] } = {};
    
    filteredPatients.forEach((patient) => {
      const billDate = patient.billDate || "";
      if (!groups[billDate]) {
        groups[billDate] = [];
      }
      groups[billDate].push(patient);
    });

    // Convert to array and sort by date (newest first)
    return Object.entries(groups)
      .map(([date, patients]) => ({ date, patients }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [filteredPatients]);

  // Filter patients by workflow stage
  const filterByStage = (patient: PatientWithTests): boolean => {
    if (activeFilter === "all") return true;

    switch (activeFilter) {
      case "specimen":
        return patient.tests.some((t) => !t.specimenReceived);
      case "result":
        return patient.tests.some(
          (t) => t.specimenReceived && !t.resultEntered
        );
      case "verify":
        return patient.tests.some((t) => t.resultEntered && !t.resultVerified);
      case "print":
        return patient.tests.some((t) => t.resultVerified && !t.resultPrinted);
      default:
        return true;
    }
  };

  // Apply stage filter to date groups
  const filteredDateGroups = useMemo(() => {
    return dateGroups
      .map((group) => ({
        ...group,
        patients: group.patients.filter(filterByStage),
      }))
      .filter((group) => group.patients.length > 0);
  }, [dateGroups, activeFilter]);

  const toggleDateCollapse = (date: string) => {
    setCollapsedDates((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(date)) {
        newSet.delete(date);
      } else {
        newSet.add(date);
      }
      return newSet;
    });
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Get workflow stage for a patient
  const getPatientWorkflowStage = (
    patient: PatientWithTests
  ): WorkflowStage => {
    const allPrinted = patient.tests.every((t) => t.resultPrinted);
    if (allPrinted) return "print";

    const allVerified = patient.tests.every((t) => t.resultVerified);
    if (allVerified) return "print";

    const allResultEntered = patient.tests.every((t) => t.resultEntered);
    if (allResultEntered) return "verify";

    const allSpecimenReceived = patient.tests.every((t) => t.specimenReceived);
    if (allSpecimenReceived) return "result";

    return "specimen";
  };

  // Group tests by workflow stage
  const getTestsByStage = (patient: PatientWithTests) => {
    return {
      specimen: patient.tests.filter((t) => !t.specimenReceived),
      result: patient.tests.filter((t) => t.specimenReceived && !t.resultEntered),
      verify: patient.tests.filter((t) => t.resultEntered && !t.resultVerified),
      print: patient.tests.filter((t) => t.resultVerified && !t.resultPrinted),
    };
  };

  // Get actions for all workflow stages with pending tests
  const getActionsForPatient = (patient: PatientWithTests) => {
    const testsByStage = getTestsByStage(patient);
    const actions: any[] = [];

    if (testsByStage.specimen.length > 0 && hasWorkflowButtonAccess("specimen")) {
      actions.push({
        stage: "specimen",
        label: `Spec (${testsByStage.specimen.length})`,
        icon: faFlask,
        buttonClass: "theme-btn-primary",
        tests: testsByStage.specimen,
        onClick: () => navigateToSpecimenReceipt(patient),
      });
    }

    if (testsByStage.result.length > 0 && hasWorkflowButtonAccess("result")) {
      actions.push({
        stage: "result",
        label: `Result (${testsByStage.result.length})`,
        icon: faKeyboard,
        buttonClass: "theme-outline-btn-primary is-selected",
        tests: testsByStage.result,
        onClick: () => navigateToEnterResults(patient),
      });
    }

    if (testsByStage.verify.length > 0 && hasWorkflowButtonAccess("verify")) {
      actions.push({
        stage: "verify",
        label: `Verif (${testsByStage.verify.length})`,
        icon: faCheckDouble,
        buttonClass: "theme-btn-primary",
        tests: testsByStage.verify,
        onClick: () => navigateToVerifyResults(patient),
      });
    }

    if (testsByStage.print.length > 0 && hasWorkflowButtonAccess("print")) {
      actions.push({
        stage: "print",
        label: `Print (${testsByStage.print.length})`,
        icon: faPrint,
        buttonClass: "theme-outline-btn-primary is-selected",
        tests: testsByStage.print,
        onClick: () => navigateToPrintResults(patient),
      });
    }

    return actions;
  };

  // Get stage status icon
  const getStageIcon = (completed: boolean, pending: boolean) => {
    if (completed) {
      return <FontAwesomeIcon icon={faCheckCircle} className="text-success" />;
    } else if (pending) {
      return (
        <FontAwesomeIcon icon={faExclamationCircle} className="text-warning" />
      );
    } else {
      return <FontAwesomeIcon icon={faTimesCircle} className="text-muted" />;
    }
  };

  // Render test status popover
  const renderTestStatusPopover = (patient: PatientWithTests, popoverProps: any = {}) => (
    <Popover
      {...popoverProps}
      id={`popover-${patient.uhid}`}
      style={{
        ...(popoverProps.style || {}),
        maxWidth: "400px",
        width: "min(400px, calc(100vw - 2rem))",
      }}
    >
      <Popover.Header as="h5">Test Status - {patient.name}</Popover.Header>
      <Popover.Body
        style={{ maxHeight: "300px", overflowY: "auto", overflowX: "auto" }}
      >
        <Table hover size="sm" style={{ marginBottom: 0 }}>
          <thead>
            <tr>
              <th>Test Name</th>
              <th className="text-center" style={{ width: "80px" }}>Specimen</th>
              <th className="text-center" style={{ width: "80px" }}>Result</th>
              <th className="text-center" style={{ width: "80px" }}>Verify</th>
              <th className="text-center" style={{ width: "80px" }}>Print</th>
            </tr>
          </thead>
          <tbody>
            {patient.tests.map((test) => (
              <tr key={test.testId}>
                <td style={{ fontSize: "13px" }}>
                  <strong>{test.testName}</strong>
                </td>
                <td className="text-center">
                  {getStageIcon(test.specimenReceived, test.specimenReceived)}
                </td>
                <td className="text-center">
                  {getStageIcon(test.resultEntered, test.resultEntered)}
                </td>
                <td className="text-center">
                  {getStageIcon(test.resultVerified, test.resultVerified)}
                </td>
                <td className="text-center">
                  {getStageIcon(test.resultPrinted, test.resultPrinted)}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Popover.Body>
    </Popover>
  );

  // Render active component
  if (activeView === "specimenReceipt" && selectedPatient) {
    return <SpecimenReceipt patient={selectedPatient} onBack={handleBackToList} />;
  }

  if (activeView === "enterResults" && selectedPatient) {
    return <EnterResults patient={selectedPatient} onBack={handleBackToList} />;
  }

  if (activeView === "verifyResults" && selectedPatient) {
    return <ResultVerification patient={selectedPatient} onBack={handleBackToList} onEditTest={navigateToEditTest} />;
  }

  if (activeView === "editTestResult" && selectedPatient && selectedEditTest) {
    return (
      <EditTestResult
        patient={selectedPatient}
        test={selectedEditTest}
        onBack={handleBackToList}
        onSave={handleBackToList}
      />
    );
  }

  if (activeView === "printResults" && selectedPatient) {
    return (
      <PrintResults
        patient={selectedPatient}
        onBack={handleBackToList}
        onProceedToPrint={(tests) => {
          setPrintSelection({ patient: selectedPatient, tests });
          setActiveView("printPreview");
        }}
      />
    );
  }

  if (activeView === "printPreview" && printSelection) {
    // Determine if tests are culture or regular based on the first test
    const isCultureTests = printSelection.tests.length > 0 && printSelection.tests[0].isCulture === 1;
    
    if (isCultureTests) {
      return (
        <CulturePrint
          patient={printSelection.patient}
          tests={printSelection.tests}
          finalBillId={Number(printSelection.patient.billNo)}
          onBack={handleBackToList}
        />
      );
    } else {
      return (
        <Print
          patient={printSelection.patient}
          tests={printSelection.tests}
          finalBillId={Number(printSelection.patient.billNo)}
          onBack={handleBackToList}
        />
      );
    }
  }

  // Default: Show patient list
  return (
    <div
      className="lab-workflow-container"
      style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", minHeight: 0 }}
    >
      {/* Header */}
        <PageHeader icon={faVial} title="Laboratory Workflow Management" subtitle="" /> 

      {/* Content Body */}
      <div
        className="content-body"
        style={{
          flex: 1,
          minHeight: 0,
          padding: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          overflow: "hidden",
        }}
      >
        {/* Filter Tabs */}
        <Card className="shadow-sm" style={{ flexShrink: 0 }}>
          <Card.Body className="p-3">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <SearchInput
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  placeholder="Search by OP Number, Name, or Phone Number..."
                  resultCount={resultCount}
                  totalCount={totalCount}
                />
              </div>
              <div style={{ minWidth: 0 }}>
                <InputGroup style={{ maxWidth: "500px" }}>
                  <Form.Control
                    type="text"
                    placeholder="Enter OP Number"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <InputGroup.Text
                    onClick={handleCustomSubmit}
                    title="Submit"
                    className="theme-btn-primary"
                    style={{
                      cursor: "pointer",
                    }}
                  >
                    <Check size={18} />
                  </InputGroup.Text>
                </InputGroup>
              </div>
              <OverlayTrigger
                trigger="click"
                rootClose
                placement="left"
                container={document.body}
                popperConfig={{ strategy: "fixed" }}
                overlay={
                  <Popover id="workflow-status-info">
                    {/* <Popover.Header as="h6">Workflow Status</Popover.Header> */}
                    <Popover.Body>
                      <div className="d-flex flex-column gap-2">
                        <small>
                          <FontAwesomeIcon icon={faCheckCircle} className="text-success me-2" />
                          Completed
                        </small>
                        <small>
                          <FontAwesomeIcon
                            icon={faExclamationCircle}
                            className="text-warning me-2"
                          />
                          In Progress
                        </small>
                        <small>
                          <FontAwesomeIcon icon={faTimesCircle} className="text-muted me-2" />
                          Pending
                        </small>
                        <small>
                          <span
                            className="d-inline-block me-2"
                            style={{
                              width: "10px",
                              height: "10px",
                              borderRadius: "50%",
                              backgroundColor: "#FFD700",
                            }}
                          />
                          IP Patient
                        </small>
                        <small>
                          <span
                            className="d-inline-block me-2"
                            style={{
                              width: "10px",
                              height: "10px",
                              borderRadius: "50%",
                              backgroundColor: "#FF4444",
                            }}
                          />
                          Not Billed
                        </small>
                        <small>
                          <span
                            className="d-inline-block me-2"
                            style={{
                              width: "10px",
                              height: "10px",
                              borderRadius: "50%",
                              backgroundColor: "#28A745",
                            }}
                          />
                          Billed
                        </small>
                      </div>
                    </Popover.Body>
                  </Popover>
                }
              >
                <span
                  role="button"
                  tabIndex={0}
                  title="Workflow status info"
                  className="d-inline-flex align-items-center justify-content-center theme-btn-primary"
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    cursor: "pointer",
                  }}
                >
                  <FontAwesomeIcon icon={faInfoCircle} />
                </span>
              </OverlayTrigger>
            </div>
            <Nav variant="pills" activeKey={activeFilter} className="mb-0">
              <Nav.Item>
                <Nav.Link
                  eventKey="all"
                  onClick={() => setActiveFilter("all")}
                  className={`theme-outline-btn-primary ${
                    activeFilter === "all" ? "is-selected" : ""
                  }`}
                  style={{
                    cursor: "pointer",
                  }}
                >
                  All Patients
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  eventKey="specimen"
                  onClick={() => setActiveFilter("specimen")}
                  disabled={!hasWorkflowButtonAccess("specimen")}
                  className={`theme-outline-btn-primary ${
                    activeFilter === "specimen" ? "is-selected" : ""
                  }`}
                  style={{
                    cursor: "pointer",
                  }}
                >
                  <FontAwesomeIcon icon={faFlask} className="me-2" />
                  Specimen Pending
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  eventKey="result"
                  onClick={() => setActiveFilter("result")}
                  disabled={!hasWorkflowButtonAccess("result")}
                  className={`theme-outline-btn-primary ${
                    activeFilter === "result" ? "is-selected" : ""
                  }`}
                  style={{
                    cursor: "pointer",
                  }}
                >
                  <FontAwesomeIcon icon={faKeyboard} className="me-2" />
                  Results Pending
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  eventKey="verify"
                  onClick={() => setActiveFilter("verify")}
                  disabled={!hasWorkflowButtonAccess("verify")}
                  className={`theme-outline-btn-primary ${
                    activeFilter === "verify" ? "is-selected" : ""
                  }`}
                  style={{
                    cursor: "pointer",
                  }}
                >
                  <FontAwesomeIcon icon={faCheckDouble} className="me-2" />
                  Verification Pending
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  eventKey="print"
                  onClick={() => setActiveFilter("print")}
                  disabled={!hasWorkflowButtonAccess("print")}
                  className={`theme-outline-btn-primary ${
                    activeFilter === "print" ? "is-selected" : ""
                  }`}
                  style={{
                    cursor: "pointer",
                  }}
                >
                  <FontAwesomeIcon icon={faPrint} className="me-2" />
                  Print Pending
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Body>
        </Card>

        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            scrollbarGutter: "stable",
          }}
        >
          {loading ? (
            <Card className="shadow-sm">
              <Card.Body>
                <div className="text-center py-5">
                  <Spinner animation="border" style={{ color: themePrimary }} />
                  <p className="mt-3 text-muted">Loading patients...</p>
                </div>
              </Card.Body>
            </Card>
          ) : filteredDateGroups.length === 0 ? (
            <Card className="shadow-sm">
              <Card.Body>
                <div className="text-center py-4">
                  <FontAwesomeIcon
                    icon={faVial}
                    size="3x"
                    className="text-muted mb-3"
                  />
                  <p className="text-muted">
                    {searchTerm || activeFilter !== "all"
                      ? "No patients match your filters."
                      : "No patients with pending lab tests."}
                  </p>
                </div>
              </Card.Body>
            </Card>
          ) : (
            <>
              {/* Date-wise Patient Groups */}
              {filteredDateGroups.map((group) => (
                <Card key={group.date} className="shadow-sm mb-3">
                  <Card.Header
                    style={{
                      backgroundColor: themePrimary,
                      color: themeSecondary,
                      cursor: "pointer",
                    }}
                    onClick={() => toggleDateCollapse(group.date)}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="mb-0" style={{ fontWeight: "600" }}>
                        <FontAwesomeIcon
                          icon={
                            collapsedDates.has(group.date)
                              ? faChevronDown
                              : faChevronUp
                          }
                          className="me-2"
                        />
                        Date: {formatDate(group.date)}
                      </h5>
                      <span
                        className="badge rounded-pill theme-badge-secondary"
                      >
                        {group.patients.length} Patient
                        {group.patients.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </Card.Header>
                  <Collapse in={!collapsedDates.has(group.date)}>
                    <div>
                      <Card.Body className="p-0">
                        <div style={{ overflowX: "auto" }}>
                          <Table striped hover className="mb-0" size="sm">
                            <thead >
                              <tr>
                                <th style={{ width: "50px" }}>#</th>
                                <th>OP No.</th>
                                <th>Patient Details</th>
                                <th>Bill No</th>
                                <th>Bill Time</th>
                                <th>Billed User</th>
                                <th>Workflow Status</th>
                                <th style={{ width: "250px" }}>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {group.patients.map((patient, index) => {
                                return (
                                  <tr key={`${patient.uhid}-${patient.billNumber}-${patient.billDate}`}>
                                    <td>{index + 1}</td>
                                    <td style={{ backgroundColor: patient.isIp === 1 ? "#FFD700" : "transparent", fontWeight: patient.isIp === 1 ? "600" : "normal" }}>
                                      {patient.opNumber}
                                    </td>
                                    <td>
                                      <div>
                                        <strong>{patient.name}</strong>
                                        <br />
                                        {/* <small 
                                          className="text-muted"
                                          style={{ fontSize: "0.75rem" }}
                                        >
                                          {patient.age} / {patient.gender}
                                        </small> */}
                                      </div>
                                    </td>
                                    <td style={{ 
                                      backgroundColor: patient.paid === 0 ? "#FF4444" : "#28A745",
                                      color: "white",
                                      fontWeight: "600",
                                      borderRadius: "4px",
                                      textAlign: "center"
                                    }}>
                                      {patient.billNumber}
                                    </td>
                                    <td>{patient.billTime}</td>
                                    <td>{patient.userName}</td>
                                    <td>
                                      {(() => {
                                        const statusKey = `${patient.uhid}-${patient.billNumber}-${patient.billDate}`;
                                        return (
                                          <>
                                            <span
                                              ref={(el) => {
                                                statusBadgeRefs.current[statusKey] = el;
                                              }}
                                              className="badge theme-badge-primary d-inline-flex align-items-center gap-2 px-3 py-2"
                                              style={{
                                                cursor: "pointer",
                                                fontSize: "13px",
                                              }}
                                              onClick={() =>
                                                setActiveStatusPopoverKey((prev) =>
                                                  prev === statusKey ? null : statusKey
                                                )
                                              }
                                            >
                                              <Check size={14} />
                                              Status
                                            </span>
                                            <Overlay
                                              target={statusBadgeRefs.current[statusKey]}
                                              show={activeStatusPopoverKey === statusKey}
                                              placement="left"
                                              container={document.body}
                                              rootClose
                                              onHide={() => setActiveStatusPopoverKey(null)}
                                              popperConfig={{ strategy: "fixed" }}
                                            >
                                              {(overlayProps) =>
                                                renderTestStatusPopover(patient, overlayProps)
                                              }
                                            </Overlay>
                                          </>
                                        );
                                      })()}
                                    </td>
                                    <td>
                                      <div className="d-flex gap-2 flex-wrap">
                                        {getActionsForPatient(patient).map((action, idx) => (
                                          <Button
                                            key={idx}
                                            size="sm"
                                            onClick={action.onClick}
                                            title={action.stage.charAt(0).toUpperCase() + action.stage.slice(1)}
                                            className={`${action.buttonClass} d-inline-flex align-items-center gap-1`}
                                            style={{
                                              fontWeight: "600",
                                            }}
                                          >
                                            <FontAwesomeIcon
                                              icon={action.icon}
                                              size="sm"
                                            />
                                            {action.label && <span>{action.label}</span>}
                                          </Button>
                                        ))}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </Table>
                        </div>
                      </Card.Body>
                    </div>
                  </Collapse>
                </Card>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LabWorkflow;
