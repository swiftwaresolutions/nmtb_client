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
import { faSitemap } from "@fortawesome/free-solid-svg-icons";

interface Division {
  id: number;
  divisionName: string;
  description: string;
  isActive: number;
}

const DivisionAdd: React.FC = () => {
  // Initialize divisions from localStorage or use dummy data
  const [divisions, setDivisions] = useState<Division[]>(() => {
    const savedDivisions = localStorage.getItem('divisions');
    if (savedDivisions) {
      return JSON.parse(savedDivisions);
    }
    return [
      {
        id: 1,
        divisionName: "North Division",
        description: "Handles northern region operations",
        isActive: 1,
      },
      {
        id: 2,
        divisionName: "South Division",
        description: "Handles southern region operations",
        isActive: 1,
      },
      {
        id: 3,
        divisionName: "East Division",
        description: "Handles eastern region operations",
        isActive: 1,
      },
      {
        id: 4,
        divisionName: "West Division",
        description: "Handles western region operations",
        isActive: 0,
      },
    ];
  });

  // Save divisions to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('divisions', JSON.stringify(divisions));
  }, [divisions]);

  const [newDivision, setNewDivision] = useState({
    divisionName: "",
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
    setNewDivision({ ...newDivision, [name]: value });
  };

  const handleSubmit = () => {
    if (!newDivision.divisionName) {
      setError("Please fill in Division Name");
      return;
    }
    setError("");
    setSuccess("");

    if (editingId) {
      // Update existing division
      setDivisions(
        divisions.map((division) =>
          division.id === editingId
            ? {
                ...division,
                divisionName: newDivision.divisionName,
                description: newDivision.description,
              }
            : division
        )
      );
      setSuccess("Division updated successfully");
    } else {
      // Add new division
      const newId = Math.max(...divisions.map((d) => d.id), 0) + 1;
      setDivisions([
        ...divisions,
        {
          id: newId,
          divisionName: newDivision.divisionName,
          description: newDivision.description,
          isActive: 1,
        },
      ]);
      setSuccess("Division added successfully");
    }

    setNewDivision({ divisionName: "", description: "" });
    setEditingId(null);
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleEdit = (division: Division) => {
    setNewDivision({
      divisionName: division.divisionName,
      description: division.description,
    });
    setEditingId(division.id);
    setError("");
    setSuccess("");
  };

  const handleCancel = () => {
    setNewDivision({ divisionName: "", description: "" });
    setEditingId(null);
    setError("");
    setSuccess("");
  };

  const handleBlock = (id: number) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to block this division?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, block it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setDivisions(
          divisions.map((division) =>
            division.id === id ? { ...division, isActive: 0 } : division
          )
        );
        Swal.fire("Blocked!", "Division has been blocked.", "success");
      }
    });
  };

  const handleUnblock = (id: number) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to unblock this division?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#28a745",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, unblock it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setDivisions(
          divisions.map((division) =>
            division.id === id ? { ...division, isActive: 1 } : division
          )
        );
        Swal.fire("Unblocked!", "Division has been unblocked.", "success");
      }
    });
  };

  // Filter by active/blocked status first
  const statusFilteredDivisions = divisions.filter((d) => {
    const isActiveValue = Number(d.isActive);
    return showBlocked ? isActiveValue === 0 : isActiveValue === 1;
  });

  // Apply search filter
  const { filteredData: filteredDivisions, searchTerm, setSearchTerm } = useTableSearch({
    data: statusFilteredDivisions,
    searchFields: ['divisionName', 'description'],
  });

  return (
    <div>
      <PageHeader
        icon={faSitemap}
        title={editingId ? 'Edit Division' : 'Division Management'}
        subtitle="Manage organizational divisions and their details"
        badges={[
          { label: 'Active', value: statusFilteredDivisions.filter(d => d.isActive === 1).length },
          { label: 'Blocked', value: statusFilteredDivisions.filter(d => d.isActive === 0).length },
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
                  {editingId ? "Edit Division" : "Add New Division"}
                </h3>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Division Name <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="divisionName"
                      value={newDivision.divisionName}
                      onChange={handleInputChange}
                      placeholder="Enter Division Name"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="description"
                      value={newDivision.description}
                      onChange={handleInputChange}
                      placeholder="Enter Description"
                    />
                  </Form.Group>
                  <Button
                    variant="primary"
                    onClick={handleSubmit}
                    style={{ marginRight: "10px" }}
                  >
                    {editingId ? "Update Division" : "Add Division"}
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
                      {showBlocked ? "Blocked List" : "Division List"}
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
                        ? statusFilteredDivisions.filter((d) => d.isActive === 0).length
                        : statusFilteredDivisions.filter((d) => d.isActive === 1).length}
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
                      placeholder="Search divisions..."
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
                    {filteredDivisions.length} / {statusFilteredDivisions.length} Records
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
                        <th>Division Name</th>
                        <th>Description</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDivisions.map((division, index) => (
                        <tr key={division.id}>
                          <td>{index + 1}</td>
                          <td>{division.divisionName}</td>
                          <td>{division.description || "-"}</td>
                          <td>
                            {!showBlocked ? (
                              <>
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  className="me-2"
                                  onClick={() => handleEdit(division)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleBlock(division.id)}
                                >
                                  Block
                                </Button>
                              </>
                            ) : (
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => handleUnblock(division.id)}
                              >
                                Unblock
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {filteredDivisions.length === 0 && (
                        <tr>
                          <td
                            colSpan={4}
                            className="text-center py-4 text-muted"
                          >
                            No {showBlocked ? "blocked" : "active"} divisions found
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

export default DivisionAdd;