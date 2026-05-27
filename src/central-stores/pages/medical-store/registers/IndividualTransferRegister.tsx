import React, { useState, useRef } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge } from 'react-bootstrap';
import ReportHeader from '../../../../medical-records/components/ReportHeader';
import { searchTableData, sortTableData, exportToExcel } from '../../../../medical-records/utils/reportUtils';

interface IndividualTransferRecord {
  slNo: number;
  transferNo: string;
  transferDate: string;
  employeeName: string;
  employeeId: string;
  productName: string;
  batchNo: string;
  quantity: number;
  unit: string;
  status: string;
}

export default function IndividualTransferRegister() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof IndividualTransferRecord; direction: 'asc' | 'desc' } | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const printRef = useRef<HTMLDivElement>(null);

  // Placeholder data - replace with actual API data
  const [records] = useState<IndividualTransferRecord[]>([
    {
      slNo: 1,
      transferNo: 'IT/2026/001',
      transferDate: '2026-01-10',
      employeeName: 'Dr. John Smith',
      employeeId: 'EMP001',
      productName: 'Surgical Gloves',
      batchNo: 'BATCH001',
      quantity: 10,
      unit: 'Boxes',
      status: 'Completed'
    },
    {
      slNo: 2,
      transferNo: 'IT/2026/002',
      transferDate: '2026-01-12',
      employeeName: 'Dr. Sarah Johnson',
      employeeId: 'EMP002',
      productName: 'Face Masks',
      batchNo: 'BATCH002',
      quantity: 50,
      unit: 'Pieces',
      status: 'Pending'
    }
  ]);

  const storeCode = sessionStorage.getItem('selectedStoreCode');
  const storeName = sessionStorage.getItem('selectedStoreName');
  const storeData = JSON.parse(sessionStorage.getItem('selectedStore') || '{}');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleSort = (key: keyof IndividualTransferRecord) => {
    setSortConfig(sortConfig?.key === key && sortConfig.direction === 'asc' 
      ? { key, direction: 'desc' } 
      : { key, direction: 'asc' });
  };

  const handleExport = () => {
    const exportData = filteredAndSortedRecords.map(record => ({
      'Sl No': record.slNo,
      'Transfer No': record.transferNo,
      'Transfer Date': record.transferDate,
      'Employee Name': record.employeeName,
      'Employee ID': record.employeeId,
      'Product Name': record.productName,
      'Batch No': record.batchNo,
      'Quantity': record.quantity,
      'Unit': record.unit,
      'Status': record.status
    }));
    exportToExcel(exportData, 'Individual_Transfer_Register');
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredAndSortedRecords = sortTableData(
    searchTableData(records, searchQuery, ['transferNo', 'employeeName', 'employeeId', 'productName']),
    sortConfig as any
  );

  const columns = [
    { key: 'slNo', label: 'Sl No' },
    { key: 'transferNo', label: 'Transfer No' },
    { key: 'transferDate', label: 'Transfer Date' },
    { key: 'employeeName', label: 'Employee Name' },
    { key: 'employeeId', label: 'Employee ID' },
    { key: 'productName', label: 'Product Name' },
    { key: 'batchNo', label: 'Batch No' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'unit', label: 'Unit' },
    { key: 'status', label: 'Status' }
  ];

  return (
    <>
      <Container fluid className="p-4">
        <ReportHeader
          title="Individual Transfer Register"
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
            <Card className="text-center">
              <Card.Body>
                <h6>Total Transfers</h6>
                <h3>{filteredAndSortedRecords.length}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h6>Completed</h6>
                <h3>{filteredAndSortedRecords.filter(r => r.status === 'Completed').length}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h6>Pending</h6>
                <h3>{filteredAndSortedRecords.filter(r => r.status === 'Pending').length}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h6>Total Items</h6>
                <h3>{filteredAndSortedRecords.reduce((sum, r) => sum + r.quantity, 0)}</h3>
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
                        onClick={() => handleSort(col.key as keyof IndividualTransferRecord)}
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
                            {col.key === 'status' ? (
                              <Badge bg={row.status === 'Completed' ? 'success' : 'warning'}>
                                {(row as any)[col.key]}
                              </Badge>
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
