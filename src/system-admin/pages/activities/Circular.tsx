import React, { useState, useRef, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Form,
  Table,
} from "react-bootstrap";
import { useSelector } from "react-redux";
import { RootState } from "../../../state/store";
import { handleError } from "../../../utils/errorUtil";
import {
  showSuccessToast,
  showErrorToast,
  showValidationError,
} from "../../../utils/alertUtil";
import { useNavigate } from "react-router-dom";
import { routerPathNames } from "../../../routes/routerPathNames";
import SearchInput from "../../../components/SearchInput";
import { useTableSearch } from "../../../hooks/useTableSearch";

interface CircularData {
  id: number;
  circularDate: string;
  validityPeriod: string;
  userName: string;
  content: string;
  createdDate: string;
  status: string;
  blocked: number;
}

const Circular = () => {
  const navigate = useNavigate();
  const loginData = useSelector((state: RootState) => state.loginData);

  // Refs for validation focus
  const circularDateRef = useRef<HTMLInputElement>(null);
  const validityPeriodRef = useRef<HTMLSelectElement>(null);
  const userNameRef = useRef<HTMLSelectElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const [form, setForm] = useState({
    circularDate: "",
    validityPeriod: "Day",
    userName: "To All",
    content: "",
  });

  const [circulars, setCirculars] = useState<CircularData[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showBlocked, setShowBlocked] = useState(false);

  // Filter circulars based on blocked status
  const activeCirculars = circulars.filter((circular) => circular.blocked === 0);
  const blockedCirculars = circulars.filter((circular) => circular.blocked === 1);

  // Search functionality for active circulars
  const {
    filteredData: filteredActiveCirculars,
    searchTerm: activeSearchTerm,
    setSearchTerm: setActiveSearchTerm,
    resultCount: activeResultCount,
    totalCount: activeTotalCount,
  } = useTableSearch({
    data: activeCirculars,
    searchFields: ["content", "userName"],
  });

  // Search functionality for blocked circulars
  const {
    filteredData: filteredBlockedCirculars,
    searchTerm: blockedSearchTerm,
    setSearchTerm: setBlockedSearchTerm,
    resultCount: blockedResultCount,
    totalCount: blockedTotalCount,
  } = useTableSearch({
    data: blockedCirculars,
    searchFields: ["content", "userName"],
  });

  // Dummy data for demonstration
  const dummyCirculars: CircularData[] = [
    {
      id: 1,
      circularDate: "2025-12-31",
      validityPeriod: "Day",
      userName: "To All",
      content: "Important system maintenance scheduled for tomorrow. All users please save their work.",
      createdDate: "2025-12-31",
      status: "Active",
      blocked: 0,
    },
    {
      id: 2,
      circularDate: "2025-12-30",
      validityPeriod: "Day",
      userName: "To All",
      content: "New hospital policy regarding patient data privacy has been implemented.",
      createdDate: "2025-12-30",
      status: "Active",
      blocked: 0,
    },
  ];

  useEffect(() => {
    // Load dummy data
    setCirculars(dummyCirculars);
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!form.circularDate.trim()) {
      showValidationError("Circular date is required.");
      circularDateRef.current?.focus();
      return;
    }

    if (!form.validityPeriod.trim()) {
      showValidationError("Validity period is required.");
      validityPeriodRef.current?.focus();
      return;
    }

    if (!form.userName.trim()) {
      showValidationError("User name is required.");
      userNameRef.current?.focus();
      return;
    }

    if (!form.content.trim()) {
      showValidationError("Content is required.");
      contentRef.current?.focus();
      return;
    }

    setLoading(true);

    try {
      // TODO: Implement API call
      console.log("Submitting circular:", form);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (editingId !== null) {
        // Update existing circular
        setCirculars((prev) =>
          prev.map((circular) =>
            circular.id === editingId
              ? {
                  ...circular,
                  circularDate: form.circularDate,
                  validityPeriod: form.validityPeriod,
                  userName: form.userName,
                  content: form.content,
                }
              : circular
          )
        );
        showSuccessToast("Circular updated successfully!");
      } else {
        // Create new circular
        const newCircular: CircularData = {
          id: Date.now(),
          circularDate: form.circularDate,
          validityPeriod: form.validityPeriod,
          userName: form.userName,
          content: form.content,
          createdDate: new Date().toISOString().split("T")[0],
          status: "Active",
          blocked: 0,
        };
        setCirculars((prev) => [newCircular, ...prev]);
        showSuccessToast("Circular created successfully!");
      }

      // Reset form
      setForm({
        circularDate: "",
        validityPeriod: "Day",
        userName: "To All",
        content: "",
      });
      setEditingId(null);
    } catch (error: any) {
      console.error("Error saving circular:", error);
      handleError({ dispatch: () => {} } as any, error);
      showErrorToast("Failed to save circular. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (circular: CircularData) => {
    setForm({
      circularDate: circular.circularDate,
      validityPeriod: circular.validityPeriod,
      userName: circular.userName,
      content: circular.content,
    });
    setEditingId(circular.id);
  };

  const handleCancel = () => {
    setForm({
      circularDate: "",
      validityPeriod: "Day",
      userName: "To All",
      content: "",
    });
    setEditingId(null);
  };

  const handleBlock = async (id: number) => {
    try {
      // TODO: Implement API call
      console.log("Blocking circular:", id);

      // Update local state
      setCirculars((prev) =>
        prev.map((circular) =>
          circular.id === id ? { ...circular, blocked: 1 } : circular
        )
      );
      showSuccessToast("Circular blocked successfully!");
    } catch (error: any) {
      console.error("Error blocking circular:", error);
      handleError({ dispatch: () => {} } as any, error);
      showErrorToast("Failed to block circular. Please try again.");
    }
  };

  const handleUnblock = async (id: number) => {
    try {
      // TODO: Implement API call
      console.log("Unblocking circular:", id);

      // Update local state
      setCirculars((prev) =>
        prev.map((circular) =>
          circular.id === id ? { ...circular, blocked: 0 } : circular
        )
      );
      showSuccessToast("Circular unblocked successfully!");
    } catch (error: any) {
      console.error("Error unblocking circular:", error);
      handleError({ dispatch: () => {} } as any, error);
      showErrorToast("Failed to unblock circular. Please try again.");
    }
  };

  const handleBackToDashboard = () => {
    navigate(routerPathNames.systemAdmin.base);
  };

  return (
    <div>
      {/* Header Section */}
      <div className="card shadow-sm mb-4">
        <div className="card-header" style={{ backgroundColor: 'var(--page-header-bg)', color: 'var(--page-header-text)', borderBottom: '2px solid var(--page-header-border)' }}>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <button
                className="btn btn-light btn-sm"
                onClick={handleBackToDashboard}
                title="Back to Dashboard"
              >
                <i className="fas fa-arrow-left me-2"></i>
                Back
              </button>
              <h4 className="mb-0">
                <i className="fas fa-bullhorn me-2"></i>
                {editingId ? "Edit Circular" : "Add Circular"}
              </h4>
            </div>
            <div className="badge" style={{ fontSize: '0.9rem', padding: '8px 12px', backgroundColor: 'var(--badge-neutral-bg)', color: 'var(--badge-neutral-text)' }}>
              System Admin
            </div>
          </div>
        </div>
        <div className="card-body" style={{ backgroundColor: 'var(--page-body-bg)' }}>
          <p className="mb-0 text-muted">
            <i className="fas fa-info-circle me-2"></i>
            {editingId ? "Update circular information and settings" : "Create a new circular for system announcements"}
          </p>
        </div>
      </div>
      <div className="content-body">
        <Container fluid>
          <Row>
            {/* Form Section */}
            <Col md={6}>
              <Card className="shadow-sm">
                <Card.Body style={{ background: "var(--page-body-bg)" }}>
                  <Form>
                    <Row className="mb-3">
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>
                            Circular Date <span style={{ color: "red" }}>*</span>
                          </Form.Label>
                          <Form.Control
                            type="date"
                            name="circularDate"
                            value={form.circularDate}
                            onChange={handleInputChange}
                            ref={circularDateRef}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row className="mb-3">
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>
                            Validity Period <span style={{ color: "red" }}>*</span>
                          </Form.Label>
                          <Form.Control
                            as="select"
                            name="validityPeriod"
                            value={form.validityPeriod}
                            onChange={handleInputChange}
                            ref={validityPeriodRef}
                            required
                          >
                            <option value="Day">Day</option>
                            <option value="Week">Week</option>
                            <option value="Month">Month</option>
                            <option value="Year">Year</option>
                          </Form.Control>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row className="mb-3">
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>
                            User Name [To Whom] <span style={{ color: "red" }}>*</span>
                          </Form.Label>
                          <Form.Control
                            as="select"
                            name="userName"
                            value={form.userName}
                            onChange={handleInputChange}
                            ref={userNameRef}
                            required
                          >
                            <option value="To All">To All</option>
                            <option value="Doctors">Doctors</option>
                            <option value="Nurses">Nurses</option>
                            <option value="Admin Staff">Admin Staff</option>
                            <option value="Lab Staff">Lab Staff</option>
                            <option value="Pharmacy Staff">Pharmacy Staff</option>
                          </Form.Control>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row className="mb-3">
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>
                            Content <span style={{ color: "red" }}>*</span>
                          </Form.Label>
                          <Form.Control
                            as="textarea"
                            name="content"
                            value={form.content}
                            onChange={handleInputChange}
                            ref={contentRef}
                            rows={4}
                            placeholder="Enter circular content/message..."
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <div className="d-flex justify-content-end gap-2 mt-4">
                      <Button
                        variant="success"
                        onClick={handleSubmit}
                        disabled={loading}
                        style={{ minWidth: "120px" }}
                      >
                        {loading ? (
                          <>
                            <i className="fas fa-spinner fa-spin me-2"></i>
                            Saving...
                          </>
                        ) : editingId ? (
                          <>
                            <i className="fas fa-save me-2"></i>
                            Update
                          </>
                        ) : (
                          <>
                            <i className="fas fa-plus me-2"></i>
                            Create
                          </>
                        )}
                      </Button>

                      {editingId && (
                        <Button
                          variant="outline-secondary"
                          onClick={handleCancel}
                          disabled={loading}
                        >
                          <i className="fas fa-times me-2"></i>
                          Cancel
                        </Button>
                      )}
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </Col>

            {/* Right: List */}
            <Col md={5} style={{ maxHeight: "80vh", overflowY: "auto" }}>
              <Card
                className="shadow-sm"
                style={{
                  background: "white",
                  borderRadius: "12px",
                  border: "1px solid #e0e0e0",
                  maxHeight: "calc(78vh - 120px)",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Header */}
                <div
                  style={{
                    padding: "1.25rem 1.5rem",
                    borderBottom: "2px solid #f0f0f0",
                    background: "linear-gradient(to right, #f8f9fa, #ffffff)",
                    borderTopLeftRadius: "12px",
                    borderTopRightRadius: "12px",
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <i className="fas fa-list-check" style={{ fontSize: "var(--font-size-2xl)", color: "#28a745" }}></i>
                      <h5 className="mb-0" style={{ fontWeight: "var(--font-weight-semibold)" }}>
                        EXISTING CIRCULARS
                      </h5>
                      <span
                        className="badge"
                        style={{
                          background: "#28a745",
                          fontSize: "var(--font-size-xs)",
                          padding: "4px 8px",
                        }}
                      >
                        {filteredActiveCirculars.length + filteredBlockedCirculars.length}
                      </span>
                    </div>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => setShowBlocked(!showBlocked)}
                      style={{
                        borderRadius: "20px",
                        padding: "6px 16px",
                        fontWeight: "var(--font-weight-medium)",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <i className="fas fa-eye"></i>
                      {showBlocked ? "Show Active" : "Show Blocked"}
                    </Button>
                  </div>

                  {/* Search Input */}
                  <SearchInput
                    searchTerm={
                      showBlocked ? blockedSearchTerm : activeSearchTerm
                    }
                    onSearchChange={
                      showBlocked ? setBlockedSearchTerm : setActiveSearchTerm
                    }
                    placeholder={`Search circulars by content or recipient...`}
                    resultCount={
                      showBlocked ? blockedResultCount : activeResultCount
                    }
                    totalCount={
                      showBlocked ? blockedTotalCount : activeTotalCount
                    }
                    showResultCount={true}
                  />
                </div>

                <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>S No</th>
                        <th>Circular Details</th>
                        <th>Edit / Block</th>
                        <th>Unblock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(showBlocked
                        ? filteredBlockedCirculars
                        : filteredActiveCirculars
                      ).length === 0 ? (
                        <tr>
                          <td colSpan={4} style={{ textAlign: "center" }}>
                            {showBlocked
                              ? blockedSearchTerm
                                ? "No blocked circulars match your search."
                                : "No blocked circulars."
                              : activeSearchTerm
                              ? "No active circulars match your search."
                              : "No active circulars."}
                          </td>
                        </tr>
                      ) : (
                        (showBlocked
                          ? filteredBlockedCirculars
                          : filteredActiveCirculars
                        ).map((circular, idx) => (
                          <tr
                            key={circular.id}
                            style={{
                              backgroundColor:
                                editingId === circular.id ? "#fff3cd" : "transparent",
                              fontWeight: editingId === circular.id ? "var(--font-weight-semibold)" : "normal",
                              borderLeft:
                                editingId === circular.id
                                  ? "4px solid #ffc107"
                                  : "none",
                            }}
                          >
                            <td>{idx + 1}</td>
                            <td>
                              <div>
                                <strong>{new Date(circular.circularDate).toLocaleDateString()}</strong>
                                <br />
                                <small className="text-muted">
                                  {circular.validityPeriod} • {circular.userName}
                                </small>
                                <br />
                                <small className="text-muted">
                                  {circular.content.length > 30 
                                    ? `${circular.content.substring(0, 30)}...` 
                                    : circular.content}
                                </small>
                              </div>
                              {editingId === circular.id && (
                                <span className="ms-2 badge bg-warning text-dark">
                                  <i className="fas fa-edit me-1"></i>
                                  Editing
                                </span>
                              )}
                            </td>
                            <td>
                              {showBlocked ? (
                                "-"
                              ) : (
                                <>
                                  {editingId !== circular.id ? (
                                    <Button
                                      variant="outline-primary"
                                      size="sm"
                                      className="me-2"
                                      onClick={() => handleEdit(circular)}
                                      disabled={loading}
                                    >
                                      Edit
                                    </Button>
                                  ) : (
                                    <span className="text-muted fst-italic">
                                      Currently editing...
                                    </span>
                                  )}
                                </>
                              )}
                            </td>
                            <td>
                              {showBlocked ? (
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  onClick={() => handleUnblock(circular.id)}
                                >
                                  Unblock
                                </Button>
                              ) : (
                                <>
                                  {editingId !== circular.id ? (
                                    <Button
                                      variant="outline-danger"
                                      size="sm"
                                      onClick={() => handleBlock(circular.id)}
                                    >
                                      Block
                                    </Button>
                                  ) : (
                                    "-"
                                  )}
                                </>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </div>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default Circular;