import React, { useState, useRef, useEffect } from "react";
import { Container, Card, Form, Button, Row, Col, Table } from "react-bootstrap";
import PageHeader from "../../../components/PageHeader";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
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

interface ExpiryCheckItem {
    slNo: number;
    productName: string;
    batchNo: string;
    expiryDate: string;
    stock: string;
}

const ExpiryCheck: React.FC = () => {
    // Reference for search input (for click-outside handler)
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Click outside handler to collapse search
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
    const [tableData] = useState<ExpiryCheckItem[]>([
        {
            slNo: 1,
            productName: "ABDOMINAL BELT ( L)",
            batchNo: "Abd.BELT",
            expiryDate: "28/06/2018",
            stock: "80"
        },
        {
            slNo: 2,
            productName: "ASH BRACE",
            batchNo: "ASH BRACE",
            expiryDate: "21/02/2019",
            stock: "20"
        }
    ]);

    // Filter form state
    const [fromDate, setFromDate] = useState<string>("2025-12-01");
    const [toDate, setToDate] = useState<string>("2026-01-22");

    // Data state
    const [filteredByDate, setFilteredByDate] = useState<ExpiryCheckItem[]>([]);
    const [displayedData, setDisplayedData] = useState<ExpiryCheckItem[]>([]);

    // Search and sort state
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [sortKey, setSortKey] = useState<keyof ExpiryCheckItem | "">("");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

    // On mount, initialize filtered data
    React.useEffect(() => {
        const filtered = tableData;
        setFilteredByDate(filtered);
        updateDisplayedData(filtered, searchTerm, sortKey, sortDirection);
    }, [tableData]);

    // Update displayed data when search or sort changes
    React.useEffect(() => {
        updateDisplayedData(filteredByDate, searchTerm, sortKey, sortDirection);
    }, [searchTerm, sortKey, sortDirection, filteredByDate]);

    // Update displayed data with search and sort
    const updateDisplayedData = (
        records: ExpiryCheckItem[], 
        search: string, 
        sortK: keyof ExpiryCheckItem | "", 
        sortDir: "asc" | "desc"
    ) => {
        let result = records;

        // Apply search
        if (search) {
            result = searchTableData(result, search, ["productName", "batchNo"]);
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
        setToDate("2026-01-22");
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
        const typedKey = key as keyof ExpiryCheckItem;
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
            "Batch No.": record.batchNo,
            "Expiry Date": record.expiryDate,
            "Stock": record.stock
        }));

        exportToExcel(
            exportData,
            `Expiry_Check_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
            "Expiry Check"
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
        { key: "batchNo", label: "Batch No.", sortable: true },
        { key: "expiryDate", label: "Expiry Date", sortable: true },
        { key: "stock", label: "Stock", sortable: true }
    ];

    return (
        <React.Fragment>
            <Container fluid className="px-4 py-3">
                {/* Report Header */}
                <ReportHeader
                    title="Expiry Check"
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
                    <>
                        {/* Data Table */}
                        <Card className="shadow-sm">
                            <Card.Body className="p-0">
                                <ReportTable
                                    columns={columns}
                                    data={displayedData}
                                    emptyMessage="No expiring products found for the selected date range"
                                />
                            </Card.Body>
                        </Card>
                    </>
                )}

                {/* Empty State - Show before submit */}
                {filteredByDate.length === 0 && (
                    <Card className="shadow-sm text-center py-5">
                        <Card.Body>
                            <i className="fas fa-calendar-check fa-3x text-muted mb-3"></i>
                            <h5 className="text-muted">Select Date Range</h5>
                            <p className="text-muted mb-0">
                                Please select from date and to date, then click Submit to view expiring products
                            </p>
                        </Card.Body>
                    </Card>
                )}
            </Container>
        </React.Fragment>
    );
};

export default ExpiryCheck;
