import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../../../state/store';
import { Table, Button, Form, Modal, Container, Row, Col } from 'react-bootstrap';
import { faBoxes } from '@fortawesome/free-solid-svg-icons';
import PageHeader from '../../../../../components/PageHeader';
import SearchInput from '../../../../../components/SearchInput';
import { useTableSearch } from '../../../../../hooks/useTableSearch';
import Swal from 'sweetalert2';
import '../../../../../style/commonStyle.css';
import CentralStoresApiService, { ProductResponse, GenericDetailsResponse, DealerResponse, BatchResponse, SaveBatchRequest } from '../../../../../api/central-stores/central-stores-api-service';
import { handleError } from '../../../../../utils/errorUtil';

interface MedicineItem {
  id: number;
  itemName: string;
  itemCode: string;
  genericName: string;
  manufacturerName: string;
  genericId: number;
  manufacturerId: number;
}

interface Batch {
  id: number;
  batchNo: string;
  prodsId: number;
  productName: string;
  mfgDate: string;
  expiryDate: string;
  dateBatchIn: string;
  isActive: number;
  uid: number;
  cost: number;
  mrp: number;
  disc: number;
  salesPrice: number;
  sgstPer: number;
  cgstPer: number;
  igstPer: number;
}

const BatchMaster: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const loginData = useSelector((state: RootState) => state.loginData);
  const centralStoresApi = new CentralStoresApiService();
  
  // Get sub-module data from session storage
  const [subModuleData, setSubModuleData] = useState<any>(null);
  
  const [medicines, setMedicines] = useState<MedicineItem[]>([]);
  const [generics, setGenerics] = useState<GenericDetailsResponse[]>([]);
  const [manufacturers, setManufacturers] = useState<DealerResponse[]>([]);
  const [oldBatches, setOldBatches] = useState<Batch[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<MedicineItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingBatchId, setEditingBatchId] = useState<number | null>(null);

  const resetBatchForm = () => {
    setFormData({
      batchNo: '',
      mfgDate: '',
      expiryDate: '',
      cost: '',
      mrp: '',
      disc: '',
      sgstPer: '',
      cgstPer: '',
      igstPer: '',
      salesPrice: ''
    });
  };
  
  const [formData, setFormData] = useState({
    batchNo: '',
    mfgDate: '',
    expiryDate: '',
    cost: '',
    mrp: '',
    disc: '',
    sgstPer: '',
    cgstPer: '',
    igstPer: '',
    salesPrice:''
  });

  const igstValue = parseFloat(formData.igstPer) || 0;
  const sgstValue = parseFloat(formData.sgstPer) || 0;
  const cgstValue = parseFloat(formData.cgstPer) || 0;
  const mrpValue = parseFloat(formData.mrp) || 0;
  const discountValue = parseFloat(formData.disc) || 0;
  const calculatedSellingPrice = Math.max(0, mrpValue - discountValue);
  const isIgstActive = igstValue > 0;
  const isSgstOrCgstActive = sgstValue > 0 || cgstValue > 0;

  // Load sub-module data from session storage
  // Use pharmacySubModuleData when accessed from pharmacy-stores, otherwise selectedStore
  useEffect(() => {
    const isPharmacy = location.pathname.includes('pharmacy-stores');
    const key = isPharmacy ? 'pharmacySubModuleData' : 'selectedStore';
    const storedData = sessionStorage.getItem(key);
    if (storedData) {
      setSubModuleData(JSON.parse(storedData));
    }
  }, [location.pathname]);
  // Table search hook
  const { filteredData: filteredMedicines, searchTerm, setSearchTerm, resultCount, totalCount } = useTableSearch({
    data: medicines,
    searchFields: ['itemName', 'itemCode', 'genericName', 'manufacturerName'],
  });

  // Load master data (generics and manufacturers)
  useEffect(() => {
    if (!loginData.authorized) {
      navigate('/login');
      return;
    }
    
    const loadMasterData = async () => {
      try {
        // Load Generics
        const genericsData = await centralStoresApi.fetchAllGenerics();
        setGenerics(genericsData);
        
        // Load Manufacturers
        const manufacturersData = await centralStoresApi.fetchAllManufacturers();
        setManufacturers(manufacturersData);
      } catch (error) {
        console.error('Error loading master data:', error);
        handleError(dispatch as any, error);
      }
    };
    
    loadMasterData();
  }, [loginData, navigate]);

  // Load medicines after master data is loaded
  useEffect(() => {
    if (generics.length > 0 && manufacturers.length > 0 && subModuleData) {
      loadMedicines();
    }
  }, [generics, manufacturers, subModuleData]);

  const loadMedicines = async () => {
    if (!subModuleData) return;
    
    try {
      setLoading(true);
      const isPharmacy = location.pathname.includes('pharmacy-stores');
      const phModId = isPharmacy ? 2 : Number(subModuleData.masterId);
      const products: ProductResponse[] = await centralStoresApi.fetchAllProducts(phModId);
      
      const mappedMedicines: MedicineItem[] = products.map((p) => {
        const generic = generics.find(g => g.id === p.genericId);
        const manufacturer = manufacturers.find(m => m.id === p.companyId);
        
        return {
          id: p.id,
          itemName: p.name || '',
          itemCode: p.medCode || '',
          genericName: generic?.name || '',
          manufacturerName: manufacturer?.name || '',
          genericId: p.genericId ?? 0,
          manufacturerId: p.companyId ?? 0
        };
      });
      
      setMedicines(mappedMedicines);
    } catch (error) {
      console.error('Error loading medicines:', error);
      handleError(dispatch as any, error);
    } finally {
      setLoading(false);
    }
  };

  const handleMedicineClick = async (medicine: MedicineItem) => {
    console.log('Medicine clicked:', medicine);
    setSelectedMedicine(medicine);
    setEditingBatchId(null);
    resetBatchForm();
    
    setShowModal(true);
    
    // Load old batches for this medicine from API
    try {
      console.log('Fetching batches for prodsId:', medicine.id);
      const batches = await centralStoresApi.fetchAllBatches(medicine.id);
      console.log('All batches from API:', batches);
      
      // Filter batches by prodsId on frontend (backend returning all batches)
      const filteredBatches = batches ? batches.filter(batch => batch.prodsId === medicine.id) : [];
      console.log('Filtered batches for this medicine:', filteredBatches);
      
      setOldBatches(filteredBatches);
    } catch (error) {
      console.error('Error loading batches:', error);
      handleError(dispatch as any, error);
      setOldBatches([]);
    }
  };

  const handleEditBatch = (batch: Batch) => {
    const toInputDate = (value: string | null | undefined) => {
      if (!value) {
        return '';
      }
      return String(value).split('T')[0] || '';
    };

    setEditingBatchId(batch.id);
    setFormData({
      batchNo: batch.batchNo,
      mfgDate: toInputDate(batch.mfgDate), // Convert to YYYY-MM-DD format safely
      expiryDate: toInputDate(batch.expiryDate),
      cost: batch.cost.toString(),
      mrp: batch.mrp.toString(),
      disc: batch.disc.toString(),
      sgstPer: batch.sgstPer.toString(),
      cgstPer: batch.cgstPer.toString(),
      igstPer: batch.igstPer.toString(),
      salesPrice: batch.salesPrice.toString()
    });
  };

  const handleCancelEditBatch = () => {
    setEditingBatchId(null);
    resetBatchForm();
  };

  const handleSaveBatch = async () => {
    if (!formData.batchNo.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Batch Number is required!',
        confirmButtonColor: '#ffc107'
      });
      return;
    }

    if (!formData.mfgDate || !formData.expiryDate) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Manufacturing Date and Expiry Date are required!',
        confirmButtonColor: '#ffc107'
      });
      return;
    }

    if (new Date(formData.expiryDate) <= new Date(formData.mfgDate)) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Expiry date must be after manufacturing date!',
        confirmButtonColor: '#ffc107'
      });
      return;
    }

    if (igstValue > 0 && (sgstValue > 0 || cgstValue > 0)) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Use either IGST or SGST/CGST, not both.',
        confirmButtonColor: '#ffc107'
      });
      return;
    }

    if (igstValue === 0 && (sgstValue > 0 || cgstValue > 0) && (sgstValue === 0 || cgstValue === 0)) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Enter both SGST and CGST values together, or use IGST only.',
        confirmButtonColor: '#ffc107'
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Add Batch?',
      text: `Add batch ${formData.batchNo} for ${selectedMedicine?.itemName}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, Add'
    });

    if (!result.isConfirmed) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const batchData: SaveBatchRequest = {
        batchNo: formData.batchNo,
        prodsId: selectedMedicine?.id || 0,
        mfgDate: formData.mfgDate,
        expiryDate: formData.expiryDate,
        dateBatchIn: today,
        isActive: 1,
        userLog: loginData.name || '',
        cost: parseFloat(formData.cost) || 0,
        mrp: mrpValue,
        disc: discountValue,
        salesPrice: calculatedSellingPrice,
        sgstPer: parseFloat(formData.sgstPer) || 0,
        cgstPer: parseFloat(formData.cgstPer) || 0,
        igstPer: parseFloat(formData.igstPer) || 0
      };

      console.log('Saving batch:', batchData);
      
      if (editingBatchId) {
        // Update existing batch
        await centralStoresApi.updateBatch(editingBatchId, batchData);
        
        await Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Batch updated successfully',
          confirmButtonColor: '#28a745'
        });
      } else {
        // Create new batch
        await centralStoresApi.saveBatch(batchData);
        
        await Swal.fire({
          icon: 'success',
          title: 'Added!',
          text: 'Batch added successfully',
          confirmButtonColor: '#28a745'
        });
      }

      setShowModal(false);
      setEditingBatchId(null);
      resetBatchForm();
      
      // Reload batches for the selected medicine
      if (selectedMedicine) {
        const batches = await centralStoresApi.fetchAllBatches(selectedMedicine.id);
        const filteredBatches = batches ? batches.filter(batch => batch.prodsId === selectedMedicine.id) : [];
        setOldBatches(filteredBatches);
      }
    } catch (error: any) {
      console.error('Error saving batch:', error);
      handleError(dispatch as any, error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to save batch. Please try again.',
        confirmButtonColor: '#dc3545'
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header Section */}
      <div style={{ flexShrink: 0 }}>
        <PageHeader
          icon={faBoxes}
          title="Batch Master"
          subtitle="Manage medicine batch details"
          badges={[
            { label: 'Total Items', value: totalCount },
            { label: 'Search Results', value: resultCount }
          ]}
        />
        
        <Container fluid className="mt-3">
          <Row className="align-items-center">
            <Col md={12}>
              <SearchInput
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                placeholder="Search by medicine, generic, manufacturer..."
                resultCount={resultCount}
                totalCount={totalCount}
              />
            </Col>
          </Row>
        </Container>
      </div>

      {/* Table Section */}
      <div style={{ flexGrow: 1, overflow: 'auto', padding: '0 1rem 1rem 1rem' }}>
        {loading ? (
          <div className="text-center" style={{ padding: '50px' }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading medicines...</p>
          </div>
        ) : (
          <Table striped bordered hover>
            <thead style={{ position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1 }}>
              <tr>
                <th style={{ width: '5%' }}>S.No</th>
                <th style={{ width: '35%' }}>Medicine Name</th>
                <th style={{ width: '30%' }}>Generic Name</th>
                <th style={{ width: '30%' }}>Manufacturer</th>
              </tr>
            </thead>
            <tbody>
              {filteredMedicines.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-muted">
                    <i className="fas fa-inbox" style={{ fontSize: '2rem', opacity: 0.3 }}></i>
                    <p>No medicines found</p>
                  </td>
                </tr>
              ) : (
                filteredMedicines.map((medicine, index) => (
                  <tr 
                    key={medicine.id} 
                    onClick={() => handleMedicineClick(medicine)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>{index + 1}</td>
                    <td><strong>{medicine.itemName}</strong> <code style={{ fontSize: '11px', backgroundColor: '#e7f3ff', color: '#0066cc', padding: '3px 8px', borderRadius: '4px', marginLeft: '8px' }}>{medicine.itemCode}</code></td>
                    <td><span style={{ backgroundColor: '#f0f0f0', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 500 }}>{medicine.genericName}</span></td>
                    <td>{medicine.manufacturerName}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        )}
      </div>

        <Modal show={showModal} onHide={() => setShowModal(false)} centered size="xl" backdrop="static" keyboard={false}>
          <Modal.Header closeButton style={{ background: 'var(--page-header-bg)', color: 'var(--page-header-text)' }}>
            <Modal.Title>
              <i className="fas fa-barcode"></i>
              {' '}{editingBatchId ? 'Edit Batch for' : 'Add Batch for'} <strong>{selectedMedicine?.itemName} / {selectedMedicine?.genericName} / <strong>Manufacturer:</strong> {selectedMedicine?.manufacturerName}</strong>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {editingBatchId && (
              <div className="mb-3 p-2" style={{ background: 'var(--page-header-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', fontWeight: 'var(--font-weight-semibold)' }}>
                Currently editing batch: {formData.batchNo || oldBatches.find((batch) => batch.id === editingBatchId)?.batchNo || '-'}
              </div>
            )}
            {/* <div className="mb-3 p-3" style={{ background: '#f8f9fa', borderRadius: '6px', border: '1px solid #dee2e6' }}>
              <strong>Medicine:</strong> {selectedMedicine?.itemName} <br />
              <strong>Generic:</strong> {selectedMedicine?.genericName} <br />
              <strong>Manufacturer:</strong> {selectedMedicine?.manufacturerName}
            </div> */}

            <Form>
              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Batch Number <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.batchNo}
                      onChange={(e) => setFormData({ ...formData, batchNo: e.target.value })}
                      placeholder="Enter batch number"
                    />
                  </Form.Group>
                </div>
                <div className="col-md-3">
                  <Form.Group className="mb-3">
                    <Form.Label>Manufacturing Date <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="date"
                      value={formData.mfgDate}
                      onChange={(e) => setFormData({ ...formData, mfgDate: e.target.value })}
                    />
                  </Form.Group>
                </div>
                <div className="col-md-3">
                  <Form.Group className="mb-3">
                    <Form.Label>Expiry Date <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    />
                  </Form.Group>
                </div>
              </div>

              <div className="row">
                <div className="col-md-3">
                  <Form.Group className="mb-3">
                    <Form.Label>Cost (₹)</Form.Label>
                    <Form.Control
                      type="number"
                      value={formData.cost}
                      onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                      placeholder="0.00"
                      step="0.01"
                    />
                  </Form.Group>
                </div>
                <div className="col-md-3">
                  <Form.Group className="mb-3">
                    <Form.Label>MRP (₹)</Form.Label>
                    <Form.Control
                      type="number"
                      value={formData.mrp}
                      onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                      placeholder="0.00"
                      step="0.01"
                    />
                  </Form.Group>
                </div>
                <div className="col-md-3">
                  <Form.Group className="mb-3">
                    <Form.Label>Discount (₹)</Form.Label>
                    <Form.Control
                      type="number"
                      value={formData.disc}
                      onChange={(e) => setFormData({ ...formData, disc: e.target.value })}
                      placeholder="0.00"
                      step="0.01"
                    />
                  </Form.Group>
                </div>
                <div className="col-md-3">
                  <Form.Group className="mb-3">
                    <Form.Label>Selling Price (₹)</Form.Label>
                    <Form.Control
                      type="number"
                      value={calculatedSellingPrice}
                      placeholder="0.00"
                      readOnly
                      tabIndex={-1}
                    />
                  </Form.Group>
                </div>
              </div>

              <div className="row">
                <div className="col-md-4">
                  <Form.Group className="mb-3">
                    <Form.Label>SGST %</Form.Label>
                    <Form.Control
                      type="number"
                      value={formData.sgstPer}
                      onChange={(e) => setFormData({ ...formData, sgstPer: e.target.value, igstPer: '' })}
                      placeholder="0"
                      step="0.01"
                      disabled={isIgstActive}
                    />
                  </Form.Group>
                </div>
                <div className="col-md-4">
                  <Form.Group className="mb-3">
                    <Form.Label>CGST %</Form.Label>
                    <Form.Control
                      type="number"
                      value={formData.cgstPer}
                      onChange={(e) => setFormData({ ...formData, cgstPer: e.target.value, igstPer: '' })}
                      placeholder="0"
                      step="0.01"
                      disabled={isIgstActive}
                    />
                  </Form.Group>
                </div>
                <div className="col-md-4">
                  <Form.Group className="mb-3">
                    <Form.Label>IGST %</Form.Label>
                    <Form.Control
                      type="number"
                      value={formData.igstPer}
                      onChange={(e) => setFormData({ ...formData, igstPer: e.target.value, sgstPer: '', cgstPer: '' })}
                      placeholder="0"
                      step="0.01"
                      disabled={isSgstOrCgstActive}
                    />
                  </Form.Group>
                </div>
              </div>
            </Form>

            <hr />
            
            <h6 className="mb-3">
              <i className="fas fa-history"></i> Old Batches of this Medicine
            </h6>
            <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
              <Table striped bordered hover size="sm">
                <thead className='sticky-top'>
                  <tr>
                    <th>Batch No</th>
                    <th>Mfg Date</th>
                    <th>Exp Date</th>
                    <th>Cost</th>
                    <th>MRP</th>
                    <th>Disc</th>
                    <th>SGST%</th>
                    <th>CGST%</th>
                    <th>IGST%</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {oldBatches.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center text-muted">
                        No old batches found
                      </td>
                    </tr>
                  ) : (
                    oldBatches.map((batch) => (
                      <tr
                        key={batch.id}
                        style={{
                          backgroundColor: editingBatchId === batch.id ? 'var(--page-header-bg)' : 'transparent',
                          fontWeight: editingBatchId === batch.id ? 'var(--font-weight-semibold)' : 'var(--font-weight-normal)'
                        }}
                      >
                        <td><code className="code-badge">{batch.batchNo}</code></td>
                        <td>{new Date(batch.mfgDate).toLocaleDateString('en-GB')}</td>
                        <td>{new Date(batch.expiryDate).toLocaleDateString('en-GB')}</td>
                        <td>₹{batch.cost.toFixed(2)}</td>
                        <td>₹{batch.mrp.toFixed(2)}</td>
                        <td>₹{batch.disc.toFixed(2)}</td>
                        <td>{batch.sgstPer}%</td>
                        <td>{batch.cgstPer}%</td>
                        <td>{batch.igstPer}%</td>
                        <td>
                          <Button 
                            variant={editingBatchId === batch.id ? 'success' : 'warning'}
                            size="sm" 
                            onClick={() => handleEditBatch(batch)}
                            disabled={editingBatchId !== null && editingBatchId !== batch.id}
                          >
                            <i className={`fas ${editingBatchId === batch.id ? 'fa-check-circle' : 'fa-edit'}`}></i>{' '}
                            {editingBatchId === batch.id ? 'Editing' : 'Edit'}
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </Modal.Body>
          <Modal.Footer>
            {editingBatchId && (
              <Button variant="warning" onClick={handleCancelEditBatch}>
                <i className="fas fa-undo"></i> Cancel Edit
              </Button>
            )}
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              <i className="fas fa-times"></i> Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveBatch}>
              <i className="fas fa-save"></i> {editingBatchId ? 'Update Batch' : 'Save Batch'}
            </Button>
          </Modal.Footer>
        </Modal>
    </div>
  );
};

export default BatchMaster;
