import React, { useEffect, useState } from "react";
import { Form, Button, Card, Table } from "react-bootstrap";
import { ListCheck, ShieldX, ArrowRepeat } from "react-bootstrap-icons";
import SearchInput from "../../../../components/SearchInput";
import { useTableSearch } from "../../../../hooks/useTableSearch";
import {
  showSuccessToast,
  showErrorToast,
  showConfirmDialog,
  showValidationError,
} from "../../../../utils/alertUtil";
import LaboratoryApiService from "../../../../api/laboratory/laboratory-api-service";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../state/store";
import { handleError } from "../../../../utils/errorUtil";
import PageHeader from "../../../../components/PageHeader";
import { faBuilding } from "@fortawesome/free-solid-svg-icons";

interface Department {
  id: number;
  deptName: string;
  shortName: string;
  deptDesc: string;
  isActive: number;
}

const AddDepartment: React.FC = () => {
  const dispatch = useDispatch();
  const loginData = useSelector((state: RootState) => state.loginData);
  const laboratoryApi = new LaboratoryApiService();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [newDepartment, setNewDepartment] = useState({
    deptName: "",
    shortName: "",
    deptDesc: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showBlocked, setShowBlocked] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await laboratoryApi.fetchAllLabDepartments();
      setDepartments(Array.isArray(res) ? res : []);
    } catch (err) {
      handleError(dispatch, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
    // eslint-disable-next-line
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewDepartment({ ...newDepartment, [name]: value });
  };

  const handleSubmit = async () => {
    if (!newDepartment.deptName || !newDepartment.shortName) {
      showValidationError("Please fill in Name and Code");
      return;
    }
    try {
      if (editingId) {
        await laboratoryApi.updateLabDepartment(editingId, {
          deptName: newDepartment.deptName,
          deptDesc: newDepartment.deptDesc,
          shortName: newDepartment.shortName,
          isActive: 1,
        });
        showSuccessToast("Department updated successfully");
      } else {
        await laboratoryApi.saveLabDepartment({
          deptName: newDepartment.deptName,
          deptDesc: newDepartment.deptDesc,
          shortName: newDepartment.shortName,
          isActive: 1,
        });
        showSuccessToast("Department added successfully");
      }
      setNewDepartment({ deptName: "", shortName: "", deptDesc: "" });
      setEditingId(null);
      fetchDepartments();
    } catch (err) {
      handleError(dispatch, err);
      showErrorToast("Failed to save department");
    }
  };

  const handleEdit = (dept: Department) => {
    setNewDepartment({
      deptName: dept.deptName,
      shortName: dept.shortName,
      deptDesc: dept.deptDesc,
    });
    setEditingId(dept.id);
  };

  const handleCancel = () => {
    setNewDepartment({ deptName: "", shortName: "", deptDesc: "" });
    setEditingId(null);
  };

  const handleBlock = async (id: number) => {
    const result = await showConfirmDialog(
      "Do you want to block this department?",
      "Are you sure?",
      "Yes, block it!",
      "Cancel"
    );
    if (result.isConfirmed) {
      try {
        const dept = departments.find((d) => d.id === id);
        if (!dept) return;
        await laboratoryApi.updateLabDepartment(id, {
          deptName: dept.deptName,
          deptDesc: dept.deptDesc,
          shortName: dept.shortName,
          isActive: 0,
        });
        fetchDepartments();
        showSuccessToast("Department has been blocked.", "Blocked!");
      } catch (err) {
        handleError(dispatch, err);
        showErrorToast("Failed to block department.");
      }
    }
  };

  const handleUnblock = async (id: number) => {
      try {
        const dept = departments.find((d) => d.id === id);
        if (!dept) return;
        await laboratoryApi.updateLabDepartment(id, {
          deptName: dept.deptName,
          deptDesc: dept.deptDesc,
          shortName: dept.shortName,
          isActive: 1,
        });
        fetchDepartments();
        showSuccessToast("Department has been unblocked.", "Unblocked!");
      } catch (err) {
        handleError(dispatch, err);
        showErrorToast("Failed to unblock department.");
      }
  };

  // Filter departments: Active list shows isActive=1, Blocked list shows isActive=0
  const activeDepartments = departments.filter((d) => Number(d.isActive) === 1);
  const blockedDepartments = departments.filter(
    (d) => Number(d.isActive) === 0
  );

  // Search functionality for active departments
  const {
    filteredData: filteredActiveDepartments,
    searchTerm: activeSearchTerm,
    setSearchTerm: setActiveSearchTerm,
    resultCount: activeResultCount,
    totalCount: activeTotalCount,
  } = useTableSearch({
    data: activeDepartments,
    searchFields: ["deptName", "shortName"],
  });

  // Search functionality for blocked departments
  const {
    filteredData: filteredBlockedDepartments,
    searchTerm: blockedSearchTerm,
    setSearchTerm: setBlockedSearchTerm,
    resultCount: blockedResultCount,
    totalCount: blockedTotalCount,
  } = useTableSearch({
    data: blockedDepartments,
    searchFields: ["deptName", "shortName"],
  });

  const filteredDepartments = showBlocked
    ? filteredBlockedDepartments
    : filteredActiveDepartments;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", minHeight: 0, overflow: "hidden" }}>
      <PageHeader icon={faBuilding} title={editingId ? "Edit Department" : "Add Department"} subtitle="" /> 
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
                  {editingId ? "Edit Department" : "Add New Department"}
                </h3>
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Department Name <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="deptName"
                      value={newDepartment.deptName}
                      onChange={handleInputChange}
                      placeholder="Enter department name"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Short Code <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="shortName"
                      value={newDepartment.shortName}
                      onChange={handleInputChange}
                      placeholder="Enter short code"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Description <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="deptDesc"
                      value={newDepartment.deptDesc}
                      onChange={handleInputChange}
                      placeholder="Enter description"
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
                    onClick={handleSubmit}
                    style={{ marginRight: "10px" }}
                    disabled={loading}
                  >
                    {editingId ? "Update Department" : "Add Department"}
                  </Button>
                  {editingId && (
                    <Button variant="secondary" onClick={handleCancel}>
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
                      {showBlocked ? (
                        <ShieldX size={22} color="#dc3545" />
                      ) : (
                        <ListCheck size={22} color="#28a745" />
                      )}
                      <h5 className="mb-0" style={{ fontWeight: "600" }}>
                        {showBlocked
                          ? "Blocked Departments"
                          : "Active Departments"}
                      </h5>
                      <span
                        className="badge"
                        style={{
                          background: showBlocked ? "#dc3545" : "#28a745",
                          fontSize: "11px",
                          padding: "4px 8px",
                        }}
                      >
                        {filteredDepartments.length}
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
                    placeholder={`Search departments by name or code...`}
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
                        <th>#</th>
                        <th>Name</th>
                        <th>Code</th>
                        <th>Description</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDepartments.map((dept, index) => (
                        <tr
                          key={dept.id}
                          style={{
                            backgroundColor:
                              editingId === dept.id ? "#fff3cd" : "transparent",
                            fontWeight:
                              editingId === dept.id ? "600" : "normal",
                            borderLeft:
                              editingId === dept.id
                                ? "4px solid #ffc107"
                                : "none",
                          }}
                        >
                          <td>{index + 1}</td>
                          <td>
                            {dept.deptName}
                            {editingId === dept.id && (
                              <span className="ms-2 badge bg-warning text-dark">
                                <i className="fas fa-edit me-1"></i>
                                Editing
                              </span>
                            )}
                          </td>
                          <td>{dept.shortName}</td>
                          <td>{dept.deptDesc}</td>
                          <td>
                            {!showBlocked ? (
                              <>
                                {editingId !== dept.id ? (
                                  <>
                                    <Button
                                      variant="outline-primary"
                                      size="sm"
                                      className="me-2"
                                      onClick={() => handleEdit(dept)}
                                      disabled={loading}
                                    >
                                      Edit
                                    </Button>
                                    <Button
                                      variant="outline-danger"
                                      size="sm"
                                      onClick={() => handleBlock(dept.id)}
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
                            ) : (
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => handleUnblock(dept.id)}
                              >
                                Unblock
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {filteredDepartments.length === 0 && (
                        <tr>
                          <td
                            colSpan={5}
                            className="text-center py-4 text-muted"
                          >
                            {showBlocked
                              ? blockedSearchTerm
                                ? "No blocked departments match your search."
                                : "No blocked departments."
                              : activeSearchTerm
                              ? "No active departments match your search."
                              : "No active departments."}
                          </td>
                        </tr>
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

export default AddDepartment;
