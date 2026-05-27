import React from 'react';
import { Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faNotesMedical,
  faFileInvoiceDollar,
  faFlask,
  faUserNurse,
  faMoneyBillWave,
  faWarehouse,
  faRupeeSign,
  faUsers,
  faUserMd,
  faCogs,
  faUserGear,
  faCalendarCheck,
  faCalculator,
  faUserTie,
  faXRay,
} from '@fortawesome/free-solid-svg-icons';
import { ModuleConfig } from '../config/modules.config';

interface ModuleCardProps {
  module: ModuleConfig;
  onClick: (module: ModuleConfig) => void;
}

const iconMap: { [key: string]: any } = {
  'fas fa-notes-medical': faNotesMedical,
  'fas fa-file-invoice-dollar': faFileInvoiceDollar,
  'fas fa-flask': faFlask,
  'fas fa-user-nurse': faUserNurse,
  'fas fa-money-bill-wave': faMoneyBillWave,
  'fas fa-warehouse': faWarehouse,
  'fas fa-rupee-sign': faRupeeSign,
  'fas fa-users': faUsers,
  'fas fa-user-md': faUserMd,
  'fas fa-cogs': faCogs,
  'fas fa-user-gear': faUserGear,
  'fas fa-calendar-check': faCalendarCheck,
  'fas fa-calculator': faCalculator,
  'fas fa-user-tie': faUserTie,
  'fas fa-x-ray': faXRay,
};

const ModuleCard: React.FC<ModuleCardProps> = ({ module, onClick }) => {
  const icon = iconMap[module.iconName] || faCogs;

  return (
    <Card
      className={`module-card ${module.category || ''} slide-up`}
      onClick={() => onClick(module)}
      title={module.description}
    >
      <Card.Body className="module-card-body">
        <h4 className="module-card-title">{module.title}</h4>
        <FontAwesomeIcon icon={icon} className="module-card-icon" />
      </Card.Body>
    </Card>
  );
};

export default ModuleCard;
