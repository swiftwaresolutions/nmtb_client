import React, { useMemo, useState, useEffect } from "react";
import { Card, Row, Col, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useTableSearch } from "../../../../hooks/useTableSearch";
import { PharmacyStoresApiService } from "../../../../api/pharmacy-stores/pharmacy-stores-api-service";
import { showValidationError, showErrorToast } from "../../../../utils/alertUtil";
import "./ReadyPatientList.css";

interface ProductData {
  productName: string;
  medCode: string;
  batchNo: string;
  units: number;
  cost: number;
  total: number;
}

interface ReadyPatient {
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

const ReadyPatientList: React.FC = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<ReadyPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [nowCallingIndex, setNowCallingIndex] = useState(0);

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

  // Fetch data on mount
  useEffect(() => {
    if (!storeId) {
      setPatients([]);
      setLoading(false);
      showValidationError("Pharmacy store context is missing. Please reselect the store.");
      navigate('/hims/pharmacy-stores', { state: { moduleId: 3 }, replace: true });
      return;
    }

    const fetchPatients = async (shouldRotate: boolean) => {
      try {
        setLoading(true);
        const data = await apiService.fetchAllDispenseDrug(storeId);
        // Filter only patients with isIssued === 1
        const issuedPatients = (data || []).filter((p) => p.isIssued === 1);
        setPatients(issuedPatients);
        setNowCallingIndex((prevIndex) => {
          if (!shouldRotate) {
            return 0;
          }
          if (issuedPatients.length === 0) {
            return 0;
          }
          const nextIndex = prevIndex + 1;
          return nextIndex >= issuedPatients.length ? 0 : nextIndex;
        });
      } catch (error) {
        console.error("Error fetching dispense drug patients:", error);
        showErrorToast("Failed to fetch ready patients");
      } finally {
        setLoading(false);
      }
    };

    fetchPatients(false);
    const refreshInterval = setInterval(() => fetchPatients(true), 30000);
    return () => clearInterval(refreshInterval);
  }, [apiService, navigate, storeId]);

  const {
    filteredData,
    searchTerm,
    setSearchTerm,
  } = useTableSearch({
    data: patients,
    searchFields: ["name", "opNumber", "billNumber", "phoneNumber"],
  });

  return (
    <>

      <div className="p-3">
        {/* Current/Featured Patient Section */}
        {patients.length > 0 && (
          <div className="featured-patient-section mb-4">
            <div className="featured-patient-card">
              <div className="featured-label">NOW CALLING</div>
              <div className="featured-name">{patients[nowCallingIndex]?.name}</div>
              <div className="featured-details">
                <span className="detail-item">Bill: {patients[nowCallingIndex]?.billNumber}</span>
                <span className="detail-separator">•</span>
                <span className="detail-item">Counter</span>
              </div>
            </div>
          </div>
        )}

        {/* Waiting List Section */}
        <Card className="shadow-sm">
          <Card.Header className="bg-light">
            <Row className="align-items-center g-2">
              <Col>
                <h6 className="mb-0">Waiting List</h6>
              </Col>
            </Row>
          </Card.Header>
          <Card.Body className="card-body-style">
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="text-center py-5 text-muted">
                {searchTerm ? "No patients match your search." : "No ready patients"}
              </div>
            ) : (
              <div className="patients-grid">
                {filteredData.map((p, idx) => (
                  <div key={p.id} className="patient-card">
                    <div className="queue-number">{idx + 1}</div>
                    <div className="patient-info">
                      <div className="patient-name">{p.name}</div>
                      <div className="patient-bill">Bill: {p.billNumber}</div>
                      <div className="patient-op">OP: {p.opNumber}</div>
                    </div>
                    <div className="patient-status-badge">
                      <span className="status-dot"></span>
                      Ready
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card.Body>
        </Card>
      </div>
    </>
  );
};

export default ReadyPatientList;
