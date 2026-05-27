import React, { useState } from 'react';
import { Button, Card, Col, Form, Row, Spinner, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicroscope, faSearch, faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import PageHeader from '../../../components/PageHeader';
import { showValidationError } from '../../../utils/alertUtil';

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface SubResult {
  label: string;
  value: string;
}

interface TestEntry {
  specimen: string;
  testName: string;
  results: SubResult[];
  prescriptionDetails: string;
}

interface TestDateGroup {
  date: string;
  tests: TestEntry[];
}

interface PatientRecord {
  name: string;
  age: string;
  sex: string;
  opNo: string;
  groups: TestDateGroup[];
}

interface RenderRow {
  key: string;
  dateValue?: string;
  dateRowspan?: number;
  specimenValue?: string;
  specimenRowspan?: number;
  testNameValue?: string;
  testNameRowspan?: number;
  resultLabel: string;
  resultValue: string;
  prescriptionValue?: string;
  prescriptionRowspan?: number;
}

// ─── Dummy Data ───────────────────────────────────────────────────────────────

const DUMMY_PATIENTS: Record<string, PatientRecord> = {
  '321873': {
    name: 'MRS. MUTHU PEACHI', age: '32.08 Years', sex: 'F', opNo: '321873',
    groups: [
      {
        date: '05/01/2026',
        tests: [
          {
            specimen: 'Urine', testName: 'URINE COMPLETE EXAMINATION',
            results: [
              { label: 'URINE COMPLETE EXAMINATION', value: '-' },
              { label: 'Urine albumin', value: 'NIL' },
              { label: 'URINE SUGAR', value: 'NIL' },
              { label: 'URINE ACETONE', value: 'NEGATIVE' },
              { label: 'BILE SALT', value: 'NEGATIVE' },
              { label: 'BILE PIGMENT', value: 'NEGATIVE' },
              { label: 'UROBILINOGEN', value: 'NORMAL' },
              { label: 'SPECIFIC GRAVITY', value: '1.020' },
              { label: 'PH', value: '6.0' },
              { label: 'RBC', value: 'NIL' },
              { label: 'WBC', value: '1-2' },
              { label: 'EPITHELIAL CELLS', value: '0-2' },
              { label: 'CASTS', value: 'NIL' },
              { label: 'CRYSTALS', value: 'NIL' },
              { label: 'ANY OTHER', value: 'NIL' },
            ],
            prescriptionDetails: '',
          },
          { specimen: 'Urine', testName: 'container', results: [], prescriptionDetails: '' },
        ],
      },
      {
        date: '06/01/2026',
        tests: [
          {
            specimen: 'Blood', testName: 'CBC',
            results: [
              { label: 'RBC', value: '4.48' },
              { label: 'HAEMOGLOBIN', value: '11.8' },
              { label: 'P.C.V', value: '39.0' },
              { label: 'WBC', value: '17260' },
              { label: 'MCV', value: '87.0' },
              { label: 'MCH', value: '26.3' },
              { label: 'MCHC', value: '30.3' },
              { label: 'Neutrophils', value: '74.9' },
              { label: 'MIXED', value: '00' },
              { label: 'Lymphocytes', value: '18.0' },
              { label: 'RDW CV', value: '18.5' },
              { label: 'RDW SD', value: '46.5' },
              { label: 'MPV', value: '8.0' },
              { label: 'PDW', value: '00' },
              { label: 'LCR', value: '00' },
              { label: 'Platelet Count', value: '330000' },
              { label: 'LYMPHO COUNT', value: '3110' },
              { label: 'MIXED COUNT', value: '00' },
              { label: 'NEUTRO COUNT', value: '12930' },
            ],
            prescriptionDetails: 'Dr. Rajan - Review after 3 days',
          },
          { specimen: 'Blood', testName: 'NON VACCUTE', results: [], prescriptionDetails: '' },
          { specimen: 'Blood', testName: 'SYRINGE', results: [], prescriptionDetails: '' },
        ],
      },
    ],
  },
  '514488': {
    name: 'K. KIRUTHANYA', age: '45.02 Years', sex: 'M', opNo: '514488',
    groups: [
      {
        date: '11/03/2026',
        tests: [
          {
            specimen: 'Blood', testName: 'LIPID PROFILE',
            results: [
              { label: 'Total Cholesterol', value: '210 mg/dL' },
              { label: 'HDL', value: '42 mg/dL' },
              { label: 'LDL', value: '142 mg/dL (High)' },
              { label: 'VLDL', value: '26 mg/dL' },
              { label: 'Triglycerides', value: '130 mg/dL' },
            ],
            prescriptionDetails: 'Dr. Priya - Tab. Atorvastatin 40mg OD',
          },
          {
            specimen: 'Blood', testName: 'HbA1c',
            results: [
              { label: 'HbA1c', value: '7.2%' },
              { label: 'Interpretation', value: 'Controlled' },
            ],
            prescriptionDetails: 'Dr. Priya - Tab. Metformin 500mg BD',
          },
        ],
      },
    ],
  },
  '620011': {
    name: 'RAVI SHANKAR', age: '58.05 Years', sex: 'M', opNo: '620011',
    groups: [
      {
        date: '10/03/2026',
        tests: [
          {
            specimen: 'Blood', testName: 'RENAL FUNCTION TEST',
            results: [
              { label: 'Blood Urea', value: '28 mg/dL' },
              { label: 'Serum Creatinine', value: '1.1 mg/dL (Normal)' },
              { label: 'Uric Acid', value: '5.8 mg/dL' },
              { label: 'Sodium', value: '138 mEq/L' },
              { label: 'Potassium', value: '4.2 mEq/L' },
            ],
            prescriptionDetails: 'Dr. Kumar - Continue current medications',
          },
          {
            specimen: 'Blood', testName: 'LIVER FUNCTION TEST',
            results: [
              { label: 'Total Bilirubin', value: '0.8 mg/dL' },
              { label: 'SGPT (ALT)', value: '38 U/L (Normal)' },
              { label: 'SGOT (AST)', value: '32 U/L' },
              { label: 'Alkaline Phosphatase', value: '76 U/L' },
              { label: 'Total Protein', value: '7.2 g/dL' },
            ],
            prescriptionDetails: 'Dr. Kumar - Tab. Liv 52 OD',
          },
        ],
      },
      {
        date: '11/03/2026',
        tests: [
          {
            specimen: 'Urine', testName: 'URINE CULTURE & SENSITIVITY',
            results: [
              { label: 'Culture', value: 'No growth after 48 hrs' },
              { label: 'Sensitivity', value: 'Not applicable' },
            ],
            prescriptionDetails: 'Dr. Kumar - No antibiotics required',
          },
        ],
      },
    ],
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildRenderRows(groups: TestDateGroup[]): RenderRow[] {
  const rows: RenderRow[] = [];
  for (const group of groups) {
    const dateRowspan = group.tests.reduce((sum, t) => sum + Math.max(1, t.results.length), 0);
    let isFirstInDate = true;
    for (let ti = 0; ti < group.tests.length; ti++) {
      const test = group.tests[ti];
      const testRowspan = Math.max(1, test.results.length);
      if (test.results.length === 0) {
        rows.push({
          key: `${group.date}-${ti}`,
          dateValue: isFirstInDate ? group.date : undefined,
          dateRowspan: isFirstInDate ? dateRowspan : undefined,
          specimenValue: test.specimen, specimenRowspan: 1,
          testNameValue: test.testName, testNameRowspan: 1,
          resultLabel: '', resultValue: '',
          prescriptionValue: test.prescriptionDetails, prescriptionRowspan: 1,
        });
        isFirstInDate = false;
      } else {
        for (let ri = 0; ri < test.results.length; ri++) {
          const isFirstInTest = ri === 0;
          rows.push({
            key: `${group.date}-${ti}-${ri}`,
            dateValue: (isFirstInDate && isFirstInTest) ? group.date : undefined,
            dateRowspan: (isFirstInDate && isFirstInTest) ? dateRowspan : undefined,
            specimenValue: isFirstInTest ? test.specimen : undefined,
            specimenRowspan: isFirstInTest ? testRowspan : undefined,
            testNameValue: isFirstInTest ? test.testName : undefined,
            testNameRowspan: isFirstInTest ? testRowspan : undefined,
            resultLabel: test.results[ri].label,
            resultValue: test.results[ri].value,
            prescriptionValue: isFirstInTest ? test.prescriptionDetails : undefined,
            prescriptionRowspan: isFirstInTest ? testRowspan : undefined,
          });
          if (isFirstInTest) isFirstInDate = false;
        }
      }
    }
  }
  return rows;
}

// ─── Component ────────────────────────────────────────────────────────────────

const Diagnosis: React.FC = () => {
  const today = new Date().toISOString().split('T')[0];
  const [opNo, setOpNo] = useState('');
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [isLoading, setIsLoading] = useState(false);
  const [record, setRecord] = useState<PatientRecord | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!opNo.trim()) { showValidationError('Please enter a Patient OP No.'); return; }
    if (!fromDate || !toDate) { showValidationError('Please select both From Date and To Date.'); return; }
    if (new Date(fromDate) > new Date(toDate)) { showValidationError('From Date cannot be later than To Date.'); return; }
    setIsLoading(true);
    setTimeout(() => {
      setRecord(DUMMY_PATIENTS[opNo.trim()] || null);
      setSearched(true);
      setIsLoading(false);
    }, 400);
  };

  const handleReset = () => {
    setOpNo(''); setFromDate(today); setToDate(today);
    setRecord(null); setSearched(false);
  };

  const fmtDate = (d: string) => {
    try {
      const dt = new Date(d);
      if (isNaN(dt.getTime())) return d;
      return `${String(dt.getDate()).padStart(2, '0')}/${String(dt.getMonth() + 1).padStart(2, '0')}/${dt.getFullYear()}`;
    } catch { return d; }
  };

  const renderRows = record ? buildRenderRows(record.groups) : [];

  return (
    <div>
      <PageHeader
        icon={faMicroscope}
        title="Diagnosis"
        subtitle="View patient test and diagnosis details"
      />

      <Card className="shadow-sm border-0">
        <Card.Body>
          {/* Filter Panel — hidden after submit */}
          {!searched && !isLoading && (
          <div style={{
            background: 'var(--bs-light, #f8f9fa)',
            borderRadius: 'var(--border-radius-sm)',
            border: '1px solid var(--bs-border-color, #dee2e6)',
            padding: '16px 20px',
            marginBottom: '24px',
          }}>
            <Form onSubmit={handleSubmit}>
              <Row className="g-3 align-items-end">
                <Col md={3}>
                  <Form.Group>
                    <Form.Label style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)' }}>
                      Patient OP No
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter OP Number"
                      value={opNo}
                      onChange={e => setOpNo(e.target.value)}
                      style={{ fontSize: 'var(--font-size-base)' }}
                    />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)' }}>
                      Date From
                    </Form.Label>
                    <Form.Control
                      type="date"
                      value={fromDate}
                      onChange={e => setFromDate(e.target.value)}
                      style={{ fontSize: 'var(--font-size-base)' }}
                    />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)' }}>
                      Date To
                    </Form.Label>
                    <Form.Control
                      type="date"
                      value={toDate}
                      onChange={e => setToDate(e.target.value)}
                      style={{ fontSize: 'var(--font-size-base)' }}
                    />
                  </Form.Group>
                </Col>
                <Col md="auto">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      background: 'var(--btn-primary)', border: 'none',
                      fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)',
                      display: 'flex', alignItems: 'center', gap: '6px',
                    }}
                  >
                    {isLoading ? <Spinner animation="border" size="sm" /> : <FontAwesomeIcon icon={faSearch} />}
                    {isLoading ? 'Searching...' : 'Submit'}
                  </Button>
                </Col>
                <Col md="auto">
                  <Button
                    variant="outline-secondary"
                    type="button"
                    onClick={handleReset}
                    disabled={isLoading}
                    style={{ fontSize: 'var(--font-size-base)', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <FontAwesomeIcon icon={faSyncAlt} /> Reset
                  </Button>
                </Col>
              </Row>
            </Form>
          </div>
          )}

          {/* Results */}
          {isLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" style={{ color: 'var(--btn-primary)' }} />
              <div className="mt-2" style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-muted)' }}>
                Searching...
              </div>
            </div>
          ) : searched && record ? (
            <>
              {/* New Search Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={handleReset}
                  style={{ fontSize: 'var(--font-size-sm)', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <FontAwesomeIcon icon={faSyncAlt} /> New Search
                </Button>
              </div>

              {/* Section Title */}
              <div style={{
                fontSize: 'var(--font-size-base)',
                fontWeight: 'var(--font-weight-bold)',
                marginBottom: '12px',
                textAlign: 'center',
                color: 'var(--bs-primary, #0d6efd)',
              }}>
                Patient's All Test Details
              </div>

              {/* Patient Info Bar */}
              <div style={{
                background: 'var(--bs-light, #f8f9fa)',
                border: '1px solid var(--bs-border-color, #dee2e6)',
                borderRadius: 'var(--border-radius-sm)',
                padding: '10px 16px',
                marginBottom: '16px',
              }}>
                <Row className="g-2 align-items-center">
                  <Col md={4}>
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)' }}>Patient Name : </span>
                    <span style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)' }}>{record.name}</span>
                  </Col>
                  <Col md={3}>
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)' }}>Age : </span>
                    <span style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)' }}>{record.age}</span>
                  </Col>
                  <Col md={2}>
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)' }}>Sex : </span>
                    <span style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)' }}>{record.sex}</span>
                  </Col>
                  <Col md={3} className="text-md-end">
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)' }}>
                      Date From <strong>{fmtDate(fromDate)}</strong> To <strong>{fmtDate(toDate)}</strong>
                    </span>
                  </Col>
                </Row>
              </div>

              {/* Test Table */}
              {renderRows.length === 0 ? (
                <div className="text-center py-4" style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-muted)' }}>
                  No test records found for this patient.
                </div>
              ) : (
                <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                  <Table bordered size="sm" style={{ fontSize: 'var(--font-size-base)', marginBottom: 0 }}>
                    <thead style={{
                      position: 'sticky', top: 0, zIndex: 2,
                      background: 'var(--table-header-bg)',
                      color: 'var(--table-header-text)',
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 'var(--font-weight-semibold)',
                    }}>
                      <tr>
                        <th style={{ whiteSpace: 'nowrap', width: 110 }}>Date</th>
                        <th style={{ whiteSpace: 'nowrap', width: 90 }}>Specimen</th>
                        <th style={{ width: 200 }}>Test Name</th>
                        <th>Result</th>
                        <th style={{ width: 220 }}>Prescription Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {renderRows.map(row => (
                        <tr key={row.key}>
                          {row.dateValue !== undefined && (
                            <td
                              rowSpan={row.dateRowspan}
                              style={{ verticalAlign: 'top', whiteSpace: 'nowrap', fontWeight: 'var(--font-weight-semibold)' }}
                            >
                              {row.dateValue}
                            </td>
                          )}
                          {row.specimenValue !== undefined && (
                            <td rowSpan={row.specimenRowspan} style={{ verticalAlign: 'top' }}>
                              {row.specimenValue}
                            </td>
                          )}
                          {row.testNameValue !== undefined && (
                            <td rowSpan={row.testNameRowspan} style={{ verticalAlign: 'top', fontWeight: 'var(--font-weight-medium)' }}>
                              {row.testNameValue}
                            </td>
                          )}
                          <td>
                            {row.resultLabel && (
                              <>
                                <span style={{ fontWeight: 'var(--font-weight-medium)' }}>{row.resultLabel}</span>
                                {row.resultValue
                                  ? <span style={{ color: 'var(--color-muted)' }}> &nbsp;{row.resultValue}</span>
                                  : null}
                              </>
                            )}
                          </td>
                          {row.prescriptionValue !== undefined && (
                            <td rowSpan={row.prescriptionRowspan} style={{ verticalAlign: 'top' }}>
                              {row.prescriptionValue}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </>
          ) : searched && !record ? (
            <div className="text-center py-4">
              <div style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-muted)', marginBottom: '12px' }}>
                No records found for OP No <strong>{opNo}</strong>.
              </div>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={handleReset}
                style={{ fontSize: 'var(--font-size-sm)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <FontAwesomeIcon icon={faSyncAlt} /> New Search
              </Button>
            </div>
          ) : (
            <div className="text-center py-5" style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-muted)' }}>
              Enter a Patient OP No and date range, then click <strong>Submit</strong>.
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default Diagnosis;
