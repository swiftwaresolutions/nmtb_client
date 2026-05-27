import React, { useState } from "react";
import { Card, Container, Row, Col, Form, Button, Table, Badge } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDays, faUser, faSearch } from "@fortawesome/free-solid-svg-icons";
import ReportHeader from "../../components/ReportHeader";
import "../../styles/reportStyles.css";

interface WorkDetail {
  slNo: number;
  opNumber: string;
  patientName: string;
  time: string;
  description: string;
}

interface UserWorkData {
  [key: number]: WorkDetail[];
}

const USERS = [
  { id: 0, name: "Select User" },
  { id: 1, name: "Rajesh Kumar (Receptionist)" },
  { id: 2, name: "Priya Singh (Nurse)" },
  { id: 3, name: "Amit Patel (Lab Technician)" },
  { id: 4, name: "Neha Sharma (Billing Staff)" },
  { id: 5, name: "Vikram Desai (Attendant)" },
];

// Demo data for user work details
const USER_WORK_DATA: UserWorkData = {
  1: [
    { slNo: 1, opNumber: "OP1001", patientName: "Rajan Kumar", time: "09:15 AM", description: "Registration Complete" },
    { slNo: 2, opNumber: "OP1002", patientName: "Meena Devi", time: "09:45 AM", description: "Patient Waiting" },
    { slNo: 3, opNumber: "OP1003", patientName: "Suresh Babu", time: "10:20 AM", description: "Doctor Consultation" },
    { slNo: 4, opNumber: "OP1004", patientName: "Kavitha S", time: "11:00 AM", description: "Test Assigned" },
    { slNo: 5, opNumber: "OP1005", patientName: "Murugan P", time: "11:30 AM", description: "Test Completed" },
    { slNo: 6, opNumber: "OP1006", patientName: "Anand R", time: "12:00 PM", description: "Bill Generated" },
    { slNo: 7, opNumber: "OP1007", patientName: "Saranya P", time: "12:45 PM", description: "Patient Discharged" },
  ],
  2: [
    { slNo: 1, opNumber: "OP2001", patientName: "Lakshmi M", time: "08:30 AM", description: "Vitals Recorded" },
    { slNo: 2, opNumber: "OP2002", patientName: "Ramesh G", time: "09:00 AM", description: "Medicine Dispensed" },
    { slNo: 3, opNumber: "OP2003", patientName: "Suneetha K", time: "09:45 AM", description: "Injection Given" },
    { slNo: 4, opNumber: "OP2004", patientName: "Venkat R", time: "10:30 AM", description: "Dressing Done" },
    { slNo: 5, opNumber: "OP2005", patientName: "Divya N", time: "11:15 AM", description: "Bed Assigned" },
  ],
  3: [
    { slNo: 1, opNumber: "OP3001", patientName: "Harish V", time: "07:30 AM", description: "Sample Collected" },
    { slNo: 2, opNumber: "OP3002", patientName: "Nirmala S", time: "08:15 AM", description: "Test Processing" },
    { slNo: 3, opNumber: "OP3003", patientName: "Rakesh T", time: "09:30 AM", description: "Report Generated" },
    { slNo: 4, opNumber: "OP3004", patientName: "Deepa K", time: "10:45 AM", description: "Sample Verified" },
  ],
  4: [
    { slNo: 1, opNumber: "OP4001", patientName: "Sanjay M", time: "10:00 AM", description: "Invoice Created" },
    { slNo: 2, opNumber: "OP4002", patientName: "Geeta N", time: "10:45 AM", description: "Payment Received" },
    { slNo: 3, opNumber: "OP4003", patientName: "Mahesh L", time: "11:30 AM", description: "Receipt Printed" },
    { slNo: 4, opNumber: "OP4004", patientName: "Pooja D", time: "12:15 PM", description: "Insurance Claim filed" },
    { slNo: 5, opNumber: "OP4005", patientName: "Arun K", time: "01:00 PM", description: "Refund Processed" },
  ],
  5: [
    { slNo: 1, opNumber: "OP5001", patientName: "Yashwant R", time: "08:00 AM", description: "Patient Received" },
    { slNo: 2, opNumber: "OP5002", patientName: "Hemlata N", time: "09:00 AM", description: "File Updated" },
    { slNo: 3, opNumber: "OP5003", patientName: "Sandeep G", time: "10:00 AM", description: "Transport Arranged" },
    { slNo: 4, opNumber: "OP5004", patientName: "Chitra M", time: "11:00 AM", description: "Bed Cleaned" },
  ],
};

