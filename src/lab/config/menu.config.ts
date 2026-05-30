// Laboratory Module Menu Configuration
import { routerPathNames } from '../../routes/routerPathNames';
import * as FaIcons from '@fortawesome/free-solid-svg-icons';

export interface MenuItemConfig {
  id: string;
  label: string;
  icon: string;
  iconColor?: string;
  route?: string;
  accessCode?: number;
  submenus?: MenuItemConfig[];
}

export interface ModuleMenuConfig {
  moduleId: number;
  moduleName: string;
  menus: MenuItemConfig[];
}

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

export type LabWorkflowActionKey = "specimen" | "result" | "verify" | "print";

// Configure access codes for Lab Workflow action buttons.
// These values should match menuIds returned by fetchModuleForUser API.
//if left empty [] that button is treated as allowed for everyone.
export const labWorkflowButtonAccessCodes: Record<LabWorkflowActionKey, number[]> = {
  specimen: [41],
  result: [42],
  verify: [43],
  print: [44],
};

// Helper function to convert icon strings to FontAwesome icon objects
export const getIconObject = (iconString: string): any => {
  // Remove 'fas fa-' prefix and convert to camelCase with 'fa' prefix
  // Example: 'fas fa-file-invoice-dollar' -> 'faFileInvoiceDollar'
  const iconName = iconString
    .replace('fas fa-', '')
    .split('-')
    .map((word, index) => {
      if (index === 0) return 'fa' + word.charAt(0).toUpperCase() + word.slice(1);
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join('');

  return (FaIcons as any)[iconName] || FaIcons.faQuestionCircle;
};

// Laboratory Module Menu Configuration
export const laboratoryMenuConfig: ModuleMenuConfig = {
  moduleId: 2,
  moduleName: "Laboratory",
  menus: [
    // Billing Menu
    {
      id: "billing",
      label: "Billing",
      icon: "fas fa-file-invoice-dollar",
      submenus: [
        {
          id: "order",
          label: "Order",
          route: routerPathNames.laboratory.billing.billing,
          icon: "fas fa-shopping-cart",
          accessCode: 37
        }
      ]
    },
    // Activities Menu
    {
      id: "activities",
      label: "Activities",
      icon: "fas fa-tasks",
      accessCode: 8,
      submenus: [
        {
          id: "activity-1",
          label: "Specimen Receipt",
          icon: "fas fa-vial",
          route: routerPathNames.laboratory.activities.labEntry,
          accessCode: 39
        },
        {
          id: "activity-2",
          label: "Result Re-Edit",
          icon: "fas fa-edit",
          route: routerPathNames.laboratory.activities.resultReEdit,
          accessCode: 45
        },
        {
          id: "activity-3",
          label: "Duplicate Result",
          icon: "fas fa-copy",
          route: routerPathNames.laboratory.activities.duplicateResult,
          accessCode: 46
        },
        {
          id: "billLabDuplicateBill",
          label: "Duplicate Bill",
          icon: "fas fa-copy",
          route: routerPathNames.laboratory.activities.billLabDuplicateBill,
          accessCode: 726
        }
      ]
    },

    // Masters Menu
    {
      id: "masters",
      label: "Masters",
      icon: "fas fa-database",
      accessCode: 9,
      submenus: [
        // Department Group
        {
          id: "master-dept",
          label: "Department",
          icon: "fas fa-building",
          route: routerPathNames.laboratory.masters.department.add,
          accessCode: 47
        },

        // Test Configuration Group
        {
          id: "master-test",
          label: "Test Configuration",
          icon: "fas fa-flask",
          submenus: [
            {
              id: "master-test-1",
              label: "Add Test",
              icon: "fas fa-plus-circle",
              route: routerPathNames.laboratory.masters.test.add,
              accessCode: 48
            },
            {
              id: "master-test-5",
              label: "Edit Company Rate",
              icon: "fas fa-dollar-sign",
              route: routerPathNames.laboratory.masters.test.companyRates,
              accessCode: 49
            },
            {
              id: "master-test-6",
              label: "Edit Test Cost",
              icon: "fas fa-money-bill-wave",
              route: routerPathNames.laboratory.masters.test.editCost,
              accessCode: 50
            },
            {
              id: "master-test-9",
              label: "Culture Test Template",
              icon: "fas fa-file-medical",
              route: routerPathNames.laboratory.masters.test.cultureTemplate,
              accessCode: 51
            },
            {
              id: "master-test-10",
              label: "Test Template",
              icon: "fas fa-hospital",
              route: routerPathNames.laboratory.masters.test.testTemplate,
              accessCode: 52
            }
          ]
        },

        // Specimen Group
        {
          id: "master-specimen",
          label: "Specimen",
          icon: "fas fa-microscope",
          route: routerPathNames.laboratory.masters.specimen.add,
          accessCode: 53
        },
        // antibiotic Group
        {
          id: "master-culture",
          label: "Culture",
          icon: "fas fa-pills",
          submenus: [
            {
              id: "master-culture-1",
              label: "antibiotic",
              icon: "fas fa-plus",
              route: routerPathNames.laboratory.masters.antibiotic.add,
              accessCode: 54
            },
            {
              id: "master-culture-2",
              label: "bacteria",
              icon: "fas fa-plus",
              route: routerPathNames.laboratory.masters.bacteria.add,
              accessCode: 55
            }
          ]
        }
      ]
    },

    // Reports Menu
    {
      id: "reports",
      label: "Reports",
      icon: "fas fa-chart-bar",
      accessCode: 10,
      submenus: [
        {
          id: "report-1",
          label: "Lab Register",
          icon: "fas fa-book-open",
          route: routerPathNames.laboratory.reports.labRegister,
          accessCode: 56
        },
        {
          id: "report-2",
          label: "Test Master",
          icon: "fas fa-book-medical",
          route: routerPathNames.laboratory.reports.testMaster,
          accessCode: 57
        },
        {
          id: "report-3",
          label: "Result Re-Edit Report",
          icon: "fas fa-file-alt",
          route: routerPathNames.laboratory.reports.resultReeditReport,
          accessCode: 58
        }
      ]
    }
  ]
};

// Helper function to filter menus based on access codes
export const filterMenusByAccess = (
  menus: MenuItemConfig[],
  accessCodes: { menuIds: number[], submenuIds: number[] }
): MenuItemConfig[] => {
  return menus
    .map(menu => {
      // If menu has submenus, filter them recursively using submenuIds
      if (menu.submenus && menu.submenus.length > 0) {
        const filteredSubmenus = filterMenusByAccess(menu.submenus, { menuIds: accessCodes.submenuIds, submenuIds: accessCodes.submenuIds });
        // Only include parent menu if it has accessible submenus or its accessCode is allowed in menuIds
        if (filteredSubmenus.length > 0 || (menu.accessCode !== undefined && accessCodes.menuIds.includes(menu.accessCode))) {
          return {
            ...menu,
            submenus: filteredSubmenus
          };
        }
        return null;
      }
      // For leaf menu items, check accessCode in menuIds (top-level)
      if (menu.accessCode !== undefined && accessCodes.menuIds.includes(menu.accessCode)) {
        return menu;
      }
      return null;
    })
    .filter((menu): menu is MenuItemConfig => menu !== null);
};

// Helper function to get all access codes from menu config
export const getAllAccessCodes = (menus: MenuItemConfig[]): { menuIds: number[], submenuIds: number[] } => {
  const menuIds: number[] = [];
  const submenuIds: number[] = [];

  menus.forEach(menu => {
    if (menu.accessCode !== undefined) {
      menuIds.push(menu.accessCode);
    }
    if (menu.submenus && menu.submenus.length > 0) {
      menu.submenus.forEach(sub => {
        if (sub.accessCode !== undefined) {
          submenuIds.push(sub.accessCode);
        }
        // Recursively collect deeper submenus
        if (sub.submenus && sub.submenus.length > 0) {
          const subResult = getAllAccessCodes([sub]);
          submenuIds.push(...subResult.menuIds, ...subResult.submenuIds);
        }
      });
    }
  });

  return {
    menuIds: Array.from(new Set(menuIds)),
    submenuIds: Array.from(new Set(submenuIds))
  };
};

export const extractHeaderAndMenuIds = (modData: any): { headerIds: number[], menuIds: number[] } => {
  const headerIds: number[] = [];
  const menuIds: number[] = [];
  if (modData?.subModIds && Array.isArray(modData.subModIds)) {
    modData.subModIds.forEach((subMod: any) => {
      if (subMod.headerIds && Array.isArray(subMod.headerIds)) {
        subMod.headerIds.forEach((header: any) => {
          if (header.headerId !== undefined) headerIds.push(header.headerId);
          if (header.menuIds && Array.isArray(header.menuIds)) {
            menuIds.push(...header.menuIds);
          }
        });
      }
    });
  }
  return {
    headerIds: Array.from(new Set(headerIds)),
    menuIds: Array.from(new Set(menuIds))
  };
};

// Billing tab / button permission IDs for Lab module
export const LAB_BILLING_MENU_IDS = {
  PROCEDURE: 699,
  PHARMACY: 700,
  LAB: 701,
  IP: 702,
  REGISTRATION: 699,
  SAVE_BILL: 703,
  ORDER_BILL: 704,
  DISCOUNT: 705,
  DUPLICATE: 706,
  DUE: 707,
  ADVANCE: 708,
  RETURN: 709,
  DUE_DISCOUNT: 710,
} as const;

const hasMenuPermission = (moduleDetails: Module[], menuId: number): boolean => {
  if (!moduleDetails?.length) return false;

  for (const mod of moduleDetails) {
    for (const sub of mod.subModIds ?? []) {
      for (const hdr of sub.headerIds ?? []) {
        if ((hdr.menuIds ?? []).some((id: any) => Number(id) === menuId)) {
          return true;
        }
      }
    }
  }

  return false;
};

export const getBillingTabPermissions = (moduleDetails: Module[]) => ({
  hasProcedureAccess: hasMenuPermission(moduleDetails, LAB_BILLING_MENU_IDS.PROCEDURE),
  hasPharmacyAccess: hasMenuPermission(moduleDetails, LAB_BILLING_MENU_IDS.PHARMACY),
  hasLabAccess: hasMenuPermission(moduleDetails, LAB_BILLING_MENU_IDS.LAB),
  hasIPAccess: hasMenuPermission(moduleDetails, LAB_BILLING_MENU_IDS.IP),
  canSaveBill: hasMenuPermission(moduleDetails, LAB_BILLING_MENU_IDS.SAVE_BILL),
  canOrderBill: hasMenuPermission(moduleDetails, LAB_BILLING_MENU_IDS.ORDER_BILL),
  canDiscount: hasMenuPermission(moduleDetails, LAB_BILLING_MENU_IDS.DISCOUNT),
  canDuplicate: hasMenuPermission(moduleDetails, LAB_BILLING_MENU_IDS.DUPLICATE),
  hasDueAccess: hasMenuPermission(moduleDetails, LAB_BILLING_MENU_IDS.DUE),
  hasAdvanceAccess: hasMenuPermission(moduleDetails, LAB_BILLING_MENU_IDS.ADVANCE),
  hasReturnAccess: hasMenuPermission(moduleDetails, LAB_BILLING_MENU_IDS.RETURN),
  canDueDiscount: hasMenuPermission(moduleDetails, LAB_BILLING_MENU_IDS.DUE_DISCOUNT),
  hasRegistrationAccess: hasMenuPermission(moduleDetails, LAB_BILLING_MENU_IDS.REGISTRATION),
});
