# Medical Records Module

## Overview
Modern React-based Medical Records module with vertical collapsible sidebar navigation, replacing the legacy iframe-based horizontal menu system.

## Features

### ✅ Vertical Sidebar Navigation
- **Collapsible sidebar** with hamburger icon toggle
- **Icon-only mode** for space efficiency
- **Multi-level nested menus** (up to 3 levels)
- **Smooth animations** and transitions
- **Mobile responsive** with overlay

### ✅ Menu Structure
- **8 Main Menu Categories:**
  1. Registration (5 sub-items)
  2. Activities (8 sub-items)
  3. Patient Search (2 sub-items)
  4. Masters (6 categories with sub-items)
  5. Statistics (5 sub-items)
  6. Registers (7 sub-items)
  7. Reports (5 sub-items)

### ✅ Access Control
- **Menu filtering** based on user access codes
- **Ready for API integration** (currently shows all menus)
- **Hierarchical permissions** support

### ✅ User Experience
- **Dashboard button** to return to selection area
- **Active route highlighting**
- **Breadcrumb navigation**
- **Tooltip on hover** (collapsed mode)
- **Keyboard accessible**

## File Structure

```
medical-records/
├── MedicalRecordsLayout.tsx          # Main layout wrapper
├── components/
│   ├── Sidebar.tsx                   # Sidebar component
│   └── MenuItem.tsx                  # Recursive menu item component
├── config/
│   └── menu.config.ts                # Menu structure & access control
├── pages/
│   ├── Dashboard.tsx                 # Module dashboard
│   └── registration/
│       └── PatientRegistration.tsx   # Sample page
├── styles/
│   └── sidebar.css                   # Sidebar styling
└── README.md                         # This file
```

## Components

### MedicalRecordsLayout
Main layout wrapper that includes the sidebar and content area.

**Features:**
- User authentication check
- Module access validation
- Outlet for nested routes
- Responsive content area

### Sidebar
Collapsible vertical navigation sidebar.

**Props:**
- `onCollapse?: (collapsed: boolean) => void` - Callback when sidebar collapses

**State:**
- `collapsed` - Sidebar collapsed state
- `menus` - Filtered menu items based on access
- `loading` - Loading state while fetching menus
- `mobileOpen` - Mobile menu open state

### MenuItem
Recursive menu item component supporting nested submenus.

**Props:**
- `item: MenuItemConfig` - Menu item configuration
- `level?: number` - Nesting level (default: 0)
- `collapsed?: boolean` - Sidebar collapsed state
- `onNavigate?: () => void` - Callback after navigation

## Configuration

### Menu Structure (menu.config.ts)

```typescript
interface MenuItemConfig {
  id: string;              // Unique identifier
  name: string;            // Display name
  url?: string;            // Route URL (optional for parent menus)
  accessCode?: number;     // Permission code (null = no restriction)
  icon: string;            // FontAwesome icon class
  submenus?: MenuItemConfig[];  // Nested submenus
}
```

**Example:**
```typescript
{
  id: "registration",
  name: "Registration",
  icon: "fas fa-user-plus",
  accessCode: null,
  submenus: [
    {
      id: "patient-registration",
      name: "Patient Registration",
      url: "/medical-records/registration/patient",
      icon: "fas fa-user-circle",
      accessCode: 1
    }
  ]
}
```

### Access Control

**Filter menus by access codes:**
```typescript
import { filterMenusByAccess } from './config/menu.config';

const userAccessCodes = [1, 2, 3, 7, 19, 20]; // From API
const filteredMenus = filterMenusByAccess(menus, userAccessCodes);
```

**Get all access codes (for testing):**
```typescript
import { getAllAccessCodes } from './config/menu.config';

const allCodes = getAllAccessCodes(menus);
// Returns: [1, 2, 3, 4, 5, 7, 8, 9, ...]
```

## Routes

### Main Routes (AppRouter.tsx)

```tsx
<Route path="/medical-records" element={<AuthGuard component={<MedicalRecordsLayout />} />}>
  <Route index element={<MedicalRecordsDashboard />} />
  <Route path="registration/patient" element={<PatientRegistration />} />
  {/* Add more routes here */}
</Route>
```

### Adding New Routes

1. **Create the page component:**
```tsx
// src/medical-records/pages/activities/Discharge.tsx
const Discharge: React.FC = () => {
  return (
    <div>
      <div className="content-header">
        <Breadcrumb>...</Breadcrumb>
        <h1>Discharge Summary</h1>
      </div>
      <div className="content-body">
        {/* Your content */}
      </div>
    </div>
  );
};
```

2. **Add route in AppRouter.tsx:**
```tsx
<Route path="activities/discharge" element={<Discharge />} />
```

3. **Menu config already includes the URL:**
```typescript
{
  id: "discharge",
  name: "Discharge / Summary",
  url: "/medical-records/activities/discharge",
  icon: "fas fa-sign-out-alt",
  accessCode: 9
}
```

## API Integration

### Current State
Currently displays all menus without API call for testing purposes.

### Integration Steps

1. **Create API method:**
```typescript
// src/api/app/app-api-service.ts
public getModuleMenuAccess = async (moduleId: number) => {
  try {
    const url = `/v1/getModuleMenuAccess/${moduleId}`;
    const response = await this.httpWrapper.get(url);
    return response;
  } catch (error) {
    throw error;
  }
}
```

