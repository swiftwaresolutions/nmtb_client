import React from 'react';
import '../styles/reportStyles.css';

interface ReportKPICardProps {
    label: string;
    value: number | string;
    variant?: 'primary' | 'info' | 'danger' | 'success' | 'warning';
    icon?: React.ReactNode;
    className?: string;
}

/**
 * Reusable KPI Card Component for Reports
 * Displays key metrics with colored border accents
 */
const ReportKPICard: React.FC<ReportKPICardProps> = ({
    label,
    value,
    variant = 'primary',
    icon,
    className = ''
}) => {
    const getBorderClass = () => {
        switch (variant) {
        case 'primary': return 'kpi-border-left';
        case 'info': return 'border-info-left';
        case 'danger': return 'border-danger-left';
        case 'success': return 'border-success-left';
        case 'warning': return 'border-warning-left';
        default: return 'kpi-border-left';
        }
    };

    const getTextColor = () => {
        switch (variant) {
        case 'primary': return 'text-primary';
        case 'info': return 'text-info';
        case 'danger': return 'text-danger';
        case 'success': return 'text-success';
        case 'warning': return 'text-warning';
        default: return 'text-primary';
        }
    };

    return (
        <div className={`report-card ${getBorderClass()} p-2 h-100 ${className}`}>
        <div className={`text-xs fw-bold ${getTextColor()} text-uppercase mb-1`}>
            {/* {icon && <span className="me-1">{icon}</span>} */}
            {label}
        </div>
        <div className="h4 mb-0 fw-bold text-gray-800">{value}</div>
        </div>
    );
};

export default ReportKPICard;
