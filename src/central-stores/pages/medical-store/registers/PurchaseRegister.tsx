import React, { useMemo, useRef, useState } from "react";
import { Button, Card, Col, Container, Form, Row, Spinner, Table } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useReactToPrint } from "react-to-print";
import {
  CentralStoresApiService,
  GoodsReceiptRegisterRecord,
} from "../../../../api/central-stores/central-stores-api-service";
import PrintHeaderReports from "../../../../components/PrintHeaderReports";
import ReportHeader from "../../../../medical-records/components/ReportHeader";
import {
  exportToExcel,
  formatReportDate,
  getDateRangeText,
} from "../../../../medical-records/utils/reportUtils";
import { RootState } from "../../../../state/store";
import { showErrorModal, showValidationError } from "../../../../utils/alertUtil";
import { handleError } from "../../../../utils/errorUtil";

type DateGroup = {
  date: string;
  records: GoodsReceiptRegisterRecord[];
};

type ReceiptTotals = {
  taxAmount: number;
  discountAmount: number;
  netAmount: number;
};

interface SessionStoreData {
  masterId?: number;
  subModName?: string;
}

const formatNumber = (value: number): string => {
  return Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const safeFormatDate = (value?: string, outputFormat: "DD-MM-YYYY" | "DD/MM/YYYY" = "DD-MM-YYYY"): string => {
  if (!value) {
    return "-";
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return "-";
  }

  if (/^\d{2}-\d{2}-\d{4}$/.test(trimmed)) {
    return outputFormat === "DD/MM/YYYY" ? trimmed.replace(/-/g, "/") : trimmed;
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
    return outputFormat === "DD-MM-YYYY" ? trimmed.replace(/\//g, "-") : trimmed;
  }

  // Preserve month-year style values like 03-2027 from API.
  if (/^\d{2}-\d{4}$/.test(trimmed) || /^\d{2}\/\d{4}$/.test(trimmed)) {
    return trimmed;
  }

  const parsedDate = new Date(trimmed);
  if (Number.isNaN(parsedDate.getTime())) {
    return trimmed;
  }

  return formatReportDate(trimmed, outputFormat);
};

const getRecordSearchText = (record: GoodsReceiptRegisterRecord): string => {
  const medicineText = (record.medicines || [])
    .map((medicine) => `${medicine.medicineName} ${medicine.batchNo}`)
    .join(" ");
  return `${record.grNo} ${record.supplierName} ${record.invoiceNo} ${record.supplierAddress} ${record.userName} ${medicineText}`.toLowerCase();
};

const groupByInvoiceDate = (records: GoodsReceiptRegisterRecord[]): DateGroup[] => {
  const grouped = new Map<string, GoodsReceiptRegisterRecord[]>();

  records.forEach((record) => {
    const key = record.invoiceDate || "Unknown Date";
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)?.push(record);
  });

  return Array.from(grouped.entries()).map(([date, groupedRecords]) => ({
    date,
    records: groupedRecords,
  }));
};

const calcReceiptTotals = (record: GoodsReceiptRegisterRecord): ReceiptTotals => {
  const medicines = Array.isArray(record.medicines) ? record.medicines : [];
  const taxAmount = medicines.reduce((sum, medicine) => sum + Number(medicine.gstAmt || 0), 0);
  const discountAmount = medicines.reduce((sum, medicine) => sum + Number(medicine.discount || 0), 0);
  const netAmount = Number(record.totalValue || 0);
  return {
    taxAmount,
    discountAmount,
    netAmount,
  };
};

const PurchaseRegister: React.FC = () => {
  const dispatch = useDispatch();
  const centralStoresApi = useMemo(() => new CentralStoresApiService(), []);
  const printRef = useRef<HTMLDivElement>(null);
  const organization = useSelector((state: RootState) => state.appReducer.organization);

  const today = new Date().toISOString().split("T")[0];

  const [fromDate, setFromDate] = useState<string>(today);
  const [toDate, setToDate] = useState<string>(today);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [records, setRecords] = useState<GoodsReceiptRegisterRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const selectedStoreData = useMemo<SessionStoreData | null>(() => {
    try {
      const selectedStoreRaw = sessionStorage.getItem("selectedStore");
      return selectedStoreRaw ? (JSON.parse(selectedStoreRaw) as SessionStoreData) : null;
    } catch {
      return null;
    }
  }, []);

  const masterId = Number(selectedStoreData?.masterId ?? 0);
  const selectedStoreName = selectedStoreData?.subModName || "Store";

  const processedRecords = useMemo(() => {
    if (!submitted) {
      return [] as GoodsReceiptRegisterRecord[];
    }

    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) {
      return records;
    }

    return records.filter((record) => getRecordSearchText(record).includes(normalizedSearch));
  }, [records, searchTerm, submitted]);

  const dateGroups = useMemo(() => groupByInvoiceDate(processedRecords), [processedRecords]);

  const totals = useMemo(() => {
    const uniqueReceipts = processedRecords.length;
    const lineCount = processedRecords.reduce(
      (sum, record) => sum + (Array.isArray(record.medicines) ? record.medicines.length : 0),
      0
    );
    const totalAmount = processedRecords.reduce((sum, record) => sum + Number(record.totalValue || 0), 0);
    return {
      uniqueReceipts,
      lineCount,
      totalAmount,
    };
  }, [processedRecords]);

  const printOrganization = useMemo(
    () => ({
      name: organization?.name || "",
      code: organization?.code || "",
      address: organization?.address || "",
      phone: organization?.phoneNo || "",
    }),
    [organization]
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!masterId) {
      showValidationError("Store context is missing. Please reselect the store.", "Validation");
      return;
    }

    if (!fromDate || !toDate) {
      showValidationError("Please select both From Date and To Date.", "Validation");
      return;
    }

    if (new Date(fromDate) > new Date(toDate)) {
      showValidationError("From Date cannot be later than To Date.", "Validation");
      return;
    }

    try {
      setLoading(true);
      const response = await centralStoresApi.fetchGoodsReceiptRegister(masterId, fromDate, toDate);
      setRecords(Array.isArray(response) ? response : []);
      setSubmitted(true);
    } catch (error) {
      handleError(dispatch, error);
      showErrorModal("Failed to load purchase register data. Please try again.", "Error");
      setRecords([]);
      setSubmitted(false);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFromDate(today);
    setToDate(today);
    setSearchTerm("");
    setRecords([]);
    setSubmitted(false);
  };

  const handleExport = () => {
    const exportRows: Record<string, string | number>[] = [];

    processedRecords.forEach((record) => {
      const medicines = Array.isArray(record.medicines) ? record.medicines : [];
      const { taxAmount, discountAmount, netAmount } = calcReceiptTotals(record);

      medicines.forEach((medicine, index) => {
        const isLast = index === medicines.length - 1;
        exportRows.push({
          "GRN No": record.grNo || "-",
          "Supplier Name": record.supplierName || "-",
          "Invoice No": record.invoiceNo || "-",
          "Invoice Date": safeFormatDate(record.invoiceDate, "DD/MM/YYYY"),
          "Medicine Name": medicine.medicineName || "-",
          "Batch No": medicine.batchNo || "-",
          "Expiry Date": safeFormatDate(medicine.expiryDate, "DD/MM/YYYY"),
          Qty: Number(medicine.totalUnits || 0),
          "Pur. Rate": Number(medicine.cost || 0),
          Amount: Number(medicine.totalAmt || 0),
          MRP: Number(medicine.mrp || 0),
          "Tax %": Number(medicine.gstPer || 0),
          "Tax Amount": isLast ? Number(taxAmount.toFixed(2)) : "",
          Discount: Number(medicine.discount || 0),
          "Add Amount": isLast ? 0 : "",
          "Less Amt": isLast ? 0 : "",
          "Net Amt": isLast ? Number(netAmount.toFixed(2)) : "",
          "Receipt Discount": isLast ? Number(discountAmount.toFixed(2)) : "",
        });
      });
    });

    exportToExcel(exportRows, `Purchase_Register_${selectedStoreName}_${fromDate}_to_${toDate}`);
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    pageStyle: `
      @page { margin: 1cm; }
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      body { font-family: 'Times New Roman', Times, serif; font-size: 10px; color: #000; }
      .prt-sheet { border: 1px solid #000 !important; padding: 8px; }
      .prt-table { width: 100%; border-collapse: collapse !important; border: 1px solid #000 !important; border-spacing: 0 !important; font-family: 'Times New Roman', Times, serif; font-size: 10px; }
      .prt-table thead,
      .prt-table tbody,
      .prt-table tr,
      .prt-table th,
      .prt-table td { border: 1px solid #000 !important; }
      .prt-table th,
      .prt-table td { padding: 1px 3px; vertical-align: top; line-height: 1.1; }
      .prt-table th { text-align: center; font-weight: bold; background: #f5f5f5 !important; }
      .prt-qty { text-align: right; }
      .prt-title { text-align: center; font-weight: bold; text-transform: uppercase; font-size: 13px; margin: 8px 0 10px; letter-spacing: 0.3px; }
      thead { display: table-header-group; }
      tbody { display: table-row-group; }
      tr { page-break-inside: auto; }
    `,
  });

  return (
    <Container fluid className="px-3 py-3">
      <ReportHeader
        title="Purchase Register"
        subtitle={submitted ? `${selectedStoreName} - ${getDateRangeText(fromDate, toDate)}` : "Select date range and click Submit"}
        onSearch={setSearchTerm}
        showSearch={submitted}
      />

      <Card className="shadow-sm">
        <Card.Header>
          <Form onSubmit={handleSubmit}>
            <Row className="g-3 align-items-end">
              <Col md={3}>
                <Form.Group controlId="fromDate">
                  <Form.Label>From Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={fromDate}
                    onChange={(event) => setFromDate(event.target.value)}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group controlId="toDate">
                  <Form.Label>To Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={toDate}
                    onChange={(event) => setToDate(event.target.value)}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={3} className="d-flex gap-2">
                <Button
                  type="button"
                  className="flex-fill theme-outline-btn-primary"
                  onClick={handlePrint}
                  disabled={loading || processedRecords.length === 0}
                >
                  Print
                </Button>
                <Button type="submit" variant="primary" className="flex-fill" disabled={loading}>
                  {loading ? "Loading..." : "Submit"}
                </Button>
                <Button type="button" variant="secondary" className="flex-fill" onClick={handleReset}>
                  Reset
                </Button>
              </Col>

              <Col md={3} className="text-md-end text-secondary">
                Records: {processedRecords.length}
              </Col>
            </Row>
          </Form>
        </Card.Header>

        <Card.Body className="p-0">
          <div style={{ display: 'none' }}>
            <div ref={printRef} className="prt-sheet">
              <PrintHeaderReports organization={printOrganization} />
              <div className="prt-title">
                {`PURCHASE REGISTER — ${getDateRangeText(fromDate, toDate).toUpperCase()}`}
              </div>
              <table className="prt-table">
                <thead>
                  <tr>
                    <th>GRN No</th>
                    <th>Supplier Name</th>
                    <th>Invoice No</th>
                    <th>Invoice Date</th>
                    <th colSpan={10}></th>
                  </tr>
                  <tr>
                    <th></th>
                    <th>Medicine Name</th>
                    <th>Batch No</th>
                    <th>Expiry Date</th>
                    <th>Qty</th>
                    <th>Pur. Rate</th>
                    <th>Amount</th>
                    <th>MRP</th>
                    <th>Tax %</th>
                    <th>Tax Amount</th>
                    <th>Discount</th>
                    <th>Add Amount</th>
                    <th>Less Amt</th>
                    <th>Net Amt</th>
                  </tr>
                </thead>
                <tbody>
                  {dateGroups.map((group) => (
                    <React.Fragment key={`prt-date-${group.date}`}>
                      <tr>
                        <td colSpan={14} style={{ fontWeight: 'bold', background: '#e9ecef' }}>DATE : {safeFormatDate(group.date, "DD-MM-YYYY")}</td>
                      </tr>
                      {group.records.map((record) => {
                        const medicines = Array.isArray(record.medicines) ? record.medicines : [];
                        const { taxAmount, netAmount } = calcReceiptTotals(record);
                        return (
                          <React.Fragment key={`prt-${record.grNo}-${record.invoiceNo}`}>
                            <tr style={{ fontWeight: 'bold', background: '#f8f9fa' }}>
                              <td className="text-nowrap">{record.grNo || '-'}</td>
                              <td>{record.supplierName || '-'}</td>
                              <td>{record.invoiceNo || '-'}</td>
                              <td>{safeFormatDate(record.invoiceDate, "DD-MM-YYYY")}</td>
                              <td colSpan={10}></td>
                            </tr>
                            {medicines.length === 0 ? (
                              <tr>
                                <td></td>
                                <td colSpan={13} style={{ textAlign: 'center' }}>No item details available</td>
                              </tr>
                            ) : (
                              medicines.map((medicine, index) => {
                                const isLast = index === medicines.length - 1;
                                return (
                                  <tr key={`prt-${record.grNo}-${medicine.batchNo}-${index}`}>
                                    <td></td>
                                    <td>{medicine.medicineName || '-'}</td>
                                    <td>{medicine.batchNo || '-'}</td>
                                    <td className="text-nowrap">{safeFormatDate(medicine.expiryDate, "DD-MM-YYYY")}</td>
                                    <td className="prt-qty">{Number(medicine.totalUnits || 0)}</td>
                                    <td className="prt-qty">{formatNumber(Number(medicine.cost || 0))}</td>
                                    <td className="prt-qty">{formatNumber(Number(medicine.totalAmt || 0))}</td>
                                    <td className="prt-qty">{formatNumber(Number(medicine.mrp || 0))}</td>
                                    <td className="prt-qty">{formatNumber(Number(medicine.gstPer || 0))}</td>
                                    <td className="prt-qty">{isLast ? formatNumber(taxAmount) : ''}</td>
                                    <td className="prt-qty">{formatNumber(Number(medicine.discount || 0))}</td>
                                    <td className="prt-qty">{isLast ? formatNumber(0) : ''}</td>
                                    <td className="prt-qty">{isLast ? formatNumber(0) : ''}</td>
                                    <td className="prt-qty" style={{ fontWeight: 'bold' }}>{isLast ? formatNumber(netAmount) : ''}</td>
                                  </tr>
                                );
                              })
                            )}
                          </React.Fragment>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="purchase-register-table-wrap" style={{ maxHeight: "calc(100vh - 320px)", overflow: "auto" }}>
              <Table bordered hover responsive className="mb-0">
              <thead style={{ position: "sticky", top: 0, zIndex: 2 }}>
                <tr>
                  <th style={{ backgroundColor: "var(--table-header-bg)", color: "var(--table-header-text)" }}>GRN No</th>
                  <th style={{ backgroundColor: "var(--table-header-bg)", color: "var(--table-header-text)" }}>Supplier Name</th>
                  <th style={{ backgroundColor: "var(--table-header-bg)", color: "var(--table-header-text)" }}>Invoice No</th>
                  <th style={{ backgroundColor: "var(--table-header-bg)", color: "var(--table-header-text)" }}>Invoice Date</th>
                  <th colSpan={10} style={{ backgroundColor: "var(--table-header-bg)", color: "var(--table-header-text)" }}></th>
                </tr>
                <tr>
                  <th style={{ backgroundColor: "var(--table-header-bg)", color: "var(--table-header-text)" }}></th>
                  <th style={{ backgroundColor: "var(--table-header-bg)", color: "var(--table-header-text)" }}>Medicine Name</th>
                  <th style={{ backgroundColor: "var(--table-header-bg)", color: "var(--table-header-text)" }}>Batch No</th>
                  <th style={{ backgroundColor: "var(--table-header-bg)", color: "var(--table-header-text)" }}>Expiry Date</th>
                  <th className="text-end" style={{ backgroundColor: "var(--table-header-bg)", color: "var(--table-header-text)" }}>Qty</th>
                  <th className="text-end" style={{ backgroundColor: "var(--table-header-bg)", color: "var(--table-header-text)" }}>Pur. Rate</th>
                  <th className="text-end" style={{ backgroundColor: "var(--table-header-bg)", color: "var(--table-header-text)" }}>Amount</th>
                  <th className="text-end" style={{ backgroundColor: "var(--table-header-bg)", color: "var(--table-header-text)" }}>MRP</th>
                  <th className="text-end" style={{ backgroundColor: "var(--table-header-bg)", color: "var(--table-header-text)" }}>Tax %</th>
                  <th className="text-end" style={{ backgroundColor: "var(--table-header-bg)", color: "var(--table-header-text)" }}>Tax Amount</th>
                  <th className="text-end" style={{ backgroundColor: "var(--table-header-bg)", color: "var(--table-header-text)" }}>Discount</th>
                  <th className="text-end" style={{ backgroundColor: "var(--table-header-bg)", color: "var(--table-header-text)" }}>Add Amount</th>
                  <th className="text-end" style={{ backgroundColor: "var(--table-header-bg)", color: "var(--table-header-text)" }}>Less Amt</th>
                  <th className="text-end" style={{ backgroundColor: "var(--table-header-bg)", color: "var(--table-header-text)" }}>Net Amt</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={14} className="text-center py-4">
                      <Spinner animation="border" role="status" size="sm" className="me-2" />
                      Loading register data...
                    </td>
                  </tr>
                ) : processedRecords.length === 0 ? (
                  <tr>
                    <td colSpan={14} className="text-center py-4 text-muted">
                      {submitted
                        ? "No records found for the selected criteria."
                        : "No data loaded. Please choose filters and submit."}
                    </td>
                  </tr>
                ) : (
                  dateGroups.map((group) => (
                    <React.Fragment key={group.date}>
                      <tr>
                        <td colSpan={14} className="fw-bold" style={{ backgroundColor: "var(--page-header-bg)", color: "var(--page-header-text)" }}>
                          DATE : {safeFormatDate(group.date, "DD-MM-YYYY")}
                        </td>
                      </tr>

                      {group.records.map((record) => {
                        const medicines = Array.isArray(record.medicines) ? record.medicines : [];
                        const { taxAmount, discountAmount, netAmount } = calcReceiptTotals(record);

                        return (
                          <React.Fragment key={`${record.grNo}-${record.invoiceNo}`}>
                            <tr style={{ backgroundColor: "var(--table-row-alt-bg)" }}>
                              <td className="fw-bold">{record.grNo || "-"}</td>
                              <td className="fw-bold">{record.supplierName || "-"}</td>
                              <td className="fw-bold">{record.invoiceNo || "-"}</td>
                              <td className="fw-bold">{safeFormatDate(record.invoiceDate, "DD-MM-YYYY")}</td>
                              <td colSpan={10}></td>
                            </tr>

                            {medicines.length === 0 ? (
                              <tr>
                                <td></td>
                                <td colSpan={13} className="text-muted">No item details available</td>
                              </tr>
                            ) : (
                              medicines.map((medicine, index) => {
                                const isLast = index === medicines.length - 1;
                                return (
                                  <tr key={`${record.grNo}-${medicine.batchNo}-${index}`}>
                                    <td></td>
                                    <td>{medicine.medicineName || "-"}</td>
                                    <td>{medicine.batchNo || "-"}</td>
                                    <td>{safeFormatDate(medicine.expiryDate, "DD-MM-YYYY")}</td>
                                    <td className="text-end">{Number(medicine.totalUnits || 0)}</td>
                                    <td className="text-end">{formatNumber(Number(medicine.cost || 0))}</td>
                                    <td className="text-end">{formatNumber(Number(medicine.totalAmt || 0))}</td>
                                    <td className="text-end">{formatNumber(Number(medicine.mrp || 0))}</td>
                                    <td className="text-end">{formatNumber(Number(medicine.gstPer || 0))}</td>
                                    <td className="text-end">{isLast ? formatNumber(taxAmount) : ""}</td>
                                    <td className="text-end">{formatNumber(Number(medicine.discount || 0))}</td>
                                    <td className="text-end">{isLast ? formatNumber(0) : ""}</td>
                                    <td className="text-end">{isLast ? formatNumber(0) : ""}</td>
                                    <td className="text-end fw-bold">{isLast ? formatNumber(netAmount) : ""}</td>
                                  </tr>
                                );
                              })
                            )}
                          </React.Fragment>
                        );
                      })}
                    </React.Fragment>
                  ))
                )}
              </tbody>
              </Table>
            </div>
        </Card.Body>

        <Card.Footer className="d-flex justify-content-between align-items-center">
          <div className="text-muted">
            Total Receipts: <strong>{totals.uniqueReceipts}</strong>
            <span className="ms-3">Total Lines: <strong>{totals.lineCount}</strong></span>
          </div>
          <div>
            Net Amount: <strong>{formatNumber(totals.totalAmount)}</strong>
          </div>
        </Card.Footer>
      </Card>
    </Container>
  );
};

export default PurchaseRegister;
