// Cash Counter (Billing) Menu Configuration
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
  accessCode?: number;
  icon: string;
  submenus?: MenuItemConfig[];
}

export interface ModuleMenuConfig {
  moduleId: number;
  moduleName: string;
  menus: MenuItemConfig[];
}

export const cashCounterMenuConfig: ModuleMenuConfig = {
  moduleId: 5,
  moduleName: "Cash Counter",
  menus: [
    {
      id: "billing",
      name: "Billing",
      icon: "fas fa-file-invoice-dollar",
      accessCode: 26,
      submenus: [
        {
          id: "op-billing",
          name: "Billing",
          url: routerPathNames.cashCounter.billing.opBilling,
          icon: "fas fa-bed",
          accessCode: 237
        },
         {
          id: "CancelOrder",
          name: "Cancel Order",
          url: routerPathNames.cashCounter.billing.CancelOrder,
          icon: "fas fa-bed",
          accessCode: 581
        }
      ]
    },
    {
      id: "activities",
      name: "Activities",
      icon: "fas fa-tasks",
      accessCode: 27,
      submenus: [
        
        
        {
          id: "company-receivables",
          name: "Company / Insurance",
          icon: "fas fa-building",
          accessCode: 259,
          submenus: [
            {
              id: "company-receivables-list",
              name: "Company Receivables",
              url: routerPathNames.cashCounter.activities.companyReceivables.receivables,
              icon: "fas fa-clipboard-list",
              accessCode: 259
            },
            {
              id: "change-credit-bill-to-company",
              name: "Change Credit Bill to Company",
              url: routerPathNames.cashCounter.activities.companyReceivables.changeCreditBillToCompany,
              icon: "fas fa-exchange-alt",
              accessCode: 259
            },
            {
              id: "change-company-to-credit-bill",
              name: "Change Company to Credit Bill",
              url: routerPathNames.cashCounter.activities.companyReceivables.changeCompanyToCreditBill,
              icon: "fas fa-undo-alt",
              accessCode: 259
            },
            {
              id: "change-company-to-company",
              name: "Change Company to Company",
              url: routerPathNames.cashCounter.activities.companyReceivables.changeCompanyToCompany,
              icon: "fas fa-exchange-alt",
              accessCode: 259
            }
          ]
        },
        {
          id: "duplicate-bill",
          name: "Duplicate Bill",
          url: routerPathNames.cashCounter.activities.duplicateBill,
          icon: "fas fa-copy",
          accessCode: 241
        },
        
        {
          id: "view-chart",
          name: "View Chart",
          url: routerPathNames.cashCounter.activities.viewChart,
          icon: "fas fa-chart-bar",
          accessCode: 243
        },
        {
          id: "update-due",
          name: "Update Due",
          url: routerPathNames.cashCounter.activities.updateDue,
          icon: "fas fa-receipt",
          accessCode: 693
        }
      ]
    },
    {
      id: "masters",
      name: "Masters",
      icon: "fas fa-database",
      accessCode: 28,
      submenus: [
        {
          id: "investigation-groups",
          name: "Investigation Groups",
          icon: "fas fa-layer-group",
          accessCode: 244,
          url: routerPathNames.cashCounter.masters.investigationGroups,
        },
        {
          id: "procedures",
          name: "Procedures",
          icon: "fas fa-concierge-bell",
          accessCode: 245,
          url: routerPathNames.cashCounter.masters.procedures
        },
        {
          id: "packages",
          name: "Packages",
          icon: "fas fa-light fa-box-open",
          accessCode: 245,
          url: routerPathNames.cashCounter.masters.packages
        },
        {
          id: "company-head",
          name: "Company Head",
          icon: "fas fa-building-user",
          accessCode: 245,
          url: routerPathNames.cashCounter.masters.companyHead
        },
      ]
    },
    
    {
      id: "reports",
      name: "Reports",
      icon: "fas fa-chart-line",
      accessCode: 29,
      submenus: [
        {
          id: "account-collection",
          name: "Account Collection",
          icon: "fas fa-money-bill-wave",
          submenus: [
            {
              id: "ip-bills",
              name: "IP Bills",
              url: routerPathNames.cashCounter.accountCollection.ipBills,
              icon: "fas fa-file-invoice",
              accessCode: 259
            },
            {
              id: "advance-refund",
              name: "Advance",
              url: routerPathNames.cashCounter.accountCollection.advanceRefund,
              icon: "fas fa-undo-alt",
              accessCode: 259
            },
            {
              id: "acc-investigation-collection",
              name: "Investigation",
              url: routerPathNames.cashCounter.accountCollection.accInvestigationCollection,
              icon: "fas fa-microscope",
              accessCode: 259
            },
            {
              id: "acc-pharmacy-collection",
              name: "Pharmacy",
              url: routerPathNames.cashCounter.accountCollection.accPharmacyCollection,
              icon: "fas fa-pills",
              accessCode: 259
            },
            {
              id: "acc-lab-collection",
              name: "Lab",
              url: routerPathNames.cashCounter.accountCollection.accLabCollection,
              icon: "fas fa-flask",
              accessCode: 259
            },
            {
              id: "acc-registration-collection",
              name: "Registration",
              url: routerPathNames.cashCounter.accountCollection.accRegistrationCollection,
              icon: "fas fa-user-plus",
              accessCode: 259
            },
            {
              id: "acc-company-receipt",
              name: "Company Receipt",
              url: routerPathNames.cashCounter.accountCollection.accCompanyReceipt,
              icon: "fas fa-building",
              accessCode: 259
            },
            
            {
              id: "user-wise",
              name: "User Wise",
              icon: "fas fa-money-bill-wave",
              submenus: [
                {
                  id: "acc-user-wise-collection",
                  name: "All User Wise",
                  url: routerPathNames.cashCounter.accountCollection.userdayend,
                  icon: "fas fa-user-cog",
                  accessCode: 259
                },
                {
                  id: "acc-except-ph-user-wise-collection",
                  name: "Except Ph User Wise",
                  url: routerPathNames.cashCounter.accountCollection.accExceptPhUserWiseCollection,
                  icon: "fas fa-user-cog",
                  accessCode: 259
                },
                {
                  id: "acc-ph-user-wise-collection",
                  name: "Ph User Wise",
                  url: routerPathNames.cashCounter.accountCollection.accPhUserWiseCollection,
                  icon: "fas fa-user-cog",
                  accessCode: 259
                },
              ]
            },
          ]
        },        {
          id: "due-collection-report",
          name: "Due Collection",
          url: routerPathNames.cashCounter.registers.dueCollection,
          icon: "fas fa-coins",
          accessCode: 259
        },
        {
          id: "due-register-report",
          name: "Due Register",
          url: routerPathNames.cashCounter.registers.dueRegister,
          icon: "fas fa-book",
          accessCode: 261
        },        
        {
          id: "discount-bill-details",
          name: "Discount Bill Details",
          url: routerPathNames.cashCounter.accountCollection.discountBillDetails,
          icon: "fas fa-book",
          accessCode: 259
        },         
      ]
    },
    // {
    //   id: "registers",
    //   name: "Registers",
    //   icon: "fas fa-book",
    //   accessCode: 30,
    //   submenus: [
    //     {
    //       id: "registration-collection",
    //       name: "Registration Collection",
    //       url: routerPathNames.cashCounter.registers.registrationCollection,
    //       icon: "fas fa-user-md",
    //       accessCode: 254
    //     },
    //     {
    //       id: "investigation-collection",
    //       name: "Investigation Collection",
    //       url: routerPathNames.cashCounter.registers.investigationCollection,
    //       icon: "fas fa-layer-group",
    //       accessCode: 255
    //     },
    //     {
    //       id: "pharmacy-collection",
    //       name: "Pharmacy Collection",
    //       url: routerPathNames.cashCounter.registers.pharmacyCollection,
    //       icon: "fas fa-money-check-alt",
    //       accessCode: 257
    //     },
    //     {
    //       id: "lab-collection",
    //       name: "Lab Collection",
    //       url: routerPathNames.cashCounter.registers.labCollection,
    //       icon: "fas fa-coins",
    //       accessCode: 258
    //     },
    //     {
    //       id: "due-collection",
    //       name: "Due Collection",
    //       url: routerPathNames.cashCounter.registers.dueCollection,
    //       icon: "fas fa-coins",
    //       accessCode: 259
    //     },
    //     {
    //       id: "ipAdvanceCollection",
    //       name: "IP Advance Collection",
    //       url: routerPathNames.cashCounter.registers.ipAdvanceCollection,
    //       icon: "fas fa-coins",
    //       accessCode: 260
    //     },
    //     {
    //       id: "dueRegister",
    //       name: "Due Register",
    //       url: routerPathNames.cashCounter.registers.dueRegister,
    //       icon: "fas fa-coins",
    //       accessCode: 261
    //     },
    //     {
    //       id: "charityRegister",
    //       name: "Charity Register ",
    //       url: routerPathNames.cashCounter.registers.charityRegister,
    //       icon: "fas fa-coins",
    //       accessCode: 262
    //     },
    //     {
    //       id: "CASH HAND OVER DETAILS",
    //       name: "Cash HandOver Details",
    //       url: routerPathNames.cashCounter.registers.cashHandOverDetails,
    //       icon: "fas fa-coins",
    //       accessCode: 263
    //     },
    //   ]
    // },
    {
      id: "ReimbursementBills",
      name: "Reimbursement Bills",
      icon: "fas fa-file-invoice",
      submenus: [
        
        {
          id: "pharmacySheet",
          name: "Pharmacy Sheet",
          url: routerPathNames.cashCounter.reimbursementBills.pharmacySheet,
          icon: "fas fa-calendar",
          accessCode: 241
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

      if (menu.submenus && menu.submenus.length > 0) {
        const filteredSubmenus = filterMenusByAccess(menu.submenus, { menuIds: accessCodes.submenuIds, submenuIds: accessCodes.submenuIds });

        if (filteredSubmenus.length > 0 || (menu.accessCode !== undefined && accessCodes.menuIds.includes(menu.accessCode))) {
          return {
            ...menu,
            submenus: filteredSubmenus
          };
        }
        return null;
      }

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

// Billing tab / button permission IDs
export const BILLING_MENU_IDS = {
  PROCEDURE:   586,
  PHARMACY:    587,
  LAB:         588,
  IP:          589,
  REGISTRATION:  586,
  SAVE_BILL:   595,
  ORDER_BILL:  596,
  DISCOUNT:    597,
  DUPLICATE:   598,
  DUE:         607,
  ADVANCE:     608,
  RETURN:      609,
  DUE_DISCOUNT: 692,
} as const;

const hasMenuPermission = (moduleDetails: Module[], menuId: number): boolean => {
  if (!moduleDetails?.length) return false;
  for (const mod of moduleDetails) {
    for (const sub of mod.subModIds ?? []) {
      for (const hdr of sub.headerIds ?? []) {
        if ((hdr.menuIds ?? []).some((id: any) => Number(id) === menuId)) return true;
      }
    }
  }
  return false;
};

export const getBillingTabPermissions = (moduleDetails: Module[]) => ({
  hasProcedureAccess: hasMenuPermission(moduleDetails, BILLING_MENU_IDS.PROCEDURE),
  hasPharmacyAccess:  hasMenuPermission(moduleDetails, BILLING_MENU_IDS.PHARMACY),
  hasLabAccess:       hasMenuPermission(moduleDetails, BILLING_MENU_IDS.LAB),
  hasIPAccess:        hasMenuPermission(moduleDetails, BILLING_MENU_IDS.IP),
  canSaveBill:        hasMenuPermission(moduleDetails, BILLING_MENU_IDS.SAVE_BILL),
  canOrderBill:       hasMenuPermission(moduleDetails, BILLING_MENU_IDS.ORDER_BILL),
  canDiscount:        hasMenuPermission(moduleDetails, BILLING_MENU_IDS.DISCOUNT),
  canDuplicate:       hasMenuPermission(moduleDetails, BILLING_MENU_IDS.DUPLICATE),
  hasDueAccess:       hasMenuPermission(moduleDetails, BILLING_MENU_IDS.DUE),
  hasAdvanceAccess:   hasMenuPermission(moduleDetails, BILLING_MENU_IDS.ADVANCE),
  hasReturnAccess:    hasMenuPermission(moduleDetails, BILLING_MENU_IDS.RETURN),
  canDueDiscount:     hasMenuPermission(moduleDetails, BILLING_MENU_IDS.DUE_DISCOUNT),
  hasRegistrationAccess:    hasMenuPermission(moduleDetails, BILLING_MENU_IDS.REGISTRATION),
});