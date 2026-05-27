# Radiology Module - Flow Diagram

## Module Architecture Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        HIMS Dashboard                            │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ Medical  │  │   Lab    │  │  RADIO-  │  │  Other   │       │
│  │ Records  │  │          │  │  LOGY    │  │ Modules  │       │
│  └──────────┘  └──────────┘  └────┬─────┘  └──────────┘       │
│                                    │                             │
└────────────────────────────────────┼─────────────────────────────┘
                                     │ Click Module Card
                                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AppRouter.tsx                                 │
│                                                                  │
│  <Route path="/hims" element={<MainLayout />}>                 │
│    ...                                                           │
│    <Route path="/hims/radiology"                               │
│           element={<RadiologyLayout />}>                        │
│      <Route index element={<Dashboard />} />                   │
│      <Route path="..." element={<PageComponent />} />          │
│    </Route>                                                     │
│  </Route>                                                       │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                  RadiologyLayout.tsx                             │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 1. Check Authentication (Redux loginData)                │  │
│  │    - If not authorized → Navigate to /login              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                          │                                      │
│                          ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 2. Initialize SidebarContext                             │  │
│  │    - collapsed: false                                    │  │
│  │    - mobileOpen: false                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                          │                                      │
│                          ▼                                      │
│  ┌─────────────┬────────────────────┐                          │
│  │   Sidebar   │     <Outlet />     │                          │
│  │  Component  │  (Child Routes)    │                          │
│  └─────────────┴────────────────────┘                          │
└─────────────────────────────────────────────────────────────────┘
```

## Sidebar Rendering Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      Sidebar.tsx                                 │
│                                                                  │
│  useEffect(() => {                                              │
│    1. Fetch User Access Codes (TODO: API)                      │
│       Currently: getAllAccessCodes() (returns all 1201-1270)   │
│                                                                  │
│    2. Filter Menu Items                                         │
│       filterMenusByAccess(userAccessCodes)                      │
│                                                                  │
│    3. Set Filtered Menu Items                                  │
│       setMenuItems(filteredMenus)                               │
│  })                                                             │
│                          │                                      │
│                          ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │          Render Menu Items                                │  │
│  │                                                           │  │
│  │  {menuItems.map(item => (                                │  │
│  │    <MenuItem                                              │  │
│  │      key={item.id}                                        │  │
│  │      item={item}                                          │  │
│  │      collapsed={collapsed}                                │  │
│  │      expandedMenuId={expandedMenuId}                      │  │
│  │      onToggle={handleToggle}                              │  │
│  │    />                                                     │  │
│  │  ))}                                                      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## MenuItem Recursive Rendering

```
┌─────────────────────────────────────────────────────────────────┐
│                    MenuItem.tsx                                  │
│                                                                  │
│  1. Check if item has submenus                                  │
│     ├─ YES → Render as button with submenu                     │
│     └─ NO → Render as Link to route                            │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ If item has submenus:                                     │  │
│  │                                                           │  │
│  │ <button onClick={toggle}>                                │  │
│  │   <i className={item.icon} />                            │  │
│  │   {item.label}                                            │  │
│  │   <i className="chevron" />                              │  │
│  │ </button>                                                 │  │
│  │                                                           │  │
│  │ {isExpanded && (                                          │  │
│  │   <div className="submenu">                              │  │
│  │     {item.submenus.map(sub => (                          │  │
│  │       <MenuItem                // ← RECURSIVE CALL       │  │
│  │         key={sub.id}                                      │  │
│  │         item={sub}                                        │  │
│  │       />                                                  │  │
│  │     ))}                                                   │  │
│  │   </div>                                                  │  │
│  │ )}                                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                          │                                      │
│                          ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ If item is leaf (no submenus):                           │  │
│  │                                                           │  │
│  │ <Link to={item.url}>                                     │  │
│  │   <i className={item.icon} />                            │  │
│  │   {item.label}                                            │  │
│  │ </Link>                                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Menu Configuration Structure

