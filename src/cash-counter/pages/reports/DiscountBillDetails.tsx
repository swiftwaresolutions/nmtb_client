import React, { useMemo, useState } from "react";
import { Container, Card, Form, Button, Row, Col, Table } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPrint } from "@fortawesome/free-solid-svg-icons";
import {
  CashCounterApiService,
  DiscountBillDetails as DiscountBillRow,
  DiscountBillDetailsResponse,
  DiscountBillType,
} from "../../../api/cash-counter/cash-counter-api-service";
import { showErrorToast, showValidationError, showWarningToast } from "../../../utils/alertUtil";
import "../../../medical-records/styles/reportStyles.css";

const cashCounterApi = new CashCounterApiService();

const EMPTY_RESPONSE: DiscountBillDetailsResponse = {
  ph: [],
  inv: [],
  lab: [],
  ip: [],
  rec: [],
  credit: [],
};

const BILL_TYPE_OPTIONS: Array<{ label: string; value: DiscountBillType }> = [
  { label: "All", value: "all" },
  { label: "Pharmacy", value: "ph" },
  { label: "Investigation", value: "inv" },
  { label: "Lab", value: "lab" },
  { label: "IP", value: "ip" },
  { label: "Registration", value: "rec" },
  { label: "Credit", value: "credit" },
];

const BILL_TYPE_LABELS: Record<Exclude<DiscountBillType, "all">, string> = {
  ph: "PHARMACY",
  inv: "INVESTIGATION",
  lab: "LAB",
  ip: "IP",
  rec: "REGISTRATION",
  credit: "CREDIT",
};

const formatDateForDisplay = (isoDate: string) => {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
};

const formatAmount = (value: number | null | undefined) =>
  Number(value ?? 0).toFixed(2);

