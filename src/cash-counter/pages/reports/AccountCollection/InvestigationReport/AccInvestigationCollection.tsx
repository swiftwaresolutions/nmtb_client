import React, { useMemo, useRef, useState } from "react";
import { Container, Card, Form, Button, Row, Col, Table } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useReactToPrint } from "react-to-print";
import { RootState } from "../../../../../state/store";
import CashCounterApiService, {
  InvestigationReportRow,
  InvestigationReturnReportRow,
  InvestigationDueCollectReportRow,
} from "../../../../../api/cash-counter/cash-counter-api-service";
import { showErrorToast, showValidationError } from "../../../../../utils/alertUtil";
import PrintHeaderReports from "../../../../../components/PrintHeaderReports";
import ReportHeader from "../../../../../medical-records/components/ReportHeader";
import {
  exportToExcel,
  formatReportDate,
  getDateRangeText,
} from "../../../../../medical-records/utils/reportUtils";

const cashCounterApi = new CashCounterApiService();

const formatAmount = (value: number) => value.toFixed(2);

const getReturnAmount = (row: InvestigationReturnReportRow) => row.paid;

const includesSearchValue = (value: string | number | undefined, search: string) => {
  if (value == null) {
    return false;
  }

  return String(value).toLowerCase().includes(search);
};

