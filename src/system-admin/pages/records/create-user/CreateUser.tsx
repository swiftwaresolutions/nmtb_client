import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Table,
  Form,
} from "react-bootstrap";
import { RootState } from "../../../../state/store";
import { routerPathNames } from "../../../../routes/routerPathNames";
import SearchInput from "../../../../components/SearchInput";
import { useTableSearch } from "../../../../hooks/useTableSearch";
import {
  showSuccessToast,
  showErrorToast,
  showValidationError,
} from "../../../../utils/alertUtil";
import {
  Gear,
  ClipboardCheck,
  FileText,
  BarChartFill,
  Bullseye,
  Sliders2,
  PencilSquare,
  PlusCircle,
  XCircle,
  Clock,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ListCheck,
  ShieldX,
  ArrowRepeat,
} from "react-bootstrap-icons";
import PageHeader from "../../../../components/PageHeader";
import { faUsers } from "@fortawesome/free-solid-svg-icons";
import { SystemAdminApiService } from "../../../../api/system-admin/system-admin-api-service";

interface User {
  id: number;
  username: string;
  fullName: string;
  isBlock: number;
  dob: string | null;
  gender: string | null;
  isDoctor: number;
  doctorId: number | null;
  secId: number | null;
  isNurse: number;
  role?: string;
  roleId?: number | null;
}

interface Consultant {
  id: number;
  name: string;
  deptId: number;
  isActive: number;
  isCons: number;
  isSenior: number;
  newCharges: number;
  repeatCharges: number;
  renewalDays: number;
  concession: number;
  days: number;
}

interface RoleOption {
  id: number;
  roleName: string;
  description: string;
  isActive: number;
}

