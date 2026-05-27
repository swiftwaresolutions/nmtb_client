import React, { useState, useRef, useEffect } from "react";
import { Container, Card, Form, Button, Row, Col } from "react-bootstrap";
import ReportHeader from "../../components/ReportHeader";
import ReportKPICard from "../../components/ReportKPICard";
import ReportTable from "../../components/ReportTable";
import { 
    searchTableData, 
    sortTableData, 
    exportToExcel, 
    printReport,
    formatReportDate,
    getDateRangeText
} from "../../utils/reportUtils";
import "../../styles/reportStyles.css";

export default function DoctorTransferRegister() {
    // Refs
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Click outside search collapse
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
        if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
            // Collapse search if it's expanded
            const searchInput = document.getElementById('headerSearchInput');
            if (searchInput && searchInput.classList.contains('active')) {
            searchInput.classList.remove('active');
            }
        }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // State
    const [fromDate, setFromDate] = useState(new Date().toISOString().split('T')[0]);
    const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
    const [filteredByDate, setFilteredByDate] = useState<any[]>([]);

    // Dummy Data
    const [tableData] = useState([
        {
            slNo: 1,
            ipNo: "1917/2526",
            patientName: "Anirudhan N",
            fromDoctor: "Dr. Smith",
            toDoctor: "Dr. Jones",
            transferDate: "01-12-2025",
            reason: "Specialist Consultation",
            user: "admin"
        },
        {
            slNo: 2,
            ipNo: "1918/2526",
            patientName: "B/O Saranya",
            fromDoctor: "Dr. Doe",
            toDoctor: "Dr. Brown",
            transferDate: "02-12-2025",
            reason: "Patient Request",
            user: "nurse1"
        }
    ]);

    // Filter data when dates change or submit is clicked
    const handleDateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, this would fetch data from API
        // For now, we just show the dummy data
        setFilteredByDate(tableData);
    };

    const handleReset = () => {
        setFromDate(new Date().toISOString().split('T')[0]);
        setToDate(new Date().toISOString().split('T')[0]);
        setFilteredByDate([]);
        setSearchTerm("");
    };

    // Handle Search
    const handleSearch = (term: string) => {
        setSearchTerm(term);
    };

    // Handle Sort
    const handleSort = (key: string, direction: 'asc' | 'desc') => {
        setSortConfig({ key, direction });
    };

    // Process data (search + sort)
    const processedData = React.useMemo(() => {
        let data = [...filteredByDate];

        // 1. Search
        if (searchTerm) {
            data = searchTableData(data, searchTerm, ['ipNo', 'patientName', 'fromDoctor', 'toDoctor', 'reason', 'user']);
        }

        // 2. Sort
        if (sortConfig) {
            data = sortTableData(data, sortConfig.key, sortConfig.direction);
        }

        return data;
    }, [filteredByDate, searchTerm, sortConfig]);

    // Calculate KPIs
    const totalTransfers = processedData.length;
    const uniquePatients = new Set(processedData.map(item => item.ipNo)).size;

    // Table Columns
    const columns = [
        { key: 'slNo', label: 'Sl No' },
        { key: 'ipNo', label: 'IP No' },
        { key: 'patientName', label: 'Patient Name' },
        { key: 'fromDoctor', label: 'From Doctor' },
        { key: 'toDoctor', label: 'To Doctor' },
        { key: 'transferDate', label: 'Transfer Date' },
        { key: 'reason', label: 'Reason' },
        { key: 'user', label: 'User' }
    ];

    const handlePrint = () => {
        printReport();
    };

    const handleExport = () => {
        exportToExcel(processedData, "DoctorTransferRegister");
    };

    return (
        <div className="report-container">
            <Container fluid>
                {/* Header */}
                <ReportHeader
                    title="Doctor Transfer Register"
                    subtitle={filteredByDate.length > 0 ? getDateRangeText(fromDate, toDate) : "Select date range and click Submit"}
                    onPrint={handlePrint}
                    onExport={handleExport}
                    onSearch={handleSearch}
                    showSearch={filteredByDate.length > 0}
                    showSort={false}
                    showPrint={filteredByDate.length > 0}
                    showExport={filteredByDate.length > 0}
                />

                {/* Date Filter Section */}
                <Card className="report-card mb-4 no-print">
                    <Card.Body className="py-3">
                        <Form onSubmit={handleDateSubmit}>
                            <Row className="align-items-end">
                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label className="small text-muted mb-1">From Date</Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={fromDate}
                                            onChange={(e) => setFromDate(e.target.value)}
                                            className="form-control-sm"
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
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={2}>
                                    <Button 
                                        type="submit" 
                                        variant="primary" 
                                        size="sm" 
                                        className="w-100 mt-3"
                                    >
                                        Submit
                                    </Button>
                                </Col>
                                <Col md={2}>
                                    <Button 
                                        type="button" 
                                        variant="secondary" 
                                        size="sm" 
                                        className="w-100 mt-3"
                                        onClick={handleReset}
                                    >
                                        Reset
                                    </Button>
                                </Col>
                            </Row>
                        </Form>
                    </Card.Body>
                </Card>

                {/* KPI Statistics Section */}
                {filteredByDate.length > 0 && (
                    <Row className="mb-4">
                        <Col md={3}>
                            <ReportKPICard
                                label="Total Transfers"
                                value={totalTransfers}
                                icon="fas fa-exchange-alt"
                                variant="primary"
                            />
                        </Col>
                        <Col md={3}>
                            <ReportKPICard
                                label="Unique Patients"
                                value={uniquePatients}
                                icon="fas fa-user-injured"
                                variant="info"
                            />
                        </Col>
                    </Row>
                )}

                {/* Data Table */}
                {filteredByDate.length > 0 ? (
                    <Card className="report-card">
                        <Card.Header className="report-card-header d-flex justify-content-between align-items-center">
                            <h6 className="mb-0">Transfer Details</h6>
                            <div className="text-muted small">
                                Showing {processedData.length} records
                            </div>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <ReportTable
                                data={processedData}
                                columns={columns}
                                onSort={handleSort}
                            />
                        </Card.Body>
                    </Card>
                ) : (
                    <div className="text-center py-5 text-muted">
                        <i className="fas fa-search fa-3x mb-3 opacity-50"></i>
                        <h5>No Data Available</h5>
                        <p>Please select a date range and click Submit to view the register.</p>
                    </div>
                )}
            </Container>
        </div>
    );
}
