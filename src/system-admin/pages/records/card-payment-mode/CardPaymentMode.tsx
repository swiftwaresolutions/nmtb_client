import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Form,
} from "react-bootstrap";
import { useSelector } from "react-redux";
import { RootState } from "../../../../state/store";
import {
  showSuccessToast,
  showErrorToast,
  showValidationError,
} from "../../../../utils/alertUtil";
import SearchInput from "../../../../components/SearchInput";
import { useTableSearch } from "../../../../hooks/useTableSearch";
import { useNavigate } from "react-router-dom";
import { routerPathNames } from "../../../../routes/routerPathNames";
import PageHeader from "../../../../components/PageHeader";
import { faCreditCard } from "@fortawesome/free-solid-svg-icons";

interface CardPaymentMode {
  id: number;
  name: string;
  blocked: number;
  entDateTime: string;
  uid: number;
}

const CardPaymentMode = () => {
  const navigate = useNavigate();
  const loginData = useSelector((state: RootState) => state.loginData);

  // Refs for input fields to enable focus on validation errors
  const nameRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "",
  });

  // Update state initialization to use localStorage
  const [cardPaymentModes, setCardPaymentModes] = useState<CardPaymentMode[]>(() => {
    const saved = localStorage.getItem("cardPaymentModes");
    if (saved) {
      return JSON.parse(saved);
    }
    // Initial dummy data
    return [
      {
        id: 1,
        name: "Credit Card",
        blocked: 0,
        entDateTime: "2024-01-01T10:00:00",
        uid: 1,
      },
      {
        id: 2,
        name: "Debit Card",
        blocked: 0,
        entDateTime: "2024-01-01T10:00:00",
        uid: 1,
      },
      {
        id: 3,
        name: "Visa Card",
        blocked: 0,
        entDateTime: "2024-01-01T10:00:00",
        uid: 1,
      },
      {
        id: 4,
        name: "Master Card",
        blocked: 0,
        entDateTime: "2024-01-01T10:00:00",
        uid: 1,
      },
      {
        id: 5,
        name: "Rupay Card",
        blocked: 1,
        entDateTime: "2024-01-01T10:00:00",
        uid: 1,
      },
    ];
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showBlocked, setShowBlocked] = useState(false);

  // Save to localStorage whenever cardPaymentModes changes
  useEffect(() => {
    localStorage.setItem("cardPaymentModes", JSON.stringify(cardPaymentModes));
  }, [cardPaymentModes]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddOrUpdate = async () => {
    if (!form.name.trim()) {
      showValidationError("Card payment mode name is required.");
      setTimeout(() => nameRef.current?.focus(), 100);
      return;
    }

    setLoading(true);

    try {
      if (editingId !== null) {
        // Update existing
        setCardPaymentModes((prev) =>
          prev.map((t) =>
            t.id === editingId
              ? { ...t, name: form.name }
              : t
          )
        );
        showSuccessToast("Card payment mode updated successfully!");
      } else {
        // Add new
        const newMode: CardPaymentMode = {
          id: cardPaymentModes.length > 0 ? Math.max(...cardPaymentModes.map((c) => c.id)) + 1 : 1,
          name: form.name,
          blocked: 0,
          entDateTime: new Date().toISOString(),
          uid: 1,
        };
        setCardPaymentModes((prev) => [...prev, newMode]);
        showSuccessToast("Card payment mode added successfully!");
      }

      // Reset form
      setForm({ name: "" });
      setEditingId(null);
    } catch (error: any) {
      showErrorToast("Failed to save card payment mode. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: number) => {
    const cardPaymentMode = cardPaymentModes.find((t) => t.id === id);
    if (!cardPaymentMode) return;

    setForm({
      name: cardPaymentMode.name,
    });
    setEditingId(id);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ name: "" });
  };

  const handleBlock = async (id: number) => {
    setCardPaymentModes((prev) =>
      prev.map((t) => (t.id === id ? { ...t, blocked: 1 } : t))
    );
    showSuccessToast("Card payment mode blocked successfully");
  };

  const handleUnblock = async (id: number) => {
    setCardPaymentModes((prev) =>
      prev.map((t) => (t.id === id ? { ...t, blocked: 0 } : t))
    );
    showSuccessToast("Card payment mode unblocked successfully");
  };

  const activeCardPaymentModes = cardPaymentModes.filter((t) => t.blocked === 0);
  const blockedCardPaymentModes = cardPaymentModes.filter((t) => t.blocked === 1);

  // Search functionality for active card payment modes
  const {
    filteredData: filteredActiveCardPaymentModes,
    searchTerm: activeSearchTerm,
    setSearchTerm: setActiveSearchTerm,
    resultCount: activeResultCount,
    totalCount: activeTotalCount,
  } = useTableSearch({
    data: activeCardPaymentModes,
    searchFields: ["name"],
  });

  // Search functionality for blocked card payment modes
  const {
    filteredData: filteredBlockedCardPaymentModes,
    searchTerm: blockedSearchTerm,
    setSearchTerm: setBlockedSearchTerm,
    resultCount: blockedResultCount,
    totalCount: blockedTotalCount,
  } = useTableSearch({
    data: blockedCardPaymentModes,
    searchFields: ["name"],
  });

  const handleBackToModules = () => {
    navigate(routerPathNames.systemAdmin.base);
  };

  return (
    <div>
      {/* Header Section */}
      <PageHeader
        icon={faCreditCard}
        title={editingId ? "Edit Card Payment Mode" : "Add Card Payment Mode"}
        subtitle={
          editingId
            ? "Update card payment mode information"
            : "Create a new card payment mode for the system"
        }
        badges={[
          { label: "Active", value: activeCardPaymentModes.length },
          { label: "Blocked", value: blockedCardPaymentModes.length },
          { label: "Total", value: cardPaymentModes.length },
        ]}
      />
      <div className="content-body">
        <Container fluid>
          <Row>
            {/* Left: Form */}
            <Col md={7} style={{ maxHeight: "80vh", overflowY: "auto" }}>
              <Card
                className="shadow-sm"
                style={{
                  padding: "2rem",
                  background: "white",
                  borderRadius: "10px",
                  maxHeight: "78vh",
                  overflowY: "auto",
                }}
              >
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Card Payment Mode Name <span style={{ color: "red" }}>*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleInputChange}
                      ref={nameRef}
                      placeholder="Enter card payment mode name"
                      required
                    />
                  </Form.Group>

                  <div
                    className="d-flex justify-content-center mt-4"
                    style={{
                      paddingTop: "1.5rem",
                      borderTop: "2px solid #e0e0e0",
                    }}
                  >
                    <Button
                      variant={editingId ? "warning" : "primary"}
                      onClick={handleAddOrUpdate}
                      disabled={loading}
                      style={{
                        marginRight: "10px",
                        minWidth: "150px",
                        fontWeight: "var(--font-weight-semibold)",
                        fontSize: "var(--font-size-lg)",
                      }}
                    >
                      {loading ? (
                        <>
                          <i className="fas fa-spinner fa-spin me-2"></i>
                          Saving...
                        </>
                      ) : editingId ? (
                        <>
                          Update Card Mode
                        </>
                      ) : (
                        <>
                          Add Card Mode
                        </>
                      )}
                    </Button>
                    {editingId && (
                      <Button
                        variant="outline-secondary"
                        onClick={handleCancelEdit}
                        disabled={loading}
                        style={{ minWidth: "100px" }}
                      >
                        <i className="fas fa-times me-2"></i>
                        Cancel
                      </Button>
                    )}
                  </div>
                </Form>
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
                        EXISTING CARD PAYMENT MODES
                      </h5>
                      <span
                        className="badge"
                        style={{
                          background: "#28a745",
                          fontSize: "var(--font-size-xs)",
                          padding: "4px 8px",
                        }}
                      >
                        {filteredActiveCardPaymentModes.length + filteredBlockedCardPaymentModes.length}
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
                    placeholder={`Search card payment modes by name...`}
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
                        <th>Card Payment Mode</th>
                        <th>Edit / Block</th>
                        <th>Unblock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(showBlocked
                        ? filteredBlockedCardPaymentModes
                        : filteredActiveCardPaymentModes
                      ).length === 0 ? (
                        <tr>
                          <td colSpan={4} style={{ textAlign: "center" }}>
                            {showBlocked
                              ? blockedSearchTerm
                                ? "No blocked card payment modes match your search."
                                : "No blocked card payment modes."
                              : activeSearchTerm
                              ? "No active card payment modes match your search."
                              : "No active card payment modes."}
                          </td>
                        </tr>
                      ) : (
                        (showBlocked
                          ? filteredBlockedCardPaymentModes
                          : filteredActiveCardPaymentModes
                        ).map((mode, idx) => (
                          <tr
                            key={mode.id}
                            style={{
                              backgroundColor:
                                editingId === mode.id ? "#fff3cd" : "transparent",
                              fontWeight: editingId === mode.id ? "var(--font-weight-semibold)" : "normal",
                              borderLeft:
                                editingId === mode.id
                                  ? "4px solid #ffc107"
                                  : "none",
                            }}
                          >
                            <td>{idx + 1}</td>
                            <td>
                              {mode.name}
                              {editingId === mode.id && (
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
                                  {editingId !== mode.id ? (
                                    <Button
                                      variant="outline-primary"
                                      size="sm"
                                      className="me-2"
                                      onClick={() => handleEdit(mode.id)}
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
                                  onClick={() => handleUnblock(mode.id)}
                                >
                                  Unblock
                                </Button>
                              ) : (
                                <>
                                  {editingId !== mode.id ? (
                                    <Button
                                      variant="outline-danger"
                                      size="sm"
                                      onClick={() => handleBlock(mode.id)}
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

export default CardPaymentMode;