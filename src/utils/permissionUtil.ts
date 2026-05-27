/**
 * Permission Utility Functions
 * Handles user permission checks based on menu IDs
 */

// Cash Counter Billing Menu IDs
export const BILLING_MENU_IDS = {
  PROCEDURE: 586,
  PHARMACY: 587,
  LAB: 588,
  IP: 589,
  SAVE_BILL: 595,
  ORDER_BILL: 596,
  DISCOUNT: 597,
  DUPLICATE: 598,
  DUE: 607,
  ADVANCE: 608,
  RETURN: 609,
  DUE_DISCOUNT: 692,
} as const;

interface MenuHeader {
  headerId: number;
  menuIds: number[];
}

interface SubModule {
  subModId: number;
  headerIds: MenuHeader[];
}

interface Module {
  modId: number;
  subModIds: SubModule[];
}

/**
 * Check if user has permission for a specific menu ID
 * @param moduleDetails - User's module details from app state
 * @param menuId - Menu ID to check
 * @returns true if user has permission, false otherwise
 */
export const hasMenuPermission = (
  moduleDetails: Module[],
  menuId: number
): boolean => {
  if (!moduleDetails || moduleDetails.length === 0) {
    return false;
  }

  for (const module of moduleDetails) {
    if (!module.subModIds || module.subModIds.length === 0) continue;

    for (const subModule of module.subModIds) {
      if (!subModule.headerIds || subModule.headerIds.length === 0) continue;

      for (const header of subModule.headerIds) {
        if (!header.menuIds || !Array.isArray(header.menuIds)) continue;

        if (header.menuIds.some((id: any) => Number(id) === menuId)) {
          return true;
        }
      }
    }
  }

  return false;
};

/**
 * Check if user has any of the specified menu permissions
 * @param moduleDetails - User's module details from app state
 * @param menuIds - Array of menu IDs to check
 * @returns true if user has at least one permission, false otherwise
 */
export const hasAnyMenuPermission = (
  moduleDetails: Module[],
  menuIds: number[]
): boolean => {
  return menuIds.some((menuId) => hasMenuPermission(moduleDetails, menuId));
};

/**
 * Get all menu IDs the user has permission for
 * @param moduleDetails - User's module details from app state
 * @returns Array of menu IDs user has access to
 */
export const getUserMenuIds = (moduleDetails: Module[]): number[] => {
  if (!moduleDetails || moduleDetails.length === 0) {
    return [];
  }

  const menuIds = new Set<number>();

  for (const module of moduleDetails) {
    if (!module.subModIds || module.subModIds.length === 0) continue;

    for (const subModule of module.subModIds) {
      if (!subModule.headerIds || subModule.headerIds.length === 0) continue;

      for (const header of subModule.headerIds) {
        if (!header.menuIds || !Array.isArray(header.menuIds)) continue;

        header.menuIds.forEach((menuId) => menuIds.add(menuId));
      }
    }
  }

  return Array.from(menuIds);
};

/**
 * Check billing tab permissions
 * @param moduleDetails - User's module details from app state
 * @returns Object with boolean flags for each billing tab
 */
export const getBillingTabPermissions = (moduleDetails: Module[]) => {
  return {
    hasProcedureAccess: hasMenuPermission(moduleDetails, BILLING_MENU_IDS.PROCEDURE),
    hasPharmacyAccess: hasMenuPermission(moduleDetails, BILLING_MENU_IDS.PHARMACY),
    hasLabAccess: hasMenuPermission(moduleDetails, BILLING_MENU_IDS.LAB),
    hasIPAccess: hasMenuPermission(moduleDetails, BILLING_MENU_IDS.IP),
    canSaveBill: hasMenuPermission(moduleDetails, BILLING_MENU_IDS.SAVE_BILL),
    canOrderBill: hasMenuPermission(moduleDetails, BILLING_MENU_IDS.ORDER_BILL),
    canDiscount: hasMenuPermission(moduleDetails, BILLING_MENU_IDS.DISCOUNT),
    canDuplicate: hasMenuPermission(moduleDetails, BILLING_MENU_IDS.DUPLICATE),
    hasDueAccess: hasMenuPermission(moduleDetails, BILLING_MENU_IDS.DUE),
    hasAdvanceAccess: hasMenuPermission(moduleDetails, BILLING_MENU_IDS.ADVANCE),
    hasReturnAccess: hasMenuPermission(moduleDetails, BILLING_MENU_IDS.RETURN),
    canDueDiscount: hasMenuPermission(moduleDetails, BILLING_MENU_IDS.DUE_DISCOUNT),
  };
};
