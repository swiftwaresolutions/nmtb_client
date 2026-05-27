# Copilot Instructions for HIMS Client

This is a **React + Electron + TypeScript** application for a Hospital Information Management System (HIMS).

## 🏗 Project Architecture

- **Frameworks**: React 18, Electron 28, Redux Toolkit, Bootstrap 5.
- **Structure**: Feature-based architecture. Each major module (e.g., `medical-records`, `central-stores`, `lab`) has its own directory in `src/` containing:
  - `*Layout.tsx`: The layout wrapper for the module (e.g., `[src/central-stores/CentralStoresLayout.tsx](../src/central-stores/CentralStoresLayout.tsx)`).
  - `pages/`: Page components for the module.
  - `components/`: Module-specific reusable components.
  - `config/`: Module-specific configuration.
- **Routing**: Centralized in `[src/routes/AppRouter.tsx](../src/routes/AppRouter.tsx)`. Uses `react-router-dom` v6.
  - Route paths are defined in `[src/routes/routerPathNames.tsx](../src/routes/routerPathNames.tsx)` for type safety.
  - Routes are protected by `[src/auth-guard/AuthGuard.tsx](../src/auth-guard/AuthGuard.tsx)`.
- **State Management**: Redux Toolkit with `redux-persist`.
  - Store configuration: `[src/state/store.ts](../src/state/store.ts)`.
  - Slices are often co-located with features (e.g., `[src/login/components/state/loginSlice.ts](../src/login/components/state/loginSlice.tsx)`).

## 🔌 API & Data Fetching

- **HTTP Client**: Use `HttpClientWrapper` in `[src/api/http-client-wrapper.tsx](../src/api/http-client-wrapper.tsx)`.
  - It automatically handles `Authorization` headers with the token from storage.
  - It wraps `axios` and provides `get`, `post`, `put`, `delete` methods.
- **Service Pattern**: Create service classes for each feature in `src/api/<module>/`.
  - Example: `[src/api/app/app-api-service.tsx](../src/api/app/app-api-service.ts)`.
  - Services should instantiate `HttpClientWrapper` or `ApiConfig`.

## 🎨 Styling & UI

- **CSS**: Uses global CSS files imported in `App.tsx`:
  - `[src/style/main_style.css](../src/style/main_style.css)`
  - `[src/style/commonStyle.css](../src/style/commonStyle.css)`
  - `[src/style/predefined.css](../src/style/predefined.css)`
- **Framework**: Bootstrap 5 (`react-bootstrap` and standard bootstrap classes).
- **Icons**: `react-icons` and FontAwesome.

## 🔤 Typography Rules (Strict)

- **MUST NOT** use hardcoded typography values like `font-size: 14px`, `font-size: 0.875rem`, `fontWeight: '600'`, or `font-weight: 700`.
- **MUST ALWAYS** use theme typography tokens from `src/style/theme.css`:
  - Font sizes: `--font-size-xs`, `--font-size-sm`, `--font-size-md`, `--font-size-base`, `--font-size-lg`, `--font-size-xl`, `--font-size-2xl`, `--font-size-3xl`, `--font-size-4xl`
  - Font weights: `--font-weight-light`, `--font-weight-normal`, `--font-weight-medium`, `--font-weight-semibold`, `--font-weight-bold`
- For large display text where exact scaling is required, use `calc(...)` with the nearest token (example: `calc(var(--font-size-4xl) * 1.067)`).
- Apply this rule consistently in all `.tsx`, inline styles, `<style>` blocks, and `.css` files.

## 🎨 Theme Usage Rule (Strict)

- **MUST ALWAYS** use CSS variables from `src/style/theme.css` for colors, backgrounds, borders, and shadows; **MUST NOT** introduce new hardcoded visual values (hex/rgb colors, box-shadow values, or non-token design constants) unless explicitly instructed.

## � Search Pattern (Reusable)

