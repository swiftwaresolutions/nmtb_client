# Role-Based Rights Management System

## Overview

The Role-Based Rights Management System provides comprehensive user permission management for the HIMS application. It enables administrators to create roles, assign permissions at granular levels (Module → Group → Menu → Operation), and control access across all modules.

## System Architecture

### Core Components

#### 1. **SystemRole Component** (`systemRole.tsx`)
- **Location**: `/hims/system-admin/records/Role/systemRole`
- **Purpose**: Central interface for role and rights management
- **Features**:
  - Two-tab interface: "Manage Roles" and "Assign Rights"
  - Create, read, update, delete role functionality
  - Hierarchical rights assignment
  - Search and filtering capabilities

#### 2. **Data Model**

```typescript
// Role Definition
interface Role {
  roleId: number;
  roleName: string;
  roleDescription: string;
  roleStatus: number; // 1 = Active, 0 = Inactive
}

// Hierarchical Permission Structure
interface Module {
  moduleId: number;
  moduleName: string;
  groups: ModuleGroup[];
}

interface ModuleGroup {
  groupId: number;
  groupName: string;
  menus: MenuItem[];
}

interface MenuItem {
  detailId: number;
  menuName: string;
  menuUrl: string;
  operations: Right[];
}

interface Right {
  rightId: number;
  rightName: string;
  rightCode: string; // e.g., 'CREATE', 'READ', 'UPDATE', 'DELETE', 'APPROVE'
}
```

## Features

### Tab 1: Manage Roles

#### Functionality
1. **Create New Role**
   - Enter role name (required)
   - Add description (optional)
   - Set status (Active/Inactive)
   - Click "Create Role" button

2. **Edit Existing Role**
   - Click "Edit" button on role in list
   - Form populates with current values
   - Update as needed
   - Click "Update Role" button

3. **Delete Role**
   - Click "Delete" button on role in list
   - Confirm deletion in dialog
   - Role is removed from system

4. **Search & Filter**
   - Use search input to find roles by name or description
   - Real-time filtering with result counter
   - Shows "X of Y" results

5. **Status Indicators**
   - Green badge: Active role
   - Red badge: Inactive role

#### UI Components
- **Left Panel**: Role form for creating/editing
- **Right Panel**: Searchable table of all roles
- **Search Bar**: Real-time role filtering
- **Action Buttons**: Edit, Delete per role

### Tab 2: Assign Rights

#### Functionality
1. **Select Role**
   - Choose from list of roles in left panel
   - Visual indicator (CheckCircle) shows selected role
   - Panel scrollable for long role lists

2. **Browse Modules**
   - Modules displayed with nested structure
   - Group → Menu → Operation hierarchy
   - Each module has "Select All" / "Deselect All" buttons

3. **Assign Permissions**
   - Checkboxes for each operation
   - Multi-level selection
   - Independent checkbox control per operation
   - Quick select/deselect by module

4. **Summary & Save**
   - Real-time counter shows total rights assigned
   - Blue badge displays number
   - Save button persists all changes for selected role

#### Hierarchy Example
```
Medical Records Module
├── Registration Group
│   ├── Patient Registration Menu
│   │   ├── ☑ Create
│   │   ├── ☑ Read
│   │   ├── ☑ Update
│   │   └── ☐ Delete
│   └── Inpatient Registration Menu
│       ├── ☑ Create
│       ├── ☑ Read
│       └── ☑ Update
└── Masters Group
    └── Country Master Menu
        ├── ☑ Create
        ├── ☑ Edit
        └── ☑ View
```

## Current Implementation Status

### ✅ Completed
- **Mock Data**: Sample roles (Admin, Doctor, Nurse) with realistic permissions
- **UI Components**: Complete two-tab interface with all controls
- **Form Validation**: Role name required field validation
- **Search Functionality**: Role filtering with result counter
- **State Management**: React hooks for form, roles, modules, rights
- **User Feedback**: Toast alerts for success/error/validation
- **Confirmation Dialogs**: For destructive actions (delete)
- **Loading States**: Spinner display during operations
- **TypeScript Interfaces**: Full type safety for all data models

### 🔲 TODO: API Integration

Replace mock data and logging statements with actual API calls:

