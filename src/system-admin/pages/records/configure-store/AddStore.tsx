import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
import { RootState } from "../../../../state/store";
import { routerPathNames } from "../../../../routes/routerPathNames";
import SearchInput from "../../../../components/SearchInput";
import { useTableSearch } from "../../../../hooks/useTableSearch";
import {
  showSuccessToast,
  showErrorToast,
  showValidationError,
} from "../../../../utils/alertUtil";
import {
  Gear,
  ClipboardCheck,
  FileText,
  BarChartFill,
  Bullseye,
  Sliders2,
  PencilSquare,
  PlusCircle,
  XCircle,
  Clock,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ListCheck,
  ShieldX,
  ArrowRepeat,
} from "react-bootstrap-icons";

interface Store {
  id: number;
  storeName: string;
  type: string;
  salesType: string;
  organization: string;
  group: string;
  code: string;
  blocked: number;
  entDateTime: string;
  uid: number;
}

const AddStore = () => {
  const navigate = useNavigate();

  // Refs for input fields to enable focus on validation errors
  const storeNameRef = useRef<HTMLInputElement>(null);
  const typeRef = useRef<HTMLSelectElement>(null);
  const salesTypeRef = useRef<HTMLSelectElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    storeName: "",
    type: "",
    salesType: "",
    organization: "Dr.H.Roberts Hospital",
    group: "Pharmacy Store",
    code: "",
  });
  const [stores, setStores] = useState<Store[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showBlocked, setShowBlocked] = useState(false);

  // Dummy data for dropdowns
  const [types] = useState([
    { id: "medical", name: "Medical Store" },
    { id: "non-medical", name: "Non-Medical Store" },
    { id: "pharmacy", name: "Pharmacy" },
    { id: "dispensary", name: "Dispensary" },
  ]);

  const [salesTypes] = useState([
    { id: "retail", name: "Retail" },
    { id: "wholesale", name: "Wholesale" },
    { id: "both", name: "Both" },
  ]);

  // Fetch stores on component mount
  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      // TODO: Implement API call to fetch stores
      // For now, using dummy data
      const dummyData: Store[] = [
        {
          id: 1,
          storeName: "Main Pharmacy Store",
          type: "pharmacy",
          salesType: "retail",
          organization: "Dr.H.Roberts Hospital",
          group: "Pharmacy Store",
          code: "PH001",
          blocked: 0,
          entDateTime: "2024-01-01T10:00:00",
          uid: 1,
        },
        {
          id: 2,
          storeName: "Medical Supplies Store",
          type: "medical",
          salesType: "both",
          organization: "Dr.H.Roberts Hospital",
          group: "Pharmacy Store",
          code: "MS001",
          blocked: 0,
          entDateTime: "2024-01-01T10:00:00",
          uid: 1,
        },
        {
          id: 3,
          storeName: "General Store",
          type: "non-medical",
          salesType: "wholesale",
          organization: "Dr.H.Roberts Hospital",
          group: "Pharmacy Store",
          code: "GS001",
          blocked: 1,
          entDateTime: "2024-01-01T10:00:00",
          uid: 1,
        },
      ];
      setStores(dummyData);
    } catch (error) {
      console.error("Error fetching stores:", error);
    }
  };

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
    if (!form.storeName.trim()) {
      showValidationError("Store or Dispensary Name is required.");
      setTimeout(() => storeNameRef.current?.focus(), 100);
      return;
    }

    if (!form.type.trim()) {
      showValidationError("Type is required.");
      setTimeout(() => typeRef.current?.focus(), 100);
      return;
    }

    if (!form.salesType.trim()) {
      showValidationError("Sales Type is required.");
      setTimeout(() => salesTypeRef.current?.focus(), 100);
      return;
    }

    if (!form.code.trim()) {
      showValidationError("Code is required.");
      setTimeout(() => codeRef.current?.focus(), 100);
      return;
    }

    setLoading(true);

    try {
      // TODO: Implement API call to save/update store
      if (editingId !== null) {
        // Update existing store
        showSuccessToast("Store updated successfully!");
      } else {
        // Save new store
        showSuccessToast("Store created successfully!");
      }

      // Reset form
      setForm({
        storeName: "",
        type: "",
        salesType: "",
        organization: "Dr.H.Roberts Hospital",
        group: "Pharmacy Store",
        code: "",
      });
      setEditingId(null);

      // Refresh stores list
      fetchStores();
    } catch (error: any) {
      console.error("Error saving store:", error);
      showErrorToast(
        error?.response?.data?.error || "Failed to save store. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: number) => {
    const store = stores.find((s) => s.id === id);
    if (!store) return;

    setForm({
      storeName: store.storeName,
      type: store.type,
      salesType: store.salesType,
      organization: store.organization,
      group: store.group,
      code: store.code,
    });
    setEditingId(id);
  };

  const handleCancelEdit = () => {
    setForm({
      storeName: "",
      type: "",
      salesType: "",
      organization: "Dr.H.Roberts Hospital",
      group: "Pharmacy Store",
      code: "",
    });
    setEditingId(null);
  };

  const handleBlock = async (id: number) => {
    const store = stores.find((s) => s.id === id);
    if (!store) return;

    try {
      // TODO: Implement API call to block store
      // For now, just update local state
      setStores(
        stores.map((s) => (s.id === id ? { ...s, blocked: 1 } : s))
      );
      showSuccessToast("Store blocked successfully");
    } catch (error: any) {
      console.error("Error blocking store:", error);
      showErrorToast(
        error?.response?.data?.error ||
          "Failed to block store. Please try again."
      );
    }
  };

  const handleUnblock = async (id: number) => {
    const store = stores.find((s) => s.id === id);
    if (!store) return;

    try {
      // TODO: Implement API call to unblock store
      // For now, just update local state
      setStores(
        stores.map((s) => (s.id === id ? { ...s, blocked: 0 } : s))
      );
      showSuccessToast("Store unblocked successfully");
    } catch (error: any) {
      console.error("Error unblocking store:", error);
      showErrorToast(
        error?.response?.data?.error ||
          "Failed to unblock store. Please try again."
      );
    }
  };

  const activeStores = stores.filter((s) => s.blocked === 0);
  const blockedStores = stores.filter((s) => s.blocked === 1);

  // Search functionality for active stores
  const {
    filteredData: filteredActiveStores,
    searchTerm: activeSearchTerm,
    setSearchTerm: setActiveSearchTerm,
    resultCount: activeResultCount,
    totalCount: activeTotalCount,
  } = useTableSearch({
    data: activeStores,
    searchFields: ["storeName", "code", "type"],
  });

  // Search functionality for blocked stores
  const {
    filteredData: filteredBlockedStores,
    searchTerm: blockedSearchTerm,
    setSearchTerm: setBlockedSearchTerm,
    resultCount: blockedResultCount,
    totalCount: blockedTotalCount,
  } = useTableSearch({
    data: blockedStores,
    searchFields: ["storeName", "code", "type"],
  });

  const handleBack = () => {
    navigate(routerPathNames.systemAdmin.dashboard);
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
                onClick={handleBack}
                title="Back to Dashboard"
              >
                <i className="fas fa-arrow-left me-2"></i>
                Back
              </button>
              <h4 className="mb-0">
                <i className="fas fa-store me-2"></i>
                {editingId ? "Edit Store Master" : "Add Store Master"}
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
            {editingId ? "Update store information and configuration" : "Create a new store or dispensary with appropriate settings"}
          </p>
        </div>
      </div>
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
                      Store or Dispensary Name <span style={{ color: "red" }}>*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="storeName"
                      value={form.storeName}
                      onChange={handleInputChange}
                      ref={storeNameRef}
                      placeholder="Enter store name"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>
                      Type <span style={{ color: "red" }}>*</span>
                    </Form.Label>
                    <Form.Control
                      as="select"
                      name="type"
                      value={form.type}
                      onChange={handleInputChange}
                      ref={typeRef}
                      required
                    >
                      <option value="">-- Select Type --</option>
                      {types.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>
                      Sales Type <span style={{ color: "red" }}>*</span>
                    </Form.Label>
                    <Form.Control
                      as="select"
                      name="salesType"
                      value={form.salesType}
                      onChange={handleInputChange}
                      ref={salesTypeRef}
                      required
                    >
                      <option value="">-- Select Sales Type --</option>
                      {salesTypes.map((salesType) => (
                        <option key={salesType.id} value={salesType.id}>
                          {salesType.name}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Organization</Form.Label>
                    <Form.Control
                      type="text"
                      name="organization"
                      value={form.organization}
                      readOnly
                      style={{ backgroundColor: '#f8f9fa' }}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Group</Form.Label>
                    <Form.Control
                      type="text"
                      name="group"
                      value={form.group}
                      readOnly
                      style={{ backgroundColor: '#f8f9fa' }}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>
                      Code <span style={{ color: "red" }}>*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="code"
                      value={form.code}
                      onChange={handleInputChange}
                      ref={codeRef}
                      placeholder="Enter store code"
                      required
                    />
                  </Form.Group>

                  <div
                    className="d-flex justify-content-between mt-4"
                    style={{
                      paddingTop: "1.5rem",
                      borderTop: "2px solid #e0e0e0",
                    }}
                  >
                    <Button
                      variant="outline-secondary"
                      onClick={() => navigate(routerPathNames.systemAdmin.dashboard)}
                      style={{ minWidth: "120px", fontWeight: "var(--font-weight-medium)" }}
                    >
                      <ChevronLeft /> Back
                    </Button>
                    <div>
                      <Button
                        variant="success"
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
                            <Clock /> Saving...
                          </>
                        ) : editingId ? (
                          <>
                            <PencilSquare /> Update Store
                          </>
                        ) : (
                          <>
                            <CheckCircle /> Create Store
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
                          Cancel
                        </Button>
                      )}
                    </div>
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
                      {showBlocked ? (
                        <ShieldX size={22} color="#dc3545" />
                      ) : (
                        <ListCheck size={22} color="#28a745" />
                      )}
                      <h5 className="mb-0" style={{ fontWeight: "var(--font-weight-semibold)" }}>
                        {showBlocked ? "Blocked Stores" : "Active Stores"}
                      </h5>
                      <span
                        className="badge"
                        style={{
                          background: showBlocked ? "#dc3545" : "#28a745",
                          fontSize: "var(--font-size-xs)",
                          padding: "4px 8px",
                        }}
                      >
                        {showBlocked
                          ? filteredBlockedStores.length
                          : filteredActiveStores.length}
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
                      <ArrowRepeat size={16} />
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
                    placeholder={`Search stores by name, code, or type...`}
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
                        <th>#</th>
                        <th>Store Name</th>
                        <th>Type</th>
                        <th>Code</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(showBlocked
                        ? filteredBlockedStores
                        : filteredActiveStores
                      ).length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ textAlign: "center" }}>
                            {showBlocked
                              ? blockedSearchTerm
                                ? "No blocked stores match your search."
                                : "No blocked stores."
                              : activeSearchTerm
                              ? "No active stores match your search."
                              : "No active stores."}
                          </td>
                        </tr>
                      ) : (
                        (showBlocked
                          ? filteredBlockedStores
                          : filteredActiveStores
                        ).map((store, idx) => (
                          <tr
                            key={store.id}
                            style={{
                              backgroundColor:
                                editingId === store.id ? "#fff3cd" : "transparent",
                              fontWeight: editingId === store.id ? "var(--font-weight-semibold)" : "normal",
                              borderLeft:
                                editingId === store.id
                                  ? "4px solid #ffc107"
                                  : "none",
                            }}
                          >
                            <td>{idx + 1}</td>
                            <td>
                              {store.storeName}
                              {editingId === store.id && (
                                <span className="ms-2 badge bg-warning text-dark">
                                  <i className="fas fa-edit me-1"></i>
                                  Editing
                                </span>
                              )}
                            </td>
                            <td>
                              {types.find(t => t.id === store.type)?.name || store.type}
                            </td>
                            <td>{store.code}</td>
                            <td>
                              {showBlocked ? (
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  onClick={() => handleUnblock(store.id)}
                                >
                                  Unblock
                                </Button>
                              ) : (
                                <>
                                  {editingId !== store.id ? (
                                    <>
                                      <Button
                                        variant="outline-primary"
                                        size="sm"
                                        className="me-2"
                                        onClick={() => handleEdit(store.id)}
                                        disabled={loading}
                                      >
                                        Edit
                                      </Button>
                                      <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => handleBlock(store.id)}
                                      >
                                        Block
                                      </Button>
                                    </>
                                  ) : (
                                    <span className="text-muted fst-italic">
                                      Currently editing...
                                    </span>
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

export default AddStore;