import React, { useState, useRef, useEffect } from "react";
import { Container, Card, Form, Button, Col } from "react-bootstrap";
import ReportHeader from "../../../medical-records/components/ReportHeader";
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

interface StockReportItem {
    slNo: number;
    productName: string;
    groupName: string;
    batchNo: string;
    expiryDate: string;
    stock: string;
    costValue: string;
}

const StockReport: React.FC = () => {
    // Reference for search input
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
                // Optional: Add logic to collapse search dropdown if needed
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Sample data
    const [tableData] = useState<StockReportItem[]>([
        {
            slNo: 1,
            productName: "X-RAY FILM 14x17",
            groupName: "X-RAY FILMS",
            batchNo: "XRF-2025-001",
            expiryDate: "15/06/2026",
            stock: "250",
            costValue: "75,000.00"
        },
        {
            slNo: 2,
            productName: "CONTRAST MEDIA 100ML",
            groupName: "CONTRAST AGENTS",
            batchNo: "CM-2025-102",
            expiryDate: "20/08/2026",
            stock: "50",
            costValue: "25,000.00"
        },
        {
            slNo: 3,
            productName: "ULTRASOUND GEL 5L",
            groupName: "CONSUMABLES",
            batchNo: "USG-2025-045",
            expiryDate: "10/12/2026",
            stock: "30",
            costValue: "4,500.00"
        },
        {
            slNo: 4,
            productName: "CT SYRINGE 200ML",
            groupName: "CT SUPPLIES",
            batchNo: "CTS-2025-078",
            expiryDate: "25/09/2026",
            stock: "100",
            costValue: "15,000.00"
        },
        {
            slNo: 5,
            productName: "MRI COIL COVER",
            groupName: "MRI SUPPLIES",
            batchNo: "MRC-2025-012",
            expiryDate: "30/11/2026",
            stock: "75",
            costValue: "11,250.00"
        }
    ]);

    // Filter form state
    const [fromDate, setFromDate] = useState<string>("2025-12-01");
    const [toDate, setToDate] = useState<string>("2026-01-23");

    // Data state
    const [filteredByDate, setFilteredByDate] = useState<StockReportItem[]>([]);
    const [displayedData, setDisplayedData] = useState<StockReportItem[]>([]);

    // Search and sort state
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [sortKey, setSortKey] = useState<keyof StockReportItem | "">("");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

    // On mount, initialize filtered data
    useEffect(() => {
        const filtered = tableData;
        setFilteredByDate(filtered);
        updateDisplayedData(filtered, searchTerm, sortKey, sortDirection);
    }, [tableData]);

    // Update displayed data when search or sort changes
    useEffect(() => {
        updateDisplayedData(filteredByDate, searchTerm, sortKey, sortDirection);
    }, [searchTerm, sortKey, sortDirection, filteredByDate]);

    // Update displayed data with search and sort
    const updateDisplayedData = (
        records: StockReportItem[], 
        search: string, 
        sortK: keyof StockReportItem | "", 
        sortDir: "asc" | "desc"
    ) => {
        let result = records;

        // Apply search
        if (search) {
            result = searchTableData(result, search, ["productName", "groupName", "batchNo"]);
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
        
        // For now, just set filtered data to all data
        // In real implementation, filter by date range
        const filtered = tableData;
        
        setFilteredByDate(filtered);
        updateDisplayedData(filtered, searchTerm, sortKey, sortDirection);
    };

    // Handle reset button
    const handleReset = () => {
        setFromDate("2025-12-01");
        setToDate("2026-01-23");
        setFilteredByDate([]);
        setDisplayedData([]);
        setSearchTerm("");
        setSortKey("");
        setSortDirection("asc");
    };

    // Handle search
    const handleSearch = (term: string) => {
        setSearchTerm(term);
    };

    // Handle sort
    const handleSort = (key: string) => {
        const typedKey = key as keyof StockReportItem;
        if (sortKey === typedKey) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortKey(typedKey);
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
            "S.No": index + 1,
            "Product Name": record.productName,
            "Group": record.groupName,
            "Batch No.": record.batchNo,
            "Expiry Date": record.expiryDate,
            "Stock": record.stock,
            "Cost Value": record.costValue
        }));

        exportToExcel(
            exportData,
            `Stock_Report_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
            "Stock Report"
        );
    };

    // Table columns configuration
    const columns = [
        { 
            key: "slNo", 
            label: "S. No", 
            sortable: false, 
            render: (_: any, __: any, idx: number) => idx + 1 
        },
        { key: "productName", label: "Product Name", sortable: true },
        { key: "groupName", label: "Group", sortable: true },
        { key: "batchNo", label: "Batch No.", sortable: true },
        { key: "expiryDate", label: "Expiry Date", sortable: true },
        { key: "stock", label: "Stock", sortable: true },
        { key: "costValue", label: "Cost Value", sortable: true, className: "text-end" }
    ];

    return (
        <React.Fragment>
            <Container fluid className="px-4 py-3">
                {/* Report Header */}
                <ReportHeader
                    title="Stock Report"
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
                                <Form.Label style={{ fontWeight: 600 }}>From Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={fromDate}
                                    onChange={e => setFromDate(e.target.value)}
                                    required
                                />
                            </Form.Group>
                            <Form.Group as={Col} md={4} controlId="toDate">
                                <Form.Label style={{ fontWeight: 600 }}>To Date</Form.Label>
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

                {/* Data Section - Show only after submit */}
                {filteredByDate.length > 0 && (
                    <Card className="shadow-sm">
                        <Card.Body className="p-0">
                            <ReportTable
                                columns={columns}
                                data={displayedData}
                                emptyMessage="No stock data found for the selected date range"
                            />
                        </Card.Body>
                        <Card.Footer className="bg-light">
                            <small className="text-muted">
                                Showing {displayedData.length} of {filteredByDate.length} records
                            </small>
                        </Card.Footer>
                    </Card>
                )}

                {/* Empty State - Show before submit */}
                {filteredByDate.length === 0 && (
                    <Card className="shadow-sm text-center py-5">
                        <Card.Body>
                            <i className="fas fa-warehouse fa-3x text-muted mb-3"></i>
                            <h5 className="text-muted">Select Date Range</h5>
                            <p className="text-muted mb-0">
                                Please select from date and to date, then click Submit to view stock report
                            </p>
                        </Card.Body>
                    </Card>
                )}
            </Container>
        </React.Fragment>
    );
};

export default StockReport;
