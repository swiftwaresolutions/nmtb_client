import React from 'react';
import { Card } from 'react-bootstrap';
import { FaUndo } from 'react-icons/fa';

const FaUndoIcon = FaUndo as any;

const ReturnBilling: React.FC = () => {
  return (
    <Card className="border-0 shadow-sm" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <Card.Body className="d-flex align-items-center justify-content-center">
        <div className="text-center text-muted">
          <FaUndoIcon size={48} className="mb-3 opacity-25" />
          <h4>Return Billing Module</h4>
          <p>This module is currently under development.</p>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ReturnBilling;
