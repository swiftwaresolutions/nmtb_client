import React from 'react';
import { Modal, Button } from 'react-bootstrap';

interface LabTemplateTest {
  id: number;
  tempId: number;
  deptId: number;
  testId: number;
  testName: string;
  rate: number;
}

interface LabTemplate {
  id: number;
  name: string;
  isActive: number;
  uid: number;
  entDateTime: string;
  tests: LabTemplateTest[];
}

interface LabTemplateModalProps {
  show: boolean;
  onHide: () => void;
  templates: LabTemplate[];
  onSelectTemplate?: (template: LabTemplate) => void;
}

const LabTemplateModal: React.FC<LabTemplateModalProps> = ({
  show,
  onHide,
  templates,
  onSelectTemplate
}) => {
  const themePrimary = 'var(--page-primary-color)';
  const themeSecondary = 'var(--page-secondary-color)';

  const handleTemplateClick = (template: LabTemplate) => {
    if (onSelectTemplate) {
      onSelectTemplate(template);
    }
  };

  const filteredTemplates = templates.filter((template: any) => template.isActive === 1);

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="bg-light border-bottom">
        <Modal.Title>Lab Test Templates</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {filteredTemplates.length === 0 ? (
          <div className="text-center text-muted py-4">
            <p>No templates available</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {filteredTemplates.map((template) => (
              <div 
                key={template.id} 
                className="p-3 border rounded cursor-pointer"
                style={{ cursor: 'pointer', transition: 'background-color 0.2s, color 0.2s', borderColor: themePrimary }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = themePrimary;
                  const h6 = e.currentTarget.querySelector('h6');
                  const small = e.currentTarget.querySelector('small');
                  if (h6) h6.style.color = themeSecondary;
                  if (small) small.style.color = themeSecondary;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#fff';
                  const h6 = e.currentTarget.querySelector('h6');
                  const small = e.currentTarget.querySelector('small');
                  if (h6) h6.style.color = themePrimary;
                  if (small) small.style.color = '#6c757d';
                }}
                onClick={() => handleTemplateClick(template)}
              >
                <h6 className="mb-1 fw-bold" style={{ color: themePrimary }}>️{template.name}</h6>
                <small className="text-muted">{template.tests?.length || 0} tests</small>
              </div>
            ))}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer className="bg-light">
        <Button size="sm" onClick={onHide} style={{ borderColor: themePrimary, color: themePrimary, backgroundColor: 'transparent' }}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default LabTemplateModal;