2. **Expected API Response:**
```json
{
  "success": true,
  "data": {
    "moduleId": 1,
    "moduleName": "Medical Records",
    "accessCodes": [1, 2, 3, 5, 7, 19, 20, 45, 46, 51, 52]
  }
}
```

3. **Update Sidebar.tsx:**
```typescript
const loadMenus = async () => {
  setLoading(true);
  try {
    const response = await appApiService.getModuleMenuAccess(1);
    const userAccessCodes = response.data.accessCodes;
    
    const filteredMenus = filterMenusByAccess(
      medicalRecordsMenuConfig.menus,
      userAccessCodes
    );
    
    setMenus(filteredMenus);
  } catch (error) {
    console.error('Error loading menus:', error);
    setMenus([]);
  } finally {
    setLoading(false);
  }
};
```

## Styling

### CSS Variables
The sidebar uses dark theme colors:
- Background: `#1a1a2e` to `#16213e` gradient
- Active item: Teal accent (`#4dd0e1`)
- Text: White with opacity variations

### Customization

**Change sidebar width:**
```css
.medical-records-sidebar {
  width: 260px; /* Change this */
}

.medical-records-sidebar.collapsed {
  width: 70px; /* Change this */
}
```

**Change colors:**
```css
.medical-records-sidebar {
  background: linear-gradient(180deg, #YOUR_COLOR_1 0%, #YOUR_COLOR_2 100%);
}

.menu-item-button.active {
  border-left-color: #YOUR_ACCENT_COLOR;
  color: #YOUR_ACCENT_COLOR;
}
```

## Responsive Design

### Breakpoints
- **Desktop** (>768px): Full sidebar with text
- **Mobile** (≤768px): 
  - Sidebar hidden by default
  - Hamburger icon toggles sidebar
  - Overlay background when open
  - Touch-friendly tap targets

### Mobile Usage
```tsx
// Open mobile menu
<button onClick={() => setMobileOpen(true)}>Menu</button>

// Closes automatically on navigation
```

## Master Layout Pattern

This sidebar layout can be reused for other modules:

### 1. Create Module Layout
```tsx
// src/billing/BillingLayout.tsx
import Sidebar from '../medical-records/components/Sidebar'; // Reuse
import billingMenuConfig from './config/menu.config';

const BillingLayout: React.FC = () => {
  return (
    <div>
      <Sidebar menuConfig={billingMenuConfig} />
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
};
```

### 2. Create Module Menu Config
```typescript
// src/billing/config/menu.config.ts
export const billingMenuConfig = {
  moduleId: 2,
  moduleName: "Billing",
  menus: [
    // Your billing menus
  ]
};
```

### 3. Add to Routes
```tsx
<Route path="/billing" element={<BillingLayout />}>
  <Route index element={<BillingDashboard />} />
  {/* More routes */}
</Route>
```

## Icons

Uses FontAwesome 6.5.2 icons. Common icons used:

- **Registration**: `fas fa-user-plus`, `fas fa-baby`, `fas fa-bed`
- **Activities**: `fas fa-tasks`, `fas fa-exchange-alt`, `fas fa-sign-out-alt`
- **Search**: `fas fa-search`, `fas fa-search-plus`
- **Masters**: `fas fa-database`, `fas fa-globe`, `fas fa-city`
- **Statistics**: `fas fa-chart-bar`, `fas fa-hospital-user`
- **Registers**: `fas fa-book`, `fas fa-clipboard-list`
- **Reports**: `fas fa-file-alt`, `fas fa-calendar-alt`

## Performance

### Optimizations
- **Lazy loading** of menu items
- **CSS transitions** instead of JavaScript animations
- **Minimal re-renders** with proper state management
- **Responsive images** and icons

### Best Practices
- Use `React.memo()` for MenuItem if performance issues
- Implement virtual scrolling for very large menus
- Code split routes with `React.lazy()`

## Accessibility

- **Keyboard navigation** support
- **ARIA labels** on interactive elements
- **Focus management** for mobile menu
- **Screen reader friendly**
- **High contrast** text and backgrounds

## Migration from Legacy

### Differences from Old System

| Feature | Old (JSP/iframes) | New (React) |
|---------|-------------------|-------------|
| Layout | Horizontal menu bar | Vertical sidebar |
| Navigation | iframe target frames | React Router |
| Access Control | JSP session + backend | API + client-side filtering |
| State Management | Session variables | Redux + React state |
| Responsiveness | Fixed layout | Fully responsive |
| Icons | CDN FontAwesome | React FontAwesome |

### Key Improvements
✅ No iframe overhead
✅ Single Page Application (SPA)
✅ Better mobile experience
✅ Modern UI/UX
✅ Easier maintenance
✅ Better performance

## Troubleshooting

### Menu not showing
- Check if user is authenticated
- Verify access codes in API response
- Check browser console for errors

### Navigation not working
- Ensure routes are defined in AppRouter
- Check URL paths match menu config
- Verify AuthGuard is wrapping routes

### Styling issues
- Ensure CSS file is imported
- Check for CSS conflicts
- Verify FontAwesome is loaded

## Future Enhancements

- [ ] Menu search functionality
- [ ] Favorites/pinned items
- [ ] Recently accessed items
- [ ] Keyboard shortcuts
- [ ] Menu customization per user
- [ ] Dark/light theme toggle
- [ ] Menu badges for notifications
- [ ] Export menu structure to PDF

## License
Part of HIMS Application - Swiftware Solutions

---

**Last Updated:** November 19, 2025
**Version:** 1.0.0
