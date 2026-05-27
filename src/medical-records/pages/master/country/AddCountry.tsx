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

const AddCountry: React.FC = () => {
  const themePrimary = 'var(--page-primary-color)';
  const themeSecondary = 'var(--page-secondary-color)';
  const loginData = useSelector((state: RootState) => state.loginData);
  const [isMobileView, setIsMobileView] = useState(() => window.innerWidth < 992);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);

  const [newCountry, setNewCountry] = useState({ name: '', code: '' });
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);
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

  // Load countries from API on component mount and when showBlocked changes
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 992);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const response = await apiService.fetchAllCountries();
        // Filter based on showBlocked state
        // isActive=1 means active, isActive=0 means blocked
        const filteredCountries = response.filter((country: Country) => 
          showBlocked ? country.isActive === 0 : country.isActive === 1
        );
        setCountries(filteredCountries);
      } catch (err) {
        console.error('Error loading countries:', err);
      } finally {
        setLoadingCountries(false);
      }
    };

    loadCountries();
  }, [showBlocked]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCountry({ ...newCountry, [name]: value });
  };

  const handleEditCountry = (country: Country) => {
    setEditingCountry(country);
    setNewCountry({ name: country.name, code: country.code });
    setError('');
    setSuccess('');
  };

  const handleCancelEdit = () => {
    setEditingCountry(null);
    setNewCountry({ name: '', code: '' });
    setError('');
    setSuccess('');
  };

  const handleBlockCountry = async (country: Country) => {
    const result = await Swal.fire({
      title: 'Block Country',
      text: `Do you want to block "${country.name}"?`,
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
        name: country.name,
        code: country.code,
        uid: loginData.id || 0,
        isActive: 0 // Block the country
      };
      
      await apiService.updateCountry(country.id, payload);
      
      // Remove the blocked country from the active list
      if (!showBlocked) {
        setCountries(countries.filter(c => c.id !== country.id));
      }
      
      Swal.fire({
        title: 'Blocked!',
        text: 'Country has been blocked successfully.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      
    } catch (err: any) {
      console.error('Error blocking country:', err);
      
      Swal.fire({
        title: 'Error!',
        text: err.response?.data?.message || 'Failed to block country. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleUnblockCountry = async (country: Country) => {
    const result = await Swal.fire({
      title: 'Unblock Country',
      text: `Do you want to unblock "${country.name}"?`,
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
        name: country.name,
        code: country.code,
        uid: loginData.id || 0,
        isActive: 1 // Unblock the country
      };
      
      await apiService.updateCountry(country.id, payload);
      
      // Remove the unblocked country from the blocked list
      setCountries(countries.filter(c => c.id !== country.id));
      
      Swal.fire({
        title: 'Unblocked!',
        text: 'Country has been unblocked successfully.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      
    } catch (err: any) {
      console.error('Error unblocking country:', err);
      
      Swal.fire({
        title: 'Error!',
        text: err.response?.data?.message || 'Failed to unblock country. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleAddCountry = async () => {
    if (!newCountry.name.trim() || !newCountry.code.trim()) {
      setError('Please fill in both name and code.');
      return;
    }

    // Check for duplicate name
    const existingCountry = countries.find(country => 
      country.name.toLowerCase() === newCountry.name.trim().toLowerCase() && 
      (!editingCountry || country.id !== editingCountry.id)
    );
    
    if (existingCountry) {
      setError('A country with this name already exists.');
      return;
    }

    // Check for duplicate code
    const existingCode = countries.find(country => 
      country.code.toLowerCase() === newCountry.code.trim().toLowerCase() && 
      (!editingCountry || country.id !== editingCountry.id)
    );
    
    if (existingCode) {
      setError('A country with this code already exists.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        name: newCountry.name.trim(),
        code: newCountry.code.trim().toUpperCase(),
        uid: loginData.id || 0,
        isActive: 1
      };

      let response: any;
      
      if (editingCountry) {
        // Update existing country using updateCountry API
        response = await apiService.updateCountry(editingCountry.id, payload);
        
        // Update existing country in the list
        setCountries(countries.map(country => 
          country.id === editingCountry.id 
            ? { id: editingCountry.id, name: response.name || payload.name, code: response.code || payload.code, isActive: 1 }
            : country
        ));
        
        setSuccess('Country updated successfully!');
      } else {
        // Create new country using saveCountry API
        response = await apiService.saveCountry(payload);
        
        // Add new country to the list
        const newCountryWithId = {
          id: response.id || Date.now(),
          name: response.name || payload.name,
          code: response.code || payload.code,
          isActive: 1
        };

        setCountries([...countries, newCountryWithId]);
        setSuccess('Country added successfully!');
      }

      // Reset form
      setNewCountry({ name: '', code: '' });
      setEditingCountry(null);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);

    } catch (err: any) {
      console.error('Error saving country:', err);
      setError(err.response?.data?.message || `Failed to ${editingCountry ? 'update' : 'add'} country. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageShellStyle}>
      <PageHeader icon={faPlus} title={editingCountry ? 'Edit Country' : 'Add Country'} subtitle="" />

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
                  {editingCountry ? 'Edit Country' : 'Add New Country'}
                </h3>

                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Country Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={newCountry.name}
                      onChange={handleInputChange}
                      placeholder="Enter country name"
                      disabled={loading}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Country Code</Form.Label>
                    <Form.Control
                      type="text"
                      name="code"
                      value={newCountry.code}
                      onChange={handleInputChange}
                      placeholder="Enter country code (e.g., US, IN)"
                      disabled={loading}
                      maxLength={3}
                      style={{ textTransform: 'uppercase' }}
                    />
                  </Form.Group>

                  <Button variant="primary" onClick={handleAddCountry} disabled={loading} style={{ marginRight: '10px' }}>
                    {loading ? 'Saving...' : (editingCountry ? 'Update Country' : 'Add Country')}
                  </Button>
                  
                  {editingCountry && (
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
                        {showBlocked ? 'Blocked Countries' : 'Active Countries'}
                      </h5>
                      <span className="badge theme-badge-secondary" style={{ fontSize: '11px', padding: '4px 8px' }}>
                        {countries.length}
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
                  {loadingCountries ? (
                    <p style={{ padding: '1rem' }}>Loading countries...</p>
                  ) : countries.length === 0 ? (
                    <p style={{ padding: '1rem' }}>{showBlocked ? 'No blocked countries.' : 'No active countries added yet.'}</p>
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
                          <th>Code</th>
                          <th>Actions</th>
                        </tr>
                      </thead>

                      <tbody>
                        {countries
                          .sort((a, b) => a.id - b.id)
                          .map((country, index) => (
                          <tr key={country.id}>
                            <td>{index + 1}</td>
                            <td>{country.name}</td>
                            <td>{country.code}</td>
                            <td>
                              {showBlocked ? (
                                <Button 
                                  variant="outline-success" 
                                  size="sm"
                                  onClick={() => handleUnblockCountry(country)}
                                >
                                  Unblock
                                </Button>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    className="me-2"
                                    onClick={() => handleEditCountry(country)}
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
                                  <Button variant="outline-danger" size="sm" onClick={() => handleBlockCountry(country)}>
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

export default AddCountry;
