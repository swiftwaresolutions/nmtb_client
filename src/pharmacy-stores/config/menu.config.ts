// Pharmacy Stores Menu Configuration (Based on HorizontalFrames_var.js)
import { routerPathNames } from '../../routes/routerPathNames';

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

export interface MenuItemConfig {
  id: string;
  name: string;
  url?: string;
  accessCode?: number[];
  icon: string;
  iconColor?: string;
  submenus?: MenuItemConfig[];
}

export interface ModuleMenuConfig {
  moduleId: number;
  moduleName: string;
  menus: MenuItemConfig[];
}

// Pharmacy Stores Menu Configuration (Same for all sub-modules)
export const pharmacyStoresMenuConfig: ModuleMenuConfig = {
  moduleId: 3,
  moduleName: "Pharmacy Stores",
  menus: [
    {
      id: "billing",
      name: "Billing",
      icon: "fas fa-file-invoice-dollar",
      accessCode: [85],
      submenus: [
        {
          id: "order",
          name: "Order",
          url: routerPathNames.pharmacyStores.pharmacy.billing.order,
          icon: "fas fa-shopping-cart",
          accessCode: [698]
        },
        {
          id: "CancelOrder",
          name: "Cancel Order",
          url: routerPathNames.pharmacyStores.pharmacy.billing.CancelOrder,
          icon: "fas fa-bed",
          accessCode: [698]
        }
      ]
    },
    {
      id: "activities",
      name: "Activities",
      icon: "fas fa-tasks",
      accessCode: [11],
      submenus: [
        {
          id: "dispense-drug",
          name: "Dispense Drug",
          url: routerPathNames.pharmacyStores.pharmacy.activities.dispenseDrug,
          icon: "fas fa-pills",
          accessCode: [427]
        },
        {
          id: "dispense-ready",
          name: "Dispense Ready",
          url: routerPathNames.pharmacyStores.pharmacy.activities.dispenseReady,
          icon: "fas fa-pills",
          accessCode: [428]
        },
        {
          id: "transfers",
          name: "Transfers",
          icon: "fas fa-exchange-alt",
          submenus: [
            {
              id: "transfer-prep",
              name: "Preparation",
              url: routerPathNames.pharmacyStores.pharmacy.activities.transferPrep,
              icon: "fas fa-file-alt",
              accessCode: [64]
            },
            {
              id: "transfer-approval",
              name: "Approval",
              url: routerPathNames.pharmacyStores.pharmacy.activities.transferApproval,
              icon: "fas fa-check-circle",
              accessCode: [65]
            }
          ]
        },
        {
          id: "consumable",
          name: "Consumable",
          icon: "fas fa-box-open",
          submenus: [
            {
              id: "consumable-prep",
              name: "Preparation",
              url: routerPathNames.pharmacyStores.pharmacy.activities.consumablePrep,
              icon: "fas fa-file-alt",
              accessCode: [66]
            },
            {
              id: "consumable-approval",
              name: "Approval",
              url: routerPathNames.pharmacyStores.pharmacy.activities.consumableApproval,
              icon: "fas fa-check-circle",
              accessCode:[67]
            }
          ]
        },
        
        
        {
          id: "sales-return",
          name: "Sales Return",
          url: routerPathNames.pharmacyStores.pharmacy.activities.salesReturn,
          icon: "fas fa-undo",
          accessCode: [73]
        },
        {
          id: "billPhDuplicateBill",
          name: "Duplicate Bill",
          url: routerPathNames.pharmacyStores.pharmacy.activities.billPhDuplicateBill,
          icon: "fas fa-copy",
          accessCode: [72]
        },
        {
          id: "batch-edit",
          name: "Batch Edit",
          url: routerPathNames.pharmacyStores.pharmacy.masters.batchEdit,
          icon: "fas fa-edit",
          accessCode: [728]
        }
        
      ]
    },
    
    {
      id: "registers",
      name: "Registers",
      icon: "fas fa-book",
      accessCode: [13],
      submenus: [
        {
          id: "stock-register",
          name: "Stock Register",
          url: routerPathNames.pharmacyStores.pharmacy.registers.phStock,
          icon: "fas fa-warehouse",
          accessCode: [84]
        },
        {
          id: "transfer-register",
          name: "Transfer Register",
          url: routerPathNames.pharmacyStores.pharmacy.registers.phTransfer,
          icon: "fas fa-exchange-alt",
          accessCode: [85]
        },
        {
          id: "transfer-receipt-register",
          name: "Transfer Receipt",
          url: routerPathNames.pharmacyStores.pharmacy.registers.phTransferReceipt,
          icon: "fas fa-receipt",
          accessCode: [96]
        },
        // {
        //   id: "damages-register",
        //   name: "Damages Register",
        //   url: routerPathNames.pharmacyStores.pharmacy.registers.phDamages,
        //   icon: "fas fa-trash",
        //   accessCode: [87]
        // },  
        {
          id: "sales-register",
          name: "Sales Register",
          url: routerPathNames.pharmacyStores.pharmacy.registers.phSales,
          icon: "fas fa-cash-register",
          accessCode: [87]
        },
        {
          id: "med-wise-sales-register",
          name: "Med Wise Sales Register",
          url: routerPathNames.pharmacyStores.pharmacy.registers.phMedWiseSales,
          icon: "fas fa-cash-register",
          accessCode: [90]
        },
        {
          id: "sales-return-register",
          name: "Sales Return Register",
          url: routerPathNames.pharmacyStores.pharmacy.registers.phSalesReturn,
          icon: "fas fa-undo",
          accessCode: [88]
        },
        // {
        //   id: "prescription-register",
        //   name: "Prescription Register",
        //   url: routerPathNames.pharmacyStores.pharmacy.registers.phPrescription,
        //   icon: "fas fa-prescription",
        //   accessCode: [90]
        // },
        // {
        //   id: "request-register",
        //   name: "Request Register",
        //   url: routerPathNames.pharmacyStores.pharmacy.registers.phRequest,
        //   icon: "fas fa-file-medical",
        //   accessCode: [91]
        // },
        // {
        //   id: "total-sales-mrp-register",
        //   name: "Total Sales MRP Register",
        //   url: routerPathNames.pharmacyStores.pharmacy.registers.phTotalSalesMrp,
        //   icon: "fas fa-chart-line",
        //   accessCode: [92]
        // },
        // {
        //   id: "total-sales-cp-register",
        //   name: "Total Sales CP Register",
        //   url: routerPathNames.pharmacyStores.pharmacy.registers.phTotalSalesCp,
        //   icon: "fas fa-chart-line",
        //   accessCode: [93]
        // },
        // {
        //   id: "bill-register",
        //   name: "Bill Register",
        //   url: routerPathNames.pharmacyStores.pharmacy.registers.phBill,
        //   icon: "fas fa-receipt",
        //   accessCode: [94]
        // },
        // {
        //   id: "stock-tax-wise-register",
        //   name: "Stock Tax Wise Register",
        //   url: routerPathNames.pharmacyStores.pharmacy.registers.phStockTaxWise,
        //   icon: "fas fa-receipt",
        //   accessCode: [95]
        // },
        // {
        //   id: "ward-wise-bill-register",
        //   name: "Ward Wise Bill Register",
        //   url: routerPathNames.pharmacyStores.pharmacy.registers.PhWardWiseBillRegister,
        //   icon: "fas fa-hospital",
        //   accessCode: [96]
        // },
        // {
        //   id: "takt4-sales-register",
        //   name: "Takt4 Sales Register",
        //   url: routerPathNames.pharmacyStores.pharmacy.registers.PhTakt4SalseRegister,
        //   icon: "fas fa-chart-line",
        //   accessCode: [97]
        // },
        // {
        //   id: "minimum-reorder-register",
        //   name: "Minimum Reorder Register",
        //   url: routerPathNames.pharmacyStores.pharmacy.registers.PhMinimumReorder,
        //   icon: "fas fa-exclamation-triangle",
        //   accessCode: [98]
        // },
      ]
    },
    
    {
      id: "reports",
      name: "Reports",
      icon: "fas fa-chart-line",
      accessCode: [14],
      submenus: [
        // {
        //   id: "waitingOrders",
        //   name: "Waiting Orders",
        //   url: routerPathNames.pharmacyStores.pharmacy.reports.waitingOrders,
        //   icon: "fas fa-file-invoice-dollar",
        //   accessCode: [572]
        // },
        // {
        //   id: "Diagnosis",
        //   name: "Diagnosis",
        //   url: routerPathNames.pharmacyStores.pharmacy.reports.Diagnosis,
        //   icon: "fas fa-file-invoice-dollar",
        //   accessCode: [579]
        // },
        //  {
        //   id: "PhDuplicateBill",
        //   name: "Duplicate Bill",
        //   url: routerPathNames.pharmacyStores.pharmacy.reports.phDuplicateBill,
        //   icon: "fas fa-file-invoice-dollar",
        //   accessCode: [594]
        // },
        // {
        //   id: "medicineWiseSales",
        //   name: "Medicine Wise Sales",
        //   url: routerPathNames.pharmacyStores.pharmacy.reports.medicineWiseSales,
        //   icon: "fas fa-pills",
        //   accessCode: [107]
        // },
        {
          id: "scheduledMedicineSale",
          name: "Scheduled Medicine Sale",
          url: routerPathNames.pharmacyStores.pharmacy.reports.scheduledMedicineSale,
          icon: "fas fa-capsules",
          accessCode: [108]
        },
        // {
        //   id: "categoryWiseMedicine",
        //   name: "Category Wise Medicine",
        //   url: routerPathNames.pharmacyStores.pharmacy.reports.categoryWiseMedicine,
        //   icon: "fas fa-layer-group",
        //   accessCode: [110]
        // },
        // {
        //   id: "salesCollectionAmount",
        //   name: "Sales Collection Amount",
        //   url: routerPathNames.pharmacyStores.pharmacy.reports.salesCollectionAmount,
        //   icon: "fas fa-file-invoice-dollar",
        //   accessCode: [109]
        // },
        // {
        //   id: "salesStatus",
        //   name: "Sales Status",
        //   url: routerPathNames.pharmacyStores.pharmacy.reports.salesStatus,
        //   icon: "fas fa-chart-bar",
        //   accessCode: [111]
        // },
        // {
        //   id: "ipPharmacyBills",
        //   name: "IP Pharmacy Bills",
        //   url: routerPathNames.pharmacyStores.pharmacy.reports.ipPharmacyBills,
        //   icon: "fas fa-hospital",
        //   accessCode: [112]
        // },
        // {
        //   id: "companyDueBills",
        //   name: "Company Due Bills",
        //   url: routerPathNames.pharmacyStores.pharmacy.reports.companyDueBills,
        //   icon: "fas fa-building",
        //   accessCode: [113]
        // },
        // {
        //   id: "companyReturnBills",
        //   name: "Company Return Bills",
        //   url: routerPathNames.pharmacyStores.pharmacy.reports.companyReturnBills,
        //   icon: "fas fa-undo",
        //   accessCode: [114]
        // },
        // {
        //   id: "dailySalesTransfer",
        //   name: "Daily Stock Flow Report",
        //   url: routerPathNames.pharmacyStores.pharmacy.reports.dailySalesTransfer,
        //   icon: "fas fa-boxes",
        //   accessCode: [115]
        // },
        {
          id: "expiryCheck",
          name: "Expiry Check",
          url: routerPathNames.pharmacyStores.pharmacy.reports.expiryCheck,
          icon: "fas fa-calendar-times",
          accessCode: [116]
        },
        // {
        //   id: "duplicate-bill",
        //   name: "Duplicate Bill",
        //   url: routerPathNames.cashCounter.activities.duplicateBill,
        //   icon: "fas fa-copy",
        //   accessCode: [117]
        // },
        // {
        //   id:"gstr",
        //   name:"GSTR ",
        //   url: routerPathNames.pharmacyStores.pharmacy.gstrDetail.gstrDetail,
        //   icon:"fas fa-file-invoice-dollar",
        //   accessCode: [118]
        // },
      ]
    },
    
    {
      id: "setup",
      name: "Setup",
      icon: "fas fa-cog",
      accessCode: [15],
      submenus: [
        {
          id: "initial-stock",
          name: "Initial Stock",
          url: routerPathNames.pharmacyStores.pharmacy.setup.initialStock,
          icon: "fas fa-warehouse",
          accessCode: [120]
        },
        {
          id: "stock-adjustment",
          name: "Stock Adjustment",
          url: routerPathNames.pharmacyStores.pharmacy.setup.stockAdjustment,
          icon: "fas fa-adjust",
          accessCode: [121]
        }
      ]
    },
    
    
    {
      id: "home",
      name: "Go to",
      icon: "fas fa-home",
      accessCode: [15],
      submenus: [
        {
          id: "dashboard",
          name: "Dashboard",
          url: "/hims/dashboard",
          icon: "fas fa-tachometer-alt",
          accessCode: []
        },
        {
          id: "sub-modules",
          name: "Sub Modules",
          url: routerPathNames.pharmacyStores.base,
          icon: "fas fa-th-large",
          accessCode: []
        }
      ]
    }
  ]
};

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
        const hasAccess = Array.isArray(menu.accessCode)
          ? menu.accessCode.some(code => accessCodes.menuIds.includes(code))
          : false;
        if (filteredSubmenus.length > 0 || hasAccess) {
          return {
            ...menu,
            submenus: filteredSubmenus
          };
        }
        return null;
      }
      // For leaf menu items, check accessCode in menuIds (top-level)
      const hasAccess = Array.isArray(menu.accessCode) && menu.accessCode.length > 0
        ? menu.accessCode.some(code => accessCodes.menuIds.includes(code))
        : true;
      if (hasAccess) {
        return menu;
      }
      return null;
    })
    .filter((menu): menu is MenuItemConfig => menu !== null);
};


