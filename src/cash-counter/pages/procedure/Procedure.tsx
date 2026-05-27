import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Table, Alert } from 'react-bootstrap';
import PageHeader from '../../../components/PageHeader';
import { faProcedures } from '@fortawesome/free-solid-svg-icons';
import { CashCounterApiService } from '../../../api/cash-counter/cash-counter-api-service';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../state/store';
import { handleError } from '../../../utils/errorUtil';
import {
  showSuccessToast,
  showErrorToast,
  showValidationError,
  showLoading,
  closeAlert,
} from '../../../utils/alertUtil';
import { useTableSearch } from '../../../hooks/useTableSearch';
import SearchInput from '../../../components/SearchInput';
import '../../../style/commonStyle.css';

interface ProcedureRate {
  id: number;
  accHeadId: number;
  rate: number;
  charity: number;
}

interface Procedure {
  id: number;
  name: string;
  grp: number;
  incomeHead: number;
  orgId: number;
  isBlocked: number;
  rate: number;
  privateRate: number;
  isEditable: number;
  // Legacy fields for compatibility
  group?: string;
  particulars?: string;
  code?: string;
  rateGeneral?: number;
  ratePrivate?: number;
}

interface InvestigationGroup {
  id: number;
  name: string;
  incomeHead: number;
  isBlocked: boolean | number;
}

interface AccountHead {
  headId: number;
  headName: string;
  discountHeadId: number;
  discountHeadName: string;
  percentageValue: number;
}

