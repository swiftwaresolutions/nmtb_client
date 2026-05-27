import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../../state/store';
import { Table, Button, Form, Modal, Container, Row, Col } from 'react-bootstrap';
import { faPrescriptionBottleMedical } from '@fortawesome/free-solid-svg-icons';
import PageHeader from '../../../../../components/PageHeader';
import { useTableSearch } from '../../../../../hooks/useTableSearch';
import SearchInput from '../../../../../components/SearchInput';
import '../../../../../style/commonStyle.css';
import CentralStoresApiService from '../../../../../api/central-stores/central-stores-api-service';
import {
  showSuccessToast,
  showErrorToast,
  showConfirmDialog,
  showValidationError,
} from '../../../../../utils/alertUtil';

interface GenericGroup {
  id: number;
  groupName: string;
}

interface SubGenericGroup {
  id: number;
  subGroupName: string;
  genericGroupId: number;
}

interface GenericDetails {
  id: number;
  name: string;
  genGrpId: number;
  genSubGrpId: number;
  description: string;
  isActive: boolean;
  dateTime: string;
  dosage?: number;
  route?: number;
  min?: number;
  max?: number;
  scheduled?: number;
  scheduledType?: number;
}

const GenericDetailsMaster: React.FC = () => {
  const navigate = useNavigate();
  const loginData = useSelector((state: RootState) => state.loginData);
  const apiService = new CentralStoresApiService();
  
  const [generics, setGenerics] = useState<GenericDetails[]>([]);
  const [genericGroups, setGenericGroups] = useState<GenericGroup[]>([]);
  const [subGenericGroups, setSubGenericGroups] = useState<SubGenericGroup[]>([]);
  const [filteredSubGroups, setFilteredSubGroups] = useState<SubGenericGroup[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentGeneric, setCurrentGeneric] = useState<GenericDetails | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    genGrpId: 0,
    genSubGrpId: 0,
    description: '',
    dosage: 0,
    route: 0,
    min: 0,
    max: 0,
    scheduled: 0,
    scheduledType: 0
  });

  // Mock data for dropdowns
  const mockGenericGroups: GenericGroup[] = [
    { id: 1, groupName: 'Analgesics' },
    { id: 2, groupName: 'Antibiotics' },
    { id: 3, groupName: 'Antidiabetics' },
  ];

  const mockSubGenericGroups: SubGenericGroup[] = [
    { id: 1, subGroupName: 'NSAIDs', genericGroupId: 1 },
    { id: 2, subGroupName: 'Opioids', genericGroupId: 1 },
    { id: 3, subGroupName: 'Penicillins', genericGroupId: 2 },
    { id: 4, subGroupName: 'Cephalosporins', genericGroupId: 2 },
    { id: 5, subGroupName: 'Biguanides', genericGroupId: 3 },
  ];

  const fetchGenerics = async () => {
    try {
      setLoading(true);
      const [genericsData, genericGroupData, subGenericGroupData] = await Promise.all([
        apiService.fetchAllGenerics(),
        apiService.fetchAllGenericGroups(),
        apiService.fetchAllSubGenerics()
      ]);
      
      const mappedData = genericsData.map(g => ({
        id: g.id,
        name: g.name,
        genGrpId: g.genGrpId,
        genSubGrpId: g.genSubGrpId,
        description: g.description,
        isActive: g.isActive === 1,
        dateTime: new Date(g.dateTime).toLocaleDateString('en-GB'),
        dosage: g.dosage,
        route: g.route,
        min: g.min,
        max: g.max,
        scheduled: g.scheduled,
        scheduledType: g.scheduledType
      }));
      
      setGenerics(mappedData);
      setGenericGroups(genericGroupData.map(g => ({ id: g.id, groupName: g.name })));
      setSubGenericGroups(subGenericGroupData.map(sg => ({ id: sg.id, subGroupName: sg.name, genericGroupId: sg.groupId })));
    } catch (error) {
      showErrorToast('Failed to load generic details');
    } finally {
      setLoading(false);
    }
  };

  // Table search hook
  const { filteredData, searchTerm, setSearchTerm, resultCount, totalCount } = useTableSearch({
    data: generics,
    searchFields: ['name', 'description'],
  });

  useEffect(() => {
    if (!loginData.authorized) {
      navigate('/login');
      return;
    }
    fetchGenerics();
  }, [loginData, navigate]);

  useEffect(() => {
    if (formData.genGrpId > 0) {
      const filtered = subGenericGroups.filter(sg => sg.genericGroupId === formData.genGrpId);
      setFilteredSubGroups(filtered);
    } else {
      setFilteredSubGroups([]);
    }
  }, [formData.genGrpId, subGenericGroups]);

  const handleAdd = () => {
    setIsEdit(false);
    setCurrentGeneric(null);
    setFormData({
      name: '',
      genGrpId: 0,
      genSubGrpId: 0,
      description: '',
      dosage: 0,
      route: 0,
      min: 0,
      max: 0,
      scheduled: 0,
      scheduledType: 0
    });
    setShowModal(true);
  };

  const handleEdit = (generic: GenericDetails) => {
    setCurrentGeneric(generic);
    setFormData({
      name: generic.name,
      genGrpId: generic.genGrpId,
      genSubGrpId: generic.genSubGrpId,
      description: generic.description,
      dosage: generic.dosage ?? 0,
      route: generic.route ?? 0,
      min: generic.min ?? 0,
      max: generic.max ?? 0,
      scheduled: generic.scheduled ?? 0,
      scheduledType: generic.scheduledType ?? 0
    });
    const filtered = subGenericGroups.filter(sg => sg.genericGroupId === generic.genGrpId);
    setFilteredSubGroups(filtered);
    setIsEdit(true);
    setShowModal(true);
  };

  const handleBlock = async (generic: GenericDetails) => {
    const confirmed = await showConfirmDialog(
      'Block Generic Detail?',
      `"${generic.name}" will be blocked`
    );

    if (confirmed) {
      try {
        setLoading(true);
        const selectedStoreData = sessionStorage.getItem('selectedStore');
        if (!selectedStoreData) {
          showErrorToast('Store information not found');
          return;
        }
        const selectedStore = JSON.parse(selectedStoreData);
        const storeId = selectedStore.masterId;

        await apiService.updateGeneric(generic.id, {
          name: generic.name,
          genGrpId: generic.genGrpId,
          genSubGrpId: generic.genSubGrpId,
          description: generic.description,
          dosage: generic.dosage ?? 0,
          route: generic.route ?? 0,
          min: generic.min ?? 0,
          max: generic.max ?? 0,
          scheduled: generic.scheduled ?? 0,
          scheduledType: generic.scheduledType ?? 0,
          isActive: 0,
          storeId: storeId,
          uid: loginData.id
        });
        showSuccessToast('Generic Detail blocked successfully');
        fetchGenerics();
      } catch (error) {
        showErrorToast('Failed to block generic detail');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUnblock = async (generic: GenericDetails) => {
    const confirmed = await showConfirmDialog(
      'Unblock Generic Detail?',
      `"${generic.name}" will be unblocked`
    );

    if (confirmed) {
      try {
        setLoading(true);
        const selectedStoreData = sessionStorage.getItem('selectedStore');
        if (!selectedStoreData) {
          showErrorToast('Store information not found');
          return;
        }
        const selectedStore = JSON.parse(selectedStoreData);
        const storeId = selectedStore.masterId;

        await apiService.updateGeneric(generic.id, {
          name: generic.name,
          genGrpId: generic.genGrpId,
          genSubGrpId: generic.genSubGrpId,
          description: generic.description,
          dosage: generic.dosage ?? 0,
          route: generic.route ?? 0,
          min: generic.min ?? 0,
          max: generic.max ?? 0,
          scheduled: generic.scheduled ?? 0,
          scheduledType: generic.scheduledType ?? 0,
          isActive: 1,
          storeId: storeId,
          uid: loginData.id
        });
        showSuccessToast('Generic Detail unblocked successfully');
        fetchGenerics();
      } catch (error) {
        showErrorToast('Failed to unblock generic detail');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim() || formData.genGrpId === 0 || formData.genSubGrpId === 0) {
      showValidationError('Name, Generic Group and Sub Generic Group are required!', 'Required Fields');
      return;
    }

    // Check for duplicate name within the same sub-group
    const duplicateExists = generics.some(g => {
      // When editing, exclude the current generic from the check
      if (isEdit && currentGeneric && g.id === currentGeneric.id) {
        return false;
      }
      return g.genSubGrpId === formData.genSubGrpId && 
             g.name.toLowerCase() === formData.name.trim().toLowerCase();
    });
    
    if (duplicateExists) {
      showValidationError(`Generic "${formData.name}" already exists in this Sub Generic Group!`, 'Duplicate Entry');
      return;
    }

    // Get store_id from sessionStorage
    const selectedStoreData = sessionStorage.getItem('selectedStore');
    if (!selectedStoreData) {
      showErrorToast('Store information not found. Please reselect the store.');
      return;
    }
    
    const selectedStore = JSON.parse(selectedStoreData);
    const storeId = selectedStore.masterId;

    const confirmed = await showConfirmDialog(
      isEdit ? 'Update Generic Detail?' : 'Add Generic Detail?',
      formData.name
    );

    if (confirmed) {
      try {
        setLoading(true);
        if (isEdit && currentGeneric) {
          await apiService.updateGeneric(currentGeneric.id, {
            name: formData.name,
            genGrpId: formData.genGrpId,
            genSubGrpId: formData.genSubGrpId,
            description: formData.description,
            dosage: formData.dosage,
            route: formData.route,
            min: formData.min,
            max: formData.max,
            scheduled: formData.scheduled,
            scheduledType: formData.scheduledType,
            isActive: 1,
            storeId: storeId,
            uid: loginData.id
          });
          showSuccessToast('Generic Detail updated successfully');
        } else {
          await apiService.saveGeneric({
            name: formData.name,
            genGrpId: formData.genGrpId,
            genSubGrpId: formData.genSubGrpId,
            description: formData.description,
            dosage: formData.dosage,
            route: formData.route,
            min: formData.min,
            max: formData.max,
            scheduled: formData.scheduled,
            scheduledType: formData.scheduledType,
            storeId: storeId
          });
          showSuccessToast('Generic Detail added successfully');
        }
        setShowModal(false);
        fetchGenerics();
      } catch (error) {
        showErrorToast(`Failed to ${isEdit ? 'update' : 'add'} generic detail`);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header Section */}
      <div style={{ flexShrink: 0, padding: '0.5rem 1rem' }}>
        <PageHeader
          icon={faPrescriptionBottleMedical}
          title="Generic Details Master"
          subtitle="Manage active pharmaceutical ingredients"
          badges={[
            { label: 'Total Generics', value: totalCount },
            { label: 'Search Results', value: resultCount }
          ]}
        />
        
        <Container fluid className="mt-3">
          <Row className="align-items-center">
            <Col md={6}>
              <SearchInput
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                placeholder="Search by name or description..."
                resultCount={resultCount}
                totalCount={totalCount}
              />
            </Col>
            <Col md={6} className="text-end">
              <Button variant="primary" onClick={handleAdd}>
                + Add Generic Detail
              </Button>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Table Section */}
      <div style={{ flexGrow: 1, overflow: 'auto', padding: '0 1rem 1rem 1rem' }}>
        <Table striped bordered hover>
          <thead style={{ position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1 }}>
            <tr>
              <th style={{ width: '5%' }}>S.No</th>
              <th style={{ width: '15%' }}>Generic Name</th>
              <th style={{ width: '15%' }}>Generic Group</th>
              <th style={{ width: '15%' }}>Sub Generic Group</th>
              <th style={{ width: '20%' }}>Description</th>
              <th style={{ width: '10%' }}>Date</th>
              <th style={{ width: '10%' }}>Status</th>
              <th style={{ width: '10%' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center">Loading...</td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center">No generic details found</td>
              </tr>
            ) : (
              filteredData.map((generic, index) => {
                const genericGroupName = genericGroups.find(g => g.id === generic.genGrpId)?.groupName || 'N/A';
                const subGenericGroupName = subGenericGroups.find(sg => sg.id === generic.genSubGrpId)?.subGroupName || 'N/A';
                return (
                  <tr key={generic.id}>
                    <td>{index + 1}</td>
                    <td>{generic.name}</td>
                    <td>{genericGroupName}</td>
                    <td>{subGenericGroupName}</td>
                    <td>{generic.description}</td>
                    <td>{generic.dateTime}</td>
                    <td>
                      <span className={`badge ${generic.isActive ? 'bg-success' : 'bg-danger'}`}>
                        {generic.isActive ? 'Active' : 'Blocked'}
                      </span>
                    </td>
                    <td>
                      <Button 
                        variant="warning" 
                        size="sm" 
                        onClick={() => handleEdit(generic)}
                        className="me-1"
                      >
                        Edit
                      </Button>
                      {generic.isActive ? (
                        <Button 
                          variant="danger" 
                          size="sm" 
                          onClick={() => handleBlock(generic)}
                        >
                          Block
                        </Button>
                      ) : (
                        <Button 
                          variant="success" 
                          size="sm" 
                          onClick={() => handleUnblock(generic)}
                        >
                          Unblock
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </Table>
      </div>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{isEdit ? 'Edit Generic Detail' : 'Add Generic Detail'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Generic Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter generic name"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Generic Group <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    value={formData.genGrpId}
                    onChange={(e) => {
                      const selectedId = Number(e.target.value);
                      const filtered = subGenericGroups.filter(sg => sg.genericGroupId === selectedId);
                      setFilteredSubGroups(filtered);
                      setFormData({ ...formData, genGrpId: selectedId, genSubGrpId: 0 });
                    }}
                  >
                    <option value={0}>Select Generic Group</option>
                    {genericGroups.map(g => (
                      <option key={g.id} value={g.id}>{g.groupName}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Sub Generic Group <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    value={formData.genSubGrpId}
                    onChange={(e) => setFormData({ ...formData, genSubGrpId: Number(e.target.value) })}
                    disabled={formData.genGrpId === 0}
                  >
                    <option value={0}>Select Sub Generic Group</option>
                    {filteredSubGroups.map(sg => (
                      <option key={sg.id} value={sg.id}>{sg.subGroupName}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter description"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Dosage</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: Number(e.target.value) })}
                    placeholder="0"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Route</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.route}
                    onChange={(e) => setFormData({ ...formData, route: Number(e.target.value) })}
                    placeholder="0"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Min</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.min}
                    onChange={(e) => setFormData({ ...formData, min: Number(e.target.value) })}
                    placeholder="0"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Max</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.max}
                    onChange={(e) => setFormData({ ...formData, max: Number(e.target.value) })}
                    placeholder="0"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Scheduled</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.scheduled}
                    onChange={(e) => setFormData({ ...formData, scheduled: Number(e.target.value) })}
                    placeholder="0"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Scheduled Type</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.scheduledType}
                    onChange={(e) => setFormData({ ...formData, scheduledType: Number(e.target.value) })}
                    placeholder="0"
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

export default GenericDetailsMaster;
