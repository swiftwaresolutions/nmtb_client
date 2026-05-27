import React from 'react';
import { Modal, Button } from 'react-bootstrap';

interface ProcedureTemplate {
  id: number;
  name: string;
  description: string;
}

interface ProcedureTemplateModalProps {
  show: boolean;
  onHide: () => void;
  templates: ProcedureTemplate[];
  onSelectTemplate?: (template: ProcedureTemplate) => void;
}

const ProcedureTemplateModal: React.FC<ProcedureTemplateModalProps> = ({
  show,
  onHide,
  templates,
  onSelectTemplate
}) => {
  const themePrimary = 'var(--page-primary-color)';
  const themeSecondary = 'var(--page-secondary-color)';

  const handleTemplateClick = (template: ProcedureTemplate) => {
    if (onSelectTemplate) {
      onSelectTemplate(template);
    }
  };

  const filteredTemplates = templates.filter((template: any) => template.isActive === true);

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="bg-light border-bottom">
        <Modal.Title>Procedure Templates</Modal.Title>
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
                  e.currentTarget.style.backgroundColor = themeSecondary;
                  const h6 = e.currentTarget.querySelector('h6');
                  const small = e.currentTarget.querySelector('small');
                  if (h6) h6.style.color = themePrimary;
                  if (small) small.style.color = themePrimary;
                }}
                onClick={() => handleTemplateClick(template)}
              >
                <h6 className="mb-1 fw-bold" style={{ color: themePrimary }}>​{template.name}</h6>
                {/* <small className="text-muted">{template.description}</small> */}
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

export default ProcedureTemplateModal;
