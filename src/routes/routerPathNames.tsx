import CompanyReceivables from "../cash-counter/pages/activities/company-receivables/CompanyReceivables"
import Medicines from "../central-stores/pages/medical-store/reports/Medicines"
import ViewStockList from "../central-stores/pages/medical-store/reports/ViewStockList"
import MaternitySummary from "../medical-records/pages/activities/dischargeSummary/MaternitySummary"
import department from "../medical-records/pages/master/department/department"
import Comparison from "../medical-records/pages/registers/Comparison"
import PhRequestRegister from "../pharmacy-stores/pages/Registers/PhRequestRegister"
import PhSalesRegister from "../pharmacy-stores/pages/Registers/sales-register/PhSalesRegister"
import PhTakt4SalseRegister from "../pharmacy-stores/pages/Registers/PhTakt4SalseRegister"
import PhWardWiseBillRegister from "../pharmacy-stores/pages/Registers/PhWardWiseBillRegister"

const routerPathNames = {
    hims: {
        dashboard: "/hims/dashboard",
        changePassword: "/hims/changepassword"
    },
    medicalRecords: {
        base: "/hims/medical-records",
        dashboard: "/hims/medical-records",
        registration: {
            patient: "/hims/medical-records/registration/patient",
            inpatient: "/hims/medical-records/registration/inpatient",
            birth: {
                add: "/hims/medical-records/registration/birth/add",
                edit: "/hims/medical-records/registration/birth/edit"
            },
            death: "/hims/medical-records/registration/death",
            mlc: "/hims/medical-records/registration/mlc",
            changeDepartmentDoctor: "/hims/medical-records/registration/change-department-doctor",
            changeIpDepartmentDoctor: "/hims/medical-records/registration/change-ip-department-doctor"
        },
        activities: {
            refileOpCards: "/hims/medical-records/activities/refile-op-cards",
            roomBedTransfer: "/hims/medical-records/activities/room-bed-transfer",
            refile: "/hims/medical-records/activities/refile",
            roomTransfer: "/hims/medical-records/activities/room-transfer",
            discharge: "/hims/medical-records/activities/discharge",
            MaternitySummary: "/hims/medical-records/activities/maternity-summary",
            GeneralSummary: "/hims/medical-records/activities/general-summary",
            companyUpdation: "/hims/medical-records/activities/company-updation",
            blockUhid: "/hims/medical-records/activities/block-uhid",
            dischargePrint: "/hims/medical-records/activities/discharge-print",
            icdEntry: "/hims/medical-records/activities/icd-entry",
            visitCheck: "/hims/medical-records/activities/visit-check",
            afterDischarge: "/hims/medical-records/activities/after-discharge"
        },
        search: {
            outpatient: "/hims/medical-records/search/outpatient",
            inpatient: "/hims/medical-records/search/inpatient"
        },
        masters: {
            country: {
                add: "/hims/medical-records/masters/country/add"
            },
            state: {
                add: "/hims/medical-records/masters/state/add"
            },
            district: {
                add: "/hims/medical-records/masters/district/add"
            },
            village: {
                add: "/hims/medical-records/masters/village/add"
            },
            post: {
                add: "/hims/medical-records/masters/post/add"
            },
            complaint: {
                add: "/hims/medical-records/masters/complaint/add"
            },
            consultant:{
                add:"/hims/medical-records/masters/consultant/add"
            },
            department:{
                add:"/hims/medical-records/masters/department/add"
            }
        },
        statistics: {
            activeIp: "/hims/medical-records/statistics/active-ip",
            mrdCollections: "/hims/medical-records/statistics/mrd-collections",
            doctorWise: "/hims/medical-records/statistics/doctor-wise",
            genderDept: "/hims/medical-records/statistics/gender-dept",
            cashCollections: "/hims/medical-records/statistics/cash-collections",
            opStatistics: "/hims/medical-records/statistics/op-statistics",
            genderwiseWard: "/hims/medical-records/statistics/genderwise-ward",
            totalWard: "/hims/medical-records/statistics/total-ward",
            betweenDatesAndTime: "/hims/medical-records/statistics/dept/between-dates-and-time"
            // dept: {
                
            //     betweenDatesAndTime: "/hims/medical-records/statistics/dept/between-dates-and-time"
            // }
        },
        registers: {
            op: "/hims/medical-records/registers/op",
            oldOpRegular: "/hims/medical-records/registers/old-op-regular",
            birth: "/hims/medical-records/registers/birth",
            death: "/hims/medical-records/registers/death",
            mlc: "/hims/medical-records/registers/mlc",
            ipCensus: "/hims/medical-records/registers/ip-census",
            bedOccupied: "/hims/medical-records/registers/bed-occupied",
            deptWise: "/hims/medical-records/registers/dept-wise",
            icdCode: "/hims/medical-records/registers/icd-code",
            refiledIpCharts: "/hims/medical-records/registers/refiled-ip-charts",
            ip: "/hims/medical-records/registers/ip",
            refiled: "/hims/medical-records/registers/refiled",
            discharge: "/hims/medical-records/registers/discharge",
            bedTransfer: "/hims/medical-records/registers/bed-transfer",
            doctorTransfer: "/hims/medical-records/registers/doctor-transfer",
            collection: "/hims/cash-counter/account-collection/acc-registration-collection"
        },
        reports: {
            yearwise: "/hims/medical-records/reports/yearwise",
            doctorWise: "/hims/medical-records/reports/doctor-wise",
            patientVisitDetails: "/hims/medical-records/reports/patient-visit-details",
            procedureWiseList: "/hims/medical-records/reports/procedure-wise-list",
            patientsAllVisit: "/hims/medical-records/reports/patients-all-visit",
            weekly: "/hims/medical-records/reports/weekly-report",
            monthWise: "/hims/medical-records/reports/month-wise",
            villageWiseList: "/hims/medical-records/reports/village-wise-list",
            doctorwiseOp: "/hims/medical-records/reports/doctorwise-op",
            dayWise: "/hims/medical-records/reports/day-wise",
            comparison: "/hims/medical-records/reports/comparison",
            graph: "/hims/medical-records/reports/graph",
            userWiseWorkDetails: "/hims/medical-records/reports/user-wise-work-details",
            diagnosisWiseList: "/hims/medical-records/reports/diagnosis-wise-list",
            cancerPatientsList: "/hims/medical-records/reports/cancer-patients-list",
            ipOccupancy: "/hims/medical-records/reports/ip-occupancy",
            categorywiseIp: "/hims/medical-records/reports/categorywise-ip",
            icdWise: "/hims/medical-records/reports/icd-wise",
            icdCodeWise: "/hims/medical-records/reports/icd-code-wise",
            mlcPatientList: "/hims/medical-records/reports/mlc-patient-list",
            mlcRegtdPatientList: "/hims/medical-records/reports/mlc-regtd-patient-list",
            unrefilledIpCharts: "/hims/medical-records/reports/unrefilled-ip-charts",
            visit: {
                op: "/hims/medical-records/reports/visit/op",
                ip: "/hims/medical-records/reports/visit/ip"
            },
            death: "/hims/medical-records/reports/death",
            deathGenderwise: "/hims/medical-records/reports/death-genderwise",
            deathAgeTypeWise: "/hims/medical-records/reports/death-age-type-wise",
            birth: "/hims/medical-records/reports/birth",
            resultWiseList: "/hims/medical-records/reports/result-wise-list",
            bedOccupancyReport: "/hims/medical-records/reports/bed-occupancy-report",
            Comparison:"/hims/medical-records/reports/Comparison",
        },
    },
    cashCounter: {
        base: "/hims/cash-counter",
        dashboard: "/hims/cash-counter",
        billing: {
            opBilling: "/hims/cash-counter/billing/op-billing",
            advanceReturn: "/hims/cash-counter/billing/advance-return",
            CancelOrder: "/hims/cash-counter/billing/CancelOrder",
            phDuplicateBill: "/hims/cash-counter/billing/phDuplicateBill",

        },
        activities: {
            editBill: "/hims/cash-counter/activities/edit-bill",
            companyUpdation: "/hims/cash-counter/activities/company-updation",
            duplicateBill: "/hims/cash-counter/activities/duplicate-bill",
            duplicateBillView: "/hims/cash-counter/activities/duplicate-bill/view/:billId",
            reimbursementBill: "/hims/cash-counter/activities/reimbursement-bill",
            viewChart: "/hims/cash-counter/activities/view-chart",
            ipCollection: "/hims/cash-counter/activities/ip-collection",
            ipFinalBillEdit: "/hims/cash-counter/activities/ip-final-bill-edit",
            updateDue: "/hims/cash-counter/activities/update-due",
            companyReceivables: {
                receivables: "/hims/cash-counter/activities/company-receivables",
                changeCreditBillToCompany: "/hims/cash-counter/activities/change-credit-bill-to-company",
                changeCompanyToCreditBill: "/hims/cash-counter/activities/change-company-to-credit-bill",
                changeCompanyToCompany: "/hims/cash-counter/activities/change-company-to-company"
            }
        },
        masters: {
            investigationGroups: "/hims/cash-counter/masters/investigation-groups",

            procedures: "/hims/cash-counter/masters/procedures",
            packages: "/hims/cash-counter/masters/packages", 
            companyHead: "/hims/cash-counter/masters/company-head",

            procedureTemplate: {
                block: "/hims/cash-counter/masters/procedure-template/block"
            }
        },
        reports: {
            userDayEnd: "/hims/cash-counter/reports/user-day-end",
            dayEnd: "/hims/cash-counter/reports/day-end",
            pendingDue: "/hims/cash-counter/reports/pending-due",
            pendingAdv: "/hims/cash-counter/reports/pending-adv",
            pendingAdvance: "/hims/cash-counter/reports/pending-advance",
            previousBillsPrint: "/hims/cash-counter/reports/previous-bills-print",
            dayCloser: "/hims/cash-counter/reports/day-closer",
            ipDischarge: "/hims/cash-counter/reports/ip-discharge"
        },
        registers: {
            registrationCollection: "/hims/cash-counter/registers/registrationCollection",
            investigationCollection: "/hims/cash-counter/registers/investigationCollection",
            ipCollection: "/hims/cash-counter/registers/ipCollection",
            pharmacyCollection: "/hims/cash-counter/registers/pharmacyCollection",
            labCollection: "/hims/cash-counter/registers/lab-collection",
            dueCollection: "/hims/cash-counter/registers/due-collection",
            ipAdvanceCollection: "/hims/cash-counter/registers/ipAdvanceCollection",
            charityRegister: "/hims/cash-counter/registers/charityRegister",
            cashHandOverDetails: "/hims/cash-counter/registers/cashHandOverDetails",
            companyWisePayable: "/hims/cash-counter/registers/companyWisePayable",


            dueRegister: "/hims/cash-counter/registers/dueRegister",
            accountDetails: "/hims/cash-counter/registers/account-details",
            pastorAccountCollection: "/hims/cash-counter/registers/pastor-account-collection",
            companyPayablesDetails: "/hims/cash-counter/registers/company-payables-details",
            doctorWiseCollection: "/hims/cash-counter/registers/doctor-wise-collection"
        },

            reimbursementBills: {
                outPatientDateWise: "/hims/cash-counter/reimbursement-bills/out-patient-date-wise",
                outPatientOpNoWise: "/hims/cash-counter/reimbursement-bills/out-patient-op-no-wise",
                inPatient: "/hims/cash-counter/reimbursement-bills/in-patient",
                pharmacySheet: "/hims/cash-counter/reimbursement-bills/pharmacy-sheet"
            },

        accountCollection: {
            advanceRefund: "/hims/cash-counter/account-collection/advance-refund",
            dueCollections: "/hims/cash-counter/account-collection/due-collections",
            waitingOrders: "/hims/cash-counter/account-collection/waiting-orders",
            totalCollections: "/hims/cash-counter/account-collection/total-collections",
            allDuplicateBills: "/hims/cash-counter/account-collection/all-duplicate-bills",
            discountBillDetails: "/hims/cash-counter/account-collection/discount-bill-details",
            pharmacyCreditBills: "/hims/cash-counter/account-collection/pharmacy-credit-bills",
            doctorsRegCollection: "/hims/cash-counter/account-collection/doctors-reg-collection",
            departmentCollection: "/hims/cash-counter/account-collection/department-collection",
            doctorsCollection: "/hims/cash-counter/account-collection/doctors-collection",
            phDiscountCollection: "/hims/cash-counter/account-collection/ph-discount-collection",
            ipBills: "/hims/cash-counter/account-collection/ip-bills",
            accInvestigationCollection: "/hims/cash-counter/account-collection/acc-investigation-collection",
            accPharmacyCollection: "/hims/cash-counter/account-collection/acc-pharmacy-collection",
            accLabCollection: "/hims/cash-counter/account-collection/acc-lab-collection",
            accRegistrationCollection: "/hims/cash-counter/account-collection/acc-registration-collection",
            accCompanyReceipt: "/hims/cash-counter/account-collection/acc-company-receipt",
            accUserWiseCollection: "/hims/cash-counter/account-collection/user-day-end",
            accExceptPhUserWiseCollection: "/hims/cash-counter/account-collection/user-wise/acc-except-ph-user-wise-collection",
            accPhUserWiseCollection: "/hims/cash-counter/account-collection/user-wise/acc-ph-user-wise-collection",
            userdayend: "/hims/cash-counter/account-collection/user-day-end"
        },
    },
    laboratory: {
        base: "/hims/lab",
        dashboard: "/hims/lab",
        billing: {
            billing: "/hims/lab/billing/billing",
            wardRequest: "/hims/lab/billing/ward-request"
        },
        activities: {
            labEntry: "/hims/lab/activities/lab-entry",
            resultReEdit: "/hims/lab/activities/result-re-edit",
            duplicateResult: "/hims/lab/activities/duplicate-result",
            billLabDuplicateBill: "/hims/lab/activities/bill-lab-duplicate-bill"
        },
        masters: {
            department: {
                add: "/hims/lab/masters/department/add",
            },
            test: {
                add: "/hims/lab/masters/test/add",
                companyRates: "/hims/lab/masters/test/companyRates",
                editCost: "/hims/lab/masters/test/edit-cost",
                cultureTemplate: "/hims/lab/masters/test/culture-template",
                testTemplate: "/hims/lab/masters/test/test-template"
            },
            specimen: {
                add: "/hims/lab/masters/specimen/add",
            },
            antibiotic: {
                add: "/hims/lab/masters/antibiotic/add",
            },
            bacteria: {
                add: "/hims/lab/masters/bacteria/add",
            }
        },
        reports: {
            labRegister: "/hims/lab/reports/lab-register",
            testMaster: "/hims/lab/reports/test-master",
            resultReeditReport: "/hims/lab/reports/result-reedit-report",
        }
    },
    centralStores: {
        base: "/hims/central-stores",
        dashboard: "/hims/central-stores",
        medicalStore: {
            dashboard: "/hims/central-stores/medical-store",
            purchase: {
                prepareOrder: "/hims/central-stores/medical-store/purchase/prepare-order",
                prepareOrderFilter: "/hims/central-stores/medical-store/purchase/prepare-order-filter",
                approveOrder: "/hims/central-stores/medical-store/purchase/approve-order",
                viewOrder: "/hims/central-stores/medical-store/purchase/view-order",
                selectApprovedPO: "/hims/central-stores/medical-store/purchase/select-approved-po",
                entry: "/hims/central-stores/medical-store/purchase/entry",
                entryApproval: "/hims/central-stores/medical-store/purchase/entry-approval",
                selectSupplierDate: "/hims/central-stores/medical-store/purchase/select-supplier-date",
                goodsReturnPrep: "/hims/central-stores/medical-store/purchase/goods-return-prep",
                goodsReturnApproval: "/hims/central-stores/medical-store/purchase/goods-return-approval",
            },
            transferOrder: {
                selectWard: "/hims/central-stores/medical-store/transfer-order/select-ward",
                prepareTransfer: "/hims/central-stores/medical-store/transfer-order/prepare-transfer-medical",
                approveTransfer: "/hims/central-stores/medical-store/transfer-order/approve-transfer"
            },
            consumableOrder: {
                create: "/hims/central-stores/medical-store/consumable-order/create"
            },
            activities: {
                transferPrep: "/hims/central-stores/medical-store/activities/transfer-prep",
                transferApproval: "/hims/central-stores/medical-store/activities/transfer-approval",
                consumablePrep: "/hims/central-stores/medical-store/activities/consumable-prep",
                consumableApproval: "/hims/central-stores/medical-store/activities/consumable-approval",
                requestProcess: "/hims/central-stores/medical-store/activities/request-process",
                requestApproval: "/hims/central-stores/medical-store/activities/request-approval",
                medicineDetails: "/hims/central-stores/medical-store/activities/medicine-details",
                genericGroupMaster: "/hims/central-stores/medical-store/activities/generic-group-master",
                subGenericGroupMaster: "/hims/central-stores/medical-store/activities/sub-generic-group-master",
                genericDetailsMaster: "/hims/central-stores/medical-store/activities/generic-details-master",
                medicineItemMaster: "/hims/central-stores/medical-store/activities/medicine-item-master",
                companyMaster: "/hims/central-stores/medical-store/activities/company-master",
                supplierMaster: "/hims/central-stores/medical-store/activities/supplier-master",
                batchMaster: "/hims/central-stores/medical-store/activities/batch-master"
            },
            masters: {
                genericGroupAdd: "/hims/central-stores/medical-store/masters/generic-group-add",
                genericGroupUnblock: "/hims/central-stores/medical-store/masters/generic-group-unblock",
                subGenericAdd: "/hims/central-stores/medical-store/masters/sub-generic-add",
                subGenericUnblock: "/hims/central-stores/medical-store/masters/sub-generic-unblock",
                subGenericMap: "/hims/central-stores/medical-store/masters/sub-generic-map",
                genericAdd: "/hims/central-stores/medical-store/masters/generic-add",
                genericEdit: "/hims/central-stores/medical-store/masters/generic-edit",
                genericMapSub: "/hims/central-stores/medical-store/masters/generic-map-sub",
                genericMapBoth: "/hims/central-stores/medical-store/masters/generic-map-both",
                companyAdd: "/hims/central-stores/medical-store/masters/company-add",
                companyEdit: "/hims/central-stores/medical-store/masters/company-edit",
                supplierAdd: "/hims/central-stores/medical-store/masters/supplier-add",
                supplierEdit: "/hims/central-stores/medical-store/masters/supplier-edit",
                supplierApprove: "/hims/central-stores/medical-store/masters/supplier-approve",
                productAdd: "/hims/central-stores/medical-store/masters/product-add",
                productEdit: "/hims/central-stores/medical-store/masters/product-edit",
                productBlock: "/hims/central-stores/medical-store/masters/product-block",
                productUnblock: "/hims/central-stores/medical-store/masters/product-unblock",
                productMapSupplier: "/hims/central-stores/medical-store/masters/product-map-supplier",
                batchAdd: "/hims/central-stores/medical-store/masters/batch-add",
                batchEdit: "/hims/central-stores/medical-store/masters/batch-edit",
                productMinMax: "/hims/central-stores/medical-store/masters/product-min-max",
                consumableCause: "/hims/central-stores/medical-store/masters/consumable-cause",
                medication: "/hims/central-stores/medical-store/masters/medication",
                receivingPersonAdd: "/hims/central-stores/medical-store/masters/receiving-person-add",
                receivingPersonEdit: "/hims/central-stores/medical-store/masters/receiving-person-edit",
                receivingPersonUnblock: "/hims/central-stores/medical-store/masters/receiving-person-unblock"
            },
            registers: {
                stock: "/hims/central-stores/medical-store/registers/stock",
                zeroStock: "/hims/central-stores/medical-store/registers/zero-stock",
                allStock: "/hims/central-stores/medical-store/registers/all-stock",
                transfer: "/hims/central-stores/medical-store/registers/transfer",
                transferReceipts: "/hims/central-stores/medical-store/registers/transfer-receipts",
                consumable: "/hims/central-stores/medical-store/registers/consumable",
                goodsReceipts: "/hims/central-stores/medical-store/registers/goods-receipts-medical",
                goodsReturn: "/hims/central-stores/medical-store/registers/goods-return",
                receivedRequest: "/hims/central-stores/medical-store/registers/received-request",
                batchWiseStock: "/hims/central-stores/medical-store/registers/batch-wise-stock",
                medicineTransaction: "/hims/central-stores/medical-store/registers/medicine-transaction",
                initialStockAdjustment: "/hims/central-stores/medical-store/registers/initial-stock-adjustment",
                stockAdjustmentReport: "/hims/central-stores/medical-store/registers/stock-adjustment-report",
                individualTransfer: "/hims/central-stores/medical-store/registers/individual-transfer",
                transferConsumable: "/hims/central-stores/medical-store/registers/transfer-consumable",
                medicineTransactionAll: "/hims/central-stores/medical-store/registers/medicine-transaction-all",
                cancelledPO: "/hims/central-stores/medical-store/registers/cancelled-po"
            },
            reports: {
                stock: "/hims/central-stores/medical-store/reports/stock",
                expiryDateWise: "/hims/central-stores/medical-store/reports/expiry-date-wise",
                expiryBetweenDates: "/hims/central-stores/medical-store/reports/expiry-between-dates",
                supplierBetweenDates: "/hims/central-stores/medical-store/reports/supplier-between-dates",
                supplierMonthly: "/hims/central-stores/medical-store/reports/supplier-monthly",
                supplierYearly: "/hims/central-stores/medical-store/reports/supplier-yearly",
                transferDetails: "/hims/central-stores/medical-store/reports/transfer-details",
                allProductPurchase: "/hims/central-stores/medical-store/reports/all-product-purchase",
                supplierDetails: "/hims/central-stores/medical-store/reports/supplier-details",
                discount: "/hims/central-stores/medical-store/reports/discount",
                scheduleMedicine: "/hims/central-stores/medical-store/reports/schedule-medicine",
                stockValue: "/hims/central-stores/medical-store/reports/stock-value",
                Medicines:"/hims/central-stores/medical-store/reports/medicines",
                ViewStockList:"/hims/central-stores/medical-store/reports/ViewStockList",
                Company:"/hims/central-stores/medical-store/reports/Company",
                SupwiseGoodsReceipt:"/hims/central-stores/medical-store/reports/SupwiseGoodsReceipt",
                ExpiryCheckDetails:"/hims/central-stores/medical-store/reports/ExpiryCheck",
                SupwiseWiseTotal:"/hims/central-stores/medical-store/reports/SupwiseWiseTotal",
                MedicineDetails:"/hims/central-stores/medical-store/reports/MedicineDetails",
                MedicineLocationStock:"/hims/central-stores/medical-store/reports/MedicineLocationStock",
                costWiseMedicine:"/hims/central-stores/medical-store/reports/costWiseMedicine",
                PriceDetailsReports:"/hims/central-stores/medical-store/reports/PriceDetailsReports",
                StockReorderLevel:"/hims/central-stores/medical-store/reports/StockReorderLevel",
                StockProfitDetails:"/hims/central-stores/medical-store/reports/StockProfitDetails",
                monthlyConsumption:"/hims/central-stores/medical-store/reports/monthlyConsumption",
                PurchaseOrderStatusMed:"/hims/central-stores/medical-store/reports/PurchaseOrderStatusMed",
                gstr3b:"/hims/central-stores/medical-store/reports/gstr-3b",
                billWiseSales:"/hims/central-stores/medical-store/reports/bill-wise-sales",
                billWiseSalesReturn:"/hims/central-stores/medical-store/reports/bill-wise-sales-return",
                exemptedGstSales:"/hims/central-stores/medical-store/reports/exempted-gst-sales",
                gstrsales:"/hims/central-stores/medical-store/reports/gstrsales",
                gstrseperatesales:"/hims/central-stores/medical-store/reports/gstr-seperate-sales",
                gstrsalesreturn:"/hims/central-stores/medical-store/reports/gstr-sales-return",
                gstrseperatesalesreturn:"/hims/central-stores/medical-store/reports/gstr-seperate-sales-return",
                annexure1:"/hims/central-stores/medical-store/reports/annexure1",
                hsnsales:"/hims/central-stores/medical-store/reports/hsn-sales",
                hsnsalesreturn:"/hims/central-stores/medical-store/reports/hsn-sales-return",
                hsnpurchase:"/hims/central-stores/medical-store/reports/hsn-purchase",
                hsnpurchasereturn:"/hims/central-stores/medical-store/reports/hsn-purchase-return"

            },
            setup: {
                initialStock: "/hims/central-stores/medical-store/setup/initial-stock",
                stockAdjustment: "/hims/central-stores/medical-store/setup/stock-adjustment"
            },
            gstrDetail: {
                gstrDetails: "/hims/central-stores/medical-store/gstr-details"
            }
        },
        nonMedicalStore: {
            dashboard: "/hims/central-stores/non-medical-store",
            purchase: {
                
                prepareOrder: "/hims/central-stores/non-medical-store/purchase/prepare-order",
                prepareOrderFilter: "/hims/central-stores/non-medical-store/purchase/prepare-order-filter",
                approveOrder: "/hims/central-stores/non-medical-store/purchase/approve-order",
                viewOrder: "/hims/central-stores/non-medical-store/purchase/view-order",
                selectApprovedPO: "/hims/central-stores/non-medical-store/purchase/select-approved-po",
                entry: "/hims/central-stores/non-medical-store/purchase/entry",
                entryApproval: "/hims/central-stores/non-medical-store/purchase/entry-approval",
                selectSupplierDate: "/hims/central-stores/non-medical-store/purchase/select-supplier-date",
                goodsReturnPrep: "/hims/central-stores/non-medical-store/purchase/goods-return-prep",
                goodsReturnApproval: "/hims/central-stores/non-medical-store/purchase/goods-return-approval",
                pendingOrders: "/hims/central-stores/non-medical-store/purchase/pending-orders",
                ordersPrint: "/hims/central-stores/non-medical-store/purchase/orders-print",
                closeOrders: "/hims/central-stores/non-medical-store/purchase/close-orders",
                editOrders: "/hims/central-stores/non-medical-store/purchase/edit-orders"
            },
            activities: {
                transferPrep: "/hims/central-stores/non-medical-store/activities/transfer-prep",
                transferApproval: "/hims/central-stores/non-medical-store/activities/transfer-approval",
                consumablePrep: "/hims/central-stores/non-medical-store/activities/consumable-prep",
                consumableApproval: "/hims/central-stores/non-medical-store/activities/consumable-approval",
                requestProcess: "/hims/central-stores/non-medical-store/activities/request-process"
            },
            masters: {
                groupAdd: "/hims/central-stores/non-medical-store/masters/group-add",
                groupEdit: "/hims/central-stores/non-medical-store/masters/group-edit",
                companyAdd: "/hims/central-stores/non-medical-store/masters/company-add",
                companyEdit: "/hims/central-stores/non-medical-store/masters/company-edit",
                supplierAdd: "/hims/central-stores/non-medical-store/masters/supplier-add",
                supplierEdit: "/hims/central-stores/non-medical-store/masters/supplier-edit",
                productAdd: "/hims/central-stores/non-medical-store/masters/product-add",
                productEdit: "/hims/central-stores/non-medical-store/masters/product-edit",
                productMapSupplier: "/hims/central-stores/non-medical-store/masters/product-map-supplier",
                batchAdd: "/hims/central-stores/non-medical-store/masters/batch-add",
                batchEdit: "/hims/central-stores/non-medical-store/masters/batch-edit",
                consumableCause: "/hims/central-stores/non-medical-store/masters/consumable-cause"
            },
            registers: {
                stock: "/hims/central-stores/medical-store/registers/stock",
                transfer: "/hims/central-stores/non-medical-store/registers/transfer",
                goodsReceipts: "/hims/central-stores/non-medical-store/registers/goods-receipts-non-medical",
                goodsReturn: "/hims/central-stores/non-medical-store/registers/goods-return",
                batchWiseStock: "/hims/central-stores/non-medical-store/registers/batch-wise-stock",
                medicineTransaction: "/hims/central-stores/non-medical-store/registers/medicine-transaction",
                transferConsumable: "/hims/central-stores/non-medical-store/registers/transfer-consumable"
            },
            reports: {
                purchaseOrderStatus: "/hims/central-stores/non-medical-store/reports/purchase-order-status",
                productAndSupplier: "/hims/central-stores/non-medical-store/reports/product-and-supplier",
                supplierGoodsReceipt: "/hims/central-stores/non-medical-store/reports/supplier-goods-receipt",
                supplierDetails: "/hims/central-stores/non-medical-store/reports/supplier-details"
            },
            setup: {
                initialStock: "/hims/central-stores/non-medical-store/setup/initial-stock",
                stockAdjustment: "/hims/central-stores/non-medical-store/setup/stock-adjustment"
            }
        }
    },
    pharmacyStores: {
        base: "/hims/pharmacy-stores",
        dashboard: "/hims/pharmacy-stores",
        pharmacy: {
            dashboard: "/hims/pharmacy-stores/pharmacy",
            billing: {
                order: "/hims/pharmacy-stores/pharmacy/billing/order",
                CancelOrder: "/hims/pharmacy-stores/pharmacy/billing/CancelOrder",
            },
            activities: {
                dispenseDrug: "/hims/pharmacy-stores/pharmacy/activities/dispense-drug",
                dispenseReady: "/hims/pharmacy-stores/pharmacy/activities/dispense-ready",
                transferPrep: "/hims/pharmacy-stores/pharmacy/activities/transfer-prep",
                transferApproval: "/hims/pharmacy-stores/pharmacy/activities/transfer-approval",
                consumablePrep: "/hims/pharmacy-stores/pharmacy/activities/consumable-prep",
                consumableApproval: "/hims/pharmacy-stores/pharmacy/activities/consumable-approval",
                requestPrep: "/hims/pharmacy-stores/pharmacy/activities/request-prep",
                requestApproval: "/hims/pharmacy-stores/pharmacy/activities/request-approval",
                requestProcess: "/hims/pharmacy-stores/pharmacy/activities/request-process",
                requestNew: "/hims/pharmacy-stores/pharmacy/activities/request-new",
                duplicateReceipts: "/hims/pharmacy-stores/pharmacy/activities/duplicate-receipts",
                salesReturn: "/hims/pharmacy-stores/pharmacy/activities/sales-return",
                waitingOrder: "/hims/pharmacy-stores/pharmacy/activities/waiting-order",
                billPhDuplicateBill: "/hims/pharmacy-stores/pharmacy/activities/bill-ph-duplicate-bill",
            },
            purchase: {
                prepareOrder: "/hims/pharmacy-stores/pharmacy/purchase/prepare-order",
                prepareOrderFilter: "/hims/pharmacy-stores/pharmacy/purchase/prepare-order-filter",
                approveOrder: "/hims/pharmacy-stores/pharmacy/purchase/approve-order",
                viewOrder: "/hims/pharmacy-stores/pharmacy/purchase/view-order"
            },
            masters: {
                batchAdd: "/hims/pharmacy-stores/pharmacy/masters/BatchDetails",
                batchEdit: "/hims/pharmacy-stores/pharmacy/masters/batch-edit",
                expiryAlert: "/hims/pharmacy-stores/pharmacy/masters/expiry-alert",
                medicineMinMax: "/hims/pharmacy-stores/pharmacy/masters/medicine-min-max",
                genericMinMax: "/hims/pharmacy-stores/pharmacy/masters/generic-min-max",
                scheduleH1Add: "/hims/pharmacy-stores/pharmacy/masters/schedule-h1-add",
                scheduleH1Unblock: "/hims/pharmacy-stores/pharmacy/masters/schedule-h1-unblock",
                receivingPersonAdd: "/hims/pharmacy-stores/pharmacy/masters/receiving-person-add",
                receivingPersonEdit: "/hims/pharmacy-stores/pharmacy/masters/receiving-person-edit",
                receivingPersonUnblock: "/hims/pharmacy-stores/pharmacy/masters/receiving-person-unblock"
            },
            registers: {
                phStock: "/hims/pharmacy-stores/pharmacy/registers/phStock",
                phTransfer: "/hims/pharmacy-stores/pharmacy/registers/ph-transfer",
                phTransferReceipt: "/hims/pharmacy-stores/pharmacy/registers/ph-transfer-receipt",
                phDamages: "/hims/pharmacy-stores/pharmacy/registers/ph-damages",
                phSales: "/hims/pharmacy-stores/pharmacy/registers/ph-sales",
                phMedWiseSales: "/hims/pharmacy-stores/pharmacy/registers/ph-med-wise-sales",
                phSalesReturn: "/hims/pharmacy-stores/pharmacy/registers/ph-sales-return",
                phPrescription: "/hims/pharmacy-stores/pharmacy/registers/ph-prescription",
                phRequest: "/hims/pharmacy-stores/pharmacy/registers/ph-request-register",
                phTotalSalesMrp: "/hims/pharmacy-stores/pharmacy/registers/ph-total-sales-mrp",
                phTotalSalesCp: "/hims/pharmacy-stores/pharmacy/registers/ph-total-sales-cp",
                phBill: "/hims/pharmacy-stores/pharmacy/registers/ph-bill",
                phStockTaxWise: "/hims/pharmacy-stores/pharmacy/registers/ph-stock-tax-wise",
                PhWardWiseBillRegister: "/hims/pharmacy-stores/pharmacy/registers/ph-ward-wise-bill",
                PhTakt4SalseRegister: "/hims/pharmacy-stores/pharmacy/registers/ph-takt4-sales",
                PhMinimumReorder: "/hims/pharmacy-stores/pharmacy/registers/ph-minimum-reorder",


                consumable: "/hims/pharmacy-stores/pharmacy/registers/consumable",
                sales: "/hims/pharmacy-stores/pharmacy/registers/sales",
                salesReturn: "/hims/pharmacy-stores/pharmacy/registers/sales-return",
                prescription: "/hims/pharmacy-stores/pharmacy/registers/prescription",
                totalSales: "/hims/pharmacy-stores/pharmacy/registers/total-sales",
                salesStatistics: "/hims/pharmacy-stores/pharmacy/registers/sales-statistics",
                creditCardCollection: "/hims/pharmacy-stores/pharmacy/registers/credit-card-collection",
                monthlySalesStatistics: "/hims/pharmacy-stores/pharmacy/registers/monthly-sales-statistics",
                batchWiseStock: "/hims/pharmacy-stores/pharmacy/registers/batch-wise-stock",
                medicineTransaction: "/hims/pharmacy-stores/pharmacy/registers/medicine-transaction",
                transferReceipt: "/hims/pharmacy-stores/pharmacy/registers/transfer-receipt",
                initialStockAdjustment: "/hims/pharmacy-stores/pharmacy/registers/initial-stock-adjustment",
                medicationWiseSales: "/hims/pharmacy-stores/pharmacy/registers/medication-wise-sales",
                gstSales: "/hims/pharmacy-stores/pharmacy/registers/gst-sales",
                pendingOrders: "/hims/pharmacy-stores/pharmacy/registers/pending-orders"
            },
            reports: {
                waitingOrders: "/hims/pharmacy-stores/pharmacy/reports/waitingOrders",
                Diagnosis: "/hims/pharmacy-stores/pharmacy/reports/diagnosis",
                phDuplicateBill: "/hims/pharmacy-stores/pharmacy/reports/duplicate-bill",
                medicineWiseSales: "/hims/pharmacy-stores/pharmacy/reports/medicine-wise-sales",
                scheduledMedicineSale: "/hims/pharmacy-stores/pharmacy/reports/scheduled-medicine-sale",
                categoryWiseMedicine: "/hims/pharmacy-stores/pharmacy/reports/category-wise-medicine",
                salesCollectionAmount: "/hims/pharmacy-stores/pharmacy/reports/sales-collection-amount",
                salesStatus: "/hims/pharmacy-stores/pharmacy/reports/sales-status",
                ipPharmacyBills: "/hims/pharmacy-stores/pharmacy/reports/ip-pharmacy-bills",
                companyDueBills: "/hims/pharmacy-stores/pharmacy/reports/company-due-bills",
                companyReturnBills: "/hims/pharmacy-stores/pharmacy/reports/company-return-bills",
                dailySalesTransfer: "/hims/pharmacy-stores/pharmacy/reports/daily-sales-transfer",
                expiryCheck: "/hims/pharmacy-stores/pharmacy/reports/expiry-check",
            },
            gstrDetail: {
                gstrDetail: "/hims/pharmacy-stores/pharmacy/gstr-detail"
            },
            setup: {
                initialStock: "/hims/pharmacy-stores/pharmacy/setup/initial-stock",
                stockAdjustment: "/hims/pharmacy-stores/pharmacy/setup/stock-adjustment"
            }
        }
    },
    financialAccounts: {
        base: "/hims/financial-accounts",
        dashboard: "/hims/financial-accounts",
        transactions: {
            entry: "/hims/financial-accounts/transactions/entry",
            openingBalance: "/hims/financial-accounts/transactions/opening-balance",
            companyReceivables: "/hims/financial-accounts/transactions/company-receivables",
            donationEntry: "/hims/financial-accounts/transactions/donation-entry",
            pettyCashEntry: "/hims/financial-accounts/transactions/petty-cash-entry"
        },
        activities: {
            reconciliation: {
                entry: "/hims/financial-accounts/activities/reconciliation/entry"
            },
            request: {
                entry: "/hims/financial-accounts/activities/request/entry",
                sanction: "/hims/financial-accounts/activities/request/sanction",
                register: "/hims/financial-accounts/activities/request/register"
            },
            transactionPrint: "/hims/financial-accounts/activities/transaction-print",
            paymentVoucher: {
                noteEntry: "/hims/financial-accounts/activities/payment-voucher/note-entry",
                preparation: "/hims/financial-accounts/activities/payment-voucher/preparation",
                approval: "/hims/financial-accounts/activities/payment-voucher/approval"
            },
            paymentPrint: "/hims/financial-accounts/activities/payment-print",
            editCheque: "/hims/financial-accounts/activities/edit-cheque",
            transactionPaymentPrint: "/hims/financial-accounts/activities/transaction-payment-print"
        },
        setup: {
            accountHeads: {
                add: "/hims/financial-accounts/setup/account-heads/add",
                edit: "/hims/financial-accounts/setup/account-heads/edit"
            },
            openPartyAccounts: {
                pharmaSuppliers: "/hims/financial-accounts/setup/open-party-accounts/pharma-suppliers"
            },
            configHead: "/hims/financial-accounts/setup/config-head"
        },
        books: {
            dayBookNew: "/hims/financial-accounts/books/day-book-new",
            cashBook: "/hims/financial-accounts/books/cash-book",
            journalBook: "/hims/financial-accounts/books/journal-book",
            pettyCash: "/hims/financial-accounts/books/petty-cash",
            bankBook: "/hims/financial-accounts/books/bank-book",
            dayBook: "/hims/financial-accounts/books/day-book"
        },
        ledger: {
            betweenDates: "/hims/financial-accounts/ledger/between-dates"
        },
        finalAccounts: {
            incomeExpenseStatements: "/hims/financial-accounts/final-accounts/income-expense-statements",
            trialBalance: "/hims/financial-accounts/final-accounts/trial-balance",
            balanceSheet: "/hims/financial-accounts/final-accounts/balance-sheet",
            sundryCreditors: "/hims/financial-accounts/final-accounts/sundry-creditors",
            sundryDebtors: "/hims/financial-accounts/final-accounts/sundry-debtors",
            companyWisePaidBills: "/hims/financial-accounts/final-accounts/company-wise-paid-bills",
            companyWiseDueBills: "/hims/financial-accounts/final-accounts/company-wise-due-bills",
            supplierWisePending: "/hims/financial-accounts/final-accounts/supplier-wise-pending",
            donation: "/hims/financial-accounts/final-accounts/donation",
            supplierWiseAdvancePending: "/hims/financial-accounts/final-accounts/supplier-wise-advance-pending",
            supplierWiseAdvanceAdjustBills: "/hims/financial-accounts/final-accounts/supplier-wise-advance-adjust-bills",
            outsideLabPendingBills: "/hims/financial-accounts/final-accounts/outside-lab-pending-bills",
            outsideLabPaidBills: "/hims/financial-accounts/final-accounts/outside-lab-paid-bills",
            outsideDoctorPendingBills: "/hims/financial-accounts/final-accounts/outside-doctor-pending-bills",
            outsideDoctorPaidBills: "/hims/financial-accounts/final-accounts/outside-doctor-paid-bills",
            bankPayment: "/hims/financial-accounts/final-accounts/bank-payment",
            supplierWisePaid: "/hims/financial-accounts/final-accounts/supplier-wise-paid",
            incomeExpenseStatementsInventory: "/hims/financial-accounts/final-accounts/income-expense-statements-inventory",
            trialBalanceInventory: "/hims/financial-accounts/final-accounts/trial-balance-inventory",
            balanceSheetInventory: "/hims/financial-accounts/final-accounts/balance-sheet-inventory",
            receiptPayment: "/hims/financial-accounts/final-accounts/receipt-payment"
        }
    },
    systemAdmin: {
        base: "/hims/system-admin",
        dashboard: "/hims/system-admin",
        activities: {
            createNewAccount: "/hims/system-admin/activities/create-new-account",
            circular: "/hims/system-admin/activities/circular",
            packageConfigure: "/hims/system-admin/activities/package-configure",
            authorizedName: "/hims/system-admin/activities/authorized-name",
            billCancel: "/hims/system-admin/activities/bill-cancel",
            billCancelView: "/hims/system-admin/activities/bill-cancel/view/:finalBillId"
        },
        records: {
            department: {
                add: "/hims/system-admin/records/department/add",
                editBlock: "/hims/system-admin/records/department/edit-block",
                unblock: "/hims/system-admin/records/department/unblock"
            },
            consultant: {
                add: "/hims/system-admin/records/consultant/add",
                editBlock: "/hims/system-admin/records/consultant/edit-block",
                unblock: "/hims/system-admin/records/consultant/unblock"
            },
            ward: {
                create: "/hims/system-admin/records/ward/create",
                edit: "/hims/system-admin/records/ward/edit",
                block: "/hims/system-admin/records/ward/block",
                unblock: "/hims/system-admin/records/ward/unblock"
            },
            roomsBeds: {
                add: "/hims/system-admin/records/rooms-beds/add",
                edit: "/hims/system-admin/records/rooms-beds/edit",
                block: "/hims/system-admin/records/rooms-beds/block",
                unblock: "/hims/system-admin/records/rooms-beds/unblock",
                align: "/hims/system-admin/records/rooms-beds/align",
                group: {
                    add: "/hims/system-admin/records/rooms-beds/group/add",
                    edit: "/hims/system-admin/records/rooms-beds/group/edit"
                }
            },
            consultingCharge: {
                departmentwise: {
                    add: "/hims/system-admin/records/consulting-charge/departmentwise/add",
                    edit: "/hims/system-admin/records/consulting-charge/departmentwise/edit"
                },
                consultantwise: {
                    add: "/hims/system-admin/records/consulting-charge/consultantwise/add",
                    edit: "/hims/system-admin/records/consulting-charge/consultantwise/edit"
                }
            },
            package: {
                add: "/hims/system-admin/records/package/add",
                update: "/hims/system-admin/records/package/update"
            },
            companyAccounts: {
                open: "/hims/system-admin/records/company-accounts/open",
                block: "/hims/system-admin/records/company-accounts/block",
                unblock: "/hims/system-admin/records/company-accounts/unblock"
            },
            categoryType: {
                add: "/hims/system-admin/records/category-type/add"
            },
            companyUpdation: "/hims/system-admin/records/company-updation",
            accountHeads: {
                add: "/hims/system-admin/records/account-heads/add",
                edit: "/hims/system-admin/records/account-heads/edit"
            },
            dischargeConsultants: {
                addEditBlock: "/hims/system-admin/records/discharge-consultants/add-edit-block",
                unblock: "/hims/system-admin/records/discharge-consultants/unblock"
            },
            cashType: {
                addEditUnblock: "/hims/system-admin/records/cash-type/add-edit-unblock"
            },
            bankPaymentMode: {
                addEditUnblock: "/hims/system-admin/records/bank-payment-mode/add-edit-unblock"
            },
            bankDetails: {
                addEditUnblock: "/hims/system-admin/records/bank-details/add-edit-unblock"
            },
            registrationConfig: {
                addEdit: "/hims/system-admin/records/registration-config/add-edit",
                unblock: "/hims/system-admin/records/registration-config/unblock"
            },
            Role:{
                systemRole:"/hims/system-admin/records/Role/systemRole"

            }
        },
        configureUser: {
            createUser: "/hims/system-admin/configure-user/create-user",
            editUser: "/hims/system-admin/configure-user/edit-user",
            blockUser: "/hims/system-admin/configure-user/block-user",
            unblockUser: "/hims/system-admin/configure-user/unblock-user",
            resetPassword: "/hims/system-admin/configure-user/resetPassword/AddResetPassword",
            addUserPhoto: "/hims/system-admin/configure-user/add-user-photo",
            assignConcessionRights: "/hims/system-admin/configure-user/assign-concession-rights"
        },
        configureStore: {
            add: "/hims/system-admin/configure-store/add",
            block: "/hims/system-admin/configure-store/block",
            unblock: "/hims/system-admin/configure-store/unblock",
            createHeads: "/hims/system-admin/configure-store/create-heads"
        },
        configureDisplay: {
            account: {
                paymentReceipts: "/hims/system-admin/configure-display/account/payment-receipts"
            },
            cash: {
                cashBills: "/hims/system-admin/configure-display/cash/cash-bills",
                cashReturnBills: "/hims/system-admin/configure-display/cash/cash-return-bills"
            },
            pharmacy: {
                salesReceipt: "/hims/system-admin/configure-display/pharmacy/sales-receipt",
                salesOrders: "/hims/system-admin/configure-display/pharmacy/sales-orders",
                salesReturnPaymentVoucher: "/hims/system-admin/configure-display/pharmacy/sales-return-payment-voucher",
                damagesNote: "/hims/system-admin/configure-display/pharmacy/damages-note",
                goodsReceipts: "/hims/system-admin/configure-display/pharmacy/goods-receipts",
                salesReturnOrder: "/hims/system-admin/configure-display/pharmacy/sales-return-order",
                requestNote: "/hims/system-admin/configure-display/pharmacy/request-note",
                transferNote: "/hims/system-admin/configure-display/pharmacy/transfer-note"
            },
            store: {
                bills: "/hims/system-admin/configure-display/store/bills",
                billOrder: "/hims/system-admin/configure-display/store/bill-order",
                billsReturn: "/hims/system-admin/configure-display/store/bills-return",
                damages: "/hims/system-admin/configure-display/store/damages",
                goodsReceiptNote: "/hims/system-admin/configure-display/store/goods-receipt-note",
                goodsRequestNote: "/hims/system-admin/configure-display/store/goods-request-note",
                goodsTransferNote: "/hims/system-admin/configure-display/store/goods-transfer-note",
                goodsReturnNote: "/hims/system-admin/configure-display/store/goods-return-note"
            }
        },
        cashCollection: "/hims/system-admin/cash-collection",
        reports: {
            patientRegister: "/hims/system-admin/reports/patient-register",
            admissionRegister: "/hims/system-admin/reports/admission-register",
            duplicateBill: "/hims/system-admin/reports/duplicate-bill",
            birthRegister: "/hims/system-admin/reports/birth-register",
            opdRegister: "/hims/system-admin/reports/opd-register",
            deathRegister: "/hims/system-admin/reports/death-register",
            itemSales: "/hims/system-admin/reports/item-sales",
            billCancel: "/hims/system-admin/reports/bill-cancel"
        }
    },
    employeeManagement: {
        base: "/hims/employee-management",
        dashboard: "/hims/employee-management",
        // Recruitment
        addEmployee: "/hims/employee-management/recruitment/add-employee",
        extendTrainingPeriod: "/hims/employee-management/recruitment/extend-training-period",
        transferToProbation: "/hims/employee-management/recruitment/transfer-to-probation",
        extendProbationary: "/hims/employee-management/recruitment/extend-probationary",
        extendContractPeriod: "/hims/employee-management/recruitment/extend-contract-period",
        confirmation: "/hims/employee-management/recruitment/confirmation",
        addEmployeeDetails: "/hims/employee-management/recruitment/add-employee-details",
        employeeRejoining: "/hims/employee-management/recruitment/employee-rejoining",
        employeeFamilyEdit: "/hims/employee-management/recruitment/employee-family-edit",
        // Promotion
        setupLevel: "/hims/employee-management/promotion/setup-level",
        promotion: "/hims/employee-management/promotion/promotion",
        // Cessation Info
        cessation: "/hims/employee-management/cessation/cessation",
        cessationCancelResignation: "/hims/employee-management/cessation/cancel-resignation",
        cessationCancelVRS: "/hims/employee-management/cessation/cancel-vrs",
        cessationAcceptResignation: "/hims/employee-management/cessation/accept-resignation",
        cessationAcceptVRS: "/hims/employee-management/cessation/accept-vrs",
        // Retirement
        retirementList: "/hims/employee-management/retirement/list",
        retirementConfirmation: "/hims/employee-management/retirement/confirmation",
        // Report - Appointment
        reportAppointmentYearWise: "/hims/employee-management/report/appointment/year-wise",
        reportAppointmentMonthWise: "/hims/employee-management/report/appointment/month-wise",
        reportAppointmentYearlyComparison: "/hims/employee-management/report/appointment/yearly-comparison",
        // Report - Retirement
        reportRetirement: "/hims/employee-management/report/retirement",
        // Report - Promotion
        reportPromotionDetails: "/hims/employee-management/report/promotion/promotion-details",
        reportTotalPromotionDetails: "/hims/employee-management/report/promotion/total-promotion-details",
        // Report - Leave Report
        reportLeaveEmployeewiseMonthwise: "/hims/employee-management/report/leave/employeewise/monthwise",
        reportLeaveEmployeewiseYearwise: "/hims/employee-management/report/leave/employeewise/yearwise",
        reportLeavePositionwiseMonthwise: "/hims/employee-management/report/leave/positionwise/monthwise",
        reportLeavePositionwiseYearwise: "/hims/employee-management/report/leave/positionwise/yearwise",
        // Report - Employee
        reportEmployeeAllDepartment: "/hims/employee-management/report/employee/all-department",
        reportEmployeeMale: "/hims/employee-management/report/employee/male",
        reportEmployeeFemale: "/hims/employee-management/report/employee/female",
        // Report - Position Wise
        reportPositionWiseEmployeeAll: "/hims/employee-management/report/position-wise/employee/all",
        reportPositionWiseEmployeeParticular: "/hims/employee-management/report/position-wise/employee/particular",
        // Report - Cessation
        reportCessationResignation: "/hims/employee-management/report/cessation/resignation",
        reportCessationVRS: "/hims/employee-management/report/cessation/vrs",
        reportCessationTermination: "/hims/employee-management/report/cessation/termination",
        reportCessationDeath: "/hims/employee-management/report/cessation/death",
        // Report - Other Reports
        reportEmployeeDetail: "/hims/employee-management/report/employee-detail",
        reportRetiredStatus: "/hims/employee-management/report/retired-status",
        reportServiceRegister: "/hims/employee-management/report/service-register",
        reportRetirementDetails: "/hims/employee-management/report/retirement-details",
        reportProbationaryEmployees: "/hims/employee-management/report/probationary-employees",
        reportTrainingEmployees: "/hims/employee-management/report/training-employees",
        reportConfirmedEmployees: "/hims/employee-management/report/confirmed-employees",
        reportContractEmployees: "/hims/employee-management/report/contract-employees",
        reportDepartmentWise: "/hims/employee-management/report/department-wise",
        reportDivisionWise: "/hims/employee-management/report/division-wise",
        // Master - Category
        masterCategoryAdd: "/hims/employee-management/master/category/CategoryAdd",
        
        // Master - Department
        masterDepartmentAdd: "/hims/employee-management/master/department/departmentAdd",
    
        // Master - Position
        masterPositionAdd: "/hims/employee-management/master/position/positionAdd",
        // Master - Salary Head
        masterSalaryHeadAdd: "/hims/employee-management/master/salary-head/salaryHead",
        // Master - Unit
        masterUnitAdd: "/hims/employee-management/master/unit/unitAdd",
        // Master - Division
        masterDivisionAdd: "/hims/employee-management/master/division/divisionAdd",
        // Edit Details
        editEmployeeDetails: "/hims/employee-management/edit-details/employee-details",
        editCategoryWise: "/hims/employee-management/edit-details/category-wise",
        // Exit
        exitSelectionArea: "/hims/employee-management/exit/selection-area",
        exitLogout: "/hims/employee-management/exit/logout"
    },
    payrollManagement: {
        base: "/hims/payroll-management",
        dashboard: "/hims/payroll-management",
        // Leave - Employee Leave
        leaveEmployeeLeaveAssign: "/hims/payroll-management/leave/employee-leave/assign",
        leaveEmployeeLeaveAssignAll: "/hims/payroll-management/leave/employee-leave/assign-all",
        leaveEmployeeLeaveEdit: "/hims/payroll-management/leave/employee-leave/edit",
        leaveEmployeeLeaveEditAll: "/hims/payroll-management/leave/employee-leave/edit-all",
        // Leave - Employee Weekoff
        leaveEmployeeWeekoffAssign: "/hims/payroll-management/leave/employee-weekoff/assign",
        leaveEmployeeWeekoffEdit: "/hims/payroll-management/leave/employee-weekoff/edit",
        leaveEmployeeWeekoffAllEmployee: "/hims/payroll-management/leave/employee-weekoff/all-employee",
        // Leave - Applications
        leaveLeaveApplication: "/hims/payroll-management/leave/leave-application",
        leaveLossOfPayApplication: "/hims/payroll-management/leave/loss-of-pay-application",
        // Leave - Approval
        leaveApprovalEmployeeWise: "/hims/payroll-management/leave/approval/employee-wise",
        leaveApprovalAllEmployee: "/hims/payroll-management/leave/approval/all-employee",
        // Leave - Other
        leaveCancelLeave: "/hims/payroll-management/leave/cancel-leave",
        leaveLeaveEncashment: "/hims/payroll-management/leave/leave-encashment",
        // Leave - Duty Roster
        leaveDutyRosterConfigure: "/hims/payroll-management/leave/duty-roster/configure",
        leaveDutyRosterReconfigure: "/hims/payroll-management/leave/duty-roster/reconfigure",
        leaveDutyRosterMapEmployee: "/hims/payroll-management/leave/duty-roster/map-employee",
        leaveDutyRosterAssignDuty: "/hims/payroll-management/leave/duty-roster/assign-duty",
        leaveDutyRosterDutyAdjustment: "/hims/payroll-management/leave/duty-roster/duty-adjustment",
        // Attendance
        attendanceAttendanceEntry: "/hims/payroll-management/attendance/attendance-entry",
        attendanceLateComingPermissionEntry: "/hims/payroll-management/attendance/late-coming-permission-entry",
        attendanceCancelPermission: "/hims/payroll-management/attendance/cancel-permission",
        // Salary Register
        salaryRegisterOpen: "/hims/payroll-management/salary-register/open",
        salaryRegisterClose: "/hims/payroll-management/salary-register/close",
        salaryRegisterView: "/hims/payroll-management/salary-register/view",
        salaryRegisterSalaryEdit: "/hims/payroll-management/salary-register/salary-edit",
        salaryRegisterLoanRecovery: "/hims/payroll-management/salary-register/loan-recovery",
        // Setup - Salary Structure
        setupSalaryStructureCreate: "/hims/payroll-management/setup/salary-structure/create",
        setupSalaryStructureEdit: "/hims/payroll-management/setup/salary-structure/edit",
        // Setup - Employee Salary
        setupEmployeeSalaryConfigure: "/hims/payroll-management/setup/employee-salary/configure",
        setupEmployeeSalaryEdit: "/hims/payroll-management/setup/employee-salary/edit",
        // Setup - Increments
        setupSalaryIncrement: "/hims/payroll-management/setup/salary-increment",
        setupDAIncrement: "/hims/payroll-management/setup/da-increment",
        // Setup - DA Department
        setupDADepartmentAdd: "/hims/payroll-management/setup/da-department/add",
        setupDADepartmentEdit: "/hims/payroll-management/setup/da-department/edit",
        // Setup - Other
        setupDAEmployee: "/hims/payroll-management/setup/da-employee",
        setupLoanStaffWelfare: "/hims/payroll-management/setup/loan-staff-welfare",
        // Master - Leave
        masterLeaveAdd: "/hims/payroll-management/master/leave/add",
        masterLeaveEdit: "/hims/payroll-management/master/leave/edit",
        masterLeaveConfigure: "/hims/payroll-management/master/leave/configure",
        // Master - Comp/Ins Leave Days
        masterCompInsLeaveDaysConfigure: "/hims/payroll-management/master/comp-ins-leave-days/configure",
        masterCompInsLeaveDaysEdit: "/hims/payroll-management/master/comp-ins-leave-days/edit",
        // Master - Comp/Ins Leave Dates
        masterCompInsLeaveDatesAdd: "/hims/payroll-management/master/comp-ins-leave-dates/add",
        masterCompInsLeaveDatesEdit: "/hims/payroll-management/master/comp-ins-leave-dates/edit",
        // Master - Loan Recovery
        masterLoanRecoveryAdd: "/hims/payroll-management/master/loan-recovery/add",
        masterLoanRecoveryUnblock: "/hims/payroll-management/master/loan-recovery/unblock",
        // Reports - Salary Register
        reportSalaryRegisterAllEmployee: "/hims/payroll-management/report/salary-register/all-employee",
        reportSalaryRegisterCategoryWise: "/hims/payroll-management/report/salary-register/category-wise",
        // Reports - Leave Account
        reportLeaveAccountEmployeeWise: "/hims/payroll-management/report/leave-account/employee-wise",
        reportLeaveAccountMonthWise: "/hims/payroll-management/report/leave-account/month-wise",
        reportLeaveAccountCompenInstiLeaveDays: "/hims/payroll-management/report/leave-account/compen-insti-leave-days",
        // Reports - Late Come / Permission
        reportLateComePermissionEmployeeWise: "/hims/payroll-management/report/late-come-permission/employee-wise",
        reportLateComePermissionDepartmentWise: "/hims/payroll-management/report/late-come-permission/department-wise",
        // Reports - Monthly Attendance
        reportMonthlyAttendanceDepartmentWise: "/hims/payroll-management/report/monthly-attendance/department-wise",
        reportMonthlyAttendanceAllEmployees: "/hims/payroll-management/report/monthly-attendance/all-employees",
        // Reports - Duty Charts
        reportDutyChart: "/hims/payroll-management/report/duty-chart",
        reportDutyChartDepartment: "/hims/payroll-management/report/duty-chart-department",
        reportDutyChartUnit: "/hims/payroll-management/report/duty-chart-unit",
        // Reports - Leave Summary
        reportLeaveSummaryMonthlyAllEmployee: "/hims/payroll-management/report/leave-summary/monthly-all-employee",
        reportLeaveSummaryParticularEmployee: "/hims/payroll-management/report/leave-summary/particular-employee",
        // Reports - Salary Slip
        reportSalarySlip: "/hims/payroll-management/report/salary-slip",
        // Exit
        exitSelectionArea: "/hims/payroll-management/exit/selection-area",
        exitLogout: "/hims/payroll-management/exit/logout"
    },
    pacs: {
        base: "/hims/pacs",
        dashboard: "/hims/pacs",
        dicomViewer: "/hims/pacs/dicom-viewer",
        dicomWeb: "/hims/pacs/dicom-web"
    },
    radiology: {
        base: "/hims/radiology",
        dashboard: "/hims/radiology",
        order: {
            investigationOrder: "/hims/radiology/order/investigation-order",
            cancelOrder: "/hims/radiology/order/cancel-order"
        },
        entry: {
            entry: "/hims/radiology/entry/entry",
        },
        scanEntry: {
            scanEntry: "/hims/radiology/scan-entry/scan-entry",
            scanBold: "/hims/radiology/scan-entry/scan-bold",
            scanEdit: "/hims/radiology/scan-entry/scan-edit",
            angiogramEntry: "/hims/radiology/scan-entry/angiogram-entry",
            scanReport: "/hims/radiology/scan-entry/scan-report"
        },
        purchaseOrders: {
            prepareOrders: "/hims/radiology/purchase-orders/prepare-orders",
            poApproval: "/hims/radiology/purchase-orders/po-approval",
            closePO: "/hims/radiology/purchase-orders/close-po",
            poPrint: "/hims/radiology/purchase-orders/po-print",
            grNotePreparation: "/hims/radiology/purchase-orders/gr-note-preparation",
            grNoteApproval: "/hims/radiology/purchase-orders/gr-note-approval",
            goodsReceipts: "/hims/radiology/purchase-orders/goods-receipts"
        },
        activities: {
            prepareUsageNote: "/hims/radiology/activities/prepare-usage-note",
            approveNote: "/hims/radiology/activities/approve-note"
        },
        registers: {
            goodsReceiptsRegister: "/hims/radiology/registers/goods-receipts-register",
            goodsReturnRegister: "/hims/radiology/registers/goods-return-register",
            usageRegister: "/hims/radiology/registers/usage-register",
            goodsReceiptProductWise: "/hims/radiology/registers/goods-receipt-product-wise",
            groupWiseGoodsReceipt: "/hims/radiology/registers/group-wise-goods-receipt",
            investigationRegister: "/hims/radiology/registers/investigation-register"
        },
        reports: {
            invFilmFlow: "/hims/radiology/reports/inv-film-flow",
            stockRegister: "/hims/radiology/reports/stock-register",
            expiryCheck: "/hims/radiology/reports/expiry-check",
            expiryProducts: "/hims/radiology/reports/expiry-products",
            groupWiseReport: "/hims/radiology/reports/group-wise-report",
            stockReport: "/hims/radiology/reports/stock-report",
            groupWiseCollection: "/hims/radiology/reports/group-wise-collection",
            groupWiseCollectionDetails: "/hims/radiology/reports/group-wise-collection-details",
            scanReports: "/hims/radiology/reports/scan-reports",
            scanReportCancel: "/hims/radiology/reports/scan-report-cancel",
            angiogramReport: "/hims/radiology/reports/angiogram-report"
        },
        masters: {
            invFilm: {
                add: "/hims/radiology/masters/inv-film/add",
                edit: "/hims/radiology/masters/inv-film/edit",
                block: "/hims/radiology/masters/inv-film/block",
                unblock: "/hims/radiology/masters/inv-film/unblock"
            },
            group: {
                add: "/hims/radiology/masters/group/add",
                edit: "/hims/radiology/masters/group/edit"
            },
            company: {
                add: "/hims/radiology/masters/company/add",
                edit: "/hims/radiology/masters/company/edit"
            },
            supplier: {
                add: "/hims/radiology/masters/supplier/add",
                edit: "/hims/radiology/masters/supplier/edit",
                map: "/hims/radiology/masters/supplier/map",
                deleteMapping: "/hims/radiology/masters/supplier/delete-mapping"
            },
            materialCode: {
                add: "/hims/radiology/masters/material-code/add",
                edit: "/hims/radiology/masters/material-code/edit"
            },
            initialStock: "/hims/radiology/masters/initial-stock",
            productProperties: "/hims/radiology/masters/product-properties",
            stockAdjustment: "/hims/radiology/masters/stock-adjustment",
            groupsConfig: {
                add: "/hims/radiology/masters/groups-config/add",
                edit: "/hims/radiology/masters/groups-config/edit"
            },
            proceduresConfig: {
                add: "/hims/radiology/masters/procedures-config/add",
                edit: "/hims/radiology/masters/procedures-config/edit"
            },
            mapProduct: "/hims/radiology/masters/map-product"
        }
    }
}

export { routerPathNames }