- **MUST USE** the existing reusable search pattern for all table/list search functionality.
- **DO NOT** create custom search implementations - use the standardized pattern.
- **Components**:
  - `useTableSearch` hook: `[src/hooks/useTableSearch.ts](../src/hooks/useTableSearch.ts)`
  - `SearchInput` component: `[src/components/SearchInput.tsx](../src/components/SearchInput.tsx)`
- **Documentation**: Complete usage guide at `[src/SEARCH_PATTERN_GUIDE.md](../SEARCH_PATTERN_GUIDE.md)`
- **Features**:
  - Multi-field search (search across multiple columns)
  - Case-insensitive matching
  - Result counter display
  - Clear button functionality
  - TypeScript generic support
  - Null/undefined safe
- **Basic Usage**:

  ```typescript
  import { useTableSearch } from "../hooks/useTableSearch";
  import SearchInput from "../components/SearchInput";

  // In component:
  const { filteredData, searchTerm, setSearchTerm, resultCount, totalCount } =
    useTableSearch({
      data: yourDataArray,
      searchFields: ["name", "code", "description"],
    });

  // In JSX:
  <SearchInput
    searchTerm={searchTerm}
    onSearchChange={setSearchTerm}
    placeholder="Search by name, code..."
    resultCount={resultCount}
    totalCount={totalCount}
  />;

  // Use filteredData instead of original data in table
  {
    filteredData.map((item) => <tr key={item.id}>...</tr>);
  }
  ```

- **Reference Implementation**: See `[src/lab/pages/masters/test/add/AddTest.tsx](../src/lab/pages/masters/test/add/AddTest.tsx)` for complete example with multiple search instances.

## 🔔 Alert/Notification Pattern (Reusable)

- **MUST USE** the common alert utility for ALL alerts and notifications.
- **DO NOT** use direct `Swal.fire()` calls in components - use the standardized pattern.
- **Location**: `[src/utils/alertUtil.ts](../src/utils/alertUtil.ts)`
- **Documentation**: Complete usage guide at `[src/utils/ALERT_UTILITY_GUIDE.md](../src/utils/ALERT_UTILITY_GUIDE.md)`
- **Available Functions**:
  - `showSuccessToast()` / `showErrorToast()` / `showWarningToast()` - Quick notifications
  - `showSuccessModal()` / `showErrorModal()` / `showWarningModal()` - Important messages requiring confirmation
  - `showConfirmDialog()` - Destructive actions
  - `showValidationError()` - Form validation errors (displays as WARNING icon, not error)
- **Basic Usage**:

  ```typescript
  import {
    showSuccessToast,
    showErrorToast,
    showConfirmDialog,
  } from "../utils/alertUtil";

  // Success notification
  showSuccessToast("Data saved successfully");

  // Error notification
  showErrorToast("Failed to save data");

  // Confirmation dialog
  const confirmed = await showConfirmDialog(
    "Delete this record?",
    "This action cannot be undone"
  );
  if (confirmed) {
    // Proceed with deletion
  }
  ```

- **Extending Alert Utilities**:
  - If a new alert pattern is needed, ADD it to `src/utils/alertUtil.ts` first
  - Follow naming convention: `show[Type][Format]`
  - Update `src/utils/ALERT_UTILITY_GUIDE.md` with usage examples
  - NEVER create component-specific alert functions - keep them centralized
- **Best Practices**: Keep messages concise, clear, and user-friendly

## 📝 Form Submission Pattern (Standard)

- **MUST FOLLOW** the standard form submission pattern for all forms to prevent duplicate submissions.
- **Pattern Requirements**:
  - **IMMEDIATELY disable** submit/update/save buttons when clicked
  - Use loading state (`isLoading`, `isSubmitting`) to manage button state
  - Show appropriate alert after API response
  - Refresh page or reset form as appropriate
  - Button text should indicate loading state
