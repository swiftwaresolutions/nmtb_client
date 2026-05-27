import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Col, Form, Row, Spinner, Table } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPrint, faSearch, faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import { useReactToPrint } from 'react-to-print';
import {
  PharmacyStoresApiService,
  SheduledDrugResponse,
} from '../../../api/pharmacy-stores/pharmacy-stores-api-service';
import PrintHeaderReports from '../../../components/PrintHeaderReports';
import ReportHeader from '../../../medical-records/components/ReportHeader';
import { exportToExcel } from '../../../medical-records/utils/reportUtils';
import { RootState } from '../../../state/store';
import { showErrorToast, showValidationError } from '../../../utils/alertUtil';

interface ScheduleTypeOption {
  value: string;
  label: string;
}

interface BillGroup {
  key: string;
  sNo: number;
  billNo: string;
  billDate: string;
  patientName: string;
  doctorName: string;
  items: SheduledDrugResponse[];
}

interface PharmacySessionStoreData {
  masterId?: number;
}

const SCHEDULE_TYPE_OPTIONS: ScheduleTypeOption[] = [
  { value: '1', label: 'H1' },
  { value: '2', label: 'H' },
  { value: '3', label: 'Other' },
];

const getTodayValue = (): string => new Date().toISOString().split('T')[0];

const formatInputDate = (value: string): string => {
  if (!value) {
    return '-';
  }

  const parts = value.split('-');
  if (parts.length !== 3) {
    return value;
  }

  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
};

const formatPrintDate = (value: string): string => {
  if (!value) {
    return '-';
  }

  const parts = value.split('-');
  if (parts.length !== 3) {
    return value;
  }

  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
};

const formatBillDate = (value: string): string => {
  if (!value) {
    return '-';
  }

  const [datePart] = value.split(' ');
  const parts = datePart.split('-');
  if (parts.length !== 3) {
    return value;
  }

  const [day, month, year] = parts;
  return `${day}-${month}-${year}`;
};

const formatExpiryDate = (value: string): string => {
  if (!value) {
    return '-';
  }

  const parts = value.split('-');
  if (parts.length !== 2) {
    return value;
  }

  const [month, year] = parts;
  return `${month}-${year}`;
};

const getScheduleTypeLabel = (value: string): string => {
  const selectedType = SCHEDULE_TYPE_OPTIONS.find((option) => option.value === value);
  return selectedType?.label ?? '-';
};

