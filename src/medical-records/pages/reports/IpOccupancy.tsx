import React, { useState } from 'react';
import { Container, Card, Row, Col, Form, Button, Table, Badge } from 'react-bootstrap';
import ReportHeader from '../../components/ReportHeader';
import '../../styles/reportStyles.css';
import { MedicalRecordsApiService, IpOccupancyItem } from '../../../api/medical-records/medical-records-api-service';
import { showErrorToast } from '../../../utils/alertUtil';
import { useTableSearch } from '../../../hooks/useTableSearch';
import SearchInput from '../../../components/SearchInput';

const apiService = new MedicalRecordsApiService();

export default function IpOccupancy() {
  const today = new Date().toISOString().split('T')[0];
  const [fromDate, setFromDate] = useState<string>(today);
  const [toDate, setToDate] = useState<string>(today);
  const [data, setData] = useState<IpOccupancyItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const { filteredData, searchTerm, setSearchTerm, resultCount, totalCount } = useTableSearch({
    data,
    searchFields: ['patientName', 'ipNo', 'opNo', 'village'],
  });

  const occupiedBeds = data.filter((r) => !r.dischargeDateTime).length;

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const result = await apiService.fetchIpOccupancy(fromDate, toDate);
      setData(result);
      setHasSearched(true);
    } catch (error: any) {
      console.error('IP Occupancy fetch error:', error);
      const msg = error?.response?.data?.message || error?.message || 'Failed to fetch IP occupancy';
      showErrorToast(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFromDate(today);
    setToDate(today);
    setData([]);
    setHasSearched(false);
    setSearchTerm('');
  };

  return (
    <Container fluid className="py-4">
      <ReportHeader
        title="IP Occupancy Between Dates"
        subtitle="Patient Admission and Occupancy Report"
      />

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-bold">From Date</Form.Label>
                <Form.Control
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-bold">To Date</Form.Label>
                <Form.Control
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6} className="d-flex gap-2">
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={isLoading}
                className="fw-bold"
              >
                {isLoading ? 'Loading...' : 'Submit'}
              </Button>
              <Button
                variant="secondary"
                onClick={handleReset}
                disabled={isLoading}
                className="fw-bold"
              >
                Reset
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {hasSearched && (
        <>
          <Row className="mb-3 align-items-center">
            <Col md={8} className="d-flex gap-3 align-items-center flex-wrap">
              <Badge bg="primary" className="fs-6">
                Total Records: {totalCount}
              </Badge>
              <Badge bg="warning" text="dark" className="fs-6">
                Occupied Beds: {occupiedBeds}
              </Badge>
              <Badge bg="success" className="fs-6">
                Discharged: {totalCount - occupiedBeds}
              </Badge>
            </Col>
            <Col md={4}>
              <SearchInput
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                placeholder="Search by name, IP No, OP No..."
                resultCount={resultCount}
                totalCount={totalCount}
              />
            </Col>
          </Row>

          <div className="table-responsive mb-4">
            <Table striped bordered hover className="reportTable">
              <thead className="table-dark">
                <tr>
                  <th style={{ width: '5%' }}>S.No</th>
                  <th style={{ width: '10%' }}>IP No.</th>
                  <th style={{ width: '10%' }}>OP No.</th>
                  <th style={{ width: '20%' }}>Patient Name</th>
                  <th style={{ width: '15%' }}>Village</th>
                  <th style={{ width: '20%' }}>Admit Date/Time</th>
                  <th style={{ width: '20%' }}>Discharge Date/Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((record, index) => (
                    <tr key={index}>
                      <td className="text-center">{index + 1}</td>
                      <td className="text-center">{record.ipNo}</td>
                      <td className="text-center">{record.opNo}</td>
                      <td>{record.patientName}</td>
                      <td>{record.village}</td>
                      <td className="text-center">{record.admitDateTime ?? '-'}</td>
                      <td className="text-center">
                        {record.dischargeDateTime ? (
                          record.dischargeDateTime
                        ) : (
                          <Badge bg="warning" text="dark">
                            Currently Occupied
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center text-muted py-4">
                      No records found for the selected date range.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </>
      )}
    </Container>
  );
}