- **Standard Implementation**:

  ```typescript
  const handleSubmit = async () => {
    setIsSubmitting(true); // Disable button immediately
    try {
      await apiService.saveData(data);
      showSuccessToast("Data saved successfully");
      // Refresh page or reset form
      window.location.reload(); // or navigate to list page
    } catch (error) {
      showErrorToast("Failed to save data");
      setIsSubmitting(false); // Re-enable on error if staying on page
    }
  };

  // In JSX:
  <Button onClick={handleSubmit} disabled={isSubmitting}>
    {isSubmitting ? "Submitting..." : "Submit"}
  </Button>;
  ```

- **Key Points**:
  - Disable button before API call starts
  - Use alert utility for success/error messages
  - Re-enable button only on error if staying on same page
  - Always show loading state in button text

## 🔢 Number Input Pattern (Reusable)

- **MUST USE** the number input utility for ALL `type="number"` form inputs.
- **DO NOT** create custom number handling logic - use the standardized utility.
- **Location**: `[src/utils/numberInputUtil.ts](../src/utils/numberInputUtil.ts)`
- **Features**:
  - Removes leading zeros automatically ("01" → "1", preserves "0")
  - Restores default value when field is emptied
  - Shows empty string for display when value equals default
  - Prevents negative numbers
  - Handles decimal values
- **Available Functions**:
  - `handleNumberChange()` - Process onChange events
  - `handleNumberBlur()` - Process onBlur events  
  - `formatNumberDisplay()` - Format value for display
  - `removeLeadingZeros()` - Remove leading zeros from string
- **MANDATORY Usage Pattern**:

  ```typescript
  import { handleNumberChange, handleNumberBlur, formatNumberDisplay } from "../../utils/numberInputUtil";

  // In component state
  const [amount, setAmount] = useState<number>(0);

  // In JSX - EVERY number input MUST follow this pattern:
  <Form.Control
    type="number"
    value={formatNumberDisplay(amount)}           // Display value
    onChange={(e) => setAmount(handleNumberChange(e.target.value))}  // On change
    onBlur={(e) => setAmount(handleNumberBlur(e.target.value))}      // On blur
    min="0"
    step="0.01"
    placeholder="0"
  />
  ```

- **Complete Example**:

  ```typescript
  import { handleNumberChange, handleNumberBlur, formatNumberDisplay } from "../../utils/numberInputUtil";

  const MyComponent = () => {
    const [cashAmount, setCashAmount] = useState<number>(0);
    const [bankAmount, setBankAmount] = useState<number>(0);

    return (
      <Row>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Cash Amount</Form.Label>
            <Form.Control
              type="number"
              value={formatNumberDisplay(cashAmount)}
              onChange={(e) => setCashAmount(handleNumberChange(e.target.value))}
              onBlur={(e) => setCashAmount(handleNumberBlur(e.target.value))}
              min="0"
              step="0.01"
              placeholder="0"
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Bank Amount</Form.Label>
            <Form.Control
              type="number"
              value={formatNumberDisplay(bankAmount)}
              onChange={(e) => setBankAmount(handleNumberChange(e.target.value))}
              onBlur={(e) => setBankAmount(handleNumberBlur(e.target.value))}
              min="0"
              step="0.01"
              placeholder="0"
            />
          </Form.Group>
        </Col>
      </Row>
    );
  };
  ```

- **Behavior**:
  - User types "01" → stored as 1
  - User types "025" → stored as 25
  - User types "0" → stored as 0 (preserved)
  - User clears field → restored to 0 on blur
  - Field displays empty string when value is 0 (shows "0" via placeholder)

- **Key Points**:
  - ALWAYS use `formatNumberDisplay()` for the display value
  - ALWAYS use `handleNumberChange()` in onChange handler
  - ALWAYS use `handleNumberBlur()` in onBlur handler
  - NEVER use raw `Number()` conversion or `Math.max()` directly
  - Use consistently across all amount/numeric input fields

## �🛠 Development Workflows

- **Web Dev**: `npm start` (Runs `react-scripts start`).
- **Electron Dev**: `npm run electron-start` (Runs `electron-forge start`).
- **Build**: `npm run make` (Builds the Electron app).
- **Linting**: `eslint` config extends `react-app`.

## 📝 Coding Conventions

