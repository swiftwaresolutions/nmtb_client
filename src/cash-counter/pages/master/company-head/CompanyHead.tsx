import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Container, Form, Row, Spinner, Table } from 'react-bootstrap';
import { faBuilding } from '@fortawesome/free-solid-svg-icons';
import PageHeader from '../../../../components/PageHeader';
import CashCounterApiService from '../../../../api/cash-counter/cash-counter-api-service';
import { showSuccessToast, showErrorToast, showValidationError } from '../../../../utils/alertUtil';

interface StaffCompanyResponse {
  id: number;
  message: string;
  displayId: string;
}

interface AccountHead {
  headId: number;
  headName: string;
  discountHeadId: number;
  discountHeadName: string;
  percentageValue: number;
  salesType: number;
}

const CompanyHead: React.FC = () => {
  const cashCounterApi = new CashCounterApiService();
  const [companyName, setCompanyName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accountHeads, setAccountHeads] = useState<AccountHead[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAccountHeads = async () => {
    setIsLoading(true);
    try {
      const res = await cashCounterApi.fetchAccountHeads();
      setAccountHeads(Array.isArray(res) ? res : []);
    } catch {
      showErrorToast('Failed to load account heads.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccountHeads();
    // eslint-disable-next-line
  }, []);

  const handleSubmit = async () => {
    if (!companyName.trim()) {
      showValidationError('Please enter a Company / Staff Name.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response: StaffCompanyResponse = await cashCounterApi.createStaffCompany(companyName.trim());
      showSuccessToast(response?.message ?? 'Company Head created successfully.');
      setCompanyName('');
      fetchAccountHeads();
    } catch {
      showErrorToast('Failed to create Company Head. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container fluid className="py-3">
      <PageHeader
        icon={faBuilding}
        title="Company Head"
        subtitle="Create a new Company / Staff record"
      />
      <Row className="justify-content-center mt-3">
        <Col md={6} lg={5}>
          <Card className="shadow-sm">
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label style={{ fontWeight: 'var(--font-weight-medium)' }}>
                  Company / Staff Name <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter company or staff name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  disabled={isSubmitting}
                  style={{ fontSize: 'var(--font-size-sm)' }}
                />
              </Form.Group>
              <div className="d-flex justify-content-end">
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="justify-content-center mt-4">
        <Col md={10} lg={8}>
          <Card className="shadow-sm">
            <Card.Header style={{ background: 'var(--card-header-bg, #f8f9fa)', fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)' }}>
              Account Heads
            </Card.Header>
            <Card.Body className="p-0">
              {isLoading ? (
                <div className="d-flex justify-content-center align-items-center py-4">
                  <Spinner animation="border" size="sm" className="me-2" />
                  <span style={{ fontSize: 'var(--font-size-sm)' }}>Loading...</span>
                </div>
              ) : (
                <Table striped bordered hover responsive className="mb-0" style={{ fontSize: 'var(--font-size-sm)' }}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Head Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accountHeads.length === 0 ? (
                      <tr>
                        <td colSpan={2} className="text-center text-muted py-3">No account heads found.</td>
                      </tr>
                    ) : (
                      accountHeads.map((head, index) => (
                        <tr key={head.headId}>
                          <td>{index + 1}</td>
                          <td>{head.headName}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CompanyHead;
