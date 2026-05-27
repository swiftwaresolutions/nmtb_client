import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Col, Container, Form, Modal, Row, Table } from 'react-bootstrap';
import { faBuilding } from '@fortawesome/free-solid-svg-icons';
import { RootState } from '../../../../../state/store';
import PageHeader, { BadgeInfo } from '../../../../../components/PageHeader';
import SearchInput from '../../../../../components/SearchInput';
import { useTableSearch } from '../../../../../hooks/useTableSearch';
import CentralStoresApiService, {
  CompanyResponse,
  SaveCompanyRequest,
  UpdateCompanyRequest,
} from '../../../../../api/central-stores/central-stores-api-service';
import {
  showConfirmDialog,
  showErrorToast,
  showSuccessToast,
  showValidationError,
} from '../../../../../utils/alertUtil';
import { handleError } from '../../../../../utils/errorUtil';
import '../../../../../style/commonStyle.css';

interface CompanyItem {
  id: number;
  name: string;
  code: string;
  address: string;
  city: string;
  pin: string;
  phone: string;
  email: string;
  web: string;
  fax: string;
  state: string;
  storeId: number;
  createdDate: string;
}

interface SelectedStoreInfo {
  masterId?: number;
}

const emptyFormData = {
  name: '',
  code: '',
  address: '',
  city: '',
  pin: '',
  phone: '',
  email: '',
  web: '',
  fax: '',
  state: '',
};

