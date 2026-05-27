# Alert Utility - Usage Guide

## Overview

The `alertUtil.ts` provides a centralized, reusable alert system for the entire HIMS application using SweetAlert2. This ensures consistent user experience across all modules.

## Location

`src/utils/alertUtil.ts`

## Available Functions

### Toast Notifications (Auto-dismiss)

#### 1. Success Toast

```typescript
showSuccessToast(message: string, title?: string, duration?: number)
```

**Usage:**

```typescript
import { showSuccessToast } from "../utils/alertUtil";

// Basic usage
showSuccessToast("Operation completed successfully");

// With custom title
showSuccessToast("Patient details loaded", "Patient Found");

// With custom duration (ms)
showSuccessToast("Saved!", "Success", 3000);
```

#### 2. Error Toast

```typescript
showErrorToast(message: string, title?: string, duration?: number)
```

**Default:** title = "Error", duration = 3000ms

#### 3. Warning Toast

```typescript
showWarningToast(message: string, title?: string, duration?: number)
```

**Default:** title = "Warning", duration = 2500ms

#### 4. Info Toast

```typescript
showInfoToast(message: string, title?: string, duration?: number)
```

**Default:** title = "Info", duration = 2000ms

---

### Modal Dialogs (Requires user confirmation)

#### 1. Success Modal

```typescript
showSuccessModal(message: string, title?: string, confirmButtonText?: string)
```

**Supports HTML content!**

```typescript
// Plain text
showSuccessModal("Patient updated successfully", "Success!");

// HTML content
showSuccessModal(
  `Patient registered!<br><strong>OP Number: ${opNumber}</strong>`,
  "Success!"
);
```

#### 2. Error Modal

```typescript
showErrorModal(message: string, title?: string, confirmButtonText?: string)
```

**Usage:**

```typescript
showErrorModal("Failed to save patient data", "Error!");
```

#### 3. Warning Modal

```typescript
showWarningModal(message: string, title?: string, confirmButtonText?: string)
```

#### 4. Info Modal

```typescript
showInfoModal(message: string, title?: string, confirmButtonText?: string)
```

#### 5. Validation Error Modal

```typescript
showValidationError(message: string, title?: string)
```

**Default:** title = "Validation Error"

**Note:** Displays with a **WARNING icon** (yellow/orange), not an error icon. This provides a softer visual cue for validation issues.

```typescript
showValidationError("Please fill in all required fields");

// With custom title
showValidationError("Invalid input", "Form Validation");
```

---

### Special Functions

#### Confirmation Dialog

```typescript
showConfirmDialog(
  message: string,
  title?: string,
  confirmButtonText?: string,
  cancelButtonText?: string
)
```

**Returns a Promise**

```typescript
const result = await showConfirmDialog(
  "Are you sure you want to delete this record?",
  "Confirm Delete",
  "Yes, Delete",
  "Cancel"
);

if (result.isConfirmed) {
  // User clicked "Yes, Delete"
  deleteRecord();
}
```

#### Confirmation Dialog With HTML

```typescript
showCustomConfirmDialog(
  title: string,
  html: string,
  icon?: IconType,
  confirmButtonText?: string,
  cancelButtonText?: string
)
```

```typescript
const result = await showCustomConfirmDialog(
  "Confirm Purchase Order",
  `<div class="text-start"><p><strong>Total Items:</strong> 12</p></div>`,
  "question",
  "Yes, Create Order",
  "Cancel"
);
```

#### Decision Dialog (Confirm / Deny / Cancel)

```typescript
showDecisionDialog(
  message: string,
  title?: string,
  icon?: IconType,
  confirmButtonText?: string,
  denyButtonText?: string,
  cancelButtonText?: string
)
```

```typescript
const result = await showDecisionDialog(
  "Apply this vendor to all existing items?",
  "Apply to Existing Items?",
  "question",
  "Yes, Apply to All",
  "No, Only New Items",
  "Cancel"
);

if (result.isConfirmed) {
  // apply for all
} else if (result.isDenied) {
  // apply only for new items
}
```

#### Loading Indicator

```typescript
showLoading(message?: string)
```

**Usage:**

```typescript
// Show loading
showLoading("Saving patient data...");

// Perform async operation
await savePatient();

// Close loading
closeAlert();
```

#### Close Any Alert

```typescript
closeAlert();
```

#### Custom Alert (Advanced)

```typescript
showCustomAlert(html: string, title?: string, icon?: IconType)
```

**For complex HTML content**

---

## Migration Example

### Before (Direct SweetAlert2):

```typescript
Swal.fire({
  title: "Patient Found",
  text: "Patient details loaded successfully.",
  icon: "success",
  timer: 2000,
  showConfirmButton: false,
  toast: true,
  position: "top-end",
});
```

### After (Using Utility):

```typescript
import { showSuccessToast } from "../utils/alertUtil";

showSuccessToast("Patient details loaded successfully.", "Patient Found");
```

---

## Benefits

1. **Consistency** - All alerts look and behave the same across the app
2. **Less Code** - Reduces boilerplate from 8-10 lines to 1 line
3. **Maintainability** - Change alert styling in one place
4. **Type Safety** - TypeScript support with proper types
5. **Easy to Use** - Intuitive function names and default values

---

## Best Practices

1. **Use toasts for non-critical notifications**

   - Success confirmations
   - Auto-save notifications
   - Background process updates

2. **Use modals for important messages requiring user attention**

   - Errors that block operations
   - Validation errors
   - Critical warnings

3. **Use confirmation dialogs for destructive actions**

   - Delete operations
   - Permanent changes
   - Data loss scenarios

4. **Keep messages concise and clear**

   ```typescript
   // Good
   showSuccessToast("Patient saved");

   // Better
   showSuccessToast("Patient details saved successfully", "Success");
   ```

---

## Common Patterns

### API Success/Error Handling

```typescript
try {
  const response = await apiService.savePatient(data);
  showSuccessToast("Patient saved successfully");
} catch (error) {
  const errorMsg = error.response?.data?.message || "Failed to save";
  showErrorModal(errorMsg, "Error");
}
```

### Form Validation

```typescript
if (!validateForm()) {
  showValidationError("Please fill in all required fields");
  return;
}
```

### Async Operations with Loading

```typescript
showLoading("Processing...");
try {
  await performLongOperation();
  closeAlert();
  showSuccessToast("Operation completed");
} catch (error) {
  closeAlert();
  showErrorModal("Operation failed");
}
```

---

## Customization

If you need to customize the default colors or behavior, edit `src/utils/alertUtil.ts`:

```typescript
// Toast configuration
const toastConfig = {
  timer: 2000, // Change default duration
  position: "top-end", // Change position: 'top', 'center', 'bottom'
};

// Modal configuration
const modalConfig = {
  confirmButtonColor: "#4a90e2", // Change button color
};
```
