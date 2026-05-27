import React, { useState, useEffect } from "react";
import { Container, Card, Table, Modal, Button, Badge } from "react-bootstrap";
import { useSelector } from "react-redux";
import { RootState } from "../../../state/store";
import { showErrorToast } from "../../../utils/alertUtil";
import { faUserInjured } from "@fortawesome/free-solid-svg-icons";
import PageHeader from "../../../components/PageHeader";
import { MedicalRecordsApiService } from "../../../api/medical-records/medical-records-api-service";
import { CashCounterApiService } from "../../../api/cash-counter/cash-counter-api-service";
import { useTableSearch } from "../../../hooks/useTableSearch";
import SearchInput from "../../../components/SearchInput";

interface ActiveIPPatient {
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
  admissionDateTime: string;
}

interface Charge {
  chargeName: string;
  amount: number;
}

interface Bill {
  billNo: string;
  time: string;
  total: number;
  discount: number;
  payable: number;
  paid: number;
  due: number;
  billType: string;
  username: string;
}

interface StayChargeData {
  date: string;
  wardName: string;
  charges: Charge[];
  bills: Bill[];
}

const ViewChart: React.FC = () => {
  const loginData = useSelector((state: RootState) => state.loginData);
  const [patients, setPatients] = useState<ActiveIPPatient[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<ActiveIPPatient | null>(null);
  const [stayCharges, setStayCharges] = useState<StayChargeData[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const medicalRecordsApi = new MedicalRecordsApiService();
  const cashCounterApi = new CashCounterApiService();

  const {
    filteredData: filteredPatients,
    searchTerm,
    setSearchTerm,
    resultCount,
    totalCount,
  } = useTableSearch({
    data: patients,
    searchFields: ["opNo", "patientName", "ipNo", "admittedWard", "roomBed"],
  });

  useEffect(() => {
    loadActivePatients();
  }, []);

  const loadActivePatients = async () => {
    setLoading(true);
    try {
      const response = await medicalRecordsApi.fetchActiveIpPatients();
      const data = response?.data || response || [];

      const mappedPatients: ActiveIPPatient[] = Array.isArray(data)
        ? data.map((p: any) => ({
            ipId: p.ipId,
            patId: p.patId,
            opVisitId: p.opVisitId,
            ipNo: p.ipNo,
            opNo: p.opNo,
            patientName: p.patientName,
            age: p.age || "-",
            gender: p.gender || "-",
            admittedWard: p.admittedWard || "-",
            roomBed: p.roomBed || "-",
            admissionDateTime: p.admitDate || "-",
          }))
        : [];

      setPatients(mappedPatients);
    } catch (error: any) {
      console.error("Error loading active IP patients:", error);
      showErrorToast(error?.response?.data?.error || "Failed to load patient data");
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = async (patient: ActiveIPPatient) => {
    setSelectedPatient(patient);
    setShowModal(true);
    setModalLoading(true);
    setStayCharges([]);

    try {
      const response = await cashCounterApi.fetchStayChargesByIpId(patient.ipId);
      const data = Array.isArray(response) ? response : [];
      setStayCharges(data);
    } catch (error: any) {
      console.error("Error loading stay charges:", error);
      showErrorToast(error?.response?.data?.error || "Failed to load stay charges");
    } finally {
      setModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPatient(null);
    setStayCharges([]);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", minHeight: 0, overflow: "hidden" }}>
      <PageHeader 
        icon={faUserInjured} 
        title="View Chart Of IP Patients" 
        subtitle="view chart of all active inpatient" 
      />
      
      <div className="content-body" style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "1.5rem" }}>
        <Container fluid>
          <Card className="shadow-sm">
            <Card.Body>
              {/* Search Input */}
              <div className="mb-3">
                <SearchInput
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  placeholder="Search by OP No, Patient Name, IP No, Ward, or Bed..."
                  resultCount={resultCount}
                  totalCount={totalCount}
                  showResultCount={true}
                />
              </div>

              {/* Patients Table */}
              <div style={{ overflowX: "auto" }}>
                <Table striped bordered hover responsive>
                  <thead style={{ backgroundColor: "#f8f9fa", position: "sticky", top: 0, zIndex: 1 }}>
                    <tr>
                      <th>OP No</th>
                      <th>Patient Name</th>
                      <th>Age</th>
                      <th>Gender</th>
                      <th>IP No</th>
                      <th>Ward Name / Room (or) Bed No</th>
                      <th>Admission Date Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="text-center py-4">
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          <p className="mt-2 mb-0">Loading patients...</p>
                        </td>
                      </tr>
                    ) : filteredPatients.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-4">
                          {searchTerm ? (
                            <>
                              <i className="fas fa-search" style={{ fontSize: "2rem", opacity: 0.3 }}></i>
                              <p className="mt-2 mb-0">No patients found matching "{searchTerm}"</p>
                            </>
                          ) : (
                            <>
                              <i className="fas fa-user-injured" style={{ fontSize: "2rem", opacity: 0.3 }}></i>
                              <p className="mt-2 mb-0">No active IP patients</p>
                            </>
                          )}
                        </td>
                      </tr>
                    ) : (
                      filteredPatients.map((patient, index) => (
                        <tr 
                          key={patient.ipId} 
                          onClick={() => handleRowClick(patient)}
                          style={{ cursor: "pointer" }}
                        >
                          <td>{patient.opNo}</td>
                          <td>{patient.patientName}</td>
                          <td>{patient.age}</td>
                          <td>{patient.gender}</td>
                          <td>{patient.ipNo}</td>
                          <td>
                            {patient.admittedWard}
                            {patient.roomBed && (
                              <span style={{ color: "red", fontWeight: "bold" }}>
                                {" / "}
                                {patient.roomBed.split('/').map((part, i) => (
                                  <span key={i}>
                                    {i > 0 && " "}
                                    {part.trim()}
                                  </span>
                                ))}
                              </span>
                            )}
                          </td>
                          <td>{patient.admissionDateTime}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Container>
      </div>

      {/* Stay Charges Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-file-invoice me-2"></i>
            Constant Charges & Bills - {selectedPatient?.patientName+"["+selectedPatient?.opNo+"]"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
          {modalLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading stay charges...</p>
            </div>
          ) : stayCharges.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="fas fa-inbox" style={{ fontSize: "3rem", opacity: 0.3 }}></i>
              <p className="mt-3">No stay charges found</p>
            </div>
          ) : (
            <div>
              {stayCharges.map((dayData, dayIndex) => (
                <Card key={dayIndex} className="mb-3 shadow-sm">
                  <Card.Header className="bg-primary text-white">
                    <div className="d-flex justify-content-between align-items-center">
                      <h6 className="mb-0">
                        <i className="fas fa-calendar-day me-2"></i>
                        Date: {dayData.date}
                      </h6>
                      <Badge bg="light" text="dark">
                        {dayData.wardName}
                      </Badge>
                    </div>
                  </Card.Header>
                  <Card.Body>
                    {/* Charges Table */}
                    <h6 className="mb-3">
                      <i className="fas fa-coins me-2"></i>
                      Charges
                    </h6>
                    <Table bordered hover size="sm" className="mb-3">
                      <thead className="table-light">
                        <tr>
                          <th>Charge Name</th>
                          <th className="text-end">Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dayData.charges.map((charge, chargeIndex) => (
                          <tr key={chargeIndex}>
                            <td>{charge.chargeName}</td>
                            <td className="text-end">{charge.amount.toFixed(2)}</td>
                          </tr>
                        ))}
                        <tr className="table-info fw-bold">
                          <td>Total Charges</td>
                          <td className="text-end">
                            {dayData.charges.reduce((sum, c) => sum + c.amount, 0).toFixed(2)}
                          </td>
                        </tr>
                      </tbody>
                    </Table>

                    {/* Bills Table */}
                    {dayData.bills.length > 0 && (
                      <>
                        <h6 className="mb-3">
                          <i className="fas fa-receipt me-2"></i>
                          Bills
                        </h6>
                        <Table bordered hover size="sm">
                          <thead className="table-light">
                            <tr>
                              <th>Bill No</th>
                              <th>Time</th>
                              <th className="text-end">Total</th>
                              <th className="text-end">Discount</th>
                              <th className="text-end">Payable</th>
                              <th className="text-end">Paid</th>
                              <th className="text-end">Due</th>
                              <th>Type</th>
                              <th>User</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dayData.bills.map((bill, billIndex) => (
                              <tr key={billIndex}>
                                <td>{bill.billNo}</td>
                                <td>{bill.time}</td>
                                <td className="text-end">{bill.total.toFixed(2)}</td>
                                <td className="text-end">{bill.discount.toFixed(2)}</td>
                                <td className="text-end">{bill.payable.toFixed(2)}</td>
                                <td className="text-end">{bill.paid.toFixed(2)}</td>
                                <td className="text-end">
                                  <Badge bg={bill.due > 0 ? "danger" : "success"}>
                                    {bill.due.toFixed(2)}
                                  </Badge>
                                </td>
                                <td>
                                  <Badge bg="info">{bill.billType}</Badge>
                                </td>
                                <td>{bill.username}</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </>
                    )}
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}

          {/* Summary Section */}
          {!modalLoading && stayCharges.length > 0 && (() => {
            // Calculate totals by charge type
            let admissionChargeTotal = 0;
            let bedChargeTotal = 0;
            let nursingTotal = 0;
            let professionalTotal = 0;
            let overallTotal = 0;

            stayCharges.forEach((dayData) => {
              dayData.charges.forEach((charge) => {
                overallTotal += charge.amount;
                
                const chargeName = charge.chargeName.toLowerCase();
                if (chargeName.includes('admission')) {
                  admissionChargeTotal += charge.amount;
                } else if (chargeName.includes('bed')) {
                  bedChargeTotal += charge.amount;
                } else if (chargeName.includes('nursing')) {
                  nursingTotal += charge.amount;
                } else if (chargeName.includes('professional')) {
                  professionalTotal += charge.amount;
                }
              });
            });

            return (
              <Card className="mt-4 shadow-sm border-primary">
                <Card.Header className="bg-primary text-white">
                  <h5 className="mb-0">
                    <i className="fas fa-chart-bar me-2"></i>
                    Summary of All Charges
                  </h5>
                </Card.Header>
                <Card.Body>
                  <Table bordered hover className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Charge Type</th>
                        <th className="text-end">Total Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><i className="fas fa-user-plus me-2 text-info"></i>Admission Charge</td>
                        <td className="text-end">{admissionChargeTotal.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td><i className="fas fa-bed me-2 text-success"></i>Bed Charge</td>
                        <td className="text-end">{bedChargeTotal.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td><i className="fas fa-user-nurse me-2 text-warning"></i>Nursing</td>
                        <td className="text-end">{nursingTotal.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td><i className="fas fa-user-md me-2 text-primary"></i>Professional</td>
                        <td className="text-end">{professionalTotal.toFixed(2)}</td>
                      </tr>
                      <tr className="table-success fw-bold" style={{ fontSize: "1.1rem" }}>
                        <td><i className="fas fa-calculator me-2"></i>Total Charges</td>
                        <td className="text-end">{overallTotal.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            );
          })()}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ViewChart;
