import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Button, Table, Modal } from 'react-bootstrap';
import { routerPathNames } from '../../../../routes/routerPathNames';
import PageHeader from '../../../../components/PageHeader';
import { faFileAlt } from '@fortawesome/free-solid-svg-icons';

interface Material {
  code: string;
  name: string;
  company: string;
  units: number;
  date: string;
}

interface PurchaseOrder {
  id: number;
  orderNo: string;
  supplier: string;
  confirmed: string;
  approved: string;
  grn: string;
  received: string;
  payment: string;
  finished: string;
  materials: Material[];
}

const PurchaseOrderStatus: React.FC = () => {
  const navigate = useNavigate();
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  // Sample data - replace with API call
  const poList: PurchaseOrder[] = [
    {
      id: 1,
      orderNo: "PO-1001",
      supplier: "ABC Traders",
      confirmed: "Yes",
      approved: "Yes",
      grn: "GRN-778",
      received: "Yes",
      payment: "Yes",
      finished: "Yes",
      materials: [
        { code: "M-01", name: "Iron Rod 12mm", company: "TATA Steel", units: 50, date: "02/02/2026" },
        { code: "M-02", name: "Cement Bag 50kg", company: "UltraTech", units: 100, date: "02/02/2026" },
        { code: "M-03", name: "Steel Wire Mesh", company: "JSW", units: 25, date: "02/02/2026" },
        { code: "M-04", name: "Construction Sand", company: "Local Supplier", units: 500, date: "02/02/2026" },
        { code: "M-05", name: "Gravel 20mm", company: "ABC Stones", units: 300, date: "02/02/2026" },
        { code: "M-06", name: "Plywood Sheet 8mm", company: "Century Ply", units: 75, date: "02/02/2026" },
        { code: "M-07", name: "Paint Emulsion White", company: "Asian Paints", units: 40, date: "02/02/2026" }
      ]
    },{
      id: 1,
      orderNo: "PO-1001",
      supplier: "ABC Traders",
      confirmed: "Yes",
      approved: "Yes",
      grn: "GRN-778",
      received: "Yes",
      payment: "Yes",
      finished: "Yes",
      materials: [
        { code: "M-01", name: "Iron Rod", company: "TATA", units: 50, date: "02/02/2026" },
        { code: "M-02", name: "Cement Bag", company: "UltraTech", units: 100, date: "02/02/2026" }
      ]
    },{
      id: 1,
      orderNo: "PO-1001",
      supplier: "ABC Traders",
      confirmed: "Yes",
      approved: "Yes",
      grn: "GRN-778",
      received: "Yes",
      payment: "Yes",
      finished: "Yes",
      materials: [
        { code: "M-01", name: "Iron Rod", company: "TATA", units: 50, date: "02/02/2026" },
        { code: "M-02", name: "Cement Bag", company: "UltraTech", units: 100, date: "02/02/2026" }
      ]
    },{
      id: 1,
      orderNo: "PO-1001",
      supplier: "ABC Traders",
      confirmed: "Yes",
      approved: "Yes",
      grn: "GRN-778",
      received: "Yes",
      payment: "Yes",
      finished: "Yes",
      materials: [
        { code: "M-01", name: "Iron Rod", company: "TATA", units: 50, date: "02/02/2026" },
        { code: "M-02", name: "Cement Bag", company: "UltraTech", units: 100, date: "02/02/2026" }
      ]
    },{
      id: 1,
      orderNo: "PO-1001",
      supplier: "ABC Traders",
      confirmed: "Yes",
      approved: "Yes",
      grn: "GRN-778",
      received: "Yes",
      payment: "Yes",
      finished: "Yes",
      materials: [
        { code: "M-01", name: "Iron Rod", company: "TATA", units: 50, date: "02/02/2026" },
        { code: "M-02", name: "Cement Bag", company: "UltraTech", units: 100, date: "02/02/2026" }
      ]
    },{
      id: 1,
      orderNo: "PO-1001",
      supplier: "ABC Traders",
      confirmed: "Yes",
      approved: "Yes",
      grn: "GRN-778",
      received: "Yes",
      payment: "Yes",
      finished: "Yes",
      materials: [
        { code: "M-01", name: "Iron Rod", company: "TATA", units: 50, date: "02/02/2026" },
        { code: "M-02", name: "Cement Bag", company: "UltraTech", units: 100, date: "02/02/2026" }
      ]
    },{
      id: 1,
      orderNo: "PO-1001",
      supplier: "ABC Traders",
      confirmed: "Yes",
      approved: "Yes",
      grn: "GRN-778",
      received: "Yes",
      payment: "Yes",
      finished: "Yes",
      materials: [
        { code: "M-01", name: "Iron Rod", company: "TATA", units: 50, date: "02/02/2026" },
        { code: "M-02", name: "Cement Bag", company: "UltraTech", units: 100, date: "02/02/2026" }
      ]
    },{
      id: 1,
      orderNo: "PO-1001",
      supplier: "ABC Traders",
      confirmed: "Yes",
      approved: "Yes",
      grn: "GRN-778",
      received: "Yes",
      payment: "Yes",
      finished: "Yes",
      materials: [
        { code: "M-01", name: "Iron Rod", company: "TATA", units: 50, date: "02/02/2026" },
        { code: "M-02", name: "Cement Bag", company: "UltraTech", units: 100, date: "02/02/2026" }
      ]
    },{
      id: 1,
      orderNo: "PO-1001",
      supplier: "ABC Traders",
      confirmed: "Yes",
      approved: "Yes",
      grn: "GRN-778",
      received: "Yes",
      payment: "Yes",
      finished: "Yes",
      materials: [
        { code: "M-01", name: "Iron Rod", company: "TATA", units: 50, date: "02/02/2026" },
        { code: "M-02", name: "Cement Bag", company: "UltraTech", units: 100, date: "02/02/2026" }
      ]
    },{
      id: 1,
      orderNo: "PO-1001",
      supplier: "ABC Traders",
      confirmed: "Yes",
      approved: "Yes",
      grn: "GRN-778",
      received: "Yes",
      payment: "Yes",
      finished: "Yes",
      materials: [
        { code: "M-01", name: "Iron Rod", company: "TATA", units: 50, date: "02/02/2026" },
        { code: "M-02", name: "Cement Bag", company: "UltraTech", units: 100, date: "02/02/2026" }
      ]
    },{
      id: 1,
      orderNo: "PO-1001",
      supplier: "ABC Traders",
      confirmed: "Yes",
      approved: "Yes",
      grn: "GRN-778",
      received: "Yes",
      payment: "Yes",
      finished: "Yes",
      materials: [
        { code: "M-01", name: "Iron Rod", company: "TATA", units: 50, date: "02/02/2026" },
        { code: "M-02", name: "Cement Bag", company: "UltraTech", units: 100, date: "02/02/2026" }
      ]
    },{
      id: 1,
      orderNo: "PO-1001",
      supplier: "ABC Traders",
      confirmed: "Yes",
      approved: "Yes",
      grn: "GRN-778",
      received: "Yes",
      payment: "Yes",
      finished: "Yes",
      materials: [
        { code: "M-01", name: "Iron Rod", company: "TATA", units: 50, date: "02/02/2026" },
        { code: "M-02", name: "Cement Bag", company: "UltraTech", units: 100, date: "02/02/2026" }
      ]
    },{
      id: 1,
      orderNo: "PO-1001",
      supplier: "ABC Traders",
      confirmed: "Yes",
      approved: "Yes",
      grn: "GRN-778",
      received: "Yes",
      payment: "Yes",
      finished: "Yes",
      materials: [
        { code: "M-01", name: "Iron Rod", company: "TATA", units: 50, date: "02/02/2026" },
        { code: "M-02", name: "Cement Bag", company: "UltraTech", units: 100, date: "02/02/2026" }
      ]
    },
    {
      id: 2,
      orderNo: "PO-1002",
      supplier: "Global Steel",
      confirmed: "Yes",
      approved: "No",
      grn: "-",
      received: "No",
      payment: "No",
      finished: "No",
      materials: [
        { code: "S-01", name: "Steel Sheet 4x8ft", company: "JSW", units: 25, date: "05/02/2026" },
        { code: "S-02", name: "Steel Beam I-Section", company: "TATA Steel", units: 15, date: "05/02/2026" },
        { code: "S-03", name: "Angle Iron 50x50mm", company: "Jindal", units: 60, date: "05/02/2026" },
        { code: "S-04", name: "Steel Pipe 2 inch", company: "SAIL", units: 80, date: "05/02/2026" },
        { code: "S-05", name: "Welding Electrode", company: "ESAB", units: 200, date: "05/02/2026" }
      ]
    }
  ];

  useEffect(() => {
    // Set default date range (current month)
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    setFromDate(firstDay.toISOString().split('T')[0]);
    setToDate(today.toISOString().split('T')[0]);
  }, []);

  const handleSearch = () => {
    console.log('Searching from', fromDate, 'to', toDate);
    // TODO: Implement API call to fetch purchase orders
  };

  const handleBack = () => {
    navigate(routerPathNames.centralStores.nonMedicalStore.dashboard);
  };

  const handlePOClick = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPO(null);
  };

  const boxStyle: React.CSSProperties = {
    marginBottom: 25,
    padding: 15,
    border: '1px solid #ccc',
    background: '#f9f9f9',
    borderRadius: '8px'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      <PageHeader 
        icon={faFileAlt} 
        title="Purchase Order Status" 
        subtitle="Track purchase orders and their materials" 
      />

      <div className="content-body" style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        
        {/* TOP - Search Box */}
        <div style={boxStyle}>
          <h5 style={{ marginBottom: 15, fontWeight: 600 }}>Search Purchase Orders</h5>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <label>From:</label>
            <Form.Control
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              style={{ width: '180px' }}
            />
            <label>To:</label>
            <Form.Control
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              style={{ width: '180px' }}
            />
            <Button variant="primary" onClick={handleSearch}>
              <i className="fas fa-search me-2"></i>
              Search
            </Button>
            <Button variant="outline-secondary" onClick={handleBack}>
              <i className="fas fa-arrow-left me-2"></i>
              Back
            </Button>
          </div>
        </div>

        {/* MIDDLE - Purchase Orders Table */}
        <div style={boxStyle}>
          <h5 style={{ marginBottom: 15, fontWeight: 600 }}>Purchase Orders</h5>
          <div style={{ overflowX: 'auto' }}>
            <Table bordered hover style={{ background: 'white', marginBottom: 0 }}>
              <thead style={{ background: '#e9ecef' }}>
                <tr>
                  <th style={{ textAlign: 'center' }}>Sl</th>
                  <th>Order No</th>
                  <th>Supplier</th>
                  <th style={{ textAlign: 'center' }}>Confirmed</th>
                  <th style={{ textAlign: 'center' }}>Approved</th>
                  <th style={{ textAlign: 'center' }}>GR Confirmed</th>
                  <th style={{ textAlign: 'center' }}>GR Approved</th>
                  <th style={{ textAlign: 'center' }}>GRN</th>
                  
                </tr>
              </thead>
              <tbody>
                {poList.map((po, i) => (
                  <tr 
                    key={po.id} 
                    onClick={() => handlePOClick(po)} 
                    style={{ 
                      cursor: 'pointer',
                      background: selectedPO?.id === po.id ? '#e7f3ff' : 'white'
                    }}
                  >
                    <td style={{ textAlign: 'center' }}>{i + 1}</td>
                    <td style={{ color: '#0d6efd' }}><strong>{po.orderNo}</strong></td>
                    <td>{po.supplier}</td>
                    <td style={{ textAlign: 'center' }}>{po.confirmed}</td>
                    <td style={{ textAlign: 'center' }}>{po.approved}</td>
                    <td style={{ textAlign: 'center' }}>{po.received}</td>
                    <td style={{ textAlign: 'center' }}>{po.payment}</td>
                    <td style={{ textAlign: 'center' }}>{po.grn}</td>
                    
                  </tr>
                ))}
              </tbody>
            </Table>
      </div>
      </div>

      {/* Materials Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
          <Modal.Title>
            <i className="fas fa-box me-2" style={{ color: '#0d6efd' }}></i>
            Purchase Order Materials
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {selectedPO && (
            <>
              <div style={{ marginBottom: 20, padding: 15, background: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
                <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                  <div>
                    <strong style={{ color: '#6c757d' }}>PO Number:</strong>{' '}
                    <span style={{ color: '#0d6efd', fontWeight: 600, fontSize: '1.1em' }}>{selectedPO.orderNo}</span>
                  </div>
                  <div>
                    <strong style={{ color: '#6c757d' }}>Supplier:</strong>{' '}
                    <span style={{ color: '#0d6efd', fontWeight: 600, fontSize: '1.1em' }}>{selectedPO.supplier}</span>
                  </div>
                  <div>
                    <strong style={{ color: '#6c757d' }}>Total Items:</strong>{' '}
                    <span style={{ fontWeight: 600, fontSize: '1.1em' }}>{selectedPO.materials.length}</span>
                  </div>
                </div>
              </div>
              
              <div style={{ overflowX: 'auto' }}>
                <Table bordered hover style={{ marginBottom: 0 }}>
                  <thead style={{ background: '#0d6efd', color: 'white' }}>
                    <tr>
                      <th style={{ width: '60px', textAlign: 'center' }}>Sl</th>
                      <th>Code</th>
                      <th>Material Name</th>
                      <th>Company</th>
                      <th style={{ textAlign: 'center', width: '100px' }}>Units</th>
                      <th style={{ textAlign: 'center', width: '120px' }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPO.materials.map((m, i) => (
                      <tr key={i}>
                        <td style={{ textAlign: 'center' }}>{i + 1}</td>
                        <td><strong style={{ color: '#0d6efd' }}>{m.code}</strong></td>
                        <td>{m.name}</td>
                        <td>{m.company}</td>
                        <td style={{ textAlign: 'center', fontWeight: 600 }}>{m.units}</td>
                        <td style={{ textAlign: 'center' }}>{m.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer style={{ background: '#f8f9fa', borderTop: '2px solid #dee2e6' }}>
          <Button variant="secondary" onClick={handleCloseModal}>
            <i className="fas fa-times me-2"></i>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      </div>
    </div>
  );
};

export default PurchaseOrderStatus;