import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Form, Button, Table, Card } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import {
  showSuccessToast,
  showErrorToast,
  showValidationError,
  showConfirmDialog,
} from '../../../../utils/alertUtil';
import { handleError } from '../../../../utils/errorUtil';
import { useTableSearch } from '../../../../hooks/useTableSearch';
import SearchInput from '../../../../components/SearchInput';
import PageHeader from '../../../../components/PageHeader';
import { ArrowRepeat, ListCheck, ShieldX } from 'react-bootstrap-icons';
import { faHospital } from '@fortawesome/free-solid-svg-icons';
import { SystemAdminApiService } from '../../../../api/system-admin/system-admin-api-service';
import {
  handleNumberBlur,
  handleNumberChange,
  formatNumberDisplay,
} from '../../../../utils/numberInputUtil';

interface Ward {
  id: number;
  name?: string;
  wardName: string;
  avgCost?: number;
  code: string;
  ageFrom: number;
  ageTo: number;
  genderTypeValue: string;
  isBlocked?: number;
  blocked: number;
}

const mapGenderTypeToFormValue = (genderType: string | number | undefined) => {
  if (genderType === 'M' || genderType === 1) return 'M';
  if (genderType === 'F' || genderType === 2) return 'F';
  return 'C';
};

const CreateWard = () => {
  const dispatch = useDispatch();
  const apiService = new SystemAdminApiService();
  
  // Refs for validation focus
  const wardNameRef = useRef<HTMLInputElement>(null);
  const avgCostRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);
  const ageFromRef = useRef<HTMLInputElement>(null);
  const ageToRef = useRef<HTMLInputElement>(null);
  const genderTypeRef = useRef<HTMLSelectElement>(null);

  const [form, setForm] = useState({
    wardName: '',
    code: '',
    avgCost: 0,
    ageFrom: 0,
    ageTo: 100,
    genderType: 'C',
  });

  const [wards, setWards] = useState<Ward[]>([]);
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showBlocked, setShowBlocked] = useState(false);

  const fetchWards = async () => {
    try {
      setLoading(true);
      const response = await apiService.fetchAllWards();
      const normalizedWards = (response || []).map((ward: any) => ({
        id: ward.id,
        name: ward.name,
        wardName: ward.name || '',
        avgCost: ward.avgCost,
        code: ward.code || '',
        ageFrom: ward.ageFrom || 0,
        ageTo: ward.ageTo || 0,
        genderTypeValue: mapGenderTypeToFormValue(ward.genderType),
        isBlocked: ward.isBlocked,
        blocked: ward.isBlocked === 1 ? 1 : 0,
      }));
      setWards(normalizedWards);
    } catch (error) {
      console.error('Error fetching wards:', error);
      handleError(dispatch, error);
      showErrorToast('Failed to load wards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWards();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const validateForm = (): boolean => {
    if (!form.wardName.trim()) {
      showValidationError('Ward name is required.');
      wardNameRef.current?.focus();
      return false;
    }
    if (!form.code.trim()) {
      showValidationError('Code is required.');
      codeRef.current?.focus();
      return false;
    }
    if (form.ageFrom < 0) {
      showValidationError('Age from must be 0 or greater.');
      ageFromRef.current?.focus();
      return false;
    }
    if (form.ageTo <= form.ageFrom) {
      showValidationError('Age to must be greater than age from.');
      ageToRef.current?.focus();
      return false;
    }
    if (!form.genderType) {
      showValidationError('Gender type is required.');
      genderTypeRef.current?.focus();
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        name: form.wardName.trim(),
        code: form.code.trim(),
        avgCost: form.avgCost,
        ageFrom: form.ageFrom,
        ageTo: form.ageTo,
        genderType: form.genderType,
      };

      if (editingId !== null) {
        await apiService.updateWard(editingId, payload);
        showSuccessToast('Ward updated successfully!');
      } else {
        await apiService.saveWard(payload);
        showSuccessToast('Ward added successfully!');
      }

      resetForm();
      await fetchWards();
    } catch (error: any) {
      console.error('Error saving ward:', error);
      handleError(dispatch, error);
      showErrorToast(error?.response?.data?.error || 'Failed to save ward. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      wardName: '',
      code: '',
      avgCost: 0,
      ageFrom: 0,
      ageTo: 100,
      genderType: 'C',
    });
    setEditingId(null);
  };

  const handleEdit = (id: number) => {
    const ward = wards.find((w) => w.id === id);
    if (!ward) return;

    setForm({
      wardName: ward.wardName,
      code: ward.code,
      avgCost: ward.avgCost || 0,
      ageFrom: ward.ageFrom,
      ageTo: ward.ageTo,
      genderType: ward.genderTypeValue,
    });
    setEditingId(id);
  };

  const handleBlock = async (id: number) => {
    const result = await showConfirmDialog(
      'Block this ward?',
      'Confirm',
      'Block',
      'Cancel'
    );
    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      await apiService.blockWard(id);
      showSuccessToast('Ward blocked successfully');
      await fetchWards();
    } catch (error: any) {
      console.error('Error blocking ward:', error);
      showErrorToast(error?.response?.data?.message || 'Failed to block ward');
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (id: number) => {
    const result = await showConfirmDialog(
      'Unblock this ward?',
      'Confirm',
      'Unblock',
      'Cancel'
    );
    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      await apiService.unblockWard(id);
      showSuccessToast('Ward unblocked successfully');
      await fetchWards();
    } catch (error: any) {
      console.error('Error unblocking ward:', error);
      showErrorToast(error?.response?.data?.message || 'Failed to unblock ward');
    } finally {
      setLoading(false);
    }
  };

  const activeWards = wards.filter((w) => w.blocked === 0);
  const blockedWards = wards.filter((w) => w.blocked === 1);

  const {
    filteredData: filteredActiveWards,
    searchTerm: activeSearchTerm,
    setSearchTerm: setActiveSearchTerm,
    resultCount: activeResultCount,
    totalCount: activeTotalCount,
  } = useTableSearch({
    data: activeWards,
    searchFields: ['wardName', 'code'],
  });

  const {
    filteredData: filteredBlockedWards,
    searchTerm: blockedSearchTerm,
    setSearchTerm: setBlockedSearchTerm,
    resultCount: blockedResultCount,
    totalCount: blockedTotalCount,
  } = useTableSearch({
    data: blockedWards,
    searchFields: ['wardName', 'code'],
  });

  return (
    <div>
      <PageHeader
        icon={faHospital}
        title={editingId ? 'Edit Ward Master' : 'Ward Master'}
        subtitle="Manage hospital ward information and settings"
        badges={[
          { label: 'Active Wards', value: activeWards.length },
          { label: 'Blocked', value: blockedWards.length },
        ]}
      />
      <div className="content-body">
        <Container fluid>
          <Row>
            {/* Left: Form */}
            <Col md={7} style={{ maxHeight: '80vh', overflowY: 'auto' }}>
              <Card
                className="shadow-sm"
                style={{
                  padding: '2rem',
                  background: 'white',
                  borderRadius: '10px',
                  maxHeight: '78vh',
                  overflowY: 'auto',
                }}
              >
                <Form>
                  <h5 className="mb-4" style={{ fontWeight: 'var(--font-weight-semibold)', color: '#333' }}>
                    <ListCheck style={{ marginRight: '8px' }} />
                    Ward Information
                  </h5>
                  
                  {/* Ward Name */}
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: 'var(--font-weight-medium)' }}>
                      Ward Name <span style={{ color: 'red' }}>*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="wardName"
                      value={form.wardName}
                      onChange={handleInputChange}
                      ref={wardNameRef}
                      placeholder="Enter ward name"
                      required
                    />
                  </Form.Group>

                  {/* Code */}
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: 'var(--font-weight-medium)' }}>
                      Code <span style={{ color: 'red' }}>*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="code"
                      value={form.code}
                      onChange={handleInputChange}
                      ref={codeRef}
                      placeholder="Enter ward code"
                      required
                    />
                  </Form.Group>

                  {/* Average Cost */}
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: 'var(--font-weight-medium)' }}>
                      Average Cost (Rs.)
                    </Form.Label>
                    <Form.Control
                      type="number"
                      name="avgCost"
                      value={formatNumberDisplay(form.avgCost)}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          avgCost: handleNumberChange(e.target.value),
                        }))
                      }
                      onBlur={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          avgCost: handleNumberBlur(e.target.value),
                        }))
                      }
                      ref={avgCostRef}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </Form.Group>

                  {/* Age Range */}
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ fontWeight: 'var(--font-weight-medium)' }}>
                          Age From <span style={{ color: 'red' }}>*</span>
                        </Form.Label>
                        <Form.Control
                          type="number"
                          name="ageFrom"
                          value={formatNumberDisplay(form.ageFrom)}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              ageFrom: handleNumberChange(e.target.value),
                            }))
                          }
                          onBlur={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              ageFrom: handleNumberBlur(e.target.value),
                            }))
                          }
                          ref={ageFromRef}
                          placeholder="0"
                          min="0"
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ fontWeight: 'var(--font-weight-medium)' }}>
                          Age To <span style={{ color: 'red' }}>*</span>
                        </Form.Label>
                        <Form.Control
                          type="number"
                          name="ageTo"
                          value={formatNumberDisplay(form.ageTo)}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              ageTo: handleNumberChange(e.target.value),
                            }))
                          }
                          onBlur={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              ageTo: handleNumberBlur(e.target.value),
                            }))
                          }
                          ref={ageToRef}
                          placeholder="0"
                          min="0"
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Gender Type */}
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: 'var(--font-weight-medium)' }}>
                      Gender Type <span style={{ color: 'red' }}>*</span>
                    </Form.Label>
                    <Form.Control
                      as="select"
                      name="genderType"
                      value={form.genderType}
                      onChange={handleInputChange}
                      ref={genderTypeRef}
                    >
                      <option value="C">Common</option>
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                    </Form.Control>
                  </Form.Group>

                  {/* Action Buttons */}
                  <div 
                    className="d-flex justify-content-between mt-4" 
                    style={{ 
                      paddingTop: '1.5rem', 
                      borderTop: '2px solid #e0e0e0' 
                    }}
                  >
                    <Button
                      variant="primary"
                      onClick={handleSubmit}
                      disabled={loading}
                      style={{ minWidth: '140px', fontWeight: 'var(--font-weight-medium)' }}
                    >
                      {loading ? 'Saving...' : editingId ? 'Update Ward' : 'Add Ward'}
                    </Button>
                    {editingId && (
                      <Button 
                        variant="secondary" 
                        onClick={resetForm}
                        style={{ minWidth: '100px', fontWeight: 'var(--font-weight-medium)' }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </Form>
              </Card>
            </Col>

            {/* Right: List */}
            <Col md={5} style={{ maxHeight: '80vh', overflowY: 'auto' }}>
              <Card
                className="shadow-sm"
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  border: '1px solid #e0e0e0',
                  maxHeight: '78vh',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Header */}
                <div
                  style={{
                    padding: '1.25rem 1.5rem',
                    borderBottom: '2px solid #f0f0f0',
                    background: 'linear-gradient(to right, #f8f9fa, #ffffff)',
                    borderTopLeftRadius: '12px',
                    borderTopRightRadius: '12px',
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex align-items-center gap-2">
                      {showBlocked ? (
                        <>
                          <ShieldX size={20} style={{ color: '#dc3545' }} />
                          <h5 style={{ margin: 0, fontWeight: 'var(--font-weight-semibold)' }}>Blocked Wards</h5>
                          <span
                            style={{
                              background: '#dc3545',
                              color: 'white',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: 'var(--font-size-sm)',
                              fontWeight: 'var(--font-weight-medium)',
                            }}
                          >
                            {blockedWards.length}
                          </span>
                        </>
                      ) : (
                        <>
                          <ListCheck size={20} style={{ color: '#28a745' }} />
                          <h5 style={{ margin: 0, fontWeight: 'var(--font-weight-semibold)' }}>Active Wards</h5>
                          <span
                            style={{
                              background: '#28a745',
                              color: 'white',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: 'var(--font-size-sm)',
                              fontWeight: 'var(--font-weight-medium)',
                            }}
                          >
                            {activeWards.length}
                          </span>
                        </>
                      )}
                    </div>
                    <Button
                      variant={showBlocked ? 'outline-success' : 'outline-danger'}
                      size="sm"
                      onClick={() => setShowBlocked(!showBlocked)}
                      style={{
                        borderRadius: '20px',
                        padding: '6px 16px',
                        fontWeight: 'var(--font-weight-medium)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <ArrowRepeat size={16} />
                      {showBlocked ? 'Show Active' : 'Show Blocked'}
                    </Button>
                  </div>

                  {/* Search Input */}
                  <SearchInput
                    searchTerm={showBlocked ? blockedSearchTerm : activeSearchTerm}
                    onSearchChange={showBlocked ? setBlockedSearchTerm : setActiveSearchTerm}
                    placeholder={`Search wards by name or code...`}
                    resultCount={showBlocked ? blockedResultCount : activeResultCount}
                    totalCount={showBlocked ? blockedTotalCount : activeTotalCount}
                    showResultCount={true}
                  />
                </div>

                <div style={{ maxHeight: 'calc(78vh - 150px)', overflowY: 'auto' }}>
                  <Table striped bordered hover size="sm">
                    <thead style={{ position: 'sticky', top: 0, background: '#f8f9fa', zIndex: 10 }}>
                      <tr>
                        <th>#</th>
                        <th>Ward Name</th>
                        <th>Code</th>
                        <th>Gender</th>
                        <th>Avg Cost</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {showBlocked ? (
                        filteredBlockedWards.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center">
                              No blocked wards found
                            </td>
                          </tr>
                        ) : (
                          filteredBlockedWards.map((ward, index) => (
                            <tr key={ward.id}>
                              <td>{index + 1}</td>
                              <td>{ward.wardName}</td>
                              <td>{ward.code}</td>
                              <td>{ward.genderTypeValue === 'M' ? 'Male' : ward.genderTypeValue === 'F' ? 'Female' : 'Common'}</td>
                              <td>₹{(ward.avgCost || 0).toFixed(2)}</td>
                              <td>
                                <Button
                                  variant="success"
                                  size="sm"
                                  onClick={() => handleUnblock(ward.id)}
                                >
                                  Unblock
                                </Button>
                              </td>
                            </tr>
                          ))
                        )
                      ) : (
                        filteredActiveWards.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center">
                              No active wards found
                            </td>
                          </tr>
                        ) : (
                          filteredActiveWards.map((ward, index) => (
                            <tr key={ward.id}>
                              <td>{index + 1}</td>
                              <td>{ward.wardName}</td>
                              <td>{ward.code}</td>
                              <td>{ward.genderTypeValue === 'M' ? 'Male' : ward.genderTypeValue === 'F' ? 'Female' : 'Common'}</td>
                              <td>₹{(ward.avgCost || 0).toFixed(2)}</td>
                              <td>
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  className="me-1"
                                  onClick={() => handleEdit(ward.id)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleBlock(ward.id)}
                                >
                                  Block
                                </Button>
                              </td>
                            </tr>
                          ))
                        )
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

export default CreateWard;