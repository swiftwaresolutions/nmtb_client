# Selection Area Module

## Overview
This module provides the main dashboard/selection area where users can access different modules of the Hospital Information Management System (HIMS) based on their permissions.

## Structure

```
hims-info/
├── SelectionArea.tsx          # Main selection area component
├── components/
│   ├── ModuleCard.tsx        # Reusable module card component
│   └── ClinicalLayout.tsx    # Existing clinical layout component
├── config/
│   └── modules.config.ts     # Module configuration and utilities
└── afterLogin.tsx            # [DEPRECATED] Old placeholder component
```

## Components

### SelectionArea.tsx
The main component that displays all available modules to the user.

**Features:**
- Fetches user module rights from Redux store
- Displays modules in a responsive grid layout
- Handles module navigation (internal and external links)
- Shows loading state while fetching data
- Displays empty state if no modules available
- Welcome message with user name

**Props:** None (uses Redux for state)

**State:**
- `authorizedModules`: Array of modules user has access to
- `loading`: Boolean for loading state

### ModuleCard.tsx
Reusable card component for displaying individual modules.

**Props:**
- `module`: ModuleConfig object containing module details
- `onClick`: Callback function when card is clicked

**Features:**
- FontAwesome icons
- Hover animations
- Category-based styling (color-coded left border)
- Responsive design

### modules.config.ts
Configuration file containing all module definitions and utility functions.

**Exports:**
- `ModuleConfig`: TypeScript interface for module structure
- `modulesConfig`: Array of all available modules
- `filterModulesByRights()`: Helper function to filter modules by user permissions
- `getIconClass()`: Helper function to get icon class

## Module Configuration

Each module in `modules.config.ts` has the following structure:

```typescript
{
  id: number;              // Unique module ID
  title: string;           // Display title
  description: string;     // Module description (shown as tooltip)
  iconClass: string;       // FontAwesome icon class
  link: string;            // URL to navigate to
  isExternal?: boolean;    // Whether link is external
  category?: string;       // Module category (for styling)
}
```

## Available Modules

| ID | Module | Description | Type |
|----|--------|-------------|------|
| 1 | Registration | Patient Registration | Internal JSP |
| 2 | Billing | IP Billing | Internal JSP |
| 3 | Laboratory | Laboratory Section | Internal JSP |
| 4 | Nursing Care | IP Patient Section | Internal JSP |
| 5 | Outlet Billing | Billing & Pharmacy | Internal JSP |
| 6 | Store | Main Store | Internal JSP |
| 7 | Financial Accounts | Accounting | Internal JSP |
| 10 | System Admin | System Administration | Internal JSP |
| 12 | EMR | Electronic Medical Records | External React |
| 13 | Appointments | Booking Section | External React |
| 14 | Common | Common Module | Internal JSP |
| 44 | Software Admin | Software Administration | Internal JSP (Admin Only) |

## Styling

All styles are defined in `src/style/commonStyle.css` to maintain consistency across the application.

**Key CSS Classes:**
- `.module-card` - Base card styling
- `.module-card-body` - Card content layout
- `.module-card-title` - Module title styling
- `.module-card-icon` - Icon styling
- `.module-grid` - Responsive grid layout
- `.selection-area-container` - Main container
- `.welcome-message` - Welcome banner
- `.loading-container` - Loading state
- `.empty-state` - No modules state

**Category-based Variants:**
Each module has a category class that adds a colored left border:
- `.registration` - Green
- `.billing` - Yellow
- `.laboratory` - Cyan
- `.nursing` - Pink
- `.pharmacy` - Purple
- `.store` - Orange
- `.accounts` - Teal
- `.admin` - Red

## API Integration (Future)

Currently, the component displays all modules. When API integration is ready:

1. The backend should provide endpoint: `GET /v1/getUserModuleRights`
2. Response should include array of authorized module IDs
3. Update `SelectionArea.tsx` to use this API response
4. Remove the temporary "show all modules" logic

**Expected API Response:**
```json
{
  "success": true,
  "data": {
    "moduleRights": [1, 2, 3, 5, 6, 10, 13]
  }
}
```

## Usage

The SelectionArea component is automatically rendered when user logs in and navigates to `/clinical/dashboard`.

**Route Configuration** (in `AppRouter.tsx`):
```tsx
<Route 
  path={routerPathNames.clinical.dashboard} 
  element={<AuthGuard component={<SelectionArea />} />} 
/>
```

## Navigation Logic

- **Internal JSP Modules**: Direct window.location.href navigation
- **External React Modules** (EMR, Appointments): window.location.href to external URL
- **Future React Modules**: Can use React Router navigate()

## Responsive Design

- **Desktop** (1025px+): 4 columns grid
- **Tablet** (769px-1024px): 2 columns grid
- **Mobile** (<768px): 1 column grid

## Animations

- Cards use `.slide-up` animation on initial render
- Staggered animation delays for visual effect
- Hover effects with transform and shadow changes
- Fade-in animation for welcome message

## Permissions

- Most modules are shown based on user's module rights from API
- Module ID 44 (Software Admin) is restricted to user ID 1 only
- This logic is handled in `filterModulesByRights()` function

## Future Enhancements

1. **API Integration**: Connect to real module rights API
2. **Module Search**: Add search/filter functionality
3. **Favorites**: Allow users to mark favorite modules
4. **Recently Used**: Show recently accessed modules
5. **Module Status**: Display module status (active/maintenance)
6. **Notifications**: Show module-specific notification badges
7. **Help Text**: Add expandable help text for each module
8. **Keyboard Navigation**: Add keyboard shortcuts for accessibility

## Dependencies

- React Bootstrap (Card, Container, Row, Col)
- FontAwesome React Icons
- Redux (for state management)
- React Router (for navigation)

## Notes

- The `afterLogin.tsx` component is deprecated and will be removed in future versions
- All new styling should be added to `commonStyle.css` for consistency
- Module configuration is centralized in `modules.config.ts` for easy maintenance
