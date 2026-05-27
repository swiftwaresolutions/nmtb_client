import React, { useState, useEffect } from "react";
import { Container, Card, Form, Button, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import ReportHeader from "../../../medical-records/components/ReportHeader";
import ReportKPICard from "../../../medical-records/components/ReportKPICard";
import ReportTable from "../../../medical-records/components/ReportTable";
import {
    searchTableData,
    sortTableData,
    exportToExcel,
    printReport,
    formatReportDate,
    getDateRangeText
} from "../../../medical-records/utils/reportUtils";
import "../../../medical-records/styles/reportStyles.css";

export default function GoodsReturnRegister() {
    // Navigation
    const navigate = useNavigate();

    // Sample data - 15 records to match GoodsReceiptsRegister
    const [tableData] = useState([
        {
            slNo: 1,
            returnNo: "GR001",
            supplierName: "INTER PHARMA",
            returnDate: "05/01/2026",
            returnAmount: 500.00,
            status: "Completed",
            user: "ANIS"
        },
        {
            slNo: 2,
            returnNo: "GR002",
            supplierName: "IMAGING SOLUTIONS LTD",
            returnDate: "10/01/2026",
            returnAmount: 2500.00,
            status: "Completed",
            user: "ADMIN"
        },
        {
            slNo: 3,
            returnNo: "GR003",
            supplierName: "DIAGNOSTIC SUPPLIES CO",
            returnDate: "12/01/2026",
            returnAmount: 1200.00,
            status: "Completed",
            user: "ADMIN"
        },
        {
            slNo: 4,
            returnNo: "GR004",
            supplierName: "RADIOLOGY EQUIPMENT INC",
            returnDate: "15/01/2026",
            returnAmount: 3500.00,
            status: "Pending",
            user: "ANIS"
        },
        {
            slNo: 5,
            returnNo: "GR005",
            supplierName: "MEDICAL IMAGING SUPPLIES",
            returnDate: "18/01/2026",
            returnAmount: 15000.00,
            status: "Completed",
            user: "ADMIN"
        },
        {
            slNo: 6,
            returnNo: "GR006",
            supplierName: "MEDICO PHARMACEUTICALS",
            returnDate: "20/01/2026",
            returnAmount: 800.00,
            status: "Completed",
            user: "ANIS"
        },
        {
            slNo: 7,
            returnNo: "GR007",
            supplierName: "INTER PHARMA",
            returnDate: "21/01/2026",
            returnAmount: 1500.00,
            status: "Pending",
            user: "ADMIN"
        },
        {
            slNo: 8,
            returnNo: "GR008",
            supplierName: "IMAGING SOLUTIONS LTD",
            returnDate: "22/01/2026",
            returnAmount: 4200.00,
            status: "In Progress",
            user: "ANIS"
        },
        {
            slNo: 9,
            returnNo: "GR009",
            supplierName: "DIAGNOSTIC SUPPLIES CO",
            returnDate: "22/01/2026",
            returnAmount: 950.00,
            status: "Completed",
            user: "ADMIN"
        },
        {
            slNo: 10,
            returnNo: "GR010",
            supplierName: "RADIOLOGY EQUIPMENT INC",
            returnDate: "23/01/2026",
            returnAmount: 6800.00,
            status: "Pending",
            user: "ANIS"
        },
        {
            slNo: 11,
            returnNo: "GR011",
            supplierName: "MEDICAL IMAGING SUPPLIES",
            returnDate: "23/01/2026",
            returnAmount: 2100.00,
            status: "In Progress",
            user: "ADMIN"
        },
        {
            slNo: 12,
            returnNo: "GR012",
            supplierName: "MEDICO PHARMACEUTICALS",
            returnDate: "23/01/2026",
            returnAmount: 750.00,
            status: "Completed",
            user: "ANIS"
        },
        {
            slNo: 13,
            returnNo: "GR013",
            supplierName: "INTER PHARMA",
            returnDate: "23/01/2026",
            returnAmount: 3200.00,
            status: "In Progress",
            user: "ADMIN"
        },
        {
            slNo: 14,
            returnNo: "GR014",
            supplierName: "IMAGING SOLUTIONS LTD",
            returnDate: "23/01/2026",
            returnAmount: 8500.00,
            status: "Pending",
            user: "ANIS"
        },
        {
            slNo: 15,
            returnNo: "GR015",
            supplierName: "DIAGNOSTIC SUPPLIES CO",
            returnDate: "23/01/2026",
            returnAmount: 1850.00,
            status: "Completed",
            user: "ADMIN"
        }
    ]);

    // Filter form state
    const [fromDate, setFromDate] = useState<string>("2026-01-01");
    const [toDate, setToDate] = useState<string>("2026-01-23");
    const [selectedSupplier, setSelectedSupplier] = useState<string>("");

    // Data state - Two-stage data flow
    const [filteredByDate, setFilteredByDate] = useState<any[]>([]);
    const [displayedData, setDisplayedData] = useState<any[]>([]);

    // Search and sort state
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [sortKey, setSortKey] = useState<string>("");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

    // Statistics state
    const [stats, setStats] = useState({
        totalReturnAmount: 0,
        totalReturns: 0,
        avgReturnValue: 0,
        todayReturns: 0,
        maxReturn: 0
    });

    // Calculate statistics
    const calculateStats = (records: any[]) => {
        const totalReturnAmount = records.reduce((sum, r) => sum + (r.returnAmount || 0), 0);
        const totalReturns = records.length;
        const avgReturnValue = totalReturns > 0 ? totalReturnAmount / totalReturns : 0;
        
        // Calculate today's returns (23/01/2026)
        const todayReturns = records.filter(r => r.returnDate === "23/01/2026").length;
        
        // Find max return
        const maxReturn = records.length > 0 
            ? Math.max(...records.map(r => r.returnAmount || 0)) 
            : 0;

        setStats({
            totalReturnAmount,
            totalReturns,
            avgReturnValue,
            todayReturns,
            maxReturn
        });
    };

    // Update displayed data based on search and sort
    const updateDisplayedData = (records: any[], search: string, sortK: string, sortDir: "asc" | "desc") => {
        let result = records;

        // Apply search
        if (search) {
            result = searchTableData(result, search, ["returnNo", "supplierName", "status"]);
        }

        // Apply sort
        if (sortK) {
            result = sortTableData(result, sortK, sortDir);
        }

        setDisplayedData(result);
    };

    // Extract unique suppliers from tableData
    const uniqueSuppliers = Array.from(new Set(tableData.map(item => item.supplierName))).sort();

    // Initialize data on mount
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

    // Handle filter form submission
    const handleFilterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Filter by supplier if selected
        let filtered = tableData;
        if (selectedSupplier) {
            filtered = filtered.filter(record => record.supplierName === selectedSupplier);
        }
        
        calculateStats(filtered);
        setFilteredByDate(filtered);
        updateDisplayedData(filtered, searchTerm, sortKey, sortDirection);
    };

    // Handle reset button
    const handleReset = () => {
        setFromDate("2026-01-01");
        setToDate("2026-01-23");
        setSelectedSupplier("");
        setFilteredByDate([]);
        setDisplayedData([]);
        setSearchTerm("");
        setSortKey("");
        setSortDirection("asc");
        setStats({
            totalReturnAmount: 0,
            totalReturns: 0,
            avgReturnValue: 0,
            todayReturns: 0,
            maxReturn: 0
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

    // Handle row click to navigate to details
    const handleRowClick = (record: any) => {
        navigate(`/hims/radiology/return-details/${record.returnNo}`, {
            state: { returnData: record }
        });
    };

    // Handle export
    const handleExport = () => {
        const exportData = displayedData.map((record, index) => {
            return {
                "S.No": index + 1,
                "Return No": record.returnNo,
                "Supplier Name": record.supplierName,
                "Return Date": record.returnDate,
                "Return Amount": record.returnAmount,
                "Status": record.status,
                "User": record.user
            };
        });

        exportToExcel(
            exportData,
            `Goods_Return_Register_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
            "Goods Return Register"
        );
    };

    // Table columns configuration
    const columns = [
        { key: "slNo", label: "S.No", sortable: false, render: (_: any, __: any, idx: number) => idx + 1 },
        { key: "returnNo", label: "Return No", sortable: true },
        { key: "supplierName", label: "Supplier Name", sortable: true },
        { key: "returnDate", label: "Return Date", sortable: true },
        { 
            key: "returnAmount", 
            label: "Return Amount", 
            sortable: true,
            render: (record: any) => {
                if (!record) return "";
                return `₹${(record.returnAmount || 0).toFixed(2)}`;
            }
        },
        { key: "status", label: "Status", sortable: true },
        { key: "user", label: "User", sortable: false }
    ];

    return (
        <React.Fragment>
            <Container fluid className="px-4 py-3">
                {/* Report Header */}
                <ReportHeader
                    title="Goods Return Register"
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
                            <Form.Group as={Col} md={3} controlId="fromDate">
                                <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>From Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={fromDate}
                                    onChange={e => setFromDate(e.target.value)}
                                    required
                                />
                            </Form.Group>
                            <Form.Group as={Col} md={3} controlId="toDate">
                                <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>To Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={toDate}
                                    onChange={e => setToDate(e.target.value)}
                                    required
                                />
                            </Form.Group>
                            <Form.Group as={Col} md={3} controlId="supplierFilter">
                                <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>Supplier</Form.Label>
                                <Form.Select
                                    value={selectedSupplier}
                                    onChange={e => setSelectedSupplier(e.target.value)}
                                >
                                    <option value="">All Suppliers</option>
                                    {uniqueSuppliers.map((supplier, idx) => (
                                        <option key={idx} value={supplier}>{supplier}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                            <Form.Group as={Col} md={3} className="d-flex align-items-end gap-2">
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
                        <Col md={2}>
                            <ReportKPICard
                                label="Total Amount"
                                value={`₹${stats.totalReturnAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                variant="primary"
                            />
                        </Col>
                        <Col md={2}>
                            <ReportKPICard
                                label="Total Returns"
                                value={stats.totalReturns}
                                variant="info"
                            />
                        </Col>
                        <Col md={3}>
                            <ReportKPICard
                                label="Avg Return Value"
                                value={`₹${stats.avgReturnValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                variant="warning"
                            />
                        </Col>
                        <Col md={2}>
                            <ReportKPICard
                                label="Today's Returns"
                                value={stats.todayReturns}
                                variant="danger"
                            />
                        </Col>
                        <Col md={3}>
                            <ReportKPICard
                                label="Max Return"
                                value={`₹${stats.maxReturn.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                variant="success"
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
                            onRowClick={handleRowClick}
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
                        <small className="text-muted" style={{ fontWeight: "500" }}>
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