const Procedure = () => {
  const cashCounterApi = new CashCounterApiService();
  const dispatch = useDispatch();
  const loginData = useSelector((state: RootState) => state.loginData);
  const showFutureProcedureDetails = false;
  
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [groups, setGroups] = useState<InvestigationGroup[]>([]);
  const [accountHeads, setAccountHeads] = useState<AccountHead[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showBlocked, setShowBlocked] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedGroupIncomeHead, setSelectedGroupIncomeHead] = useState<number>(0);

  const [formData, setFormData] = useState({
    group: '',
    particulars: '',
    code: '',
    rateGeneral: '0.0',
    ratePrivate: '0.0',
    sameChargePrivate: false,
    sameChargeGeneral: false,
    categoryA: '0.0',
    categoryB: '0.0',
    categoryC: '0.0',
    generalPatientAccounts: '0.0',
    staff: '0.0',
    staffDependant: '0.0',
    vipMipOthers: '0.0',
    gjayAbpmjay: '0.0',
    isEditable: false,
    isSurgery: false,
  });

  // Fetch investigation groups from API
  const fetchInvestigationGroups = async () => {
    try {
      const res = await cashCounterApi.fetchAllInvestigationGroups();
      setGroups(Array.isArray(res) ? res.filter((g: InvestigationGroup) => !g.isBlocked) : []);
    } catch (err) {
      console.error('Failed to fetch investigation groups:', err);
    }
  };

  // Fetch account heads from API
  const fetchAccountHeads = async () => {
    try {
      const res = await cashCounterApi.fetchAccountHeads();
      setAccountHeads(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Failed to fetch account heads:', err);
    }
  };

  // Fetch procedures from API
  const fetchProcedures = async () => {
    try {
      const res = await cashCounterApi.fetchAllProcedures();
      setProcedures(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Failed to fetch procedures:', err);
    }
  };

  useEffect(() => {
    fetchInvestigationGroups();
    fetchAccountHeads();
    fetchProcedures();
    // eslint-disable-next-line
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    let updatedData = {
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    };

    // When group is selected, store its incomeHead ID
    if (name === 'group' && value) {
      const selectedGroup = groups.find(g => g.id === Number(value));
      setSelectedGroupIncomeHead(selectedGroup?.incomeHead || 0);
    }

    // If "This Charge is same for all heads [General]" is checked
    if (name === 'sameChargeGeneral' && checked) {
      const generalCharges: any = {
        sameChargePrivate: false, // Uncheck Private
        categoryA: formData.rateGeneral,
        categoryB: formData.rateGeneral,
        categoryC: formData.rateGeneral,
      };
      
      // Populate all dynamic account head fields with general rate
      accountHeads.forEach(head => {
        generalCharges[`accountHead_${head.headId}`] = formData.rateGeneral;
      });
      
      updatedData = {
        ...updatedData,
        ...generalCharges,
      };
    }

    // If "This Charge is same for all heads [Private]" is checked
    if (name === 'sameChargePrivate' && checked) {
      const privateCharges: any = {
        sameChargeGeneral: false, // Uncheck General
        categoryA: formData.ratePrivate,
        categoryB: formData.ratePrivate,
        categoryC: formData.ratePrivate,
      };
      
      // Populate all dynamic account head fields with private rate
      accountHeads.forEach(head => {
        privateCharges[`accountHead_${head.headId}`] = formData.ratePrivate;
      });
      
      updatedData = {
        ...updatedData,
        ...privateCharges,
      };
    }
    
    setFormData(updatedData);
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    
    if (!formData.particulars.trim()) {
      showValidationError('Procedure name is required');
      return;
    }
    if (!formData.group) {
      showValidationError('Group is required');
      return;
    }

    try {
      const selectedGroup = groups.find(g => g.id === Number(formData.group));
      const incomeHead = selectedGroup?.incomeHead  || 0;

      const payload = {
        name: formData.particulars,
        grp: parseInt(formData.group, 10),
        incomeHead,
        orgId: loginData.id || 0,
        isBlocked: 0,
        rate: parseFloat(formData.rateGeneral) || 0,
        privateRate: parseFloat(formData.ratePrivate) || 0,
        isEditable: formData.isEditable ? 1 : 0,
      };

      showLoading(editingId ? 'Updating procedure...' : 'Saving procedure...');
      if (editingId) {
        await cashCounterApi.updateProcedure(editingId, payload);
      } else {
        await cashCounterApi.saveProcedure(payload);
      }
      closeAlert();
      showSuccessToast(editingId ? 'Procedure updated successfully!' : 'Procedure saved successfully!');
      
      // Reset form
      setFormData({
        group: '',
        particulars: '',
        code: '',
        rateGeneral: '0.0',
        ratePrivate: '0.0',
        sameChargePrivate: false,
        sameChargeGeneral: false,
        categoryA: '0.0',
        categoryB: '0.0',
        categoryC: '0.0',
        generalPatientAccounts: '0.0',
        staff: '0.0',
        staffDependant: '0.0',
        vipMipOthers: '0.0',
        gjayAbpmjay: '0.0',
        isEditable: false,
        isSurgery: false
      });
      setEditingId(null);
      setSelectedGroupIncomeHead(0);
      
      // Refresh procedures list
      fetchProcedures();
    } catch (error: any) {
      closeAlert();
      console.error('Error saving procedure:', error);
      handleError(dispatch, error);
      showErrorToast(error?.response?.data?.error || 'Failed to save procedure');
    }
  };

  const handleEdit = (procedure: Procedure) => {
    setEditingId(procedure.id);
    setSelectedGroupIncomeHead(procedure.incomeHead || 0);

    setFormData({
      group: procedure.grp ? String(procedure.grp) : (procedure.group || ''),
      particulars: procedure.particulars || procedure.name || '',
      code: procedure.code || '',
      rateGeneral: (procedure.rate ?? procedure.rateGeneral ?? 0).toString(),
      ratePrivate: (procedure.privateRate ?? procedure.ratePrivate ?? 0).toString(),
      sameChargePrivate: false,
      sameChargeGeneral: false,
      categoryA: '0.0',
      categoryB: '0.0',
      categoryC: '0.0',
      generalPatientAccounts: '0.0',
      staff: '0.0',
      staffDependant: '0.0',
      vipMipOthers: '0.0',
      gjayAbpmjay: '0.0',
      isEditable: Boolean(procedure.isEditable),
      isSurgery: false,
    });
  };

  const handleBlock = async (id: number) => {
    console.log('Block procedure:', id);
    setSuccess('Procedure blocked successfully');
  };

  const handleUnblock = async (id: number) => {
    console.log('Unblock procedure:', id);
    setSuccess('Procedure unblocked successfully');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      group: '',
      particulars: '',
      code: '',
      rateGeneral: '0.0',
      ratePrivate: '0.0',
      sameChargePrivate: false,
      sameChargeGeneral: false,
      categoryA: '0.0',
      categoryB: '0.0',
      categoryC: '0.0',
      generalPatientAccounts: '0.0',
      staff: '0.0',
      staffDependant: '0.0',
      vipMipOthers: '0.0',
      gjayAbpmjay: '0.0',
      isEditable: false,
      isSurgery: false,
    });
  };

  return (
    <div>
      {/* ---------------- HEADER ---------------- */}
      <PageHeader 
        icon={faProcedures}
        title="Procedure Master"
        subtitle="Manage procedure details and charges"
      />

      {/* ---------------- BODY ---------------- */}
      <div className="content-body" style={{ maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
        <Container fluid>
          <Row>
            {/* Left Side - Entry Form */}
            <Col md={7} style={{ maxHeight: 'calc(100vh - 140px)', overflowY: 'auto' }}>
              {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
              {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

              <Card className="shadow-sm">
                <Card.Body>
              <Row>
                {/* Basic Details */}
                <Col md={12} className="mb-3">
                  <h5 className="mb-3 fw-bold">Basic Details</h5>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Group <span className="text-danger">*</span></Form.Label>
                        <Form.Select
                          name="group"
                          value={formData.group}
                          onChange={handleInputChange}
                        >
                          <option value="">Select Group</option>
                          {groups.map((group) => (
                            <option key={group.id} value={group.id}>
                              {group.name}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Particulars <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="text"
                          name="particulars"
                          value={formData.particulars}
                          onChange={handleInputChange}
                          placeholder="Enter particulars"
                        />
                      </Form.Group>
                    </Col>
                    
                  </Row>
                </Col>

                {/* Charge Details */}
                <Col md={12} className="mb-3">
                  <h5 className="mb-3 fw-bold text-primary">Charge Details</h5>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Rate [General] <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="number"
                          step="0.01"
                          name="rateGeneral"
                          value={formData.rateGeneral}
                          onChange={handleInputChange}
                          placeholder="0.0"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Rate [Private] <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="number"
                          step="0.01"
                          name="ratePrivate"
                          value={formData.ratePrivate}
                          onChange={handleInputChange}
                          placeholder="0.0"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    {showFutureProcedureDetails && (
                      <>
                        <Col md={6}>
                          <Form.Check
                            type="checkbox"
                            id="sameChargeGeneral"
                            name="sameChargeGeneral"
                            label={<span>same for all heads <span className="text-danger">[General]</span></span>}
                            checked={formData.sameChargeGeneral}
                            onChange={handleInputChange}
                          />
                        </Col>
                        <Col md={6}>
                          <Form.Check
                            type="checkbox"
                            id="sameChargePrivate"
                            name="sameChargePrivate"
                            label={<span>same for all heads <span className="text-danger">[Private]</span></span>}
                            checked={formData.sameChargePrivate}
                            onChange={handleInputChange}
                          />
                        </Col>
                      </>
                    )}
                  </Row>
                </Col>

                {showFutureProcedureDetails && (
                  <>
                    {/* IP Charges */}
                    <Col md={6} className="mb-3">
                      <h5 className="mb-3 fw-bold text-info">IP Charges</h5>
                      <Form.Group className="mb-2">
                        <Form.Label>CATEGORY A</Form.Label>
                        <Form.Control
                          type="number"
                          step="0.01"
                          name="categoryA"
                          value={formData.categoryA}
                          onChange={handleInputChange}
                          placeholder="0.0"
                        />
                      </Form.Group>
                      <Form.Group className="mb-2">
                        <Form.Label>CATEGORY B</Form.Label>
                        <Form.Control
                          type="number"
                          step="0.01"
                          name="categoryB"
                          value={formData.categoryB}
                          onChange={handleInputChange}
                          placeholder="0.0"
                        />
                      </Form.Group>
                      <Form.Group className="mb-2">
                        <Form.Label>CATEGORY C</Form.Label>
                        <Form.Control
                          type="number"
                          step="0.01"
                          name="categoryC"
                          value={formData.categoryC}
                          onChange={handleInputChange}
                          placeholder="0.0"
                        />
                      </Form.Group>
                    </Col>

                    {/* OP Charges - Dynamic from API */}
                    <Col md={6} className="mb-3">
                      <h5 className="mb-3 fw-bold text-success">OP Charges</h5>
                      {accountHeads.map((head) => (
                        <Form.Group key={head.headId} className="mb-2">
                          <Form.Label>{head.headName}</Form.Label>
                          <Form.Control
                            type="number"
                            step="0.01"
                            name={`accountHead_${head.headId}`}
                            value={(formData as any)[`accountHead_${head.headId}`] || head.percentageValue.toFixed(1)}
                            onChange={handleInputChange}
                            placeholder="0.0"
                          />
                        </Form.Group>
                      ))}
                    </Col>
                  </>
                )}

                {/* Additional Options */}
                <Col md={12} className="mb-3">
                  <Row>
                    <Col md={6}>
                      <Form.Check
                        type="checkbox"
                        id="isEditable"
                        name="isEditable"
                        label="Is Editable"
                        checked={formData.isEditable}
                        onChange={handleInputChange}
                      />
                    </Col>
                    {showFutureProcedureDetails && (
                      <Col md={6}>
                        <Form.Check
                          type="checkbox"
                          id="isSurgery"
                          name="isSurgery"
                          label={<span className="text-success">Is Surgery</span>}
                          checked={formData.isSurgery}
                          onChange={handleInputChange}
                        />
                      </Col>
                    )}
                  </Row>
                </Col>

                {/* Submit Button */}
                <Col md={12} className="text-center">
                  <Button 
                    variant="primary" 
                    size="lg"
                    onClick={handleSubmit}
                    style={{ minWidth: '200px' }}
                    className="me-2"
                  >
                    {editingId ? 'Update' : 'Submit'}
                  </Button>
                  {editingId && (
                    <Button 
                      variant="secondary" 
                      size="lg"
                      onClick={handleCancelEdit}
                      style={{ minWidth: '150px' }}
                    >
                      Cancel
                    </Button>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        {/* Right Side - List */}
        <Col md={5}>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Procedures List</h5>
                <Button 
                  variant={showBlocked ? 'light' : 'warning'} 
                  size="sm"
                  onClick={() => setShowBlocked(!showBlocked)}
                >
                  {showBlocked ? 'Show Active' : 'Show Blocked'}
                </Button>
              </div>
            </Card.Header>
            <Card.Body className="p-2">
              <ProcedureList
                procedures={procedures}
                showBlocked={showBlocked}
                editingId={editingId}
                onEdit={handleEdit}
                onBlock={handleBlock}
                onUnblock={handleUnblock}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  </div>
    </div>
  );
};

interface ProcedureListProps {
  procedures: Procedure[];
  showBlocked: boolean;
  editingId: number | null;
  onEdit: (procedure: Procedure) => void;
  onBlock: (id: number) => void;
  onUnblock: (id: number) => void;
}

const ProcedureList: React.FC<ProcedureListProps> = ({ procedures, showBlocked, editingId, onEdit, onBlock, onUnblock }) => {
  const filtered = procedures.filter(p => showBlocked ? p.isBlocked : !p.isBlocked);

  const { filteredData, searchTerm, setSearchTerm, resultCount, totalCount } = useTableSearch({
    data: filtered,
    searchFields: ['name', 'particulars', 'group', 'grp'],
  });

  return (
    <>
      <SearchInput
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Search by name or group..."
        resultCount={resultCount}
        totalCount={totalCount}
      />
              <div style={{ maxHeight: 'calc(100vh - 260px)', overflowY: 'auto' }}>
                <Table striped bordered hover size="sm" className="mb-0">
                  <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f8f9fa', zIndex: 1 }}>
                    <tr>
                      <th style={{ width: '50px' }}>#</th>
                      <th>Particulars</th>
                      <th style={{ width: '100px' }}>Rate (Gen)</th>
                      <th style={{ width: '120px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center text-muted">
                          {searchTerm ? 'No procedures match your search' : showBlocked ? 'No blocked procedures' : 'No procedures added yet'}
                        </td>
                      </tr>
                    ) : (
                      filteredData
                        .map((procedure, index) => {
                          const displayRate = procedure.rate ?? procedure.rateGeneral ?? 0;
                          const displayName = procedure.name || procedure.particulars || '';
                          const displayGroup = procedure.group || procedure.grp || '';
                          
                          return (
                          <tr 
                            key={procedure.id}
                            className={editingId === procedure.id ? 'table-warning' : ''}
                          >
                            <td>{index + 1}</td>
                            <td>
                              <div><strong>{displayName}</strong></div>
                              <small className="text-muted">{displayGroup}</small>
                            </td>
                            <td>₹{displayRate.toFixed(2)}</td>
                            <td>
                              {showBlocked ? (
                                <Button 
                                  variant="success" 
                                  size="sm"
                                  onClick={() => onUnblock(procedure.id)}
                                >
                                  Unblock
                                </Button>
                              ) : (
                                <>
                                  <Button 
                                    variant="primary" 
                                    size="sm"
                                    className="me-1"
                                    onClick={() => onEdit(procedure)}
                                    disabled={editingId === procedure.id}
                                  >
                                    Edit
                                  </Button>
                                  <Button 
                                    variant="danger" 
                                    size="sm"
                                    onClick={() => onBlock(procedure.id)}
                                  >
                                    Block
                                  </Button>
                                </>
                              )}
                            </td>
                          </tr>
                          );
                        })
                    )}
                  </tbody>
                </Table>
              </div>
    </>
  );
};

export default Procedure;