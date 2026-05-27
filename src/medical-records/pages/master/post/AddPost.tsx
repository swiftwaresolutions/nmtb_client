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
  code: string;
  stId: number;
  distId: number;
  isActive: number;
  stateName?: string;
  districtName?: string;
}

const AddPost: React.FC = () => {
  const themePrimary = 'var(--page-primary-color)';
  const themeSecondary = 'var(--page-secondary-color)';
  const loginData = useSelector((state: RootState) => state.loginData);
  const apiService = new MedicalRecordsApiService();
  const [isMobileView, setIsMobileView] = useState(() => window.innerWidth < 992);
  const [posts, setPosts] = useState<Post[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [filteredDistricts, setFilteredDistricts] = useState<District[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingStates, setLoadingStates] = useState(true);
  const [loadingDistricts, setLoadingDistricts] = useState(true);

  const [newPost, setNewPost] = useState({ name: '', code: '', stId: '', distId: '' });
  const [editingPost, setEditingPost] = useState<Post | null>(null);
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
          setNewPost(prev => ({ ...prev, stId: tamilNadu.id.toString() }));
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

  // Filter districts when state is selected
  useEffect(() => {
    const stateId = newPost.stId;
    if (stateId) {
      const filtered = districts.filter(d => d.stId === parseInt(stateId));
      setFilteredDistricts(filtered);
      
      // Auto-select first district if not editing
      if (!editingPost && filtered.length > 0) {
        const kanyakumari = filtered.find(
          district => district.name?.toLowerCase() === 'kanyakumari'
        );
        if (kanyakumari) {
          setNewPost(prev => ({ ...prev, distId: kanyakumari.id.toString() }));
        } else {
          setNewPost(prev => ({ ...prev, distId: filtered[0].id.toString() }));
        }
      }
    } else {
      setFilteredDistricts([]);
      if (!editingPost) {
        setNewPost(prev => ({ ...prev, distId: '' }));
      }
    }
  }, [newPost.stId, districts, editingPost]);

  // Load posts when showBlocked changes
  useEffect(() => {
    const loadPosts = async () => {
      try {
        const response = await apiService.fetchAllPosts();
        
        // Filter based on showBlocked state
        // isActive=1 means active, isActive=0 means blocked
        const filteredPosts = response.filter((post: Post) => 
          showBlocked ? post.isActive === 0 : post.isActive === 1
        );

        // Add state and district names to posts for display
        const postsWithNames = filteredPosts.map((post: Post) => {
          const state = states.find(s => s.id === post.stId);
          const district = districts.find(d => d.id === post.distId);
          return {
            ...post,
            stateName: state ? state.name : 'Unknown State',
            districtName: district ? district.name : 'Unknown District'
          };
        });
        
        // Sort by id in ascending order
        const sortedPosts = postsWithNames.sort((a: Post, b: Post) => a.id - b.id);
        setPosts(sortedPosts);
      } catch (err) {
        console.error('Error loading posts:', err);
      } finally {
        setLoadingPosts(false);
      }
    };

    if (!loadingStates && !loadingDistricts) {
      loadPosts();
    }
  }, [showBlocked, loadingStates, loadingDistricts, states, districts]);

  const handleInputChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    if (name === 'stId') {
      // If state is changed, clear the district
      setNewPost({ ...newPost, [name]: value, distId: '' });
    } else {
      setNewPost({ ...newPost, [name]: value });
    }
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setNewPost({ 
      name: post.name || '', 
      code: post.code || '', 
      stId: post.stId ? post.stId.toString() : '',
      distId: post.distId ? post.distId.toString() : ''
    });
    setError('');
    setSuccess('');
  };

  const handleCancelEdit = () => {
    setEditingPost(null);
    const tamilNadu = states.find(s => s.name.toLowerCase() === 'tamil nadu');
    const stateId = tamilNadu ? tamilNadu.id.toString() : '';
    
    let districtId = '';
    if (stateId) {
      const filtered = districts.filter(d => d.stId === parseInt(stateId));
      const kanyakumari = filtered.find(d => d.name?.toLowerCase() === 'kanyakumari');
      districtId = kanyakumari ? kanyakumari.id.toString() : (filtered.length > 0 ? filtered[0].id.toString() : '');
    }
    
    setNewPost({ name: '', code: '', stId: stateId, distId: districtId });
    setError('');
    setSuccess('');
  };

  const handleBlockPost = async (post: Post) => {
    const result = await Swal.fire({
      title: 'Block Post Office',
      text: `Do you want to block "${post.name}"?`,
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
        name: post.name,
        code: post.code,
        stId: post.stId,
        distId: post.distId,
        isActive: 0, // Block by setting isActive to 0
        uid: loginData.id || 0
      };

      await apiService.updatePost(post.id, payload);

      if (!showBlocked) {
        setPosts(posts.filter(p => p.id !== post.id));
      }

      Swal.fire({
        title: 'Blocked!',
        text: 'Post office has been blocked successfully.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });

    } catch (err: any) {
      console.error('Error blocking post:', err);

      Swal.fire({
        title: 'Error!',
        text: err.response?.data?.message || 'Failed to block post office. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleUnblockPost = async (post: Post) => {
    const result = await Swal.fire({
      title: 'Unblock Post Office',
      text: `Do you want to unblock "${post.name}"?`,
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
        name: post.name,
        code: post.code,
        stId: post.stId,
        distId: post.distId,
        isActive: 1, // Unblock by setting isActive to 1
        uid: loginData.id || 0
      };

      await apiService.updatePost(post.id, payload);

      setPosts(posts.filter(p => p.id !== post.id));

      Swal.fire({
        title: 'Unblocked!',
        text: 'Post office has been unblocked successfully.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });

    } catch (err: any) {
      console.error('Error unblocking post:', err);

      Swal.fire({
        title: 'Error!',
        text: err.response?.data?.message || 'Failed to unblock post office. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleAddPost = async () => {
    if (!newPost.name.trim() || !newPost.code.trim() || !newPost.stId || !newPost.distId) {
      setError('Please fill in all required fields.');
      return;
    }

    // Check for duplicate name in the same district
    const existingPost = posts.find(post => 
      post.name.toLowerCase() === newPost.name.trim().toLowerCase() && 
      post.distId.toString() === newPost.distId &&
      (!editingPost || post.id !== editingPost.id)
    );
    
    if (existingPost) {
      setError('A post office with this name already exists in this district.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        name: newPost.name.trim(),
        code: newPost.code.trim(),
        uid: loginData.id || 0,
        isActive: 1,
        stId: parseInt(newPost.stId),
        distId: parseInt(newPost.distId)
      };

      let response: any;
      if (editingPost) {
        // Update existing post
        response = await apiService.updatePost(editingPost.id, payload);

        setPosts(posts.map(post => {
          if (post.id === editingPost.id) {
            const state = states.find(s => s.id === payload.stId);
            const district = districts.find(d => d.id === payload.distId);
            return {
              ...post,
              name: response.name || payload.name,
              code: response.code || payload.code,
              stId: payload.stId,
              distId: payload.distId,
              isActive: 1,
              stateName: state ? state.name : 'Unknown State',
              districtName: district ? district.name : 'Unknown District'
            };
          }
          return post;
        }));

        setSuccess('Post office updated successfully!');
      } else {
        // Add new post
        response = await apiService.savePost(payload);

        const state = states.find(s => s.id === payload.stId);
        const district = districts.find(d => d.id === payload.distId);
        const newPostWithId = {
          id: response.id || Date.now(),
          name: response.name || payload.name,
          code: response.code || payload.code,
          stId: payload.stId,
          distId: payload.distId,
          isActive: 1,
          stateName: state ? state.name : 'Unknown State',
          districtName: district ? district.name : 'Unknown District'
        };

        setPosts([newPostWithId, ...posts]);
        setSuccess('Post office added successfully!');
      }

      const tamilNadu = states.find(s => s.name.toLowerCase() === 'tamil nadu');
      const stateId = tamilNadu ? tamilNadu.id.toString() : '';
      
      let districtId = '';
      if (stateId) {
        const filtered = districts.filter(d => d.stId === parseInt(stateId));
        const kanyakumari = filtered.find(d => d.name?.toLowerCase() === 'kanyakumari');
        districtId = kanyakumari ? kanyakumari.id.toString() : (filtered.length > 0 ? filtered[0].id.toString() : '');
      }
      
      setNewPost({ name: '', code: '', stId: stateId, distId: districtId });
      setEditingPost(null);

      setTimeout(() => setSuccess(''), 3000);

    } catch (err: any) {
      console.error('Error saving post:', err);
      setError(err.response?.data?.message || `Failed to ${editingPost ? 'update' : 'add'} post office. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageShellStyle}>
      <PageHeader icon={faPlus} title={editingPost ? 'Edit Post Office' : 'Add Post Office'} subtitle="" />

      <div className="content-body" style={contentBodyStyle}>
        <Container fluid style={{ maxWidth: '1280px', margin: '0 auto', height: isMobileView ? 'auto' : '100%', minHeight: 0 }}>
          <Row className="g-3 align-items-stretch flex-column flex-lg-row" style={{ height: isMobileView ? 'auto' : '100%', minHeight: 0 }}>
            <Col xs={12} lg={5} style={cardColumnStyle}>
              <div
                className="card shadow-sm"
                style={formCardStyle}
              >
                <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>
                  {editingPost ? 'Edit Post Office' : 'Add New Post Office'}
                </h3>

                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>State *</Form.Label>
                    <Form.Select
                      name="stId"
                      value={newPost.stId}
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
                    <Form.Label>District *</Form.Label>
                    <Form.Select
                      name="distId"
                      value={newPost.distId}
                      onChange={handleInputChange}
                      disabled={loading || loadingDistricts || !newPost.stId}
                    >
                      <option value="">Select a District</option>
                      {filteredDistricts.map(district => (
                        <option key={district.id} value={district.id}>
                          {district.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Post Office Name *</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={newPost.name}
                      onChange={handleInputChange}
                      placeholder="Enter post office name"
                      disabled={loading}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Post Office Code *</Form.Label>
                    <Form.Control
                      type="text"
                      name="code"
                      value={newPost.code}
                      onChange={handleInputChange}
                      placeholder="Enter post office code"
                      disabled={loading}
                    />
                  </Form.Group>

                  <Button variant="primary" onClick={handleAddPost} disabled={loading} style={{ marginRight: '10px' }}>
                    {loading ? 'Saving...' : (editingPost ? 'Update Post Office' : 'Add Post Office')}
                  </Button>

                  {editingPost && (
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
                        {showBlocked ? 'Blocked Post Offices' : 'Active Post Offices'}
                      </h5>
                      <span className="badge theme-badge-secondary" style={{ fontSize: '11px', padding: '4px 8px' }}>
                        {posts.length}
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
                  {loadingPosts || loadingStates || loadingDistricts ? (
                    <p style={{ padding: '1rem' }}>Loading post offices...</p>
                  ) : posts.length === 0 ? (
                    <p style={{ padding: '1rem' }}>{showBlocked ? 'No blocked post offices.' : 'No active post offices added yet.'}</p>
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
                          <th>Post Office</th>
                          <th>District</th>
                          <th>State</th>
                          <th>Code</th>
                          <th>Actions</th>
                        </tr>
                      </thead>

                      <tbody>
                        {posts.map((post, index) => (
                          <tr key={post.id}>
                            <td>{index + 1}</td>
                            <td>{post.name}</td>
                            <td>{post.districtName}</td>
                            <td>{post.stateName}</td>
                            <td>{post.code}</td>
                            <td>
                              {showBlocked ? (
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  onClick={() => handleUnblockPost(post)}
                                >
                                  Unblock
                                </Button>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    className="me-2"
                                    onClick={() => handleEditPost(post)}
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
                                  <Button variant="outline-danger" size="sm" onClick={() => handleBlockPost(post)}>
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

export default AddPost;
