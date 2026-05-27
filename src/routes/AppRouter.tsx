import { Fragment, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Login from "../login/Login";
import MainLayout from "../main-layout/MainLayout";
import AuthGuard from "../auth-guard/AuthGuard";
import { routerPathNames } from "./routerPathNames";
import { routerBaseUrl } from "../himsConfig";
import { useSelector } from "react-redux";
import { RootState } from "../state/store";
import ChangePassword from "../login/Changepassword";
import SelectionArea from "../hims-info/SelectionArea";
import { SidebarProvider } from "../context/SidebarContext";
import MedicalRecordsLayout from "../medical-records/MedicalRecordsLayout";
import MedicalRecordsDashboard from "../medical-records/pages/Dashboard";
import PatientRegistration from "../medical-records/pages/registration/PatientRegistration";
import InpatientRegistration from "../medical-records/pages/inpatient/InpatientRegistration";
import BirthRegAdd from "../medical-records/pages/registration/BirthRegAdd";
import BirthRegEdit from "../medical-records/pages/registration/BirthRegEdit";
import DeathRegistration from "../medical-records/pages/registration/DeathRegistration";
import MLCregistration from "../medical-records/pages/registration/MLCregistration";
import ChangeDepartmentDoctor from "../medical-records/pages/registration/ChangeDepartmentDoctor";
import ChangeIpDepartmentDoctor from "../medical-records/pages/registration/ChangeIpDepartmentDoctor";
import AddCountry from "../medical-records/pages/master/country/AddCountry";
import AddState from "../medical-records/pages/master/state/addState";
import AddDistrict from "../medical-records/pages/master/district/AddDistrict";
import AddVillage from "../medical-records/pages/master/village/AddVillage";
import AddPost from "../medical-records/pages/master/post/AddPost";
import AddComplaint from "../medical-records/pages/master/complaint/AddComplaint";
import RefileOPCards from "../medical-records/pages/activities/refile/RefileOPCards";
import RoomBedTransfer from "../medical-records/pages/activities/transfer/RoomBedTransfer";
import CashCounterLayout from "../cash-counter/CashCounterLayout";
import CashCounterDashboard from "../cash-counter/pages/Dashboard";
import LaboratoryLayout from "../lab/LaboratoryLayout";
import LaboratoryDashboard from "../lab/pages/Dashboard";
import AddDepartment from "../lab/pages/masters/department/AddDepartment";
import Billing from "../cash-counter/pages/billing/Billing";
import OutPatientDateWise from "../cash-counter/pages/ReimbursementBills/OutPatientDateWise";
import OutPatientOpNoWise from "../cash-counter/pages/ReimbursementBills/OutPatientOpNoWise";
import Inpatient from "../cash-counter/pages/ReimbursementBills/Inpatient";
import PharmacySheet from "../cash-counter/pages/ReimbursementBills/PharmacySheet";
import CentralStoresLayout from "../central-stores/CentralStoresLayout";
import MedicalStoreDashboard from "../central-stores/pages/MedicalStoreDashboard";
import MedicalStoreDashboardHome from "../central-stores/pages/MedicalStoreDashboardHome";
import NonMedicalStoreDashboard from "../central-stores/pages/NonMedicalStoreDashboard";
import NonMedicalStoreDashboardHome from "../central-stores/pages/NonMedicalStoreDashboardHome";
import PharmacyStoresLayout from "../pharmacy-stores/PharmacyStoresLayout";
import PharmacyDashboard from "../pharmacy-stores/pages/PharmacyDashboard";
import PharmacyStoreDashboard from "../pharmacy-stores/pages/PharmacyStoreDashboard";
import PrepareOrder from "../central-stores/pages/medical-store/purchase/prepareOrder/PrepareOrder";
import ApproveOrder from "../central-stores/pages/medical-store/purchase/approveOrder/ApproveOrder";
import ViewOrder from "../central-stores/pages/medical-store/purchase/approveOrder/ViewOrder";
import SelectApprovedPO from "../central-stores/pages/medical-store/purchase/purchaseEntry/SelectApprovedPO";
import PurchaseEntry from "../central-stores/pages/medical-store/purchase/purchaseEntry/PurchaseEntry";
import PrepareTransfer from "../central-stores/pages/medical-store/transferOrder/PrepareTransfer";
import ApproveTransfer from "../central-stores/pages/medical-store/transferOrder/ApproveTransfer";
import PrepareConsumable from "../central-stores/pages/medical-store/consumableOrder/ConsumableOrder";
import ConsumableOrder from "../central-stores/pages/medical-store/consumableOrder/ConsumableOrder";
import ApproveConsumable from "../central-stores/pages/medical-store/consumableOrder/ApproveConsumable";
import GenericGroupMaster from "../central-stores/pages/medical-store/masters/generic-group/GenericGroupMaster";
import SubGenericGroupMaster from "../central-stores/pages/medical-store/masters/sub-generic-group/SubGenericGroupMaster";
import GenericDetailsMaster from "../central-stores/pages/medical-store/masters/generic-details/GenericDetailsMaster";
import MedicineItemMaster from "../central-stores/pages/medical-store/masters/medicine-item/MedicineItemMaster";
import ManufacturerMaster from "../central-stores/pages/medical-store/masters/manufacturer/ManufacturerMaster";
import BatchMaster from "../central-stores/pages/medical-store/masters/batch/BatchMaster";
import GroupMaster from "../central-stores/pages/non-medical-store/masters/group/GroupMaster";
import CompanyMaster from "../central-stores/pages/non-medical-store/masters/company/CompanyMaster";
import SupplierMaster from "../central-stores/pages/non-medical-store/masters/supplier/SupplierMaster";
import ProductMaster from "../central-stores/pages/non-medical-store/masters/product/ProductMaster";
import ProductProcedureMapping from "../central-stores/pages/non-medical-store/masters/product-procedure-mapping/ProductProcedureMapping";
import ConsumableCauseMaster from "../central-stores/pages/non-medical-store/masters/consumable-cause/ConsumableCauseMaster";
import PurchaseOrderStatus from "../central-stores/pages/medical-store/reports/PurchaseOrderStatus";
import ProductAndSupplier from "../central-stores/pages/medical-store/reports/ProductAndSupplier";
import SupplierGoodReceipt from "../central-stores/pages/medical-store/reports/supplierGoodReceipt";  
import SupplierDetails from "../central-stores/pages/medical-store/reports/SupplierDetalis";
import ExpiryDateWise from "../central-stores/pages/medical-store/reports/ExpiryDateWise";
import ExpiryBetweenDates from "../central-stores/pages/medical-store/reports/ExpiryBetweenDates";
import SupplierGoodaReceiptDates from "../central-stores/pages/medical-store/reports/SupplierGoodaReceiptDates";
import SupplierGoodaReceiptMonthly from "../central-stores/pages/medical-store/reports/SupplierGoodaReceiptMonthly";
import SupplierGoodaReceiptYearly from "../central-stores/pages/medical-store/reports/SupplierGoodaReceiptYearly";
import TransferDetails from "../central-stores/pages/medical-store/reports/TransferDetails";
import AllProductPurchaseReport from "../central-stores/pages/medical-store/reports/AllProductPurchaseReport";
import StockValue from "../central-stores/pages/medical-store/reports/StockValue";
import DiscountReport from "../central-stores/pages/medical-store/reports/DiscountReport";
import ScheduleMedicine from "../central-stores/pages/medical-store/reports/ScheduleMedicine";
import InitialStocks from "../central-stores/pages/medical-store/setup/InitialStocks";
import StockAdjustments from "../central-stores/pages/medical-store/setup/StockAdjustments";
import MinMaxOrder from "../central-stores/pages/medical-store/masters/minMax-order/minMaxOrder";
import FinancialAccountsLayout from "../financial-accounts/FinancialAccountsLayout";
import FinancialAccountsDashboard from "../financial-accounts/pages/FinancialAccountsDashboard";
import AccountHeadsAdd from "../financial-accounts/pages/setup/accounthead/AccountHeadsAdd";
import OpenBalance from "../financial-accounts/pages/transaction/openingbalance/OpenBalance";
import SystemAdminLayout from "../system-admin/SystemAdminLayout";
import SystemAdminDashboard from "../system-admin/pages/SystemAdminDashboard";
import CreateWard from "../system-admin/pages/records/ward/CreateWard";
import AddRoomsBeds from "../system-admin/pages/records/rooms-beds/AddRoomsBeds";
import CashType from "../system-admin/pages/records/cash-type/CashType";
import BankPaymentMode from "../system-admin/pages/records/bank-payment-mode/BankPaymentMode";
import BankDetails from "../system-admin/pages/records/bank-details/BankDetails";
import CreateUser from "../system-admin/pages/records/create-user/CreateUser";
import AddStore from "../system-admin/pages/records/configure-store/AddStore";
import Circular from "../system-admin/pages/activities/Circular";
import EmployeeManagementLayout from "../employee-management/EmployeeManagementLayout";
import EmployeeManagementDashboard from "../employee-management/pages/EmployeeManagementDashboard";
import PayrollManagementLayout from "../payroll-management/PayrollManagementLayout";
import PayrollManagementDashboard from "../payroll-management/pages/PayrollManagementDashboard";
// import AddConsultant from "../medical-records/pages/master/consultant/addConsultant";
import CancelBill from "../system-admin/pages/activities/cancel-bill/CancelBill";
import CancelBillView from "../system-admin/pages/activities/cancel-bill/CancelBillView";


import NewRepeatOPRegister from "../medical-records/pages/registers/NewRepeatOPRegister";
import OldOpRegisterRegular from "../medical-records/pages/registers/OldOpRegisterRegular";
import BirthRegister from "../medical-records/pages/registers/BirthRegister";
import RefiledIpCharts from "../medical-records/pages/registers/RefiledIpCharts";
import DeathRegister from "../medical-records/pages/registers/DeathRegister";
import MlcRegister from "../medical-records/pages/registers/MlcRegister";
import IpCensus from "../medical-records/pages/registers/IpCensus";
import BedOccupied from "../medical-records/pages/registers/BedOccupied";
import DeptWiseRegisters from "../medical-records/pages/registers/DeptWiseRegisters";
import IcdCodeRegister from "../medical-records/pages/registers/IcdCodeRegister";
import RefiledRecords from "../medical-records/pages/registers/RefiledRecords";
import Groups from "../cash-counter/pages/groups/Groups";
import Procedure from "../cash-counter/pages/procedure/Procedure";
import RegistrationCollection from "../cash-counter/pages/register/registrationCollection";
import AddAntibiotics from "../lab/pages/masters/antibiotic/AddAntibiotics";
import AddBacteria from "../lab/pages/masters/bacteria/AddBacteria";
import AddTest from "../lab/pages/masters/test/add/AddTest";
import AddSpecimen from "../lab/pages/masters/specimen/AddSpecimen";
import EditCompanyRates from "../lab/pages/masters/test/companyRates/EditCompanyRates";
import EditTestCost from "../lab/pages/masters/test/testCost/EditTestCost";

// pharmacy-stores

// pharmacy-stores
import BatchDetails from "../pharmacy-stores/pages/master/BatchDetails";
import SalesReturn from "../pharmacy-stores/pages/activities/sales-return/SalesReturn";
import PhTransferRegister from "../pharmacy-stores/pages/Registers/PhTransferRegister";
import PhTransferReceipts from "../pharmacy-stores/pages/Registers/PhTransferReceipts";
import PhDamagesRegister from "../pharmacy-stores/pages/Registers/PhDamagesRegister";
import PhSalesRegister from "../pharmacy-stores/pages/Registers/sales-register/PhSalesRegister";
import PhSalesReturnRegister from "../pharmacy-stores/pages/Registers/sales-register/PhSalesReturnRegister";
import PhPrescriptionRegister from "../pharmacy-stores/pages/Registers/PhPrescriptionRegister";
import PhRequestRegister from "../pharmacy-stores/pages/Registers/PhRequestRegister";
import PhTotalSalesMrp from "../pharmacy-stores/pages/Registers/PhTotalSalesMrp";
import PhTotalSalesCp from "../pharmacy-stores/pages/Registers/PhTotalSalesCp";
import PhBillRegister from "../pharmacy-stores/pages/Registers/PhBillRegister";
import PhStockTaxWise from "../pharmacy-stores/pages/Registers/PhStockTaxWise";
import PhWardWiseBillRegister from "../pharmacy-stores/pages/Registers/PhWardWiseBillRegister";
import PhTakt4SalseRegister from "../pharmacy-stores/pages/Registers/PhTakt4SalseRegister";
import PhMinimumReorder from "../pharmacy-stores/pages/Registers/PhMinimumReorder";

import AllStockRegister from "../central-stores/pages/medical-store/registers/stockRegister/AllStockRegister";
import TransferRegister from "../central-stores/pages/medical-store/registers/TransferRegister";
import TransferReceipts from "../central-stores/pages/medical-store/registers/TransferReceipts";
import ConsumableRegister from "../central-stores/pages/medical-store/registers/ConsumableRegister";
import GoodsReceiptsRegister from "../central-stores/pages/medical-store/registers/goodsRecipt/GoodsReceiptsRegister";
import GoodsReturnRegister from "../central-stores/pages/medical-store/registers/GoodsReturnRegister";
import Damages from "../central-stores/pages/medical-store/registers/Damages";
import Request from "../central-stores/pages/medical-store/registers/Request";
import MedWiseSupplier from "../central-stores/pages/medical-store/registers/MedWiseSupplier";
import Annexure1Purchase from "../central-stores/pages/medical-store/registers/Annexure1Purchase";
import Annexure2Sale from "../central-stores/pages/medical-store/registers/Annexure2Sale";
import SupplierWiseGoods from "../central-stores/pages/medical-store/registers/SupplierWiseGoods";
import PurchaseRegister from "../central-stores/pages/medical-store/registers/PurchaseRegister";
import StockDetails from "../central-stores/pages/medical-store/registers/StockDetails";
import OpeningStock from "../central-stores/pages/medical-store/registers/OpeningStock";
import PurchaseReorder from "../central-stores/pages/medical-store/registers/PurchaseReorder";
import BatchWiseStock from "../central-stores/pages/medical-store/registers/BatchWiseStock";
import MedicineTransaction from "../central-stores/pages/medical-store/registers/MedicineTransaction";
import InitialStockAdjustment from "../central-stores/pages/medical-store/registers/InitialStockAdjustment";
import StockAdjustmentReport from "../central-stores/pages/medical-store/registers/StockAdjustmentReport";
import IndividualTransferRegister from "../central-stores/pages/medical-store/registers/IndividualTransferRegister";
import TransferConsumableRegister from "../central-stores/pages/medical-store/registers/TransferConsumableRegister";
import MedicineTransactionAllStore from "../central-stores/pages/medical-store/registers/MedicineTransactionAllStore";
import CancelledPO from "../central-stores/pages/medical-store/registers/CancelledPO";
import SelectSupplierDate from "../central-stores/pages/medical-store/return/goodsReturn/SelectSupplierDate";
import GoodsReturnPrep from "../central-stores/pages/medical-store/return/goodsReturn/GoodsReturnPrep";
import GoodsReturnApproval from "../central-stores/pages/medical-store/return/goodsReturn/GoodsReturnApproval";
import CultureTemplate from "../lab/pages/masters/test/cultureTestMaping/cultureTemplate";
import AddTemplate from "../lab/pages/masters/test/testTemplate/AddTemplate";
import PacsLayout from "../pacs/PacsLayout";
import PacsDashboard from "../pacs/pages/PacsDashboard";
import DicomViewer from "../pacs/pages/DicomViewer";
import DicomWeb from "../pacs/pages/DicomWeb";
import CategoryAdd from "../employee-management/pages/master/category/CategoryAdd";
import DepartmentAdd from "../employee-management/pages/master/department/departmentAdd";
import PositionAdd from "../employee-management/pages/master/position/positionAdd";
import SalaryHead from "../employee-management/pages/master/salaryHead/salaryHead";
import UnitAdd from "../employee-management/pages/master/unit/unitAdd";
import DivisionAdd from "../employee-management/pages/master/division/divisionAdd";
import AddEmployee from "../employee-management/pages/recruitment/addEmployee";
// import Department from "../medical-records/pages/master/department/department";
import LabWorkflow from "../lab/pages/activities/lab-entry/LabWorkflow";
import IPRegister from "../medical-records/pages/registers/IPRegister";
import DischargeRegister from "../medical-records/pages/registers/DischargeRegister";
import BedTransferRegister from "../medical-records/pages/registers/BedTransferRegister";
import YearwiseAllDetailsReport from "../medical-records/pages/reports/YearwiseAllDetailsReport";
import DoctorWiseRegistrationsReport from "../medical-records/pages/reports/DoctorWiseRegistrationsReport";
import DeathReport from "../medical-records/pages/reports/DeathReport";
import ResultWiseList from "../medical-records/pages/reports/ResultWiseList";
import BirthReport from "../medical-records/pages/reports/BirthReport";
import DayWise from "../medical-records/pages/reports/DayWise";
import Comparison from "../medical-records/pages/reports/Comparison";
import Graph from "../medical-records/pages/reports/Graph";
import MlcPatientList from "../medical-records/pages/reports/MlcPatientList";
import MlcRegtdPatientList from "../medical-records/pages/reports/MlcRegtdPatientList";
import UserWiseWorkDetails from "../medical-records/pages/reports/UserWiseWorkDetails";
import DiagnosisWiseList from "../medical-records/pages/reports/DiagnosisWiseList"; 
import CancerPatientsList from "../medical-records/pages/reports/CancerPatientsList";
import IpOccupancy from "../medical-records/pages/reports/IpOccupancy";
import CategorywiseIpReport from "../medical-records/pages/reports/CategorywiseIpReport";
import IcdWiseReport from "../medical-records/pages/reports/IcdWiseReport";
import IcdCodeWiseReport from "../medical-records/pages/reports/IcdCodeWiseReport";
import DeathGenderwise from "../medical-records/pages/reports/DeathGenderwise";
import DeathAgeTypeWise from "../medical-records/pages/reports/DeathAgeTypeWise";
import UnrefilledIpCharts from "../medical-records/pages/reports/UnrefilledIpCharts";
import PatientVisitDetails from "../medical-records/pages/reports/PatientVisitDetails";
import ProcedureWiseList from "../medical-records/pages/reports/ProcedureWiseList";
import PatientsAllVisit from "../medical-records/pages/reports/PatientsAllVisit";
import WeeklyReport from "../medical-records/pages/reports/WeeklyReport";
import MonthWiseReport from "../medical-records/pages/reports/MonthWiseReport";
import VillageWiseList from "../medical-records/pages/reports/VillageWiseList";
import DoctorwiseOpReport from "../medical-records/pages/reports/DoctorwiseOpReport";
import BedOccupancyReport from "../medical-records/pages/reports/BedOccupancyReport";

import RegistrationCollectionRegister from "../medical-records/pages/registers/RegistrationCollectionRegister";
import DoctorTransferRegister from "../medical-records/pages/registers/DoctorTransferRegister";

import InvestigationCollection from "../cash-counter/pages/register/investigationCollection";
// import IpCollection from "../cash-counter/pages/register/ipCollection";
import PharmacyCollection from "../cash-counter/pages/register/pharmacyCollection";
import LabCollection from "../cash-counter/pages/register/labCollection";
import DueCollection from "../cash-counter/pages/register/dueCollection";
import IpAdvanceCollection from "../cash-counter/pages/register/ipAdvanceCollection";
import DueRegister from "../cash-counter/pages/register/dueRegister";
import CharityRegister from "../cash-counter/pages/register/charityRegister";
import CashHandOverDetails from "../cash-counter/pages/register/cashHandOverDetails";
import CompanyWisePayable from "../cash-counter/pages/register/companyWisePayable";
import UserDayEnd from "../cash-counter/pages/reports/AccountCollection/UserDayEnd/UserDayEnd";
import DayEnd from "../cash-counter/pages/reports/DayEnd";
import PendingDue from "../cash-counter/pages/reports/PendingDue";
import ViewChart from "../cash-counter/pages/activities/ViewChart";
import IpCollection from "../cash-counter/pages/activities/IpCollection";
import DuplicateBill from "../cash-counter/pages/activities/DuplicateBill";
import DuplicateBillView from "../cash-counter/pages/activities/DuplicateBillView";
import UpdateDue from "../cash-counter/pages/register/dueCollection";
import UpdateDueCollection from "../cash-counter/pages/activities/DueCollection/updatedueCollection";
import PendingAdv from "../cash-counter/pages/reports/PendingAdv";
import PendingAdvance from "../cash-counter/pages/reports/PendingAdvance";
import PreviousBillsPrint from "../cash-counter/pages/reports/PreviousBillsPrint";
import DayCloser from "../cash-counter/pages/reports/DayCloser";
import IpDischarge from "../cash-counter/pages/reports/IpDischarge";
import SystemAdminDepartment from "../system-admin/pages/records/department/department";
import SystemAdminConsultant from "../system-admin/pages/records/consultant/addConsultant";
import AddResetPassword from "../system-admin/pages/records/resetPassword/AddResetPassword";
import SystemRole from "../system-admin/pages/records/Role/systemRole";
import TransactionEntry from "../financial-accounts/pages/transaction/entry/TransactionEntry";
import SearchPage1 from "../lab/pages/activities/result-re-edit/SearchPage1";
import SearchPage2 from "../lab/pages/activities/duplicate-result/SearchPage2";

import RadiologyLayout from "../radiology/RadiologyLayout";
import RadiologyDashboard from "../radiology/pages/Dashboard";
import InvFilmMaster from "../radiology/pages/masters/inv-film/InvFilmMaster";
import RadiologyGroupMaster from "../radiology/pages/masters/group/GroupMaster";
import RadiologyCompanyMaster from "../radiology/pages/masters/company/CompanyMaster";
import RadiologySupplierMaster from "../radiology/pages/masters/supplier/SupplierMaster";
import SupplierMapping from "../radiology/pages/masters/supplier/SupplierMapping";
import MaterialCodeMaster from "../radiology/pages/masters/material-code/MaterialCodeMaster";
import InitialStock from "../radiology/pages/masters/initial-stock/InitialStock";
import MaterialCodeDetails from "../radiology/pages/masters/initial-stock/MaterialCodeDetails";
import ProductProperties from "../radiology/pages/masters/product-properties/ProductProperties";
import ProductPropertiesDetails from "../radiology/pages/masters/product-properties/ProductPropertiesDetails";
import StockAdjustment from "../radiology/pages/masters/stock-adjustment/StockAdjustment";
import StockAdjustmentMaterialCodeDetails from "../radiology/pages/masters/stock-adjustment/MaterialCodeDetails";
import GroupsConfig from "../radiology/pages/masters/groups-config/GroupsConfig";
import ProceduresConfig from "../radiology/pages/masters/procedures-config/ProceduresConfig";
import MapProduct from "../radiology/pages/masters/map-product/MapProduct";
import PrepareOrders from "../radiology/pages/purchase-orders/PrepareOrders";
import POApproval from "../radiology/pages/purchase-orders/POApproval";
import ClosePO from "../radiology/pages/purchase-orders/ClosePO";
import POPrint from "../radiology/pages/purchase-orders/POPrint";
import GRNotePreparation from "../radiology/pages/purchase-orders/GRNotePreparation";
import GRNoteApproval from "../radiology/pages/purchase-orders/GRNoteApproval";
import GoodsReceipts from "../radiology/pages/purchase-orders/GoodsReceipts";
import Discharge from "../medical-records/pages/activities/discharge/Discharge";
import MaternitySummary from "../medical-records/pages/activities/dischargeSummary/MaternitySummary";
import GeneralSummary from "../medical-records/pages/activities/dischargeSummary/GeneralSummary";
import CompanyUpdation from "../medical-records/pages/activities/companyUpdation/companyUpdation";
import BlockUhid from "../medical-records/pages/activities/blockUhid/BlockUhid";
import DisSummaryPrint from "../medical-records/pages/activities/DisSummaryPrint/DisSummaryPrint";
import ActiveIp from "../medical-records/pages/Statistics/ActiveIp";
import MrdCollections from "../medical-records/pages/Statistics/MrdCollections";
import DoctorWiseOp from "../medical-records/pages/Statistics/DoctorWiseOp";
import GenderDeptWise from "../medical-records/pages/Statistics/GenderDeptWise";
import CashCollections from "../medical-records/pages/Statistics/CashCollections";
import OpStatistics from "../medical-records/pages/Statistics/OpStatistics";
import TotalWard from "../medical-records/pages/Statistics/TotalWard";
import GenderwiseWard from "../medical-records/pages/Statistics/GenderwiseWard";
import DepartmentWiseBetweenDatesAndTime from "../medical-records/pages/Statistics/DepartmentWiseBetweenDatesAndTime";
import PrepareUsageNote from "../radiology/pages/activities/PrepareUsageNote";
import ApproveNote from "../radiology/pages/activities/ApproveNote";
import GRNDetails from "../radiology/pages/registers/GRNDetails";
import ReturnDetails from "../radiology/pages/registers/ReturnDetails";
import UsageRegister from "../radiology/pages/registers/UsageRegister";
import GoodsReceiptProductWise from "../radiology/pages/registers/GoodsReceiptProductWise";
import GroupWiseGoodsReceipt from "../radiology/pages/registers/GroupWiseGoodsReceipt";
import InvestigationRegister from "../radiology/pages/registers/InvestigationRegister";
import InvFilmFlow from "../radiology/pages/reports/InvFilmFlow";
import ExpiryCheck from "../radiology/pages/reports/ExpiryCheck";
import GroupWiseReport from "../radiology/pages/reports/GroupWiseReport";
import StockReport from "../radiology/pages/reports/StockReport";
import GroupWiseCollection from "../radiology/pages/reports/GroupWiseCollection";
import GroupWiseCollectionDetails from "../radiology/pages/reports/GroupWiseCollectionDetails";
import ScanReports from "../radiology/pages/reports/ScanReports";
import ScanReportCancel from "../radiology/pages/reports/ScanReportCancel";
import AngiogramReport from "../radiology/pages/reports/AngiogramReport";
import BilledPatientList from "../pharmacy-stores/pages/activities/dispense-drug/BilledPatientList";
import ReadyPatientList from "../pharmacy-stores/pages/activities/dispense-drug/ReadyPatientList";
import TestList from "../lab/pages/reports/testMaster/TestList";
import RegisterSearch from "../lab/pages/reports/labRegister/RegisterSearch";
import ResultReEditSearch from "../lab/pages/reports/resultReEdit/ResultReEditSearch";
import { BillingRedesigned } from "../cash-counter/pages/billing-sample";
import CompanyReceivables from "../cash-counter/pages/activities/company-receivables/CompanyReceivables";

import ChangeCreditBillToCompany from "../cash-counter/pages/activities/change-credit-bill/ChangeCreditBillToCompany";
import ChangeCompanyToCreditBill from "../cash-counter/pages/activities/change-company-to-credit-bill/ChangeCompanyToCreditBill";
import ChangeCompanyToCompany from "../cash-counter/pages/activities/change-company-to-company/ChangeCompanyToCompany";
// import Comparison from "../medical-records/pages/registers/Comparison";
import IcdEntry from "../medical-records/pages/activities/icd-entry/IcdEntry";
import VisitCheck from "../medical-records/pages/activities/visitCheck/VisitCheck";
import Medicines from "../central-stores/pages/medical-store/reports/Medicines";
import ViewStockList from "../central-stores/pages/medical-store/reports/ViewStockList"; 
import Company from "../central-stores/pages/medical-store/reports/Company";
import Supplier from "../central-stores/pages/medical-store/reports/Supplier";
import SupwiseGoodsReceipt from "../central-stores/pages/medical-store/reports/SupwiseGoodsReceipt";
import ExpiryCheckDetails from "../central-stores/pages/medical-store/reports/ExpiryCheckDetails";
import SupwiseWiseTotal from "../central-stores/pages/medical-store/reports/SupwiseWiseTotal";
import MedicineDetails from "../central-stores/pages/medical-store/reports/MedicineDetails";
import MedicineLocationStock from "../central-stores/pages/medical-store/reports/MedicineLocationStock";
import CostWiseMedicine from "../central-stores/pages/medical-store/reports/costWiseMedicine";
import PriceDetailsReports from "../central-stores/pages/medical-store/reports/PriceDetailsReports";
import StockReorderLevel from "../central-stores/pages/medical-store/reports/StockReorderLevel";
import StockProfitDetails from "../central-stores/pages/medical-store/reports/StockProfitDetails";
import MonthlyConsumption from "../central-stores/pages/medical-store/reports/monthlyConsumption";
import PurchaseOrderStatusMed from "../central-stores/pages/medical-store/reports/PurchaseOrderStatusMed";


import Diagnosis from "../pharmacy-stores/pages/Reports/Diagnosis";
import WaitingOrders from "../pharmacy-stores/pages/Reports/waitingOrders";
import CancelOrder from "../cash-counter/pages/billing/CancelOrder";
import PhDuplicateBill from "../pharmacy-stores/pages/Reports/phDuplicateBill";
import MedicineWiseSales from "../pharmacy-stores/pages/Reports/medicineWiseSales";
import ScheduledMedicineSale from "../pharmacy-stores/pages/Reports/ScheduledMedicineSale";
import CategoryWiseMedicine from "../pharmacy-stores/pages/Reports/CategoryWiseMedicine";
import SalesCollectionAmount from "../pharmacy-stores/pages/Reports/salesCollectionamount";
import SalesStatus from "../pharmacy-stores/pages/Reports/SalesStatus";
import IpPharmacyBills from "../pharmacy-stores/pages/Reports/ipPharmacyBills";
import CompanyDueBills from "../pharmacy-stores/pages/Reports/CompanyDueBills";
import CompanyReturnBills from "../pharmacy-stores/pages/Reports/CompanyReturnBills";
import DailySalesTransfer from "../pharmacy-stores/pages/Reports/DailySalesTransfer";
import PharmacyExpiryCheck from "../pharmacy-stores/pages/Reports/ExpiryCheck";
import CompanyNameMaster from "../central-stores/pages/medical-store/masters/company/CompanyNameMaster";

import PhGstrDetails from "../central-stores/pages/medical-store/GstrDetails/PhGstrDetails";





// import ChangeCreditBillToCompany from "../cash-counter/pages/activities/change-credit-bill/ChangeCreditBillToCompany";
// import Comparison from "../medical-records/pages/registers/Comparison";import AdvanceRefund from "../cash-counter/pages/reports/AdvanceRefund";
import DueCollections from "../cash-counter/pages/reports/DueCollections";
import CashWaitingOrder from "../cash-counter/pages/reports/WaitingOrders";
import TotalCollections from "../cash-counter/pages/reports/TotalCollections";
import AllDuplicateBills from "../cash-counter/pages/reports/AllDuplicateBills";
import DiscountBillDetails from "../cash-counter/pages/reports/DiscountBillDetails";
import PharmacyCreditBills from "../cash-counter/pages/reports/PharmacyCreditBills";
import DoctorsRegCollection from "../cash-counter/pages/reports/DoctorsRegCollection";
import DepartmentCollection from "../cash-counter/pages/reports/DepartmentCollection";
import DoctorsCollection from "../cash-counter/pages/reports/DoctorsCollection";
import PhDiscountCollection from "../cash-counter/pages/reports/PhDiscountCollection";
import IpBills from "../cash-counter/pages/reports/IpReport/IpBills";
import AccInvestigationCollection from "../cash-counter/pages/reports/AccountCollection/InvestigationReport/AccInvestigationCollection";
import AccPharmacyCollection from "../cash-counter/pages/reports/AccountCollection/PharmacyReport/AccPharmacyCollection";
import AccLabCollection from "../cash-counter/pages/reports/AccountCollection/LabReport/AccLabCollection";
import AccCompanyReceipt from "../cash-counter/pages/reports/AccCompanyReceipt";
import AccUserWiseCollection from "../cash-counter/pages/reports/AccUserWiseCollection";
import AdvanceRefund from "../cash-counter/pages/reports/AccountCollection/AdvanceReport/AdvanceRefund";
import IpFinalBillEdit from "../cash-counter/pages/activities/EditIpFinalBill/IpFinalBillEdit";
import PhUserDayEnd from "../cash-counter/pages/reports/AccountCollection/UserDayEnd/PhUserDayEnd";
import ExceptPhUserDayEnd from "../cash-counter/pages/reports/AccountCollection/UserDayEnd/ExceptPhUserDayEnd";
import Gstr3B from "../central-stores/pages/medical-store/reports/gstr/Gstr3B";
import BillWiseSales from "../central-stores/pages/medical-store/reports/gstr/BillWiseSales";
import BillWiseSalesReturn from "../central-stores/pages/medical-store/reports/gstr/BillWiseSalesReturn";
import PhMedWiseSalesRegister from "../pharmacy-stores/pages/Registers/sales-register/PhMedWiseSalesRegister";
import ExamptedSales from "../central-stores/pages/medical-store/reports/gstr/ExamptedSales";
import RegistrationReport from "../cash-counter/pages/reports/AccountCollection/RegistrationReport/RegistrationReport";
import SeparateReturn from "../central-stores/pages/medical-store/reports/gstr/gstrConsolidate/separateReturn";
import Return from "../central-stores/pages/medical-store/reports/gstr/gstrConsolidate/return";
import SeparateSales from "../central-stores/pages/medical-store/reports/gstr/gstrConsolidate/separateSales";
import Sales from "../central-stores/pages/medical-store/reports/gstr/gstrConsolidate/sales";
import Annexure1 from "../central-stores/pages/medical-store/reports/gstr/HsnWiseGst/Annexure1";
import HsnSales from "../central-stores/pages/medical-store/reports/gstr/HsnWiseGst/HsnSales";
import HsnSalesReturn from "../central-stores/pages/medical-store/reports/gstr/HsnWiseGst/HsnSalesReturn";
import Purchase from "../central-stores/pages/medical-store/reports/gstr/HsnWiseGst/purchase";
import PurchaseReturn from "../central-stores/pages/medical-store/reports/gstr/HsnWiseGst/purchaseReturn";
import CreatePackage from "../cash-counter/pages/master/package/CreatePackage";
import CompanyHead from "../cash-counter/pages/master/company-head/CompanyHead";
import Entry from "../radiology/pages/entry/entry/Entry";
import AfterDischarge from "../medical-records/pages/activities/afterDischarge/AfterDischarge";

interface AppRouterProps {
  inactivitySecondsRemaining: number;
}

const AppRouter = ({ inactivitySecondsRemaining }: AppRouterProps) => {

  return <>
    <Fragment>
      <Router basename={routerBaseUrl}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route index path="/login" element={<Login />} />
          <Route path="/hims" element={<SidebarProvider><MainLayout inactivitySecondsRemaining={inactivitySecondsRemaining} /></SidebarProvider>}>
            <Route path={routerPathNames.hims.changePassword} element={<AuthGuard component={<ChangePassword/>} />}></Route>
            <Route path={routerPathNames.hims.dashboard} element={<AuthGuard component={<SelectionArea />} />} />
            
            {/* Medical Records Module - Nested inside MainLayout */}
            <Route path={routerPathNames.medicalRecords.base} element={<AuthGuard component={<MedicalRecordsLayout />} />}>
              <Route index element={<MedicalRecordsDashboard />} />
              <Route path={routerPathNames.medicalRecords.registration.patient} element={<PatientRegistration />} />
              <Route path={routerPathNames.medicalRecords.registration.inpatient} element={<InpatientRegistration />} />
              <Route path={routerPathNames.medicalRecords.registration.birth.add} element={<BirthRegAdd />} />
              <Route path={routerPathNames.medicalRecords.registration.birth.edit} element={<BirthRegEdit />} />
              <Route path={routerPathNames.medicalRecords.registration.death} element={<DeathRegistration />} />
              <Route path={routerPathNames.medicalRecords.registration.mlc} element={<MLCregistration />} />
              <Route path={routerPathNames.medicalRecords.registration.changeDepartmentDoctor} element={<ChangeDepartmentDoctor />} />
              <Route path={routerPathNames.medicalRecords.registration.changeIpDepartmentDoctor} element={<ChangeIpDepartmentDoctor />} />

              <Route path={routerPathNames.medicalRecords.masters.country.add} element={<AddCountry />} />
              <Route path={routerPathNames.medicalRecords.masters.state.add} element={<AddState />} />
              <Route path={routerPathNames.medicalRecords.masters.district.add} element={<AddDistrict />} />
              <Route path={routerPathNames.medicalRecords.masters.village.add} element={<AddVillage />} />
              <Route path={routerPathNames.medicalRecords.masters.post.add} element={<AddPost />} />
              <Route path={routerPathNames.medicalRecords.masters.complaint.add} element={<AddComplaint />} />

              <Route path={routerPathNames.medicalRecords.activities.refileOpCards} element={<RefileOPCards />} />
              <Route path={routerPathNames.medicalRecords.activities.roomBedTransfer} element={<RoomBedTransfer />} />
              <Route path={routerPathNames.medicalRecords.activities.discharge} element={<Discharge />} />
              <Route path={routerPathNames.medicalRecords.activities.MaternitySummary} element={<MaternitySummary />} />
              <Route path={routerPathNames.medicalRecords.activities.GeneralSummary} element={<GeneralSummary />} />
              <Route path={routerPathNames.medicalRecords.activities.companyUpdation} element={<CompanyUpdation />} />
              <Route path={routerPathNames.medicalRecords.activities.blockUhid} element={<BlockUhid />} />
              <Route path={routerPathNames.medicalRecords.activities.dischargePrint} element={<DisSummaryPrint />} />
              <Route path={routerPathNames.medicalRecords.activities.icdEntry} element={<IcdEntry />} />
              <Route path={routerPathNames.medicalRecords.activities.visitCheck} element={<VisitCheck />} />
              <Route path={routerPathNames.medicalRecords.activities.afterDischarge} element={<AfterDischarge />} />

              <Route path={routerPathNames.medicalRecords.statistics.activeIp} element={<ActiveIp />} />
              <Route path={routerPathNames.medicalRecords.statistics.mrdCollections} element={<MrdCollections />} />
              <Route path={routerPathNames.medicalRecords.statistics.doctorWise} element={<DoctorWiseOp />} />
              <Route path={routerPathNames.medicalRecords.statistics.genderDept} element={<GenderDeptWise />} />
              <Route path={routerPathNames.medicalRecords.statistics.cashCollections} element={<CashCollections />} />
              <Route path={routerPathNames.medicalRecords.statistics.opStatistics} element={<OpStatistics />} />
              <Route path={routerPathNames.medicalRecords.statistics.genderwiseWard} element={<GenderwiseWard />} />
              <Route path={routerPathNames.medicalRecords.statistics.totalWard} element={<TotalWard />} />
              <Route path={routerPathNames.medicalRecords.statistics.betweenDatesAndTime} element={<DepartmentWiseBetweenDatesAndTime />} />

              {/* <Route path={routerPathNames.medicalRecords.masters.consultant.add} element={<AuthGuard component={<AddConsultant />} />} /> */}


              <Route path={routerPathNames.medicalRecords.registers.op} element={<NewRepeatOPRegister />} />
              <Route path={routerPathNames.medicalRecords.registers.oldOpRegular} element={<OldOpRegisterRegular />} />
              <Route path={routerPathNames.medicalRecords.registers.birth} element={<BirthRegister />} />
              <Route path={routerPathNames.medicalRecords.registers.death} element={<DeathRegister />} />
              <Route path={routerPathNames.medicalRecords.registers.mlc} element={<MlcRegister />} />
              <Route path={routerPathNames.medicalRecords.registers.ipCensus} element={<IpCensus />} />
              <Route path={routerPathNames.medicalRecords.registers.bedOccupied} element={<BedOccupied />} />
              <Route path={routerPathNames.medicalRecords.registers.deptWise} element={<DeptWiseRegisters />} />
              <Route path={routerPathNames.medicalRecords.registers.icdCode} element={<IcdCodeRegister />} />
              <Route path={routerPathNames.medicalRecords.registers.refiledIpCharts} element={<RefiledIpCharts />} />
              <Route path={routerPathNames.medicalRecords.registers.refiled} element={<RefiledRecords />} />
              <Route path={routerPathNames.medicalRecords.registers.ip} element={<IPRegister />} />
              <Route path={routerPathNames.medicalRecords.registers.discharge} element={<DischargeRegister />} />
              <Route path={routerPathNames.medicalRecords.registers.bedTransfer} element={<BedTransferRegister />} />
              <Route path={routerPathNames.medicalRecords.registers.doctorTransfer} element={<DoctorTransferRegister />} />

              <Route path={routerPathNames.medicalRecords.reports.yearwise} element={<YearwiseAllDetailsReport />} />
              <Route path={routerPathNames.medicalRecords.reports.doctorWise} element={<DoctorWiseRegistrationsReport />} />
              <Route path={routerPathNames.medicalRecords.reports.patientVisitDetails} element={<PatientVisitDetails />} />
              <Route path={routerPathNames.medicalRecords.reports.procedureWiseList} element={<ProcedureWiseList />} />
              <Route path={routerPathNames.medicalRecords.reports.patientsAllVisit} element={<PatientsAllVisit />} />
              <Route path={routerPathNames.medicalRecords.reports.death} element={<DeathReport />} />
              <Route path={routerPathNames.medicalRecords.reports.resultWiseList} element={<ResultWiseList />} />
              <Route path={routerPathNames.medicalRecords.reports.birth} element={<BirthReport />} />
              <Route path={routerPathNames.medicalRecords.reports.dayWise} element={<DayWise />} />
              <Route path={routerPathNames.medicalRecords.reports.comparison} element={<Comparison />} />
              <Route path={routerPathNames.medicalRecords.reports.graph} element={<Graph />} />
              <Route path={routerPathNames.medicalRecords.reports.userWiseWorkDetails} element={<UserWiseWorkDetails />} />
              <Route path={routerPathNames.medicalRecords.reports.diagnosisWiseList} element={<DiagnosisWiseList />} />
              <Route path={routerPathNames.medicalRecords.reports.cancerPatientsList} element={<CancerPatientsList />} />
              <Route path={routerPathNames.medicalRecords.reports.ipOccupancy} element={<IpOccupancy />} />
              <Route path={routerPathNames.medicalRecords.reports.categorywiseIp} element={<CategorywiseIpReport />} />
              <Route path={routerPathNames.medicalRecords.reports.icdWise} element={<IcdWiseReport />} />
              <Route path={routerPathNames.medicalRecords.reports.icdCodeWise} element={<IcdCodeWiseReport />} />
              <Route path={routerPathNames.medicalRecords.reports.mlcPatientList} element={<MlcPatientList />} />
              <Route path={routerPathNames.medicalRecords.reports.mlcRegtdPatientList} element={<MlcRegtdPatientList />} />
              <Route path={routerPathNames.medicalRecords.reports.deathGenderwise} element={<DeathGenderwise />} />
              <Route path={routerPathNames.medicalRecords.reports.deathAgeTypeWise} element={<DeathAgeTypeWise />} />
              <Route path={routerPathNames.medicalRecords.reports.unrefilledIpCharts} element={<UnrefilledIpCharts />} />
              <Route path={routerPathNames.medicalRecords.reports.weekly} element={<WeeklyReport />} />
              <Route path={routerPathNames.medicalRecords.reports.monthWise} element={<MonthWiseReport />} />

              <Route path={routerPathNames.medicalRecords.reports.comparison} element={<Comparison />} />


              <Route path={routerPathNames.medicalRecords.reports.comparison} element={<Comparison />} />


              <Route path={routerPathNames.medicalRecords.reports.villageWiseList} element={<VillageWiseList />} />
              <Route path={routerPathNames.medicalRecords.reports.doctorwiseOp} element={<DoctorwiseOpReport />} />
              <Route path={routerPathNames.medicalRecords.reports.bedOccupancyReport} element={<BedOccupancyReport />} />


              <Route path={routerPathNames.medicalRecords.registers.op} element={<NewRepeatOPRegister />} />
              {/* <Route path={routerPathNames.medicalRecords.masters.department.add} element={<AuthGuard component={<Department />} />} /> */}

              {/* Add more medical records routes here as needed */}
            </Route>
            {/* Cash Counter (Billing) Module - Nested inside MainLayout */}
            <Route path={routerPathNames.cashCounter.base} element={<AuthGuard component={<CashCounterLayout />} />}>
              <Route index element={<CashCounterDashboard />} />
              <Route path={routerPathNames.cashCounter.billing.opBilling} element={<BillingRedesigned />} />
              <Route path={routerPathNames.cashCounter.activities.viewChart} element={<ViewChart />} />
              <Route path={routerPathNames.cashCounter.activities.ipCollection} element={<IpCollection />} />
              <Route path={routerPathNames.cashCounter.activities.ipFinalBillEdit} element={<IpFinalBillEdit />} />
              <Route path={routerPathNames.cashCounter.activities.duplicateBill} element={<DuplicateBill />} />
              <Route path={routerPathNames.cashCounter.activities.duplicateBillView} element={<DuplicateBillView />} />
              <Route path={routerPathNames.cashCounter.masters.investigationGroups} element={<Groups />} />
              <Route path={routerPathNames.cashCounter.masters.procedures} element={<Procedure />} />
              <Route path={routerPathNames.cashCounter.masters.packages} element={<CreatePackage />} />
              <Route path={routerPathNames.cashCounter.registers.registrationCollection} element={<RegistrationCollection />} />
              <Route path={routerPathNames.cashCounter.masters.companyHead} element={<CompanyHead />} />
              <Route path={routerPathNames.cashCounter.registers.investigationCollection} element={<InvestigationCollection />} />
              <Route path={routerPathNames.cashCounter.registers.ipCollection} element={<IpCollection />} />
              <Route path={routerPathNames.cashCounter.registers.pharmacyCollection} element={<PharmacyCollection />} />
              <Route path={routerPathNames.cashCounter.registers.labCollection} element={<LabCollection />} />
              <Route path={routerPathNames.cashCounter.registers.dueCollection} element={<DueCollection />} />
              <Route path={routerPathNames.cashCounter.registers.ipAdvanceCollection} element={<IpAdvanceCollection />} />
              <Route path={routerPathNames.cashCounter.registers.dueRegister} element={<DueRegister />} />
              <Route path={routerPathNames.cashCounter.registers.charityRegister} element={<CharityRegister />} />
              <Route path={routerPathNames.cashCounter.registers.cashHandOverDetails} element={<CashHandOverDetails />} />
              <Route path={routerPathNames.cashCounter.registers.companyWisePayable} element={<CompanyWisePayable />} />
              <Route path={routerPathNames.cashCounter.activities.companyReceivables.receivables} element={<CompanyReceivables />} />
              <Route path={routerPathNames.cashCounter.activities.companyReceivables.changeCreditBillToCompany} element={<ChangeCreditBillToCompany />} />
              <Route path={routerPathNames.cashCounter.activities.companyReceivables.changeCompanyToCreditBill} element={<ChangeCompanyToCreditBill />} />
              <Route path={routerPathNames.cashCounter.activities.companyReceivables.changeCompanyToCompany} element={<ChangeCompanyToCompany />} />
              <Route path={routerPathNames.cashCounter.activities.updateDue} element={<UpdateDueCollection />} />
              <Route path={routerPathNames.cashCounter.billing.CancelOrder} element={<CancelOrder />} />
              <Route path={routerPathNames.cashCounter.reimbursementBills.outPatientDateWise} element={<OutPatientDateWise />} />
              <Route path={routerPathNames.cashCounter.reimbursementBills.outPatientOpNoWise} element={<OutPatientOpNoWise />} />
              <Route path={routerPathNames.cashCounter.reimbursementBills.inPatient} element={<Inpatient />} />
              <Route path={routerPathNames.cashCounter.reimbursementBills.pharmacySheet} element={<PharmacySheet />} />
              
              {/* Cash Counter Reports */}
              <Route path={routerPathNames.cashCounter.reports.userDayEnd} element={<UserDayEnd />} />
              <Route path={routerPathNames.cashCounter.reports.dayEnd} element={<DayEnd />} />
              <Route path={routerPathNames.cashCounter.reports.pendingDue} element={<PendingDue />} />
              <Route path={routerPathNames.cashCounter.reports.pendingAdv} element={<PendingAdv />} />
              <Route path={routerPathNames.cashCounter.reports.pendingAdvance} element={<PendingAdvance />} />
              <Route path={routerPathNames.cashCounter.reports.previousBillsPrint} element={<PreviousBillsPrint />} />
              <Route path={routerPathNames.cashCounter.reports.dayCloser} element={<DayCloser />} />
              <Route path={routerPathNames.cashCounter.reports.ipDischarge} element={<IpDischarge />} />
              
              {/* Cash Counter Account Collection Reports */}
              <Route path={routerPathNames.cashCounter.accountCollection.advanceRefund} element={<AdvanceRefund />} />
              <Route path={routerPathNames.cashCounter.accountCollection.dueCollections} element={<DueCollections />} />
              <Route path={routerPathNames.cashCounter.accountCollection.waitingOrders} element={<CashWaitingOrder />} />
              <Route path={routerPathNames.cashCounter.accountCollection.totalCollections} element={<TotalCollections />} />
              <Route path={routerPathNames.cashCounter.accountCollection.allDuplicateBills} element={<AllDuplicateBills />} />
              <Route path={routerPathNames.cashCounter.accountCollection.discountBillDetails} element={<DiscountBillDetails />} />
              <Route path={routerPathNames.cashCounter.accountCollection.pharmacyCreditBills} element={<PharmacyCreditBills />} />
              <Route path={routerPathNames.cashCounter.accountCollection.doctorsRegCollection} element={<DoctorsRegCollection />} />
              <Route path={routerPathNames.cashCounter.accountCollection.departmentCollection} element={<DepartmentCollection />} />
              <Route path={routerPathNames.cashCounter.accountCollection.doctorsCollection} element={<DoctorsCollection />} />
              <Route path={routerPathNames.cashCounter.accountCollection.phDiscountCollection} element={<PhDiscountCollection />} />
              <Route path={routerPathNames.cashCounter.accountCollection.ipBills} element={<IpBills />} />
              <Route path={routerPathNames.cashCounter.accountCollection.accInvestigationCollection} element={<AccInvestigationCollection />} />
              <Route path={routerPathNames.cashCounter.accountCollection.accPharmacyCollection} element={<AccPharmacyCollection />} />
              <Route path={routerPathNames.cashCounter.accountCollection.accLabCollection} element={<AccLabCollection />} />
              <Route path={routerPathNames.cashCounter.accountCollection.accRegistrationCollection} element={<RegistrationReport />} />
              <Route path={routerPathNames.cashCounter.accountCollection.accCompanyReceipt} element={<AccCompanyReceipt />} />
              <Route path={routerPathNames.cashCounter.accountCollection.accUserWiseCollection} element={<UserDayEnd />} />
              <Route path={routerPathNames.cashCounter.accountCollection.accExceptPhUserWiseCollection} element={<ExceptPhUserDayEnd />} />
              <Route path={routerPathNames.cashCounter.accountCollection.accPhUserWiseCollection} element={<PhUserDayEnd />} />
              
              {/* Add more cash counter routes here as needed */}
            </Route>

            {/* Laboratory Module - Nested inside MainLayout */}
            <Route path={routerPathNames.laboratory.base} element={<AuthGuard component={<LaboratoryLayout />} />}>
              <Route index element={<LaboratoryDashboard />} />
              <Route path="billing/billing" element={<BillingRedesigned />} />
              <Route path={routerPathNames.laboratory.activities.labEntry} element={<LabWorkflow />} />
              <Route path={routerPathNames.laboratory.activities.resultReEdit} element={<SearchPage1 />} />
              <Route path={routerPathNames.laboratory.activities.duplicateResult} element={<SearchPage2 />} />
              <Route path={routerPathNames.laboratory.activities.billLabDuplicateBill} element={<DuplicateBill />} />
              <Route path={routerPathNames.laboratory.masters.antibiotic.add} element={<AddAntibiotics />} />
              <Route path={routerPathNames.laboratory.masters.bacteria.add} element={<AddBacteria />} />
              <Route path={routerPathNames.laboratory.masters.test.add} element={<AddTest />} />
              <Route path={routerPathNames.laboratory.masters.department.add} element={<AddDepartment />} />
              <Route path={routerPathNames.laboratory.masters.specimen.add} element={<AddSpecimen />} />
              <Route path={routerPathNames.laboratory.masters.test.companyRates} element={<EditCompanyRates />} />
              <Route path={routerPathNames.laboratory.masters.test.editCost} element={<EditTestCost />} />
              <Route path={routerPathNames.laboratory.masters.test.cultureTemplate} element={<CultureTemplate />} />
              <Route path={routerPathNames.laboratory.masters.test.testTemplate} element={<AddTemplate />} />
              <Route path={routerPathNames.laboratory.reports.labRegister} element={<RegisterSearch />} />
              <Route path={routerPathNames.laboratory.reports.testMaster} element={<TestList />} />
              <Route path={routerPathNames.laboratory.reports.resultReeditReport} element={<ResultReEditSearch />} />
              {/* Add more laboratory routes here as needed */}
            </Route>

            {/* Central Stores Module - Nested inside MainLayout */}
            <Route path={routerPathNames.centralStores.base} element={<AuthGuard component={<CentralStoresLayout />} />}>
              <Route index element={<div>Select a sub-module</div>} />
              
              {/* Medical Store Sub-Module - Nested routes */}
              <Route path="medical-store" element={<MedicalStoreDashboard />}>
                <Route index element={<MedicalStoreDashboardHome />} />
                <Route path="purchase/prepare-order" element={<PrepareOrder />} />
                <Route path="purchase/approve-order" element={<ApproveOrder />} />
                <Route path="purchase/view-order" element={<ViewOrder />} />
                <Route path="purchase/select-approved-po" element={<SelectApprovedPO />} />
                <Route path="purchase/entry" element={<PurchaseEntry />} />
                <Route path="purchase/select-supplier-date" element={<SelectSupplierDate />} />
                <Route path="purchase/goods-return-prep" element={<GoodsReturnPrep />} />
                <Route path="purchase/goods-return-approval" element={<GoodsReturnApproval />} />
                <Route path="transfer-order/prepare-transfer-medical" element={<PrepareTransfer />} />
                <Route path="transfer-order/approve-transfer" element={<ApproveTransfer />} />
                <Route path="consumable-order/create" element={<ConsumableOrder />} />
                <Route path="activities/consumable-approval" element={<ApproveConsumable />} />
                <Route path="activities/generic-group-master" element={<GenericGroupMaster />} />
                <Route path="activities/sub-generic-group-master" element={<SubGenericGroupMaster />} />
                <Route path="activities/generic-details-master" element={<GenericDetailsMaster />} />
                <Route path="activities/medicine-item-master" element={<MedicineItemMaster />} />
                <Route path="activities/supplier-master" element={<ManufacturerMaster />} />
                <Route path="activities/company-master" element={<CompanyNameMaster />} />
                <Route path="activities/batch-master" element={<BatchMaster />} />
                <Route path="registers/stocks" element={<AllStockRegister />} />
                <Route path="registers/transfer" element={<TransferRegister />} />
                <Route path="registers/transfer-receipts" element={<TransferReceipts />} />
                <Route path="registers/consumable" element={<ConsumableRegister />} />
                <Route path="registers/goods-receipts" element={<GoodsReceiptsRegister />} />
                {/* Correct route for Goods Receipts Register (medical) */}
                <Route path={routerPathNames.centralStores.medicalStore.registers.goodsReceipts} element={<GoodsReceiptsRegister />} />
                <Route path="registers/goods-return" element={<GoodsReturnRegister />} />
                <Route path="registers/damages" element={<Damages />} />
                <Route path="registers/request" element={<Request />} />
                <Route path="registers/med-wise-supplier" element={<MedWiseSupplier />} />
                <Route path="registers/annexure1-purchase" element={<Annexure1Purchase />} />
                <Route path="registers/annexure2-sale" element={<Annexure2Sale />} />
                <Route path="registers/supplier-wise-goods" element={<SupplierWiseGoods />} />
                <Route path="registers/purchase" element={<PurchaseRegister />} />
                <Route path="registers/stock-details" element={<StockDetails />} />
                <Route path="registers/opening-stock" element={<OpeningStock />} />
                <Route path="registers/purchase-reorder" element={<PurchaseReorder />} />
                <Route path="registers/annexure2-sale" element={<Annexure2Sale />} />
                <Route path="registers/supplier-wise-goods" element={<SupplierWiseGoods />} />
                <Route path="registers/purchase" element={<PurchaseRegister />} />
                <Route path="registers/stock-details" element={<StockDetails />} />
                <Route path="registers/opening-stock" element={<OpeningStock />} />
                <Route path="registers/purchase-reorder" element={<PurchaseReorder />} />
                <Route path="registers/batch-wise-stock" element={<BatchWiseStock />} />
                <Route path="registers/medicine-transaction" element={<MedicineTransaction />} />
                <Route path="registers/initial-stock-adjustment" element={<InitialStockAdjustment />} />
                <Route path="registers/stock-adjustment-report" element={<StockAdjustmentReport />} />
                <Route path="registers/individual-transfer" element={<IndividualTransferRegister />} />
                <Route path="registers/transfer-consumable" element={<TransferConsumableRegister />} />
                <Route path="registers/medicine-transaction-all" element={<MedicineTransactionAllStore />} />
                <Route path="registers/cancelled-po" element={<CancelledPO />} />
                <Route path="reports/expiry-date-wise" element={<ExpiryDateWise />} />
                <Route path="reports/expiry-between-dates" element={<ExpiryBetweenDates />} />
                <Route path="reports/supplier-between-dates" element={<SupplierGoodaReceiptDates />} />
                <Route path="reports/supplier-monthly" element={<SupplierGoodaReceiptMonthly />} />
                <Route path="reports/supplier-yearly" element={<SupplierGoodaReceiptYearly />} />
                <Route path="reports/supplier-details" element={<SupplierDetails />} />
                <Route path="reports/transfer-details" element={<TransferDetails />} />
                <Route path="reports/all-product-purchase" element={<AllProductPurchaseReport />} />
                <Route path="reports/stock-value" element={<StockValue />} />
                <Route path="reports/discount-report" element={<DiscountReport />} />
                <Route path="reports/schedule-medicine" element={<ScheduleMedicine />} />
                <Route path="setup/initial-stock" element={<InitialStocks />} />
                <Route path="setup/stock-adjustment" element={<StockAdjustments />} />
                <Route path="activities/min-max-order" element={<MinMaxOrder />} />
                <Route path="reports/medicines" element={<Medicines/>} />
                <Route path="reports/ViewStockList" element={<ViewStockList/>} />
                <Route path="reports/Company" element={<Company/>} />
                <Route path="reports/Supplier" element={<Supplier/>} />
                <Route path="reports/SupwiseGoodsReceipt" element={<SupwiseGoodsReceipt/>} />
                <Route path="reports/ExpiryCheckDetails" element={<ExpiryCheckDetails/>} />
                <Route path="reports/SupwiseWiseTotal" element={<SupwiseWiseTotal/>} />
                <Route path="reports/MedicineDetails" element={<MedicineDetails/>} />
                <Route path="reports/MedicineLocationStock" element={<MedicineLocationStock/>} />
                <Route path="reports/costWiseMedicine" element={<CostWiseMedicine/>} />
                <Route path="reports/PriceDetailsReports" element={<PriceDetailsReports/>} />
                <Route path="reports/StockReorderLevel" element={<StockReorderLevel/>} />
                <Route path="reports/StockProfitDetails" element={<StockProfitDetails/>} />
                <Route path="reports/monthlyConsumption" element={<MonthlyConsumption/>} />
                <Route path="reports/PurchaseOrderStatusMed" element={<PurchaseOrderStatusMed/>} />
                <Route path="reports/gstr/gstr3b" element={<Gstr3B/>} />
                <Route path="reports/gstr/billwisesales" element={<BillWiseSales/>} />
                <Route path="reports/gstr/billwisesalesreturn" element={<BillWiseSalesReturn/>} />
                <Route path="gstr-details" element={<PhGstrDetails />} />
                <Route path="reports/gstr/exempted-gst-sales" element={<ExamptedSales />} />
                <Route path="reports/gstr/gstrsales" element={<Sales />} />
                <Route path="reports/gstr/gstrseperatesales" element={<SeparateSales />} />
                <Route path="reports/gstr/gstrsalesreturn" element={<Return />} />
                <Route path="reports/gstr/gstrseperatesalesreturn" element={<SeparateReturn />} />
               <Route path="reports/gstr/annexure1" element={<Annexure1 />} />
                <Route path="reports/gstr/hsnSales" element={<HsnSales />} />
                <Route path="reports/gstr/hsnSalesReturn" element={<HsnSalesReturn />} />
                <Route path="reports/gstr/hsnPurchase" element={<Purchase />} />
                <Route path="reports/gstr/hsnPurchaseReturn" element={<PurchaseReturn />} />
                



              </Route>
              
              {/* Non-Medical Store Sub-Module - Nested routes */}
              <Route path="non-medical-store" element={<NonMedicalStoreDashboard />}>
                <Route index element={<NonMedicalStoreDashboardHome />} />
                {/* Non-Medical Store Purchase */}
                <Route path="purchase/prepare-order" element={<PrepareOrder />} />
                <Route path="purchase/approve-order" element={<ApproveOrder />} />
                <Route path="purchase/view-order" element={<ViewOrder />} />
                <Route path="purchase/select-approved-po" element={<SelectApprovedPO />} />
                <Route path="purchase/entry" element={<PurchaseEntry />} />
                <Route path="purchase/select-supplier-date" element={<SelectSupplierDate />} />
                <Route path="purchase/goods-return-prep" element={<GoodsReturnPrep />} />
                <Route path="purchase/goods-return-approval" element={<GoodsReturnApproval />} />
                {/* Non-Medical Store Transfer */}
                <Route path="transfer-order/prepare-transfer-non-medical" element={<PrepareTransfer />} />
                <Route path="transfer-order/approve-transfer" element={<ApproveTransfer />} />
                {/* Non-Medical Store Consumable */}
                <Route path="consumable-order/create" element={<ConsumableOrder />} />
                <Route path="activities/consumable-approval" element={<ApproveConsumable />} />
                {/* Non-Medical Store Masters */}
                <Route path="masters/group-add" element={<GroupMaster />} />
                <Route path="masters/group-edit" element={<GroupMaster />} />
                <Route path="masters/company-add" element={<CompanyMaster />} />
                <Route path="masters/company-edit" element={<CompanyMaster />} />
                <Route path="masters/supplier-add" element={<SupplierMaster />} />
                <Route path="masters/supplier-edit" element={<SupplierMaster />} />
                <Route path="masters/product-add" element={<ProductMaster />} />
                <Route path="masters/product-procedure-mapping" element={<ProductProcedureMapping />} />
                <Route path="masters/batch-add" element={<BatchMaster />} />
                <Route path="masters/batch-edit" element={<BatchMaster />} />
                <Route path="masters/consumable-cause" element={<ConsumableCauseMaster />} />
                {/* Non-Medical Store Registers */}
                <Route path="registers/stock" element={<AllStockRegister />} />
                <Route path="registers/transfer" element={<TransferRegister />} />
                <Route path="registers/goods-receipts" element={<GoodsReceiptsRegister />} />
                <Route path="registers/goods-return" element={<GoodsReturnRegister />} />
                <Route path="registers/batch-wise-stock" element={<BatchWiseStock />} />
                <Route path="registers/medicine-transaction" element={<MedicineTransaction />} />
                <Route path="registers/transfer-consumable" element={<TransferConsumableRegister />} />
                {/* Non-Medical Store Reports */}
                <Route path="reports/purchase-order-status" element={<PurchaseOrderStatus />} />
                <Route path="reports/product-and-supplier" element={<ProductAndSupplier />} />
                <Route path="reports/supplier-goods-receipt" element={<SupplierGoodReceipt />} />
                <Route path="reports/supplier-details" element={<SupplierDetails />} />
                {/* Non-Medical Store Setup */}
                <Route path="setup/initial-stock" element={<InitialStocks />} />
              </Route>
            </Route>

            {/* Pharmacy Stores Module - Nested inside MainLayout */}
            <Route path={routerPathNames.pharmacyStores.base} element={<AuthGuard component={<PharmacyStoresLayout />} />}>
              <Route index element={<div>Select a sub-module</div>} />
              {/* Pharmacy Dashboard - Layout for all sub-module pages */}
              <Route path="pharmacy" element={<PharmacyDashboard />}>
                <Route index element={<PharmacyStoreDashboard />} />
                {/* Billing Routes - Nested under dashboard */}
                <Route path="billing/order" element={<BillingRedesigned />} />
                <Route path="billing/CancelOrder" element={<CancelOrder />} />
                <Route path={routerPathNames.pharmacyStores.pharmacy.activities.billPhDuplicateBill} element={<DuplicateBill />} />
                {/* Purchase Module Routes - Nested under dashboard */}
                <Route path="purchase/prepare-order" element={<PrepareOrder />} />
                <Route path="purchase/approve-order" element={<ApproveOrder />} />
                <Route path="purchase/view-order" element={<ViewOrder />} />
                {/* Masters Routes - Nested under dashboard */}
                <Route path="masters/BatchDetails" element={<BatchDetails />} />
                <Route path="masters/batch-edit" element={<BatchMaster />} />
                {/* Activities Routes - Nested under dashboard */}
                <Route path="activities/sales-return" element={<SalesReturn />} />
                
                {/* Transfer Order Routes - Reuses Central Stores components */}
                <Route path="activities/transfer-prep" element={<PrepareTransfer />} />
                <Route path="activities/transfer-approval" element={<ApproveTransfer />} />
                {/* Consumable Order Routes - Reuses Central Stores component */}
                <Route path="activities/consumable-prep" element={<ConsumableOrder />} />
                <Route path="activities/consumable-approval" element={<ApproveConsumable />} />
                <Route path="activities/dispense-drug" element={<BilledPatientList />} />
                <Route path="activities/dispense-ready" element={<ReadyPatientList />} />
                {/* Register Routes - Reuses Central Stores register components */}
                <Route path="registers/transfer" element={<TransferRegister />} />
                <Route path="registers/transfer-receipt" element={<TransferReceipts />} />
                <Route path="registers/consumable" element={<TransferConsumableRegister />} />
                <Route path="registers/ph-transfer" element={<TransferRegister />} />
                <Route path="registers/ph-transfer-receipt" element={<TransferReceipts />} />
                <Route path="registers/ph-damages" element={<PhDamagesRegister />} />
                <Route path="registers/ph-sales" element={<PhSalesRegister />} />
                <Route path="registers/ph-med-wise-sales" element={<PhMedWiseSalesRegister />} />
                <Route path="registers/ph-sales-return" element={<PhSalesReturnRegister />} />
                <Route path="registers/phStock" element={<AllStockRegister />} />
                <Route path="registers/ph-prescription" element={<PhPrescriptionRegister />} />
                <Route path="registers/ph-request-register" element={<PhRequestRegister />} />
                <Route path="registers/ph-total-sales-mrp" element={<PhTotalSalesMrp />} />
                <Route path="registers/ph-total-sales-cp" element={<PhTotalSalesCp />} />
                <Route path="registers/ph-bill" element={<PhBillRegister />} />
                <Route path="registers/ph-stock-tax-wise" element={<PhStockTaxWise />} />
                <Route path="registers/ph-ward-wise-bill" element={<PhWardWiseBillRegister />} />
                <Route path="registers/ph-takt4-sales" element={<PhTakt4SalseRegister />} />
                <Route path="registers/ph-minimum-reorder" element={<PhMinimumReorder />} />
                <Route path="registers/ph-outpatient-date-wise" element={<OutPatientDateWise />} />
                <Route path="registers/batch-wise-stock" element={<BatchWiseStock />} />
                <Route path="registers/medicine-transaction" element={<MedicineTransaction />} />
                <Route path="reports/waitingOrders" element={<WaitingOrders />} />
                <Route path="reports/diagnosis" element={<Diagnosis />} />
                <Route path="reports/duplicate-bill" element={<PhDuplicateBill />} />
                <Route path="reports/medicine-wise-sales" element={<MedicineWiseSales />} />
                <Route path="reports/scheduled-medicine-sale" element={<ScheduledMedicineSale />} />
                <Route path="reports/category-wise-medicine" element={<CategoryWiseMedicine />} />
                <Route path="reports/sales-collection-amount" element={<SalesCollectionAmount />} />
                <Route path="reports/sales-status" element={<SalesStatus />} />
                <Route path="reports/ip-pharmacy-bills" element={<IpPharmacyBills />} />
                <Route path="reports/company-due-bills" element={<CompanyDueBills />} />
                <Route path="reports/company-return-bills" element={<CompanyReturnBills />} />
                <Route path="reports/daily-sales-transfer" element={<DailySalesTransfer />} />
                <Route path="reports/expiry-check" element={<ExpiryCheckDetails />} />
                <Route path="gstr-detail" element={<PhGstrDetails />} />
                <Route path="setup/initial-stock" element={<InitialStocks />} />
                <Route path="setup/stock-adjustment" element={<StockAdjustments />} />
                {/* Add more pharmacy page routes here as needed */}
              </Route>
            </Route>

            {/* Financial Accounts Module - Nested inside MainLayout */}
            <Route path={routerPathNames.financialAccounts.base} element={<AuthGuard component={<FinancialAccountsLayout />} />}>
              <Route index element={<FinancialAccountsDashboard />} />
               <Route path={routerPathNames.financialAccounts.transactions.entry} element={<TransactionEntry />} />
               <Route path={routerPathNames.financialAccounts.setup.accountHeads.add} element={<AccountHeadsAdd />} />
               <Route path={routerPathNames.financialAccounts.transactions.openingBalance} element={<OpenBalance />} />
              {/* Add more financial accounts routes here as needed */}
            </Route>

            {/* System Admin Module - Nested inside MainLayout */}
            <Route path={routerPathNames.systemAdmin.base} element={<AuthGuard component={<SystemAdminLayout />} />}>
              <Route index element={<SystemAdminDashboard />} />
              <Route path={routerPathNames.systemAdmin.records.ward.create} element={<CreateWard />} />
              <Route path={routerPathNames.systemAdmin.records.roomsBeds.add} element={<AddRoomsBeds />} />
              <Route path={routerPathNames.systemAdmin.records.cashType.addEditUnblock} element={<CashType />} />
              <Route path={routerPathNames.systemAdmin.records.bankPaymentMode.addEditUnblock} element={<BankPaymentMode />} />
              <Route path={routerPathNames.systemAdmin.records.bankDetails.addEditUnblock} element={<BankDetails />} />
              <Route path={routerPathNames.systemAdmin.configureUser.createUser} element={<CreateUser />} />
              <Route path={routerPathNames.systemAdmin.configureStore.add} element={<AddStore />} />
              <Route path={routerPathNames.systemAdmin.records.department.add} element={<SystemAdminDepartment />} />
              <Route path={routerPathNames.systemAdmin.records.consultant.add} element={<SystemAdminConsultant />} />
              <Route path={routerPathNames.systemAdmin.activities.circular} element={<Circular />} />
              <Route path={routerPathNames.systemAdmin.configureUser.resetPassword} element={<AddResetPassword />} />
              <Route path={routerPathNames.systemAdmin.records.Role.systemRole} element={<SystemRole />} />
              <Route path={routerPathNames.systemAdmin.activities.billCancel} element={<CancelBill />} />
              <Route path={routerPathNames.systemAdmin.activities.billCancelView} element={<CancelBillView />} />



              {/* Add more system admin routes here as needed */}
            </Route>

            {/* Employee Management Module - Nested inside MainLayout */}
            <Route path={routerPathNames.employeeManagement.base} element={<AuthGuard component={<EmployeeManagementLayout />} />}>
              <Route index element={<EmployeeManagementDashboard />} />
              <Route path={routerPathNames.employeeManagement.masterCategoryAdd} element={<CategoryAdd />} />
              <Route path={routerPathNames.employeeManagement.masterDepartmentAdd} element={<DepartmentAdd />} />
              <Route path={routerPathNames.employeeManagement.masterPositionAdd} element={<PositionAdd />} />
              <Route path={routerPathNames.employeeManagement.masterSalaryHeadAdd} element={<SalaryHead />} />
              <Route path={routerPathNames.employeeManagement.masterUnitAdd} element={<UnitAdd />} />
              <Route path={routerPathNames.employeeManagement.masterDivisionAdd} element={<DivisionAdd />} />
              <Route path={routerPathNames.employeeManagement.addEmployee} element={<AddEmployee />} />

              {/* Add more employee management routes here as needed */}
            </Route>

            {/* Payroll Management Module - Nested inside MainLayout */}
            <Route path={routerPathNames.payrollManagement.base} element={<AuthGuard component={<PayrollManagementLayout />} />}>
              <Route index element={<PayrollManagementDashboard />} />
              {/* Add more payroll management routes here as needed */}
            </Route>

            <Route path={routerPathNames.pacs.base} element={<AuthGuard component={<PacsLayout />} />}>
              <Route index element={<PacsDashboard />} />
              <Route path={routerPathNames.pacs.dicomViewer} element={<DicomViewer />} />
              <Route path={routerPathNames.pacs.dicomWeb} element={<DicomWeb />} />
              {/* Add more PACS routes here as needed */}
            </Route>
            
            {/* Radiology Module - Nested inside MainLayout */}
            <Route path={routerPathNames.radiology.base} element={<AuthGuard component={<RadiologyLayout />} />}>
              <Route index element={<RadiologyDashboard />} />
              <Route path={routerPathNames.radiology.masters.invFilm.add} element={<InvFilmMaster />} />
              <Route path={routerPathNames.radiology.masters.invFilm.edit} element={<InvFilmMaster />} />
              <Route path={routerPathNames.radiology.masters.invFilm.block} element={<InvFilmMaster />} />
              <Route path={routerPathNames.radiology.masters.invFilm.unblock} element={<InvFilmMaster />} />
              <Route path={routerPathNames.radiology.masters.group.add} element={<RadiologyGroupMaster />} />
              <Route path={routerPathNames.radiology.masters.group.edit} element={<RadiologyGroupMaster />} />
              <Route path={routerPathNames.radiology.masters.company.add} element={<RadiologyCompanyMaster />} />
              <Route path={routerPathNames.radiology.masters.company.edit} element={<RadiologyCompanyMaster />} />
              <Route path={routerPathNames.radiology.masters.supplier.add} element={<RadiologySupplierMaster />} />
              <Route path={routerPathNames.radiology.masters.supplier.edit} element={<RadiologySupplierMaster />} />
              <Route path={routerPathNames.radiology.masters.supplier.map} element={<SupplierMapping />} />
              <Route path={routerPathNames.radiology.masters.supplier.deleteMapping} element={<SupplierMapping />} />
              <Route path={routerPathNames.radiology.masters.materialCode.add} element={<MaterialCodeMaster />} />
              <Route path={routerPathNames.radiology.masters.materialCode.edit} element={<MaterialCodeMaster />} />
              <Route path={routerPathNames.radiology.masters.initialStock} element={<InitialStock />} />
              <Route path="/hims/radiology/masters/initial-stock/material-code-details" element={<MaterialCodeDetails />} />
              <Route path={routerPathNames.radiology.masters.productProperties} element={<ProductProperties />} />
              <Route path="/hims/radiology/masters/product-properties/details" element={<ProductPropertiesDetails />} />
              <Route path={routerPathNames.radiology.masters.stockAdjustment} element={<StockAdjustment />} />
              <Route path="/hims/radiology/masters/stock-adjustment/material-code-details" element={<StockAdjustmentMaterialCodeDetails />} />
              <Route path={routerPathNames.radiology.masters.groupsConfig.add} element={<GroupsConfig />} />
              <Route path={routerPathNames.radiology.masters.groupsConfig.edit} element={<GroupsConfig />} />
              <Route path={routerPathNames.radiology.masters.proceduresConfig.add} element={<ProceduresConfig />} />
              <Route path={routerPathNames.radiology.masters.proceduresConfig.edit} element={<ProceduresConfig />} />
              <Route path={routerPathNames.radiology.masters.mapProduct} element={<MapProduct />} />
              
              {/* Purchase Orders Routes */}
              <Route path={routerPathNames.radiology.purchaseOrders.prepareOrders} element={<PrepareOrders />} />
              <Route path={routerPathNames.radiology.purchaseOrders.poApproval} element={<POApproval />} />
              <Route path={routerPathNames.radiology.purchaseOrders.closePO} element={<ClosePO />} />
              <Route path={routerPathNames.radiology.purchaseOrders.poPrint} element={<POPrint />} />
              <Route path={routerPathNames.radiology.purchaseOrders.grNotePreparation} element={<GRNotePreparation />} />
              <Route path={routerPathNames.radiology.purchaseOrders.grNoteApproval} element={<GRNoteApproval />} />
              <Route path={routerPathNames.radiology.purchaseOrders.goodsReceipts} element={<GoodsReceipts />} />
              
              {/* Entry Routes */}
              <Route path={routerPathNames.radiology.entry.entry} element={<Entry />} />
              
              {/* Activities Routes */}
              <Route path={routerPathNames.radiology.activities.prepareUsageNote} element={<PrepareUsageNote />} />
              <Route path={routerPathNames.radiology.activities.approveNote} element={<ApproveNote />} />
              
              {/* Registers Routes */}
              {/* <Route path={routerPathNames.radiology.registers.goodsReceiptsRegister} element={<RadiologyGoodsReceiptsRegister />} /> */}
              <Route path="/hims/radiology/grn-details/:grnNo" element={<GRNDetails />} />
              {/* <Route path={routerPathNames.radiology.registers.goodsReturnRegister} element={<GoodsReturnRegisterRadiology />} /> */}
              <Route path="/hims/radiology/return-details/:returnNo" element={<ReturnDetails />} />
              <Route path={routerPathNames.radiology.registers.usageRegister} element={<UsageRegister />} />
              <Route path={routerPathNames.radiology.registers.goodsReceiptProductWise} element={<GoodsReceiptProductWise />} />
              <Route path={routerPathNames.radiology.registers.groupWiseGoodsReceipt} element={<GroupWiseGoodsReceipt />} />
              <Route path={routerPathNames.radiology.registers.investigationRegister} element={<InvestigationRegister />} />
              
              {/* Reports Routes */}
              <Route path={routerPathNames.radiology.reports.invFilmFlow} element={<InvFilmFlow />} />
              {/* <Route path={routerPathNames.radiology.reports.stockRegister} element={<StockRegisterReport />} /> */}
              <Route path={routerPathNames.radiology.reports.expiryCheck} element={<ExpiryCheck />} />
              <Route path={routerPathNames.radiology.reports.groupWiseReport} element={<GroupWiseReport />} />
              <Route path={routerPathNames.radiology.reports.stockReport} element={<StockReport />} />
              <Route path={routerPathNames.radiology.reports.groupWiseCollection} element={<GroupWiseCollection />} />
              <Route path={routerPathNames.radiology.reports.groupWiseCollectionDetails} element={<GroupWiseCollectionDetails />} />
              <Route path={routerPathNames.radiology.reports.scanReports} element={<ScanReports />} />
              <Route path={routerPathNames.radiology.reports.scanReportCancel} element={<ScanReportCancel />} />
              <Route path={routerPathNames.radiology.reports.angiogramReport} element={<AngiogramReport />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </Fragment>
  </>
}

export default AppRouter