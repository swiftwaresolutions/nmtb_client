/**
 * PrintTab Component
 * Displays approved patients ready for printing maternity discharge summaries
 * Workflow: Active IP → Save → Verification → Verify → Approval → Approve → Print
 */
import React, { useEffect, useState } from "react";
import { Container, Card, Row, Col, Button } from "react-bootstrap";
import { showErrorToast } from "../../../../../utils/alertUtil";
import ReportTable from "../../../../components/ReportTable";
import { searchTableData, sortTableData } from "../../../../utils/reportUtils";
import { MedicalRecordsApiService } from "../../../../../api/medical-records/medical-records-api-service";

interface PrintPatientData {
  slNo: number;
  patientName: string;
  status: string;
  opNo: string;
  ipNo: string;
  age: number;
  sex: string;
  department: string;
  ward: string;
  doctor: string;
  doa: string;
  phone: string;
  address: string;
  guardianName?: string;
  guardianType?: string;
  patId?: number;
  visitId?: number;
  ipId?: number;
  enteredUser?: string;
  enteredDate?: string;
  approvedUser?: string;
  approvedDate?: string;
  approvedAt?: string;
  summaryId?: number;
}

interface PrintTabProps {
  onPatientSelect?: (patient: any) => void;
  onEditPatient?: (patient: any) => void;
  fromDate: string;
  toDate: string;
}

