import React, { useState, useRef, useEffect, useMemo } from "react";
import { Container, Card, Form, Button, Row, Col, Spinner, Alert } from "react-bootstrap";
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
import MedicalRecordsApiService, { OpReportBetweenDatesApiItem } from "../../../api/medical-records/medical-records-api-service";
import { showErrorToast, showValidationError } from "../../../utils/alertUtil";

export default function RegistrationCollectionRegister() {
    const apiService = useMemo(() => new MedicalRecordsApiService(), []);

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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const normalizeApiData = (data: OpReportBetweenDatesApiItem[]) => {
        return (Array.isArray(data) ? data : []).map((item, index) => ({
            slNo: index + 1,
            patientName: item?.patName || "-",
            opNo: item?.opNo || "-",
            amount: Number(item?.total ?? 0),
            discount: Number(item?.disc ?? 0),
            payable: Number(item?.pay ?? 0),
            paid: Number(item?.paid ?? 0),
            balance: Number(item?.balance ?? 0)
        }));
    };

    // Filter data when dates change or submit is clicked
    const handleDateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!fromDate || !toDate) {
            const message = "Please select both From Date and To Date.";
            setError(message);
            showValidationError(message, "Validation");
            return;
        }

        if (fromDate > toDate) {
            const message = "From Date cannot be later than To Date.";
            setError(message);
            showValidationError(message, "Validation");
            return;
        }

        setError(null);
        setLoading(true);
        setFilteredByDate([]);

        try {
            const apiData = await apiService.fetchOpReportsBetweenDates(fromDate, toDate);
            const normalized = normalizeApiData(apiData);
            setFilteredByDate(normalized);
        } catch (err: any) {
            const message = err?.response?.data?.message || err?.message || "Failed to load records. Please try again.";
            setError(message);
            showErrorToast(message);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFromDate(new Date().toISOString().split('T')[0]);
        setToDate(new Date().toISOString().split('T')[0]);
        setFilteredByDate([]);
        setSearchTerm("");
        setError(null);
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
            data = searchTableData(data, searchTerm, ['patientName', 'opNo']);
        }

        // 2. Sort
        if (sortConfig) {
            data = sortTableData(data, sortConfig.key, sortConfig.direction);
        }

        return data;
    }, [filteredByDate, searchTerm, sortConfig]);

    // Calculate KPIs
    const totalAmount = processedData.reduce((sum, item) => sum + item.amount, 0);
    const totalPaid = processedData.reduce((sum, item) => sum + item.paid, 0);
    const totalBalance = processedData.reduce((sum, item) => sum + item.balance, 0);

    // Table Columns
    const columns = [
        { key: 'slNo', label: 'S. No' },
        { key: 'patientName', label: 'Patient Name' },
        { key: 'opNo', label: 'OPNO' },
        { key: 'amount', label: 'Amount', render: (val: number) => val.toFixed(2) },
        { key: 'discount', label: 'Discount', render: (val: number) => val.toFixed(2) },
        { key: 'payable', label: 'Payable', render: (val: number) => val.toFixed(2) },
        { key: 'paid', label: 'Paid', render: (val: number) => val.toFixed(2) },
        { key: 'balance', label: 'Balance', render: (val: number) => val.toFixed(2) }
    ];

    const handlePrint = () => {
        printReport();
    };

    const handleExport = () => {
        exportToExcel(processedData, "RegistrationCollectionRegister");
    };

    return (
        <div className="report-container">
            <Container fluid>
                {/* Header */}
                <ReportHeader
                    title="Registration Collection"
                    subtitle={filteredByDate.length > 0 ? getDateRangeText(fromDate, toDate) : "Select date range and click Submit"}
                    onPrint={handlePrint}
                    onExport={handleExport}
                    onSearch={handleSearch}
                    showSearch={filteredByDate.length > 0}
                    showSort={false}
                    showPrint={filteredByDate.length > 0}
                    showExport={filteredByDate.length > 0}
                />

                {error && (
                    <Alert variant="danger" className="mt-3">
                        {error}
                    </Alert>
                )}

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
                                            max={new Date().toISOString().split('T')[0]}
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
                                            max={new Date().toISOString().split('T')[0]}
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
                                        disabled={loading}
                                    >
                                        {loading ? "Loading..." : "Submit"}
                                    </Button>
                                </Col>
                                <Col md={2}>
                                    <Button 
                                        type="button" 
                                        variant="secondary" 
                                        size="sm" 
                                        className="w-100 mt-3"
                                        onClick={handleReset}
                                        disabled={loading}
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
                                label="Total Amount"
                                value={totalAmount.toFixed(2)}
                                icon="fas fa-money-bill"
                                variant="primary"
                            />
                        </Col>
                        <Col md={3}>
                            <ReportKPICard
                                label="Total Paid"
                                value={totalPaid.toFixed(2)}
                                icon="fas fa-check-circle"
                                variant="success"
                            />
                        </Col>
                        <Col md={3}>
                            <ReportKPICard
                                label="Total Balance"
                                value={totalBalance.toFixed(2)}
                                icon="fas fa-exclamation-circle"
                                variant="danger"
                            />
                        </Col>
                    </Row>
                )}

                {/* Data Table */}
                {loading ? (
                    <div className="text-center py-5 text-muted">
                        <Spinner animation="border" role="status" />
                        <div className="mt-3">Loading registration collection...</div>
                    </div>
                ) : filteredByDate.length > 0 ? (
                    <Card className="report-card">
                        <Card.Header className="report-card-header d-flex justify-content-between align-items-center">
                            <h6 className="mb-0">Collection Details</h6>
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
