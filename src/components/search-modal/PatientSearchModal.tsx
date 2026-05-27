import React, { useRef, useState, useEffect } from "react";
import {
  Modal,
  Row,
  Col,
  Form,
  Button,
  Table,
  Spinner,
  InputGroup,
  Tabs,
  Tab,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faUser, faPhone, faUserFriends, faEraser, faBed } from "@fortawesome/free-solid-svg-icons";
import {
  showWarningModal,
  showInfoModal,
  showErrorModal,
} from "../../utils/alertUtil";
import { MedicalRecordsApiService } from "../../api/medical-records/medical-records-api-service";

export interface Patient {
  displayNumber: string;
  firstName: string;
  secondName: string;
  phoneNumber: string;
}

interface ActiveIpPatient {
  ipId: number;
  patId: number;
  opVisitId: number;
  ipNo: string;
  opNo: string;
  patientName: string;
  age: string;
  gender: string;
  admittedWard: string;
  roomBed: string;
  address: string;
  mobileNumber: string;
  departmentId: number;
  departmentName: string | null;
  admittedDocId: number;
  admittedDoctorName: string;
  dischargeSummaryExists: number;
  dischargeSummaryVerified: number;
  maternityDisSummaryExists: number;
  maternityDisSummaryVerified: number;
  currentRoomId: number;
  ipVisitDetailId: number;
  admitDate: string;
}

interface PatientSearchModalProps {
  show: boolean;
  onHide: () => void;
  onPatientSelect: (patient: Patient) => void;
}

