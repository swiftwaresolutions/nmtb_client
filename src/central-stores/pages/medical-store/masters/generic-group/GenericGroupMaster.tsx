import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../../state/store';
import { Table, Button, Form, Modal, Container, Row, Col } from 'react-bootstrap';
import { faLayerGroup } from '@fortawesome/free-solid-svg-icons';
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
  description: string;
  isActive: boolean;
  createdDate: string;
}

const GenericGroupMaster: React.FC = () => {
  const navigate = useNavigate();
  const loginData = useSelector((state: RootState) => state.loginData);
  const apiService = new CentralStoresApiService();
  
  const [groups, setGroups] = useState<GenericGroup[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentGroup, setCurrentGroup] = useState<GenericGroup | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    groupName: '',
    description: ''
  });

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await apiService.fetchAllGenericGroups();
      const mappedGroups: GenericGroup[] = response.map(group => ({
        id: group.id,
        groupName: group.name,
        description: group.description,
        isActive: group.isBlocked === 0,
        createdDate: new Date(group.dateTime).toLocaleDateString('en-GB')
      }));
      setGroups(mappedGroups);
    } catch (error) {
      showErrorToast('Failed to fetch generic groups');
    } finally {
      setLoading(false);
    }
  };

  // Table search hook
  const { filteredData, searchTerm, setSearchTerm, resultCount, totalCount } = useTableSearch({
    data: groups,
    searchFields: ['groupName', 'description'],
  });

  useEffect(() => {
    if (!loginData.authorized) {
      navigate('/login');
      return;
    }
    fetchGroups();
  }, [loginData, navigate]);

  const handleAdd = () => {
    setIsEdit(false);
    setCurrentGroup(null);
    setFormData({ groupName: '', description: '' });
    setShowModal(true);
  };

  const handleEdit = (group: GenericGroup) => {
    setIsEdit(true);
    setCurrentGroup(group);
    setFormData({
      groupName: group.groupName,
      description: group.description
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.groupName.trim()) {
      showValidationError('Group Name is required!');
      return;
    }

    // Check for duplicate name
    const duplicateExists = groups.some(group => {
      // When editing, exclude the current group from the check
      if (isEdit && currentGroup && group.id === currentGroup.id) {
        return false;
      }
      return group.groupName.toLowerCase() === formData.groupName.trim().toLowerCase();
    });
    
    if (duplicateExists) {
      showValidationError(`Generic Group "${formData.groupName}" already exists!`, 'Duplicate Entry');
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
      isEdit ? 'Update Generic Group?' : 'Add Generic Group?',
      formData.groupName
    );

    if (confirmed) {
      try {
        setLoading(true);
        if (isEdit && currentGroup) {
          await apiService.updateGenericGroup(currentGroup.id, {
            name: formData.groupName,
            description: formData.description,
            isBlocked: 0,
            storeId: storeId,
            uid: loginData.id
          });
          showSuccessToast('Generic Group updated successfully');
        } else {
          await apiService.saveGenericGroup({
            name: formData.groupName,
            description: formData.description,
            storeId: storeId
          });
          showSuccessToast('Generic Group added successfully');
        }
        
        setShowModal(false);
        fetchGroups();
      } catch (error) {
        showErrorToast(`Failed to ${isEdit ? 'update' : 'add'} generic group`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBlock = async (group: GenericGroup) => {
    const confirmed = await showConfirmDialog(
      'Block Generic Group?',
      `Are you sure you want to block ${group.groupName}?`
    );

    if (confirmed) {
      // Get store_id from sessionStorage
      const selectedStoreData = sessionStorage.getItem('selectedStore');
      if (!selectedStoreData) {
        showErrorToast('Store information not found. Please reselect the store.');
        return;
      }
      
      const selectedStore = JSON.parse(selectedStoreData);
      const storeId = selectedStore.masterId;

      try {
        setLoading(true);
        await apiService.updateGenericGroup(group.id, {
          name: group.groupName,
          description: group.description,
          isBlocked: 1,
          storeId: storeId,
          uid: loginData.id
        });
        showSuccessToast('Generic Group has been blocked');
        fetchGroups();
      } catch (error) {
        showErrorToast('Failed to block generic group');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUnblock = async (group: GenericGroup) => {
    const confirmed = await showConfirmDialog(
      'Unblock Generic Group?',
      `Are you sure you want to unblock ${group.groupName}?`
    );

    if (confirmed) {
      // Get store_id from sessionStorage
      const selectedStoreData = sessionStorage.getItem('selectedStore');
      if (!selectedStoreData) {
        showErrorToast('Store information not found. Please reselect the store.');
        return;
      }
      
      const selectedStore = JSON.parse(selectedStoreData);
      const storeId = selectedStore.masterId;

      try {
        setLoading(true);
        await apiService.updateGenericGroup(group.id, {
          name: group.groupName,
          description: group.description,
          isBlocked: 0,
          storeId: storeId,
          uid: loginData.id
        });
        showSuccessToast('Generic Group has been unblocked');
        fetchGroups();
      } catch (error) {
        showErrorToast('Failed to unblock generic group');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', minHeight: 0, overflow: 'hidden' }}>
      {/* ---------------- HEADER ---------------- */}
      <PageHeader
        icon={faLayerGroup}
        title="Generic Group Master"
        subtitle="Manage therapeutic categories for medical store"
        badges={[
          { label: 'Total Groups', value: totalCount },
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
                placeholder="Search by group name or description..."
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
                Add New Group
              </Button>
            </Col>
          </Row>

          {/* Data Table */}
          <Row>
            <Col>
              <div className="card shadow-sm" style={{ borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <Table striped bordered hover className="mb-0" style={{ minWidth: '800px' }}>
                    <thead style={{ background: 'var(--table-header-bg)', color: 'var(--table-header-text)' }}>
                      <tr>
                        <th style={{ width: '60px', textAlign: 'center' }}>S.No</th>
                        <th style={{ minWidth: '200px' }}>Group Name</th>
                        <th style={{ minWidth: '250px' }}>Description</th>
                        <th style={{ width: '100px', textAlign: 'center' }}>Status</th>
                        <th style={{ width: '130px', textAlign: 'center' }}>Created Date</th>
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
                              {searchTerm ? 'No groups found matching your search' : 'No groups available'}
                            </p>
                          </td>
                        </tr>
                      ) : (
                        filteredData.map((group, index) => (
                          <tr key={group.id}>
                            <td className="text-center">{index + 1}</td>
                            <td><strong>{group.groupName}</strong></td>
                            <td className="text-muted">{group.description || '-'}</td>
                            <td className="text-center">
                              <span 
                                className="badge" 
                                style={{
                                  background: group.isActive ? '#d4edda' : '#f8d7da',
                                  color: group.isActive ? '#155724' : '#721c24',
                                  padding: '5px 12px',
                                  borderRadius: '12px',
                                  fontSize: '0.75rem',
                                  fontWeight: '600'
                                }}
                              >
                                {group.isActive ? 'Active' : 'Blocked'}
                              </span>
                            </td>
                            <td className="text-center">{group.createdDate}</td>
                            <td className="text-center">
                              <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleEdit(group)}
                                  title="Edit"
                                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                                >
                                  <i className="fas fa-edit"></i>
                                  Edit
                                </Button>
                                {group.isActive ? (
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => handleBlock(group)}
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
                                    onClick={() => handleUnblock(group)}
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
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton style={{ background: 'var(--page-header-bg)', color: 'var(--page-header-text)' }}>
          <Modal.Title style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className={`fas ${isEdit ? 'fa-edit' : 'fa-plus-circle'}`}></i>
            {isEdit ? 'Edit' : 'Add'} Generic Group
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Group Name <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter group name (e.g., Analgesics)"
                value={formData.groupName}
                onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
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

export default GenericGroupMaster;