const UserWiseWorkDetails: React.FC = () => {
  const today = new Date().toISOString().split("T")[0];
  const [userId, setUserId] = useState<number>(0);
  const [date, setDate] = useState<string>(today);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (userId === 0) {
      alert("Please select a user");
      return;
    }
    setSubmitted(true);
  };

  const handleReset = () => {
    setUserId(0);
    setDate(today);
    setSubmitted(false);
  };

  const userName = USERS.find((u) => u.id === userId)?.name || "";
  const workDetails = submitted && userId !== 0 ? USER_WORK_DATA[userId] || [] : [];
  const totalRecords = workDetails.length;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB");
  };

  return (
    <div className="content-wrapper">
      {/* Header */}
      <ReportHeader
        title="User Wise Work Details"
        subtitle="View user activities and work performed"
      />

      <Container fluid className="px-3 py-3">
        {/* Filter Form */}
        <Card className="shadow-sm border-0 mb-3">
          <Card.Body className="p-3">
            <Row className="g-3 align-items-end">
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold small mb-1">
                    <FontAwesomeIcon icon={faUser} className="me-2 text-primary" />
                    Select User
                  </Form.Label>
                  <Form.Select
                    size="sm"
                    value={userId}
                    onChange={(e) => setUserId(parseInt(e.target.value))}
                  >
                    {USERS.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold small mb-1">
                    <FontAwesomeIcon icon={faCalendarDays} className="me-2 text-primary" />
                    Select Date
                  </Form.Label>
                  <Form.Control
                    type="date"
                    size="sm"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                  
                </Form.Group>
              </Col>
              <Col md="auto" className="d-flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSubmit}
                  className="d-flex align-items-center gap-1"
                >
                  <FontAwesomeIcon icon={faSearch} />
                  Submit
                </Button>
                <Button variant="outline-secondary" size="sm" onClick={handleReset}>
                  Reset
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Results */}
        {submitted && userId !== 0 && (
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white border-bottom py-3 px-3">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div>
                  <h6 className="mb-1 fw-bold text-dark">User Wise Work Details</h6>
                  <small className="text-muted d-block">
                    <FontAwesomeIcon icon={faUser} className="me-1" />
                    User Name: <span className="fo-bold text-primary">{userName}</span>
                  </small>
                  <small className="text-muted d-block">
                    <FontAwesomeIcon icon={faCalendarDays} className="me-1" />
                    Date: <span className="fo-bold text-primary">{formatDate(date)}</span>
                  </small>
                </div>
                <Badge bg="primary" text="white" className="px-3 py-2">
                  Total Records: <span className="fw-bold">{totalRecords}</span>
                </Badge>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              <div style={{ maxHeight: "500px", overflowY: "auto" }}>
                {workDetails.length === 0 ? (
                  <div className="text-center text-muted py-5">
                    <p>No work details found for this user on the selected date</p>
                  </div>
                ) : (
                  <Table bordered hover size="sm" className="mb-0" style={{ fontSize: "0.85rem" }}>
                    <thead className="table-primary" style={{ position: "sticky", top: 0, zIndex: 1 }}>
                      <tr>
                        <th className="text-center" style={{ minWidth: "60px" }}>
                          Sl.No
                        </th>
                        <th style={{ minWidth: "120px" }}>OP Number</th>
                        <th>Patient Name</th>
                        <th className="text-center" style={{ minWidth: "120px" }}>
                          Time
                        </th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workDetails.map((item, index) => (
                        <tr
                          key={index}
                          style={{ backgroundColor: index % 2 === 0 ? "#fbfbfb" : "#ffffff" }}
                        >
                          <td className="text-center fw-semibold text-primary">{item.slNo}</td>
                          <td>&nbsp;&nbsp;{item.opNumber}</td>
                          <td>&nbsp;&nbsp;{item.patientName}</td>
                          <td className="text-center">{item.time}</td>
                          <td>&nbsp;&nbsp;<span className="text-primary">{item.description}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </div>
            </Card.Body>
            <Card.Footer className="bg-light px-3 py-2 text-muted small">
              Total Activities: <span className="fw-bold text-primary">{totalRecords}</span>
            </Card.Footer>
          </Card>
        )}
      </Container>
    </div>
  );
};

export default UserWiseWorkDetails;
