/**
 * Shared TypeScript interfaces for Laboratory Workflow Management
 * This file contains all the type definitions used across workflow components
 */

export interface BilledTest {
  testId: number;
  testName: string;
  isCulture?: number;
  specimen: string;
  specimenName?: string;
  specimenReceived: boolean;
  resultEntered: boolean;
  resultVerified: boolean;
  resultPrinted: boolean;
  deptName: string;
  rate: number;
  testRegId: number;
}

export interface PatientWithTests {
  uhid: string;
  opNumber: string;
  name: string;
  age: number | string;
  gender: string;
  phoneNumber: string;
  visitId: number;
  patId: number;
  billNumber: number;
  billTime: string;
  userName: string;
  billNo: string;
  billDate: string;
  total: number;
  paid: number;
  isIp: number;
  docName: string;
  note: string;
  tests: BilledTest[];
}

export interface WorkflowComponentProps {
  patient: PatientWithTests;
  onBack: () => void;
}

export type WorkflowStage = "all" | "specimen" | "result" | "verify" | "print";

export type ActiveView =
  | "list"
  | "specimenReceipt"
  | "enterResults"
  | "verifyResults"
  | "printResults"
  | "printPreview"
  | "editTestResult";

export interface DateGroup {
  date: string;
  patients: PatientWithTests[];
}
