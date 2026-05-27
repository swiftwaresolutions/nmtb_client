import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Table,
  Form,
} from "react-bootstrap";
import { useSelector } from "react-redux";
import { RootState } from "../../../../state/store";
import { handleError } from "../../../../utils/errorUtil";
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
import { SystemAdminApiService } from "../../../../api/system-admin/system-admin-api-service";

interface BankPaymentMode {
  id: number;
  name: string;
  isActive: number;
  entDateTime?: string;
  uid?: number;
}

const BankPaymentMode = () => {
  const navigate = useNavigate();
  const loginData = useSelector((state: RootState) => state.loginData);
  const apiService = new SystemAdminApiService();

  // Refs for input fields to enable focus on validation errors
  const nameRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "",
  });

  const [bankPaymentModes, setBankPaymentModes] = useState<BankPaymentMode[]>([]);
  const [loadingBankPaymentModes, setLoadingBankPaymentModes] = useState(true);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showBlocked, setShowBlocked] = useState(false);

  // Load bank payment modes on component mount and when showBlocked changes
  useEffect(() => {
    const loadBankPaymentModes = async () => {
      try {
        setLoadingBankPaymentModes(true);
        const response = await apiService.fetchAllPaymentModes();
        console.log('All payment modes from API:', response);
        
        // Filter based on showBlocked state
        const filteredBankPaymentModes = response.filter((bankPaymentMode: BankPaymentMode) => {
          const isActive = bankPaymentMode.isActive;
          console.log(`Payment Mode: ${bankPaymentMode.name}, isActive: ${isActive}, showBlocked: ${showBlocked}`);
          
          if (showBlocked) {
            // Show inactive/blocked payment modes (isActive = 0)
            return isActive === 0;
          } else {
            // Show active payment modes (isActive = 1)
            return isActive === 1;
          }
        });

        console.log('Filtered payment modes:', filteredBankPaymentModes);
        
        // Sort by id in ascending order
        const sortedBankPaymentModes = filteredBankPaymentModes.sort((a: BankPaymentMode, b: BankPaymentMode) => a.id - b.id);
        setBankPaymentModes(sortedBankPaymentModes);
      } catch (err) {
        console.error('Error loading payment modes:', err);
        showErrorToast('Failed to load payment modes');
      } finally {
        setLoadingBankPaymentModes(false);
      }
    };

    loadBankPaymentModes();
  }, [showBlocked]);

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
      showValidationError("Bank payment mode name is required.");
      setTimeout(() => nameRef.current?.focus(), 100);
      return;
    }

    // Check for duplicate name
    const existingBankPaymentMode = bankPaymentModes.find(bankPaymentMode =>
      bankPaymentMode.name?.toLowerCase() === form.name.trim().toLowerCase() &&
      (!editingId || bankPaymentMode.id !== editingId)
    );

    if (existingBankPaymentMode) {
      showValidationError('A payment mode with this name already exists.');
      return;
    }

    setLoading(true);

    try {
      let response: any;
      if (editingId !== null) {
        // Update existing bank payment mode
        response = await apiService.updatePaymentMode(editingId, form.name.trim());

        // Update local state
        setBankPaymentModes((prev) =>
          prev.map((t) =>
            t.id === editingId
              ? { ...t, name: form.name.trim() }
              : t
          )
        );
        showSuccessToast("Payment mode updated successfully!");
      } else {
        // Add new bank payment mode
        response = await apiService.savePaymentMode(form.name.trim());

        // Add to local state (the API response should contain the new ID)
        const newMode: BankPaymentMode = {
          id: response.id || Date.now(),
          name: form.name.trim(),
          isActive: 1,
          entDateTime: new Date().toISOString(),
          uid: loginData?.id || 1,
        };
        setBankPaymentModes((prev) => [newMode, ...prev]);
        showSuccessToast("Payment mode added successfully!");
      }

      // Reset form
      setForm({ name: "" });
      setEditingId(null);
    } catch (error: any) {
      console.error('Error saving payment mode:', error);
      showErrorToast(error.response?.data?.message || `Failed to ${editingId ? 'update' : 'add'} payment mode. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: number) => {
    const bankPaymentMode = bankPaymentModes.find((t) => t.id === id);
    if (!bankPaymentMode) return;

    setForm({
      name: bankPaymentMode.name,
    });
    setEditingId(id);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ name: "" });
  };

  const handleBlock = async (id: number) => {
    try {
      await apiService.blockPaymentMode(id);
      setBankPaymentModes((prev) =>
        prev.map((t) => (t.id === id ? { ...t, isActive: 0 } : t))
      );
      showSuccessToast("Payment mode blocked successfully");
    } catch (error: any) {
      console.error('Error blocking payment mode:', error);
      showErrorToast(error.response?.data?.message || 'Failed to block payment mode');
    }
  };

  const handleUnblock = async (id: number) => {
    try {
      await apiService.unblockPaymentMode(id);
      setBankPaymentModes((prev) =>
        prev.map((t) => (t.id === id ? { ...t, isActive: 1 } : t))
      );
      showSuccessToast("Payment mode unblocked successfully");
    } catch (error: any) {
      console.error('Error unblocking payment mode:', error);
      showErrorToast(error.response?.data?.message || 'Failed to unblock payment mode');
    }
  };

  const activeBankPaymentModes = bankPaymentModes.filter((t) => t.isActive === 1);
  const blockedBankPaymentModes = bankPaymentModes.filter((t) => t.isActive === 0);

  // Search functionality for active bank payment modes
  const {
    filteredData: filteredActiveBankPaymentModes,
    searchTerm: activeSearchTerm,
    setSearchTerm: setActiveSearchTerm,
    resultCount: activeResultCount,
    totalCount: activeTotalCount,
  } = useTableSearch({
    data: activeBankPaymentModes,
    searchFields: ["name"],
  });

  // Search functionality for blocked bank payment modes
  const {
    filteredData: filteredBlockedBankPaymentModes,
    searchTerm: blockedSearchTerm,
    setSearchTerm: setBlockedSearchTerm,
    resultCount: blockedResultCount,
    totalCount: blockedTotalCount,
  } = useTableSearch({
    data: blockedBankPaymentModes,
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
        title={editingId ? "Edit Payment Mode" : "Add Payment Mode"}
        subtitle={
          editingId
            ? "Update payment mode information"
            : "Create a new payment mode for the system"
        }
        badges={[
          { label: "Active", value: activeBankPaymentModes.length },
          { label: "Blocked", value: blockedBankPaymentModes.length },
          { label: "Total", value: bankPaymentModes.length },
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
                      Payment Mode Name <span style={{ color: "red" }}>*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleInputChange}
                      ref={nameRef}
                      placeholder="Enter payment mode name"
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
                          Update Payment Mode
                        </>
                      ) : (
                        <>
                          Add Payment Mode
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
                        EXISTING PAYMENT MODE
                      </h5>
                      <span
                        className="badge"
                        style={{
                          background: "#28a745",
                          fontSize: "var(--font-size-xs)",
                          padding: "4px 8px",
                        }}
                      >
                        {filteredActiveBankPaymentModes.length + filteredBlockedBankPaymentModes.length}
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
                    placeholder={`Search payment modes by name...`}
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
                        <th>Payment Mode</th>
                        <th>Edit / Block</th>
                        <th>Unblock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingBankPaymentModes ? (
                        <tr>
                          <td colSpan={4} style={{ textAlign: "center" }}>
                            <i className="fas fa-spinner fa-spin me-2"></i>
                            Loading payment modes...
                          </td>
                        </tr>
                      ) : (showBlocked
                        ? filteredBlockedBankPaymentModes
                        : filteredActiveBankPaymentModes
                      ).length === 0 ? (
                        <tr>
                          <td colSpan={4} style={{ textAlign: "center" }}>
                            {showBlocked
                              ? blockedSearchTerm
                                ? "No blocked payment modes match your search."
                                : "No blocked payment modes."
                              : activeSearchTerm
                              ? "No active payment modes match your search."
                              : "No active payment modes."}
                          </td>
                        </tr>
                      ) : (
                        (showBlocked
                          ? filteredBlockedBankPaymentModes
                          : filteredActiveBankPaymentModes
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

export default BankPaymentMode;