import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../../state/store';
import { Table, Button, Form, Modal, Container, Row, Col } from 'react-bootstrap';
import { faSitemap } from '@fortawesome/free-solid-svg-icons';
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
  groupCode: string;
}

interface SubGenericGroup {
  id: number;
  subGroupName: string;
  subGroupCode: string;
  genericGroupId: number;
  genericGroupName: string;
  description: string;
  isActive: boolean;
  createdDate: string;
}

const SubGenericGroupMaster: React.FC = () => {
  const navigate = useNavigate();
  const loginData = useSelector((state: RootState) => state.loginData);
  const apiService = new CentralStoresApiService();
  
  const [subGroups, setSubGroups] = useState<SubGenericGroup[]>([]);
  const [genericGroups, setGenericGroups] = useState<GenericGroup[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentSubGroup, setCurrentSubGroup] = useState<SubGenericGroup | null>(null);
  
  const [formData, setFormData] = useState({
    subGroupName: '',
    genericGroupId: 0,
    description: ''
  });

  const fetchGenericGroups = async () => {
    try {
      const data = await apiService.fetchAllGenericGroups();
      const mappedData = data.map(group => ({
        id: group.id,
        groupName: group.name,
        groupCode: ''
      }));
      setGenericGroups(mappedData);
    } catch (error) {
      showErrorToast('Failed to load generic groups');
    }
  };

  const fetchSubGenerics = async () => {
    try {
      setLoading(true);
      const [subGenericData, genericGroupData] = await Promise.all([
        apiService.fetchAllSubGenerics(),
        apiService.fetchAllGenericGroups()
      ]);
      
      const genericGroupMap = new Map(genericGroupData.map(g => [g.id, g.name]));
      
      const mappedData = subGenericData.map(sg => ({
        id: sg.id,
        subGroupName: sg.name,
        subGroupCode: '',
        genericGroupId: sg.groupId,
        genericGroupName: genericGroupMap.get(sg.groupId) || 'Unknown',
        description: sg.description,
        isActive: sg.isBlocked === 0,
        createdDate: new Date(sg.dateTime).toLocaleDateString('en-GB')
      }));
      
      setSubGroups(mappedData);
    } catch (error) {
      showErrorToast('Failed to load sub generic groups');
    } finally {
      setLoading(false);
    }
  };

  // Table search hook
  const { filteredData, searchTerm, setSearchTerm, resultCount, totalCount } = useTableSearch({
    data: subGroups,
    searchFields: ['subGroupName', 'genericGroupName', 'description'],
  });

  useEffect(() => {
    if (!loginData.authorized) {
      navigate('/login');
      return;
    }
    fetchGenericGroups();
    fetchSubGenerics();
  }, [loginData, navigate]);

  const handleAdd = () => {
    setIsEdit(false);
    setCurrentSubGroup(null);
    setFormData({ subGroupName: '', genericGroupId: 0, description: '' });
    setShowModal(true);
  };

  const handleEdit = (subGroup: SubGenericGroup) => {
    setIsEdit(true);
    setCurrentSubGroup(subGroup);
    setFormData({
      subGroupName: subGroup.subGroupName,
      genericGroupId: subGroup.genericGroupId,
      description: subGroup.description
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.subGroupName.trim() || formData.genericGroupId === 0) {
      showValidationError('Sub Group Name and Generic Group are required!');
      return;
    }

    // Check for duplicate name within the same generic group
    const duplicateExists = subGroups.some(sg => {
      // When editing, exclude the current sub-group from the check
      if (isEdit && currentSubGroup && sg.id === currentSubGroup.id) {
        return false;
      }
      return sg.genericGroupId === formData.genericGroupId && 
             sg.subGroupName.toLowerCase() === formData.subGroupName.trim().toLowerCase();
    });
    
    if (duplicateExists) {
      showValidationError(`Sub Generic Group "${formData.subGroupName}" already exists in this Generic Group!`, 'Duplicate Entry');
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
      isEdit ? 'Update Sub Generic Group?' : 'Add Sub Generic Group?',
      formData.subGroupName
    );

    if (confirmed) {
      try {
        setLoading(true);
        if (isEdit && currentSubGroup) {
          await apiService.updateSubGeneric(currentSubGroup.id, {
            name: formData.subGroupName,
            description: formData.description,
            groupId: formData.genericGroupId,
            isBlocked: 0,
            storeId: storeId,
            uid: loginData.id
          });
          showSuccessToast('Sub Generic Group updated successfully');
        } else {
          await apiService.saveSubGeneric({
            name: formData.subGroupName,
            description: formData.description,
            groupId: formData.genericGroupId,
            storeId: storeId
          });
          showSuccessToast('Sub Generic Group added successfully');
        }
        
        setShowModal(false);
        fetchSubGenerics();
      } catch (error) {
        showErrorToast(`Failed to ${isEdit ? 'update' : 'add'} sub generic group`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBlock = async (subGroup: SubGenericGroup) => {
    const confirmed = await showConfirmDialog(
      'Block Sub Generic Group?',
      `Are you sure you want to block ${subGroup.subGroupName}?`
    );

    if (confirmed) {
      const selectedStoreData = sessionStorage.getItem('selectedStore');
      if (!selectedStoreData) {
        showErrorToast('Store information not found. Please reselect the store.');
        return;
      }
      
      const selectedStore = JSON.parse(selectedStoreData);
      const storeId = selectedStore.masterId;

      try {
        setLoading(true);
        await apiService.updateSubGeneric(subGroup.id, {
          name: subGroup.subGroupName,
          description: subGroup.description,
          groupId: subGroup.genericGroupId,
          isBlocked: 1,
          storeId: storeId,
          uid: loginData.id
        });
        showSuccessToast('Sub Generic Group has been blocked');
        fetchSubGenerics();
      } catch (error) {
        showErrorToast('Failed to block sub generic group');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUnblock = async (subGroup: SubGenericGroup) => {
    const confirmed = await showConfirmDialog(
      'Unblock Sub Generic Group?',
      `Are you sure you want to unblock ${subGroup.subGroupName}?`
    );

    if (confirmed) {
      const selectedStoreData = sessionStorage.getItem('selectedStore');
      if (!selectedStoreData) {
        showErrorToast('Store information not found. Please reselect the store.');
        return;
      }
      
      const selectedStore = JSON.parse(selectedStoreData);
      const storeId = selectedStore.masterId;

      try {
        setLoading(true);
        await apiService.updateSubGeneric(subGroup.id, {
          name: subGroup.subGroupName,
          description: subGroup.description,
          groupId: subGroup.genericGroupId,
          isBlocked: 0,
          storeId: storeId,
          uid: loginData.id
        });
        showSuccessToast('Sub Generic Group has been unblocked');
        fetchSubGenerics();
      } catch (error) {
        showErrorToast('Failed to unblock sub generic group');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', minHeight: 0, overflow: 'hidden' }}>
      {/* ---------------- HEADER ---------------- */}
      <PageHeader
        icon={faSitemap}
        title="Sub Generic Group Master"
        subtitle="Manage therapeutic sub-categories for medical store"
        badges={[
          { label: 'Total Sub Groups', value: totalCount },
          { label: 'Search Results', value: resultCount }
        ]}
      />

      {/* ---------------- BODY ---------------- */}
      <div className="content-body" style={{ flex: 1, overflow: 'auto', padding: '1rem' }}>
        <Container fluid style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {/* Search and Action Bar */}
          <Row className="mb-3">
            <Col md={6}>
              <SearchInput
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                placeholder="Search by sub group name, generic group, or description..."
                resultCount={resultCount}
                totalCount={totalCount}
              />
            </Col>
            <Col md={6} className="d-flex justify-content-end align-items-center">
              <Button 
                variant="success" 
                onClick={handleAdd}
                style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <i className="fas fa-plus-circle"></i>
                Add New Sub Group
              </Button>
            </Col>
          </Row>

          {/* Data Table */}
          <Row>
            <Col>
              <div className="card shadow-sm" style={{ borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <Table striped bordered hover className="mb-0" style={{ minWidth: '900px' }}>
                    <thead style={{ background: 'var(--table-header-bg)', color: 'var(--table-header-text)' }}>
                      <tr>
                        <th style={{ width: '60px', textAlign: 'center' }}>S.No</th>
                        <th style={{ minWidth: '200px' }}>Sub Group Name</th>
                        <th style={{ minWidth: '180px' }}>Generic Group</th>
                        <th style={{ minWidth: '250px' }}>Description</th>
                        <th style={{ width: '100px', textAlign: 'center' }}>Status</th>
                        <th style={{ width: '180px', textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={6} className="text-center py-4">
                            <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                          </td>
                        </tr>
                      ) : filteredData.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-5">
                            <i className="fas fa-inbox" style={{ fontSize: '3rem', opacity: 0.2, color: '#6c757d' }}></i>
                            <p className="text-muted mt-3 mb-0">
                              {searchTerm ? 'No sub groups found matching your search' : 'No sub groups available'}
                            </p>
                          </td>
                        </tr>
                      ) : (
                        filteredData.map((subGroup, index) => (
                          <tr key={subGroup.id}>
                            <td className="text-center">{index + 1}</td>
                            <td><strong>{subGroup.subGroupName}</strong></td>
                            <td>
                              <span 
                                style={{
                                  background: '#d4edda',
                                  color: '#155724',
                                  padding: '5px 12px',
                                  borderRadius: '12px',
                                  fontSize: '0.75rem',
                                  fontWeight: '600',
                                  display: 'inline-block'
                                }}
                              >
                                {subGroup.genericGroupName}
                              </span>
                            </td>
                            <td className="text-muted">{subGroup.description || '-'}</td>
                            <td className="text-center">
                              <span 
                                className="badge" 
                                style={{
                                  background: subGroup.isActive ? '#d4edda' : '#f8d7da',
                                  color: subGroup.isActive ? '#155724' : '#721c24',
                                  padding: '5px 12px',
                                  borderRadius: '12px',
                                  fontSize: '0.75rem',
                                  fontWeight: '600'
                                }}
                              >
                                {subGroup.isActive ? 'Active' : 'Blocked'}
                              </span>
                            </td>
                            <td className="text-center">
                              <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleEdit(subGroup)}
                                  title="Edit"
                                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                                >
                                  <i className="fas fa-edit"></i>
                                  Edit
                                </Button>
                                {subGroup.isActive ? (
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => handleBlock(subGroup)}
                                    title="Block"
                                    style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                                  >
                                    <i className="fas fa-ban"></i>
                                    Block
                                  </Button>
                                ) : (
                                  <Button
                                    variant="success"
                                    size="sm"
                                    onClick={() => handleUnblock(subGroup)}
                                    title="Unblock"
                                    style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                                  >
                                    <i className="fas fa-unlock"></i>
                                    Unblock
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton style={{ background: 'var(--page-header-bg)', color: 'var(--page-header-text)' }}>
          <Modal.Title style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className={`fas ${isEdit ? 'fa-edit' : 'fa-plus-circle'}`}></i>
            {isEdit ? 'Edit' : 'Add'} Sub Generic Group
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Generic Group <span className="text-danger">*</span></Form.Label>
              <Form.Select
                value={formData.genericGroupId}
                onChange={(e) => setFormData({ ...formData, genericGroupId: parseInt(e.target.value) })}
              >
                <option value={0}>-- Select Generic Group --</option>
                {genericGroups.map(gg => (
                  <option key={gg.id} value={gg.id}>{gg.groupName}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Sub Group Name <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., NSAIDs"
                value={formData.subGroupName}
                onChange={(e) => setFormData({ ...formData, subGroupName: e.target.value })}
                autoFocus
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowModal(false)}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <i className="fas fa-times"></i> Cancel
          </Button>
          <Button 
            variant={isEdit ? 'primary' : 'success'} 
            onClick={handleSave}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-save'}`}></i> 
            {loading ? 'Saving...' : (isEdit ? 'Update' : 'Save')}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SubGenericGroupMaster;
