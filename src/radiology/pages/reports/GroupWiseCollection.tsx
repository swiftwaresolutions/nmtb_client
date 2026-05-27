import React, { useState, useRef, useEffect } from "react";
import { Container, Card, Form, Button, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { routerPathNames } from "../../../routes/routerPathNames";
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

interface GroupOption {
    id: number;
    groupName: string;
}

interface CollectionItem {
    slNo: number;
    study: string;
    cases: string;
    amount: string;
}

const GroupWiseCollection: React.FC = () => {
    const navigate = useNavigate();
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

    // Group options
    const [groupOptions] = useState<GroupOption[]>([
        { id: 1, groupName: "X-RAY" },
        { id: 2, groupName: "CT SCAN" },
        { id: 3, groupName: "MRI" },
        { id: 4, groupName: "ULTRASOUND" },
        { id: 5, groupName: "MAMMOGRAPHY" },
        { id: 6, groupName: "FLUOROSCOPY" }
    ]);

    // Sample data
    const [tableData] = useState<CollectionItem[]>([
        {
            slNo: 1,
            study: "ABDOMEN ERACT",
            cases: "350.00  *  45",
            amount: "16050.00"
        },
        {
            slNo: 2,
            study: "ANKLE JOINT AP/Lateral",
            cases: "350.00  *  491",
            amount: "177150.00"
        },
        {
            slNo: 3,
            study: "X-RAY CHEST PA VIEW",
            cases: "500.00  *  125",
            amount: "62500.00"
        },
        {
            slNo: 4,
            study: "CT BRAIN PLAIN",
            cases: "2500.00  *  38",
            amount: "95000.00"
        },
        {
            slNo: 5,
            study: "MRI SPINE",
            cases: "4500.00  *  22",
            amount: "99000.00"
        }
    ]);

    // Filter form state
    const [selectedGroup, setSelectedGroup] = useState<string>("");
    const [fromDate, setFromDate] = useState<string>("2025-12-01");
    const [toDate, setToDate] = useState<string>("2026-01-23");

    // Data state
    const [filteredByDate, setFilteredByDate] = useState<CollectionItem[]>([]);
    const [displayedData, setDisplayedData] = useState<CollectionItem[]>([]);

    // Search and sort state
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [sortKey, setSortKey] = useState<keyof CollectionItem | "">("");
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
        records: CollectionItem[], 
        search: string, 
        sortK: keyof CollectionItem | "", 
        sortDir: "asc" | "desc"
    ) => {
        let result = records;

        // Apply search
        if (search) {
            result = searchTableData(result, search, ["study"]);
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
        // In real implementation, filter by date range and group
        const filtered = tableData;
        
        setFilteredByDate(filtered);
        updateDisplayedData(filtered, searchTerm, sortKey, sortDirection);
    };

    // Handle reset button
    const handleReset = () => {
        setSelectedGroup("");
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
        const typedKey = key as keyof CollectionItem;
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
            "Study": record.study,
            "Cases": record.cases,
            "Amount": record.amount
        }));

        const groupName = groupOptions.find(g => g.id === Number(selectedGroup))?.groupName || "All";
        exportToExcel(
            exportData,
            `GroupWise_Collection_${groupName}_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
            "Group Wise Collection"
        );
    };

    // Get selected group name for subtitle
    const getSelectedGroupName = () => {
        const group = groupOptions.find(g => g.id === Number(selectedGroup));
        return group ? group.groupName : "All Groups";
    };

    // Handle row click to navigate to details page
    const handleRowClick = (item: CollectionItem) => {
        navigate(routerPathNames.radiology.reports.groupWiseCollectionDetails, {
            state: { study: item.study }
        });
    };

    // Table columns configuration
    const columns = [
        { 
            key: "slNo", 
            label: "SLNO", 
            sortable: false, 
            render: (_: any, __: any, idx: number) => idx + 1 
        },
        { key: "study", label: "Study", sortable: true },
        { key: "cases", label: "Cases", sortable: true },
        { key: "amount", label: "Amount", sortable: true, className: "text-end" }
    ];

    return (
        <React.Fragment>
            <Container fluid className="px-4 py-3">
                {/* Report Header */}
                <ReportHeader
                    title="Group Wise Collection"
                    subtitle={filteredByDate.length > 0 ? `${getSelectedGroupName()} | ${getDateRangeText(fromDate, toDate)}` : "Select group, date range and click Submit"}
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
                            <Form.Group as={Col} md={3} controlId="group">
                                <Form.Label style={{ fontWeight: 600 }}>Group</Form.Label>
                                <Form.Select
                                    value={selectedGroup}
                                    onChange={e => setSelectedGroup(e.target.value)}
                                    required
                                >
                                    <option value="">-- Select Group --</option>
                                    {groupOptions.map(group => (
                                        <option key={group.id} value={group.id}>
                                            {group.groupName}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                            <Form.Group as={Col} md={3} controlId="fromDate">
                                <Form.Label style={{ fontWeight: 600 }}>From Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={fromDate}
                                    onChange={e => setFromDate(e.target.value)}
                                    required
                                />
                            </Form.Group>
                            <Form.Group as={Col} md={3} controlId="toDate">
                                <Form.Label style={{ fontWeight: 600 }}>To Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={toDate}
                                    onChange={e => setToDate(e.target.value)}
                                    required
                                />
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

                {/* Data Section - Show only after submit */}
                {filteredByDate.length > 0 && (
                    <Card className="shadow-sm">
                        <Card.Body className="p-0">
                            <ReportTable
                                columns={columns}
                                data={displayedData}
                                emptyMessage="No collection data found for the selected criteria"
                                onRowClick={handleRowClick}
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
                            <i className="fas fa-money-bill-wave fa-3x text-muted mb-3"></i>
                            <h5 className="text-muted">Select Filters</h5>
                            <p className="text-muted mb-0">
                                Please select a group, date range, then click Submit to view collection report
                            </p>
                        </Card.Body>
                    </Card>
                )}
            </Container>
        </React.Fragment>
    );
};

export default GroupWiseCollection;
