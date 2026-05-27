import React, { useState, useRef, useEffect, useMemo } from "react";
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
import { MedicalRecordsApiService, RefileOpReportBetweenDatesApiItem } from "../../../api/medical-records/medical-records-api-service";
import { showErrorToast } from "../../../utils/alertUtil";
import "../../styles/reportStyles.css";

export default function RefiledRecords() {
    // API Service
    const medicalRecordsApiService = useMemo(() => new MedicalRecordsApiService(), []);

    // Refs
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Click outside search collapse
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
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

    // Filter form state
    const today = new Date().toISOString().split("T")[0];
    const [fromDate, setFromDate] = useState<string>(today);
    const [toDate, setToDate] = useState<string>(today);

    // Data state
    const [filteredByDate, setFilteredByDate] = useState<any[]>([]);
    const [displayedData, setDisplayedData] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    // Search and sort state
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [sortKey, setSortKey] = useState<string>("");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

    // Statistics
    const [stats, setStats] = useState({
        totalRecords: 0,
        uniqueUsers: 0
    });

    // Update displayed data when search or sort changes
    useEffect(() => {
        updateDisplayedData(filteredByDate, searchTerm, sortKey, sortDirection);
    }, [searchTerm, sortKey, sortDirection, filteredByDate]);

    // Calculate statistics
    const calculateStats = (records: any[]) => {
        const uniqueUsers = new Set(records.map(r => r.refiledUser)).size;

        setStats({
            totalRecords: records.length,
            uniqueUsers: uniqueUsers
        });
    };

    // Update displayed data with search and sort
    const updateDisplayedData = (records: any[], search: string, sortK: string, sortDir: "asc" | "desc") => {
        let result = records;

        // Apply search
        if (search) {
            result = searchTableData(result, search, ["patientName", "opNo", "refiledUser", "refiledDate"]);
        }

        // Apply sort
        if (sortK) {
            result = sortTableData(result, sortK, sortDir);
        }

        setDisplayedData(result);
    };

    // Handle filter form submission
    const handleFilterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!fromDate || !toDate || fromDate > toDate) {
            showErrorToast("Please select a valid date range.", "Validation");
            return;
        }
        
        setLoading(true);
        try {
            const data = await medicalRecordsApiService.fetchRefileOpReportsBetweenDates(
                fromDate,
                toDate
            );

            if (!data || data.length === 0) {
                setFilteredByDate([]);
                setDisplayedData([]);
                setStats({ totalRecords: 0, uniqueUsers: 0 });
                setLoading(false);
                return;
            }
            
            // Transform API data to match component's expected format
            const transformedData = data.map((record: RefileOpReportBetweenDatesApiItem) => {
                return {
                    patientName: record.patientName,
                    opNo: record.opNO,
                    refiledDate: record.refileDate,
                    refiledUser: record.refileUser,
                    refiledTime: record.refileTime,
                    visitDate: record.visitDate,
                    visitId: record.visitId,
                    doctorName: record.doctorName,
                    visitTime: record.visitTime
                };
            });

            calculateStats(transformedData);
            setFilteredByDate(transformedData);
            updateDisplayedData(transformedData, searchTerm, sortKey, sortDirection);
        } catch (error: any) {
            showErrorToast(
                `Failed to fetch refiled records. ${error?.response?.data?.message || error?.message || 'Please try again.'}`, 
                "Error"
            );
            setFilteredByDate([]);
            setDisplayedData([]);
            setStats({
                totalRecords: 0,
                uniqueUsers: 0
            });
        } finally {
            setLoading(false);
        }
    };

    // Handle reset button
    const handleReset = () => {
        setFromDate(today);
        setToDate(today);
        setFilteredByDate([]);
        setDisplayedData([]);
        setSearchTerm("");
        setSortKey("");
        setSortDirection("asc");
        setStats({
            totalRecords: 0,
            uniqueUsers: 0
        });
    };

    // Handle search
    const handleSearch = (term: string) => {
        setSearchTerm(term);
    };

    // Handle sort
    const handleSort = (key: string) => {
        if (sortKey === key) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortKey(key);
            setSortDirection("asc");
        }
    };

    // Handle print
    const handlePrint = () => {
        printReport();
    };

    // Handle export
    const handleExport = () => {
        const exportData = displayedData.map((record, index) => ({
            "Sl. No": index + 1,
            "Patient Name": record.patientName,
            "OP No": record.opNo,
            "Refiled Date": record.refiledDate,
            "Refiled User": record.refiledUser,
            "Refiled Time": record.refiledTime,
            "Visit Date": record.visitDate,
            "Doctor Name": record.doctorName,
            "Visit Time": record.visitTime
        }));

        exportToExcel(
            exportData,
            `Refiled_Records_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
            "Refiled Records"
        );
    };

    // Table columns configuration
    const columns = [
        { key: "slNo", label: "Sl. No", sortable: false, render: (_: any, __: any, idx: number) => idx + 1 },
        { key: "patientName", label: "Patient Name", sortable: true },
        { key: "opNo", label: "OP No", sortable: true },
        { key: "refiledDate", label: "Refiled Date", sortable: true },
        { key: "refiledUser", label: "Refiled User", sortable: true },
        { key: "refiledTime", label: "Refiled Time", sortable: true },
        { key: "visitDate", label: "Visit Date", sortable: true },
        { key: "doctorName", label: "Doctor Name", sortable: true },
        { key: "visitTime", label: "Visit Time", sortable: true }
    ];

    return (
        <React.Fragment>
            <Container fluid className="px-4 py-3">
                {/* Report Header */}
                <ReportHeader
                    title="Refiled Records Register"
                    subtitle={filteredByDate.length > 0 ? getDateRangeText(fromDate, toDate) : "Select date range and click Submit"}
                    onPrint={handlePrint}
                    onExport={handleExport}
                    onSearch={handleSearch}
                    showSearch={filteredByDate.length > 0}
                    showSort={false}
                    showPrint={filteredByDate.length > 0}
                    showExport={filteredByDate.length > 0}
                />
                
                {/* Filter Form Section */}
                <Card className="mb-4 shadow-sm no-print">
                    <Card.Body>
                        <Form className="row g-3 align-items-end" onSubmit={handleFilterSubmit}>
                            <Form.Group as={Col} md={4} controlId="fromDate">
                                <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>From Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={fromDate}
                                    onChange={e => setFromDate(e.target.value)}
                                    max={today}
                                    required
                                />
                            </Form.Group>
                            <Form.Group as={Col} md={4} controlId="toDate">
                                <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>To Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={toDate}
                                    onChange={e => setToDate(e.target.value)}
                                    max={today}
                                    required
                                />
                            </Form.Group>
                            <Form.Group as={Col} md={4} className="d-flex align-items-end gap-2">
                                <Button type="submit" variant="primary" className="w-50" disabled={loading}>
                                    {loading ? "Loading..." : "Submit"}
                                </Button>
                                <Button type="button" variant="secondary" className="w-50" onClick={handleReset} disabled={loading}>
                                    Reset
                                </Button>
                            </Form.Group>
                        </Form>
                    </Card.Body>
                </Card>

                {/* KPI Statistics Section */}
                {filteredByDate.length > 0 && (
                    <Row className="mb-4">
                        <Col md={3}>
                            <ReportKPICard
                                label="Total Refiled Records"
                                value={stats.totalRecords}
                                variant="primary"
                            />
                        </Col>
                        <Col md={3}>
                            <ReportKPICard
                                label="Unique Users"
                                value={stats.uniqueUsers}
                                variant="info"
                            />
                        </Col>
                    </Row>
                )}

                {/* Data Table Section */}
                <Card className="report-card" style={{ padding: "0.75rem" }}>
                    <div 
                        style={{ 
                            maxHeight: "calc(115vh - 500px)", 
                            minHeight: "350px",
                            overflowY: "auto",
                            overflowX: "auto",
                            position: "relative"
                        }}
                    >
                        <ReportTable
                            data={displayedData}
                            columns={columns}
                            onSort={handleSort}
                            responsive={false}
                            emptyMessage={
                                filteredByDate.length === 0
                                    ? "No data loaded. Please select date range and click Submit."
                                    : searchTerm
                                        ? "No records match your search criteria."
                                        : "No records found."
                            }
                        />
                    </div>

                    <div 
                        style={{ 
                            padding: "0.5rem 1rem", 
                            borderTop: "2px solid #e0e0e0",
                            background: "linear-gradient(to right, #f8f9fa, #ffffff)",
                            textAlign: "start"
                        }}
                    >
                        <small className="text-muted" style={{ fontWeight: "var(--font-weight-medium)" }}>
                            Total Data Rows: <strong>{displayedData.length}</strong>
                            {searchTerm && (
                                <span className="ms-2">
                                    (Filtered from {filteredByDate.length})
                                </span>
                            )}
                        </small>
                    </div>
                </Card>
            </Container>
        </React.Fragment>
    );
}
