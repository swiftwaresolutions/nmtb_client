import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Table, Row, Col, Alert } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { CashCounterApiService } from '../../../api/cash-counter/cash-counter-api-service';
import { useSelector } from 'react-redux';
import { RootState } from '../../../state/store';
import PageHeader from '../../../components/PageHeader';
import { faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import '../../../style/commonStyle.css';

interface InvestigationGroup {
  id: number;
  name: string;
  incomeHead: number;
  orgId: number;
  grp?: number;
  isGroup?: number;
  rate?: number;
  charity?: number;
  pvtRate?: number;
  pvtCharity?: number;
  isEditable?: number;
  isBlocked: boolean | number;
  isSurgery?: boolean;
  isOpd?: number;
  useInClinical?: number;
  createDateTime?: string;
}

const Groups = () => {
  const cashCounterApi = new CashCounterApiService();
  const loginData = useSelector((state: RootState) => state.loginData);
  
  const [groups, setGroups] = useState<InvestigationGroup[]>([]);
  const [newGroup, setNewGroup] = useState({
    groupName: '',
    incomeHead: 1,
    orgId: 1, // Changed from 0 to 1
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showBlocked, setShowBlocked] = useState(false);
  const [loading, setLoading] = useState(false);

  const incomeHeadOptions = [
    { value: 1, label: 'Drug Sales' },
    { value: 2, label: 'Investigation Collection' },
    { value: 3, label: 'Procedure Collection' },
    { value: 4, label: 'Other Income' }
  ];

  // Fetch all investigation groups from API
  const fetchInvestigationGroups = async () => {
    setLoading(true);
    try {
      const res = await cashCounterApi.fetchAllInvestigationGroups();
      setGroups(Array.isArray(res) ? res : []);
    } catch (err) {
      setError('Failed to fetch investigation groups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestigationGroups();
    // eslint-disable-next-line
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewGroup({
      ...newGroup,
      [name]: name === 'incomeHead' || name === 'orgId' ? Number(value) : value
    });
  };

  const handleSubmit = async () => {
    if (!newGroup.groupName.trim()) {
      setError('Please fill in Group Name');
      return;
    }

    setError('');
    setSuccess('');
    
    try {
      if (editingId) {
        await cashCounterApi.updateInvestigationGroup(editingId, {
          name: newGroup.groupName,
          incomeHead: newGroup.incomeHead,
          orgId: newGroup.orgId,
          isBlocked: false,
        });
        setSuccess('Investigation group updated successfully');
      } else {
        await cashCounterApi.saveInvestigationGroup({
          name: newGroup.groupName,
          incomeHead: newGroup.incomeHead,
          orgId: newGroup.orgId,
        });
        setSuccess('Investigation group added successfully');
      }
      
      setNewGroup({ groupName: '', incomeHead: 1, orgId: 1 }); // Changed from 0 to 1
      setEditingId(null);
      fetchInvestigationGroups();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save investigation group');
    }
  };

  const handleEdit = (group: InvestigationGroup) => {
    setNewGroup({
      groupName: group.name,
      incomeHead: group.incomeHead,
      orgId: group.orgId
    });
    setEditingId(group.id);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setNewGroup({ groupName: '', incomeHead: 1, orgId: 1 }); // Changed from 0 to 1
    setEditingId(null);
    setError('');
    setSuccess('');
  };

  const handleBlock = (id: number) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to block this investigation group?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, block it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const group = groups.find((g) => g.id === id);
          if (!group) return;
          
          await cashCounterApi.updateInvestigationGroup(id, {
            name: group.name,
            incomeHead: group.incomeHead,
            orgId: group.orgId,
            isBlocked: true, // API will convert to 1
          });
          
          fetchInvestigationGroups();
          Swal.fire('Blocked!', 'Investigation group has been blocked.', 'success');
        } catch (err) {
          setError('Failed to block investigation group');
        }
      }
    });
  };

  const handleUnblock = (id: number) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to unblock this investigation group?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, unblock it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const group = groups.find((g) => g.id === id);
          if (!group) return;
          
          await cashCounterApi.updateInvestigationGroup(id, {
            name: group.name,
            incomeHead: group.incomeHead,
            orgId: group.orgId,
            isBlocked: false, // API will convert to 0
          });
          
          fetchInvestigationGroups();
          Swal.fire('Unblocked!', 'Investigation group has been unblocked.', 'success');
        } catch (err) {
          setError('Failed to unblock investigation group');
        }
      }
    });
  };

  const filteredGroups = groups.filter((g) => {
    const isGroupBlocked = g.isBlocked === true || g.isBlocked === 1;
    return showBlocked ? isGroupBlocked : !isGroupBlocked;
  });

  const getIncomeHeadLabel = (value: number) => {
    return incomeHeadOptions.find(opt => opt.value === value)?.label || 'Unknown';
  };

  return (
    <div>
      {/* ---------------- HEADER ---------------- */}
      <PageHeader 
        icon={faLayerGroup}
        title={editingId ? 'Edit Investigation Group' : 'Add Investigation Group'}
        subtitle={editingId ? 'Modify existing investigation group details' : 'Create a new investigation group for billing'}
      />

      {/* ---------------- BODY ---------------- */}
      <div className="content-body">
        <Container fluid style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Row>
            {/* -------- Left Side Form -------- */}
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
                  {editingId ? 'Edit Investigation Group' : 'Add New Investigation Group'}
                </h3>

                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Group Name <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="groupName"
                      value={newGroup.groupName}
                      onChange={handleInputChange}
                      placeholder="Enter group name"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>
                      Income Head <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Select
                      name="incomeHead"
                      value={newGroup.incomeHead}
                      onChange={handleInputChange}
                    >
                      {incomeHeadOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  

                  <Button
                    variant="primary"
                    onClick={handleSubmit}
                    style={{ marginRight: '10px' }}
                    disabled={loading}
                  >
                    {editingId ? 'Update Group' : 'Add Group'}
                  </Button>

                  {editingId && (
                    <Button variant="secondary" onClick={handleCancel}>
                      Cancel
                    </Button>
                  )}
                </Form>
              </div>
            </Col>

            {/* -------- Right Side Table -------- */}
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
                    {showBlocked ? 'Blocked List' : 'Investigation Groups List'}
                  </h3>
                  <div>
                    <Button
                      variant={!showBlocked ? 'primary' : 'outline-primary'}
                      size="sm"
                      className="me-2"
                      onClick={() => setShowBlocked(false)}
                    >
                      Active
                    </Button>
                    <Button
                      variant={showBlocked ? 'danger' : 'outline-danger'}
                      size="sm"
                      onClick={() => setShowBlocked(true)}
                    >
                      Blocked
                    </Button>
                  </div>
                </div>

                <div className="mb-2 text-end">
                  <span className="badge bg-secondary">
                    {filteredGroups.length} Records
                  </span>
                </div>

                {/* Scrollable container */}
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
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
                        <th>#</th>
                        <th>Group Name</th>
                        <th>Income Head</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredGroups.map((group, index) => (
                        <tr key={group.id}>
                          <td>{index + 1}</td>
                          <td>{group.name}</td>
                          <td>{getIncomeHeadLabel(group.incomeHead)}</td>
                          <td>
                            {!showBlocked ? (
                              <>
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  className="me-2"
                                  onClick={() => handleEdit(group)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleBlock(group.id)}
                                >
                                  Block
                                </Button>
                              </>
                            ) : (
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => handleUnblock(group.id)}
                              >
                                Unblock
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {filteredGroups.length === 0 && (
                        <tr>
                          <td
                            colSpan={4}
                            className="text-center py-4 text-muted"
                          >
                            No {showBlocked ? 'blocked' : 'active'} investigation groups found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default Groups;