const CompanyNameMaster: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loginData = useSelector((state: RootState) => state.loginData);
  const centralStoresApi = new CentralStoresApiService();

  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<CompanyItem | null>(null);
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [formData, setFormData] = useState(emptyFormData);

  const { filteredData: filteredCompanies, searchTerm, setSearchTerm, resultCount, totalCount } = useTableSearch({
    data: companies,
    searchFields: ['name', 'code', 'city', 'state', 'phone', 'email'],
  });

  const loadCompanies = async (storeId?: number | null) => {
    try {
      setLoading(true);
      const response: CompanyResponse[] = await centralStoresApi.fetchAllCompanies();

      const mappedCompanies: CompanyItem[] = response
        .map((company) => ({
          id: company.id,
          name: company.name || '',
          code: company.code || '',
          address: company.address || '',
          city: company.city || '',
          pin: company.pin || '',
          phone: company.phone ? String(company.phone) : '',
          email: company.email || '',
          web: company.web || '',
          fax: company.fax || '',
          state: company.state || '',
          storeId: company.storeId || 0,
          createdDate: company.dateTime || '',
        }));

      setCompanies(mappedCompanies);
    } catch (error) {
      console.error('Error loading companies:', error);
      handleError(dispatch as any, error);
      showErrorToast('Failed to load companies. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loginData.authorized) {
      navigate('/login');
      return;
    }

    const stored = sessionStorage.getItem('selectedStore');
    let storeId: number | null = null;

    if (stored) {
      try {
        const parsedStore = JSON.parse(stored) as SelectedStoreInfo;
        storeId = parsedStore.masterId ?? null;
      } catch (error) {
        console.error('Error parsing selected store:', error);
      }
    }

    setSelectedStoreId(storeId);
    loadCompanies(storeId);
  }, [loginData.authorized, navigate]);

  const handleAdd = () => {
    setIsEdit(false);
    setSelectedCompany(null);
    setFormData(emptyFormData);
    setShowModal(true);
  };

  const handleEdit = (company: CompanyItem) => {
    setIsEdit(true);
    setSelectedCompany(company);
    setFormData({
      name: company.name,
      code: company.code,
      address: company.address,
      city: company.city,
      pin: company.pin,
      phone: company.phone,
      email: company.email,
      web: company.web,
      fax: company.fax,
      state: company.state,
    });
    setShowModal(true);
  };

  const handleModalClose = () => {
    if (isSubmitting) {
      return;
    }

    setShowModal(false);
    setIsEdit(false);
    setSelectedCompany(null);
    setFormData(emptyFormData);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      showValidationError('Company Name is required!');
      return;
    }

    if (!selectedStoreId) {
      showErrorToast('Store information not found. Please reselect the store.');
      return;
    }

    const duplicateByName = companies.find(
      (company) =>
        company.name.toLowerCase() === formData.name.trim().toLowerCase() &&
        (!isEdit || company.id !== selectedCompany?.id)
    );

    const duplicateByCode = formData.code.trim()
      ? companies.find(
          (company) =>
            company.code.toLowerCase() === formData.code.trim().toLowerCase() &&
            (!isEdit || company.id !== selectedCompany?.id)
        )
      : undefined;

    if (duplicateByName) {
      showValidationError(`Company with name "${formData.name.trim()}" already exists!`);
      return;
    }

    if (duplicateByCode) {
      showValidationError(`Company with code "${formData.code.trim()}" already exists!`);
      return;
    }

    const confirmed = await showConfirmDialog(
      isEdit ? 'Update Company?' : 'Add Company?',
      formData.name.trim()
    );

    if (!confirmed) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: SaveCompanyRequest | UpdateCompanyRequest = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        pin: formData.pin.trim(),
        phone: Number(formData.phone) || 0,
        email: formData.email.trim(),
        web: formData.web.trim(),
        fax: formData.fax.trim(),
        state: formData.state.trim(),
        storeId: selectedStoreId,
      };

      if (isEdit && selectedCompany) {
        await centralStoresApi.updateCompany(selectedCompany.id, payload as UpdateCompanyRequest);
        showSuccessToast('Company updated successfully');
      } else {
        await centralStoresApi.saveCompany(payload as SaveCompanyRequest);
        showSuccessToast('Company added successfully');
      }

      setShowModal(false);
      setIsEdit(false);
      setSelectedCompany(null);
      setFormData(emptyFormData);
      await loadCompanies(selectedStoreId);
    } catch (error: any) {
      console.error('Error saving company:', error);
      handleError(dispatch as any, error);
      showErrorToast(error?.response?.data?.message || error?.response?.data?.error || 'Failed to save company. Please try again.');
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
  };

  const badges: BadgeInfo[] = [
    { label: 'Total Companies', value: totalCount },
    { label: 'Search Results', value: resultCount },
  ];

  return (
    <Container fluid style={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column', paddingBottom: '4px', overflow: 'hidden' }}>
      <PageHeader
        icon={faBuilding}
        title="Company Name Master"
        subtitle="Manage medical store company records"
        badges={badges}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column',  minHeight: 0 }}>
        <Card className="shadow-sm d-flex flex-column flex-grow-1" style={{ minHeight: 0 }}>
          <Card.Header style={{ flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 320px', minWidth: 0 }}>
                <SearchInput
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  placeholder="Search by name, code, city, state, phone..."
                  resultCount={resultCount}
                  totalCount={totalCount}
                />
              </div>
              <Button variant="success" onClick={handleAdd}>
                <i className="fas fa-plus-circle"></i> Add New
              </Button>
            </div>
          </Card.Header>

          <Card.Body style={{ padding: 0, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <div style={{ flex: 1, overflow: 'auto' }}>
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p style={{ marginTop: '15px', color: 'var(--text-muted)' }}>Loading companies...</p>
                </div>
              ) : (
                <Table striped bordered hover style={{ margin: 0 }}>
                  <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--table-header-bg)', color: 'var(--table-header-text)' }}>
                    <tr>
                      <th style={{ width: '60px' }}>S.No</th>
                      <th>Company Name</th>
                      <th style={{ width: '110px' }}>Code</th>
                      <th>Address</th>
                      <th style={{ width: '140px' }}>City</th>
                      <th style={{ width: '140px' }}>Phone</th>
                      <th style={{ width: '130px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCompanies.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center text-muted py-5">
                          {searchTerm ? 'No companies found matching your search.' : 'No company records available.'}
                        </td>
                      </tr>
                    ) : (
                      filteredCompanies.map((company, index) => (
                        <tr key={company.id}>
                          <td>{index + 1}</td>
                          <td>
                            <div style={{ fontWeight: 'var(--font-weight-semibold)' }}>{company.name}</div>
                            <small className="text-muted">{company.email || company.state || 'No secondary details'}</small>
                          </td>
                          <td>{company.code || '-'}</td>
                          <td>{company.address || '-'}</td>
                          <td>{company.city || '-'}</td>
                          <td>{company.phone || '-'}</td>
                          <td>
                            <Button variant="primary" size="sm" onClick={() => handleEdit(company)}>
                              <i className="fas fa-edit"></i> Edit
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              )}
            </div>
          </Card.Body>
        </Card>
      </div>

      <Modal show={showModal} onHide={handleModalClose} centered size="xl" backdrop="static" keyboard={false}>
        <Modal.Header closeButton style={{ background: 'var(--page-header-bg)', color: 'var(--page-header-text)', padding: '10px 15px' }}>
          <Modal.Title style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-semibold)' }}>
            <i className={`fas ${isEdit ? 'fa-edit' : 'fa-plus-circle'}`}></i>
            {' '}
            {isEdit ? 'EDIT COMPANY DETAILS' : 'ADD COMPANY DETAILS'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto', padding: '15px' }}>
          <Form>
            <div className="row">
              <div className="col-md-6">
                <div className="row mb-2">
                  <div className="col-md-12">
                    <Form.Group>
                      <Form.Label className="mb-1" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)' }}>
                        Company Name <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        size="sm"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter company name"
                      />
                    </Form.Group>
                  </div>
                </div>

                <div className="row mb-2">
                  <div className="col-md-6">
                    <Form.Group>
                      <Form.Label className="mb-1" style={{ fontSize: 'var(--font-size-sm)' }}>
                        Company Code
                      </Form.Label>
                      <Form.Control
                        size="sm"
                        type="text"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        placeholder="Enter code"
                      />
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group>
                      <Form.Label className="mb-1" style={{ fontSize: 'var(--font-size-sm)' }}>
                        Phone
                      </Form.Label>
                      <Form.Control
                        size="sm"
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/[^0-9]/g, '').slice(0, 10) })}
                        maxLength={10}
                        placeholder="Enter phone number"
                      />
                    </Form.Group>
                  </div>
                </div>

                <div className="row mb-2">
                  <div className="col-md-12">
                    <Form.Group>
                      <Form.Label className="mb-1" style={{ fontSize: 'var(--font-size-sm)' }}>
                        Address
                      </Form.Label>
                      <Form.Control
                        size="sm"
                        as="textarea"
                        rows={3}
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Enter address"
                      />
                    </Form.Group>
                  </div>
                </div>

                <div className="row mb-2">
                  <div className="col-md-6">
                    <Form.Group>
                      <Form.Label className="mb-1" style={{ fontSize: 'var(--font-size-sm)' }}>
                        City
                      </Form.Label>
                      <Form.Control
                        size="sm"
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="Enter city"
                      />
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group>
                      <Form.Label className="mb-1" style={{ fontSize: 'var(--font-size-sm)' }}>
                        State
                      </Form.Label>
                      <Form.Control
                        size="sm"
                        type="text"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        placeholder="Enter state"
                      />
                    </Form.Group>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="row mb-2">
                  <div className="col-md-6">
                    <Form.Group>
                      <Form.Label className="mb-1" style={{ fontSize: 'var(--font-size-sm)' }}>
                        PIN Code
                      </Form.Label>
                      <Form.Control
                        size="sm"
                        type="text"
                        value={formData.pin}
                        onChange={(e) => setFormData({ ...formData, pin: e.target.value.replace(/[^0-9]/g, '').slice(0, 6) })}
                        maxLength={6}
                        placeholder="Enter PIN code"
                      />
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group>
                      <Form.Label className="mb-1" style={{ fontSize: 'var(--font-size-sm)' }}>
                        Email
                      </Form.Label>
                      <Form.Control
                        size="sm"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Enter email"
                      />
                    </Form.Group>
                  </div>
                </div>

                <div className="row mb-2">
                  <div className="col-md-6">
                    <Form.Group>
                      <Form.Label className="mb-1" style={{ fontSize: 'var(--font-size-sm)' }}>
                        Website
                      </Form.Label>
                      <Form.Control
                        size="sm"
                        type="text"
                        value={formData.web}
                        onChange={(e) => setFormData({ ...formData, web: e.target.value })}
                        placeholder="Enter website"
                      />
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group>
                      <Form.Label className="mb-1" style={{ fontSize: 'var(--font-size-sm)' }}>
                        Fax
                      </Form.Label>
                      <Form.Control
                        size="sm"
                        type="text"
                        value={formData.fax}
                        onChange={(e) => setFormData({ ...formData, fax: e.target.value })}
                        placeholder="Enter fax"
                      />
                    </Form.Group>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: '8px',
                    padding: '12px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    background: 'var(--page-header-bg)',
                  }}
                >
                  <div style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: '8px' }}>Preview</div>
                  <div style={{ marginBottom: '4px' }}><strong>Name:</strong> {formData.name || '-'}</div>
                  <div style={{ marginBottom: '4px' }}><strong>Code:</strong> {formData.code || '-'}</div>
                  <div style={{ marginBottom: '4px' }}><strong>Location:</strong> {[formData.city, formData.state].filter(Boolean).join(', ') || '-'}</div>
                  <div><strong>Contact:</strong> {formData.phone || formData.email || '-'}</div>
                </div>
              </div>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer style={{ padding: '10px 15px' }}>
          <Button variant="secondary" onClick={handleModalClose} size="sm" disabled={isSubmitting}>
            <i className="fas fa-times"></i> Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} size="sm" disabled={isSubmitting}>
            <i className={`fas ${isSubmitting ? 'fa-spinner fa-spin' : 'fa-save'}`}></i>{' '}
            {isSubmitting ? (isEdit ? 'Updating...' : 'Saving...') : isEdit ? 'Update' : 'Save'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CompanyNameMaster;