import React, { useState, useMemo } from "react";
import { Container, Card, Form, Button, Row, Col, Modal, Badge, Spinner, Alert } from "react-bootstrap";
import ReportHeader from "../../components/ReportHeader";
import ReportKPICard from "../../components/ReportKPICard";
import ReportTable from "../../components/ReportTable";
import { 
    searchTableData, 
    sortTableData, 
    exportToExcel, 
    printReport,
    getDateRangeText
} from "../../utils/reportUtils";
import "../../styles/reportStyles.css";
import MedicalRecordsApiService from "../../../api/medical-records/medical-records-api-service";

export default function NewRepeatOPRegister() {
    const apiService = useMemo(() => new MedicalRecordsApiService(), []);

    // State
    const today = new Date().toISOString().split('T')[0];
    const [fromDate, setFromDate] = useState<string>(today);
    const [toDate, setToDate] = useState<string>(today);
    const [patientType, setPatientType] = useState<string>("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
    const [filteredData, setFilteredData] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    
    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [modalData, setModalData] = useState<any | null>(null);

    // Filter Handler
    const handleFilterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        setFilteredData([]);

        try {
            const apiData = await apiService.fetchOpReportsBetweenDates(fromDate, toDate);
            const normalized = (Array.isArray(apiData) ? apiData : []).map((item: any, index: number) => {
                const patTypeValue = item?.isNew ? 'new' : 'repeat';
                const fullName = [item?.patientName, item?.secondName].filter(Boolean).join(' ').trim();

                return {
                    slNo: index + 1,
                    opNo: item?.displayNumber || item?.masterTokenNo || '-',
                    patientName: fullName || '-',
                    age: item?.age ?? '-',
                    gender: item?.gender === '1' ? 'Male' : item?.gender === '2' ? 'Female' : (item?.gender ?? '-'),
                    regnDate: item?.date || '-',
                    regnTime: item?.time || '-',
                    department: item?.departmentName || '-',
                    drName: item?.doctorName || '-',
                    billTotal: item?.billTotal ?? 0,
                    billPaid: item?.billPaid ?? 0,
                    billBalance: item?.billBalance ?? 0,
                    accountHead: item?.accountHead || '-',
                    patType: patTypeValue,
                    registeredBy: item?.userName || '-',
                    pincode: item?.pincode ?? '-',
                    village: item?.villageName || '-',
                    gp: item?.gp ?? '-',
                    block: item?.block ?? '-',
                    district: item?.district ?? '-',
                    state: item?.state ?? '-',
                    govId: item?.govId ?? '-',
                    occupation: item?.occupation ?? '-',
                    cardType: item?.cardType ?? '-',
                    religion: item?.religion ?? '-',
                };
            });

            const filtered = (patientType === "all"
                ? normalized
                : normalized.filter((record) => record.patType === patientType))
                .map((record, idx) => ({ ...record, slNo: idx + 1 }));

            setFilteredData(filtered);
        } catch (err) {
            console.error("Failed to fetch OP register data", err);
            setError("Failed to load records. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Reset Handler
    const handleReset = () => {
        setFromDate(today);
        setToDate(today);
        setPatientType("all");
        setFilteredData([]);
        setSearchTerm("");
        setSortConfig(null);
        setError(null);
    };

    // Search Handler
    const handleSearch = (term: string) => {
        setSearchTerm(term);
    };

    // Sort Handler
    const handleSort = (key: string, direction: 'asc' | 'desc') => {
        setSortConfig({ key, direction });
    };

    // Process Data (Search + Sort)
    const processedData = useMemo(() => {
        let data = [...filteredData];

        // 1. Search
        if (searchTerm) {
            data = searchTableData(data, searchTerm, ["opNo", "patientName", "department", "drName"]);
        }

        // 2. Sort
        if (sortConfig) {
            data = sortTableData(data, sortConfig.key, sortConfig.direction);
        }

        return data;
    }, [filteredData, searchTerm, sortConfig]);

    // KPIs
    const totalRecords = processedData.length;
    const newPatients = processedData.filter(d => d.patType === 'new').length;
    const repeatPatients = processedData.filter(d => d.patType === 'repeat').length;

    // Table Columns
    const columns = [
        { key: 'slNo', label: '#', width: '40px' },
        { key: 'opNo', label: 'OP NO', width: '70px' },
        { key: 'patientName', label: 'Patient Name', width: '160px', render: (val: string) => (
            <span style={{ display: 'inline-block', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', verticalAlign: 'bottom' }} title={val}>{val}</span>
        )},
        { key: 'age', label: 'Age', width: '70px' },
        { key: 'regnDate', label: 'Regn. Date & Time', width: '150px', render: (_val: any, record: any) => (
            <span>{record.regnDate} {record.regnTime}</span>
        )},
        { key: 'department', label: 'Department', width: '120px' },
        { key: 'drName', label: 'Dr. Name', width: '140px', render: (val: string) => (
            <span style={{ display: 'inline-block', maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', verticalAlign: 'bottom' }} title={val}>{val}</span>
        )},
        { key: 'registeredBy', label: 'User', width: '80px' },
        { key: 'billTotal', label: 'Total', width: '80px', render: (val: number) => `₹${Number(val).toFixed(2)}` },
        { key: 'billPaid', label: 'Paid', width: '80px', render: (val: number) => `₹${Number(val).toFixed(2)}` }
    ];

    const getRowClassName = (record: any) => {
        if (record.patType === 'new') return 'table-success';
        if (record.patType === 'repeat') return 'table-info';
        return '';
    };

    // Actions
    const handlePrint = () => {
        printReport();
    };

    const handleExport = () => {
        exportToExcel(processedData, "NewRepeatOPRegister");
    };

    const handleRowClick = (record: any) => {
        setModalData(record);
        setShowModal(true);
    };

    const handleModalClose = () => {
        setShowModal(false);
        setModalData(null);
    };

    return (
        <div className="report-container">
            <Container fluid>
                {/* Header */}
                <ReportHeader
                    title="New and Repeat OP Register"
                    subtitle={filteredData.length > 0 ? getDateRangeText(fromDate, toDate) : "Select filters and click Submit"}
                    onPrint={handlePrint}
                    onExport={handleExport}
                    onSearch={handleSearch}
                    showSearch={filteredData.length > 0}
                    showSort={false}
                    showPrint={filteredData.length > 0}
                    showExport={filteredData.length > 0}
                />

                {error && (
                    <Alert variant="danger" className="mt-3">
                        {error}
                    </Alert>
                )}

                {/* Filter Section */}
                <Card className="report-card mb-4 no-print">
                    <Card.Body className="py-3">
                        <Form onSubmit={handleFilterSubmit}>
                            <Row className="align-items-end">
                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label className="small text-muted mb-1">From Date</Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={fromDate}
                                            onChange={(e) => setFromDate(e.target.value)}
                                            className="form-control-sm"
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label className="small text-muted mb-1">To Date</Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={toDate}
                                            onChange={(e) => setToDate(e.target.value)}
                                            className="form-control-sm"
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label className="small text-muted mb-1">Patient Type</Form.Label>
                                        <Form.Select
                                            value={patientType}
                                            onChange={(e) => setPatientType(e.target.value)}
                                            className="form-control-sm"
                                        >
                                            <option value="all">All</option>
                                            <option value="new">New</option>
                                            <option value="repeat">Repeat</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <div className="d-flex gap-2">
                                        <Button 
                                            type="submit" 
                                            variant="primary" 
                                            size="sm" 
                                            className="w-50 mt-3"
                                        >
                                            Submit
                                        </Button>
                                        <Button 
                                            type="button" 
                                            variant="secondary" 
                                            size="sm" 
                                            className="w-50 mt-3"
                                            onClick={handleReset}
                                        >
                                            Reset
                                        </Button>
                                    </div>
                                </Col>
                            </Row>
                        </Form>
                    </Card.Body>
                </Card>

                {/* KPI Section */}
                {filteredData.length > 0 && (
                    <Row className="mb-4">
                        <Col md={4}>
                            <ReportKPICard
                                label="Total Records"
                                value={totalRecords}
                                icon="fas fa-users"
                                variant="primary"
                            />
                        </Col>
                        <Col md={4}>
                            <ReportKPICard
                                label="New Patients"
                                value={newPatients}
                                icon="fas fa-user-plus"
                                variant="success"
                            />
                        </Col>
                        <Col md={4}>
                            <ReportKPICard
                                label="Repeat Patients"
                                value={repeatPatients}
                                icon="fas fa-user-clock"
                                variant="info"
                            />
                        </Col>
                    </Row>
                )}

                {/* Data Table */}
                {loading ? (
                    <div className="text-center py-5 text-muted">
                        <Spinner animation="border" role="status" />
                        <div className="mt-3">Loading register data...</div>
                    </div>
                ) : filteredData.length > 0 ? (
                    <Card className="report-card">
                        <Card.Header className="report-card-header d-flex justify-content-between align-items-center">
                            <h6 className="mb-0">Register Details</h6>
                            <div className="text-muted small">
                                Showing {processedData.length} records
                            </div>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <ReportTable
                                data={processedData}
                                columns={columns}
                                onSort={handleSort}
                                onRowClick={handleRowClick}
                                rowClassName={getRowClassName}
                            />
                        </Card.Body>
                    </Card>
                ) : (
                    <div className="text-center py-5 text-muted">
                        <i className="fas fa-search fa-3x mb-3 opacity-50"></i>
                        <h5>No Data Available</h5>
                        <p>Please select filters and click Submit to view the register.</p>
                    </div>
                )}
            </Container>

            {/* Patient Details Modal */}
            <Modal show={showModal} onHide={handleModalClose} size="lg" centered>
                <Modal.Header closeButton className="bg-light">
                    <Modal.Title className="h5">Patient Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {modalData ? (
                        <div className="p-2" style={{ fontSize: 'var(--font-size-sm)', color: '#000' }}>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <label className="d-block" style={{ fontSize: 'var(--font-size-xs)', color: '#555' }}>OP Number</label>
                                    <span style={{ fontWeight: 'var(--font-weight-bold)' }}>{modalData.opNo}</span>
                                </Col>
                                <Col md={6}>
                                    <label className="d-block" style={{ fontSize: 'var(--font-size-xs)', color: '#555' }}>Patient Name</label>
                                    <span style={{ fontWeight: 'var(--font-weight-bold)' }}>{modalData.patientName}</span>
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col md={3}>
                                    <label className="d-block" style={{ fontSize: 'var(--font-size-xs)', color: '#555' }}>Age</label>
                                    <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>{modalData.age}</span>
                                </Col>
                                <Col md={3}>
                                    <label className="d-block" style={{ fontSize: 'var(--font-size-xs)', color: '#555' }}>Gender</label>
                                    <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>{modalData.gender}</span>
                                </Col>
                                <Col md={3}>
                                    <label className="d-block" style={{ fontSize: 'var(--font-size-xs)', color: '#555' }}>Regn. Date</label>
                                    <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>{modalData.regnDate}</span>
                                </Col>
                                <Col md={3}>
                                    <label className="d-block" style={{ fontSize: 'var(--font-size-xs)', color: '#555' }}>Regn. Time</label>
                                    <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>{modalData.regnTime}</span>
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <label className="d-block" style={{ fontSize: 'var(--font-size-xs)', color: '#555' }}>Department</label>
                                    <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>{modalData.department}</span>
                                </Col>
                                <Col md={6}>
                                    <label className="d-block" style={{ fontSize: 'var(--font-size-xs)', color: '#555' }}>Consultant</label>
                                    <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>{modalData.drName}</span>
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <label className="d-block" style={{ fontSize: 'var(--font-size-xs)', color: '#555' }}>Patient Type</label>
                                    <Badge bg={modalData.patType === 'new' ? 'success' : 'info'}>
                                        {modalData.patType.toUpperCase()}
                                    </Badge>
                                </Col>
                                <Col md={6}>
                                    <label className="d-block" style={{ fontSize: 'var(--font-size-xs)', color: '#555' }}>User</label>
                                    <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>{modalData.registeredBy}</span>
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col md={12}>
                                    <label className="d-block" style={{ fontSize: 'var(--font-size-xs)', color: '#555' }}>Account Head</label>
                                    <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>{modalData.accountHead}</span>
                                </Col>
                            </Row>

                            <hr className="my-3" />
                            <h6 style={{ color: 'var(--page-primary-color)', fontWeight: 'var(--font-weight-bold)' }} className="mb-3">Bill Summary</h6>
                            <Row className="mb-3">
                                <Col md={4}>
                                    <label className="d-block" style={{ fontSize: 'var(--font-size-xs)', color: '#555' }}>Bill Total</label>
                                    <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>₹{Number(modalData.billTotal).toFixed(2)}</span>
                                </Col>
                                <Col md={4}>
                                    <label className="d-block" style={{ fontSize: 'var(--font-size-xs)', color: '#555' }}>Paid</label>
                                    <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>₹{Number(modalData.billPaid).toFixed(2)}</span>
                                </Col>
                                <Col md={4}>
                                    <label className="d-block" style={{ fontSize: 'var(--font-size-xs)', color: '#555' }}>Balance</label>
                                    <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>₹{Number(modalData.billBalance).toFixed(2)}</span>
                                </Col>
                            </Row>

                            <hr className="my-3" />
                            <h6 style={{ color: 'var(--page-primary-color)', fontWeight: 'var(--font-weight-bold)' }} className="mb-3">Address Details</h6>
                            <Row className="mb-3">
                                <Col md={4}>
                                    <label className="d-block" style={{ fontSize: 'var(--font-size-xs)', color: '#555' }}>Pincode</label>
                                    <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>{modalData.pincode || 'N/A'}</span>
                                </Col>
                                <Col md={4}>
                                    <label className="d-block" style={{ fontSize: 'var(--font-size-xs)', color: '#555' }}>Village</label>
                                    <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>{modalData.village || 'N/A'}</span>
                                </Col>
                                <Col md={4}>
                                    <label className="d-block" style={{ fontSize: 'var(--font-size-xs)', color: '#555' }}>G.P</label>
                                    <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>{modalData.gp || 'N/A'}</span>
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col md={4}>
                                    <label className="d-block" style={{ fontSize: 'var(--font-size-xs)', color: '#555' }}>Block</label>
                                    <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>{modalData.block || 'N/A'}</span>
                                </Col>
                                <Col md={4}>
                                    <label className="d-block" style={{ fontSize: 'var(--font-size-xs)', color: '#555' }}>District</label>
                                    <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>{modalData.district || 'N/A'}</span>
                                </Col>
                                <Col md={4}>
                                    <label className="d-block" style={{ fontSize: 'var(--font-size-xs)', color: '#555' }}>State</label>
                                    <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>{modalData.state || 'N/A'}</span>
                                </Col>
                            </Row>

                            <hr className="my-3" />
                            <h6 style={{ color: 'var(--page-primary-color)', fontWeight: 'var(--font-weight-bold)' }} className="mb-3">Additional Information</h6>
                            <Row className="mb-3">
                                <Col md={4}>
                                    <label className="d-block" style={{ fontSize: 'var(--font-size-xs)', color: '#555' }}>Gov ID</label>
                                    <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>{modalData.govId || 'N/A'}</span>
                                </Col>
                                <Col md={4}>
                                    <label className="d-block" style={{ fontSize: 'var(--font-size-xs)', color: '#555' }}>Occupation</label>
                                    <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>{modalData.occupation || 'N/A'}</span>
                                </Col>
                                <Col md={4}>
                                    <label className="d-block" style={{ fontSize: 'var(--font-size-xs)', color: '#555' }}>Card Type</label>
                                    <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>{modalData.cardType || 'N/A'}</span>
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col md={4}>
                                    <label className="d-block" style={{ fontSize: 'var(--font-size-xs)', color: '#555' }}>Religion</label>
                                    <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>{modalData.religion || 'N/A'}</span>
                                </Col>
                            </Row>
                        </div>
                    ) : (
                        <div className="text-center py-4 text-muted">No data available</div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleModalClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