const AccInvestigationCollection: React.FC = () => {
  const organization = useSelector((state: RootState) => state.appReducer.organization);
  const printRef = useRef<HTMLDivElement>(null);
  const today = new Date().toISOString().split("T")[0];

  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [investigationReportData, setInvestigationReportData] = useState<InvestigationReportRow[]>([]);
  const [investigationReturnData, setInvestigationReturnData] = useState<InvestigationReturnReportRow[]>([]);
  const [dueCollectionData, setDueCollectionData] = useState<InvestigationDueCollectReportRow[]>([]);

  const displayedInvestigationReportData = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) {
      return investigationReportData;
    }

    return investigationReportData.filter((row) => {
      const total = row.cashPaid + row.swpPaid;
      return (
        includesSearchValue(row.patientName, search) ||
        includesSearchValue(row.fullName, search) ||
        includesSearchValue(row.dateTime, search) ||
        includesSearchValue(row.displayNumber, search) ||
        includesSearchValue(row.billDisplay, search) ||
        includesSearchValue(row.cashPaid.toFixed(2), search) ||
        includesSearchValue(row.swpPaid.toFixed(2), search) ||
        includesSearchValue(total.toFixed(2), search)
      );
    });
  }, [investigationReportData, searchTerm]);

  const displayedInvestigationReturnData = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) {
      return investigationReturnData;
    }

    return investigationReturnData.filter((row) => {
      const amount = getReturnAmount(row);
      return (
        includesSearchValue(row.patientName, search) ||
        includesSearchValue(row.fullName, search) ||
        includesSearchValue(row.dateTime, search) ||
        includesSearchValue(row.displayNumber, search) ||
        includesSearchValue(row.billDisplay, search) ||
        includesSearchValue(amount.toFixed(2), search)
      );
    });
  }, [investigationReturnData, searchTerm]);

  const displayedDueCollectionData = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) {
      return dueCollectionData;
    }

    return dueCollectionData.filter((row) => {
      const total = row.cashPaid + row.swpPaid;
      return (
        includesSearchValue(row.patientName, search) ||
        includesSearchValue(row.fullName, search) ||
        includesSearchValue(row.dateTime, search) ||
        includesSearchValue(row.displayNumber, search) ||
        includesSearchValue(row.billDisplay, search) ||
        includesSearchValue(row.cashPaid.toFixed(2), search) ||
        includesSearchValue(row.swpPaid.toFixed(2), search) ||
        includesSearchValue(total.toFixed(2), search)
      );
    });
  }, [dueCollectionData, searchTerm]);

  const totalInvestigationCash = displayedInvestigationReportData.reduce(
    (sum, row) => sum + row.cashPaid,
    0
  );
  const totalInvestigationSwipe = displayedInvestigationReportData.reduce(
    (sum, row) => sum + row.swpPaid,
    0
  );
  const totalDueCash = displayedDueCollectionData.reduce((sum, row) => sum + row.cashPaid, 0);
  const totalDueSwipe = displayedDueCollectionData.reduce((sum, row) => sum + row.swpPaid, 0);
  const totalReturn = displayedInvestigationReturnData.reduce(
    (sum, row) => sum + getReturnAmount(row),
    0
  );
  const totalInvestigationCollection = totalInvestigationCash + totalInvestigationSwipe;
  const totalDueCollection = totalDueCash + totalDueSwipe;
  const totalCashCollection = totalInvestigationCash + totalDueCash;
  const totalSwipeCollection = totalInvestigationSwipe + totalDueSwipe;
  const totalQrCollection = 0;
  const netCollection = totalInvestigationCollection + totalDueCollection - totalReturn;
  const totalInvTotal = displayedInvestigationReportData.reduce((sum, row) => sum + row.total, 0);
  const totalInvDiscount = displayedInvestigationReportData.reduce((sum, row) => sum + row.totDisc, 0);
  const totalInvPayable = displayedInvestigationReportData.reduce((sum, row) => sum + row.pay, 0);
  const totalInvBalance = displayedInvestigationReportData.reduce((sum, row) => sum + row.balance, 0);
  const totalRetTotal = displayedInvestigationReturnData.reduce((sum, row) => sum + row.total, 0);
  const totalRetDiscount = displayedInvestigationReturnData.reduce((sum, row) => sum + row.totDisc, 0);
  const totalRetPayable = displayedInvestigationReturnData.reduce((sum, row) => sum + row.pay, 0);
  const totalRetBalance = displayedInvestigationReturnData.reduce((sum, row) => sum + row.balance, 0);
  const printNetCash = totalCashCollection;

  const printOrganization = useMemo(
    () => ({
      name: organization?.name || "",
      code: organization?.code || "",
      address: organization?.address || "",
      phone: organization?.phoneNo || "",
    }),
    [organization]
  );

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    pageStyle: `
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      body { font-family: 'Times New Roman', Times, serif; font-size: 9px; color: #000; }
      .acc-investigation-print-header { display: block !important; margin-bottom: 8px; }
      .acc-investigation-print-title { text-align: center; font-weight: 700; margin: 4px 0 2px; font-size: 11px; }
      .acc-investigation-print-subtitle { text-align: center; margin: 0 0 6px; font-size: 9px; }
      .acc-investigation-screen-only { display: block !important; }
      .acc-investigation-print-only { display: none !important; }
      .acc-investigation-print-summary { display: none !important; }
      table { width: 100%; border-collapse: collapse !important; }
      table, th, td { border: 1px solid #000 !important; }
      .acc-investigation-print-table th,
      .acc-investigation-print-table td {
        font-size: 9px !important;
        padding: 1px 3px !important;
        line-height: 1.05 !important;
      }
      .acc-investigation-print-table thead th {
        padding: 2px 3px !important;
      }
      .acc-investigation-print-summary table {
        width: auto !important;
        min-width: 280px;
        margin-left: auto !important;
        border-collapse: collapse !important;
      }
      .acc-investigation-print-summary td {
        border: 1px solid #000 !important;
        padding: 2px 8px !important;
        font-size: 9px !important;
        line-height: 1.15 !important;
      }
      .acc-investigation-print-summary .print-summary-label {
        font-weight: 600 !important;
      }
      thead { display: table-header-group; }
      tbody { display: table-row-group; }
      tr { page-break-inside: avoid; }
      @media print {
        .acc-investigation-screen-only { display: none !important; }
        .acc-investigation-print-only { display: block !important; }
        .acc-investigation-print-summary { display: block !important; margin-top: 10px; }
      }
    `,
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!fromDate || !toDate) {
      showValidationError("Please select both From Date and To Date.");
      return;
    }

    if (new Date(fromDate) > new Date(toDate)) {
      showValidationError("From Date cannot be greater than To Date.");
      return;
    }

    setLoading(true);
    try {
      const [investigationReportResponse, investigationReturnResponse, dueCollectionResponse] =
        await Promise.all([
          cashCounterApi.fetchInvestigationReport(fromDate, toDate),
          cashCounterApi.fetchInvestigationReturnReport(fromDate, toDate),
          cashCounterApi.fetchInvestigationDueCollectReport(fromDate, toDate),
        ]);

      setInvestigationReportData(investigationReportResponse);
      setInvestigationReturnData(investigationReturnResponse);
      setDueCollectionData(dueCollectionResponse);
      setSubmitted(true);
    } catch {
      setInvestigationReportData([]);
      setInvestigationReturnData([]);
      setDueCollectionData([]);
      setSubmitted(false);
      showErrorToast("Failed to fetch investigation report data.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFromDate(today);
    setToDate(today);
    setSearchTerm("");
    setInvestigationReportData([]);
    setInvestigationReturnData([]);
    setDueCollectionData([]);
    setSubmitted(false);
  };

  const handleExport = () => {
    const exportData = [
      ...displayedInvestigationReportData.map((row, index) => ({
        "Report Type": "Investigation Collection",
        "S.No": index + 1,
        "OP No": row.displayNumber,
        "Patient Name": row.patientName,
        Date: row.dateTime,
        User: row.fullName,
        "Bill Display": row.billDisplay,
        Total: formatAmount(row.total),
        Discount: formatAmount(row.totDisc),
        Pay: formatAmount(row.pay),
        Balance: formatAmount(row.balance),
        "Paid Cash": formatAmount(row.cashPaid),
        "Paid Swipe": formatAmount(row.swpPaid),
      })),
      ...displayedInvestigationReturnData.map((row, index) => ({
        "Report Type": "Investigation Return Collection",
        "S.No": index + 1,
        "OP No": row.displayNumber,
        "Patient Name": row.patientName,
        Date: row.dateTime,
        User: row.fullName,
        "Bill Display": row.billDisplay,
        Total: formatAmount(row.total),
        Discount: formatAmount(row.totDisc),
        Pay: formatAmount(row.pay),
        Balance: formatAmount(row.balance),
        Paid: formatAmount(getReturnAmount(row)),
      })),
      ...displayedDueCollectionData.map((row, index) => ({
        "Report Type": "Due Collections",
        "S.No": index + 1,
        "OP No": row.displayNumber,
        "Patient Name": row.patientName,
        Date: row.dateTime,
        User: row.fullName,
        "Bill Display": row.billDisplay,
        "Paid Cash": formatAmount(row.cashPaid),
        "Paid Swipe": formatAmount(row.swpPaid),
      })),
    ];

    exportToExcel(
      exportData,
      `Investigation_Report_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
      "Investigation Report"
    );
  };

  const renderInvestigationCollectionTable = () => (
    <div style={{ overflowX: "auto" }}>
      <Table striped bordered hover className="table-hims mb-0 acc-investigation-print-table acc-investigation-screen-only">
        <thead>
          <tr>
            <th rowSpan={2} style={{ width: "60px" }}>S. No</th>
            <th rowSpan={2}>OP No</th>
            <th rowSpan={2}>Patient Name</th>
            <th rowSpan={2}>Date</th>
            <th rowSpan={2}>User</th>
            <th rowSpan={2}>Bill Display</th>
            <th rowSpan={2}>Total</th>
            <th rowSpan={2}>Discount</th>
            <th rowSpan={2}>Pay</th>
            <th rowSpan={2}>Balance</th>
            <th colSpan={2} className="text-center">Paid</th>
          </tr>
          <tr>
            <th className="text-center">Cash</th>
            <th className="text-center">Swipe</th>
          </tr>
        </thead>
        <tbody>
          {displayedInvestigationReportData.length === 0 ? (
            <tr>
              <td colSpan={12} className="text-center text-muted py-4">
                No records found for the selected date range.
              </td>
            </tr>
          ) : (
            displayedInvestigationReportData.map((row, index) => (
              <tr key={`${row.id}-${index}`}>
                <td>{index + 1}</td>
                <td>{row.displayNumber}</td>
                <td>{row.patientName}</td>
                <td>{row.dateTime}</td>
                <td style={{ color: "var(--page-secondary-color)" }} className="fw-bold">{row.fullName}</td>
                <td>{row.billDisplay}</td>
                <td>{row.total}</td>
                <td>{row.totDisc}</td>
                <td>{row.pay}</td>
                <td>{row.balance}</td>
                <td
                  style={{
                    background: "var(--page-primary-color)",
                    color: "var(--page-secondary-color)",
                  }}
                  className="text-center fw-bold"
                >
                  {formatAmount(row.cashPaid)}
                </td>
                <td
                  style={{
                    background: "var(--page-primary-color)",
                    color: "var(--page-secondary-color)",
                  }}
                  className="text-center fw-bold"
                >
                  {formatAmount(row.swpPaid)}
                </td>
              </tr>
            ))
          )}
          <tr
            style={{
              fontWeight: "var(--font-weight-semibold)",
              background: "var(--color-table-header)",
            }}
          >
            <td colSpan={10} className="text-end">
              Total :
            </td>
            <td className="text-end">{formatAmount(totalInvestigationCash)}</td>
            <td className="text-end">{formatAmount(totalInvestigationSwipe)}</td>
          </tr>
        </tbody>
      </Table>
    </div>
  );

  const renderInvestigationReturnTable = () => (
    <div style={{ overflowX: "auto" }}>
      <Table striped bordered hover className="table-hims mb-0 acc-investigation-print-table acc-investigation-screen-only">
        <thead>
          <tr style={{ background: "var(--color-table-header)" }}>
            <th style={{ width: "60px" }}>S. No</th>
            <th>OP No</th>
            <th>Patient Name</th>
            <th>Date</th>
            <th>User</th>
            <th>Bill Display</th>
            <th>Total</th>
            <th>Discount</th>
            <th>Pay</th>
            <th>Balance</th>
            <th className="text-end">Paid</th>
          </tr>
        </thead>
        <tbody>
          {displayedInvestigationReturnData.length === 0 ? (
            <tr>
              <td colSpan={11} className="text-center text-muted py-4">
                No records found for the selected date range.
              </td>
            </tr>
          ) : (
            displayedInvestigationReturnData.map((row, index) => (
              <tr key={`${row.id}-${index}`}>
                <td>{index + 1}</td>
                <td>{row.displayNumber}</td>
                <td>{row.patientName}</td>
                <td>{row.dateTime}</td>
                <td style={{ color: "var(--page-secondary-color)" }} className="fw-bold">{row.fullName}</td>
                <td>{row.billDisplay}</td>
                <td>{row.total}</td>
                <td>{row.totDisc}</td>
                <td>{row.pay}</td>
                <td>{row.balance}</td>
                <td style={{ color: "var(--page-secondary-color)" }} className="text-end fw-bold">
                  {formatAmount(getReturnAmount(row))}
                </td>
              </tr>
            ))
          )}
          <tr
            style={{
              fontWeight: "var(--font-weight-semibold)",
              background: "var(--color-table-header)",
            }}
          >
            <td colSpan={10} className="text-end">
              Total :
            </td>
            <td className="text-end">{formatAmount(totalReturn)}</td>
          </tr>
        </tbody>
      </Table>
    </div>
  );

  const renderDueCollectionTable = () => (
    <div style={{ overflowX: "auto" }}>
      <Table striped bordered hover className="table-hims mb-0 acc-investigation-print-table acc-investigation-screen-only">
        <thead>
          <tr>
            <th rowSpan={2} style={{ width: "60px" }}>S. No</th>
            <th rowSpan={2}>OP No</th>
            <th rowSpan={2}>Patient Name</th>
            <th rowSpan={2}>Date</th>
            <th rowSpan={2}>User</th>
            <th rowSpan={2}>Bill Display</th>
            <th colSpan={2} className="text-center">Paid</th>
          </tr>
          <tr>
            <th className="text-center">Cash</th>
            <th className="text-center">Swipe</th>
          </tr>
        </thead>
        <tbody>
          {displayedDueCollectionData.length === 0 ? (
            <tr>
              <td colSpan={8} className="text-center text-muted py-4">
                No records found for the selected date range.
              </td>
            </tr>
          ) : (
            displayedDueCollectionData.map((row, index) => (
              <tr key={`${row.id}-${index}`}>
                <td>{index + 1}</td>
                <td>{row.displayNumber}</td>
                <td>{row.patientName}</td>
                <td>{row.dateTime}</td>
                <td style={{ color: "var(--page-secondary-color)" }} className="fw-bold">{row.fullName}</td>
                <td>{row.billDisplay}</td>
                <td
                  style={{
                    background: "var(--page-primary-color)",
                    color: "var(--page-secondary-color)",
                  }}
                  className="text-center fw-bold"
                >
                  {formatAmount(row.cashPaid)}
                </td>
                <td
                  style={{
                    background: "var(--page-primary-color)",
                    color: "var(--page-secondary-color)",
                  }}
                  className="text-center fw-bold"
                >
                  {formatAmount(row.swpPaid)}
                </td>
              </tr>
            ))
          )}
          <tr
            style={{
              fontWeight: "var(--font-weight-semibold)",
              background: "var(--color-table-header)",
            }}
          >
            <td colSpan={6} className="text-end">
              Total :
            </td>
            <td className="text-end">{formatAmount(totalDueCash)}</td>
            <td className="text-end">{formatAmount(totalDueSwipe)}</td>
          </tr>
        </tbody>
      </Table>
    </div>
  );

  const renderInvestigationCollectionPrintTable = () => (
    <div className="acc-investigation-print-only" style={{ display: "none", overflowX: "auto" }}>
      <Table bordered className="mb-0 acc-investigation-print-table">
        <thead>
          <tr>
            <th rowSpan={2}>Name</th>
            <th rowSpan={2}>OP No</th>
            <th rowSpan={2}>Bill No</th>
            <th rowSpan={2}>Date Time</th>
            <th rowSpan={2} className="text-end">Total</th>
            <th rowSpan={2} className="text-end">Discount</th>
            <th rowSpan={2} className="text-end">Payable</th>
            <th colSpan={2} className="text-center">Paid</th>
            <th rowSpan={2} className="text-end">Balance</th>
          </tr>
          <tr>
            <th className="text-center">Cash</th>
            <th className="text-center">Swipe</th>
          </tr>
        </thead>
        <tbody>
          {displayedInvestigationReportData.length === 0 ? (
            <tr>
              <td colSpan={10} className="text-center text-muted py-4">
                No records found for the selected date range.
              </td>
            </tr>
          ) : (
            displayedInvestigationReportData.map((row, index) => (
              <tr key={`print-inv-${row.id}-${index}`}>
                <td>{row.patientName}</td>
                <td>{row.displayNumber}</td>
                <td>{row.billDisplay}</td>
                <td>{row.dateTime}</td>
                <td className="text-end">{formatAmount(row.total)}</td>
                <td className="text-end">{formatAmount(row.totDisc)}</td>
                <td className="text-end">{formatAmount(row.pay)}</td>
                <td className="text-end">{formatAmount(row.cashPaid)}</td>
                <td className="text-end">{formatAmount(row.swpPaid)}</td>
                <td className="text-end">{formatAmount(row.balance)}</td>
              </tr>
            ))
          )}
          <tr style={{ fontWeight: "var(--font-weight-semibold)", background: "var(--color-table-header)" }}>
            <td colSpan={4} className="text-end">Total :</td>
            <td className="text-end">{formatAmount(totalInvTotal)}</td>
            <td className="text-end">{formatAmount(totalInvDiscount)}</td>
            <td className="text-end">{formatAmount(totalInvPayable)}</td>
            <td className="text-end">{formatAmount(totalInvestigationCash)}</td>
            <td className="text-end">{formatAmount(totalInvestigationSwipe)}</td>
            <td className="text-end">{formatAmount(totalInvBalance)}</td>
          </tr>
        </tbody>
      </Table>
    </div>
  );

  const renderInvestigationReturnPrintTable = () => (
    <div className="acc-investigation-print-only" style={{ display: "none", overflowX: "auto" }}>
      <Table bordered className="mb-0 acc-investigation-print-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>OP No</th>
            <th>Bill No</th>
            <th>Date Time</th>
            <th className="text-end">Total</th>
            <th className="text-end">Discount</th>
            <th className="text-end">Payable</th>
            <th className="text-end">Balance</th>
            <th className="text-end">Paid</th>
          </tr>
        </thead>
        <tbody>
          {displayedInvestigationReturnData.length === 0 ? (
            <tr>
              <td colSpan={9} className="text-center text-muted py-4">
                No records found for the selected date range.
              </td>
            </tr>
          ) : (
            displayedInvestigationReturnData.map((row, index) => (
              <tr key={`print-ret-${row.id}-${index}`}>
                <td>{row.patientName}</td>
                <td>{row.displayNumber}</td>
                <td>{row.billDisplay}</td>
                <td>{row.dateTime}</td>
                <td className="text-end">{formatAmount(row.total)}</td>
                <td className="text-end">{formatAmount(row.totDisc)}</td>
                <td className="text-end">{formatAmount(row.pay)}</td>
                <td className="text-end">{formatAmount(row.balance)}</td>
                <td className="text-end">{formatAmount(getReturnAmount(row))}</td>
              </tr>
            ))
          )}
          <tr style={{ fontWeight: "var(--font-weight-semibold)", background: "var(--color-table-header)" }}>
            <td colSpan={4} className="text-end">Total :</td>
            <td className="text-end">{formatAmount(totalRetTotal)}</td>
            <td className="text-end">{formatAmount(totalRetDiscount)}</td>
            <td className="text-end">{formatAmount(totalRetPayable)}</td>
            <td className="text-end">{formatAmount(totalRetBalance)}</td>
            <td className="text-end">{formatAmount(totalReturn)}</td>
          </tr>
        </tbody>
      </Table>
    </div>
  );

  const renderDueCollectionPrintTable = () => (
    <div className="acc-investigation-print-only" style={{ display: "none", overflowX: "auto" }}>
      <Table bordered className="mb-0 acc-investigation-print-table">
        <thead>
          <tr>
            <th rowSpan={2}>Name</th>
            <th rowSpan={2}>OP No</th>
            <th rowSpan={2}>Bill No</th>
            <th rowSpan={2}>Date Time</th>
            <th colSpan={2} className="text-center">Paid</th>
          </tr>
          <tr>
            <th className="text-center">Cash</th>
            <th className="text-center">Swipe</th>
          </tr>
        </thead>
        <tbody>
          {displayedDueCollectionData.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center text-muted py-4">
                No records found for the selected date range.
              </td>
            </tr>
          ) : (
            displayedDueCollectionData.map((row, index) => (
              <tr key={`print-due-${row.id}-${index}`}>
                <td>{row.patientName}</td>
                <td>{row.displayNumber}</td>
                <td>{row.billDisplay}</td>
                <td>{row.dateTime}</td>
                <td className="text-end">{formatAmount(row.cashPaid)}</td>
                <td className="text-end">{formatAmount(row.swpPaid)}</td>
              </tr>
            ))
          )}
          <tr style={{ fontWeight: "var(--font-weight-semibold)", background: "var(--color-table-header)" }}>
            <td colSpan={4} className="text-end">Total :</td>
            <td className="text-end">{formatAmount(totalDueCash)}</td>
            <td className="text-end">{formatAmount(totalDueSwipe)}</td>
          </tr>
        </tbody>
      </Table>
    </div>
  );

  return (
    <Container fluid className="p-3 d-flex flex-column" style={{ minHeight: "100vh" }}>
      <ReportHeader
        title={`${organization?.name?.toUpperCase() || "HOSPITAL"} - Investigation Report`}
        subtitle={submitted ? getDateRangeText(fromDate, toDate) : "Select date range and click Submit"}
        onExport={handleExport}
        onSearch={setSearchTerm}
        showSearch={submitted}
        showSort={false}
        showPrint={false}
        showExport={submitted}
      />

      <Card className="mb-3 shadow-sm no-print">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="g-3 align-items-end">
              <Col md={4}>
                <Form.Group>
                  <Form.Label style={{ fontWeight: "var(--font-weight-medium)" }}>
                    From Date
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    disabled={loading}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label style={{ fontWeight: "var(--font-weight-medium)" }}>
                    To Date
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    disabled={loading}
                  />
                </Form.Group>
              </Col>
              <Col md={4} className="d-flex gap-2 flex-wrap">
                <Button
                  type="button"
                  className="theme-outline-btn-primary"
                  onClick={handlePrint}
                  disabled={
                    loading ||
                    !submitted ||
                    (displayedInvestigationReportData.length === 0 &&
                      displayedInvestigationReturnData.length === 0 &&
                      displayedDueCollectionData.length === 0)
                  }
                >
                  Print
                </Button>
                <Button type="submit" className="theme-btn-primary" disabled={loading}>
                  {loading ? "Loading..." : "Submit"}
                </Button>
                <Button type="button" className="theme-outline-btn-primary" onClick={handleReset} disabled={loading}>
                  Reset
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {submitted && (
        <div className="d-flex flex-column gap-3 flex-grow-1">
          <div ref={printRef}>
            <div className="acc-investigation-print-header" style={{ display: "none" }}>
              <PrintHeaderReports organization={printOrganization} />
              <div className="acc-investigation-print-title">Investigation Report</div>
              <div className="acc-investigation-print-subtitle">{getDateRangeText(fromDate, toDate)}</div>
            </div>

            <Card className="shadow-sm">
              <Card.Header
                style={{
                  fontSize: "var(--font-size-md)",
                  fontWeight: "var(--font-weight-semibold)",
                }}
              >
                Investigation Collection
              </Card.Header>
              <Card.Body className="p-0">
                {renderInvestigationCollectionTable()}
                {renderInvestigationCollectionPrintTable()}
              </Card.Body>
              <Card.Footer className="d-flex justify-content-end align-items-center py-2 acc-investigation-screen-only">
                <span
                  style={{
                    fontSize: "var(--font-size-md)",
                    fontWeight: "var(--font-weight-semibold)",
                  }}
                >
                  Total Collection :&nbsp;
                  <span style={{ color: "var(--color-primary)" }}>
                    ₹ {formatAmount(totalInvestigationCollection)}
                  </span>
                </span>
              </Card.Footer>
            </Card>

            <Card className="shadow-sm mt-3">
              <Card.Header
                style={{
                  fontSize: "var(--font-size-md)",
                  fontWeight: "var(--font-weight-semibold)",
                }}
              >
                Investigation Return Collection
              </Card.Header>
              <Card.Body className="p-0">
                {renderInvestigationReturnTable()}
                {renderInvestigationReturnPrintTable()}
              </Card.Body>
              <Card.Footer className="d-flex justify-content-end align-items-center py-2 acc-investigation-screen-only">
                <span
                  style={{
                    fontSize: "var(--font-size-md)",
                    fontWeight: "var(--font-weight-semibold)",
                  }}
                >
                  Total Return :&nbsp;
                  <span style={{ color: "var(--color-primary)" }}>₹ {formatAmount(totalReturn)}</span>
                </span>
              </Card.Footer>
            </Card>

            <Card className="shadow-sm mt-3">
              <Card.Header
                style={{
                  fontSize: "var(--font-size-md)",
                  fontWeight: "var(--font-weight-semibold)",
                }}
              >
                Due Collections
              </Card.Header>
              <Card.Body className="p-0">
                {renderDueCollectionTable()}
                {renderDueCollectionPrintTable()}
              </Card.Body>
              <Card.Footer className="d-flex justify-content-end align-items-center py-2 acc-investigation-screen-only">
                <span
                  style={{
                    fontSize: "var(--font-size-md)",
                    fontWeight: "var(--font-weight-semibold)",
                  }}
                >
                  Total Due Collection :&nbsp;
                  <span style={{ color: "var(--color-primary)" }}>
                    ₹ {formatAmount(totalDueCollection)}
                  </span>
                </span>
              </Card.Footer>
            </Card>

            <div className="acc-investigation-print-summary" style={{ display: "none" }}>
              <table>
                <tbody>
                  <tr>
                    <td className="print-summary-label">Total Cash</td>
                    <td className="text-end">&#8377; {formatAmount(printNetCash)}</td>
                  </tr>
                  <tr>
                    <td className="print-summary-label">Total Swipe</td>
                    <td className="text-end">&#8377; {formatAmount(totalSwipeCollection)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <Row className="justify-content-center">
            <Col xs={7} lg={5} xl={4}>
              <div
                style={{
                  background: "var(--page-primary-color)",
                  border: "1px solid var(--page-secondary-color)",
                  borderRadius: "var(--border-radius-sm)",
                  padding: "1rem",
                }}
              >
                <Row className="g-0 align-items-center">
                  <Col xs={12}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "0.75rem",
                        padding: "0.5rem 0",
                        borderBottom: "1px solid var(--border-color)",
                        fontSize: "var(--font-size-sm)",
                        fontWeight: "var(--font-weight-medium)",
                      }}
                    >
                      <span>Total Cash Collection</span>
                      <span style={{ fontWeight: "var(--font-weight-semibold)" }}>
                        ₹ {formatAmount(totalCashCollection)}
                      </span>
                    </div>
                  </Col>
                  <Col xs={12}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "0.75rem",
                        padding: "0.5rem 0",
                        borderBottom: "1px solid var(--border-color)",
                        fontSize: "var(--font-size-sm)",
                        fontWeight: "var(--font-weight-medium)",
                      }}
                    >
                      <span>Total Swipe Collection</span>
                      <span style={{ fontWeight: "var(--font-weight-semibold)" }}>
                        ₹ {formatAmount(totalSwipeCollection)}
                      </span>
                    </div>
                  </Col>
                  <Col xs={12}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "0.75rem",
                        padding: "0.5rem 0",
                        borderBottom: "1px solid var(--border-color)",
                        fontSize: "var(--font-size-sm)",
                        fontWeight: "var(--font-weight-medium)",
                      }}
                    >
                      <span>Total QR Collection</span>
                      <span style={{ fontWeight: "var(--font-weight-semibold)" }}>
                        ₹ {formatAmount(totalQrCollection)}
                      </span>
                    </div>
                  </Col>
                  <Col xs={12}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "0.75rem",
                        padding: "0.5rem 0",
                        borderBottom: "1px solid var(--border-color)",
                        fontSize: "var(--font-size-sm)",
                        fontWeight: "var(--font-weight-medium)",
                      }}
                    >
                      <span>Total Return</span>
                      <span style={{ fontWeight: "var(--font-weight-semibold)" }}>
                        ₹ {formatAmount(totalReturn)}
                      </span>
                    </div>
                  </Col>
                  <Col xs={12}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "0.75rem",
                        paddingTop: "0.75rem",
                        fontSize: "var(--font-size-md)",
                        fontWeight: "var(--font-weight-bold)",
                      }}
                    >
                      <span>Total Collection</span>
                      <span style={{ color: "var(--page-secondary-color)" }}>
                        ₹ {formatAmount(netCollection)}
                      </span>
                    </div>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
        </div>
      )}
    </Container>
  );
};

export default AccInvestigationCollection;
