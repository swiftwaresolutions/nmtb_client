import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Table, Row, Col, Alert, Card } from 'react-bootstrap';
import Swal from 'sweetalert2';
import MedicalRecordsApiService from '../../../../api/medical-records/medical-records-api-service';
import PageHeader from '../../../../components/PageHeader';
import { faBuilding } from '@fortawesome/free-solid-svg-icons';

interface DepartmentData {
  id: number;
  name: string;
  isActive: number;
  newCharges: number;
  repeatCharges: number;
  concession: number;
  days: number;
}

const Department: React.FC = () => {
  const apiService = new MedicalRecordsApiService();
  const [allDepartments, setAllDepartments] = useState<DepartmentData[]>([]);
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
        setLoadingDepartments(true);
        const response = await apiService.fetchAllDepartments();
        console.log('All departments from API:', response);
        
        // Store all departments
        setAllDepartments(response);
        
        // Filter based on showBlocked state
        const filteredDepartments = response.filter((department: DepartmentData) => {
          const isActive = department.isActive;
          console.log(`Dept: ${department.name}, isActive: ${isActive}, showBlocked: ${showBlocked}`);
          
          if (showBlocked) {
            // Show blocked departments (isActive = 0)
            return isActive === 0;
          } else {
            // Show active departments (isActive = 1)
            return isActive === 1;
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

      // Update allDepartments state
      setAllDepartments(prev => 
        prev.map(d => d.id === department.id ? { ...d, isActive: 0 } : d)
      );

      // Remove from current departments list (since we're showing active and this is now blocked)
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

      // Update allDepartments state
      setAllDepartments(prev => 
        prev.map(d => d.id === department.id ? { ...d, isActive: 1 } : d)
      );

      // Remove from current departments list (since we're showing blocked and this is now active)
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

        // Also update allDepartments
        setAllDepartments(prev => 
          prev.map(d => d.id === editingDepartment.id ? {
            ...d,
            name: response.name || payload.name,
            newCharges: payload.newCharges,
            repeatCharges: payload.repeatCharges,
            concession: payload.concession,
            days: payload.days,
            isActive: 1
          } : d)
        );

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

        // Add to both arrays
        setDepartments([newDepartmentWithId, ...departments]);
        setAllDepartments(prev => [newDepartmentWithId, ...prev]);
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
      <PageHeader
        icon={faBuilding}
        title={editingDepartment ? 'Edit Department' : 'Department Management'}
        subtitle="Manage hospital departments and their configurations"
        badges={[
          { label: 'Active', value: allDepartments.filter(d => d.isActive === 1).length },
          { label: 'Blocked', value: allDepartments.filter(d => d.isActive === 0).length },
          { label: 'Total', value: allDepartments.length },
        ]}
      />

      <div className="content-body">
        <Container fluid style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Row>
            <Col md={7} style={{ maxHeight: "80vh", overflowY: "auto" }}>
              <Card
                className="shadow-sm"
                style={{
                  padding: "2rem",
                  background: "white",
                  borderRadius: "10px",
                  maxHeight: "78vh",
                  overflowY: "auto",
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

                  <div className="d-flex justify-content-end mt-4">
                    <Button
                      variant="primary"
                      onClick={handleAddDepartment}
                      disabled={loading}
                      style={{ minWidth: "150px", fontWeight: "var(--font-weight-semibold)" }}
                    >
                      {loading ? (
                        <>
                          <i className="fas fa-spinner fa-spin me-2"></i>
                          Saving...
                        </>
                      ) : editingDepartment ? (
                        <>
                          Update
                        </>
                      ) : (
                        <>
                          Add
                        </>
                      )}
                    </Button>
                    {editingDepartment && (
                      <Button
                        variant="outline-secondary"
                        onClick={handleCancelEdit}
                        disabled={loading}
                        className="ms-2"
                        style={{ minWidth: "100px" }}
                      >
                        <i className="fas fa-times me-2"></i>
                        Cancel
                      </Button>
                    )}
                  </div>
                </Form>
              </Card>
            </Col>

            <Col md={5} style={{ maxHeight: "80vh", overflowY: "auto" }}>
              <Card
                className="shadow-sm"
                style={{
                  background: "white",
                  borderRadius: "12px",
                  border: "1px solid #e0e0e0",
                  maxHeight: "calc(78vh - 120px)",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    padding: "1.25rem 1.5rem",
                    borderBottom: "2px solid #f0f0f0",
                    background: "linear-gradient(to right, #f8f9fa, #ffffff)",
                    borderTopLeftRadius: "12px",
                    borderTopRightRadius: "12px",
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <i className="fas fa-building" style={{ fontSize: "var(--font-size-2xl)", color: "#28a745" }}></i>
                      <h5 className="mb-0" style={{ fontWeight: "var(--font-weight-semibold)" }}>
                        {showBlocked ? 'Blocked Departments' : 'Active Departments'}
                      </h5>
                      <span
                        className="badge"
                        style={{
                          background: "#28a745",
                          fontSize: "var(--font-size-xs)",
                          padding: "4px 8px",
                        }}
                      >
                        {departments.length}
                      </span>
                    </div>
                    <Button
                      variant={showBlocked ? "outline-success" : "outline-danger"}
                      size="sm"
                      onClick={() => setShowBlocked(!showBlocked)}
                      style={{
                        borderRadius: "20px",
                        padding: "6px 16px",
                        fontWeight: "var(--font-weight-medium)",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <i className="fas fa-eye"></i>
                      {showBlocked ? "Show Active" : "Show Blocked"}
                    </Button>
                  </div>
                </div>

                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>S No</th>
                        <th>Department</th>
                        <th>Charges</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingDepartments ? (
                        <tr>
                          <td colSpan={4} style={{ textAlign: "center" }}>
                            <i className="fas fa-spinner fa-spin me-2"></i>
                            Loading departments...
                          </td>
                        </tr>
                      ) : departments.length === 0 ? (
                        <tr>
                          <td colSpan={4} style={{ textAlign: "center" }}>
                            {showBlocked ? 'No blocked departments.' : 'No active departments added yet.'}
                          </td>
                        </tr>
                      ) : (
                        departments.map((department, index) => (
                          <tr
                            key={department.id}
                            style={{
                              backgroundColor:
                                editingDepartment?.id === department.id ? "#fff3cd" : "transparent",
                              fontWeight: editingDepartment?.id === department.id ? "var(--font-weight-semibold)" : "normal",
                              borderLeft:
                                editingDepartment?.id === department.id
                                  ? "4px solid #ffc107"
                                  : "none",
                            }}
                          >
                            <td>{index + 1}</td>
                            <td>
                              {department.name}
                              {editingDepartment?.id === department.id && (
                                <span className="ms-2 badge bg-warning text-dark">
                                  <i className="fas fa-edit me-1"></i>
                                  Editing
                                </span>
                              )}
                            </td>
                            <td>
                              New: {department.newCharges || '-'} | 
                              Repeat: {department.repeatCharges || '-'}
                            </td>
                            <td>
                              {showBlocked ? (
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  onClick={() => handleUnblockDepartment(department)}
                                >
                                  Unblock
                                </Button>
                              ) : editingDepartment?.id !== department.id ? (
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
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => handleBlockDepartment(department)}
                                  >
                                    Block
                                  </Button>
                                </>
                              ) : (
                                <span className="text-muted fst-italic">
                                  Currently editing...
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </div>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default Department;