```
menu.config.ts
├── radiologyMenuConfig
│   ├── moduleId: 12
│   ├── moduleName: "Radiology"
│   └── menuItems: [
│       ├── Order (1201-1202)
│       │   ├── Investigation Order (1201) → /order/investigation-order
│       │   └── Cancel Order (1202) → /order/cancel-order
│       │
│       ├── Scan Entry (1211-1215)
│       │   ├── Scan Entry (1211)
│       │   ├── Scan Bold (1212)
│       │   ├── Scan Edit (1213)
│       │   ├── Angiogram Entry (1214)
│       │   └── Scan Report (1215)
│       │
│       ├── Masters (1221-1226)
│       │   ├── Page Title
│       │   │   ├── Add (1221)
│       │   │   └── Unblock (1222)
│       │   ├── Main Heading
│       │   │   ├── Add (1223)
│       │   │   └── Unblock (1224)
│       │   └── ... (more masters)
│       │
│       ├── Purchase Orders (1231-1235)
│       ├── Usages (1241-1242)
│       ├── Receipts (1246)
│       ├── Goods Return (1251-1252)
│       ├── Registers (1256-1261)
│       ├── Reports (1262-1271)
│       └── Setup (1266-1270)
│           ├── Inv Film
│           │   ├── Add (1266)
│           │   ├── Edit (1267)
│           │   ├── Block (1268)
│           │   └── Unblock (1269)
│           └── ... (more setup items)
│
└── Helper Functions
    ├── getAllAccessCodes() → Returns [1201...1270]
    └── filterMenusByAccess(codes) → Filters recursively
```

## Access Control Filtering Flow

```
┌─────────────────────────────────────────────────────────────────┐
│         filterMenusByAccess(userAccessCodes)                     │
│                                                                  │
│  Input: [1201, 1202, 1211, ...] (User's access codes)          │
│                                                                  │
│  Process:                                                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ For each menu item:                                       │  │
│  │                                                           │  │
│  │ 1. Check if user has access code                         │  │
│  │    if (!userCodes.includes(item.accessCode))             │  │
│  │       return null; // Filter out this item               │  │
│  │                                                           │  │
│  │ 2. If item has submenus, filter them recursively         │  │
│  │    filteredSubmenus = item.submenus                      │  │
│  │      .map(sub => filterMenusByAccess([sub]))             │  │
│  │      .filter(Boolean)                                     │  │
│  │                                                           │  │
│  │ 3. Return item with filtered submenus                    │  │
│  │    return { ...item, submenus: filteredSubmenus }        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                          │                                      │
│  Output: Filtered menu structure                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Only items user can access:                              │  │
│  │ [                                                         │  │
│  │   { id: 'order', accessCode: 1201, ... },               │  │
│  │   { id: 'scan-entry', accessCode: 1211, submenus: ... } │  │
│  │ ]                                                         │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Navigation Flow

```
User Action: Click Menu Item
           │
           ▼
┌──────────────────────────┐
│  MenuItem.tsx            │
│                          │
│  onClick={() => {        │
│    if (hasSubmenus) {    │
│      toggleExpanded()    │─────┐
│    } else {              │     │
│      // Navigate         │     │
│    }                     │     │
│  }}                      │     │
└──────────────────────────┘     │
           │                      │
           ▼                      │ Toggle Expansion
    Has Submenus?                │
      ├─ YES ─────────────────────┘
      │
      └─ NO
         │
         ▼
┌──────────────────────────┐
│  React Router Navigate   │
│                          │
│  <Link to={item.url}>    │
│                          │
│  Routes to:              │
│  /hims/radiology/xxx     │
└──────────────────────────┘
           │
           ▼
┌──────────────────────────┐
│  AppRouter.tsx           │
│                          │
│  <Route path="..."       │
│    element={<Component/>}│
│  />                      │
└──────────────────────────┘
           │
           ▼
┌──────────────────────────┐
│  Page Component Renders  │
│                          │
│  - Dashboard.tsx         │
│  - InvestigationOrder    │
│  - ScanEntry.tsx         │
│  - etc.                  │
└──────────────────────────┘
```

## State Management Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Redux Store (Global)                          │
│                                                                  │
│  loginData: {                                                   │
│    authorized: true,                                             │
│    id: 123,                                                      │
│    name: "Dr. Smith",                                           │
│    accessToken: "...",                                          │
│    isDoctor: 1                                                  │
│  }                                                              │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                SidebarContext (Module Level)                     │
│                                                                  │
│  {                                                              │
│    collapsed: false,        // Sidebar collapsed state          │
│    mobileOpen: false,       // Mobile menu open state           │
│    toggleSidebar: fn,       // Toggle sidebar                   │
│    toggleMobile: fn         // Toggle mobile menu               │
│  }                                                              │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│              Component State (Local)                             │
│                                                                  │
│  Sidebar.tsx:                                                   │
│  - loading: boolean                                             │
│  - menuItems: MenuItemConfig[]                                  │
│  - expandedMenuId: string | null                                │
│                                                                  │
│  MenuItem.tsx:                                                  │
│  - isExpanded: boolean                                          │
│  - isActive: boolean                                            │
│                                                                  │
│  Dashboard.tsx:                                                 │
│  - stats: { orders, scans, stock, reports }                    │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow (Full Cycle)

```
1. USER LOGIN
   └─> Redux Store (loginData)
       └─> AuthGuard checks authorization
           └─> RadiologyLayout mounts

