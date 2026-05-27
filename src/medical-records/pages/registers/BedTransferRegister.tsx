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

export default function BedTransferRegister() {
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

    // Sample dummy data - Replace with actual API data
    const [tableData] = useState<any[]>([
        {
            patientName: "Rajesh Kumar",
            opNo: "C32145",
            ipNo: "2501/25",
            admittedWard: "MALE WARD",
            transferredWard: "ICU",
            transferReason: "Critical Condition",
            bedNo: "ICU-05",
            dateIn: "01-01-2025",
            dateOut: "03-01-2025",
            user: "Admin"
        },
        {
            patientName: "Priya Sharma",
            opNo: "C32189",
            ipNo: "2502/25",
            admittedWard: "FEMALE WARD",
            transferredWard: "RECOVERY ROOM",
            transferReason: "Post Surgery",
            bedNo: "RR-02",
            dateIn: "01-01-2025",
            dateOut: "02-01-2025",
            user: "Nurse01"
        },
        {
            patientName: "Mohammed Ali",
            opNo: "B66890",
            ipNo: "2503/25",
            admittedWard: "GENERAL WARD",
            transferredWard: "PRIVATE ROOM",
            transferReason: "Patient Request",
            bedNo: "PVT-12",
            dateIn: "02-01-2025",
            dateOut: "",
            user: "Admin"
        },
        {
            patientName: "Sunita Devi",
            opNo: "C33001",
            ipNo: "2504/25",
            admittedWard: "ICU",
            transferredWard: "GENERAL WARD",
            transferReason: "Condition Improved",
            bedNo: "GW-08",
            dateIn: "01-01-2025",
            dateOut: "02-01-2025",
            user: "Doctor01"
        },
        {
            patientName: "Anil Patel",
            opNo: "C33056",
            ipNo: "2505/25",
            admittedWard: "EMERGENCY",
            transferredWard: "MALE WARD",
            transferReason: "Stabilized",
            bedNo: "MW-15",
            dateIn: "02-01-2025",
            dateOut: "",
            user: "Nurse02"
        }
    ]);

    // Filter form state
    const [fromDate, setFromDate] = useState<string>("2025-01-01");
    const [toDate, setToDate] = useState<string>("2025-01-02");

    // Data state
    const [filteredByDate, setFilteredByDate] = useState<any[]>([]);
    const [displayedData, setDisplayedData] = useState<any[]>([]);

    // Search and sort state
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [sortKey, setSortKey] = useState<string>("");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

    // Statistics
    const [stats, setStats] = useState({
        totalTransfers: 0,
        toICU: 0,
        fromICU: 0,
        pendingTransfers: 0
    });

    // On mount, initialize filtered data
    useEffect(() => {
        const filtered = tableData;
        calculateStats(filtered);
        setFilteredByDate(filtered);
        updateDisplayedData(filtered, searchTerm, sortKey, sortDirection);
    }, [tableData]);

    // Update displayed data when search or sort changes
    useEffect(() => {
        updateDisplayedData(filteredByDate, searchTerm, sortKey, sortDirection);
    }, [searchTerm, sortKey, sortDirection, filteredByDate]);

    // Calculate statistics
    const calculateStats = (records: any[]) => {
        let toICUCount = 0;
        let fromICUCount = 0;
        let pendingCount = 0;

        records.forEach(record => {
            const transferredWard = record.transferredWard?.toUpperCase() || "";
            const admittedWard = record.admittedWard?.toUpperCase() || "";
            
            if (transferredWard.includes("ICU")) {
                toICUCount++;
            }
            if (admittedWard.includes("ICU")) {
                fromICUCount++;
            }
            if (!record.dateOut || record.dateOut === "") {
                pendingCount++;
            }
        });

        setStats({
            totalTransfers: records.length,
            toICU: toICUCount,
            fromICU: fromICUCount,
            pendingTransfers: pendingCount
        });
    };

    // Update displayed data with search and sort
    const updateDisplayedData = (records: any[], search: string, sortK: string, sortDir: "asc" | "desc") => {
        let result = records;

        // Apply search
        if (search) {
            result = searchTableData(result, search, ["patientName", "ipNo", "opNo", "admittedWard", "transferredWard", "transferReason", "bedNo", "user"]);
        }

        // Apply sort
        if (sortK) {
            result = sortTableData(result, sortK, sortDir);
        }

        setDisplayedData(result);
    };

    // Handle filter form submission
    const handleFilterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // TODO: In real implementation, call API with date range
        const filtered = tableData;
        
        calculateStats(filtered);
        setFilteredByDate(filtered);
        updateDisplayedData(filtered, searchTerm, sortKey, sortDirection);
    };

    // Handle reset button
    const handleReset = () => {
        setFromDate("2025-01-01");
        setToDate("2025-01-02");
        setFilteredByDate([]);
        setDisplayedData([]);
        setSearchTerm("");
        setSortKey("");
        setSortDirection("asc");
        setStats({
            totalTransfers: 0,
            toICU: 0,
            fromICU: 0,
            pendingTransfers: 0
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
            "IP No": record.ipNo,
            "Admitted Ward": record.admittedWard,
            "Transferred Ward": record.transferredWard,
            "Transfer Reason": record.transferReason,
            "Bed No": record.bedNo,
            "Date In": record.dateIn,
            "Date Out": record.dateOut,
            "User": record.user
        }));

        exportToExcel(
            exportData,
            `Bed_Transfer_Register_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
            "Bed Transfer Register"
        );
    };

    // Table columns configuration
    const columns = [
        { key: "slNo", label: "Sl. No", sortable: false, render: (_: any, __: any, idx: number) => idx + 1 },
        { key: "patientName", label: "Patient Name", sortable: true },
        { key: "opNo", label: "OP No", sortable: true },
        { key: "ipNo", label: "IP No", sortable: true },
        { key: "admittedWard", label: "Admitted Ward", sortable: true },
        { key: "transferredWard", label: "Transferred Ward", sortable: true },
        { key: "transferReason", label: "Transfer Reason", sortable: true },
        { key: "bedNo", label: "Bed No", sortable: true },
        { key: "dateIn", label: "Date In", sortable: true },
        { key: "dateOut", label: "Date Out", sortable: true },
        { key: "user", label: "User", sortable: false }
    ];

    return (
        <React.Fragment>
            <Container fluid className="px-4 py-3">
                {/* Report Header */}
                <ReportHeader
                    title="Bed Transfer Register"
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
                                    required
                                />
                            </Form.Group>
                            <Form.Group as={Col} md={4} controlId="toDate">
                                <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>To Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={toDate}
                                    onChange={e => setToDate(e.target.value)}
                                    required
                                />
                            </Form.Group>
                            <Form.Group as={Col} md={4} className="d-flex align-items-end gap-2">
                                <Button type="submit" variant="primary" className="w-50">
                                    Submit
                                </Button>
                                <Button type="button" variant="secondary" className="w-50" onClick={handleReset}>
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
                                label="Total Transfers"
                                value={stats.totalTransfers}
                                variant="primary"
                            />
                        </Col>
                        <Col md={3}>
                            <ReportKPICard
                                label="To ICU"
                                value={stats.toICU}
                                variant="danger"
                            />
                        </Col>
                        <Col md={3}>
                            <ReportKPICard
                                label="From ICU"
                                value={stats.fromICU}
                                variant="success"
                            />
                        </Col>
                        <Col md={3}>
                            <ReportKPICard
                                label="Pending Transfers"
                                value={stats.pendingTransfers}
                                variant="warning"
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
