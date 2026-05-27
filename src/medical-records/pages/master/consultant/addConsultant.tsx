import React, { useState, useEffect } from 'react';
import { Container, Breadcrumb, Form, Button, Table, Row, Col, Alert } from 'react-bootstrap';
import Swal from 'sweetalert2';
import MedicalRecordsApiService from '../../../../api/medical-records/medical-records-api-service';

interface Consultant {
  id: number;
  name: string;
  deptId?: number;
  deptName?: string;
  details?: string;
  isCons?: number;
  consultantRoom?: string;
  consultantHIN?: string;
  isSenior?:number;
  days?:number;
  concession?:number;
  newCharges?: number;
  repeatCharges?: number;
  renewalDays?: number;
  isActive?: number;
}

interface Department {
  id: number;
  name: string;
}

const AddConsultant: React.FC = () => {
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [blockedConsultants, setBlockedConsultants] = useState<Consultant[]>([]);
  const [loadingConsultants, setLoadingConsultants] = useState(true);

  const [departments, setDepartments] = useState<Department[]>([]);

  const emptyConsultantForm = {
    name: '',
    uid: 0,
    details: '',
    deptId: 0,
    isCons: 0,
    consultantRoom: '',
    consultantHIN: '',
    isSenior: 0,
    days: '',
    concession: '',
    newCharges: '',
    repeatCharges: '',
    renewalDays: ''
  };

  const [newConsultant, setNewConsultant] = useState<any>(emptyConsultantForm);

  const [editingConsultant, setEditingConsultant] = useState<Consultant | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [showBlocked, setShowBlocked] = useState(false);

  const apiService = new MedicalRecordsApiService();

  const numericFields = ['uid', 'deptId', 'days', 'concession', 'newCharges', 'repeatCharges', 'renewalDays', 'isCons'];

  const normalizeConsultant = (cons: any, deptList: Department[]): Consultant => ({
    id: Number(cons.id),
    name: cons.name || '',
    deptId: Number(cons.deptId) || 0,
    deptName: cons.deptName || deptList.find(d => d.id === Number(cons.deptId))?.name || '',
    details: cons.details || '',
    isCons: Number(cons.isCons) || 0,
    consultantRoom: cons.consultantRoom || '',
    consultantHIN: cons.consultantHIN || '',
    isSenior: Number(cons.isSenior) || 0,
    days: cons.days !== undefined && cons.days !== null ? Number(cons.days) : 0,
    concession: cons.concession !== undefined && cons.concession !== null ? Number(cons.concession) : 0,
    newCharges: cons.newCharges !== undefined && cons.newCharges !== null ? Number(cons.newCharges) : 0,
    repeatCharges: cons.repeatCharges !== undefined && cons.repeatCharges !== null ? Number(cons.repeatCharges) : 0,
    renewalDays: cons.renewalDays !== undefined && cons.renewalDays !== null ? Number(cons.renewalDays) : 0,
    isActive: cons.isActive ?? 1
  });

  const refreshConsultants = async (deptList: Department[] = departments) => {
    setLoadingConsultants(true);
    try {
      const consultantData = await apiService.fetchAllConsultants();
      const list = Array.isArray(consultantData) ? consultantData : [];
      const normalized = list.map(cons => normalizeConsultant(cons, deptList));
      const active = normalized.filter(c => c.isActive !== 0);
      const blocked = normalized.filter(c => c.isActive === 0);
      setConsultants(active);
      setBlockedConsultants(blocked);
    } catch (err) {
      console.error('Error loading consultants:', err);
      setError('Failed to load consultants. Please refresh the page.');
    } finally {
      setLoadingConsultants(false);
    }
  };

  // Load data from API on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch departments
        const deptData = await apiService.fetchAllDepartments();
        setDepartments(deptData);

        await refreshConsultants(deptData);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data. Please refresh the page.');
        setLoadingConsultants(false);
      }
    };

    loadData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    let val: any = value;
    if (type === 'checkbox') {
      val = (e.target as HTMLInputElement).checked ? 1 : 0;
    } else if (numericFields.includes(name)) {
      val = value === '' ? '' : Number(value);
    }
    setNewConsultant({ ...newConsultant, [name]: val });
  };

  const handleEditConsultant = (consultant: Consultant) => {
    setEditingConsultant(consultant);
    setNewConsultant({
      name: consultant.name || '',
      uid: (consultant as any).uid || 0,
      details: consultant.details || '',
      deptId: consultant.deptId || 0,
      isCons: consultant.isCons || 0,
      consultantRoom: consultant.consultantRoom || '',
      consultantHIN: consultant.consultantHIN || '',
      isSenior: consultant.isSenior || 0,
      days: consultant.days ?? '',
      concession: consultant.concession ?? '',
      newCharges: consultant.newCharges ?? '',
      repeatCharges: consultant.repeatCharges ?? '',
      renewalDays: consultant.renewalDays ?? ''
    });
    setError('');
    setSuccess('');
  };

  const handleCancelEdit = () => {
    setEditingConsultant(null);
    setNewConsultant(emptyConsultantForm);
    setError('');
    setSuccess('');
  };

  const handleBlockConsultant = async (consultant: Consultant) => {
    const result = await Swal.fire({
      title: 'Block Consultant',
      text: `Do you want to block "${consultant.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, Block it!',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    try {
      // Call API to block consultant
      await apiService.toggleConsultantStatus(consultant.id, 0);
      
      // Move consultant to blocked list
      await refreshConsultants();

      Swal.fire({ 
        title: 'Blocked!', 
        text: 'Consultant has been blocked successfully.', 
        icon: 'success', 
        showConfirmButton: true,
        confirmButtonText: 'OK'
      });
    } catch (err: any) {
      console.error('Error blocking consultant:', err);
      Swal.fire({ 
        title: 'Error!', 
        text: err?.response?.data?.message || 'Failed to block consultant. Please try again.', 
        icon: 'error', 
        confirmButtonText: 'OK' 
      });
    }
  };

  const handleUnblockConsultant = async (consultant: Consultant) => {
    const result = await Swal.fire({
      title: 'Unblock Consultant',
      text: `Do you want to unblock "${consultant.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, Unblock it!',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    try {
      // Call API to unblock consultant
      await apiService.toggleConsultantStatus(consultant.id, 1);
      
      // Move consultant back to active list
      await refreshConsultants();

      Swal.fire({ 
        title: 'Unblocked!', 
        text: 'Consultant has been unblocked successfully.', 
        icon: 'success', 
        showConfirmButton: true,
        confirmButtonText: 'OK'
      });
    } catch (err: any) {
      console.error('Error unblocking consultant:', err);
      Swal.fire({ 
        title: 'Error!', 
        text: err?.response?.data?.message || 'Failed to unblock consultant. Please try again.', 
        icon: 'error', 
        confirmButtonText: 'OK' 
      });
    }
  };

  const handleAddConsultant = async () => {
    if (!newConsultant.name.trim()) { 
      setError('Please enter consultant name.'); 
      return; 
    }

    const currentList = showBlocked ? blockedConsultants : consultants;
    const existing = currentList.find(c => 
      c.name.toLowerCase() === newConsultant.name.trim().toLowerCase() && 
      (!editingConsultant || c.id !== editingConsultant.id)
    );
    
    if (existing) { 
      setError('A consultant with this name already exists.'); 
      return; 
    }

    setLoading(true); 
    setError(''); 
    setSuccess('');

    const toNumber = (value: any) => {
      if (value === '' || value === null || value === undefined) return 0;
      const parsed = Number(value);
      return Number.isNaN(parsed) ? 0 : parsed;
    };
    
    try {
      const payload = {
        name: newConsultant.name.trim(),
        deptId: toNumber(newConsultant.deptId),
        isActive: editingConsultant ? editingConsultant.isActive || 1 : 1,
        isCons: toNumber(newConsultant.isCons),
        uid: toNumber(newConsultant.uid),
        consultantHIN: newConsultant.consultantHIN || '',
        consultantRoom: newConsultant.consultantRoom || '',
        details: newConsultant.details || '',
        isSenior: newConsultant.isSenior || 0,
        newCharges: toNumber(newConsultant.newCharges),
        repeatCharges: toNumber(newConsultant.repeatCharges),
        renewalDays: toNumber(newConsultant.renewalDays),
        concession: toNumber(newConsultant.concession),
        days: toNumber(newConsultant.days)
      };

      let response;
      
      if (editingConsultant) {
        // Update existing consultant
        response = await apiService.updateConsultant(editingConsultant.id, payload);

        await refreshConsultants();
        setSuccess('Consultant updated successfully!');
      } else {
        // Add new consultant
        response = await apiService.saveConsultant(payload);

        await refreshConsultants();
        setSuccess('Consultant added successfully!');
      }

      setNewConsultant(emptyConsultantForm);
      setEditingConsultant(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error saving consultant:', err);
      setError(err?.response?.data?.message || `Failed to ${editingConsultant ? 'update' : 'add'} consultant. Please try again.`);
    } finally { 
      setLoading(false); 
    }
  };

      return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
          <div className="content-header">
            <Breadcrumb className="breadcrumb-custom">
              <Breadcrumb.Item href="#">Medical Records</Breadcrumb.Item>
              <Breadcrumb.Item href="#">Master</Breadcrumb.Item>
              <Breadcrumb.Item active>Add Consultant</Breadcrumb.Item>
            </Breadcrumb>
          </div>

          <div className="content-body" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
            <Container fluid style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <Row>
                <Col md={6}>
                  <div className="card shadow-sm" style={{ padding: '2rem', background: 'white', borderRadius: '10px' }}>
                    <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>{editingConsultant ? 'Edit Consultant' : 'Add New Consultant'}</h3>

                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}

                    <Form>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Consultant Name</Form.Label>
                            <Form.Control type="text" name="name" value={newConsultant.name} onChange={handleInputChange} placeholder="Enter consultant name" disabled={loading} />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Department</Form.Label>
                      <Form.Select name="deptId" value={newConsultant.deptId} onChange={handleInputChange} disabled={loading}>
                        <option value={0}>-- Select Department --</option>
                        {departments.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </Form.Select>
                          </Form.Group>
                        </Col>
                      </Row>

                      <Form.Group className="mb-3">
                        <Form.Label>Details</Form.Label>
                        <Form.Control as="textarea" rows={3} name="details" value={newConsultant.details} onChange={handleInputChange} placeholder="Details" disabled={loading} />
                      </Form.Group>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Consultant Room</Form.Label>
                            <Form.Control type="text" name="consultantRoom" value={newConsultant.consultantRoom} onChange={handleInputChange} placeholder="Room" disabled={loading} />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Consultant Reg No</Form.Label>
                            <Form.Control type="text" name="consultantHIN" value={newConsultant.consultantHIN} onChange={handleInputChange} placeholder="HIN" disabled={loading} />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Days</Form.Label>
                            <Form.Control type="number" name="days" value={newConsultant.days} onChange={handleInputChange} placeholder="Date" disabled={loading} />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Concession</Form.Label>
                            <Form.Control type="number" name="concession" value={newConsultant.concession} onChange={handleInputChange} placeholder="Amount" disabled={loading} />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label>New Charges</Form.Label>
                            <Form.Control type="number" name="newCharges" value={newConsultant.newCharges} onChange={handleInputChange} placeholder="New Charges" disabled={loading} />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label>Repeat Charges</Form.Label>
                            <Form.Control type="number" name="repeatCharges" value={newConsultant.repeatCharges} onChange={handleInputChange} placeholder="Repeat Charges" disabled={loading} />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label>Renewal Days</Form.Label>
                            <Form.Control type="number" name="renewalDays" value={newConsultant.renewalDays} onChange={handleInputChange} placeholder="Renewal Days" disabled={loading} />
                          </Form.Group>
                        </Col>
                      </Row>
                      
                      <Form.Group className="mb-3 form-check">
                        <Form.Check type="checkbox" id="isSenior" label="Is Senior " name="isSenior" checked={newConsultant.isSenior === 1} onChange={handleInputChange as any} />
                      </Form.Group>

                      <Button variant="primary" onClick={handleAddConsultant} disabled={loading} style={{ marginRight: '10px' }}>
                        {loading ? 'Saving...' : (editingConsultant ? 'Update Consultant' : 'Add Consultant')}
                      </Button>

                      {editingConsultant && (
                        <Button variant="secondary" onClick={handleCancelEdit} disabled={loading}>
                          Cancel
                        </Button>
                      )}
                    </Form>
                  </div>
                </Col>

                <Col md={6}>
                  <div className="card shadow-sm" style={{ padding: '2rem', background: 'white', borderRadius: '10px' }}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h3 style={{ textAlign: 'center', margin: 0 }}>
                        {showBlocked ? 'Blocked Consultants' : 'Active Consultants'}
                      </h3>
                      <Button 
                        variant={showBlocked ? 'success' : 'secondary'} 
                        size="sm" 
                        onClick={() => setShowBlocked(!showBlocked)}
                      >
                        {showBlocked ? 'Show Active' : 'Show Blocked'}
                      </Button>
                    </div>

                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      {loadingConsultants ? (
                        <p>Loading consultants...</p>
                      ) : (showBlocked ? blockedConsultants : consultants).length === 0 ? (
                        <p>{showBlocked ? 'No blocked consultants.' : 'No active consultants added yet.'}</p>
                      ) : (
                        <Table striped bordered hover>
                          <thead style={{ position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
                            <tr>
                              <th>S.L</th>
                              <th>Name</th>
                              <th>Dept</th>
                              <th>Room</th>
                              <th>Reg No</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(showBlocked ? blockedConsultants : consultants).map(cons => (
                              <tr key={cons.id}>
                                <td>{cons.id}</td>
                                <td>{cons.name}</td>
                                <td>{cons.deptName}</td>
                                <td>{cons.consultantRoom}</td>
                                <td>{cons.consultantHIN}</td>
                                <td>
                                  {showBlocked ? (
                                    <Button 
                                      variant="outline-success" 
                                      size="sm" 
                                     
                                      onClick={() => handleUnblockConsultant(cons)}
                                    >
                                      Unblock
                                    </Button>
                                  ) : (
                                    <>
                                      <Button 
                                        variant="outline-primary" 
                                        size="sm" 
                                     
                                        onClick={() => handleEditConsultant(cons)} 
                                        disabled={loading}
                                      >
                                        Edit
                                      </Button>
                                      <Button 
                                        variant="outline-danger" 
                                        size="sm" 
                                        onClick={() => handleBlockConsultant(cons)}
                                      >
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

export default AddConsultant;