const CreateUser = () => {
  const navigate = useNavigate();
  // const loginData = useSelector((state: RootState) => state.loginData);
  // const dispatch = useDispatch();

  // Refs for input fields to enable focus on validation errors
  const fullNameRef = useRef<HTMLInputElement>(null);
  const userIdRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const doctorNameRef = useRef<HTMLSelectElement>(null);

  const [form, setForm] = useState({
    fullName: "",
    userId: "",
    password: "",
    confirmPassword: "",
    isDoctor: false,
    isNurse: false,
    doctorId: null as number | null,
    doctorName: "",
    role: "",
    roleId: null as number | null,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showBlocked, setShowBlocked] = useState(false);

  // Data from API
  const [doctors, setDoctors] = useState<Consultant[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);

  // Fetch users on component mount
  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    setLoading(true);
    try {
      const systemAdminApiService = new SystemAdminApiService();
      
      // Fetch consultants/doctors
      const consultantsResponse = await systemAdminApiService.fetchAllConsultants();
      if (consultantsResponse && Array.isArray(consultantsResponse)) {
        setDoctors(consultantsResponse);
      }

      // Fetch roles
      const rolesResponse = await systemAdminApiService.fetchAllUserRoles();
      if (rolesResponse && Array.isArray(rolesResponse)) {
        setRoles(rolesResponse);
      }

      // Fetch users
      const usersResponse = await systemAdminApiService.fetchAllUsers();
      if (usersResponse && Array.isArray(usersResponse)) {
        setUsers(usersResponse);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      showErrorToast("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const systemAdminApiService = new SystemAdminApiService();
      const usersResponse = await systemAdminApiService.fetchAllUsers();
      if (usersResponse && Array.isArray(usersResponse)) {
        setUsers(usersResponse);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const target = e.target;
    const { name, value, type } = target;
    if (name === "isDoctor" && type === "checkbox") {
      const checked = (target as HTMLInputElement).checked;
      setForm((prev) => ({
        ...prev,
        isDoctor: checked,
        doctorId: checked ? prev.doctorId : null,
        doctorName: checked ? prev.doctorName : "",
      }));
    } else if (name === "isNurse" && type === "checkbox") {
      const checked = (target as HTMLInputElement).checked;
      setForm((prev) => ({
        ...prev,
        isNurse: checked,
      }));
    } else if (name === "doctorName") {
      const selectedDoctor = doctors.find((d) => d.name === value);
      setForm((prev) => ({
        ...prev,
        doctorName: value,
        doctorId: selectedDoctor ? selectedDoctor.id : null,
      }));
    } else if (name === "role") {
      const selectedRole = roles.find((r) => r.roleName === value);
      setForm((prev) => ({
        ...prev,
        role: value,
        roleId: selectedRole ? selectedRole.id : null,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAddOrUpdate = async () => {
    if (!form.fullName.trim()) {
      showValidationError("Full name is required.");
      setTimeout(() => fullNameRef.current?.focus(), 100);
      return;
    }

    if (!form.userId.trim()) {
      showValidationError("User ID is required.");
      setTimeout(() => userIdRef.current?.focus(), 100);
      return;
    }

    if (!editingId && !form.password.trim()) {
      showValidationError("Password is required.");
      setTimeout(() => passwordRef.current?.focus(), 100);
      return;
    }

    if (!editingId && form.password !== form.confirmPassword) {
      showValidationError("Passwords do not match.");
      setTimeout(() => confirmPasswordRef.current?.focus(), 100);
      return;
    }

    if (form.isDoctor && !form.doctorName.trim()) {
      showValidationError("Please select a doctor name.");
      setTimeout(() => doctorNameRef.current?.focus(), 100);
      return;
    }

    setLoading(true);

    try {
      const systemAdminApiService = new SystemAdminApiService();

      if (editingId !== null) {
        // Update existing user - TODO: API for update when available
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.id === editingId
              ? {
                  ...u,
                  fullName: form.fullName,
                  username: form.userId,
                  isDoctor: form.isDoctor ? 1 : 0,
                  doctorId: form.isDoctor ? form.doctorId : null,
                  secId: form.roleId,
                  isNurse: form.isNurse ? 1 : 0,
                  role: form.role,
                  roleId: form.roleId,
                }
              : u
          )
        );
        showSuccessToast("User updated successfully!");
      } else {
        // Add new user via API
        const payload = {
          username: form.userId,
          password: form.password,
          fullName: form.fullName,
          isDoctor: form.isDoctor ? 1 : 0,
          doctorId: form.isDoctor && form.doctorId ? form.doctorId : 0,
          secId:  0,
          roleId: form.roleId || 0,
          isNurse: form.isNurse ? 1 : 0,
        };

        await systemAdminApiService.saveTheUser(payload);
        showSuccessToast("User created successfully!");
        
        // Refresh users list
        await fetchUsers();
      }

      // Reset form
      setForm({
        fullName: "",
        userId: "",
        password: "",
        confirmPassword: "",
        isDoctor: false,
        isNurse: false,
        doctorId: null,
        doctorName: "",
        role: "",
        roleId: null,
      });
      setEditingId(null);
    } catch (error: any) {
      console.error("Error saving user:", error);
      showErrorToast(
        error?.response?.data?.error || "Failed to save user. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: number) => {
    const user = users.find((u) => u.id === id);
    if (!user) return;

    // Find doctor name if user is a doctor
    const doctor = doctors.find((d) => d.id === user.doctorId);
    // Find role name from secId
    const role = roles.find((r) => r.id === user.secId);

    setForm({
      fullName: user.fullName,
      userId: user.username,
      password: "", // Don't populate password for security
      confirmPassword: "",
      isDoctor: user.isDoctor === 1,
      isNurse: user.isNurse === 1,
      doctorId: user.doctorId,
      doctorName: doctor ? doctor.name : "",
      role: role ? role.roleName : "",
      roleId: user.secId || null,
    });
    setEditingId(id);
  };

  const handleCancelEdit = () => {
    setForm({
      fullName: "",
      userId: "",
      password: "",
      confirmPassword: "",
      isDoctor: false,
      isNurse: false,
      doctorId: null,
      doctorName: "",
      role: "",
      roleId: null,
    });
    setEditingId(null);
  };

  const handleBlock = async (id: number) => {
    const user = users.find((u) => u.id === id);
    if (!user) return;

    try {
      // TODO: Implement API call to block user
      // For now, just update local state
      setUsers(
        users.map((u) => (u.id === id ? { ...u, isBlock: 1 } : u))
      );
      showSuccessToast("User blocked successfully");
    } catch (error: any) {
      console.error("Error blocking user:", error);
      showErrorToast(
        error?.response?.data?.error ||
          "Failed to block user. Please try again."
      );
    }
  };

  const handleUnblock = async (id: number) => {
    const user = users.find((u) => u.id === id);
    if (!user) return;

    try {
      // TODO: Implement API call to unblock user
      // For now, just update local state
      setUsers(
        users.map((u) => (u.id === id ? { ...u, isBlock: 0 } : u))
      );
      showSuccessToast("User unblocked successfully");
    } catch (error: any) {
      console.error("Error unblocking user:", error);
      showErrorToast(
        error?.response?.data?.error ||
          "Failed to unblock user. Please try again."
      );
    }
  };

  const activeUsers = users.filter((u) => u.isBlock === 0);
  const blockedUsers = users.filter((u) => u.isBlock === 1);

  // Search functionality for active users
  const {
    filteredData: filteredActiveUsers,
    searchTerm: activeSearchTerm,
    setSearchTerm: setActiveSearchTerm,
    resultCount: activeResultCount,
    totalCount: activeTotalCount,
  } = useTableSearch({
    data: activeUsers,
    searchFields: ["fullName", "username"],
  });

  // Search functionality for blocked users
  const {
    filteredData: filteredBlockedUsers,
    searchTerm: blockedSearchTerm,
    setSearchTerm: setBlockedSearchTerm,
    resultCount: blockedResultCount,
    totalCount: blockedTotalCount,
  } = useTableSearch({
    data: blockedUsers,
    searchFields: ["fullName", "username"],
  });

  const handleBack = () => {
    navigate(routerPathNames.systemAdmin.dashboard);
  };

  return (
    <div>
      {/* Header Section */}
      <PageHeader
        icon={faUsers}
        title={editingId ? "Edit User Master" : "Add User Master"}
        subtitle={
          editingId
            ? "Update user information and access settings"
            : "Create a new user account with appropriate permissions"
        }
        badges={[
          { label: "Active", value: activeUsers.length },
          { label: "Blocked", value: blockedUsers.length },
          { label: "Total", value: users.length },
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
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Full Name <span style={{ color: "red" }}>*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleInputChange}
                      ref={fullNameRef}
                      placeholder="Enter full name"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>
                      User ID (Login Name) <span style={{ color: "red" }}>*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="userId"
                      value={form.userId}
                      onChange={handleInputChange}
                      ref={userIdRef}
                      placeholder="Enter user ID"
                      required
                    />
                  </Form.Group>

                  {!editingId && (
                    <>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          Password <span style={{ color: "red" }}>*</span>
                        </Form.Label>
                        <Form.Control
                          type="password"
                          name="password"
                          value={form.password}
                          onChange={handleInputChange}
                          ref={passwordRef}
                          placeholder="Enter password"
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
                          onChange={handleInputChange}
                          ref={confirmPasswordRef}
                          placeholder="Confirm password"
                          required
                        />
                      </Form.Group>
                    </>
                  )}

                  <Form.Group className="mb-3">
                    <Form.Label>
                      Role <span style={{ color: "red" }}>*</span>
                    </Form.Label>
                    <Form.Control
                      as="select"
                      name="role"
                      value={form.role}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">-- Select Role --</option>
                      {roles.filter(r => r.isActive === 1).map((role) => (
                        <option key={role.id} value={role.roleName}>
                          {role.roleName}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Row>
                      <Col xs={6}>
                        <Form.Check
                          type="checkbox"
                          id="is-doctor"
                          label="Is Doctor"
                          name="isDoctor"
                          checked={form.isDoctor}
                          onChange={handleInputChange}
                        />
                      </Col>
                      <Col xs={6}>
                        <Form.Check
                          type="checkbox"
                          id="is-nurse"
                          label="Is Nurse"
                          name="isNurse"
                          checked={form.isNurse}
                          onChange={handleInputChange}
                        />
                      </Col>
                    </Row>
                  </Form.Group>

                  {form.isDoctor && (
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Select Doctor Name <span style={{ color: "red" }}>*</span>
                      </Form.Label>
                      <Form.Control
                        as="select"
                        name="doctorName"
                        value={form.doctorName}
                        onChange={handleInputChange}
                        ref={doctorNameRef}
                        required
                      >
                        <option value="">-- Select Doctor --</option>
                        {doctors.map((doctor) => (
                          <option key={doctor.id} value={doctor.name}>
                            {doctor.name}
                          </option>
                        ))}
                      </Form.Control>
                    </Form.Group>
                  )}

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
                    <div>
                      <Button
                        variant="success"
                        onClick={handleAddOrUpdate}
                        disabled={loading}
                        style={{
                          marginRight: "10px",
                          minWidth: "150px",
                          fontWeight: "var(--font-weight-semibold)",
                          fontSize: "var(--font-size-lg)",
                        }}
                      >
                        {loading ? (
                          <>
                            <Clock /> Saving...
                          </>
                        ) : editingId ? (
                          <>
                            <PencilSquare /> Update User
                          </>
                        ) : (
                          <>
                            <CheckCircle /> Create User
                          </>
                        )}
                      </Button>
                      {editingId && (
                        <Button
                          variant="outline-secondary"
                          onClick={handleCancelEdit}
                          disabled={loading}
                          style={{ minWidth: "100px" }}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </Form>
              </Card>
            </Col>

            {/* Right: List */}
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
                      {showBlocked ? (
                        <ShieldX size={22} color="#dc3545" />
                      ) : (
                        <ListCheck size={22} color="#28a745" />
                      )}
                      <h5 className="mb-0" style={{ fontWeight: "var(--font-weight-semibold)" }}>
                        {showBlocked ? "Blocked Users" : "Active Users"}
                      </h5>
                      <span
                        className="badge"
                        style={{
                          background: showBlocked ? "#dc3545" : "#28a745",
                          fontSize: "var(--font-size-xs)",
                          padding: "4px 8px",
                        }}
                      >
                        {showBlocked
                          ? filteredBlockedUsers.length
                          : filteredActiveUsers.length}
                      </span>
                    </div>
                    <Button
                      variant={showBlocked ? "outline-success" : "outline-danger"}
                      size="sm"
                      onClick={() => setShowBlocked(!showBlocked)}
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
                    placeholder={`Search users by name or user ID...`}
                    resultCount={
                      showBlocked ? blockedResultCount : activeResultCount
                    }
                    totalCount={
                      showBlocked ? blockedTotalCount : activeTotalCount
                    }
                    showResultCount={true}
                  />
                </div>

                <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Full Name</th>
                        <th>User ID</th>
                        <th>Role</th>
                        <th>Doctor</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(showBlocked
                        ? filteredBlockedUsers
                        : filteredActiveUsers
                      ).length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ textAlign: "center" }}>
                            {showBlocked
                              ? blockedSearchTerm
                                ? "No blocked users match your search."
                                : "No blocked users."
                              : activeSearchTerm
                              ? "No active users match your search."
                              : "No active users."}
                          </td>
                        </tr>
                      ) : (
                        (showBlocked
                          ? filteredBlockedUsers
                          : filteredActiveUsers
                        ).map((user, idx) => (
                          <tr
                            key={user.id}
                            style={{
                              backgroundColor:
                                editingId === user.id ? "#fff3cd" : "transparent",
                              fontWeight: editingId === user.id ? "var(--font-weight-semibold)" : "normal",
                              borderLeft:
                                editingId === user.id
                                  ? "4px solid #ffc107"
                                  : "none",
                            }}
                          >
                            <td>{idx + 1}</td>
                            <td>
                              {user.fullName}
                              {editingId === user.id && (
                                <span className="ms-2 badge bg-warning text-dark">
                                  <i className="fas fa-edit me-1"></i>
                                  Editing
                                </span>
                              )}
                            </td>
                            <td>{user.username}</td>
                            <td>
                              {user.secId ? (
                                <span className="badge bg-primary">
                                  {roles.find(r => r.id === user.secId)?.roleName || '-'}
                                </span>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            <td>
                              {user.isDoctor === 1 ? (
                                <span className="badge bg-info">
                                  {doctors.find(d => d.id === user.doctorId)?.name || 'Yes'}
                                </span>
                              ) : (
                                <span className="text-muted">No</span>
                              )}
                            </td>
                            <td>
                              {showBlocked ? (
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  onClick={() => handleUnblock(user.id)}
                                >
                                  Unblock
                                </Button>
                              ) : (
                                <>
                                  {editingId !== user.id ? (
                                    <>
                                      <Button
                                        variant="outline-primary"
                                        size="sm"
                                        className="me-2"
                                        onClick={() => handleEdit(user.id)}
                                        disabled={loading}
                                      >
                                        Edit
                                      </Button>
                                      <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => handleBlock(user.id)}
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
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default CreateUser;