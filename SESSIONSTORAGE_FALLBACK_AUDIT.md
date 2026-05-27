# Session Storage Fallback Pattern Audit
## src/central-stores Complete Analysis

**Date**: March 31, 2026  
**Objective**: Identify all .tsx files in src/central-stores that don't follow the dual-key fallback pattern for sessionStorage reads.

---

## Pattern Definition

### Correct (OK) Pattern:
Files should read from **BOTH** 'selectedStore' AND 'pharmacySubModuleData' with fallback logic:
```typescript
const selectedStoreData = sessionStorage.getItem('selectedStore');
const pharmacyData = sessionStorage.getItem('pharmacySubModuleData');

let resolvedData = null;
if (selectedStoreData) {
  resolvedData = JSON.parse(selectedStoreData);
} else if (pharmacyData) {
  resolvedData = JSON.parse(pharmacyData);
}
```

### Incorrect (NEEDS_UPDATE) Pattern:
Files that read from **ONLY ONE** key, missing fallback to the other:
- Only reading 'selectedStore' without fallback to 'pharmacySubModuleData'
- Only reading 'pharmacySubModuleData' without fallback to 'selectedStore'

---

## Files Status Summary

**Total Files Analyzed**: 94 sessionStorage reads across ~53 .tsx files
- **OK (with dual-key fallback)**: 26 files ✅
- **NEEDS_UPDATE (missing fallback)**: 27 files ❌

---

## NEEDS_UPDATE Files (Missing Fallback Pattern)

| #  | File Path | Line | Current Implementation | Reads Key(s) | Status |
|----|-----------|------|----------------------|--------------|--------|
| 1  | `src/central-stores/pages/MedicalStoreDashboard.tsx` | 34 | `sessionStorage.getItem('selectedStore')` | selectedStore only | NEEDS_UPDATE |
| 2  | `src/central-stores/pages/NonMedicalStoreDashboard.tsx` | 35 | `sessionStorage.getItem('selectedStore')` | selectedStore only | NEEDS_UPDATE |
| 3  | `src/central-stores/pages/medical-store/purchase/purchaseEntry/SelectApprovedPO.tsx` | 91, 107 | `sessionStorage.getItem('selectedStore')` | selectedStore only | NEEDS_UPDATE |
| 4  | `src/central-stores/pages/medical-store/purchase/purchaseEntry/PurchaseEntry.tsx` | 256, 588, 742 | `sessionStorage.getItem('selectedStore')` | selectedStore only | NEEDS_UPDATE |
| 5  | `src/central-stores/pages/medical-store/setup/InitialStocks.tsx` | 38 | `sessionStorage.getItem('selectedStore')` | selectedStore only | NEEDS_UPDATE |
| 6  | `src/central-stores/pages/non-medical-store/masters/supplier/SupplierMaster.tsx` | 58 | `sessionStorage.getItem('selectedStore')` | selectedStore only | NEEDS_UPDATE |
| 7  | `src/central-stores/pages/non-medical-store/masters/product-procedure-mapping/ProductProcedureMapping.tsx` | 97 | `sessionStorage.getItem('selectedStore')` | selectedStore only | NEEDS_UPDATE |
| 8  | `src/central-stores/pages/non-medical-store/masters/product/ProductMaster.tsx` | 51 | `sessionStorage.getItem('selectedStore')` | selectedStore only | NEEDS_UPDATE |
| 9  | `src/central-stores/pages/non-medical-store/masters/group/GroupMaster.tsx` | 52 | `sessionStorage.getItem('selectedStore')` | selectedStore only | NEEDS_UPDATE |
| 10 | `src/central-stores/pages/medical-store/purchase/prepareOrder/PrepareOrderSupplierWise.tsx` | 186 | `sessionStorage.getItem('selectedStore')` | selectedStore only | NEEDS_UPDATE |
| 11 | `src/central-stores/pages/non-medical-store/masters/consumable-cause/ConsumableCauseMaster.tsx` | 42 | `sessionStorage.getItem('selectedStore')` | selectedStore only | NEEDS_UPDATE |
| 12 | `src/central-stores/pages/non-medical-store/masters/company/CompanyMaster.tsx` | 52 | `sessionStorage.getItem('selectedStore')` | selectedStore only | NEEDS_UPDATE |
| 13 | `src/central-stores/pages/medical-store/purchase/prepareOrder/PrepareOrderReorderLevel.tsx` | 185 | `sessionStorage.getItem('selectedStore')` | selectedStore only | NEEDS_UPDATE |
| 14 | `src/central-stores/pages/medical-store/purchase/prepareOrder/PrepareOrderFilter.tsx` | 123, 197 | `sessionStorage.getItem('selectedStore')` | selectedStore only | NEEDS_UPDATE |
| 15 | `src/central-stores/pages/medical-store/masters/company/CompanyNameMaster.tsx` | 115 | `sessionStorage.getItem('selectedStore')` | selectedStore only | NEEDS_UPDATE |
| 16 | `src/central-stores/pages/medical-store/purchase/prepareOrder/PrepareOrder.tsx` | 72 | `sessionStorage.getItem('selectedStore')` | selectedStore only | NEEDS_UPDATE |
| 17 | `src/central-stores/pages/medical-store/masters/minMax-order/minMaxOrder.tsx` | 16 | `sessionStorage.getItem('selectedStore')` | selectedStore only | NEEDS_UPDATE |
| 18 | `src/central-stores/pages/medical-store/purchase/approveOrder/ViewOrder.tsx` | 31 | `sessionStorage.getItem('selectedStore')` | selectedStore only | NEEDS_UPDATE |
| 19 | `src/central-stores/pages/medical-store/masters/batch/BatchMaster.tsx` | 101 | `sessionStorage.getItem('selectedStore')` | selectedStore only | NEEDS_UPDATE |
| 20 | `src/central-stores/pages/medical-store/purchase/approveOrder/ApproveOrder.tsx` | 80 | `sessionStorage.getItem('selectedStore')` | selectedStore only | NEEDS_UPDATE |
| 21 | `src/central-stores/pages/medical-store/masters/sub-generic-group/SubGenericGroupMaster.tsx` | 152, 206, 242 | `sessionStorage.getItem('selectedStore')` | selectedStore only | NEEDS_UPDATE |
| 22 | `src/central-stores/pages/medical-store/masters/generic-group/GenericGroupMaster.tsx` | 114, 167, 203 | `sessionStorage.getItem('selectedStore')` | selectedStore only | NEEDS_UPDATE |
| 23 | `src/central-stores/pages/medical-store/masters/generic-details/GenericDetailsMaster.tsx` | 193, 235, 290 | `sessionStorage.getItem('selectedStore')` | selectedStore only | NEEDS_UPDATE |
| 24 | `src/central-stores/pages/medical-store/registers/IndividualTransferRegister.tsx` | 56 | `sessionStorage.getItem('selectedStore')` | selectedStore only | NEEDS_UPDATE |
| 25 | `src/central-stores/pages/medical-store/registers/CancelledPO.tsx` | 53 | `sessionStorage.getItem('selectedStore')` | selectedStore only | NEEDS_UPDATE |
| 26 | `src/central-stores/pages/medical-store/registers/goodsRecipt/GoodsReceiptsRegister.tsx` | 44 | `sessionStorage.getItem('selectedStore')` | selectedStore only | NEEDS_UPDATE |
| 27 | `src/central-stores/pages/medical-store/registers/MedicineTransactionAllStore.tsx` | 56 | `sessionStorage.getItem('selectedStore')` | selectedStore only | NEEDS_UPDATE |

