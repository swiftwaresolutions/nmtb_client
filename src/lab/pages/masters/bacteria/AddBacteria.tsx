import React, { useState, useEffect } from "react";
import {
  Container,
  Form,
  Button,
  Row,
  Col,
  Card,
  Table,
} from "react-bootstrap";
import { ListCheck, ShieldX, ArrowRepeat } from "react-bootstrap-icons";
import SearchInput from "../../../../components/SearchInput";
import { useTableSearch } from "../../../../hooks/useTableSearch";
import LaboratoryApiService from "../../../../api/laboratory/laboratory-api-service";
import {
  showSuccessToast,
  showErrorToast,
  showConfirmDialog,
} from "../../../../utils/alertUtil";
import { useSelector } from "react-redux";
import { RootState } from "../../../../state/store";
import PageHeader from "../../../../components/PageHeader";
import { faBacteria } from "@fortawesome/free-solid-svg-icons";

interface Bacteria {
  bacteriaCode: number;
  bacteriaName: string;
  bacteriaDesc: string;
  isBlocked: number;
}

const AddBacteria = () => {
  const laboratoryApi = new LaboratoryApiService();
  const loginData = useSelector((state: RootState) => state.loginData);
  const [bacteriaList, setBacteriaList] = useState<Bacteria[]>([]);
  const [form, setForm] = useState({ name: "", description: "" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showBlocked, setShowBlocked] = useState(false);

  // Fetch all bacteria from API
  const fetchBacteria = async () => {
    setLoading(true);
    try {
      const res = await laboratoryApi.fetchAllLabBacteria();
      setBacteriaList(Array.isArray(res) ? res : []);
    } catch (err) {
      showErrorToast("Failed to fetch bacteria");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBacteria();
    // eslint-disable-next-line
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleAddOrUpdate = async () => {
    if (!form.name.trim()) {
      showErrorToast("Please enter bacteria name.");
      return;
    }
    setLoading(true);
    try {
      if (editingId !== null) {
        await laboratoryApi.updateLabBacteria(editingId, {
          bacteriaName: form.name,
          bacteriaDesc: form.description,
          isBlocked: 0,
          uid: loginData?.id,
        });
        showSuccessToast("Bacteria updated successfully!");
      } else {
        await laboratoryApi.saveLabBacteria({
          bacteriaName: form.name,
          bacteriaDesc: form.description,
          uid: loginData?.id,
        });
        showSuccessToast("Bacteria added successfully!");
      }
      setForm({ name: "", description: "" });
      setEditingId(null);
      fetchBacteria();
    } catch (err) {
      showErrorToast("Failed to save bacteria");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: number) => {
    const b = bacteriaList.find((b) => b.bacteriaCode === id);
    if (b) {
      setForm({ name: b.bacteriaName, description: b.bacteriaDesc });
      setEditingId(id);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ name: "", description: "" });
  };

  const handleBlock = async (id: number) => {
    const result = await showConfirmDialog(
      "Do you want to block this bacteria?",
      "Are you sure?",
      "Yes, block it!",
      "Cancel"
    );
    if (result.isConfirmed) {
      try {
        const bacteria = bacteriaList.find((b) => b.bacteriaCode === id);
        if (!bacteria) return;
        await laboratoryApi.updateLabBacteria(id, {
          bacteriaName: bacteria.bacteriaName,
          bacteriaDesc: bacteria.bacteriaDesc,
          isBlocked: 1,
          uid: loginData?.id,
        });
        fetchBacteria();
        showSuccessToast("Bacteria has been blocked.", "Blocked!");
      } catch (err) {
        showErrorToast("Failed to block bacteria");
      }
    }
  };

  const handleUnblock = async (id: number) => {
      try {
        const bacteria = bacteriaList.find((b) => b.bacteriaCode === id);
        if (!bacteria) return;
        await laboratoryApi.updateLabBacteria(id, {
          bacteriaName: bacteria.bacteriaName,
          bacteriaDesc: bacteria.bacteriaDesc,
          isBlocked: 0,
          uid: loginData?.id,
        });
        fetchBacteria();
        showSuccessToast("Bacteria has been unblocked.", "Unblocked!");
      } catch (err) {
        showErrorToast("Failed to unblock bacteria");
      }
  };

  const activeBacteria = bacteriaList.filter((b) => b.isBlocked === 0);
  const blockedBacteria = bacteriaList.filter((b) => b.isBlocked === 1);

  // Search functionality for active bacteria
  const {
    filteredData: filteredActiveBacteria,
    searchTerm: activeSearchTerm,
    setSearchTerm: setActiveSearchTerm,
    resultCount: activeResultCount,
    totalCount: activeTotalCount,
  } = useTableSearch({
    data: activeBacteria,
    searchFields: ["bacteriaName"],
  });

  // Search functionality for blocked bacteria
  const {
    filteredData: filteredBlockedBacteria,
    searchTerm: blockedSearchTerm,
    setSearchTerm: setBlockedSearchTerm,
    resultCount: blockedResultCount,
    totalCount: blockedTotalCount,
  } = useTableSearch({
    data: blockedBacteria,
    searchFields: ["bacteriaName"],
  });

  const filteredBacteria = showBlocked
    ? filteredBlockedBacteria
    : filteredActiveBacteria;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", minHeight: 0, overflow: "hidden" }}>
      <PageHeader icon={faBacteria} title={editingId ? "Edit Bacteria Master" : "Add Bacteria Master"} subtitle="" /> 
      <div className="px-2" style={{ display: "flex", flex: 1, minHeight: 0, gap: "1rem", overflowX: "hidden", overflowY: "auto" }}>
            {/* Left: Form */}
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
                <h4 style={{ textAlign: "center", marginBottom: "1rem", flexShrink: 0 }}>
                  {editingId ? "Edit Bacteria" : "Add New Bacteria"}
                </h4>
                <div style={{ flex: 1, minHeight: 0, overflowY: "auto", paddingRight: "8px" }}>
                  <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Bacteria Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleInputChange}
                      placeholder="Enter bacteria name"
                      disabled={loading}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Bacteria Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      name="description"
                      value={form.description}
                      onChange={handleInputChange}
                      placeholder="Enter description"
                      rows={3}
                      disabled={loading}
                    />
                    </Form.Group>
                  </Form>
                </div>
                <div
                  className="d-flex justify-content-start mt-3"
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
                    style={{ marginRight: "10px" }}
                  >
                    {loading
                      ? "Saving..."
                      : editingId
                      ? "Update Bacteria"
                      : "Add Bacteria"}
                  </Button>
                  {editingId && (
                    <Button
                      variant="secondary"
                      onClick={handleCancelEdit}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </div>
            {/* Right: List */}
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
                      {showBlocked ? (
                        <ShieldX size={22} color="#dc3545" />
                      ) : (
                        <ListCheck size={22} color="#28a745" />
                      )}
                      <h5 className="mb-0" style={{ fontWeight: "600" }}>
                        {showBlocked ? "Blocked Bacteria" : "Active Bacteria"}
                      </h5>
                      <span
                        className="badge"
                        style={{
                          background: showBlocked ? "#dc3545" : "#28a745",
                          fontSize: "11px",
                          padding: "4px 8px",
                        }}
                      >
                        {showBlocked
                          ? filteredBlockedBacteria.length
                          : filteredActiveBacteria.length}
                      </span>
                    </div>
                    <Button
                      variant={
                        showBlocked ? "outline-success" : "outline-danger"
                      }
                      size="sm"
                      onClick={() => setShowBlocked(!showBlocked)}
                      style={{
                        borderRadius: "20px",
                        padding: "6px 16px",
                        fontWeight: "500",
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
                    placeholder={`Search bacteria by name...`}
                    resultCount={
                      showBlocked ? blockedResultCount : activeResultCount
                    }
                    totalCount={
                      showBlocked ? blockedTotalCount : activeTotalCount
                    }
                    showResultCount={true}
                  />
                </div>
                {/* Scrollable Table Content */}
                <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
                  <Table striped bordered hover>
                    <thead style={{ position: "sticky", top: 0, backgroundColor: "#f8f9fa", zIndex: 10 }}>
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBacteria.length === 0 ? (
                        <tr>
                          <td colSpan={4} style={{ textAlign: "center" }}>
                            {showBlocked
                              ? blockedSearchTerm
                                ? "No blocked bacteria match your search."
                                : "No blocked bacteria."
                              : activeSearchTerm
                              ? "No active bacteria match your search."
                              : "No active bacteria."}
                          </td>
                        </tr>
                      ) : (
                        filteredBacteria.map((b, idx) => (
                          <tr
                            key={b.bacteriaCode}
                            style={{
                              backgroundColor:
                                editingId === b.bacteriaCode
                                  ? "#fff3cd"
                                  : "transparent",
                              fontWeight:
                                editingId === b.bacteriaCode ? "600" : "normal",
                              borderLeft:
                                editingId === b.bacteriaCode
                                  ? "4px solid #ffc107"
                                  : "none",
                            }}
                          >
                            <td>{idx + 1}</td>
                            <td>
                              {b.bacteriaName}
                              {editingId === b.bacteriaCode && (
                                <span className="ms-2 badge bg-warning text-dark">
                                  <i className="fas fa-edit me-1"></i>
                                  Editing
                                </span>
                              )}
                            </td>
                            <td>{b.bacteriaDesc}</td>
                            <td>
                              {showBlocked ? (
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  onClick={() => handleUnblock(b.bacteriaCode)}
                                >
                                  Unblock
                                </Button>
                              ) : (
                                <>
                                  {editingId !== b.bacteriaCode ? (
                                    <>
                                      <Button
                                        variant="outline-primary"
                                        size="sm"
                                        className="me-2"
                                        onClick={() =>
                                          handleEdit(b.bacteriaCode)
                                        }
                                        disabled={loading}
                                      >
                                        Edit
                                      </Button>
                                      <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() =>
                                          handleBlock(b.bacteriaCode)
                                        }
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
            </div>
      </div>
    </div>
  );
};

export default AddBacteria;
