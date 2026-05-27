import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

export interface BadgeInfo {
  label: string;
  value: string | number;
}

interface PageHeaderProps {
  icon: IconDefinition;
  title: string;
  subtitle: string;
  badges?: BadgeInfo[];
}

const PageHeader: React.FC<PageHeaderProps> = ({ icon, title, subtitle, badges = [] }) => {
  return (
    <div className="pr-3 mb-3">
      <div style={{ background: 'var(--page-header-bg)', position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} className="shadow-sm mb-1">
        <div className="py-3 px-3">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ background: 'var(--page-header-icon-bg)', color: 'var(--page-header-icon-color)', width: '40px', height: '40px' }}>
                <FontAwesomeIcon icon={icon} />
              </div>
              <div>
                <h5 className="mb-0 fw-bold" style={{ color: 'var(--page-header-text)' }}>{title}</h5>
                <small style={{ color: 'var(--page-header-subtitle)' }}>{subtitle}</small>
              </div>
            </div>
            {badges.length > 0 && (
              <div className="d-flex gap-2">
                {badges.map((badge, index) => (
                  <div key={index} className="d-flex align-items-center" style={{ 
                    background: 'var(--page-header-badge-bg)', 
                    color: 'var(--page-header-badge-text)',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '0.813rem',
                    border: '1px solid rgba(0,0,0,0.08)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                  }}>
                    <span style={{ opacity: 0.65, marginRight: '6px', fontWeight: 'var(--font-weight-medium)' }}>{badge.label}:</span>
                    <span style={{ fontWeight: 'var(--font-weight-normal)' }}>{badge.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
