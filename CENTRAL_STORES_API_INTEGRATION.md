# Central Stores API Integration Guide

## Overview
This guide documents the centralized API service structure for the Central Stores module of HIMS.

## 📁 File Structure

```
src/api/central-stores/
└── central-stores-api-service.tsx  # Centralized API service for all Central Stores operations
```

## 🔧 Implementation Details

### Central Stores API Service

**Location**: `src/api/central-stores/central-stores-api-service.tsx`

This service consolidates ALL Central Stores related API calls in one place using the singleton pattern with `HttpClientWrapper`.

### Current Implementation

#### 1. Generic Group APIs ✅

**Endpoints Implemented:**
- `fetchAllGenericGroups()` - Get all generic groups
- `addGenericGroup(data)` - Create new generic group
- `updateGenericGroup(data)` - Update existing generic group
- `blockGenericGroup(data)` - Block a generic group
- `unblockGenericGroup(data)` - Unblock a generic group

**Interfaces:**
```typescript
interface GenericGroupResponse {
  id: number;
  name: string;
  description: string;
  isBlocked: number;
  blockedUid: number;
  blockedDateTime: string;
  dateTime: string;
  storeId: number;
  uid: number;
}

interface AddGenericGroupRequest {
  name: string;
  description: string;
  storeId: number;
  uid: number;
}

interface UpdateGenericGroupRequest {
  id: number;
  name: string;
  description: string;
  uid: number;
}

interface BlockGenericGroupRequest {
  id: number;
  blockedUid: number;
}

interface UnblockGenericGroupRequest {
  id: number;
  uid: number;
}
```

**Usage Example:**
```typescript
import CentralStoresApiService from '../../../../../api/central-stores/central-stores-api-service';

const apiService = new CentralStoresApiService();

// Fetch all groups
const groups = await apiService.fetchAllGenericGroups();

// Add new group
await apiService.addGenericGroup({
  name: 'Antibiotics',
  description: 'Anti-bacterial medications',
  storeId: 1,
  uid: loginData.id
});

// Update group
await apiService.updateGenericGroup({
  id: 5,
  name: 'Updated Name',
  description: 'Updated description',
  uid: loginData.id
});

// Block group
await apiService.blockGenericGroup({
  id: 5,
  blockedUid: loginData.id
});

// Unblock group
await apiService.unblockGenericGroup({
  id: 5,
  uid: loginData.id
});
```

### Pending Implementations

#### 2. Sub Generic Group APIs ⏳
- `fetchAllSubGenericGroups()`
- `addSubGenericGroup(data)`
- `updateSubGenericGroup(data)`
- `blockSubGenericGroup(data)`
- `unblockSubGenericGroup(data)`

#### 3. Generic Details APIs ⏳
- `fetchAllGenericDetails()`
- `addGenericDetail(data)`
- `updateGenericDetail(data)`
- `blockGenericDetail(data)`
- `unblockGenericDetail(data)`

#### 4. Medicine Item APIs ⏳
- `fetchAllMedicineItems()`
- `addMedicineItem(data)`
- `updateMedicineItem(data)`
- `blockMedicineItem(data)`
- `unblockMedicineItem(data)`

#### 5. Manufacturer APIs ⏳
- `fetchAllManufacturers()`
- `addManufacturer(data)`
- `updateManufacturer(data)`
- `blockManufacturer(data)`
- `unblockManufacturer(data)`

#### 6. Batch APIs ⏳
- `fetchAllBatches()`
- `addBatch(data)`
- `updateBatch(data)`
- `deleteBatch(id)`

#### 7. Store Transfer APIs ⏳
- `fetchAllTransfers()`
- `createTransfer(data)`
- `approveTransfer(id)`
- `rejectTransfer(id)`

## 🔑 Key Technical Details

### HttpClientWrapper Integration

The service uses `HttpClientWrapper` which:
- Automatically adds `Authorization` header with bearer token
- Returns `Promise<any>` (no generic type support)
- Provides methods: `get(path)`, `post(path, payload)`, `put(path, payload)`, `delete(path)`

