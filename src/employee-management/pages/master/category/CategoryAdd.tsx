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
import { faTags } from "@fortawesome/free-solid-svg-icons";

interface Category {
  id: number;
  categoryName: string;
  isActive: number;
}

const CategoryAdd: React.FC = () => {
  // Initialize categories from localStorage or use dummy data
  const [categories, setCategories] = useState<Category[]>(() => {
    const savedCategories = localStorage.getItem('categories');
    if (savedCategories) {
      return JSON.parse(savedCategories);
    }
    return [
      {
        id: 1,
        categoryName: "Medical Staff",
        isActive: 1,
      },
      {
        id: 2,
        categoryName: "Administrative",
        isActive: 1,
      },
      {
        id: 3,
        categoryName: "Support Staff",
        isActive: 1,
      },
      {
        id: 4,
        categoryName: "Technical Staff",
        isActive: 0,
      },
    ];
  });

  // Save categories to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  const [newCategory, setNewCategory] = useState({
    categoryName: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showBlocked, setShowBlocked] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewCategory({ ...newCategory, [name]: value });
  };

  const handleSubmit = () => {
    if (!newCategory.categoryName) {
      setError("Please fill in Category Name");
      return;
    }
    setError("");
    setSuccess("");

    if (editingId) {
      // Update existing category
      setCategories(
        categories.map((cat) =>
          cat.id === editingId
            ? {
                ...cat,
                categoryName: newCategory.categoryName,
              }
            : cat
        )
      );
      setSuccess("Category updated successfully");
    } else {
      // Add new category
      const newId = Math.max(...categories.map((c) => c.id), 0) + 1;
      setCategories([
        ...categories,
        {
          id: newId,
          categoryName: newCategory.categoryName,
          isActive: 1,
        },
      ]);
      setSuccess("Category added successfully");
    }

    setNewCategory({ categoryName: "" });
    setEditingId(null);
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleEdit = (category: Category) => {
    setNewCategory({
      categoryName: category.categoryName,
    });
    setEditingId(category.id);
    setError("");
    setSuccess("");
  };

  const handleCancel = () => {
    setNewCategory({ categoryName: "" });
    setEditingId(null);
    setError("");
    setSuccess("");
  };

  const handleBlock = (id: number) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to block this category?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, block it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setCategories(
          categories.map((cat) =>
            cat.id === id ? { ...cat, isActive: 0 } : cat
          )
        );
        Swal.fire("Blocked!", "Category has been blocked.", "success");
      }
    });
  };

  const handleUnblock = (id: number) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to unblock this category?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#28a745",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, unblock it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setCategories(
          categories.map((cat) =>
            cat.id === id ? { ...cat, isActive: 1 } : cat
          )
        );
        Swal.fire("Unblocked!", "Category has been unblocked.", "success");
      }
    });
  };

  // Filter by active/blocked status first
  const statusFilteredCategories = categories.filter((c) => {
    const isActiveValue = Number(c.isActive);
    return showBlocked ? isActiveValue === 0 : isActiveValue === 1;
  });

  // Apply search filter
  const { filteredData: filteredCategories, searchTerm, setSearchTerm } = useTableSearch({
    data: statusFilteredCategories,
    searchFields: ['categoryName'],
  });

  return (
    <div>
      <PageHeader
        icon={faTags}
        title={editingId ? 'Edit Category' : 'Category Management'}
        subtitle="Manage employee categories and classifications"
        badges={[
          { label: 'Active', value: statusFilteredCategories.filter(c => c.isActive === 1).length },
          { label: 'Blocked', value: statusFilteredCategories.filter(c => c.isActive === 0).length },
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
                  {editingId ? "Edit Category" : "Add New Category"}
                </h3>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Category Name <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="categoryName"
                      value={newCategory.categoryName}
                      onChange={handleInputChange}
                      placeholder="Enter category name"
                    />
                  </Form.Group>
                  <Button
                    variant="primary"
                    onClick={handleSubmit}
                    style={{ marginRight: "10px" }}
                  >
                    {editingId ? "Update Category" : "Add Category"}
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
                      {showBlocked ? "Blocked List" : "Category List"}
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
                        ? statusFilteredCategories.filter((c) => c.isActive === 0).length
                        : statusFilteredCategories.filter((c) => c.isActive === 1).length}
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
                      placeholder="Search categories..."
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
                    {filteredCategories.length} / {statusFilteredCategories.length} Records
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
                        <th>Category Name</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCategories.map((category, index) => (
                        <tr key={category.id}>
                          <td>{index + 1}</td>
                          <td>{category.categoryName}</td>
                          <td>
                            {!showBlocked ? (
                              <>
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  className="me-2"
                                  onClick={() => handleEdit(category)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleBlock(category.id)}
                                >
                                  Block
                                </Button>
                              </>
                            ) : (
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => handleUnblock(category.id)}
                              >
                                Unblock
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {filteredCategories.length === 0 && (
                        <tr>
                          <td
                            colSpan={3}
                            className="text-center py-4 text-muted"
                          >
                            No {showBlocked ? "blocked" : "active"} categories
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

export default CategoryAdd;