// System Admin Menu Configuration
import { routerPathNames } from '../../routes/routerPathNames';

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

export const systemAdminMenuConfig: ModuleMenuConfig = {
  moduleId: 14, // System Admin Module ID
  moduleName: "System Admin",
  menus: [
    {
      id: "activities",
      name: "Activities",
      icon: "fas fa-tasks",
      accessCode: 55,
      submenus: [
        
        {
          id: "bill-cancel",
          name: "Bill Cancel",
          url: routerPathNames.systemAdmin.activities.billCancel,
          icon: "fas fa-times-circle",
          accessCode: 433
        }
      ]
    },
    {
      id: "records",
      name: "Records",
      icon: "fas fa-folder-open",
      accessCode: 56,
      submenus: [
        {
          id: "department",
          name: "Department",
          icon: "fas fa-building",
          url: routerPathNames.systemAdmin.records.department.add,
          accessCode: 434
        },
        {
          id: "consultant",
          name: "Consultant",
          icon: "fas fa-user-md",
          url: routerPathNames.systemAdmin.records.consultant.add,
          accessCode: 435
        },
        {
          id: "ward",
          name: "Ward",
          icon: "fas fa-procedures",
          url: routerPathNames.systemAdmin.records.ward.create,
          accessCode: 436
        },
        {
          id: "rooms-beds",
          name: "Rooms/Beds",
          icon: "fas fa-bed",
          url: routerPathNames.systemAdmin.records.roomsBeds.add,
          accessCode: 437
        },
        {
          id: "SystemRole",
          name: "Permissions",
          icon: "fas fa-user-lock",
          url: routerPathNames.systemAdmin.records.Role.systemRole,
          accessCode: 438
        },

        // {
        //   id: "consulting-charge",
        //   name: "Consulting Charge",
        //   icon: "fas fa-dollar-sign",
        //   submenus: [
        //     {
        //       id: "departmentwise",
        //       name: "Departmentwise",
        //       icon: "fas fa-building",
        //       submenus: [
        //         {
        //           id: "dept-charge-add",
        //           name: "Add",
        //           url: routerPathNames.systemAdmin.records.consultingCharge.departmentwise.add,
        //           icon: "fas fa-plus"
        //         },
        //         {
        //           id: "dept-charge-edit",
        //           name: "Edit",
        //           url: routerPathNames.systemAdmin.records.consultingCharge.departmentwise.edit,
        //           icon: "fas fa-edit"
        //         }
        //       ]
        //     },
        //     {
        //       id: "consultantwise",
        //       name: "Consultantwise",
        //       icon: "fas fa-user-md",
        //       submenus: [
        //         {
        //           id: "consultant-charge-add",
        //           name: "Add",
        //           url: routerPathNames.systemAdmin.records.consultingCharge.consultantwise.add,
        //           icon: "fas fa-plus"
        //         },
        //         {
        //           id: "consultant-charge-edit",
        //           name: "Edit",
        //           url: routerPathNames.systemAdmin.records.consultingCharge.consultantwise.edit,
        //           icon: "fas fa-edit"
        //         }
        //       ]
        //     }
        //   ]
        // },
        // {
        //   id: "package",
        //   name: "Package",
        //   icon: "fas fa-box",
        //   submenus: [
        //     {
        //       id: "package-add",
        //       name: "Add",
        //       url: routerPathNames.systemAdmin.records.package.add,
        //       icon: "fas fa-plus"
        //     },
        //     {
        //       id: "package-update",
        //       name: "Package Update",
        //       url: routerPathNames.systemAdmin.records.package.update,
        //       icon: "fas fa-sync-alt"
        //     }
        //   ]
        // },
        // {
        //   id: "company-accounts",
        //   name: "Company Accounts",
        //   icon: "fas fa-building",
        //   submenus: [
        //     {
        //       id: "company-open",
        //       name: "Open",
        //       url: routerPathNames.systemAdmin.records.companyAccounts.open,
        //       icon: "fas fa-folder-open"
        //     },
        //     {
        //       id: "company-block",
        //       name: "Block",
        //       url: routerPathNames.systemAdmin.records.companyAccounts.block,
        //       icon: "fas fa-lock"
        //     },
        //     {
        //       id: "company-unblock",
        //       name: "Un Block",
        //       url: routerPathNames.systemAdmin.records.companyAccounts.unblock,
        //       icon: "fas fa-unlock"
        //     }
        //   ]
        // },
        // {
        //   id: "category-type",
        //   name: "Category Type",
        //   icon: "fas fa-tags",
        //   submenus: [
        //     {
        //       id: "category-add",
        //       name: "Add",
        //       url: routerPathNames.systemAdmin.records.categoryType.add,
        //       icon: "fas fa-plus"
        //     }
        //   ]
        // },
        // {
        //   id: "company-updation",
        //   name: "Company Updation",
        //   url: routerPathNames.systemAdmin.records.companyUpdation,
        //   icon: "fas fa-edit"
        // },
        // {
        //   id: "account-heads",
        //   name: "Account Heads",
        //   icon: "fas fa-list",
        //   submenus: [
        //     {
        //       id: "account-heads-add",
        //       name: "Add",
        //       url: routerPathNames.systemAdmin.records.accountHeads.add,
        //       icon: "fas fa-plus"
        //     },
        //     {
        //       id: "account-heads-edit",
        //       name: "Edit",
        //       url: routerPathNames.systemAdmin.records.accountHeads.edit,
        //       icon: "fas fa-edit"
        //     }
        //   ]
        // },
        // {
        //   id: "discharge-consultants",
        //   name: "Discharge Consultants",
        //   icon: "fas fa-user-md",
        //   submenus: [
        //     {
        //       id: "discharge-add-edit-block",
        //       name: "Add/Edit/Block",
        //       url: routerPathNames.systemAdmin.records.dischargeConsultants.addEditBlock,
        //       icon: "fas fa-edit"
        //     },
        //     {
        //       id: "discharge-unblock",
        //       name: "Un Block",
        //       url: routerPathNames.systemAdmin.records.dischargeConsultants.unblock,
        //       icon: "fas fa-unlock"
        //     }
        //   ]
        // },
        {
          id: "cash-type",
          name: "Cash Type",
          icon: "fas fa-money-bill-wave",
          url: routerPathNames.systemAdmin.records.cashType.addEditUnblock,
          accessCode: 439
        },
        {
          id: "bank-payment-mode",
          name: "Bank Payment Mode",
          icon: "fas fa-credit-card",
          url: routerPathNames.systemAdmin.records.bankPaymentMode.addEditUnblock,
          accessCode: 440
        },
        {
          id: "bank-details",
          name: "Bank Details",
          icon: "fas fa-university",
          url: routerPathNames.systemAdmin.records.bankDetails.addEditUnblock,
          accessCode: 441
        },
        // {
        //   id: "registration-config",
        //   name: "Registration Config",
        //   icon: "fas fa-cog",
        //   submenus: [
        //     {
        //       id: "registration-add-edit",
        //       name: "Add/Edit",
        //       url: routerPathNames.systemAdmin.records.registrationConfig.addEdit,
        //       icon: "fas fa-edit"
        //     },
        //     {
        //       id: "registration-unblock",
        //       name: "UnBlock",
        //       url: routerPathNames.systemAdmin.records.registrationConfig.unblock,
        //       icon: "fas fa-unlock"
        //     }
        //   ]
        // }
      ]
    },
    {
      id: "configure-user",
      name: "Configure User",
      icon: "fas fa-users-cog",
      accessCode: 57,
      submenus: [
        {
          id: "create-user",
          name: "Create User",
          url: routerPathNames.systemAdmin.configureUser.createUser,
          icon: "fas fa-user-plus",
          accessCode: 442
        },
        // {
        //   id: "edit-user",
        //   name: "Edit User",
        //   url: routerPathNames.systemAdmin.configureUser.editUser,
        //   icon: "fas fa-user-edit"
        // },
        // {
        //   id: "block-user",
        //   name: "Block User",
        //   url: routerPathNames.systemAdmin.configureUser.blockUser,
        //   icon: "fas fa-user-lock"
        // },
        // {
        //   id: "unblock-user",
        //   name: "Un Block User",
        //   url: routerPathNames.systemAdmin.configureUser.unblockUser,
        //   icon: "fas fa-user-check"
        // },
        {
          id: "reset-password",
          name: "Reset Password",
          url: routerPathNames.systemAdmin.configureUser.resetPassword,
          icon: "fas fa-key",
          accessCode: 443
        },
        // {
        //   id: "add-user-photo",
        //   name: "Add User Photo",
        //   url: routerPathNames.systemAdmin.configureUser.addUserPhoto,
        //   icon: "fas fa-camera"
        // },
        // {
        //   id: "assign-concession-rights",
        //   name: "Assign Concession Rights",
        //   url: routerPathNames.systemAdmin.configureUser.assignConcessionRights,
        //   icon: "fas fa-user-shield"
        // }
      ]
    },
    
    
  ]
};

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
