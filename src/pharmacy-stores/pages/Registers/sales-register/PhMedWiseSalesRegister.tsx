import React, { useState } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Col,
  Spinner,
} from "react-bootstrap";
import ReportHeader from "../../../../medical-records/components/ReportHeader";
import ReportTable from "../../../../medical-records/components/ReportTable";
import SearchableSelect from "../../../../components/SearchableSelect";
import {
  searchTableData,
  sortTableData,
  exportToExcel,
  printReport,
  formatReportDate,
  getDateRangeText,
} from "../../../../medical-records/utils/reportUtils";
import "../../../../medical-records/styles/reportStyles.css";
import { showValidationError, showErrorToast } from "../../../../utils/alertUtil";
import {
  PharmacyStoresApiService,
  MedWiseSalesDetailsResponse,
} from "../../../../api/pharmacy-stores/pharmacy-stores-api-service";
import CentralStoresApiService, {
  ProductsByNameForPOResponse,
} from "../../../../api/central-stores/central-stores-api-service";

interface MedWiseRow {
  finalBillId: number;
  billNo: string;
  billDateTime: string;
  opNo: string;
  patientName: string;
  sex: string;
  username: string;
  batchNo: string;
  expiryDate: string;
  units: number;
}

interface PharmacySessionStoreData {
  masterId?: number;
}

const pharmacyApiService = new PharmacyStoresApiService();
const centralStoresApiService = new CentralStoresApiService();

const resolvePharmacyStoreId = (): number | null => {
  try {
    const pharmacyData = sessionStorage.getItem("pharmacySubModuleData");
    if (pharmacyData) {
      const parsed = JSON.parse(pharmacyData) as PharmacySessionStoreData;
      if (typeof parsed.masterId === "number" && parsed.masterId > 0) {
        return parsed.masterId;
      }
    }
  } catch {
    // ignore session parse errors
  }
  return null;
};

const formatDateTimeDisplay = (value: string): string => {
  if (!value) return "-";

  const dateObj = new Date(value);
  if (Number.isNaN(dateObj.getTime())) {
    return value;
  }

  const datePart = formatReportDate(dateObj, "DD/MM/YYYY");
  const timePart = dateObj.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  return `${datePart} ${timePart}`;
};

const TABLE_COLUMNS = [
  {
    key: "slNo",
    label: "S. No",
    sortable: false,
    render: (_: any, __: any, idx: number) => idx + 1,
  },
  { key: "billNo", label: "Bill No", sortable: true },
  {
    key: "billDateTime",
    label: "Bill Date",
    sortable: true,
    render: (value: any) => formatDateTimeDisplay(value),
  },
  { key: "opNo", label: "Op Number", sortable: true },
  { key: "patientName", label: "Patient Name", sortable: true },
  { key: "sex", label: "Gender", sortable: true },
  { key: "batchNo", label: "Batch Number", sortable: true },
  { key: "expiryDate", label: "Expiry Date", sortable: true },
  { key: "units", label: "Units", sortable: true },
  {
    key: "username",
    label: "User Name",
    sortable: true,
    render: (value: any) => (
      <span
        style={{
          textTransform: "uppercase",
          fontWeight: "var(--font-weight-bold)",
          color: "var(--page-secondary-color)",
        }}
      >
        {String(value ?? "-")}
      </span>
    ),
  },
];

