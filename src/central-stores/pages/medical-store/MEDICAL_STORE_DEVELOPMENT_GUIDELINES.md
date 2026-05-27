# Medical Store Development Guidelines

## 📋 Overview
This document provides comprehensive guidelines for developing pages and features within the Medical Store module. All developers working on this module MUST read and follow these instructions to ensure consistency, adherence to pharmacy norms, and optimal user experience.

---

## 🏥 1. Pharmacy Store Norms & Terminology

### ✅ ALWAYS USE - Pharmacy Standard Terms:

| ❌ AVOID (Generic Terms) | ✅ USE (Pharmacy Norms) |
|--------------------------|-------------------------|
| Product | Item / Medicine |
| Supplier | Vendor |
| Reorder Level | Minimum Stock Level |
| Order | Purchase Order (PO) / Requisition |
| Stock | Inventory |
| Company | Manufacturer |
| Purchase Request | Purchase Requisition |
| Delivery | Goods Receipt |
| Return | Goods Return |
| Store | Medical Store / Pharmacy |

### Key Pharmacy Terminology:
- **Batch Number**: Unique identifier for each production batch
- **Expiry Date**: Medicine expiration date (critical for pharmacy)
- **Generic Name**: Chemical/scientific name of the drug
- **Brand Name / Item Name**: Commercial name of the medicine
- **Unit**: Tablets, Capsules, Vials, Bottles, Strips, Syrup, Injection, etc.
- **Free Quantity**: Complimentary stock provided by vendor
- **GST**: Goods and Services Tax (5%, 12%, 18%, 28%)
- **Schedule**: Drug classification (H, H1, X, etc.)
- **Rack/Bin Location**: Physical storage location in pharmacy

### Page Naming Convention:
- Use pharmacy-specific names for pages
- Examples:
  - ✅ "Draft Purchase Order" instead of "Prepare Order"
  - ✅ "PO Review & Approval" instead of "Edit/Approve Order"
  - ✅ "Items Below Minimum Stock Level" instead of "Below Reorder"
  - ✅ "Vendor-wise Item List" instead of "Supplier-wise Products"

---

## 🎨 2. Styling Requirements

### Mandatory CSS Import:
Every medical store page MUST import the common style sheet:

```tsx
import '../../../../style/commonStyle.css';
```

### Standard Component Structure:
```tsx
<div className="central-stores-layout">
  <Sidebar 
    moduleType="medical-store"
    subModuleName={subModuleData?.subModName || 'Medical Store'} 
  />
  
  <div className={`module-content ${collapsed ? 'expanded' : ''}`}>
    <div className="container-fluid p-4">
      {/* Page content */}
    </div>
  </div>
</div>
```

### Color Scheme & Branding:
- **Primary Gradient**: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- **Success**: `#48bb78` to `#38a169`
- **Warning**: `#ffc107`
- **Danger**: `#dc3545`
- **Info**: `#0dcaf0`

### Badge Styling:
Use Bootstrap badges with rounded corners:
```tsx
<Badge bg="success" className="px-2 py-1" style={{ fontSize: '0.7rem' }}>
  <i className="fas fa-check-circle me-1"></i>
  From PO
</Badge>
```

### Card Headers:
```tsx
<div className="card-header" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
  <h6 className="mb-0 text-white">
    <i className="fas fa-icon-name me-2"></i>
    Section Title
  </h6>
</div>
```

---

## 📄 3. Content Display Philosophy

### Main Page Content (Always Visible):
Display the most frequently used and critical information directly on the main page:

1. **Header Section** (Compact):
   - Page title with icon
   - Key metrics (item count, status badges)
   - Primary action buttons

2. **Essential Details** (One Row Layout):
   - Vendor name (with "View Full Details" link to modal)
   - Invoice number & date
   - PO number/reference
   - Critical dates

3. **Main Data Table** (Scrollable):
   - All selected items with essential columns
   - Inline quick actions (Edit, View)
   - Summary row/footer

