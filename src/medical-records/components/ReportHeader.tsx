import React, { useState, useRef, useEffect } from 'react';
import { Printer, Download, Search, SortAlphaDown, FileEarmarkText } from 'react-bootstrap-icons';
import '../styles/reportStyles.css';

interface ReportHeaderProps {
    title: string;
    subtitle?: string;
    onPrint?: () => void;
    onExport?: () => void;
    onSearch?: (searchTerm: string) => void;
    onSort?: () => void;
    showSearch?: boolean;
    showSort?: boolean;
    showPrint?: boolean;
    showExport?: boolean;
    customActions?: React.ReactNode;
}

/**
 * Reusable Report Header Component
 * Provides consistent header with title, subtitle, and action buttons
 */
const ReportHeader: React.FC<ReportHeaderProps> = ({
    title,
    subtitle,
    onPrint,
    onExport,
    onSearch,
    onSort,
    showSearch = true,
    showSort = false,
    showPrint = true,
    showExport = true,
    customActions
}) => {
    const [searchActive, setSearchActive] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (searchActive) {
            // We use a tiny timeout to ensure the animation/transition 
            // has started and the element is visible before focusing.
            const timer = setTimeout(() => {
            inputRef.current?.focus();
            }, 100); 
            return () => clearTimeout(timer);
        }
        }, [searchActive]);

    const handleSearchToggle = () => {
        setSearchActive(!searchActive);
        if (searchActive) {
        setSearchTerm('');
        onSearch?.('');
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        onSearch?.(value);
    };

    return (
        <div className="d-flex justify-content-between align-items-center mb-4">
            {/* LEFT SIDE: Title Section */}
            <div className="d-flex align-items-start">
                <FileEarmarkText className="me-2 mt-1 fs-2" style={{ color: 'var(--page-header-icon-color)'}} />
                <div className="d-flex flex-column">
                    <h5 className="fw-bold text-gray-800 m-0 text-uppercase" style={{ letterSpacing: '0.4px' }}>
                        {title}
                    </h5>
                    {subtitle && <span className="text-muted small">{subtitle}</span>}
                </div>
            </div>

            {/* RIGHT SIDE: Action Section */}
            <div className="no-print header-actions d-flex align-items-center">
                {showSearch && onSearch && (
                    <div 
                        className="position-relative d-flex align-items-center" 
                        style={{ minHeight: '40px' }}
                    >
                        <input
                            ref={inputRef}
                            onBlur={() => {
                                if (searchTerm === "") {
                                setSearchActive(false);
                                }
                            }}
                            type="text"
                            id="headerSearchInput"
                            className={`search-input ${searchActive ? 'active' : ''}`}
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            style={{
                                width: searchActive ? '250px' : '0',
                                opacity: searchActive ? 1 : 0,
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                padding: searchActive ? '5px 15px 5px 15px' : '6px 0',
                                borderRadius: '20px',
                                border: searchActive ? '1px solid #dee2e6' : 'none',
                                outline: 'none',
                                backgroundColor: '#fff',
                            }}
                        />
                        <Search
                            className="action-icon fs-2"
                            onClick={handleSearchToggle}
                            style={{ 
                                position: searchActive ? 'absolute' : 'static',
                                right: searchActive ? '0px' : 'auto',
                                cursor: 'pointer', 
                                color: searchActive ? '#4e73df' : '#3b3b3b',
                                transition: 'all 0.3s ease',
                                // fontSize: '1.5rem', // Matched fs-2 feel
                                zIndex: 5
                            }}
                        />
                    </div>
                )}

                {/* Other Action Icons */}
                <div 
                    className="d-flex align-items-center gap-2 ms-2" 
                    style={{ 
                        visibility: (searchActive && window.innerWidth < 768) ? 'hidden' : 'visible',
                        transition: 'opacity 0.3s'
                    }}
                >
                    {showPrint && onPrint && (
                        <Printer
                            className="action-icon fs-2"
                            onClick={onPrint}
                            style={{ cursor: 'pointer' }}
                        />
                    )}
                    
                    {showExport && onExport && (
                        <Download
                            className="action-icon fs-2"
                            onClick={onExport}
                            style={{ cursor: 'pointer' }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportHeader;
