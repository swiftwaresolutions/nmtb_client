import React, { useState, useMemo } from 'react';
import { Container, Card, Row, Col, Form, Button, Table, Badge } from 'react-bootstrap';
import ReportHeader from '../../components/ReportHeader';
import '../../styles/reportStyles.css';

interface IAgeTypeDeathData {
  ageType: string;
  count: number;
  badgeColor: string;
}

const DEMO_DATA: Record<number, IAgeTypeDeathData[]> = {
  2025: [
    { ageType: 'Neonatal', count: 8, badgeColor: 'danger' },
    { ageType: 'Infant', count: 5, badgeColor: 'warning' },
    { ageType: 'Child', count: 3, badgeColor: 'info' },
    { ageType: 'Adult', count: 24, badgeColor: 'success' },
  ],
  2024: [
    { ageType: 'Neonatal', count: 12, badgeColor: 'danger' },
    { ageType: 'Infant', count: 8, badgeColor: 'warning' },
    { ageType: 'Child', count: 6, badgeColor: 'info' },
    { ageType: 'Adult', count: 31, badgeColor: 'success' },
  ],
  2023: [
    { ageType: 'Neonatal', count: 10, badgeColor: 'danger' },
    { ageType: 'Infant', count: 7, badgeColor: 'warning' },
    { ageType: 'Child', count: 5, badgeColor: 'info' },
    { ageType: 'Adult', count: 28, badgeColor: 'success' },
  ],
};

export default function DeathAgeTypeWise() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const yearOptions = useMemo(() => {
    const years = [];
    for (let i = 1998; i < 2060; i++) {
      years.push(i);
    }
    return years;
  }, []);

  const reportData = useMemo(() => {
    return DEMO_DATA[selectedYear] || DEMO_DATA[2025];
  }, [selectedYear]);

  const totalDeaths = useMemo(() => {
    return reportData.reduce((sum, item) => sum + item.count, 0);
  }, [reportData]);

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setSelectedYear(currentYear);
    setIsSubmitted(false);
  };

  return (
    <Container fluid className="py-4">
      <ReportHeader title="Death Details" subtitle="Age Type Wise Death Statistics" />

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-bold">Select The Year</Form.Label>
                <Form.Select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                >
                  <option value="">-- Select Year --</option>
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6} className="d-flex gap-2">
              <Button
                variant="primary"
                onClick={handleSubmit}
                className="fw-bold"
              >
                Submit
              </Button>
              <Button
                variant="secondary"
                onClick={handleReset}
                className="fw-bold"
              >
                Reset
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {isSubmitted && (
        <div className="table-responsive mb-4">
          <Table bordered hover className="reportTable">
            <thead className="table-dark">
              <tr>
                <th style={{ width: '50%' }}>Age Type</th>
                <th style={{ width: '50%' }} className="text-end">
                  No of Deaths
                </th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((item, index) => (
                <tr key={index}>
                  <td>{item.ageType}</td>
                  <td className="text-end">
                    <Badge bg={item.badgeColor}>{item.count}</Badge>
                  </td>
                </tr>
              ))}
              <tr style={{ backgroundColor: '#222', color: '#fbfdee' }}>
                <td className="fw-bold">Total</td>
                <td className="text-end fw-bold" style={{ color: '#ff4444' }}>
                  {totalDeaths}
                </td>
              </tr>
            </tbody>
          </Table>
        </div>
      )}
    </Container>
  );
}
