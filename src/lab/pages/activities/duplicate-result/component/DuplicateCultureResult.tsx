import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, Spinner, Table } from "react-bootstrap";
import {
  CultutreTestResultByRegIdResponse,
  LaboratoryApiService,
} from "../../../../../api/laboratory/laboratory-api-service";
import CulturePrintPatientInfo from "../../../../../components/CulturePrintPatientInfo";
import { showErrorToast } from "../../../../../utils/alertUtil";
import ReactToPrint from "react-to-print";

interface TestItem {
  testRegId: number;
  testName: string;
  testCode: string;
  testId: number;
  specName: string;
  deptName: string;
  rate: number;
  units: number;
  isReceived: number;
  isDone: number;
  isVerified: number;
  isPrinted: number;
  entDateTime: string;
  uid: number;
  finalBillId: number | null;
  returnUnit: number;
  isCancelled: number;
  note: string;
  isCulture: number;
}

interface DuplicateCultureResultProps {
  opNo: string;
  tests: TestItem[];
  onBack: () => void;
}

const DuplicateCultureResult: React.FC<DuplicateCultureResultProps> = ({
  opNo,
  tests,
  onBack,
}) => {
  const themePrimary = "var(--page-primary-color)";
  const themeSecondary = "var(--page-secondary-color)";
  const labApiService = useMemo(() => new LaboratoryApiService(), []);
  const printRef = useRef<HTMLDivElement>(null);

  const [cultureResultsByTest, setCultureResultsByTest] = useState<
    Record<number, CultutreTestResultByRegIdResponse>
  >({});
  const [loading, setLoading] = useState(true);
  const testRegIdsKey = useMemo(
    () => tests.map((test) => test.testRegId).sort((a, b) => a - b).join(","),
    [tests]
  );
  const stableTests = useMemo(() => tests, [testRegIdsKey]);

  const hasTextValue = (value?: string | number | null): boolean => {
    if (value === null || value === undefined) return false;
    return String(value).trim().length > 0;
  };

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      if (!testRegIdsKey) {
        if (mounted) setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const cultureEntries = await Promise.all(
          stableTests.map(async (test) => {
            const result = await labApiService.fetchCultureTestResultByTestRegId(
              test.testRegId
            );
            return { testRegId: test.testRegId, result };
          })
        );

        if (mounted) {
          const cultureMap: Record<number, CultutreTestResultByRegIdResponse> = {};
          cultureEntries.forEach((entry) => {
            if (entry.result) cultureMap[entry.testRegId] = entry.result;
          });
          setCultureResultsByTest(cultureMap);
        }
      } catch (error) {
        console.error("Error loading culture duplicate print data", error);
        showErrorToast("Failed to load culture details. Please try again.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();
    return () => {
      mounted = false;
    };
  }, [testRegIdsKey, labApiService, stableTests]);

  const firstTest = stableTests[0];
  const firstCultureResult = firstTest
    ? cultureResultsByTest[firstTest.testRegId]
    : null;
  const finalBillId = firstTest?.finalBillId ?? undefined;

  return (
    <>
      <style>
        {`
          @page {
            size: A4;
            margin: 4.7cm 1.1cm 2.5cm 1.1cm;
          }

          @media print {
            html,
            body {
              margin: 0;
              padding: 0;
              height: auto !important;
              font-size: calc(var(--font-size-md) + 1pt);
            }

            .bg-light {
              background: white !important;
            }

            .shadow-sm {
              box-shadow: none !important;
            }

            .print-action-bar {
              display: none !important;
            }

            .print-page {
              height: auto !important;
              overflow: visible !important;
              padding: 0 !important;
            }

            .print-content-root,
            .print-card,
            .print-card-body {
              height: auto !important;
              min-height: auto !important;
              overflow: visible !important;
            }

            .print-layout-table {
              width: 100%;
              border-collapse: collapse;
            }

            .print-layout-header-group {
              display: table-header-group;
            }

            .print-layout-footer-group {
              display: table-footer-group;
            }

            .print-repeating-header {
              position: static;
              background: white;
              padding-bottom: 4px;
              border-bottom: 1px solid #dee2e6;
            }

            .print-repeating-footer {
              position: static;
              background: white;
              margin-top: 1.5rem;
            }

            .print-layout-cell {
              padding: 0 !important;
              vertical-align: top;
            }

            .culture-page {
              break-before: page;
            }
          }

          .print-layout-table {
            width: 100%;
            border-collapse: collapse;
          }

          .print-repeating-header {
            border-bottom: 1px solid #dee2e6;
            padding-bottom: 0.5rem;
            margin-bottom: 0.5rem;
          }

          .print-repeating-footer {
            display: flex;
            justify-content: flex-end;
            align-items: flex-start;
            padding: 0.5rem 1rem;
            margin-top: 1.5rem;
            width: 100%;
          }

          .print-footer-col {
            flex: 0 0 auto;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            padding: 0 1rem;
            margin-right: 3rem;
          }

          .footer-signature-line {
            width: 120px;
            border-top: 1px solid #000;
            margin-bottom: 6px;
          }

          .footer-role {
            font-size: var(--font-size-sm);
          }

          .culture-page {
            padding: 0.5rem 0;
          }

          .culture-summary-grid {
            margin-bottom: 0.75rem;
          }

          .culture-summary-row {
            display: grid;
            grid-template-columns: 28% 72%;
            align-items: stretch;
          }

          .culture-summary-label {
            padding: 0.5rem 0.6rem;
            font-weight: var(--font-weight-semibold);
          }

          .culture-summary-value {
            padding: 0.5rem 0.6rem;
            white-space: pre-wrap;
          }

          .antibiogram-table {
            width: 100%;
            table-layout: fixed;
            border-collapse: collapse;
          }

          .antibiogram-col-header {
            text-align: center;
            font-weight: var(--font-weight-bold);
            background-color: #f0f0f0;
            font-size: var(--font-size-sm);
            letter-spacing: 0.02em;
            padding: 0.25rem 0.2rem !important;
            line-height: 1.2;
          }

          .antibiogram-ant-header {
            width: 27%;
          }

          .antibiogram-zone-header-cell {
            width: 6.33%;
            font-size: var(--font-size-base);
          }

          .antibiogram-ant-cell {
            text-align: left;
            padding: 4px 6px !important;
            font-size: var(--font-size-base);
            min-height: 22px;
          }

          .antibiogram-zone-cell {
            text-align: center;
            padding: 4px 2px !important;
            font-size: var(--font-size-base);
            min-height: 22px;
            font-weight: var(--font-weight-medium);
          }

          @media print {
            .antibiogram-table td,
            .antibiogram-table th {
              border-color: #333 !important;
            }

            .culture-summary-grid,
            .culture-summary-row,
            .culture-summary-label,
            .culture-summary-value {
              break-inside: avoid;
              page-break-inside: avoid;
            }

            .antibiogram-col-header {
              background-color: #e0e0e0 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        `}
      </style>

      <div
        className="print-page bg-light"
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          padding: "1rem",
          backgroundColor: themeSecondary,
          color: themePrimary,
          fontSize: "calc(var(--font-size-md) + 1pt)",
        }}
      >
        <div
          ref={printRef}
          className="print-content-root"
          style={{ flex: 1, display: "flex", flexDirection: "column" }}
        >
          <table className="print-layout-table">
            <thead className="print-layout-header-group">
              <tr>
                <td className="print-layout-cell">
                  <div className="print-repeating-header">
                    <CulturePrintPatientInfo
                      opno={opNo}
                      finalBillId={finalBillId}
                      specimenName={firstTest?.specName}
                      testName={firstTest?.testName}
                      cultureId={firstCultureResult?.cultureId}
                      dateOfReceivedOverride={firstCultureResult?.entDateTime}
                      dateOfReport={firstCultureResult?.entDateTime}
                    />
                  </div>
                </td>
              </tr>
            </thead>
            <tfoot className="print-layout-footer-group">
              <tr>
                <td className="print-layout-cell">
                  <div className="print-repeating-footer">
                    <div className="print-footer-col">
                      <div className="footer-signature-line" />
                      <div className="footer-role">Microbiologist</div>
                      <div className="footer-role">NIGHTINGALE</div>
                    </div>
                  </div>
                </td>
              </tr>
            </tfoot>
            <tbody>
              <tr>
                <td className="print-layout-cell">
                  {loading ? (
                    <div className="text-center py-4">
                      <Spinner animation="border" style={{ color: themePrimary }} />
                      <div className="text-muted mt-2">Preparing culture reports...</div>
                    </div>
                  ) : (
                    <>
                      {tests.map((test, index) => {
                        const cultureResult = cultureResultsByTest[test.testRegId];
                        const details = cultureResult?.details || [];

                        const filteredDetails = details.filter(
                          (d) => hasTextValue(d.antName) || hasTextValue(d.value)
                        );

                        const summaryRows = [
                          { label: "Smear Report", value: cultureResult?.smearReport },
                          { label: "Organism Isolated", value: cultureResult?.organismIsolated },
                          { label: "Colony Count", value: cultureResult?.colonyCount },
                        ].filter((row) => hasTextValue(row.value));

                        const hasNonRective = hasTextValue(cultureResult?.nonRective);

                        const sensitive = filteredDetails.filter((d) => d.zone === "S");
                        const moderate = filteredDetails.filter((d) => d.zone === "M");
                        const resistant = filteredDetails.filter((d) => d.zone === "R");
                        const maxRows = Math.max(sensitive.length, moderate.length, resistant.length);
                        const hasAntibiogramData = maxRows > 0;

                        return (
                          <div
                            key={test.testRegId}
                            className="culture-page"
                            style={
                              index > 0
                                ? {
                                    pageBreakBefore: "always",
                                    paddingTop: "0.5rem",
                                  }
                                : {}
                            }
                          >
                            {summaryRows.length > 0 && (
                              <div className="culture-summary-grid">
                                {summaryRows.map((row) => (
                                  <div className="culture-summary-row" key={row.label}>
                                    <div className="culture-summary-label">{row.label}</div>
                                    <div className="culture-summary-value">{row.value}</div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {hasNonRective && (
                              <div style={{ marginBottom: "0.5rem" }}>
                                <div
                                  style={{
                                    fontWeight: "var(--font-weight-bold)",
                                    marginBottom: "0.2rem",
                                  }}
                                >
                                  Blood Culture for Entric and Non-Entric Organisms:
                                </div>
                                <div className="text-center" style={{ whiteSpace: "pre-wrap" }}>
                                  {cultureResult.nonRective}
                                </div>
                              </div>
                            )}

                            {hasAntibiogramData && (
                              <>
                                <div
                                  style={{
                                    textAlign: "center",
                                    fontWeight: "var(--font-weight-bold)",
                                    fontSize: "var(--font-size-base)",
                                    letterSpacing: "0.1em",
                                    margin: "0.75rem 0 0.5rem",
                                  }}
                                >
                                  ANTIBIOGRAM
                                </div>

                                <Table bordered size="sm" className="antibiogram-table">
                                  <thead>
                                    <tr>
                                      <th className="antibiogram-col-header antibiogram-ant-header">
                                        SENSITIVE
                                      </th>
                                      <th className="antibiogram-col-header antibiogram-zone-header-cell">
                                        ZONE
                                        <br />
                                        IN mm
                                      </th>
                                      <th className="antibiogram-col-header antibiogram-ant-header">
                                        MODERATE
                                      </th>
                                      <th className="antibiogram-col-header antibiogram-zone-header-cell">
                                        ZONE
                                        <br />
                                        IN mm
                                      </th>
                                      <th className="antibiogram-col-header antibiogram-ant-header">
                                        RESISTANT
                                      </th>
                                      <th className="antibiogram-col-header antibiogram-zone-header-cell">
                                        ZONE
                                        <br />
                                        IN mm
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {Array.from({ length: maxRows }).map((_, rowIdx) => (
                                      <tr key={rowIdx}>
                                        <td className="antibiogram-ant-cell">{sensitive[rowIdx]?.antName || ""}</td>
                                        <td className="antibiogram-zone-cell">{sensitive[rowIdx]?.value || ""}</td>
                                        <td className="antibiogram-ant-cell">{moderate[rowIdx]?.antName || ""}</td>
                                        <td className="antibiogram-zone-cell">{moderate[rowIdx]?.value || ""}</td>
                                        <td className="antibiogram-ant-cell">{resistant[rowIdx]?.antName || ""}</td>
                                        <td className="antibiogram-zone-cell">{resistant[rowIdx]?.value || ""}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </Table>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          className="print-action-bar d-flex justify-content-between align-items-center"
          style={{
            padding: "0.75rem 1rem",
            borderTop: "1px solid #e5e5e5",
            marginTop: "0.5rem",
            flexShrink: 0,
          }}
        >
          <Button size="sm" onClick={onBack} className="theme-outline-btn-primary">
            Back to Test List
          </Button>
          <ReactToPrint
            trigger={() => (
              <Button size="sm" className="theme-btn-primary">
                Print / Download
              </Button>
            )}
            content={() => printRef.current}
            pageStyle={`
              @page {
                size: A4;
                margin: 4.7cm 1.1cm 2.5cm 1.1cm;
              }
              @media print {
                body {
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
              }
            `}
          />
        </div>
      </div>
    </>
  );
};

export default DuplicateCultureResult;