4. **Summary & Actions** (Always Visible):
   - Bill summary/totals
   - Primary action buttons (Submit, Reset)
   - Quick statistics

5. **Secondary Information** (Bottom):
   - Remarks/notes section
   - Additional instructions
   - Guidelines

### Modal Content (Click to View):
Move less frequently accessed details to modals:

1. **Full Vendor Details**:
   - Complete address
   - GST number
   - Contact person & phone
   - Bank details
   - Credit terms

2. **Last Purchase History**:
   - Historical purchase records
   - Price trends
   - Vendor comparison
   - Batch details

3. **Item Details**:
   - Complete specifications
   - Alternative items
   - Stock across locations
   - Usage history

4. **Advanced Filters**:
   - Date range selectors
   - Complex search criteria
   - Custom grouping options

### Example Implementation:

**❌ BAD - Too Much on Main Page:**
```tsx
// Showing full vendor details inline
<div className="card">
  <div className="card-body">
    <h5>Vendor: ABC Pharmaceuticals</h5>
    <p>GST: 27AABCU9603R1ZM</p>
    <p>Address: 123, Medical Complex, Mumbai - 400001</p>
    <p>Contact Person: Mr. Rajesh Kumar</p>
    <p>Phone: +91-9876543210</p>
    <p>Email: rajesh@abcpharma.com</p>
    <p>Bank: HDFC Bank</p>
    <p>Account: 1234567890</p>
    <p>Credit Terms: 30 days</p>
  </div>
</div>
```

**✅ GOOD - Compact with Modal:**
```tsx
// Main page - compact
<div className="col-md-3">
  <Form.Label className="fw-semibold">
    <i className="fas fa-building me-1 text-primary"></i>
    Vendor
  </Form.Label>
  <h6 className="mb-0" style={{ color: '#667eea' }}>ABC Pharmaceuticals</h6>
  <Badge bg="success">From PO</Badge>
  <Button 
    size="sm" 
    variant="link" 
    onClick={() => setShowVendorModal(true)}
  >
    <i className="fas fa-eye me-1"></i>
    View Full Details
  </Button>
</div>

// Modal - complete details
<Modal show={showVendorModal} onHide={() => setShowVendorModal(false)}>
  {/* Full vendor information here */}
</Modal>
```

---

## 🔧 4. Standard Features Implementation

### Header Section (Compact Design):
```tsx
<div className="bg-white rounded-3 shadow-sm mb-3 p-2">
  <div className="d-flex justify-content-between align-items-center">
    <div className="d-flex align-items-center gap-2">
      <button className="btn btn-outline-secondary btn-sm" onClick={handleBack}>
        <i className="fas fa-arrow-left"></i>
      </button>
      <div className="bg-gradient rounded-circle d-flex align-items-center justify-content-center" 
           style={{ width: '35px', height: '35px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <i className="fas fa-icon-name text-white fs-6"></i>
      </div>
      <div>
        <h5 className="mb-0 fw-bold">Page Title</h5>
        <small className="text-muted" style={{ fontSize: '0.75rem' }}>
          Brief description
        </small>
      </div>
    </div>
    <div className="d-flex gap-2 align-items-center">
      <Badge bg="info" className="px-2 py-1" style={{ fontSize: '0.75rem' }}>
        <i className="fas fa-info-circle me-1"></i>
        Status Info
      </Badge>
    </div>
  </div>
</div>
```

### Modal Structure:
```tsx
<Modal show={showModal} onHide={() => setShowModal(false)} size="xl" centered>
  <Modal.Header closeButton className="border-0" 
                style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
    <Modal.Title className="text-white">
      <i className="fas fa-icon me-2"></i>
      Modal Title
    </Modal.Title>
  </Modal.Header>
  <Modal.Body>
    {/* Content */}
  </Modal.Body>
  <Modal.Footer className="border-0 bg-light">
    <Button variant="secondary" onClick={() => setShowModal(false)}>
      <i className="fas fa-times me-2"></i>
      Close
    </Button>
    <Button variant="primary" onClick={handleAction}>
      <i className="fas fa-check me-2"></i>
      Action
    </Button>
  </Modal.Footer>
</Modal>
```