const DiscountBillDetails: React.FC = () => {
  const today = new Date().toISOString().split("T")[0];

  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [billType, setBillType] = useState<DiscountBillType>("all");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reportData, setReportData] = useState<DiscountBillDetailsResponse>(EMPTY_RESPONSE);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fromDate || !toDate) {
      showValidationError("Please select from and to dates.");
      return;
    }

    if (new Date(fromDate) > new Date(toDate)) {
      showValidationError("From date cannot be greater than to date.");
      return;
    }

    setLoading(true);

    try {
      const response = await cashCounterApi.fetchDiscountBillDetails(
        fromDate,
        toDate,
        billType
      );

      const normalizedData: DiscountBillDetailsResponse = {
        ph: Array.isArray(response?.ph) ? response.ph : [],
        inv: Array.isArray(response?.inv) ? response.inv : [],
        lab: Array.isArray(response?.lab) ? response.lab : [],
        ip: Array.isArray(response?.ip) ? response.ip : [],
        rec: Array.isArray(response?.rec) ? response.rec : [],
        credit: Array.isArray(response?.credit) ? response.credit : [],
      };

      setReportData(normalizedData);
      setSubmitted(true);

      const totalRows =
        normalizedData.ph.length +
        normalizedData.inv.length +
        normalizedData.lab.length +
        normalizedData.ip.length +
        normalizedData.rec.length +
        normalizedData.credit.length;

      if (totalRows === 0) {
        showWarningToast("No discount bill details found for the selected filters.");
      }
    } catch (error: any) {
      console.error("Failed to fetch discount bill details:", error);
      showErrorToast(
        error?.response?.data?.error || "Failed to fetch discount bill details"
      );
      setReportData(EMPTY_RESPONSE);
      setSubmitted(false);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFromDate(today);
    setToDate(today);
    setBillType("all");
    setReportData(EMPTY_RESPONSE);
    setSubmitted(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const summaryRows = useMemo(() => {
    const sectionData: Array<{ label: string; rows: DiscountBillRow[] }> = [
      { label: BILL_TYPE_LABELS.rec, rows: reportData.rec },
      { label: BILL_TYPE_LABELS.ph, rows: reportData.ph },
      { label: BILL_TYPE_LABELS.inv, rows: reportData.inv },
      { label: BILL_TYPE_LABELS.lab, rows: reportData.lab },
      { label: BILL_TYPE_LABELS.ip, rows: reportData.ip },
      { label: BILL_TYPE_LABELS.credit, rows: reportData.credit },
    ];

    return sectionData.map((section) => {
      const totalAmt = section.rows.reduce((sum, row) => sum + Number(row.total ?? 0), 0);
      const discount = section.rows.reduce((sum, row) => sum + Number(row.disc ?? 0), 0);
      return {
        billType: section.label,
        totalAmt,
        discount,
      };
    });
  }, [reportData]);

  const grandTotals = useMemo(
    () =>
      summaryRows.reduce(
        (acc, row) => ({
          totalAmt: acc.totalAmt + row.totalAmt,
          discount: acc.discount + row.discount,
        }),
        { totalAmt: 0, discount: 0 }
      ),
    [summaryRows]
  );

  const sectionRows = useMemo(
    () =>
      [
        { title: BILL_TYPE_LABELS.rec, data: reportData.rec },
        { title: BILL_TYPE_LABELS.ph, data: reportData.ph },
        { title: BILL_TYPE_LABELS.inv, data: reportData.inv },
        { title: BILL_TYPE_LABELS.lab, data: reportData.lab },
        { title: BILL_TYPE_LABELS.ip, data: reportData.ip },
        { title: BILL_TYPE_LABELS.credit, data: reportData.credit },
      ].filter((section) => section.data.length > 0),
    [reportData]
  );

  const hasData = sectionRows.length > 0;

  return (
    <Container fluid className="p-3">
      <Card className="shadow-sm">
        <Card.Header className="no-print">
          <Form onSubmit={handleSubmit}>
            <Row className="g-3 align-items-end">
              <Col md={3}>
                <Form.Group>
                  <Form.Label>From Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>To Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Bill Type</Form.Label>
                  <Form.Select
                    value={billType}
                    onChange={(e) => setBillType(e.target.value as DiscountBillType)}
                  >
                    {BILL_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3} className="d-flex gap-2">
                <Button type="submit" variant="primary" disabled={loading} className="w-100">
                  {loading ? "Loading..." : "Submit"}
                </Button>
                <Button
                  type="button"
                  variant="outline-secondary"
                  onClick={handleReset}
                  className="w-100"
                  disabled={loading}
                >
                  Reset
                </Button>
                <Button
                  type="button"
                  variant="outline-dark"
                  onClick={handlePrint}
                  className="w-100 d-flex align-items-center justify-content-center gap-1"
                  disabled={!submitted || !hasData}
                >
                  <FontAwesomeIcon icon={faPrint} />
                  Print
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Header>
        <Card.Body>
          {submitted ? (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <div style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-semibold)" }}>
                    DISCOUNT BILL DETAILS
                  </div>
                  <div style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-normal)" }}>
                    Between &quot;{formatDateForDisplay(fromDate)}&quot; and &quot;{formatDateForDisplay(toDate)}&quot;
                  </div>
                </div>
                <div style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)" }}>
                  Bill Type: {BILL_TYPE_OPTIONS.find((option) => option.value === billType)?.label}
                </div>
              </div>

              <div style={{ overflowX: "auto" }}>
                <Table bordered className="table-hims mb-3" size="sm">
                  <thead>
                    <tr>
                      <th>Bill Type</th>
                      <th className="text-end">Total Amt</th>
                      <th className="text-end">Discount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summaryRows.map((row) => (
                      <tr key={row.billType}>
                        <td>{row.billType}</td>
                        <td className="text-end">{formatAmount(row.totalAmt)}</td>
                        <td className="text-end">{formatAmount(row.discount)}</td>
                      </tr>
                    ))}
                    <tr style={{ fontWeight: "var(--font-weight-semibold)" as React.CSSProperties["fontWeight"] }}>
                      <td className="text-end">Total</td>
                      <td className="text-end">{formatAmount(grandTotals.totalAmt)}</td>
                      <td className="text-end">{formatAmount(grandTotals.discount)}</td>
                    </tr>
                  </tbody>
                </Table>
              </div>

              {!hasData && (
                <div style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)" }}>
                  No records found for the selected filters.
                </div>
              )}

              {sectionRows.map((section) => (
                <div key={section.title} className="mb-3">
                  <div
                    className="py-2 px-2"
                    style={{
                      fontSize: "var(--font-size-sm)",
                      fontWeight: "var(--font-weight-semibold)",
                      background: "var(--color-table-header)",
                    }}
                  >
                    {section.title} DISCOUNT BILL DETAILS
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <Table bordered className="table-hims mb-0" size="sm">
                      <thead>
                        <tr>
                          <th>S.No</th>
                          <th>Patient Name</th>
                          <th>OP No</th>
                          <th>Bill No</th>
                          <th className="text-end">Total</th>
                          {/* <th className="text-end">Discount</th> */}
                          <th className="text-end">Disc Amt</th>
                          <th>User Name</th>
                        </tr>
                      </thead>
                      <tbody>
                        {section.data.map((row, index) => (
                          <tr key={`${section.title}-${row.billNo}-${index}`}>
                            <td>{index + 1}</td>
                            <td>{row.patientName}</td>
                            <td>{row.opNo}</td>
                            <td>{row.billNo}</td>
                            <td className="text-end">{formatAmount(row.total)}</td>
                            {/* <td className="text-end">{formatAmount(row.disc)}</td> */}
                            <td className="text-end">{formatAmount(row.discAmt ?? row.disc)}</td>
                            <td>{row.userName}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)" }}>
              Choose filters in the header and click Submit to view discount bill details.
            </div>
          )}
        </Card.Body>
        </Card>
    </Container>
  );
};

export default DiscountBillDetails;
