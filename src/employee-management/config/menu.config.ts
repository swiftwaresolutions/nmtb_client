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

export const employeeManagementMenuConfig: ModuleMenuConfig = {
  moduleId: 7,
  moduleName: 'Employee Management',
  menus: [
    {
      label: 'Recruitment',
      icon: 'fa-user-plus',
      subItems: [
        {
          label: 'Add Employee',
          path: routerPathNames.employeeManagement.addEmployee,
          icon: 'fa-user-plus'
        },
        {
          label: 'Extend Training Period',
          path: routerPathNames.employeeManagement.extendTrainingPeriod,
          icon: 'fa-clock'
        },
        {
          label: 'Transfer to Probation',
          path: routerPathNames.employeeManagement.transferToProbation,
          icon: 'fa-exchange-alt'
        },
        {
          label: 'Extend Probationary',
          path: routerPathNames.employeeManagement.extendProbationary,
          icon: 'fa-calendar-plus'
        },
        {
          label: 'Extend Contract Period',
          path: routerPathNames.employeeManagement.extendContractPeriod,
          icon: 'fa-file-contract'
        },
        {
          label: 'Confirmation',
          path: routerPathNames.employeeManagement.confirmation,
          icon: 'fa-check-circle'
        },
        {
          label: 'Add Employee Details',
          path: routerPathNames.employeeManagement.addEmployeeDetails,
          icon: 'fa-id-card'
        },
        {
          label: 'Employee Rejoining',
          path: routerPathNames.employeeManagement.employeeRejoining,
          icon: 'fa-user-check'
        },
        {
          label: 'Employee Family Edit',
          path: routerPathNames.employeeManagement.employeeFamilyEdit,
          icon: 'fa-users'
        }
      ]
    },
    {
      label: 'Promotion',
      icon: 'fa-level-up-alt',
      subItems: [
        {
          label: 'Setup Level',
          path: routerPathNames.employeeManagement.setupLevel,
          icon: 'fa-sitemap'
        },
        {
          label: 'Promotion',
          path: routerPathNames.employeeManagement.promotion,
          icon: 'fa-arrow-up'
        }
      ]
    },
    {
      label: 'Cessation Info',
      icon: 'fa-user-times',
      subItems: [
        {
          label: 'Cessation',
          path: routerPathNames.employeeManagement.cessation,
          icon: 'fa-door-open'
        },
        {
          label: 'Cessation Cancel',
          icon: 'fa-times-circle',
          subItems: [
            {
              label: 'Resignation',
              path: routerPathNames.employeeManagement.cessationCancelResignation,
              icon: 'fa-undo'
            },
            {
              label: 'VRS',
              path: routerPathNames.employeeManagement.cessationCancelVRS,
              icon: 'fa-undo-alt'
            }
          ]
        },
        {
          label: 'Cessation Accept',
          icon: 'fa-check-circle',
          subItems: [
            {
              label: 'Resignation',
              path: routerPathNames.employeeManagement.cessationAcceptResignation,
              icon: 'fa-check'
            },
            {
              label: 'VRS',
              path: routerPathNames.employeeManagement.cessationAcceptVRS,
              icon: 'fa-check-double'
            }
          ]
        }
      ]
    },
    {
      label: 'Retirement',
      icon: 'fa-user-clock',
      subItems: [
        {
          label: 'List',
          path: routerPathNames.employeeManagement.retirementList,
          icon: 'fa-list'
        },
        {
          label: 'Confirmation',
          path: routerPathNames.employeeManagement.retirementConfirmation,
          icon: 'fa-check-square'
        }
      ]
    },
    {
      label: 'Report',
      icon: 'fa-chart-bar',
      subItems: [
        {
          label: 'Appointment',
          icon: 'fa-calendar-check',
          subItems: [
            {
              label: 'Year Wise',
              path: routerPathNames.employeeManagement.reportAppointmentYearWise,
              icon: 'fa-calendar-alt'
            },
            {
              label: 'Month Wise',
              path: routerPathNames.employeeManagement.reportAppointmentMonthWise,
              icon: 'fa-calendar'
            },
            {
              label: 'Yearly Comparison',
              path: routerPathNames.employeeManagement.reportAppointmentYearlyComparison,
              icon: 'fa-chart-line'
            }
          ]
        },
        {
          label: 'Retirement',
          path: routerPathNames.employeeManagement.reportRetirement,
          icon: 'fa-user-clock'
        },
        {
          label: 'Promotion',
          icon: 'fa-arrow-circle-up',
          subItems: [
            {
              label: 'Promotion Details',
              path: routerPathNames.employeeManagement.reportPromotionDetails,
              icon: 'fa-info-circle'
            },
            {
              label: 'Total promotion Details',
              path: routerPathNames.employeeManagement.reportTotalPromotionDetails,
              icon: 'fa-list-alt'
            }
          ]
        },
        {
          label: 'Leave Report',
          icon: 'fa-calendar-times',
          subItems: [
            {
              label: 'Employeewise',
              icon: 'fa-user',
              subItems: [
                {
                  label: 'Monthwise',
                  path: routerPathNames.employeeManagement.reportLeaveEmployeewiseMonthwise,
                  icon: 'fa-calendar'
                },
                {
                  label: 'Yearwise',
                  path: routerPathNames.employeeManagement.reportLeaveEmployeewiseYearwise,
                  icon: 'fa-calendar-alt'
                }
              ]
            },
            {
              label: 'Positionwise',
              icon: 'fa-sitemap',
              subItems: [
                {
                  label: 'Monthwise',
                  path: routerPathNames.employeeManagement.reportLeavePositionwiseMonthwise,
                  icon: 'fa-calendar'
                },
                {
                  label: 'Yearwise',
                  path: routerPathNames.employeeManagement.reportLeavePositionwiseYearwise,
                  icon: 'fa-calendar-alt'
                }
              ]
            }
          ]
        },
        {
          label: 'Employee',
          icon: 'fa-users',
          subItems: [
            {
              label: 'All Department',
              path: routerPathNames.employeeManagement.reportEmployeeAllDepartment,
              icon: 'fa-building'
            },
            {
              label: 'Male',
              path: routerPathNames.employeeManagement.reportEmployeeMale,
              icon: 'fa-male'
            },
            {
              label: 'Female',
              path: routerPathNames.employeeManagement.reportEmployeeFemale,
              icon: 'fa-female'
            }
          ]
        },
        {
          label: 'Position Wise',
          icon: 'fa-briefcase',
          subItems: [
            {
              label: 'Employee',
              icon: 'fa-user',
              subItems: [
                {
                  label: 'All',
                  path: routerPathNames.employeeManagement.reportPositionWiseEmployeeAll,
                  icon: 'fa-users'
                },
                {
                  label: 'Particular',
                  path: routerPathNames.employeeManagement.reportPositionWiseEmployeeParticular,
                  icon: 'fa-user'
                }
              ]
            }
          ]
        },
        {
          label: 'Cessation',
          icon: 'fa-sign-out-alt',
          subItems: [
            {
              label: 'Resignation',
              path: routerPathNames.employeeManagement.reportCessationResignation,
              icon: 'fa-door-open'
            },
            {
              label: 'VRS',
              path: routerPathNames.employeeManagement.reportCessationVRS,
              icon: 'fa-handshake'
            },
            {
              label: 'Termination',
              path: routerPathNames.employeeManagement.reportCessationTermination,
              icon: 'fa-ban'
            },
            {
              label: 'Death',
              path: routerPathNames.employeeManagement.reportCessationDeath,
              icon: 'fa-cross'
            }
          ]
        },
        {
          label: 'Employee Detail',
          path: routerPathNames.employeeManagement.reportEmployeeDetail,
          icon: 'fa-id-badge'
        },
        {
          label: 'Retired Status',
          path: routerPathNames.employeeManagement.reportRetiredStatus,
          icon: 'fa-user-clock'
        },
        {
          label: 'Service Register',
          path: routerPathNames.employeeManagement.reportServiceRegister,
          icon: 'fa-book'
        },
        {
          label: 'Retirement Details',
          path: routerPathNames.employeeManagement.reportRetirementDetails,
          icon: 'fa-file-alt'
        },
        {
          label: 'Probationary Employees',
          path: routerPathNames.employeeManagement.reportProbationaryEmployees,
          icon: 'fa-user-graduate'
        },
        {
          label: 'Training Employees',
          path: routerPathNames.employeeManagement.reportTrainingEmployees,
          icon: 'fa-chalkboard-teacher'
        },
        {
          label: 'Confirmed Employees',
          path: routerPathNames.employeeManagement.reportConfirmedEmployees,
          icon: 'fa-user-check'
        },
        {
          label: 'Contract Employees',
          path: routerPathNames.employeeManagement.reportContractEmployees,
          icon: 'fa-file-signature'
        },
        {
          label: 'Department Wise',
          path: routerPathNames.employeeManagement.reportDepartmentWise,
          icon: 'fa-building'
        },
        {
          label: 'Division Wise',
          path: routerPathNames.employeeManagement.reportDivisionWise,
          icon: 'fa-layer-group'
        }
      ]
    },
    {
      label: 'Master',
      icon: 'fa-database',
      subItems: [
        {
          label: 'Category',
          icon: 'fa-tags',
          path: routerPathNames.employeeManagement.masterCategoryAdd
        },
        
        {
          label: 'Department',
          icon: 'fa-building',
          path: routerPathNames.employeeManagement.masterDepartmentAdd,
        },
        {
          label: 'Position',
          icon: 'fa-briefcase',
          path: routerPathNames.employeeManagement.masterPositionAdd,
        },
        {
          label: 'Salary Head',
          icon: 'fa-money-bill-wave',
          path: routerPathNames.employeeManagement.masterSalaryHeadAdd,
        },
        {
          label: 'Unit',
          icon: 'fa-landmark',
          path: routerPathNames.employeeManagement.masterUnitAdd,
         
        },
        {
          label: 'Division',
          icon: 'fa-layer-group',
          path: routerPathNames.employeeManagement.masterDivisionAdd,
      
        }
      ]
    },
    {
      label: 'Edit Details',
      icon: 'fa-user-edit',
      subItems: [
        {
          label: 'Emp. Details',
          path: routerPathNames.employeeManagement.editEmployeeDetails,
          icon: 'fa-id-card'
        },
        {
          label: 'category Wise',
          path: routerPathNames.employeeManagement.editCategoryWise,
          icon: 'fa-tags'
        }
      ]
    },
    {
      label: 'Exit',
      icon: 'fa-sign-out-alt',
      subItems: [
        {
          label: 'Selection Area',
          path: routerPathNames.employeeManagement.exitSelectionArea,
          icon: 'fa-th-large'
        },
        {
          label: 'Logout',
          path: routerPathNames.employeeManagement.exitLogout,
          icon: 'fa-power-off'
        }
      ]
    }
  ]
};