export default function PhMedWiseSalesRegister() {
  const today = new Date().toISOString().split("T")[0];

  const [fromDate, setFromDate] = useState<string>(today);
  const [toDate, setToDate] = useState<string>(today);
  const [allRecords, setAllRecords] = useState<MedWiseRow[]>([]);
  const [displayedData, setDisplayedData] = useState<MedWiseRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortKey, setSortKey] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const [medicineSearchText, setMedicineSearchText] = useState<string>("");
  const [selectedMedicineId, setSelectedMedicineId] = useState<string>("");
  const [medicineOptions, setMedicineOptions] = useState<ProductsByNameForPOResponse[]>([]);
  const [loadingMedicines, setLoadingMedicines] = useState<boolean>(false);

  const [selectedMedicineName, setSelectedMedicineName] = useState<string>("");

  React.useEffect(() => {
    let result = [...allRecords];
    if (searchTerm) {
      result = searchTableData(result, searchTerm, [
        "billNo",
        "opNo",
        "patientName",
        "sex",
        "username",
        "batchNo",
        "expiryDate",
      ]);
    }
    if (sortKey) {
      result = sortTableData(result, sortKey as keyof MedWiseRow, sortDirection);
    }
    setDisplayedData(result);
  }, [searchTerm, sortKey, sortDirection, allRecords]);

  React.useEffect(() => {
    const trimmed = medicineSearchText.trim();

    if (trimmed.length < 2) {
      setMedicineOptions([]);
      setLoadingMedicines(false);
      return;
    }

    const storeId = resolvePharmacyStoreId();
    if (!storeId) {
      setMedicineOptions([]);
      setLoadingMedicines(false);
      return;
    }

    let isActive = true;
    setLoadingMedicines(true);

    const timer = setTimeout(() => {
      centralStoresApiService
        .fetchProductsByNameForPO(2, trimmed)
        .then((products) => {
          if (isActive) {
            setMedicineOptions(Array.isArray(products) ? products : []);
          }
        })
        .catch(() => {
          if (isActive) {
            setMedicineOptions([]);
          }
        })
        .finally(() => {
          if (isActive) {
            setLoadingMedicines(false);
          }
        });
    }, 250);

    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  }, [medicineSearchText]);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromDate || !toDate) {
      showValidationError("Please select both From Date and To Date.", "Validation");
      return;
    }
    if (fromDate > toDate) {
      showValidationError("From Date cannot be later than To Date.", "Validation");
      return;
    }
    if (!selectedMedicineId) {
      showValidationError("Please search and select a medicine name.", "Validation");
      return;
    }

    const storeId = resolvePharmacyStoreId();

    if (!storeId) {
      showValidationError("Pharmacy store context is missing. Please reselect the store.");
      return;
    }

    const selectedMedicine = medicineOptions.find(
      (m) => m.prodsId.toString() === selectedMedicineId
    );

    setLoading(true);
    setSubmitted(false);
    pharmacyApiService
      .fetchMedWiseSalesDetails(fromDate, toDate, storeId, Number(selectedMedicineId))
      .then((response: MedWiseSalesDetailsResponse[]) => {
        const mapped: MedWiseRow[] = response.map((item) => ({
          finalBillId: item.finalBillId,
          billNo: item.billNo,
          billDateTime: item.billDateTime,
          opNo: item.opNo,
          patientName: `${item.patientName} ${item.secondName ?? ""}`.trim(),
          sex: item.sex,
          username: item.username,
          batchNo: item.batchNo,
          expiryDate: item.expiryDate,
          units: item.units,
        }));

        setAllRecords(mapped);
        setDisplayedData(mapped);
        setSelectedMedicineName(selectedMedicine?.medicineName ?? "");
        setSubmitted(true);
      })
      .catch(() => {
        showErrorToast("Failed to fetch medicine-wise sales data. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleReset = () => {
    setFromDate(today);
    setToDate(today);
    setAllRecords([]);
    setDisplayedData([]);
    setSearchTerm("");
    setSortKey("");
    setSortDirection("asc");
    setSubmitted(false);
    setMedicineSearchText("");
    setSelectedMedicineId("");
    setMedicineOptions([]);
    setLoadingMedicines(false);
    setSelectedMedicineName("");
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const handleExport = () => {
    const exportData = displayedData.map((r, i) => ({
      "S. No": i + 1,
      "Bill No": r.billNo,
      "Bill Date": formatDateTimeDisplay(r.billDateTime),
      "Op Number": r.opNo,
      "Patient Name": r.patientName,
      "Gender": r.sex,
      "Batch Number": r.batchNo,
      "Expiry Date": r.expiryDate,
      "Units": r.units,
      "User Name": r.username,
    }));
    exportToExcel(
      exportData,
      `Sales_Medwise_Register_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
      "Sales MedWise Register"
    );
  };

  return (
    <React.Fragment>
      <Container fluid className="px-4 pt-3 pb-1">
        <ReportHeader
          title="MedWise Sales Register"
          subtitle={
            submitted
              ? getDateRangeText(fromDate, toDate)
              : "Select date range, medicine and click Submit"
          }
          onPrint={printReport}
          onExport={handleExport}
          onSearch={(term) => setSearchTerm(term)}
          showSearch={submitted}
          showSort={false}
          showPrint={submitted}
          showExport={submitted}
        />

        <Card className="mb-0 shadow-sm report-card" style={{ minHeight: "calc(100vh - 240px)" }}>
          <Card.Header className="no-print">
            <Form className="row g-3 align-items-end" onSubmit={handleFilterSubmit}>
              <Form.Group as={Col} md={3} controlId="fromDate">
                <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>
                  From Date
                </Form.Label>
                <Form.Control
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  max={today}
                  lang="en-CA"
                  required
                />
              </Form.Group>
              <Form.Group as={Col} md={3} controlId="toDate">
                <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>
                  To Date
                </Form.Label>
                <Form.Control
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  max={today}
                  lang="en-CA"
                  required
                />
              </Form.Group>
              <Form.Group as={Col} md={4} controlId="medicineName">
                <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>
                  Medicine Name
                </Form.Label>
                <SearchableSelect
                  id="medicineName"
                  value={selectedMedicineId}
                  onChange={(value) => setSelectedMedicineId(value)}
                  options={medicineOptions.map((product) => ({
                    value: product.prodsId,
                    label: product.medicineName,
                    isBlocked: Number(product.isActive) === 0,
                  }))}
                  placeholder={
                    loadingMedicines ? "Loading medicines..." : "Search medicine name"
                  }
                  onSearch={(term) => {
                    setMedicineSearchText(term);
                    if (!term.trim()) {
                      setSelectedMedicineId("");
                    }
                  }}
                  keepSearchOnBlur
                  searchValue={medicineSearchText}
                />
              </Form.Group>
              <Form.Group as={Col} md={2} className="d-flex align-items-end gap-2">
                <Button type="submit" variant="primary" className="w-50" disabled={loading}>
                  {loading ? "Loading..." : "Submit"}
                </Button>
                <Button type="button" variant="secondary" className="w-50" onClick={handleReset}>
                  Reset
                </Button>
              </Form.Group>
            </Form>
          </Card.Header>

          <Card.Body style={{ padding: "0.75rem", display: "flex", flexDirection: "column" }}>
            {submitted && selectedMedicineName && (
              <div className="mb-2 no-print">
                <span style={{ fontWeight: "var(--font-weight-semibold)", fontSize: "var(--font-size-sm)" }}>
                  Medicine:&nbsp;
                </span>
                <span style={{ fontWeight: "var(--font-weight-bold)", color: "var(--page-secondary-color)" }}>
                  {selectedMedicineName}
                </span>
              </div>
            )}
            {loading ? (
              <div className="text-center py-5 text-muted">
                <Spinner animation="border" role="status" />
                <div className="mt-3">Loading medicine-wise sales register...</div>
              </div>
            ) : (
              <div
                style={{
                  height: "100%",
                  minHeight: "280px",
                  overflowY: "auto",
                  overflowX: "auto",
                  position: "relative",
                }}
              >
                <ReportTable
                  data={displayedData}
                  columns={TABLE_COLUMNS}
                  onSort={handleSort}
                  responsive={false}
                  emptyMessage={
                    !submitted
                      ? "No data loaded. Please select date range, medicine and click Submit."
                      : searchTerm
                      ? "No records match your search criteria."
                      : "No records found."
                  }
                  tfoot={
                    displayedData.length > 0 ? (
                      <tr style={{ fontWeight: "var(--font-weight-bold)", backgroundColor: "#e9ecef" }}>
                        <td colSpan={8} className="text-end" style={{ fontWeight: "var(--font-weight-semibold)" }}>
                          Total Quantity
                        </td>
                        <td style={{ fontWeight: "var(--font-weight-bold)" }}>
                          {displayedData.reduce((sum, r) => sum + Number(r.units ?? 0), 0)}
                        </td>
                        <td />
                      </tr>
                    ) : undefined
                  }
                />
              </div>
            )}
          </Card.Body>

          <Card.Footer>
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
              <small className="text-muted" style={{ fontWeight: "var(--font-weight-medium)" }}>
                Total Data Rows: <strong>{displayedData.length}</strong>
                {searchTerm && (
                  <span className="ms-2">(Filtered from {allRecords.length})</span>
                )}
              </small>
            </div>
          </Card.Footer>
        </Card>
      </Container>

    </React.Fragment>
  );
}