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
  stId: number;
  isActive: number;
}

interface Post {
  id: number;
  name: string;
  distId: number;
  stId: number;
  isActive: number;
}

interface Village {
  id: number;
  name: string;
  code: string;
  villageType: string;
  postId?: number;
  distId: number;
  stId: number;
  isActive: number;
  districtName?: string;
  stateName?: string;
  postName?: string;
}

const AddVillage: React.FC = () => {
  const themePrimary = 'var(--page-primary-color)';
  const themeSecondary = 'var(--page-secondary-color)';
  const [isMobileView, setIsMobileView] = useState(() => window.innerWidth < 992);
  const loginData = useSelector((state: RootState) => state.loginData);
  const apiService = new MedicalRecordsApiService();
  const [villages, setVillages] = useState<Village[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredDistricts, setFilteredDistricts] = useState<District[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [loadingVillages, setLoadingVillages] = useState(true);
  const [loadingStates, setLoadingStates] = useState(true);
  const [loadingDistricts, setLoadingDistricts] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);

  const [newVillage, setNewVillage] = useState({ name: '', code: '', villageType: 'C', stId: '', distId: '', postId: '' });
  const [editingVillage, setEditingVillage] = useState<Village | null>(null);
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
          setNewVillage(prev => ({ ...prev, stId: tamilNadu.id.toString() }));
        }
      } catch (err) {
        console.error('Error loading states:', err);
      } finally {
        setLoadingStates(false);
      }
    };

    loadStates();
  }, []);

  // Load all districts on component mount
  useEffect(() => {
    const loadDistricts = async () => {
      try {
        const response = await apiService.fetchAllDistricts();
        // Filter only active districts (isActive=1)
        const activeDistricts = response.filter((district: District) => district.isActive === 1);
        setDistricts(activeDistricts);
      } catch (err) {
        console.error('Error loading districts:', err);
      } finally {
        setLoadingDistricts(false);
      }
    };

    loadDistricts();
  }, []);

  // Load all posts on component mount
  useEffect(() => {
    const loadPosts = async () => {
      try {
        const response = await apiService.fetchAllPosts();
        // Filter only active posts (isActive=1)
        const activePosts = response.filter((post: Post) => post.isActive === 1);
        setPosts(activePosts);
      } catch (err) {
        console.error('Error loading posts:', err);
      } finally {
        setLoadingPosts(false);
      }
    };

    loadPosts();
  }, []);

  // Filter districts when state is selected
  useEffect(() => {
    const stateId = newVillage.stId;
    if (stateId) {
      const filtered = districts.filter(d => d.stId === parseInt(stateId));
      setFilteredDistricts(filtered);
      
      // Auto-select Kanyakumari if not editing
      if (!editingVillage && filtered.length > 0) {
        const kanyakumari = filtered.find(
          district => district.name && district.name.toLowerCase() === 'kanyakumari'
        );
        if (kanyakumari) {
          setNewVillage(prev => ({ ...prev, distId: kanyakumari.id.toString() }));
        }
      }
    } else {
      setFilteredDistricts([]);
      if (!editingVillage) {
        setNewVillage(prev => ({ ...prev, distId: '', postId: '' }));
      }
    }
  }, [newVillage.stId, districts, editingVillage]);

  // Filter posts when district is selected
  useEffect(() => {
    const districtId = newVillage.distId;
    if (districtId) {
      const filtered = posts.filter(p => p.distId === parseInt(districtId));
      setFilteredPosts(filtered);
      
      // Auto-select Nagercoil if not editing
      if (!editingVillage && filtered.length > 0) {
        const nagercoil = filtered.find(
          post => post.name && post.name.toLowerCase() === 'nagercoil'
        );
        if (nagercoil) {
          setNewVillage(prev => ({ ...prev, postId: nagercoil.id.toString() }));
        }
      }
    } else {
      setFilteredPosts([]);
      if (!editingVillage) {
        setNewVillage(prev => ({ ...prev, postId: '' }));
      }
    }
  }, [newVillage.distId, posts, editingVillage]);

  // Load villages when showBlocked changes
  useEffect(() => {
    const loadVillages = async () => {
      try {
        const response = await apiService.fetchAllVillages();
        
        // Filter based on showBlocked state
        // isActive=1 means active, isActive=0 means blocked
        const filteredVillages = response.filter((village: Village) => 
          showBlocked ? village.isActive === 0 : village.isActive === 1
        );

        // Add state, district, and post names to villages for display
        const villagesWithNames = filteredVillages.map((village: Village) => {
          const state = states.find(s => s.id === village.stId);
          const district = districts.find(d => d.id === village.distId);
          const post = posts.find(p => p.id === village.postId);
          return {
            ...village,
            stateName: state ? state.name : 'Unknown State',
            districtName: district ? district.name : 'Unknown District',
            postName: post ? post.name : 'N/A'
          };
        });
        
        // Sort by id in ascending order
        const sortedVillages = villagesWithNames.sort((a: Village, b: Village) => a.id - b.id);
        setVillages(sortedVillages);
      } catch (err) {
        console.error('Error loading villages:', err);
      } finally {
        setLoadingVillages(false);
      }
    };

    if (!loadingStates && !loadingDistricts && !loadingPosts) {
      loadVillages();
    }
  }, [showBlocked, loadingStates, loadingDistricts, loadingPosts, states, districts, posts]);

  const handleInputChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    
    // If state changes, clear district and post
    if (name === 'stId') {
      setNewVillage({ ...newVillage, [name]: value, distId: '', postId: '' });
    }
    // If district changes, clear post
    else if (name === 'distId') {
      setNewVillage({ ...newVillage, [name]: value, postId: '' });
    }
    // Otherwise just update the field
    else {
      setNewVillage({ ...newVillage, [name]: value });
    }
  };

  const handleEditVillage = (village: Village) => {
    setEditingVillage(village);
    setNewVillage({ 
      name: village.name || '', 
      code: village.code || '', 
      villageType: village.villageType || 'C',
      stId: village.stId ? village.stId.toString() : '',
      distId: village.distId ? village.distId.toString() : '',
      postId: village.postId ? village.postId.toString() : ''
    });
    
    // Set filtered districts based on state
    if (village.stId) {
      const filtered = districts.filter(d => d.stId === village.stId);
      setFilteredDistricts(filtered);
    }
    
    // Set filtered posts based on district
    if (village.distId) {
      const filtered = posts.filter(p => p.distId === village.distId);
      setFilteredPosts(filtered);
    }
    
    setError('');
    setSuccess('');
  };

  const handleCancelEdit = () => {
    setEditingVillage(null);
    
    // Reset to Tamil Nadu, Kanyakumari, and Nagercoil defaults
    const tamilNadu = states.find(
      state => state.name && state.name.toLowerCase() === 'tamil nadu'
    );
    const stateId = tamilNadu ? tamilNadu.id.toString() : '';
    
    let districtId = '';
    let postId = '';
    if (stateId) {
      const filtered = districts.filter(d => d.stId === parseInt(stateId));
      const kanyakumari = filtered.find(
        district => district.name && district.name.toLowerCase() === 'kanyakumari'
      );
      districtId = kanyakumari ? kanyakumari.id.toString() : '';
      
      if (districtId) {
        const filteredPosts = posts.filter(p => p.distId === parseInt(districtId));
        const nagercoil = filteredPosts.find(
          post => post.name && post.name.toLowerCase() === 'nagercoil'
        );
        postId = nagercoil ? nagercoil.id.toString() : '';
      }
    }
    
    setNewVillage({ name: '', code: '', villageType: 'C', stId: stateId, distId: districtId, postId });
    setError('');
    setSuccess('');
  };

  const handleBlockVillage = async (village: Village) => {
    const result = await Swal.fire({
      title: 'Block Village',
      text: `Do you want to block "${village.name}"?`,
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
        name: village.name,
        code: village.code,
        villageType: village.villageType,
        stId: village.stId,
        distId: village.distId,
        postId: village.postId || 0,
        isActive: 0, // Block by setting isActive to 0
        uid: loginData.id || 0
      };

      await apiService.updateVillage(village.id, payload);

      if (!showBlocked) {
        setVillages(villages.filter(v => v.id !== village.id));
      }

      Swal.fire({
        title: 'Blocked!',
        text: 'Village has been blocked successfully.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });

    } catch (err: any) {
      console.error('Error blocking village:', err);

      Swal.fire({
        title: 'Error!',
        text: err.response?.data?.message || 'Failed to block village. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleUnblockVillage = async (village: Village) => {
    const result = await Swal.fire({
      title: 'Unblock Village',
      text: `Do you want to unblock "${village.name}"?`,
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
        name: village.name,
        code: village.code,
        villageType: village.villageType,
        stId: village.stId,
        distId: village.distId,
        postId: village.postId || 0,
        isActive: 1, // Unblock by setting isActive to 1
        uid: loginData.id || 0
      };

      await apiService.updateVillage(village.id, payload);

      setVillages(villages.filter(v => v.id !== village.id));

      Swal.fire({
        title: 'Unblocked!',
        text: 'Village has been unblocked successfully.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });

    } catch (err: any) {
      console.error('Error unblocking village:', err);

      Swal.fire({
        title: 'Error!',
        text: err.response?.data?.message || 'Failed to unblock village. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleAddVillage = async () => {
    if (!newVillage.name.trim() || !newVillage.stId || !newVillage.distId) {
      setError('Please fill in village name and select both state and district.');
      return;
    }

    // Check for duplicate name
    const existingVillage = villages.find(village => 
      village.name.toLowerCase() === newVillage.name.trim().toLowerCase() && 
      (!editingVillage || village.id !== editingVillage.id)
    );
    
    if (existingVillage) {
      setError('A village with this name already exists.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        name: newVillage.name.trim(),
        code: newVillage.code.trim(),
        villageType: newVillage.villageType,
        postId: newVillage.postId ? parseInt(newVillage.postId) : 0,
        stId: parseInt(newVillage.stId),
        distId: parseInt(newVillage.distId),
        uid: loginData.id || 0,
        isActive: 1
      };

      let response: any;
      if (editingVillage) {
        // Update existing village
        response = await apiService.updateVillage(editingVillage.id, payload);

        setVillages(villages.map(village => {
          if (village.id === editingVillage.id) {
            const state = states.find(s => s.id === payload.stId);
            const district = districts.find(d => d.id === payload.distId);
            const post = posts.find(p => p.id === payload.postId);
            return {
              ...village,
              name: payload.name,
              code: payload.code,
              villageType: payload.villageType,
              stId: payload.stId,
              distId: payload.distId,
              postId: payload.postId,
              stateName: state ? state.name : 'Unknown State',
              districtName: district ? district.name : 'Unknown District',
              postName: post ? post.name : 'N/A'
            };
          }
          return village;
        }));

        setSuccess('Village updated successfully!');
      } else {
        // Add new village
        response = await apiService.saveVillage(payload);

        const state = states.find(s => s.id === payload.stId);
        const district = districts.find(d => d.id === payload.distId);
        const post = posts.find(p => p.id === payload.postId);
        const newVillageWithId = {
          id: response.id || Date.now(),
          name: payload.name,
          code: payload.code,
          villageType: payload.villageType,
          postId: payload.postId,
          stId: payload.stId,
          distId: payload.distId,
          isActive: 1,
          stateName: state ? state.name : 'Unknown State',
          districtName: district ? district.name : 'Unknown District',
          postName: post ? post.name : 'N/A'
        };

        setVillages([...villages, newVillageWithId]);
        setSuccess('Village added successfully!');
      }

      // Reset to Tamil Nadu, Kanyakumari, and Nagercoil defaults
      const tamilNadu = states.find(
        state => state.name && state.name.toLowerCase() === 'tamil nadu'
      );
      const stateId = tamilNadu ? tamilNadu.id.toString() : '';
      
      let districtId = '';
      let postId = '';
      if (stateId) {
        const filtered = districts.filter(d => d.stId === parseInt(stateId));
        const kanyakumari = filtered.find(
          district => district.name && district.name.toLowerCase() === 'kanyakumari'
        );
        districtId = kanyakumari ? kanyakumari.id.toString() : '';
        
        if (districtId) {
          const filteredPosts = posts.filter(p => p.distId === parseInt(districtId));
          const nagercoil = filteredPosts.find(
            post => post.name && post.name.toLowerCase() === 'nagercoil'
          );
          postId = nagercoil ? nagercoil.id.toString() : '';
        }
      }
      
      setNewVillage({ name: '', code: '', villageType: 'C', stId: stateId, distId: districtId, postId });
      setEditingVillage(null);

      setTimeout(() => setSuccess(''), 3000);

    } catch (err: any) {
      console.error('Error saving village:', err);
      setError(err.response?.data?.message || `Failed to ${editingVillage ? 'update' : 'add'} village. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageShellStyle}>
      <PageHeader icon={faPlus} title={editingVillage ? 'Edit Village' : 'Add Village'} subtitle="" />

      <div className="content-body" style={contentBodyStyle}>
        <Container fluid style={{ maxWidth: '1400px', margin: '0 auto', height: isMobileView ? 'auto' : '100%', minHeight: 0 }}>
          <Row className="g-3 align-items-stretch flex-column flex-lg-row" style={{ height: isMobileView ? 'auto' : '100%', minHeight: 0 }}>
            <Col xs={12} lg={5} style={cardColumnStyle}>
              <div
                className="card shadow-sm"
                style={formCardStyle}
              >
                

                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <Form>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>State *</Form.Label>
                        <Form.Select
                          name="stId"
                          value={newVillage.stId}
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
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>District *</Form.Label>
                        <Form.Select
                          name="distId"
                          value={newVillage.distId}
                          onChange={handleInputChange}
                          disabled={loading || loadingDistricts}
                        >
                          <option value="">Select a District</option>
                          {filteredDistricts.map(district => (
                            <option key={district.id} value={district.id}>
                              {district.name}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Post Office</Form.Label>
                        <Form.Select
                          name="postId"
                          value={newVillage.postId}
                          onChange={handleInputChange}
                          disabled={loading || loadingPosts}
                        >
                          <option value="">Select a Post Office</option>
                          {filteredPosts.map(post => (
                            <option key={post.id} value={post.id}>
                              {post.name}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Village Name *</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={newVillage.name}
                          onChange={handleInputChange}
                          placeholder="Enter village name"
                          disabled={loading}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Village Code</Form.Label>
                        <Form.Control
                          type="text"
                          name="code"
                          value={newVillage.code}
                          onChange={handleInputChange}
                          placeholder="Enter village code (optional)"
                          disabled={loading}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Village Type</Form.Label>
                        <Form.Select
                          name="villageType"
                          value={newVillage.villageType}
                          onChange={handleInputChange}
                          disabled={loading}
                        >
                          <option value="C">City (C)</option>
                          <option value="V">Village (V)</option>
                          <option value="T">Town (T)</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Button variant="primary" onClick={handleAddVillage} disabled={loading} style={{ marginRight: '10px' }}>
                    {loading ? 'Saving...' : (editingVillage ? 'Update Village' : 'Add Village')}
                  </Button>

                  {editingVillage && (
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
                        {showBlocked ? 'Blocked Villages' : 'Active Villages'}
                      </h5>
                      <span className="badge theme-badge-secondary" style={{ fontSize: '11px', padding: '4px 8px' }}>
                        {villages.length}
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

                {/* Scrollable Table Content */}
                <div style={{ padding: '0 1rem 1rem 1rem', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                  <div style={{ flex: 1, minHeight: isMobileView ? '20rem' : 0, maxHeight: isMobileView ? '24rem' : '32rem', overflowY: 'auto', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }}>
                    {loadingVillages || loadingStates || loadingDistricts ? (
                      <p style={{ padding: '1rem' }}>Loading villages...</p>
                    ) : villages.length === 0 ? (
                      <p style={{ padding: '1rem' }}>{showBlocked ? 'No blocked villages.' : 'No active villages added yet.'}</p>
                    ) : (
                      <Table striped bordered hover style={{ marginBottom: 0 }}>
                        <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                          <tr>
                            <th>#</th>
                            <th>Village</th>
                            <th>State</th>
                            <th>District</th>
                            <th>Post Office</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {villages.map((village, index) => (
                            <tr key={village.id}>
                              <td>{index + 1}</td>
                              <td>{village.name}</td>
                              <td>{village.stateName}</td>
                              <td>{village.districtName}</td>
                              <td>{village.postName}</td>
                              <td>
                                {showBlocked ? (
                                  <Button
                                    variant="outline-success"
                                    size="sm"
                                    onClick={() => handleUnblockVillage(village)}
                                  >
                                    Unblock
                                  </Button>
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      className="me-2"
                                      onClick={() => handleEditVillage(village)}
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
                                    <Button variant="outline-danger" size="sm" onClick={() => handleBlockVillage(village)}>
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

export default AddVillage;