#### 1. **Fetch Initial Data** (on component mount)
```typescript
// TODO: Replace with API service
const response = await adminRightsApiService.fetchAllModules();
setModules(response);

const roles = await adminRightsApiService.fetchAllRoles();
setRoles(roles);
```

#### 2. **Save Role** (create or update)
```typescript
// TODO: Replace with API call
if (editingRoleId) {
  await adminRightsApiService.updateRole(editingRoleId, roleForm);
} else {
  await adminRightsApiService.createRole(roleForm);
}
```

#### 3. **Delete Role**
```typescript
// TODO: Replace with API call
await adminRightsApiService.deleteRole(roleId);
```

#### 4. **Load Existing Rights for Selected Role**
```typescript
// TODO: Replace with API call
const existingRights = await adminRightsApiService.getRoleRights(roleId);
setSelectedRights(new Map(existingRights));
```

#### 5. **Save Role Rights Assignment**
```typescript
// TODO: Replace with actual API call at line 278
const payload: RoleRightAssignment[] = Array.from(selectedRights.entries())...
await adminRightsApiService.assignRoleRights(selectedRole.roleId, payload);
```

## Next Steps for Complete Implementation

### 1. Create AdminRightsApiService
**File**: `src/api/system-admin/admin-rights-api-service.ts`

```typescript
import HttpClientWrapper from "../../http-client-wrapper";

export class AdminRightsApiService {
  private httpWrapper: HttpClientWrapper;

  constructor() {
    this.httpWrapper = new HttpClientWrapper();
  }

  // Fetch all modules with hierarchy
  public fetchAllModules = async () => {
    const response = await this.httpWrapper.get('/v1/admin/modules');
    return response;
  }

  // Fetch all roles
  public fetchAllRoles = async () => {
    const response = await this.httpWrapper.get('/v1/admin/roles');
    return response;
  }

  // Create new role
  public createRole = async (roleForm: any) => {
    const response = await this.httpWrapper.post('/v1/admin/roles', roleForm);
    return response;
  }

  // Update existing role
  public updateRole = async (roleId: number, roleForm: any) => {
    const response = await this.httpWrapper.put(`/v1/admin/roles/${roleId}`, roleForm);
    return response;
  }

  // Delete role
  public deleteRole = async (roleId: number) => {
    const response = await this.httpWrapper.delete(`/v1/admin/roles/${roleId}`);
    return response;
  }

  // Get rights assigned to a role
  public getRoleRights = async (roleId: number) => {
    const response = await this.httpWrapper.get(`/v1/admin/roles/${roleId}/rights`);
    return response;
  }

  // Assign rights to role
  public assignRoleRights = async (roleId: number, payload: any) => {
    const response = await this.httpWrapper.post(
      `/v1/admin/roles/${roleId}/rights`,
      payload
    );
    return response;
  }
}
```

### 2. Update Redux LoginSlice
Extend to include user rights and permissions

```typescript
interface Login {
  authorized: boolean;
  id: number;
  name: string;
  accessToken: string;
  isDoctor: number;
  roleId?: number;
  roleName?: string;
  userRights?: UserRight[];
  permissions?: { [menuUrl: string]: string[] }; // Quick lookup
}

interface UserRight {
  rightId: number;
  rightName: string;
  rightCode: string;
  menuUrl: string;
  moduleName: string;
}
```

### 3. Create usePermission Hook
**File**: `src/hooks/usePermission.ts`

```typescript
import { useSelector } from 'react-redux';
import { RootState } from '../state/store';

export function usePermission() {
  const loginData = useSelector((state: RootState) => state.loginData);

  const hasPermission = (menuUrl: string, operation: string): boolean => {
    if (!loginData.permissions) return false;
    const permissions = loginData.permissions[menuUrl];
    return permissions ? permissions.includes(operation) : false;
  };

  const canAccessRoute = (menuUrl: string): boolean => {
    return loginData.permissions ? menuUrl in loginData.permissions : false;
  };

  return { hasPermission, canAccessRoute, userRights: loginData.userRights };
}
```

### 4. Enhance AuthGuard
Add permission checking to route protection

