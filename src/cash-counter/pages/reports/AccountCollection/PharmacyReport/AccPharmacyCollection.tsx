import React, { useMemo, useRef, useState } from "react";
import { Container, Card, Form, Button, Row, Col, Table } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useReactToPrint } from "react-to-print";
import { RootState } from "../../../../../state/store";
import CashCounterApiService, {
  PharmacyCollectReportRow,
  PharmacyReturnCollectReportRow,
  PharmacyDueCollectReportRow,
} from "../../../../../api/cash-counter/cash-counter-api-service";
import { showErrorToast, showValidationError } from "../../../../../utils/alertUtil";
import PrintHeaderReports from "../../../../../components/PrintHeaderReports";
import ReportHeader from "../../../../../medical-records/components/ReportHeader";
import {
  exportToExcel,
  formatReportDate,
  getDateRangeText,
} from "../../../../../medical-records/utils/reportUtils";
import "../../../../../medical-records/styles/reportStyles.css";

const cashCounterApi = new CashCounterApiService();

const formatAmount = (value: number) => value.toFixed(2);

const parseAmount = (value: string | number | undefined) => {
  if (typeof value === "number") {
    return value;
  }

  const parsedValue = Number.parseFloat(value ?? "0");
  return Number.isFinite(parsedValue) ? parsedValue : 0;
};

const getPharmacyCashPaid = (row: PharmacyCollectReportRow) => parseAmount(row.cashPaid);
const getPharmacySwipePaid = (row: PharmacyCollectReportRow) => parseAmount(row.bankPaid);
const getReturnAmount = (row: PharmacyReturnCollectReportRow) => row.paid;

const includesSearchValue = (value: string | number | undefined, search: string) => {
  if (value == null) {
    return false;
  }

  return String(value).toLowerCase().includes(search);
};

