import React, { useState } from 'react';
import { Table, Accordion, Badge } from 'react-bootstrap';
import { Calendar3, ChevronDown, ChevronRight, CurrencyRupee } from 'react-bootstrap-icons';

interface BillItem {
  slNo: number;
  type: string;
  billNo: string;
  mrp: number;
  disc: number;
  total: number;
  date: string;
  time: string;
  user: string;
  status: string;
}

const IPBillDetails: React.FC = () => {
  // Mock data for the items shown in the screenshots (PHA, LAB, SER)
  const items: BillItem[] = [
    { slNo: 1, type: 'PHA-[N]', billNo: 'PH-20251103-0106', mrp: 181.61, disc: 0, total: 181.61, date: '03-Nov-2025', time: '01:06 PM', user: 'LEENA VARGHESE', status: 'Credited - ANJALI S' },
    { slNo: 2, type: 'PHA-[N]', billNo: 'PH-20251103-0107', mrp: 20.77, disc: 0, total: 20.77, date: '03-Nov-2025', time: '01:06 PM', user: 'LEENA VARGHESE', status: 'Credited - ANJALI S' },
    { slNo: 3, type: 'LAB-[N]', billNo: 'LB-20251103-0108', mrp: 90.00, disc: 0, total: 90.00, date: '03-Nov-2025', time: '01:09 PM', user: 'LEENA VARGHESE', status: 'Credited - ASA P' },
    { slNo: 4, type: 'LAB-[N]', billNo: 'LB-20251103-0109', mrp: 100.00, disc: 0, total: 100.00, date: '03-Nov-2025', time: '01:09 PM', user: 'LEENA VARGHESE', status: 'Credited - ASA P' },
    { slNo: 5, type: 'SER-[N]', billNo: 'SN-20251104-0902', mrp: 700.00, disc: 0, total: 700.00, date: '04-Nov-2025', time: '09:02 AM', user: 'NISHA U', status: 'Service - Nursing' },
    { slNo: 6, type: 'SER-[N]', billNo: 'SN-20251104-0903', mrp: 500.00, disc: 0, total: 500.00, date: '04-Nov-2025', time: '09:02 AM', user: 'NISHA U', status: 'Service - Nursing' },
    { slNo: 7, type: 'SER-[N]', billNo: 'SN-20251104-0904', mrp: 250.00, disc: 0, total: 250.00, date: '04-Nov-2025', time: '09:02 AM', user: 'NISHA U', status: 'Service - Nursing' },
  ];

  // Group items by date
  const groupedByDate = items.reduce((acc, item) => {
    if (!acc[item.date]) {
      acc[item.date] = [];
    }
    acc[item.date].push(item);
    return acc;
  }, {} as Record<string, BillItem[]>);

  // Get sorted dates (newest first)
  const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });

  // State to track which accordions are open (default: first date open)
  const [activeKeys, setActiveKeys] = useState<string[]>([sortedDates[0] || '']);

  const toggleAccordion = (date: string) => {
    setActiveKeys(prev => 
      prev.includes(date) 
        ? prev.filter(k => k !== date) 
        : [...prev, date]
    );
  };

  const getTypeBadgeClass = (type: string) => {
    if (type.includes('PHA')) return 'bg-info text-dark';
    if (type.includes('LAB')) return 'bg-success text-white';
    if (type.includes('SER')) return 'bg-primary text-white';
    return 'bg-secondary text-white';
  };

  const getTypeLabel = (type: string) => {
    if (type.includes('PHA')) return 'Pharmacy';
    if (type.includes('LAB')) return 'Laboratory';
    if (type.includes('SER')) return 'Service';
    return 'Other';
  };

  const totalAmt = items.reduce((acc, item) => acc + item.total, 0);

  return (
    <div className="d-flex flex-column h-100 bg-light">
      {/* Date-wise Accordion Section */}
      <div className="flex-grow-1 overflow-auto p-2" style={{ scrollbarWidth: 'thin' }}>
        {sortedDates.map((date, dateIdx) => {
          const dateItems = groupedByDate[date];
          const dateTotal = dateItems.reduce((sum, item) => sum + item.total, 0);
          const isOpen = activeKeys.includes(date);
          
          // Count by type
          const typeCounts = dateItems.reduce((acc, item) => {
            const typeKey = getTypeLabel(item.type);
            acc[typeKey] = (acc[typeKey] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

          return (
            <div key={date} className="mb-2">
              {/* Date Header - Clickable */}
              <div 
                className={`d-flex align-items-center justify-content-between p-2 rounded cursor-pointer ${isOpen ? 'bg-primary text-white' : 'bg-white border'}`}
                onClick={() => toggleAccordion(date)}
                style={{ 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isOpen ? '0 2px 8px rgba(13, 110, 253, 0.3)' : '0 1px 3px rgba(0,0,0,0.1)'
                }}
              >
                <div className="d-flex align-items-center gap-2">
                  {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  <Calendar3 size={14} />
                  <span className="fw-bold" style={{ fontSize: '0.85rem' }}>{date}</span>
                  <Badge bg={isOpen ? 'light' : 'primary'} text={isOpen ? 'primary' : 'white'} className="ms-1" style={{ fontSize: '0.65rem' }}>
                    {dateItems.length} Bill{dateItems.length > 1 ? 's' : ''}
                  </Badge>
                  {/* Type badges */}
                  <div className="d-flex gap-1 ms-2">
                    {Object.entries(typeCounts).map(([type, count]) => (
                      <Badge 
                        key={type} 
                        bg={isOpen ? 'light' : type === 'Pharmacy' ? 'info' : type === 'Laboratory' ? 'success' : 'primary'} 
                        text={isOpen ? (type === 'Pharmacy' ? 'info' : type === 'Laboratory' ? 'success' : 'primary') : (type === 'Pharmacy' ? 'dark' : 'white')}
                        style={{ fontSize: '0.6rem', fontWeight: 500 }}
                      >
                        {type}: {count}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="d-flex align-items-center gap-1">
                  <CurrencyRupee size={12} />
                  <span className="fw-bold" style={{ fontSize: '0.9rem' }}>{dateTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Collapsible Content */}
              {isOpen && (
                <div 
                  className="bg-white border border-top-0 rounded-bottom overflow-hidden"
                  style={{ 
                    animation: 'slideDown 0.2s ease-out',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}
                >
                  <Table hover size="sm" className="mb-0 align-middle" style={{ fontSize: '0.72rem' }}>
                    <thead className="bg-light text-muted text-uppercase" style={{ fontSize: '0.6rem' }}>
                      <tr>
                        <th className="ps-3 py-2" style={{ width: '40px' }}>#</th>
                        <th className="py-2" style={{ width: '70px' }}>Type</th>
                        <th className="py-2">Bill No</th>
                        <th className="text-end py-2" style={{ width: '90px' }}>Amount</th>
                        <th className="text-center py-2" style={{ width: '80px' }}>Time</th>
                        <th className="py-2" style={{ width: '120px' }}>User</th>
                        <th className="pe-3 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dateItems.map((item, idx) => (
                        <tr key={idx} className="border-bottom" style={{ transition: 'background-color 0.15s' }}>
                          <td className="ps-3 text-muted">{idx + 1}</td>
                          <td>
                            <Badge 
                              className={`${getTypeBadgeClass(item.type)} bg-opacity-75`} 
                              style={{ fontSize: '0.58rem', fontWeight: 'bold' }}
                            >
                              {item.type}
                            </Badge>
                          </td>
                          <td className="fw-semibold text-dark" style={{ fontSize: '0.7rem' }}>{item.billNo}</td>
                          <td className="text-end fw-bold text-success">₹{item.total.toFixed(2)}</td>
                          <td className="text-center text-muted" style={{ whiteSpace: 'nowrap', fontSize: '0.68rem' }}>{item.time}</td>
                          <td className="text-truncate text-muted" style={{ maxWidth: '120px', fontSize: '0.68rem' }} title={item.user}>{item.user}</td>
                          <td className="pe-3">
                            <span 
                              className={`text-truncate d-inline-block ${item.status.includes('Credited') ? 'text-primary' : 'text-secondary'}`} 
                              style={{ maxWidth: '140px', fontSize: '0.65rem' }} 
                              title={item.status}
                            >
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    {/* Date subtotal row */}
                    <tfoot className="bg-light">
                      <tr>
                        <td colSpan={3} className="ps-3 py-2 fw-bold text-muted" style={{ fontSize: '0.7rem' }}>
                          Date Total ({dateItems.length} items)
                        </td>
                        <td className="text-end py-2 fw-bold text-primary" style={{ fontSize: '0.75rem' }}>
                          ₹{dateTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td colSpan={3}></td>
                      </tr>
                    </tfoot>
                  </Table>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Grand Total Footer */}
      <div 
        className="border-top bg-white px-3 py-2 d-flex justify-content-between align-items-center"
        style={{ boxShadow: '0 -2px 8px rgba(0,0,0,0.08)' }}
      >
        <div className="d-flex align-items-center gap-3">
          <span className="text-muted" style={{ fontSize: '0.75rem' }}>
            <strong>{sortedDates.length}</strong> Date{sortedDates.length > 1 ? 's' : ''} • <strong>{items.length}</strong> Bill{items.length > 1 ? 's' : ''}
          </span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="text-muted fw-semibold" style={{ fontSize: '0.8rem' }}>GRAND TOTAL:</span>
          <span className="fw-bold text-primary" style={{ fontSize: '1.1rem' }}>
            ₹{totalAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Add CSS animation */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 500px;
          }
        }
      `}</style>
    </div>
  );
};

export default IPBillDetails;
