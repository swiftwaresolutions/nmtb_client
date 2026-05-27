import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Table,
  Alert,
  Badge,
} from "react-bootstrap";
import { useSelector } from "react-redux";
import { RootState } from "../../../../state/store";
import {
  showSuccessToast,
  showErrorToast,
  showValidationError,
} from "../../../../utils/alertUtil";
import SearchInput from "../../../../components/SearchInput";
import { useTableSearch } from "../../../../hooks/useTableSearch";

interface AccountHead {
  id: number;
  headId: number;
  headName: string;
  accountType: string;
  openDebit: number;
  openCredit: number;
}

interface AccountTypeGroup {
  type: string;
  heads: AccountHead[];
}

const accountTypes = [
  "CAPITAL ACCOUNT",
  "LIABILITIES",
  "CURRENT LIABILITIES",
  "SUNDRY CREDITORS",
  "FIXED ASSETS",
  "CURRENT ASSETS",
  "SUNDRY DEBTORS",
  "CASH-IN-HAND",
  "BANK ACCOUNTS",
  "STOCK IN HAND",
];

const OpenBalance: React.FC = () => {
  const loginData = useSelector((state: RootState) => state.loginData);
  
  const [accountHeads, setAccountHeads] = useState<AccountHead[]>([]);
  const [selectedType, setSelectedType] = useState<string>("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    headName: "",
    accountType: "",
    openDebit: 0,
    openCredit: 0,
  });

  // Search functionality
  const {
    filteredData: filteredHeads,
    searchTerm,
    setSearchTerm,
    resultCount,
    totalCount,
  } = useTableSearch({
    data: accountHeads,
    searchFields: ["headName", "accountType"],
  });

  // Fetch account heads on mount
  useEffect(() => {
    fetchAccountHeads();
  }, []);

  const fetchAccountHeads = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await financialApiService.fetchAccountHeads();
      // setAccountHeads(response);
      setAccountHeads([]);
    } catch (error) {
      console.error("Error fetching account heads:", error);
      showErrorToast("Failed to load account heads");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement | HTMLSelectElement;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "number" && name !== "accountType"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.headName.trim()) {
      showValidationError("Head Name is required");
      return false;
    }
    if (!formData.accountType) {
      showValidationError("Account Type is required");
      return false;
    }
    if (formData.openDebit < 0 || formData.openCredit < 0) {
      showValidationError("Opening amounts cannot be negative");
      return false;
    }
    if (formData.openDebit > 0 && formData.openCredit > 0) {
      showValidationError("Either Debit or Credit should be entered, not both");
      return false;
    }
    return true;
  };

  const handleAdd = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      if (editingId !== null) {
        // Update existing
        setAccountHeads((prev) =>
          prev.map((head) =>
            head.id === editingId ? { ...head, ...formData } : head
          )
        );
        showSuccessToast("Opening balance updated successfully");
      } else {
        // Add new
        const newHead: AccountHead = {
          id: Date.now(),
          headId: 0,
          ...formData,
        };
        setAccountHeads((prev) => [...prev, newHead]);
        showSuccessToast("Opening balance added successfully");
      }

      resetForm();
    } catch (error) {
      console.error("Error saving opening balance:", error);
      showErrorToast("Failed to save opening balance");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (id: number) => {
    const head = accountHeads.find((h) => h.id === id);
    if (head) {
      setFormData({
        headName: head.headName,
        accountType: head.accountType,
        openDebit: head.openDebit,
        openCredit: head.openCredit,
      });
      setEditingId(id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleDelete = (id: number) => {
    setAccountHeads((prev) => prev.filter((head) => head.id !== id));
    showSuccessToast("Opening balance removed");
  };

  const handleCancel = () => {
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      headName: "",
      accountType: "",
      openDebit: 0,
      openCredit: 0,
    });
    setEditingId(null);
    setSelectedType("");
  };

  const handleSubmit = async () => {
    if (accountHeads.length === 0) {
      showValidationError("Please add at least one opening balance entry");
      return;
    }

    const totalDebit = accountHeads.reduce((sum, h) => sum + h.openDebit, 0);
    const totalCredit = accountHeads.reduce((sum, h) => sum + h.openCredit, 0);
    const difference = Math.abs(totalDebit - totalCredit);

    if (difference > 0.01) {
      showValidationError(
        `Debit and Credit amounts do not match.\n\nDebit: ${totalDebit.toFixed(
          2
        )} | Credit: ${totalCredit.toFixed(2)}\nDifference: ${difference.toFixed(2)}`
      );
      return;
    }

    setSubmitting(true);
    try {
      // TODO: Replace with actual API call
      // const payload = {
      //   uid: loginData.id,
      //   entries: accountHeads,
      //   totalDebit,
      //   totalCredit,
      // };
      // await financialApiService.saveOpeningBalance(payload);

      showSuccessToast("Opening balance saved successfully");
      setAccountHeads([]);
      resetForm();
    } catch (error) {
      console.error("Error submitting opening balance:", error);
      showErrorToast("Failed to submit opening balance");
    } finally {
      setSubmitting(false);
    }
  };

  const totalDebit = accountHeads.reduce((sum, h) => sum + h.openDebit, 0);
  const totalCredit = accountHeads.reduce((sum, h) => sum + h.openCredit, 0);
  const difference = Math.abs(totalDebit - totalCredit);
  const isBalanced = difference < 0.01;

  const groupedHeads = accountTypes.map((type) => ({
    type,
    count: accountHeads.filter((h) => h.accountType === type).length,
  }));

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="mb-1">
            <i className="fas fa-balance-scale me-2"></i>Opening Balance Entry
          </h2>
          <p className="text-muted">
            Configure opening balances for all account heads
          </p>
        </Col>
      </Row>

      <Row className="g-3">
        {/* Left: Form */}
        <Col lg={6}>
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-light border-bottom">
              <h5 className="mb-0">
                {editingId ? "Edit Opening Balance" : "Add Opening Balance"}
              </h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Head Name <span style={{ color: "red" }}>*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="headName"
                    value={formData.headName}
                    onChange={handleInputChange}
                    placeholder="Enter account head name"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    Account Type <span style={{ color: "red" }}>*</span>
                  </Form.Label>
                  <Form.Select
                    name="accountType"
                    value={formData.accountType}
                    onChange={handleInputChange}
                  >
                    <option value="">-- Select Account Type --</option>
                    {accountTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Open Debit</Form.Label>
                      <Form.Control
                        type="number"
                        name="openDebit"
                        value={formData.openDebit}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Open Credit</Form.Label>
                      <Form.Control
                        type="number"
                        name="openCredit"
                        value={formData.openCredit}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex gap-2">
                  <Button
                    variant={editingId ? "warning" : "success"}
                    onClick={handleAdd}
                    disabled={submitting}
                    className="flex-grow-1"
                  >
                    {submitting ? (
                      <>
                        <i className="fas fa-spinner fa-spin me-2"></i>
                        Saving...
                      </>
                    ) : editingId ? (
                      <>
                        <i className="fas fa-edit me-2"></i>Update
                      </>
                    ) : (
                      <>
                        <i className="fas fa-plus me-2"></i>Add
                      </>
                    )}
                  </Button>
                  {editingId && (
                    <Button
                      variant="outline-secondary"
                      onClick={handleCancel}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </Form>

              {/* Balance Summary */}
              <hr className="my-4" />
              <div className="bg-light p-3 rounded">
                <h6 className="mb-2">
                  <i className="fas fa-calculator me-2"></i>Balance Summary
                </h6>
                <Row>
                  <Col md={6}>
                    <div className="small">
                      <span className="text-muted">Total Debit:</span>
                      <br />
                      <strong className="fs-5">
                        {totalDebit.toFixed(2)}
                      </strong>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="small">
                      <span className="text-muted">Total Credit:</span>
                      <br />
                      <strong className="fs-5">
                        {totalCredit.toFixed(2)}
                      </strong>
                    </div>
                  </Col>
                </Row>
                <hr className="my-2" />
                <div className="small">
                  <span className="text-muted">Difference:</span>
                  <br />
                  <strong
                    className="fs-5"
                    style={{
                      color: isBalanced ? "#28a745" : "#dc3545",
                    }}
                  >
                    {difference.toFixed(2)}
                  </strong>
                  {isBalanced ? (
                    <Badge bg="success" className="ms-2">
                      <i className="fas fa-check me-1"></i>Balanced
                    </Badge>
                  ) : (
                    <Badge bg="danger" className="ms-2">
                      <i className="fas fa-exclamation-triangle me-1"></i>
                      Not Balanced
                    </Badge>
                  )}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Right: Summary & List */}
        <Col lg={6}>
          <Card className="shadow-sm mb-3">
            <Card.Header className="bg-light border-bottom">
              <h5 className="mb-0">Account Types Summary</h5>
            </Card.Header>
            <Card.Body>
              <div
                style={{
                  maxHeight: "200px",
                  overflowY: "auto",
                }}
              >
                <Table size="sm" className="mb-0">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th className="text-end">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedHeads.map((group) => (
                      <tr key={group.type}>
                        <td className="small">{group.type}</td>
                        <td className="text-end">
                          <Badge bg={group.count > 0 ? "primary" : "secondary"}>
                            {group.count}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>

          <Card className="shadow-sm">
            <Card.Header className="bg-light border-bottom d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                Added Entries ({accountHeads.length})
              </h5>
              <SearchInput
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                placeholder="Search entries..."
                resultCount={resultCount}
                totalCount={totalCount}
                className="w-auto"
              />
            </Card.Header>
            <Card.Body
              style={{
                maxHeight: "400px",
                overflowY: "auto",
              }}
            >
              {accountHeads.length === 0 ? (
                <Alert variant="info" className="mb-0">
                  <i className="fas fa-info-circle me-2"></i>
                  No entries added yet
                </Alert>
              ) : (
                <Table striped bordered hover size="sm" className="mb-0">
                  <thead style={{ position: "sticky", top: 0, backgroundColor: "#f8f9fa", zIndex: 10 }}>
                    <tr>
                      <th>Head Name</th>
                      <th className="text-end">Debit</th>
                      <th className="text-end">Credit</th>
                      <th className="text-center" style={{ width: "80px" }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHeads.map((head: AccountHead) => (
                      <tr
                        key={head.id}
                        style={{
                          backgroundColor:
                            editingId === head.id ? "#fff3cd" : "transparent",
                        }}
                      >
                        <td className="small">
                          <div className="fw-500">{head.headName}</div>
                          <div className="text-muted small">
                            {head.accountType}
                          </div>
                        </td>
                        <td className="text-end small">
                          {head.openDebit > 0 ? head.openDebit.toFixed(2) : "-"}
                        </td>
                        <td className="text-end small">
                          {head.openCredit > 0
                            ? head.openCredit.toFixed(2)
                            : "-"}
                        </td>
                        <td className="text-center">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-1"
                            onClick={() => handleEdit(head.id)}
                            disabled={editingId !== null}
                            title="Edit"
                          >
                            <i className="fas fa-edit"></i>
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(head.id)}
                            title="Delete"
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Bottom Submit */}
      {accountHeads.length > 0 && (
        <Row className="mt-4">
          <Col>
            <div className="d-flex justify-content-end gap-2 mb-3">
              <Button
                variant="outline-secondary"
                onClick={() => {
                  setAccountHeads([]);
                  resetForm();
                }}
              >
                <i className="fas fa-times me-2"></i>Clear All
              </Button>
              <Button
                variant="success"
                size="lg"
                onClick={handleSubmit}
                disabled={submitting || !isBalanced}
              >
                {submitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin me-2"></i>
                    Submitting...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-2"></i>Submit Opening Balance
                  </>
                )}
              </Button>
            </div>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default OpenBalance;
