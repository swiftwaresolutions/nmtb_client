import React, { useState } from 'react';
import { Button, Card, Col, Form, Row, Spinner, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLayerGroup, faSearch, faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import PageHeader from '../../../components/PageHeader';
import { showValidationError } from '../../../utils/alertUtil';

// ─── Interface ───────────────────────────────────────────────────────────────

interface MedicineRow {
  sNo: number;
  medicineName: string;
  totalQuantity: number;
  totalValue: number;
}

// ─── Dummy Data ───────────────────────────────────────────────────────────────

const CATEGORIES = [
  'Antibiotics', 'Analgesics', 'Antacids', 'Antihistamines',
  'Capsules', 'Injections', 'Powder', 'Syrup', 'Tablets', 'Vitamins',
];

// Category → Letter → MedicineRow[]
const DUMMY_DATA: Record<string, Record<string, MedicineRow[]>> = {
  Antibiotics: {
    A: [
      { sNo: 1, medicineName: 'Amoxicillin 250mg',              totalQuantity: 540, totalValue: 8642.00 },
      { sNo: 2, medicineName: 'Amoxicillin-Clavulanate 625mg',  totalQuantity: 320, totalValue: 18560.00 },
      { sNo: 3, medicineName: 'Azithromycin 500mg',             totalQuantity: 210, totalValue: 12600.00 },
      { sNo: 4, medicineName: 'Ampicillin 500mg Inj',           totalQuantity: 180, totalValue: 5400.00 },
    ],
    C: [
      { sNo: 1, medicineName: 'Ciprofloxacin 500mg',            totalQuantity: 460, totalValue: 9660.00 },
      { sNo: 2, medicineName: 'Cefixime 200mg',                 totalQuantity: 380, totalValue: 14440.00 },
      { sNo: 3, medicineName: 'Clindamycin 300mg',              totalQuantity: 150, totalValue: 9750.00 },
      { sNo: 4, medicineName: 'Ceftriaxone 1g Inj',             totalQuantity: 200, totalValue: 22000.00 },
    ],
    D: [
      { sNo: 1, medicineName: 'Doxycycline 100mg',              totalQuantity: 290, totalValue: 5510.00 },
    ],
    E: [
      { sNo: 1, medicineName: 'Erythromycin 500mg',             totalQuantity: 170, totalValue: 6460.00 },
    ],
    M: [
      { sNo: 1, medicineName: 'Metronidazole 400mg',            totalQuantity: 520, totalValue: 6760.00 },
      { sNo: 2, medicineName: 'Moxifloxacin 400mg',             totalQuantity: 140, totalValue: 16800.00 },
    ],
    N: [
      { sNo: 1, medicineName: 'Norfloxacin 400mg',              totalQuantity: 250, totalValue: 5250.00 },
    ],
    T: [
      { sNo: 1, medicineName: 'Tetracycline 500mg',             totalQuantity: 190, totalValue: 3990.00 },
    ],
  },
  Analgesics: {
    A: [
      { sNo: 1, medicineName: 'Aspirin 75mg',                   totalQuantity: 800, totalValue: 4000.00 },
      { sNo: 2, medicineName: 'Aceclofenac 100mg',              totalQuantity: 420, totalValue: 8820.00 },
    ],
    D: [
      { sNo: 1, medicineName: 'Diclofenac 50mg',                totalQuantity: 560, totalValue: 8400.00 },
      { sNo: 2, medicineName: 'Dicyclomine 10mg',               totalQuantity: 200, totalValue: 3000.00 },
    ],
    I: [
      { sNo: 1, medicineName: 'Ibuprofen 400mg',                totalQuantity: 730, totalValue: 10950.00 },
    ],
    K: [
      { sNo: 1, medicineName: 'Ketorolac 30mg/ml Inj',          totalQuantity: 160, totalValue: 9600.00 },
    ],
    N: [
      { sNo: 1, medicineName: 'Naproxen 500mg',                 totalQuantity: 310, totalValue: 7130.00 },
    ],
    P: [
      { sNo: 1, medicineName: 'Paracetamol 500mg',              totalQuantity: 1200, totalValue: 12000.00 },
      { sNo: 2, medicineName: 'Paracetamol 650mg',              totalQuantity: 960,  totalValue: 11520.00 },
      { sNo: 3, medicineName: 'Piroxicam 20mg',                 totalQuantity: 220,  totalValue: 5500.00 },
    ],
    T: [
      { sNo: 1, medicineName: 'Tramadol 50mg',                  totalQuantity: 340, totalValue: 11900.00 },
    ],
  },
  Antacids: {
    O: [
      { sNo: 1, medicineName: 'Omeprazole 20mg',                totalQuantity: 680, totalValue: 8160.00 },
      { sNo: 2, medicineName: 'Ondansetron 4mg',                totalQuantity: 400, totalValue: 6000.00 },
    ],
    P: [
      { sNo: 1, medicineName: 'Pantoprazole 40mg',              totalQuantity: 580, totalValue: 10440.00 },
      { sNo: 2, medicineName: 'Pan-D Capsule',                  totalQuantity: 350, totalValue: 8750.00 },
    ],
    R: [
      { sNo: 1, medicineName: 'Ranitidine 150mg',               totalQuantity: 440, totalValue: 5720.00 },
      { sNo: 2, medicineName: 'Rabeprazole 20mg',               totalQuantity: 360, totalValue: 7920.00 },
    ],
  },
  Powder: {
    B: [
      { sNo: 1, medicineName: 'Baby Powder 100g',               totalQuantity: 120, totalValue: 3600.00 },
      { sNo: 2, medicineName: 'Boric Acid Powder 100g',         totalQuantity: 80,  totalValue: 2400.00 },
    ],
    C: [
      { sNo: 1, medicineName: 'Clotrimazole Dusting Powder',    totalQuantity: 95,  totalValue: 4275.00 },
    ],
    K: [
      { sNo: 1, medicineName: 'KMnO4 Powder 10g',              totalQuantity: 60,  totalValue: 1800.00 },
    ],
    T: [
      { sNo: 1, medicineName: 'Talcum Antiseptic Powder 100g',  totalQuantity: 140, totalValue: 4200.00 },
      { sNo: 2, medicineName: 'Tinidazole Pow Sachets',         totalQuantity: 75,  totalValue: 2250.00 },
    ],
    Z: [
      { sNo: 1, medicineName: 'Zinc Oxide Powder 50g',          totalQuantity: 55,  totalValue: 1650.00 },
    ],
  },
  Syrup: {
    A: [
      { sNo: 1, medicineName: 'Ambroxol Syrup 100ml',           totalQuantity: 240, totalValue: 7200.00 },
    ],
    C: [
      { sNo: 1, medicineName: 'Cetrizine Syrup 60ml',           totalQuantity: 180, totalValue: 3600.00 },
      { sNo: 2, medicineName: 'Clavam 228mg/5ml Syrup',         totalQuantity: 130, totalValue: 9100.00 },
    ],
    P: [
      { sNo: 1, medicineName: 'Paracetamol Syrup 60ml',         totalQuantity: 310, totalValue: 6200.00 },
    ],
    S: [
      { sNo: 1, medicineName: 'Salbutamol Syrup 100ml',         totalQuantity: 170, totalValue: 5100.00 },
    ],
  },
  Tablets: {
    A: [
      { sNo: 1, medicineName: 'Atorvastatin 40mg',              totalQuantity: 500, totalValue: 10000.00 },
      { sNo: 2, medicineName: 'Amlodipine 5mg',                 totalQuantity: 450, totalValue: 6750.00 },
      { sNo: 3, medicineName: 'Atenolol 50mg',                  totalQuantity: 390, totalValue: 5070.00 },
    ],
    M: [
      { sNo: 1, medicineName: 'Metformin 500mg',                totalQuantity: 720, totalValue: 8640.00 },
      { sNo: 2, medicineName: 'Metoprolol 25mg',                totalQuantity: 330, totalValue: 5280.00 },
    ],
    R: [
      { sNo: 1, medicineName: 'Rosuvastatin 10mg',              totalQuantity: 410, totalValue: 10250.00 },
    ],
    T: [
      { sNo: 1, medicineName: 'Telmisartan 40mg',               totalQuantity: 480, totalValue: 9600.00 },
      { sNo: 2, medicineName: 'Thyronorm 50mcg',                totalQuantity: 620, totalValue: 7440.00 },
    ],
  },
  Vitamins: {
    B: [
      { sNo: 1, medicineName: 'B-Complex Tablet',               totalQuantity: 580, totalValue: 5800.00 },
      { sNo: 2, medicineName: 'Biotin 5mg',                     totalQuantity: 200, totalValue: 6000.00 },
    ],
    C: [
      { sNo: 1, medicineName: 'Calcium + Vitamin D3 500mg',     totalQuantity: 460, totalValue: 11500.00 },
      { sNo: 2, medicineName: 'Cyanocobalamine Inj (B12)',      totalQuantity: 220, totalValue: 8800.00 },
    ],
    V: [
      { sNo: 1, medicineName: 'Vitamin C 500mg',                totalQuantity: 640, totalValue: 6400.00 },
      { sNo: 2, medicineName: 'Vitamin E 400 IU',               totalQuantity: 280, totalValue: 8400.00 },
    ],
    Z: [
      { sNo: 1, medicineName: 'Zinc Sulphate 20mg',             totalQuantity: 320, totalValue: 4800.00 },
    ],
  },
  Capsules: {
    D: [
      { sNo: 1, medicineName: 'Doxycycline 100mg Cap',          totalQuantity: 270, totalValue: 5130.00 },
      { sNo: 2, medicineName: 'Duloxetine 30mg Cap',            totalQuantity: 150, totalValue: 9750.00 },
    ],
    O: [
      { sNo: 1, medicineName: 'Omeprazole 20mg Cap',            totalQuantity: 510, totalValue: 6120.00 },
    ],
    P: [
      { sNo: 1, medicineName: 'Pregabalin 75mg Cap',            totalQuantity: 380, totalValue: 19000.00 },
    ],
  },
  Injections: {
    A: [
      { sNo: 1, medicineName: 'Amikacin 500mg Inj',             totalQuantity: 190, totalValue: 9500.00 },
    ],
    D: [
      { sNo: 1, medicineName: 'Dexamethasone 4mg Inj',          totalQuantity: 260, totalValue: 6760.00 },
      { sNo: 2, medicineName: 'Diclofenac 75mg Inj',            totalQuantity: 340, totalValue: 8500.00 },
    ],
    H: [
      { sNo: 1, medicineName: 'Hydrocortisone 100mg Inj',       totalQuantity: 180, totalValue: 9000.00 },
    ],
    I: [
      { sNo: 1, medicineName: 'I.Kamadol - 100 mg/2ml',         totalQuantity: 215, totalValue: 12900.00 },
      { sNo: 2, medicineName: 'Insulin Actrapid 100IU/ml',      totalQuantity: 90,  totalValue: 9000.00 },
    ],
    T: [
      { sNo: 1, medicineName: 'Tramadol 100mg/2ml Inj',         totalQuantity: 300, totalValue: 10500.00 },
    ],
  },
  Antihistamines: {
    C: [
      { sNo: 1, medicineName: 'Cetirizine 10mg',                totalQuantity: 680, totalValue: 6800.00 },
      { sNo: 2, medicineName: 'Chlorpheniramine 4mg',           totalQuantity: 420, totalValue: 4200.00 },
    ],
    F: [
      { sNo: 1, medicineName: 'Fexofenadine 120mg',             totalQuantity: 360, totalValue: 10800.00 },
    ],
    L: [
      { sNo: 1, medicineName: 'Levocetirizine 5mg',             totalQuantity: 520, totalValue: 10400.00 },
      { sNo: 2, medicineName: 'Loratadine 10mg',                totalQuantity: 290, totalValue: 5800.00 },
    ],
    M: [
      { sNo: 1, medicineName: 'Montelukast 10mg',               totalQuantity: 410, totalValue: 14350.00 },
    ],
  },
};

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// ─── Component ───────────────────────────────────────────────────────────────

const CategoryWiseMedicine: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [activeCategory, setActiveCategory] = useState('');
  const [selectedLetter, setSelectedLetter] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) { showValidationError('Please select a Category.'); return; }
    setIsLoading(true);
    setTimeout(() => {
      setActiveCategory(selectedCategory);
      setSelectedLetter('');
      setSearched(true);
      setIsLoading(false);
    }, 400);
  };

  const handleReset = () => {
    setSelectedCategory('');
    setSearched(false);
    setActiveCategory('');
    setSelectedLetter('');
  };

  const categoryData = DUMMY_DATA[activeCategory] ?? {};
  const availableLetters = new Set(Object.keys(categoryData));
  const rows: MedicineRow[] = selectedLetter ? (categoryData[selectedLetter] ?? []) : [];
  const totalQty = rows.reduce((s, r) => s + r.totalQuantity, 0);
  const totalVal = rows.reduce((s, r) => s + r.totalValue, 0);

  return (
    <div>
      <PageHeader
        icon={faLayerGroup}
        title="Category Wise Medicine"
        subtitle="View medicine details grouped by category"
      />

      <Card className="shadow-sm border-0">
        <Card.Body>

          {/* ── Filter Panel ── */}
          {!searched && !isLoading && (
            <div style={{
              background: 'var(--bs-light, #f8f9fa)',
              borderRadius: 'var(--border-radius-sm)',
              border: '1px solid var(--bs-border-color, #dee2e6)',
              padding: '16px 20px',
              marginBottom: '24px',
            }}>
              <Form onSubmit={handleSubmit}>
                <Row className="g-3 align-items-end">
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)' }}>
                        Select Category
                      </Form.Label>
                      <Form.Select
                        value={selectedCategory}
                        onChange={e => setSelectedCategory(e.target.value)}
                        style={{ fontSize: 'var(--font-size-base)' }}
                      >
                        <option value="">-- Select Category --</option>
                        {CATEGORIES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md="auto">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      style={{
                        background: 'var(--btn-primary)', border: 'none',
                        fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)',
                        display: 'flex', alignItems: 'center', gap: '6px',
                      }}
                    >
                      {isLoading ? <Spinner animation="border" size="sm" /> : <FontAwesomeIcon icon={faSearch} />}
                      {isLoading ? 'Loading...' : 'Submit'}
                    </Button>
                  </Col>
                  <Col md="auto">
                    <Button
                      variant="outline-secondary"
                      type="button"
                      onClick={handleReset}
                      disabled={isLoading}
                      style={{ fontSize: 'var(--font-size-base)', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <FontAwesomeIcon icon={faSyncAlt} /> Reset
                    </Button>
                  </Col>
                </Row>
              </Form>
            </div>
          )}

          {/* ── Loading ── */}
          {isLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" style={{ color: 'var(--btn-primary)' }} />
              <div className="mt-2" style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-muted)' }}>Loading...</div>
            </div>

          /* ── A–Z + Table ── */
          ) : searched ? (
            <>
              {/* Toolbar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--bs-primary, #0d6efd)' }}>
                  Category Wise Medicine Report
                </div>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={handleReset}
                  style={{ fontSize: 'var(--font-size-sm)', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <FontAwesomeIcon icon={faSyncAlt} /> New Search
                </Button>
              </div>

              {/* Category badge */}
              <div style={{
                background: 'var(--bs-light, #f8f9fa)',
                border: '1px solid var(--bs-border-color, #dee2e6)',
                borderRadius: 'var(--border-radius-sm)',
                padding: '8px 16px',
                marginBottom: '16px',
                fontSize: 'var(--font-size-base)',
              }}>
                <span style={{ color: 'var(--color-muted)' }}>Category : </span>
                <span style={{ fontWeight: 'var(--font-weight-bold)' }}>{activeCategory}</span>
              </div>

              {/* A–Z Letter Buttons */}
              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: '6px',
                marginBottom: '20px',
                padding: '12px 16px',
                background: 'var(--bs-light, #f8f9fa)',
                borderRadius: 'var(--border-radius-sm)',
                border: '1px solid var(--bs-border-color, #dee2e6)',
              }}>
                {ALPHABET.map(letter => {
                  const hasData = availableLetters.has(letter);
                  const isActive = selectedLetter === letter;
                  return (
                    <button
                      key={letter}
                      onClick={() => hasData && setSelectedLetter(letter === selectedLetter ? '' : letter)}
                      disabled={!hasData}
                      style={{
                        width: 34, height: 34,
                        borderRadius: 'var(--border-radius-sm)',
                        border: isActive
                          ? '2px solid var(--btn-primary)'
                          : '1px solid var(--bs-border-color, #dee2e6)',
                        background: isActive
                          ? 'var(--btn-primary)'
                          : hasData ? '#fff' : 'var(--bs-light, #f8f9fa)',
                        color: isActive ? '#fff' : hasData ? 'var(--btn-primary)' : '#adb5bd',
                        fontWeight: 'var(--font-weight-semibold)',
                        fontSize: 'var(--font-size-sm)',
                        cursor: hasData ? 'pointer' : 'default',
                        padding: 0,
                        lineHeight: 1,
                        transition: 'all 0.15s',
                      }}
                    >
                      {letter}
                    </button>
                  );
                })}
              </div>

              {/* Table */}
              {!selectedLetter ? (
                <div className="text-center py-4" style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-muted)' }}>
                  Select a letter above to view medicines.
                </div>
              ) : rows.length === 0 ? (
                <div className="text-center py-4" style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-muted)' }}>
                  No medicines found under <strong>{activeCategory}</strong> starting with <strong>{selectedLetter}</strong>.
                </div>
              ) : (
                <div style={{ overflowX: 'auto', maxHeight: '55vh', overflowY: 'auto' }}>
                  <Table bordered size="sm" style={{ fontSize: 'var(--font-size-base)', marginBottom: 0 }}>
                    <thead style={{
                      position: 'sticky', top: 0, zIndex: 2,
                      background: 'var(--table-header-bg)',
                      color: 'var(--table-header-text)',
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 'var(--font-weight-semibold)',
                    }}>
                      <tr>
                        <th style={{ whiteSpace: 'nowrap', width: 60, textAlign: 'center' }}>S. No.</th>
                        <th>Medicine Name</th>
                        <th style={{ whiteSpace: 'nowrap', width: 140, textAlign: 'right' }}>Total Quantity</th>
                        <th style={{ whiteSpace: 'nowrap', width: 140, textAlign: 'right' }}>Total Value (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map(row => (
                        <tr key={row.sNo}>
                          <td style={{ textAlign: 'center' }}>{row.sNo}</td>
                          <td style={{ fontWeight: 'var(--font-weight-medium)' }}>{row.medicineName}</td>
                          <td style={{ textAlign: 'right' }}>{row.totalQuantity.toLocaleString()}</td>
                          <td style={{ textAlign: 'right' }}>{row.totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{
                        background: 'var(--table-header-bg)',
                        fontWeight: 'var(--font-weight-bold)',
                        fontSize: 'var(--font-size-sm)',
                      }}>
                        <td colSpan={2} style={{ textAlign: 'right' }}>Total</td>
                        <td style={{ textAlign: 'right' }}>{totalQty.toLocaleString()}</td>
                        <td style={{ textAlign: 'right' }}>{totalVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    </tfoot>
                  </Table>
                </div>
              )}
            </>

          /* ── Initial Prompt ── */
          ) : (
            <div className="text-center py-5" style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-muted)' }}>
              Select a category and click <strong>Submit</strong> to view medicines.
            </div>
          )}

        </Card.Body>
      </Card>
    </div>
  );
};

export default CategoryWiseMedicine;