const PatientSearchModal: React.FC<PatientSearchModalProps> = ({
  show,
  onHide,
  onPatientSelect,
}) => {
  const [activeTab, setActiveTab] = useState<string>("search");
  const [searchPatientName, setSearchPatientName] = useState<string>("");
  const [searchGuardianName, setSearchGuardianName] = useState<string>("");
  const [searchPhoneNumber, setSearchPhoneNumber] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [activeIpPatients, setActiveIpPatients] = useState<Patient[]>([]);
  const [ipFilterText, setIpFilterText] = useState<string>("");
  const [isLoadingIpPatients, setIsLoadingIpPatients] = useState<boolean>(false);
  const patientNameInputRef = useRef<HTMLInputElement>(null);

  // Initialize API service
  const apiService = new MedicalRecordsApiService();

  // Filter active IP patients based on filter text
  const filteredIpPatients = activeIpPatients.filter((patient) => {
    if (!ipFilterText.trim()) return true;
    const searchText = ipFilterText.toLowerCase();
    return (
      patient.displayNumber.toLowerCase().includes(searchText) ||
      patient.firstName.toLowerCase().includes(searchText) ||
      patient.phoneNumber.toLowerCase().includes(searchText)
    );
  });

  // Fetch active IP patients when modal is shown and active IP tab is selected
  useEffect(() => {
    if (show && activeTab === "activeIp") {
      fetchActiveIpPatients();
    }
  }, [show, activeTab]);

  const fetchActiveIpPatients = async () => {
    setIsLoadingIpPatients(true);
    try {
      const results: ActiveIpPatient[] = await apiService.fetchActiveIpPatients();
      
      // Transform the API response to match Patient interface
      const transformedResults: Patient[] = (results || []).map((ipPatient) => ({
        displayNumber: ipPatient.opNo,
        firstName: ipPatient.patientName.trim(),
        secondName: '', // Active IP API returns full name in one field
        phoneNumber: ipPatient.mobileNumber || '',
      }));
      
      setActiveIpPatients(transformedResults);
    } catch (error: any) {
      console.error("Error fetching active IP patients:", error);
      showErrorModal(
        "Failed to load active IP patients. Please try again.",
        "Load Error"
      );
      setActiveIpPatients([]);
    } finally {
      setIsLoadingIpPatients(false);
    }
  };

  const searchPatients = async () => {
    if (
      !searchPatientName.trim() &&
      !searchGuardianName.trim() &&
      !searchPhoneNumber.trim()
    ) {
      showWarningModal(
        "Please enter at least one search criteria (Patient Name, Guardian Name, or Phone Number).",
        "Search Criteria Required"
      );
      return;
    }

    setIsSearching(true);
    try {
      // Build search criteria with only non-empty values
      const searchCriteria: {
        patName?: string;
        gName?: string;
        phone?: string;
      } = {};
      
      if (searchPatientName.trim()) {
        searchCriteria.patName = searchPatientName.trim();
      }
      if (searchGuardianName.trim()) {
        searchCriteria.gName = searchGuardianName.trim();
      }
      if (searchPhoneNumber.trim()) {
        searchCriteria.phone = searchPhoneNumber.trim();
      }

      const results = await apiService.searchPatients(searchCriteria);
      setSearchResults(results || []);

      if (!results || results.length === 0) {
        showInfoModal(
          "No patients found matching the search criteria.",
          "No Results Found"
        );
      }
    } catch (error: any) {
      console.error("Error searching patients:", error);
      showErrorModal(
        "Failed to search patients. Please try again.",
        "Search Error"
      );
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePatientSelect = (patient: Patient) => {
    // Clear search form
    setSearchPatientName("");
    setSearchGuardianName("");
    setSearchPhoneNumber("");
    setSearchResults([]);

    // Close modal and call parent handler
    onHide();
    onPatientSelect(patient);
  };

  const handleModalHide = () => {
    // Clear search form when modal is closed
    setSearchPatientName("");
    setSearchGuardianName("");
    setSearchPhoneNumber("");
    setSearchResults([]);
    setActiveIpPatients([]);
    setIpFilterText("");
    setActiveTab("search");
    onHide();
  };

  const handleClear = () => {
    setSearchPatientName("");
    setSearchGuardianName("");
    setSearchPhoneNumber("");
    setSearchResults([]);
    setTimeout(() => patientNameInputRef.current?.focus(), 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      searchPatients();
    }
  };

  return (
    <Modal
      show={show}
      onHide={handleModalHide}
      size="lg"
      centered
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton className="border-bottom-0 pb-0">
        <Modal.Title className="h5 fw-bold d-flex align-items-center gap-2 text-primary">
          <FontAwesomeIcon icon={faSearch} /> Patient Search
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-2">
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k || "search")}
          className="mb-3"
        >
          <Tab eventKey="search" title={
            <span>
              <FontAwesomeIcon icon={faSearch} className="me-2" />
              Search Patients
            </span>
          }>
            <div className="bg-light p-3 rounded-4 mb-3 border shadow-sm">
              <Row className="g-3">
                <Col md={3}>
                  <Form.Label className="small fw-semibold text-muted mb-1">Patient Name</Form.Label>
                  <InputGroup size="sm">
                    <InputGroup.Text className="bg-white text-muted">
                      <FontAwesomeIcon icon={faUser} />
                    </InputGroup.Text>
                    <Form.Control
                      ref={patientNameInputRef}
                      placeholder="Enter Name"
                      value={searchPatientName}
                      onChange={(e) => setSearchPatientName(e.target.value)}
                      onKeyDown={handleKeyDown}
                      autoFocus
                      className="border-start-0 ps-0"
                    />
                  </InputGroup>
                </Col>
                <Col md={3}>
                  <Form.Label className="small fw-semibold text-muted mb-1">Guardian Name</Form.Label>
                  <InputGroup size="sm">
                    <InputGroup.Text className="bg-white text-muted">
                      <FontAwesomeIcon icon={faUserFriends} />
                    </InputGroup.Text>
                    <Form.Control
                      placeholder="Enter Guardian"
                      value={searchGuardianName}
                      onChange={(e) => setSearchGuardianName(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="border-start-0 ps-0"
                    />
                  </InputGroup>
                </Col>
                <Col md={3}>
                  <Form.Label className="small fw-semibold text-muted mb-1">Phone Number</Form.Label>
                  <InputGroup size="sm">
                    <InputGroup.Text className="bg-white text-muted">
                      <FontAwesomeIcon icon={faPhone} />
                    </InputGroup.Text>
                    <Form.Control
                      placeholder="Enter Phone"
                      value={searchPhoneNumber}
                      onChange={(e) => setSearchPhoneNumber(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="border-start-0 ps-0"
                    />
                  </InputGroup>
                </Col>
                <Col md={3} className="d-flex align-items-end">
                    <Button
                        variant="light"
                        size="sm"
                        onClick={handleClear}
                        disabled={isSearching || (!searchPatientName && !searchGuardianName && !searchPhoneNumber && searchResults.length === 0)}
                        className="px-3"
                    >
                        <FontAwesomeIcon icon={faEraser} className="me-2" />
                        Clear
                    </Button>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={searchPatients}
                        disabled={isSearching}
                        className="px-4 shadow-sm"
                    >
                        {isSearching ? (
                            <>
                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                            Searching...
                            </>
                        ) : (
                            <>
                            <FontAwesomeIcon icon={faSearch} className="me-2" />
                            Search
                            </>
                        )}
                    </Button>
                </Col>
              </Row>
            </div>

            {isSearching ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="text-muted mt-2 small fw-medium">Searching for patients...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="table-responsive border rounded-3 shadow-sm" style={{ maxHeight: "350px" }}>
                <Table hover className="align-middle mb-0">
                  <thead className="bg-light sticky-top shadow-sm" style={{ zIndex: 1 }}>
                    <tr>
                      <th className="small text-muted border-0 py-3 ps-3">OP No</th>
                      <th className="small text-muted border-0 py-3">Patient Name</th>
                      <th className="small text-muted border-0 py-3">Phone</th>
                      <th className="small text-muted border-0 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.map((p, i) => (
                      <tr key={i} className="bg-white">
                        <td className="fw-bold ps-3" style={{ color: 'var(--page-secondary-color)' }}>
                          {p.displayNumber}
                        </td>
                        <td className="fw-medium text-dark">
                          {p.firstName} {p.secondName}
                        </td>
                        <td>
                          <span className="badge bg-light text-dark border fw-normal">
                            <FontAwesomeIcon icon={faPhone} className="text-muted me-1 small" />
                            {p.phoneNumber || 'N/A'}
                          </span>
                        </td>
                        <td className="text-center">
                          <Button
                            size="sm"
                            variant="soft-primary"
                            className="rounded-pill px-3"
                            onClick={() => handlePatientSelect(p)}
                            style={{ backgroundColor: 'var(--page-secondary-color)', color: 'var(--page-primary-color)', border: 'none' }}
                          >
                            Select
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-5 bg-white border rounded-3 mb-2">
                <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                  <FontAwesomeIcon
                    icon={faSearch}
                    size="lg"
                    className="text-muted opacity-50"
                  />
                </div>
                <h6 className="fw-bold text-dark mb-1">No patients found</h6>
                <p className="small text-muted mb-0">
                  Enter search criteria above and click search
                </p>
              </div>
            )}
          </Tab>

          <Tab eventKey="activeIp" title={
            <span>
              <FontAwesomeIcon icon={faBed} className="me-2" />
              Active IP Patients
            </span>
          }>
            {isLoadingIpPatients ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="text-muted mt-2 small fw-medium">Loading active IP patients...</p>
              </div>
            ) : activeIpPatients.length > 0 ? (
              <>
                {/* Filter Input */}
                <div className="bg-light p-3 rounded-4 mb-3 border shadow-sm">
                  <Row>
                    <Col md={12}>
                      <Form.Label className="small fw-semibold text-muted mb-1">
                        Filter Patients
                      </Form.Label>
                      <InputGroup size="sm">
                        <InputGroup.Text className="bg-white text-muted">
                          <FontAwesomeIcon icon={faSearch} />
                        </InputGroup.Text>
                        <Form.Control
                          placeholder="Search by OP No, Name, or Phone..."
                          value={ipFilterText}
                          onChange={(e) => setIpFilterText(e.target.value)}
                          className="border-start-0 ps-0"
                        />
                        {ipFilterText && (
                          <Button
                            variant="light"
                            size="sm"
                            onClick={() => setIpFilterText("")}
                            className="border"
                          >
                            <FontAwesomeIcon icon={faEraser} />
                          </Button>
                        )}
                      </InputGroup>
                      {ipFilterText && (
                        <small className="text-muted d-block mt-1">
                          Showing {filteredIpPatients.length} of {activeIpPatients.length} patients
                        </small>
                      )}
                    </Col>
                  </Row>
                </div>

                {/* Patient Table */}
                {filteredIpPatients.length > 0 ? (
                  <div className="table-responsive border rounded-3 shadow-sm" style={{ maxHeight: "400px" }}>
                    <Table hover className="align-middle mb-0">
                      <thead className="bg-light sticky-top shadow-sm" style={{ zIndex: 1 }}>
                        <tr>
                          <th className="small text-muted border-0 py-3 ps-3">OP No</th>
                          <th className="small text-muted border-0 py-3">Patient Name</th>
                          <th className="small text-muted border-0 py-3">Phone</th>
                          <th className="small text-muted border-0 py-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredIpPatients.map((p, i) => (
                          <tr key={i} className="bg-white">
                            <td className="fw-bold ps-3" style={{ color: 'var(--page-secondary-color)' }}>
                              {p.displayNumber}
                            </td>
                            <td className="fw-medium text-dark">
                              {p.firstName} {p.secondName}
                            </td>
                            <td>
                              <span className="badge bg-light text-dark border fw-normal">
                                <FontAwesomeIcon icon={faPhone} className="text-muted me-1 small" />
                                {p.phoneNumber || 'N/A'}
                              </span>
                            </td>
                            <td className="text-center">
                              <Button
                                size="sm"
                                variant="soft-primary"
                                className="rounded-pill px-3"
                                onClick={() => handlePatientSelect(p)}
                                style={{ backgroundColor: 'var(--page-secondary-color)', color: 'var(--page-primary-color)', border: 'none' }}
                              >
                                Select
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-5 bg-white border rounded-3 mb-2">
                    <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                      <FontAwesomeIcon
                        icon={faSearch}
                        size="lg"
                        className="text-muted opacity-50"
                      />
                    </div>
                    <h6 className="fw-bold text-dark mb-1">No matching patients found</h6>
                    <p className="small text-muted mb-0">
                      Try adjusting your filter criteria
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-5 bg-white border rounded-3 mb-2">
                <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                  <FontAwesomeIcon
                    icon={faBed}
                    size="lg"
                    className="text-muted opacity-50"
                  />
                </div>
                <h6 className="fw-bold text-dark mb-1">No active IP patients</h6>
                <p className="small text-muted mb-0">
                  There are currently no active inpatients
                </p>
              </div>
            )}
          </Tab>
        </Tabs>
      </Modal.Body>
    </Modal>
  );
};

export default PatientSearchModal;
