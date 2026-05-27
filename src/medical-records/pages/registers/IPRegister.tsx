import React, { useState, useRef, useEffect, useMemo } from "react";
import { Container, Card, Form, Button, Row, Col, Modal, Badge, Spinner, Alert } from "react-bootstrap";
import { FileText, ArrowUp, ArrowDown } from "react-bootstrap-icons";
import ReportHeader from "../../components/ReportHeader";
import ReportKPICard from "../../components/ReportKPICard";
import ReportTable from "../../components/ReportTable";
import { 
    searchTableData, 
    sortTableData, 
    exportToExcel, 
    printReport,
    formatReportDate,
    getDateRangeText,
    scrollToTop as scrollTableToTop,
    scrollToBottom as scrollTableToBottom
} from "../../utils/reportUtils";
import "../../styles/reportStyles.css";
import MedicalRecordsApiService, { IpRegisterBetweenDatesApiItem } from "../../../api/medical-records/medical-records-api-service";
import { showValidationError } from "../../../utils/alertUtil";

export default function IPRegister() {
    // Services
        const apiService = useMemo(() => new MedicalRecordsApiService(), []);

    // Refs
        const searchInputRef = useRef<HTMLInputElement>(null);

    // Click outside search collapse
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
        if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
            // Collapse search if it's expanded
            const searchInput = document.getElementById('headerSearchInput');
            if (searchInput && searchInput.classList.contains('active')) {
            searchInput.classList.remove('active');
            }
        }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const [tableData, setTableData] = useState<any[]>([]);

    // Filter form state
    const today = new Date().toISOString().split("T")[0];
    const [fromDate, setFromDate] = useState<string>(today);
    const [toDate, setToDate] = useState<string>(today);

    // Data state
    const [filteredByDate, setFilteredByDate] = useState<any[]>([]);
    const [displayedData, setDisplayedData] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Search and sort state
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [sortKey, setSortKey] = useState<string>("");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

    // Statistics
    const [stats, setStats] = useState({
        totalPatients: 0,
        maleTotal: 0,
        maleChildTotal: 0,
        femaleTotal: 0,
        femaleChildTotal: 0
    });

    // On mount, initialize filtered data (empty until fetch)
    React.useEffect(() => {
        const filtered = tableData;
        calculateStats(filtered);
        setFilteredByDate(filtered);
        updateDisplayedData(filtered, searchTerm, sortKey, sortDirection);
    }, [tableData]);

    // Update displayed data when search or sort changes
    React.useEffect(() => {
        updateDisplayedData(filteredByDate, searchTerm, sortKey, sortDirection);
    }, [searchTerm, sortKey, sortDirection, filteredByDate]);

    // Helpers
    const getAgeFromDob = (dob?: string) => {
        if (!dob) return "-";
        const birth = new Date(dob);
        if (isNaN(birth.getTime())) return "-";
        const now = new Date();
        let years = now.getFullYear() - birth.getFullYear();
        const m = now.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) years--;
        return years >= 0 ? `${years} Y` : "-";
    };

    const normalizeApiData = (data: IpRegisterBetweenDatesApiItem[]) => {
        return (Array.isArray(data) ? data : []).map((item: IpRegisterBetweenDatesApiItem, idx: number) => {
            const fullName = [item?.firstName, item?.secondName].filter(Boolean).join(" ").trim() || "-";
            const genderMap: Record<string, string> = { "1": "M", "2": "F", "M": "M", "F": "F" };
            const sex = genderMap[item?.gender] || item?.gender || "-";
            const age = getAgeFromDob(item?.dateOfBirth);

            return {
                slNo: idx + 1,
                ipNo: item?.ipDisplay || item?.ipId || "-",
                opNo: item?.opNo || item?.opvisitId || "-",
                patientName: fullName,
                address: item?.address || "-",
                sex,
                age,
                ward: [item?.wardName, item?.bedName].filter(Boolean).join(" / ") || "-",
                admissionDate: [item?.admitDate, item?.admitTime].filter(Boolean).join(" ") || "-",
                admitDoctor: item?.doctorName || "-",
                department: item?.departmentName || "-",
                user: item?.userName || "-",
                isChild: false,
                raw: item,
            };
        });
    };

    // Calculate statistics
    const calculateStats = (records: any[]) => {
        let maleCount = 0;
        let maleChildCount = 0;
        let femaleCount = 0;
        let femaleChildCount = 0;

        records.forEach(record => {
        if (record.sex === "Male" || record.sex === "M") {
            if (record.isChild) {
            maleChildCount++;
            } else {
            maleCount++;
            }
        } else if (record.sex === "Female" || record.sex === "F") {
            if (record.isChild) {
            femaleChildCount++;
            } else {
            femaleCount++;
            }
        }
        });

        setStats({
        totalPatients: records.length,
        maleTotal: maleCount,
        maleChildTotal: maleChildCount,
        femaleTotal: femaleCount,
        femaleChildTotal: femaleChildCount
        });
    };

    // Update displayed data with search and sort
    const updateDisplayedData = (records: any[], search: string, sortK: string, sortDir: "asc" | "desc") => {
        let result = records;

        // Apply search
        if (search) {
        result = searchTableData(result, search, ["ipNo", "opNo", "patientName", "address", "department", "admitDoctor", "ward"]);
        }

        // Apply sort
        if (sortK) {
        result = sortTableData(result, sortK, sortDir);
        }

        setDisplayedData(result);
    };

    // Handle filter form submission
    const handleFilterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!fromDate || !toDate) {
            const message = "Please select both From Date and To Date.";
            setError(message);
            showValidationError(message, "Validation");
            return;
        }

        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(fromDate) || !dateRegex.test(toDate)) {
            const message = "Please enter valid dates and try again.";
            setError(message);
            showValidationError(message, "Validation");
            return;
        }

        if (fromDate > toDate) {
            const message = "From Date cannot be later than To Date.";
            setError(message);
            showValidationError(message, "Validation");
            return;
        }

        setError(null);
        setLoading(true);
        setFilteredByDate([]);
        setDisplayedData([]);

        try {
            const fetchIpRegisters =
                (apiService as any).fetchIpregistersBetweenDates?.bind(apiService) ||
                apiService.fetchIpRegistersBetweenDates.bind(apiService);

            const apiData = await fetchIpRegisters(fromDate, toDate);
            const normalized = normalizeApiData(apiData);
            setTableData(normalized);
            calculateStats(normalized);
            setFilteredByDate(normalized);
            updateDisplayedData(normalized, searchTerm, sortKey, sortDirection);
        } catch (err: any) {
            console.error("Failed to fetch IP register data", err);
            const message = err?.response?.data?.message || err?.message || "Failed to load records. Please try again.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    // Handle reset button
    const handleReset = () => {
        setFromDate(today);
        setToDate(today);
        setFilteredByDate([]);
        setDisplayedData([]);
        setTableData([]);
        setSearchTerm("");
        setSortKey("");
        setSortDirection("asc");
        setError(null);
        setStats({
        totalPatients: 0,
        maleTotal: 0,
        maleChildTotal: 0,
        femaleTotal: 0,
        femaleChildTotal: 0
        });
    };

    // Handle search
    const handleSearch = (term: string) => {
        setSearchTerm(term);
    };

    // Handle sort
    const handleSort = (key: string) => {
        if (sortKey === key) {
        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
        setSortKey(key);
        setSortDirection("asc");
        }
    };

    // Handle print
    const handlePrint = () => {
        printReport();
    };

    // Handle export
    const handleExport = () => {
        const exportData = displayedData.map((record, index) => ({
        "S.No": index + 1,
        "IP No": record.ipNo,
        "OP No": record.opNo,
        "Patient Name": record.patientName,
        "Address": record.address,
        "Sex": record.sex,
        "Age": record.age,
        "Ward": record.ward,
        "Admission Date": record.admissionDate,
        "Admit Doctor": record.admitDoctor,
        "Department": record.department,
        "User": record.user
        }));

        exportToExcel(
        exportData,
        `Inpatient_Register_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
        "Inpatient Register"
        );
    };

    // Table columns configuration
    const columns = [
        { key: "slNo", label: "S.No", sortable: false, render: (_: any, __: any, idx: number) => idx + 1 },
        { key: "ipNo", label: "IP.No", sortable: true },
        { key: "opNo", label: "OP.No", sortable: true },
        { key: "patientName", label: "Patient Name", sortable: true },
        { key: "address", label: "Address", sortable: false },
        { 
        key: "sexAge", 
        label: "Sex / Age", 
        sortable: false,
        render: (record: any) => record ? `${record.sex} / ${record.age}` : ""
        },
        { key: "ward", label: "Ward Details", sortable: true },
        { key: "admissionDate", label: "D.O.ADMIS", sortable: true },
        { key: "admitDoctor", label: "Admit Doctor", sortable: true },
        { key: "department", label: "Department", sortable: true },
        { key: "user", label: "User", sortable: false }
    ];

    return (
        <React.Fragment>
        <Container fluid className="px-4 py-3">
            {/* Report Header */}
            <ReportHeader
            title="Inpatient Register"
            subtitle={filteredByDate.length > 0 ? getDateRangeText(fromDate, toDate) : "Select date range and click Submit"}
            onPrint={handlePrint}
            onExport={handleExport}
            onSearch={handleSearch}
            showSearch={filteredByDate.length > 0}
            showSort={false}
            showPrint={filteredByDate.length > 0}
            showExport={filteredByDate.length > 0}
            />

            {error && (
            <Alert variant="danger" className="mt-3">
                {error}
            </Alert>
            )}
            
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
                    max={today}
                    required
                    />
                </Form.Group>
                <Form.Group as={Col} md={4} controlId="toDate">
                    <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>To Date</Form.Label>
                    <Form.Control
                    type="date"
                    value={toDate}
                    onChange={e => setToDate(e.target.value)}
                    max={today}
                    required
                    />
                </Form.Group>
                <Form.Group as={Col} md={4} className="d-flex align-items-end gap-2">
                    <Button type="submit" variant="primary" className="w-50" disabled={loading}>
                    {loading ? "Loading..." : "Submit"}
                    </Button>
                    <Button type="button" variant="secondary" className="w-50" onClick={handleReset}>
                    Reset
                    </Button>
                </Form.Group>
                </Form>
            </Card.Body>
            </Card>

            {/* KPI Statistics Section */}
            {filteredByDate.length > 0 && (
            <Row className="mb-4">
                <Col md={2}>
                <ReportKPICard
                    label="Total Patients"
                    value={stats.totalPatients}
                    variant="primary"
                />
                </Col>
                <Col md={2}>
                <ReportKPICard
                    label="Male Total"
                    value={stats.maleTotal}
                    variant="info"
                />
                </Col>
                <Col md={2}>
                <ReportKPICard
                    label="Male Child"
                    value={stats.maleChildTotal}
                    variant="success"
                />
                </Col>
                <Col md={2}>
                <ReportKPICard
                    label="Female Total"
                    value={stats.femaleTotal}
                    variant="danger"
                />
                </Col>
                <Col md={2}>
                <ReportKPICard
                    label="Female Child"
                    value={stats.femaleChildTotal}
                    variant="warning"
                />
                </Col>
            </Row>
            )}

            {/* Data Table Section */}
            {loading ? (
            <div className="text-center py-5 text-muted">
                <Spinner animation="border" role="status" />
                <div className="mt-3">Loading inpatient register...</div>
            </div>
            ) : (
            <Card className="report-card" style={{ padding: "0.75rem" }}>
                <div 
                    style={{ 
                        maxHeight: "calc(115vh - 500px)", 
                        minHeight: "350px",
                        overflowY: "auto",
                        overflowX: "auto",
                        position: "relative"
                    }}
                >
                    <ReportTable
                    data={displayedData}
                    columns={columns}
                    onSort={handleSort}
                    responsive={false}
                    emptyMessage={
                        filteredByDate.length === 0
                        ? "No data loaded. Please select date range and click Submit."
                        : searchTerm
                            ? "No records match your search criteria."
                            : "No records found."
                    }
                    />
                </div>

                <div 
                    style={{ 
                    padding: "0.5rem 1rem", 
                    borderTop: "2px solid #e0e0e0",
                    background: "linear-gradient(to right, #f8f9fa, #ffffff)",
                    textAlign: "start"
                    }}
                >
                    <small className="text-muted" style={{ fontWeight: "var(--font-weight-medium)" }}>
                    Total Data Rows: <strong>{displayedData.length}</strong>
                    {searchTerm && (
                        <span className="ms-2">
                        (Filtered from {filteredByDate.length})
                        </span>
                    )}
                    </small>
                </div>

            </Card>
            )}
        </Container>
        </React.Fragment>
    );
}
