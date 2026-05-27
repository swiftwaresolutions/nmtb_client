import React, { useState, useRef, useEffect } from "react";
import { Container, Card, Form, Button, Row, Col, Badge, Modal } from "react-bootstrap";
import PageHeader from "../../../components/PageHeader";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import ReportHeader from "../../../medical-records/components/ReportHeader";
import ReportTable from "../../../medical-records/components/ReportTable";
import { 
    searchTableData, 
    sortTableData, 
    exportToExcel, 
    printReport 
} from "../../../medical-records/utils/reportUtils";
import "../../../medical-records/styles/reportStyles.css";

interface UsageNoteForApproval {
    slNo: number;
    noteNo: string;
    noteDate: string;
    preparedBy: string;
    totalItems: number;
    totalQty: number;
    status: string;
}

interface NoteDetailItem {
    slNo: number;
    productName: string;
    batchNo: string;
    usageQty: number;
    remarks: string;
}

const ApproveNote: React.FC = () => {
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

    // Sample data for pending usage notes
    const [pendingNotes] = useState<UsageNoteForApproval[]>([
        { slNo: 1, noteNo: "UN-2026-001", noteDate: "2026-01-20", preparedBy: "John Doe", totalItems: 3, totalQty: 15, status: "Pending" },
        { slNo: 2, noteNo: "UN-2026-002", noteDate: "2026-01-21", preparedBy: "Jane Smith", totalItems: 5, totalQty: 25, status: "Pending" },
        { slNo: 3, noteNo: "UN-2026-003", noteDate: "2026-01-22", preparedBy: "Mike Wilson", totalItems: 2, totalQty: 10, status: "Pending" },
        { slNo: 4, noteNo: "UN-2026-004", noteDate: "2026-01-23", preparedBy: "Sarah Brown", totalItems: 4, totalQty: 20, status: "Pending" }
    ]);

    // Sample detail items for modal
    const [noteDetails] = useState<NoteDetailItem[]>([
        { slNo: 1, productName: "X-RAY FILM 8X10", batchNo: "8x10-001", usageQty: 5, remarks: "Regular usage" },
        { slNo: 2, productName: "X-RAY FILM 10X12", batchNo: "10x12-001", usageQty: 3, remarks: "" },
        { slNo: 3, productName: "CT CONTRAST MEDIA", batchNo: "CTM-001", usageQty: 7, remarks: "Emergency cases" }
    ]);

    // Filter form state
    const [fromDate, setFromDate] = useState<string>("2026-01-01");
    const [toDate, setToDate] = useState<string>(new Date().toISOString().split('T')[0]);

    // Data state
    const [filteredData, setFilteredData] = useState<UsageNoteForApproval[]>([]);
    const [displayedData, setDisplayedData] = useState<UsageNoteForApproval[]>([]);

    // Search and sort state
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [sortKey, setSortKey] = useState<keyof UsageNoteForApproval | "">("");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

    // Modal state
    const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
    const [selectedNote, setSelectedNote] = useState<UsageNoteForApproval | null>(null);

    // Loading state
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    // Initialize data on mount
    useEffect(() => {
        setFilteredData(pendingNotes);
        updateDisplayedData(pendingNotes, searchTerm, sortKey, sortDirection);
    }, [pendingNotes]);

    // Update displayed data
    const updateDisplayedData = (
        records: UsageNoteForApproval[], 
        search: string, 
        sortK: keyof UsageNoteForApproval | "", 
        sortDir: "asc" | "desc"
    ) => {
        let result = records;

        if (search) {
            result = searchTableData(result, search, ["noteNo", "preparedBy", "status"]);
        }

        if (sortK) {
            result = sortTableData(result, sortK, sortDir);
        }

        setDisplayedData(result);
    };

    useEffect(() => {
        updateDisplayedData(filteredData, searchTerm, sortKey, sortDirection);
    }, [searchTerm, sortKey, sortDirection, filteredData]);

    // Handle filter submit
    const handleFilterSubmit = () => {
        // TODO: API call to filter by date range
        setFilteredData(pendingNotes);
    };

    // Handle reset
    const handleReset = () => {
        setFromDate("2026-01-01");
        setToDate(new Date().toISOString().split('T')[0]);
        setFilteredData(pendingNotes);
        setSearchTerm("");
        setSortKey("");
        setSortDirection("asc");
    };

    // Handle view details
    const handleViewDetails = (note: UsageNoteForApproval) => {
        setSelectedNote(note);
        setShowDetailModal(true);
    };

    // Handle approve
    const handleApprove = async (noteNo: string) => {
        if (!window.confirm(`Are you sure you want to approve usage note ${noteNo}?`)) {
            return;
        }

        setIsProcessing(true);
        try {
            // TODO: API call to approve note
            console.log("Approving note:", noteNo);
            alert(`Usage note ${noteNo} approved successfully!`);
            // Remove from pending list
            setFilteredData(prev => prev.filter(n => n.noteNo !== noteNo));
            setShowDetailModal(false);
        } catch (error) {
            console.error("Error approving note:", error);
            alert("Failed to approve note. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    // Handle reject
    const handleReject = async (noteNo: string) => {
        const reason = window.prompt(`Please enter reason for rejecting ${noteNo}:`);
        if (!reason) return;

        setIsProcessing(true);
        try {
            // TODO: API call to reject note
            console.log("Rejecting note:", noteNo, "Reason:", reason);
            alert(`Usage note ${noteNo} rejected.`);
            // Remove from pending list
            setFilteredData(prev => prev.filter(n => n.noteNo !== noteNo));
            setShowDetailModal(false);
        } catch (error) {
            console.error("Error rejecting note:", error);
            alert("Failed to reject note. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    // Handle search
    const handleSearch = (term: string) => {
        setSearchTerm(term);
    };

    // Handle sort
    const handleSort = (key: string, direction?: "asc" | "desc") => {
        const dir = direction || (sortKey === key && sortDirection === "asc" ? "desc" : "asc");
        setSortKey(key as keyof UsageNoteForApproval);
        setSortDirection(dir);
    };

    // Get subtitle
    const getSubtitle = () => {
        if (displayedData.length === 0) {
            return "No pending usage notes for approval";
        }
        return `${displayedData.length} pending note(s) for approval`;
    };

    // Table columns
    const columns = [
        { key: "slNo", label: "S. No", sortable: false, render: (_: any, __: any, idx: number) => idx + 1 },
        { key: "noteNo", label: "Note No", sortable: true },
        { key: "noteDate", label: "Date", sortable: true },
        { key: "preparedBy", label: "Prepared By", sortable: true },
        { key: "totalItems", label: "Total Items", sortable: true },
        { key: "totalQty", label: "Total Qty", sortable: true },
        { 
            key: "status", 
            label: "Status", 
            sortable: true,
            render: (value: string) => (
                <Badge bg={value === "Pending" ? "warning" : value === "Approved" ? "success" : "danger"}>
                    {value}
                </Badge>
            )
        },
        {
            key: "action",
            label: "Actions",
            sortable: false,
            render: (_: any, row: UsageNoteForApproval) => (
                <div className="d-flex gap-1">
                    <Button 
                        variant="outline-info" 
                        size="sm" 
                        onClick={() => handleViewDetails(row)}
                        title="View Details"
                    >
                        <i className="fas fa-eye"></i>
                    </Button>
                    <Button 
                        variant="outline-success" 
                        size="sm" 
                        onClick={() => handleApprove(row.noteNo)}
                        title="Approve"
                        disabled={isProcessing}
                    >
                        <i className="fas fa-check"></i>
                    </Button>
                    <Button 
                        variant="outline-danger" 
                        size="sm" 
                        onClick={() => handleReject(row.noteNo)}
                        title="Reject"
                        disabled={isProcessing}
                    >
                        <i className="fas fa-times"></i>
                    </Button>
                </div>
            )
        }
    ];

    return (
        <Container fluid className="px-4 py-3">
            <PageHeader
                icon={faCheck}
                title="Approve Usage Note"
                subtitle={getSubtitle()}
            />

            {/* Filter Section */}
            <Card className="mb-3 shadow-sm">
                <Card.Body>
                    <Row className="align-items-end g-3">
                        <Col md={2}>
                            <Form.Group>
                                <Form.Label className="small fw-bold">From Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    size="sm"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={2}>
                            <Form.Group>
                                <Form.Label className="small fw-bold">To Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    size="sm"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md="auto">
                            <Button 
                                variant="primary" 
                                size="sm" 
                                onClick={handleFilterSubmit}
                            >
                                <i className="fas fa-filter me-1"></i> Filter
                            </Button>
                        </Col>
                        <Col md="auto">
                            <Button 
                                variant="outline-secondary" 
                                size="sm" 
                                onClick={handleReset}
                            >
                                <i className="fas fa-undo me-1"></i> Reset
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Pending Notes Table */}
            {displayedData.length === 0 ? (
                <Card className="shadow-sm">
                    <Card.Body className="text-center py-5">
                        <i className="fas fa-check-circle fa-3x text-success mb-3"></i>
                        <h5 className="text-muted">No Pending Notes</h5>
                        <p className="text-muted mb-0">
                            All usage notes have been processed. Check back later for new submissions.
                        </p>
                    </Card.Body>
                </Card>
            ) : (
                <ReportTable
                    columns={columns}
                    data={displayedData}
                    onSort={handleSort}
                    emptyMessage="No pending notes found"
                />
            )}

            {/* Detail Modal */}
            <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        Usage Note Details - {selectedNote?.noteNo}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedNote && (
                        <>
                            <Row className="mb-3">
                                <Col md={3}>
                                    <strong>Note No:</strong><br />
                                    {selectedNote.noteNo}
                                </Col>
                                <Col md={3}>
                                    <strong>Date:</strong><br />
                                    {selectedNote.noteDate}
                                </Col>
                                <Col md={3}>
                                    <strong>Prepared By:</strong><br />
                                    {selectedNote.preparedBy}
                                </Col>
                                <Col md={3}>
                                    <strong>Status:</strong><br />
                                    <Badge bg="warning">{selectedNote.status}</Badge>
                                </Col>
                            </Row>
                            <hr />
                            <h6 className="mb-3">Items</h6>
                            <div className="table-responsive">
                                <table className="table table-sm table-bordered">
                                    <thead >
                                        <tr>
                                            <th>S.No</th>
                                            <th>Product Name</th>
                                            <th>Batch No</th>
                                            <th>Usage Qty</th>
                                            <th>Remarks</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {noteDetails.map((item, idx) => (
                                            <tr key={idx}>
                                                <td>{idx + 1}</td>
                                                <td>{item.productName}</td>
                                                <td>{item.batchNo}</td>
                                                <td>{item.usageQty}</td>
                                                <td>{item.remarks || "-"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
                        Close
                    </Button>
                    <Button 
                        variant="danger" 
                        onClick={() => selectedNote && handleReject(selectedNote.noteNo)}
                        disabled={isProcessing}
                    >
                        <i className="fas fa-times me-1"></i> Reject
                    </Button>
                    <Button 
                        variant="success" 
                        onClick={() => selectedNote && handleApprove(selectedNote.noteNo)}
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-1"></span>
                                Processing...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-check me-1"></i> Approve
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default ApproveNote;
