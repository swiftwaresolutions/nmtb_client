import React, { useEffect, useState } from 'react';
import { Badge, Button, Card, Col, Container, Form, Row, Table } from 'react-bootstrap';
import ReportHeader from '../../components/ReportHeader';
import '../../styles/reportStyles.css';
import { MedicalRecordsApiService, VillageWiseListItem } from '../../../api/medical-records/medical-records-api-service';
import { showErrorToast } from '../../../utils/alertUtil';
import { useTableSearch } from '../../../hooks/useTableSearch';
import SearchInput from '../../../components/SearchInput';

const apiService = new MedicalRecordsApiService();

interface IVillage {
  id: number;
  name: string;
}

export default function VillageWiseList() {
  const today = new Date().toISOString().split('T')[0];

  const [villages, setVillages] = useState<IVillage[]>([]);
  const [villageId, setVillageId] = useState<number>(0);
  const [fromDate, setFromDate] = useState<string>(today);
  const [toDate, setToDate] = useState<string>(today);
  const [data, setData] = useState<VillageWiseListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const { filteredData, searchTerm, setSearchTerm, resultCount, totalCount } = useTableSearch({
    data,
    searchFields: ['patientName', 'opNo', 'visitDate'],
  });

  const selectedVillageName = villages.find((v) => v.id === villageId)?.name ?? '';

  useEffect(() => {
    apiService.fetchAllVillages().then((res) => {
      const list: IVillage[] = Array.isArray(res) ? res : [];
      setVillages(list);
      if (list.length > 0) setVillageId(list[0].id);
    }).catch(() => showErrorToast('Failed to load villages'));
  }, []);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const result = await apiService.fetchVillageWiseList(villageId, fromDate, toDate);
      setData(result);
      setHasSearched(true);
    } catch {
      showErrorToast('Failed to fetch village-wise report');
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
    if (villages.length > 0) setVillageId(villages[0].id);
  };

  return (
    <Container fluid className="py-4">
      <ReportHeader title="Village Wise Report" subtitle="Procedure-wise patient details by village" />

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Row className="g-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-bold">Select Village</Form.Label>
                <Form.Select
                  value={villageId}
                  onChange={(e) => setVillageId(Number(e.target.value))}
                >
                  {villages.map((village) => (
                    <option key={village.id} value={village.id}>
                      {village.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-bold">From Date</Form.Label>
                <Form.Control
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-bold">To Date</Form.Label>
                <Form.Control
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4} className="d-flex align-items-end gap-2">
              <Button variant="primary" className="fw-bold" onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Submit'}
              </Button>
              <Button variant="secondary" className="fw-bold" onClick={handleReset} disabled={isLoading}>
                Reset
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {hasSearched && (
        <>
          <Row className="mb-3 align-items-center">
            <Col md={6}>
              <h5 className="mb-0">Details - {selectedVillageName}</h5>
            </Col>
            <Col md={3}>
              <Badge bg="primary" className="fs-6">
                Total Patients: {filteredData.length}
              </Badge>
            </Col>
            <Col md={3}>
              <SearchInput
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                placeholder="Search by name, OP No..."
                resultCount={resultCount}
                totalCount={totalCount}
              />
            </Col>
          </Row>

          <div className="table-responsive mb-3" id="print_content">
            <Table bordered hover className="reportTable">
              <thead className="table-dark">
                <tr>
                  <th style={{ width: '10%' }}>S.No</th>
                  <th style={{ width: '45%' }}>Patient Name</th>
                  <th style={{ width: '25%' }}>Visit Date</th>
                  <th style={{ width: '20%' }}>OP No.</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((row, index) => (
                    <tr key={index}>
                      <td className="text-center">{index + 1}</td>
                      <td>{row.patientName}</td>
                      <td className="text-center">{row.visitDate}</td>
                      <td className="text-center">{row.opNo}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center text-muted py-4">
                      No village-wise records found for selected date range.
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

