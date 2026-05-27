import React, { useState, useEffect } from "react";
import {
  Container,
  Form,
  Button,
  Table,
  Row,
  Col,
  Card,
} from "react-bootstrap";
import { ListCheck, ShieldX, ArrowRepeat } from "react-bootstrap-icons";
import SearchInput from "../../../../components/SearchInput";
import { useTableSearch } from "../../../../hooks/useTableSearch";
import "../../../../style/commonStyle.css";
import {
  showSuccessToast,
  showErrorToast,
  showConfirmDialog,
  showValidationError,
} from "../../../../utils/alertUtil";

import LaboratoryApiService from "../../../../api/laboratory/laboratory-api-service";
import { useSelector } from "react-redux";
import { RootState } from "../../../../state/store";
import PageHeader from "../../../../components/PageHeader";
import { faMicroscope } from "@fortawesome/free-solid-svg-icons";

interface Specimen {
  id: number;
  specName: string;
  specDesc: string;
  isBlocked: number;
}

const AddSpecimen: React.FC = () => {
  const laboratoryApi = new LaboratoryApiService();
  const loginData = useSelector((state: RootState) => state.loginData);
  const [specimens, setSpecimens] = useState<Specimen[]>([]);
  const [newSpecimen, setNewSpecimen] = useState({ name: "", description: "" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showBlocked, setShowBlocked] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch all specimens from API
  const fetchSpecimens = async () => {
    setLoading(true);
    try {
      const res = await laboratoryApi.fetchAllLabSpecimen();
      setSpecimens(Array.isArray(res) ? res : []);
    } catch (err) {
      showErrorToast("Failed to fetch specimens");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecimens();
    // eslint-disable-next-line
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewSpecimen({ ...newSpecimen, [name]: value });
  };

  const handleSubmit = async () => {
    if (!newSpecimen.name) {
      showValidationError("Please fill in Name");
      return;
    }
    if (!newSpecimen.description) {
      showValidationError("Please fill in Description");
      return;
    }
    try {
      if (editingId) {
        await laboratoryApi.updateLabSpecimen(editingId, {
          specName: newSpecimen.name,
          specDesc: newSpecimen.description,
          isBlocked: 0,
          uid: loginData?.id,
        });
        showSuccessToast("Specimen updated successfully");
      } else {
        await laboratoryApi.saveLabSpecimen({
          specName: newSpecimen.name,
          specDesc: newSpecimen.description,
          uid: loginData?.id,
        });
        showSuccessToast("Specimen added successfully");
      }
      setNewSpecimen({ name: "", description: "" });
      setEditingId(null);
      fetchSpecimens();
    } catch (err) {
      showErrorToast("Failed to save specimen");
    }
  };

  const handleEdit = (specimen: Specimen) => {
    setNewSpecimen({ name: specimen.specName, description: specimen.specDesc });
    setEditingId(specimen.id);
  };

  const handleCancel = () => {
    setNewSpecimen({ name: "", description: "" });
    setEditingId(null);
  };

  const handleBlock = async (id: number) => {
    const result = await showConfirmDialog(
      "Do you want to block this specimen?",
      "Are you sure?",
      "Yes, block it!",
      "Cancel"
    );
    if (result.isConfirmed) {
      try {
        const specimen = specimens.find((s) => s.id === id);
        if (!specimen) return;
        await laboratoryApi.updateLabSpecimen(id, {
          specName: specimen.specName,
          specDesc: specimen.specDesc,
          isBlocked: 1,
          uid: loginData?.id,
        });
        fetchSpecimens();
        showSuccessToast("Specimen has been blocked.", "Blocked!");
      } catch (err) {
        showErrorToast("Failed to block specimen");
      }
    }
  };

  const handleUnblock = async (id: number) => {
      try {
        const specimen = specimens.find((s) => s.id === id);
        if (!specimen) return;
        await laboratoryApi.updateLabSpecimen(id, {
          specName: specimen.specName,
          specDesc: specimen.specDesc,
          isBlocked: 0,
          uid: loginData?.id,
        });
        fetchSpecimens();
        showSuccessToast("Specimen has been unblocked.", "Unblocked!");
      } catch (err) {
        showErrorToast("Failed to unblock specimen");
      }
  };

  const activeSpecimens = specimens.filter((s) => s.isBlocked === 0);
  const blockedSpecimens = specimens.filter((s) => s.isBlocked === 1);

  const {
    filteredData: filteredActiveSpecimens,
    searchTerm: activeSearchTerm,
    setSearchTerm: setActiveSearchTerm,
    resultCount: activeResultCount,
    totalCount: activeTotalCount,
  } = useTableSearch({
    data: activeSpecimens,
    searchFields: ["specName"],
  });

  // Search functionality for blocked specimens
  const {
    filteredData: filteredBlockedSpecimens,
    searchTerm: blockedSearchTerm,
    setSearchTerm: setBlockedSearchTerm,
    resultCount: blockedResultCount,
    totalCount: blockedTotalCount,
  } = useTableSearch({
    data: blockedSpecimens,
    searchFields: ["specName"],
  });

  const filteredSpecimens = showBlocked
    ? filteredBlockedSpecimens
    : filteredActiveSpecimens;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", minHeight: 0, overflow: "hidden" }}>
      <PageHeader icon={faMicroscope} title={editingId ? "Edit Specimen" : "Add Specimen"} subtitle="" /> 
      {/* ---------------- BODY ---------------- */}
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
                <h3 style={{ textAlign: "center", marginBottom: "1rem", flexShrink: 0 }}>
                  {editingId ? "Edit Specimen" : "Add New Specimen"}
                </h3>
                <div style={{ flex: 1, minHeight: 0, overflowY: "auto", paddingRight: "8px" }}>
                  <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Specimen Name <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={newSpecimen.name}
                      onChange={handleInputChange}
                      placeholder="Enter specimen name"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>
                      Description <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="description"
                      value={newSpecimen.description}
                      onChange={handleInputChange}
                      placeholder="Enter description"
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
                    onClick={handleSubmit}
                    style={{ marginRight: "10px" }}
                  >
                    {editingId ? "Update Specimen" : "Add Specimen"}
                  </Button>

                  {editingId && (
                    <Button variant="secondary" onClick={handleCancel}>
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* -------- Right Side Table -------- */}
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
                        {showBlocked ? "Blocked Specimens" : "Active Specimens"}
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
                          ? filteredBlockedSpecimens.length
                          : filteredActiveSpecimens.length}
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
                    placeholder={`Search specimens by name...`}
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
                      {filteredSpecimens.length === 0 ? (
                        <tr>
                          <td colSpan={4} style={{ textAlign: "center" }}>
                            {showBlocked
                              ? blockedSearchTerm
                                ? "No blocked specimens match your search."
                                : "No blocked specimens."
                              : activeSearchTerm
                              ? "No active specimens match your search."
                              : "No active specimens."}
                          </td>
                        </tr>
                      ) : (
                        filteredSpecimens.map((specimen, index) => (
                          <tr
                            key={specimen.id}
                            style={{
                              backgroundColor:
                                editingId === specimen.id
                                  ? "#fff3cd"
                                  : "transparent",
                              fontWeight:
                                editingId === specimen.id ? "600" : "normal",
                              borderLeft:
                                editingId === specimen.id
                                  ? "4px solid #ffc107"
                                  : "none",
                            }}
                          >
                            <td>{index + 1}</td>
                            <td>
                              {specimen.specName}
                              {editingId === specimen.id && (
                                <span className="ms-2 badge bg-warning text-dark">
                                  <i className="fas fa-edit me-1"></i>
                                  Editing
                                </span>
                              )}
                            </td>
                            <td>{specimen.specDesc}</td>
                            <td>
                              {showBlocked ? (
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  onClick={() => handleUnblock(specimen.id)}
                                >
                                  Unblock
                                </Button>
                              ) : (
                                <>
                                  {editingId !== specimen.id ? (
                                    <>
                                      <Button
                                        variant="outline-primary"
                                        size="sm"
                                        className="me-2"
                                        onClick={() => handleEdit(specimen)}
                                      >
                                        Edit
                                      </Button>
                                      <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => handleBlock(specimen.id)}
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

export default AddSpecimen;