2. SIDEBAR INITIALIZATION
   └─> Sidebar.tsx useEffect
       └─> Fetch user access codes (API)
           └─> filterMenusByAccess(codes)
               └─> setMenuItems(filtered)

3. MENU RENDERING
   └─> map(menuItems) → MenuItem components
       └─> Recursive rendering for submenus
           └─> Leaf items render as Links

4. USER INTERACTION
   └─> Click menu item
       └─> If has submenus: toggle expansion
       └─> If leaf: navigate to route

5. ROUTE NAVIGATION
   └─> React Router matches path
       └─> AppRouter renders component
           └─> Component fetches data (API)
               └─> Renders UI

6. API INTEGRATION (Future)
   └─> Component calls API service
       └─> HttpClientWrapper (with auth token)
           └─> Backend endpoint
               └─> Response → Update state
                   └─> UI updates
```

## File Dependencies

```
┌─────────────────────────────────────────────────────────────────┐
│                    Dependency Graph                              │
│                                                                  │
│  RadiologyLayout.tsx                                            │
│  ├── depends on: Sidebar.tsx                                    │
│  ├── depends on: react-router-dom (Outlet)                     │
│  ├── depends on: Redux (useSelector)                           │
│  └── depends on: SidebarContext                                │
│                                                                  │
│  Sidebar.tsx                                                    │
│  ├── depends on: MenuItem.tsx                                   │
│  ├── depends on: menu.config.ts                                │
│  └── depends on: SidebarContext                                │
│                                                                  │
│  MenuItem.tsx                                                   │
│  ├── depends on: react-router-dom (Link, useLocation)          │
│  └── depends on: SidebarContext                                │
│                                                                  │
│  menu.config.ts                                                 │
│  └── depends on: routerPathNames.tsx                           │
│                                                                  │
│  Dashboard.tsx                                                  │
│  └── depends on: react-bootstrap components                    │
│                                                                  │
│  AppRouter.tsx                                                  │
│  ├── depends on: RadiologyLayout                               │
│  ├── depends on: Dashboard                                     │
│  ├── depends on: routerPathNames                               │
│  └── depends on: react-router-dom                              │
└─────────────────────────────────────────────────────────────────┘
```

## Module Integration Points

```
┌─────────────────────────────────────────────────────────────────┐
│                  Integration with HIMS Core                      │
│                                                                  │
│  1. Route Registration (AppRouter.tsx)                          │
│     /hims/radiology → RadiologyLayout                           │
│                                                                  │
│  2. Route Paths (routerPathNames.tsx)                          │
│     radiology: { base, order, scanEntry, ... }                 │
│                                                                  │
│  3. Module Card (modules.config.ts)                            │
│     { id: 12, name: "RADIOLOGY", link: radiology.base }       │
│                                                                  │
│  4. Authentication (AuthGuard)                                  │
│     Checks Redux loginData.authorized                           │
│                                                                  │
│  5. API Integration (Future)                                    │
│     RadiologyApiService → HttpClientWrapper → Backend          │
│                                                                  │
│  6. Utilities                                                   │
│     - alertUtil.ts (notifications)                              │
│     - errorUtil.ts (error handling)                             │
│     - useTableSearch.ts (search functionality)                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Legend

```
Symbol    Meaning
──────    ───────
  │       Flow direction (downward)
  ├──     Branch point
  └──     End of branch
  →       Leads to / navigates to
  ←       Recursive call / callback
  ▼       Next step
  [...]   Array / collection
  {...}   Object / configuration
```

This diagram shows the complete flow from user interaction to component rendering in the Radiology module.