const PrintTab: React.FC<PrintTabProps> = ({ onPatientSelect, onEditPatient, fromDate, toDate }) => {
  const apiService = new MedicalRecordsApiService();
  const [loading, setLoading] = useState<boolean>(false);
  const [patientsData, setPatientsData] = useState<PrintPatientData[]>([]);
  const [displayedData, setDisplayedData] = useState<PrintPatientData[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortKey, setSortKey] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [printingPatientId, setPrintingPatientId] = useState<number | null>(null);
  const [fetchingDetails, setFetchingDetails] = useState<boolean>(false);

  const isObstetricsDepartment = (departmentName: string) =>
    departmentName.toLowerCase().includes("obstet");

  useEffect(() => {
    fetchPrintPatients();
  }, [fromDate, toDate]);

  useEffect(() => {
    let result = patientsData;

    if (searchTerm) {
      result = searchTableData(result, searchTerm, [
        "patientName",
        "opNo",
        "ipNo",
        "enteredUser",
        "approvedUser",
        "enteredDate",
        "approvedDate"
      ]);
    }

    if (sortKey) {
      result = sortTableData(result, sortKey as keyof PrintPatientData, sortDirection);
    }

    setDisplayedData(result);
  }, [patientsData, searchTerm, sortKey, sortDirection]);

  const fetchPrintPatients = async () => {
    setLoading(true);
    try {
      const response = await apiService.fetchIpPatientsForSummaryMatPrint(fromDate, toDate);
      const data = response?.data || response || [];

      const printData: PrintPatientData[] = Array.isArray(data)
        ? data
            .filter(
              (patient: any) =>
                patient.maternityDisSummaryVerified === 1 &&
                (
                  Number(patient.departmentId || 0) === 8 ||
                  isObstetricsDepartment(patient.departmentName || patient.department || "")
                )
            )
            .map((patient: any, index: number) => ({
              slNo: index + 1,
              patientName: patient.patientName || "",
              status: "Verified",
              opNo: patient.opNo || "",
              ipNo: patient.ipNo || "",
              age: patient.age || 0,
              sex: patient.gender || patient.sex || "",
              address:
                patient.address ||"",
              department: patient.departmentName || patient.department || "",
              ward: patient.admittedWard || patient.ward || "",
              doctor: patient.admittedDoctorName || patient.doctor || "",
              doa: patient.admitDate || patient.doa || "",
              phone: patient.mobileNumber || patient.phone || "",
              guardianName: patient.guardianName || patient.gname || patient.gName || "",
              guardianType: patient.guardianType || patient.gType || patient.relation || "",
              patId: patient.patId || 0,
              visitId: patient.opVisitId || 0,
              ipId: patient.ipId || 0,
              enteredUser: patient.maternityUser || "",
              enteredDate: patient.maternityDate || "",
              approvedUser: patient.maternityApprovedUser || "",
              approvedDate: patient.maternityApproveDateTime || "",
              summaryId: patient.summaryId || 0
            }))
        : [];

      setPatientsData(printData);
    } catch (error: any) {
      console.error("Error fetching print patients:", error);
      showErrorToast(
        error?.response?.data?.error || "Failed to fetch approved patient data"
      );
      setPatientsData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleRowClick = async (record: PrintPatientData) => {
    if (!record.patId || !record.visitId || !record.ipId) {
      showErrorToast("Invalid patient data");
      return;
    }

    setFetchingDetails(true);
    try {
      const summaryData = await apiService.fetchMaternityDischargeSummary(
        record.patId,
        record.visitId,
        record.ipId
      );

      const enhancedRecord = summaryData ? { ...record, summaryData } : record;
      if (onEditPatient) onEditPatient(enhancedRecord);
    } catch (error: any) {
      console.error("Error fetching maternity discharge summary:", error);
      showErrorToast(
        error?.response?.data?.error || "Failed to fetch patient discharge summary"
      );
      if (onEditPatient) onEditPatient(record);
    } finally {
      setFetchingDetails(false);
    }
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const handlePrint = async (patient: PrintPatientData) => {
    if (!patient.patId || !patient.visitId || !patient.ipId) {
      showErrorToast("Invalid patient data");
      return;
    }

    setPrintingPatientId(patient.patId);
    try {
      // Fetch the maternity discharge summary data
      const summaryData = await apiService.fetchMaternityDischargeSummary(
        patient.patId,
        patient.visitId,
        patient.ipId
      );

      if (summaryData) {
        // Pass the data to parent component for printing
        const enhancedPatient = {
          ...patient,
          summaryData: summaryData
        };
        
        if (onPatientSelect) {
          onPatientSelect(enhancedPatient);
        }
      } else {
        showErrorToast("No discharge summary found for this patient");
      }
    } catch (error: any) {
      console.error("Error fetching discharge summary for print:", error);
      showErrorToast(
        error?.response?.data?.error || "Failed to fetch discharge summary"
      );
    } finally {
      setPrintingPatientId(null);
    }
  };

  const columns = [
    { key: "slNo", label: "S. No", sortable: false, render: (value: number) => value },
    {
      key: "action",
      label: "Action",
      sortable: false,
      render: (_value: any, record: PrintPatientData) => (
        <Button
          variant=""
          size="sm"
          style={{ backgroundColor: 'var(--page-secondary-color)', color: 'var(--page-primary-color)', border: 'none' }}
          onClick={(e) => {
            e.stopPropagation();
            handlePrint(record);
          }}
          disabled={printingPatientId === record.patId}
        >
          {printingPatientId === record.patId ? "Loading..." : "Print"}
        </Button>
      )
    },
    { key: "patientName", label: "Patient Name", sortable: true },
    { key: "opNo", label: "OP No", sortable: true },
    { key: "ipNo", label: "IP No", sortable: true },
    { key: "enteredUser", label: "Entered User", sortable: true },
    { key: "approvedUser", label: "Approved User Name", sortable: true },
    {
      key: "approvedDate",
      label: "Date Approved",
      sortable: true,
      render: (value: string) => {
        if (!value) return "";
        const datePart = value.split(" ")[0];
        const [y, m, d] = datePart.split("-");
        return `${d}-${m}-${y}`;
      }
    },
    {
      key: "enteredDate",
      label: "Date Entered",
      sortable: true,
      render: (value: string) => {
        if (!value) return "";
        const datePart = value.split(" ")[0];
        const [y, m, d] = datePart.split("-");
        return `${d}-${m}-${y}`;
      }
    }
  ];

  return (
    <Container fluid className="px-0">
      <Card className="shadow-sm">
        <Card.Body>
          <div
            style={{
              overflowX: "auto",
              position: "relative"
            }}
          >
            <ReportTable
              data={displayedData}
              columns={columns}
              onSort={handleSort}
              onRowClick={handleRowClick}
              responsive={false}
              emptyMessage={
                loading
                  ? "Loading approved patients..."
                  : fetchingDetails
                  ? "Loading patient details..."
                  : searchTerm
                  ? "No records match your search criteria."
                  : "No verified patients available for printing."
              }
            />
          </div>

          <div
            style={{
              padding: "0.5rem 1rem",
              borderTop: "2px solid #e0e0e0",
              background: "linear-gradient(to right, #f8f9fa, #ffffff)",
              textAlign: "start",
              marginTop: "1rem"
            }}
          >
            <Row className="align-items-center">
              <Col md={12}>
                <small className="text-muted" style={{ fontWeight: 500 }}>
                  Total Verified Patients: <strong>{displayedData.length}</strong>
                  {searchTerm && <span className="ms-2">(Filtered)</span>}
                </small>
              </Col>
            </Row>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PrintTab;