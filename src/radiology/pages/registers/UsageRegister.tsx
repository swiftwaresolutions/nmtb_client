import React, { useState, useRef, useEffect } from "react";
import { Container, Card, Form, Button, Row, Col, Badge } from "react-bootstrap";
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

interface UsageRecord {
    slNo: number;
    usageNo: string;
    entryDate: string;
    entryUser: string;
    status: string;
}

export default function UsageRegister() {
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

    // Sample data
    const [tableData] = useState<UsageRecord[]>([
        { slNo: 1, usageNo: "UG/001/2026", entryDate: "05/01/2026", entryUser: "ANIS", status: "Approved" },
        { slNo: 2, usageNo: "UG/002/2026", entryDate: "06/01/2026", entryUser: "ADMIN", status: "Approved" },
        { slNo: 3, usageNo: "UG/003/2026", entryDate: "07/01/2026", entryUser: "ANIS", status: "Pending" },
        { slNo: 4, usageNo: "UG/004/2026", entryDate: "08/01/2026", entryUser: "ADMIN", status: "Approved" },
        { slNo: 5, usageNo: "UG/005/2026", entryDate: "09/01/2026", entryUser: "ANIS", status: "Approved" },
        { slNo: 6, usageNo: "UG/006/2026", entryDate: "10/01/2026", entryUser: "ADMIN", status: "Rejected" },
        { slNo: 7, usageNo: "UG/007/2026", entryDate: "11/01/2026", entryUser: "ANIS", status: "Approved" },
        { slNo: 8, usageNo: "UG/008/2026", entryDate: "12/01/2026", entryUser: "ADMIN", status: "Pending" },
        { slNo: 9, usageNo: "UG/009/2026", entryDate: "13/01/2026", entryUser: "ANIS", status: "Approved" },
        { slNo: 10, usageNo: "UG/010/2026", entryDate: "14/01/2026", entryUser: "ADMIN", status: "Approved" },
        { slNo: 11, usageNo: "UG/011/2026", entryDate: "15/01/2026", entryUser: "ANIS", status: "Approved" },
        { slNo: 12, usageNo: "UG/012/2026", entryDate: "16/01/2026", entryUser: "ADMIN", status: "Pending" },
        { slNo: 13, usageNo: "UG/013/2026", entryDate: "17/01/2026", entryUser: "ANIS", status: "Approved" },
        { slNo: 14, usageNo: "UG/014/2026", entryDate: "18/01/2026", entryUser: "ADMIN", status: "Approved" },
        { slNo: 15, usageNo: "UG/015/2026", entryDate: "19/01/2026", entryUser: "ANIS", status: "Rejected" },
        { slNo: 16, usageNo: "UG/016/2026", entryDate: "20/01/2026", entryUser: "ADMIN", status: "Approved" },
        { slNo: 17, usageNo: "UG/017/2026", entryDate: "21/01/2026", entryUser: "ANIS", status: "Approved" },
        { slNo: 18, usageNo: "UG/018/2026", entryDate: "22/01/2026", entryUser: "ADMIN", status: "Pending" }
    ]);

    // Filter form state
    const [fromDate, setFromDate] = useState<string>("2026-01-01");
    const [toDate, setToDate] = useState<string>("2026-01-22");
    const [selectedStatus, setSelectedStatus] = useState<string>("");

    // Data state
    const [filteredByDate, setFilteredByDate] = useState<UsageRecord[]>([]);
    const [displayedData, setDisplayedData] = useState<UsageRecord[]>([]);

    // Search and sort state
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [sortKey, setSortKey] = useState<keyof UsageRecord | "">("");
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
    const updateDisplayedData = (records: UsageRecord[], search: string, sortK: keyof UsageRecord | "", sortDir: "asc" | "desc") => {
        let result = records;

        // Apply search
        if (search) {
            result = searchTableData(result, search, ["usageNo", "entryUser", "status"]);
        }

        // Apply sort
        if (sortK) {
            result = sortTableData(result, sortK, sortDir);
        }

        setDisplayedData(result);
    };

    // Extract unique statuses
    const uniqueStatuses = Array.from(new Set(tableData.map(item => item.status))).sort();

    // Handle filter form submission
    const handleFilterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Filter by status if selected
        let filtered = tableData;
        if (selectedStatus) {
            filtered = filtered.filter(record => record.status === selectedStatus);
        }
        
        setFilteredByDate(filtered);
        updateDisplayedData(filtered, searchTerm, sortKey, sortDirection);
    };

    // Handle reset button
    const handleReset = () => {
        setFromDate("2026-01-01");
        setToDate("2026-01-22");
        setSelectedStatus("");
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
        const sortableKey = key as keyof UsageRecord;
        if (sortKey === sortableKey) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortKey(sortableKey);
            setSortDirection("asc");
        }
    };

    // Handle print
    const handlePrint = () => {
        printReport();
    };

    // Handle export to Excel
    const handleExport = () => {
        const exportData = displayedData.map((record, index) => {
            return {
                "S.No": index + 1,
                "Usage No": record.usageNo,
                "Entry Date": record.entryDate,
                "Entry User": record.entryUser,
                "Status": record.status
            };
        });

        exportToExcel(
            exportData,
            `Usage_Register_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
            "Usage Register"
        );
    };

    // Table columns
    const columns = [
        { key: "slNo", label: "S. No", sortable: false, render: (_: any, __: any, idx: number) => idx + 1 },
        { key: "usageNo", label: "Usage No", sortable: true },
        { key: "entryDate", label: "Entry Date", sortable: true },
        { key: "entryUser", label: "Entry User", sortable: true },
        { 
            key: "status", 
            label: "Status", 
            sortable: true,
            render: (record: UsageRecord) => {
                if (!record) return "";
                const statusColors: { [key: string]: string } = {
                    "Approved": "success",
                    "Pending": "warning",
                    "Rejected": "danger"
                };
                return (
                    <Badge bg={statusColors[record.status] || "secondary"}>
                        {record.status}
                    </Badge>
                );
            }
        }
    ];

    return (
        <React.Fragment>
            <Container fluid className="px-4 py-3">
                {/* Report Header */}
                <ReportHeader
                    title="Usage Register"
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
                            <Form.Group as={Col} md={3} controlId="statusFilter">
                                <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>Status</Form.Label>
                                <Form.Select
                                    value={selectedStatus}
                                    onChange={e => setSelectedStatus(e.target.value)}
                                >
                                    <option value="">All Status</option>
                                    {uniqueStatuses.map((status, idx) => (
                                        <option key={idx} value={status}>{status}</option>
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

                {/* Data Table Section */}
                {filteredByDate.length > 0 ? (
                    <Card className="report-card" style={{ padding: "0.75rem" }}>
                        <div 
                            style={{ 
                                maxHeight: "calc(100vh - 350px)", 
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
                                    searchTerm
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
                ) : (
                    <Card className="text-center py-5">
                        <Card.Body>
                            <i className="fas fa-clipboard-list fa-3x text-muted mb-3"></i>
                            <h5 className="text-muted">No Data Loaded</h5>
                            <p className="text-muted">
                                Please select date range and click Submit to view usage records.
                            </p>
                        </Card.Body>
                    </Card>
                )}
            </Container>
        </React.Fragment>
    );
}