const ScheduledMedicineSale: React.FC = () => {
  const navigate = useNavigate();
  const pharmacyStoresApi = useMemo(() => new PharmacyStoresApiService(), []);
  const today = getTodayValue();
  const organization = useSelector((state: RootState) => state.appReducer.organization);
  const printRef = useRef<HTMLDivElement>(null);

  const [fromDate, setFromDate] = useState<string>(today);
  const [toDate, setToDate] = useState<string>(today);
  const [fromTime, setFromTime] = useState<string>('00:00');
  const [toTime, setToTime] = useState<string>('23:59');
  const [scheduleTypeId, setScheduleTypeId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [records, setRecords] = useState<SheduledDrugResponse[]>([]);
  const [searched, setSearched] = useState<boolean>(false);

  const groupedRecords = useMemo<BillGroup[]>(() => {
    const groupedMap = new Map<string, BillGroup>();

    records.forEach((record) => {
      const billNo = record.billNo || '-';
      const patientName = record.patientName || '-';
      const doctorName = record.doctorName || '-';
      const billDate = formatBillDate(record.billDateTime || '');
      const key = billNo;

      if (!groupedMap.has(key)) {
        groupedMap.set(key, {
          key,
          sNo: groupedMap.size + 1,
          billNo,
          billDate,
          patientName,
          doctorName,
          items: [],
        });
      }

      groupedMap.get(key)?.items.push(record);
    });

    return Array.from(groupedMap.values());
  }, [records]);

  const totalQuantity = useMemo(
    () => records.reduce((sum, record) => sum + Number(record.units ?? 0), 0),
    [records]
  );

  const printOrganization = useMemo(
    () => ({
      name: organization?.name || '',
      code: organization?.code || '',
      address: organization?.address || '',
      phone: organization?.phoneNo || '',
    }),
    [organization]
  );

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
      .prt-table td { border-right: 1px solid #000 !important; }
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

  const resolveStoreId = (): number => {
    const pharmacyDataStr = sessionStorage.getItem('pharmacySubModuleData');
    const pharmacyData = pharmacyDataStr
      ? (JSON.parse(pharmacyDataStr) as PharmacySessionStoreData)
      : null;
    const storeId = Number(pharmacyData?.masterId ?? 0);

    if (!storeId) {
      showValidationError('Pharmacy store context is missing. Please reselect the store.');
      navigate('/hims/pharmacy-stores', { state: { moduleId: 3 }, replace: true });
      return 0;
    }

    return storeId;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!fromDate || !toDate) {
      showValidationError('Please select both From Date and To Date.');
      return;
    }

    if (!fromTime || !toTime) {
      showValidationError('Please select both From Time and To Time.');
      return;
    }

    if (!scheduleTypeId) {
      showValidationError('Please select a schedule type.');
      return;
    }

    if (new Date(fromDate) > new Date(toDate)) {
      showValidationError('From Date cannot be later than To Date.');
      return;
    }

    if (fromDate === toDate && fromTime > toTime) {
      showValidationError('From Time cannot be later than To Time for the same date.');
      return;
    }

    const storeId = resolveStoreId();
    if (!storeId) {
      return;
    }

    try {
      setIsLoading(true);

      const response = await pharmacyStoresApi.fetchScheduleDrugReport(
        fromDate,
        toDate,
        fromTime,
        toTime,
        storeId,
        Number(scheduleTypeId)
      );

      const reportRows = Array.isArray(response)
        ? response
        : Array.isArray((response as { data?: SheduledDrugResponse[] })?.data)
          ? (response as { data: SheduledDrugResponse[] }).data
          : [];

      setRecords(reportRows);
      setSearched(true);
    } catch (error) {
      console.error('Error fetching scheduled medicine sale report:', error);
      showErrorToast('Failed to fetch scheduled medicine sale report.');
      setRecords([]);
      setSearched(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFromDate(today);
    setToDate(today);
    setFromTime('00:00');
    setToTime('23:59');
    setScheduleTypeId('');
    setRecords([]);
    setSearched(false);
  };

  const handleExport = () => {
    const exportRows = groupedRecords.flatMap((group) =>
      group.items.map((item, index) => ({
        'Si.No': index === 0 ? group.sNo : '',
        'Bill No': index === 0 ? group.billNo : '',
        Date: index === 0 ? group.billDate : '',
        Name: index === 0 ? group.patientName : '',
        'Doctor Name': index === 0 ? group.doctorName : '',
        'Medicine Name': item.medicineName || '-',
        'Batch No': item.batchNo || '-',
        Expiry: formatExpiryDate(item.expiryDate || '-'),
        Qty: Number(item.units ?? 0),
        'Company Name': item.company || '-',
      }))
    );

    exportToExcel(exportRows, 'Scheduled_Medicine_Sale_Report', 'Scheduled Medicine Sale');
  };

  return (
    <div className="d-flex flex-column scheduled-medicine-sale-page">
      <div className="scheduled-medicine-sale-header">
        <ReportHeader
          title="Scheduled Medicine Sale Report"
          subtitle="View scheduled drug sales grouped by bill"
          onExport={handleExport}
          showSearch={false}
          showPrint={false}
          showExport={groupedRecords.length > 0}
        />
      </div>

      <Card className="shadow-sm d-flex flex-column flex-grow-1 scheduled-medicine-sale-card">
        <Card.Header>
          <Form onSubmit={handleSubmit}>
            <Row className="g-3 align-items-end">
              <Col md={2}>
                <Form.Group>
                  <Form.Label>From Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={fromDate}
                    onChange={(event) => setFromDate(event.target.value)}
                    disabled={isLoading}
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label>To Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={toDate}
                    onChange={(event) => setToDate(event.target.value)}
                    disabled={isLoading}
                  />
                </Form.Group>
              </Col>
              <Col md={1}>
                <Form.Group>
                  <Form.Label>From Time</Form.Label>
                  <Form.Control
                    type="time"
                    value={fromTime}
                    onChange={(event) => setFromTime(event.target.value)}
                    disabled={isLoading}
                  />
                </Form.Group>
              </Col>
              <Col md={1}>
                <Form.Group>
                  <Form.Label>To Time</Form.Label>
                  <Form.Control
                    type="time"
                    value={toTime}
                    onChange={(event) => setToTime(event.target.value)}
                    disabled={isLoading}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Type</Form.Label>
                  <Form.Select
                    value={scheduleTypeId}
                    onChange={(event) => setScheduleTypeId(event.target.value)}
                    disabled={isLoading}
                  >
                    <option value="">Select Type</option>
                    {SCHEDULE_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <div className="d-flex gap-2 justify-content-md-end flex-wrap">
                  <Button
                    variant="outline-primary"
                    type="button"
                    disabled={!searched || groupedRecords.length === 0 || isLoading}
                    onClick={handlePrint}
                    className="d-flex align-items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faPrint} />
                    Print
                  </Button>
                  <Button type="submit" disabled={isLoading} className="d-flex align-items-center gap-2">
                    {isLoading ? <Spinner animation="border" size="sm" /> : <FontAwesomeIcon icon={faSearch} />}
                    {isLoading ? 'Loading...' : 'Submit'}
                  </Button>
                  <Button
                    variant="outline-secondary"
                    type="button"
                    onClick={handleReset}
                    disabled={isLoading}
                    className="d-flex align-items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faSyncAlt} />
                    Reset
                  </Button>
                </div>
              </Col>
            </Row>
          </Form>
        </Card.Header>

        <Card.Body className="p-0 d-flex flex-column scheduled-medicine-sale-card-body">
          {isLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
              <div className="mt-2 text-muted">Loading scheduled medicine sale report...</div>
            </div>
          ) : (
            <>
              {/* Print content — outer display:none hides from screen; react-to-print clones only the inner printRef div into its iframe so display:none is not present in the print output */}
              <div style={{ display: 'none' }}>
                <div ref={printRef} className="prt-sheet">
                  <PrintHeaderReports organization={printOrganization} />
                  <div className="prt-title">
                    {`SCHEDULED MEDICINE ${getScheduleTypeLabel(scheduleTypeId).toUpperCase()} BETWEEN ${formatPrintDate(fromDate)} ${fromTime} AND ${formatPrintDate(toDate)} ${toTime}`}
                  </div>
                  <table className="prt-table">
                    <thead>
                      <tr>
                        <th>S.N</th>
                        <th>Bill No</th>
                        <th>Name</th>
                        <th>Doc Name</th>
                        <th>Medicine Name</th>
                        <th>Batch No</th>
                        <th>Expiry</th>
                        <th>Qty</th>
                        <th>Company</th>
                        <th>Signature</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupedRecords.flatMap((group) =>
                        group.items.map((item, index) => (
                          <tr key={`prt-${group.key}-${index}`}>
                            <td>{index === 0 ? group.sNo : ''}</td>
                            <td>{index === 0 ? group.billNo : ''}</td>
                            <td>{index === 0 ? group.patientName : ''}</td>
                            <td>{index === 0 ? group.doctorName : ''}</td>
                            <td>{item.medicineName || '-'}</td>
                            <td>{item.batchNo || '-'}</td>
                            <td>{formatExpiryDate(item.expiryDate || '-')}</td>
                            <td className="prt-qty">{Number(item.units ?? 0)}</td>
                            <td>{item.company || '-'}</td>
                            <td>&nbsp;</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="px-3 py-3 border-bottom">
                <Row className="g-2 align-items-center">
                  <Col md={4}>
                    <div className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>
                      Period: {formatInputDate(fromDate)} - {formatInputDate(toDate)}
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>
                      Time: {fromTime} - {toTime}
                    </div>
                  </Col>
                  <Col md={2}>
                    <div className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>
                      Type: {getScheduleTypeLabel(scheduleTypeId)}
                    </div>
                  </Col>
                  <Col md={3} className="text-md-end">
                    <div className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>
                      Bills: {groupedRecords.length} | Items: {records.length}
                    </div>
                  </Col>
                </Row>
              </div>

              {!searched ? (
                <div className="text-center py-5 text-muted">
                  Select the report filters and click Submit to view scheduled medicine sales.
                </div>
              ) : groupedRecords.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  No scheduled medicine sale records found for the selected filters.
                </div>
              ) : (
                <div className="table-responsive flex-grow-1 scheduled-medicine-sale-table-wrap">
                  <Table className="mb-0 align-middle scheduled-medicine-sale-report-table">
                    <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                      <tr>
                        <th style={{ minWidth: 70 }}>Si.No</th>
                        <th style={{ minWidth: 150 }}>Bill No</th>
                        <th style={{ minWidth: 180 }}>Name</th>
                        <th style={{ minWidth: 180 }}>Doctor Name</th>
                        <th style={{ minWidth: 220 }}>Medicine Name</th>
                        <th style={{ minWidth: 130 }}>Batch No</th>
                        <th style={{ minWidth: 110 }}>Expiry</th>
                        <th style={{ minWidth: 90, textAlign: 'right' }}>Qty</th>
                        <th style={{ minWidth: 180 }}>Company Name</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupedRecords.map((group) =>
                        group.items.map((item, index) => (
                          <tr key={`${group.key}-${index}`}>
                            {index === 0 && (
                              <>
                                <td rowSpan={group.items.length} style={{ textAlign: 'center', verticalAlign: 'top' }}>
                                  {group.sNo}
                                </td>
                                <td rowSpan={group.items.length} style={{ verticalAlign: 'top' }}>
                                  <div style={{ fontWeight: 'var(--font-weight-semibold)' }}>{group.billNo}</div>
                                  <div className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>
                                    {group.billDate}
                                  </div>
                                </td>
                                <td rowSpan={group.items.length} style={{ verticalAlign: 'top' }}>
                                  {group.patientName}
                                </td>
                                <td rowSpan={group.items.length} style={{ verticalAlign: 'top' }}>
                                  {group.doctorName}
                                </td>
                              </>
                            )}
                            <td>{item.medicineName || '-'}</td>
                            <td>{item.batchNo || '-'}</td>
                            <td>{formatExpiryDate(item.expiryDate || '-')}</td>
                            <td style={{ textAlign: 'right' }}>{Number(item.units ?? 0)}</td>
                            <td>{item.company || '-'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'right', fontWeight: 'var(--font-weight-semibold)' }}>
                          Total Quantity
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 'var(--font-weight-semibold)' }}>
                          {totalQuantity.toFixed(2)}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </Table>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      <style>{`
        .scheduled-medicine-sale-page {
          min-height: 0;
        }

        .scheduled-medicine-sale-header {
          flex-shrink: 0;
        }

        .scheduled-medicine-sale-header > div {
          margin-bottom: 1rem !important;
        }

        .scheduled-medicine-sale-card {
          min-height: 0;
        }

        .scheduled-medicine-sale-card-body {
          min-height: 0;
        }

        .scheduled-medicine-sale-table-wrap {
          min-height: 0;
          max-height: 60vh;
          overflow: auto;
        }

        .scheduled-medicine-sale-report-table {
          width: 100%;
          border-collapse: collapse;
          border: 1px solid var(--border-color);
          font-family: 'Times New Roman', Times, serif;
          font-size: var(--font-size-sm);
          margin: 0;
        }

        .scheduled-medicine-sale-report-table thead th {
          text-align: center;
          vertical-align: middle;
          font-weight: var(--font-weight-bold);
          background: var(--table-header-bg);
          color: var(--table-header-text);
          border: 1px solid var(--border-color);
          padding: 4px 6px;
        }

        .scheduled-medicine-sale-report-table tbody td,
        .scheduled-medicine-sale-report-table tfoot td {
          border: 1px solid var(--border-color);
          vertical-align: top;
          padding: 3px 6px;
          line-height: 1.2;
        }

        .scheduled-medicine-sale-report-table tbody tr:hover {
          background: var(--table-hover-bg);
        }
      `}</style>
    </div>
  );
};

export default ScheduledMedicineSale;