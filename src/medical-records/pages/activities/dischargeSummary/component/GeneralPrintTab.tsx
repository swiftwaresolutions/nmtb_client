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
  age: string | number;
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
  enteredUser?: string;
  enteredDate?: string;
  approvedUser?: string;
  approvedDate?: string;
  approvedAt?: string;
  summaryId?: number;
}

interface GeneralPrintTabProps {
  onPatientSelect?: (patient: any) => void;
  onEditPatient?: (patient: any) => void;
  fromDate: string;
  toDate: string;
}

const GeneralPrintTab: React.FC<GeneralPrintTabProps> = ({ onPatientSelect, onEditPatient, fromDate, toDate }) => {
  const apiService = new MedicalRecordsApiService();
  const [loading, setLoading] = useState<boolean>(false);
  const [patientsData, setPatientsData] = useState<PrintPatientData[]>([]);
  const [displayedData, setDisplayedData] = useState<PrintPatientData[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortKey, setSortKey] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [printingPatientId, setPrintingPatientId] = useState<number | null>(null);
  const [fetchingDetails, setFetchingDetails] = useState<boolean>(false);

  //const isObstetricsDepartment = (departmentName: string) =>
    //departmentName.toLowerCase().includes("obstet");

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
      const response = await apiService.fetchIpPatientsForSummaryPrint(fromDate, toDate);
      const apiData = response?.data || response || [];

      const verifiedFromApi: PrintPatientData[] = Array.isArray(apiData)
        ? apiData
            .filter(
              (patient: any) =>
                patient.dischargeSummaryExists === 1 &&
                patient.dischargeSummaryVerified === 1 
                //&& !isObstetricsDepartment(patient.departmentName || "")
            )
            .map((patient: any) => ({
              slNo: 0,
              patientName: patient.patientName || "",
              status: "Verified",
              opNo: patient.opNo || "",
              ipNo: patient.ipNo || "",
              age: patient.age || 0,
              sex: patient.gender || patient.sex || "",
              department: patient.departmentName || patient.department || "",
              ward: patient.admittedWard || patient.ward || "",
              doctor: patient.admittedDoctorName || patient.doctor || "",
              doa: patient.admitDate || patient.doa || "",
              phone: patient.mobileNumber || patient.phone || "",
              address: patient.address || "",
              guardianName: patient.guardianName || patient.gname || patient.gName || "",
              guardianType: patient.guardianType || patient.gType || patient.relation || "",
              patId: patient.patId || 0,
              visitId: patient.opVisitId || patient.visitId || 0,
              ipId: patient.ipId || 0,
              enteredUser: patient.summaryUser || "",
              enteredDate: patient.summaryDate || "",
              approvedUser: patient.summaryApprovedUser || "",
              approvedDate: patient.summaryApproveDateTime || "",
              summaryId: patient.summaryId || 0
            }))
        : [];

      // Keep previously approved local records for backward compatibility, while avoiding duplicates.
      const approvedList = JSON.parse(localStorage.getItem("generalApprovedList") || "[]");
      const localApproved: PrintPatientData[] = Array.isArray(approvedList)
        ? approvedList
            //.filter((patient: any) => !isObstetricsDepartment(patient.department || ""))
            .map((patient: any) => ({
              slNo: 0,
              patientName: patient.patientName || "",
              status: "Approved",
              opNo: patient.opNo || "",
              ipNo: patient.ipNo || "",
              age: patient.age || 0,
              sex: patient.sex || "",
              department: patient.department || "",
              ward: patient.ward || "",
              doctor: patient.doctor || "",
              doa: patient.doa || "",
              phone: patient.phone || "",
              address: patient.address || "",
              guardianName: patient.guardianName || "",
              guardianType: patient.guardianType || "",
              patId: patient.patId || 0,
              visitId: patient.visitId || 0,
              ipId: patient.ipId || 0,
              enteredUser: patient.enteredUser || "",
              enteredDate: patient.enteredDate || "",
              approvedUser: patient.approvedUser || "",
              approvedDate: patient.approvedDate || patient.approvedAt || "",
              approvedAt: patient.approvedAt || "",
              summaryId: patient.summaryId || 0
            }))
        : [];

      const mergedMap = new Map<string, PrintPatientData>();
      [...verifiedFromApi, ...localApproved].forEach((item) => {
        const key = `${item.patId || 0}-${item.ipId || 0}-${item.visitId || 0}`;
        if (!mergedMap.has(key)) {
          mergedMap.set(key, item);
        }
      });

      const printData = Array.from(mergedMap.values()).map((item, index) => ({
        ...item,
        slNo: index + 1
      }));

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

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const handleRowClick = async (record: PrintPatientData) => {
    if (!record.patId || !record.visitId || !record.ipId) {
      showErrorToast("Invalid patient data");
      return;
    }

    setFetchingDetails(true);
    try {
      const summaryData = await apiService.fetchPatientSummary(
        record.patId,
        record.visitId,
        record.ipId
      );

      const enhancedRecord = summaryData ? { ...record, summaryData } : record;
      if (onEditPatient) onEditPatient(enhancedRecord);
    } catch (error: any) {
      console.error("Error fetching discharge summary:", error);
      showErrorToast(
        error?.response?.data?.error || "Failed to fetch patient discharge summary"
      );
      if (onEditPatient) onEditPatient(record);
    } finally {
      setFetchingDetails(false);
    }
  };

  const handlePrint = async (patient: PrintPatientData) => {
    if (!patient.patId || !patient.visitId || !patient.ipId) {
      showErrorToast("Invalid patient data");
      return;
    }

    setPrintingPatientId(patient.patId);
    try {
      const summaryData = await apiService.fetchPatientSummary(
        patient.patId,
        patient.visitId,
        patient.ipId
      );

      if (summaryData) {
        const enhancedPatient = { ...patient, summaryData };
        if (onPatientSelect) onPatientSelect(enhancedPatient);
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
      key: "patId",
      label: "Action",
      sortable: false,
      render: (_value: any, row: PrintPatientData) => (
        <Button
          size="sm"
          variant=""
          style={{ backgroundColor: 'var(--page-secondary-color)', color: 'var(--page-primary-color)', border: 'none' }}
          disabled={printingPatientId === row.patId}
          onClick={(e) => {
            e.stopPropagation();
            handlePrint(row);
          }}
        >
          {printingPatientId === row.patId ? "Loading..." : "Print"}
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
                  : "No approved patients available for printing."
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
                  Total Approved Patients: <strong>{displayedData.length}</strong>
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

export default GeneralPrintTab;
