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
import { faUniversity } from "@fortawesome/free-solid-svg-icons";
import { SystemAdminApiService } from "../../../../api/system-admin/system-admin-api-service";

interface BankDetail {
  id: number;
  name: string;
  isActive: number;
  entDateTime?: string;
  uid?: number;
}

const BankDetails = () => {
  const navigate = useNavigate();
  const loginData = useSelector((state: RootState) => state.loginData);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const apiService = new SystemAdminApiService();

  // Refs for input fields to enable focus on validation errors
  const bankDetailsRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "",
  });
  const [bankDetails, setBankDetails] = useState<BankDetail[]>([]);
  const [loadingBankDetails, setLoadingBankDetails] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showBlocked, setShowBlocked] = useState(false);

  // Load bank details on component mount and when showBlocked changes
  useEffect(() => {
    const loadBankDetails = async () => {
      try {
        setLoadingBankDetails(true);
        const response = await apiService.fetchAllBankDetails();
        console.log('All bank details from API:', response);
        
        // Filter based on showBlocked state
        const filteredBankDetails = response.filter((bankDetail: BankDetail) => {
          const isActive = bankDetail.isActive;
          console.log(`Bank: ${bankDetail.name}, isActive: ${isActive}, showBlocked: ${showBlocked}`);
          
          if (showBlocked) {
            // Show inactive/blocked bank details (isActive = 0)
            return isActive === 0;
          } else {
            // Show active bank details (isActive = 1)
            return isActive === 1;
          }
        });

        console.log('Filtered bank details:', filteredBankDetails);
        
        // Sort by id in ascending order
        const sortedBankDetails = filteredBankDetails.sort((a: BankDetail, b: BankDetail) => a.id - b.id);
        setBankDetails(sortedBankDetails);
      } catch (err) {
        console.error('Error loading bank details:', err);
        showErrorToast('Failed to load bank details');
      } finally {
        setLoadingBankDetails(false);
      }
    };

    loadBankDetails();
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
      showValidationError("Bank name is required.");
      setTimeout(() => bankDetailsRef.current?.focus(), 100);
      return;
    }

    // Check for duplicate name
    const existingBankDetail = bankDetails.find(bankDetail =>
      bankDetail.name?.toLowerCase() === form.name.trim().toLowerCase() &&
      (!editingId || bankDetail.id !== editingId)
    );

    if (existingBankDetail) {
      showValidationError('A bank detail with this name already exists.');
      return;
    }

    setLoading(true);

    try {
      let response: any;
      if (editingId !== null) {
        // Update existing bank detail
        response = await apiService.updateBankDetails(editingId, form.name.trim());

        // Update local state
        setBankDetails((prev) =>
          prev.map((t) =>
            t.id === editingId
              ? { ...t, name: form.name.trim() }
              : t
          )
        );
        showSuccessToast("Bank detail updated successfully!");
      } else {
        // Add new bank detail
        response = await apiService.saveBankDetails(form.name.trim());

        // Add to local state (the API response should contain the new ID)
        const newBankDetail: BankDetail = {
          id: response.id || Date.now(),
          name: form.name.trim(),
          isActive: 1,
          entDateTime: new Date().toISOString(),
          uid: loginData?.id || 1,
        };

        setBankDetails((prev) => [newBankDetail, ...prev]);
        showSuccessToast("Bank detail added successfully!");
      }

      setForm({ name: "" });
      setEditingId(null);
    } catch (error: any) {
      console.error('Error saving bank detail:', error);
      showErrorToast(error.response?.data?.message || `Failed to ${editingId ? 'update' : 'add'} bank detail. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: number) => {
    const bankDetail = bankDetails.find((t) => t.id === id);
    if (!bankDetail) return;

    // Populate form with bank detail data
    setForm({
      name: bankDetail.name,
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
      await apiService.blockBankDetails(id);
      setBankDetails((prev) =>
        prev.map((t) => (t.id === id ? { ...t, isActive: 0 } : t))
      );
      showSuccessToast("Bank detail blocked successfully");
    } catch (error: any) {
      console.error('Error blocking bank detail:', error);
      showErrorToast(error.response?.data?.message || 'Failed to block bank detail');
    }
  };

  const handleUnblock = async (id: number) => {
    try {
      await apiService.unblockBankDetails(id);
      setBankDetails((prev) =>
        prev.map((t) => (t.id === id ? { ...t, isActive: 1 } : t))
      );
      showSuccessToast("Bank detail unblocked successfully");
    } catch (error: any) {
      console.error('Error unblocking bank detail:', error);
      showErrorToast(error.response?.data?.message || 'Failed to unblock bank detail');
    }
  };

  const activeBankDetails = bankDetails.filter((t) => t.isActive === 1);
  const blockedBankDetails = bankDetails.filter((t) => t.isActive === 0);

  // Search functionality for active bank details
  const {
    filteredData: filteredActiveBankDetails,
    searchTerm: activeSearchTerm,
    setSearchTerm: setActiveSearchTerm,
    resultCount: activeResultCount,
    totalCount: activeTotalCount,
  } = useTableSearch({
    data: activeBankDetails,
    searchFields: ["name"],
  });

  // Search functionality for blocked bank details
  const {
    filteredData: filteredBlockedBankDetails,
    searchTerm: blockedSearchTerm,
    setSearchTerm: setBlockedSearchTerm,
    resultCount: blockedResultCount,
    totalCount: blockedTotalCount,
  } = useTableSearch({
    data: blockedBankDetails,
    searchFields: ["name"],
  });

  const handleBackToModules = () => {
    navigate(routerPathNames.systemAdmin.base);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", minHeight: 0, overflow: "hidden" }}>
      <div className="content-header" style={{ flexShrink: 0 }}>
        <PageHeader
          icon={faUniversity}
          title={editingId ? "Edit Bank Details" : "Add Bank Details"}
          subtitle={
            editingId
              ? "Update bank details information"
              : "Create a new bank details entry for the system"
          }
          badges={[
            { label: "Active", value: activeBankDetails.length },
            { label: "Blocked", value: blockedBankDetails.length },
            { label: "Total", value: bankDetails.length },
          ]}
        />
      </div>
      <div className="content-body" style={{ display: "flex", flex: 1, minHeight: 0, gap: "1rem", overflowX: "hidden", overflowY: "auto" }}>
        {/* -------- Left Side Form -------- */}
        <div style={{ display: "flex", flex: "0 0 58%", minWidth: 0, flexDirection: "column" }}>
          <div
            className="shadow-sm"
            style={{
              padding: "2rem",
              background: "white",
              borderRadius: "10px",
              display: "flex",
              flexDirection: "column",
              height: "100%",
              minHeight: 0,
            }}
          >
            <div style={{ flex: 1, minHeight: 0, overflowY: "auto", paddingRight: "8px" }}>
              <h3 style={{ textAlign: "center", marginBottom: "1rem", flexShrink: 0 }}>
                {editingId ? "Edit Bank Details" : "Add New Bank Details"}
              </h3>
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Bank Name <span style={{ color: "red" }}>*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleInputChange}
                      ref={bankDetailsRef}
                      placeholder="Enter bank name"
                      required
                    />
                  </Form.Group>
                </Form>
              </div>
              <div
                style={{
                  paddingTop: "1rem",
                  borderTop: "2px solid #e0e0e0",
                  flexShrink: 0,
                }}
              >
                <Button
                  variant="primary"
                  onClick={handleAddOrUpdate}
                  disabled={loading}
                  style={{ marginRight: "10px", minWidth: "150px", fontWeight: "var(--font-weight-semibold)" }}
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin me-2"></i>
                      Saving...
                    </>
                  ) : editingId ? (
                    "Update"
                  ) : (
                    "Add"
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
            </div>
        </div>

        {/* -------- Right Side List -------- */}
        <div style={{ display: "flex", flex: "0 0 42%", minWidth: 0, flexDirection: "column" }}>
          <Card
            className="shadow-sm"
            style={{
              background: "white",
              borderRadius: "12px",
              border: "1px solid #e0e0e0",
              display: "flex",
              flexDirection: "column",
              height: "100%",
              minHeight: 0,
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
                flexShrink: 0,
              }}
            >
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <i className="fas fa-list-check" style={{ fontSize: "var(--font-size-2xl)", color: "#28a745" }}></i>
                      <h5 className="mb-0" style={{ fontWeight: "var(--font-weight-semibold)" }}>
                        Bank Details
                      </h5>
                      <span
                        className="badge"
                        style={{
                          background: "#28a745",
                          fontSize: "var(--font-size-xs)",
                          padding: "4px 8px",
                        }}
                      >
                        {showBlocked ? filteredBlockedBankDetails.length : filteredActiveBankDetails.length}
                      </span>
                    </div>
                    <Button
                      variant={showBlocked ? "outline-success" : "outline-danger"}
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
                    placeholder="Search bank details by name..."
                    resultCount={
                      showBlocked ? blockedResultCount : activeResultCount
                    }
                    totalCount={
                      showBlocked ? blockedTotalCount : activeTotalCount
                    }
                    showResultCount={true}
                  />
                </div>

            <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
              <Table striped bordered hover>
                <thead
                  style={{
                    position: "sticky",
                    top: 0,
                    backgroundColor: "#f8f9fa",
                    zIndex: 10,
                  }}
                >
                      <tr>
                        <th>S No</th>
                        <th>Bank Name</th>
                        <th>Edit / Block</th>
                        <th>Unblock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingBankDetails ? (
                        <tr>
                          <td colSpan={4} style={{ textAlign: "center" }}>
                            <i className="fas fa-spinner fa-spin me-2"></i>
                            Loading bank details...
                          </td>
                        </tr>
                      ) : (showBlocked
                        ? filteredBlockedBankDetails
                        : filteredActiveBankDetails
                      ).length === 0 ? (
                        <tr>
                          <td colSpan={4} style={{ textAlign: "center" }}>
                            {showBlocked
                              ? blockedSearchTerm
                                ? "No blocked bank details match your search."
                                : "No blocked bank details."
                              : activeSearchTerm
                              ? "No active bank details match your search."
                              : "No active bank details."}
                          </td>
                        </tr>
                      ) : (
                        (showBlocked
                          ? filteredBlockedBankDetails
                          : filteredActiveBankDetails
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
                              ) : editingId !== t.id ? (
                                <Button
                                  variant="outline-primary"
                                  size="sm"
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
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleBlock(t.id)}
                                >
                                  Block
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BankDetails;