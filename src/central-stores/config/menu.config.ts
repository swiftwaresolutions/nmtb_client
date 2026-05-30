import { routerPathNames } from "../../routes/routerPathNames";

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

// Medical Store Menu Configuration (Based on HorizontalFrames_var.js)
export const medicalStoreMenuConfig: ModuleMenuConfig = {
  moduleId: 4,
  moduleName: "Medical Store",
  menus: [
    {
      id: "purchase",
      name: "Purchase",
      icon: "fas fa-shopping-cart",
      accessCode: [31],
      submenus: [
        {
          id: "prepare-order",
          name: "Purchase Order",
          url: "purchase/prepare-order",
          icon: "fas fa-file-medical",
          accessCode: [264]
        },
        {
          id: "approve-order",
          name: "PO Review & Approval",
          url: "purchase/approve-order",
          icon: "fas fa-check-circle",
          accessCode: [265]
        },
        {
          id: "purchase-entry",
          name: "Purchase Entry",
          url: "purchase/select-approved-po",
          icon: "fas fa-clipboard-check",
          accessCode: [267]
        },
        {
          id: "goods-return-purchase",
          name: "Goods Return",
          url: "purchase/select-supplier-date",
          icon: "fas fa-pills",
          accessCode: [269]
        }
      ]
    },
    {
      id: "activities",
      name: "Activities",
      icon: "fas fa-tasks",
      accessCode: [32],
      submenus: [
        {
          id: "transfer-preparation-medical",
          name: "Transfer Order Medical",
          url: "transfer-order/prepare-transfer-medical",
          icon: "fas fa-exchange-alt",
          accessCode: [275]
        },
        {
          id: "transfer-approval",
          name: "Transfer Approval",
          url: "transfer-order/approve-transfer",
          icon: "fas fa-check-circle",
          accessCode: [276]
        },
        {
          id: "consumable-entry",
          name: "Consumable Entry",
          icon: "fas fa-box-open",
          submenus: [
            {
              id: "consumable-preparation",
              name: "Preparation",
              url: "consumable-order/create",
              icon: "fas fa-edit",
              accessCode: [277]
            },
            {
              id: "consumable-approval",
              name: "Approval",
              url: "activities/consumable-approval",
              icon: "fas fa-check-circle",
              accessCode: [278]
            }
          ]
        }
      ]
    },
    {
      id: "masters",
      name: "Master",
      icon: "fas fa-database",
      accessCode: [33],
      submenus: [
        {
          id: "medicine-masters",
          name: "Medicine Masters",
          icon: "fas fa-database",
          submenus: [
            {
              id: "generic-group-master",
              name: "Generic Group Master",
              url: "activities/generic-group-master",
              icon: "fas fa-layer-group",
              accessCode: [282]
            },
            {
              id: "sub-generic-group-master",
              name: "Sub Generic Group Master",
              url: "activities/sub-generic-group-master",
              icon: "fas fa-sitemap",
              accessCode: [283]
            },
            {
              id: "generic-details-master",
              name: "Generic Details Master",
              url: "activities/generic-details-master",
              icon: "fas fa-pills",
              accessCode: [284]
            },
            {
              id: "medicine-item-master",
              name: "Medicine Item Master",
              url: "activities/medicine-item-master",
              icon: "fas fa-capsules",
              accessCode: [285]
            },
            {
              id: "company-master",
              name: "Company Master",
              url: "activities/company-master",
              icon: "fas fa-industry",
              accessCode: [286]
            },
            {
              id: "supplier-master",
              name: "Supplier Master",
              url: "activities/supplier-master",
              icon: "fas fa-industry",
              accessCode: [288]
            },
            {
              id: "batch-master",
              name: "Batch Master",
              url: "activities/batch-master",
              icon: "fas fa-barcode",
              accessCode: [287]
            },
            {
              id: "min-max-order",
              name: "Min Max Order",
              url: "activities/min-max-order",
              icon: "fas fa-balance-scale",
              accessCode: [603]
            }
          ]
        }
      ]
    },
    {
      id: "registers",
      name: "Registers",
      icon: "fas fa-book",
      accessCode: [34],
      submenus: [
        {
          id: "stock",
          name: "Stock Register",
          url: "registers/stocks",
          icon: "fas fa-warehouse",
          accessCode: [291]
        },
        {
          id: "transfer-register",
          name: "Transfer Register",
          url: "registers/transfer",
          icon: "fas fa-exchange-alt",
          accessCode: [293]
        },
        {
          id: "transfer-receipts",
          name: "Transfer Receipts",
          url: "registers/transfer-receipts",
          icon: "fas fa-receipt",
          accessCode: [545]
        },
        {
          id: "goods-receipts-medical",
          name: "Goods Receipts Register",
          url: "registers/goods-receipts-medical",
          icon: "fas fa-receipt",
          accessCode: [295]
        },
        // {
        //   id: "goods-return-register-med",
        //   name: "Goods Return Register",
        //   url: "registers/goods-return",
        //   icon: "fas fa-undo",
        //   accessCode: [297]
        // },
        // {
        //   id: "damages",
        //   name: "Damages ",
        //   url: "registers/damages",
        //   icon: "fas fa-exclamation-triangle",
        //   accessCode: [546]
        // },
        // {
        //   id: "request",
        //   name: "Request ",
        //   url: "registers/request",
        //   icon: "fas fa-envelope",
        //   accessCode: [547]
        // },
        {
          id: "med-wise-supplier",
          name: "Med Wise Supplier",
          url: "registers/med-wise-supplier",
          icon: "fas fa-user-md",
          accessCode: [549]
        },
        // {
        //   id: "annexure1-purchase",
        //   name: "Annexure 1 Purchase",
        //   url: "registers/annexure1-purchase",
        //   icon: "fas fa-file-invoice",
        //   accessCode: [550]
        // },
        // {
        //   id: "annexure2-sale",
        //   name: "Annexure 2 Sale",
        //   url: "registers/annexure2-sale",
        //   icon: "fas fa-file-invoice",
        //   accessCode: [551]
        // },
        // {
        //   id: "supplier-wise-goods",
        //   name: "Supplier Wise Goods",
        //   url: "registers/supplier-wise-goods",
        //   icon: "fas fa-truck",
        //   accessCode: [560]
        // },
        {
          id: "purchase",
          name: "Purchase Register",
          url: "registers/purchase",
          icon: "fas fa-shopping-cart",
          accessCode: [561]
        },
        // {
        //   id: "consumable-register",
        //   name: "Consumable Registers",
        //   url: "registers/consumable",
        //   icon: "fas fa-box-open",
        //   accessCode: [294]
        // },
        // {
        //   id: "goods-return-register-med-dup",
        //   name: "Goods Return Register",
        //   url: "registers/goods-return",
        //   icon: "fas fa-undo",
        //   accessCode: [297]
        // },
        // {
        //   id: "received-request",
        //   name: "Received Request Register",
        //   url: "registers/received-request",
        //   icon: "fas fa-inbox",
        //   accessCode: [296]
        // },
        // {
        //   id: "batch-wise-stock",
        //   name: "Batch Wise Stock",
        //   url: "registers/batch-wise-stock",
        //   icon: "fas fa-barcode",
        //   accessCode: [298]
        // },
        // {
        //   id: "stock-details",
        //   name: "Stock Details",
        //   url: "registers/stock-details",
        //   icon: "fas fa-warehouse",
        //   accessCode: [563]
        // },
        // {
        //   id: "opening-stock",
        //   name: "Opening Stock",
        //   url: "registers/opening-stock",
        //   icon: "fas fa-box",
        //   accessCode: [565]
        // },
        // {
        //   id: "purchase-reorder",
        //   name: "Purchase Reorder",
        //   url: "registers/purchase-reorder",
        //   icon: "fas fa-shopping-cart",
        //   accessCode: [566]
        // }
      ]
    },
    {
      id: "reports",
      name: "Reports",
      icon: "fas fa-file-alt",
      accessCode: [35],
      submenus: [
      
        // {
        //   id: "ViewStockList",
        //   name: "View Stock List",
        //   url: "reports/ViewStockList",
        //   icon: "fas fa-boxes",
        //   accessCode: [562]
        // },
        // {
        //   id: "Company",
        //   name: "Company",
        //   url: "reports/Company",
        //   icon: "fas fa-building",
        //   accessCode: [562]
        // },
        // {
        //   id: "Supplier",
        //   name: "Supplier",
        //   url: "reports/Supplier",
        //   icon: "fas fa-truck",
        //   accessCode: [562]
        // },
        {
          id: "SupwiseGoodsReceipt",
          name: "Supwise Goods Receipt",
          url: "reports/SupwiseGoodsReceipt",
          icon: "fas fa-receipt",
          accessCode: [308]
        },
        {
          id: "ExpiryCheckDetails",
          name: "Expiry Check Details",
          url: "reports/ExpiryCheckDetails",
          icon: "fas fa-clock",
          accessCode: [306]
        },
        // {
        //   id: "SupwiseWiseTotal",
        //   name: "Supwise Wise Total",
        //   url: "reports/SupwiseWiseTotal",
        //   icon: "fas fa-chart-bar",
        //   accessCode: [562]
        // },
        // {
        //   id: "MedicineDetails",
        //   name: "Medicine Details",
        //   url: "reports/MedicineDetails",
        //   icon: "fas fa-capsules",
        //   accessCode: [562]
        // },
        {
          id: "transfer-details",
          name: "Transfer Details",
          url: "reports/transfer-details",
          icon: "fas fa-random",
          accessCode: [311]
        },
        // {
        //   id: "MedicineLocationStock",
        //   name: "Medicine Location Stock",
        //   url: "reports/MedicineLocationStock",
        //   icon: "fas fa-map-marker-alt",
        //   accessCode: [562]
        // },
        // {
        //   id: "costWiseMedicine",
        //   name: "Cost Wise Medicine",
        //   url: "reports/costWiseMedicine",
        //   icon: "fas fa-tag",
        //   accessCode: [562]
        // },
        // {
        //   id: "PriceDetailsReports",
        //   name: "Price Details Reports",
        //   url: "reports/PriceDetailsReports",
        //   icon: "fas fa-file-invoice",
        //   accessCode: [562]
        // },
        // {
        //   id: "StockReorderLevel",
        //   name: "Stock with Reorder Level",
        //   url: "reports/StockReorderLevel",
        //   icon: "fas fa-file-invoice",
        //   accessCode: [562]
        // },
        // {
        //   id: "StockProfitDetails",
        //   name: "Stock & Profit Details",
        //   url: "reports/StockProfitDetails",
        //   icon: "fas fa-file-invoice",
        //   accessCode: [562]
        // },
        // {
        //   id: "MonthlyConsumption",
        //   name: "Monthly Consumption",
        //   url: "reports/MonthlyConsumption",
        //   icon: "fas fa-file-invoice",
        //   accessCode: [562]
        // },
        // {
        //   id: "PurchaseOrderStatusMed",
        //   name: "Purchase Order Status",
        //   url: "reports/PurchaseOrderStatusMed",
        //   icon: "fas fa-file-invoice",
        //   accessCode: [562]
        // },
        {
          id: "gstr-details",
          name: "GSTR Details",
          icon: "fas fa-file-invoice-dollar",
          accessCode: [35],
          submenus: [
            {
              id: "gstr3b",
              name: "GSTR 3B",
              url: "reports/gstr/gstr3b",
              icon: "fas fa-file-invoice-dollar",
              accessCode: [695]
            },
            {
              id: "bill-wise-sales",
              name: "BILL WISE SALES",
              url: "reports/gstr/billwisesales",
              icon: "fas fa-file-invoice-dollar",
              accessCode: [696]
            },
            {
              id: "bill-wise-sales-return",
              name: "BILL WISE SALES RETURN",
              url: "reports/gstr/billwisesalesreturn",
              icon: "fas fa-file-invoice-dollar",
              accessCode: [697]
            },
             {
              id: "exampted-gst-sales",
              name: "EXEMPTED SALES",
              url: "reports/gstr/exempted-gst-sales",
              icon: "fas fa-file-invoice-dollar",
              accessCode: [552]
            }
          ]
        },
        {
          id: "gstr-consolidate",
          name: "GSTR Consolidate",
          icon: "fas fa-file-invoice-dollar",
          accessCode: [35],
          submenus: [
            {
              id: "gstrsales",
              name: "GSTR Sales",
              url: "reports/gstr/gstrsales",
              icon: "fas fa-file-invoice-dollar",
              accessCode: [307]
            },
            {
              id: "gstr-seperate-sales",
              name: "SEPERATE Sales",
              url: "reports/gstr/gstrseperatesales",
              icon: "fas fa-file-invoice-dollar",
              accessCode: [309]
            },
            {
              id: "gstr-sales-return",
              name: "GSTR Return",
              url: "reports/gstr/gstrsalesreturn",
              icon: "fas fa-file-invoice-dollar",
              accessCode: [310]
            },
            {
              id: "gstr-seperate-sales-return",
              name: "GSTR Seperate Return",
              url: "reports/gstr/gstrseperatesalesreturn",
              icon: "fas fa-file-invoice-dollar",
              accessCode: [312]
            }
          ]
        },    
        {
          id: "HSN-wise-GST",
          name: "HSN Wise GST",
          icon: "fas fa-file-invoice-dollar",
          accessCode: [35],
          submenus: [
             {
              id: "Annexure1",
              name: "Annexure 1",
              url: "reports/gstr/annexure1 ",
              icon: "fas fa-file-invoice-dollar",
              accessCode: [313]
            },
            {
              id: "hsn-sales",
              name: "HSN Sales",
              url: "reports/gstr/hsnsales",
              icon: "fas fa-file-invoice-dollar",
              accessCode: [314]
            },
            {
              id: "hsn-sales-return",
              name: "HSN Sales Return",
              url: "reports/gstr/hsnsalesreturn",
              icon: "fas fa-file-invoice-dollar",
              accessCode: [316]
            },           
            {
              id: "hsn-purchase",
              name: "HSN Purchase",
              url: "reports/gstr/hsnpurchase",
              icon: "fas fa-file-invoice-dollar",
              accessCode: [553]
            },
            {
              id: "hsn-purchase-return",
              name: "HSN Purchase Return",
              url: "reports/gstr/hsnpurchasereturn",
              icon: "fas fa-file-invoice-dollar",
              accessCode: [571]
            }
          ]
        }
      ]
    },
    // {
    //   id: "gstr-details",
    //   name: "GSTR Details",
    //   icon: "fas fa-file-invoice-dollar",
    //   url: routerPathNames.centralStores.medicalStore.gstrDetail.gstrDetails,
    //   accessCode: [36]
    // },
    {
      id: "setup",
      name: "Setup",
      icon: "fas fa-cog",
      accessCode: [36],
      submenus: [
        {
          id: "initial-stock",
          name: "Initial Stock",
          url: "setup/initial-stock",
          icon: "fas fa-box",
          accessCode: [317]
        },
        {
          id: "stock-adjustment",
          name: "Stock Adjustment",
          url: "setup/stock-adjustment",
          icon: "fas fa-sliders-h",
          accessCode: [318]
        }
      ]
    }
  ]
};

