import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  Table,
  Button,
  Badge,
  Spinner,
  OverlayTrigger,
  Popover,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXRay,
  faKeyboard,
  faChevronDown,
  faChevronUp,
  faCheckCircle,
  faInfoCircle,
  faCircleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { useDispatch } from "react-redux";
import { handleError } from "../../../../utils/errorUtil";
import { showValidationError } from "../../../../utils/alertUtil";
import { useTableSearch } from "../../../../hooks/useTableSearch";
import SearchInput from "../../../../components/SearchInput";
import PageHeader from "../../../../components/PageHeader";
import {
  RadiologyApiService,
  ImpressionEntryRow,
  ImpressionsByIdResponse,
} from "../../../../api/radiology/radiology-api-service";
import EnterImpression from "./components/EnterImpression";

type ActiveView = "list" | "enterImpression";

interface DateGroup {
  date: string;
  patients: ImpressionEntryRow[];
}

const Entry: React.FC = () => {
  const dispatch = useDispatch();
  const radiologyApiService = new RadiologyApiService();

  const [patients, setPatients] = useState<ImpressionEntryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState<ActiveView>("list");
  const [selectedPatient, setSelectedPatient] = useState<ImpressionEntryRow | null>(null);
  const [collapsedDates, setCollapsedDates] = useState<Set<string>>(new Set());
  const [impressionCache, setImpressionCache] = useState<Record<number, ImpressionsByIdResponse | null>>({});
  const [statusLoadingKey, setStatusLoadingKey] = useState<string | null>(null);

  const { filteredData, searchTerm, setSearchTerm, resultCount, totalCount } =
    useTableSearch({
      data: patients,
      searchFields: ["patientName", "opNumber", "billDisplay", "userName"],
    });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const data = await radiologyApiService.fetchPatientsForImpressionEntry();
      setPatients(Array.isArray(data) ? data : []);
    } catch (error) {
      handleError(dispatch, error);
    } finally {
      setLoading(false);
    }
  };

  const dateGroups = useMemo((): DateGroup[] => {
    const groups: Record<string, ImpressionEntryRow[]> = {};
    filteredData.forEach((patient) => {
      const key = patient.billDate || "";
      if (!groups[key]) groups[key] = [];
      groups[key].push(patient);
    });
    return Object.entries(groups)
      .map(([date, pts]) => ({ date, patients: pts }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [filteredData]);

  const toggleDateCollapse = (date: string) => {
    setCollapsedDates((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  };

  const getPatientKey = (patient: ImpressionEntryRow) =>
    `${patient.visitId}-${patient.billId}`;

  const getPatientCounts = (patient: ImpressionEntryRow) => {
    let notFetched = 0, notEntered = 0, pendingApproval = 0, approved = 0, cancelled = 0;
    const total = patient.particulars.length;
    patient.particulars.forEach((p) => {
      if (!(p.billParticularId in impressionCache)) {
        notFetched++;
      } else {
        const cached = impressionCache[p.billParticularId];
        if (cached === null) notEntered++;
        else if (cached.isApproved === 1) approved++;
        else if (cached.isCancel === 1) cancelled++;
        else pendingApproval++;
      }
    });
    return { total, notFetched, notEntered, pendingApproval, approved, cancelled };
  };

  const loadPatientStatus = async (patient: ImpressionEntryRow) => {
    const key = getPatientKey(patient);
    const unloaded = patient.particulars.filter(
      (p) => !(p.billParticularId in impressionCache)
    );
    if (unloaded.length === 0) return;
    setStatusLoadingKey(key);
    const updates: Record<number, ImpressionsByIdResponse | null> = {};
    await Promise.all(
      unloaded.map(async (p) => {
        try {
          const res = await radiologyApiService.fetchImpressionsById(p.billParticularId);
          const result = Array.isArray(res) && res.length > 0 ? res[0] : null;
          updates[p.billParticularId] = result?.id ? result : null;
        } catch {
          updates[p.billParticularId] = null;
        }
      })
    );
    setImpressionCache((prev) => ({ ...prev, ...updates }));
    setStatusLoadingKey(null);
  };

  const navigateToEnterImpression = (patient: ImpressionEntryRow) => {
    if (!patient.particulars || patient.particulars.length === 0) {
      showValidationError("No particulars found for this patient.");
      return;
    }
    setSelectedPatient(patient);
    setActiveView("enterImpression");
  };

  const handleAfterSaved = async (billParticularIds: number[]) => {
    // Update cache for list status badges — stay on EnterImpression (no navigation)
    const updates: Record<number, ImpressionsByIdResponse | null> = {};
    await Promise.all(
      billParticularIds.map(async (id) => {
        try {
          const res = await radiologyApiService.fetchImpressionsById(id);
          const result = Array.isArray(res) && res.length > 0 ? res[0] : null;
          updates[id] = result?.id ? result : null;
        } catch {
          updates[id] = null;
        }
      })
    );
    setImpressionCache((prev) => ({ ...prev, ...updates }));
  };

  const handleBackToList = () => {
    setActiveView("list");
    setSelectedPatient(null);
    fetchPatients();
  };

  // ── Sub-views ──────────────────────────────────────────────────────────────
  if (activeView === "enterImpression" && selectedPatient) {
    return (
      <EnterImpression
        patient={selectedPatient}
        onBack={() => { setActiveView("list"); setSelectedPatient(null); }}
        onSaved={handleAfterSaved}
      />
    );
  }

  // ── List view ──────────────────────────────────────────────────────────────
  return (
    <div className="pr-3 mb-3">
      <PageHeader
        icon={faXRay}
        title="Impression Entry"
        subtitle="Enter and manage radiology impressions for billed investigations"
        badges={[{ label: "Patients", value: totalCount }]}
      />

      {/* Search bar */}
      <Card className="mb-3 shadow-sm">
        <Card.Body className="py-2 px-3">
          <div className="d-flex align-items-center gap-2">
            <div className="flex-grow-1">
              <SearchInput
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                placeholder="Search by patient name, OP number, bill..."
                resultCount={resultCount}
                totalCount={totalCount}
              />
            </div>
            <OverlayTrigger
              trigger="click"
              rootClose
              placement="left"
              overlay={(
                <Popover id="ip-patient-note-popover">
                  <Popover.Body style={{ fontSize: "var(--font-size-sm)" }}>
                    <div className="d-flex align-items-center gap-2">
                      <span
                        style={{
                          width: "10px",
                          height: "10px",
                          borderRadius: "50%",
                          display: "inline-block",
                          backgroundColor: "var(--color-warning)",
                        }}
                      />
                      <span>IP Patient</span>
                    </div>
                  </Popover.Body>
                </Popover>
              )}
            >
              <Button
                variant="link"
                className="p-0 text-warning"
                aria-label="IP patient color info"
              >
                <FontAwesomeIcon icon={faCircleExclamation} style={{ fontSize: "var(--font-size-lg)" }} />
              </Button>
            </OverlayTrigger>
          </div>
        </Card.Body>
      </Card>

      {/* Patient list grouped by date */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
          <p className="mt-2" style={{ fontSize: "var(--font-size-sm)", color: "var(--text-muted)" }}>
            Loading patients...
          </p>
        </div>
      ) : dateGroups.length === 0 ? (
        <Card className="shadow-sm">
          <Card.Body className="text-center py-5">
            <FontAwesomeIcon icon={faXRay} size="2x" style={{ color: "var(--text-muted)" }} className="mb-3" />
            <p style={{ fontSize: "var(--font-size-sm)", color: "var(--text-muted)" }}>
              No patients with pending impression entries found.
            </p>
          </Card.Body>
        </Card>
      ) : (
        dateGroups.map((group) => {
          const filteredGroupPatients = group.patients;
          if (filteredGroupPatients.length === 0) return null;
          const isCollapsed = collapsedDates.has(group.date);
          return (
            <Card key={group.date} className="mb-3 shadow-sm">
              <Card.Header
                onClick={() => toggleDateCollapse(group.date)}
                style={{
                  cursor: "pointer",
                  background: "var(--page-primary-color)",
                  color: "var(--page-secondary-color)",
                  userSelect: "none",
                }}
                className="d-flex justify-content-between align-items-center py-2 px-3"
              >
                <span style={{ fontWeight: "var(--font-weight-bold)", fontSize: "var(--font-size-sm)" }}>
                  {group.date || "Unknown Date"}
                  <Badge className="theme-badge-secondary ms-2">
                    {filteredGroupPatients.length}
                  </Badge>
                </span>
                <FontAwesomeIcon icon={isCollapsed ? faChevronDown : faChevronUp} />
              </Card.Header>

              {!isCollapsed && (
                <Card.Body className="p-0">
                  <Table hover responsive className="mb-0">
                    <thead>
                      <tr style={{ background: "var(--table-header-bg)", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-semibold)" }}>
                        <th className="px-3 py-2">#</th>
                        <th className="px-3 py-2">Patient</th>
                        <th className="px-3 py-2">OP Number</th>
                        <th className="px-3 py-2">Bill</th>
                        <th className="px-3 py-2">Doctor / User</th>
                        <th className="px-3 py-2 text-center">Investigations</th>
                        <th className="px-3 py-2 text-center">Status</th>
                        <th className="px-3 py-2 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredGroupPatients.map((patient, idx) => {
                        const patKey = getPatientKey(patient);
                        const counts = getPatientCounts(patient);
                        const isIpPatient = Number(patient.ipId) !== 0;
                        const isLoadingStatus = statusLoadingKey === patKey;
                        return (
                          <tr key={patKey} style={{ fontSize: "var(--font-size-sm)" }}>
                            <td className="px-3 py-2">{idx + 1}</td>
                            <td className="px-3 py-2" style={{ fontWeight: "var(--font-weight-medium)" }}>
                              {patient.patientName}
                            </td>
                            <td
                              className="px-3 py-2"
                              style={
                                isIpPatient
                                  ? ({
                                      backgroundColor: "var(--color-warning)",
                                      "--bs-table-bg": "var(--color-warning)",
                                      "--bs-table-accent-bg": "var(--color-warning)",
                                      "--bs-table-hover-bg": "var(--color-warning)",
                                      fontWeight: "var(--font-weight-semibold)",
                                    } as React.CSSProperties)
                                  : undefined
                              }
                            >
                              {patient.opNumber}
                            </td>
                            <td className="px-3 py-2">{patient.billDisplay}</td>
                            <td className="px-3 py-2">{patient.userName}</td>
                            <td className="px-3 py-2 text-center">
                              <Badge bg="info" text="dark">{patient.particulars?.length ?? 0}</Badge>
                            </td>
                            <td className="px-3 py-2 text-center">
                              {isLoadingStatus ? (
                                <Spinner animation="border" size="sm" />
                              ) : counts.notFetched > 0 ? (
                                <Button
                                  className="theme-outline-btn-primary"
                                  size="sm"
                                  onClick={() => loadPatientStatus(patient)}
                                  style={{ fontSize: "var(--font-size-xs)" }}
                                >
                                  <FontAwesomeIcon icon={faInfoCircle} className="me-1" />
                                  Load Status
                                </Button>
                              ) : (
                                <div className="d-flex gap-1 justify-content-center flex-wrap">
                                  {counts.notEntered > 0 && (
                                    <Badge bg="warning" text="dark" style={{ fontSize: "var(--font-size-xs)" }}>
                                      Not Entered: {counts.notEntered}
                                    </Badge>
                                  )}
                                  {counts.pendingApproval > 0 && (
                                    <Badge bg="primary" style={{ fontSize: "var(--font-size-xs)" }}>
                                      Pending: {counts.pendingApproval}
                                    </Badge>
                                  )}
                                  {counts.approved > 0 && (
                                    <Badge bg="success" style={{ fontSize: "var(--font-size-xs)" }}>
                                      Approved: {counts.approved}
                                    </Badge>
                                  )}
                                  {counts.cancelled > 0 && (
                                    <Badge bg="danger" style={{ fontSize: "var(--font-size-xs)" }}>
                                      Rejected: {counts.cancelled}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="px-3 py-2 text-center">
                              <div className="d-flex gap-1 justify-content-center">
                                {(counts.notFetched > 0 || counts.notEntered > 0) && (
                                  <Button
                                    className="theme-btn-primary"
                                    size="sm"
                                    onClick={() => navigateToEnterImpression(patient)}
                                    disabled={isLoadingStatus}
                                  >
                                    <FontAwesomeIcon icon={faKeyboard} className="me-1" />
                                    Enter {counts.notFetched === 0 ? `(${counts.notEntered})` : ""}
                                  </Button>
                                )}
                                {counts.notFetched === 0 && counts.pendingApproval > 0 && (
                                  <Button
                                    variant="outline-success"
                                    size="sm"
                                    onClick={() => navigateToEnterImpression(patient)}
                                    disabled={isLoadingStatus}
                                  >
                                    <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                                    Approve ({counts.pendingApproval})
                                  </Button>
                                )}
                                {counts.notFetched === 0 && counts.notEntered === 0 && counts.pendingApproval === 0 && (
                                  <Badge bg="success" style={{ fontSize: "var(--font-size-xs)" }}>
                                    <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                                    Complete
                                  </Badge>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </Card.Body>
              )}
            </Card>
          );
        })
      )}
    </div>
  );
};

export default Entry;