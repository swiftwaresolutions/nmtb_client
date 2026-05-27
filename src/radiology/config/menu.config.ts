// Radiology Menu Configuration
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

export const radiologyMenuConfig: ModuleMenuConfig = {
  moduleId: 12,
  moduleName: "Radiology",
  menus: [
    // {
    //   id: "order",
    //   name: "Order",
    //   icon: "fas fa-file-medical",
    //   accessCode: undefined,
    //   submenus: [
    //     {
    //       id: "investigation-order",
    //       name: "Investigation Order",
    //       url: routerPathNames.radiology.order.investigationOrder,
    //       icon: "fas fa-clipboard-list",
    //       accessCode: 1201
    //     },
    //     {
    //       id: "cancel-order",
    //       name: "Cancel Order",
    //       url: routerPathNames.radiology.order.cancelOrder,
    //       icon: "fas fa-times-circle",
    //       accessCode: 1202
    //     }
    //   ]
    // },
    {
      id: "entry",
      name: "Entry",
      icon: "fas fa-x-ray",
      accessCode: undefined,
      submenus: [
        {
          id: "entry-main",
          name: "Entry",
          url: routerPathNames.radiology.entry.entry,
          icon: "fas fa-keyboard",
          accessCode: 727
        },
      ]
    },
    // {
    //   id: "scan-entry",
    //   name: "Scan Entry",
    //   icon: "fas fa-x-ray",
    //   accessCode: undefined,
    //   submenus: [
    //     {
    //       id: "scan-entry-main",
    //       name: "Scan Entry",
    //       url: routerPathNames.radiology.scanEntry.scanEntry,
    //       icon: "fas fa-keyboard",
    //       accessCode: 1203
    //     },
    //     {
    //       id: "scan-bold",
    //       name: "Scan Bold",
    //       url: routerPathNames.radiology.scanEntry.scanBold,
    //       icon: "fas fa-bold",
    //       accessCode: 1204
    //     },
    //     {
    //       id: "scan-edit",
    //       name: "Scan Edit",
    //       url: routerPathNames.radiology.scanEntry.scanEdit,
    //       icon: "fas fa-edit",
    //       accessCode: 1205
    //     },
    //     {
    //       id: "angiogram-entry",
    //       name: "Angiogram Entry",
    //       url: routerPathNames.radiology.scanEntry.angiogramEntry,
    //       icon: "fas fa-heartbeat",
    //       accessCode: 1206
    //     },
    //     {
    //       id: "scan-report",
    //       name: "Scan Report",
    //       url: routerPathNames.radiology.scanEntry.scanReport,
    //       icon: "fas fa-file-alt",
    //       accessCode: 1207
    //     }
    //   ]
    // },
    // {
    //   id: "masters",
    //   name: "masters",
    //   icon: "fas fa-cog",
    //   accessCode: undefined,
    //   submenus: [
    //     {
    //       id: "inv-film",
    //       name: "Inv/Film",
    //       icon: "fas fa-film",
    //       accessCode: undefined,
    //       submenus: [
    //         {
    //           id: "inv-film-add",
    //           name: "Add",
    //           url: routerPathNames.radiology.masters.invFilm.add,
    //           icon: "fas fa-plus",
    //           accessCode: 1249
    //         },
    //         {
    //           id: "inv-film-edit",
    //           name: "Edit",
    //           url: routerPathNames.radiology.masters.invFilm.edit,
    //           icon: "fas fa-edit",
    //           accessCode: 1250
    //         },
    //         {
    //           id: "inv-film-block",
    //           name: "Block",
    //           url: routerPathNames.radiology.masters.invFilm.block,
    //           icon: "fas fa-ban",
    //           accessCode: 1251
    //         },
    //         {
    //           id: "inv-film-unblock",
    //           name: "Unblock",
    //           url: routerPathNames.radiology.masters.invFilm.unblock,
    //           icon: "fas fa-unlock",
    //           accessCode: 1252
    //         }
    //       ]
    //     },
    //     {
    //       id: "group",
    //       name: "Group",
    //       icon: "fas fa-object-group",
    //       accessCode: undefined,
    //       submenus: [
    //         {
    //           id: "group-add",
    //           name: "Add",
    //           url: routerPathNames.radiology.masters.group.add,
    //           icon: "fas fa-plus",
    //           accessCode: 1253
    //         },
    //         {
    //           id: "group-edit",
    //           name: "Edit",
    //           url: routerPathNames.radiology.masters.group.edit,
    //           icon: "fas fa-edit",
    //           accessCode: 1254
    //         }
    //       ]
    //     },
    //     {
    //       id: "company",
    //       name: "Company",
    //       icon: "fas fa-building",
    //       accessCode: undefined,
    //       submenus: [
    //         {
    //           id: "company-add",
    //           name: "Add",
    //           url: routerPathNames.radiology.masters.company.add,
    //           icon: "fas fa-plus",
    //           accessCode: 1255
    //         },
    //         {
    //           id: "company-edit",
    //           name: "Edit",
    //           url: routerPathNames.radiology.masters.company.edit,
    //           icon: "fas fa-edit",
    //           accessCode: 1256
    //         }
    //       ]
    //     },
    //     {
    //       id: "supplier",
    //       name: "Supplier",
    //       icon: "fas fa-truck",
    //       accessCode: undefined,
    //       submenus: [
    //         {
    //           id: "supplier-add",
    //           name: "Add",
    //           url: routerPathNames.radiology.masters.supplier.add,
    //           icon: "fas fa-plus",
    //           accessCode: 1257
    //         },
    //         {
    //           id: "supplier-edit",
    //           name: "Edit",
    //           url: routerPathNames.radiology.masters.supplier.edit,
    //           icon: "fas fa-edit",
    //           accessCode: 1258
    //         },
    //         {
    //           id: "supplier-map",
    //           name: "Map Supplier",
    //           url: routerPathNames.radiology.masters.supplier.map,
    //           icon: "fas fa-link",
    //           accessCode: 1259
    //         },
    //         {
    //           id: "supplier-delete-mapping",
    //           name: "Delete Mapping",
    //           url: routerPathNames.radiology.masters.supplier.deleteMapping,
    //           icon: "fas fa-unlink",
    //           accessCode: 1260
    //         }
    //       ]
    //     },
    //     {
    //       id: "material-code",
    //       name: "Material Code",
    //       icon: "fas fa-barcode",
    //       accessCode: undefined,
    //       submenus: [
    //         {
    //           id: "material-code-add",
    //           name: "Add",
    //           url: routerPathNames.radiology.masters.materialCode.add,
    //           icon: "fas fa-plus",
    //           accessCode: 1261
    //         },
    //         {
    //           id: "material-code-edit",
    //           name: "Edit",
    //           url: routerPathNames.radiology.masters.materialCode.edit,
    //           icon: "fas fa-edit",
    //           accessCode: 1262
    //         }
    //       ]
    //     },
    //     {
    //       id: "initial-stock",
    //       name: "Initial Stock",
    //       url: routerPathNames.radiology.masters.initialStock,
    //       icon: "fas fa-boxes",
    //       accessCode: 1263
    //     },
    //     {
    //       id: "product-properties",
    //       name: "Product Properties",
    //       url: routerPathNames.radiology.masters.productProperties,
    //       icon: "fas fa-clipboard-check",
    //       accessCode: 1264
    //     },
    //     {
    //       id: "stock-adjustment",
    //       name: "Stock Adjustment",
    //       url: routerPathNames.radiology.masters.stockAdjustment,
    //       icon: "fas fa-balance-scale",
    //       accessCode: 1265
    //     },
    //     {
    //       id: "groups-config",
    //       name: "Groups",
    //       icon: "fas fa-users",
    //       accessCode: undefined,
    //       submenus: [
    //         {
    //           id: "groups-config-add",
    //           name: "Add",
    //           url: routerPathNames.radiology.masters.groupsConfig.add,
    //           icon: "fas fa-plus",
    //           accessCode: 1266
    //         },
    //         {
    //           id: "groups-config-edit",
    //           name: "Edit",
    //           url: routerPathNames.radiology.masters.groupsConfig.edit,
    //           icon: "fas fa-edit",
    //           accessCode: 1267
    //         }
    //       ]
    //     },
    //     {
    //       id: "procedures-config",
    //       name: "Procedures",
    //       icon: "fas fa-clipboard-list",
    //       accessCode: undefined,
    //       submenus: [
    //         {
    //           id: "procedures-config-add",
    //           name: "Add",
    //           url: routerPathNames.radiology.masters.proceduresConfig.add,
    //           icon: "fas fa-plus",
    //           accessCode: 1268
    //         },
    //         {
    //           id: "procedures-config-edit",
    //           name: "Edit",
    //           url: routerPathNames.radiology.masters.proceduresConfig.edit,
    //           icon: "fas fa-edit",
    //           accessCode: 1269
    //         }
    //       ]
    //     },
    //     {
    //       id: "map-product",
    //       name: "Map Product",
    //       url: routerPathNames.radiology.masters.mapProduct,
    //       icon: "fas fa-link",
    //       accessCode: 1270
    //     }
    //   ]
    // },
    // {
    //   id: "purchase-orders",
    //   name: "Purchase",
    //   icon: "fas fa-shopping-cart",
    //   accessCode: undefined,
    //   submenus: [
    //     {
    //       id: "prepare-orders",
    //       name: "Prepare Orders",
    //       url: routerPathNames.radiology.purchaseOrders.prepareOrders,
    //       icon: "fas fa-file-invoice",
    //       accessCode: 1223
    //     },
    //     {
    //       id: "po-approval",
    //       name: "P.O. Approval",
    //       url: routerPathNames.radiology.purchaseOrders.poApproval,
    //       icon: "fas fa-check-square",
    //       accessCode: 1224
    //     },
    //     {
    //       id: "close-po",
    //       name: "Close P.O",
    //       url: routerPathNames.radiology.purchaseOrders.closePO,
    //       icon: "fas fa-times-circle",
    //       accessCode: 1225
    //     },
    //     {
    //       id: "po-print",
    //       name: "P.O Print",
    //       url: routerPathNames.radiology.purchaseOrders.poPrint,
    //       icon: "fas fa-print",
    //       accessCode: 1227
    //     },
    //     {
    //       id: "gr-note-preparation",
    //       name: "G.R Note Preparation",
    //       url: routerPathNames.radiology.purchaseOrders.grNotePreparation,
    //       icon: "fas fa-file-alt",
    //       accessCode: 1231
    //     },
    //     {
    //       id: "gr-note-approval",
    //       name: "G.R Note Approval",
    //       url: routerPathNames.radiology.purchaseOrders.grNoteApproval,
    //       icon: "fas fa-check-double",
    //       accessCode: 1232
    //     },
    //     {
    //       id: "goods-receipts",
    //       name: "Goods Receipts",
    //       url: routerPathNames.radiology.purchaseOrders.goodsReceipts,
    //       icon: "fas fa-box-open",
    //       accessCode: 1230
    //     }
    //   ]
    // },
    // {
    //   id: "activities",
    //   name: "Activities",
    //   icon: "fas fa-tasks",
    //   accessCode: undefined,
    //   submenus: [
    //     {
    //       id: "prepare-usage-note",
    //       name: "Prepare Usage Note",
    //       url: routerPathNames.radiology.activities.prepareUsageNote,
    //       icon: "fas fa-sticky-note",
    //       accessCode: 1228
    //     },
    //     {
    //       id: "approve-note",
    //       name: "Approve Note",
    //       url: routerPathNames.radiology.activities.approveNote,
    //       icon: "fas fa-check",
    //       accessCode: 1229
    //     }
    //   ]
    // },
    // {
    //   id: "registers",
    //   name: "Registers",
    //   icon: "fas fa-book",
    //   accessCode: undefined,
    //   submenus: [
    //     {
    //       id: "goods-receipts-register",
    //       name: "Goods Receipts Register",
    //       url: routerPathNames.radiology.registers.goodsReceiptsRegister,
    //       icon: "fas fa-clipboard-list",
    //       accessCode: 1233
    //     },
    //     {
    //       id: "goods-return-register",
    //       name: "Goods Return Register",
    //       url: routerPathNames.radiology.registers.goodsReturnRegister,
    //       icon: "fas fa-clipboard-list",
    //       accessCode: 1234
    //     },
    //     {
    //       id: "usage-register",
    //       name: "Usage Register",
    //       url: routerPathNames.radiology.registers.usageRegister,
    //       icon: "fas fa-clipboard-list",
    //       accessCode: 1235
    //     },
    //     {
    //       id: "goods-receipt-product-wise",
    //       name: "Goods Receipt Product Wise",
    //       url: routerPathNames.radiology.registers.goodsReceiptProductWise,
    //       icon: "fas fa-clipboard-list",
    //       accessCode: 1236
    //     },
    //     {
    //       id: "group-wise-goods-receipt",
    //       name: "Group Wise Goods Receipt",
    //       url: routerPathNames.radiology.registers.groupWiseGoodsReceipt,
    //       icon: "fas fa-clipboard-list",
    //       accessCode: 1237
    //     },
    //     {
    //       id: "investigation-register",
    //       name: "Investigation Register",
    //       url: routerPathNames.radiology.registers.investigationRegister,
    //       icon: "fas fa-clipboard-list",
    //       accessCode: 1238
    //     }
    //   ]
    // },
    {
      id: "reports",
      name: "Reports",
      icon: "fas fa-chart-bar",
      accessCode: undefined,
      submenus: [
        // {
        //   id: "inv-film-flow",
        //   name: "Inv/Film Flow",
        //   url: routerPathNames.radiology.reports.invFilmFlow,
        //   icon: "fas fa-chart-line",
        //   accessCode: 1239
        // },
        // {
        //   id: "stock-register",
        //   name: "Stock Register",
        //   url: routerPathNames.radiology.reports.stockRegister,
        //   icon: "fas fa-boxes",
        //   accessCode: 1240
        // },
        // {
        //   id: "expiry-check",
        //   name: "Expiry Check",
        //   url: routerPathNames.radiology.reports.expiryCheck,
        //   icon: "fas fa-exclamation-triangle",
        //   accessCode: 1241
        // },
        // {
        //   id: "expiry-products",
        //   name: "Expiry Products",
        //   url: routerPathNames.radiology.reports.expiryProducts,
        //   icon: "fas fa-calendar-times",
        //   accessCode: 1242
        // },
        // {
        //   id: "group-wise-report",
        //   name: "Group-Wise Report",
        //   url: routerPathNames.radiology.reports.groupWiseReport,
        //   icon: "fas fa-layer-group",
        //   accessCode: 1243
        // },
        // {
        //   id: "stock-report",
        //   name: "Stock Report",
        //   url: routerPathNames.radiology.reports.stockReport,
        //   icon: "fas fa-warehouse",
        //   accessCode: 1244
        // },
        // {
        //   id: "group-wise-collection",
        //   name: "Group Wise Collection",
        //   url: routerPathNames.radiology.reports.groupWiseCollection,
        //   icon: "fas fa-money-bill-wave",
        //   accessCode: 1245
        // },
        {
          id: "scan-reports",
          name: "Scan Reports",
          url: routerPathNames.radiology.reports.scanReports,
          icon: "fas fa-file-medical-alt",
          accessCode: 728
        },
        // {
        //   id: "scan-report-cancel",
        //   name: "Scan Report Cancel",
        //   url: routerPathNames.radiology.reports.scanReportCancel,
        //   icon: "fas fa-ban",
        //   accessCode: 1247
        // },
        // {
        //   id: "angiogram-report",
        //   name: "Angiogram Report",
        //   url: routerPathNames.radiology.reports.angiogramReport,
        //   icon: "fas fa-heart",
        //   accessCode: 1248
        // }
      ]
    }
    
  ]
};

