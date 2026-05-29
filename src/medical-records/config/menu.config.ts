// Medical Records Menu Configuration
import { routerPathNames } from '../../routes/routerPathNames';

export interface MenuItemConfig {
  id: string;
  name: string;
  url?: string;
  accessCode?: number;
  icon: string;
  iconColor?: string;
  submenus?: MenuItemConfig[];
}

export interface ModuleMenuConfig {
  moduleId: number;
  moduleName: string;
  menus: MenuItemConfig[];
}

export const medicalRecordsMenuConfig: ModuleMenuConfig = {
  moduleId: 1,
  moduleName: "Medical Records",
  menus: [
    {
      id: "registration",
      name: "Registration",
      icon: "fas fa-user-plus",
      iconColor: 'var(--btn-primary)',
      accessCode: 1,
      submenus: [
        {
          id: "patient-registration",
          name: "Patient Registration",
          url: routerPathNames.medicalRecords.registration.patient,
          icon: "fas fa-user-circle",
          iconColor: 'var(--btn-success)',
          accessCode: 1
        },
        {
          id: "inpatient-registration",
          name: "InPatient Registration",
          url: routerPathNames.medicalRecords.registration.inpatient,
          icon: "fas fa-bed",
          accessCode: 2
        },
        // {
        //   id: "birth-registration",
        //   name: "Birth Registration",
        //   icon: "fas fa-baby",
        //   accessCode: 3,
        //   submenus: [
        //     {
        //       id: "birth-add",
        //       name: "Add",
        //       url: routerPathNames.medicalRecords.registration.birth.add,
        //       icon: "fas fa-plus",
        //       accessCode: 3
        //     },
        //     {
        //       id: "birth-edit",
        //       name: "Edit",
        //       url: routerPathNames.medicalRecords.registration.birth.edit,
        //       icon: "fas fa-edit",
        //       accessCode: 3
        //     }
        //   ]
        // },
        {
          id: "death-registration",
          name: "Death Registration",
          url: routerPathNames.medicalRecords.registration.death,
          icon: "fas fa-cross",
          accessCode: 4
        },
        // {
        //   id: "mlc-registration",
        //   name: "MLC Registration",
        //   url: routerPathNames.medicalRecords.registration.mlc,
        //   icon: "fas fa-file-medical",
        //   accessCode: 5
        // },
        {
          id: "change-department-doctor",
          name: "Change OP Department Doctor",
          url: routerPathNames.medicalRecords.registration.changeDepartmentDoctor,
          icon: " fas fa-file-medical",
          accessCode: 724
        },
        {
          id: "change-ip-department-doctor",
          name: "Change IP Department Doctor",
          url: routerPathNames.medicalRecords.registration.changeIpDepartmentDoctor,
          icon: " fas fa-file-medical",
          accessCode: 725
        }
      ]
    },
    {
      id: "activities",
      name: "Activities",
      icon: "fas fa-tasks",
      accessCode: 2,
      submenus: [
        {
          id: "refile-op-cards",
          name: "Refile OP Cards",
          url: routerPathNames.medicalRecords.activities.refileOpCards,
          icon: "fas fa-folder-open",
          accessCode: 7
        },
        {
          id: "room-bed-transfer",
          name: "Room/Bed Transfer",
          url: routerPathNames.medicalRecords.activities.roomBedTransfer,
          icon: "fas fa-bed",
          accessCode: 8
        },
        {
          id: "discharge",
          name: "Discharge ",
          url: routerPathNames.medicalRecords.activities.discharge,
          icon: "fas fa-sign-out-alt",
          accessCode: 9
        },
         {
          id: "dischargeSummary",
          name: "Discharge Summary ",
          icon: "fas fa-sign-out-alt",
          accessCode: 10,
          submenus: [
            {
              id: "MATERNITY ENTRY",
              name: "Maternity Discharge ",
              url: routerPathNames.medicalRecords.activities.MaternitySummary,
              icon: "fas fa-globe",
              accessCode: 10,
              
            },
             {
              id: "GENERAL  ENTRY",
              name: "General discharge ",
              url: routerPathNames.medicalRecords.activities.GeneralSummary,
              icon: "fas fa-globe",
              accessCode: 10,
              
            },
            
          ]
        },

        {
          id: "company-updation",
          name: "Company Updation",
          url: routerPathNames.medicalRecords.activities.companyUpdation,
          icon: "fas fa-building",
          accessCode: 11
        },
        // {
        //   id: "block-uhid",
        //   name: "Block UHID",
        //   url: routerPathNames.medicalRecords.activities.blockUhid,
        //   icon: "fas fa-ban",
        //   accessCode: 12
        // },
        // {
        //   id: "discharge-summary-print",
        //   name: "Dis Summary Print",
        //   url: routerPathNames.medicalRecords.activities.dischargePrint,
        //   icon: "fas fa-print",
        //   accessCode: 13
        // },
        {
          id: "icd-entry",
          name: "ICD Entry",
          url: routerPathNames.medicalRecords.activities.icdEntry,
          icon: "fas fa-notes-medical",
          accessCode: 544
        },
        {
          id: "visit-check",
          name: "Visit Check",
          url: routerPathNames.medicalRecords.activities.visitCheck,
          icon: "fas fa-check-circle",
          accessCode: 694
        },
        {
          id: "after-discharge",
          name: "After Discharge",
          url: routerPathNames.medicalRecords.activities.afterDischarge,
          icon: "fas fa-check-circle",
          accessCode: 729
        },
        // {
        //   id: "appointment-details",
        //   name: "Appointment Details",
        //   url: routerPathNames.medicalRecords.activities.appointments,
        //   icon: "fas fa-calendar-check",
        //   accessCode: 18
        // }
      ]
    },
    {
      id: "masters",
      name: "Masters",
      icon: "fas fa-database",
      accessCode: 3,
      submenus: [
        {
          id: "address",
          name: "Address",
          icon: "fas fa-map-marked-alt",
          submenus: [
            {
              id: "country",
              name: "Country",
              url: routerPathNames.medicalRecords.masters.country.add,
              icon: "fas fa-globe",
              accessCode: 14,
              
            },
            {
              id: "state",
              name: "State",
              url: routerPathNames.medicalRecords.masters.state.add,
              icon: "fas fa-map",
              accessCode: 15,
              
            },
            {
              id: "district",
              name: "District",
              url: routerPathNames.medicalRecords.masters.district.add,
              icon: "fas fa-map-marker-alt",
              accessCode: 16,
              
            },
            {
              id: "post",
              name: "Post",
              url: routerPathNames.medicalRecords.masters.post.add,
              icon: "fas fa-map-marker-alt",
              accessCode: 17,
              
            },
            {
              id: "village",
              name: "Village",
              url: routerPathNames.medicalRecords.masters.village.add,
              icon: "fas fa-map-marker-alt",
              accessCode: 18,
              
            }
          ]
        },
        {
          id: "complaint",
          name: "Complaint",
          url: routerPathNames.medicalRecords.masters.complaint.add,
          icon: "fas fa-comment-medical",
          accessCode: 19,
        },
        //  {
        //   id: "consultant",
        //   name: "Consultant",
        //   url: routerPathNames.medicalRecords.masters.consultant.add,
        //   icon: "fas fa-user-md",
        //   accessCode: 26
        // },

        //  {
        //   id: "department",
        //   name: "department",
        //   url: routerPathNames.medicalRecords.masters.department.add,
        //   icon: "fas fa-user-md",
        //   accessCode: 26
        // }

      ]
    },
    {
      id: "statistics",
      name: "Statistics",
      icon: "fas fa-chart-bar",
      accessCode: 4,
      submenus: [
        // {
        //   id: "dept-wise",
        //   name: "Department-wise",
        //   url: routerPathNames.medicalRecords.statistics.betweenDatesAndTime,
        //   icon: "fas fa-hospital",
        //   accessCode: 24,
        // },
        
        // {
        //   id: "mrd-collections",
        //   name: "MRD Collections",
        //   url: routerPathNames.medicalRecords.statistics.mrdCollections,
        //   icon: "fas fa-folder",
        //   accessCode: 21
        // },
        {
          id: "doctor-wise-op",
          name: "Doctor Wise OP",
          url: routerPathNames.medicalRecords.statistics.doctorWise,
          icon: "fas fa-user-md",
          accessCode: 22
        },
        // {
        //   id: "gender-dept",
        //   name: "Dept Wise",
        //   url: routerPathNames.medicalRecords.statistics.genderDept,
        //   icon: "fas fa-venus-mars",
        //   accessCode: 23
        // },
        {
          id: "active-ip",
          name: "Active IP",
          url: routerPathNames.medicalRecords.statistics.activeIp,
          icon: "fas fa-hospital-user",
          accessCode: 20
        },
        {
          id: "cash-collections",
          name: "Cash Collections",
          url: routerPathNames.medicalRecords.statistics.cashCollections,
          icon: "fas fa-money-bill-wave",
          accessCode: 508
        },
        {
          id: "op-statistics",
          name: "OP Statistics",
          url: routerPathNames.medicalRecords.statistics.opStatistics,
          icon: "fas fa-notes-medical",
          accessCode: 509
        },
        {
          id: "total-ward",
          name: "Total Ward",
          url: routerPathNames.medicalRecords.statistics.totalWard,
          icon: "fas fa-hospital",
          accessCode: 510
        },
        {
          id: "genderwise-ward",
          name: "Genderwise Ward",
          url: routerPathNames.medicalRecords.statistics.genderwiseWard,
          icon: "fas fa-venus-mars",
          accessCode: 511
        },
      ]
    },
    {
      id: "registers",
      name: "Registers",
      icon: "fas fa-book",
      accessCode: 5,
      submenus: [
        {
          id: "op-register",
          name: "New and Repeat OP",
          url: routerPathNames.medicalRecords.registers.op,
          icon: "fas fa-clipboard-list",
          accessCode: 25
        },
        {
          id: "old-op-regular",
          name: "Old OP Regular",
          url: routerPathNames.medicalRecords.registers.oldOpRegular,
          icon: "fas fa-clipboard-list",
          accessCode: 512
        }
        ,
        {
          id: "ip-register",
          name: "IP Register",
          url: routerPathNames.medicalRecords.registers.ip,
          icon: "fas fa-bed",
          accessCode: 26
        },
        {
          id: "discharge-register",
          name: "Discharge Register",
          url: routerPathNames.medicalRecords.registers.discharge,
          icon: "fas fa-sign-out-alt",
          accessCode: 28
        },
        // {
        //   id: "birth-register",
        //   name: "Birth Register",
        //   url: routerPathNames.medicalRecords.registers.birth,
        //   icon: "fas fa-baby",
        //   accessCode: 513
        // },
        // {
        //   id: "death-register",
        //   name: "Death Register",
        //   url: routerPathNames.medicalRecords.registers.death,
        //   icon: "fas fa-cross",
        //   accessCode: 514
        // },
        // {
        //   id: "refiled-ip-charts",
        //   name: "Refiled IP Charts",
        //   url: routerPathNames.medicalRecords.registers.refiledIpCharts,
        //   icon: "fas fa-chart-bar",
        //   accessCode: 515
        // },
        // {
        //   id: "mlc-register",
        //   name: "MLC Register",
        //   url: routerPathNames.medicalRecords.registers.mlc,
        //   icon: "fas fa-file-medical",
        //   accessCode: 516
        // },
        {
          id: "ip-census",
          name: "IP Census",
          url: routerPathNames.medicalRecords.registers.ipCensus,
          icon: "fas fa-procedures",
          accessCode: 517
        },
        // {
        //   id: "bed-occupied",
        //   name: "Bed Occupied",
        //   url: routerPathNames.medicalRecords.registers.bedOccupied,
        //   icon: "fas fa-procedures",
        //   accessCode: 518
        // },
        {
          id: "dept-wise",
          name: "Department Wise Register",
          url: routerPathNames.medicalRecords.registers.deptWise,
          icon: "fas fa-procedures",
          accessCode: 519
        },
        {
          id: "icd-code",
          name: "ICD Code Register",
          url: routerPathNames.medicalRecords.registers.icdCode,
          icon: "fas fa-procedures",
          accessCode: 520
        },
        {
          id: "refiled-records",
          name: "Refiled Records",
          url: routerPathNames.medicalRecords.registers.refiled,
          icon: "fas fa-folder-open",
          accessCode: 27
        },
        // {
        //   id: "bed-transfer",
        //   name: "Bed Transfer Register",
        //   url: routerPathNames.medicalRecords.registers.bedTransfer,
        //   icon: "fas fa-exchange-alt",
        //   accessCode: 29
        // },
        {
          id: "reg-collection",
          name: "Registration Collection",
          url: routerPathNames.medicalRecords.registers.collection,
          icon: "fas fa-money-bill-wave",
          accessCode: 31
        }
      ]
    },
    {
      id: "reports",
      name: "Reports",
      icon: "fas fa-file-alt",
      accessCode: 6,
      submenus: [
        // {
        //   id: "yearwise-details",
        //   name: "Yearwise All Details",
        //   url: routerPathNames.medicalRecords.reports.yearwise,
        //   icon: "fas fa-calendar-alt",
        //   accessCode: 32
        // },
        // {
        //   id: "month-wise-report",
        //   name: "Month Wise Report",
        //   url: routerPathNames.medicalRecords.reports.monthWise,
        //   icon: "fas fa-calendar-week",
        //   accessCode: 36
        // },
        // {
        //   id: "day-wise-report",
        //   name: "Day Wise Report",
        //   url: routerPathNames.medicalRecords.reports.dayWise,
        //   icon: "fas fa-calendar-day",
        //   accessCode: 521
        // },
        // {
        //   id: "comparison-report",
        //   name: "Comparison Report",
        //   url: routerPathNames.medicalRecords.reports.comparison,
        //   icon: "fas fa-chart-bar",
        //   accessCode: 542
        // },
        // {
        //   id: "graph-report",
        //   name: "Graph Report",
        //   url: routerPathNames.medicalRecords.reports.graph,
        //   icon: "fas fa-chart-line",
        //   accessCode: 543
        // },
        // {
        //   id: "patient-visit",
        //   name: "Patient Visit Details",
        //   url: routerPathNames.medicalRecords.reports.patientVisitDetails,
        //   icon: "fas fa-walking",
        //   accessCode: 34
        // },
        // {
        //   id: "user-wise-work-details",
        //   name: "User Wise Work Details",
        //   url: routerPathNames.medicalRecords.reports.userWiseWorkDetails,
        //   icon: "fas fa-user",
        //   accessCode: 522
        // },
        {
          id: "unrefilled-ip-charts",
          name: "Unrefilled IP Charts",
          url: routerPathNames.medicalRecords.reports.unrefilledIpCharts,
          icon: "fas fa-chart-bar",
          accessCode: 523
        },
        // {
        //   id: "death-genderwise",
        //   name: "Death Genderwise",
        //   url: routerPathNames.medicalRecords.reports.deathGenderwise,
        //   icon: "fas fa-venus-mars",
        //   accessCode: 524
        // },
        // {
        //   id: "mlc-regtd-patient-list",
        //   name: "MLC Regtd Patient List",
        //   url: routerPathNames.medicalRecords.reports.mlcRegtdPatientList,
        //   icon: "fas fa-file-medical",
        //   accessCode: 525
        // },
        // {
        //   id: "death-age-type-wise",
        //   name: "Death Age Type Wise",
        //   url: routerPathNames.medicalRecords.reports.deathAgeTypeWise,
        //   icon: "fas fa-chart-pie",
        //   accessCode: 526
        // },
        // {
        //   id: "icd-wise",
        //   name: "ICD Wise Report",
        //   url: routerPathNames.medicalRecords.reports.icdWise,
        //   icon: "fas fa-notes-medical",
        //   accessCode: 527
        // },
        {
          id: "categorywise-ip",
          name: "Categorywise IP Report",
          url: routerPathNames.medicalRecords.reports.categorywiseIp,
          icon: "fas fa-notes-medical",
          accessCode: 528
        },
        // {
        //   id: "mlc-patient-list",
        //   name: "MLC Patient List",
        //   url: routerPathNames.medicalRecords.reports.mlcPatientList,
        //   icon: "fas fa-notes-medical",
        //   accessCode: 529
        // },
        // {
        //   id: "icd-code-wise",
        //   name: "ICD Code Wise Report",
        //   url: routerPathNames.medicalRecords.reports.icdCodeWise,
        //   icon: "fas fa-notes-medical",
        //   accessCode: 530
        // },
        {
          id: "ip-occupancy",
          name: "IP Occupancy",
          url: routerPathNames.medicalRecords.reports.ipOccupancy,
          icon: "fas fa-procedures",
          accessCode: 531
        },
        {
          id: "cancer-patients-list",
          name: "Cancer Patients List",
          url: routerPathNames.medicalRecords.reports.cancerPatientsList,
          icon: "fas fa-procedures",
          accessCode: 532
        },
        {
          id: "diagnosis-wise-list",
          name: "Diagnosis Wise List",
          url: routerPathNames.medicalRecords.reports.diagnosisWiseList,
          icon: "fas fa-procedures",
          accessCode: 533
        },
        {
          id: "patients-all-visit",
          name: "Patients All Visit",
          url: routerPathNames.medicalRecords.reports.patientsAllVisit,
          icon: "fas fa-procedures",
          accessCode: 534
        },
        {
          id: "result-wise-list",
          name: "Result Wise List",
          url: routerPathNames.medicalRecords.reports.resultWiseList,
          icon: "fas fa-procedures",
          accessCode: 539
        },

        {
          id: "procedure-wise-list",
          name: "Procedure Wise List",
          url: routerPathNames.medicalRecords.reports.procedureWiseList,
          icon: "fas fa-procedures",
          accessCode: 536 
        },
        
        
        {
          id: "village-wise-list",
          name: "Village Wise List",
          url: routerPathNames.medicalRecords.reports.villageWiseList,
          icon: "fas fa-procedures",
          accessCode: 540
        },
        {
          id: "doctorwise-op",
          name: "Doctorwise OP Report",
          url: routerPathNames.medicalRecords.reports.doctorwiseOp,
          icon: "fas fa-procedures",
          accessCode: 541
        },

        // {
        //   id: "doctor-wise-reg",
        //   name: "Doctor Wise Registrations",
        //   url: routerPathNames.medicalRecords.reports.doctorWise,
        //   icon: "fas fa-user-md",
        //   accessCode: 33
        // },
        // {
        //   id: "doctorwise-op",
        //   name: "Doctorwise OP Report",
        //   url: routerPathNames.medicalRecords.reports.doctorwiseOp,
        //   icon: "fas fa-procedures",
        //   accessCode: 541
        // },
        // {
        //   id: "bed-occupancy-report",
        //   name: "Bed Occupancy Report",
        //   url: routerPathNames.medicalRecords.reports.bedOccupancyReport,
        //   icon: "fas fa-bed",
        //   accessCode: 542
        // }
        // ,{
        //   id: "Comparison",
        //   name: "Comparison",
        //   url: routerPathNames.medicalRecords.reports.Comparison,
        //   icon: "fas fa-procedures",
        //   accessCode: 537 

        // },
        {
          id: "death-report",
          name: "Death Report",
          url: routerPathNames.medicalRecords.reports.death,
          icon: "fas fa-cross",
          accessCode: 35
        },
        // {
        //   id: "birth-report",
        //   name: "Birth Report",
        //   url: routerPathNames.medicalRecords.reports.birth,
        //   icon: "fas fa-baby",
        //   accessCode: 36
        // },
        // {
        //   id: "weekly-report",
        //   name: "Weekly Report",
        //   url: routerPathNames.medicalRecords.reports.weekly,
        //   icon: "fas fa-calendar-week",
        //   accessCode: 36
        // }
        
        
      ]
    }
  ]
};

// Helper function to filter menus based on access rights
// Accepts { menuIds, submenuIds } and filters accordingly
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
        if (filteredSubmenus.length > 0 || (menu.accessCode !== undefined && accessCodes.menuIds.includes(menu.accessCode))) {
          return {
            ...menu,
            submenus: filteredSubmenus
          };
        }
        return null;
      }
      // For leaf menu items, check accessCode in menuIds (top-level)
      if (menu.accessCode !== undefined && accessCodes.menuIds.includes(menu.accessCode)) {
        return menu;
      }
      return null;
    })
    .filter((menu): menu is MenuItemConfig => menu !== null);
};

// Get all access codes from menu structure (for testing without API)
// Returns { menuIds: number[], submenuIds: number[] }
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
