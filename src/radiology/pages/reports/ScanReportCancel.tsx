import React, { useState, useRef, useEffect } from "react";
import { Container, Card, Form, Button, Row, Col } from "react-bootstrap";
import { faBan } from "@fortawesome/free-solid-svg-icons";
import ReportHeader from "../../../medical-records/components/ReportHeader";
import ReportTable from "../../../medical-records/components/ReportTable";
import { 
    searchTableData, 
    sortTableData, 
    exportToExcel, 
    printReport, 
    formatReportDate
} from "../../../medical-records/utils/reportUtils";
import "../../../medical-records/styles/reportStyles.css";

interface ScanReportCancelRecord {
    slNo: number;
    patientVisitDate: string;
    scanDoctorName: string;
    consultantName: string;
}

const ScanReportCancel: React.FC = () => {
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
    const [tableData] = useState<ScanReportCancelRecord[]>([
        { slNo: 1, patientVisitDate: "15-01-2026", scanDoctorName: "Dr. Rajesh Kumar", consultantName: "Dr. Anita Sharma" },
        { slNo: 2, patientVisitDate: "16-01-2026", scanDoctorName: "Dr. Priya Menon", consultantName: "Dr. Vijay Reddy" },
        { slNo: 3, patientVisitDate: "17-01-2026", scanDoctorName: "Dr. Suresh Patel", consultantName: "Dr. Meena Nair" },
        { slNo: 4, patientVisitDate: "18-01-2026", scanDoctorName: "Dr. Rajesh Kumar", consultantName: "Dr. Rakesh Singh" },
        { slNo: 5, patientVisitDate: "19-01-2026", scanDoctorName: "Dr. Kavita Desai", consultantName: "Dr. Anita Sharma" },
        { slNo: 6, patientVisitDate: "20-01-2026", scanDoctorName: "Dr. Priya Menon", consultantName: "Dr. Sanjay Verma" },
        { slNo: 7, patientVisitDate: "21-01-2026", scanDoctorName: "Dr. Amit Joshi", consultantName: "Dr. Meena Nair" },
        { slNo: 8, patientVisitDate: "22-01-2026", scanDoctorName: "Dr. Rajesh Kumar", consultantName: "Dr. Pooja Iyer" },
    ]);

    // Filter form state
    const [opNo, setOpNo] = useState<string>("");

    // Data state
    const [filteredByOpNo, setFilteredByOpNo] = useState<ScanReportCancelRecord[]>([]);
    const [displayedData, setDisplayedData] = useState<ScanReportCancelRecord[]>([]);

    // Search and sort state
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [sortKey, setSortKey] = useState<keyof ScanReportCancelRecord | "">("");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

    // Update displayed data when search or sort changes
    React.useEffect(() => {
        updateDisplayedData(filteredByOpNo, searchTerm, sortKey, sortDirection);
    }, [searchTerm, sortKey, sortDirection, filteredByOpNo]);

    // Update displayed data with search and sort
    const updateDisplayedData = (
        records: ScanReportCancelRecord[], 
        search: string, 
        sortK: keyof ScanReportCancelRecord | "", 
        sortDir: "asc" | "desc"
    ) => {
        let result = records;

        // Apply search
        if (search) {
            result = searchTableData(result, search, ["patientVisitDate", "scanDoctorName", "consultantName"]);
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
        
        if (!opNo.trim()) {
            alert("Please enter OP Number");
            return;
        }

        // For now, just set filtered data to all data
        // In real implementation, filter by OP number
        const filtered = tableData;
        
        setFilteredByOpNo(filtered);
        updateDisplayedData(filtered, searchTerm, sortKey, sortDirection);
    };

    // Handle reset button
    const handleReset = () => {
        setOpNo("");
        setFilteredByOpNo([]);
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
        const typedKey = key as keyof ScanReportCancelRecord;
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
            "Patient Visit Date": record.patientVisitDate,
            "Scan Doctor Name": record.scanDoctorName,
            "Consultant Name": record.consultantName
        }));

        exportToExcel(
            exportData,
            `Scan_Report_Cancel_${opNo}_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
            "Scan Report Cancel"
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
        { key: "patientVisitDate", label: "Patient Visit Date", sortable: true },
        { key: "scanDoctorName", label: "Scan Doctor Name", sortable: true },
        { key: "consultantName", label: "Consultant Name", sortable: true }
    ];

    return (
        <React.Fragment>
            <Container fluid className="px-4 py-3">
                {/* Report Header */}
                <ReportHeader
                    title="Scan Report Cancel"
                    subtitle={filteredByOpNo.length > 0 ? `OP Number: ${opNo}` : "Enter OP Number and click Submit"}
                    onPrint={handlePrint}
                    onExport={handleExport}
                    onSearch={handleSearch}
                    showSearch={filteredByOpNo.length > 0}
                    showSort={false}
                    showPrint={filteredByOpNo.length > 0}
                    showExport={filteredByOpNo.length > 0}
                />
                
                {/* Filter Form Section */}
                <Card className="mb-4 shadow-sm no-print">
                    <Card.Body>
                        <Form className="row g-3 align-items-end" onSubmit={handleFilterSubmit}>
                            <Form.Group as={Col} md={8} controlId="opNo">
                                <Form.Label style={{ fontWeight: 600 }}>OP Number</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={opNo}
                                    onChange={e => setOpNo(e.target.value)}
                                    placeholder="Enter OP Number"
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
                {filteredByOpNo.length > 0 && (
                    <>
                        {/* Data Table */}
                        <Card className="shadow-sm">
                            <Card.Body className="p-0">
                                <ReportTable
                                    columns={columns}
                                    data={displayedData}
                                    emptyMessage="No cancelled scan reports found for the selected OP Number"
                                />
                            </Card.Body>
                        </Card>
                    </>
                )}

                {/* Empty State - Show before submit */}
                {filteredByOpNo.length === 0 && (
                    <Card className="shadow-sm text-center py-5">
                        <Card.Body>
                            <i className="fas fa-ban fa-3x text-muted mb-3"></i>
                            <h5 className="text-muted">Enter OP Number</h5>
                            <p className="text-muted mb-0">
                                Please enter OP Number and click Submit to view cancelled scan reports
                            </p>
                        </Card.Body>
                    </Card>
                )}
            </Container>
        </React.Fragment>
    );
};

export default ScanReportCancel;
