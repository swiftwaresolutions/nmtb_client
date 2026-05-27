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

interface Antibiotic {
  antCode: number;
  antName: string;
  antDesc: string;
  isBlocked: number;
}

const AddAntibiotics = () => {
  const laboratoryApi = new LaboratoryApiService();
  const loginData = useSelector((state: RootState) => state.loginData);
  const [antibiotics, setAntibiotics] = useState<Antibiotic[]>([]);
  const [form, setForm] = useState({ name: "", description: "" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showBlocked, setShowBlocked] = useState(false);

  // Fetch all antibiotics from API
  const fetchAntibiotics = async () => {
    setLoading(true);
    try {
      const res = await laboratoryApi.fetchAllLabAntibiotic();
      setAntibiotics(Array.isArray(res) ? res : []);
    } catch (err) {
      showErrorToast("Failed to fetch antibiotics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAntibiotics();
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
      showErrorToast("Please enter antibiotic name.");
      return;
    }
    setLoading(true);
    try {
      if (editingId !== null) {
        await laboratoryApi.updateLabAntibiotic(editingId, {
          antName: form.name,
          antDesc: form.description,
          isBlocked: 0,
          uid: loginData?.id,
        });
        showSuccessToast("Antibiotic updated successfully!");
      } else {
        await laboratoryApi.saveLabAntibiotic({
          antName: form.name,
          antDesc: form.description,
          uid: loginData?.id,
        });
        showSuccessToast("Antibiotic added successfully!");
      }
      setForm({ name: "", description: "" });
      setEditingId(null);
      fetchAntibiotics();
    } catch (err) {
      showErrorToast("Failed to save antibiotic");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: number) => {
    const ab = antibiotics.find((a) => a.antCode === id);
    if (ab) {
      setForm({ name: ab.antName, description: ab.antDesc });
      setEditingId(id);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ name: "", description: "" });
  };

  const handleBlock = async (id: number) => {
    const result = await showConfirmDialog(
      "Do you want to block this antibiotic?",
      "Are you sure?",
      "Yes, block it!",
      "Cancel"
    );
    if (result.isConfirmed) {
      try {
        const antibiotic = antibiotics.find((a) => a.antCode === id);
        if (!antibiotic) return;
        await laboratoryApi.updateLabAntibiotic(id, {
          antName: antibiotic.antName,
          antDesc: antibiotic.antDesc,
          isBlocked: 1,
          uid: loginData?.id,
        });
        fetchAntibiotics();
        showSuccessToast("Antibiotic has been blocked.", "Blocked!");
      } catch (err) {
        showErrorToast("Failed to block antibiotic");
      }
    }
  };

  const handleUnblock = async (id: number) => {
      try {
        const antibiotic = antibiotics.find((a) => a.antCode === id);
        if (!antibiotic) return;
        await laboratoryApi.updateLabAntibiotic(id, {
          antName: antibiotic.antName,
          antDesc: antibiotic.antDesc,
          isBlocked: 0,
          uid: loginData?.id,
        });
        fetchAntibiotics();
        showSuccessToast("Antibiotic has been unblocked.", "Unblocked!");
      } catch (err) {
        showErrorToast("Failed to unblock antibiotic");
      }
  };

  const activeAntibiotics = antibiotics.filter((a) => a.isBlocked === 0);
  const blockedAntibiotics = antibiotics.filter((a) => a.isBlocked === 1);

  // Search functionality for active antibiotics
  const {
    filteredData: filteredActiveAntibiotics,
    searchTerm: activeSearchTerm,
    setSearchTerm: setActiveSearchTerm,
    resultCount: activeResultCount,
    totalCount: activeTotalCount,
  } = useTableSearch({
    data: activeAntibiotics,
    searchFields: ["antName"],
  });

  // Search functionality for blocked antibiotics
  const {
    filteredData: filteredBlockedAntibiotics,
    searchTerm: blockedSearchTerm,
    setSearchTerm: setBlockedSearchTerm,
    resultCount: blockedResultCount,
    totalCount: blockedTotalCount,
  } = useTableSearch({
    data: blockedAntibiotics,
    searchFields: ["antName"],
  });

  const filteredAntibiotics = showBlocked
    ? filteredBlockedAntibiotics
    : filteredActiveAntibiotics;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", minHeight: 0, overflow: "hidden" }}>
      <PageHeader icon={faBacteria} title={editingId ? "Edit Antibiotic Master" : "Add Antibiotic Master"} subtitle="" /> 
      <div className="px-2" style={{ display: "flex", flex: 1, minHeight: 0, gap: "1rem", overflowX: "hidden", overflowY: "auto"}}>
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
                  {editingId ? "Edit Antibiotic" : "Add New Antibiotic"}
                </h4>
                <div style={{ flex: 1, minHeight: 0, overflowY: "auto", paddingRight: "8px" }}>
                  <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Antibiotic Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleInputChange}
                      placeholder="Enter antibiotic name"
                      disabled={loading}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
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
                      ? "Update Antibiotic"
                      : "Add Antibiotic"}
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
                        {showBlocked
                          ? "Blocked Antibiotics"
                          : "Active Antibiotics"}
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
                          ? filteredBlockedAntibiotics.length
                          : filteredActiveAntibiotics.length}
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
                    placeholder={`Search antibiotics by name...`}
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
                      {filteredAntibiotics.length === 0 ? (
                        <tr>
                          <td colSpan={4} style={{ textAlign: "center" }}>
                            {showBlocked
                              ? blockedSearchTerm
                                ? "No blocked antibiotics match your search."
                                : "No blocked antibiotics."
                              : activeSearchTerm
                              ? "No active antibiotics match your search."
                              : "No active antibiotics."}
                          </td>
                        </tr>
                      ) : (
                        filteredAntibiotics.map((Antibiotic, idx) => (
                          <tr
                            key={Antibiotic.antCode}
                            style={{
                              backgroundColor:
                                editingId === Antibiotic.antCode
                                  ? "#fff3cd"
                                  : "transparent",
                              fontWeight:
                                editingId === Antibiotic.antCode
                                  ? "600"
                                  : "normal",
                              borderLeft:
                                editingId === Antibiotic.antCode
                                  ? "4px solid #ffc107"
                                  : "none",
                            }}
                          >
                            <td>{idx + 1}</td>
                            <td>
                              {Antibiotic.antName}
                              {editingId === Antibiotic.antCode && (
                                <span className="ms-2 badge bg-warning text-dark">
                                  <i className="fas fa-edit me-1"></i>
                                  Editing
                                </span>
                              )}
                            </td>
                            <td>{Antibiotic.antDesc}</td>
                            <td>
                              {showBlocked ? (
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  onClick={() =>
                                    handleUnblock(Antibiotic.antCode)
                                  }
                                >
                                  Unblock
                                </Button>
                              ) : (
                                <>
                                  {editingId !== Antibiotic.antCode ? (
                                    <>
                                      <Button
                                        variant="outline-primary"
                                        size="sm"
                                        className="me-2"
                                        onClick={() =>
                                          handleEdit(Antibiotic.antCode)
                                        }
                                        disabled={loading}
                                      >
                                        Edit
                                      </Button>
                                      <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() =>
                                          handleBlock(Antibiotic.antCode)
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

export default AddAntibiotics;