/**
 * Get all access codes from menus (recursive)
 */
export const getAllAccessCodes = (menus: MenuItemConfig[]): number[] => {
  const codes: number[] = [];
  
  const extractCodes = (items: MenuItemConfig[]) => {
    items.forEach(item => {
      if (item.accessCode !== undefined) {
        codes.push(item.accessCode);
      }
      if (item.submenus) {
        extractCodes(item.submenus);
      }
    });
  };
  
  extractCodes(menus);
  return codes;
};

/**
 * Filter menus based on user access codes
 */
export const filterMenusByAccess = (
  menus: MenuItemConfig[],
  userAccessCodes: number[]
): MenuItemConfig[] => {
  const filterItems = (items: MenuItemConfig[]): MenuItemConfig[] => {
    return items
      .map(item => {
        // If item has submenus, filter them recursively
        if (item.submenus) {
          const filteredSubmenus = filterItems(item.submenus);
          
          // Only include parent if it has accessible submenus or no access code
          if (filteredSubmenus.length > 0 || item.accessCode === undefined) {
            return {
              ...item,
              submenus: filteredSubmenus
            };
          }
          return null;
        }
        
        // For leaf items, check access code
        if (item.accessCode === undefined || userAccessCodes.includes(item.accessCode)) {
          return item;
        }
        return null;
      })
      .filter((item): item is MenuItemConfig => item !== null);
  };
  
  return filterItems(menus);
};
