import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { Card, Button, Table, Modal, Form, Badge, Row, Col, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBoxes, faPlus, faExclamationTriangle, faPills } from '@fortawesome/free-solid-svg-icons';
import PageHeader from '../../../../components/PageHeader';
import { useTableSearch } from '../../../../hooks/useTableSearch';
import SearchInput from '../../../../components/SearchInput';
import { showSuccessToast, showValidationError, showErrorToast } from '../../../../utils/alertUtil';
import { formatNumberDisplay } from '../../../../utils/numberInputUtil';
import CentralStoresApiService, { BatchDetail, ProductNameLikeResponse, ProductsByNameForPOResponse } from '../../../../api/central-stores/central-stores-api-service';
import { useNavigate } from 'react-router-dom';

// ─── Types ───────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _ProductNameLikeResponseRef = ProductNameLikeResponse; // kept for reference — old API
type Medicine = ProductsByNameForPOResponse;

// ─── Service ──────────────────────────────────────────────────────────────────

const apiService = new CentralStoresApiService();



// ─── Component ────────────────────────────────────────────────────────────────

const InitialStocks: React.FC = () => {
  const navigate = useNavigate();
  const alphabet = useMemo(
    () => Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)),
    []
  );

  const [storeId, setStoreId] = useState<number>(0);
  const [storeReady, setStoreReady] = useState<boolean>(false);

  useEffect(() => {
    // Try Central Stores first, then Pharmacy Stores
    let stored = sessionStorage.getItem('selectedStore');
    if (!stored) {
      stored = sessionStorage.getItem('pharmacySubModuleData');
    }

    if (!stored) {
      showValidationError('Store context is missing. Please reselect the store.');
      navigate('/hims/central-stores', { replace: true });
      return;
    }

    try {
      const parsed = JSON.parse(stored) as { masterId?: number };
      const resolvedStoreId = Number(parsed?.masterId ?? 0);
      if (!resolvedStoreId) {
        showValidationError('Store context is missing. Please reselect the store.');
        navigate('/hims/central-stores', { replace: true });
        return;
      }

      setStoreId(resolvedStoreId);
      setStoreReady(true);
    } catch {
      showValidationError('Store context is invalid. Please reselect the store.');
      navigate('/hims/central-stores', { replace: true });
    }
  }, [navigate]);

  const [selectedLetter, setSelectedLetter] = useState<string>('');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isLoadingMedicines, setIsLoadingMedicines] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [batches, setBatches] = useState<BatchDetail[]>([]);
  const [isLoadingBatches, setIsLoadingBatches] = useState(false);
  const [batchValues, setBatchValues] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState<Record<number, boolean>>({});

  const { filteredData, searchTerm, setSearchTerm, resultCount, totalCount } = useTableSearch({
    data: medicines,
    searchFields: ['medicineName', 'medCode', 'hsnCode'],
  });

  const handleSelectLetter = useCallback(async (letter: string) => {
    setSelectedLetter(letter);
    setSearchTerm('');
    setMedicines([]);
    setIsLoadingMedicines(true);
    try {
      const raw = await apiService.fetchProductsByNameForPO(storeId, letter);
      setMedicines(raw.filter(m => m.isActive === 1));
    } catch {
      showErrorToast('Failed to load medicines.');
    } finally {
      setIsLoadingMedicines(false);
    }
  }, [storeId, setSearchTerm]);

  const handleOpenMedicine = useCallback(async (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setBatches([]);
    setBatchValues({});
    setIsSubmitting({});
    setIsLoadingBatches(true);
    try {
      const data = await apiService.fetchBatchDetailsByProdsId(medicine.prodsId, storeId);
      setBatches(data);
      const init: Record<number, number> = {};
      data.forEach(b => { init[b.batchId] = 0; });
      setBatchValues(init);
    } catch {
      showErrorToast('Failed to load batch details.');
    } finally {
      setIsLoadingBatches(false);
    }
  }, [storeId]);

  const handleCloseModal = () => {
    setSelectedMedicine(null);
    setBatches([]);
    setBatchValues({});
    setIsSubmitting({});
  };

  const handleValueChange = (batchId: number, val: string) => {
    const digits = val.replace(/[^0-9]/g, '');
    const parsed = digits === '' ? 0 : parseInt(digits, 10);
    setBatchValues(prev => ({ ...prev, [batchId]: parsed }));
  };

  const handleValueBlur = (batchId: number, val: string) => {
    const parsed = parseInt(val.replace(/[^0-9]/g, ''), 10);
    setBatchValues(prev => ({ ...prev, [batchId]: isNaN(parsed) ? 0 : parsed }));
  };

  const handleAdd = useCallback(async (batch: BatchDetail) => {
    const value = batchValues[batch.batchId] ?? 0;
    if (value <= 0) {
      showValidationError('Please enter a valid quantity greater than 0.');
      return;
    }
    setIsSubmitting(prev => ({ ...prev, [batch.batchId]: true }));
    try {
      await apiService.addInitialStock([{ batchId: batch.batchId, storeId, stockQty: value, action: 'add' }]);
      showSuccessToast(`Stock added for batch ${batch.batchNo}.`);
      setBatchValues(prev => ({ ...prev, [batch.batchId]: 0 }));
    } catch {
      showErrorToast('Failed to add stock.');
    } finally {
      setIsSubmitting(prev => ({ ...prev, [batch.batchId]: false }));
    }
  }, [batchValues, storeId]);

  if (!storeReady) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" size="sm" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <PageHeader
        icon={faBoxes}
        title="Initial Stocks"
        subtitle="Set initial stock values for medicines by selecting alphabet and batch"
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>

        {/* A–Z Alphabet Filter */}
        <Card className="neat-card mb-3">
          <Card.Body className="p-3">
            <div className="d-flex align-items-center gap-2 mb-3">
              <FontAwesomeIcon icon={faPills} className="text-primary" />
              <span
                className="fw-semibold text-uppercase"
                style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', letterSpacing: '0.06em' }}
              >
                Filter medicines by letter
              </span>
              {selectedLetter && (
                <Badge className="theme-badge-secondary ms-auto px-3 py-2" style={{ fontSize: 'var(--font-size-sm)' }}>
                  Selected: <strong>{selectedLetter}</strong>
                </Badge>
              )}
            </div>
            <div className="d-flex flex-wrap gap-1">
              {alphabet.map(letter => (
                <Button
                  key={letter}
                  size="sm"
                  className={selectedLetter === letter ? 'theme-btn-primary' : 'theme-outline-btn-primary'}
                  onClick={() => handleSelectLetter(letter)}
                  style={{
                    minWidth: 38,
                    height: 34,
                    fontWeight: 'var(--font-weight-bold)',
                    fontSize: 'var(--font-size-sm)',
                    borderRadius: 6,
                  }}
                >
                  {letter}
                </Button>
              ))}
            </div>
          </Card.Body>
        </Card>

        {/* No letter selected — hint */}
        {!selectedLetter && (
          <div className="text-center py-5 text-muted">
            <FontAwesomeIcon icon={faBoxes} size="3x" className="mb-3 opacity-25" />
            <p className="mb-1 fw-semibold" style={{ fontSize: 'var(--font-size-md)', fontWeight: 'var(--font-weight-semibold)' }}>
              Select a letter above
            </p>
            <small style={{ fontSize: 'var(--font-size-sm)' }}>Medicines starting with that letter will appear here</small>
          </div>
        )}

        {/* Medicines Table */}
        {selectedLetter && (
          <Card className="neat-card">
            <Card.Body className="p-0">
              {/* Card top bar */}
              <div className="px-3 py-3 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
                <div className="d-flex align-items-center gap-2">
                  <FontAwesomeIcon icon={faPills} className="text-primary" />
                  <span
                    className="fw-semibold"
                    style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)' }}
                  >
                    Medicines starting with
                  </span>
                  <Badge
                    className="theme-btn-primary px-3 py-2"
                    style={{ fontSize: 'var(--font-size-md)', fontWeight: 'var(--font-weight-bold)' }}
                  >
                    {selectedLetter}
                  </Badge>
                  <Badge bg="secondary" className="px-2 py-1" style={{ fontSize: 'var(--font-size-xs)' }}>
                    {filteredData.length} result{filteredData.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
                <div style={{ minWidth: 300 }}>
                  <SearchInput
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    placeholder="Search medicine, generic, company..."
                    resultCount={resultCount}
                    totalCount={totalCount}
                  />
                </div>
              </div>

              {isLoadingMedicines ? (
                <div className="text-center py-5">
                  <Spinner animation="border" size="sm" />
                </div>
              ) : filteredData.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <FontAwesomeIcon icon={faExclamationTriangle} size="2x" className="mb-2 opacity-25" />
                  <p className="mb-0" style={{ fontSize: 'var(--font-size-sm)' }}>
                    No medicines found for &lsquo;{selectedLetter}&rsquo;
                  </p>
                </div>
              ) : (
                <div style={{ maxHeight: '55vh', overflowY: 'auto' }}>
                  <Table hover className="mb-0 align-middle">
                    <thead
                      className="bg-light text-muted text-uppercase small"
                      style={{ position: 'sticky', top: 0, zIndex: 1 }}
                    >
                      <tr>
                        <th className="py-3 ps-4" style={{ width: '6%' }}>Sl.No</th>
                        <th className="py-3" style={{ width: '50%' }}>Medicine Name</th>
                        <th className="py-3" style={{ width: '22%' }}>Med Code</th>
                        <th className="py-3" style={{ width: '22%' }}>HSN Code</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((med, idx) => (
                        <tr key={med.prodsId}>
                          <td className="fw-bold text-muted ps-4" style={{ fontSize: 'var(--font-size-sm)' }}>
                            {idx + 1}
                          </td>
                          <td>
                            <Button
                              variant="link"
                              className="p-0 text-start d-flex align-items-center gap-2"
                              style={{
                                textDecoration: 'none',
                                fontSize: 'var(--font-size-sm)',
                                fontWeight: 'var(--font-weight-semibold)',
                              }}
                              onClick={() => handleOpenMedicine(med)}
                            >
                              <FontAwesomeIcon icon={faPlus} style={{ fontSize: 'var(--font-size-xs)', opacity: 0.5 }} />
                              {med.medicineName}
                            </Button>
                          </td>
                          <td style={{ fontSize: 'var(--font-size-sm)' }}>
                            <span className="text-muted">{med.medCode}</span>
                          </td>
                          <td style={{ fontSize: 'var(--font-size-sm)' }}>
                            <span className="text-muted">{med.hsnCode || '—'}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        )}
      </div>

      {/* Batch Stock Modal */}
      <Modal show={!!selectedMedicine} onHide={handleCloseModal} size="xl" centered>
        <Modal.Header closeButton className="border-bottom py-3 bg-light">
          <Modal.Title
            className="h5 fw-bold d-flex align-items-center gap-2"
            style={{ fontSize: 'var(--font-size-md)', fontWeight: 'var(--font-weight-bold)' }}
          >
            <FontAwesomeIcon icon={faBoxes} className="text-primary" />
            Initial Stock
            {selectedMedicine && (
              <Badge className="theme-badge-secondary px-3 py-2 ms-1" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-normal)' }}>
                {selectedMedicine.medicineName}
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
                    <span className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>Med Code</span>
                    <div className="fw-semibold" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)' }}>
                      {selectedMedicine.medCode}
                    </div>
                  </Col>
                  <Col xs="auto">
                    <span className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>HSN Code</span>
                    <div className="fw-semibold" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)' }}>
                      {selectedMedicine.hsnCode || '—'}
                    </div>
                  </Col>
                  <Col xs="auto" className="ms-auto d-flex align-items-center">
                    <Badge bg="secondary" className="px-3 py-2" style={{ fontSize: 'var(--font-size-xs)' }}>
                      {batches.length} batch{batches.length !== 1 ? 'es' : ''}
                    </Badge>
                  </Col>
                </Row>
              </div>

              <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>

                {/* ── Section 1: Current Stock ─────────────────────────────── */}
                <div className="px-4 pt-3 pb-1 d-flex align-items-center gap-2 border-bottom">
                  <FontAwesomeIcon icon={faBoxes} className="text-primary" style={{ fontSize: 'var(--font-size-sm)' }} />
                  <span
                    className="fw-semibold text-uppercase"
                    style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', letterSpacing: '0.06em' }}
                  >
                    Current Stock
                  </span>
                </div>

                {isLoadingBatches ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" size="sm" />
                  </div>
                ) : batches.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    <FontAwesomeIcon icon={faExclamationTriangle} size="2x" className="mb-2 opacity-25" />
                    <p className="mb-0" style={{ fontSize: 'var(--font-size-sm)' }}>No batch records found.</p>
                  </div>
                ) : (
                  <Table hover className="mb-0 align-middle">
                    <thead
                      className="bg-light text-muted text-uppercase small"
                      style={{ position: 'sticky', top: 0, zIndex: 1 }}
                    >
                      <tr>
                        <th className="py-3 ps-4" style={{ width: '5%' }}>Sl</th>
                        <th className="py-3" style={{ width: '20%' }}>Batch No</th>
                        <th className="py-3 text-end" style={{ width: '13%' }}>Avail. Stock</th>
                        <th className="py-3" style={{ width: '14%' }}>Expiry Date</th>
                        <th className="py-3 text-end" style={{ width: '10%' }}>MRP (₹)</th>
                        <th className="py-3 text-end" style={{ width: '18%' }}>Stock</th>
                        <th className="py-3 text-center" style={{ width: '20%' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {batches.map((batch, idx) => (
                        <tr key={batch.batchId}>
                          <td className="fw-bold text-muted ps-4" style={{ fontSize: 'var(--font-size-sm)' }}>{idx + 1}</td>
                          <td>
                            <Badge
                              className="theme-badge-secondary px-2 py-1"
                              style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)' }}
                            >
                              {batch.batchNo}
                            </Badge>
                          </td>
                          <td className="text-end fw-semibold" style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)' }}>
                            {(batch.availableStock ?? 0).toLocaleString()}
                          </td>
                          <td className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>
                            {batch.expiryDate || '—'}
                          </td>
                          <td className="text-end" style={{ fontSize: 'var(--font-size-sm)' }}>
                            {batch.mrp.toFixed(2)}
                          </td>
                          <td className="text-end">
                            <Form.Control
                              type="text"
                              inputMode="numeric"
                              size="sm"
                              className="text-end"
                              style={{ width: 110, display: 'inline-block' }}
                              value={formatNumberDisplay(batchValues[batch.batchId] ?? 0)}
                              onChange={e => handleValueChange(batch.batchId, e.target.value)}
                              onBlur={e => handleValueBlur(batch.batchId, e.target.value)}
                              placeholder="0"
                            />
                          </td>
                          <td className="text-center" style={{ minWidth: 90 }}>
                            {(batchValues[batch.batchId] ?? 0) >= 1 && (
                              <Button
                                size="sm"
                                className="theme-btn-primary"
                                onClick={() => handleAdd(batch)}
                                disabled={isSubmitting[batch.batchId]}
                              >
                                <FontAwesomeIcon icon={faPlus} className="me-1" />
                                {isSubmitting[batch.batchId] ? 'Adding...' : 'ADD'}
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {/* Total row */}
                      <tr style={{ background: 'var(--color-surface-subtle, #f8f9fa)' }}>
                        <td colSpan={2} className="py-2 ps-4 fw-semibold text-danger" style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)' }}>
                          Total
                        </td>
                        <td className="text-end py-2 fw-bold text-danger" style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-sm)' }}>
                          {batches.reduce((sum, b) => sum + (b.availableStock ?? 0), 0).toLocaleString()}
                        </td>
                        <td colSpan={4} />
                      </tr>
                    </tbody>
                  </Table>
                )}
              </div>
            </>
          )}
        </Modal.Body>

        <Modal.Footer className="border-top">
          <Button className="theme-outline-btn-primary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default InitialStocks;