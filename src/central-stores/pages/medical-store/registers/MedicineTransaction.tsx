import React, { useState, useRef, useEffect } from "react";
import { Container, Card, Form, Button, Row, Col, InputGroup, Modal, Table } from "react-bootstrap";
import ReportHeader from "../../../../medical-records/components/ReportHeader";
import ReportKPICard from "../../../../medical-records/components/ReportKPICard";
import ReportTable from "../../../../medical-records/components/ReportTable";
import { 
    searchTableData, 
    sortTableData, 
    exportToExcel, 
    printReport,
    formatReportDate,
    getDateRangeText
} from "../../../../medical-records/utils/reportUtils";
import "../../../../medical-records/styles/reportStyles.css";
import CentralStoresApiService, { MedicineTransactionRecord } from "../../../../api/central-stores/central-stores-api-service";
import { showErrorToast } from "../../../../utils/alertUtil";

const apiService = new CentralStoresApiService();

/**
 * Get store data from session storage
 * Supports both Central Stores and Pharmacy Stores modules
 */
const getStoreData = (): any => {
  const centralStoresData = sessionStorage.getItem('selectedStore');
  if (centralStoresData) {
    return JSON.parse(centralStoresData);
  }
  
  const pharmacyData = sessionStorage.getItem('pharmacySubModuleData');
  if (pharmacyData) {
    return JSON.parse(pharmacyData);
  }
  
  return {};
};