- **Naming**:
  - Components: `PascalCase` (e.g., `PatientRegistration.tsx`).
  - Functions/Variables: `camelCase`.
- **Imports**: Prefer absolute imports or consistent relative imports.
- **Types**: Define interfaces for API responses and props.
- **Error Handling**: Use `handleError` utility from `[src/utils/errorUtil.ts](../src/utils/errorUtil.ts)` in thunks or components.

## 🚨 STRICT RULES - NO HALLUCINATION

**You are working in an existing real-world codebase. Correctness and safety are paramount.**

### 1. NEVER Invent:

- Components, hooks, state variables, or functions
- Files, folders, or module paths
- API endpoints or backend routes
- Dependencies or libraries not in `package.json`

### 2. ONLY Use Existing:

- Components already in the codebase
- API service functions in `src/api/<module>/`
- Hooks and state management patterns (Redux Toolkit slices)
- Project structure and naming conventions
- **Search functionality**: MUST use `useTableSearch` hook and `SearchInput` component (see Search Pattern section)
- **Alert/Notifications**: MUST use alert utility functions from `src/utils/alertUtil.ts` (see Alert/Notification Pattern section)
  - **Validation Errors**: Use `showValidationError()` which displays as a WARNING (yellow/orange icon) not an error
- **Form submissions**: MUST follow standard form submission pattern (see Form Submission Pattern section)

### 3. Request Flow (STRICT SEPARATION):

```
UI Component → Hook/Service → API Service (src/api/) → Backend
```

- **UI components** MUST NOT perform fetch logic directly
- **Components** MUST call hooks or service functions
- **Service classes** in `src/api/` MUST contain all network requests
- **Use `HttpClientWrapper`** for all API calls

### 4. API Service Rules:

- ALL fetch functions MUST live in `src/api/<module>/` directories
- Services MUST follow read/write patterns:
  - Read: `fetch*()`, `get*()`
  - Write: `save*()`, `update*()`, `delete*()`
- MUST NOT invent new backend APIs or endpoints
- MUST use `HttpClientWrapper` methods (`get`, `post`, `put`, `delete`)

### 5. State Management Rules:

- ONLY use existing Redux Toolkit patterns in `src/state/`
- MUST NOT directly call backend URLs from components
- Slices handle loading and data caching logic
- MUST NOT invent new state keys or store slices without explicit instruction

### 6. UI Component Rules:

- MUST NOT contain business logic or API URLs
- MUST NOT contain fetch calls (use services instead)
- MUST use only existing props, hooks, and patterns
- Follow project's folder structure (`pages/`, `components/`, `config/`)

### 7. When Uncertain:

- **ASK a CLARIFICATION QUESTION** instead of guessing
- NEVER assume file existence without verification
- If context is incomplete, respond: **"Context incomplete — need more information."**
- NEVER output imaginary code

### 8. Code Modification Rules:

- ONLY edit files explicitly referenced by the user
- Do NOT modify unrelated files
- Do NOT create new files unless explicitly instructed
- Follow current code style and folder structure exactly
- Prefer minimal, surgical changes over large rewrites

### 9. All API Calls:

- MUST use existing `src/api/` service classes
- MUST NOT change existing backend URL structures
- MUST NOT invent new routes or endpoints
- Always instantiate service classes and call their methods

### 10. Code Changes Format:

- Include context (3-5 lines before/after)
- Only include exact changed code block
- No explanations inside code blocks
- Maintain existing whitespace and indentation

### 11. Ask Before Acting:

- **ALWAYS ask the developer for confirmation before creating a new file or making any code changes.**
- Do NOT proceed with file creation or modifications unless you have explicit developer approval.

**Your goal: Behave like a senior engineer who refuses to guess and always verifies before acting.**

## ⚠️ Critical Implementation Details

