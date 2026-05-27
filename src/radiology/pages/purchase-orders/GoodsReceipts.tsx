import React from "react";
import { Container, Card } from "react-bootstrap";
import PageHeader from "../../../components/PageHeader";
import { faBoxOpen } from "@fortawesome/free-solid-svg-icons";

const GoodsReceipts: React.FC = () => {
  return (
    <Container fluid className="p-4">
      <PageHeader
        icon={faBoxOpen}
        title="Goods Receipts"
        subtitle="View and manage goods receipt records"
      />

      <Card className="shadow-sm mt-4">
        <Card.Header className="bg-light">
          <h5 className="mb-0">Goods Receipts Register</h5>
        </Card.Header>
        <Card.Body>
          <p className="text-muted">
            Content will be implemented here...
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default GoodsReceipts;
