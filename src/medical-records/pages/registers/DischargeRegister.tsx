import React, { useState, useRef, useEffect, useMemo } from "react";
import { Container, Card, Form, Button, Row, Col, Alert, Spinner } from "react-bootstrap";
import ReportHeader from "../../components/ReportHeader";
import ReportKPICard from "../../components/ReportKPICard";
import ReportTable from "../../components/ReportTable";
import { 
    searchTableData, 
    sortTableData, 
    exportToExcel, 
    printReport,
    formatReportDate,
    getDateRangeText
} from "../../utils/reportUtils";
import "../../styles/reportStyles.css";
import MedicalRecordsApiService, { DischargeRegisterBetweenDatesApiItem } from "../../../api/medical-records/medical-records-api-service";
import { showValidationError, showErrorToast } from "../../../utils/alertUtil";

export default function DischargeRegister() {
    const apiService = useMemo(() => new MedicalRecordsApiService(), []);

    // Departments
    const [departments,        setDepartments]        = useState<{ id: number; name: string }[]>([]);
    const [departmentsLoading, setDepartmentsLoading] = useState<boolean>(false);
    const [selectedDepartment, setSelectedDepartment] = useState<string>("All");

    useEffect(() => {
        const load = async () => {
            setDepartmentsLoading(true);
            try {
                const raw = await apiService.fetchAllDepartments();
                const active = (Array.isArray(raw) ? raw : [])
                    .filter((d: any) => d.isActive === 1 || d.isActive === undefined || d.isActive === null)
                    .sort((a: any, b: any) => a.id - b.id)
                    .map((d: any) => ({ id: d.id, name: d.name }));
                setDepartments(active);
            } catch {
                // non-blocking
            } finally {
                setDepartmentsLoading(false);
            }
        };
        load();
    }, [apiService]);

    // Refs
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Click outside search collapse
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
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
        totalDischarges: 0,
        totalDays: 0,
        avgStayDays: 0,
        maleCount: 0,
        femaleCount: 0
    });

    // On mount, initialize filtered data
    useEffect(() => {
        const filtered = tableData;
        calculateStats(filtered);
        setFilteredByDate(filtered);
        updateDisplayedData(filtered, searchTerm, sortKey, sortDirection);
    }, [tableData]);

    // Update displayed data when search, sort, or department filter changes
    useEffect(() => {
        updateDisplayedData(filteredByDate, searchTerm, sortKey, sortDirection, selectedDepartment);
    }, [searchTerm, sortKey, sortDirection, filteredByDate, selectedDepartment]);

    const getAgeFromDob = (dob?: string) => {
        if (!dob) return "-";
        const birth = new Date(dob);
        if (isNaN(birth.getTime())) return "-";
        const now = new Date();
        let years = now.getFullYear() - birth.getFullYear();
        const m = now.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) years--;
        return years >= 0 ? `${years}-Y` : "-";
    };

    const normalizeApiData = (data: DischargeRegisterBetweenDatesApiItem[]) => {
        return (Array.isArray(data) ? data : []).map((item) => ({
            doa: item?.admissionDate || "-",
            ipNo: item?.ipDisplayNo || item?.ipId || "-",
            opNo: item?.opNo || "-",
            patientName: item?.patientName || "-",
            age: getAgeFromDob(item?.dateOfBirth),
            sex: item?.gender || "-",
            address: item?.address || "-",
            dod: item?.dischargeDate || "-",
            noDays: item?.stayDays ?? 0,
            ward: item?.wardName || "-",
            department: item?.departmentName || "-",
            dischargedCondition: item?.dischargeCondition || "-"
        }));
    };

    // Calculate statistics
    const calculateStats = (records: any[]) => {
        let maleCount = 0;
        let femaleCount = 0;
        let totalDays = 0;

        records.forEach(record => {
            const sex = record.sex?.toLowerCase() || "";
            if (sex.includes("male") && !sex.includes("female")) {
                maleCount++;
            } else if (sex.includes("female")) {
                femaleCount++;
            }
            totalDays += record.noDays || 0;
        });

        const avgStay = records.length > 0 ? Math.round(totalDays / records.length) : 0;

        setStats({
            totalDischarges: records.length,
            totalDays: totalDays,
            avgStayDays: avgStay,
            maleCount: maleCount,
            femaleCount: femaleCount
        });
    };

    // Update displayed data with department filter, search and sort
    const updateDisplayedData = (records: any[], search: string, sortK: string, sortDir: "asc" | "desc", dept: string = "All") => {
        let result = records;

        // Apply department filter
        if (dept && dept !== "All") {
            result = result.filter((r) => r.department === dept);
        }

        // Apply search
        if (search) {
            result = searchTableData(result, search, ["ipNo", "opNo", "patientName", "ward", "department", "address", "dischargedCondition"]);
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
            const apiData = await apiService.fetchDischargeRegistersBetweenDates(fromDate, toDate);
            const normalized = normalizeApiData(apiData);
            setTableData(normalized);
            calculateStats(normalized);
            setFilteredByDate(normalized);
            updateDisplayedData(normalized, searchTerm, sortKey, sortDirection, selectedDepartment);
        } catch (err: any) {
            console.error("Failed to fetch discharge register data", err);
            const message = err?.response?.data?.message || err?.message || "Failed to load records. Please try again.";
            setError(message);
            showErrorToast(message);
        } finally {
            setLoading(false);
        }
    };

    // Handle reset button
    const handleReset = () => {
        setFromDate(today);
        setToDate(today);
        setSelectedDepartment("All");
        setTableData([]);
        setFilteredByDate([]);
        setDisplayedData([]);
        setSearchTerm("");
        setSortKey("");
        setSortDirection("asc");
        setError(null);
        setStats({
            totalDischarges: 0,
            totalDays: 0,
            avgStayDays: 0,
            maleCount: 0,
            femaleCount: 0
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
            "Sl. No": index + 1,
            "D.O.A": record.doa,
            "IP No": record.ipNo,
            "OP No": record.opNo,
            "Patient Name": record.patientName,
            "Age": record.age,
            "Sex": record.sex,
            "Address": record.address,
            "D.O.D": record.dod,
            "No Days": record.noDays,
            "Ward": record.ward,
            "Department": record.department,
            "Discharged Condition": record.dischargedCondition
        }));

        exportToExcel(
            exportData,
            `Discharge_Register_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
            "Discharge Register"
        );
    };

    // Table columns configuration
    const columns = [
        { key: "slNo", label: "Sl. No", sortable: false, render: (_: any, __: any, idx: number) => idx + 1 },
        { key: "doa", label: "D.O.A", sortable: true },
        { key: "ipNo", label: "IP No", sortable: true },
        { key: "opNo", label: "OP No", sortable: true },
        { key: "patientName", label: "Patient Name", sortable: true },
        { key: "age", label: "Age", sortable: true },
        { key: "sex", label: "Sex", sortable: true },
        { key: "address", label: "Address", sortable: true },
        { key: "dod", label: "D.O.D", sortable: true },
        { key: "noDays", label: "No Days", sortable: true },
        { key: "ward", label: "Ward", sortable: true },
        { key: "department", label: "Department", sortable: true },
        { key: "dischargedCondition", label: "Discharged Condition", sortable: true }
    ];

    return (
        <React.Fragment>
            <Container fluid className="px-4 py-3">
                {/* Report Header */}
                <ReportHeader
                    title="Discharge Register"
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
                            <Form.Group as={Col} md={3} controlId="department">
                                <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>Department</Form.Label>
                                <Form.Select
                                    value={selectedDepartment}
                                    onChange={(e) => setSelectedDepartment(e.target.value)}
                                    disabled={departmentsLoading}
                                >
                                    {departmentsLoading
                                        ? <option>Loading...</option>
                                        : <>
                                            <option value="All">All Departments</option>
                                            {departments.map((d) => (
                                                <option key={d.id} value={d.name}>{d.name}</option>
                                            ))}
                                          </>
                                    }
                                </Form.Select>
                            </Form.Group>
                            <Form.Group as={Col} md={3} controlId="fromDate">
                                <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>From Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={fromDate}
                                    onChange={e => setFromDate(e.target.value)}
                                    max={today}
                                    required
                                />
                            </Form.Group>
                            <Form.Group as={Col} md={3} controlId="toDate">
                                <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>To Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={toDate}
                                    onChange={e => setToDate(e.target.value)}
                                    max={today}
                                    required
                                />
                            </Form.Group>
                            <Form.Group as={Col} md={3} className="d-flex align-items-end gap-2">
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
                                label="Total Discharges"
                                value={stats.totalDischarges}
                                variant="primary"
                            />
                        </Col>
                        <Col md={2}>
                            <ReportKPICard
                                label="Total Stay Days"
                                value={stats.totalDays}
                                variant="info"
                            />
                        </Col>
                        <Col md={2}>
                            <ReportKPICard
                                label="Avg. Stay (Days)"
                                value={stats.avgStayDays}
                                variant="success"
                            />
                        </Col>
                        <Col md={2}>
                            <ReportKPICard
                                label="Male"
                                value={stats.maleCount}
                                variant="warning"
                            />
                        </Col>
                        <Col md={2}>
                            <ReportKPICard
                                label="Female"
                                value={stats.femaleCount}
                                variant="danger"
                            />
                        </Col>
                    </Row>
                )}

                {/* Data Table Section */}
                {loading ? (
                    <div className="text-center py-5 text-muted">
                        <Spinner animation="border" role="status" />
                        <div className="mt-3">Loading discharge register...</div>
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
