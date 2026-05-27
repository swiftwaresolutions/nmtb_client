import React, { useEffect, useState } from "react";
import { Container, Card, Row, Col, Button } from "react-bootstrap";
import { useSelector } from "react-redux";
import { showConfirmDialog, showErrorToast, showSuccessToast } from "../../../../../utils/alertUtil";
import ReportTable from "../../../../components/ReportTable";
import { searchTableData, sortTableData } from "../../../../utils/reportUtils";
import { MedicalRecordsApiService } from "../../../../../api/medical-records/medical-records-api-service";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPrint } from "@fortawesome/free-solid-svg-icons";
import { RootState } from "../../../../../state/store";

interface VerificationPatientData {
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
  address?: string;
  guardianName?: string;
  guardianType?: string;
  patId?: number;
  visitId?: number;
  ipId?: number;
  verificationStatus?: string;
  summaryUser?: string;
  summaryDate?: string;
  summaryData?: any;
}

interface VerificationTabProps {
  onPatientSelect?: (patient: VerificationPatientData) => void;
  onPrintPatient?: (patient: VerificationPatientData) => void;
  fromDate: string;
  toDate: string;
}

const VerificationTab: React.FC<VerificationTabProps> = ({ onPatientSelect, onPrintPatient, fromDate, toDate }) => {
  const apiService = new MedicalRecordsApiService();
  const loginData = useSelector((state: RootState) => state.loginData);
  const [loading, setLoading] = useState<boolean>(false);
  const [patientsData, setPatientsData] = useState<VerificationPatientData[]>([]);
  const [displayedData, setDisplayedData] = useState<VerificationPatientData[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortKey, setSortKey] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [fetchingDetails, setFetchingDetails] = useState<boolean>(false);
  const [approvingPatientId, setApprovingPatientId] = useState<number | null>(null);
  const [printingPatientId, setPrintingPatientId] = useState<number | null>(null);

  const isObstetricsDepartment = (departmentName: string) =>
    departmentName.toLowerCase().includes("obstet");

  useEffect(() => {
    fetchVerificationPatients();
  }, [fromDate, toDate]);

  useEffect(() => {
    let result = patientsData;

    if (searchTerm) {
      result = searchTableData(result, searchTerm, [
        "patientName",
        "opNo",
        "ipNo",
        "department",
        "ward",
        "doctor",
        "phone"
      ]);
    }

    if (sortKey) {
      result = sortTableData(result, sortKey as keyof VerificationPatientData, sortDirection);
    }

    setDisplayedData(result);
  }, [patientsData, searchTerm, sortKey, sortDirection]);

  const fetchVerificationPatients = async () => {
    setLoading(true);
    try {
      const response = await apiService.fetchIpPatientsForSummaryMatVerify(fromDate, toDate);
      const data = response?.data || response || [];

      if (!data || data.length === 0) {
        setPatientsData([]);
        setLoading(false);
        return;
      }

      const filteredPatients = Array.isArray(data)
        ? data.filter(
            (patient: any) =>
              patient.maternityDisSummaryExists === 1 &&
              patient.maternityDisSummaryVerified !== 1 &&
              patient.departmentId === 8
          )
        : [];

      const verificationData: VerificationPatientData[] = filteredPatients.map((patient: any, index: number) => ({
        slNo: index + 1,
        patientName: patient.patientName || "",
        status: "Pending Verification",
        opNo: patient.opNo || "",
        ipNo: patient.ipNo || "",
        age: patient.age || 0,
        sex: patient.gender || patient.sex || "",
        address: patient.address || "",
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
        verificationStatus: "Pending",
        summaryUser: patient.maternityUser || "",
        summaryDate: patient.maternityDate || ""
      }));

      setPatientsData(verificationData);
    } catch (error: any) {
      console.error("Error fetching verification patients:", error);
      showErrorToast(
        error?.response?.data?.error || "Failed to fetch verification patient data"
      );
      setPatientsData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const handleRowClick = async (record: VerificationPatientData) => {
    if (!record.patId || !record.visitId || !record.ipId) {
      showErrorToast("Invalid patient data");
      return;
    }

    setFetchingDetails(true);
    try {
      // Fetch the maternity discharge summary data
      const summaryData = await apiService.fetchMaternityDischargeSummary(
        record.patId,
        record.visitId,
        record.ipId
      );

      if (summaryData) {
        // Attach the fetched summary data to the record
        const enhancedRecord = {
          ...record,
          summaryData: summaryData
        };
        
        if (onPatientSelect) {
          onPatientSelect(enhancedRecord);
        }
        showSuccessToast("Patient details loaded successfully");
      } else {
        showErrorToast("No discharge summary found for this patient");
        if (onPatientSelect) {
          onPatientSelect(record);
        }
      }
    } catch (error: any) {
      console.error("Error fetching maternity discharge summary:", error);
      showErrorToast(
        error?.response?.data?.error || "Failed to fetch patient discharge summary"
      );
      // Still allow navigation even if fetch fails
      if (onPatientSelect) {
        onPatientSelect(record);
      }
    } finally {
      setFetchingDetails(false);
    }
  };

  const handleApprove = async (record: VerificationPatientData) => {
    if (!record.patId || !record.visitId || !record.ipId) {
      showErrorToast("Invalid patient data");
      return;
    }

    const confirmation = await showConfirmDialog(
      "Do you want to continue? You can't edit again after approval.",
      "Confirm Approval",
      "Yes, Approve",
      "Cancel"
    );

    if (!confirmation.isConfirmed) {
      return;
    }

    setApprovingPatientId(record.patId);
    try {
      const summaryData = await apiService.fetchMaternityDischargeSummary(
        record.patId,
        record.visitId,
        record.ipId
      );

      if (!summaryData || !summaryData.id) {
        showErrorToast("Unable to find discharge summary for this patient");
        return;
      }

      await apiService.approveMaternityDischargeSummary({
        summaryId: summaryData.id,
        visitId: record.visitId,
        approveUid: loginData.id || 0
      });

      showSuccessToast("Discharge summary approved successfully!");
      fetchVerificationPatients();
    } catch (error: any) {
      console.error("Error approving discharge summary:", error);
      showErrorToast(
        error?.response?.data?.error || "Failed to approve discharge summary"
      );
    } finally {
      setApprovingPatientId(null);
    }
  };

  const handlePrintClick = async (record: VerificationPatientData) => {
    if (!record.patId || !record.visitId || !record.ipId) {
      showErrorToast("Invalid patient data");
      return;
    }

    setPrintingPatientId(record.patId);
    try {
      const summaryData = await apiService.fetchMaternityDischargeSummary(
        record.patId,
        record.visitId,
        record.ipId
      );

      const enhancedRecord = { ...record, summaryData: summaryData || null };
      if (onPrintPatient) {
        onPrintPatient(enhancedRecord);
      }
    } catch (error: any) {
      console.error("Error fetching summary for rough copy print:", error);
      showErrorToast(
        error?.response?.data?.error || "Failed to fetch patient discharge summary"
      );
    } finally {
      setPrintingPatientId(null);
    }
  };

  const columns = [
    {
      key: "patId",
      label: "Action",
      sortable: false,
      render: (_value: any, row: VerificationPatientData) => (
        <div className="d-flex gap-2">
          <Button
            size="sm"
            variant="success"
            disabled={approvingPatientId === row.patId || printingPatientId === row.patId}
            onClick={(e) => {
              e.stopPropagation();
              handleApprove(row);
            }}
          >
            {approvingPatientId === row.patId ? "Approving..." : "Approve"}
          </Button>
          <Button
            size="sm"
            variant=""
            disabled={approvingPatientId === row.patId || printingPatientId === row.patId}
            title="Print Rough Copy"
            style={{ backgroundColor: 'var(--page-secondary-color)', color: 'var(--page-primary-color)', border: 'none' }}
            onClick={(e) => {
              e.stopPropagation();
              handlePrintClick(row);
            }}
          >
            {printingPatientId === row.patId ? (
              "Loading..."
            ) : (
              <><FontAwesomeIcon icon={faPrint} className="me-1" />Print</>
            )}
          </Button>
        </div>
      )
    },
    { key: "slNo", label: "S. No", sortable: false, render: (value: number) => value },
    { key: "patientName", label: "Patient Name", sortable: true },
    { key: "opNo", label: "OP No", sortable: true },
    { key: "ipNo", label: "IP No", sortable: true },
    { key: "summaryUser", label: "Summary User", sortable: true },
    {
      key: "summaryDate",
      label: "Summary Date",
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
                  ? "Loading verification data..."
                  : fetchingDetails
                  ? "Loading patient details..."
                  : searchTerm
                  ? "No records match your search criteria."
                  : "No patients pending verification."
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
                  Total Patients Pending Verification: <strong>{displayedData.length}</strong>
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

export default VerificationTab;
