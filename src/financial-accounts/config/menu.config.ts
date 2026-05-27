// Financial Accounts Menu Configuration
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

export const financialAccountsMenuConfig: ModuleMenuConfig = {
  moduleId: 6,
  moduleName: "Financial Accounts",
  menus: [
    {
      id: "transactions",
      name: "Transactions",
      icon: "fas fa-exchange-alt",
      accessCode: 60,
      submenus: [
        {
          id: "transactions-entry",
          name: "Transactions",
          url: routerPathNames.financialAccounts.transactions.entry,
          icon: "fas fa-file-invoice-dollar",
          accessCode: 452,
        },
        {
          id: "opening-balance",
          name: "Opening Balance",
          url: routerPathNames.financialAccounts.transactions.openingBalance,
          icon: "fas fa-balance-scale",
          accessCode: 453,
        },
        {
          id: "company-receivables",
          name: "Company Receivables",
          url: routerPathNames.financialAccounts.transactions.companyReceivables,
          icon: "fas fa-building",
          accessCode: 454,
        },
        {
          id: "donation-entry",
          name: "Donation Entry",
          url: routerPathNames.financialAccounts.transactions.donationEntry,
          icon: "fas fa-hand-holding-heart",
          accessCode: 455,
        },
        {
          id: "petty-cash-entry",
          name: "Petty Cash Entry",
          url: routerPathNames.financialAccounts.transactions.pettyCashEntry,
          icon: "fas fa-coins",
          accessCode: 456,
        }
      ]
    },
    {
      id: "activities",
      name: "Activities",
      icon: "fas fa-tasks",
      accessCode: 61,
      submenus: [
        {
          id: "reconciliation",
          name: "Reconciliation",
          icon: "fas fa-check-double",
          submenus: [
            {
              id: "reconciliation-entry",
              name: "Reconciliation Entry",
              url: routerPathNames.financialAccounts.activities.reconciliation.entry,
              icon: "fas fa-edit",
              accessCode: 457,
            }
          ]
        },
        {
          id: "request",
          name: "Request",
          icon: "fas fa-file-alt",
          submenus: [
            {
              id: "request-entry",
              name: "Request Entry",
              url: routerPathNames.financialAccounts.activities.request.entry,
              icon: "fas fa-plus-circle",
              accessCode: 458,
            },
            {
              id: "request-sanction",
              name: "Request Sanction",
              url: routerPathNames.financialAccounts.activities.request.sanction,
              icon: "fas fa-check-circle",
              accessCode: 459,
            },
            {
              id: "request-register",
              name: "Request Register",
              url: routerPathNames.financialAccounts.activities.request.register,
              icon: "fas fa-list-alt",
              accessCode: 460,
            }
          ]
        },
        {
          id: "transaction-print",
          name: "Transaction Print",
          url: routerPathNames.financialAccounts.activities.transactionPrint,
          icon: "fas fa-print",
          accessCode: 461,
        },
        {
          id: "payment-voucher",
          name: "Payment Voucher",
          icon: "fas fa-file-invoice",
          submenus: [
            {
              id: "payment-note-entry",
              name: "Payment Note Entry",
              url: routerPathNames.financialAccounts.activities.paymentVoucher.noteEntry,
              icon: "fas fa-sticky-note",
              accessCode: 462,
            },
            {
              id: "voucher-preparation",
              name: "Voucher Preparation",
              url: routerPathNames.financialAccounts.activities.paymentVoucher.preparation,
              icon: "fas fa-file-invoice-dollar",
              accessCode: 463,
            },
            {
              id: "voucher-approval",
              name: "Approval",
              url: routerPathNames.financialAccounts.activities.paymentVoucher.approval,
              icon: "fas fa-stamp",
              accessCode: 464,
            }
          ]
        },
        {
          id: "payment-print",
          name: "Payment Print",
          url: routerPathNames.financialAccounts.activities.paymentPrint,
          icon: "fas fa-receipt",
          accessCode: 465,
        },
        {
          id: "edit-cheque",
          name: "Edit Cheque",
          url: routerPathNames.financialAccounts.activities.editCheque,
          icon: "fas fa-money-check-alt",
          accessCode: 466,
        },
        {
          id: "transaction-payment-print",
          name: "Transaction Payment Print",
          url: routerPathNames.financialAccounts.activities.transactionPaymentPrint,
          icon: "fas fa-file-pdf",
          accessCode: 467,
        }
      ]
    },
    {
      id: "setup",
      name: "Set up",
      icon: "fas fa-cog",
      accessCode: 62,
      submenus: [
        {
          id: "account-heads",
          name: "Account Heads",
          icon: "fas fa-list",
          submenus: [
            {
              id: "account-heads-add",
              name: "Add",
              url: routerPathNames.financialAccounts.setup.accountHeads.add,
              icon: "fas fa-plus",
              accessCode: 468,
            },
            // {
            //   id: "account-heads-edit",
            //   name: "Edit",
            //   url: routerPathNames.financialAccounts.setup.accountHeads.edit,
            //   icon: "fas fa-edit",
            //   accessCode: 469,
            // }
          ]
        },
        {
          id: "open-party-accounts",
          name: "Open Party Accounts",
          icon: "fas fa-user-friends",
          submenus: [
            {
              id: "pharma-suppliers",
              name: "Pharma Suppliers",
              url: routerPathNames.financialAccounts.setup.openPartyAccounts.pharmaSuppliers,
              icon: "fas fa-pills",
              accessCode: 469,
            }
          ]
        },
        {
          id: "config-head",
          name: "Config Head",
          url: routerPathNames.financialAccounts.setup.configHead,
          icon: "fas fa-sliders-h",
          accessCode: 470,
        }
      ]
    },
    {
      id: "books",
      name: "Books",
      icon: "fas fa-book",
      accessCode: 63,
      submenus: [
        {
          id: "day-book-new",
          name: "Day Book",
          url: routerPathNames.financialAccounts.books.dayBookNew,
          icon: "fas fa-calendar-day",
          accessCode: 471,
        },
        {
          id: "cash-book",
          name: "Cash Book",
          url: routerPathNames.financialAccounts.books.cashBook,
          icon: "fas fa-money-bill-wave",
          accessCode: 472,
        },
        {
          id: "journal-book",
          name: "Journal Book",
          url: routerPathNames.financialAccounts.books.journalBook,
          icon: "fas fa-journal-whills",
          accessCode: 473,
        },
        {
          id: "petty-cash",
          name: "Petty Cash",
          url: routerPathNames.financialAccounts.books.pettyCash,
          icon: "fas fa-wallet",
          accessCode: 474,
        },
        {
          id: "bank-book",
          name: "Bank Book",
          url: routerPathNames.financialAccounts.books.bankBook,
          icon: "fas fa-university",
          accessCode: 475,
        },
        {
          id: "day-book",
          name: "Day Book",
          url: routerPathNames.financialAccounts.books.dayBook,
          icon: "fas fa-book-open",
          accessCode: 475,
        }
      ]
    },
    {
      id: "ledger",
      name: "Ledger",
      icon: "fas fa-book-open",
      accessCode: 64,
      submenus: [
        {
          id: "between-dates",
          name: "Between Dates",
          url: routerPathNames.financialAccounts.ledger.betweenDates,
          icon: "fas fa-calendar-alt",
          accessCode: 476,
        }
      ]
    },
    {
      id: "final-accounts",
      name: "Final Accounts",
      icon: "fas fa-file-contract",
      accessCode: 65,
      submenus: [
        {
          id: "income-expense-statements",
          name: "I & E Statements",
          url: routerPathNames.financialAccounts.finalAccounts.incomeExpenseStatements,
          icon: "fas fa-chart-line",
          accessCode: 477,
        },
        {
          id: "trial-balance",
          name: "Trial Balance",
          url: routerPathNames.financialAccounts.finalAccounts.trialBalance,
          icon: "fas fa-balance-scale-right",
          accessCode: 478,
        },
        {
          id: "balance-sheet",
          name: "Balance Sheet",
          url: routerPathNames.financialAccounts.finalAccounts.balanceSheet,
          icon: "fas fa-file-invoice",
          accessCode: 479,
        },
        {
          id: "sundry-creditors",
          name: "Sundry Creditors",
          url: routerPathNames.financialAccounts.finalAccounts.sundryCreditors,
          icon: "fas fa-user-minus",
          accessCode: 480,
        },
        {
          id: "sundry-debtors",
          name: "Sundry Debtors",
          url: routerPathNames.financialAccounts.finalAccounts.sundryDebtors,
          icon: "fas fa-user-plus",
          accessCode: 481,
        },
        {
          id: "company-wise-paid-bills",
          name: "Company Wise Paid Bills",
          url: routerPathNames.financialAccounts.finalAccounts.companyWisePaidBills,
          icon: "fas fa-file-invoice-dollar",
          accessCode: 482,
        },
        {
          id: "company-wise-due-bills",
          name: "Company Wise Due Bills",
          url: routerPathNames.financialAccounts.finalAccounts.companyWiseDueBills,
          icon: "fas fa-exclamation-triangle",
          accessCode: 483,
        },
        {
          id: "supplier-wise-pending",
          name: "Supplier Wise Pending",
          url: routerPathNames.financialAccounts.finalAccounts.supplierWisePending,
          icon: "fas fa-hourglass-half",
          accessCode: 484,
        },
        {
          id: "donation",
          name: "Donation",
          url: routerPathNames.financialAccounts.finalAccounts.donation,
          icon: "fas fa-donate",
          accessCode: 485,
        },
        {
          id: "supplier-wise-advance-pending",
          name: "Supplier Wise Advance Pending",
          url: routerPathNames.financialAccounts.finalAccounts.supplierWiseAdvancePending,
          icon: "fas fa-clock",
          accessCode: 486,
        },
        {
          id: "supplier-wise-advance-adjust-bills",
          name: "Supplier Wise Advance Adjust Bills",
          url: routerPathNames.financialAccounts.finalAccounts.supplierWiseAdvanceAdjustBills,
          icon: "fas fa-adjust",
          accessCode: 487,
        },
        {
          id: "outside-lab-pending-bills",
          name: "Out Side Lab Pending Bills",
          url: routerPathNames.financialAccounts.finalAccounts.outsideLabPendingBills,
          icon: "fas fa-flask",
          accessCode: 488,
        },
        {
          id: "outside-lab-paid-bills",
          name: "Out Side Lab Paid Bills",
          url: routerPathNames.financialAccounts.finalAccounts.outsideLabPaidBills,
          icon: "fas fa-flask",
          accessCode: 488,
        },
        {
          id: "outside-doctor-pending-bills",
          name: "Out Side Doctor Pending Bills",
          url: routerPathNames.financialAccounts.finalAccounts.outsideDoctorPendingBills,
          icon: "fas fa-user-md",
          accessCode: 489,
        },
        {
          id: "outside-doctor-paid-bills",
          name: "Out Side Doctor Paid Bills",
          url: routerPathNames.financialAccounts.finalAccounts.outsideDoctorPaidBills,
          icon: "fas fa-user-md",
          accessCode: 490,
        },
        {
          id: "bank-payment",
          name: "Bank Payment",
          url: routerPathNames.financialAccounts.finalAccounts.bankPayment,
          icon: "fas fa-university",
          accessCode: 491,
        },
        {
          id: "supplier-wise-paid",
          name: "Supplier Wise Paid",
          url: routerPathNames.financialAccounts.finalAccounts.supplierWisePaid,
          icon: "fas fa-check",
          accessCode: 492,
        },
        {
          id: "income-expense-statements-inventory",
          name: "I & E Statements (Inventory)",
          url: routerPathNames.financialAccounts.finalAccounts.incomeExpenseStatementsInventory,
          icon: "fas fa-chart-bar",
          accessCode: 493,
        },
        {
          id: "trial-balance-inventory",
          name: "Trial Balance (Inventory)",
          url: routerPathNames.financialAccounts.finalAccounts.trialBalanceInventory,
          icon: "fas fa-balance-scale",
          accessCode: 494,
        },
        {
          id: "balance-sheet-inventory",
          name: "Balance Sheet (Inventory)",
          url: routerPathNames.financialAccounts.finalAccounts.balanceSheetInventory,
          icon: "fas fa-file-alt",
          accessCode: 495,
        },
        {
          id: "receipt-payment",
          name: "Receipt & Payment",
          url: routerPathNames.financialAccounts.finalAccounts.receiptPayment,
          icon: "fas fa-receipt",
          accessCode: 495,
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

