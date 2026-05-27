import React, { useState, useRef } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge } from 'react-bootstrap';
import ReportHeader from '../../../../medical-records/components/ReportHeader';
import { searchTableData, sortTableData, exportToExcel } from '../../../../medical-records/utils/reportUtils';

interface MedicineTransactionRecord {
  slNo: number;
  transactionNo: string;
  transactionDate: string;
  storeName: string;
  medicineName: string;
  batchNo: string;
  transactionType: string;
  quantity: number;
  unit: string;
  remarks: string;
}

export default function MedicineTransactionAllStore() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof MedicineTransactionRecord; direction: 'asc' | 'desc' } | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const printRef = useRef<HTMLDivElement>(null);

  // Placeholder data - replace with actual API data
  const [records] = useState<MedicineTransactionRecord[]>([
    {
      slNo: 1,
      transactionNo: 'TXN/2026/001',
      transactionDate: '2026-01-10',
      storeName: 'Central Medical Store',
      medicineName: 'Paracetamol 500mg',
      batchNo: 'BATCH001',
      transactionType: 'Purchase',
      quantity: 1000,
      unit: 'Tablets',
      remarks: 'Regular stock'
    },
    {
      slNo: 2,
      transactionNo: 'TXN/2026/002',
      transactionDate: '2026-01-12',
      storeName: 'Pharmacy Store',
      medicineName: 'Amoxicillin 250mg',
      batchNo: 'BATCH002',
      transactionType: 'Transfer',
      quantity: 500,
      unit: 'Capsules',
      remarks: 'Inter-store transfer'
    }
  ]);

  const storeCode = sessionStorage.getItem('selectedStoreCode');
  const storeName = sessionStorage.getItem('selectedStoreName');
  const storeData = JSON.parse(sessionStorage.getItem('selectedStore') || '{}');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleSort = (key: keyof MedicineTransactionRecord) => {
    setSortConfig(sortConfig?.key === key && sortConfig.direction === 'asc' 
      ? { key, direction: 'desc' } 
      : { key, direction: 'asc' });
  };

  const handleExport = () => {
    const exportData = filteredAndSortedRecords.map(record => ({
      'Sl No': record.slNo,
      'Transaction No': record.transactionNo,
      'Transaction Date': record.transactionDate,
      'Store Name': record.storeName,
      'Medicine Name': record.medicineName,
      'Batch No': record.batchNo,
      'Transaction Type': record.transactionType,
      'Quantity': record.quantity,
      'Unit': record.unit,
      'Remarks': record.remarks
    }));
    exportToExcel(exportData, 'Medicine_Transaction_All_Store');
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredAndSortedRecords = sortTableData(
    searchTableData(records, searchQuery, ['transactionNo', 'storeName', 'medicineName', 'transactionType']),
    sortConfig as any
  );

  const columns = [
    { key: 'slNo', label: 'Sl No' },
    { key: 'transactionNo', label: 'Transaction No' },
    { key: 'transactionDate', label: 'Transaction Date' },
    { key: 'storeName', label: 'Store Name' },
    { key: 'medicineName', label: 'Medicine Name' },
    { key: 'batchNo', label: 'Batch No' },
    { key: 'transactionType', label: 'Transaction Type' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'unit', label: 'Unit' },
    { key: 'remarks', label: 'Remarks' }
  ];

  return (
    <>
      <Container fluid className="p-4">
        <ReportHeader
          title="Medicine Transaction All Store"
          subtitle="All Stores"
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
                <h6>Total Transactions</h6>
                <h3>{filteredAndSortedRecords.length}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h6>Purchases</h6>
                <h3>{filteredAndSortedRecords.filter(r => r.transactionType === 'Purchase').length}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h6>Transfers</h6>
                <h3>{filteredAndSortedRecords.filter(r => r.transactionType === 'Transfer').length}</h3>
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
                        onClick={() => handleSort(col.key as keyof MedicineTransactionRecord)}
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
                            {col.key === 'transactionType' ? (
                              <Badge bg={row.transactionType === 'Purchase' ? 'success' : 'primary'}>
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
