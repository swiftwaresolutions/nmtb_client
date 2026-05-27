import React, { useState, useEffect } from 'react';
import { Container, Breadcrumb, Form, Button, Table, Row, Col, Alert } from 'react-bootstrap';
import Swal from 'sweetalert2';
import MedicalRecordsApiService from '../../../../api/medical-records/medical-records-api-service';

interface DepartmentData {
  id: number;
  name: string;
  newCharges?: number;
  repeatCharges?: number;
  concession?: number;
  days?: number;
  isActive?: number;
}

const Department: React.FC = () => {
  const apiService = new MedicalRecordsApiService();
  const [departments, setDepartments] = useState<DepartmentData[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);

  const [newDepartment, setNewDepartment] = useState({
    name: '',
    newCharges: '',
    repeatCharges: '',
    concession: '',
    days: ''
  });
  const [editingDepartment, setEditingDepartment] = useState<DepartmentData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [showBlocked, setShowBlocked] = useState(false);

  // Load departments on component mount and when showBlocked changes
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const response = await apiService.fetchAllDepartments();
        console.log('All departments from API:', response);
        
        // Filter based on showBlocked state
        // isActive=1 or undefined means active, isActive=0 means blocked
        const filteredDepartments = response.filter((department: DepartmentData) => {
          const isActiveValue = department.isActive;
          console.log(`Dept: ${department.name}, isActive: ${isActiveValue}, showBlocked: ${showBlocked}`);
          
          if (showBlocked) {
            // Show departments where isActive is 0 (blocked)
            return isActiveValue === 0;
          } else {
            // Show departments where isActive is 1, undefined, or null (active)
            return isActiveValue === 1 ||
                   isActiveValue === undefined || isActiveValue === null;
          }
        });

        console.log('Filtered departments:', filteredDepartments);
        
        // Sort by id in ascending order
        const sortedDepartments = filteredDepartments.sort((a: DepartmentData, b: DepartmentData) => a.id - b.id);
        setDepartments(sortedDepartments);
      } catch (err) {
        console.error('Error loading departments:', err);
      } finally {
        setLoadingDepartments(false);
      }
    };

    loadDepartments();
  }, [showBlocked]);

  const handleInputChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    setNewDepartment({ ...newDepartment, [name]: value });
  };

  const handleEditDepartment = (department: DepartmentData) => {
    setEditingDepartment(department);
    setNewDepartment({
      name: department.name || '',
      newCharges: department.newCharges?.toString() || '',
      repeatCharges: department.repeatCharges?.toString() || '',
      concession: department.concession?.toString() || '',
      days: department.days?.toString() || ''
    });
    setError('');
    setSuccess('');
  };

  const handleCancelEdit = () => {
    setEditingDepartment(null);
    setNewDepartment({ name: '', newCharges: '', repeatCharges: '', concession: '', days: '' });
    setError('');
    setSuccess('');
  };

  const handleBlockDepartment = async (department: DepartmentData) => {
    const result = await Swal.fire({
      title: 'Block Department',
      text: `Do you want to block "${department.name}"?`,
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
      const updatePayload = {
        name: department.name,
        isActive: 0,
        newCharges: department.newCharges || 0,
        repeatCharges: department.repeatCharges || 0,
        concession: department.concession || 0,
        days: department.days || 0
      };
      
      console.log('Blocking department - sending payload:', updatePayload);
      const response = await apiService.updateDepartment(department.id, updatePayload);
      console.log('Block response from API:', response);

      // Remove from current active list
      setDepartments(departments.filter(d => d.id !== department.id));

      Swal.fire({
        title: 'Blocked!',
        text: 'Department has been blocked successfully.',
        icon: 'success',
        showConfirmButton: true,
        confirmButtonText: 'OK'
      });

    } catch (err: any) {
      console.error('Error blocking department:', err);

      Swal.fire({
        title: 'Error!',
        text: err.response?.data?.message || 'Failed to block department. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleUnblockDepartment = async (department: DepartmentData) => {
    const result = await Swal.fire({
      title: 'Unblock Department',
      text: `Do you want to unblock "${department.name}"?`,
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
      await apiService.updateDepartment(department.id, {
        name: department.name,
        isActive: 1,
        newCharges: department.newCharges || 0,
        repeatCharges: department.repeatCharges || 0,
        concession: department.concession || 0,
        days: department.days || 0
      });

      // Remove from current blocked list
      setDepartments(departments.filter(d => d.id !== department.id));

      Swal.fire({
        title: 'Unblocked!',
        text: 'Department has been unblocked successfully.',
        icon: 'success',
        showConfirmButton: true,
        confirmButtonText: 'OK'
      });

    } catch (err: any) {
      console.error('Error unblocking department:', err);

      Swal.fire({
        title: 'Error!',
        text: err.response?.data?.message || 'Failed to unblock department. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleAddDepartment = async () => {
    if (!newDepartment.name.trim()) {
      setError('Please fill in department name.');
      return;
    }

    // Check for duplicate name
    const existingDepartment = departments.find(department =>
      department.name.toLowerCase() === newDepartment.name.trim().toLowerCase() &&
      (!editingDepartment || department.id !== editingDepartment.id)
    );

    if (existingDepartment) {
      setError('A department with this name already exists.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        name: newDepartment.name.trim(),
        isActive: 1,
        newCharges: Number(newDepartment.newCharges) || 0,
        repeatCharges: Number(newDepartment.repeatCharges) || 0,
        concession: Number(newDepartment.concession) || 0,
        days: Number(newDepartment.days) || 0
      };

      let response: any;
      if (editingDepartment) {
        // Update existing department
        response = await apiService.updateDepartment(editingDepartment.id, payload);

        setDepartments(departments.map(department => {
          if (department.id === editingDepartment.id) {
            return {
              ...department,
              name: response.name || payload.name,
              newCharges: payload.newCharges,
              repeatCharges: payload.repeatCharges,
              concession: payload.concession,
              days: payload.days,
              isActive: 1
            };
          }
          return department;
        }));

        setSuccess('Department updated successfully!');
      } else {
        // Add new department
        response = await apiService.saveDepartment(payload);

        const newDepartmentWithId = {
          id: response.id || Date.now(),
          name: response.name || payload.name,
          newCharges: payload.newCharges,
          repeatCharges: payload.repeatCharges,
          concession: payload.concession,
          days: payload.days,
          isActive: 1
        };

        setDepartments([newDepartmentWithId, ...departments]);
        setSuccess('Department added successfully!');
      }

      setNewDepartment({ name: '', newCharges: '', repeatCharges: '', concession: '', days: '' });
      setEditingDepartment(null);

      setTimeout(() => setSuccess(''), 3000);

    } catch (err: any) {
      console.error('Error saving department:', err);
      setError(err.response?.data?.message || `Failed to ${editingDepartment ? 'update' : 'add'} department. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="content-header">
        <Breadcrumb className="breadcrumb-custom">
          <Breadcrumb.Item href="#">Medical Records</Breadcrumb.Item>
          <Breadcrumb.Item href="#">Master</Breadcrumb.Item>
          <Breadcrumb.Item active>Department Management</Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <div className="content-body">
        <Container fluid style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Row>
            <Col md={6}>
              <div
                className="card shadow-sm"
                style={{
                  padding: '2rem',
                  background: 'white',
                  borderRadius: '10px',
                }}
              >
                <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>
                  {editingDepartment ? 'Edit Department' : 'Add New Department'}
                </h3>

                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Department Name *</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={newDepartment.name}
                      onChange={handleInputChange}
                      placeholder="Enter department name"
                      disabled={loading}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>New Charges</Form.Label>
                    <Form.Control
                      type="number"
                      name="newCharges"
                      value={newDepartment.newCharges}
                      onChange={handleInputChange}
                      placeholder="Enter new charges"
                      disabled={loading}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Repeat Charges</Form.Label>
                    <Form.Control
                      type="number"
                      name="repeatCharges"
                      value={newDepartment.repeatCharges}
                      onChange={handleInputChange}
                      placeholder="Enter repeat charges"
                      disabled={loading}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Concession</Form.Label>
                    <Form.Control
                      type="number"
                      name="concession"
                      value={newDepartment.concession}
                      onChange={handleInputChange}
                      placeholder="Enter concession"
                      disabled={loading}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Days</Form.Label>
                    <Form.Control
                      type="number"
                      name="days"
                      value={newDepartment.days}
                      onChange={handleInputChange}
                      placeholder="Enter days"
                      disabled={loading}
                    />
                  </Form.Group>

                  <Button variant="primary" onClick={handleAddDepartment} disabled={loading} style={{ marginRight: '10px' }}>
                    {loading ? 'Saving...' : (editingDepartment ? 'Update Department' : 'Add Department')}
                  </Button>

                  {editingDepartment && (
                    <Button variant="secondary" onClick={handleCancelEdit} disabled={loading}>
                      Cancel
                    </Button>
                  )}
                </Form>
              </div>
            </Col>

            <Col md={6}>
              <div
                className="card shadow-sm"
                style={{
                  padding: '2rem',
                  background: 'white',
                  borderRadius: '10px',
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 style={{ textAlign: 'center', margin: 0 }}>
                    {showBlocked ? 'Blocked Departments' : 'Active Departments'}
                  </h3>
                  <Button
                    variant={showBlocked ? "success" : "secondary"}
                    size="sm"
                    onClick={() => setShowBlocked(!showBlocked)}
                  >
                    {showBlocked ? 'Show Active' : 'Show Blocked'}
                  </Button>
                </div>

                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {loadingDepartments ? (
                    <p>Loading departments...</p>
                  ) : departments.length === 0 ? (
                    <p>{showBlocked ? 'No blocked departments.' : 'No active departments added yet.'}</p>
                  ) : (
                    <Table striped bordered hover>
                      <thead
                        style={{
                          position: 'sticky',
                          top: 0,
                          background: 'white',
                          zIndex: 1,
                        }}
                      >
                        <tr>
                          <th>SL</th>
                          <th>Department</th>
                          <th>New Charges</th>
                          <th>Repeat Charges</th>
                          <th>Concession</th>
                          <th>Days</th>
                          <th>Actions</th>
                        </tr>
                      </thead>

                      <tbody>
                        {departments.map((department, index) => (
                          <tr key={department.id}>
                            <td>{index + 1}</td>
                            <td>{department.name}</td>
                            <td>{department.newCharges || '-'}</td>
                            <td>{department.repeatCharges || '-'}</td>
                            <td>{department.concession || '-'}</td>
                            <td>{department.days || '-'}</td>
                            <td>
                              {showBlocked ? (
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  onClick={() => handleUnblockDepartment(department)}
                                >
                                  Unblock
                                </Button>
                              ) : (
                                <>
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    className="me-2"
                                    onClick={() => handleEditDepartment(department)}
                                    disabled={loading}
                                  >
                                    Edit
                                  </Button>
                                  <Button variant="outline-danger" size="sm" onClick={() => handleBlockDepartment(department)}>
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
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default Department;