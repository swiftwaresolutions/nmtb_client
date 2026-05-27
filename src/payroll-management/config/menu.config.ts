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
  moduleId: 9,
  moduleName: 'Payroll Management',
  menus: [
    {
      label: 'Leave',
      icon: 'fa-calendar-alt',
      subItems: [
        {
          label: 'Employee Leave',
          icon: 'fa-user-clock',
          subItems: [
            {
              label: 'Assign',
              path: routerPathNames.payrollManagement.leaveEmployeeLeaveAssign,
              icon: 'fa-plus-circle'
            },
            {
              label: 'Assign All Employee',
              path: routerPathNames.payrollManagement.leaveEmployeeLeaveAssignAll,
              icon: 'fa-users'
            },
            {
              label: 'Edit',
              path: routerPathNames.payrollManagement.leaveEmployeeLeaveEdit,
              icon: 'fa-edit'
            },
            {
              label: 'Edit All Employee',
              path: routerPathNames.payrollManagement.leaveEmployeeLeaveEditAll,
              icon: 'fa-user-edit'
            }
          ]
        },
        {
          label: 'Employee Weekoff',
          icon: 'fa-calendar-week',
          subItems: [
            {
              label: 'Assign',
              path: routerPathNames.payrollManagement.leaveEmployeeWeekoffAssign,
              icon: 'fa-plus-circle'
            },
            {
              label: 'Edit',
              path: routerPathNames.payrollManagement.leaveEmployeeWeekoffEdit,
              icon: 'fa-edit'
            },
            {
              label: 'All Employee',
              path: routerPathNames.payrollManagement.leaveEmployeeWeekoffAllEmployee,
              icon: 'fa-users'
            }
          ]
        },
        {
          label: 'Leave Application',
          path: routerPathNames.payrollManagement.leaveLeaveApplication,
          icon: 'fa-file-alt'
        },
        {
          label: 'Loss of Pay Application',
          path: routerPathNames.payrollManagement.leaveLossOfPayApplication,
          icon: 'fa-file-invoice'
        },
        {
          label: 'Leave / LOP Approval',
          icon: 'fa-check-circle',
          subItems: [
            {
              label: 'Employee wise',
              path: routerPathNames.payrollManagement.leaveApprovalEmployeeWise,
              icon: 'fa-user-check'
            },
            {
              label: 'All Employee',
              path: routerPathNames.payrollManagement.leaveApprovalAllEmployee,
              icon: 'fa-users-cog'
            }
          ]
        },
        {
          label: 'Cancel Leave',
          path: routerPathNames.payrollManagement.leaveCancelLeave,
          icon: 'fa-times-circle'
        },
        {
          label: 'Leave Encashment',
          path: routerPathNames.payrollManagement.leaveLeaveEncashment,
          icon: 'fa-money-bill-wave'
        },
        {
          label: 'Duty Roster',
          icon: 'fa-clipboard-list',
          subItems: [
            {
              label: 'Configure',
              path: routerPathNames.payrollManagement.leaveDutyRosterConfigure,
              icon: 'fa-cogs'
            },
            {
              label: 'Reconfigure',
              path: routerPathNames.payrollManagement.leaveDutyRosterReconfigure,
              icon: 'fa-sync-alt'
            },
            {
              label: 'Map Employee',
              path: routerPathNames.payrollManagement.leaveDutyRosterMapEmployee,
              icon: 'fa-sitemap'
            },
            {
              label: 'Assign Duty',
              path: routerPathNames.payrollManagement.leaveDutyRosterAssignDuty,
              icon: 'fa-calendar-check'
            },
            {
              label: 'Duty Adjustment',
              path: routerPathNames.payrollManagement.leaveDutyRosterDutyAdjustment,
              icon: 'fa-balance-scale'
            }
          ]
        }
      ]
    },
    {
      label: 'Attendance',
      icon: 'fa-user-check',
      subItems: [
        {
          label: 'Attendance Entry',
          path: routerPathNames.payrollManagement.attendanceAttendanceEntry,
          icon: 'fa-calendar-check'
        },
        {
          label: 'Late Coming / Permission Entry',
          path: routerPathNames.payrollManagement.attendanceLateComingPermissionEntry,
          icon: 'fa-clock'
        },
        {
          label: 'Cancel Permission',
          path: routerPathNames.payrollManagement.attendanceCancelPermission,
          icon: 'fa-ban'
        }
      ]
    },
    {
      label: 'Salary Register',
      icon: 'fa-book',
      subItems: [
        {
          label: 'Open',
          path: routerPathNames.payrollManagement.salaryRegisterOpen,
          icon: 'fa-folder-open'
        },
        {
          label: 'Close',
          path: routerPathNames.payrollManagement.salaryRegisterClose,
          icon: 'fa-folder'
        },
        {
          label: 'View',
          path: routerPathNames.payrollManagement.salaryRegisterView,
          icon: 'fa-eye'
        },
        {
          label: 'Salary Edit',
          path: routerPathNames.payrollManagement.salaryRegisterSalaryEdit,
          icon: 'fa-edit'
        },
        {
          label: 'Loan Recovery',
          path: routerPathNames.payrollManagement.salaryRegisterLoanRecovery,
          icon: 'fa-hand-holding-usd'
        }
      ]
    },
    {
      label: 'Setup',
      icon: 'fa-cogs',
      subItems: [
        {
          label: 'Salary Structure',
          icon: 'fa-sitemap',
          subItems: [
            {
              label: 'Create',
              path: routerPathNames.payrollManagement.setupSalaryStructureCreate,
              icon: 'fa-plus'
            },
            {
              label: 'Edit',
              path: routerPathNames.payrollManagement.setupSalaryStructureEdit,
              icon: 'fa-edit'
            }
          ]
        },
        {
          label: 'Employee Salary',
          icon: 'fa-dollar-sign',
          subItems: [
            {
              label: 'Configure',
              path: routerPathNames.payrollManagement.setupEmployeeSalaryConfigure,
              icon: 'fa-cogs'
            },
            {
              label: 'Edit',
              path: routerPathNames.payrollManagement.setupEmployeeSalaryEdit,
              icon: 'fa-edit'
            }
          ]
        },
        {
          label: 'Salary Increment',
          path: routerPathNames.payrollManagement.setupSalaryIncrement,
          icon: 'fa-arrow-up'
        },
        {
          label: 'DA Increment',
          path: routerPathNames.payrollManagement.setupDAIncrement,
          icon: 'fa-percentage'
        },
        {
          label: 'DA Department',
          icon: 'fa-building',
          subItems: [
            {
              label: 'Add',
              path: routerPathNames.payrollManagement.setupDADepartmentAdd,
              icon: 'fa-plus'
            },
            {
              label: 'Edit',
              path: routerPathNames.payrollManagement.setupDADepartmentEdit,
              icon: 'fa-edit'
            }
          ]
        },
        {
          label: 'DA Employee',
          path: routerPathNames.payrollManagement.setupDAEmployee,
          icon: 'fa-user-plus'
        },
        {
          label: 'Loan/Staff Welfare',
          path: routerPathNames.payrollManagement.setupLoanStaffWelfare,
          icon: 'fa-hand-holding-heart'
        }
      ]
    },
    {
      label: 'Master',
      icon: 'fa-database',
      subItems: [
        {
          label: 'Leave',
          icon: 'fa-calendar',
          subItems: [
            {
              label: 'Add',
              path: routerPathNames.payrollManagement.masterLeaveAdd,
              icon: 'fa-plus'
            },
            {
              label: 'Edit',
              path: routerPathNames.payrollManagement.masterLeaveEdit,
              icon: 'fa-edit'
            },
            {
              label: 'Configure',
              path: routerPathNames.payrollManagement.masterLeaveConfigure,
              icon: 'fa-cog'
            }
          ]
        },
        {
          label: 'Comp/Ins Leave Days',
          icon: 'fa-calendar-day',
          subItems: [
            {
              label: 'Configure',
              path: routerPathNames.payrollManagement.masterCompInsLeaveDaysConfigure,
              icon: 'fa-cogs'
            },
            {
              label: 'Edit',
              path: routerPathNames.payrollManagement.masterCompInsLeaveDaysEdit,
              icon: 'fa-edit'
            }
          ]
        },
        {
          label: 'Comp/Ins Leave Dates',
          icon: 'fa-calendar-alt',
          subItems: [
            {
              label: 'Add',
              path: routerPathNames.payrollManagement.masterCompInsLeaveDatesAdd,
              icon: 'fa-plus'
            },
            {
              label: 'Edit',
              path: routerPathNames.payrollManagement.masterCompInsLeaveDatesEdit,
              icon: 'fa-edit'
            }
          ]
        },
        {
          label: 'Loan Recovery',
          icon: 'fa-hand-holding-usd',
          subItems: [
            {
              label: 'Add',
              path: routerPathNames.payrollManagement.masterLoanRecoveryAdd,
              icon: 'fa-plus'
            },
            {
              label: 'Unblock',
              path: routerPathNames.payrollManagement.masterLoanRecoveryUnblock,
              icon: 'fa-unlock'
            }
          ]
        }
      ]
    },
    {
      label: 'Reports',
      icon: 'fa-chart-bar',
      subItems: [
        {
          label: 'Salary Register',
          icon: 'fa-book',
          subItems: [
            {
              label: 'All Employee',
              path: routerPathNames.payrollManagement.reportSalaryRegisterAllEmployee,
              icon: 'fa-users'
            },
            {
              label: 'Category wise',
              path: routerPathNames.payrollManagement.reportSalaryRegisterCategoryWise,
              icon: 'fa-tags'
            }
          ]
        },
        {
          label: 'Leave Account',
          icon: 'fa-file-invoice',
          subItems: [
            {
              label: 'Employee wise',
              path: routerPathNames.payrollManagement.reportLeaveAccountEmployeeWise,
              icon: 'fa-user'
            },
            {
              label: 'Month wise',
              path: routerPathNames.payrollManagement.reportLeaveAccountMonthWise,
              icon: 'fa-calendar'
            },
            {
              label: 'Compen&Insti Leave Days',
              path: routerPathNames.payrollManagement.reportLeaveAccountCompenInstiLeaveDays,
              icon: 'fa-calendar-day'
            }
          ]
        },
        {
          label: 'Late Come / Permission',
          icon: 'fa-clock',
          subItems: [
            {
              label: 'Employee wise',
              path: routerPathNames.payrollManagement.reportLateComePermissionEmployeeWise,
              icon: 'fa-user'
            },
            {
              label: 'Department wise',
              path: routerPathNames.payrollManagement.reportLateComePermissionDepartmentWise,
              icon: 'fa-building'
            }
          ]
        },
        {
          label: 'Monthly Attendance',
          icon: 'fa-calendar-check',
          subItems: [
            {
              label: 'Department wise',
              path: routerPathNames.payrollManagement.reportMonthlyAttendanceDepartmentWise,
              icon: 'fa-building'
            },
            {
              label: 'All Employees',
              path: routerPathNames.payrollManagement.reportMonthlyAttendanceAllEmployees,
              icon: 'fa-users'
            }
          ]
        },
        {
          label: 'Duty Chart',
          path: routerPathNames.payrollManagement.reportDutyChart,
          icon: 'fa-chart-gantt'
        },
        {
          label: 'Duty Chart Department',
          path: routerPathNames.payrollManagement.reportDutyChartDepartment,
          icon: 'fa-building'
        },
        {
          label: 'Duty Chart Unit',
          path: routerPathNames.payrollManagement.reportDutyChartUnit,
          icon: 'fa-layer-group'
        },
        {
          label: 'Leave Summary',
          icon: 'fa-list-alt',
          subItems: [
            {
              label: 'Monthly All Employee',
              path: routerPathNames.payrollManagement.reportLeaveSummaryMonthlyAllEmployee,
              icon: 'fa-users'
            },
            {
              label: 'Particular Employee',
              path: routerPathNames.payrollManagement.reportLeaveSummaryParticularEmployee,
              icon: 'fa-user'
            }
          ]
        },
        {
          label: 'Salary Slip',
          path: routerPathNames.payrollManagement.reportSalarySlip,
          icon: 'fa-receipt'
        }
      ]
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
