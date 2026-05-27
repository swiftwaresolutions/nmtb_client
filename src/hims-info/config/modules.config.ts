// Module configuration with icons and details
import { routerPathNames } from '../../routes/routerPathNames';

export interface ModuleConfig {
  id: number;
  title: string;
  description: string;
  iconName: string;
  link: string;
  isExternal?: boolean;
  category?: string;
}

export const modulesConfig: ModuleConfig[] = [
  {
    id: 1,
    title: "MEDICAL RECORDS",
    description: "Patient Registration Section",
    iconName: "fas fa-notes-medical",
    link: routerPathNames.medicalRecords.base,
    isExternal: false,
    category: "registration"
  },
  {
    id: 5,
    title: "BILLING",
    description: "CASH COUNTER",
    iconName: "fas fa-file-invoice-dollar",
    link: routerPathNames.cashCounter.base,
    isExternal: false,
    category: "billing"
  },
  {
    id: 2,
    title: "LABORATORY",
    description: "Laboratory",
    iconName: "fas fa-flask",
    link: routerPathNames.laboratory.base,
    isExternal: false,
    category: "laboratory"
  },
  {
    id: 3,
    title: "PHARMACY",
    description: "Pharmacy Section",
    iconName: "fas fa-money-bill-wave",
    link: routerPathNames.pharmacyStores.base,
    category: "pharmacy"
  },
  {
    id: 4,
    title: "CENTRAL STORE",
    description: "Main Store",
    iconName: "fas fa-warehouse",
    link: routerPathNames.centralStores.base,
    isExternal: false,
    category: "store"
  },
  {
    id: 6,
    title: "FINANCIAL ACCOUNTS",
    description: "Financial Accounting Section",
    iconName: "fas fa-rupee-sign",
    link: routerPathNames.financialAccounts.base,
    isExternal: false,
    category: "accounts"
  },
  {
    id: 8,
    title: "EMPLOYEE MANAGEMENT",
    description: "Employee Management Section",
    iconName: "fas fa-user-tie",
    link: routerPathNames.employeeManagement.base,
    isExternal: false,
    category: "employee"
  },
  {
    id: 9,
    title: "PAYROLL & HR",
    description: "Payroll and Hr Section",
    iconName: "fas fa-calculator",
    link: routerPathNames.payrollManagement.base,
    isExternal: false,
    category: "payroll"
  },
  {
    id: 12,
    title: "RADIOLOGY",
    description: "Radiology Section",
    iconName: "fas fa-x-ray",
    link: routerPathNames.radiology.base,
    isExternal: false,
    category: "radiology"
  },
  {
    id: 14,
    title: "SYSTEM ADMINISTRATION",
    description: "System Administration Section",
    iconName: "fas fa-cogs",
    link: routerPathNames.systemAdmin.base,
    category: "admin"
  },
  {
    id: 15,
    title: "PACs",
    description: "Manual IFrame Integration",
    iconName: "fas fa-window-restore",
    link: routerPathNames.pacs.base,
    isExternal: false,
    category: "integration"
  }
];

// Helper function to get icon class
export const geticonName = (iconName: string): string => {
  return iconName;
};

// Helper function to filter modules based on user rights
export const filterModulesByRights = (
  modules: ModuleConfig[],
  userModuleRights: number[],
  userId?: number
): ModuleConfig[] => {
    return modules.filter(module => {
      return userModuleRights.includes(module.id);
  });
};
