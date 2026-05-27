import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Table,
} from "react-bootstrap";
import { useTableSearch } from "../../../../hooks/useTableSearch";
import { ListCheck, ShieldX, ArrowRepeat } from "react-bootstrap-icons";
import { useDispatch } from "react-redux";
import {
  showSuccessToast,
  showErrorToast,
  showValidationError,
  showConfirmDialog,
} from "../../../../utils/alertUtil";
import { handleError } from "../../../../utils/errorUtil";
import { SystemAdminApiService } from "../../../../api/system-admin/system-admin-api-service";
import SearchInput from "../../../../components/SearchInput";

interface Ward {
  id: number;
  wardName: string;
  code: string;
  blocked: number;
}

interface RoomBed {
  id: number;
  type: "room" | "bed";
  identification: string;
  specification: string;
  category: string;
  roomCategoryId?: number;
  wardId: number | null;
  wardName?: string;
  charges: {
    bedCharge: {
      generalCharge: number;
      generalCharity: number;
      privateRate: number;
      privateCharity: number;
    };
    nursingCare: {
      generalCharge: number;
      generalCharity: number;
      privateRate: number;
      privateCharity: number;
    };
    professionalCharges: {
      generalCharge: number;
      generalCharity: number;
      privateRate: number;
      privateCharity: number;
    };
    admissionFees: {
      generalCharge: number;
      generalCharity: number;
      privateRate: number;
      privateCharity: number;
    };
  };
  isActive: number;
}

const mapRoomCategoryIdToLabel = (categoryId?: number) => {
  if (categoryId === 2) return "CATEGORY B";
  if (categoryId === 3) return "CATEGORY C";
  if (categoryId === 4) return "CATEGORY D";
  return "CATEGORY A";
};

const mapRoomCategoryLabelToId = (category: string) => {
  if (category === "CATEGORY B") return 2;
  if (category === "CATEGORY C") return 3;
  if (category === "CATEGORY D") return 4;
  return 1;
};

