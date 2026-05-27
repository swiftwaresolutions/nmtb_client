import React, { useState, useEffect } from "react";
import { Card, Table, Row, Col, Form, Button, Badge, Spinner } from "react-bootstrap";
import { faClipboardList } from "@fortawesome/free-solid-svg-icons";
import SearchInput from "../../../../../components/SearchInput";
import { useTableSearch } from "../../../../../hooks/useTableSearch";
import { PharmacyStoresApiService } from "../../../../../api/pharmacy-stores/pharmacy-stores-api-service";
import { showSuccessToast, showErrorToast } from "../../../../../utils/alertUtil";

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

interface MedicineItem {
  id: number;
  productId: number;
  batchId: number;
  productName: string;
  medCode: string;
  batchNo: string;
  units: number;
  cost: number;
  total: number;
}

interface PatientMedicineListProps {
  patient: BilledPatient;
  onClose: () => void;
  onSuccess?: () => void;
}

const PatientMedicineList: React.FC<PatientMedicineListProps> = ({
  patient,
  onClose,
  onSuccess,
}) => {
  const [tokenizedEnabled, setTokenizedEnabled] = useState(true);
  const [callPatient, setCallPatient] = useState(false);
  const [isLoadingCheckbox, setIsLoadingCheckbox] = useState(false);
  const [isLoadingDispense, setIsLoadingDispense] = useState(false);
  const [isDispensed, setIsDispensed] = useState(false);

  const apiService = new PharmacyStoresApiService();
  const [subModuleData, setSubModuleData] = useState<{ masterId: number } | null>(null);

  // Initialize callPatient based on patient.isIssued
  useEffect(() => {
    setCallPatient(patient.isIssued === 1);
  }, [patient.id]);

  useEffect(() => {
    try {
      const pharmacyStored = sessionStorage.getItem('pharmacySubModuleData');
      if (pharmacyStored) {
        const parsed = JSON.parse(pharmacyStored) as { masterId?: number };
        if (typeof parsed.masterId === 'number' && parsed.masterId > 0) {
          setSubModuleData({ masterId: parsed.masterId });
        } else {
          setSubModuleData(null);
        }
      } else {
        setSubModuleData(null);
      }
    } catch (err) {
      setSubModuleData(null);
    }
  }, []);

  // Transform product data to medicine items
  const medicines: MedicineItem[] = patient.productData.map((product, idx) => ({
    id: idx,
    productId: product.prodsId,
    batchId: product.batchId,
    productName: product.productName,
    medCode: product.medCode,
    batchNo: product.batchNo,
    units: product.units,
    cost: product.cost,
    total: product.total,
  }));

  const {
    filteredData,
    searchTerm,
    setSearchTerm,
    resultCount,
    totalCount,
  } = useTableSearch({
    data: medicines,
    searchFields: ["productName", "medCode", "batchNo"],
  });

  const handleCallPatientChange = async (checked: boolean) => {
    setIsLoadingCheckbox(true);
    try {
      const productDetails = medicines.map((medicine) => ({
        storeId: 0,
        prodId: 0,
        batchId: 0,
        units: 0,
      }));

      const payload = {
        phBillId: patient.id,
        productDetails: productDetails,
      };
      await apiService.saveDispenseDrug(payload);
      setCallPatient(checked);
      showSuccessToast("Patient called successfully");
      onSuccess?.();
    } catch (error) {
      console.error("Error calling patient:", error);
      const errorMessage =
        (error as { response?: { data?: { message?: string; error?: string } } })?.response?.data?.message ||
        (error as { response?: { data?: { message?: string; error?: string } } })?.response?.data?.error ||
        "Failed to call patient";
      showErrorToast(errorMessage);
    } finally {
      setIsLoadingCheckbox(false);
    }
  };

  const handleDispense = async () => {
    const storeId = subModuleData?.masterId ?? 0;
    if (!storeId) {
      showErrorToast('Pharmacy store context is missing. Please reselect the pharmacy store.');
      return;
    }

    setIsLoadingDispense(true);
    try {
      const productDetails = medicines.map((medicine) => ({
        storeId: storeId,
        prodId: medicine.productId,
        batchId: medicine.batchId,
        units: medicine.units,
      }));

      const payload = {
        phBillId: patient.id,
        productDetails: productDetails,
      };

      await apiService.saveDispenseDrug(payload);
      setIsDispensed(true);
      showSuccessToast("Medicines dispensed successfully");
      onSuccess?.();
    } catch (error) {
      console.error("Error dispensing medicines:", error);
      const errorMessage =
        (error as { response?: { data?: { message?: string; error?: string } } })?.response?.data?.message ||
        (error as { response?: { data?: { message?: string; error?: string } } })?.response?.data?.error ||
        "Failed to dispense medicines";
      showErrorToast(errorMessage);
    } finally {
      setIsLoadingDispense(false);
    }
  };

  return (
    <>
      <div>
        <Card className="mb-3">
          <Card.Body>
            <Row>
              <Col md={3}>
                <strong>Patient:</strong>
                <div>{patient.name}</div>
              </Col>
              <Col md={3}>
                <strong>OP Number:</strong>
                <div>{patient.opNumber}</div>
              </Col>
              <Col md={3}>
                <strong>Bill No:</strong>
                <div>{patient.billNumber}</div>
              </Col>
              <Col md={3}>
                <strong>Bill Date:</strong>
                <div>{patient.billDate}</div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Row className="align-items-center mb-3 g-2">
          <Col md={4}>
            <SearchInput
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Search medicine, code, batch..."
              resultCount={resultCount}
              totalCount={totalCount}
              className="w-100"
            />
          </Col>
          <Col md={4} className="d-flex justify-content-center gap-2">
            {tokenizedEnabled && (
              <Form.Check
                type="checkbox"
                id="call-patient"
                label="Call Patient"
                checked={callPatient}
                onChange={(e) => handleCallPatientChange(e.target.checked)}
                style={{ fontWeight: 'bold' }}
                disabled={isLoadingCheckbox}
              />
            )}
            {isLoadingCheckbox && (
              <Spinner animation="border" size="sm" />
            )}
          </Col>
          <Col md={4} className="d-flex justify-content-end gap-2">
            <Button
              variant="success"
              onClick={handleDispense}
              disabled={isLoadingDispense || isDispensed || !subModuleData?.masterId}
            >
              {isLoadingDispense ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Dispensing...
                </>
              ) : isDispensed ? (
                "Dispensed"
              ) : (
                "Dispense"
              )}
            </Button>
          </Col>
        </Row>

        {tokenizedEnabled && (
          <div className="mb-3">
            <Badge bg={callPatient ? "success" : "secondary"}>
              {callPatient ? "Ready" : "Not Ready"}
            </Badge>
          </div>
        )}

        <Table striped bordered hover>
          <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
            <tr>
              <th>Sl No</th>
              <th>Medicine</th>
              <th>Code</th>
              <th>Batch</th>
              <th>Units</th>
              <th>Cost</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center">
                  {searchTerm ? "No medicines match your search." : "No medicines"}
                </td>
              </tr>
            ) : (
              filteredData.map((m, idx) => (
                <tr key={m.id}>
                  <td>{idx + 1}</td>
                  <td className="fw-bold fs-6">{m.productName}</td>
                  <td>{m.medCode}</td>
                  <td>{m.batchNo}</td>
                  <td className="fw-bold fs-6">{m.units}</td>
                  <td>{m.cost}</td>
                  <td>{m.total}</td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>
    </>
  );
};

export default PatientMedicineList;
