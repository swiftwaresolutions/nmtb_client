import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Table, Row, Col, Alert } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../state/store';
import MedicalRecordsApiService from '../../../../api/medical-records/medical-records-api-service';
import PageHeader from '../../../../components/PageHeader';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { ListCheck, ShieldX, ArrowRepeat } from 'react-bootstrap-icons';

interface Country {
  id: number;
  name: string;
  code: string;
  isActive?: number;
}

interface State {
  id: number;
  name: string;
  countryId: number;
  isActive: number;
}

const AddState: React.FC = () => {
  const themePrimary = 'var(--page-primary-color)';
  const themeSecondary = 'var(--page-secondary-color)';
  const loginData = useSelector((state: RootState) => state.loginData);
  const [isMobileView, setIsMobileView] = useState(() => window.innerWidth < 992);
  const [states, setStates] = useState<State[]>([]);
  const [loadingStates, setLoadingStates] = useState(true);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);

  const [newState, setNewState] = useState({ name: '', countryId: '' });
  const [editingState, setEditingState] = useState<State | null>(null);
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

  const apiService = new MedicalRecordsApiService();
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 992);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Load countries on component mount
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const response = await apiService.fetchAllCountries();
        // Filter active countries only
        const activeCountries = response.filter((country: Country) => country.isActive === 1);
        setCountries(activeCountries);
        
        // Auto-select India
        const india = activeCountries.find(
          (country: Country) => country.name.toLowerCase() === 'india'
        );
        if (india && !editingState) {
          setNewState(prev => ({ ...prev, countryId: india.id.toString() }));
        }
      } catch (err) {
        console.error('Error loading countries:', err);
      } finally {
        setLoadingCountries(false);
      }
    };

    loadCountries();
  }, []);
  // Load states from API on component mount and when showBlocked changes
  useEffect(() => {
    const loadStates = async () => {
      try {
        const response = await apiService.fetchAllStates();
        // Filter based on showBlocked state
        // isActive=1 means active, isActive=0 means blocked
        const filteredStates = response.filter((state: State) => 
          showBlocked ? state.isActive === 0 : state.isActive === 1
        );
        // Sort by id in descending order
        const sortedStates = filteredStates.sort((a: State, b: State) => b.id - a.id);
        setStates(sortedStates);
      } catch (err) {
        console.error('Error loading states:', err);
        // Keep empty array if API fails
      } finally {
        setLoadingStates(false);
      }
    };

    loadStates();
  }, [showBlocked]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewState({ ...newState, [name]: value });
  };

  const handleEditState = (state: State) => {
    setEditingState(state);
    setNewState({ name: state.name, countryId: state.countryId.toString() });
    setError('');
    setSuccess('');
  };

  const handleCancelEdit = () => {
    setEditingState(null);
    const india = countries.find(c => c.name.toLowerCase() === 'india');
    setNewState({ name: '', countryId: india ? india.id.toString() : '' });
    setError('');
    setSuccess('');
  };

  const handleAddState = async () => {
    if (!newState.name.trim()) {
      setError('Please fill in the state name.');
      return;
    }

    if (!newState.countryId) {
      setError('Please select a country.');
      return;
    }

    // Check for duplicate name
    const existingState = states.find(state => 
      state.name.toLowerCase() === newState.name.trim().toLowerCase() && 
      (!editingState || state.id !== editingState.id)
    );
    
    if (existingState) {
      setError('A state with this name already exists.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        name: newState.name.trim(),
        uid: loginData.id || 0,
        isActive: 1,
        countryId: parseInt(newState.countryId)
      };

      let response: any;
      if (editingState) {
        response = await apiService.updateState(editingState.id, payload);

        // Update the state in the list
        setStates(states.map(state =>
          state.id === editingState.id
            ? {
                ...state,
                name: payload.name,
                countryId: payload.countryId,
                isActive: payload.isActive,
              }
            : state
        ));

        setSuccess('State updated successfully!');
      } else {
        // Add new state
        response = await apiService.saveState(payload);

        // Add the new state to the list with the returned ID
        const newStateWithId = {
          id: response.id || Date.now(),
          name: response.name || payload.name,
          countryId: payload.countryId,
          isActive: 1
        };

        setStates([...states, newStateWithId]);
        setSuccess('State added successfully!');
      }

      // Reset form
      const india = countries.find(c => c.name.toLowerCase() === 'india');
      setNewState({ name: '', countryId: india ? india.id.toString() : '' });
      setEditingState(null);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);

    } catch (err: any) {
      console.error('Error saving state:', err);
      setError(err.response?.data?.message || `Failed to ${editingState ? 'update' : 'add'} state. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockState = async (state: State) => {
    const result = await Swal.fire({
      title: 'Block State',
      text: `Do you want to block "${state.name}"?`,
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
        name: state.name,
        uid: loginData.id || 0,
        isActive: 0,
        countryId: state.countryId,
      };

      await apiService.updateState(state.id, payload);
      
      // Remove the blocked state from the list if we're showing active states
      if (!showBlocked) {
        setStates(states.filter(s => s.id !== state.id));
      } else {
        setStates(states.map(existingState =>
          existingState.id === state.id
            ? { ...existingState, isActive: 0 }
            : existingState
        ));
      }
      
      Swal.fire({
        title: 'Blocked!',
        text: 'State has been blocked successfully.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      
    } catch (err: any) {
      console.error('Error blocking state:', err);
      
      Swal.fire({
        title: 'Error!',
        text: err.response?.data?.message || 'Failed to block state. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleUnblockState = async (state: State) => {
    const result = await Swal.fire({
      title: 'Unblock State',
      text: `Do you want to unblock "${state.name}"?`,
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
        name: state.name,
        uid: loginData.id || 0,
        isActive: 1,
        countryId: state.countryId,
      };

      await apiService.updateState(state.id, payload);
      
      // Remove the unblocked state from the blocked list
      setStates(states.filter(s => s.id !== state.id));
      
      Swal.fire({
        title: 'Unblocked!',
        text: 'State has been unblocked successfully.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      
    } catch (err: any) {
      console.error('Error unblocking state:', err);
      
      Swal.fire({
        title: 'Error!',
        text: err.response?.data?.message || 'Failed to unblock state. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  return (
    <div style={pageShellStyle}>
      <PageHeader icon={faPlus} title={editingState ? 'Edit State' : 'Add State'} subtitle="" />

      <div className="content-body" style={contentBodyStyle}>
        <Container fluid style={{ maxWidth: '1280px', margin: '0 auto', height: isMobileView ? 'auto' : '100%', minHeight: 0 }}>
          <Row className="g-3 align-items-stretch flex-column flex-lg-row" style={{ height: isMobileView ? 'auto' : '100%', minHeight: 0 }}>
            {/* -------- Left Side Form -------- */}
            <Col xs={12} lg={5} style={cardColumnStyle}>
              <div
                className="card shadow-sm"
                style={formCardStyle}
              >
                <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>
                  {editingState ? 'Edit State' : 'Add New State'}
                </h3>

                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Country</Form.Label>
                    <Form.Select
                      name="countryId"
                      value={newState.countryId}
                      onChange={handleInputChange}
                      disabled={loading || loadingCountries}
                    >
                      <option value="">Select Country</option>
                      {countries.map(country => (
                        <option key={country.id} value={country.id}>
                          {country.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>State Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={newState.name}
                      onChange={handleInputChange}
                      placeholder="Enter state name"
                      disabled={loading}
                    />
                  </Form.Group>

                  <Button variant="primary" onClick={handleAddState} disabled={loading} style={{ marginRight: '10px' }}>
                    {loading ? 'Saving...' : (editingState ? 'Update State' : 'Add State')}
                  </Button>

                  {editingState && (
                    <Button variant="secondary" onClick={handleCancelEdit} disabled={loading}>
                      Cancel
                    </Button>
                  )}
                </Form>
              </div>
            </Col>

            {/* -------- Right Side Table -------- */}
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
                        {showBlocked ? 'Blocked States' : 'Active States'}
                      </h5>
                      <span className="badge theme-badge-secondary" style={{ fontSize: '11px', padding: '4px 8px' }}>
                        {states.length}
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

                {/* Scrollable container */}
                <div style={{ padding: '0 1rem 1rem 1rem', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                  <div style={{ flex: 1, minHeight: isMobileView ? '20rem' : 0, maxHeight: isMobileView ? '24rem' : '32rem', overflowY: 'auto', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }}>
                  {loadingStates ? (
                    <p style={{ padding: '1rem' }}>Loading states...</p>
                  ) : states.length === 0 ? (
                    <p style={{ padding: '1rem' }}>{showBlocked ? 'No blocked states.' : 'No active states added yet.'}</p>
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
                          <th>Name</th>
                          <th>Actions</th>
                        </tr>
                      </thead>

                      <tbody>
                        {states.map((state, index) => (
                          <tr key={state.id}>
                            <td>{index + 1}</td>
                            <td>{state.name}</td>
                            <td>
                              {showBlocked ? (
                                <Button 
                                  variant="outline-success" 
                                  size="sm"
                                  onClick={() => handleUnblockState(state)}
                                >
                                  Unblock
                                </Button>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    className="me-2"
                                    onClick={() => handleEditState(state)}
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
                                  <Button variant="outline-danger" size="sm" onClick={() => handleBlockState(state)}>
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

export default AddState;