import React, { useState, useEffect, useRef } from "react";
import { useNavigate} from "react-router-dom";
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
import { routerPathNames } from "../../../../routes/routerPathNames";
import SearchInput from "../../../../components/SearchInput";
import { useTableSearch } from "../../../../hooks/useTableSearch";
import {
  showSuccessToast,
  showErrorToast,
  showValidationError,
} from "../../../../utils/alertUtil";
import PageHeader from "../../../../components/PageHeader";
import { faMoneyBillWave } from "@fortawesome/free-solid-svg-icons";
import { SystemAdminApiService } from "../../../../api/system-admin/system-admin-api-service";

interface CashType {
  id: number;
  name: string;
  isActive: number;
  entDateTime?: string;
  uid?: number;
}

const CashType = () => {
  const navigate = useNavigate();
  const loginData = useSelector((state: RootState) => state.loginData);
  const apiService = new SystemAdminApiService();

  // Refs for input fields to enable focus on validation errors
  const nameRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "",
  });

  const [cashTypes, setCashTypes] = useState<CashType[]>([]);
  const [loadingCashTypes, setLoadingCashTypes] = useState(true);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showBlocked, setShowBlocked] = useState(false);

  // Load cash types on component mount and when showBlocked changes
  useEffect(() => {
    const loadCashTypes = async () => {
      try {
        setLoadingCashTypes(true);
        const response = await apiService.fetchAllPaymentTypes();
        console.log('All payment types from API:', response);
        
        // Filter based on showBlocked state
        const filteredCashTypes = response.filter((cashType: CashType) => {
          const isActive = cashType.isActive;
          console.log(`Payment Type: ${cashType.name}, isActive: ${isActive}, showBlocked: ${showBlocked}`);
          
          if (showBlocked) {
            // Show inactive/blocked payment types (isActive = 0)
            return isActive === 0;
          } else {
            // Show active payment types (isActive = 1)
            return isActive === 1;
          }
        });

        console.log('Filtered payment types:', filteredCashTypes);
        
        // Sort by id in ascending order
        const sortedCashTypes = filteredCashTypes.sort((a: CashType, b: CashType) => a.id - b.id);
        setCashTypes(sortedCashTypes);
      } catch (err) {
        console.error('Error loading payment types:', err);
        showErrorToast('Failed to load payment types');
      } finally {
        setLoadingCashTypes(false);
      }
    };

    loadCashTypes();
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
      showValidationError("Cash type name is required.");
      setTimeout(() => nameRef.current?.focus(), 100);
      return;
    }

    // Check for duplicate name
    const existingCashType = cashTypes.find(cashType =>
      cashType.name?.toLowerCase() === form.name.trim().toLowerCase() &&
      (!editingId || cashType.id !== editingId)
    );

    if (existingCashType) {
      showValidationError('A payment type with this name already exists.');
      return;
    }

    setLoading(true);

    try {
      let response: any;
      if (editingId !== null) {
        // Update existing cash type
        response = await apiService.updatePaymentType(editingId, form.name.trim());

        // Update local state
        setCashTypes((prev) =>
          prev.map((t) =>
            t.id === editingId
              ? { ...t, name: form.name.trim() }
              : t
          )
        );
        showSuccessToast("Payment type updated successfully!");
      } else {
        // Add new cash type
        response = await apiService.savePaymentType(form.name.trim());

        // Add to local state (the API response should contain the new ID)
        const newCashType: CashType = {
          id: response.id || Date.now(),
          name: form.name.trim(),
          isActive: 1,
          entDateTime: new Date().toISOString(),
          uid: loginData?.id || 1,
        };

        setCashTypes((prev) => [newCashType, ...prev]);
        showSuccessToast("Payment type added successfully!");
      }

      // Reset form
      setForm({
        name: "",
      });
      setEditingId(null);
    } catch (error: any) {
      console.error('Error saving payment type:', error);
      showErrorToast(error.response?.data?.message || `Failed to ${editingId ? 'update' : 'add'} payment type. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: number) => {
    const cashType = cashTypes.find((t) => t.id === id);
    if (!cashType) return;

    setForm({
      name: cashType.name,
    });
    setEditingId(id);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({
      name: "",
    });
  };

  const handleBlock = async (id: number) => {
    try {
      await apiService.blockPaymentType(id);
      setCashTypes((prev) =>
        prev.map((t) => (t.id === id ? { ...t, isActive: 0 } : t))
      );
      showSuccessToast("Payment type blocked successfully");
    } catch (error: any) {
      console.error('Error blocking payment type:', error);
      showErrorToast(error.response?.data?.message || 'Failed to block payment type');
    }
  };

  const handleUnblock = async (id: number) => {
    try {
      await apiService.unblockPaymentType(id);
      setCashTypes((prev) =>
        prev.map((t) => (t.id === id ? { ...t, isActive: 1 } : t))
      );
      showSuccessToast("Payment type unblocked successfully");
    } catch (error: any) {
      console.error('Error unblocking payment type:', error);
      showErrorToast(error.response?.data?.message || 'Failed to unblock payment type');
    }
  };

  const activeCashTypes = cashTypes.filter((t) => t.isActive === 1);
  const blockedCashTypes = cashTypes.filter((t) => t.isActive === 0);

  // Search functionality for active cash types
  const {
    filteredData: filteredActiveCashTypes,
    searchTerm: activeSearchTerm,
    setSearchTerm: setActiveSearchTerm,
    resultCount: activeResultCount,
    totalCount: activeTotalCount,
  } = useTableSearch({
    data: activeCashTypes,
    searchFields: ["name"],
  });

  // Search functionality for blocked cash types
  const {
    filteredData: filteredBlockedCashTypes,
    searchTerm: blockedSearchTerm,
    setSearchTerm: setBlockedSearchTerm,
    resultCount: blockedResultCount,
    totalCount: blockedTotalCount,
  } = useTableSearch({
    data: blockedCashTypes,
    searchFields: ["name"],
  });

  const handleBackToModules = () => {
    navigate(routerPathNames.systemAdmin.base);
  };

  return (
    <div>
      {/* Header Section */}
      <PageHeader
        icon={faMoneyBillWave}
        title={editingId ? "Edit Payment Type" : "Add Payment Type"}
        subtitle={
          editingId
            ? "Update payment type information"
            : "Create a new payment type for the system"
        }
        badges={[
          { label: "Active", value: activeCashTypes.length },
          { label: "Blocked", value: blockedCashTypes.length },
          { label: "Total", value: cashTypes.length },
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
                      Cash Type Name <span style={{ color: "red" }}>*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleInputChange}
                      ref={nameRef}
                      placeholder="Enter cash type name"
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
                          Update Cash Type
                        </>
                      ) : (
                        <>
                         
                          Add Cash Type
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
                        EXISTING PAYMENT TYPE
                      </h5>
                      <span
                        className="badge"
                        style={{
                          background: "#28a745",
                          fontSize: "var(--font-size-xs)",
                          padding: "4px 8px",
                        }}
                      >
                        {filteredActiveCashTypes.length + filteredBlockedCashTypes.length}
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
                    placeholder={`Search payment types by name...`}
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
                        <th>Payment Type</th>
                        <th>Edit / Block</th>
                        <th>Unblock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingCashTypes ? (
                        <tr>
                          <td colSpan={4} style={{ textAlign: "center" }}>
                            <i className="fas fa-spinner fa-spin me-2"></i>
                            Loading payment types...
                          </td>
                        </tr>
                      ) : (showBlocked
                        ? filteredBlockedCashTypes
                        : filteredActiveCashTypes
                      ).length === 0 ? (
                        <tr>
                          <td colSpan={4} style={{ textAlign: "center" }}>
                            {showBlocked
                              ? blockedSearchTerm
                                ? "No blocked payment types match your search."
                                : "No blocked payment types."
                              : activeSearchTerm
                              ? "No active payment types match your search."
                              : "No active payment types."}
                          </td>
                        </tr>
                      ) : (
                        (showBlocked
                          ? filteredBlockedCashTypes
                          : filteredActiveCashTypes
                        ).map((t, idx) => (
                          <tr
                            key={t.id}
                            style={{
                              backgroundColor:
                                editingId === t.id ? "#fff3cd" : "transparent",
                              fontWeight: editingId === t.id ? "var(--font-weight-semibold)" : "normal",
                              borderLeft:
                                editingId === t.id
                                  ? "4px solid #ffc107"
                                  : "none",
                            }}
                          >
                            <td>{idx + 1}</td>
                            <td>
                              {t.name}
                              {editingId === t.id && (
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
                                  {editingId !== t.id ? (
                                    <Button
                                      variant="outline-primary"
                                      size="sm"
                                      className="me-2"
                                      onClick={() => handleEdit(t.id)}
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
                                  onClick={() => handleUnblock(t.id)}
                                >
                                  Unblock
                                </Button>
                              ) : (
                                <>
                                  {editingId !== t.id ? (
                                    <Button
                                      variant="outline-danger"
                                      size="sm"
                                      onClick={() => handleBlock(t.id)}
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

export default CashType;