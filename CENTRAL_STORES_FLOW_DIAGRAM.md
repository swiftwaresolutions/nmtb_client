# Central Stores Module - Flow Diagram

## User Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    HIMS Main Dashboard                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ Medical  │  │   Cash   │  │  Central │  │   Lab    │      │
│  │ Records  │  │ Counter  │  │  Stores  │  │          │      │
│  └──────────┘  └──────────┘  └────┬─────┘  └──────────┘      │
└───────────────────────────────────┼──────────────────────────────┘
                                    │ Click Module
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│            Central Stores - Sub-Module Selection                │
│                                                                 │
│  API Call: GET /v1/fetchSubModule/6                            │
│  ┌─────────────────────────────────────────────────────┐      │
│  │ Response:                                            │      │
│  │ [                                                    │      │
│  │   { modGroupName: "Medical Store", ... },           │      │
│  │   { modGroupName: "Non-Medical Store", ... }        │      │
│  │ ]                                                    │      │
│  └─────────────────────────────────────────────────────┘      │
│                                                                 │
│  ┌────────────────────┐      ┌────────────────────┐          │
│  │  Medical Store     │      │ Non-Medical Store  │          │
│  │  ┌──────────┐      │      │  ┌──────────┐      │          │
│  │  │  💊      │      │      │  │  📦      │      │          │
│  │  └──────────┘      │      │  └──────────┘      │          │
│  │  Main Medical      │      │  General Store     │          │
│  └──────┬─────────────┘      └──────┬─────────────┘          │
│         │                            │                         │
└─────────┼────────────────────────────┼─────────────────────────┘
          │ Click                      │ Click
          ▼                            ▼
┌──────────────────────┐      ┌──────────────────────┐
│  Medical Store       │      │  Non-Medical Store   │
│  Dashboard           │      │  Dashboard           │
│                      │      │                      │
│  ┌────────────────┐  │      │  ┌────────────────┐  │
│  │ Sidebar        │  │      │  │ Sidebar        │  │
│  │ Menu           │  │      │  │ Menu           │  │
│  │                │  │      │  │                │  │
│  │ • Stock Mgmt   │  │      │  │ • Stock Mgmt   │  │
│  │ • Issue/Return │  │      │  │ • Issue/Return │  │
│  │ • Purchase     │  │      │  │ • Purchase     │  │
│  │ • Masters      │  │      │  │ • Masters      │  │
│  │ • Reports      │  │      │  │ • Reports      │  │
│  └────────────────┘  │      │  └────────────────┘  │
└──────────────────────┘      └──────────────────────┘
```

## Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       MainLayout.tsx                        │
│  (Common header, footer, main navigation)                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              CentralStoresLayout.tsx                  │  │
│  │                                                       │  │
│  │  if (location === base route)                        │  │
│  │    → Show sub-module selection                       │  │
│  │  else                                                 │  │
│  │    → Show <Outlet /> (dashboard/pages)              │  │
│  │                                                       │  │
│  │  ┌─────────────────────────────────────────────┐    │  │
│  │  │  Medical Store Dashboard                    │    │  │
│  │  │  ┌────────────┐  ┌────────────────────────┐│    │  │
│  │  │  │  Sidebar   │  │  Dashboard Content     ││    │  │
│  │  │  │            │  │                        ││    │  │
│  │  │  │  Menu      │  │  • Metrics Cards       ││    │  │
│  │  │  │  Items     │  │  • Quick Actions       ││    │  │
│  │  │  │            │  │  • Sub-Module Info     ││    │  │
│  │  │  └────────────┘  └────────────────────────┘│    │  │
│  │  └─────────────────────────────────────────────┘    │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    Application Start                         │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  User clicks Central Stores module (Module ID: 6)           │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  CentralStoresLayout mounts                                  │
│  useEffect triggers                                          │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  CentralStoresApiService.getSubModules(6)                   │
│  → GET /v1/fetchSubModule/6                                 │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  API Response:                                               │
│  [                                                           │
│    {                                                         │
│      modGroupId: 1,                                         │
│      modGroupName: "Medical Store",                         │
│      subModId: 101,                                         │
│      subModName: "Main Medical Store",                      │
│      masterId: 1                                            │
│    },                                                        │
│    {                                                         │
│      modGroupId: 2,                                         │
│      modGroupName: "Non-Medical Store",                     │
│      subModId: 102,                                         │
│      subModName: "General Store",                           │
│      masterId: 2                                            │
│    }                                                         │
│  ]                                                           │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  setState(subModules)                                        │
│  Display sub-module cards                                    │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  User clicks a sub-module card                               │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  handleSubModuleClick(subModule)                             │
│  Check: modGroupName.includes('medical') ?                   │
└────────┬────────────────────────────────────────┬────────────┘
         │ YES                                     │ NO
         ▼                                         ▼
┌─────────────────────────┐            ┌─────────────────────────┐
│  navigate(               │            │  navigate(              │
│    medicalStore.         │            │    nonMedicalStore.     │
│    dashboard,            │            │    dashboard,           │
│    { state: subModule }  │            │    { state: subModule } │
│  )                       │            │  )                      │
└────────┬─────────────────┘            └────────┬────────────────┘
         │                                       │
         ▼                                       ▼
┌─────────────────────────┐            ┌─────────────────────────┐
│  MedicalStoreDashboard  │            │ NonMedicalStore         │
│  mounts                 │            │ Dashboard mounts        │
│                         │            │                         │
│  Get state from         │            │  Get state from         │
│  location.state         │            │  location.state         │
│                         │            │                         │
│  Load Sidebar with      │            │  Load Sidebar with      │
│  moduleType="medical-   │            │  moduleType="non-       │
│  store"                 │            │  medical-store"         │
└─────────────────────────┘            └─────────────────────────┘
```