export const getAllAccessCodes = (menus: MenuItemConfig[]): { menuIds: number[], submenuIds: number[] } => {
  const menuIds: number[] = [];
  const submenuIds: number[] = [];

  menus.forEach(menu => {
    if (Array.isArray(menu.accessCode)) {
      menuIds.push(...menu.accessCode);
    }
    if (menu.submenus && menu.submenus.length > 0) {
      menu.submenus.forEach(sub => {
        if (Array.isArray(sub.accessCode)) {
          submenuIds.push(...sub.accessCode);
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


export const extractHeaderAndMenuIds = (
  storeAccessData: any,
  subModId?: number
): { headerIds: number[]; menuIds: number[] } => {
  const headerIds: number[] = [];
  const menuIds: number[] = [];

  const subModules: any[] = Array.isArray(storeAccessData)
    ? storeAccessData
    : Array.isArray(storeAccessData?.subModIds)
      ? storeAccessData.subModIds
      : [];

  const filteredSubModules = typeof subModId === "number"
    ? subModules.filter((subModule) => subModule?.subModId === subModId)
    : subModules;

  filteredSubModules.forEach((subModule) => {
    if (Array.isArray(subModule.headerIds)) {
      subModule.headerIds.forEach((header: any) => {
        if (header.headerId !== undefined) {
          headerIds.push(header.headerId);
        }
        if (Array.isArray(header.menuIds)) {
          menuIds.push(...header.menuIds);
        }
      });
    }
  });

  return {
    headerIds: Array.from(new Set(headerIds)),
    menuIds: Array.from(new Set(menuIds)),
  };
};

// Billing tab / button permission IDs for Pharmacy Stores module
export const PHARMACY_BILLING_MENU_IDS = {
  PROCEDURE: 711,
  PHARMACY: 712,
  LAB: 713,
  IP: 714,
  REGISTRATION: 711,
  SAVE_BILL: 715,
  ORDER_BILL: 716,
  DISCOUNT: 717,
  DUPLICATE: 718,
  DUE: 719,
  ADVANCE: 720,
  RETURN: 721,
  DUE_DISCOUNT: 722,
} as const;

const hasMenuPermission = (moduleDetails: Module[], menuId: number, subModId?: number): boolean => {
  if (!moduleDetails?.length) return false;

  for (const mod of moduleDetails) {
    const subModules = mod.subModIds ?? [];
    const filteredSubModules = typeof subModId === "number"
      ? subModules.filter((sub) => Number(sub.subModId) === Number(subModId))
      : subModules;

    for (const sub of filteredSubModules) {
      for (const hdr of sub.headerIds ?? []) {
        if ((hdr.menuIds ?? []).some((id: any) => Number(id) === menuId)) {
          return true;
        }
      }
    }
  }

  return false;
};

export const getBillingTabPermissions = (moduleDetails: Module[], subModId?: number) => ({
  hasProcedureAccess: hasMenuPermission(moduleDetails, PHARMACY_BILLING_MENU_IDS.PROCEDURE, subModId),
  hasPharmacyAccess: hasMenuPermission(moduleDetails, PHARMACY_BILLING_MENU_IDS.PHARMACY, subModId),
  hasLabAccess: hasMenuPermission(moduleDetails, PHARMACY_BILLING_MENU_IDS.LAB, subModId),
  hasIPAccess: hasMenuPermission(moduleDetails, PHARMACY_BILLING_MENU_IDS.IP, subModId),
  canSaveBill: hasMenuPermission(moduleDetails, PHARMACY_BILLING_MENU_IDS.SAVE_BILL, subModId),
  canOrderBill: hasMenuPermission(moduleDetails, PHARMACY_BILLING_MENU_IDS.ORDER_BILL, subModId),
  canDiscount: hasMenuPermission(moduleDetails, PHARMACY_BILLING_MENU_IDS.DISCOUNT, subModId),
  canDuplicate: hasMenuPermission(moduleDetails, PHARMACY_BILLING_MENU_IDS.DUPLICATE, subModId),
  hasDueAccess: hasMenuPermission(moduleDetails, PHARMACY_BILLING_MENU_IDS.DUE, subModId),
  hasAdvanceAccess: hasMenuPermission(moduleDetails, PHARMACY_BILLING_MENU_IDS.ADVANCE, subModId),
  hasReturnAccess: hasMenuPermission(moduleDetails, PHARMACY_BILLING_MENU_IDS.RETURN, subModId),
  canDueDiscount: hasMenuPermission(moduleDetails, PHARMACY_BILLING_MENU_IDS.DUE_DISCOUNT, subModId),
  hasRegistrationAccess: hasMenuPermission(moduleDetails, PHARMACY_BILLING_MENU_IDS.REGISTRATION, subModId),
});

