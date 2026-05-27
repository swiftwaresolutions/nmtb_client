import React, { useRef, useState } from 'react';
import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { faFileAlt } from '@fortawesome/free-solid-svg-icons';
import PageHeader from '../../../../components/PageHeader';
import MedicalRecordsApiService, { AfterDischargeResponse } from '../../../../api/medical-records/medical-records-api-service';
import { showErrorToast, showSuccessToast, showValidationError } from '../../../../utils/alertUtil';

interface PatientSummary {
  name: string;
  phone: string;
  dateOfAdmission: string;
  opNo: string;
  ipNo: string;
  dateOfDischarge: string;
}

const medicalRecordsApi = new MedicalRecordsApiService();

const formatDateOnly = (value: string): string => {
  if (!value) {
    return '-';
  }

  const rawValue = value.trim();
  const dateToken = rawValue.split(' ')[0];

  if (/^\d{2}-\d{2}-\d{4}$/.test(dateToken)) {
    return dateToken;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(dateToken)) {
    const [year, month, day] = dateToken.split('-');
    return `${day}-${month}-${year}`;
  }

  const parsedDate = new Date(rawValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  const day = String(parsedDate.getDate()).padStart(2, '0');
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
  const year = String(parsedDate.getFullYear());
  return `${day}-${month}-${year}`;
};

const mapResponseToSummary = (data: AfterDischargeResponse): PatientSummary => ({
  name: data.patientName || '-',
  phone: '-',
  dateOfAdmission: formatDateOnly(data.admittedDateTime),
  opNo: data.opNo || '-',
  ipNo: data.ipNo || '-',
  dateOfDischarge: (() => { const d = formatDateOnly(data.dischargeDateTime); return d === '00-00-0000' ? 'Not Yet Discharge' : d; })(),
});

const AfterDischarge: React.FC = () => {
  const [ipNumber, setIpNumber] = useState<string>('');
  const [searchSubmitted, setSearchSubmitted] = useState<boolean>(false);
  const [isEntryMode, setIsEntryMode] = useState<boolean>(true);
  const [patientSummary, setPatientSummary] = useState<PatientSummary | null>(null);
  const [detailData, setDetailData] = useState<AfterDischargeResponse | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const ipInputRef = useRef<HTMLInputElement>(null);

  const [diagnosis, setDiagnosis] = useState<string>('');
  const [treatment, setTreatment] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [caCheck, setCaCheck] = useState<boolean>(false);

  const loadAfterDischargeDetails = async (ipNo: string) => {
    setIsLoadingDetails(true);
    try {
      const response = await medicalRecordsApi.fetchDetailForAfterDischarge(ipNo);

      if (!response) {
        showErrorToast('No details found for this IP Number');
        setSearchSubmitted(false);
        setPatientSummary(null);
        setDetailData(null);
        setDiagnosis('');
        setTreatment('');
        setResult('');
        return;
      }

      setDetailData(response);
      setPatientSummary(mapResponseToSummary(response));

      const nextDiagnosis = response.diagnosis || '';
      const nextTreatment = response.treatment || '';
      const nextResult = response.result || '';

      setDiagnosis(nextDiagnosis);
      setTreatment(nextTreatment);
      setResult(nextResult);
      setCaCheck(Number(response.caCheckId) === 1);

      const hasExistingData =
        nextDiagnosis.trim().length > 0 ||
        nextTreatment.trim().length > 0 ||
        nextResult.trim().length > 0;

      setIsEntryMode(!hasExistingData);
      setSearchSubmitted(true);
    } catch (error: any) {
      showErrorToast(error?.response?.data?.error || 'Failed to fetch after discharge details');
      setSearchSubmitted(false);
      setPatientSummary(null);
      setDetailData(null);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ipNumber.trim()) {
      showValidationError('Please enter IP Number');
      return;
    }

    await loadAfterDischargeDetails(ipNumber.trim());
  };

  const handleEntrySubmit = async () => {
    if (!detailData) {
      showValidationError('Please fetch patient details first');
      return;
    }

    const numericIpNo = Number(detailData.ipNo || ipNumber);
    if (!numericIpNo) {
      showValidationError('Invalid IP Number. Please fetch details again.');
      return;
    }

    setIsSubmitting(true);
    try {
      await medicalRecordsApi.saveUpdateAfterDischarge({
        ipNo: numericIpNo,
        visitId: Number(detailData.visitId || 0),
        patId: Number(detailData.patId || 0),
        diagnosis,
        treatment,
        result,
        caCheckId: caCheck ? 1 : 0,
      });

      showSuccessToast('After discharge details saved successfully');
      await loadAfterDischargeDetails(String(numericIpNo));
      setIsEntryMode(false);
    } catch (error: any) {
      showErrorToast(error?.response?.data?.error || 'Failed to save after discharge details');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = () => {
    setIsEntryMode(true);
  };

  const handleRefresh = async () => {
    setIpNumber('');
    setSearchSubmitted(false);
    setIsEntryMode(true);
    setPatientSummary(null);
    setDetailData(null);
    setDiagnosis('');
    setTreatment('');
    setResult('');
    setCaCheck(false);
    setTimeout(() => ipInputRef.current?.focus(), 0);
  };

  return (
    <div className="content-wrapper d-flex flex-column" style={{ height: '100vh', overflow: 'hidden' }}>
      <PageHeader
        icon={faFileAlt}
        title="After Discharge"
        subtitle="Capture and review diagnosis, treatment and result details"
      />

      <div className="content-body flex-grow-1" style={{ overflow: 'hidden', padding: '1rem', minHeight: 0 }}>
        <Container fluid className="h-100 d-flex flex-column" style={{ minHeight: 0 }}>
          <Card className="shadow-sm border-0 h-100 d-flex flex-column" style={{ minHeight: 0 }}>
            <Card.Header className="py-3" style={{ backgroundColor: 'var(--bg-white)', borderColor: 'var(--border-color)' }}>
              <Form onSubmit={handleSearchSubmit}>
                <Row className="g-2 align-items-end">
                  <Col xs={12} md={8} lg={4}>
                    <Form.Label
                      className="mb-1"
                      style={{
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: 'var(--font-weight-semibold)',
                        color: 'var(--text-dark)',
                      }}
                    >
                      IP Number
                    </Form.Label>
                    <Form.Control
                      ref={ipInputRef}
                      type="text"
                      value={ipNumber}
                      onChange={(e) => setIpNumber(e.target.value)}
                      placeholder="Enter IP Number"
                      autoFocus
                    />
                  </Col>
                  <Col xs={12} md="auto">
                    <Button
                      type="submit"
                      className="theme-outline-btn-primary"
                      disabled={!ipNumber.trim() || isLoadingDetails}
                    >
                      {isLoadingDetails ? 'Loading...' : 'Submit'}
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Card.Header>

            <Card.Body style={{ backgroundColor: 'var(--bg-main)', overflowY: 'auto', minHeight: 0 }}>
              {!searchSubmitted && (
                <div className="text-center py-5" style={{ color: 'var(--text-muted)' }}>
                  Enter an IP Number and click submit to load diagnosis details.
                </div>
              )}

              {searchSubmitted && patientSummary && (
                <>
                  <div className="mb-4 p-3" style={{ backgroundColor: 'var(--bg-white)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-sm)' }}>
                    <Row className="gy-3">
                      <Col xs={12} md={6}>
                        <div className="d-flex align-items-center">
                          <span className="fw-semibold" style={{ minWidth: '42%', color: 'var(--text-dark)' }}>Name</span>
                          <span className="text-center" style={{ minWidth: '24px', color: 'var(--text-dark)' }}>:</span>
                          <span className="fw-semibold text-break" style={{ color: 'var(--color-info)' }}>{patientSummary.name}</span>
                        </div>
                      </Col>
                      <Col xs={12} md={6}>
                        <div className="d-flex align-items-center">
                          <span className="fw-semibold" style={{ minWidth: '42%', color: 'var(--text-dark)' }}>OPNO</span>
                          <span className="text-center" style={{ minWidth: '24px', color: 'var(--text-dark)' }}>:</span>
                          <span className="fw-semibold text-break" style={{ color: 'var(--color-info)' }}>{patientSummary.opNo}</span>
                        </div>
                      </Col>
                      <Col xs={12} md={6}>
                        <div className="d-flex align-items-center">
                          <span className="fw-semibold" style={{ minWidth: '42%', color: 'var(--text-dark)' }}>Phone</span>
                          <span className="text-center" style={{ minWidth: '24px', color: 'var(--text-dark)' }}>:</span>
                          <span className="fw-semibold text-break" style={{ color: 'var(--color-info)' }}>{patientSummary.phone}</span>
                        </div>
                      </Col>
                      <Col xs={12} md={6}>
                        <div className="d-flex align-items-center">
                          <span className="fw-semibold" style={{ minWidth: '42%', color: 'var(--text-dark)' }}>IP NO</span>
                          <span className="text-center" style={{ minWidth: '24px', color: 'var(--text-dark)' }}>:</span>
                          <span className="fw-semibold text-break" style={{ color: 'var(--color-info)' }}>{patientSummary.ipNo}</span>
                        </div>
                      </Col>
                      <Col xs={12} md={6}>
                        <div className="d-flex align-items-center">
                          <span className="fw-semibold" style={{ minWidth: '42%', color: 'var(--text-dark)' }}>Date Of Admission</span>
                          <span className="text-center" style={{ minWidth: '24px', color: 'var(--text-dark)' }}>:</span>
                          <span className="fw-semibold text-break" style={{ color: 'var(--color-info)' }}>{patientSummary.dateOfAdmission}</span>
                        </div>
                      </Col>
                      <Col xs={12} md={6}>
                        <div className="d-flex align-items-center">
                          <span className="fw-semibold" style={{ minWidth: '42%', color: 'var(--text-dark)' }}>Date Of Discharge</span>
                          <span className="text-center" style={{ minWidth: '24px', color: 'var(--text-dark)' }}>:</span>
                          <span className="fw-semibold text-break" style={{ color: 'var(--color-info)' }}>{patientSummary.dateOfDischarge}</span>
                        </div>
                      </Col>
                    </Row>
                  </div>

                  {isEntryMode ? (
                    <Row className="g-3 align-items-start">
                      <Col xs={12} md={2} className="fw-bold">CA</Col>
                      <Col xs={12} md={10}>
                        <Form.Check
                          type="checkbox"
                          id="ca-check"
                          label="CA"
                          checked={caCheck}
                          onChange={(e) => setCaCheck(e.target.checked)}
                        />
                      </Col>

                      <Col xs={12} md={2} className="fw-bold">Diagnosis</Col>
                      <Col xs={12} md={10}>
                        <Form.Control
                          as="textarea"
                          rows={4}
                          value={diagnosis}
                          onChange={(e) => setDiagnosis(e.target.value)}
                        />
                      </Col>

                      <Col xs={12} md={2} className="fw-bold">Treatment</Col>
                      <Col xs={12} md={10}>
                        <Form.Control
                          as="textarea"
                          rows={4}
                          value={treatment}
                          onChange={(e) => setTreatment(e.target.value)}
                        />
                      </Col>

                      <Col xs={12} md={2} className="fw-bold">Result</Col>
                      <Col xs={12} md={10}>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          value={result}
                          onChange={(e) => setResult(e.target.value)}
                        />
                      </Col>
                    </Row>
                  ) : (
                    <Row className="g-3 align-items-start">
                      {Number(detailData?.caCheckId) === 1 && (
                        <Col xs={12}>
                          <span
                            className="fw-bold"
                            style={{
                              color: 'var(--color-danger)',
                              fontSize: 'var(--font-size-base)',
                              letterSpacing: '0.5px',
                            }}
                          >
                            CA PATIENT
                          </span>
                        </Col>
                      )}

                      <Col xs={12} md={2} className="fw-bold">Diagnosis</Col>
                      <Col xs={12} md={10}>
                        <span className="fw-semibold" style={{ color: 'var(--primary-color)' }}>{diagnosis}</span>
                      </Col>

                      <Col xs={12} md={2} className="fw-bold">Treatment</Col>
                      <Col xs={12} md={10}>
                        <span className="fw-semibold" style={{ color: 'var(--primary-color)' }}>{treatment}</span>
                      </Col>

                      <Col xs={12} md={2} className="fw-bold">Result</Col>
                      <Col xs={12} md={10}>
                        <span className="fw-semibold" style={{ color: 'var(--color-info)' }}>{result}</span>
                      </Col>
                    </Row>
                  )}
                </>
              )}
            </Card.Body>

            <Card.Footer style={{ backgroundColor: 'var(--bg-white)', borderColor: 'var(--border-color)' }}>
              <div className="d-flex justify-content-end align-items-center flex-wrap gap-2">
                {searchSubmitted && isEntryMode && (
                  <Button
                    type="button"
                    className="billing-action-btn billing-save-btn"
                    onClick={handleEntrySubmit}
                    disabled={isSubmitting || isLoadingDetails}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </Button>
                )}

                {searchSubmitted && !isEntryMode && (
                  <Button
                    type="button"
                    className="theme-outline-btn-primary"
                    onClick={handleEdit}
                    disabled={isSubmitting || isLoadingDetails}
                  >
                    Edit
                  </Button>
                )}

                <Button
                  type="button"
                  className="theme-outline-btn-secondary"
                  onClick={handleRefresh}
                  disabled={isLoadingDetails || isSubmitting}
                >
                  Refresh
                </Button>
              </div>
            </Card.Footer>
          </Card>
        </Container>
      </div>
    </div>
  );
};

export default AfterDischarge;