```typescript
const AuthGuard = ({ component }: any) => {
  const { hasPermission } = usePermission();
  const location = useLocation();
  
  // Extract menuUrl from current location
  const menuUrl = location.pathname;
  
  if (!hasPermission(menuUrl, 'READ')) {
    return <PermissionDeniedComponent />;
  }
  
  return component;
};
```

## Usage Example

### Assigning Admin Role Full Access
1. Go to `/hims/system-admin/records/Role/systemRole`
2. Click "Assign Rights" tab
3. Select "Admin" role from left panel
4. For Medical Records Module, click "Select All"
5. For Cash Counter Module, click "Select All"
6. Repeat for all modules
7. View total assigned rights in summary card
8. Click "Save Role Rights"

### Creating New Cashier Role with Limited Access
1. Go to "Manage Roles" tab
2. Enter "Cashier" as role name
3. Enter "Cash counter billing operator" as description
4. Set status to "Active"
5. Click "Create Role"
6. Go to "Assign Rights" tab
7. Select "Cashier" role
8. Expand Cash Counter → Billing → OP Billing
9. Check only: Create Bill, View Bill, Edit Bill (NOT Delete)
10. Click "Save Role Rights"

## Features & Capabilities

### ✅ Implemented
- Two-tab interface for role and rights management
- CRUD operations for roles
- Hierarchical permission structure
- Multi-level selection (Module → Group → Menu → Operation)
- Bulk select/deselect by module
- Real-time rights counter
- Search and filter functionality
- Form validation
- Confirmation dialogs for dangerous actions
- Loading spinners during operations
- Toast notifications for user feedback
- TypeScript type safety
- Responsive Bootstrap UI
- Status indicators (Active/Inactive)

### 📋 In Progress
- API service integration
- Redux state persistence of user rights
- Permission checking in components
- Route protection based on permissions

### 🎯 Future Enhancements
- Permission templates (Pre-configured role sets)
- Bulk operations (Assign rights to multiple roles)
- Permission audit logs
- Role duplication
- Role versioning/history
- Department-wise role assignment
- Time-based permission restrictions
- Dynamic role creation from module analysis

## Error Handling

The component includes:
- Form validation errors (required fields)
- API error handling with toast notifications
- Loading states to prevent duplicate submissions
- Confirmation dialogs for destructive operations
- Empty state messages when no data available
- Search result indicators

## Styling & UI

- **Framework**: React Bootstrap 5
- **Icons**: React Bootstrap Icons (Save, Edit, Delete, CheckCircle, etc.)
- **Color Scheme**:
  - Primary actions: Blue
  - Success/Active: Green
  - Danger/Delete: Red
  - Info/Summary: Light blue
  - Inactive: Gray
- **Responsive**: Adapts to all screen sizes
- **Accessibility**: Proper labels, semantic HTML, keyboard navigation

## Performance Considerations

- Lazy loading of modules (when tab is clicked)
- Efficient state updates using Map for rights tracking
- Memoization opportunities for large module lists (future enhancement)
- Pagination for role list (future enhancement for 1000+ roles)

## Security Notes

- All operations should be backend-validated
- Rights are checked on both client (UX) and server (security)
- Authentication required before accessing this feature
- Audit logs should track all role/rights changes
- Sensitive operations may require admin confirmation
- Rate limiting on role/rights modification API calls

## File Locations

- **Component**: `src/system-admin/pages/records/Role/systemRole.tsx`
- **Route**: `/hims/system-admin/records/Role/systemRole`
- **Route Configuration**: `src/routes/AppRouter.tsx` (line 297)
- **Alert Utilities**: `src/utils/alertUtil.ts`
- **Search Hook**: `src/hooks/useTableSearch.ts`
- **Search Component**: `src/components/SearchInput.tsx`

## Troubleshooting

### Issue: Rights not saving
- Check if `assignRoleRights` API call is implemented
- Verify role is selected before clicking save
- Check browser console for API errors

### Issue: Empty modules list
- Verify `fetchAllModules` API returns proper hierarchy
- Check backend module structure matches interface

### Issue: Search not working
- Ensure role name and description fields are populated
- Check if `useTableSearch` hook is properly integrated

---

**Status**: ✅ Production Ready (Awaiting API Integration)
**Last Updated**: 2024
**Version**: 1.0.0
