import React, { useState, useMemo, useEffect } from "react";
import { Container, Card, Row, Col, Alert, Spinner } from "react-bootstrap";
import ReportHeader from "../../components/ReportHeader";
import ReportKPICard from "../../components/ReportKPICard";
import ReportTable from "../../components/ReportTable";
import { searchTableData, sortTableData, exportToExcel, printReport, formatReportDate } from "../../utils/reportUtils";
import MedicalRecordsApiService from "../../../api/medical-records/medical-records-api-service";
import "../../styles/reportStyles.css";

interface ActiveIpRecord {
  id: number;
  ipNumber: string;
  opNo: string;
  patientName: string;
  address: string;
  admittedWard: string;
  roomBed: string;
  doa: string;
}

const columns = [
  { key: "slNo",        label: "S. No",       sortable: false, render: (_: any, __: any, idx: number) => idx + 1 },
  { key: "ipNumber",    label: "IP. No.",      sortable: true  },
  { key: "opNo",        label: "OP. No.",      sortable: true  },
  { key: "patientName", label: "Patient Name", sortable: true  },
  { key: "address",     label: "Address",      sortable: false },
  { key: "doa",         label: "DOA",          sortable: true  },
  { key: "admittedWard", label: "Ward Details", sortable: true  },
  { key: "roomBed",     label: "Room / Bed",   sortable: true  },
];

const normalizeData = (raw: any[]): ActiveIpRecord[] =>
  raw.map((item: any, idx: number) => ({
    id:           idx + 1,
    ipNumber:     item?.ipNo || item?.ipId?.toString() || "-",
    opNo:         item?.opNo || item?.opVisitId?.toString() || "-",
    patientName:  item?.patientName || "-",
    address:      item?.address || "-",
    admittedWard: item?.admittedWard || "-",
    roomBed:      item?.roomBed || "-",
    doa:          item?.admitDate || "-",
  }));

const ActiveIp: React.FC = () => {
  const apiService = useMemo(() => new MedicalRecordsApiService(), []);

  const [allData, setAllData]             = useState<ActiveIpRecord[]>([]);
  const [loading, setLoading]             = useState<boolean>(false);
  const [error, setError]                 = useState<string | null>(null);
  const [searchTerm, setSearchTerm]       = useState<string>("");
  const [sortKey, setSortKey]             = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiService.fetchActiveIpPatients();
        const raw: any[] = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
          ? response.data
          : [];
        setAllData(normalizeData(raw));
      } catch (err: any) {
        setError(err?.response?.data?.message || err?.message || "Failed to load active inpatients.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [apiService]);

  const displayedData = useMemo(() => {
    let result = [...allData];
    if (searchTerm) {
      result = searchTableData(result, searchTerm, ["ipNumber", "opNo", "patientName", "address", "admittedWard", "roomBed", "doa"]);
    }
    if (sortKey) {
      result = sortTableData(result, sortKey as keyof ActiveIpRecord, sortDirection);
    }
    return result;
  }, [allData, searchTerm, sortKey, sortDirection]);

  const handleSort = (key: string, direction: "asc" | "desc") => {
    setSortKey(key);
    setSortDirection(direction);
  };

  const handleExport = () => {
    const exportData = displayedData.map((record, index) => ({
      "S. No":        index + 1,
      "IP. No.":      record.ipNumber,
      "OP. No.":      record.opNo,
      "Patient Name": record.patientName,
      "Address":      record.address,
      "DOA":          record.doa,
      "Ward Details": record.admittedWard,
      "Room / Bed":   record.roomBed,
    }));
    exportToExcel(exportData, `Active_IP_${formatReportDate(new Date(), "DD-MM-YYYY")}`, "Active IP List");
  };

  return (
    <React.Fragment>
      <Container fluid className="px-4 py-3">
        <ReportHeader
          title="Active Inpatient List"
          subtitle="Currently admitted inpatients"
          onPrint={printReport}
          onExport={handleExport}
          onSearch={setSearchTerm}
          showSearch={allData.length > 0}
          showSort={false}
          showPrint={allData.length > 0}
          showExport={allData.length > 0}
        />

        {error && (
          <Alert variant="danger" className="mt-3">
            {error}
          </Alert>
        )}

        {!loading && !error && (
          <Row className="mb-4">
            <Col md={3}>
              <ReportKPICard label="Total Active IPs" value={allData.length} variant="primary" />
            </Col>
            <Col md={3}>
              <ReportKPICard label="Showing" value={displayedData.length} variant="info" />
            </Col>
          </Row>
        )}

        {loading ? (
          <div className="text-center py-5 text-muted">
            <Spinner animation="border" role="status" />
            <div className="mt-3">Loading active inpatients...</div>
          </div>
        ) : (
          <Card className="report-card" style={{ padding: "0.75rem" }}>
            <div
              style={{
                maxHeight: "calc(115vh - 500px)",
                minHeight: "350px",
                overflowY: "auto",
                overflowX: "auto",
                position: "relative",
              }}
            >
              <ReportTable
                data={displayedData}
                columns={columns}
                onSort={handleSort}
                responsive={false}
                emptyMessage={
                  searchTerm
                    ? "No records match your search criteria."
                    : "No active inpatients found."
                }
              />
            </div>

            <div
              style={{
                padding: "0.5rem 1rem",
                borderTop: "2px solid #e0e0e0",
                background: "linear-gradient(to right, #f8f9fa, #ffffff)",
                textAlign: "start",
              }}
            >
              <small className="text-muted" style={{ fontWeight: "var(--font-weight-medium)" }}>
                Total Data Rows: <strong>{displayedData.length}</strong>
                {searchTerm && (
                  <span className="ms-2">(Filtered from {allData.length})</span>
                )}
              </small>
            </div>
          </Card>
        )}
      </Container>
    </React.Fragment>
  );
};

export default ActiveIp;
