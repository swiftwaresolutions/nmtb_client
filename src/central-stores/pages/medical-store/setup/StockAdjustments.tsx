import React, { useState, useCallback, useEffect } from "react";
import { Card, Table, Button, Badge, Form, Modal, Row, Col, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faPills,
  faBoxes,
  faSearch,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import {
  formatNumberDisplay,
  handleNumberBlur,
  handleNumberChange,
} from "../../../../utils/numberInputUtil";
import PageHeader from "../../../../components/PageHeader";
import { showSuccessToast, showErrorToast, showValidationError } from "../../../../utils/alertUtil";
import CentralStoresApiService, { OnStoreMedicineResponse } from "../../../../api/central-stores/central-stores-api-service";
import SearchInput from "../../../../components/SearchInput";
import { useNavigate } from "react-router-dom";

interface BatchAdjustment {
  quantity: number;
  action: "Add" | "Subtract";
}

const apiService = new CentralStoresApiService();

const StockAdjustments = () => {
  const navigate = useNavigate();
  const [storeId, setStoreId] = useState<number>(0);
  const [storeReady, setStoreReady] = useState<boolean>(false);
  const [medicineSearchTerm, setMedicineSearchTerm] = useState<string>("");
  const [hasSearched, setHasSearched] = useState(false);
  const [medicines, setMedicines] = useState<OnStoreMedicineResponse[]>([]);
  const [isLoadingMedicines, setIsLoadingMedicines] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<OnStoreMedicineResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [batchAdjustments, setBatchAdjustments] = useState<Record<number, BatchAdjustment>>({});

  useEffect(() => {
    // const stored = sessionStorage.getItem("selectedStore");
    let stored = sessionStorage.getItem('selectedStore');
    if (!stored) {
      stored = sessionStorage.getItem('pharmacySubModuleData');
    }
    if (!stored) {
      showValidationError("Store context is missing. Please reselect the store.");
      navigate('/hims/central-stores', { replace: true });
      return;
    }

    try {
      const parsed = JSON.parse(stored) as { masterId?: number };
      const resolvedStoreId = Number(parsed?.masterId ?? 0);
      if (!resolvedStoreId) {
        showValidationError("Store context is missing. Please reselect the store.");
        navigate('/hims/central-stores', { replace: true });
        return;
      }

      setStoreId(resolvedStoreId);
      setStoreReady(true);
    } catch {
      showValidationError("Store context is invalid. Please reselect the store.");
      navigate('/hims/central-stores', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (!storeReady) {
      return;
    }

    const trimmedSearch = medicineSearchTerm.trim();

    if (trimmedSearch.length < 2) {
      setHasSearched(false);
      setMedicines([]);
      setSelectedMedicine(null);
      setBatchAdjustments({});
      setIsLoadingMedicines(false);
      return;
    }

    const timer = window.setTimeout(async () => {
      setIsLoadingMedicines(true);
      setHasSearched(true);

      try {
        const response = await apiService.fetchOnStoreMedicineDetails(trimmedSearch, storeId);
        setMedicines(Array.isArray(response) ? response : []);
      } catch {
        setMedicines([]);
        showErrorToast("Failed to load medicines.");
      } finally {
        setIsLoadingMedicines(false);
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [medicineSearchTerm, storeId, storeReady]);

  const handleSelectMedicine = useCallback((medicine: OnStoreMedicineResponse) => {
    setSelectedMedicine(medicine);

    const initialAdjustments: Record<number, BatchAdjustment> = {};
    medicine.batches.forEach((batch) => {
      initialAdjustments[batch.batchId] = { quantity: 0, action: "Add" };
    });

    setBatchAdjustments(initialAdjustments);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setMedicineSearchTerm(value);

    if (!value.trim()) {
      setHasSearched(false);
      setMedicines([]);
      setSelectedMedicine(null);
      setBatchAdjustments({});
    }
  }, []);

  const handleQuantityChange = (batchId: number, value: string) => {
    setBatchAdjustments((prev) => ({
      ...prev,
      [batchId]: { ...prev[batchId], quantity: handleNumberChange(value, 0) },
    }));
  };

  const handleQuantityBlur = (batchId: number, value: string) => {
    setBatchAdjustments((prev) => ({
      ...prev,
      [batchId]: { ...prev[batchId], quantity: handleNumberBlur(value, 0) },
    }));
  };

  const handleActionChange = (batchId: number, action: "Add" | "Subtract") => {
    setBatchAdjustments((prev) => ({
      ...prev,
      [batchId]: { ...prev[batchId], action },
    }));
  };

  const handleCloseModal = () => {
    setSelectedMedicine(null);
    setBatchAdjustments({});
    setIsSubmitting(false);
  };

  const handleSubmitAdjustment = async () => {
    const batches = selectedMedicine?.batches ?? [];

    const payload = batches
      .filter((b) => (batchAdjustments[b.batchId]?.quantity ?? 0) > 0)
      .map((b) => ({
        batchId: b.batchId,
        storeId,
        stockQty: batchAdjustments[b.batchId].quantity,
        action: batchAdjustments[b.batchId].action === "Add" ? "add" : "reduce",
      }));

    if (payload.length === 0) {
      showValidationError("Please enter adjustment quantity for at least one batch.");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiService.stockAdjust(payload);
      showSuccessToast(`Stock adjusted successfully for ${selectedMedicine?.productName}.`);
      handleCloseModal();
    } catch {
      showErrorToast("Failed to adjust stock.");
      setIsSubmitting(false);
    }
  };

  if (!storeReady) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" size="sm" />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <PageHeader
        icon={faEdit}
        title="Stock Adjustment"
        subtitle="Search medicines, review available batches, and adjust stock quantities"
      />

      <div style={{ flex: 1, overflowY: "auto", padding: "1rem" }}>
        <Card className="neat-card">
          <Card.Header className="px-3 py-3 border-bottom-0 bg-transparent">
            <div className="d-flex align-items-start justify-content-between flex-wrap gap-3">
              <div className="d-flex align-items-center gap-2">
                <FontAwesomeIcon icon={faSearch} className="text-primary" />
                <div>
                  <div
                    className="fw-semibold"
                    style={{ fontSize: "var(--font-size-md)", fontWeight: "var(--font-weight-semibold)" }}
                  >
                    Search medicine by name
                  </div>
                  <div className="text-secondary" style={{ fontSize: "var(--font-size-sm)" }}>
                    Start typing at least 2 characters to load medicines with their batches.
                  </div>
                </div>
              </div>

              <div style={{ minWidth: 320 }}>
                <SearchInput
                  searchTerm={medicineSearchTerm}
                  onSearchChange={handleSearchChange}
                  placeholder="Type medicine name..."
                  resultCount={medicines.length}
                  totalCount={medicines.length}
                  showResultCount={medicineSearchTerm.trim().length >= 2}
                />
              </div>
            </div>
          </Card.Header>

          <Card.Body className="p-0">
            {isLoadingMedicines ? (
              <div className="text-center py-5">
                <Spinner animation="border" size="sm" />
              </div>
            ) : medicineSearchTerm.trim().length < 2 ? (
              <div className="text-center py-5 text-secondary px-3">
                <FontAwesomeIcon icon={faPills} size="3x" className="mb-3 opacity-25" />
                <p className="mb-1 fw-semibold" style={{ fontSize: "var(--font-size-md)", fontWeight: "var(--font-weight-semibold)" }}>
                  Search with at least 2 characters
                </p>
                <small style={{ fontSize: "var(--font-size-sm)" }}>
                  Example: type part of the medicine name to fetch matching products.
                </small>
              </div>
            ) : hasSearched && medicines.length === 0 ? (
              <div className="text-center py-5 text-secondary px-3">
                <FontAwesomeIcon icon={faExclamationTriangle} size="2x" className="mb-2 opacity-25" />
                <p className="mb-1" style={{ fontSize: "var(--font-size-sm)" }}>
                  No medicines found for &lsquo;{medicineSearchTerm.trim()}&rsquo;
                </p>
                <small style={{ fontSize: "var(--font-size-sm)" }}>
                  Try a broader name or a different spelling.
                </small>
              </div>
            ) : (
              <div style={{ maxHeight: "58vh", overflowY: "auto" }}>
                <Table hover className="mb-0 align-middle">
                  <thead
                    className="bg-light text-secondary text-uppercase small"
                    style={{ position: "sticky", top: 0, zIndex: 1 }}
                  >
                    <tr>
                      <th className="py-3 ps-4" style={{ width: "8%" }}>Sl.No</th>
                      <th className="py-3" style={{ width: "50%" }}>Medicine Name</th>
                      <th className="py-3" style={{ width: "24%" }}>Generic Name</th>
                      <th className="py-3 text-end pe-4" style={{ width: "18%" }}>Batches</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicines.map((medicine, index) => (
                      <tr key={medicine.prodsId}>
                        <td className="fw-bold text-secondary ps-4" style={{ fontSize: "var(--font-size-sm)" }}>
                          {index + 1}
                        </td>
                        <td>
                          <Button
                            variant="link"
                            className="p-0 text-start d-flex align-items-center gap-2"
                            style={{
                              textDecoration: "none",
                              fontSize: "var(--font-size-sm)",
                              fontWeight: "var(--font-weight-semibold)",
                            }}
                            onClick={() => handleSelectMedicine(medicine)}
                          >
                            <FontAwesomeIcon icon={faEdit} style={{ fontSize: "var(--font-size-xs)", opacity: 0.5 }} />
                            {medicine.productName}
                          </Button>
                        </td>
                        <td style={{ fontSize: "var(--font-size-sm)" }}>
                          <span className="text-secondary">{medicine.genericName || "—"}</span>
                        </td>
                        <td className="text-end pe-4" style={{ fontSize: "var(--font-size-sm)" }}>
                          <Badge className="theme-badge-secondary px-3 py-2" style={{ fontSize: "var(--font-size-xs)" }}>
                            {medicine.batches.length} batch{medicine.batches.length !== 1 ? "es" : ""}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>

          <Card.Footer className="px-3 py-3 bg-transparent border-top d-flex align-items-center justify-content-between flex-wrap gap-2">
            <div className="text-secondary" style={{ fontSize: "var(--font-size-sm)" }}>
              {medicineSearchTerm.trim().length >= 2
                ? `${medicines.length} medicine${medicines.length !== 1 ? "s" : ""} loaded for review.`
                : "Enter at least 2 characters to begin searching."}
            </div>
            <Badge className="theme-badge-secondary px-3 py-2" style={{ fontSize: "var(--font-size-xs)" }}>
              Store ID: {storeId}
            </Badge>
          </Card.Footer>
        </Card>

      </div>

      {/* Batch Adjustment Modal */}
      <Modal show={!!selectedMedicine} onHide={handleCloseModal} size="xl" centered backdrop="static" keyboard={false}>
        <Modal.Header closeButton className="border-bottom py-3 bg-light">
          <Modal.Title
            className="h5 fw-bold d-flex align-items-center gap-2"
            style={{ fontSize: "var(--font-size-md)", fontWeight: "var(--font-weight-bold)" }}
          >
            <FontAwesomeIcon icon={faBoxes} className="text-primary" />
            Stock Adjustment
            {selectedMedicine && (
              <Badge
                className="theme-badge-secondary px-3 py-2 ms-1"
                style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-normal)" }}
              >
                {selectedMedicine.productName}
              </Badge>
            )}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="p-0">
          {selectedMedicine && (
            <>
              {/* Medicine meta bar */}
              <div className="px-4 py-2 bg-light border-bottom">
                <Row className="g-3">
                  <Col xs="auto">
                    <span className="text-secondary" style={{ fontSize: "var(--font-size-xs)" }}>Med Code</span>
                    <div className="fw-semibold" style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-semibold)" }}>
                      {selectedMedicine.prodsId}
                    </div>
                  </Col>
                  <Col xs="auto">
                    <span className="text-secondary" style={{ fontSize: "var(--font-size-xs)" }}>Generic</span>
                    <div className="fw-semibold" style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-semibold)" }}>
                      {selectedMedicine.genericName || "—"}
                    </div>
                  </Col>
                  <Col xs="auto" className="ms-auto d-flex align-items-center">
                    <Badge bg="secondary" className="px-3 py-2" style={{ fontSize: "var(--font-size-xs)" }}>
                      {selectedMedicine.batches.length} batch{selectedMedicine.batches.length !== 1 ? "es" : ""}
                    </Badge>
                  </Col>
                </Row>
              </div>

              <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
                {/* Section label */}
                <div className="px-4 pt-3 pb-1 d-flex align-items-center gap-2 border-bottom">
                  <FontAwesomeIcon icon={faBoxes} className="text-primary" style={{ fontSize: "var(--font-size-sm)" }} />
                  <span
                    className="fw-semibold text-uppercase"
                    style={{ fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-semibold)", letterSpacing: "0.06em" }}
                  >
                    Batch Adjustment
                  </span>
                </div>

                {selectedMedicine.batches.length === 0 ? (
                  <div className="text-center py-5 text-secondary">
                    <FontAwesomeIcon icon={faExclamationTriangle} size="2x" className="mb-2 opacity-25" />
                    <p className="mb-0" style={{ fontSize: "var(--font-size-sm)" }}>No batch records found.</p>
                  </div>
                ) : (
                  <>
                    <div className="px-4 py-2 bg-light border-bottom text-secondary" style={{ fontSize: "var(--font-size-xs)" }}>
                      Current Stock is total physical stock. Available Stock is what you can use after patient reservations, pending transfers, and unapproved consumables are excluded.
                    </div>
                    <Table hover className="mb-0 align-middle">
                      <thead
                        className="bg-light text-secondary text-uppercase small"
                        style={{ position: "sticky", top: 0, zIndex: 1 }}
                      >
                        <tr>
                          <th className="py-3 ps-4" style={{ width: "4%" }}>Sl</th>
                          <th className="py-3" style={{ width: "12%" }}>Batch No</th>
                          <th className="py-3 text-end" style={{ width: "10%" }}>Current</th>
                          <th className="py-3 text-center" style={{ width: "10%" }}>Available</th>
                          <th className="py-3" style={{ width: "12%" }}>Expiry Date</th>
                          <th className="py-3 text-end" style={{ width: "9%" }}>Cost (₹)</th>
                          <th className="py-3 text-end" style={{ width: "9%" }}>MRP (₹)</th>
                          <th className="py-3 text-end" style={{ width: "17%" }}>Adj. Qty</th>
                          <th className="py-3 text-center" style={{ width: "17%" }}>Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedMedicine.batches.map((batch, index) => (
                          <tr key={batch.batchId}>
                            <td className="fw-bold text-secondary ps-4" style={{ fontSize: "var(--font-size-sm)" }}>
                              {index + 1}
                            </td>
                            <td>
                              <Badge
                                className="theme-badge-secondary px-2 py-1"
                                style={{ fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-semibold)" }}
                              >
                                {batch.batchNo}
                              </Badge>
                            </td>
                            <td className="text-end fw-semibold" style={{ fontWeight: "var(--font-weight-semibold)", fontSize: "var(--font-size-sm)" }}>
                              {(batch.currentStock ?? 0).toLocaleString()}
                            </td>
                            <td className="text-center fw-bolder" style={{fontSize: "var(--font-size-sm)", color: "var(--page-secondary-color)" }}>
                              {(batch.availableStock ?? 0).toLocaleString()}
                            </td>
                            <td className="text-secondary" style={{ fontSize: "var(--font-size-sm)" }}>
                              {batch.expiryDate || "—"}
                            </td>
                            <td className="text-end" style={{ fontSize: "var(--font-size-sm)" }}>
                              {batch.costPrice.toFixed(2)}
                            </td>
                            <td className="text-end" style={{ fontSize: "var(--font-size-sm)" }}>
                              {batch.mrp.toFixed(2)}
                            </td>
                            <td className="text-end">
                              <Form.Control
                                type="text"
                                inputMode="numeric"
                                size="sm"
                                className="text-end"
                                style={{ width: 110, display: "inline-block" }}
                                value={formatNumberDisplay(batchAdjustments[batch.batchId]?.quantity ?? 0)}
                                onChange={(e) => handleQuantityChange(batch.batchId, e.target.value)}
                                onBlur={(e) => handleQuantityBlur(batch.batchId, e.target.value)}
                                placeholder="0"
                              />
                            </td>
                            <td className="text-center">
                              <Form.Select
                                size="sm"
                                style={{ width: 120, display: "inline-block" }}
                                value={batchAdjustments[batch.batchId]?.action ?? "Add"}
                                onChange={(e) =>
                                  handleActionChange(batch.batchId, e.target.value as "Add" | "Subtract")
                                }
                              >
                                <option value="Add">Add</option>
                                <option value="Subtract">Subtract</option>
                              </Form.Select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </>
                )}
              </div>
            </>
          )}
        </Modal.Body>

        <Modal.Footer className="border-top">
          <Button className="theme-outline-btn-primary" onClick={handleCloseModal} disabled={isSubmitting}>
            Close
          </Button>
          <Button className="theme-btn-primary" onClick={handleSubmitAdjustment} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Adjustment"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default StockAdjustments;
