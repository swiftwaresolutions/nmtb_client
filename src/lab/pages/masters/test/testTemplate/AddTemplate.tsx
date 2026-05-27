import React, { useState, useEffect } from "react";
import {
  Form,
  Button,
  Table,
  Card,
} from "react-bootstrap";
import { ListCheck, ShieldX, ArrowRepeat, ChevronLeft, ChevronRight, CheckCircle, PencilSquare, XCircle } from "react-bootstrap-icons";
import { useSelector } from "react-redux";
import LaboratoryApiService from "../../../../../api/laboratory/laboratory-api-service";
import { RootState } from "../../../../../state/store";
import SearchInput from "../../../../../components/SearchInput";
import { useTableSearch } from "../../../../../hooks/useTableSearch";
import {
  showSuccessToast,
  showErrorToast,
  showValidationError,
  showConfirmDialog,
} from "../../../../../utils/alertUtil";

interface TestTemplate {
  id: number;
  name: string;
  testIds: number[]; // store ids returned from API
  isActive?: number; // 1 = active, 0 = blocked
}

interface LabTestOption {
  id: number;
  name: string;
  deptId: number;
  rate: number;
  blocked?: number | boolean;
}

const AddTemplate = () => {
  const laboratoryApi = new LaboratoryApiService();
  const loginData = useSelector((state: RootState) => state.loginData);

  const [step, setStep] = useState(0);
  const [templates, setTemplates] = useState<TestTemplate[]>([]);
  const [form, setForm] = useState({ name: "" });
  const [availableTests, setAvailableTests] = useState<LabTestOption[]>([]);
  const [selectedTests, setSelectedTests] = useState<number[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showBlocked, setShowBlocked] = useState(false);
  const [testSearch, setTestSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // load available tests and existing templates with mounted guard
    let mounted = true;
    const load = async () => {
      try {
        if (mounted) setLoading(true);
        const tests: any = await laboratoryApi.fetchAllLabTestAdd();
        // map to simple options and filter where blocked = 0
        if (mounted)
          setAvailableTests(
            Array.isArray(tests)
              ? tests.map((t: any) => ({ id: t.id, name: t.name, deptId: t.deptId, rate: t.rate, blocked: t.blocked }))
              : []
          );

        const temps: any = await laboratoryApi.fetchAllLabTestTemp();
        const mapped = Array.isArray(temps)
          ? temps.map((p: any) => {
              const testIds: number[] = Array.isArray(p.testIds)
                ? p.testIds
                : Array.isArray(p.tests)
                ? p.tests.map((x: any) =>
                    x.testId !== undefined ? x.testId : x.id
                  )
                : [];
              return {
                id: p.id,
                name: p.name,
                testIds,
                isActive: typeof p.isActive !== "undefined" ? p.isActive : 1,
              };
            })
          : [];
        if (mounted) setTemplates(mapped);
      } catch (err) {
        if (!mounted) return;
        console.error(err);
        showErrorToast("Failed to load tests or templates");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const normalizeTemplates = (temps: any[]) => {
    if (!Array.isArray(temps)) return [];
    return temps.map((p: any) => {
      const testIds: number[] = Array.isArray(p.testIds)
        ? p.testIds
        : Array.isArray(p.tests)
        ? p.tests.map((x: any) => (x.testId !== undefined ? x.testId : x.id))
        : [];
      return {
        id: p.id,
        name: p.name,
        testIds,
        isActive: typeof p.isActive !== "undefined" ? p.isActive : 1,
      };
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleTestChange = (testId: number) => {
    setSelectedTests((selected) =>
      selected.includes(testId)
        ? selected.filter((t) => t !== testId)
        : [...selected, testId]
    );
  };

  const handleNext = () => {
    if (step === 0) {
      if (!form.name.trim()) {
        setError("Please enter template name");
        return;
      }
      setError("");
      setStep(1);
    }
  };
  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };
  const hasBlockedTestSelected = () => {
    return selectedTests.some((testId) => {
      const test = availableTests.find((t) => t.id === testId);
      return test?.blocked === 1;
    });
  };
  const handleSubmit = async () => {
    if (selectedTests.length === 0) {
      showValidationError("Please select at least one test");
      return;
    }
    setError("");
    try {
      setLoading(true);
      
      // Transform selectedTests (IDs) to testDetails (full objects)
      const testDetails = selectedTests.map((testId) => {
        const test = availableTests.find((t) => t.id === testId);
        return {
          deptId: test?.deptId || 0,
          testId: test?.id || 0,
          testName: test?.name || "",
          cost: test?.rate || 0,
        };
      });

      const payload = {
        templateName: form.name.trim(),
        uid: loginData.id || 0,
        testDetails,
      };
      if (editingId) {
        await laboratoryApi.updateLabTestTemp(editingId, payload);
        showSuccessToast("Template updated successfully");
      } else {
        await laboratoryApi.saveLabTestTemp(payload);
        showSuccessToast("Template saved successfully");
      }

      // refresh templates
      const temps: any = await laboratoryApi.fetchAllLabTestTemp();
      setTemplates(normalizeTemplates(temps));

      setForm({ name: "" });
      setSelectedTests([]);
      setEditingId(null);
      setStep(0);
      setTestSearch("");
    } catch (err: any) {
      console.error(err);
      showErrorToast(err?.response?.data?.error || "Failed to save template");
    } finally {
      setLoading(false);
    }
  };
  const handleEdit = (template: TestTemplate) => {
    setForm({ name: template.name });
    setSelectedTests(template.testIds || []);
    setEditingId(template.id);
    setStep(0);
    setError("");
    setSuccess("");
    setTestSearch("");
  };
  const handleCancel = () => {
    setForm({ name: "" });
    setSelectedTests([]);
    setEditingId(null);
    setStep(0);
    setError("");
    setSuccess("");
    setTestSearch("");
  };
  const handleBlock = async (id: number) => {
    const result = await showConfirmDialog(
      "Block this template?",
      "Confirm",
      "Block",
      "Cancel"
    );
    if (!result.isConfirmed) return;
    try {
      setLoading(true);
      await laboratoryApi.blockLabTestTemp(id);
      showSuccessToast("Template blocked");
      const temps: any = await laboratoryApi.fetchAllLabTestTemp();
      setTemplates(normalizeTemplates(temps));
    } catch (err) {
      console.error(err);
      showErrorToast("Failed to block template");
    } finally {
      setLoading(false);
    }
  };
  const handleUnblock = async (id: number) => {
    try {
      setLoading(true);
      await laboratoryApi.unBlockLabTestTemp(id);
      showSuccessToast("Template unblocked");
      const temps: any = await laboratoryApi.fetchAllLabTestTemp();
      setTemplates(normalizeTemplates(temps));
    } catch (err) {
      console.error(err);
      showErrorToast("Failed to unblock template");
    } finally {
      setLoading(false);
    }
  };
  const filteredTests = availableTests.filter((t) =>
    t.name.toLowerCase().includes(testSearch.toLowerCase())
  );

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
    searchFields: ["name"],
  });

  const {
    filteredData: filteredBlockedTemplates,
    searchTerm: blockedSearchTerm,
    setSearchTerm: setBlockedSearchTerm,
    resultCount: blockedResultCount,
    totalCount: blockedTotalCount,
  } = useTableSearch({
    data: blockedTemplates,
    searchFields: ["name"],
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", minHeight: 0, overflow: "hidden" }}>
      <div className="content-header" style={{ flexShrink: 0 }}>
        <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>
          {editingId ? "Edit Test Template" : "Add Test Template"}
        </h3>
      </div>
      <div className="content-body" style={{ display: "flex", flex: 1, minHeight: 0, gap: "1rem", padding: "1rem", overflowX: "hidden", overflowY: "auto" }}>
        {/* Left: Stepper Form (58%) */}
        <div style={{ flex: "0 0 58%", minWidth: 0, display: "flex", flexDirection: "column" }}>
          <Card
            className="shadow-sm"
            style={{
              padding: "2rem",
              background: "white",
              borderRadius: "10px",
              display: "flex",
              flexDirection: "column",
              height: "100%",
              minHeight: 0,
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
              {["Template Name", "Select Tests"].map((s, idx) => (
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
                      fontSize: "12px",
                      fontWeight: step === idx ? "bold" : "normal",
                      color: step === idx ? "#0d6efd" : "#666",
                    }}
                  >
                    {s}
                  </div>
                </div>
              ))}
            </div>

            {/* Scrollable: Step Content */}
            <div style={{ flex: 1, minHeight: 0, overflowY: "auto", paddingRight: "8px" }}>
              <Form>
                {/* Step 0: Template Name */}
                {step === 0 && (
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
                )}

                {/* Step 1: Select Tests */}
                {step === 1 && (
                  <>
                    <div className="mb-3">
                      <Form.Control
                        type="text"
                        placeholder="Search tests..."
                        value={testSearch}
                        onChange={(e) => setTestSearch(e.target.value)}
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
                      {filteredTests.length === 0 ? (
                        <div className="text-center text-muted py-3">
                          {testSearch
                            ? "No tests match your search"
                            : "No tests available"}
                        </div>
                      ) : (
                        filteredTests.map((test) => {
                          const isBlocked = test.blocked === 1;
                          return (
                            <Form.Check
                              key={test.id}
                              type="checkbox"
                              id={`test-${test.id}`}
                              label={
                                <span
                                  style={{
                                    color: isBlocked ? "#dc3545" : "inherit",
                                  }}
                                >
                                  {test.name}
                                  {isBlocked && " (Blocked)"}
                                </span>
                              }
                              checked={selectedTests.includes(test.id)}
                              onChange={() => handleTestChange(test.id)}
                              className="mb-2"
                            />
                          );
                        })
                      )}
                    </div>
                    <div className="mt-2 text-muted small">
                      Selected: {selectedTests.length} test
                      {selectedTests.length !== 1 ? "s" : ""}
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
                    disabled={loading || hasBlockedTestSelected()}
                    style={{
                      marginRight: "10px",
                      minWidth: "150px",
                      fontWeight: "600",
                      fontSize: "16px",
                    }}
                  >
                    {loading ? (
                      <>Saving...</>
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
                      disabled={loading}
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

              {/* Search Input */}
              <SearchInput
                searchTerm={showBlocked ? blockedSearchTerm : activeSearchTerm}
                onSearchChange={
                  showBlocked ? setBlockedSearchTerm : setActiveSearchTerm
                }
                placeholder={`Search templates by name...`}
                resultCount={
                  showBlocked ? blockedResultCount : activeResultCount
                }
                totalCount={showBlocked ? blockedTotalCount : activeTotalCount}
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
                    <th>Tests</th>
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
                          {template.name}
                          {editingId === template.id && (
                            <span className="ms-2 badge bg-warning text-dark">
                              <i className="fas fa-edit me-1"></i>
                              Editing
                            </span>
                          )}
                        </td>
                        <td>{template.testIds?.length || 0}</td>
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

export default AddTemplate;