**Important:** `HttpClientWrapper.get()` does NOT accept generic type parameters. Always cast the response:
```typescript
const response = await this.httpClient.get('fetchAllGenericGroups');
return response.data as GenericGroupResponse[];
```

### Login State Property

When accessing user ID from Redux state, use `loginData.id` (NOT `loginData.employeeId`):

```typescript
const loginData = useSelector((state: RootState) => state.loginData);

// ✅ Correct
await apiService.addGenericGroup({
  uid: loginData.id
});

// ❌ Wrong - employeeId doesn't exist
await apiService.addGenericGroup({
  uid: loginData.employeeId  // TypeScript error!
});
```

**Login Interface:**
```typescript
interface Login {
  authorized: boolean;
  id: number;
  name: string;
  accessToken: string;
  isDoctor: number;
}
```

## 📋 Integration Checklist

When integrating a new master page with the API:

1. ✅ Add API methods to `CentralStoresApiService`
2. ✅ Define Request/Response interfaces
3. ✅ Import `CentralStoresApiService` in component
4. ✅ Instantiate service: `const apiService = new CentralStoresApiService()`
5. ✅ Use `loginData.id` for user tracking
6. ✅ Add loading states during API calls
7. ✅ Handle errors with try-catch and Swal alerts
8. ✅ Refresh data after successful operations
9. ✅ Cast API responses to correct types

## 🚨 Common Pitfalls

### ❌ Don't Do This:
```typescript
// Wrong - Using generic type parameter
const response = await this.httpClient.get<GenericGroupResponse[]>('path');

// Wrong - Using employeeId
uid: loginData.employeeId
```

### ✅ Do This Instead:
```typescript
// Correct - Cast response
const response = await this.httpClient.get('path');
return response.data as GenericGroupResponse[];

// Correct - Use id property
uid: loginData.id
```

## 🎯 Best Practices

1. **Centralization**: All Central Stores APIs MUST be in `central-stores-api-service.tsx`
2. **Error Handling**: Always wrap API calls in try-catch blocks
3. **Loading States**: Show loading indicators during API operations
4. **User Feedback**: Use Swal for success/error notifications
5. **Data Refresh**: Auto-refresh component data after mutations
6. **Type Safety**: Define interfaces for all request/response types
7. **Consistent Naming**: Use verbs for API method names (fetch, add, update, block, unblock)

## 📊 Component Integration Pattern

```typescript
import CentralStoresApiService from '../../../../../api/central-stores/central-stores-api-service';

const MyMasterComponent: React.FC = () => {
  const loginData = useSelector((state: RootState) => state.loginData);
  const apiService = new CentralStoresApiService();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await apiService.fetchAllXXX();
      setItems(data);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch data'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData) => {
    try {
      setLoading(true);
      await apiService.addXXX({
        ...formData,
        uid: loginData.id
      });
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Item saved successfully'
      });
      fetchData();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to save item'
      });
    } finally {
      setLoading(false);
    }
  };

  // ... rest of component
};
```

## 🔄 Next Steps

1. Implement Sub Generic Group APIs
2. Implement Generic Details APIs
3. Implement Medicine Item APIs
4. Implement Manufacturer APIs
5. Implement Batch APIs
6. Implement Store Transfer APIs
7. Add comprehensive error handling
8. Add request/response logging
9. Add API rate limiting if needed
10. Add request caching for read operations

## 📝 Notes

- Backend API endpoints should follow RESTful conventions
- All mutation operations use POST (not PUT/DELETE) as per current backend structure
- Block/Unblock operations are separate endpoints, not PATCH operations
- storeId is required for most operations (currently hardcoded as 1)
- DateTime fields are returned as ISO strings from backend

---

**Last Updated**: Current Implementation  
**Status**: Generic Group APIs ✅ | Others ⏳ Pending