// Non-Medical Store Menu Configuration (Based on HorizontalFrames_var_stationary.js)
// NOTE: Non-medical store uses the same pages as medical store - only storeId changes via session/context
export const nonMedicalStoreMenuConfig: ModuleMenuConfig = {
  moduleId: 4,
  moduleName: "Non-Medical Store",
  menus: [
    {
      id: "purchase",
      name: "Purchase",
      icon: "fas fa-shopping-cart",
      accessCode: [37],
      submenus: [
        {
          id: "prepare-order",
          name: "Prepare Order",
          url: "purchase/prepare-order",
          icon: "fas fa-file-medical",
          accessCode: [319]
        },
        {
          id: "approve-order",
          name: "Approve Order",
          url: "purchase/approve-order",
          icon: "fas fa-check-circle",
          accessCode: [320]
        },
        {
          id: "purchase-entry",
          name: "Purchase Entry",
          icon: "fas fa-edit",
          submenus: [
            {
              id: "purchase-entry-add",
              name: "Select Approved PO",
              url: "purchase/select-approved-po",
              icon: "fas fa-plus-square",
              accessCode: [321]
            },
            {
              id: "purchase-approval",
              name: "Purchase Approval",
              url: "purchase/entry-approval",
              icon: "fas fa-clipboard-check",
              accessCode: [322]
            }
          ]
        },
        {
          id: "goods-return-purchase-nonmed",
          name: "Goods Return Purchase Non-Medical",
          icon: "fas fa-undo",
          submenus: [
            {
              id: "prepare-medicine-wise",
              name: "Prepare Product Wise",
              url: "purchase/select-supplier-date",
              icon: "fas fa-boxes",
              accessCode: [323]
            },
            {
              id: "goods-return-approval",
              name: "Approval",
              url: "purchase/goods-return-approval",
              icon: "fas fa-check-double",
              accessCode: [324]
            }
          ]
        },
        {
          id: "pending-orders",
          name: "Pending Orders",
          url: "purchase/pending-orders",
          icon: "fas fa-clock",
          accessCode: [325]
        },
        {
          id: "purchase-orders-print",
          name: "Purchase Orders Print",
          url: "purchase/orders-print",
          icon: "fas fa-print",
          accessCode: [326]
        },
        {
          id: "close-purchase-orders",
          name: "Close Purchase Orders",
          url: "purchase/close-orders",
          icon: "fas fa-times-circle",
          accessCode: [327]
        },
        {
          id: "edit-purchase-orders",
          name: "Edit Purchase Orders",
          url: "purchase/edit-orders",
          icon: "fas fa-edit",
          accessCode: [328]
        }
      ]
    },
    {
      id: "activities",
      name: "Activities",
      icon: "fas fa-tasks",
      accessCode: [38],
      submenus: [
        {
          id: "transfer-order",
          name: "Transfer Order",
          icon: "fas fa-exchange-alt",
          submenus: [
            {
              id: "transfer-preparation-non-medical",
              name: "Transfer Order Non-Medical",
              url: "transfer-order/prepare-transfer-non-medical",
              icon: "fas fa-exchange-alt",
              accessCode: [329]
            },
            {
              id: "transfer-approval",
              name: "Transfer Approval",
              url: "transfer-order/approve-transfer",
              icon: "fas fa-check-circle",
              accessCode: [330]
            }
          ]
        },
        {
          id: "consumable",
          name: "Consumable Entry",
          icon: "fas fa-box-open",
          submenus: [
            {
              id: "consumable-preparation",
              name: "Preparation",
              url: "consumable-order/create",
              icon: "fas fa-edit",
              accessCode: [331]
            },
            {
              id: "consumable-approval",
              name: "Approval",
              url: "activities/consumable-approval",
              icon: "fas fa-check-circle",
              accessCode: [332]
            }
          ]
        },
        {
          id: "request-process",
          name: "Request Process",
          url: "activities/request-process",
          icon: "fas fa-cog",
          accessCode: [333]
        }
      ]
    },
    {
      id: "masters",
      name: "Master",
      icon: "fas fa-database",
      accessCode: [39],
      submenus: [
        {
          id: "group",
          name: "Group",
          icon: "fas fa-layer-group",
          url: "masters/group-add",
          accessCode: [334]
        },
        {
          id: "company-details",
          name: "Company Details",
          icon: "fas fa-building",
          url: "masters/company-add",
          accessCode: [335]
        },
        {
          id: "supplier-details",
          name: "Supplier Details",
          icon: "fas fa-truck",
          url: "masters/supplier-add",
          accessCode: [336]
        },
        {
          id: "product-details",
          name: "Product Details",
          icon: "fas fa-box",
          submenus: [
            {
              id: "product-add",
              name: "Add",
              url: "masters/product-add",
              icon: "fas fa-plus",
              accessCode: [337]
            },
            {
              id: "product-procedure-mapping",
              name: "Product-Procedure Mapping",
              url: "masters/product-procedure-mapping",
              icon: "fas fa-link",
              accessCode: [338]
            },
            {
              id: "product-map-supplier",
              name: "Map With Supplier",
              url: "masters/product-map-supplier",
              icon: "fas fa-link",
              accessCode: [339]
            }
          ]
        },
        {
          id: "batch-master",
          name: "Batch Master",
          icon: "fas fa-barcode",
          url: "masters/batch-add",
          accessCode: [340]
        },
        {
          id: "consumable-cause",
          name: "Add Consumable Cause",
          url: "masters/consumable-cause",
          icon: "fas fa-question-circle",
          accessCode: [341]
        }
      ]
    },
    {
      id: "registers",
      name: "Registers",
      icon: "fas fa-book",
      accessCode: [40],
      submenus: [
        {
          id: "stock-register",
          name: "Stock Register",
          url: "registers/stock",
          icon: "fas fa-warehouse",
          accessCode: [342]
        },
        {
          id: "transfer-register",
          name: "Transfer Register",
          url: "registers/transfer",
          icon: "fas fa-exchange-alt",
          accessCode: [343]
        },
        {
          id: "goods-receipts-non-medical",
          name: "Goods Receipts Register",
          url: "registers/goods-receipts-non-medical",
          icon: "fas fa-receipt",
          accessCode: [344]
        },
        {
          id: "goods-return-register-nonmed",
          name: "Goods Return Register",
          url: "registers/goods-return",
          icon: "fas fa-undo",
          accessCode: [345]
        },
        {
          id: "batch-wise-stock",
          name: "Batch Wise Stock",
          url: "registers/batch-wise-stock",
          icon: "fas fa-barcode",
          accessCode: [346]
        },
        {
          id: "medicine-transaction",
          name: "Product Transaction",
          url: "registers/medicine-transaction",
          icon: "fas fa-exchange-alt",
          accessCode: [347]
        },
        {
          id: "transfer-consumable",
          name: "Transfer Consumable Register",
          url: "registers/transfer-consumable",
          icon: "fas fa-box-open",
          accessCode: [348]
        }
      ]
    },
    {
      id: "reports",
      name: "Reports",
      icon: "fas fa-file-alt",
      accessCode: [41],
      submenus: [
        {
          id: "purchase-order-status",
          name: "Purchase Order Status",
          url: "reports/purchase-order-status",
          icon: "fas fa-clipboard-list",
          accessCode: [349]
        },
        {
          id: "product-and-supplier",
          name: "Product And Supplier",
          url: "reports/product-and-supplier",
          icon: "fas fa-link",
          accessCode: [350]
        },
        {
          id: "supplier-goods-receipt",
          name: "Supplier Goods Receipt",
          url: "reports/supplier-goods-receipt",
          icon: "fas fa-truck-loading",
          accessCode: [351]
        },
        {
          id: "supplier-details",
          name: "Supplier Details",
          url: "reports/supplier-details",
          icon: "fas fa-info-circle",
          accessCode: [352]
        }
      ]
    },
    {
      id: "setup",
      name: "Setup",
      icon: "fas fa-cog",
      accessCode: [42],
      submenus: [
        {
          id: "initial-stock",
          name: "Initial Stock",
          url: "setup/initial-stock",
          icon: "fas fa-box",
          accessCode: [353]
        },
        {
          id: "stock-adjustment",
          name: "Stock Adjustment",
          url: "setup/stock-adjustment",
          icon: "fas fa-sliders-h",
          accessCode: [354]
        }
      ]
    }
  ]
};

