import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Table, Row, Col, Alert } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { useSelector } from 'react-redux';
import MedicalRecordsApiService from '../../../../api/medical-records/medical-records-api-service';
import PageHeader from '../../../../components/PageHeader';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { ListCheck, ShieldX, ArrowRepeat } from 'react-bootstrap-icons';

interface Complaint {
  id: number;
  name: string;
  isBlocked: number;
  uid?: number;
  dateTime?: string;
  blockDateTime?: string;
  blockUid?: number;
}

const AddComplaint: React.FC = () => {
  const themePrimary = 'var(--page-primary-color)';
  const themeSecondary = 'var(--page-secondary-color)';
  const [isMobileView, setIsMobileView] = useState(() => window.innerWidth < 992);
  const [allComplaints, setAllComplaints] = useState<Complaint[]>([]);
  const [loadingComplaints, setLoadingComplaints] = useState(true);

  const [newComplaint, setNewComplaint] = useState({ name: '' });
  const [editingComplaint, setEditingComplaint] = useState<Complaint | null>(null);
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

  // Load complaints from API on component mount
  useEffect(() => {
    const loadComplaints = async () => {
      try {
        const response = await apiService.fetchAllComplaints();
        setAllComplaints(response);
      } catch (err) {
        console.error('Error loading complaints:', err);
      } finally {
        setLoadingComplaints(false);
      }
    };

    loadComplaints();
  }, []);

  // Filter complaints based on showBlocked state
  const complaints = allComplaints.filter(complaint => 
    showBlocked ? complaint.isBlocked === 1 : complaint.isBlocked === 0
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewComplaint({ ...newComplaint, [name]: value });
  };

  const handleEditComplaint = (complaint: Complaint) => {
    setEditingComplaint(complaint);
    setNewComplaint({ name: complaint.name });
    setError('');
    setSuccess('');
  };

  const handleCancelEdit = () => {
    setEditingComplaint(null);
    setNewComplaint({ name: '' });
    setError('');
    setSuccess('');
  };

  const handleBlockComplaint = async (complaint: Complaint) => {
    const result = await Swal.fire({
      title: 'Block Complaint',
      text: `Do you want to block "${complaint.name}"?`,
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
      await apiService.updateComplaint(complaint.id, {
        name: complaint.name,
        isBlocked: 1
      });
      
      // Update the complaint in the list
      setAllComplaints(allComplaints.map(c => 
        c.id === complaint.id ? { ...c, isBlocked: 1 } : c
      ));
      
      Swal.fire({
        title: 'Blocked!',
        text: 'Complaint has been blocked successfully.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      
    } catch (err: any) {
      console.error('Error blocking complaint:', err);
      
      Swal.fire({
        title: 'Error!',
        text: err.response?.data?.message || 'Failed to block complaint. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleUnblockComplaint = async (complaint: Complaint) => {
    const result = await Swal.fire({
      title: 'Unblock Complaint',
      text: `Do you want to unblock "${complaint.name}"?`,
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
      await apiService.updateComplaint(complaint.id, {
        name: complaint.name,
        isBlocked: 0
      });
      
      // Update the complaint in the list
      setAllComplaints(allComplaints.map(c => 
        c.id === complaint.id ? { ...c, isBlocked: 0 } : c
      ));
      
      Swal.fire({
        title: 'Unblocked!',
        text: 'Complaint has been unblocked successfully.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      
    } catch (err: any) {
      console.error('Error unblocking complaint:', err);
      
      Swal.fire({
        title: 'Error!',
        text: err.response?.data?.message || 'Failed to unblock complaint. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleAddComplaint = async () => {
    if (!newComplaint.name.trim()) {
      setError('Please enter complaint name.');
      return;
    }

    // Check for duplicate name in active complaints
    const existingComplaint = allComplaints.find(complaint => 
      complaint.name.toLowerCase() === newComplaint.name.trim().toLowerCase() && 
      complaint.isBlocked === 0 &&
      (!editingComplaint || complaint.id !== editingComplaint.id)
    );
    
    if (existingComplaint) {
      setError('A complaint with this name already exists.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        name: newComplaint.name.trim(),
        isBlocked: editingComplaint ? editingComplaint.isBlocked : 0
      };

      if (editingComplaint) {
        // Update existing complaint
        const response = await apiService.updateComplaint(editingComplaint.id, payload);
        
        // Update the complaint in the list
        setAllComplaints(allComplaints.map(complaint => 
          complaint.id === editingComplaint.id 
            ? { ...complaint, name: payload.name }
            : complaint
        ));
        
        setSuccess('Complaint updated successfully!');
      } else {
        // Add new complaint
        const response = await apiService.saveComplaint(payload);

        // Add the new complaint to the list
        const newComplaintWithId: Complaint = {
          id: response.id || response.data?.id || Date.now(),
          name: payload.name,
          isBlocked: 0
        };

        setAllComplaints([...allComplaints, newComplaintWithId]);
        setSuccess('Complaint added successfully!');
      }

      // Reset form
      setNewComplaint({ name: '' });
      setEditingComplaint(null);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);

    } catch (err: any) {
      console.error('Error saving complaint:', err);
      setError(err.response?.data?.message || `Failed to ${editingComplaint ? 'update' : 'add'} complaint. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageShellStyle}>
      <PageHeader icon={faPlus} title={editingComplaint ? 'Edit Complaint' : 'Add Complaint'} subtitle="" />

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
                  {editingComplaint ? 'Edit Complaint' : 'Add New Complaint'}
                </h3>

                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Complaint Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={newComplaint.name}
                      onChange={handleInputChange}
                      placeholder="Enter complaint name"
                      disabled={loading}
                    />
                  </Form.Group>

                  <Button variant="primary" onClick={handleAddComplaint} disabled={loading} style={{ marginRight: '10px' }}>
                    {loading ? 'Saving...' : (editingComplaint ? 'Update Complaint' : 'Add Complaint')}
                  </Button>
                  
                  {editingComplaint && (
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
                        {showBlocked ? 'Blocked Complaints' : 'Active Complaints'}
                      </h5>
                      <span className="badge theme-badge-secondary" style={{ fontSize: '11px', padding: '4px 8px' }}>
                        {complaints.length}
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
                  {loadingComplaints ? (
                    <p style={{ padding: '1rem' }}>Loading complaints...</p>
                  ) : complaints.length === 0 ? (
                    <p style={{ padding: '1rem' }}>{showBlocked ? 'No blocked complaints.' : 'No active complaints added yet.'}</p>
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
                        {complaints.map(complaint => (
                          <tr key={complaint.id}>
                            <td>{complaint.id}</td>
                            <td>{complaint.name}</td>
                            <td>
                              {showBlocked ? (
                                <Button 
                                  variant="outline-success" 
                                  size="sm"
                                  onClick={() => handleUnblockComplaint(complaint)}
                                >
                                  Unblock
                                </Button>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    className="me-2"
                                    onClick={() => handleEditComplaint(complaint)}
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
                                  <Button variant="outline-danger" size="sm" onClick={() => handleBlockComplaint(complaint)}>
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

export default AddComplaint;
