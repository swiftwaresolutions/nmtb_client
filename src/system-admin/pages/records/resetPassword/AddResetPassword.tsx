import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Table,
} from "react-bootstrap";
import { routerPathNames } from "../../../../routes/routerPathNames";
import SearchInput from "../../../../components/SearchInput";
import { useTableSearch } from "../../../../hooks/useTableSearch";
import {
  showSuccessToast,
  showValidationError,
  showErrorToast,
} from "../../../../utils/alertUtil";
import {
  ChevronLeft,
  Clock,
  CheckCircle,
  ListCheck,
  ArrowRepeat,
  Calendar,
  Person,
} from "react-bootstrap-icons";
import PageHeader from "../../../../components/PageHeader";
import { faKey } from "@fortawesome/free-solid-svg-icons";

interface User {
  id: number;
  fullName: string;
  userId: string;
  password: string;
  isDoctor: number;
  doctorId: number | null;
  doctorName: string | null;
  blocked: number;
  entDateTime: string;
  uid: number;
}

interface PasswordReset {
  id: number;
  userId: string;
  fullName: string;
  resetDateTime: string;
  reason: string;
  resetBy: string;
}

const AddResetPassword = () => {
  const navigate = useNavigate();

  // Refs for input fields to enable focus on validation errors
  const userIdRef = useRef<HTMLSelectElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const reasonRef = useRef<HTMLTextAreaElement>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState({
    userId: "",
    newPassword: "",
    confirmPassword: "",
    reason: "",
  });
  const [loading, setLoading] = useState(false);
  const [showAllResets, setShowAllResets] = useState(false); // Toggle between recent and all resets
  const [passwordResets, setPasswordResets] = useState<PasswordReset[]>(() => {
    const savedResets = localStorage.getItem("passwordResets");
    if (savedResets) {
      return JSON.parse(savedResets);
    }
    // Initial dummy data
    return [
      {
        id: 1,
        userId: "johndoe",
        fullName: "John Doe",
        resetDateTime: "2024-01-15T14:30:00",
        reason: "Forgot password",
        resetBy: "admin",
      },
      {
        id: 2,
        userId: "sarahj",
        fullName: "Dr. Sarah Johnson",
        resetDateTime: "2024-01-10T09:15:00",
        reason: "Security breach - precautionary reset",
        resetBy: "admin",
      },
      {
        id: 3,
        userId: "admin",
        fullName: "Admin User",
        resetDateTime: "2024-01-05T16:45:00",
        reason: "Routine password change",
        resetBy: "system",
      },
      {
        id: 4,
        userId: "nursej",
        fullName: "Jane Nurse",
        resetDateTime: "2024-01-20T11:20:00",
        reason: "Password compromise suspected",
        resetBy: "admin",
      },
      {
        id: 5,
        userId: "techm",
        fullName: "Mike Technician",
        resetDateTime: "2024-01-22T08:15:00",
        reason: "User request - forgot password",
        resetBy: "admin",
      },
    ];
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    localStorage.setItem("passwordResets", JSON.stringify(passwordResets));
  }, [passwordResets]);

  const fetchUsers = () => {
    // Load users from localStorage (same as CreateUser)
    const savedUsers = localStorage.getItem("users");
    if (savedUsers) {
      const parsed = JSON.parse(savedUsers);
      // Filter only active users
      const activeUsers = parsed.filter((u: User) => u.blocked === 0);
      setUsers(activeUsers);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.userId) {
      showValidationError("Please select a user.");
      setTimeout(() => userIdRef.current?.focus(), 100);
      return;
    }

    if (!form.newPassword.trim()) {
      showValidationError("New password is required.");
      setTimeout(() => passwordRef.current?.focus(), 100);
      return;
    }

    if (form.newPassword.length < 4) {
      showValidationError("Password must be at least 4 characters long.");
      setTimeout(() => passwordRef.current?.focus(), 100);
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      showValidationError("Passwords do not match.");
      setTimeout(() => confirmPasswordRef.current?.focus(), 100);
      return;
    }

    if (!form.reason.trim()) {
      showValidationError("Reason for reset is required.");
      setTimeout(() => reasonRef.current?.focus(), 100);
      return;
    }

    setLoading(true);

    try {
      // Update user password in localStorage
      const savedUsers = localStorage.getItem("users");
      if (savedUsers) {
        const usersArr = JSON.parse(savedUsers);
        const updatedUsers = usersArr.map((u: User) =>
          u.userId === form.userId ? { ...u, password: form.newPassword } : u
        );
        localStorage.setItem("users", JSON.stringify(updatedUsers));
        setUsers(updatedUsers.filter((u: User) => u.blocked === 0));
      }

      // Add password reset record
      const selectedUser = users.find((u) => u.userId === form.userId);
      const newReset: PasswordReset = {
        id: passwordResets.length > 0 ? Math.max(...passwordResets.map(r => r.id)) + 1 : 1,
        userId: form.userId,
        fullName: selectedUser?.fullName || "",
        resetDateTime: new Date().toISOString(),
        reason: form.reason,
        resetBy: "admin", // TODO: Get from login context
      };

      setPasswordResets(prev => [newReset, ...prev]);
      showSuccessToast("Password reset successfully!");

      // Reset form
      setForm({
        userId: "",
        newPassword: "",
        confirmPassword: "",
        reason: "",
      });
    } catch (error: any) {
      console.error("Error resetting password:", error);
      showErrorToast("Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Filter resets - show recent (last 5) or all
  const recentResets = passwordResets.slice(0, 5);
  const displayedResets = showAllResets ? passwordResets : recentResets;

  // Search functionality for password resets
  const {
    filteredData: filteredResets,
    searchTerm,
    setSearchTerm,
    resultCount,
    totalCount,
  } = useTableSearch({
    data: displayedResets,
    searchFields: ["userId", "fullName", "reason", "resetBy"],
  });

  const formatDateTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleString();
  };

  return (
    <div>
      {/* Header Section */}
      <PageHeader
        icon={faKey}
        title="Reset User Password"
        subtitle="Reset the password for an existing user account and maintain audit trail"
        badges={[
          { label: "Active Users", value: users.length },
          { label: "Total Resets", value: passwordResets.length },
          { label: "Recent Resets", value: recentResets.length },
        ]}
      />
      <div className="content-body">
        <Container fluid>
          <Row>
            {/* Left: Form */}
            <Col md={7} style={{ maxHeight: "80vh", overflowY: "auto" }}>
              <Card
                className="shadow-sm"
                style={{
                  padding: "2rem",
                  background: "white",
                  borderRadius: "10px",
                  maxHeight: "78vh",
                  overflowY: "auto",
                }}
              >
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Select User <span style={{ color: "red" }}>*</span>
                    </Form.Label>
                    <Form.Select
                      name="userId"
                      value={form.userId}
                      onChange={handleChange}
                      ref={userIdRef}
                      required
                    >
                      <option value="">-- Select User --</option>
                      {users.map((user, index) => {
                        // Format similar to table display
                        const displayText = user.isDoctor === 1 
                          ? `${index + 1}. ${user.fullName} (${user.userId}) - Dr. ${user.doctorName}`
                          : `${index + 1}. ${user.fullName} (${user.userId}) - Staff Member`;
                        
                        return (
                          <option key={user.userId} value={user.userId}>
                            {displayText}
                          </option>
                        );
                      })}
                    </Form.Select>
                    <Form.Text className="text-muted">
                      Select from {users.length} active users. Format: Name (UserID) - Role
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>
                      New Password <span style={{ color: "red" }}>*</span>
                    </Form.Label>
                    <Form.Control
                      type="password"
                      name="newPassword"
                      value={form.newPassword}
                      onChange={handleChange}
                      ref={passwordRef}
                      placeholder="Enter new password (min 6 characters)"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>
                      Confirm Password <span style={{ color: "red" }}>*</span>
                    </Form.Label>
                    <Form.Control
                      type="password"
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      ref={confirmPasswordRef}
                      placeholder="Confirm new password"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>
                      Reason For Password Reset <span style={{ color: "red" }}>*</span>
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      name="reason"
                      value={form.reason}
                      onChange={handleChange}
                      ref={reasonRef}
                      rows={4}
                      placeholder="Enter detailed reason for password reset (e.g., forgot password, security breach, etc.)"
                      required
                    />
                  </Form.Group>

                  <div
                    className="d-flex justify-content-between mt-4"
                    style={{
                      paddingTop: "1.5rem",
                      borderTop: "2px solid #e0e0e0",
                    }}
                  >
                    <Button
                      variant="outline-secondary"
                      onClick={() => navigate(routerPathNames.systemAdmin.dashboard)}
                      style={{ minWidth: "120px", fontWeight: "var(--font-weight-medium)" }}
                    >
                      <ChevronLeft /> Back
                    </Button>
                    <Button
                      type="submit"
                      variant="success"
                      disabled={loading}
                      style={{
                        minWidth: "180px",
                        fontWeight: "var(--font-weight-semibold)",
                        fontSize: "var(--font-size-lg)",
                      }}
                    >
                      {loading ? (
                        <>
                          <Clock /> Resetting...
                        </>
                      ) : (
                        <>
                          <CheckCircle /> Reset Password
                        </>
                      )}
                    </Button>
                  </div>
                </Form>
              </Card>
            </Col>

            {/* Right: Password Reset History */}
            <Col md={5} style={{ maxHeight: "80vh", overflowY: "auto" }}>
              <Card
                className="shadow-sm"
                style={{
                  background: "white",
                  borderRadius: "12px",
                  border: "1px solid #e0e0e0",
                  maxHeight: "calc(78vh - 120px)",
                  display: "flex",
                  flexDirection: "column",
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
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex align-items-center gap-2">
                      {showAllResets ? (
                        <ListCheck size={22} color="#007bff" />
                      ) : (
                        <Calendar size={22} color="#28a745" />
                      )}
                      <h5 className="mb-0" style={{ fontWeight: "var(--font-weight-semibold)" }}>
                        {showAllResets ? "All Password Resets" : "Recent Password Resets"}
                      </h5>
                      <span
                        className="badge"
                        style={{
                          background: showAllResets ? "#007bff" : "#28a745",
                          fontSize: "var(--font-size-xs)",
                          padding: "4px 8px",
                        }}
                      >
                        {filteredResets.length}
                      </span>
                    </div>
                    <Button
                      variant={showAllResets ? "outline-success" : "outline-primary"}
                      size="sm"
                      onClick={() => setShowAllResets(!showAllResets)}
                      style={{
                        borderRadius: "20px",
                        padding: "6px 16px",
                        fontWeight: "var(--font-weight-medium)",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <ArrowRepeat size={16} />
                      {showAllResets ? "Show Recent" : "Show All"}
                    </Button>
                  </div>

                  {/* Search Input */}
                  <SearchInput
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    placeholder="Search by user, reason, or reset by..."
                    resultCount={resultCount}
                    totalCount={totalCount}
                    showResultCount={true}
                  />
                </div>

                <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>User</th>
                        <th>Reset Date</th>
                        <th>Reason</th>
                        <th>Reset By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredResets.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ textAlign: "center" }}>
                            {searchTerm
                              ? "No password resets match your search."
                              : showAllResets
                              ? "No password resets recorded yet."
                              : "No recent password resets."}
                          </td>
                        </tr>
                      ) : (
                        filteredResets.map((reset, idx) => (
                          <tr key={reset.id}>
                            <td>{idx + 1}</td>
                            <td>
                              <div>
                                <strong>{reset.fullName}</strong>
                                <br />
                                <small className="text-muted">
                                  {reset.userId}
                                </small>
                              </div>
                            </td>
                            <td>
                              <small>{formatDateTime(reset.resetDateTime)}</small>
                            </td>
                            <td>
                              <small title={reset.reason}>
                                {reset.reason.length > 25
                                  ? `${reset.reason.substring(0, 25)}...`
                                  : reset.reason}
                              </small>
                            </td>
                            <td>
                              <span className="badge bg-secondary">
                                {reset.resetBy}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </div>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default AddResetPassword;