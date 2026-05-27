import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Form,
  Row,
  Col,
  Spinner,
  Accordion,
  Badge,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faSave,
  faXRay,
  faCheck,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import {
  showSuccessToast,
  showErrorToast,
  showValidationError,
} from "../../../../../utils/alertUtil";
import {
  RadiologyApiService,
  ImpressionEntryRow,
  ImpressionsByIdResponse,
} from "../../../../../api/radiology/radiology-api-service";

type ApprovalStatus = "pending" | "approved" | "rejected";

interface EntryFormValues {
  study: string;
  impression: string;
}

interface EnterImpressionProps {
  patient: ImpressionEntryRow;
  onBack: () => void;
  onSaved: (billParticularIds: number[]) => void;
}

const EnterImpression: React.FC<EnterImpressionProps> = ({
  patient,
  onBack,
  onSaved,
}) => {
  const radiologyApiService = new RadiologyApiService();

  // keyed by billParticularId; undefined = not yet loaded, null = no impression, object = has impression
  const [impressionData, setImpressionData] = useState<
    Record<number, ImpressionsByIdResponse | null | undefined>
  >({});
  const [initialLoading, setInitialLoading] = useState(true);

  const [formValues, setFormValues] = useState<Record<number, EntryFormValues>>(
    () => {
      const init: Record<number, EntryFormValues> = {};
      patient.particulars.forEach((p) => {
        init[p.particularId] = { study: "", impression: "" };
      });
      return init;
    }
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedParticulars, setSelectedParticulars] = useState<Set<number>>(new Set());
  const [expandedParticulars, setExpandedParticulars] = useState<Set<number>>(new Set());

  // approval state keyed by impression id
  const [approvalStatuses, setApprovalStatuses] = useState<Record<number, ApprovalStatus>>({});
  const [approvalLoadingId, setApprovalLoadingId] = useState<number | null>(null);

  useEffect(() => {
    const loadAll = async () => {
      setInitialLoading(true);
      const updates: Record<number, ImpressionsByIdResponse | null> = {};
      const statuses: Record<number, ApprovalStatus> = {};
      await Promise.all(
        patient.particulars.map(async (p) => {
          try {
            const res = await radiologyApiService.fetchImpressionsById(p.billParticularId);
            const result = Array.isArray(res) && res.length > 0 ? res[0] : null;
            if (result?.id) {
              updates[p.billParticularId] = result;
              if (result.isApproved === 1) statuses[result.id] = "approved";
              else if (result.isCancel === 1) statuses[result.id] = "rejected";
              else statuses[result.id] = "pending";
            } else {
              updates[p.billParticularId] = null;
            }
          } catch {
            updates[p.billParticularId] = null;
          }
        })
      );
      setImpressionData(updates);
      setApprovalStatuses(statuses);
      setInitialLoading(false);
    };
    loadAll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pendingEntryCount = patient.particulars.filter(
    (p) => impressionData[p.billParticularId] === null
  ).length;

  const handleChange = (
    particularId: number,
    field: "study" | "impression",
    value: string
  ) => {
    setFormValues((prev) => ({
      ...prev,
      [particularId]: { ...prev[particularId], [field]: value },
    }));
  };

  const handleSaveAll = async () => {
    if (selectedParticulars.size === 0) {
      showValidationError("Please select at least one investigation to save.");
      return;
    }

    const selectedItems = patient.particulars.filter(
      (p) =>
        selectedParticulars.has(p.particularId) &&
        impressionData[p.billParticularId] === null
    );

    if (selectedItems.length === 0) {
      showValidationError("Selected particulars are already entered.");
      return;
    }

    for (const p of selectedItems) {
      const vals = formValues[p.particularId];
      if (!vals?.study.trim() || !vals?.impression.trim()) {
        showValidationError(
          `Please fill Study and Impression for "${p.particularName}"`
        );
        return;
      }
    }

    setIsSubmitting(true);
    const savedIds: number[] = [];
    try {
      for (const p of selectedItems) {
        const vals = formValues[p.particularId];
        await radiologyApiService.saveImpressionEntry({
          patId: patient.patId,
          visitId: patient.visitId,
          ipId: patient.ipId,
          billId: patient.billId,
          billParticularId: p.billParticularId,
          particularId: p.particularId,
          study: vals.study.trim(),
          impression: vals.impression.trim(),
        });
        savedIds.push(p.billParticularId);
      }
      showSuccessToast("Selected impressions saved successfully");

      // Re-fetch saved particulars to show approve/reject inline
      const updates: Record<number, ImpressionsByIdResponse | null> = {};
      const newStatuses: Record<number, ApprovalStatus> = {};
      await Promise.all(
        savedIds.map(async (id) => {
          try {
            const res = await radiologyApiService.fetchImpressionsById(id);
            const result = Array.isArray(res) && res.length > 0 ? res[0] : null;
            if (result?.id) {
              updates[id] = result;
              newStatuses[result.id] = "pending";
            } else {
              updates[id] = null;
            }
          } catch {
            updates[id] = null;
          }
        })
      );
      setImpressionData((prev) => ({ ...prev, ...updates }));
      setApprovalStatuses((prev) => ({ ...prev, ...newStatuses }));
      setSelectedParticulars(new Set());
      setExpandedParticulars(new Set());
      onSaved(savedIds);
    } catch {
      showErrorToast("Failed to save impressions");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (impressionId: number) => {
    setApprovalLoadingId(impressionId);
    try {
      await radiologyApiService.approveImpressionEntry(impressionId);
      setApprovalStatuses((prev) => ({ ...prev, [impressionId]: "approved" }));
      showSuccessToast("Impression approved");
    } catch {
      showErrorToast("Failed to approve impression");
    } finally {
      setApprovalLoadingId(null);
    }
  };

  const handleReject = async (impressionId: number) => {
    setApprovalLoadingId(impressionId);
    try {
      await radiologyApiService.rejectImpressionEntry(impressionId);
      setApprovalStatuses((prev) => ({ ...prev, [impressionId]: "rejected" }));
      showSuccessToast("Impression rejected");
    } catch {
      showErrorToast("Failed to reject impression");
    } finally {
      setApprovalLoadingId(null);
    }
  };

  const handleSelectParticular = (particularId: number, checked: boolean) => {
    setSelectedParticulars((prev) => {
      const next = new Set(prev);
      if (checked) next.add(particularId);
      else next.delete(particularId);
      return next;
    });
  };

  const handleExpandToggle = (particularId: number) => {
    const isExpanded = expandedParticulars.has(particularId);
    setExpandedParticulars((prev) => {
      const next = new Set(prev);
      if (isExpanded) next.delete(particularId);
      else next.add(particularId);
      return next;
    });
    setSelectedParticulars((prev) => {
      const next = new Set(prev);
      if (isExpanded) next.delete(particularId);
      else next.add(particularId);
      return next;
    });
  };

  const handleSelectAll = () => {
    const ids = patient.particulars
      .filter((p) => impressionData[p.billParticularId] === null)
      .map((p) => p.particularId);
    setSelectedParticulars(new Set(ids));
    setExpandedParticulars(new Set(ids));
  };

  const handleClearAll = () => {
    setSelectedParticulars(new Set());
    setExpandedParticulars(new Set());
  };

  const statusBadge = (status: ApprovalStatus) => {
    if (status === "approved") return <Badge bg="success">Approved</Badge>;
    if (status === "rejected") return <Badge bg="danger">Rejected</Badge>;
    return <Badge bg="warning" text="dark">Pending Approval</Badge>;
  };

  if (initialLoading) {
    return (
      <div className="pr-3 mb-3">
        <div
          style={{ background: "var(--page-header-bg)", position: "sticky", top: 0, zIndex: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
          className="shadow-sm mb-3"
        >
          <div className="py-3 px-3 d-flex align-items-center gap-2">
            <Button variant="outline-secondary" size="sm" onClick={onBack}>
              <FontAwesomeIcon icon={faArrowLeft} className="me-1" />
              Back
            </Button>
            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{ background: "var(--page-header-icon-bg)", color: "var(--page-header-icon-color)", width: "40px", height: "40px" }}
            >
              <FontAwesomeIcon icon={faXRay} />
            </div>
            <div>
              <h5 className="mb-0 fw-bold" style={{ color: "var(--page-header-text)" }}>
                Enter Impression
              </h5>
              <small style={{ color: "var(--page-header-subtitle)" }}>
                {patient.patientName} &mdash; {patient.opNumber} &mdash; {patient.billDisplay}
              </small>
            </div>
          </div>
        </div>
        <div className="text-center py-5">
          <Spinner animation="border" />
          <p className="mt-2" style={{ fontSize: "var(--font-size-sm)", color: "var(--text-muted)" }}>
            Loading impression data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pr-3 mb-3">
      {/* Header bar */}
      <div
        style={{ background: "var(--page-header-bg)", position: "sticky", top: 0, zIndex: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
        className="shadow-sm mb-3"
      >
        <div className="py-3 px-3 d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={onBack}
              disabled={isSubmitting}
            >
              <FontAwesomeIcon icon={faArrowLeft} className="me-1" />
              Back
            </Button>
            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{ background: "var(--page-header-icon-bg)", color: "var(--page-header-icon-color)", width: "40px", height: "40px" }}
            >
              <FontAwesomeIcon icon={faXRay} />
            </div>
            <div>
              <h5 className="mb-0 fw-bold" style={{ color: "var(--page-header-text)" }}>
                Enter Impression
              </h5>
              <small style={{ color: "var(--page-header-subtitle)" }}>
                {patient.patientName} &mdash; {patient.opNumber} &mdash; {patient.billDisplay}
              </small>
            </div>
          </div>

          {pendingEntryCount > 0 && (
            <Button
              variant="primary"
              onClick={handleSaveAll}
              disabled={isSubmitting || approvalLoadingId !== null}
            >
              {isSubmitting ? (
                <><Spinner animation="border" size="sm" className="me-2" />Saving...</>
              ) : (
                <><FontAwesomeIcon icon={faSave} className="me-2" />Save Selected ({selectedParticulars.size})</>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Select controls — only when there are unsubmitted entries */}
      {pendingEntryCount > 0 && (
        <div className="d-flex justify-content-end gap-2 mb-2">
          <Button variant="outline-primary" size="sm" onClick={handleSelectAll} disabled={isSubmitting}>
            Select All
          </Button>
          <Button variant="outline-secondary" size="sm" onClick={handleClearAll} disabled={isSubmitting}>
            Clear All
          </Button>
        </div>
      )}

      {/* Per-particular accordion */}
      <Card className="mb-3 shadow-sm">
        <Card.Body>
          <Accordion alwaysOpen activeKey={Array.from(expandedParticulars).map(String)}>
            {patient.particulars.map((p) => {
              const existing = impressionData[p.billParticularId];
              const isEntered = existing !== null && existing !== undefined;
              const impressionId = isEntered ? (existing as ImpressionsByIdResponse).id : null;
              const approvalStatus = impressionId !== null ? (approvalStatuses[impressionId] ?? "pending") : null;
              const isSelected = selectedParticulars.has(p.particularId);
              const isApprovingThis = approvalLoadingId === impressionId;

              return (
                <Accordion.Item
                  eventKey={String(p.particularId)}
                  key={p.particularId}
                  className="mb-2"
                >
                  <Accordion.Header onClick={() => handleExpandToggle(p.particularId)}>
                    <div className="d-flex align-items-center justify-content-between w-100 me-2">
                      <div className="d-flex align-items-center gap-2">
                        {!isEntered && (
                          <Form.Check
                            type="checkbox"
                            checked={isSelected}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) =>
                              handleSelectParticular(p.particularId, e.target.checked)
                            }
                            disabled={isSubmitting}
                          />
                        )}
                        <FontAwesomeIcon icon={faXRay} className="me-1" />
                        <span
                          style={{
                            fontWeight: "var(--font-weight-medium)",
                            fontSize: "var(--font-size-sm)",
                          }}
                        >
                          {p.particularName}
                        </span>
                      </div>
                      {isEntered && approvalStatus && (
                        <div onClick={(e) => e.stopPropagation()}>
                          {statusBadge(approvalStatus)}
                        </div>
                      )}
                    </div>
                  </Accordion.Header>
                  <Accordion.Body>
                    {isEntered ? (
                      // Existing impression — show read-only + approve/reject
                      <div>
                        <Row className="mb-3">
                          <Col md={6}>
                            <div
                              style={{
                                fontSize: "var(--font-size-sm)",
                                fontWeight: "var(--font-weight-medium)",
                                marginBottom: "4px",
                                color: "var(--text-muted)",
                              }}
                            >
                              Study
                            </div>
                            <div
                              style={{
                                fontSize: "var(--font-size-sm)",
                                background: "var(--bs-light)",
                                borderRadius: "4px",
                                padding: "10px 12px",
                                whiteSpace: "pre-wrap",
                                minHeight: "80px",
                              }}
                            >
                              {(existing as ImpressionsByIdResponse).study || (
                                <em style={{ color: "var(--text-muted)" }}>—</em>
                              )}
                            </div>
                          </Col>
                          <Col md={6}>
                            <div
                              style={{
                                fontSize: "var(--font-size-sm)",
                                fontWeight: "var(--font-weight-medium)",
                                marginBottom: "4px",
                                color: "var(--text-muted)",
                              }}
                            >
                              Impression
                            </div>
                            <div
                              style={{
                                fontSize: "var(--font-size-sm)",
                                background: "var(--bs-light)",
                                borderRadius: "4px",
                                padding: "10px 12px",
                                whiteSpace: "pre-wrap",
                                minHeight: "80px",
                              }}
                            >
                              {(existing as ImpressionsByIdResponse).impression || (
                                <em style={{ color: "var(--text-muted)" }}>—</em>
                              )}
                            </div>
                          </Col>
                        </Row>
                        {approvalStatus === "pending" && (
                          <div className="d-flex gap-2 justify-content-end">
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => handleApprove(impressionId!)}
                              disabled={isApprovingThis || isSubmitting}
                            >
                              {isApprovingThis ? (
                                <Spinner animation="border" size="sm" />
                              ) : (
                                <><FontAwesomeIcon icon={faCheck} className="me-1" />Approve</>
                              )}
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleReject(impressionId!)}
                              disabled={isApprovingThis || isSubmitting}
                            >
                              {isApprovingThis ? (
                                <Spinner animation="border" size="sm" />
                              ) : (
                                <><FontAwesomeIcon icon={faTimes} className="me-1" />Reject</>
                              )}
                            </Button>
                          </div>
                        )}
                        {approvalStatus !== "pending" && (
                          <div
                            className="text-end"
                            style={{ fontSize: "var(--font-size-xs)", color: "var(--text-muted)" }}
                          >
                            {approvalStatus === "approved"
                              ? `Approved by ${(existing as ImpressionsByIdResponse).approvedUser}`
                              : "Rejected"}
                          </div>
                        )}
                      </div>
                    ) : (
                      // No impression yet — show input form
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label
                              style={{
                                fontSize: "var(--font-size-sm)",
                                fontWeight: "var(--font-weight-medium)",
                              }}
                            >
                              Study
                            </Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={4}
                              placeholder="Enter study findings..."
                              value={formValues[p.particularId]?.study ?? ""}
                              onChange={(e) =>
                                handleChange(p.particularId, "study", e.target.value)
                              }
                              disabled={isSubmitting}
                              style={{ fontSize: "var(--font-size-sm)" }}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label
                              style={{
                                fontSize: "var(--font-size-sm)",
                                fontWeight: "var(--font-weight-medium)",
                              }}
                            >
                              Impression
                            </Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={4}
                              placeholder="Enter impression..."
                              value={formValues[p.particularId]?.impression ?? ""}
                              onChange={(e) =>
                                handleChange(p.particularId, "impression", e.target.value)
                              }
                              disabled={isSubmitting}
                              style={{ fontSize: "var(--font-size-sm)" }}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    )}
                  </Accordion.Body>
                </Accordion.Item>
              );
            })}
          </Accordion>
        </Card.Body>
      </Card>

      {/* Bottom Save button */}
      {pendingEntryCount > 0 && (
        <div className="d-flex justify-content-end mb-4">
          <Button
            variant="primary"
            onClick={handleSaveAll}
            disabled={isSubmitting || approvalLoadingId !== null}
          >
            {isSubmitting ? (
              <><Spinner animation="border" size="sm" className="me-2" />Saving...</>
            ) : (
              <><FontAwesomeIcon icon={faSave} className="me-2" />Save Selected ({selectedParticulars.size})</>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EnterImpression;