---

## Files with OK Pattern (Dual-Key Fallback) ✅

| File Path | Lines | Reads Both Keys |
|-----------|-------|-----------------|
| `ApproveTransfer.tsx` | 43, 48 | ✅ selectedStore + pharmacySubModuleData |
| `PrepareTransfer.tsx` | 40, 46, 133-134, 220-221 | ✅ selectedStore + pharmacySubModuleData |
| `SelectSupplierDate.tsx` | 32, 38 | ✅ selectedStore + pharmacySubModuleData |
| `GoodsReturnPrep.tsx` | 30, 36 | ✅ selectedStore + pharmacySubModuleData |
| `GoodsReturnApproval.tsx` | 23, 29 | ✅ selectedStore + pharmacySubModuleData |
| `ViewStockList.tsx` | 47, 50 | ✅ selectedStore + pharmacySubModuleData |
| `SupwiseWiseTotal.tsx` | 38, 43 | ✅ selectedStore + pharmacySubModuleData |
| `SupwiseGoodsReceipt.tsx` | 29, 34 | ✅ selectedStore + pharmacySubModuleData |
| `monthlyConsumption.tsx` | 25, 27 | ✅ selectedStore + pharmacySubModuleData |
| `MedicineLocationStock.tsx` | 28, 34 | ✅ selectedStore + pharmacySubModuleData |
| `MedicineDetails.tsx` | 30, 36 | ✅ selectedStore + pharmacySubModuleData |
| `costWiseMedicine.tsx` | 25, 31 | ✅ selectedStore + pharmacySubModuleData |
| `Company.tsx` | 24, 26 | ✅ selectedStore + pharmacySubModuleData |
| `Supplier.tsx` | 24, 26 | ✅ selectedStore + pharmacySubModuleData |
| `StockReorderLevel.tsx` | 35, 41 | ✅ selectedStore + pharmacySubModuleData |
| `ExpiryCheckDetails.tsx` | 26, 32 | ✅ selectedStore + pharmacySubModuleData |
| `TransferRegister.tsx` | 66, 71 | ✅ selectedStore + pharmacySubModuleData |
| `TransferConsumableRegister.tsx` | 24, 29 | ✅ selectedStore + pharmacySubModuleData |
| `StockProfitDetails.tsx` | 32, 38 | ✅ selectedStore + pharmacySubModuleData |
| `PriceDetailsReports.tsx` | 46, 48 | ✅ selectedStore + pharmacySubModuleData |
| `PurchaseOrderStatusMed.tsx` | 27, 29 | ✅ selectedStore + pharmacySubModuleData |
| `AllStockRegister.tsx` | 59, 60 | ✅ selectedStore + pharmacySubModuleData |
| `ConsumableRegister.tsx` | 24, 29 | ✅ selectedStore + pharmacySubModuleData |
| `MedicineTransaction.tsx` | 25, 30 | ✅ selectedStore + pharmacySubModuleData |
| `ApproveConsumable.tsx` | 40, 45 | ✅ selectedStore + pharmacySubModuleData |
| `ConsumableOrder.tsx` | 41, 46 | ✅ selectedStore + pharmacySubModuleData |

