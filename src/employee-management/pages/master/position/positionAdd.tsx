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
import { ListCheck, ShieldX, ArrowRepeat } from "react-bootstrap-icons";
import { faBriefcase } from "@fortawesome/free-solid-svg-icons";

interface Position {
  id: number;
  categoryId: number;
  categoryName: string;
  positionName: string;
  isActive: number;
}

interface Category {
  id: number;
  categoryName: string;
}

const PositionAdd: React.FC = () => {
  // Dummy category data
  const categories: Category[] = [
    { id: 1, categoryName: "Management" },
    { id: 2, categoryName: "Technical" },
    { id: 3, categoryName: "Administrative" },
    { id: 4, categoryName: "Support" },
  ];

  // Initialize positions from localStorage or use dummy data
  const [positions, setPositions] = useState<Position[]>(() => {
    const savedPositions = localStorage.getItem('positions');
    if (savedPositions) {
      return JSON.parse(savedPositions);
    }
    return [
      {
        id: 1,
        categoryId: 1,
        categoryName: "Management",
        positionName: "Manager",
        isActive: 1,
      },
      {
        id: 2,
        categoryId: 2,
        categoryName: "Technical",
      positionName: "Senior Developer",
      isActive: 1,
    },
    {
      id: 3,
      categoryId: 2,
      categoryName: "Technical",
      positionName: "Junior Developer",
      isActive: 1,
    },
    {
      id: 4,
      categoryId: 3,
      categoryName: "Administrative",
      positionName: "Office Assistant",
      isActive: 0,
    },
    ];
  });

  // Save positions to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('positions', JSON.stringify(positions));
  }, [positions]);

  const [newPosition, setNewPosition] = useState({
    categoryId: "",
    positionName: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showBlocked, setShowBlocked] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewPosition({ ...newPosition, [name]: value });
  };

  const handleSubmit = () => {
    if (!newPosition.categoryId || !newPosition.positionName) {
      setError("Please fill in all required fields");
      return;
    }
    setError("");
    setSuccess("");

    const selectedCategory = categories.find(
      (cat) => cat.id === Number(newPosition.categoryId)
    );

    if (editingId) {
      // Update existing position
      setPositions(
        positions.map((pos) =>
          pos.id === editingId
            ? {
                ...pos,
                categoryId: Number(newPosition.categoryId),
                categoryName: selectedCategory?.categoryName || "",
                positionName: newPosition.positionName,
              }
            : pos
        )
      );
      setSuccess("Position updated successfully");
    } else {
      // Add new position
      const newId = Math.max(...positions.map((p) => p.id), 0) + 1;
      setPositions([
        ...positions,
        {
          id: newId,
          categoryId: Number(newPosition.categoryId),
          categoryName: selectedCategory?.categoryName || "",
          positionName: newPosition.positionName,
          isActive: 1,
        },
      ]);
      setSuccess("Position added successfully");
    }

    setNewPosition({ categoryId: "", positionName: "" });
    setEditingId(null);
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleEdit = (position: Position) => {
    setNewPosition({
      categoryId: position.categoryId.toString(),
      positionName: position.positionName,
    });
    setEditingId(position.id);
    setError("");
    setSuccess("");
  };

  const handleCancel = () => {
    setNewPosition({ categoryId: "", positionName: "" });
    setEditingId(null);
    setError("");
    setSuccess("");
  };

  const handleBlock = (id: number) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to block this position?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, block it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setPositions(
          positions.map((pos) =>
            pos.id === id ? { ...pos, isActive: 0 } : pos
          )
        );
        Swal.fire("Blocked!", "Position has been blocked.", "success");
      }
    });
  };

  const handleUnblock = (id: number) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to unblock this position?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#28a745",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, unblock it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setPositions(
          positions.map((pos) =>
            pos.id === id ? { ...pos, isActive: 1 } : pos
          )
        );
        Swal.fire("Unblocked!", "Position has been unblocked.", "success");
      }
    });
  };

  // Filter by active/blocked status first
  const statusFilteredPositions = positions.filter((p) => {
    const isActiveValue = Number(p.isActive);
    return showBlocked ? isActiveValue === 0 : isActiveValue === 1;
  });

  // Apply search filter
  const { filteredData: filteredPositions, searchTerm, setSearchTerm } = useTableSearch({
    data: statusFilteredPositions,
    searchFields: ['positionName', 'categoryName'],
  });

  return (
    <div>
      <PageHeader
        icon={faBriefcase}
        title={editingId ? 'Edit Position' : 'Position Management'}
        subtitle="Manage employee positions and categories"
        badges={[
          { label: 'Active', value: statusFilteredPositions.filter(p => p.isActive === 1).length },
          { label: 'Blocked', value: statusFilteredPositions.filter(p => p.isActive === 0).length },
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
                  {editingId ? "Edit Position" : "Add New Position"}
                </h3>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Select Category <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Select
                      name="categoryId"
                      value={newPosition.categoryId}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.categoryName}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Position Name <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="positionName"
                      value={newPosition.positionName}
                      onChange={handleInputChange}
                      placeholder="Enter Position"
                    />
                  </Form.Group>
                  <Button
                    variant="primary"
                    onClick={handleSubmit}
                    style={{ marginRight: "10px" }}
                  >
                    {editingId ? "Update Position" : "Add Position"}
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
                      {showBlocked ? "Blocked List" : "Position List"}
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
                        ? statusFilteredPositions.filter((p) => p.isActive === 0).length
                        : statusFilteredPositions.filter((p) => p.isActive === 1).length}
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
                      placeholder="Search positions..."
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
                    {filteredPositions.length} / {statusFilteredPositions.length} Records
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
                        <th>Category</th>
                        <th>Position Name</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPositions.map((position, index) => (
                        <tr key={position.id}>
                          <td>{index + 1}</td>
                          <td>{position.categoryName}</td>
                          <td>{position.positionName}</td>
                          <td>
                            {!showBlocked ? (
                              <>
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  className="me-2"
                                  onClick={() => handleEdit(position)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleBlock(position.id)}
                                >
                                  Block
                                </Button>
                              </>
                            ) : (
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => handleUnblock(position.id)}
                              >
                                Unblock
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {filteredPositions.length === 0 && (
                        <tr>
                          <td
                            colSpan={4}
                            className="text-center py-4 text-muted"
                          >
                            No {showBlocked ? "blocked" : "active"} positions
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
    </div>
  );
};

export default PositionAdd;