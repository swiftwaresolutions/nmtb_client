# Radiology Module - Quick Start Guide

## 🚀 Quick Setup (Already Done!)

The Radiology module is fully configured and ready to use. Here's what's already in place:

### ✅ Files Created
1. `src/radiology/RadiologyLayout.tsx` - Main wrapper
2. `src/radiology/components/Sidebar.tsx` - Navigation menu
3. `src/radiology/components/MenuItem.tsx` - Menu item renderer
4. `src/radiology/config/menu.config.ts` - Menu structure
5. `src/radiology/pages/Dashboard.tsx` - Landing page

### ✅ Integration Complete
1. Routes added to `routerPathNames.tsx`
2. AppRouter updated with radiology routes
3. Module card activated in `modules.config.ts`

## 🎯 How to Access

### From Dashboard
1. Start the application: `npm start`
2. Login with credentials
3. Click **RADIOLOGY** card on dashboard
4. You'll see the radiology module with sidebar menu

### Direct URL
Navigate to: `http://localhost:3000/hims/radiology`

## 📝 Adding New Pages (Step-by-Step)

### Example: Adding "Investigation Order" Page

#### Step 1: Create Page Component
```bash
# Create file: src/radiology/pages/order/InvestigationOrder.tsx
```

```typescript
import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';

const InvestigationOrder = () => {
  return (
    <div>
      <div className="content-header">
        <h3>Investigation Order</h3>
      </div>
      <div className="content-body">
        <Container fluid>
          <Card>
            <Card.Body>
              {/* Your form/content here */}
              <h5>Create New Investigation Order</h5>
            </Card.Body>
          </Card>
        </Container>
      </div>
    </div>
  );
};

export default InvestigationOrder;
```

#### Step 2: Import in AppRouter
```typescript
// Add to imports in AppRouter.tsx
import InvestigationOrder from "../radiology/pages/order/InvestigationOrder";
```

#### Step 3: Add Route
```typescript
// In AppRouter.tsx, inside radiology Route block:
<Route path={routerPathNames.radiology.base} element={<AuthGuard component={<RadiologyLayout />} />}>
  <Route index element={<RadiologyDashboard />} />
  
  {/* Add this line: */}
  <Route path={routerPathNames.radiology.order.investigationOrder} 
         element={<InvestigationOrder />} />
</Route>
```

#### Step 4: Test Navigation
- Click "Order" → "Investigation Order" in sidebar
- Page should render

### Repeat for All Menu Items

Create pages for all menu items listed in `menu.config.ts`:
- Order (2 items)
- Scan Entry (5 items)
- Masters (6 items)
- Purchase Orders (5 items)
- Usages (2 items)
- Receipts (1 item)
- Goods Return (2 items)
- Registers (6 items)
- Reports (10 items)
- Setup (14 items)

## 🔧 Common Patterns

### Data Table Page Template
```typescript
import React, { useState, useEffect } from 'react';
import { Table, Button } from 'react-bootstrap';
import { useTableSearch } from '../../hooks/useTableSearch';
import SearchInput from '../../components/SearchInput';

const MyTablePage = () => {
  const [data, setData] = useState([]);
  const { filteredData, searchTerm, setSearchTerm } = useTableSearch({
    data,
    searchFields: ['name', 'code'],
  });

  useEffect(() => {
    // Fetch data from API
  }, []);

  return (
    <div>
      <div className="content-header">
        <h3>Page Title</h3>
      </div>
      <div className="content-body">
        <SearchInput
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Search..."
        />
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>#</th>
              <th>Column 1</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, idx) => (
              <tr key={item.id}>
                <td>{idx + 1}</td>
                <td>{item.name}</td>
                <td>
                  <Button size="sm">Edit</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default MyTablePage;
```

### Form Page Template
```typescript
import React, { useState } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { showSuccessToast, showErrorToast } from '../../utils/alertUtil';

const MyFormPage = () => {
  const [form, setForm] = useState({
    field1: '',
    field2: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // API call
      showSuccessToast('Saved successfully');
    } catch (error) {
      showErrorToast('Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="content-header">
        <h3>Form Title</h3>
      </div>
      <div className="content-body">
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Field 1</Form.Label>
                <Form.Control
                  type="text"
                  name="field1"
                  value={form.field1}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default MyFormPage;
```

## 🔌 API Integration

### Step 1: Create API Service
```bash
# Create file: src/api/radiology/radiology-api-service.ts
```

