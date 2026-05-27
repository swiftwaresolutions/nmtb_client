import React, { useState } from "react";
import { Container, Card, Row, Col, Form, Button, Table } from "react-bootstrap";
import { useSelector } from "react-redux";
import { RootState } from "../../../state/store";
import PageHeader from "../../../components/PageHeader";
import { showErrorToast, showSuccessToast } from "../../../utils/alertUtil";
import { faFileAlt } from "@fortawesome/free-solid-svg-icons";

// TODO: Update component name, icon, and title once data is provided
const TemplatePlaceholder: React.FC = () => {
  const loginData = useSelector((state: RootState) => state.loginData);

  const [formData, setFormData] = useState({
    fromDate: "",
    toDate: "",
    // Add more filters as needed
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGenerateReport = async () => {
    // TODO: Add validation
    if (!formData.fromDate || !formData.toDate) {
      showErrorToast("Please select date range");
      return;
    }

    try {
      setLoading(true);
      // TODO: Call API service to fetch report data
      // const response = await apiService.fetchReportData(formData);
      
      showSuccessToast("Report generated successfully");
    } catch (error: any) {
      console.error("Error generating report:", error);
      showErrorToast(error?.response?.data?.error || "Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    // TODO: Implement Excel export functionality
    showSuccessToast("Export functionality to be implemented");
  };

  return (
    <>
      <PageHeader
        icon={faFileAlt}
        title="Report Template Placeholder"
        subtitle="Update with actual report name once data is provided"
      />
      <Container fluid className="p-4">
        {/* Filter Section */}
        <Card className="shadow-sm mb-4">
          <Card.Header className="bg-primary text-white">
            <h5 className="mb-0">Filter Options</h5>
          </Card.Header>
          <Card.Body>
            <Row className="g-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>From Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="fromDate"
                    value={formData.fromDate}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>To Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="toDate"
                    value={formData.toDate}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4} className="d-flex align-items-end">
                <Button
                  variant="primary"
                  onClick={handleGenerateReport}
                  disabled={loading}
                  className="me-2"
                >
                  {loading ? "Generating..." : "Generate Report"}
                </Button>
                <Button variant="secondary" onClick={handlePrint} className="me-2">
                  <i className="fas fa-print me-2"></i>Print
                </Button>
                <Button variant="success" onClick={handleExport}>
                  <i className="fas fa-file-excel me-2"></i>Export
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Report Section */}
        <Card className="shadow-sm">
          <Card.Body>
            <div className="text-center mb-4">
              <h4>Report Data Will Appear Here</h4>
              <p className="text-muted">
                Configure report structure once data is provided
              </p>
            </div>

            {/* Placeholder Table */}
            <Table striped bordered hover responsive>
              <thead className="table-primary">
                <tr>
                  <th>#</th>
                  <th>Column 1</th>
                  <th>Column 2</th>
                  <th>Column 3</th>
                  <th>Column 4</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={5} className="text-center text-muted">
                    No data to display
                  </td>
                </tr>
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
};

export default TemplatePlaceholder;