const AddRoomsBeds: React.FC = () => {
  const dispatch = useDispatch();
  const apiService = new SystemAdminApiService();
  const [wards, setWards] = useState<Ward[]>([]);
  const [roomsBeds, setRoomsBeds] = useState<RoomBed[]>([]);

  const [form, setForm] = useState({
    type: "room" as "room" | "bed",
    identification: "",
    specification: "",
    category: "CATEGORY A",
    wardId: null as number | null,
    charges: {
      bedCharge: { generalCharge: 0, generalCharity: 0, privateRate: 0, privateCharity: 0 },
      nursingCare: { generalCharge: 0, generalCharity: 0, privateRate: 0, privateCharity: 0 },
      professionalCharges: { generalCharge: 0, generalCharity: 0, privateRate: 0, privateCharity: 0 },
      admissionFees: { generalCharge: 0, generalCharity: 0, privateRate: 0, privateCharity: 0 },
    },
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showBlocked, setShowBlocked] = useState(false);

  const emptyCharges = {
    bedCharge: { generalCharge: 0, generalCharity: 0, privateRate: 0, privateCharity: 0 },
    nursingCare: { generalCharge: 0, generalCharity: 0, privateRate: 0, privateCharity: 0 },
    professionalCharges: { generalCharge: 0, generalCharity: 0, privateRate: 0, privateCharity: 0 },
    admissionFees: { generalCharge: 0, generalCharity: 0, privateRate: 0, privateCharity: 0 },
  };

  const mapApiChargeToUi = (apiCharge: any) => ({
    generalCharge: apiCharge?.generalCharge || 0,
    generalCharity: apiCharge?.generalCharityCharge || 0,
    privateRate: apiCharge?.privateCharge || 0,
    privateCharity: apiCharge?.privateCharityCharge || 0,
  });

  const mapUiChargeToApi = (uiCharge: {
    generalCharge: number;
    generalCharity: number;
    privateRate: number;
    privateCharity: number;
  }, chargeTypeId: number) => ({
    chargeTypeId,
    generalCharge: uiCharge.generalCharge || 0,
    generalCharityCharge: uiCharge.generalCharity || 0,
    privateCharge: uiCharge.privateRate || 0,
    privateCharityCharge: uiCharge.privateCharity || 0,
  });

  const fetchWards = async () => {
    const response = await apiService.fetchAllWards();
    const mappedWards: Ward[] = (response || []).map((ward: any) => ({
      id: ward.id,
      wardName: ward.name || ward.wardName || "",
      code: ward.code || "",
      blocked: ward.isBlocked === 1 ? 1 : 0,
    }));
    setWards(mappedWards.filter((ward) => ward.blocked === 0));
    return mappedWards;
  };

  const fetchRoomBeds = async (allWards?: Ward[]) => {
    const response = await apiService.fetchAllRoomBed();
    const wardsData = allWards || wards;

    const mappedRoomBeds: RoomBed[] = (response || []).map((item: any) => {
      const apiType = String(item.type || "R").toUpperCase();
      const normalizedType = apiType === "B" || apiType === "BED" ? "bed" : "room";
      const wardNameFromWard = wardsData.find((ward) => ward.id === Number(item.wardId))?.wardName;

      return {
        id: item.roomId,
        type: normalizedType,
        identification: item.name || "",
        specification: item.name || "",
        category: mapRoomCategoryIdToLabel(item.roomCategoryId),
        roomCategoryId: item.roomCategoryId,
        wardId: item.wardId ?? null,
        wardName: item.wardName || item.ward?.name || wardNameFromWard || "",
        charges: {
          bedCharge: mapApiChargeToUi(item.chargeDetails?.bedCharge),
          nursingCare: mapApiChargeToUi(item.chargeDetails?.nursingCare),
          professionalCharges: mapApiChargeToUi(item.chargeDetails?.professionalCharges),
          admissionFees: mapApiChargeToUi(item.chargeDetails?.admissionFees),
        },
        isActive:
          typeof item.isBlocked === "number"
            ? item.isBlocked === 1
              ? 0
              : 1
            : typeof item.isActive === "number"
              ? item.isActive
              : 1,
      };
    });

    setRoomsBeds(mappedRoomBeds);
  };

  useEffect(() => {
    const loadPageData = async () => {
      try {
        setIsLoading(true);
        const wardsData = await fetchWards();
        await fetchRoomBeds(wardsData);
      } catch (error) {
        handleError(dispatch, error);
        showErrorToast("Failed to load room/bed data");
      } finally {
        setIsLoading(false);
      }
    };

    loadPageData();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleChargeChange = (
    chargeType: string,
    chargeCategory: string,
    value: number
  ) => {
    setForm({
      ...form,
      charges: {
        ...form.charges,
        [chargeType]: {
          ...form.charges[chargeType as keyof typeof form.charges],
          [chargeCategory]: value,
        },
      },
    });
  };

  const handleSubmit = async () => {
    if (!form.identification || !form.specification) {
      showValidationError("Please fill in all required fields");
      return;
    }
    if (!form.wardId) {
      showValidationError("Please select a ward");
      return;
    }

    const payload = {
      wardId: form.wardId,
      name: form.identification,
      type: form.type === "room" ? "R" : "B",
      roomCategoryId: mapRoomCategoryLabelToId(form.category),
      chargeDetails: {
        bedCharge: mapUiChargeToApi(form.charges.bedCharge, 2),
        nursingCare: mapUiChargeToApi(form.charges.nursingCare, 3),
        professionalCharges: mapUiChargeToApi(form.charges.professionalCharges, 4),
        admissionFees: mapUiChargeToApi(form.charges.admissionFees, 1),
      },
    };

    try {
      setIsSubmitting(true);

      if (editingId) {
        await apiService.updateRoomBed(editingId, payload);
        showSuccessToast(`${form.type === "room" ? "Room" : "Bed"} updated successfully`);
      } else {
        await apiService.saveRoomBed(payload);
        showSuccessToast(`${form.type === "room" ? "Room" : "Bed"} added successfully`);
      }

      resetForm();
      await fetchRoomBeds();
    } catch (error) {
      handleError(dispatch, error);
      showErrorToast(`Failed to ${editingId ? "update" : "save"} room/bed`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({
      type: "room",
      identification: "",
      specification: "",
      category: "CATEGORY A",
      wardId: null,
      charges: emptyCharges,
    });
    setEditingId(null);
  };

  const handleEdit = (item: RoomBed) => {
    setForm({
      type: item.type,
      identification: item.identification,
      specification: item.specification,
      category: item.category,
      wardId: item.wardId,
      charges: item.charges || emptyCharges,
    });
    setEditingId(item.id);
  };

  const handleBlock = async (id: number) => {
    const result = await showConfirmDialog(
      "Block this room/bed?",
      "Confirm",
      "Block",
      "Cancel"
    );
    if (!result.isConfirmed) return;

    try {
      await apiService.blockRoomBed(id);
      showSuccessToast("Item blocked successfully");
      await fetchRoomBeds();
    } catch (error) {
      handleError(dispatch, error);
      showErrorToast("Failed to block item");
    }
  };

  const handleUnblock = async (id: number) => {
    const result = await showConfirmDialog(
      "Unblock this room/bed?",
      "Confirm",
      "Unblock",
      "Cancel"
    );
    if (!result.isConfirmed) return;

    try {
      await apiService.unblockRoomBed(id);
      showSuccessToast("Item unblocked successfully");
      await fetchRoomBeds();
    } catch (error) {
      handleError(dispatch, error);
      showErrorToast("Failed to unblock item");
    }
  };

  // Filter by active/blocked status
  const statusFilteredData = roomsBeds.filter((item) => {
    const isActiveValue = Number(item.isActive);
    return showBlocked ? isActiveValue === 0 : isActiveValue === 1;
  });

  // Apply search filter
  const {
    filteredData,
    searchTerm,
    setSearchTerm,
    resultCount,
    totalCount,
  } = useTableSearch({
    data: statusFilteredData,
    searchFields: ['identification', 'specification', 'category', 'type', 'wardName'],
  });

  return (
    <div>
      <div className="content-header">
        <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>
          {editingId ? "Edit Room / Bed" : "Add Room / Bed"}
        </h3>
      </div>
      <div className="content-body">
        <Container fluid style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <Row>
            {/* Left Side - Form */}
            <Col md={7}>
              <div
                className="card shadow-sm"
                style={{
                  padding: "2rem",
                  background: "white",
                  borderRadius: "10px",
                  maxHeight: "80vh",
                  overflowY: "auto",
                }}
              >
                <h3 style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                  {editingId ? "Edit Room / Bed" : "Add New Room / Bed"}
                </h3>
                
                <Form>
                  {/* Choose a Ward */}
                  <Form.Group className="mb-4">
                    <Form.Label style={{ fontWeight: "var(--font-weight-semibold)", fontSize: "1.05rem" }}>
                      Choose a Ward to Add Room/Bed <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      as="select"
                      name="wardId"
                      value={form.wardId || ""}
                      onChange={(e) => setForm({ ...form, wardId: e.target.value ? Number(e.target.value) : null })}
                      style={{ 
                        padding: "0.6rem",
                        fontSize: "1rem",
                        borderColor: "#ced4da"
                      }}
                    >
                      <option value="">-- Select Ward --</option>
                      {wards.map((ward) => (
                        <option key={ward.id} value={ward.id}>
                          {ward.wardName} ({ward.code})
                        </option>
                      ))}
                    </Form.Control>
                    {wards.length === 0 && (
                      <Form.Text className="text-muted">
                        No active wards available. Please create a ward first in Ward Master.
                      </Form.Text>
                    )}
                  </Form.Group>

                  <hr style={{ margin: "1.5rem 0", borderTop: "2px solid #e0e0e0" }} />

                  {/* Choose Type */}
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: "var(--font-weight-medium)" }}>
                      Choose Type <span className="text-danger">*</span>
                    </Form.Label>
                    <div className="d-flex gap-4">
                      <Form.Check
                        type="radio"
                        label="Room"
                        name="type"
                        value="room"
                        checked={form.type === "room"}
                        onChange={handleInputChange}
                      />
                      <Form.Check
                        type="radio"
                        label="Bed"
                        name="type"
                        value="bed"
                        checked={form.type === "bed"}
                        onChange={handleInputChange}
                      />
                    </div>
                  </Form.Group>

                  {/* Room / Bed Identification */}
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: "var(--font-weight-medium)" }}>
                      Room / Bed Identification <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="identification"
                      value={form.identification}
                      onChange={handleInputChange}
                      placeholder={`Enter ${form.type} identification`}
                    />
                  </Form.Group>

                  {/* Room / Bed Specification */}
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: "var(--font-weight-medium)" }}>
                      Room / Bed Specification <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="specification"
                      value={form.specification}
                      onChange={handleInputChange}
                      placeholder="Enter specification details"
                    />
                  </Form.Group>

                  {/* Select Category */}
                  <Form.Group className="mb-3" hidden>
                    <Form.Label style={{ fontWeight: "var(--font-weight-medium)" }}>Select Category</Form.Label>
                    <Form.Control
                      as="select"
                      name="category"
                      value={form.category}
                      onChange={handleInputChange}
                    >
                      <option value="CATEGORY A">CATEGORY A</option>
                      <option value="CATEGORY B">CATEGORY B</option>
                      <option value="CATEGORY C">CATEGORY C</option>
                      <option value="CATEGORY D">CATEGORY D</option>
                    </Form.Control>
                  </Form.Group>

                  <hr style={{ margin: "1.5rem 0", borderTop: "2px solid #e0e0e0" }} />

                  {/* Charges Section */}
                  <h5 className="mb-3" style={{ fontWeight: "var(--font-weight-semibold)", color: "#333" }}>
                    Charges
                  </h5>

                  <div style={{ overflowX: "auto" }}>
                    <Table bordered size="sm" style={{ fontSize: "0.9rem" }}>
                      <thead style={{ background: "#f8f9fa" }}>
                        <tr>
                          <th style={{ minWidth: "130px" }}>Charge Type</th>
                          <th style={{ minWidth: "100px" }}>General Charge</th>
                          <th style={{ minWidth: "100px" }}>General Charity</th>
                          <th style={{ minWidth: "100px" }}>Private Rate</th>
                          <th style={{ minWidth: "100px" }}>Private Charity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Bed Charge */}
                        <tr>
                          <td style={{ fontWeight: "var(--font-weight-medium)" }}>Bed Charge (Rs.)</td>
                          <td>
                            <Form.Control
                              type="number"
                              size="sm"
                              value={form.charges.bedCharge.generalCharge}
                              onChange={(e) =>
                                handleChargeChange("bedCharge", "generalCharge", Number(e.target.value))
                              }
                              placeholder="0.00"
                              step="0.01"
                            />
                          </td>
                          <td>
                            <Form.Control
                              type="number"
                              size="sm"
                              value={form.charges.bedCharge.generalCharity}
                              onChange={(e) =>
                                handleChargeChange("bedCharge", "generalCharity", Number(e.target.value))
                              }
                              placeholder="0.00"
                              step="0.01"
                            />
                          </td>
                          <td>
                            <Form.Control
                              type="number"
                              size="sm"
                              value={form.charges.bedCharge.privateRate}
                              onChange={(e) =>
                                handleChargeChange("bedCharge", "privateRate", Number(e.target.value))
                              }
                              placeholder="0.00"
                              step="0.01"
                            />
                          </td>
                          <td>
                            <Form.Control
                              type="number"
                              size="sm"
                              value={form.charges.bedCharge.privateCharity}
                              onChange={(e) =>
                                handleChargeChange("bedCharge", "privateCharity", Number(e.target.value))
                              }
                              placeholder="0.00"
                              step="0.01"
                            />
                          </td>
                        </tr>

                        {/* Nursing care */}
                        <tr>
                          <td style={{ fontWeight: "var(--font-weight-medium)" }}>Nursing care (Rs.)</td>
                          <td>
                            <Form.Control
                              type="number"
                              size="sm"
                              value={form.charges.nursingCare.generalCharge}
                              onChange={(e) =>
                                handleChargeChange("nursingCare", "generalCharge", Number(e.target.value))
                              }
                              placeholder="0.00"
                              step="0.01"
                            />
                          </td>
                          <td>
                            <Form.Control
                              type="number"
                              size="sm"
                              value={form.charges.nursingCare.generalCharity}
                              onChange={(e) =>
                                handleChargeChange("nursingCare", "generalCharity", Number(e.target.value))
                              }
                              placeholder="0.00"
                              step="0.01"
                            />
                          </td>
                          <td>
                            <Form.Control
                              type="number"
                              size="sm"
                              value={form.charges.nursingCare.privateRate}
                              onChange={(e) =>
                                handleChargeChange("nursingCare", "privateRate", Number(e.target.value))
                              }
                              placeholder="0.00"
                              step="0.01"
                            />
                          </td>
                          <td>
                            <Form.Control
                              type="number"
                              size="sm"
                              value={form.charges.nursingCare.privateCharity}
                              onChange={(e) =>
                                handleChargeChange("nursingCare", "privateCharity", Number(e.target.value))
                              }
                              placeholder="0.00"
                              step="0.01"
                            />
                          </td>
                        </tr>

                        {/* Professional Charges */}
                        <tr>
                          <td style={{ fontWeight: "var(--font-weight-medium)" }}>Professional Charges (Rs.)</td>
                          <td>
                            <Form.Control
                              type="number"
                              size="sm"
                              value={form.charges.professionalCharges.generalCharge}
                              onChange={(e) =>
                                handleChargeChange("professionalCharges", "generalCharge", Number(e.target.value))
                              }
                              placeholder="0.00"
                              step="0.01"
                            />
                          </td>
                          <td>
                            <Form.Control
                              type="number"
                              size="sm"
                              value={form.charges.professionalCharges.generalCharity}
                              onChange={(e) =>
                                handleChargeChange("professionalCharges", "generalCharity", Number(e.target.value))
                              }
                              placeholder="0.00"
                              step="0.01"
                            />
                          </td>
                          <td>
                            <Form.Control
                              type="number"
                              size="sm"
                              value={form.charges.professionalCharges.privateRate}
                              onChange={(e) =>
                                handleChargeChange("professionalCharges", "privateRate", Number(e.target.value))
                              }
                              placeholder="0.00"
                              step="0.01"
                            />
                          </td>
                          <td>
                            <Form.Control
                              type="number"
                              size="sm"
                              value={form.charges.professionalCharges.privateCharity}
                              onChange={(e) =>
                                handleChargeChange("professionalCharges", "privateCharity", Number(e.target.value))
                              }
                              placeholder="0.00"
                              step="0.01"
                            />
                          </td>
                        </tr>

                        {/* Admission Fees */}
                        <tr>
                          <td style={{ fontWeight: "var(--font-weight-medium)" }}>Admission Fees (Rs.)</td>
                          <td>
                            <Form.Control
                              type="number"
                              size="sm"
                              value={form.charges.admissionFees.generalCharge}
                              onChange={(e) =>
                                handleChargeChange("admissionFees", "generalCharge", Number(e.target.value))
                              }
                              placeholder="0.00"
                              step="0.01"
                            />
                          </td>
                          <td>
                            <Form.Control
                              type="number"
                              size="sm"
                              value={form.charges.admissionFees.generalCharity}
                              onChange={(e) =>
                                handleChargeChange("admissionFees", "generalCharity", Number(e.target.value))
                              }
                              placeholder="0.00"
                              step="0.01"
                            />
                          </td>
                          <td>
                            <Form.Control
                              type="number"
                              size="sm"
                              value={form.charges.admissionFees.privateRate}
                              onChange={(e) =>
                                handleChargeChange("admissionFees", "privateRate", Number(e.target.value))
                              }
                              placeholder="0.00"
                              step="0.01"
                            />
                          </td>
                          <td>
                            <Form.Control
                              type="number"
                              size="sm"
                              value={form.charges.admissionFees.privateCharity}
                              onChange={(e) =>
                                handleChargeChange("admissionFees", "privateCharity", Number(e.target.value))
                              }
                              placeholder="0.00"
                              step="0.01"
                            />
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>

                  {/* Action Buttons */}
                  <div className="d-flex justify-content-between mt-4">
                    <Button
                      variant="primary"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      style={{ minWidth: "140px" }}
                    >
                      {isSubmitting ? "Saving..." : editingId ? "Update" : `Add ${form.type === "room" ? "Room" : "Bed"}`}
                    </Button>
                    {editingId && (
                      <Button variant="secondary" onClick={resetForm}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </Form>
              </div>
            </Col>

            {/* Right Side - List */}
            <Col md={5}>
              <div
                className="card shadow-sm"
                style={{
                  padding: "2rem",
                  background: "white",
                  borderRadius: "10px",
                  maxHeight: "80vh",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center gap-2">
                    {showBlocked ? (
                      <ShieldX size={22} color="#dc3545" />
                    ) : (
                      <ListCheck size={22} color="#28a745" />
                    )}
                    <h5 style={{ textAlign: "center", margin: 0 }}>
                      {showBlocked ? "Blocked List" : "Active Rooms & Beds"}
                    </h5>
                    <span
                      className="badge"
                      style={{
                        background: showBlocked ? "#dc3545" : "#28a745",
                        fontSize: "var(--font-size-xs)",
                        padding: "4px 8px",
                      }}
                    >
                      {statusFilteredData.length}
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

                {/* Search */}
                <SearchInput
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  placeholder="Search rooms/beds..."
                  resultCount={resultCount}
                  totalCount={totalCount}
                  showResultCount={true}
                />

                {/* Table */}
                <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
                  <Table striped bordered hover size="sm">
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
                        <th>Ward</th>
                        <th>Type</th>
                        <th>ID</th>
                        <th>Category</th>
                        <th>Specification</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((item, index) => (
                        <tr key={item.id}>
                          <td>{index + 1}</td>
                          <td>
                            <span className="badge bg-success" style={{ fontSize: "0.75rem" }}>
                              {item.wardName || "N/A"}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                item.type === "room" ? "bg-primary" : "bg-info"
                              }`}
                            >
                              {item.type.toUpperCase()}
                            </span>
                          </td>
                          <td>{item.identification}</td>
                          <td>
                            <span className="badge bg-secondary">
                              {item.category}
                            </span>
                          </td>
                          <td style={{ fontSize: "0.85rem" }}>
                            {item.specification}
                          </td>
                          <td>
                            {!showBlocked ? (
                              <>
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  className="me-1"
                                  onClick={() => handleEdit(item)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleBlock(item.id)}
                                >
                                  Block
                                </Button>
                              </>
                            ) : (
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => handleUnblock(item.id)}
                              >
                                Unblock
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {filteredData.length === 0 && (
                        <tr>
                          <td
                            colSpan={7}
                            className="text-center py-4 text-muted"
                          >
                            {isLoading
                              ? "Loading room/bed records..."
                              : `No ${showBlocked ? "blocked" : "active"} rooms/beds found`}
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

export default AddRoomsBeds;