```typescript
import HttpClientWrapper from "../http-client-wrapper";

export class RadiologyApiService {
  private httpWrapper: HttpClientWrapper;

  constructor() {
    this.httpWrapper = new HttpClientWrapper();
  }

  public fetchOrders = async () => {
    try {
      const url = '/v1/radiology/orders';
      const response = await this.httpWrapper.get(url);
      return response;
    } catch (error) {
      throw error;
    }
  };

  public saveOrder = async (data: any) => {
    try {
      const url = '/v1/radiology/orders';
      const response = await this.httpWrapper.post(url, data);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Add more methods as needed
}
```

### Step 2: Use in Components
```typescript
import { RadiologyApiService } from '../../api/radiology/radiology-api-service';

const MyComponent = () => {
  const radiologyApi = new RadiologyApiService();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await radiologyApi.fetchOrders();
        setOrders(data);
      } catch (error) {
        showErrorToast('Failed to load data');
      }
    };
    fetchData();
  }, []);
};
```

## 🔐 Access Control

### Fetch User Permissions
Update `Sidebar.tsx` to fetch real access codes:

```typescript
// Replace TODO in Sidebar.tsx
useEffect(() => {
  const fetchUserAccess = async () => {
    try {
      setLoading(true);
      const radiologyApi = new RadiologyApiService();
      const userAccessCodes = await radiologyApi.fetchUserMenuAccess();
      const filtered = filterMenusByAccess(userAccessCodes);
      setMenuItems(filtered);
    } catch (error) {
      console.error('Error fetching menu access:', error);
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  };
  
  fetchUserAccess();
}, []);
```

## 📊 Dashboard Statistics

Update Dashboard.tsx with real data:

```typescript
const [stats, setStats] = useState({
  pendingOrders: 0,
  scansToday: 0,
  stockItems: 0,
  reportsGenerated: 0,
});

useEffect(() => {
  const fetchStats = async () => {
    const radiologyApi = new RadiologyApiService();
    const data = await radiologyApi.fetchDashboardStats();
    setStats(data);
  };
  fetchStats();
}, []);
```

## 🎨 Styling Guidelines

### Use Common Styles
```typescript
// Available CSS classes from style/commonStyle.css
<div className="module-card">
<div className="loading-container">
<div className="empty-state">
```

### Use Predefined Widths
```typescript
// From style/predefined.css
<div className="w-200px">  // Fixed width
<div className="w-50per">  // Percentage width
<div className="min-w-300px">  // Minimum width
```

### Use Bootstrap Components
```typescript
import { Container, Row, Col, Card, Table, Form, Button } from 'react-bootstrap';
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] Navigate to /hims/radiology
- [ ] Sidebar renders correctly
- [ ] Menu items expand/collapse
- [ ] Click leaf menu items
- [ ] Routes navigate correctly
- [ ] Dashboard shows stats
- [ ] Mobile responsive
- [ ] Loading states work

### Browser Console
Check for:
- No JavaScript errors
- No 404 route errors
- API calls successful
- State updates correctly

## 📚 Reference Files

### Pattern Examples
- **Layout**: `src/medical-records/MedicalRecordsLayout.tsx`
- **Sidebar**: `src/medical-records/components/Sidebar.tsx`
- **Menu Config**: `src/medical-records/config/menu.config.ts`
- **Dashboard**: `src/lab/pages/Dashboard.tsx`
- **Table Page**: `src/lab/pages/masters/test/add/AddTest.tsx`
- **Form Page**: `src/cash-counter/pages/billing/Billing.tsx`

### Utility Guides
- **Search Pattern**: `SEARCH_PATTERN_GUIDE.md`
- **Alert Utility**: `src/utils/ALERT_UTILITY_GUIDE.md`

## 🆘 Common Issues

### "Cannot find module" Error
- Check import paths are correct
- Ensure file extensions (.tsx) are included where needed
- Verify file actually exists

### Routes Not Working
- Check routerPathNames has correct paths
- Verify AppRouter.tsx imports component
- Ensure Route path matches exactly

### Sidebar Not Showing Menu
- Check menu.config.ts exports correctly
- Verify Sidebar.tsx imports menu config
- Check browser console for errors

### Access Control Not Filtering
- Implement API call in Sidebar.tsx
- Check access codes match menu.config.ts
- Verify user has permissions

## 🎓 Next Learning Steps

1. **Component Creation**: Create 1-2 pages per day
2. **API Integration**: Connect pages to backend
3. **Forms**: Implement validation and submission
4. **Tables**: Add search, sort, pagination
5. **Reports**: Implement print/export
6. **Testing**: Write unit tests for components

## 📞 Support

- Check existing modules for similar patterns
- Review HIMS coding instructions
- Refer to React/TypeScript docs
- Ask team members for clarification

---

**You're all set!** 🎉

Start creating page components and integrating with your backend API. The module structure is solid and follows best practices.