- **Auth**: Login state is managed in Redux (`loginData`). Inactivity timeout is handled in `[src/App.tsx](../src/App.tsx)`.
- **Electron IPC**: Main process is in `[electron/index.ts](../electron/index.ts)`. Renderer is the React app.
- **Navigation**: Always use `routerPathNames` constants for navigation, never hardcoded strings.
- **Store Context (`phModId` / `storeId`)**: Always resolve store context first, keep the resolved `masterId` in a local variable, and pass that local value directly into API-loading functions. Do **NOT** call data loaders that read `subModuleData` immediately after `setSubModuleData(...)`, because React state updates are async and can send `0` as `phModId`/`storeId`. For refresh-safe flows, restore context from `location.state` first and then the correct session key before rendering or fetching data.

  - **StoreId call rule (MANDATORY)**:
    - Resolve the store context once per flow, assign `const masterId = Number(... ?? 0)`, validate it, and use that same resolved value for every API call in the current action/effect.
    - For **Central Stores** pages/services, resolve context from `selectedStore` and use `masterId` as both `storeId` and `phModId` where required by API.
    - For **Pharmacy Stores** pages/services, resolve context from `pharmacySubModuleData` and use `masterId` as `storeId`.
    - **Do NOT** use `selectedStore` as a fallback in Pharmacy flows.
    - **Do NOT** hardcode store defaults like `1` for `masterId` / `storeId` / `phModId`.
    - If store context is missing, stop the action, show a validation/error alert, and redirect to the module dashboard when appropriate instead of sending API calls with `0` or guessed IDs.
    - On deep-link/browser refresh, module layouts must not block child route rendering with a module-loader state unless the current route is the module base route.

  ```typescript
  const state = location.state as SubModuleState;
  let resolvedData: SubModuleState | null = state ?? null;

  if (!resolvedData) {
    const storeDataStr = sessionStorage.getItem('selectedStore');
    if (storeDataStr) resolvedData = JSON.parse(storeDataStr) as SubModuleState;
  }

  const masterId = Number(resolvedData?.masterId ?? 0);
  if (!masterId) {
    showValidationError('Store context is missing. Please reselect the store.');
    navigate('/hims/central-stores', { replace: true });
    return;
  }

  setSubModuleData(resolvedData);
  loadMasterData(masterId);
  fetchPendingOrders(masterId);
  ```

  ```typescript
  // BAD (Pharmacy flow): using selectedStore fallback and hardcoded default
  const selected = sessionStorage.getItem('selectedStore');
  const storeId = selected ? JSON.parse(selected).masterId : 1;
  await pharmacyApi.saveDispenseDrug({
    phBillId,
    productDetails: items.map((i) => ({ ...i, storeId }))
  });
  ```

  ```typescript
  // GOOD (Pharmacy flow): use pharmacySubModuleData only and pass resolved storeId directly
  const pharmacyDataStr = sessionStorage.getItem('pharmacySubModuleData');
  const pharmacyData = pharmacyDataStr ? JSON.parse(pharmacyDataStr) as { masterId?: number } : null;
  const storeId = Number(pharmacyData?.masterId ?? 0);

  if (!storeId) {
    showValidationError('Pharmacy store context is missing. Please reselect the store.');
    navigate('/hims/pharmacy-stores', { state: { moduleId: 3 }, replace: true });
    return;
  }

  await pharmacyApi.saveDispenseDrug({
    phBillId,
    productDetails: items.map((i) => ({ ...i, storeId }))
  });
  ```

  ```typescript
  // GOOD (Central Stores flow): use selectedStore and map resolved masterId to storeId/phModId
  const selectedStoreStr = sessionStorage.getItem('selectedStore');
  const selectedStore = selectedStoreStr ? JSON.parse(selectedStoreStr) as { masterId?: number } : null;
  const masterId = Number(selectedStore?.masterId ?? 0);

  if (!masterId) {
    showValidationError('Store context is missing. Please reselect the store.');
    navigate('/hims/central-stores', { replace: true });
    return;
  }

  const storeId = masterId;
  const phModId = masterId;
  await centralStoresApi.fetchProductsForPO(storeId, medicineName);
  await centralStoresApi.fetchPendingOrders(phModId);
  ```