### Action Buttons:
```tsx
// Primary action
<Button 
  variant="success"
  onClick={handleSubmit}
  style={{ background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)', border: 'none' }}
>
  <i className="fas fa-check-circle me-2"></i>
  Submit
</Button>

// Edit action
<Button size="sm" variant="outline-primary" onClick={handleEdit}>
  <i className="fas fa-edit me-1"></i>
  Edit Item
</Button>

// View action (opens modal)
<Button size="sm" variant="outline-info" onClick={handleViewDetails}>
  <i className="fas fa-eye me-1"></i>
  View Details
</Button>
```

---

## 📊 5. Data Tables

### Standard Table Structure:
```tsx
<div className="card border-0 shadow-sm">
  <div className="card-header bg-light">
    <div className="d-flex justify-content-between align-items-center">
      <h6 className="mb-0">
        <i className="fas fa-list me-2" style={{ color: '#667eea' }}></i>
        Table Title
      </h6>
      <Button size="sm" variant="outline-primary" onClick={handleAction}>
        <i className="fas fa-plus me-2"></i>
        Add New
      </Button>
    </div>
  </div>
  <div className="card-body p-0">
    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
      <Table hover className="mb-0">
        <thead className="bg-light sticky-top">
          <tr>
            <th style={{ width: '3%' }}>#</th>
            <th>Column 1</th>
            <th>Column 2</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {/* Rows */}
        </tbody>
      </Table>
    </div>
  </div>
</div>
```

### Table Best Practices:
- Use sticky header: `className="bg-light sticky-top"`
- Limit initial height: `maxHeight: '400px', overflowY: 'auto'`
- Show essential columns only
- Add "View Details" button for additional info
- Use badges for status indicators
- Center align numeric values

---

## 🎯 6. Validation & User Feedback

### Input Validation:
```tsx
// Required field indicator
<Form.Label className="fw-semibold">
  <i className="fas fa-receipt me-1 text-danger"></i>
  Invoice Number <span className="text-danger">*</span>
</Form.Label>

// Validation check
if (!invoiceNo || !invoiceDate) {
  Swal.fire('Validation Error', 'Please fill all required fields', 'error');
  return;
}
```

### SweetAlert2 Messages:
```tsx
// Success message
Swal.fire({
  title: 'Success!',
  text: 'Purchase entry saved successfully',
  icon: 'success',
  confirmButtonColor: '#28a745'
});

// Confirmation dialog
const result = await Swal.fire({
  title: 'Submit Purchase Entry?',
  html: '<p>Review details before submission</p>',
  icon: 'question',
  showCancelButton: true,
  confirmButtonColor: '#28a745',
  cancelButtonColor: '#6c757d',
  confirmButtonText: 'Yes, Submit',
  cancelButtonText: 'Cancel'
});
```

---

## 📱 7. Responsive Design

### Layout Structure:
- Use Bootstrap grid system: `row`, `col-md-*`
- Stack columns on mobile: `col-md-3 col-12`
- Responsive gaps: `g-3` for gutters
- Flexible containers: `container-fluid`

### Mobile-First Considerations:
- Compact headers on small screens
- Horizontal scroll for wide tables
- Bottom sheet modals on mobile
- Touch-friendly button sizes (min 44px)

---

## 🔒 8. Security & Data Handling

### Authorization Check:
```tsx
useEffect(() => {
  if (!loginData.authorized) {
    navigate('/login');
    return;
  }
  // Rest of initialization
}, [loginData]);
```

