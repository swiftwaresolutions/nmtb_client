import { routerPathNames } from '../../routes/routerPathNames';

export interface MenuItemConfig {
  label: string;
  path?: string;
  icon?: string;
  subItems?: MenuItemConfig[];
}

export interface ModuleMenuConfig {
  moduleId: number;
  moduleName: string;
  menus: MenuItemConfig[];
}

export const payrollManagementMenuConfig: ModuleMenuConfig = {
  moduleId: 15,
  moduleName: 'Pacs',
  menus: [
    {
      label: 'Dicom Viewer',
      path: routerPathNames.pacs.dicomViewer,
      icon: 'fa-image'
    },
    {
      label: 'Dicom Web',
      path: routerPathNames.pacs.dicomWeb,
      icon: 'fa-globe'
    },
    {
      label: 'Exit',
      icon: 'fa-sign-out-alt',
      subItems: [
        {
          label: 'Selection Area',
          path: routerPathNames.payrollManagement.exitSelectionArea,
          icon: 'fa-th-large'
        },
        {
          label: 'Logout',
          path: routerPathNames.payrollManagement.exitLogout,
          icon: 'fa-power-off'
        }
      ]
    }
  ]
};
