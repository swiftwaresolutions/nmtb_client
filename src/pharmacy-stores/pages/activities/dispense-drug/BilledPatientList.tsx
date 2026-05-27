import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Card, Table, Button, Badge, Row, Col, Spinner, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { faClipboardList } from "@fortawesome/free-solid-svg-icons";
import SearchInput from "../../../../components/SearchInput";
import { useTableSearch } from "../../../../hooks/useTableSearch";
import PageHeader from "../../../../components/PageHeader";
import { PharmacyStoresApiService } from "../../../../api/pharmacy-stores/pharmacy-stores-api-service";
import { showValidationError, showErrorToast } from "../../../../utils/alertUtil";
import PatientMedicineList from "./modal/PatientMedicineList";

interface ProductData {
  prodsId: number;
  batchId: number;
  productName: string;
  medCode: string;
  batchNo: string;
  units: number;
  cost: number;
  total: number;
}

interface BilledPatient {
  id: number;
  opNumber: string;
  name: string;
  phoneNumber: string;
  guardian: string;
  billDate: string;
  billNumber: string;
  isIssued: number;
  totalQuantity: number;
  productData: ProductData[];
}

interface PharmacySubModuleData {
  masterId?: number;
}

type FilterType = "all" | "Ready" | "not-Ready";

const BilledPatientList: React.FC = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<BilledPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [showMedicineModal, setShowMedicineModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<BilledPatient | null>(null);

  const apiService = useMemo(() => new PharmacyStoresApiService(), []);

  const storeId = useMemo(() => {
    const pharmacyData = sessionStorage.getItem("pharmacySubModuleData");
    if (!pharmacyData) {
      return null;
    }

    try {
      const parsed = JSON.parse(pharmacyData) as PharmacySubModuleData;
      return typeof parsed.masterId === "number" && parsed.masterId > 0
        ? parsed.masterId
        : null;
    } catch (error) {
      console.error("Error parsing pharmacy sub-module data:", error);
      return null;
    }
  }, []);

  const fetchPatients = useCallback(async () => {
    if (!storeId) {
      setPatients([]);
      setLoading(false);
      showValidationError("Pharmacy store context is missing. Please reselect the store.");
      navigate('/hims/pharmacy-stores', { state: { moduleId: 3 }, replace: true });
      return;
    }

    try {
      setLoading(true);
      const data = await apiService.fetchAllDispenseDrug(storeId);
      setPatients(data || []);
    } catch (error) {
      console.error("Error fetching dispense drug patients:", error);
      const errorMessage =
        (error as { response?: { data?: { message?: string; error?: string } } })?.response?.data?.message ||
        (error as { response?: { data?: { message?: string; error?: string } } })?.response?.data?.error ||
        "Failed to fetch patient list";
      showErrorToast(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [apiService, navigate, storeId]);

  // Fetch data on mount
  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Apply filter before search
  const filteredByStatus = useMemo(() => {
    if (filter === "all") return patients;
    if (filter === "Ready") return patients.filter((p) => p.isIssued === 1);
    if (filter === "not-Ready") return patients.filter((p) => p.isIssued === 0);
    return patients;
  }, [patients, filter]);

  const {
    filteredData,
    searchTerm,
    setSearchTerm,
    resultCount,
    totalCount,
  } = useTableSearch({
    data: filteredByStatus,
    searchFields: ["name", "opNumber", "billNumber", "phoneNumber"],
  });

  const getStatusBadge = (isIssued: number) => {
    if (isIssued === 1) {
      return <Badge bg="success">Ready</Badge>;
    }
    return <Badge bg="warning">Not Ready</Badge>;
  };

  const getStatusColor = (isIssued: number) => {
    return isIssued === 1 ? "#28a745" : "#ffc107";
  };

  const handleViewMedicines = (patient: BilledPatient) => {
    setSelectedPatient(patient);
    setShowMedicineModal(true);
  };

  const handleCloseMedicineModal = () => {
    setShowMedicineModal(false);
    setSelectedPatient(null);
  };

  const handleMedicineActionSuccess = () => {
    fetchPatients();
    setShowMedicineModal(false);
  };

  return (
    <>
      <PageHeader
        icon={faClipboardList}
        title="Dispense Drug"
        subtitle="Billed patients waiting for medicines"
        badges={[
          { label: "Total", value: filteredByStatus.length },
          { label: "Showing", value: resultCount },
        ]}
      />

      <div className="px-3">
        <Card className="shadow-sm">
          <Card.Header className="bg-light">
            <Row className="align-items-center g-2 mb-3">
              <Col>
                <h6 className="mb-0">Billed Patient List</h6>
              </Col>
              <Col md={6} className="d-flex justify-content-end">
                <SearchInput
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  placeholder="Search by name, OP no, bill no, phone..."
                  resultCount={resultCount}
                  totalCount={totalCount}
                  className="w-100"
                />
              </Col>
            </Row>
            <Row className="g-2">
              <Col>
                <div className="d-flex gap-2">
                  <Button
                    variant={filter === "all" ? "primary" : "outline-primary"}
                    size="sm"
                    onClick={() => setFilter("all")}
                  >
                    All ({patients.length})
                  </Button>
                  <Button
                    variant={filter === "Ready" ? "success" : "outline-success"}
                    size="sm"
                    onClick={() => setFilter("Ready")}
                  >
                    Ready ({patients.filter((p) => p.isIssued === 1).length})
                  </Button>
                  <Button
                    variant={filter === "not-Ready" ? "warning" : "outline-warning"}
                    size="sm"
                    onClick={() => setFilter("not-Ready")}
                  >
                    Not Ready ({patients.filter((p) => p.isIssued === 0).length})
                  </Button>
                </div>
              </Col>
            </Row>
          </Card.Header>
          <Card.Body style={{ overflow: "auto" }}>
            {loading ? (
              <div className="text-center py-4">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
            ) : (
              <Table striped bordered hover>
                <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
                  <tr>
                    <th>#</th>
                    <th>Bill No</th>
                    <th>Patient Name</th>
                    <th>OP Number</th>
                    <th>Phone</th>
                    <th>Bill Date</th>
                    <th>Total Qty</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-3">
                        {searchTerm
                          ? "No patients match your search."
                          : "No data available"}
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((p, idx) => (
                      <tr key={p.id} style={{ borderLeft: `4px solid ${getStatusColor(p.isIssued)}` }}>
                        <td>{idx + 1}</td>
                        <td>{p.billNumber}</td>
                        <td>{p.name}</td>
                        <td>{p.opNumber}</td>
                        <td>{p.phoneNumber}</td>
                        <td>{p.billDate}</td>
                        <td>{p.totalQuantity}</td>
                        <td>{getStatusBadge(p.isIssued)}</td>
                        <td>
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleViewMedicines(p)}
                          >
                            View Medicines
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      </div>

      {selectedPatient && (
        <Modal
          show={showMedicineModal}
          onHide={handleCloseMedicineModal}
          size="xl"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Patient Medicine List</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ maxHeight: "80vh", overflowY: "auto" }}>
            <PatientMedicineList
              patient={selectedPatient}
              onClose={handleCloseMedicineModal}
              onSuccess={handleMedicineActionSuccess}
            />
          </Modal.Body>
        </Modal>
      )}
    </>
  );
};

export default BilledPatientList;
