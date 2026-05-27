import React from 'react';
import { Card, Table } from 'react-bootstrap';
import { Search } from 'react-bootstrap-icons';

interface FieldEdit {
  valueEditId: number;
  fieldId: number;
  fieldName: string;
  oldValue: string;
  editedValue: string;
}

interface EditedTest {
  resultEditId: number;
  patId: number;
  patientName: string;
  phone: string;
  sex: string;
  opNo: string;
  billNo: string;
  billEntryDate: string;
  visitId: number;
  testRegId: number;
  testId: number;
  testName: string;
  reason: string;
  editType: string;
  editedUid: number;
  editedUserName: string;
  editDateTime: string;
  fieldEdits: FieldEdit[];
}

interface ResultReEditReportProps {
  hasSearched: boolean;
  reportData: EditedTest[];
  isEditDate: boolean;
}

const ResultReEditReport: React.FC<ResultReEditReportProps> = ({
  hasSearched,
  reportData,
  isEditDate,
}) => {
  return (
    <Card
      className="shadow-sm d-flex flex-column flex-grow-1"
      style={{
        minHeight: 0,
        borderRadius: "8px",
        border: "1px solid #e0e0e0",
      }}
    >
      <Card.Header
        className="flex-shrink-0"
        style={{
          background: "linear-gradient(to right, #f8f9fa, #ffffff)",
          borderBottom: "2px solid #f0f0f0",
        }}
      >
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0" style={{ fontWeight: "600" }}>
            Result Re-Edit Report
          </h5>
        </div>
      </Card.Header>
      <Card.Body
        className="d-flex flex-column flex-grow-1"
        style={{
          minHeight: 0,
          color: "#6c757d",
        }}
      >
        {hasSearched && reportData.length === 0 ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 220,
            }}
          >
            <div className="text-center">
              <Search size={44} color="#dee2e6" className="mb-2" />
              <p className="mb-0">No edited tests found.</p>
            </div>
          </div>
        ) : hasSearched && reportData.length > 0 ? (
          <div
            className="d-flex flex-column flex-grow-1"
            style={{
              minHeight: 0,
              overflow: "auto",
            }}
          >
            <Table hover size="sm" className="mb-0" style={{ fontSize: "0.75rem" }}>
              <thead className="bg-light text-muted text-uppercase sticky-top" style={{ fontSize: "0.65rem", zIndex: 1 }}>
                <tr>
                  <th className="py-2 ps-3" style={{ width: "8%" }}>OP No</th>
                  <th className="py-2" style={{ width: "12%" }}>Patient Name</th>
                  <th className="py-2" style={{ width: "8%" }}>From</th>
                  <th className="py-2" style={{ width: "8%" }}>Bill No</th>
                  <th className="py-2" style={{ width: "10%" }}>Test Name</th>
                  <th className="py-2" style={{ width: "10%" }}>Field Name</th>
                  <th className="py-2" style={{ width: "10%" }}>Old Value</th>
                  <th className="py-2" style={{ width: "10%" }}>Edited Value</th>
                  <th className="py-2" style={{ width: "8%" }}>Reason</th>
                  <th className="py-2" style={{ width: "8%" }}>Edited By</th>
                  <th className="py-2 pe-3" style={{ width: "10%" }}>Edit DateTime</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((test, testIndex) => {
                  const fieldEdits = test.fieldEdits || [];
                  const rowSpan = fieldEdits.length || 1;
                  
                  return fieldEdits.length > 0 ? (
                    fieldEdits.map((field, fieldIndex) => (
                      <tr key={`${testIndex}-${fieldIndex}`} className="border-bottom">
                        {fieldIndex === 0 && (
                          <>
                            <td className="py-2 ps-3" rowSpan={rowSpan}>{test.opNo}</td>
                            <td className="py-2" rowSpan={rowSpan}>{test.patientName}</td>
                            <td className="py-2" rowSpan={rowSpan}>{test.editType === 'R' ? 'Re-Edit' : test.editType === 'E' ? 'Edit' : test.editType}</td>
                            <td className="py-2" rowSpan={rowSpan}>{test.billNo}</td>
                            <td className="py-2 fw-medium" rowSpan={rowSpan}>{test.testName}</td>
                          </>
                        )}
                        <td className="py-2">{field.fieldName}</td>
                        <td className="py-2">{field.oldValue}</td>
                        <td className="py-2 fw-bold text-primary">{field.editedValue}</td>
                        {fieldIndex === 0 && (
                          <>
                            <td className="py-2" rowSpan={rowSpan}>{test.reason}</td>
                            <td className="py-2" rowSpan={rowSpan}>{test.editedUserName}</td>
                            <td className="py-2 pe-3" rowSpan={rowSpan}>
                              {new Date(test.editDateTime).toLocaleString('en-IN', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                              })}
                            </td>
                          </>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr key={testIndex} className="border-bottom">
                      <td className="py-2 ps-3">{test.opNo}</td>
                      <td className="py-2">{test.patientName}</td>
                      <td className="py-2">{test.editType === 'R' ? 'Re-Edit' : test.editType === 'E' ? 'Edit' : test.editType}</td>
                      <td className="py-2">{test.billNo}</td>
                      <td className="py-2 fw-medium">{test.testName}</td>
                      <td className="py-2 text-muted" colSpan={3}>No field edits</td>
                      <td className="py-2">{test.reason}</td>
                      <td className="py-2">{test.editedUserName}</td>
                      <td className="py-2 pe-3">
                        {new Date(test.editDateTime).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-light fw-bold sticky-bottom">
                <tr>
                  <td colSpan={12} className="text-end py-2 pe-3">
                    Total Tests: <span className="text-primary">{reportData.length}</span>
                    {' | '}
                    Total Field Edits: <span className="text-primary">
                      {reportData.reduce((sum, test) => sum + (test.fieldEdits?.length || 0), 0)}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </Table>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 220,
            }}
          >
            <div className="text-center">
              <Search size={44} color="#dee2e6" className="mb-2" />
              <p className="mb-0">
                Select {isEditDate ? "Edit Date" : "Bill Date"} range and click search.
              </p>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default ResultReEditReport;