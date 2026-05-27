import React, { useMemo } from "react";
import { Card, Table } from "react-bootstrap";
import { Search } from "react-bootstrap-icons";

export interface RegisterTest {
  testRegId: number;
  testName: string;
  testId: number;
}

export interface RegisterBill {
  labBillId: number;
  age: string;
  entDateTime: string;
  tests: RegisterTest[];
}

export interface RegisterPatient {
  opNo: string;
  patId: number;
  name: string;
  secondName: string;
  sex: string;
  phone: string;
  bills: RegisterBill[];
}

interface RegisterProps {
  hasSearched: boolean;
  loading: boolean;
  fromDate: string;
  toDate: string;
  reportData: RegisterPatient[];
  loadAllDetails: boolean;
  testDetailsMap: Record<number, any[]>;
}

const Register: React.FC<RegisterProps> = ({
  hasSearched,
  loading,
  fromDate,
  toDate,
  reportData,
  loadAllDetails,
  testDetailsMap,
}) => {
  const groupedRows = useMemo(() => {
    return reportData.map((patient) => {
      const bills = patient.bills || [];
      const billGroups = bills.map((bill) => {
        const tests = bill.tests || [];
        
        // Calculate row count based on whether details are loaded
        let billRowCount = 0;
        tests.forEach((test) => {
          if (loadAllDetails) {
            const testDetails = test.testRegId ? testDetailsMap[test.testRegId] || [] : [];
            billRowCount += Math.max(testDetails.length, 1);
          } else {
            billRowCount += 1;
          }
        });
        
        return {
          bill,
          rowCount: Math.max(billRowCount, 1),
        };
      });

      const patientRowCount = Math.max(
        billGroups.reduce((sum, item) => sum + item.rowCount, 0),
        1
      );

      return {
        patient,
        billGroups,
        patientRowCount,
      };
    });
  }, [reportData, loadAllDetails, testDetailsMap]);

  const totalRows = useMemo(() => {
    return groupedRows.reduce((sum, group) => sum + group.patientRowCount, 0);
  }, [groupedRows]);

  return (
    <Card
      className="shadow-sm"
      style={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        borderRadius: "8px",
        border: "1px solid #e0e0e0",
      }}
    >

      <Card.Body style={{ flex: 1, minHeight: 0, padding: 0, overflow: "auto" }}>
        {!hasSearched ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 220,
              color: "#6c757d",
            }}
          >
            <div className="text-center">
              <Search size={44} color="#dee2e6" className="mb-2" />
              <p className="mb-0">Select From Date and To Date to search.</p>
            </div>
          </div>
        ) : loading ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 220,
              color: "#6c757d",
            }}
          >
            <div className="text-center">
              <div className="spinner-border text-primary mb-2" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mb-0">Loading register report...</p>
            </div>
          </div>
        ) : totalRows === 0 ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 220,
              color: "#6c757d",
            }}
          >
            <div className="text-center">
              <Search size={44} color="#dee2e6" className="mb-2" />
              <p className="mb-0">
                No records found for <strong>{fromDate}</strong> to{" "}
                <strong>{toDate}</strong>
              </p>
            </div>
          </div>
        ) : (
          <Table striped bordered hover size="sm">
            <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
              <tr>
                <th>#</th>
                <th style={{ minWidth: 260 }}>Patient Detail</th>
                <th style={{ minWidth: 220 }}>Bill No, Date, Time</th>
                <th style={{ minWidth: 260 }}>Test Name</th>
                {loadAllDetails && (
                  <>
                    <th style={{ minWidth: 200 }}>Field Name</th>
                    <th style={{ minWidth: 150 }}>Result Value</th>
                    <th style={{ minWidth: 100 }}>Unit</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {groupedRows.flatMap((group, groupIndex) => {
                const { patient, billGroups, patientRowCount } = group;

                if (billGroups.length === 0) {
                  return [
                    <tr key={`patient-empty-${groupIndex}`}>
                      <td className="text-center">{groupIndex + 1}</td>
                      <td
                        rowSpan={1}
                        style={{ verticalAlign: "middle", fontWeight: 500 }}
                      >
                        <div><strong>{[patient.name, patient.secondName].filter(Boolean).join(" ") || "-"}</strong></div>
                        <div>OP No: {patient.opNo || "-"}</div>
                        <div>Sex: {patient.sex || "-"}</div>
                        <div>Phone: {patient.phone || "-"}</div>
                      </td>
                      <td>-</td>
                      <td>-</td>
                      {loadAllDetails && (
                        <>
                          <td>-</td>
                          <td>-</td>
                          <td>-</td>
                        </>
                      )}
                    </tr>
                  ];
                }

                return billGroups.flatMap((billGroup, billIndex) => {
                  const tests = billGroup.bill.tests?.length
                    ? billGroup.bill.tests
                    : [{ testName: "-", testRegId: 0, testId: 0 }];

                  return tests.flatMap((test, testIndex) => {
                    // Get test details if loadAllDetails is enabled
                    const testDetails = loadAllDetails && test.testRegId 
                      ? testDetailsMap[test.testRegId] || []
                      : [];

                    const hasDetails = testDetails.length > 0;
                    const detailRows = hasDetails ? testDetails : [null];

                    return detailRows.map((detail, detailIndex) => (
                      <tr key={`p-${groupIndex}-b-${billIndex}-t-${testIndex}-d-${detailIndex}`}>
                        {billIndex === 0 && testIndex === 0 && detailIndex === 0 && (
                          <td className="text-center" rowSpan={patientRowCount} style={{ verticalAlign: "middle", fontWeight: 500 }}>
                            {groupIndex + 1}
                          </td>
                        )}
                        {billIndex === 0 && testIndex === 0 && detailIndex === 0 && (
                          <td
                            rowSpan={patientRowCount}
                            style={{ verticalAlign: "middle", fontWeight: 500 }}
                          >
                            <div><strong>{[patient.name, patient.secondName].filter(Boolean).join(" ") || "-"}</strong></div>
                            <div>OP No: {patient.opNo || "-"}</div>
                            <div>Sex: {patient.sex || "-"}</div>
                            <div>Phone: {patient.phone || "-"}</div>
                          </td>
                        )}
                        {testIndex === 0 && detailIndex === 0 && (
                          <td rowSpan={billGroup.rowCount} style={{ verticalAlign: "middle" }}>
                            <div>Bill No: {billGroup.bill.labBillId || "-"}</div>
                            <div>
                              Date:{" "}
                              {billGroup.bill.entDateTime
                                ? new Date(billGroup.bill.entDateTime).toLocaleString("en-IN", {
                                    year: "numeric",
                                    month: "short",
                                    day: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "-"}
                            </div>
                            <div>Age: {billGroup.bill.age || "-"}</div>
                          </td>
                        )}
                        {detailIndex === 0 && (
                          <td rowSpan={detailRows.length} style={{ verticalAlign: "middle" }}>{test.testName || "-"}</td>
                        )}
                        {loadAllDetails && (
                          <>
                            <td>{detail?.fieldName || (detailIndex === 0 && !hasDetails ? "Result not yet entered" : "")}</td>
                            <td>{detail?.resultValue || "-"}</td>
                            <td>{detail?.unit || "-"}</td>
                          </>
                        )}
                      </tr>
                    ));
                  });
                });
              })}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  );
};

export default Register;
