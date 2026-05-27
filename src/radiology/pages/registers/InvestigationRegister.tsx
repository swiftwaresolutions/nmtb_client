import React, { useState, useRef, useEffect } from "react";
import { Container, Card, Form, Button, Row, Col, Table } from "react-bootstrap";
import ReportHeader from "../../../medical-records/components/ReportHeader";
import { 
    searchTableData, 
    exportToExcel, 
    printReport,
    formatReportDate,
    getDateRangeText
} from "../../../medical-records/utils/reportUtils";
import "../../../medical-records/styles/reportStyles.css";

interface InvestigationRecord {
    slNo: number;
    procedureName: string;
    noOfPatients: number;
    rate: number;
    total: number;
}

interface GroupData {
    groupName: string;
    records: InvestigationRecord[];
    groupTotal: number;
}

export default function InvestigationRegister() {
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

    // Sample data organized by groups
    const [allGroupData] = useState<GroupData[]>([
        {
            groupName: "C.T SCAN",
            records: [
                { slNo: 1, procedureName: "3D CONSTRUCTION", noOfPatients: 0, rate: 500.0, total: 0 },
                { slNo: 2, procedureName: "ABDOMEN (ORAL & IV CONTRAST)", noOfPatients: 0, rate: 5000.0, total: 0 },
                { slNo: 3, procedureName: "ABDOMEN PLAIN", noOfPatients: 2, rate: 4500.0, total: 9000 },
                { slNo: 4, procedureName: "ANGIOGRAPHY BRAIN", noOfPatients: 1, rate: 6000.0, total: 6000 },
                { slNo: 5, procedureName: "BRAIN PLAIN", noOfPatients: 5, rate: 3500.0, total: 17500 },
                { slNo: 6, procedureName: "CHEST HIGH RESOLUTION", noOfPatients: 3, rate: 4000.0, total: 12000 },
                { slNo: 7, procedureName: "CT GUIDED BIOPSY", noOfPatients: 1, rate: 5500.0, total: 5500 },
                { slNo: 8, procedureName: "NECK CONTRAST", noOfPatients: 2, rate: 4800.0, total: 9600 },
                { slNo: 9, procedureName: "PELVIS PLAIN", noOfPatients: 1, rate: 4200.0, total: 4200 },
                { slNo: 10, procedureName: "SPINE CERVICAL", noOfPatients: 4, rate: 3800.0, total: 15200 }
            ],
            groupTotal: 78000
        },
        {
            groupName: "ULTRASOUND",
            records: [
                { slNo: 1, procedureName: "ABDOMEN & PELVIS", noOfPatients: 8, rate: 800.0, total: 6400 },
                { slNo: 2, procedureName: "ANOMALY SCAN", noOfPatients: 5, rate: 1200.0, total: 6000 },
                { slNo: 3, procedureName: "BREAST BILATERAL", noOfPatients: 3, rate: 900.0, total: 2700 },
                { slNo: 4, procedureName: "DOPPLER ARTERIAL", noOfPatients: 2, rate: 1500.0, total: 3000 },
                { slNo: 5, procedureName: "DOPPLER VENOUS", noOfPatients: 2, rate: 1400.0, total: 2800 },
                { slNo: 6, procedureName: "KUB SCAN", noOfPatients: 6, rate: 700.0, total: 4200 },
                { slNo: 7, procedureName: "NECK SCAN", noOfPatients: 4, rate: 850.0, total: 3400 },
                { slNo: 8, procedureName: "OBSTETRIC SCAN", noOfPatients: 10, rate: 600.0, total: 6000 },
                { slNo: 9, procedureName: "THYROID SCAN", noOfPatients: 7, rate: 750.0, total: 5250 },
                { slNo: 10, procedureName: "WHOLE ABDOMEN", noOfPatients: 9, rate: 900.0, total: 8100 }
            ],
            groupTotal: 47850
        },
        {
            groupName: "X-RAY",
            records: [
                { slNo: 1, procedureName: "ABDOMEN AP", noOfPatients: 12, rate: 300.0, total: 3600 },
                { slNo: 2, procedureName: "CHEST PA", noOfPatients: 25, rate: 250.0, total: 6250 },
                { slNo: 3, procedureName: "CHEST LATERAL", noOfPatients: 8, rate: 300.0, total: 2400 },
                { slNo: 4, procedureName: "ELBOW AP & LATERAL", noOfPatients: 5, rate: 350.0, total: 1750 },
                { slNo: 5, procedureName: "HAND AP", noOfPatients: 6, rate: 300.0, total: 1800 },
                { slNo: 6, procedureName: "KNEE AP & LATERAL", noOfPatients: 10, rate: 400.0, total: 4000 },
                { slNo: 7, procedureName: "PELVIS AP", noOfPatients: 4, rate: 350.0, total: 1400 },
                { slNo: 8, procedureName: "SHOULDER AP", noOfPatients: 3, rate: 350.0, total: 1050 },
                { slNo: 9, procedureName: "SPINE CERVICAL AP & LAT", noOfPatients: 7, rate: 450.0, total: 3150 },
                { slNo: 10, procedureName: "SPINE LUMBAR AP & LAT", noOfPatients: 9, rate: 500.0, total: 4500 }
            ],
            groupTotal: 29900
        },
        {
            groupName: "MRI SCAN",
            records: [
                { slNo: 1, procedureName: "BRAIN PLAIN", noOfPatients: 3, rate: 5500.0, total: 16500 },
                { slNo: 2, procedureName: "BRAIN WITH CONTRAST", noOfPatients: 2, rate: 7000.0, total: 14000 },
                { slNo: 3, procedureName: "MR ANGIOGRAPHY", noOfPatients: 1, rate: 8000.0, total: 8000 },
                { slNo: 4, procedureName: "SPINE CERVICAL", noOfPatients: 2, rate: 6000.0, total: 12000 },
                { slNo: 5, procedureName: "SPINE DORSAL", noOfPatients: 1, rate: 6000.0, total: 6000 },
                { slNo: 6, procedureName: "SPINE LUMBAR", noOfPatients: 3, rate: 6000.0, total: 18000 }
            ],
            groupTotal: 74500
        },
        {
            groupName: "MAMMOGRAPHY",
            records: [
                { slNo: 1, procedureName: "BILATERAL MAMMOGRAM", noOfPatients: 6, rate: 1200.0, total: 7200 },
                { slNo: 2, procedureName: "DIGITAL MAMMOGRAM", noOfPatients: 4, rate: 1500.0, total: 6000 },
                { slNo: 3, procedureName: "UNILATERAL MAMMOGRAM", noOfPatients: 2, rate: 800.0, total: 1600 }
            ],
            groupTotal: 14800
        },
        {
            groupName: "PHYSIOTHERAPY",
            records: [
                { slNo: 1, procedureName: "ABDOMINAL BELT ( M )", noOfPatients: 0, rate: 521.0, total: 0 },
                { slNo: 2, procedureName: "ABDOMINAL BELT 30 INCH", noOfPatients: 0, rate: 500.0, total: 0 },
                { slNo: 3, procedureName: "CERVICAL COLLAR", noOfPatients: 3, rate: 450.0, total: 1350 },
                { slNo: 4, procedureName: "CRUTCHES PAIR", noOfPatients: 2, rate: 600.0, total: 1200 },
                { slNo: 5, procedureName: "KNEE BRACE", noOfPatients: 4, rate: 800.0, total: 3200 },
                { slNo: 6, procedureName: "LUMBAR BELT", noOfPatients: 5, rate: 550.0, total: 2750 },
                { slNo: 7, procedureName: "SHOULDER BRACE", noOfPatients: 2, rate: 700.0, total: 1400 },
                { slNo: 8, procedureName: "WALKER", noOfPatients: 1, rate: 1200.0, total: 1200 },
                { slNo: 9, procedureName: "WRIST SPLINT", noOfPatients: 3, rate: 400.0, total: 1200 }
            ],
            groupTotal: 12300
        }
    ]);

    // Filter form state
    const [fromDate, setFromDate] = useState<string>("2025-12-01");
    const [toDate, setToDate] = useState<string>("2026-01-22");
    const [selectedGroup, setSelectedGroup] = useState<string>("");

    // Data state
    const [filteredGroups, setFilteredGroups] = useState<GroupData[]>([]);
    const [displayedGroups, setDisplayedGroups] = useState<GroupData[]>([]);

    // Search state
    const [searchTerm, setSearchTerm] = useState<string>("");

    // Grand total
    const [grandTotal, setGrandTotal] = useState<number>(0);

    // On mount, initialize filtered data
    React.useEffect(() => {
        const filtered = allGroupData;
        calculateGrandTotal(filtered);
        setFilteredGroups(filtered);
        updateDisplayedData(filtered, searchTerm);
    }, [allGroupData]);

    // Update displayed data when search changes
    React.useEffect(() => {
        updateDisplayedData(filteredGroups, searchTerm);
    }, [searchTerm, filteredGroups]);

    // Calculate grand total
    const calculateGrandTotal = (groups: GroupData[]) => {
        const total = groups.reduce((sum, group) => sum + group.groupTotal, 0);
        setGrandTotal(total);
    };

    // Update displayed data with search
    const updateDisplayedData = (groups: GroupData[], search: string) => {
        let result = groups;

        // Apply search - filter groups and records within groups
        if (search) {
            result = groups.map(group => {
                const filteredRecords = searchTableData(
                    group.records, 
                    search, 
                    ["procedureName"]
                );
                
                // Recalculate group total for filtered records
                const groupTotal = filteredRecords.reduce((sum, record) => sum + record.total, 0);
                
                return {
                    ...group,
                    records: filteredRecords,
                    groupTotal
                };
            }).filter(group => group.records.length > 0); // Only show groups with matching records
        }

        setDisplayedGroups(result);
        
        // Recalculate grand total for displayed data
        const displayTotal = result.reduce((sum, group) => sum + group.groupTotal, 0);
        setGrandTotal(displayTotal);
    };

    // Extract unique groups
    const uniqueGroups = allGroupData.map(g => g.groupName);

    // Handle filter form submission
    const handleFilterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Filter by group if selected
        let filtered = allGroupData;
        if (selectedGroup) {
            filtered = filtered.filter(group => group.groupName === selectedGroup);
        }
        
        calculateGrandTotal(filtered);
        setFilteredGroups(filtered);
        updateDisplayedData(filtered, searchTerm);
    };

    // Handle reset button
    const handleReset = () => {
        setFromDate("2025-12-01");
        setToDate("2026-01-22");
        setSelectedGroup("");
        setFilteredGroups([]);
        setDisplayedGroups([]);
        setSearchTerm("");
        setGrandTotal(0);
    };

    // Handle search
    const handleSearch = (term: string) => {
        setSearchTerm(term);
    };

    // Handle print
    const handlePrint = () => {
        printReport();
    };

    // Handle export to Excel
    const handleExport = () => {
        const exportData: any[] = [];
        
        displayedGroups.forEach(group => {
            // Add group header
            exportData.push({
                "Group": group.groupName,
                "Sl.No": "",
                "Procedure Name": "",
                "NO OF Patients": "",
                "Rate": "",
                "Total": ""
            });
            
            // Add group records
            group.records.forEach((record, index) => {
                exportData.push({
                    "Group": "",
                    "Sl.No": index + 1,
                    "Procedure Name": record.procedureName,
                    "NO OF Patients": record.noOfPatients,
                    "Rate": record.rate,
                    "Total": record.total
                });
            });
            
            // Add group total
            exportData.push({
                "Group": "",
                "Sl.No": "",
                "Procedure Name": "Group Total",
                "NO OF Patients": "",
                "Rate": "",
                "Total": group.groupTotal
            });
            
            // Add empty row for spacing
            exportData.push({
                "Group": "",
                "Sl.No": "",
                "Procedure Name": "",
                "NO OF Patients": "",
                "Rate": "",
                "Total": ""
            });
        });

        // Add grand total
        exportData.push({
            "Group": "",
            "Sl.No": "",
            "Procedure Name": "GRAND TOTAL",
            "NO OF Patients": "",
            "Rate": "",
            "Total": grandTotal
        });

        exportToExcel(
            exportData,
            `Investigation_Register_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
            "Investigation Register"
        );
    };

    return (
        <React.Fragment>
            <Container fluid className="px-4 py-3">
                {/* Report Header */}
                <ReportHeader
                    title="Investigation Register"
                    subtitle={filteredGroups.length > 0 ? getDateRangeText(fromDate, toDate) : "Select date range and click Submit"}
                    onPrint={handlePrint}
                    onExport={handleExport}
                    onSearch={handleSearch}
                    showSearch={filteredGroups.length > 0}
                    showSort={false}
                    showPrint={filteredGroups.length > 0}
                    showExport={filteredGroups.length > 0}
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
                                <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>Investigation Type</Form.Label>
                                <Form.Select
                                    value={selectedGroup}
                                    onChange={e => setSelectedGroup(e.target.value)}
                                >
                                    <option value="">All Types</option>
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

                {/* Group-wise Tables Section */}
                {filteredGroups.length > 0 && (
                    <div style={{ 
                        maxHeight: "calc(100vh - 350px)", 
                        minHeight: "400px",
                        overflowY: "auto",
                        paddingRight: "8px"
                    }}>
                        {displayedGroups.map((group, groupIndex) => (
                            <Card key={groupIndex} className="mb-4 shadow-sm report-card">
                                {/* Group Header */}
                                <Card.Header 
                                    style={{ 
                                        background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
                                        color: "#1976d2",
                                        fontWeight: "600",
                                        fontSize: "0.95rem",
                                        padding: "0.5rem 0.75rem",
                                        borderRadius: "8px 8px 0 0",
                                        borderBottom: "2px solid #1976d2"
                                    }}
                                >
                                    {group.groupName}
                                </Card.Header>
                                
                                {/* Group Table */}
                                <Card.Body style={{ padding: "0" }}>
                                    <div style={{ overflowX: "auto" }}>
                                        <Table 
                                            striped 
                                            bordered 
                                            hover 
                                            responsive 
                                            className="mb-0"
                                            style={{ fontSize: "0.9rem" }}
                                        >
                                            <thead style={{ 
                                                backgroundColor: "#f8f9fa",
                                                position: "sticky",
                                                top: 0,
                                                zIndex: 10
                                            }}>
                                                <tr>
                                                    <th style={{ width: "80px", textAlign: "center" }}>Sl.No</th>
                                                    <th style={{ minWidth: "300px" }}>Procedure Name</th>
                                                    <th style={{ width: "200px", textAlign: "center" }}>NO OF Patients</th>
                                                    <th style={{ width: "150px", textAlign: "right" }}>Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {group.records.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={4} style={{ textAlign: "center", padding: "2rem" }}>
                                                            No records found in this group.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    group.records.map((record, recordIndex) => (
                                                        <tr key={recordIndex}>
                                                            <td style={{ textAlign: "center" }}>{recordIndex + 1}</td>
                                                            <td>{record.procedureName}</td>
                                                            <td style={{ textAlign: "center" }}>
                                                                {record.noOfPatients.toFixed(1)} x {record.rate.toFixed(1)}
                                                            </td>
                                                            <td style={{ textAlign: "right", fontWeight: "500" }}>
                                                                ₹{record.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                                {/* Group Total Row */}
                                                <tr style={{ 
                                                    backgroundColor: "#e9ecef",
                                                    fontWeight: "700",
                                                    fontSize: "1rem"
                                                }}>
                                                    <td colSpan={3} style={{ textAlign: "right", padding: "0.75rem" }}>
                                                        Group Total:
                                                    </td>
                                                    <td style={{ textAlign: "right", padding: "0.75rem" }}>
                                                        ₹{group.groupTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </Table>
                                    </div>
                                </Card.Body>
                            </Card>
                        ))}

                        {/* Grand Total Card */}
                        <Card className="shadow-sm" style={{
                            background: "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)",
                            color: "#2e7d32",
                            border: "2px solid #4caf50"
                        }}>
                            <Card.Body style={{ padding: "0.75rem 1rem" }}>
                                <Row className="align-items-center">
                                    <Col md={8}>
                                        <h5 className="mb-0" style={{ fontWeight: "600", fontSize: "1rem" }}>
                                            GRAND TOTAL
                                        </h5>
                                        <small style={{ opacity: 0.85, fontSize: "0.85rem" }}>
                                            Total across {displayedGroups.length} group{displayedGroups.length !== 1 ? 's' : ''}
                                        </small>
                                    </Col>
                                    <Col md={4} style={{ textAlign: "right" }}>
                                        <h4 className="mb-0" style={{ fontWeight: "700", fontSize: "1.4rem" }}>
                                            ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </h4>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </div>
                )}

                {/* Empty State */}
                {filteredGroups.length === 0 && (
                    <Card className="text-center py-5">
                        <Card.Body>
                            <i className="fas fa-clipboard-list fa-3x text-muted mb-3"></i>
                            <h5 className="text-muted">No Data Loaded</h5>
                            <p className="text-muted">
                                Please select date range and click Submit to view investigation records.
                            </p>
                        </Card.Body>
                    </Card>
                )}
            </Container>
        </React.Fragment>
    );
}
