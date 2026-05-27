import React, { useMemo, useState } from "react";
import { Container, Card, Form, Button, Col, Spinner, Table } from "react-bootstrap";
import RadiologyApiService, { ImpressionsByBtweenDaysResponse } from "../../../api/radiology/radiology-api-service";
import ReportHeader from "../../../medical-records/components/ReportHeader";
import { 
    searchTableData, 
    exportToExcel, 
    printReport, 
    formatReportDate,
    getDateRangeText
} from "../../../medical-records/utils/reportUtils";
import { showErrorToast, showValidationError } from "../../../utils/alertUtil";
import "../../../medical-records/styles/reportStyles.css";

interface ScanReportRecord {
    patientName: string;
    opNo: string;
    billNo: string;
    particularName: string;
    enteredUser: string;
    study: string;
    impression: string;
    patientVisitDate: string;
}

interface ScanReportGroup {
    patientName: string;
    opNo: string;
    billNo: string;
    patientVisitDate: string;
    particulars: ScanReportRecord[];
}

const ScanReports: React.FC = () => {
    const radiologyApiService = useMemo(() => new RadiologyApiService(), []);

    const today = new Date().toISOString().split("T")[0];
    const [fromDate, setFromDate] = useState<string>(today);
    const [toDate, setToDate] = useState<string>(today);

    const [reportData, setReportData] = useState<ScanReportRecord[]>([]);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Search state
    const [searchTerm, setSearchTerm] = useState<string>("");
    const displayedData = useMemo(
        () =>
            searchTerm
                ? searchTableData(reportData, searchTerm, [
                      "patientName",
                      "opNo",
                      "billNo",
                      "particularName",
                      "enteredUser",
                      "study",
                      "impression",
                      "patientVisitDate",
                  ])
                : reportData,
        [reportData, searchTerm]
    );

    const groupedData = useMemo<ScanReportGroup[]>(() => {
        const groupMap = new Map<string, ScanReportGroup>();

        displayedData.forEach((record) => {
            const key = `${record.patientName}__${record.opNo}__${record.billNo}`;
            const existingGroup = groupMap.get(key);

            if (existingGroup) {
                existingGroup.particulars.push(record);
                return;
            }

            groupMap.set(key, {
                patientName: record.patientName,
                opNo: record.opNo,
                billNo: record.billNo,
                patientVisitDate: record.patientVisitDate,
                particulars: [record],
            });
        });

        return Array.from(groupMap.values());
    }, [displayedData]);

    const mapApiResponseToRows = (rows: ImpressionsByBtweenDaysResponse[]): ScanReportRecord[] => {
        return rows.flatMap((row) => {
            if (!Array.isArray(row.particulars) || row.particulars.length === 0) {
                return [
                    {
                        patientName: row.patientName || "-",
                        opNo: row.opNumber || "-",
                        billNo: row.billDisplay || "-",
                        particularName: "-",
                        enteredUser: row.userName || "-",
                        study: "-",
                        impression: "-",
                        patientVisitDate: formatReportDate(row.billDate, "DD-MM-YYYY"),
                    },
                ];
            }

            return row.particulars.map((particular) => ({
                patientName: row.patientName || "-",
                opNo: row.opNumber || "-",
                billNo: row.billDisplay || "-",
                particularName: particular.particularName || "-",
                enteredUser: particular.entryUserName || row.userName || "-",
                study: particular.study || "-",
                impression: particular.impression || "-",
                patientVisitDate: formatReportDate(row.billDate, "DD-MM-YYYY"),
            }));
        });
    };

    // Handle filter form submission
    const handleFilterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!fromDate || !toDate) {
            showValidationError("Please select both From Date and To Date");
            return;
        }

        if (new Date(fromDate) > new Date(toDate)) {
            showValidationError("From Date cannot be greater than To Date");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await radiologyApiService.fetchImpressionsEntryBetweenDays(fromDate, toDate);
            const records = Array.isArray(response) ? response : [];
            setReportData(mapApiResponseToRows(records));
            setHasSubmitted(true);
        } catch (error) {
            console.error("Error fetching scan reports:", error);
            showErrorToast("Failed to load scan reports. Please try again.");
            setReportData([]);
            setHasSubmitted(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle reset button
    const handleReset = () => {
        setFromDate(today);
        setToDate(today);
        setReportData([]);
        setHasSubmitted(false);
        setSearchTerm("");
    };

    // Handle search
    const handleSearch = (term: string) => {
        setSearchTerm(term);
    };

    // Handle print
    const handlePrint = () => {
        printReport();
    };

    // Handle export
    const handleExport = () => {
        const exportData = displayedData.map((record, index) => ({
            "S.No": index + 1,
            "Patient Name": record.patientName,
            "OP No": record.opNo,
            "Bill Display": record.billNo,
            "Patient Visit Date": record.patientVisitDate,
            "Particular Name": record.particularName,
            "Entered User": record.enteredUser,
            Study: record.study,
            Impression: record.impression,
        }));

        exportToExcel(
            exportData,
            `Scan_Reports_${fromDate}_to_${toDate}`,
            "Scan Reports"
        );
    };

    return (
        <React.Fragment>
            <Container fluid className="px-4 py-3">
                {/* Report Header */}
                <ReportHeader
                    title="Scan Reports"
                    subtitle={hasSubmitted ? getDateRangeText(fromDate, toDate) : "Select date range and click Submit"}
                    onPrint={handlePrint}
                    onExport={handleExport}
                    onSearch={handleSearch}
                    showSearch={hasSubmitted}
                    showSort={false}
                    showPrint={hasSubmitted}
                    showExport={hasSubmitted}
                />
                
                {/* Filter Form Section */}
                <Card className="mb-4 shadow-sm no-print">
                    <Card.Body>
                        <Form className="row g-3 align-items-end" onSubmit={handleFilterSubmit}>
                            <Form.Group as={Col} md={4} controlId="fromDate">
                                <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>From Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={fromDate}
                                    onChange={e => setFromDate(e.target.value)}
                                    required
                                />
                            </Form.Group>
                            <Form.Group as={Col} md={4} controlId="toDate">
                                <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>To Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={toDate}
                                    onChange={e => setToDate(e.target.value)}
                                    required
                                />
                            </Form.Group>
                            <Form.Group as={Col} md={4} className="d-flex align-items-end gap-2">
                                <Button type="submit" variant="primary" className="w-50" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Spinner animation="border" size="sm" className="me-2" />
                                            Loading...
                                        </>
                                    ) : (
                                        "Submit"
                                    )}
                                </Button>
                                <Button type="button" variant="secondary" className="w-50" onClick={handleReset}>
                                    Reset
                                </Button>
                            </Form.Group>
                        </Form>
                    </Card.Body>
                </Card>

                {/* Data Section - Show only after submit */}
                {hasSubmitted && (
                    <>
                        {/* Data Table */}
                        <Card className="shadow-sm">
                            <Card.Body className="p-0">
                                <div className="table-responsive">
                                    <Table className="table-hims mb-0 text-nowrap table-bordered table-striped table-hover" style={{ marginBottom: 0 }}>
                                        <thead
                                            style={{
                                                position: "sticky",
                                                top: 0,
                                                backgroundColor: "#f8f9fa",
                                                zIndex: 10,
                                                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                                borderBottom: "2px solid #dee2e6",
                                            }}
                                        >
                                            <tr>
                                                <th style={{ backgroundColor: "#e9ecef", borderBottom: "2px solid #dee2e6" }}>S. No</th>
                                                <th style={{ backgroundColor: "#e9ecef", borderBottom: "2px solid #dee2e6" }}>Patient Name</th>
                                                <th style={{ backgroundColor: "#e9ecef", borderBottom: "2px solid #dee2e6" }}>OP No</th>
                                                <th style={{ backgroundColor: "#e9ecef", borderBottom: "2px solid #dee2e6" }}>Bill Display</th>
                                                <th style={{ backgroundColor: "#e9ecef", borderBottom: "2px solid #dee2e6" }}>Patient Visit Date</th>
                                                <th style={{ backgroundColor: "#e9ecef", borderBottom: "2px solid #dee2e6" }}>Particular Name</th>
                                                <th style={{ backgroundColor: "#e9ecef", borderBottom: "2px solid #dee2e6" }}>Entered User</th>
                                                <th style={{ backgroundColor: "#e9ecef", borderBottom: "2px solid #dee2e6" }}>Study</th>
                                                <th style={{ backgroundColor: "#e9ecef", borderBottom: "2px solid #dee2e6" }}>Impression</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {groupedData.length === 0 ? (
                                                <tr>
                                                    <td colSpan={9} className="text-center py-4">
                                                        <div className="report-empty-state">
                                                            <i className="bi bi-inbox"></i>
                                                            <div>No scan reports found for the selected date range</div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                groupedData.map((group, groupIndex) =>
                                                    group.particulars.map((particular, particularIndex) => (
                                                        <tr key={`${group.patientName}-${group.opNo}-${group.billNo}-${particularIndex}`}>
                                                            {particularIndex === 0 ? (
                                                                <>
                                                                    <td rowSpan={group.particulars.length} style={{ verticalAlign: "top" }}>
                                                                        {groupIndex + 1}
                                                                    </td>
                                                                    <td rowSpan={group.particulars.length} style={{ verticalAlign: "top" }}>
                                                                        {group.patientName}
                                                                    </td>
                                                                    <td rowSpan={group.particulars.length} style={{ verticalAlign: "top" }}>
                                                                        {group.opNo}
                                                                    </td>
                                                                    <td rowSpan={group.particulars.length} style={{ verticalAlign: "top" }}>
                                                                        {group.billNo}
                                                                    </td>
                                                                    <td rowSpan={group.particulars.length} style={{ verticalAlign: "top" }}>
                                                                        {group.patientVisitDate}
                                                                    </td>
                                                                </>
                                                            ) : null}
                                                            <td>{particular.particularName}</td>
                                                            <td className="fw-bold" style={{color: 'var(--page-secondary-color)'}}>{particular.enteredUser}</td>
                                                            <td style={{ whiteSpace: "pre-wrap" }}>{particular.study}</td>
                                                            <td style={{ whiteSpace: "pre-wrap" }}>{particular.impression}</td>
                                                        </tr>
                                                    ))
                                                )
                                            )}
                                        </tbody>
                                    </Table>
                                </div>
                            </Card.Body>
                        </Card>
                    </>
                )}

                {/* Empty State - Show before submit */}
                {!hasSubmitted && (
                    <Card className="shadow-sm text-center py-5">
                        <Card.Body>
                            <i className="fas fa-file-medical-alt fa-3x text-muted mb-3"></i>
                            <h5 className="text-muted">Select Date Range</h5>
                            <p className="text-muted mb-0">
                                Please select From Date and To Date, then click Submit to view scan reports
                            </p>
                        </Card.Body>
                    </Card>
                )}
            </Container>
        </React.Fragment>
    );
};

export default ScanReports;
