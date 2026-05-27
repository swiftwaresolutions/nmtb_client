import React, { useState, useMemo } from "react";
import { Container, Card, Accordion, Button, Table, Badge, Row, Col, Form } from "react-bootstrap";
import PageHeader from "../../../components/PageHeader";
import { faCheckDouble, faChevronDown, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTableSearch } from "../../../hooks/useTableSearch";
import SearchInput from "../../../components/SearchInput";

interface ReturnProduct {
    id: number;
    productName: string;
    returnUnits: number;
    batchNo: string;
    rate: number;
    total: number;
}

interface GoodsReturnNote {
    id: number;
    noteNo: string;
    supplierName: string;
    date: string;
    status: "pending" | "approved" | "rejected";
    products: ReturnProduct[];
    totalAmount: number;
    reason: string;
}

const GRNoteApproval: React.FC = () => {
    const [activeKey, setActiveKey] = useState<string | null>(null);

    // Mock data - Replace with API call
    const mockNotes: GoodsReturnNote[] = [
        {
            id: 1,
            noteNo: "GRN001",
            supplierName: "NATIONAL HOSPITAL SUPPLIERS",
            date: "20-01-2026",
            status: "pending",
            reason: "Damaged products",
            products: [
                { id: 1, productName: "11X14", returnUnits: 10, batchNo: "B001", rate: 150, total: 1500 },
                { id: 2, productName: "14X17", returnUnits: 5, batchNo: "B002", rate: 200, total: 1000 },
            ],
            totalAmount: 2500,
        },
        {
            id: 2,
            noteNo: "GRN002",
            supplierName: "MEDICAL IMAGING SUPPLIES",
            date: "21-01-2026",
            status: "pending",
            reason: "Expired batch",
            products: [
                { id: 3, productName: "Barium Sulfate", returnUnits: 20, batchNo: "B003", rate: 80, total: 1600 },
            ],
            totalAmount: 1600,
        },
        {
            id: 3,
            noteNo: "GRN003",
            supplierName: "",
            date: "22-01-2026",
            status: "pending",
            reason: "Wrong specification",
            products: [
                { id: 4, productName: "CT Film 8x10", returnUnits: 8, batchNo: "B004", rate: 120, total: 960 },
                { id: 5, productName: "Lead Apron", returnUnits: 2, batchNo: "B005", rate: 5000, total: 10000 },
            ],
            totalAmount: 10960,
        },
        {
            id: 4,
            noteNo: "GRN004",
            supplierName: "SUPPLIER",
            date: "22-01-2026",
            status: "pending",
            reason: "Quality issue",
            products: [
                { id: 6, productName: "X-Ray Film 14x17", returnUnits: 15, batchNo: "B006", rate: 180, total: 2700 },
            ],
            totalAmount: 2700,
        },
    ];

    const [notes, setNotes] = useState<GoodsReturnNote[]>(mockNotes);
    const [selectedSupplier, setSelectedSupplier] = useState<string>("all");

    // Search functionality
    const {
        filteredData: searchedNotes,
        searchTerm,
        setSearchTerm,
        resultCount,
        totalCount,
    } = useTableSearch({
        data: notes,
        searchFields: ["noteNo", "supplierName", "date", "reason"],
    });

    // Get unique suppliers
    const uniqueSuppliers = useMemo(() => {
        const suppliers = notes
            .map(note => note.supplierName)
            .filter(name => name && name.trim() !== "")
            .filter((name, index, self) => self.indexOf(name) === index)
            .sort();
        return suppliers;
    }, [notes]);

    // Filter by selected supplier
    const displayedNotes = useMemo(() => {
        if (selectedSupplier === "all") return searchedNotes;
        
        return searchedNotes.filter(note => note.supplierName === selectedSupplier);
    }, [searchedNotes, selectedSupplier]);

    const handleApprove = (noteId: number) => {
        const note = notes.find((n) => n.id === noteId);
        if (note) {
            const confirmed = window.confirm(
                `Approve Goods Return Note ${note.noteNo}?\n\n` +
                    `Supplier: ${note.supplierName || "N/A"}\n` +
                    `Reason: ${note.reason}\n` +
                    `Total Amount: ₹${note.totalAmount.toLocaleString()}\n` +
                    `Products: ${note.products.length}`
            );

            if (confirmed) {
                setNotes(notes.map((n) => (n.id === noteId ? { ...n, status: "approved" } : n)));
                alert(`Goods Return Note ${note.noteNo} has been approved!`);
            }
        }
    };

    return (
        <Container fluid className="p-4">
            <PageHeader 
                icon={faCheckDouble} 
                title="G.R Note Approval" 
                subtitle="Review and approve goods return notes" 
            />

            {/* Search and Supplier Filter Controls */}
            <div className="d-flex justify-content-between align-items-center mb-3 mt-4">
                <SearchInput
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    placeholder="Search by note no., supplier, date, or reason..."
                    resultCount={resultCount}
                    totalCount={totalCount}
                    className="flex-grow-1 me-3"
                />
                <Form.Group className="d-flex align-items-center" style={{ minWidth: "250px" }}>
                    <Form.Label className="mb-0 me-2 text-nowrap">Filter by Supplier:</Form.Label>
                    <Form.Select
                        size="sm"
                        value={selectedSupplier}
                        onChange={(e) => setSelectedSupplier(e.target.value)}
                    >
                        <option value="all">All Suppliers</option>
                        {uniqueSuppliers.map((supplier) => (
                            <option key={supplier} value={supplier}>
                                {supplier}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>
            </div>

            <Card className="shadow-sm">
                <Card.Header className="bg-light">
                    <Row className="fw-bold">
                        <Col md={1}>S. No</Col>
                        <Col md={2}>Note No.</Col>
                        <Col md={3}>Supplier Name</Col>
                        <Col md={2}>Date</Col>
                        <Col md={2}>Reason</Col>
                        <Col md={1}>Status</Col>
                        <Col md={1}>Action</Col>
                    </Row>
                </Card.Header>

                <Accordion activeKey={activeKey} onSelect={(key) => setActiveKey(key as string)}>
                    {displayedNotes.map((note, index) => (
                        <Accordion.Item eventKey={`note-${note.id}`} key={note.id}>
                            <Accordion.Header>
                                <Row className="w-100 align-items-center">
                                    <Col md={1} className="text-center">
                                        {index + 1}
                                    </Col>
                                    <Col md={2}>
                                        <strong>{note.noteNo}</strong>
                                    </Col>
                                    <Col md={3}>{note.supplierName || <span className="text-muted">-</span>}</Col>
                                    <Col md={2}>{note.date}</Col>
                                    <Col md={2}>{note.reason}</Col>
                                    <Col md={1}>
                                        <Badge
                                            bg={
                                                note.status === "approved"
                                                    ? "success"
                                                    : note.status === "rejected"
                                                    ? "danger"
                                                    : "warning"
                                            }
                                        >
                                            {note.status.toUpperCase()}
                                        </Badge>
                                    </Col>
                                    <Col md={1}>
                                        <Button
                                            variant={note.status === "approved" ? "success" : "primary"}
                                            size="sm"
                                            disabled={note.status === "approved"}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleApprove(note.id);
                                            }}
                                        >
                                            {note.status === "approved" ? "Approved" : "Approve"}
                                        </Button>
                                    </Col>
                                </Row>
                            </Accordion.Header>
                            <Accordion.Body>
                                <div className="p-3">
                                    <h6 className="mb-3">Return Note Details - GRN #{note.noteNo}</h6>
                                    <div className="mb-3">
                                        <strong>Return Reason:</strong> {note.reason}
                                    </div>
                                    <Table bordered hover size="sm">
                                        <thead >
                                            <tr>
                                                <th style={{ width: "5%" }}>S.No</th>
                                                <th style={{ width: "35%" }}>Product Name</th>
                                                <th style={{ width: "15%" }}>Return Units</th>
                                                <th style={{ width: "20%" }}>Batch No</th>
                                                <th style={{ width: "12%" }}>Rate (₹)</th>
                                                <th style={{ width: "13%" }}>Total (₹)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {note.products.map((product, idx) => (
                                                <tr key={product.id}>
                                                    <td className="text-center">{idx + 1}</td>
                                                    <td>{product.productName}</td>
                                                    <td className="text-center">{product.returnUnits}</td>
                                                    <td>{product.batchNo}</td>
                                                    <td className="text-end">{product.rate.toLocaleString()}</td>
                                                    <td className="text-end">
                                                        <strong>{product.total.toLocaleString()}</strong>
                                                    </td>
                                                </tr>
                                            ))}
                                            <tr className="table-secondary">
                                                <td colSpan={5} className="text-end">
                                                    <strong>Total Amount:</strong>
                                                </td>
                                                <td className="text-end">
                                                    <strong style={{ fontSize: "1.1rem", color: "#0d6efd" }}>
                                                        ₹{note.totalAmount.toLocaleString()}
                                                    </strong>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </Table>

                                    <div className="mt-3 text-end">
                                        <Button variant="outline-secondary" size="sm" className="me-2">
                                            Print
                                        </Button>
                                        <Button
                                            variant={note.status === "approved" ? "success" : "primary"}
                                            size="sm"
                                            disabled={note.status === "approved"}
                                            onClick={() => handleApprove(note.id)}
                                        >
                                            {note.status === "approved" ? "✓ Approved" : "Approve Note"}
                                        </Button>
                                    </div>
                                </div>
                            </Accordion.Body>
                        </Accordion.Item>
                    ))}
                </Accordion>

                {displayedNotes.length === 0 && (
                    <Card.Body className="text-center text-muted py-5">
                        <p>
                            {searchTerm || selectedSupplier !== "all"
                                ? "No return notes found matching your filters"
                                : "No goods return notes pending approval"}
                        </p>
                    </Card.Body>
                )}
            </Card>
        </Container>
    );
};

export default GRNoteApproval;
