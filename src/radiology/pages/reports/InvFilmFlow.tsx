import React, { useState, useRef, useEffect } from "react";
import { Container, Card, Form, Button, Row, Col } from "react-bootstrap";
import { faChartLine } from "@fortawesome/free-solid-svg-icons";
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

interface InvFilmFlowRecord {
    slNo: number;
    dateTime: string;
    stockIn: string;
    stockOut: string;
    stockNow: string;
    details: string;
    group: string;
    product: string;
    batchNo: string;
    user: string;
}

const InvFilmFlow: React.FC = () => {
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

    // Sample data for dropdowns
    const [groups] = useState([
        { id: 1, name: "X-Ray Films" },
        { id: 2, name: "CT Contrast Media" },
        { id: 3, name: "MRI Gadolinium" },
        { id: 4, name: "Ultrasound Gels" },
    ]);

    const [products] = useState([
        { id: 1, name: "X-Ray Film 14x17", groupId: 1 },
        { id: 2, name: "X-Ray Film 10x12", groupId: 1 },
        { id: 3, name: "Iohexol 300mg", groupId: 2 },
        { id: 4, name: "Gadovist 1.0", groupId: 3 },
        { id: 5, name: "Ultrasound Gel 250ml", groupId: 4 },
    ]);

    const [batches] = useState([
        { id: 1, batchNo: "BATCH001", productId: 1 },
        { id: 2, batchNo: "BATCH002", productId: 2 },
        { id: 3, batchNo: "BATCH003", productId: 3 },
        { id: 4, batchNo: "BATCH004", productId: 4 },
    ]);

    // Sample flow data
    const [tableData] = useState<InvFilmFlowRecord[]>([
        { slNo: 1, dateTime: "01-08-2025 / 00:03:25", stockIn: "", stockOut: "1", stockNow: "0", details: "By Investigation Order CA34792", group: "X-RAY", product: "8X10", batchNo: "8x10", user: "suba" },
        { slNo: 2, dateTime: "02-08-2025 / 10:15:30", stockIn: "100", stockOut: "", stockNow: "100", details: "Purchase Order PO001", group: "X-RAY", product: "8X10", batchNo: "8x10", user: "admin" },
        { slNo: 3, dateTime: "03-08-2025 / 14:20:45", stockIn: "", stockOut: "10", stockNow: "90", details: "By Investigation Order CA34800", group: "X-RAY", product: "8X10", batchNo: "8x10", user: "rajesh" },
        { slNo: 4, dateTime: "05-08-2025 / 09:30:12", stockIn: "50", stockOut: "", stockNow: "140", details: "Stock Adjustment", group: "X-RAY", product: "8X10", batchNo: "8x10", user: "admin" },
        { slNo: 5, dateTime: "07-08-2025 / 16:45:20", stockIn: "", stockOut: "15", stockNow: "125", details: "By Investigation Order CA34850", group: "X-RAY", product: "8X10", batchNo: "8x10", user: "priya" },
        { slNo: 6, dateTime: "10-08-2025 / 11:10:05", stockIn: "200", stockOut: "", stockNow: "325", details: "Purchase Order PO002", group: "X-RAY", product: "8X10", batchNo: "8x10", user: "admin" },
        { slNo: 7, dateTime: "12-08-2025 / 13:25:40", stockIn: "", stockOut: "20", stockNow: "305", details: "By Investigation Order CA34900", group: "X-RAY", product: "8X10", batchNo: "8x10", user: "suba" },
        { slNo: 8, dateTime: "15-08-2025 / 15:50:15", stockIn: "", stockOut: "5", stockNow: "300", details: "By Investigation Order CA34925", group: "X-RAY", product: "8X10", batchNo: "8x10", user: "rajesh" },
    ]);

    // Filter form state
    const [filterType, setFilterType] = useState<string>("group"); // 'group', 'product', 'batch'
    const [selectedGroup, setSelectedGroup] = useState<string>("");
    const [selectedProduct, setSelectedProduct] = useState<string>("");
    const [selectedBatch, setSelectedBatch] = useState<string>("");
    const [fromDate, setFromDate] = useState<string>("2025-01-23");
    const [toDate, setToDate] = useState<string>("2026-01-23");

    // Data state
    const [filteredData, setFilteredData] = useState<InvFilmFlowRecord[]>([]);
    const [displayedData, setDisplayedData] = useState<InvFilmFlowRecord[]>([]);

    // Search and sort state
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [sortKey, setSortKey] = useState<keyof InvFilmFlowRecord | "">("");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

    // Update displayed data when search or sort changes
    React.useEffect(() => {
        updateDisplayedData(filteredData, searchTerm, sortKey, sortDirection);
    }, [searchTerm, sortKey, sortDirection, filteredData]);

    // Update displayed data with search and sort
    const updateDisplayedData = (
        records: InvFilmFlowRecord[], 
        search: string, 
        sortK: keyof InvFilmFlowRecord | "", 
        sortDir: "asc" | "desc"
    ) => {
        let result = records;

        // Apply search
        if (search) {
            result = searchTableData(result, search, ["dateTime", "stockIn", "stockOut", "stockNow", "details", "group", "product", "batchNo", "user"]);
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
        
        // Validate based on filter type
        if (filterType === "group" && !selectedGroup) {
            alert("Please select a Group");
            return;
        }
        if (filterType === "product" && !selectedProduct) {
            alert("Please select a Product");
            return;
        }
        if (filterType === "batch" && !selectedBatch) {
            alert("Please select a Batch No");
            return;
        }
        if (!fromDate || !toDate) {
            alert("Please select both From Date and To Date");
            return;
        }

        // For now, just set filtered data to all data
        // In real implementation, filter by selected criteria
        const filtered = tableData;
        
        setFilteredData(filtered);
        updateDisplayedData(filtered, searchTerm, sortKey, sortDirection);
    };

    // Handle reset button
    const handleReset = () => {
        setFilterType("group");
        setSelectedGroup("");
        setSelectedProduct("");
        setSelectedBatch("");
        setFromDate("2025-01-23");
        setToDate("2026-01-23");
        setFilteredData([]);
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
        const typedKey = key as keyof InvFilmFlowRecord;
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
            "Date / Time": record.dateTime,
            "Stock in": record.stockIn,
            "Stock out": record.stockOut,
            "Stock Now": record.stockNow,
            "Details": record.details,
            "Group": record.group,
            "Product": record.product,
            "Batch No": record.batchNo,
            "User": record.user
        }));

        const filterLabel = filterType === "group" 
            ? groups.find(g => g.id === Number(selectedGroup))?.name
            : filterType === "product"
            ? products.find(p => p.id === Number(selectedProduct))?.name
            : batches.find(b => b.id === Number(selectedBatch))?.batchNo;

        exportToExcel(
            exportData,
            `Inv_Film_Flow_${filterLabel}_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
            "Inv Film Flow"
        );
    };

    // Get subtitle text
    const getSubtitle = () => {
        if (filteredData.length === 0) {
            return "Select filter criteria and click Submit";
        }
        
        const filterLabel = filterType === "group" 
            ? `Group: ${groups.find(g => g.id === Number(selectedGroup))?.name}`
            : filterType === "product"
            ? `Product: ${products.find(p => p.id === Number(selectedProduct))?.name}`
            : `Batch: ${batches.find(b => b.id === Number(selectedBatch))?.batchNo}`;
        
        return `${filterLabel} | ${formatReportDate(new Date(fromDate), "DD/MM/YYYY")} to ${formatReportDate(new Date(toDate), "DD/MM/YYYY")}`;
    };

    // Table columns configuration
    const columns = [
        { 
            key: "slNo", 
            label: "S. No", 
            sortable: false, 
            render: (_: any, __: any, idx: number) => idx + 1 
        },
        { key: "dateTime", label: "Date / Time", sortable: true },
        { key: "stockIn", label: "Stock in", sortable: true },
        { key: "stockOut", label: "Stock out", sortable: true },
        { key: "stockNow", label: "Stock Now", sortable: true },
        { key: "details", label: "Details", sortable: true },
        { key: "group", label: "Group", sortable: true },
        { key: "product", label: "Product", sortable: true },
        { key: "batchNo", label: "Batch No", sortable: true },
        { key: "user", label: "User", sortable: true }
    ];

    return (
        <React.Fragment>
            <Container fluid className="px-4 py-3">
                {/* Report Header */}
                <ReportHeader
                    title="Inv/Film Flow"
                    subtitle={getSubtitle()}
                    onPrint={handlePrint}
                    onExport={handleExport}
                    onSearch={handleSearch}
                    showSearch={filteredData.length > 0}
                    showSort={false}
                    showPrint={filteredData.length > 0}
                    showExport={filteredData.length > 0}
                />
                
                {/* Filter Form Section */}
                <Card className="mb-4 shadow-sm no-print">
                    <Card.Body>
                        <Form className="row g-3 align-items-end" onSubmit={handleFilterSubmit}>
                            {/* Radio Buttons for Filter Type */}
                            <Form.Group as={Col} md={12} className="mb-3">
                                <Form.Label style={{ fontWeight: 600, display: "block", marginBottom: "0.75rem" }}>
                                    Filter By:
                                </Form.Label>
                                <div className="d-flex gap-4">
                                    <Form.Check
                                        type="radio"
                                        id="filterByGroup"
                                        label="By Group Name"
                                        name="filterType"
                                        value="group"
                                        checked={filterType === "group"}
                                        onChange={(e) => setFilterType(e.target.value)}
                                    />
                                    <Form.Check
                                        type="radio"
                                        id="filterByProduct"
                                        label="By Product Name"
                                        name="filterType"
                                        value="product"
                                        checked={filterType === "product"}
                                        onChange={(e) => setFilterType(e.target.value)}
                                    />
                                    <Form.Check
                                        type="radio"
                                        id="filterByBatch"
                                        label="By Batch No"
                                        name="filterType"
                                        value="batch"
                                        checked={filterType === "batch"}
                                        onChange={(e) => setFilterType(e.target.value)}
                                    />
                                </div>
                            </Form.Group>

                            {/* By Group */}
                            <Form.Group as={Col} md={4} controlId="byGroup">
                                <Form.Label style={{ fontWeight: 600 }}>By Group</Form.Label>
                                <Form.Select
                                    value={selectedGroup}
                                    onChange={e => setSelectedGroup(e.target.value)}
                                    disabled={filterType !== "group"}
                                    required={filterType === "group"}
                                >
                                    <option value="">-- Select Group --</option>
                                    {groups.map(group => (
                                        <option key={group.id} value={group.id}>
                                            {group.name}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            {/* By Product */}
                            <Form.Group as={Col} md={4} controlId="byProduct">
                                <Form.Label style={{ fontWeight: 600 }}>By Product</Form.Label>
                                <Form.Select
                                    value={selectedProduct}
                                    onChange={e => setSelectedProduct(e.target.value)}
                                    disabled={filterType !== "product"}
                                    required={filterType === "product"}
                                >
                                    <option value="">-- Select Product --</option>
                                    {products.map(product => (
                                        <option key={product.id} value={product.id}>
                                            {product.name}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            {/* By Batch No */}
                            <Form.Group as={Col} md={4} controlId="byBatch">
                                <Form.Label style={{ fontWeight: 600 }}>By Batch No</Form.Label>
                                <Form.Select
                                    value={selectedBatch}
                                    onChange={e => setSelectedBatch(e.target.value)}
                                    disabled={filterType !== "batch"}
                                    required={filterType === "batch"}
                                >
                                    <option value="">-- Select Batch No --</option>
                                    {batches.map(batch => (
                                        <option key={batch.id} value={batch.id}>
                                            {batch.batchNo}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            {/* Date Range */}
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

                            {/* Submit and Reset Buttons */}
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
                {filteredData.length > 0 && (
                    <>
                        {/* Data Table */}
                        <Card className="shadow-sm">
                            <Card.Body className="p-0">
                                <ReportTable
                                    columns={columns}
                                    data={displayedData}
                                    emptyMessage="No inventory flow records found for the selected criteria"
                                />
                            </Card.Body>
                        </Card>
                    </>
                )}

                {/* Empty State - Show before submit */}
                {filteredData.length === 0 && (
                    <Card className="shadow-sm text-center py-5">
                        <Card.Body>
                            <i className="fas fa-chart-line fa-3x text-muted mb-3"></i>
                            <h5 className="text-muted">Select Filter Criteria</h5>
                            <p className="text-muted mb-0">
                                Please select a filter type (Group/Product/Batch), choose from the dropdown, select date range, and click Submit to view inventory flow
                            </p>
                        </Card.Body>
                    </Card>
                )}
            </Container>
        </React.Fragment>
    );
};

export default InvFilmFlow;
