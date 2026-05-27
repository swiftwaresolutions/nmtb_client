import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../../state/store';
import { Table, Button, Form, Modal, Container, Row, Col } from 'react-bootstrap';
import { faIndustry } from '@fortawesome/free-solid-svg-icons';
import PageHeader from '../../../../../components/PageHeader';
import { useTableSearch } from '../../../../../hooks/useTableSearch';
import SearchInput from '../../../../../components/SearchInput';
import '../../../../../style/commonStyle.css';
import CentralStoresApiService, { DealerResponse, SaveDealerRequest, UpdateDealerRequest } from '../../../../../api/central-stores/central-stores-api-service';
import {
  showSuccessToast,
  showErrorToast,
  showConfirmDialog,
  showValidationError,
} from '../../../../../utils/alertUtil';

interface Manufacturer {
  id: number;
  name: string;
  gstNumber: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  isActive: boolean;
  createdDate: string;
}

const ManufacturerMaster: React.FC = () => {
  const navigate = useNavigate();
  const loginData = useSelector((state: RootState) => state.loginData);
  
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedManufacturer, setSelectedManufacturer] = useState<Manufacturer | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    gstNumber: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    email: ''
  });

  // Initialize API service
  const centralStoresApi = new CentralStoresApiService();

  // Load manufacturers from API
  const loadManufacturers = async () => {
    const selectedStoreStr = sessionStorage.getItem('selectedStore');
    const selectedStore = selectedStoreStr ? JSON.parse(selectedStoreStr) as { masterId?: number } : null;
    const masterId = Number(selectedStore?.masterId ?? 0);

    try {
      setLoading(true);
      const response: DealerResponse[] = await centralStoresApi.fetchAllManufacturers();
      const filtered = masterId ? response.filter((dealer) => dealer.storeId === masterId) : response;

      // Map DealerResponse to Manufacturer interface
      const mappedManufacturers: Manufacturer[] = filtered.map((dealer: DealerResponse) => ({
        id: dealer.id,
        name: dealer.name,
        gstNumber: dealer.gstNo || '',
        address: dealer.address || '',
        city: dealer.city || '',
        state: dealer.state || '',
        pincode: dealer.pin || '',
        phone: dealer.phone || '',
        email: dealer.email || '',
        isActive: dealer.isActive === 1,
        createdDate: dealer.dateTime || ''
      }));
      
      setManufacturers(mappedManufacturers);
    } catch (error: any) {
      console.error('Error loading manufacturers:', error);
      showErrorToast('Failed to load manufacturers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Table search hook
  const { filteredData, searchTerm, setSearchTerm, resultCount, totalCount } = useTableSearch({
    data: manufacturers,
    searchFields: ['name', 'gstNumber', 'city'],
  });

  useEffect(() => {
    if (!loginData.authorized) {
      navigate('/login');
      return;
    }
    loadManufacturers();
  }, [loginData, navigate]);

  const handleAdd = () => {
    setIsEdit(false);
    setSelectedManufacturer(null);
    setFormData({
      name: '',
      gstNumber: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      phone: '',
      email: ''
    });
    setShowModal(true);
  };

  const handleEdit = (manufacturer: Manufacturer) => {
    setIsEdit(true);
    setSelectedManufacturer(manufacturer);
    setFormData({
      name: manufacturer.name,
      gstNumber: manufacturer.gstNumber,
      address: manufacturer.address,
      city: manufacturer.city,
      state: manufacturer.state,
      pincode: manufacturer.pincode,
      phone: manufacturer.phone,
      email: manufacturer.email
    });
    setShowModal(true);
  };

  const handleBlock = async (manufacturer: Manufacturer) => {
    const action = manufacturer.isActive ? 'block' : 'unblock';
    const confirmed = await showConfirmDialog(
      `${action.charAt(0).toUpperCase() + action.slice(1)} Manufacturer?`,
      `Are you sure you want to ${action} "${manufacturer.name}"?`
    );

    if (!confirmed) return;

    const selectedStoreStr = sessionStorage.getItem('selectedStore');
    const selectedStore = selectedStoreStr ? JSON.parse(selectedStoreStr) as { masterId?: number } : null;
    const masterId = Number(selectedStore?.masterId ?? 0);

    try {
      setLoading(true);
      const payload: UpdateDealerRequest = {
        name: manufacturer.name,
        address: manufacturer.address,
        city: manufacturer.city,
        pin: manufacturer.pincode,
        phone: manufacturer.phone,
        openBalance: 0,
        email: manufacturer.email,
        web: '',
        fax: '',
        supclass: '',
        state: manufacturer.state,
        deliveryTime: '0',
        paymentTime: '0',
        gstNo: manufacturer.gstNumber,
        storeId: masterId,
        isActive: manufacturer.isActive ? 0 : 1
      };

      await centralStoresApi.updateDealer(manufacturer.id, payload);
      showSuccessToast(`Manufacturer ${action}ed successfully`);
      loadManufacturers();
    } catch (error: any) {
      console.error(`Error ${action}ing manufacturer:`, error);
      showErrorToast(`Failed to ${action} manufacturer. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!formData.name.trim()) {
      showValidationError('Manufacturer Name is required!', 'Required Field');
      return;
    }

    // Check for duplicate name
    const duplicateExists = manufacturers.some(mfr => {
      // When editing, exclude the current manufacturer from the check
      if (isEdit && selectedManufacturer && mfr.id === selectedManufacturer.id) {
        return false;
      }
      return mfr.name.toLowerCase() === formData.name.trim().toLowerCase();
    });
    
    if (duplicateExists) {
      showValidationError(`Manufacturer "${formData.name}" already exists!`, 'Duplicate Entry');
      return;
    }

    const confirmed = await showConfirmDialog(
      isEdit ? 'Update Manufacturer?' : 'Add Manufacturer?',
      formData.name
    );

    if (!confirmed) return;

    const selectedStoreStr = sessionStorage.getItem('selectedStore');
    const selectedStore = selectedStoreStr ? JSON.parse(selectedStoreStr) as { masterId?: number } : null;
    const masterId = Number(selectedStore?.masterId ?? 0);

    try {
      setLoading(true);
      // Prepare payload
      const payload: SaveDealerRequest | UpdateDealerRequest = {
        name: formData.name,
        address: formData.address || '',
        city: formData.city || '',
        pin: formData.pincode || '',
        phone: formData.phone || '',
        openBalance: 0,
        email: formData.email || '',
        web: '',
        fax: '',
        supclass: '', // Empty string to avoid byte deserialization error
        state: formData.state || '',
        deliveryTime: '0',
        paymentTime: '0',
        gstNo: formData.gstNumber || '',
        storeId: masterId,
        isActive: 1

      };

      // Call API
      if (isEdit && selectedManufacturer) {
        await centralStoresApi.updateDealer(selectedManufacturer.id, payload as UpdateDealerRequest);
        showSuccessToast('Manufacturer updated successfully');
      } else {
        await centralStoresApi.saveDealer(payload as SaveDealerRequest);
        showSuccessToast('Manufacturer added successfully');
      }

      // Close modal and refresh list
      setShowModal(false);
      loadManufacturers();
    } catch (error: any) {
      console.error('Error saving manufacturer:', error);
      showErrorToast('Failed to save manufacturer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header Section */}
      <div style={{ flexShrink: 0 }}>
        <PageHeader
          icon={faIndustry}
          title="Manufacturer Master"
          subtitle="Manage pharmaceutical companies"
          badges={[
            { label: 'Total Manufacturers', value: totalCount },
            { label: 'Search Results', value: resultCount }
          ]}
        />
        
        <Container fluid className="mt-3">
          <Row className="align-items-center">
            <Col md={6}>
              <SearchInput
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                placeholder="Search by name, GST number, or city..."
                resultCount={resultCount}
                totalCount={totalCount}
              />
            </Col>
            <Col md={6} className="text-end">
              <Button variant="primary" onClick={handleAdd}>
                + Add Manufacturer
              </Button>
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
            <p className="mt-3">Loading manufacturers...</p>
          </div>
        ) : (
          <Table striped bordered hover>
            <thead style={{ position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1 }}>
              <tr>
                <th style={{ width: '5%' }}>S.No</th>
                <th style={{ width: '30' }}>Name</th>
                <th style={{ width: '15%' }}>GST Number</th>
                <th style={{ width: '15%' }}>City</th>
                <th style={{ width: '15%' }}>Phone</th>
                <th style={{ width: '15%' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center">No manufacturers found</td>
                </tr>
              ) : (
                filteredData.map((mfr, index) => (
                      <tr key={mfr.id} style={{ opacity: mfr.isActive ? 1 : 0.6 }}>
                        <td>{index + 1}</td>
                        <td>
                          <strong>{mfr.name}</strong>
                          {!mfr.isActive && <span className="badge bg-danger ms-2" style={{ fontSize: '10px' }}>Blocked</span>}
                        </td>
                        <td><code style={{ fontSize: '11px' }}>{mfr.gstNumber}</code></td>
                        <td>{mfr.city}, {mfr.state}</td>
                        <td>{mfr.phone}</td>
                        <td>
                          <div className="action-buttons">
                            <Button variant="primary" size="sm" onClick={() => handleEdit(mfr)} title="Edit">
                              <i className="fas fa-edit"></i>
                              <span style={{ marginLeft: '5px' }}>Edit</span>
                            </Button>
                            <Button 
                              variant={mfr.isActive ? 'danger' : 'success'} 
                              size="sm" 
                              onClick={() => handleBlock(mfr)}
                              title={mfr.isActive ? 'Block' : 'Unblock'}
                            >
                              <i className={mfr.isActive ? 'fas fa-ban' : 'fas fa-check-circle'}></i>
                              <span style={{ marginLeft: '5px' }}>{mfr.isActive ? 'Block' : 'Unblock'}</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            )}
          </div>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{isEdit ? 'Edit Manufacturer' : 'Add Manufacturer'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Manufacturer Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter manufacturer name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>GST Number</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="15 digit GST number"
                    value={formData.gstNumber}
                    onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
                    maxLength={15}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Enter address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={5}>
                <Form.Group className="mb-3">
                  <Form.Label>City</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>State</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Pincode</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Pincode"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    maxLength={6}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : (isEdit ? 'Update' : 'Save')}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManufacturerMaster;