---

## Breakdown by Module

### Masters (NEEDS_UPDATE):
- SubGenericGroupMaster.tsx - line 152, 206, 242
- GenericGroupMaster.tsx - line 114, 167, 203
- GenericDetailsMaster.tsx - line 193, 235, 290
- CompanyNameMaster.tsx - line 115
- BatchMaster.tsx - line 101
- SupplierMaster.tsx - line 58
- ProductMaster.tsx - line 51
- ProductProcedureMapping.tsx - line 97
- GroupMaster.tsx - line 52
- CompanyMaster.tsx - line 52
- ConsumableCauseMaster.tsx - line 42

### Purchase Order Management (NEEDS_UPDATE):
- SelectApprovedPO.tsx - line 91, 107
- PurchaseEntry.tsx - line 256, 588, 742
- PrepareOrder.tsx - line 72
- PrepareOrderFilter.tsx - line 123, 197
- PrepareOrderReorderLevel.tsx - line 185
- PrepareOrderSupplierWise.tsx - line 186
- ApproveOrder.tsx - line 80
- ViewOrder.tsx - line 31

### Initial Setup (NEEDS_UPDATE):
- InitialStocks.tsx - line 38
- minMaxOrder.tsx - line 16

### Dashboards (NEEDS_UPDATE):
- MedicalStoreDashboard.tsx - line 34
- NonMedicalStoreDashboard.tsx - line 35

### Registers (NEEDS_UPDATE):
- IndividualTransferRegister.tsx - line 56
- CancelledPO.tsx - line 53
- GoodsReceiptsRegister.tsx - line 44
- MedicineTransactionAllStore.tsx - line 56

---

## Key Findings

### Pattern Issue:
All 27 NEEDS_UPDATE files read **ONLY from 'selectedStore'** and are missing the fallback pattern to 'pharmacySubModuleData'.

### Root Cause:
According to copilot-instructions.md, the dual-key fallback pattern is required to handle both:
- **Central Stores** flows (use 'selectedStore')
- **Pharmacy Stores** flows (use 'pharmacySubModuleData')

Without the fallback, if navigation comes from pharmacy context, sessionStorage will not have 'selectedStore' and the component will fail to load (masterId will be null).

### Risk Level:
- **HIGH**: Files that immediately read masterId without fallback
- **MEDIUM**: Files that only warn users but allow continue
- **LOW**: Files used only in Central Stores context

### Recommended Fix:
All 27 files need to add the fallback pattern:

```typescript
const selectedStoreStr = sessionStorage.getItem('selectedStore');
const pharmacyDataStr = sessionStorage.getItem('pharmacySubModuleData');

let resolvedData = null;
if (selectedStoreStr) {
  resolvedData = JSON.parse(selectedStoreStr);
} else if (pharmacyDataStr) {
  resolvedData = JSON.parse(pharmacyDataStr);
}

const masterId = Number(resolvedData?.masterId ?? 0);
if (!masterId) {
  showValidationError('Store context is missing. Please reselect the store.');
  navigate('/hims/central-stores', { replace: true });
  return;
}
```

---

## Related Instructions Reference

See [copilot-instructions.md](./copilot-instructions.md) - **StoreId call rule (MANDATORY)** section:

> For **Central Stores** pages/services, resolve context from `selectedStore` and use `masterId` as both `storeId` and `phModId` where required by API.
> 
> **Do NOT use `selectedStore` as a fallback in Pharmacy flows.**  
> **Do NOT hardcode store defaults like `1` for `masterId` / `storeId` / `phModId`.**
> 
> If store context is missing, stop the action, show a validation/error alert, and redirect to the module dashboard when appropriate instead of sending API calls with `0` or guessed IDs.

---

## Next Steps

1. ✅ Audit Complete: 27 files identified
2. 🔄 Recommended: Apply fallback pattern to all NEEDS_UPDATE files
3. 🧪 Testing: Verify navigation from both Central Stores and Pharmacy contexts
4. 📋 Validation: Ensure proper error handling for missing store context

