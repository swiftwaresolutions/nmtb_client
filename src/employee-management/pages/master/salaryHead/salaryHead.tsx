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
import { useTableSearch } from "../../../../hooks/useTableSearch";
import PageHeader from "../../../../components/PageHeader";
import { ListCheck, Search, X } from "react-bootstrap-icons";
import { faMoneyBillWave } from "@fortawesome/free-solid-svg-icons";

interface SalaryHead {
  id: number;
  salaryHeadName: string;
  shortName: string;
  groupName: string;
  isEditable: boolean;
  isLoan: boolean;
}

const SalaryHead: React.FC = () => {
  // Initialize salary heads from localStorage or use dummy data
  const [salaryHeads, setSalaryHeads] = useState<SalaryHead[]>(() => {
    const savedSalaryHeads = localStorage.getItem('salaryHeads');
    if (savedSalaryHeads) {
      return JSON.parse(savedSalaryHeads);
    }
    return [
      {
        id: 1,
        salaryHeadName: "Basic Salary",
        shortName: "BASIC",
        groupName: "Addition",
        isEditable: false,
        isLoan: false,
      },
      {
        id: 2,
        salaryHeadName: "House Rent Allowance",
        shortName: "HRA",
        groupName: "Addition",
        isEditable: true,
        isLoan: false,
      },
      {
        id: 3,
        salaryHeadName: "Provident Fund",
        shortName: "PF",
        groupName: "Deduction",
        isEditable: true,
        isLoan: false,
      },
    {
      id: 4,
      salaryHeadName: "Employee Loan",
      shortName: "LOAN",
      groupName: "Deduction",
      isEditable: true,
      isLoan: true,
    },
    ];
  });

  // Save salary heads to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('salaryHeads', JSON.stringify(salaryHeads));
  }, [salaryHeads]);

  const [newSalaryHead, setNewSalaryHead] = useState({
    salaryHeadName: "",
    shortName: "",
    groupName: "",
    isEditable: false,
    isLoan: false,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setNewSalaryHead({ ...newSalaryHead, [name]: checked });
    } else {
      setNewSalaryHead({ ...newSalaryHead, [name]: value });
    }
  };

  const handleSubmit = () => {
    if (!newSalaryHead.salaryHeadName || !newSalaryHead.shortName || !newSalaryHead.groupName) {
      setError("Please fill in all required fields");
      return;
    }
    setError("");
    setSuccess("");

    // Add new salary head
    const newId = Math.max(...salaryHeads.map((h) => h.id), 0) + 1;
    setSalaryHeads([
      ...salaryHeads,
      {
        id: newId,
        salaryHeadName: newSalaryHead.salaryHeadName,
        shortName: newSalaryHead.shortName,
        groupName: newSalaryHead.groupName,
        isEditable: newSalaryHead.isEditable,
        isLoan: newSalaryHead.isLoan,
      },
    ]);
    setSuccess("Salary head added successfully");

    setNewSalaryHead({
      salaryHeadName: "",
      shortName: "",
      groupName: "",
      isEditable: false,
      isLoan: false,
    });
    setTimeout(() => setSuccess(""), 3000);
  };

  // Apply search filter
  const { filteredData: filteredSalaryHeads, searchTerm, setSearchTerm } = useTableSearch({
    data: salaryHeads,
    searchFields: ['salaryHeadName', 'shortName', 'groupName'],
  });

  return (
    <div>
      <PageHeader
        icon={faMoneyBillWave}
        title="Salary Head Management"
        subtitle="Manage salary components and deductions"
        badges={[
          { label: 'Total Heads', value: salaryHeads.length },
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
                  Add New Salary Head
                </h3>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Salary Head <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="salaryHeadName"
                      value={newSalaryHead.salaryHeadName}
                      onChange={handleInputChange}
                      placeholder="Enter Salary Head"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Short Name <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="shortName"
                      value={newSalaryHead.shortName}
                      onChange={handleInputChange}
                      placeholder="Enter Short Name"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Group Name <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Select
                      name="groupName"
                      value={newSalaryHead.groupName}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Group</option>
                      <option value="Addition">Addition</option>
                      <option value="Deduction">Deduction</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      name="isEditable"
                      label="Is Editable"
                      checked={newSalaryHead.isEditable}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      name="isLoan"
                      label="Is Loan"
                      checked={newSalaryHead.isLoan}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                  <Button
                    variant="primary"
                    onClick={handleSubmit}
                  >
                    Add Salary Head
                  </Button>
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
                    <ListCheck size={22} color="#28a745" />
                    <h3 style={{ textAlign: "center", margin: 0 }}>
                      Salary Head List
                    </h3>
                    <span
                      className="badge"
                      style={{
                        background: "#28a745",
                        fontSize: "11px",
                        padding: "4px 8px",
                      }}
                    >
                      {salaryHeads.length}
                    </span>
                  </div>
                </div>
                <div className="mb-3">
                  <InputGroup>
                    <InputGroup.Text>
                      <Search size={16} />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Search salary heads..."
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
                    {filteredSalaryHeads.length} / {salaryHeads.length} Records
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
                        <th>Salary Head</th>
                        <th>Short Name</th>
                        <th>Group</th>
                        <th>Editable</th>
                        <th>Loan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSalaryHeads.map((salaryHead, index) => (
                        <tr key={salaryHead.id}>
                          <td>{index + 1}</td>
                          <td>{salaryHead.salaryHeadName}</td>
                          <td>{salaryHead.shortName}</td>
                          <td>
                            <span
                              className={`badge ${
                                salaryHead.groupName === "Addition"
                                  ? "bg-success"
                                  : "bg-danger"
                              }`}
                            >
                              {salaryHead.groupName}
                            </span>
                          </td>
                          <td>
                            {salaryHead.isEditable ? (
                              <span className="badge bg-primary">Yes</span>
                            ) : (
                              <span className="badge bg-secondary">No</span>
                            )}
                          </td>
                          <td>
                            {salaryHead.isLoan ? (
                              <span className="badge bg-warning">Yes</span>
                            ) : (
                              <span className="badge bg-secondary">No</span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {filteredSalaryHeads.length === 0 && (
                        <tr>
                          <td
                            colSpan={6}
                            className="text-center py-4 text-muted"
                          >
                            No salary heads found
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

export default SalaryHead;