import React, { useEffect, useState } from "react";
import { Container, Card, Row, Col, Badge, Button } from "react-bootstrap";
import { useSelector } from "react-redux";
import { showErrorToast, showSuccessToast } from "../../../../../utils/alertUtil";
import ReportTable from "../../../../components/ReportTable";
import { searchTableData, sortTableData } from "../../../../utils/reportUtils";
import { MedicalRecordsApiService } from "../../../../../api/medical-records/medical-records-api-service";
import { RootState } from "../../../../../state/store";

interface ApprovalPatientData {
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
  patId?: number;
  visitId?: number;
  ipId?: number;
  approvalStatus?: string;
  summaryData?: any;
  summaryId?: number;
}

interface GeneralApprovalTabProps {
  onPatientSelect?: (patient: ApprovalPatientData) => void;
}

const GeneralApprovalTab: React.FC<GeneralApprovalTabProps> = ({ onPatientSelect }) => {
  const apiService = new MedicalRecordsApiService();
  const loginData = useSelector((state: RootState) => state.loginData);
  const [loading, setLoading] = useState<boolean>(false);
  const [patientsData, setPatientsData] = useState<ApprovalPatientData[]>([]);
  const [displayedData, setDisplayedData] = useState<ApprovalPatientData[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortKey, setSortKey] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [approvingPatientId, setApprovingPatientId] = useState<number | null>(null);

  useEffect(() => {
    fetchApprovalPatients();
  }, []);

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
      result = sortTableData(result, sortKey as keyof ApprovalPatientData, sortDirection);
    }

    setDisplayedData(result);
  }, [patientsData, searchTerm, sortKey, sortDirection]);

  const fetchApprovalPatients = async () => {
    setLoading(true);
    try {
      const approvalList = JSON.parse(localStorage.getItem('generalApprovalList') || '[]');

      const approvalData: ApprovalPatientData[] = approvalList.map((patient: any, index: number) => ({
        slNo: index + 1,
        patientName: patient.patientName || '',
        status: 'Verified - Pending Approval',
        opNo: patient.opNo || '',
        ipNo: patient.ipNo || '',
        age: patient.age || 0,
        sex: patient.sex || '',
        department: patient.department || '',
        ward: patient.ward || '',
        doctor: patient.doctor || '',
        doa: patient.doa || '',
        phone: patient.phone || '',
        patId: patient.patId || 0,
        visitId: patient.visitId || 0,
        ipId: patient.ipId || 0,
        approvalStatus: patient.approvalStatus || 'Pending'
      }));

      setPatientsData(approvalData);
    } catch (error: any) {
      console.error("Error fetching approval patients:", error);
      showErrorToast(
        error?.response?.data?.error || "Failed to fetch approval patient data"
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

  const handleApprove = async (patient: ApprovalPatientData) => {
    if (!patient.patId || !patient.visitId || !patient.ipId) {
      showErrorToast("Invalid patient data");
      return;
    }

    setApprovingPatientId(patient.patId);
    try {
      const summaryData = await apiService.fetchPatientSummary(
        patient.patId,
        patient.visitId,
        patient.ipId
      );

      if (!summaryData || !summaryData.id) {
        showErrorToast("Unable to find discharge summary for this patient");
        return;
      }

      await apiService.approveDischargeSummary({
        summaryId: summaryData.id,
        visitId: patient.visitId,
        approveUid: loginData.id || 0
      });

      // Remove from approval list
      const approvalList = JSON.parse(localStorage.getItem('generalApprovalList') || '[]');
      const updatedApprovalList = approvalList.filter(
        (p: any) => !(p.patId === patient.patId && p.ipId === patient.ipId)
      );
      localStorage.setItem('generalApprovalList', JSON.stringify(updatedApprovalList));

      // Add to approved list
      const approvedList = JSON.parse(localStorage.getItem('generalApprovedList') || '[]');
      approvedList.push({
        ...patient,
        approvedAt: new Date().toISOString(),
        approvalStatus: 'Approved',
        summaryId: summaryData.id
      });
      localStorage.setItem('generalApprovedList', JSON.stringify(approvedList));

      showSuccessToast("Patient approved successfully!");
      fetchApprovalPatients();
    } catch (error: any) {
      console.error("Error approving patient:", error);
      showErrorToast(
        error?.response?.data?.error || "Failed to approve patient"
      );
    } finally {
      setApprovingPatientId(null);
    }
  };

  const renderStatusBadge = (status: string) => {
    const statusLower = (status || "").toLowerCase();
    const statusMap: { [key: string]: string } = {
      pending: "bg-warning text-dark",
      approved: "bg-success text-white",
      rejected: "bg-danger text-white"
    };
    const badgeClass = statusMap[statusLower] || "bg-secondary text-white";
    return (
      <Badge bg="" className={`${badgeClass} fw-semibold`}>
        {status}
      </Badge>
    );
  };

  const columns = [
    { key: "slNo", label: "S. No", sortable: false, render: (value: number) => value },
    { key: "patientName", label: "Patient Name", sortable: true },
    {
      key: "approvalStatus",
      label: "Approval Status",
      sortable: true,
      render: (value: string) => renderStatusBadge(value || "Pending")
    },
    { key: "opNo", label: "OP No", sortable: true },
    { key: "ipNo", label: "IP No", sortable: true },
    { key: "age", label: "Age", sortable: true },
    { key: "sex", label: "Sex", sortable: true },
    { key: "department", label: "Department", sortable: true },
    { key: "ward", label: "Ward", sortable: true },
    { key: "doctor", label: "Doctor", sortable: true },
    { key: "doa", label: "D.O.A", sortable: true },
    {
      key: "patId",
      label: "Action",
      sortable: false,
      render: (_value: any, row: ApprovalPatientData) => (
        <Button
          size="sm"
          variant="success"
          disabled={approvingPatientId === row.patId}
          onClick={(e) => {
            e.stopPropagation();
            handleApprove(row);
          }}
        >
          {approvingPatientId === row.patId ? "Approving..." : "Approve"}
        </Button>
      )
    }
  ];

  return (
    <Container fluid className="px-0">
      <Card className="shadow-sm">
        <Card.Body>
          <div
            style={{
              height: "calc(100vh - 420px)",
              overflowY: "auto",
              overflowX: "auto",
              position: "relative"
            }}
          >
            <ReportTable
              data={displayedData}
              columns={columns}
              onSort={handleSort}
              onRowClick={onPatientSelect ? (record) => onPatientSelect(record) : undefined}
              responsive={false}
              emptyMessage={
                loading
                  ? "Loading approval data..."
                  : searchTerm
                  ? "No records match your search criteria."
                  : "No patients pending approval."
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
                  Total Patients Pending Approval: <strong>{displayedData.length}</strong>
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

export default GeneralApprovalTab;