const AccPharmacyCollection: React.FC = () => {
  const organization = useSelector((state: RootState) => state.appReducer.organization);
  const printRef = useRef<HTMLDivElement>(null);
  const today = new Date().toISOString().split("T")[0];

  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [pharmacyReportData, setPharmacyReportData] = useState<PharmacyCollectReportRow[]>([]);
  const [pharmacyReturnData, setPharmacyReturnData] = useState<PharmacyReturnCollectReportRow[]>([]);
  const [dueCollectionData, setDueCollectionData] = useState<PharmacyDueCollectReportRow[]>([]);

  const displayedPharmacyReportData = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) {
      return pharmacyReportData;
    }

    return pharmacyReportData.filter((row) => {
      const cashPaid = getPharmacyCashPaid(row);
      const swipePaid = getPharmacySwipePaid(row);
      return (
        includesSearchValue(row.opNo, search) ||
        includesSearchValue(row.patName, search) ||
        includesSearchValue(row.dateTime, search) ||
        includesSearchValue(row.fullName, search) ||
        includesSearchValue(row.billDisplay, search) ||
        includesSearchValue(row.refNo, search) ||
        includesSearchValue(row.total.toFixed(2), search) ||
        includesSearchValue(row.disc.toFixed(2), search) ||
        includesSearchValue(row.pay.toFixed(2), search) ||
        includesSearchValue(row.balance.toFixed(2), search) ||
        includesSearchValue(cashPaid.toFixed(2), search) ||
        includesSearchValue(swipePaid.toFixed(2), search)
      );
    });
  }, [pharmacyReportData, searchTerm]);

  const displayedPharmacyReturnData = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) {
      return pharmacyReturnData;
    }

    return pharmacyReturnData.filter((row) => {
      const amount = getReturnAmount(row);
      return (
        includesSearchValue(row.displayNumber, search) ||
        includesSearchValue(row.patientName, search) ||
        includesSearchValue(row.dateTime, search) ||
        includesSearchValue(row.fullName, search) ||
        includesSearchValue(row.billDisplay, search) ||
        includesSearchValue(row.total.toFixed(2), search) ||
        includesSearchValue(row.totDisc.toFixed(2), search) ||
        includesSearchValue(row.pay.toFixed(2), search) ||
        includesSearchValue(row.balance.toFixed(2), search) ||
        includesSearchValue(amount.toFixed(2), search)
      );
    });
  }, [pharmacyReturnData, searchTerm]);

  const displayedDueCollectionData = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) {
      return dueCollectionData;
    }

    return dueCollectionData.filter((row) => {
      return (
        includesSearchValue(row.displayNumber, search) ||
        includesSearchValue(row.patientName, search) ||
        includesSearchValue(row.dateTime, search) ||
        includesSearchValue(row.fullName, search) ||
        includesSearchValue(row.billDisplay, search) ||
        includesSearchValue(row.refNo, search) ||
        includesSearchValue(row.cashPaid.toFixed(2), search) ||
        includesSearchValue(row.swpPaid.toFixed(2), search)
      );
    });
  }, [dueCollectionData, searchTerm]);

  const totalPharmacyCash = displayedPharmacyReportData.reduce(
    (sum, row) => sum + getPharmacyCashPaid(row),
    0
  );
  const totalPharmacySwipe = displayedPharmacyReportData.reduce(
    (sum, row) => sum + getPharmacySwipePaid(row),
    0
  );
  const totalDueCash = displayedDueCollectionData.reduce((sum, row) => sum + row.cashPaid, 0);
  const totalDueSwipe = displayedDueCollectionData.reduce((sum, row) => sum + row.swpPaid, 0);
  const totalReturn = displayedPharmacyReturnData.reduce(
    (sum, row) => sum + getReturnAmount(row),
    0
  );
  const totalPharmacyCollection = totalPharmacyCash + totalPharmacySwipe;
  const totalDueCollection = totalDueCash + totalDueSwipe;
  const totalCashCollection = totalPharmacyCash + totalDueCash;
  const totalSwipeCollection = totalPharmacySwipe + totalDueSwipe;
  const totalPharmacyTotal = displayedPharmacyReportData.reduce((sum, row) => sum + row.total, 0);
  const totalPharmacyDiscount = displayedPharmacyReportData.reduce((sum, row) => sum + row.disc, 0);
  const totalPharmacyPayable = displayedPharmacyReportData.reduce((sum, row) => sum + row.pay, 0);
  const totalPharmacyBalance = displayedPharmacyReportData.reduce((sum, row) => sum + row.balance, 0);
  const totalReturnTotal = displayedPharmacyReturnData.reduce((sum, row) => sum + row.total, 0);
  const totalReturnDiscount = displayedPharmacyReturnData.reduce((sum, row) => sum + row.totDisc, 0);
  const totalReturnPayable = displayedPharmacyReturnData.reduce((sum, row) => sum + row.pay, 0);
  const totalReturnBalance = displayedPharmacyReturnData.reduce((sum, row) => sum + row.balance, 0);
  const printNetCash = totalCashCollection;
  const totalQrCollection = 0;
  const netCollection = totalPharmacyCollection + totalDueCollection - totalReturn;

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
      body { font-family: 'Times New Roman', Times, serif; font-size: 11px; color: #000; }
      .acc-pharmacy-print-header { display: block !important; margin-bottom: 8px; }
      .acc-pharmacy-print-title { text-align: center; font-weight: 700; margin: 4px 0 2px; font-size: 11px; }
      .acc-pharmacy-print-subtitle { text-align: center; margin: 0 0 6px; font-size: 9px; }
      .acc-pharmacy-screen-only { display: block !important; }
      .acc-pharmacy-print-only { display: none !important; }
      .acc-pharmacy-print-summary { display: none !important; }
      table { width: 100%; border-collapse: collapse !important; }
      table, th, td { border: 1px solid #000 !important; }
      .acc-pharmacy-print-table th,
      .acc-pharmacy-print-table td {
        font-size: 11px !important;
        padding: 1px 3px !important;
        line-height: 1.05 !important;
      }
      .acc-pharmacy-print-table thead th {
        padding: 2px 3px !important;
      }
      .acc-pharmacy-print-summary table {
        width: auto !important;
        min-width: 280px;
        margin-left: auto !important;
        border-collapse: collapse !important;
      }
      .acc-pharmacy-print-summary td {
        border: 1px solid #000 !important;
        padding: 2px 8px !important;
        font-size: 9px !important;
        line-height: 1.15 !important;
      }
      .acc-pharmacy-print-summary .print-summary-label {
        font-weight: 600 !important;
      }
      thead { display: table-header-group; }
      tbody { display: table-row-group; }
      tr { page-break-inside: avoid; }
      @media print {
        .acc-pharmacy-screen-only { display: none !important; }
        .acc-pharmacy-print-only { display: block !important; }
        .acc-pharmacy-print-summary { display: block !important; margin-top: 10px; }
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
      const [pharmacyReportResponse, pharmacyReturnResponse, dueCollectionResponse] =
        await Promise.all([
          cashCounterApi.fetchPharmacyCollectionReport(fromDate, toDate),
          cashCounterApi.fetchPharmacyReturnCollectionReport(fromDate, toDate),
          cashCounterApi.fetchPharmacyDueCollectReport(fromDate, toDate),
        ]);

      setPharmacyReportData(pharmacyReportResponse);
      setPharmacyReturnData(pharmacyReturnResponse);
      setDueCollectionData(dueCollectionResponse);
      setSubmitted(true);
    } catch {
      setPharmacyReportData([]);
      setPharmacyReturnData([]);
      setDueCollectionData([]);
      setSubmitted(false);
      showErrorToast("Failed to fetch pharmacy report data.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFromDate(today);
    setToDate(today);
    setSearchTerm("");
    setPharmacyReportData([]);
    setPharmacyReturnData([]);
    setDueCollectionData([]);
    setSubmitted(false);
  };

  const handleExport = () => {
    const exportData = [
      ...displayedPharmacyReportData.map((row, index) => ({
        "Report Type": "Pharmacy Collection",
        "S.No": index + 1,
        "OP No": row.opNo,
        "Patient Name": row.patName,
        Date: row.dateTime,
        User: row.fullName,
        "Bill Display": row.billDisplay,
        Total: formatAmount(row.total),
        Discount: formatAmount(row.disc),
        Pay: formatAmount(row.pay),
        Balance: formatAmount(row.balance),
        "Paid Cash": formatAmount(getPharmacyCashPaid(row)),
        "Paid Swipe": formatAmount(getPharmacySwipePaid(row)),
        RefNo: row.refNo,
      })),
      ...displayedPharmacyReturnData.map((row, index) => ({
        "Report Type": "Pharmacy Return Collection",
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
        RefNo: row.refNo,
      })),
    ];

    exportToExcel(
      exportData,
      `Pharmacy_Report_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
      "Pharmacy Report"
    );
  };

  const renderPharmacyCollectionTable = () => (
    <div style={{ overflowX: "auto" }}>
      <Table striped bordered hover className="table-hims mb-0 acc-pharmacy-print-table acc-pharmacy-screen-only">
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
            <th rowSpan={2}>TransNo</th>
          </tr>
          <tr>
            <th className="text-center">Cash</th>
            <th className="text-center">Swipe</th>
          </tr>
        </thead>
        <tbody>
          {displayedPharmacyReportData.length === 0 ? (
            <tr>
              <td colSpan={13} className="text-center text-muted py-4">
                No records found for the selected date range.
              </td>
            </tr>
          ) : (
            displayedPharmacyReportData.map((row, index) => (
              <tr key={`${row.id}-${index}`}>
                <td>{index + 1}</td>
                <td>{row.opNo}</td>
                <td>{row.patName}</td>
                <td>{row.dateTime}</td>
                <td style={{ color: "var(--page-secondary-color)" }} className="fw-bold">{row.fullName}</td>
                <td>{row.billDisplay}</td>
                <td>{formatAmount(row.total)}</td>
                <td>{formatAmount(row.disc)}</td>
                <td>{formatAmount(row.pay)}</td>
                <td>{formatAmount(row.balance)}</td>
                <td
                  style={{
                    background: "var(--page-primary-color)",
                    color: "var(--page-secondary-color)",
                  }}
                  className="text-center fw-bold"
                >
                  {formatAmount(getPharmacyCashPaid(row))}
                </td>
                <td
                  style={{
                    background: "var(--page-primary-color)",
                    color: "var(--page-secondary-color)",
                  }}
                  className="text-center fw-bold"
                >
                  {formatAmount(getPharmacySwipePaid(row))}
                </td>
                <td>{row.refNo}</td>
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
            <td className="text-end">{formatAmount(totalPharmacyCash)}</td>
            <td className="text-end">{formatAmount(totalPharmacySwipe)}</td>
            <td />
          </tr>
        </tbody>
      </Table>
    </div>
  );

  const renderPharmacyReturnTable = () => (
    <div style={{ overflowX: "auto" }}>
      <Table striped bordered hover className="table-hims mb-0 acc-pharmacy-print-table acc-pharmacy-screen-only">
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
          {displayedPharmacyReturnData.length === 0 ? (
            <tr>
              <td colSpan={11} className="text-center text-muted py-4">
                No records found for the selected date range.
              </td>
            </tr>
          ) : (
            displayedPharmacyReturnData.map((row, index) => (
              <tr key={`${row.phReturnId}-${index}`}>
                <td>{index + 1}</td>
                <td>{row.displayNumber}</td>
                <td>{row.patientName}</td>
                <td>{row.dateTime}</td>
                <td style={{ color: "var(--page-secondary-color)" }} className="fw-bold">{row.fullName}</td>
                <td>{row.billDisplay}</td>
                <td>{formatAmount(row.total)}</td>
                <td>{formatAmount(row.totDisc)}</td>
                <td>{formatAmount(row.pay)}</td>
                <td>{formatAmount(row.balance)}</td>
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
      <Table striped bordered hover className="table-hims mb-0 acc-pharmacy-print-table acc-pharmacy-screen-only">
        <thead>
          <tr>
            <th rowSpan={2} style={{ width: "60px" }}>S. No</th>
            <th rowSpan={2}>OP No</th>
            <th rowSpan={2}>Patient Name</th>
            <th rowSpan={2}>Date</th>
            <th rowSpan={2}>User</th>
            <th rowSpan={2}>Bill Display</th>
            <th colSpan={2} className="text-center">Paid</th>
            <th rowSpan={2}>TransNo</th>
          </tr>
          <tr>
            <th className="text-center">Cash</th>
            <th className="text-center">Swipe</th>
          </tr>
        </thead>
        <tbody>
          {displayedDueCollectionData.length === 0 ? (
            <tr>
              <td colSpan={9} className="text-center text-muted py-4">
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
                <td>{row.refNo}</td>
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
            <td />
          </tr>
        </tbody>
      </Table>
    </div>
  );

  const renderPharmacyCollectionPrintTable = () => (
    <div className="acc-pharmacy-print-only" style={{ display: "none", overflowX: "auto" }}>
      <Table bordered className="mb-0 acc-pharmacy-print-table">
        <thead>
          <tr>
            <th rowSpan={2}>Patient Name</th>
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
          {displayedPharmacyReportData.length === 0 ? (
            <tr>
              <td colSpan={10} className="text-center text-muted py-4">
                No records found for the selected date range.
              </td>
            </tr>
          ) : (
            displayedPharmacyReportData.map((row, index) => (
              <tr key={`print-collection-${row.id}-${index}`}>
                <td>{row.patName}</td>
                <td>{row.opNo}</td>
                <td>{row.billDisplay}</td>
                <td>{row.dateTime}</td>
                <td className="text-end">{formatAmount(row.total)}</td>
                <td className="text-end">{formatAmount(row.disc)}</td>
                <td className="text-end">{formatAmount(row.pay)}</td>
                <td className="text-end">{formatAmount(getPharmacyCashPaid(row))}</td>
                <td className="text-end">{formatAmount(getPharmacySwipePaid(row))}</td>
                <td className="text-end">{formatAmount(row.balance)}</td>
              </tr>
            ))
          )}
          <tr
            style={{
              fontWeight: "var(--font-weight-semibold)",
              background: "var(--color-table-header)",
            }}
          >
            <td colSpan={4} className="text-end">Total :</td>
            <td className="text-end">{formatAmount(totalPharmacyTotal)}</td>
            <td className="text-end">{formatAmount(totalPharmacyDiscount)}</td>
            <td className="text-end">{formatAmount(totalPharmacyPayable)}</td>
            <td className="text-end">{formatAmount(totalPharmacyCash)}</td>
            <td className="text-end">{formatAmount(totalPharmacySwipe)}</td>
            <td className="text-end">{formatAmount(totalPharmacyBalance)}</td>
          </tr>
        </tbody>
      </Table>
    </div>
  );

  const renderPharmacyReturnPrintTable = () => (
    <div className="acc-pharmacy-print-only" style={{ display: "none", overflowX: "auto" }}>
      <Table bordered className="mb-0 acc-pharmacy-print-table">
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
          {displayedPharmacyReturnData.length === 0 ? (
            <tr>
              <td colSpan={9} className="text-center text-muted py-4">
                No records found for the selected date range.
              </td>
            </tr>
          ) : (
            displayedPharmacyReturnData.map((row, index) => (
              <tr key={`print-return-${row.phReturnId}-${index}`}>
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
          <tr
            style={{
              fontWeight: "var(--font-weight-semibold)",
              background: "var(--color-table-header)",
            }}
          >
            <td colSpan={4} className="text-end">Total :</td>
            <td className="text-end">{formatAmount(totalReturnTotal)}</td>
            <td className="text-end">{formatAmount(totalReturnDiscount)}</td>
            <td className="text-end">{formatAmount(totalReturnPayable)}</td>
            <td className="text-end">{formatAmount(totalReturnBalance)}</td>
            <td className="text-end">{formatAmount(totalReturn)}</td>
          </tr>
        </tbody>
      </Table>
    </div>
  );

  const renderDueCollectionPrintTable = () => (
    <div className="acc-pharmacy-print-only" style={{ display: "none", overflowX: "auto" }}>
      <Table bordered className="mb-0 acc-pharmacy-print-table">
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
          <tr
            style={{
              fontWeight: "var(--font-weight-semibold)",
              background: "var(--color-table-header)",
            }}
          >
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
        title={`${organization?.name?.toUpperCase() || "HOSPITAL"} - Pharmacy Report`}
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
                    (displayedPharmacyReportData.length === 0 &&
                      displayedPharmacyReturnData.length === 0 &&
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
            <div className="acc-pharmacy-print-header" style={{ display: "none" }}>
              <PrintHeaderReports organization={printOrganization} />
              <div className="acc-pharmacy-print-title">Pharmacy Report</div>
              <div className="acc-pharmacy-print-subtitle">{getDateRangeText(fromDate, toDate)}</div>
            </div>

            <Card className="shadow-sm">
              <Card.Header
                style={{
                  fontSize: "var(--font-size-md)",
                  fontWeight: "var(--font-weight-semibold)",
                }}
              >
                Pharmacy Collection
              </Card.Header>
              <Card.Body className="p-0">
                {renderPharmacyCollectionTable()}
                {renderPharmacyCollectionPrintTable()}
              </Card.Body>
              <Card.Footer className="d-flex justify-content-end align-items-center py-2 acc-pharmacy-screen-only">
                <span
                  style={{
                    fontSize: "var(--font-size-md)",
                    fontWeight: "var(--font-weight-semibold)",
                  }}
                >
                  Total Collection :&nbsp;
                  <span style={{ color: "var(--color-primary)" }}>
                    ₹ {formatAmount(totalPharmacyCollection)}
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
                Pharmacy Return Collection
              </Card.Header>
              <Card.Body className="p-0">
                {renderPharmacyReturnTable()}
                {renderPharmacyReturnPrintTable()}
              </Card.Body>
              <Card.Footer className="d-flex justify-content-end align-items-center py-2 acc-pharmacy-screen-only">
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
              <Card.Footer className="d-flex justify-content-end align-items-center py-2 acc-pharmacy-screen-only">
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

            <div className="acc-pharmacy-print-summary" style={{ display: "none" }}>
              <table>
                <tbody>
                  <tr>
                    <td className="print-summary-label">Total Cash</td>
                    <td className="text-end">₹ {formatAmount(printNetCash)}</td>
                  </tr>
                  <tr>
                    <td className="print-summary-label">Total Swipe</td>
                    <td className="text-end">₹ {formatAmount(totalSwipeCollection)}</td>
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

export default AccPharmacyCollection;