export const filterMenusByAccess = (
  menus: MenuItemConfig[],
  accessCodes: { menuIds: number[]; submenuIds: number[] }
): MenuItemConfig[] => {
  return menus
    .map((menu) => {
      if (menu.submenus && menu.submenus.length > 0) {
        const filteredSubmenus = filterMenusByAccess(menu.submenus, {
          menuIds: accessCodes.submenuIds,
          submenuIds: accessCodes.submenuIds
        });

        const hasAccess = Array.isArray(menu.accessCode)
          ? menu.accessCode.some((code) => accessCodes.menuIds.includes(code))
          : false;

        if (filteredSubmenus.length > 0 || hasAccess) {
          return {
            ...menu,
            submenus: filteredSubmenus
          };
        }

        return null;
      }

      const hasAccess = Array.isArray(menu.accessCode)
        ? menu.accessCode.some((code) => accessCodes.menuIds.includes(code))
        : false;

      if (hasAccess) {
        return menu;
      }

      return null;
    })
    .filter((menu): menu is MenuItemConfig => menu !== null);
};

export const getAllAccessCodes = (menus: MenuItemConfig[]): { menuIds: number[]; submenuIds: number[] } => {
  const menuIds: number[] = [];
  const submenuIds: number[] = [];

  menus.forEach((menu) => {
    if (Array.isArray(menu.accessCode)) {
      menuIds.push(...menu.accessCode);
    }

    if (menu.submenus && menu.submenus.length > 0) {
      menu.submenus.forEach((sub) => {
        if (Array.isArray(sub.accessCode)) {
          submenuIds.push(...sub.accessCode);
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

export const extractHeaderAndMenuIds = (
  pharmaStoreData: any,
  subModId?: number
): { headerIds: number[]; menuIds: number[] } => {
  const headerIds: number[] = [];
  const menuIds: number[] = [];

  const subModules = Array.isArray(pharmaStoreData)
    ? pharmaStoreData
    : Array.isArray(pharmaStoreData?.subModIds)
      ? pharmaStoreData.subModIds
      : [];

  const filteredSubModules = typeof subModId === "number"
    ? subModules.filter((subModule: any) => subModule?.subModId === subModId)
    : subModules;

  filteredSubModules.forEach((subModule: any) => {
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
    menuIds: Array.from(new Set(menuIds))
  };
};
