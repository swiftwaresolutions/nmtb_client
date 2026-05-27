import React, { useState, useEffect } from "react";
import {
  Form,
  Button,
  Table,
  Card,
} from "react-bootstrap";
import { ListCheck, ShieldX, ArrowRepeat, ChevronLeft, ChevronRight, CheckCircle, PencilSquare, XCircle } from "react-bootstrap-icons";
import SearchInput from "../../../../../components/SearchInput";
import { useTableSearch } from "../../../../../hooks/useTableSearch";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../../../state/store";
import { LaboratoryApiService } from "../../../../../api/laboratory/laboratory-api-service";
import { handleError } from "../../../../../utils/errorUtil";
import {
  showSuccessToast,
  showErrorToast,
  showConfirmDialog,
  showValidationError,
} from "../../../../../utils/alertUtil";
import "../../../../../style/commonStyle.css";

interface Antibiotic {
  antCode: number;
  antName: string;
  isBlocked: number;
}

interface TemplateAntibiotic {
  antibioticId: number;
  antibioticName: string;
}

interface Templates {
  id: number;
  tempName: string;
  description: string;
  uid: number;
  entDateTime: string;
  isActive: number;
  antibiotics: TemplateAntibiotic[];
}

const CultureTemplate: React.FC = () => {
  const dispatch = useDispatch();
  const loginData = useSelector((state: RootState) => state.loginData);
  const laboratoryApiService = new LaboratoryApiService();

  const [step, setStep] = useState(0);
  const [templates, setTemplates] = useState<Templates[]>([]);
  const [form, setForm] = useState({ name: "", description: "" });
  const [selectedAntibiotics, setSelectedAntibiotics] = useState<number[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showBlocked, setShowBlocked] = useState(false);
  const [antibioticSearch, setAntibioticSearch] = useState("");
  const [antibiotics, setAntibiotics] = useState<Antibiotic[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        if (mounted) setLoading(true);
        const data = await laboratoryApiService.fetchAllLabAntibiotic();
        if (mounted) setAntibiotics(data);
      } catch (error) {
        if (!mounted) return;
        console.error("Error fetching antibiotics:", error);
        handleError(dispatch, error);
        showErrorToast("Failed to load antibiotics");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const loadTemplates = async () => {
      try {
        const data = await laboratoryApiService.fetchAllLabAntibioticTemplates();
        if (!mounted) return;
        const normalized = data.map((t: Templates) => ({
          ...t,
          antibiotics: t.antibiotics.map((a) => ({
            ...a,
            antibioticId: Number(a.antibioticId),
          })),
        }));
        if (mounted) setTemplates(normalized);
      } catch (error) {
        if (!mounted) return;
        console.error("Error fetching templates:", error);
        handleError(dispatch, error);
        showErrorToast("Failed to load templates");
      }
    };

    load();
    loadTemplates();
    return () => { mounted = false; };
  }, []);

  const fetchAntibiotics = async () => {
    try {
      setLoading(true);
      const data = await laboratoryApiService.fetchAllLabAntibiotic();
      setAntibiotics(data);
    } catch (error) {
      console.error("Error fetching antibiotics:", error);
      handleError(dispatch, error);
      showErrorToast("Failed to load antibiotics");
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const data = await laboratoryApiService.fetchAllLabAntibioticTemplates();
      const normalized = data.map((t: Templates) => ({
        ...t,
        antibiotics: t.antibiotics.map((a) => ({
          ...a,
          antibioticId: Number(a.antibioticId), // enforce number
        })),
      }));

      setTemplates(normalized);
    } catch (error) {
      console.error("Error fetching templates:", error);
      handleError(dispatch, error);
      showErrorToast("Failed to load templates");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleAntibioticChange = (antCode: number) => {
    setSelectedAntibiotics((selected) =>
      selected.includes(antCode)
        ? selected.filter((id) => id !== antCode)
        : [...selected, antCode]
    );
  };

  const handleNext = () => {
    if (step === 0) {
      if (!form.name.trim()) {
        showValidationError("Please enter template name");
        return;
      }
      setStep(1);
    }
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (selectedAntibiotics.length === 0) {
      showValidationError("Please select at least one antibiotic");
      return;
    }

    // Check for duplicate template name (excluding current template if editing)
    if (
      templates.some(
        (t) =>
          t.tempName.toLowerCase() === form.name.trim().toLowerCase() &&
          t.id !== editingId
      )
    ) {
      showValidationError("Template name already exists");
      return;
    }

    // Map selected antibiotic names to their IDs
    const antibioticIds = selectedAntibiotics;

    if (antibioticIds.length === 0) {
      showErrorToast("Failed to map antibiotics. Please try again.");
      return;
    }

    const payload = {
      templateName: form.name.trim(),
      description: form.description.trim(),
      uid: loginData.id || 0,
      antibioticIds: antibioticIds,
    };

    try {
      setSubmitting(true);

      if (editingId) {
        await laboratoryApiService.updateLabAntibioticTemplate(
          editingId,
          payload
        );
        showSuccessToast("Template updated successfully");
      } else {
        await laboratoryApiService.saveLabAntibioticTemplate(payload);
        showSuccessToast("Template added successfully");
      }

      // Refresh templates list
      await fetchTemplates();

      // Reset form
      setForm({ name: "", description: "" });
      setSelectedAntibiotics([]);
      setEditingId(null);
      setStep(0);
      setAntibioticSearch("");
    } catch (error) {
      console.error("Error saving template:", error);
      handleError(dispatch, error);
      showErrorToast(
        editingId ? "Failed to update template" : "Failed to save template"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (template: Templates) => {
    setForm({
      name: template.tempName,
      description: template.description,
    });
    // Extract antibiotic IDs
    const ids = template.antibiotics.map((a) => a.antibioticId);

    setSelectedAntibiotics(ids);
    setEditingId(template.id);
    setStep(1);
    setAntibioticSearch("");
  };

  const handleCancel = () => {
    setForm({ name: "", description: "" });
    setSelectedAntibiotics([]);
    setEditingId(null);
    setStep(0);
    setAntibioticSearch("");
  };

  const handleBlock = async (id: number) => {
    const result = await showConfirmDialog(
      "Do you want to block this template?",
      "Are you sure?",
      "Yes, block it!",
      "Cancel"
    );

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      await laboratoryApiService.blockLabAntibioticTemplate(id);

      showSuccessToast("Template has been blocked");

      // Refresh list from server
      await fetchTemplates();
    } catch (error) {
      console.error("Error blocking template:", error);
      handleError(dispatch, error);
      showErrorToast("Failed to block template");
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (id: number) => {
    try {
      setLoading(true);
      await laboratoryApiService.unBlockLabAntibioticTemplate(id);

      showSuccessToast("Template has been unblocked");

      // Refresh list from server
      await fetchTemplates();
    } catch (error) {
      console.error("Error unblocking template:", error);
      handleError(dispatch, error);
      showErrorToast("Failed to unblock template");
    } finally {
      setLoading(false);
    }
  };

  // Get active antibiotics list (blocked: 0)
  const activeAntibiotics = antibiotics.filter((a) => a.isBlocked === 0);

  // Filter antibiotics based on search term
  const filteredAntibiotics = activeAntibiotics.filter((a) =>
    a.antName.toLowerCase().includes(antibioticSearch.toLowerCase())
  );

  // Templates lists for right panel
  const activeTemplates = templates.filter((t) => t.isActive === 1);
  const blockedTemplates = templates.filter((t) => t.isActive === 0);

  const {
    filteredData: filteredActiveTemplates,
    searchTerm: activeSearchTerm,
    setSearchTerm: setActiveSearchTerm,
    resultCount: activeResultCount,
    totalCount: activeTotalCount,
  } = useTableSearch({
    data: activeTemplates,
    searchFields: ["tempName", "description"],
  });

  const {
    filteredData: filteredBlockedTemplates,
    searchTerm: blockedSearchTerm,
    setSearchTerm: setBlockedSearchTerm,
    resultCount: blockedResultCount,
    totalCount: blockedTotalCount,
  } = useTableSearch({
    data: blockedTemplates,
    searchFields: ["tempName", "description"],
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", minHeight: 0, overflow: "hidden" }}>
      <div className="content-header" style={{ flexShrink: 0 }}>
        <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>
          {editingId ? "Edit Antibiotic Template" : "Add Antibiotic Template"}
        </h3>
      </div>
      <div className="content-body" style={{ display: "flex", flex: 1, minHeight: 0, gap: "1rem", overflowX: "hidden", overflowY: "auto" }}>
        {/* Left: Stepper Form (58%) */}
        <div style={{ flex: "0 0 58%", minWidth: 0, display: "flex", flexDirection: "column" }}>
          <Card
            className="shadow-sm"
            style={{
              background: "white",
              borderRadius: "10px",
              display: "flex",
              flexDirection: "column",
              height: "100%",
              minHeight: 0,
              padding: "2rem",
            }}
          >
            {/* Fixed: Stepper Progress */}
            <div
              className="mb-4"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                position: "relative",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "20px",
                  left: "0",
                  right: "0",
                  height: "2px",
                  background: "#e0e0e0",
                  zIndex: 0,
                }}
              >
                <div
                  style={{
                    height: "100%",
                    background: "#0d6efd",
                    width: `${(step / 1) * 100}%`,
                    transition: "width 0.3s",
                  }}
                />
              </div>
              {["Template Details", "Select Antibiotics"].map(
                (s, idx) => (
                  <div
                    key={s}
                    style={{
                      flex: 1,
                      textAlign: "center",
                      cursor: "pointer",
                      zIndex: 1,
                    }}
                    onClick={() => setStep(idx)}
                  >
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        background: step === idx ? "#0d6efd" : "#e0e0e0",
                        color: step === idx ? "white" : "#666",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 8px",
                        fontWeight: "bold",
                        fontSize: "16px",
                      }}
                    >
                      {idx + 1}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: step === idx ? "#0d6efd" : "#666",
                      }}
                    >
                      {s}
                    </div>
                  </div>
                )
              )}
            </div>

            {/* Scrollable: Step Content */}
            <div style={{ flex: 1, minHeight: 0, overflowY: "auto", paddingRight: "8px" }}>
              <Form>
                {/* Step 0: Template Details */}
                {step === 0 && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Template Name <span style={{ color: "red" }}>*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleInputChange}
                        placeholder="Enter template name"
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="description"
                        value={form.description}
                        onChange={handleInputChange}
                        placeholder="Optional description"
                      />
                    </Form.Group>
                  </>
                )}

                {/* Step 1: Select Antibiotics */}
                {step === 1 && (
                  <>
                    <div className="mb-3">
                      <Form.Control
                        type="text"
                        placeholder="Search antibiotics..."
                        value={antibioticSearch}
                        onChange={(e) => setAntibioticSearch(e.target.value)}
                      />
                    </div>
                    <div
                      style={{
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        padding: "1rem",
                        maxHeight: "50vh",
                        overflowY: "auto",
                      }}
                    >
                      {filteredAntibiotics.length === 0 ? (
                        <div className="text-center text-muted py-3">
                          {antibioticSearch
                            ? "No antibiotics match your search"
                            : "No active antibiotics available"}
                        </div>
                      ) : (
                        filteredAntibiotics.map((antibiotic) => (
                          <Form.Check
                            key={antibiotic.antCode}
                            type="checkbox"
                            id={`antibiotic-${antibiotic.antCode}`}
                            label={antibiotic.antName}
                            checked={selectedAntibiotics.includes(
                              antibiotic.antCode
                            )}
                            onChange={() =>
                              handleAntibioticChange(antibiotic.antCode)
                            }
                            className="mb-2"
                          />
                        ))
                      )}
                    </div>
                    <div className="mt-2 text-muted small">
                      Selected: {selectedAntibiotics.length} antibiotic
                      {selectedAntibiotics.length !== 1 ? "s" : ""}
                    </div>
                  </>
                )}
              </Form>
            </div>

            {/* Fixed: Navigation Buttons */}
            <div
              className="d-flex justify-content-between mt-4"
              style={{
                paddingTop: "1.5rem",
                borderTop: "2px solid #e0e0e0",
                flexShrink: 0,
              }}
            >
              <Button
                variant="outline-secondary"
                onClick={handlePrev}
                disabled={step === 0}
                style={{ minWidth: "120px", fontWeight: "500" }}
              >
                <ChevronLeft /> Previous
              </Button>
              {step < 1 ? (
                <Button
                  variant="primary"
                  onClick={handleNext}
                  style={{ minWidth: "120px", fontWeight: "500" }}
                >
                  Next <ChevronRight />
                </Button>
              ) : (
                <>
                  <Button
                    variant="success"
                    onClick={handleSubmit}
                    disabled={submitting}
                    style={{
                      marginRight: "10px",
                      minWidth: "150px",
                      fontWeight: "600",
                      fontSize: "16px",
                    }}
                  >
                    {submitting ? (
                      <>Submitting...</>
                    ) : editingId ? (
                      <>
                        <PencilSquare /> Update Template
                      </>
                    ) : (
                      <>
                        <CheckCircle /> Add Template
                      </>
                    )}
                  </Button>
                  {editingId && (
                    <Button
                      variant="outline-secondary"
                      onClick={handleCancel}
                      disabled={submitting}
                      style={{ minWidth: "100px" }}
                    >
                      <XCircle /> Cancel
                    </Button>
                  )}
                </>
              )}
            </div>
          </Card>
        </div>

        {/* Right: Templates List (42%) */}
        <div style={{ flex: "0 0 42%", minWidth: 0, display: "flex", flexDirection: "column" }}>
          <Card
            className="shadow-sm"
            style={{
              background: "white",
              borderRadius: "12px",
              border: "1px solid #e0e0e0",
              display: "flex",
              flexDirection: "column",
              height: "100%",
              minHeight: 0,
            }}
          >
            {/* Fixed: Header */}
            <div
              style={{
                padding: "1.25rem 1.5rem",
                borderBottom: "2px solid #f0f0f0",
                background: "linear-gradient(to right, #f8f9fa, #ffffff)",
                borderTopLeftRadius: "12px",
                borderTopRightRadius: "12px",
                flexShrink: 0,
              }}
            >
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center gap-2">
                  {showBlocked ? (
                    <ShieldX size={22} color="#dc3545" />
                  ) : (
                    <ListCheck size={22} color="#28a745" />
                  )}
                  <h5 className="mb-0" style={{ fontWeight: "600" }}>
                    {showBlocked ? "Blocked Templates" : "Active Templates"}
                  </h5>
                  <span
                    className="badge"
                    style={{
                      background: showBlocked ? "#dc3545" : "#28a745",
                      fontSize: "11px",
                      padding: "4px 8px",
                    }}
                  >
                    {showBlocked
                      ? filteredBlockedTemplates.length
                      : filteredActiveTemplates.length}
                  </span>
                </div>
                <Button
                  variant={
                    showBlocked ? "outline-success" : "outline-danger"
                  }
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

              {/* Search Input */}
              <SearchInput
                searchTerm={
                  showBlocked ? blockedSearchTerm : activeSearchTerm
                }
                onSearchChange={
                  showBlocked ? setBlockedSearchTerm : setActiveSearchTerm
                }
                placeholder={`Search templates by name or description...`}
                resultCount={
                  showBlocked ? blockedResultCount : activeResultCount
                }
                totalCount={
                  showBlocked ? blockedTotalCount : activeTotalCount
                }
                showResultCount={true}
              />
            </div>

            {/* Scrollable: Table */}
            <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
              <Table striped bordered hover>
                <thead style={{ position: "sticky", top: 0, backgroundColor: "#f8f9fa", zIndex: 10 }}>
                  <tr>
                    <th>#</th>
                    <th>Template Name</th>
                    <th>Antibiotics</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(showBlocked
                    ? filteredBlockedTemplates
                    : filteredActiveTemplates
                  ).length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center" }}>
                        {showBlocked
                          ? blockedSearchTerm
                            ? "No blocked templates match your search."
                            : "No blocked templates."
                          : activeSearchTerm
                          ? "No active templates match your search."
                          : "No active templates."}
                      </td>
                    </tr>
                  ) : (
                    (showBlocked
                      ? filteredBlockedTemplates
                      : filteredActiveTemplates
                    ).map((template, idx) => (
                      <tr
                        key={template.id}
                        style={{
                          backgroundColor:
                            editingId === template.id
                              ? "#fff3cd"
                              : "transparent",
                          fontWeight:
                            editingId === template.id ? "600" : "normal",
                          borderLeft:
                            editingId === template.id
                              ? "4px solid #ffc107"
                              : "none",
                        }}
                      >
                        <td>{idx + 1}</td>
                        <td>
                          {template.tempName}
                          {editingId === template.id && (
                            <span className="ms-2 badge bg-warning text-dark">
                              <i className="fas fa-edit me-1"></i>
                              Editing
                            </span>
                          )}
                        </td>
                        <td>{template.antibiotics?.length || 0}</td>
                        <td>
                          {showBlocked ? (
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => handleUnblock(template.id)}
                            >
                              Unblock
                            </Button>
                          ) : (
                            <>
                              {editingId !== template.id ? (
                                <>
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    className="me-2"
                                    onClick={() => handleEdit(template)}
                                    disabled={loading}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => handleBlock(template.id)}
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
        </div>
      </div>
    </div>
  );
};

export default CultureTemplate;
