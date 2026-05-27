import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, InputGroup, Table, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faBan, faUnlock, faIdCard, faUser } from '@fortawesome/free-solid-svg-icons';
import SearchInput from '../../../../components/SearchInput';
import { useTableSearch } from '../../../../hooks/useTableSearch';
import PageHeader from '../../../../components/PageHeader';

const demoBlockedList = [
    { patId: 1, opNo: 'OP1001', patientName: 'Rajan Kumar', blockReason: 'Pending Bill' },
    { patId: 2, opNo: 'OP1002', patientName: 'Meena Devi', blockReason: 'Duplicate Entry' },
    { patId: 3, opNo: 'OP1003', patientName: 'Suresh Babu', blockReason: 'Insurance Issue' },
];

const BlockUhid: React.FC = () => {
    const [opNumber, setOpNumber] = useState<string>('');
    const [patientName, setPatientName] = useState<string>('');
    const [blockReason, setBlockReason] = useState<string>('');
    const [blockedList, setBlockedList] = useState(demoBlockedList);

    const { filteredData, searchTerm, setSearchTerm, resultCount, totalCount } = useTableSearch({
        data: blockedList,
        searchFields: ['opNo', 'patientName', 'blockReason'],
    });

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') e.preventDefault();
    };

    const handleReset = () => {
        setOpNumber('');
        setPatientName('');
        setBlockReason('');
    };

    const handleUnblock = (patId: number) => {
        setBlockedList(prev => prev.filter(item => item.patId !== patId));
    };

    return (
        <div className="content-wrapper" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <PageHeader
                icon={faBan}
                title="HIN Block"
                subtitle="Block or unblock patient UHID"
                badges={[
                    { label: 'Medical Records', value: '' }
                ]}
            />

            {/* Body */}
            <div className="content-body" style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '1.5rem' }}>
                <Container fluid>
                    <Row className="g-3">

                        {/* Left - Block Form */}
                        <Col lg={4}>
                            <Card className="shadow-sm border-0" style={{ borderLeft: '4px solid #dc3545' }}>
                                <Card.Header className="bg-light border-0">
                                    <h6 className="mb-0 fw-bold text-dark">
                                        <FontAwesomeIcon icon={faBan} className="me-2 text-danger" />
                                        Block UHID
                                    </h6>
                                </Card.Header>
                                <Card.Body className="p-3">
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold small text-muted">
                                            Blocked OPNO <span className="text-danger">*</span>
                                        </Form.Label>
                                        <InputGroup>
                                            <InputGroup.Text className="bg-white border-end-0">
                                                <FontAwesomeIcon icon={faIdCard} className="text-muted" />
                                            </InputGroup.Text>
                                            <Form.Control
                                                type="text"
                                                placeholder="e.g., 26-4"
                                                value={opNumber}
                                                onChange={(e) => setOpNumber(e.target.value)}
                                                onKeyPress={handleKeyPress}
                                                className="border-start-0 ps-0"
                                                autoFocus
                                            />
                                            <Button variant="outline-secondary" disabled={!opNumber.trim()}>
                                                <FontAwesomeIcon icon={faSearch} />
                                            </Button>
                                        </InputGroup>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold small text-muted">Patient Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={patientName}
                                            onChange={(e) => setPatientName(e.target.value)}
                                            placeholder="Auto-filled after search"
                                            className="bg-light"
                                            readOnly
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-bold small text-muted">
                                            Block Reason <span className="text-danger">*</span>
                                        </Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            placeholder="Enter block reason..."
                                            value={blockReason}
                                            onChange={(e) => setBlockReason(e.target.value)}
                                        />
                                    </Form.Group>

                                    <div className="d-flex gap-2">
                                        <Button variant="danger" className="flex-grow-1">
                                            Submit
                                        </Button>
                                        <Button variant="outline-secondary" onClick={handleReset}>
                                            Reset
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* Right - Blocked List */}
                        <Col lg={8}>
                            <Card className="shadow-sm border-0" style={{ borderLeft: '4px solid #6c757d' }}>
                                <Card.Header className="bg-light border-0">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <h6 className="mb-0 fw-bold text-dark">
                                            <FontAwesomeIcon icon={faBan} className="me-2" />
                                            Blocked HIN
                                        </h6>
                                        <SearchInput
                                            searchTerm={searchTerm}
                                            onSearchChange={setSearchTerm}
                                            placeholder="Search OPNO, name, reason..."
                                            resultCount={resultCount}
                                            totalCount={totalCount}
                                        />
                                    </div>
                                </Card.Header>
                                <Card.Body className="p-0">
                                    <div style={{ overflowX: 'auto' }}>
                                        <Table bordered hover size="sm" className="mb-0">
                                            <thead className="table-dark">
                                                <tr>
                                                    <th style={{ width: '50px' }}>S No</th>
                                                    <th>OPNO</th>
                                                    <th>Patient Name</th>
                                                    <th>Blocked Reason</th>
                                                    <th style={{ width: '110px' }}>Unblock</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredData.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={5} className="text-center text-muted py-3">
                                                            No blocked patients found
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredData.map((item, index) => (
                                                        <tr key={item.patId}>
                                                            <td>{index + 1}</td>
                                                            <td className="fw-bold text-primary">{item.opNo}</td>
                                                            <td>{item.patientName}</td>
                                                            <td>{item.blockReason}</td>
                                                            <td>
                                                                <Button
                                                                    variant="success"
                                                                    size="sm"
                                                                    onClick={() => handleUnblock(item.patId)}
                                                                >
                                                                    <FontAwesomeIcon icon={faUnlock} className="me-1" />
                                                                    Unblock
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
                        </Col>

                    </Row>
                </Container>
            </div>
        </div>
    );
};

export default BlockUhid;