## Menu Access Control Flow

```
┌──────────────────────────────────────────────────────────────┐
│  Sidebar Component Mounts                                    │
│  moduleType: "medical-store" | "non-medical-store"          │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  Select menu config based on moduleType:                     │
│  • medical-store → medicalStoreMenuConfig                   │
│  • non-medical-store → nonMedicalStoreMenuConfig            │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  loadMenus()                                                 │
│  TODO: Get user access codes from API                       │
│  Currently: Show all menus (getAllAccessCodes)              │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  filterMenusByAccess(menus, accessCodes)                    │
│  Recursively filter menu items based on access codes        │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  setMenus(filteredMenus)                                    │
│  Render MenuItem components                                  │
└──────────────────────────────────────────────────────────────┘
```

## State Management

```
┌─────────────────────────────────────────────────────────────┐
│                    Redux Store                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  loginData: {                                         │  │
│  │    authorized: boolean                                │  │
│  │    userId: number                                     │  │
│  │    token: string                                      │  │
│  │    ...                                                │  │
│  │  }                                                    │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ useSelector
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              CentralStoresLayout                            │
│  Local State:                                               │
│  • subModules: SubModuleResponse[]                         │
│  • loading: boolean                                        │
│  • selectedSubModule: number | null                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ navigate with state
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              React Router State                             │
│  location.state: {                                          │
│    subModId: number                                        │
│    subModName: string                                      │
│    modGroupId: number                                      │
│    modGroupName: string                                    │
│    masterId: number                                        │
│  }                                                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ useLocation
                       ▼
┌─────────────────────────────────────────────────────────────┐
│          Dashboard Components                               │
│  Use location.state for sub-module context                 │
└─────────────────────────────────────────────────────────────┘
```

## File Organization

```
src/
├── api/
│   └── central-stores/
│       └── central-stores-api-service.ts    [API calls]
│
├── central-stores/                          [Module folder]
│   ├── CentralStoresLayout.tsx             [Main layout + selection]
│   ├── README.md                            [Module documentation]
│   │
│   ├── components/                          [Reusable components]
│   │   ├── Sidebar.tsx                     [Store-specific sidebar]
│   │   └── MenuItem.tsx                    [Menu item renderer]
│   │
│   ├── config/                              [Configuration files]
│   │   └── menu.config.ts                  [Menu structures]
│   │
│   └── pages/                               [Page components]
│       ├── MedicalStoreDashboard.tsx       [Medical store home]
│       └── NonMedicalStoreDashboard.tsx    [Non-medical store home]
│
└── routes/
    ├── AppRouter.tsx                        [Route definitions]
    └── routerPathNames.tsx                  [Path constants]
```

## Integration Points

```
┌─────────────────────────────────────────────────────────────┐
│                    External Systems                         │
└──┬────────────────────────────────────────┬─────────────────┘
   │                                        │
   │ API Calls                              │ API Calls
   ▼                                        ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│  Backend API Server      │    │  Authentication Service  │
│  • /v1/fetchSubModule/6  │    │  • User login           │
│  • Stock APIs            │    │  • Token validation     │
│  • Purchase APIs         │    │  • Access control       │
│  • Report APIs           │    └──────────────────────────┘
└──────────────────────────┘
```
