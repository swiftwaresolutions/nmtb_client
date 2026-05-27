import React, { useState, useRef } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge } from 'react-bootstrap';
import ReportHeader from '../../../../medical-records/components/ReportHeader';
import { searchTableData, sortTableData, exportToExcel } from '../../../../medical-records/utils/reportUtils';

interface CancelledPORecord {
  slNo: number;
  poNumber: string;
  poDate: string;
  supplierName: string;
  totalAmount: number;
  cancelledDate: string;
  cancelledBy: string;
  cancelReason: string;
  itemCount: number;
}

export default function CancelledPO() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof CancelledPORecord; direction: 'asc' | 'desc' } | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const printRef = useRef<HTMLDivElement>(null);

  // Placeholder data - replace with actual API data
  const [records] = useState<CancelledPORecord[]>([
    {
      slNo: 1,
      poNumber: 'PO/2026/001',
      poDate: '2026-01-05',
      supplierName: 'ABC Pharmaceuticals',
      totalAmount: 50000,
      cancelledDate: '2026-01-08',
      cancelledBy: 'Admin User',
      cancelReason: 'Supplier unable to fulfill',
      itemCount: 5
    },
    {
      slNo: 2,
      poNumber: 'PO/2026/015',
      poDate: '2026-01-10',
      supplierName: 'XYZ Medical Supplies',
      totalAmount: 75000,
      cancelledDate: '2026-01-12',
      cancelledBy: 'Store Manager',
      cancelReason: 'Incorrect pricing',
      itemCount: 8
    }
  ]);

  const storeCode = sessionStorage.getItem('selectedStoreCode');
  const storeName = sessionStorage.getItem('selectedStoreName');
  const storeData = JSON.parse(sessionStorage.getItem('selectedStore') || '{}');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleSort = (key: keyof CancelledPORecord) => {
    setSortConfig(sortConfig?.key === key && sortConfig.direction === 'asc' 
      ? { key, direction: 'desc' } 
      : { key, direction: 'asc' });
  };

  const handleExport = () => {
    const exportData = filteredAndSortedRecords.map(record => ({
      'Sl No': record.slNo,
      'PO Number': record.poNumber,
      'PO Date': record.poDate,
      'Supplier Name': record.supplierName,
      'Total Amount': record.totalAmount,
      'Cancelled Date': record.cancelledDate,
      'Cancelled By': record.cancelledBy,
      'Cancel Reason': record.cancelReason,
      'Item Count': record.itemCount
    }));
    exportToExcel(exportData, 'Cancelled_PO_Register');
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredAndSortedRecords = sortTableData(
    searchTableData(records, searchQuery, ['poNumber', 'supplierName', 'cancelledBy', 'cancelReason']),
    sortConfig as any
  );

  const columns = [
    { key: 'slNo', label: 'Sl No' },
    { key: 'poNumber', label: 'PO Number' },
    { key: 'poDate', label: 'PO Date' },
    { key: 'supplierName', label: 'Supplier Name' },
    { key: 'totalAmount', label: 'Total Amount' },
    { key: 'cancelledDate', label: 'Cancelled Date' },
    { key: 'cancelledBy', label: 'Cancelled By' },
    { key: 'cancelReason', label: 'Cancel Reason' },
    { key: 'itemCount', label: 'Item Count' }
  ];

  return (
    <>
      <Container fluid className="p-4">
        <ReportHeader
          title="Cancelled Purchase Orders"
          subtitle={storeName || 'Medical Store'}
          onSearch={handleSearch}
          showSearch={true}
        />

        <Row className="mb-3">
          <Col md={3}>
            <Form.Group>
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6} className="d-flex align-items-end">
            <Button variant="primary" className="me-2">
              <i className="fas fa-filter me-2"></i>Filter
            </Button>
            <Button variant="success" onClick={handleExport} className="me-2">
              <i className="fas fa-file-excel me-2"></i>Export
            </Button>
            <Button variant="info" onClick={handlePrint}>
              <i className="fas fa-print me-2"></i>Print
            </Button>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={3}>
            <Card className="text-center bg-danger text-white">
              <Card.Body>
                <h6>Total Cancelled POs</h6>
                <h3>{filteredAndSortedRecords.length}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h6>Total Amount</h6>
                <h3>₹{filteredAndSortedRecords.reduce((sum, r) => sum + r.totalAmount, 0).toLocaleString()}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h6>Total Items</h6>
                <h3>{filteredAndSortedRecords.reduce((sum, r) => sum + r.itemCount, 0)}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h6>Suppliers Affected</h6>
                <h3>{new Set(filteredAndSortedRecords.map(r => r.supplierName)).size}</h3>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Card>
          <Card.Body>
            <div className="table-responsive" ref={printRef}>
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    {columns.map(col => (
                      <th 
                        key={col.key} 
                        onClick={() => handleSort(col.key as keyof CancelledPORecord)}
                        style={{ cursor: 'pointer' }}
                      >
                        {col.label}
                        {sortConfig?.key === col.key && (
                          <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'} ms-1`}></i>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedRecords.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length} className="text-center">No records found</td>
                    </tr>
                  ) : (
                    filteredAndSortedRecords.map((row, idx) => (
                      <tr key={idx}>
                        {columns.map(col => (
                          <td key={col.key}>
                            {col.key === 'totalAmount' ? (
                              `₹${(row as any)[col.key].toLocaleString()}`
                            ) : (
                              (row as any)[col.key]
                            )}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
}
