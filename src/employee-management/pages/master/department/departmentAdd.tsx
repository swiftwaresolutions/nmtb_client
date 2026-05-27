import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Alert,
  Table,
  InputGroup,
  Modal,
} from "react-bootstrap";
import Swal from "sweetalert2";
import { useTableSearch } from "../../../../hooks/useTableSearch";
import PageHeader from "../../../../components/PageHeader";
import { ListCheck, ShieldX, ArrowRepeat } from "react-bootstrap-icons";
import { faBuilding } from "@fortawesome/free-solid-svg-icons";

interface Department {
  id: number;
  departmentName: string;
  isActive: number;
  mappedUnits?: number[];
}

interface Unit {
  id: number;
  unitName: string;
  unitCode: string;
  description: string;
  isActive: number;
}

const DepartmentAdd: React.FC = () => {
  // Initialize departments from localStorage or use dummy data
  const [departments, setDepartments] = useState<Department[]>(() => {
    const savedDepartments = localStorage.getItem('departments');
    if (savedDepartments) {
      return JSON.parse(savedDepartments);
    }
    return [
      {
        id: 1,
        departmentName: "Human Resources",
        isActive: 1,
      },
      {
        id: 2,
        departmentName: "Finance",
        isActive: 1,
      },
      {
        id: 3,
        departmentName: "IT Department",
        isActive: 1,
      },
      {
        id: 4,
        departmentName: "Marketing",
        isActive: 0,
      },
    ];
  });

  // Save departments to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('departments', JSON.stringify(departments));
  }, [departments]);

  // Load units from localStorage
  const [units, setUnits] = useState<Unit[]>(() => {
    const savedUnits = localStorage.getItem('units');
    if (savedUnits) {
      return JSON.parse(savedUnits);
    }
    return [
      {
        id: 1,
        unitName: "Pieces",
        unitCode: "PCS",
        description: "Individual pieces or items",
        isActive: 1,
      },
      {
        id: 2,
        unitName: "Kilogram",
        unitCode: "KG",
        description: "Unit of mass measurement",
        isActive: 1,
      },
      {
        id: 3,
        unitName: "Liter",
        unitCode: "LTR",
        description: "Unit of volume measurement",
        isActive: 1,
      },
    ];
  });

  const [newDepartment, setNewDepartment] = useState({
    departmentName: "",
  });
  const [showMapUnitModal, setShowMapUnitModal] = useState(false);
  const [selectedDepartmentForMapping, setSelectedDepartmentForMapping] = useState<Department | null>(null);
  const [selectedUnits, setSelectedUnits] = useState<number[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showBlocked, setShowBlocked] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewDepartment({ ...newDepartment, [name]: value });
  };

  const handleSubmit = () => {
    if (!newDepartment.departmentName) {
      setError("Please fill in Department Name");
      return;
    }
    setError("");
    setSuccess("");

    if (editingId) {
      // Update existing department
      setDepartments(
        departments.map((dept) =>
          dept.id === editingId
            ? {
                ...dept,
                departmentName: newDepartment.departmentName,
              }
            : dept
        )
      );
      setSuccess("Department updated successfully");
    } else {
      // Add new department
      const newId = Math.max(...departments.map((d) => d.id), 0) + 1;
      setDepartments([
        ...departments,
        {
          id: newId,
          departmentName: newDepartment.departmentName,
          isActive: 1,
        },
      ]);
      setSuccess("Department added successfully");
    }

    setNewDepartment({ departmentName: "" });
    setEditingId(null);
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleEdit = (department: Department) => {
    setNewDepartment({
      departmentName: department.departmentName,
    });
    setEditingId(department.id);
    setError("");
    setSuccess("");
  };

  const handleCancel = () => {
    setNewDepartment({ departmentName: "" });
    setEditingId(null);
    setError("");
    setSuccess("");
  };

  const handleBlock = (id: number) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to block this department?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, block it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setDepartments(
          departments.map((dept) =>
            dept.id === id ? { ...dept, isActive: 0 } : dept
          )
        );
        Swal.fire("Blocked!", "Department has been blocked.", "success");
      }
    });
  };

  const handleUnblock = (id: number) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to unblock this department?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#28a745",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, unblock it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setDepartments(
          departments.map((dept) =>
            dept.id === id ? { ...dept, isActive: 1 } : dept
          )
        );
        Swal.fire("Unblocked!", "Department has been unblocked.", "success");
      }
    });
  };

  // Filter by active/blocked status first
  const statusFilteredDepartments = departments.filter((d) => {
    const isActiveValue = Number(d.isActive);
    return showBlocked ? isActiveValue === 0 : isActiveValue === 1;
  });

  // Apply search filter
  const { filteredData: filteredDepartments, searchTerm, setSearchTerm } = useTableSearch({
    data: statusFilteredDepartments,
    searchFields: ['departmentName'],
  });

  const handleMapUnit = (department: Department) => {
    setSelectedDepartmentForMapping(department);
    setSelectedUnits(department.mappedUnits || []);
    setShowMapUnitModal(true);
  };

  const handleUnitToggle = (unitId: number) => {
    setSelectedUnits((prev) =>
      prev.includes(unitId)
        ? prev.filter((id) => id !== unitId)
        : [...prev, unitId]
    );
  };

  const handleSaveMapping = () => {
    if (!selectedDepartmentForMapping) return;

    setDepartments(
      departments.map((dept) =>
        dept.id === selectedDepartmentForMapping.id
          ? { ...dept, mappedUnits: selectedUnits }
          : dept
      )
    );

    Swal.fire({
      icon: "success",
      title: "Success",
      text: "Units mapped successfully!",
      timer: 2000,
      showConfirmButton: false,
    });

    setShowMapUnitModal(false);
    setSelectedDepartmentForMapping(null);
    setSelectedUnits([]);
  };

  const handleCloseModal = () => {
    setShowMapUnitModal(false);
    setSelectedDepartmentForMapping(null);
    setSelectedUnits([]);
  };

  return (
    <div>
      <PageHeader
        icon={faBuilding}
        title={editingId ? 'Edit Department' : 'Department Management'}
        subtitle="Manage employee departments and unit mappings"
        badges={[
          { label: 'Active', value: statusFilteredDepartments.filter(d => d.isActive === 1).length },
          { label: 'Blocked', value: statusFilteredDepartments.filter(d => d.isActive === 0).length },
        ]}
      />
      <div className="content-body">
        <Container fluid style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <Row>
            <Col md={6}>
              <div
                className="card shadow-sm"
                style={{
                  padding: "2rem",
                  background: "white",
                  borderRadius: "10px",
                }}
              >
                <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>
                  {editingId ? "Edit Department" : "Add New Department"}
                </h3>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Department Name <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="departmentName"
                      value={newDepartment.departmentName}
                      onChange={handleInputChange}
                      placeholder="Enter Department"
                    />
                  </Form.Group>
                  <Button
                    variant="primary"
                    onClick={handleSubmit}
                    style={{ marginRight: "10px" }}
                  >
                    {editingId ? "Update Department" : "Add Department"}
                  </Button>
                  {editingId && (
                    <Button variant="secondary" onClick={handleCancel}>
                      Cancel
                    </Button>
                  )}
                </Form>
              </div>
            </Col>
            <Col md={6}>
              <div
                className="card shadow-sm"
                style={{
                  padding: "2rem",
                  background: "white",
                  borderRadius: "10px",
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center gap-2">
                    {showBlocked ? (
                      <ShieldX size={22} color="#dc3545" />
                    ) : (
                      <ListCheck size={22} color="#28a745" />
                    )}
                    <h3 style={{ textAlign: "center", margin: 0 }}>
                      {showBlocked ? "Blocked List" : "Department List"}
                    </h3>
                    <span
                      className="badge"
                      style={{
                        background: showBlocked ? "#dc3545" : "#28a745",
                        fontSize: "11px",
                        padding: "4px 8px",
                      }}
                    >
                      {showBlocked
                        ? statusFilteredDepartments.filter((d) => d.isActive === 0).length
                        : statusFilteredDepartments.filter((d) => d.isActive === 1).length}
                    </span>
                  </div>
                  <Button
                    variant={showBlocked ? "outline-success" : "outline-danger"}
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
                <div className="mb-3">
                  <InputGroup>
                    <InputGroup.Text>
                      <i className="fas fa-search"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Search departments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <Button
                        variant="outline-secondary"
                        onClick={() => setSearchTerm("")}
                      >
                        <i className="fas fa-times"></i>
                      </Button>
                    )}
                  </InputGroup>
                </div>
                <div className="mb-2 text-end">
                  <span className="badge bg-secondary">
                    {filteredDepartments.length} / {statusFilteredDepartments.length} Records
                  </span>
                </div>
                <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                  <Table striped bordered hover>
                    <thead
                      style={{
                        position: "sticky",
                        top: 0,
                        background: "white",
                        zIndex: 1,
                      }}
                    >
                      <tr>
                        <th>#</th>
                        <th>Department Name</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDepartments.map((department, index) => (
                        <tr key={department.id}>
                          <td>{index + 1}</td>
                          <td>{department.departmentName}</td>
                          <td>
                            {!showBlocked ? (
                              <>
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  className="me-2"
                                  onClick={() => handleEdit(department)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  className="me-2"
                                  size="sm"
                                  onClick={() => handleBlock(department.id)}
                                >
                                  Block
                                </Button>

                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  onClick={() => handleMapUnit(department)}
                                >
                                  Map Unit
                                </Button>
                              </>
                            ) : (
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => handleUnblock(department.id)}
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
                            colSpan={3}
                            className="text-center py-4 text-muted"
                          >
                            No {showBlocked ? "blocked" : "active"} departments
                            found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Map Unit Modal */}
      <Modal show={showMapUnitModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Map Unit with Department</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <h5 className="text-center">
              Department Name: <span className="text-primary">{selectedDepartmentForMapping?.departmentName}</span>
            </h5>
          </div>
          <hr />
          <div className="row">
            {units.filter(u => u.isActive === 1).map((unit, index) => (
              <div key={unit.id} className="col-md-6 mb-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`unit-${unit.id}`}
                    checked={selectedUnits.includes(unit.id)}
                    onChange={() => handleUnitToggle(unit.id)}
                  />
                  <label className="form-check-label" htmlFor={`unit-${unit.id}`}>
                    <strong>{unit.unitName}</strong> ({unit.unitCode})
                    {unit.description && (
                      <div className="text-muted small">{unit.description}</div>
                    )}
                  </label>
                </div>
              </div>
            ))}
          </div>
          {units.filter(u => u.isActive === 1).length === 0 && (
            <div className="text-center text-muted py-4">
              No active units available. Please add units first.
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <div className="d-flex justify-content-between w-100 align-items-center">
            <div>
              <span className="badge bg-info">
                {selectedUnits.length} unit(s) selected
              </span>
            </div>
            <div>
              <Button variant="secondary" onClick={handleCloseModal} className="me-2">
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveMapping}>
                Save Mapping
              </Button>
            </div>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DepartmentAdd;