export default function MedicineTransaction() {
    // Get store data from session storage (supports both Central Stores and Pharmacy Stores)
    const storeData = getStoreData();
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

    // Available products list - loaded from API
    const [allProducts, setAllProducts] = useState<any[]>([]);
    const [loadingProducts, setLoadingProducts] = useState<boolean>(false);

    // Filter form state
    const [fromDate, setFromDate] = useState<string>("");
    const [toDate, setToDate] = useState<string>("");
    const [selectedProductId, setSelectedProductId] = useState<string>("");
    const [productFilter, setProductFilter] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // Filtered products for dropdown based on search
    const [filteredProducts, setFilteredProducts] = useState<any[]>(allProducts);

    // Data state
    const [filteredByDate, setFilteredByDate] = useState<MedicineTransactionRecord[]>([]);
    const [displayedData, setDisplayedData] = useState<MedicineTransactionRecord[]>([]);
    const [showResults, setShowResults] = useState<boolean>(false);

    // Search and sort state
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [sortKey, setSortKey] = useState<string>("");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

    // Statistics
    const [stats, setStats] = useState({
        totalTransactions: 0,
        totalIn: 0,
        totalOut: 0,
        totalValue: 0
    });

    // Modal state
    const [showModal, setShowModal] = useState<boolean>(false);

    // On mount, set current date and load products
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        setFromDate(today);
        setToDate(today);

        const loadProducts = async () => {
            setLoadingProducts(true);
            try {
                const products = await apiService.fetchAllProducts();
                setAllProducts(products.map(p => ({ id: p.id, name: p.name })));
            } catch {
                showErrorToast('Failed to load products.');
            } finally {
                setLoadingProducts(false);
            }
        };
        loadProducts();
    }, []);

    // Filter products based on search input
    useEffect(() => {
        if (productFilter.trim() === "") {
            setFilteredProducts(allProducts);
        } else {
            const filtered = allProducts.filter(product => 
                product.name.toLowerCase().startsWith(productFilter.toLowerCase())
            );
            setFilteredProducts(filtered);
        }
    }, [productFilter, allProducts]);

    // Update displayed data when search or sort changes
    useEffect(() => {
        if (showResults) {
            updateDisplayedData(filteredByDate, searchTerm, sortKey, sortDirection);
        }
    }, [searchTerm, sortKey, sortDirection, filteredByDate, showResults]);

    // Calculate statistics
    const calculateStats = (records: MedicineTransactionRecord[]) => {
        let inCount = 0;
        let outCount = 0;
        let totalVal = 0;

        records.forEach(record => {
            if (record.stockIn > 0) inCount++;
            if (record.stockOut > 0) outCount++;
            totalVal += (record.stockIn || 0) + (record.stockOut || 0);
        });

        setStats({
            totalTransactions: records.length,
            totalIn: inCount,
            totalOut: outCount,
            totalValue: totalVal
        });
    };

    // Update displayed data with search and sort
    const updateDisplayedData = (records: MedicineTransactionRecord[], search: string, sortK: string, sortDir: "asc" | "desc") => {
        let result = records;

        // Apply search
        if (search) {
            result = searchTableData(result, search, ["medicineName", "batchNo", "transactionType", "storeName", "transactionName", "userName"]);
        }

        // Apply sort
        if (sortK) {
            result = sortTableData(result, sortK as keyof MedicineTransactionRecord, sortDir);
        }

        setDisplayedData(result);
    };

    // Validate dates
    const validateDates = (): boolean => {
        if (!fromDate) {
            alert("Please enter From Date");
            return false;
        }
        
        if (!toDate) {
            alert("Please enter To Date");
            return false;
        }

        const fromDateObj = new Date(fromDate);
        const toDateObj = new Date(toDate);
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        if (fromDateObj > currentDate) {
            alert("From Date cannot be greater than current date");
            return false;
        }

        if (toDateObj > currentDate) {
            alert("To Date cannot be greater than current date");
            return false;
        }

        if (toDateObj < fromDateObj) {
            alert("To Date cannot be less than From Date");
            return false;
        }

        if (!selectedProductId) {
            alert("Please select a Product");
            return false;
        }

        return true;
    };

    // Handle filter form submission
    const handleFilterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateDates()) {
            return;
        }

        setIsSubmitting(true);
        try {
            const storeId = storeData?.storeId || storeData?.id || 1;
            const data = await apiService.fetchMedicineTransactions(
                Number(selectedProductId),
                storeId,
                fromDate,
                toDate
            );
            calculateStats(data);
            setFilteredByDate(data);
            updateDisplayedData(data, searchTerm, sortKey, sortDirection);
            setShowResults(true);
            setShowModal(true);
        } catch {
            showErrorToast('Failed to load medicine transactions. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle reset button
    const handleReset = () => {
        const today = new Date().toISOString().split('T')[0];
        setFromDate(today);
        setToDate(today);
        setSelectedProductId("");
        setProductFilter("");
        setFilteredByDate([]);
        setDisplayedData([]);
        setSearchTerm("");
        setSortKey("");
        setSortDirection("asc");
        setShowResults(false);
        setStats({
            totalTransactions: 0,
            totalIn: 0,
            totalOut: 0,
            totalValue: 0
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
        const exportData = displayedData.map((record, index) => ({
            "Sl. No": index + 1,
            "Medicine Name": record.medicineName,
            "Batch No": record.batchNo,
            "Transaction Type": record.transactionType,
            "Transaction Name": record.transactionName,
            "Transaction Number": record.transactionNumber,
            "Stock In": record.stockIn,
            "Stock Out": record.stockOut,
            "Stock Now (Batch)": record.stockNowBatch,
            "Stock Now (Product)": record.stockNowProd,
            "Store Name": record.storeName,
            "Transaction Date": record.transactionDate,
            "User": record.userName,
            "Note": record.note
        }));

        exportToExcel(
            exportData,
            `Medicine_Transaction_Register_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
            "Medicine Transaction Register"
        );
    };

    // Table columns configuration
    const columns = [
        { key: "slNo", label: "Sl. No", sortable: false, render: (_: any, __: any, idx: number) => idx + 1 },
        { key: "medicineName", label: "Medicine Name", sortable: true },
        { key: "batchNo", label: "Batch No", sortable: true },
        { key: "transactionType", label: "Type", sortable: true,
            render: (value: string) => (
                <span className={`badge ${value?.toUpperCase().includes('IN') ? 'bg-success' : 'bg-danger'}`}>
                    {value}
                </span>
            )
        },
        { key: "transactionName", label: "Transaction", sortable: true },
        { key: "transactionNumber", label: "Ref No", sortable: true },
        { key: "stockIn", label: "Stock In", sortable: true },
        { key: "stockOut", label: "Stock Out", sortable: true },
        { key: "stockNowBatch", label: "Stock (Batch)", sortable: true },
        { key: "stockNowProd", label: "Stock (Product)", sortable: true },
        { key: "storeName", label: "Store", sortable: true },
        { key: "transactionDate", label: "Date", sortable: true,
            render: (value: string) => value ? new Date(value).toLocaleDateString() : ''
        },
        { key: "userName", label: "User", sortable: false },
        { key: "note", label: "Note", sortable: false }
    ];

    return (
        <React.Fragment>
            <Container fluid className="px-4 py-3">
                {/* Page Title */}
                <div className="mb-4">
                    <h1 className="h3 mb-1 text-gray-800" style={{ fontWeight: 700 }}>
                        Medicine Transaction Register
                    </h1>
                    <p className="text-muted" style={{ fontSize: "0.9rem", marginBottom: 0 }}>
                        {fromDate} - {toDate}
                    </p>
                </div>

                {/* Filter Form Section */}
                <Row className="justify-content-center">
                    <Col lg={8} xl={7}>
                        <Card className="shadow-sm border-0">
                            <Card.Body className="p-4">
                                <Form onSubmit={handleFilterSubmit}>
                                    {/* Product Filter Input */}
                                    <Form.Group className="mb-4">
                                        <Form.Label style={{ fontWeight: 600 }}>Search Product</Form.Label>
                                        <InputGroup>
                                            <Form.Control
                                                type="text"
                                                placeholder="Type to filter products..."
                                                value={productFilter}
                                                onChange={e => setProductFilter(e.target.value)}
                                            />
                                            <Button variant="outline-secondary" onClick={() => setProductFilter("")}>
                                                Sort
                                            </Button>
                                        </InputGroup>
                                        <Form.Text className="text-muted">
                                            Start typing to filter the product list below
                                        </Form.Text>
                                    </Form.Group>

                                    {/* Product Selection */}
                                    <Form.Group className="mb-4">
                                        <Form.Label style={{ fontWeight: 600 }}>Product Name</Form.Label>
                                        <Form.Control
                                            as="select"
                                            size="lg"
                                            value={selectedProductId}
                                            onChange={e => setSelectedProductId(e.target.value)}
                                            required
                                            style={{ height: "150px" }}
                                            disabled={loadingProducts}
                                        >
                                            <option value="">{loadingProducts ? 'Loading products...' : '-- Select Product --'}</option>
                                            {filteredProducts.map(product => (
                                                <option key={product.id} value={product.id}>
                                                    {product.name}
                                                </option>
                                            ))}
                                        </Form.Control>
                                        <Form.Text className="text-muted">
                                            {filteredProducts.length} product(s) available
                                        </Form.Text>
                                    </Form.Group>

                                    {/* Date Selection */}
                                    <Row className="mb-4">
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label style={{ fontWeight: 600 }}>Select From Date</Form.Label>
                                                <Form.Control
                                                    type="date"
                                                    value={fromDate}
                                                    onChange={e => setFromDate(e.target.value)}
                                                    required
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label style={{ fontWeight: 600 }}>Select To Date</Form.Label>
                                                <Form.Control
                                                    type="date"
                                                    value={toDate}
                                                    onChange={e => setToDate(e.target.value)}
                                                    required
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    {/* Submit Button */}
                                    <div className="d-grid">
                                        <Button 
                                            type="submit" 
                                            variant="primary" 
                                            size="lg"
                                            style={{ fontWeight: 600 }}
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? 'Loading...' : 'View Report'}
                                        </Button>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Results Section */}
                {showResults && (
                    <>
                        {/* Report Header */}
                        <div className="mt-4">
                            <ReportHeader
                                title="Medicine Transaction Register"
                                subtitle={filteredByDate.length > 0 ? getDateRangeText(fromDate, toDate) : "Select date range and click Submit"}
                                onPrint={handlePrint}
                                onExport={handleExport}
                                onSearch={handleSearch}
                                showSearch={filteredByDate.length > 0}
                                showSort={false}
                                showPrint={filteredByDate.length > 0}
                                showExport={filteredByDate.length > 0}
                            />
                        </div>

                        {/* KPI Statistics Section */}
                        {filteredByDate.length > 0 && (
                            <Row className="mb-4">
                                <Col md={3}>
                                    <ReportKPICard
                                        label="Total Transactions"
                                        value={stats.totalTransactions}
                                        variant="primary"
                                    />
                                </Col>
                                <Col md={3}>
                                    <ReportKPICard
                                        label="Total IN"
                                        value={stats.totalIn}
                                        variant="success"
                                    />
                                </Col>
                                <Col md={3}>
                                    <ReportKPICard
                                        label="Total OUT"
                                        value={stats.totalOut}
                                        variant="danger"
                                    />
                                </Col>
                                <Col md={3}>
                                    <ReportKPICard
                                        label="Total Value"
                                        value={`₹${stats.totalValue.toFixed(2)}`}
                                        variant="info"
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
                    </>
                )}

                {/* Transaction Details Modal */}
                <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" className="modal-lg">
                    <Modal.Header closeButton>
                        <Modal.Title>Medicine Transaction Details</Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
                        {filteredByDate.length > 0 && (
                            <>
                                {/* Header Information */}
                                <div className="mb-4">
                                    <h5>
                                        <strong>Product Name: </strong>
                                        <span style={{ color: "#FF0000" }}>
                                            {allProducts.find(p => p.id.toString() === selectedProductId)?.name || "N/A"}
                                        </span>
                                    </h5>
                                    <p>
                                        <strong>Date From </strong>
                                        <span style={{ color: "#FF0000" }}>{fromDate}</span>
                                        <strong> To </strong>
                                        <span style={{ color: "#FF0000" }}>{toDate}</span>
                                    </p>
                                </div>

                                {/* Transaction Table */}
                                <Table bordered hover responsive size="sm">
                                    <thead className="table-dark">
                                        <tr>
                                            <th>Sl.</th>
                                            <th>Batch</th>
                                            <th>Exp Date</th>
                                            <th>Transaction Type</th>
                                            <th>Transferred To</th>
                                            <th>Transfer Date</th>
                                            <th>User</th>
                                            <th>Opening Balance</th>
                                            <th style={{ backgroundColor: "#00A629" }}>Qty In</th>
                                            <th style={{ backgroundColor: "#C60D1B" }}>Qty Out</th>
                                            <th>Closing Balance</th>
                                            <th>Transfer Store</th>
                                            <th>Cost</th>
                                            <th>Cost Value</th>
                                            <th>MRP</th>
                                            <th>MRP Value</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredByDate.map((record, index) => (
                                            <tr key={index}>
                                                <td align="center">{index + 1}</td>
                                                <td>{record.batchNo}</td>
                                                <td align="center">{record.transactionDate ? new Date(record.transactionDate).toLocaleDateString() : ''}</td>
                                                <td>{record.transactionType}</td>
                                                <td>{record.transactionName}</td>
                                                <td align="center">{record.transactionNumber}</td>
                                                <td>{record.userName}</td>
                                                <td align="center">{record.stockNowBatch}</td>
                                                <td align="center" style={{ backgroundColor: record.stockIn > 0 ? "#00A629" : "white", color: record.stockIn > 0 ? "white" : "black" }}>
                                                    <strong>{record.stockIn > 0 ? record.stockIn : ''}</strong>
                                                </td>
                                                <td align="center" style={{ backgroundColor: record.stockOut > 0 ? "#C60D1B" : "white", color: record.stockOut > 0 ? "white" : "black" }}>
                                                    <strong>{record.stockOut > 0 ? record.stockOut : ''}</strong>
                                                </td>
                                                <td align="center">{record.stockNowBatch}</td>
                                                <td>{record.storeName}</td>
                                                <td align="center">{record.stockNowProd}</td>
                                                <td colSpan={3}>{record.note}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>

                                {/* Note Section */}
                                <div className="mt-3 p-3" style={{ backgroundColor: "#f8f9fa", borderLeft: "4px solid #FF0000" }}>
                                    <p style={{ marginBottom: 0 }}>
                                        <strong style={{ color: "#FF0000" }}>Note:</strong> Opening Stock and Closing Stock are Validated from the system.
                                    </p>
                                </div>
                            </>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>
                            Close
                        </Button>
                        
                    </Modal.Footer>
                </Modal>
            </Container>
        </React.Fragment>
    );
}
