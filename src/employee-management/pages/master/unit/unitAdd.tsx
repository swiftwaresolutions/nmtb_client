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
} from "react-bootstrap";
import Swal from "sweetalert2";
import { useTableSearch } from "../../../../hooks/useTableSearch";
import PageHeader from "../../../../components/PageHeader";
import { ListCheck, ShieldX, ArrowRepeat, Search, X } from "react-bootstrap-icons";
import { faBox } from "@fortawesome/free-solid-svg-icons";

interface Unit {
  id: number;
  unitName: string;
  unitCode: string;
  description: string;
  isActive: number;
}

const UnitAdd: React.FC = () => {
  // Initialize units from localStorage or use dummy data
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
      {
        id: 4,
        unitName: "Box",
      unitCode: "BOX",
      description: "Packaged box units",
      isActive: 0,
    },
    ];
  });

  // Save units to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('units', JSON.stringify(units));
  }, [units]);

  const [newUnit, setNewUnit] = useState({
    unitName: "",
    unitCode: "",
    description: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showBlocked, setShowBlocked] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewUnit({ ...newUnit, [name]: value });
  };

  const handleSubmit = () => {
    if (!newUnit.unitName || !newUnit.unitCode) {
      setError("Please fill in all required fields");
      return;
    }
    setError("");
    setSuccess("");

    if (editingId) {
      // Update existing unit
      setUnits(
        units.map((unit) =>
          unit.id === editingId
            ? {
                ...unit,
                unitName: newUnit.unitName,
                unitCode: newUnit.unitCode,
                description: newUnit.description,
              }
            : unit
        )
      );
      setSuccess("Unit updated successfully");
    } else {
      // Add new unit
      const newId = Math.max(...units.map((u) => u.id), 0) + 1;
      setUnits([
        ...units,
        {
          id: newId,
          unitName: newUnit.unitName,
          unitCode: newUnit.unitCode,
          description: newUnit.description,
          isActive: 1,
        },
      ]);
      setSuccess("Unit added successfully");
    }

    setNewUnit({ unitName: "", unitCode: "", description: "" });
    setEditingId(null);
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleEdit = (unit: Unit) => {
    setNewUnit({
      unitName: unit.unitName,
      unitCode: unit.unitCode,
      description: unit.description,
    });
    setEditingId(unit.id);
    setError("");
    setSuccess("");
  };

  const handleCancel = () => {
    setNewUnit({ unitName: "", unitCode: "", description: "" });
    setEditingId(null);
    setError("");
    setSuccess("");
  };

  const handleBlock = (id: number) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to block this unit?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, block it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setUnits(
          units.map((unit) =>
            unit.id === id ? { ...unit, isActive: 0 } : unit
          )
        );
        Swal.fire("Blocked!", "Unit has been blocked.", "success");
      }
    });
  };

  const handleUnblock = (id: number) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to unblock this unit?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#28a745",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, unblock it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setUnits(
          units.map((unit) =>
            unit.id === id ? { ...unit, isActive: 1 } : unit
          )
        );
        Swal.fire("Unblocked!", "Unit has been unblocked.", "success");
      }
    });
  };

  // Filter by active/blocked status first
  const statusFilteredUnits = units.filter((u) => {
    const isActiveValue = Number(u.isActive);
    return showBlocked ? isActiveValue === 0 : isActiveValue === 1;
  });

  // Apply search filter
  const { filteredData: filteredUnits, searchTerm, setSearchTerm } = useTableSearch({
    data: statusFilteredUnits,
    searchFields: ['unitName', 'unitCode', 'description'],
  });

  return (
    <div>
      <PageHeader
        icon={faBox}
        title={editingId ? 'Edit Unit' : 'Unit Management'}
        subtitle="Manage measurement units and codes"
        badges={[
          { label: 'Active', value: statusFilteredUnits.filter(u => u.isActive === 1).length },
          { label: 'Blocked', value: statusFilteredUnits.filter(u => u.isActive === 0).length },
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
                  {editingId ? "Edit Unit" : "Add New Unit"}
                </h3>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Unit Name <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="unitName"
                      value={newUnit.unitName}
                      onChange={handleInputChange}
                      placeholder="Enter Unit Name"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Unit Code <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="unitCode"
                      value={newUnit.unitCode}
                      onChange={handleInputChange}
                      placeholder="Enter Unit Code"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="description"
                      value={newUnit.description}
                      onChange={handleInputChange}
                      placeholder="Enter Description"
                    />
                  </Form.Group>
                  <Button
                    variant="primary"
                    onClick={handleSubmit}
                    style={{ marginRight: "10px" }}
                  >
                    {editingId ? "Update Unit" : "Add Unit"}
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
                      {showBlocked ? "Blocked List" : "Unit List"}
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
                        ? statusFilteredUnits.filter((u) => u.isActive === 0).length
                        : statusFilteredUnits.filter((u) => u.isActive === 1).length}
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
                      <Search size={16} />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Search units..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <Button
                        variant="outline-secondary"
                        onClick={() => setSearchTerm("")}
                      >
                        <X size={16} />
                      </Button>
                    )}
                  </InputGroup>
                </div>
                <div className="mb-2 text-end">
                  <span className="badge bg-secondary">
                    {filteredUnits.length} / {statusFilteredUnits.length} Records
                  </span>
                </div>
                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
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
                        <th>Unit Name</th>
                        <th>Unit Code</th>
                        <th>Description</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUnits.map((unit, index) => (
                        <tr key={unit.id}>
                          <td>{index + 1}</td>
                          <td>{unit.unitName}</td>
                          <td>
                            <span className="badge bg-info">
                              {unit.unitCode}
                            </span>
                          </td>
                          <td>{unit.description || "-"}</td>
                          <td>
                            {!showBlocked ? (
                              <>
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  className="me-2"
                                  onClick={() => handleEdit(unit)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleBlock(unit.id)}
                                >
                                  Block
                                </Button>
                              </>
                            ) : (
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => handleUnblock(unit.id)}
                              >
                                Unblock
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {filteredUnits.length === 0 && (
                        <tr>
                          <td
                            colSpan={5}
                            className="text-center py-4 text-muted"
                          >
                            No {showBlocked ? "blocked" : "active"} units found
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
    </div>
  );
};

export default UnitAdd;