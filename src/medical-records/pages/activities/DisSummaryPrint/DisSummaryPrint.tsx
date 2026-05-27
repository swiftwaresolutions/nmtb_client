import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, InputGroup, Table, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays, faSearch, faFileAlt, faUser, faPrint } from '@fortawesome/free-solid-svg-icons';
import SearchInput from '../../../../components/SearchInput';
import PageHeader from '../../../../components/PageHeader';
import { useTableSearch } from '../../../../hooks/useTableSearch';

const demoData = [
    { id: 1, patientName: 'Arun Kumar',  date: '2026-02-10', time: '10:30 AM', ipNo: 'IP1001', opNo: 'OP4501', user: 'Admin' },
    { id: 2, patientName: 'Priya Sharma', date: '2026-02-12', time: '02:15 PM', ipNo: 'IP1002', opNo: 'OP4502', user: 'Nurse1' },
    { id: 3, patientName: 'Rahul Verma',  date: '2026-02-15', time: '11:45 AM', ipNo: 'IP1003', opNo: 'OP4503', user: 'DoctorA' },
    { id: 4, patientName: 'Sneha Patel',  date: '2026-02-18', time: '09:20 AM', ipNo: 'IP1004', opNo: 'OP4504', user: 'Admin' },
];

const DisSummaryPrint: React.FC = () => {
    const today = new Date().toISOString().split('T')[0];
    const [fromDate, setFromDate] = useState<string>(today);
    const [toDate, setToDate] = useState<string>(today);
    const [tableData, setTableData] = useState(demoData);

    const { filteredData, searchTerm, setSearchTerm, resultCount, totalCount } = useTableSearch({
        data: tableData,
        searchFields: ['patientName', 'date', 'ipNo', 'opNo', 'user'],
    });

    return (
        <div className="content-wrapper" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <PageHeader
                icon={faFileAlt}
                title="Discharge Summary Print"
                subtitle="Print discharge summaries by date range"
                badges={[
                    { label: 'Medical Records', value: '' }
                ]}
            />

            {/* Body */}
            <div className="content-body" style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '1.5rem' }}>
                <Container fluid>

                    {/* Filter Card */}
                    <Card className="shadow-sm border-0 mb-3" style={{ borderLeft: '4px solid #0d6efd' }}>
                        <Card.Body className="p-3">
                            <Row className="g-3 align-items-end">
                                <Col md={4}>
                                    <Form.Label className="fw-bold small text-muted text-uppercase">
                                        Select From Date
                                    </Form.Label>
                                    <InputGroup>
                                        <Form.Control
                                            type="date"
                                            size="sm"
                                            value={fromDate}
                                            onChange={(e) => setFromDate(e.target.value)}
                                            autoFocus
                                        />
                                        <InputGroup.Text>
                                            <FontAwesomeIcon icon={faCalendarDays} className="text-primary" />
                                        </InputGroup.Text>
                                    </InputGroup>
                                </Col>
                                <Col md={4}>
                                    <Form.Label className="fw-bold small text-muted text-uppercase">
                                        Select To Date
                                    </Form.Label>
                                    <InputGroup>
                                        <Form.Control
                                            type="date"
                                            size="sm"
                                            value={toDate}
                                            onChange={(e) => setToDate(e.target.value)}
                                        />
                                        <InputGroup.Text>
                                            <FontAwesomeIcon icon={faCalendarDays} className="text-primary" />
                                        </InputGroup.Text>
                                    </InputGroup>
                                </Col>
                                <Col md={4}>
                                    <Button variant="primary" size="sm">
                                        <FontAwesomeIcon icon={faSearch} className="me-2" />
                                        Submit
                                    </Button>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    {/* Table Card */}
                    <Card className="shadow-sm border-0" style={{ borderLeft: '4px solid #6c757d' }}>
                        <Card.Header className="bg-light border-0">
                            <div className="d-flex justify-content-between align-items-center">
                                <h6 className="mb-0 fw-bold text-dark">
                                    <FontAwesomeIcon icon={faFileAlt} className="me-2" />
                                    Patient List
                                </h6>
                                <SearchInput
                                    searchTerm={searchTerm}
                                    onSearchChange={setSearchTerm}
                                    placeholder="Search patient details..."
                                    resultCount={resultCount}
                                    totalCount={totalCount}
                                />
                            </div>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <div style={{ overflowX: 'auto', maxHeight: '420px', overflowY: 'auto' }}>
                                <Table hover size="sm" className="mb-0">
                                    <thead className="table-primary" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                                        <tr>
                                            <th>SL.No</th>
                                            <th>Patient Name</th>
                                            <th>Date</th>
                                            <th>Time</th>
                                            <th>IP No</th>
                                            <th>OP No</th>
                                            <th>User</th>
                                            <th>Print</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredData.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="text-center text-muted py-3">
                                                    No records found
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredData.map((item, index) => (
                                                <tr key={item.id}>
                                                    <td>{index + 1}</td>
                                                    <td className="fw-bold">{item.patientName}</td>
                                                    <td>{item.date}</td>
                                                    <td>{item.time}</td>
                                                    <td className="fw-bold text-primary" style={{ cursor: 'pointer' }}>{item.ipNo}</td>
                                                    <td>{item.opNo}</td>
                                                    <td>{item.user}</td>
                                                    <td>
                                                        <Button variant="outline-primary" size="sm">
                                                            <FontAwesomeIcon icon={faPrint} />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        </Card.Body>
                    </Card>

                </Container>
            </div>
        </div>
    );
};

export default DisSummaryPrint;
