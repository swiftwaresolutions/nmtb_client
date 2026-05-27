import React, { useState } from 'react';
import { Table } from 'react-bootstrap';
import { ArrowDownUp } from 'react-bootstrap-icons';
import '../styles/reportStyles.css';

interface Column<T> {
    key: keyof T | string;
    label: string;
    width?: string;
    sortable?: boolean;
    render?: (value: any, record: T, index: number) => React.ReactNode;
    className?: string;
    headerClassName?: string;
}

interface ReportTableProps<T> {
    data: T[];
    columns: Column<T>[];
    onRowClick?: (record: T, index: number) => void;
    disableRowClick?: (record: T, index: number) => boolean;
    rowClassName?: (record: T, index: number) => string;
    onSort?: (key: string, direction: 'asc' | 'desc') => void;
    responsive?: boolean;
    hover?: boolean;
    striped?: boolean;
    className?: string;
    emptyMessage?: string;
    tfoot?: React.ReactNode;
}

/**
 * Reusable Report Table Component
 * Provides sortable, clickable table with custom rendering
 */
function ReportTable<T extends Record<string, any>>({
    data,
    columns,
    onRowClick,
    disableRowClick,
    rowClassName,
    onSort,
    responsive = true,
    hover = true,
    striped = false,
    className = '',
    emptyMessage = 'No data available',
    tfoot
}: ReportTableProps<T>) {
    const [sortKey, setSortKey] = useState<string>('');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const handleHeaderClick = (column: Column<T>) => {
        if (!column.sortable) return;

        const key = String(column.key);
        const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
        
        setSortKey(key);
        setSortDirection(newDirection);
        onSort?.(key, newDirection);
    };

    const getValue = (record: T, key: string): any => {
        return record[key];
    };

    return (
        <div className={responsive ? 'table-responsive' : ''} style={{ maxHeight: 'inherit' }}>
        <Table
            className={`table-hims mb-0 ${hover ? 'table-hover' : ''} ${striped ? 'table-striped' : ''} ${className}
                        text-nowrap`}
            style={{ marginBottom: 0 }}
        >
            <thead style={{
            position: 'sticky',
            top: 0,
            backgroundColor: '#f8f9fa',
            zIndex: 10,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            borderBottom: '2px solid #dee2e6'
            }}>
            <tr>
                {columns.map((column, idx) => (
                <th
                    key={idx}
                    className={column.headerClassName || ''}
                    onClick={() => handleHeaderClick(column)}
                    style={{
                    cursor: column.sortable ? 'pointer' : 'default',
                    backgroundColor: '#e9ecef',
                    borderBottom: '2px solid #dee2e6',
                    position: 'sticky',
                    top: 0,
                    zIndex: 11,
                    ...(column.width ? { minWidth: column.width, width: column.width } : {})
                    }}
                >
                    {column.label}
                    {column.sortable && (
                    <ArrowDownUp
                        className={`sort-indicator ms-1 ${sortKey === column.key ? 'active' : ''}`}
                    />
                    )}
                </th>
                ))}
            </tr>
            </thead>
            <tbody>
            {data.length === 0 ? (
                <tr>
                <td colSpan={columns.length} className="text-center py-4">
                    <div className="report-empty-state">
                    <i className="bi bi-inbox"></i>
                    <div>{emptyMessage}</div>
                    </div>
                </td>
                </tr>
            ) : (
                data.map((record, rowIdx) => {
                const isClickDisabled = disableRowClick?.(record, rowIdx) || false;
                const customRowClass = rowClassName?.(record, rowIdx) || '';
                
                return (
                <tr
                    key={rowIdx}
                    onClick={() => !isClickDisabled && onRowClick?.(record, rowIdx)}
                    className={customRowClass}
                    style={{ cursor: customRowClass ? undefined : (isClickDisabled ? 'not-allowed' : (onRowClick ? 'pointer' : 'default')) }}
                >
                    {columns.map((column, colIdx) => {
                    const value = getValue(record, String(column.key));
                    return (
                        <td key={colIdx} className={column.className || ''}>
                        {column.render ? column.render(value, record, rowIdx) : value}
                        </td>
                    );
                    })}
                </tr>
                );
                })
            )}
            </tbody>
            {tfoot && <tfoot>{tfoot}</tfoot>}
        </Table>
        </div>
    );
}

export default ReportTable;
