import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Table, Row, Col, Alert } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../state/store';
import MedicalRecordsApiService from '../../../../api/medical-records/medical-records-api-service';
import PageHeader from '../../../../components/PageHeader';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { ListCheck, ShieldX, ArrowRepeat } from 'react-bootstrap-icons';

interface State {
  id: number;
  name: string;
  countryId: number;
  isActive: number;
}

interface District {
  id: number;
  name: string;
  code: string;
  stId: number;
  postId: number;
  isActive: number;
  stateName?: string;
}

const AddDistrict: React.FC = () => {
  const themePrimary = 'var(--page-primary-color)';
  const themeSecondary = 'var(--page-secondary-color)';
  const loginData = useSelector((state: RootState) => state.loginData);
  const apiService = new MedicalRecordsApiService();
  const [isMobileView, setIsMobileView] = useState(() => window.innerWidth < 992);
  const [districts, setDistricts] = useState<District[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(true);
  const [loadingStates, setLoadingStates] = useState(true);

  const [newDistrict, setNewDistrict] = useState({ name: '', code: '', stId: '' });
  const [editingDistrict, setEditingDistrict] = useState<District | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [showBlocked, setShowBlocked] = useState(false);

  const pageShellStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%',
    minHeight: 0,
    width: '100%',
    overflow: 'hidden',
    color: themePrimary,
  };

  const contentBodyStyle = {
    display: 'flex',
    flex: 1,
    minHeight: 0,
    overflowX: 'hidden' as const,
    overflowY: isMobileView ? 'auto' as const : 'hidden' as const,
    padding: '0.75rem 0 1rem',
  };

  const cardColumnStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    minHeight: isMobileView ? 'auto' : 0,
  };

  const formCardStyle = {
    padding: '2rem',
    background: 'white',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column' as const,
    height: isMobileView ? 'auto' : '100%',
    minHeight: isMobileView ? 'auto' : 0,
  };

  const tableCardStyle = {
    background: 'white',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column' as const,
    minHeight: isMobileView ? '26rem' : 0,
    height: isMobileView ? 'auto' : '100%',
    overflow: 'hidden',
  };

  // TODO: Remove apiService instantiation
  // const apiService = new MedicalRecordsApiService();

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 992);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Load states on component mount
  useEffect(() => {
    const loadStates = async () => {
      try {
        const response = await apiService.fetchAllStates();
        // Filter only active states (isActive=1)
        const activeStates = response.filter((state: State) => state.isActive === 1);
        setStates(activeStates);
        
        // Auto-select Tamil Nadu
        const tamilNadu = activeStates.find((s: State) => s.name.toLowerCase() === 'tamil nadu');
        if (tamilNadu) {
          setNewDistrict(prev => ({ ...prev, stId: tamilNadu.id.toString() }));
        }
      } catch (err) {
        console.error('Error loading states:', err);
      } finally {
        setLoadingStates(false);
      }
    };

    loadStates();
  }, []);

  // Load districts when showBlocked changes
  useEffect(() => {
    const loadDistricts = async () => {
      try {
        const response = await apiService.fetchAllDistricts();
        
        // Filter based on showBlocked state
        // isActive=1 means active, isActive=0 means blocked
        const filteredDistricts = response.filter((district: District) => 
          showBlocked ? district.isActive === 0 : district.isActive === 1
        );

        // Add state names to districts for display
        const districtsWithStateNames = filteredDistricts.map((district: District) => {
          const state = states.find(s => s.id === district.stId);
          return {
            ...district,
            stateName: state ? state.name : 'Unknown State'
          };
        });
        
        // Sort by id in ascending order
        const sortedDistricts = districtsWithStateNames.sort((a: District, b: District) => a.id - b.id);
        setDistricts(sortedDistricts);
      } catch (err) {
        console.error('Error loading districts:', err);
      } finally {
        setLoadingDistricts(false);
      }
    };

    if (!loadingStates) {
      loadDistricts();
    }
  }, [showBlocked, loadingStates, states]);

  const handleInputChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    setNewDistrict({ ...newDistrict, [name]: value });
  };

  const handleEditDistrict = (district: District) => {
    setEditingDistrict(district);
    setNewDistrict({ 
      name: district.name || '', 
      code: district.code || '', 
      stId: district.stId ? district.stId.toString() : '' 
    });
    setError('');
    setSuccess('');
  };

  const handleCancelEdit = () => {
    setEditingDistrict(null);
    const tamilNadu = states.find(s => s.name.toLowerCase() === 'tamil nadu');
    setNewDistrict({ name: '', code: '', stId: tamilNadu ? tamilNadu.id.toString() : '' });
    setError('');
    setSuccess('');
  };

  const handleBlockDistrict = async (district: District) => {
    const result = await Swal.fire({
      title: 'Block District',
      text: `Do you want to block "${district.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, Block it!',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      const payload = {
        name: district.name,
        code: district.code,
        stId: district.stId,
        postId: district.postId,
        isActive: 0, // Block by setting isActive to 0
        uid: loginData.id || 0
      };

      await apiService.updateDistrict(district.id, payload);

      if (!showBlocked) {
        setDistricts(districts.filter(d => d.id !== district.id));
      }

      Swal.fire({
        title: 'Blocked!',
        text: 'District has been blocked successfully.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });

    } catch (err: any) {
      console.error('Error blocking district:', err);

      Swal.fire({
        title: 'Error!',
        text: err.response?.data?.message || 'Failed to block district. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleUnblockDistrict = async (district: District) => {
    const result = await Swal.fire({
      title: 'Unblock District',
      text: `Do you want to unblock "${district.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, Unblock it!',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      const payload = {
        name: district.name,
        code: district.code,
        stId: district.stId,
        postId: district.postId,
        isActive: 1, // Unblock by setting isActive to 1
        uid: loginData.id || 0
      };

      await apiService.updateDistrict(district.id, payload);

      setDistricts(districts.filter(d => d.id !== district.id));

      Swal.fire({
        title: 'Unblocked!',
        text: 'District has been unblocked successfully.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });

    } catch (err: any) {
      console.error('Error unblocking district:', err);

      Swal.fire({
        title: 'Error!',
        text: err.response?.data?.message || 'Failed to unblock district. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleAddDistrict = async () => {
    if (!newDistrict.name.trim() || !newDistrict.stId) {
      setError('Please fill in district name and select a state.');
      return;
    }

    // Check for duplicate name in the same state
    const existingDistrict = districts.find(district => 
      district.name.toLowerCase() === newDistrict.name.trim().toLowerCase() && 
      district.stId.toString() === newDistrict.stId &&
      (!editingDistrict || district.id !== editingDistrict.id)
    );
    
    if (existingDistrict) {
      setError('A district with this name already exists in this state.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        name: newDistrict.name.trim(),
        code: newDistrict.code.trim(),
        uid: loginData.id || 0,
        isActive: 1,
        stId: parseInt(newDistrict.stId),
        postId: 0
      };

      let response: any;
      if (editingDistrict) {
        // Update existing district
        response = await apiService.updateDistrict(editingDistrict.id, payload);

        setDistricts(districts.map(district => {
          if (district.id === editingDistrict.id) {
            const state = states.find(s => s.id === payload.stId);
            return {
              ...district,
              name: response.name || payload.name,
              code: response.code || payload.code,
              stId: payload.stId,
              postId: payload.postId,
              isActive: 1,
              stateName: state ? state.name : 'Unknown State'
            };
          }
          return district;
        }));

        setSuccess('District updated successfully!');
      } else {
        // Add new district
        response = await apiService.saveDistrict(payload);

        const state = states.find(s => s.id === payload.stId);
        const newDistrictWithId = {
          id: response.id || Date.now(),
          name: response.name || payload.name,
          code: response.code || payload.code,
          stId: payload.stId,
          postId: payload.postId,
          isActive: 1,
          stateName: state ? state.name : 'Unknown State'
        };

        setDistricts([newDistrictWithId, ...districts]);
        setSuccess('District added successfully!');
      }

      const tamilNadu = states.find(s => s.name.toLowerCase() === 'tamil nadu');
      setNewDistrict({ name: '', code: '', stId: tamilNadu ? tamilNadu.id.toString() : '' });
      setEditingDistrict(null);

      setTimeout(() => setSuccess(''), 3000);

    } catch (err: any) {
      console.error('Error saving district:', err);
      setError(err.response?.data?.message || `Failed to ${editingDistrict ? 'update' : 'add'} district. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageShellStyle}>
      <PageHeader icon={faPlus} title={editingDistrict ? 'Edit District' : 'Add District'} subtitle="" />

      <div className="content-body" style={contentBodyStyle}>
        <Container fluid style={{ maxWidth: '1280px', margin: '0 auto', height: isMobileView ? 'auto' : '100%', minHeight: 0 }}>
          <Row className="g-3 align-items-stretch flex-column flex-lg-row" style={{ height: isMobileView ? 'auto' : '100%', minHeight: 0 }}>
            <Col xs={12} lg={5} style={cardColumnStyle}>
              <div
                className="card shadow-sm"
                style={formCardStyle}
              >
                <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>
                  {editingDistrict ? 'Edit District' : 'Add New District'}
                </h3>

                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>State *</Form.Label>
                    <Form.Select
                      name="stId"
                      value={newDistrict.stId}
                      onChange={handleInputChange}
                      disabled={loading || loadingStates}
                    >
                      <option value="">Select a State</option>
                      {states.map(state => (
                        <option key={state.id} value={state.id}>
                          {state.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>District Name *</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={newDistrict.name}
                      onChange={handleInputChange}
                      placeholder="Enter district name"
                      disabled={loading}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>District Code</Form.Label>
                    <Form.Control
                      type="text"
                      name="code"
                      value={newDistrict.code}
                      onChange={handleInputChange}
                      placeholder="Enter district code (optional)"
                      disabled={loading}
                    />
                  </Form.Group>

                  <Button variant="primary" onClick={handleAddDistrict} disabled={loading} style={{ marginRight: '10px' }}>
                    {loading ? 'Saving...' : (editingDistrict ? 'Update District' : 'Add District')}
                  </Button>

                  {editingDistrict && (
                    <Button variant="secondary" onClick={handleCancelEdit} disabled={loading}>
                      Cancel
                    </Button>
                  )}
                </Form>
              </div>
            </Col>

            <Col xs={12} lg={7} style={cardColumnStyle}>
              <div
                className="card shadow-sm"
                style={tableCardStyle}
              >
                <div
                  style={{
                    padding: '1.25rem 1.5rem',
                    backgroundColor: themePrimary,
                    color: themeSecondary,
                    borderTopLeftRadius: '12px',
                    borderTopRightRadius: '12px',
                    flexShrink: 0,
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2">
                      {showBlocked ? (
                        <ShieldX size={22} color={themeSecondary} />
                      ) : (
                        <ListCheck size={22} color={themeSecondary} />
                      )}
                      <h5 className="mb-0" style={{ fontWeight: '600' }}>
                        {showBlocked ? 'Blocked Districts' : 'Active Districts'}
                      </h5>
                      <span className="badge theme-badge-secondary" style={{ fontSize: '11px', padding: '4px 8px' }}>
                        {districts.length}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowBlocked(!showBlocked)}
                      className={showBlocked ? 'theme-btn-secondary is-selected' : 'theme-outline-btn-primary'}
                      style={{
                        borderRadius: '20px',
                        padding: '6px 16px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.875rem',
                        lineHeight: 1.5,
                        cursor: 'pointer',
                        border: '1px solid',
                      }}
                    >
                      <ArrowRepeat size={16} />
                      {showBlocked ? 'Show Active' : 'Show Blocked'}
                    </button>
                  </div>
                </div>

                <div style={{ padding: '0 1rem 1rem 1rem', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                  <div style={{ flex: 1, minHeight: isMobileView ? '20rem' : 0, maxHeight: isMobileView ? '24rem' : '32rem', overflowY: 'auto', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }}>
                  {loadingDistricts || loadingStates ? (
                    <p style={{ padding: '1rem' }}>Loading districts...</p>
                  ) : districts.length === 0 ? (
                    <p style={{ padding: '1rem' }}>{showBlocked ? 'No blocked districts.' : 'No active districts added yet.'}</p>
                  ) : (
                    <Table striped bordered hover style={{ marginBottom: 0 }}>
                      <thead
                        style={{
                          position: 'sticky',
                          top: 0,
                          background: 'white',
                          zIndex: 1,
                        }}
                      >
                        <tr>
                          <th>#</th>
                          <th>District</th>
                          <th>State</th>
                          <th>Code</th>
                          <th>Actions</th>
                        </tr>
                      </thead>

                      <tbody>
                        {districts.map((district, index) => (
                          <tr key={district.id}>
                            <td>{index + 1}</td>
                            <td>{district.name}</td>
                            <td>{district.stateName}</td>
                            <td>{district.code}</td>
                            <td>
                              {showBlocked ? (
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  onClick={() => handleUnblockDistrict(district)}
                                >
                                  Unblock
                                </Button>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    className="me-2"
                                    onClick={() => handleEditDistrict(district)}
                                    disabled={loading}
                                    style={{
                                      padding: '0.25rem 0.6rem',
                                      borderRadius: '6px',
                                      border: `1px solid ${themeSecondary}`,
                                      backgroundColor: 'transparent',
                                      color: themeSecondary,
                                      fontSize: 'var(--font-size-sm)',
                                      lineHeight: 1.3,
                                    }}
                                  >
                                    Edit
                                  </button>
                                  <Button variant="outline-danger" size="sm" onClick={() => handleBlockDistrict(district)}>
                                    Block
                                  </Button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default AddDistrict;