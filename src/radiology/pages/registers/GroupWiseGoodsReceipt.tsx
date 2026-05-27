import React, { useState, useRef, useEffect } from "react";
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

export default function GroupWiseGoodsReceipt() {
    // Navigation
    const navigate = useNavigate();

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

    const [tableData] = useState([
        {
            slNo: 1,
            grnNo: "MS2485",
            poNo: "PO/3360/25",
            groupName: "RADIOLOGY FILMS",
            supplierName: "INTER PHARMA",
            supplierAddress: "NOOPURAM, EVANJELICAL CHURCH",
            invoiceNo: "730014492",
            invoiceDate: "30/12/2025",
            receiptDate: "01/01/2026",
            totalCost: 3321.00,
            totalMRP: 4612.50,
            user: "ANIS"
        },
        {
            slNo: 2,
            grnNo: "MS2486",
            poNo: "PO/3361/25",
            groupName: "CONTRAST MEDIA",
            supplierName: "IMAGING SOLUTIONS LTD",
            supplierAddress: "MEDICAL PARK, SECTOR 5",
            invoiceNo: "730014493",
            invoiceDate: "05/12/2025",
            receiptDate: "07/12/2025",
            totalCost: 85000.00,
            totalMRP: 102000.00,
            user: "ADMIN"
        },
        {
            slNo: 3,
            grnNo: "MS2487",
            poNo: "PO/3362/25",
            groupName: "CHEMICALS",
            supplierName: "DIAGNOSTIC SUPPLIES CO",
            supplierAddress: "INDUSTRIAL AREA, ZONE B",
            invoiceNo: "730014494",
            invoiceDate: "08/12/2025",
            receiptDate: "10/12/2025",
            totalCost: 9000.00,
            totalMRP: 11000.00,
            user: "ADMIN"
        },
        {
            slNo: 4,
            grnNo: "MS2488",
            poNo: "PO/3363/25",
            groupName: "EQUIPMENT",
            supplierName: "RADIOLOGY EQUIPMENT INC",
            supplierAddress: "TECH PLAZA, BUILDING 12",
            invoiceNo: "730014495",
            invoiceDate: "12/12/2025",
            receiptDate: "14/12/2025",
            totalCost: 16000.00,
            totalMRP: 18500.00,
            user: "ANIS"
        },
        {
            slNo: 5,
            grnNo: "MS2489",
            poNo: "PO/3364/25",
            groupName: "RADIOLOGY FILMS",
            supplierName: "MEDICAL IMAGING SUPPLIES",
            supplierAddress: "HEALTHCARE COMPLEX, WING A",
            invoiceNo: "730014496",
            invoiceDate: "15/12/2025",
            receiptDate: "17/12/2025",
            totalCost: 250000.00,
            totalMRP: 280000.00,
            user: "ADMIN"
        },
        {
            slNo: 6,
            grnNo: "MS2490",
            poNo: "PO/3365/25",
            groupName: "CONTRAST MEDIA",
            supplierName: "MEDICO PHARMACEUTICALS",
            supplierAddress: "STATION ROAD, NEAR CLOCK TOWER",
            invoiceNo: "730014497",
            invoiceDate: "18/12/2025",
            receiptDate: "20/12/2025",
            totalCost: 45000.00,
            totalMRP: 52000.00,
            user: "ANIS"
        },
        {
            slNo: 7,
            grnNo: "MS2491",
            poNo: "PO/3366/25",
            groupName: "CHEMICALS",
            supplierName: "IMAGING SOLUTIONS LTD",
            supplierAddress: "MEDICAL PARK, SECTOR 5",
            invoiceNo: "730014498",
            invoiceDate: "22/12/2025",
            receiptDate: "24/12/2025",
            totalCost: 13500.00,
            totalMRP: 16200.00,
            user: "ADMIN"
        },
        {
            slNo: 8,
            grnNo: "MS2492",
            poNo: "PO/3367/25",
            groupName: "EQUIPMENT",
            supplierName: "DIAGNOSTIC SUPPLIES CO",
            supplierAddress: "INDUSTRIAL AREA, ZONE B",
            invoiceNo: "730014499",
            invoiceDate: "26/12/2025",
            receiptDate: "28/12/2025",
            totalCost: 8500.00,
            totalMRP: 10200.00,
            user: "ANIS"
        },
        {
            slNo: 9,
            grnNo: "MS2493",
            poNo: "PO/3368/25",
            groupName: "RADIOLOGY FILMS",
            supplierName: "RADIOLOGY EQUIPMENT INC",
            supplierAddress: "TECH PLAZA, BUILDING 12",
            invoiceNo: "730014500",
            invoiceDate: "29/12/2025",
            receiptDate: "31/12/2025",
            totalCost: 14250.00,
            totalMRP: 17000.00,
            user: "ADMIN"
        },
        {
            slNo: 10,
            grnNo: "MS2494",
            poNo: "PO/3369/25",
            groupName: "CONTRAST MEDIA",
            supplierName: "MEDICAL IMAGING SUPPLIES",
            supplierAddress: "HEALTHCARE COMPLEX, WING A",
            invoiceNo: "730014501",
            invoiceDate: "02/01/2026",
            receiptDate: "04/01/2026",
            totalCost: 22500.00,
            totalMRP: 26000.00,
            user: "ANIS"
        },
        {
            slNo: 11,
            grnNo: "MS2495",
            poNo: "PO/3370/25",
            groupName: "CHEMICALS",
            supplierName: "MEDICO PHARMACEUTICALS",
            supplierAddress: "STATION ROAD, NEAR CLOCK TOWER",
            invoiceNo: "730014502",
            invoiceDate: "05/01/2026",
            receiptDate: "07/01/2026",
            totalCost: 10500.00,
            totalMRP: 12500.00,
            user: "ADMIN"
        },
        {
            slNo: 12,
            grnNo: "MS2496",
            poNo: "PO/3371/25",
            groupName: "EQUIPMENT",
            supplierName: "IMAGING SOLUTIONS LTD",
            supplierAddress: "MEDICAL PARK, SECTOR 5",
            invoiceNo: "730014503",
            invoiceDate: "08/01/2026",
            receiptDate: "10/01/2026",
            totalCost: 12500.00,
            totalMRP: 15000.00,
            user: "ANIS"
        },
        {
            slNo: 13,
            grnNo: "MS2497",
            poNo: "PO/3372/25",
            groupName: "RADIOLOGY FILMS",
            supplierName: "DIAGNOSTIC SUPPLIES CO",
            supplierAddress: "INDUSTRIAL AREA, ZONE B",
            invoiceNo: "730014504",
            invoiceDate: "12/01/2026",
            receiptDate: "14/01/2026",
            totalCost: 27200.00,
            totalMRP: 32000.00,
            user: "ADMIN"
        },
        {
            slNo: 14,
            grnNo: "MS2498",
            poNo: "PO/3373/25",
            groupName: "CONTRAST MEDIA",
            supplierName: "RADIOLOGY EQUIPMENT INC",
            supplierAddress: "TECH PLAZA, BUILDING 12",
            invoiceNo: "730014505",
            invoiceDate: "15/01/2026",
            receiptDate: "17/01/2026",
            totalCost: 9300.00,
            totalMRP: 11000.00,
            user: "ANIS"
        },
        {
            slNo: 15,
            grnNo: "MS2499",
            poNo: "PO/3374/25",
            groupName: "EQUIPMENT",
            supplierName: "MEDICAL IMAGING SUPPLIES",
            supplierAddress: "HEALTHCARE COMPLEX, WING A",
            invoiceNo: "730014506",
            invoiceDate: "18/01/2026",
            receiptDate: "20/01/2026",
            totalCost: 225000.00,
            totalMRP: 260000.00,
            user: "ADMIN"
        }
    ]);

    // Filter form state
    const [fromDate, setFromDate] = useState<string>("2025-12-01");
    const [toDate, setToDate] = useState<string>("2026-01-22");
    const [selectedGroup, setSelectedGroup] = useState<string>("");

    // Data state
    const [filteredByDate, setFilteredByDate] = useState<any[]>([]);
    const [displayedData, setDisplayedData] = useState<any[]>([]);

    // Search and sort state
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [sortKey, setSortKey] = useState<string>("");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

    // Statistics
    const [stats, setStats] = useState({
        total: 0,
        totalReceipt: 0,
        profit: 0,
        loss: 0,
        profitPercent: 0
    });

    // On mount, initialize filtered data
    React.useEffect(() => {
        const filtered = tableData;
        calculateStats(filtered);
        setFilteredByDate(filtered);
        updateDisplayedData(filtered, searchTerm, sortKey, sortDirection);
    }, [tableData]);

    // Update displayed data when search or sort changes
    React.useEffect(() => {
        updateDisplayedData(filteredByDate, searchTerm, sortKey, sortDirection);
    }, [searchTerm, sortKey, sortDirection, filteredByDate]);

    // Calculate statistics
    const calculateStats = (records: any[]) => {
        let totalMRP = 0;
        let totalCost = 0;

        records.forEach(record => {
            totalMRP += record.totalMRP || 0;
            totalCost += record.totalCost || 0;
        });

        const profitAmount = totalMRP - totalCost;
        const profitPercentage = totalCost > 0 ? ((profitAmount / totalCost) * 100) : 0;

        setStats({
            total: totalMRP,
            totalReceipt: records.length,
            profit: profitAmount > 0 ? profitAmount : 0,
            loss: profitAmount < 0 ? Math.abs(profitAmount) : 0,
            profitPercent: profitPercentage
        });
    };

    // Update displayed data with search and sort
    const updateDisplayedData = (records: any[], search: string, sortK: string, sortDir: "asc" | "desc") => {
        let result = records;

        // Apply search
        if (search) {
            result = searchTableData(result, search, ["grnNo", "poNo", "groupName", "supplierName", "supplierAddress", "invoiceNo"]);
        }

        // Apply sort
        if (sortK) {
            result = sortTableData(result, sortK, sortDir);
        }

        setDisplayedData(result);
    };

    // Extract unique groups from tableData
    const uniqueGroups = Array.from(new Set(tableData.map(item => item.groupName))).sort();

    // Handle filter form submission
    const handleFilterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Filter by group if selected
        let filtered = tableData;
        if (selectedGroup) {
            filtered = filtered.filter(record => record.groupName === selectedGroup);
        }
        
        calculateStats(filtered);
        setFilteredByDate(filtered);
        updateDisplayedData(filtered, searchTerm, sortKey, sortDirection);
    };

    // Handle reset button
    const handleReset = () => {
        setFromDate("2025-12-01");
        setToDate("2026-01-22");
        setSelectedGroup("");
        setFilteredByDate([]);
        setDisplayedData([]);
        setSearchTerm("");
        setSortKey("");
        setSortDirection("asc");
        setStats({
            total: 0,
            totalReceipt: 0,
            profit: 0,
            loss: 0,
            profitPercent: 0
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

    // Handle row click to navigate to GRN details
    const handleRowClick = (record: any) => {
        navigate(`/hims/radiology/grn-details/${record.grnNo}`, {
            state: { grnData: record }
        });
    };

    // Handle export to Excel
    const handleExport = () => {
        const exportData = displayedData.map((record, index) => {
            return {
                "S.No": index + 1,
                "GRN No": record.grnNo,
                "PO No": record.poNo,
                "Group Name": record.groupName,
                "Supplier Name": record.supplierName,
                "Supplier Address": record.supplierAddress,
                "Invoice No": record.invoiceNo,
                "Invoice Date": record.invoiceDate,
                "Receipt Date": record.receiptDate,
                "Total Cost": record.totalCost,
                "Total MRP": record.totalMRP,
                "User": record.user
            };
        });

        exportToExcel(
            exportData,
            `Group_Wise_Goods_Receipt_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
            "Group Wise Goods Receipt"
        );
    };

    // Table columns
    const columns = [
        { key: "slNo", label: "S.No", sortable: false, render: (_: any, __: any, idx: number) => idx + 1 },
        { key: "grnNo", label: "GRN No", sortable: true },
        { key: "poNo", label: "PO No", sortable: true },
        { key: "groupName", label: "Group Name", sortable: true },
        { key: "supplierName", label: "Supplier Name", sortable: true },
        { key: "supplierAddress", label: "Supplier Address", sortable: true },
        { key: "invoiceNo", label: "Invoice No", sortable: true },
        { key: "invoiceDate", label: "Invoice Date", sortable: true },
        { key: "receiptDate", label: "Receipt Date", sortable: true },
        { 
            key: "totalCost", 
            label: "Total Cost", 
            sortable: true,
            render: (record: any) => {
                if (!record) return "";
                return `₹${(record.totalCost || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            }
        },
        { 
            key: "totalMRP", 
            label: "Total MRP", 
            sortable: true,
            render: (record: any) => {
                if (!record) return "";
                return `₹${(record.totalMRP || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            }
        },
        { key: "user", label: "User", sortable: false }
    ];

    return (
        <React.Fragment>
            <Container fluid className="px-4 py-3">
                {/* Report Header */}
                <ReportHeader
                    title="Group Wise Goods Receipt"
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
                            <Form.Group as={Col} md={3} controlId="groupFilter">
                                <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>Group</Form.Label>
                                <Form.Select
                                    value={selectedGroup}
                                    onChange={e => setSelectedGroup(e.target.value)}
                                >
                                    <option value="">All Groups</option>
                                    {uniqueGroups.map((group, idx) => (
                                        <option key={idx} value={group}>{group}</option>
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
                        <Col md={3}>
                            <ReportKPICard
                                label="Total MRP"
                                value={`₹${stats.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                variant="primary"
                            />
                        </Col>
                        <Col md={2}>
                            <ReportKPICard
                                label="Total Receipts"
                                value={stats.totalReceipt}
                                variant="info"
                            />
                        </Col>
                        <Col md={2}>
                            <ReportKPICard
                                label="Profit"
                                value={`₹${stats.profit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                variant="success"
                            />
                        </Col>
                        <Col md={2}>
                            <ReportKPICard
                                label="Loss"
                                value={`₹${stats.loss.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                variant="danger"
                            />
                        </Col>
                        <Col md={3}>
                            <ReportKPICard
                                label="Profit %"
                                value={`${stats.profitPercent.toFixed(2)}%`}
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
