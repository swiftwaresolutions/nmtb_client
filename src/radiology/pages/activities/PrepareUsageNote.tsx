import React, { useState, useRef, useEffect } from "react";
import { Container, Card, Form, Button, Row, Col, Table } from "react-bootstrap";
import PageHeader from "../../../components/PageHeader";
import { faStickyNote } from "@fortawesome/free-solid-svg-icons";
import ReportHeader from "../../../medical-records/components/ReportHeader";
import ReportTable from "../../../medical-records/components/ReportTable";
import { 
    searchTableData, 
    sortTableData, 
    exportToExcel, 
    printReport 
} from "../../../medical-records/utils/reportUtils";
import "../../../medical-records/styles/reportStyles.css";

interface UsageNoteItem {
    slNo: number;
    productName: string;
    batchNo: string;
    availableStock: number;
    expiryDate: string;
    usageQty: number;
    usageCause: string;
}

const PrepareUsageNote: React.FC = () => {
    // Reference for search input
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
                // Optional: collapse search dropdown
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Sample data for products
    const [products] = useState<UsageNoteItem[]>([
        { slNo: 1, productName: "17X14", batchNo: "123", availableStock: 1500, expiryDate: "12/2030", usageQty: 0, usageCause: "" },
        { slNo: 2, productName: "X-RAY FILM 10X12", batchNo: "10x12-001", availableStock: 30, expiryDate: "06/2029", usageQty: 0, usageCause: "" },
        { slNo: 3, productName: "X-RAY FILM 14X17", batchNo: "14x17-001", availableStock: 25, expiryDate: "09/2028", usageQty: 0, usageCause: "" },
        { slNo: 4, productName: "CT CONTRAST MEDIA", batchNo: "CTM-001", availableStock: 100, expiryDate: "03/2027", usageQty: 0, usageCause: "" },
        { slNo: 5, productName: "MRI CONTRAST AGENT", batchNo: "MRI-001", availableStock: 40, expiryDate: "11/2029", usageQty: 0, usageCause: "" },
        { slNo: 6, productName: "Angiography Catheter", batchNo: "ANG-101", availableStock: 75, expiryDate: "08/2028", usageQty: 0, usageCause: "" },
        { slNo: 7, productName: "Barium Sulfate", batchNo: "BAR-201", availableStock: 60, expiryDate: "04/2029", usageQty: 0, usageCause: "" },
        { slNo: 8, productName: "Cassette Film", batchNo: "CAS-301", availableStock: 120, expiryDate: "10/2030", usageQty: 0, usageCause: "" },
        { slNo: 9, productName: "Developer Solution", batchNo: "DEV-401", availableStock: 45, expiryDate: "02/2027", usageQty: 0, usageCause: "" },
        { slNo: 10, productName: "Echo Gel", batchNo: "ECH-501", availableStock: 200, expiryDate: "12/2028", usageQty: 0, usageCause: "" }
    ]);

    // Alphabet selection state
    const [selectedAlphabet, setSelectedAlphabet] = useState<string>("");

    // Data state
    const [usageItems, setUsageItems] = useState<UsageNoteItem[]>([]);
    const [displayedData, setDisplayedData] = useState<UsageNoteItem[]>([]);

    // Search and sort state
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [sortKey, setSortKey] = useState<keyof UsageNoteItem | "">("");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

    // Loading state
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // Dropdown data
    const groups = [
        { id: "1", name: "X-RAY" },
        { id: "2", name: "CT SCAN" },
        { id: "3", name: "MRI" },
        { id: "4", name: "ULTRASOUND" }
    ];

    const usageCauseOptions = [
        "Broken By User",
        "Expired",
        "Damaged in Transit",
        "Quality Issue",
        "Patient Use",
        "Testing Purpose",
        "Other"
    ];

    // Update displayed data
    const updateDisplayedData = (
        records: UsageNoteItem[], 
        search: string, 
        sortK: keyof UsageNoteItem | "", 
        sortDir: "asc" | "desc"
    ) => {
        let result = records;

        if (search) {
            result = searchTableData(result, search, ["productName", "batchNo", "usageCause"]);
        }

        if (sortK) {
            result = sortTableData(result, sortK, sortDir);
        }

        setDisplayedData(result);
    };

    useEffect(() => {
        updateDisplayedData(usageItems, searchTerm, sortKey, sortDirection);
    }, [searchTerm, sortKey, sortDirection, usageItems]);

    // Handle alphabet selection
    const handleAlphabetClick = (letter: string) => {
        setSelectedAlphabet(letter);
        // Load all products starting with the selected letter
        const filteredProducts = products.filter(p => 
            p.productName.toUpperCase().startsWith(letter)
        );
        // Set all filtered products with serial numbers
        const itemsWithSerialNo = filteredProducts.map((item, idx) => ({
            ...item,
            slNo: idx + 1,
            usageQty: 0,
            usageCause: ""
        }));
        setUsageItems(itemsWithSerialNo);
    };

    // Handle quantity change
    const handleQuantityChange = (index: number, value: number) => {
        const updated = [...usageItems];
        if (value <= updated[index].availableStock && value >= 0) {
            updated[index].usageQty = value;
            setUsageItems(updated);
        }
    };

    // Handle usage cause change
    const handleUsageCauseChange = (index: number, value: string) => {
        const updated = [...usageItems];
        updated[index].usageCause = value;
        setUsageItems(updated);
    };

    // Handle submit
    const handleSubmit = async () => {
        if (usageItems.length === 0) {
            alert("Please add at least one product to the usage note.");
            return;
        }

        const hasQuantity = usageItems.some(item => item.usageQty > 0);
        if (!hasQuantity) {
            alert("Please enter usage quantity for at least one product.");
            return;
        }

        setIsSubmitting(true);
        try {
            // TODO: API call to save usage note
            console.log("Submitting usage note:", { items: usageItems });
            alert("Usage note prepared successfully!");
            handleReset();
        } catch (error) {
            console.error("Error submitting usage note:", error);
            alert("Failed to prepare usage note. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle reset
    const handleReset = () => {
        setSelectedAlphabet("");
        setUsageItems([]);
        setSearchTerm("");
        setSortKey("");
        setSortDirection("asc");
    };

    // Handle search
    const handleSearch = (term: string) => {
        setSearchTerm(term);
    };

    // Handle sort
    const handleSort = (key: string, direction?: "asc" | "desc") => {
        const dir = direction || (sortKey === key && sortDirection === "asc" ? "desc" : "asc");
        setSortKey(key as keyof UsageNoteItem);
        setSortDirection(dir);
    };

    // Get subtitle
    const getSubtitle = () => {
        if (usageItems.length === 0) {
            return "Select an alphabet to load products";
        }
        return `${usageItems.length} product(s) added | ${selectedAlphabet ? `Filter: ${selectedAlphabet}` : 'All'}`;
    };

    // Table columns
    const columns = [
        { key: "slNo", label: "S. No", sortable: false, render: (_: any, __: any, idx: number) => idx + 1 },
        { 
            key: "productName", 
            label: "Product [ Batch No ]", 
            sortable: true,
            render: (value: string, row: UsageNoteItem) => (
                <span>{value} [ {row.batchNo} ]</span>
            )
        },
        { key: "availableStock", label: "Stock", sortable: true },
        { key: "expiryDate", label: "Expiry Date", sortable: true },
        { 
            key: "usageQty", 
            label: "Used Units/Numbers", 
            sortable: true,
            render: (value: number, row: UsageNoteItem, idx: number) => (
                <Form.Control
                    type="number"
                    size="sm"
                    min={0}
                    max={row.availableStock}
                    value={value}
                    onChange={(e) => handleQuantityChange(idx, parseInt(e.target.value) || 0)}
                    style={{ width: "100px" }}
                />
            )
        },
        { 
            key: "usageCause", 
            label: "Usage Cause", 
            sortable: false,
            render: (value: string, _: any, idx: number) => (
                <Form.Select
                    size="sm"
                    value={value}
                    onChange={(e) => handleUsageCauseChange(idx, e.target.value)}
                    style={{ minWidth: "150px" }}
                >
                    <option value="">-- Select Cause --</option>
                    {usageCauseOptions.map((cause, i) => (
                        <option key={i} value={cause}>{cause}</option>
                    ))}
                </Form.Select>
            )
        }
    ];

    return (
        <Container fluid className="px-4 py-3">
            <PageHeader
                icon={faStickyNote}
                title="Prepare Usage Note"
                subtitle={getSubtitle()}
            />

            {/* Alphabet Navigation */}
            <Card className="mb-3 shadow-sm">
                <Card.Body>
                    <div className="d-flex flex-wrap align-items-center justify-content-center gap-2 mb-3">
                        {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => (
                            <Button
                                key={letter}
                                variant={selectedAlphabet === letter ? "primary" : "outline-primary"}
                                size="sm"
                                onClick={() => handleAlphabetClick(letter)}
                                style={{ minWidth: "40px" }}
                            >
                                {letter}
                            </Button>
                        ))}
                    </div>
                    <div className="d-flex justify-content-end gap-2">
                        <Button 
                            variant="outline-secondary" 
                            size="sm" 
                            onClick={handleReset}
                        >
                            <i className="fas fa-undo me-1"></i> Reset
                        </Button>
                        <Button 
                            variant="success" 
                            size="sm" 
                            onClick={handleSubmit}
                            disabled={isSubmitting || usageItems.length === 0}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-1"></span>
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-save me-1"></i> Submit
                                </>
                            )}
                        </Button>
                    </div>
                </Card.Body>
            </Card>

            {/* Usage Items Table */}
            {usageItems.length === 0 ? (
                <Card className="shadow-sm">
                    <Card.Body className="text-center py-5">
                        <i className="fas fa-clipboard-list fa-3x text-muted mb-3"></i>
                        <h5 className="text-muted">No Products Loaded</h5>
                        <p className="text-muted mb-0">
                            Click on any alphabet letter above to load products starting with that letter.
                        </p>
                    </Card.Body>
                </Card>
            ) : (
                <ReportTable
                    columns={columns}
                    data={displayedData}
                    onSort={handleSort}
                    emptyMessage="No products added yet"
                />
            )}
        </Container>
    );
};

export default PrepareUsageNote;