### Read-Only Fields:
```tsx
// Fields from requisition (locked)
<Form.Control
  type="text"
  value={poNumber}
  readOnly
  className="bg-light"
/>
```

---

## 📝 9. Code Standards

### Interface Naming:
```tsx
interface SubModuleState {
  subModId: number;
  subModName: string;
  // Clear, descriptive names
}

interface PurchaseItem {
  itemName: string;        // NOT: productName
  genericName: string;
  manufacturer: string;    // NOT: companyName
  // Pharmacy terminology
}
```

### State Management:
```tsx
// Group related states
const [invoiceNo, setInvoiceNo] = useState('');
const [invoiceDate, setInvoiceDate] = useState('');
const [poNumber, setPoNumber] = useState('');

// Modal states
const [showItemModal, setShowItemModal] = useState(false);
const [showVendorModal, setShowVendorModal] = useState(false);
```

---

## ✅ 10. Pre-Development Checklist

Before creating any new page in Medical Store module:

- [ ] Read this entire guideline document
- [ ] Verify all terminology uses pharmacy norms
- [ ] Import `commonStyle.css`
- [ ] Design main page to show essential info only
- [ ] Plan modals for detailed/infrequent data
- [ ] Use standard color scheme and gradients
- [ ] Implement compact header (35px icon, small badges)
- [ ] Add proper validation messages
- [ ] Include authorization check
- [ ] Test responsive layout
- [ ] Add appropriate icons (Font Awesome)
- [ ] Follow naming conventions
- [ ] Add comments for complex logic

---

## 🎨 11. Quick Reference - Common Patterns

### Icon Usage:
| Feature | Icon |
|---------|------|
| Purchase Entry | `fa-file-invoice` |
| Items/Inventory | `fa-pills`, `fa-boxes` |
| Vendor | `fa-building`, `fa-truck` |
| History | `fa-history` |
| Calendar/Date | `fa-calendar-alt` |
| Money | `fa-rupee-sign` |
| Edit | `fa-edit` |
| View/Details | `fa-eye` |
| Delete/Remove | `fa-trash-alt` |
| Check/Approve | `fa-check-circle` |
| Warning | `fa-exclamation-triangle` |

### Status Badges:
```tsx
// Below minimum stock
<Badge bg="danger">Below Min Stock</Badge>

// From requisition/PO
<Badge bg="success">From PO</Badge>

// Pending approval
<Badge bg="warning" text="dark">Pending</Badge>

// Approved
<Badge bg="success">Approved</Badge>
```

---

## 📚 12. Examples to Follow

### Reference Pages (Good Examples):
1. **PurchaseEntry.tsx**: Compact header, modals for vendor details, main content focused
2. **SelectApprovedPO.tsx**: List with modal for item selection
3. **PrepareOrderFilter.tsx**: History details in modal

### Key Takeaways from Reference Pages:
- Minimal inline details
- "View Details" buttons open modals
- One-row layouts for forms
- Compact badges and metrics
- Scrollable tables with sticky headers
- Bottom placement for remarks/notes

---

## 🚀 13. Performance Best Practices

- Use React hooks efficiently (useState, useEffect)
- Avoid unnecessary re-renders
- Lazy load modals (only render when shown)
- Implement pagination for large datasets
- Use React-Bootstrap components for consistency
- Optimize table rendering with keys

---

## 📧 14. Support & Questions

If you have questions about implementing these guidelines:
1. Review existing Medical Store pages for examples
2. Check this document for specific patterns
3. Consult with team lead for clarification

---

**Last Updated**: December 15, 2025  
**Version**: 1.0  
**Maintained by**: HIMS Development Team

---

## 🎯 Summary

Remember the three golden rules:
1. ✅ **Pharmacy terminology** - Use proper medical store terms
2. ✅ **commonStyle.css** - Always import in every page
3. ✅ **Main page + Modals** - Show essentials on page, details in modals

**Code with these principles, and maintain consistency across all Medical Store pages!**
