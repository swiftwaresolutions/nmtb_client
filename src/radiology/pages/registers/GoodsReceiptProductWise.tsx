import React, { useState, useEffect } from "react";
import { Container, Card, Form, Button, Row, Col } from "react-bootstrap";
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

export default function GoodsReceiptProductWise() {
    // Sample data - 15 records
    const [tableData] = useState([
        {
            slNo: 1,
            productName: "SIMILAC PLUS (400 GM)",
            batchNo: "1243638",
            expiryDate: "2027-02-28",
            units: 24,
            pack: 1,
            quantity: 24,
            cost: 741.71,
            mrp: 885.00,
            taxPercent: 5.00,
            totalCost: 17801.04,
            taxAmt: 890.05,
            totalValue: 18691.09,
            receivedDate: "01-01-2026",
            supplierName: "BJK PHARMACEUTICALS"
        },
        {
            slNo: 2,
            productName: "X-RAY FILM 14X17",
            batchNo: "XRF2024-001",
            expiryDate: "2028-06-30",
            units: 100,
            pack: 1,
            quantity: 100,
            cost: 850.00,
            mrp: 1020.00,
            taxPercent: 12.00,
            totalCost: 85000.00,
            taxAmt: 10200.00,
            totalValue: 95200.00,
            receivedDate: "05-01-2026",
            supplierName: "IMAGING SOLUTIONS LTD"
        },
        {
            slNo: 3,
            productName: "CT CONTRAST MEDIA 100ML",
            batchNo: "CT2024-045",
            expiryDate: "2026-12-31",
            units: 50,
            pack: 1,
            quantity: 50,
            cost: 1200.00,
            mrp: 1440.00,
            taxPercent: 12.00,
            totalCost: 60000.00,
            taxAmt: 7200.00,
            totalValue: 67200.00,
            receivedDate: "08-01-2026",
            supplierName: "DIAGNOSTIC SUPPLIES CO"
        },
        {
            slNo: 4,
            productName: "ULTRASOUND GEL 5L",
            batchNo: "USG2024-078",
            expiryDate: "2027-03-31",
            units: 20,
            pack: 1,
            quantity: 20,
            cost: 450.00,
            mrp: 540.00,
            taxPercent: 18.00,
            totalCost: 9000.00,
            taxAmt: 1620.00,
            totalValue: 10620.00,
            receivedDate: "10-01-2026",
            supplierName: "MEDICO PHARMACEUTICALS"
        },
        {
            slNo: 5,
            productName: "MRI CONTRAST AGENT 15ML",
            batchNo: "MRI2024-012",
            expiryDate: "2027-08-15",
            units: 30,
            pack: 1,
            quantity: 30,
            cost: 2500.00,
            mrp: 3000.00,
            taxPercent: 12.00,
            totalCost: 75000.00,
            taxAmt: 9000.00,
            totalValue: 84000.00,
            receivedDate: "12-01-2026",
            supplierName: "INTER PHARMA"
        },
        {
            slNo: 6,
            productName: "DEVELOPER SOLUTION 5L",
            batchNo: "DEV2024-089",
            expiryDate: "2026-10-30",
            units: 15,
            pack: 1,
            quantity: 15,
            cost: 680.00,
            mrp: 816.00,
            taxPercent: 18.00,
            totalCost: 10200.00,
            taxAmt: 1836.00,
            totalValue: 12036.00,
            receivedDate: "15-01-2026",
            supplierName: "IMAGING SOLUTIONS LTD"
        },
        {
            slNo: 7,
            productName: "FIXER SOLUTION 5L",
            batchNo: "FIX2024-090",
            expiryDate: "2026-10-30",
            units: 15,
            pack: 1,
            quantity: 15,
            cost: 680.00,
            mrp: 816.00,
            taxPercent: 18.00,
            totalCost: 10200.00,
            taxAmt: 1836.00,
            totalValue: 12036.00,
            receivedDate: "15-01-2026",
            supplierName: "IMAGING SOLUTIONS LTD"
        },
        {
            slNo: 8,
            productName: "BARIUM SULFATE 450G",
            batchNo: "BAR2024-056",
            expiryDate: "2027-05-20",
            units: 40,
            pack: 1,
            quantity: 40,
            cost: 320.00,
            mrp: 384.00,
            taxPercent: 5.00,
            totalCost: 12800.00,
            taxAmt: 640.00,
            totalValue: 13440.00,
            receivedDate: "18-01-2026",
            supplierName: "DIAGNOSTIC SUPPLIES CO"
        },
        {
            slNo: 9,
            productName: "PROTECTIVE LEAD APRON",
            batchNo: "LEAD2024-003",
            expiryDate: "N/A",
            units: 5,
            pack: 1,
            quantity: 5,
            cost: 8500.00,
            mrp: 10200.00,
            taxPercent: 18.00,
            totalCost: 42500.00,
            taxAmt: 7650.00,
            totalValue: 50150.00,
            receivedDate: "20-01-2026",
            supplierName: "RADIOLOGY EQUIPMENT INC"
        },
        {
            slNo: 10,
            productName: "MAMMOGRAPHY FILM 8X10",
            batchNo: "MAM2024-022",
            expiryDate: "2027-12-31",
            units: 80,
            pack: 1,
            quantity: 80,
            cost: 920.00,
            mrp: 1104.00,
            taxPercent: 12.00,
            totalCost: 73600.00,
            taxAmt: 8832.00,
            totalValue: 82432.00,
            receivedDate: "21-01-2026",
            supplierName: "MEDICAL IMAGING SUPPLIES"
        },
        {
            slNo: 11,
            productName: "DISPOSABLE SYRINGES 10ML",
            batchNo: "SYR2024-145",
            expiryDate: "2028-01-31",
            units: 200,
            pack: 1,
            quantity: 200,
            cost: 8.50,
            mrp: 10.20,
            taxPercent: 12.00,
            totalCost: 1700.00,
            taxAmt: 204.00,
            totalValue: 1904.00,
            receivedDate: "22-01-2026",
            supplierName: "MEDICO PHARMACEUTICALS"
        },
        {
            slNo: 12,
            productName: "RADIATION BADGE",
            batchNo: "RAD2024-008",
            expiryDate: "N/A",
            units: 10,
            pack: 1,
            quantity: 10,
            cost: 450.00,
            mrp: 540.00,
            taxPercent: 18.00,
            totalCost: 4500.00,
            taxAmt: 810.00,
            totalValue: 5310.00,
            receivedDate: "22-01-2026",
            supplierName: "RADIOLOGY EQUIPMENT INC"
        },
        {
            slNo: 13,
            productName: "CASSETTE CLEANING CARDS",
            batchNo: "CAS2024-067",
            expiryDate: "2027-09-30",
            units: 50,
            pack: 1,
            quantity: 50,
            cost: 45.00,
            mrp: 54.00,
            taxPercent: 18.00,
            totalCost: 2250.00,
            taxAmt: 405.00,
            totalValue: 2655.00,
            receivedDate: "23-01-2026",
            supplierName: "IMAGING SOLUTIONS LTD"
        },
        {
            slNo: 14,
            productName: "INTENSIFYING SCREENS",
            batchNo: "INT2024-011",
            expiryDate: "N/A",
            units: 12,
            pack: 1,
            quantity: 12,
            cost: 3200.00,
            mrp: 3840.00,
            taxPercent: 18.00,
            totalCost: 38400.00,
            taxAmt: 6912.00,
            totalValue: 45312.00,
            receivedDate: "23-01-2026",
            supplierName: "MEDICAL IMAGING SUPPLIES"
        },
        {
            slNo: 15,
            productName: "FILM IDENTIFICATION MARKERS",
            batchNo: "FIM2024-034",
            expiryDate: "N/A",
            units: 25,
            pack: 1,
            quantity: 25,
            cost: 180.00,
            mrp: 216.00,
            taxPercent: 18.00,
            totalCost: 4500.00,
            taxAmt: 810.00,
            totalValue: 5310.00,
            receivedDate: "23-01-2026",
            supplierName: "DIAGNOSTIC SUPPLIES CO"
        }
    ]);

    // Filter form state
    const [fromDate, setFromDate] = useState<string>("2026-01-01");
    const [toDate, setToDate] = useState<string>("2026-01-23");
    const [selectedSupplier, setSelectedSupplier] = useState<string>("");
    const [selectedProduct, setSelectedProduct] = useState<string>("");

    // Data state - Two-stage data flow
    const [filteredByDate, setFilteredByDate] = useState<any[]>([]);
    const [displayedData, setDisplayedData] = useState<any[]>([]);

    // Search and sort state
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [sortKey, setSortKey] = useState<string>("");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

    // Statistics state
    const [stats, setStats] = useState({
        totalValue: 0,
        totalQuantity: 0,
        totalProducts: 0,
        totalTax: 0,
        avgCost: 0
    });

    // Calculate statistics
    const calculateStats = (records: any[]) => {
        const totalValue = records.reduce((sum, r) => sum + (r.totalValue || 0), 0);
        const totalQuantity = records.reduce((sum, r) => sum + (r.quantity || 0), 0);
        const totalProducts = records.length;
        const totalTax = records.reduce((sum, r) => sum + (r.taxAmt || 0), 0);
        const avgCost = totalProducts > 0 ? records.reduce((sum, r) => sum + (r.cost || 0), 0) / totalProducts : 0;

        setStats({
            totalValue,
            totalQuantity,
            totalProducts,
            totalTax,
            avgCost
        });
    };

    // Update displayed data based on search and sort
    const updateDisplayedData = (records: any[], search: string, sortK: string, sortDir: "asc" | "desc") => {
        let result = records;

        // Apply search
        if (search) {
            result = searchTableData(result, search, ["productName", "batchNo", "supplierName"]);
        }

        // Apply sort
        if (sortK) {
            result = sortTableData(result, sortK, sortDir);
        }

        setDisplayedData(result);
    };

    // Extract unique suppliers and products from tableData
    const uniqueSuppliers = Array.from(new Set(tableData.map(item => item.supplierName))).sort();
    const uniqueProducts = Array.from(new Set(tableData.map(item => item.productName))).sort();

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
        
        // Filter by supplier and product if selected
        let filtered = tableData;
        if (selectedSupplier) {
            filtered = filtered.filter(record => record.supplierName === selectedSupplier);
        }
        if (selectedProduct) {
            filtered = filtered.filter(record => record.productName === selectedProduct);
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
        setSelectedProduct("");
        setFilteredByDate([]);
        setDisplayedData([]);
        setSearchTerm("");
        setSortKey("");
        setSortDirection("asc");
        setStats({
            totalValue: 0,
            totalQuantity: 0,
            totalProducts: 0,
            totalTax: 0,
            avgCost: 0
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
        const exportData = displayedData.map((record, index) => {
            return {
                "S.No": index + 1,
                "Product Name": record.productName,
                "Batch No": record.batchNo,
                "Expiry Date": record.expiryDate,
                "Units": record.units,
                "Pack": record.pack,
                "Quantity": record.quantity,
                "Cost": record.cost,
                "MRP": record.mrp,
                "Tax %": `${record.taxPercent}%`,
                "Total Cost": record.totalCost,
                "Tax Amt": record.taxAmt,
                "Total Value": record.totalValue,
                "Received Date": record.receivedDate,
                "Supplier Name": record.supplierName
            };
        });

        exportToExcel(
            exportData,
            `Goods_Receipt_ProductWise_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
            "Goods Receipt Product Wise"
        );
    };

    // Table columns configuration
    const columns = [
        { key: "slNo", label: "Sl. No", sortable: false, render: (_: any, __: any, idx: number) => idx + 1 },
        { key: "productName", label: "Product Name", sortable: true },
        { key: "batchNo", label: "Batch No.", sortable: true },
        { key: "expiryDate", label: "Expiry Date", sortable: true },
        { key: "units", label: "Units", sortable: true, render: (record: any) => record?.units || 0 },
        { key: "pack", label: "Pack", sortable: true, render: (record: any) => record?.pack || 0 },
        { key: "quantity", label: "Quantity", sortable: true, render: (record: any) => record?.quantity || 0 },
        { 
            key: "cost", 
            label: "Cost", 
            sortable: true,
            render: (record: any) => `₹${(record?.cost || 0).toFixed(2)}`
        },
        { 
            key: "mrp", 
            label: "MRP", 
            sortable: true,
            render: (record: any) => `₹${(record?.mrp || 0).toFixed(2)}`
        },
        { 
            key: "taxPercent", 
            label: "Tax %", 
            sortable: true,
            render: (record: any) => `${(record?.taxPercent || 0).toFixed(2)} %`
        },
        { 
            key: "totalCost", 
            label: "Total Cost", 
            sortable: true,
            render: (record: any) => `₹${(record?.totalCost || 0).toFixed(2)}`
        },
        { 
            key: "taxAmt", 
            label: "Tax Amt", 
            sortable: true,
            render: (record: any) => `₹${(record?.taxAmt || 0).toFixed(2)}`
        },
        { 
            key: "totalValue", 
            label: "Total Value", 
            sortable: true,
            render: (record: any) => `₹${(record?.totalValue || 0).toFixed(2)}`
        },
        { key: "receivedDate", label: "Received Date", sortable: true },
        { key: "supplierName", label: "Supplier Name", sortable: true }
    ];

    return (
        <React.Fragment>
            <Container fluid className="px-4 py-3">
                {/* Report Header */}
                <ReportHeader
                    title="Goods Receipt Product Wise"
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
                            <Form.Group as={Col} md={2} controlId="fromDate">
                                <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>From Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={fromDate}
                                    onChange={e => setFromDate(e.target.value)}
                                    required
                                />
                            </Form.Group>
                            <Form.Group as={Col} md={2} controlId="toDate">
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
                            <Form.Group as={Col} md={3} controlId="productFilter">
                                <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>Product</Form.Label>
                                <Form.Select
                                    value={selectedProduct}
                                    onChange={e => setSelectedProduct(e.target.value)}
                                >
                                    <option value="">All Products</option>
                                    {uniqueProducts.map((product, idx) => (
                                        <option key={idx} value={product}>{product}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                            <Form.Group as={Col} md={2} className="d-flex align-items-end gap-2">
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
                                label="Total Value"
                                value={`₹${stats.totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                variant="primary"
                            />
                        </Col>
                        <Col md={2}>
                            <ReportKPICard
                                label="Total Quantity"
                                value={stats.totalQuantity}
                                variant="success"
                            />
                        </Col>
                        <Col md={2}>
                            <ReportKPICard
                                label="Total Products"
                                value={stats.totalProducts}
                                variant="info"
                            />
                        </Col>
                        <Col md={2}>
                            <ReportKPICard
                                label="Total Tax"
                                value={`₹${stats.totalTax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                variant="warning"
                            />
                        </Col>
                        <Col md={3}>
                            <ReportKPICard
                                label="Avg Cost"
                                value={`₹${stats.avgCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                variant="danger"
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
