import React, { useMemo, useState } from 'react';
import { Badge, Button, Card, Col, Container, Form, Nav, Row, Table } from 'react-bootstrap';
import ReportHeader from '../../components/ReportHeader';
import { showValidationError } from '../../../utils/alertUtil';

type ComparisonTab = 'year' | 'between-dates-months' | 'date';
type YearReportTab =
  | 'department-op'
  | 'doctor-op'
  | 'general-op'
  | 'department-ip'
  | 'doctor-ip'
  | 'general-ip'
  | 'year-comparison'
  | 'birth-report'
  | 'deliveries-report';
type BetweenReportTab = 'department-op' | 'doctor-op' | 'general-op' | 'department-ip' | 'doctor-ip';
type DateReportTab =
  | 'department-op'
  | 'doctor-op'
  | 'general-op'
  | 'department-ip'
  | 'doctor-ip'
  | 'general-ip'
  | 'date-comparison'
  | 'diagnosis';

type BirthType = 'live' | 'still';
type DeliveryType = 'Forceps' | 'LSCS' | 'Normal' | 'Vaccum';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface NamedOption {
  id: number;
  name: string;
}

interface MonthlyRow {
  year: number;
  months: number[];
  total: number;
}

interface BetweenDepartmentOpVisit {
  patientNumber: string;
  patientName: string;
  date: string;
  time: string;
  token: string;
}

interface BetweenDailyRow {
  month: string;
  dailyCounts: number[];
  total: number;
}

interface RatioRow {
  label: string;
  count: number;
}

interface DateDoctorOpVisit {
  patientNumber: string;
  patientName: string;
  date: string;
  time: string;
}

interface DateDoctorIpRow {
  consultantName: string;
  totalPatients: number;
}

interface DiagnosisRow {
  diagnosis: string;
  count: number;
}

const departmentOptions: NamedOption[] = [
  { id: 1, name: 'General Medicine' },
  { id: 2, name: 'Orthopedics' },
  { id: 3, name: 'Pediatrics' },
  { id: 4, name: 'ENT' },
  { id: 5, name: 'Gynecology' },
  { id: 6, name: 'Cardiology' }
];

const doctorOptions: NamedOption[] = [
  { id: 1, name: 'Dr. Ravi Kumar' },
  { id: 2, name: 'Dr. Priya Nair' },
  { id: 3, name: 'Dr. Arun Das' },
  { id: 4, name: 'Dr. Leela Devi' },
  { id: 5, name: 'Dr. Manoj Singh' }
];

const religionOptions = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Jain'];

function hashSeed(...values: number[]) {
  return values.reduce((acc, value, index) => {
    return (acc * 31 + (value + 17) * (index + 3)) % 100000;
  }, 11);
}

function getMonthCount(year: number, monthIndex: number, seed: number, scale: number) {
  const base = hashSeed(year, monthIndex + 1, seed);
  return (base % scale) + Math.floor(scale / 2);
}

function buildMonthlyRows(fromYear: number, toYear: number, seed: number, scale: number): MonthlyRow[] {
  const rows: MonthlyRow[] = [];

  for (let year = fromYear; year <= toYear; year++) {
    const months = MONTHS.map((_, monthIndex) => getMonthCount(year, monthIndex, seed, scale));
    const total = months.reduce((sum, value) => sum + value, 0);
    rows.push({ year, months, total });
  }

  return rows;
}

function getColumnTotals(rows: MonthlyRow[]) {
  const monthTotals = Array.from({ length: 12 }, () => 0);
  let grandTotal = 0;

  rows.forEach((row) => {
    row.months.forEach((value, index) => {
      monthTotals[index] += value;
    });
    grandTotal += row.total;
  });

  return { monthTotals, grandTotal };
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function formatDateLabel(value: string) {
  if (!value) {
    return '';
  }
  const [year, month, day] = value.split('-');
  if (!year || !month || !day) {
    return value;
  }
  return `${day}-${month}-${year}`;
}

function buildDailyRows(year: number, fromMonth: number, toMonth: number, seed: number, scale: number): BetweenDailyRow[] {
  const rows: BetweenDailyRow[] = [];

  for (let month = fromMonth; month <= toMonth; month++) {
    const maxDay = getDaysInMonth(year, month);
    const dailyCounts = Array.from({ length: 31 }, (_, dayIndex) => {
      const day = dayIndex + 1;
      if (day > maxDay) {
        return 0;
      }
      return getMonthCount(year, day, seed + month * 10, scale);
    });
    const total = dailyCounts.reduce((sum, value) => sum + value, 0);
    rows.push({
      month: MONTHS[month - 1],
      dailyCounts,
      total
    });
  }

  return rows;
}

function YearMonthTable({ rows, showTotalRow = true }: { rows: MonthlyRow[]; showTotalRow?: boolean }) {
  const { monthTotals, grandTotal } = getColumnTotals(rows);

  return (
    <Table striped bordered hover responsive className="align-middle mb-0">
      <thead>
        <tr>
          <th>Year</th>
          {MONTHS.map((month) => (
            <th key={month}>{month}</th>
          ))}
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.year}>
            <td>{row.year}</td>
            {row.months.map((value, index) => (
              <td key={`${row.year}-${index}`} className="text-end">
                {value}
              </td>
            ))}
            <td className="text-end fw-semibold">{row.total}</td>
          </tr>
        ))}
        {showTotalRow && (
          <tr className="table-light fw-semibold">
            <td>Total</td>
            {monthTotals.map((value, index) => (
              <td key={`total-${index}`} className="text-end">
                {value}
              </td>
            ))}
            <td className="text-end">{grandTotal}</td>
          </tr>
        )}
      </tbody>
    </Table>
  );
}

export default function Comparison() {
  const currentYear = new Date().getFullYear();
  const today = new Date().toISOString().split('T')[0];
  const [activeTab, setActiveTab] = useState<ComparisonTab>('year');
  const [activeYearReportTab, setActiveYearReportTab] = useState<YearReportTab>('department-op');
  const [activeBetweenReportTab, setActiveBetweenReportTab] = useState<BetweenReportTab>('department-op');
  const [activeDateReportTab, setActiveDateReportTab] = useState<DateReportTab>('department-op');

  const yearOptions = useMemo(() => {
    const values: number[] = [];
    for (let year = 1990; year <= 2100; year++) {
      values.push(year);
    }
    return values;
  }, []);

  const [departmentOpDepartmentId, setDepartmentOpDepartmentId] = useState<number>(departmentOptions[0].id);
  const [departmentOpFromYear, setDepartmentOpFromYear] = useState<number>(currentYear - 2);
  const [departmentOpToYear, setDepartmentOpToYear] = useState<number>(currentYear);
  const [departmentOpRows, setDepartmentOpRows] = useState<MonthlyRow[]>([]);

  const [doctorOpDoctorId, setDoctorOpDoctorId] = useState<number>(doctorOptions[0].id);
  const [doctorOpFromYear, setDoctorOpFromYear] = useState<number>(currentYear - 2);
  const [doctorOpToYear, setDoctorOpToYear] = useState<number>(currentYear);
  const [doctorOpRows, setDoctorOpRows] = useState<MonthlyRow[]>([]);

  const [generalOpFromYear, setGeneralOpFromYear] = useState<number>(currentYear - 2);
  const [generalOpToYear, setGeneralOpToYear] = useState<number>(currentYear);
  const [generalOpRows, setGeneralOpRows] = useState<MonthlyRow[]>([]);

  const [departmentIpDepartmentId, setDepartmentIpDepartmentId] = useState<number>(departmentOptions[0].id);
  const [departmentIpFromYear, setDepartmentIpFromYear] = useState<number>(currentYear - 2);
  const [departmentIpToYear, setDepartmentIpToYear] = useState<number>(currentYear);
  const [departmentIpRows, setDepartmentIpRows] = useState<MonthlyRow[]>([]);

  const [doctorIpDoctorId, setDoctorIpDoctorId] = useState<number>(doctorOptions[0].id);
  const [doctorIpFromYear, setDoctorIpFromYear] = useState<number>(currentYear - 2);
  const [doctorIpToYear, setDoctorIpToYear] = useState<number>(currentYear);
  const [doctorIpRows, setDoctorIpRows] = useState<MonthlyRow[]>([]);

  const [generalIpFromYear, setGeneralIpFromYear] = useState<number>(currentYear - 2);
  const [generalIpToYear, setGeneralIpToYear] = useState<number>(currentYear);
  const [generalIpRows, setGeneralIpRows] = useState<MonthlyRow[]>([]);

  const [comparisonFromYear, setComparisonFromYear] = useState<number>(currentYear - 2);
  const [comparisonToYear, setComparisonToYear] = useState<number>(currentYear);
  const [comparisonYears, setComparisonYears] = useState<number[]>([]);

  const [birthType, setBirthType] = useState<BirthType>('live');
  const [birthFromYear, setBirthFromYear] = useState<number>(currentYear - 2);
  const [birthToYear, setBirthToYear] = useState<number>(currentYear);
  const [birthRows, setBirthRows] = useState<Array<{ year: number; total: number }>>([]);

  const [deliveryType, setDeliveryType] = useState<DeliveryType>('Normal');
  const [deliveryFromYear, setDeliveryFromYear] = useState<number>(currentYear - 2);
  const [deliveryToYear, setDeliveryToYear] = useState<number>(currentYear);
  const [deliveryRows, setDeliveryRows] = useState<Array<{ year: number; total: number }>>([]);

  const [betweenDepartmentOpDepartmentId, setBetweenDepartmentOpDepartmentId] = useState<number>(0);
  const [betweenDepartmentOpFromDate, setBetweenDepartmentOpFromDate] = useState<string>(today);
  const [betweenDepartmentOpToDate, setBetweenDepartmentOpToDate] = useState<string>(today);
  const [betweenDepartmentOpVisits, setBetweenDepartmentOpVisits] = useState<BetweenDepartmentOpVisit[]>([]);

  const [betweenDoctorOpDoctorId, setBetweenDoctorOpDoctorId] = useState<number>(doctorOptions[0].id);
  const [betweenDoctorOpYear, setBetweenDoctorOpYear] = useState<number>(currentYear);
  const [betweenDoctorOpFromMonth, setBetweenDoctorOpFromMonth] = useState<number>(1);
  const [betweenDoctorOpToMonth, setBetweenDoctorOpToMonth] = useState<number>(new Date().getMonth() + 1);
  const [betweenDoctorOpRows, setBetweenDoctorOpRows] = useState<BetweenDailyRow[]>([]);

  const [betweenGeneralOpFromDate, setBetweenGeneralOpFromDate] = useState<string>(today);
  const [betweenGeneralOpToDate, setBetweenGeneralOpToDate] = useState<string>(today);
  const [betweenGeneralOpFromTime, setBetweenGeneralOpFromTime] = useState<string>('01:00:00');
  const [betweenGeneralOpToTime, setBetweenGeneralOpToTime] = useState<string>('23:59:00');
  const [betweenGeneralOpVillageRows, setBetweenGeneralOpVillageRows] = useState<RatioRow[]>([]);
  const [betweenGeneralOpPostRows, setBetweenGeneralOpPostRows] = useState<RatioRow[]>([]);
  const [betweenGeneralOpTalukRows, setBetweenGeneralOpTalukRows] = useState<RatioRow[]>([]);
  const [betweenGeneralOpDistrictRows, setBetweenGeneralOpDistrictRows] = useState<RatioRow[]>([]);

  const [betweenDepartmentIpDepartmentId, setBetweenDepartmentIpDepartmentId] = useState<number>(departmentOptions[0].id);
  const [betweenDepartmentIpYear, setBetweenDepartmentIpYear] = useState<number>(currentYear);
  const [betweenDepartmentIpFromMonth, setBetweenDepartmentIpFromMonth] = useState<number>(1);
  const [betweenDepartmentIpToMonth, setBetweenDepartmentIpToMonth] = useState<number>(new Date().getMonth() + 1);
  const [betweenDepartmentIpRows, setBetweenDepartmentIpRows] = useState<BetweenDailyRow[]>([]);

  const [betweenDoctorIpDoctorId, setBetweenDoctorIpDoctorId] = useState<number>(doctorOptions[0].id);
  const [betweenDoctorIpYear, setBetweenDoctorIpYear] = useState<number>(currentYear);
  const [betweenDoctorIpFromMonth, setBetweenDoctorIpFromMonth] = useState<number>(1);
  const [betweenDoctorIpToMonth, setBetweenDoctorIpToMonth] = useState<number>(new Date().getMonth() + 1);
  const [betweenDoctorIpRows, setBetweenDoctorIpRows] = useState<BetweenDailyRow[]>([]);

  const [dateDepartmentOpDepartmentId, setDateDepartmentOpDepartmentId] = useState<number>(0);
  const [dateDepartmentOpFromDate, setDateDepartmentOpFromDate] = useState<string>(today);
  const [dateDepartmentOpToDate, setDateDepartmentOpToDate] = useState<string>(today);
  const [dateDepartmentOpVisits, setDateDepartmentOpVisits] = useState<BetweenDepartmentOpVisit[]>([]);

  const [dateDoctorOpDoctorId, setDateDoctorOpDoctorId] = useState<number>(doctorOptions[0].id);
  const [dateDoctorOpDate, setDateDoctorOpDate] = useState<string>(today);
  const [dateDoctorOpFromTime, setDateDoctorOpFromTime] = useState<string>('01:00:00');
  const [dateDoctorOpToTime, setDateDoctorOpToTime] = useState<string>('23:59:00');
  const [dateDoctorOpRows, setDateDoctorOpRows] = useState<DateDoctorOpVisit[]>([]);

  const [dateGeneralOpFromDate, setDateGeneralOpFromDate] = useState<string>(today);
  const [dateGeneralOpToDate, setDateGeneralOpToDate] = useState<string>(today);
  const [dateGeneralOpRows, setDateGeneralOpRows] = useState<RatioRow[]>([]);

  const [dateDepartmentIpDepartmentId, setDateDepartmentIpDepartmentId] = useState<number>(departmentOptions[0].id);
  const [dateDepartmentIpFromYear, setDateDepartmentIpFromYear] = useState<number>(currentYear - 2);
  const [dateDepartmentIpToYear, setDateDepartmentIpToYear] = useState<number>(currentYear);
  const [dateDepartmentIpRows, setDateDepartmentIpRows] = useState<MonthlyRow[]>([]);

  const [dateDoctorIpFromDate, setDateDoctorIpFromDate] = useState<string>(today);
  const [dateDoctorIpToDate, setDateDoctorIpToDate] = useState<string>(today);
  const [dateDoctorIpRows, setDateDoctorIpRows] = useState<DateDoctorIpRow[]>([]);
  const [dateDoctorIpTotal, setDateDoctorIpTotal] = useState<number>(0);

  const [dateGeneralIpFromYear, setDateGeneralIpFromYear] = useState<number>(currentYear - 2);
  const [dateGeneralIpToYear, setDateGeneralIpToYear] = useState<number>(currentYear);
  const [dateGeneralIpRows, setDateGeneralIpRows] = useState<MonthlyRow[]>([]);

  const [dateComparisonFromDate, setDateComparisonFromDate] = useState<string>(today);
  const [dateComparisonToDate, setDateComparisonToDate] = useState<string>(today);
  const [dateComparisonRun, setDateComparisonRun] = useState<boolean>(false);

  const [diagnosisFromDate, setDiagnosisFromDate] = useState<string>(today);
  const [diagnosisToDate, setDiagnosisToDate] = useState<string>(today);
  const [diagnosisRows, setDiagnosisRows] = useState<DiagnosisRow[]>([]);

  const validateYearRange = (fromYear: number, toYear: number) => {
    if (fromYear > toYear) {
      showValidationError('From Year should be less than or equal to To Year');
      return false;
    }
    return true;
  };

  const validateDateRange = (fromDate: string, toDate: string) => {
    if (new Date(fromDate) > new Date(toDate)) {
      showValidationError('From Date should be less than or equal to To Date');
      return false;
    }
    return true;
  };

  const validateMonthRange = (fromMonth: number, toMonth: number) => {
    if (fromMonth > toMonth) {
      showValidationError('From Month should be less than or equal to To Month');
      return false;
    }
    return true;
  };

  const createYearList = (fromYear: number, toYear: number) => {
    const years: number[] = [];
    for (let year = fromYear; year <= toYear; year++) {
      years.push(year);
    }
    return years;
  };

  const handleDepartmentOpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateYearRange(departmentOpFromYear, departmentOpToYear)) {
      return;
    }
    setDepartmentOpRows(buildMonthlyRows(departmentOpFromYear, departmentOpToYear, departmentOpDepartmentId + 10, 48));
  };

  const handleDoctorOpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateYearRange(doctorOpFromYear, doctorOpToYear)) {
      return;
    }
    setDoctorOpRows(buildMonthlyRows(doctorOpFromYear, doctorOpToYear, doctorOpDoctorId + 20, 36));
  };

  const handleGeneralOpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateYearRange(generalOpFromYear, generalOpToYear)) {
      return;
    }
    setGeneralOpRows(buildMonthlyRows(generalOpFromYear, generalOpToYear, 300, 65));
  };

  const handleDepartmentIpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateYearRange(departmentIpFromYear, departmentIpToYear)) {
      return;
    }
    setDepartmentIpRows(buildMonthlyRows(departmentIpFromYear, departmentIpToYear, departmentIpDepartmentId + 40, 28));
  };

  const handleDoctorIpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateYearRange(doctorIpFromYear, doctorIpToYear)) {
      return;
    }
    setDoctorIpRows(buildMonthlyRows(doctorIpFromYear, doctorIpToYear, doctorIpDoctorId + 50, 25));
  };

  const handleGeneralIpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateYearRange(generalIpFromYear, generalIpToYear)) {
      return;
    }
    setGeneralIpRows(buildMonthlyRows(generalIpFromYear, generalIpToYear, 500, 40));
  };

  const handleYearComparisonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateYearRange(comparisonFromYear, comparisonToYear)) {
      return;
    }
    setComparisonYears(createYearList(comparisonFromYear, comparisonToYear));
  };

  const handleBirthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateYearRange(birthFromYear, birthToYear)) {
      return;
    }

    const rows = createYearList(birthFromYear, birthToYear).map((year) => {
      const seed = birthType === 'live' ? 701 : 777;
      return {
        year,
        total: getMonthCount(year, 0, seed, 120)
      };
    });

    setBirthRows(rows);
  };

  const handleDeliverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateYearRange(deliveryFromYear, deliveryToYear)) {
      return;
    }

    const typeSeedMap: Record<DeliveryType, number> = {
      Forceps: 811,
      LSCS: 822,
      Normal: 833,
      Vaccum: 844
    };

    const rows = createYearList(deliveryFromYear, deliveryToYear).map((year) => ({
      year,
      total: getMonthCount(year, 1, typeSeedMap[deliveryType], 90)
    }));

    setDeliveryRows(rows);
  };

  const handleBetweenDepartmentOpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateDateRange(betweenDepartmentOpFromDate, betweenDepartmentOpToDate)) {
      return;
    }

    const selectedDepartment =
      betweenDepartmentOpDepartmentId === 0
        ? 'All'
        : departmentOptions.find((dept) => dept.id === betweenDepartmentOpDepartmentId)?.name || 'All';

    const startDate = new Date(betweenDepartmentOpFromDate);
    const endDate = new Date(betweenDepartmentOpToDate);
    const visits: BetweenDepartmentOpVisit[] = [];
    let current = new Date(startDate);
    let index = 1;

    while (current <= endDate && visits.length < 60) {
      const daySeed = hashSeed(current.getFullYear(), current.getMonth() + 1, current.getDate(), betweenDepartmentOpDepartmentId + 1);
      const visitCount = (daySeed % 3) + 1;

      for (let counter = 0; counter < visitCount; counter++) {
        const patientNumber = `OP${String(10000 + index).padStart(5, '0')}`;
        visits.push({
          patientNumber,
          patientName: `Patient ${index}`,
          date: formatDateLabel(current.toISOString().split('T')[0]),
          time: `${String((8 + ((daySeed + counter) % 10)) % 24).padStart(2, '0')}:${String((daySeed + counter * 7) % 60).padStart(2, '0')}`,
          token: `${selectedDepartment === 'All' ? 'GEN' : selectedDepartment.slice(0, 3).toUpperCase()}-${(daySeed + counter) % 90}/${(daySeed + counter) % 20}`
        });
        index += 1;
      }

      current.setDate(current.getDate() + 1);
    }

    setBetweenDepartmentOpVisits(visits);
  };

  const handleBetweenDoctorOpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateMonthRange(betweenDoctorOpFromMonth, betweenDoctorOpToMonth)) {
      return;
    }

    setBetweenDoctorOpRows(
      buildDailyRows(betweenDoctorOpYear, betweenDoctorOpFromMonth, betweenDoctorOpToMonth, betweenDoctorOpDoctorId + 2000, 8)
    );
  };

  const handleBetweenGeneralOpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateDateRange(betweenGeneralOpFromDate, betweenGeneralOpToDate)) {
      return;
    }

    const villages = ['Sanjeev Nagar', 'Lakshmi Puram', 'Old Town', 'Market Road', 'Green Hills'];
    const posts = ['Post A', 'Post B', 'Post C', 'Post D'];
    const taluks = ['Taluk North', 'Taluk South', 'Taluk East'];
    const districts = ['District One', 'District Two', 'District Three'];

    setBetweenGeneralOpVillageRows(
      villages.map((label, index) => ({
        label,
        count: getMonthCount(currentYear, index + 1, 3100, 120)
      }))
    );
    setBetweenGeneralOpPostRows(
      posts.map((label, index) => ({
        label,
        count: getMonthCount(currentYear, index + 1, 3200, 95)
      }))
    );
    setBetweenGeneralOpTalukRows(
      taluks.map((label, index) => ({
        label,
        count: getMonthCount(currentYear, index + 1, 3300, 90)
      }))
    );
    setBetweenGeneralOpDistrictRows(
      districts.map((label, index) => ({
        label,
        count: getMonthCount(currentYear, index + 1, 3400, 75)
      }))
    );
  };

  const handleBetweenDepartmentIpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateMonthRange(betweenDepartmentIpFromMonth, betweenDepartmentIpToMonth)) {
      return;
    }

    setBetweenDepartmentIpRows(
      buildDailyRows(
        betweenDepartmentIpYear,
        betweenDepartmentIpFromMonth,
        betweenDepartmentIpToMonth,
        betweenDepartmentIpDepartmentId + 4000,
        6
      )
    );
  };

  const handleBetweenDoctorIpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateMonthRange(betweenDoctorIpFromMonth, betweenDoctorIpToMonth)) {
      return;
    }

    setBetweenDoctorIpRows(
      buildDailyRows(
        betweenDoctorIpYear,
        betweenDoctorIpFromMonth,
        betweenDoctorIpToMonth,
        betweenDoctorIpDoctorId + 5000,
        5
      )
    );
  };

  const handleDateDepartmentOpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateDateRange(dateDepartmentOpFromDate, dateDepartmentOpToDate)) {
      return;
    }

    const selectedDepartment =
      dateDepartmentOpDepartmentId === 0
        ? 'All'
        : departmentOptions.find((dept) => dept.id === dateDepartmentOpDepartmentId)?.name || 'All';

    const startDate = new Date(dateDepartmentOpFromDate);
    const endDate = new Date(dateDepartmentOpToDate);
    const visits: BetweenDepartmentOpVisit[] = [];
    let current = new Date(startDate);
    let index = 1;

    while (current <= endDate && visits.length < 100) {
      const daySeed = hashSeed(current.getFullYear(), current.getMonth() + 1, current.getDate(), dateDepartmentOpDepartmentId + 6000);
      const visitCount = (daySeed % 4) + 1;

      for (let counter = 0; counter < visitCount; counter++) {
        const patientNumber = `OP${String(20000 + index).padStart(5, '0')}`;
        visits.push({
          patientNumber,
          patientName: `Patient ${index}`,
          date: formatDateLabel(current.toISOString().split('T')[0]),
          time: `${String((8 + ((daySeed + counter) % 10)) % 24).padStart(2, '0')}:${String((daySeed + counter * 5) % 60).padStart(2, '0')}`,
          token: `${selectedDepartment === 'All' ? 'GEN' : selectedDepartment.slice(0, 3).toUpperCase()}-${(daySeed + counter) % 99}/${(daySeed + counter) % 20}`
        });
        index += 1;
      }

      current.setDate(current.getDate() + 1);
    }

    setDateDepartmentOpVisits(visits);
  };

  const handleDateDoctorOpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (dateDoctorOpFromTime > dateDoctorOpToTime) {
      showValidationError('Time From should be less than or equal to Time To');
      return;
    }

    const doctorSeed = dateDoctorOpDoctorId + 7000;
    const rows = Array.from({ length: 18 }, (_, index) => ({
      patientNumber: `OP${String(30000 + index).padStart(5, '0')}`,
      patientName: `Patient ${index + 1}`,
      date: formatDateLabel(dateDoctorOpDate),
      time: `${String((8 + index) % 24).padStart(2, '0')}:${String((getMonthCount(currentYear, index + 1, doctorSeed, 40) % 60)).padStart(2, '0')}`
    })).filter((row) => row.time >= dateDoctorOpFromTime.slice(0, 5) && row.time <= dateDoctorOpToTime.slice(0, 5));

    setDateDoctorOpRows(rows);
  };

  const handleDateGeneralOpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateDateRange(dateGeneralOpFromDate, dateGeneralOpToDate)) {
      return;
    }

    setDateGeneralOpRows(
      departmentOptions.map((dept, index) => ({
        label: dept.name,
        count: getMonthCount(currentYear, index + 1, 8000 + dept.id, 160)
      }))
    );
  };

  const handleDateDepartmentIpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateYearRange(dateDepartmentIpFromYear, dateDepartmentIpToYear)) {
      return;
    }
    setDateDepartmentIpRows(
      buildMonthlyRows(dateDepartmentIpFromYear, dateDepartmentIpToYear, dateDepartmentIpDepartmentId + 8100, 34)
    );
  };

  const handleDateDoctorIpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateDateRange(dateDoctorIpFromDate, dateDoctorIpToDate)) {
      return;
    }

    const rows = doctorOptions.map((doctor, index) => ({
      consultantName: doctor.name,
      totalPatients: getMonthCount(currentYear, index + 1, 8200 + doctor.id, 40)
    }));

    setDateDoctorIpRows(rows);
    setDateDoctorIpTotal(rows.reduce((sum, row) => sum + row.totalPatients, 0));
  };

  const handleDateGeneralIpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateYearRange(dateGeneralIpFromYear, dateGeneralIpToYear)) {
      return;
    }
    setDateGeneralIpRows(buildMonthlyRows(dateGeneralIpFromYear, dateGeneralIpToYear, 8300, 46));
  };

  const handleDateComparisonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateDateRange(dateComparisonFromDate, dateComparisonToDate)) {
      return;
    }
    setDateComparisonRun(true);
  };

  const handleDiagnosisSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateDateRange(diagnosisFromDate, diagnosisToDate)) {
      return;
    }

    const labels = ['Fever', 'Diabetes', 'Hypertension', 'Asthma', 'Migraine', 'Gastritis'];
    setDiagnosisRows(
      labels.map((diagnosis, index) => ({
        diagnosis,
        count: getMonthCount(currentYear, index + 1, 8400, 55)
      }))
    );
  };

  const selectedDepartmentOpName = departmentOptions.find((dept) => dept.id === departmentOpDepartmentId)?.name || '';
  const selectedDoctorOpName = doctorOptions.find((doc) => doc.id === doctorOpDoctorId)?.name || '';
  const selectedDepartmentIpName = departmentOptions.find((dept) => dept.id === departmentIpDepartmentId)?.name || '';
  const selectedDoctorIpName = doctorOptions.find((doc) => doc.id === doctorIpDoctorId)?.name || '';
  const selectedBetweenDepartmentOpName =
    betweenDepartmentOpDepartmentId === 0
      ? 'All'
      : departmentOptions.find((dept) => dept.id === betweenDepartmentOpDepartmentId)?.name || 'All';
  const selectedBetweenDoctorOpName = doctorOptions.find((doc) => doc.id === betweenDoctorOpDoctorId)?.name || '';
  const selectedBetweenDepartmentIpName = departmentOptions.find((dept) => dept.id === betweenDepartmentIpDepartmentId)?.name || '';
  const selectedBetweenDoctorIpName = doctorOptions.find((doc) => doc.id === betweenDoctorIpDoctorId)?.name || '';
  const selectedDateDepartmentOpName =
    dateDepartmentOpDepartmentId === 0
      ? 'All'
      : departmentOptions.find((dept) => dept.id === dateDepartmentOpDepartmentId)?.name || 'All';
  const selectedDateDoctorOpName = doctorOptions.find((doc) => doc.id === dateDoctorOpDoctorId)?.name || '';
  const selectedDateDepartmentIpName =
    departmentOptions.find((dept) => dept.id === dateDepartmentIpDepartmentId)?.name || '';

  const comparisonOpSummary = useMemo(() => {
    return comparisonYears.map((year) => {
      const newRegister = getMonthCount(year, 1, 901, 400);
      const repeatRegister = getMonthCount(year, 2, 902, 320);
      const male = getMonthCount(year, 3, 903, 410);
      const female = getMonthCount(year, 4, 904, 390);
      return {
        year,
        newRegister,
        repeatRegister,
        totalRegister: newRegister + repeatRegister,
        male,
        female,
        totalSex: male + female
      };
    });
  }, [comparisonYears]);

  const comparisonIpSexSummary = useMemo(() => {
    return comparisonYears.map((year) => {
      const male = getMonthCount(year, 1, 951, 210);
      const female = getMonthCount(year, 2, 952, 200);
      return {
        year,
        male,
        female,
        total: male + female
      };
    });
  }, [comparisonYears]);

  const opReligionRows = useMemo(() => {
    return religionOptions.map((religion, index) => ({
      religion,
      values: comparisonYears.map((year) => getMonthCount(year, index + 1, 1000 + index, 160))
    }));
  }, [comparisonYears]);

  const ipReligionRows = useMemo(() => {
    return religionOptions.map((religion, index) => ({
      religion,
      values: comparisonYears.map((year) => getMonthCount(year, index + 1, 1100 + index, 120))
    }));
  }, [comparisonYears]);

  const opDepartmentRows = useMemo(() => {
    return departmentOptions.map((dept, index) => ({
      department: dept.name,
      values: comparisonYears.map((year) => getMonthCount(year, index + 1, 1200 + dept.id, 180))
    }));
  }, [comparisonYears]);

  const ipDepartmentRows = useMemo(() => {
    return departmentOptions.map((dept, index) => ({
      department: dept.name,
      values: comparisonYears.map((year) => getMonthCount(year, index + 1, 1300 + dept.id, 140))
    }));
  }, [comparisonYears]);

  const dateComparisonSummary = useMemo(() => {
    if (!dateComparisonRun) {
      return null;
    }

    const opNew = getMonthCount(currentYear, 1, 9001, 250);
    const opRepeat = getMonthCount(currentYear, 2, 9002, 210);
    const opMale = getMonthCount(currentYear, 3, 9003, 240);
    const opFemale = getMonthCount(currentYear, 4, 9004, 230);

    const religions = religionOptions.map((name, index) => ({
      name,
      opCount: getMonthCount(currentYear, index + 1, 9100, 120),
      ipCount: getMonthCount(currentYear, index + 1, 9200, 90)
    }));

    const departments = departmentOptions.map((dept, index) => ({
      name: dept.name,
      opCount: getMonthCount(currentYear, index + 1, 9300 + dept.id, 150),
      ipCount: getMonthCount(currentYear, index + 1, 9400 + dept.id, 110)
    }));

    const ipMale = getMonthCount(currentYear, 5, 9005, 130);
    const ipFemale = getMonthCount(currentYear, 6, 9006, 125);

    return {
      opNew,
      opRepeat,
      opMale,
      opFemale,
      opTotalSex: opMale + opFemale,
      religions,
      departments,
      ipMale,
      ipFemale,
      ipTotalSex: ipMale + ipFemale,
      opReligionTotal: religions.reduce((sum, item) => sum + item.opCount, 0),
      ipReligionTotal: religions.reduce((sum, item) => sum + item.ipCount, 0),
      opDeptTotal: departments.reduce((sum, item) => sum + item.opCount, 0),
      ipDeptTotal: departments.reduce((sum, item) => sum + item.ipCount, 0)
    };
  }, [currentYear, dateComparisonRun]);

  const renderYearComparisonGrid = (
    title: string,
    rowLabel: string,
    rows: Array<{ label: string; values: number[] }>
  ) => {
    if (!comparisonYears.length) {
      return null;
    }

    const totalsByYear = comparisonYears.map((_, yearIndex) => {
      return rows.reduce((sum, row) => sum + row.values[yearIndex], 0);
    });

    return (
      <Card className="border-0 shadow-sm mb-4">
        <Card.Header className="bg-light fw-semibold">{title}</Card.Header>
        <Card.Body>
          <Table striped bordered responsive className="align-middle mb-0">
            <thead>
              <tr>
                <th>{rowLabel}</th>
                {comparisonYears.map((year) => (
                  <th key={`${title}-${year}`} className="text-end">
                    {year}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={`${title}-${row.label}`}>
                  <td>{row.label}</td>
                  {row.values.map((value, index) => (
                    <td key={`${row.label}-${index}`} className="text-end">
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="table-light fw-semibold">
                <td>Total</td>
                {totalsByYear.map((value, index) => (
                  <td key={`${title}-total-${index}`} className="text-end">
                    {value}
                  </td>
                ))}
              </tr>
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    );
  };

  const renderBetweenDailyTable = (rows: BetweenDailyRow[]) => {
    if (!rows.length) {
      return null;
    }

    return (
      <Table striped bordered hover responsive className="align-middle mb-0">
        <thead>
          <tr>
            <th>Month</th>
            {Array.from({ length: 31 }, (_, index) => (
              <th key={`day-header-${index + 1}`} className="text-end">
                {index + 1}
              </th>
            ))}
            <th className="text-end">Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.month}>
              <td>{row.month}</td>
              {row.dailyCounts.map((value, index) => (
                <td key={`${row.month}-${index + 1}`} className="text-end">
                  {value}
                </td>
              ))}
              <td className="text-end fw-semibold">{row.total}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  };

  const renderRatioTable = (title: string, rows: RatioRow[]) => {
    if (!rows.length) {
      return null;
    }

    return (
      <Card className="border-0 shadow-sm mb-3">
        <Card.Header className="bg-light fw-semibold">{title}</Card.Header>
        <Card.Body>
          <Table striped bordered hover responsive className="align-middle mb-0">
            <thead>
              <tr>
                <th>{title}</th>
                <th className="text-end">Number of Patients</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={`${title}-${row.label}`}>
                  <td>{row.label}</td>
                  <td className="text-end">{row.count}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    );
  };

  const renderYearReportContent = () => {
    if (activeYearReportTab === 'department-op') {
      return (
        <>
          <Card className="border-0 shadow-sm mb-3">
            <Card.Header className="bg-light fw-semibold">Particular Department [OP] - Between Years</Card.Header>
            <Card.Body>
              <Form onSubmit={handleDepartmentOpSubmit}>
                <Row className="g-3 align-items-end">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Select the Department</Form.Label>
                      <Form.Select value={departmentOpDepartmentId} onChange={(e) => setDepartmentOpDepartmentId(Number(e.target.value))}>
                        {departmentOptions.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Select I Year</Form.Label>
                      <Form.Select value={departmentOpFromYear} onChange={(e) => setDepartmentOpFromYear(Number(e.target.value))}>
                        {yearOptions.map((year) => (
                          <option key={`dop-from-${year}`} value={year}>
                            {year}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Select II Year</Form.Label>
                      <Form.Select value={departmentOpToYear} onChange={(e) => setDepartmentOpToYear(Number(e.target.value))}>
                        {yearOptions.map((year) => (
                          <option key={`dop-to-${year}`} value={year}>
                            {year}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={2} className="d-grid">
                    <Button type="submit">Submit</Button>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>

          {departmentOpRows.length > 0 && (
            <Card className="border-0 shadow-sm">
              <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                <span className="fw-semibold">Particular Department [OP] - Between Years of "{selectedDepartmentOpName}"</span>
                <Button variant="outline-primary" size="sm" onClick={() => window.print()}>
                  Print
                </Button>
              </Card.Header>
              <Card.Body>
                <YearMonthTable rows={departmentOpRows} />
              </Card.Body>
            </Card>
          )}
        </>
      );
    }

    if (activeYearReportTab === 'doctor-op') {
      return (
        <>
          <Card className="border-0 shadow-sm mb-3">
            <Card.Header className="bg-light fw-semibold">Particular Doctor [OP] - Between Years</Card.Header>
            <Card.Body>
              <Form onSubmit={handleDoctorOpSubmit}>
                <Row className="g-3 align-items-end">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Select the Consultant</Form.Label>
                      <Form.Select value={doctorOpDoctorId} onChange={(e) => setDoctorOpDoctorId(Number(e.target.value))}>
                        {doctorOptions.map((doctor) => (
                          <option key={doctor.id} value={doctor.id}>
                            {doctor.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Select I Year</Form.Label>
                      <Form.Select value={doctorOpFromYear} onChange={(e) => setDoctorOpFromYear(Number(e.target.value))}>
                        {yearOptions.map((year) => (
                          <option key={`docop-from-${year}`} value={year}>
                            {year}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Select II Year</Form.Label>
                      <Form.Select value={doctorOpToYear} onChange={(e) => setDoctorOpToYear(Number(e.target.value))}>
                        {yearOptions.map((year) => (
                          <option key={`docop-to-${year}`} value={year}>
                            {year}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={2} className="d-grid">
                    <Button type="submit">Submit</Button>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>

          {doctorOpRows.length > 0 && (
            <Card className="border-0 shadow-sm">
              <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                <span className="fw-semibold">Particular Doctor [OP] - Between Years of "{selectedDoctorOpName}"</span>
                <Button variant="outline-primary" size="sm" onClick={() => window.print()}>
                  Print
                </Button>
              </Card.Header>
              <Card.Body>
                <YearMonthTable rows={doctorOpRows} showTotalRow={false} />
              </Card.Body>
            </Card>
          )}
        </>
      );
    }

    if (activeYearReportTab === 'general-op') {
      return (
        <>
          <Card className="border-0 shadow-sm mb-3">
            <Card.Header className="bg-light fw-semibold">General [OP] - Between Years</Card.Header>
            <Card.Body>
              <Form onSubmit={handleGeneralOpSubmit}>
                <Row className="g-3 align-items-end">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Select I Year</Form.Label>
                      <Form.Select value={generalOpFromYear} onChange={(e) => setGeneralOpFromYear(Number(e.target.value))}>
                        {yearOptions.map((year) => (
                          <option key={`gop-from-${year}`} value={year}>
                            {year}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Select II Year</Form.Label>
                      <Form.Select value={generalOpToYear} onChange={(e) => setGeneralOpToYear(Number(e.target.value))}>
                        {yearOptions.map((year) => (
                          <option key={`gop-to-${year}`} value={year}>
                            {year}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4} className="d-grid">
                    <Button type="submit">Submit</Button>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>

          {generalOpRows.length > 0 && (
            <Card className="border-0 shadow-sm">
              <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                <span className="fw-semibold">General [OP] - Between Years</span>
                <Button variant="outline-primary" size="sm" onClick={() => window.print()}>
                  Print
                </Button>
              </Card.Header>
              <Card.Body>
                <YearMonthTable rows={generalOpRows} showTotalRow={false} />
              </Card.Body>
            </Card>
          )}
        </>
      );
    }

    if (activeYearReportTab === 'department-ip') {
      return (
        <>
          <Card className="border-0 shadow-sm mb-3">
            <Card.Header className="bg-light fw-semibold">Particular Department [IP] - Between Years</Card.Header>
            <Card.Body>
              <Form onSubmit={handleDepartmentIpSubmit}>
                <Row className="g-3 align-items-end">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Select the Department</Form.Label>
                      <Form.Select value={departmentIpDepartmentId} onChange={(e) => setDepartmentIpDepartmentId(Number(e.target.value))}>
                        {departmentOptions.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Select I Year</Form.Label>
                      <Form.Select value={departmentIpFromYear} onChange={(e) => setDepartmentIpFromYear(Number(e.target.value))}>
                        {yearOptions.map((year) => (
                          <option key={`dip-from-${year}`} value={year}>
                            {year}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Select II Year</Form.Label>
                      <Form.Select value={departmentIpToYear} onChange={(e) => setDepartmentIpToYear(Number(e.target.value))}>
                        {yearOptions.map((year) => (
                          <option key={`dip-to-${year}`} value={year}>
                            {year}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={2} className="d-grid">
                    <Button type="submit">Submit</Button>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>

          {departmentIpRows.length > 0 && (
            <Card className="border-0 shadow-sm">
              <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                <span className="fw-semibold">Particular Department [IP] - Between Years of "{selectedDepartmentIpName}"</span>
                <Button variant="outline-primary" size="sm" onClick={() => window.print()}>
                  Print
                </Button>
              </Card.Header>
              <Card.Body>
                <YearMonthTable rows={departmentIpRows} showTotalRow={false} />
              </Card.Body>
            </Card>
          )}
        </>
      );
    }

    if (activeYearReportTab === 'doctor-ip') {
      return (
        <>
          <Card className="border-0 shadow-sm mb-3">
            <Card.Header className="bg-light fw-semibold">Particular Doctor [IP] - Between Year Wise</Card.Header>
            <Card.Body>
              <Form onSubmit={handleDoctorIpSubmit}>
                <Row className="g-3 align-items-end">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Select the Consultant</Form.Label>
                      <Form.Select value={doctorIpDoctorId} onChange={(e) => setDoctorIpDoctorId(Number(e.target.value))}>
                        {doctorOptions.map((doctor) => (
                          <option key={doctor.id} value={doctor.id}>
                            {doctor.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Select I Year</Form.Label>
                      <Form.Select value={doctorIpFromYear} onChange={(e) => setDoctorIpFromYear(Number(e.target.value))}>
                        {yearOptions.map((year) => (
                          <option key={`docip-from-${year}`} value={year}>
                            {year}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Select II Year</Form.Label>
                      <Form.Select value={doctorIpToYear} onChange={(e) => setDoctorIpToYear(Number(e.target.value))}>
                        {yearOptions.map((year) => (
                          <option key={`docip-to-${year}`} value={year}>
                            {year}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={2} className="d-grid">
                    <Button type="submit">Submit</Button>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>

          {doctorIpRows.length > 0 && (
            <Card className="border-0 shadow-sm">
              <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                <span className="fw-semibold">Particular Doctor [IP] - Between Year Wise "{selectedDoctorIpName}"</span>
                <Button variant="outline-primary" size="sm" onClick={() => window.print()}>
                  Print
                </Button>
              </Card.Header>
              <Card.Body>
                <YearMonthTable rows={doctorIpRows} showTotalRow={false} />
              </Card.Body>
            </Card>
          )}
        </>
      );
    }

    if (activeYearReportTab === 'general-ip') {
      return (
        <>
          <Card className="border-0 shadow-sm mb-3">
            <Card.Header className="bg-light fw-semibold">General [IP] - Between Years</Card.Header>
            <Card.Body>
              <Form onSubmit={handleGeneralIpSubmit}>
                <Row className="g-3 align-items-end">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Select I Year</Form.Label>
                      <Form.Select value={generalIpFromYear} onChange={(e) => setGeneralIpFromYear(Number(e.target.value))}>
                        {yearOptions.map((year) => (
                          <option key={`gip-from-${year}`} value={year}>
                            {year}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Select II Year</Form.Label>
                      <Form.Select value={generalIpToYear} onChange={(e) => setGeneralIpToYear(Number(e.target.value))}>
                        {yearOptions.map((year) => (
                          <option key={`gip-to-${year}`} value={year}>
                            {year}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4} className="d-grid">
                    <Button type="submit">Submit</Button>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>

          {generalIpRows.length > 0 && (
            <Card className="border-0 shadow-sm">
              <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                <span className="fw-semibold">General [IP] - Between Years</span>
                <Button variant="outline-primary" size="sm" onClick={() => window.print()}>
                  Print
                </Button>
              </Card.Header>
              <Card.Body>
                <YearMonthTable rows={generalIpRows} showTotalRow={false} />
              </Card.Body>
            </Card>
          )}
        </>
      );
    }

    if (activeYearReportTab === 'year-comparison') {
      return (
        <>
          <Card className="border-0 shadow-sm mb-3">
            <Card.Header className="bg-light fw-semibold">Comparison Year Wise Out-Patient / In-Patient Report</Card.Header>
            <Card.Body>
              <Form onSubmit={handleYearComparisonSubmit}>
                <Row className="g-3 align-items-end">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>From Year</Form.Label>
                      <Form.Select value={comparisonFromYear} onChange={(e) => setComparisonFromYear(Number(e.target.value))}>
                        {yearOptions.map((year) => (
                          <option key={`cmp-from-${year}`} value={year}>
                            {year}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>To Year</Form.Label>
                      <Form.Select value={comparisonToYear} onChange={(e) => setComparisonToYear(Number(e.target.value))}>
                        {yearOptions.map((year) => (
                          <option key={`cmp-to-${year}`} value={year}>
                            {year}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4} className="d-grid">
                    <Button type="submit">Submit</Button>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>

          {comparisonYears.length > 0 && (
            <>
              <Card className="border-0 shadow-sm mb-4">
                <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                  <span className="fw-semibold">Year Wise Out-Patient Report</span>
                  <Button variant="outline-primary" size="sm" onClick={() => window.print()}>
                    Print
                  </Button>
                </Card.Header>
                <Card.Body>
                  <Table striped bordered responsive className="align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Particulars</th>
                        {comparisonYears.map((year) => (
                          <th key={`op-summary-${year}`} className="text-end">
                            {year}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>New Register</td>
                        {comparisonOpSummary.map((row) => (
                          <td key={`new-${row.year}`} className="text-end">
                            {row.newRegister}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td>Repeat Register</td>
                        {comparisonOpSummary.map((row) => (
                          <td key={`repeat-${row.year}`} className="text-end">
                            {row.repeatRegister}
                          </td>
                        ))}
                      </tr>
                      <tr className="table-light fw-semibold">
                        <td>Total</td>
                        {comparisonOpSummary.map((row) => (
                          <td key={`total-register-${row.year}`} className="text-end">
                            {row.totalRegister}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td>Male</td>
                        {comparisonOpSummary.map((row) => (
                          <td key={`male-${row.year}`} className="text-end">
                            {row.male}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td>Female</td>
                        {comparisonOpSummary.map((row) => (
                          <td key={`female-${row.year}`} className="text-end">
                            {row.female}
                          </td>
                        ))}
                      </tr>
                      <tr className="table-light fw-semibold">
                        <td>Total</td>
                        {comparisonOpSummary.map((row) => (
                          <td key={`total-sex-${row.year}`} className="text-end">
                            {row.totalSex}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>

              {renderYearComparisonGrid(
                'Religion Wise (Out-Patient)',
                'Patient Name',
                opReligionRows.map((row) => ({ label: row.religion, values: row.values }))
              )}

              {renderYearComparisonGrid(
                'Department Wise (Out-Patient)',
                'Department Name',
                opDepartmentRows.map((row) => ({ label: row.department, values: row.values }))
              )}

              <Card className="border-0 shadow-sm mb-4">
                <Card.Header className="bg-light fw-semibold">Year Wise In-Patient Report (Sex Wise)</Card.Header>
                <Card.Body>
                  <Table striped bordered responsive className="align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Particulars</th>
                        {comparisonYears.map((year) => (
                          <th key={`ip-sex-${year}`} className="text-end">
                            {year}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Male</td>
                        {comparisonIpSexSummary.map((row) => (
                          <td key={`ip-male-${row.year}`} className="text-end">
                            {row.male}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td>Female</td>
                        {comparisonIpSexSummary.map((row) => (
                          <td key={`ip-female-${row.year}`} className="text-end">
                            {row.female}
                          </td>
                        ))}
                      </tr>
                      <tr className="table-light fw-semibold">
                        <td>Total</td>
                        {comparisonIpSexSummary.map((row) => (
                          <td key={`ip-total-${row.year}`} className="text-end">
                            {row.total}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>

              {renderYearComparisonGrid(
                'Religion Wise (In-Patient)',
                'Patient Name',
                ipReligionRows.map((row) => ({ label: row.religion, values: row.values }))
              )}

              {renderYearComparisonGrid(
                'Department Wise (In-Patient)',
                'Department Name',
                ipDepartmentRows.map((row) => ({ label: row.department, values: row.values }))
              )}
            </>
          )}
        </>
      );
    }

    if (activeYearReportTab === 'birth-report') {
      const birthTotal = birthRows.reduce((sum, row) => sum + row.total, 0);

      return (
        <>
          <Card className="border-0 shadow-sm mb-3">
            <Card.Header className="bg-light fw-semibold">Birth Register - Between Years</Card.Header>
            <Card.Body>
              <Form onSubmit={handleBirthSubmit}>
                <Row className="g-3 align-items-end">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Select Type</Form.Label>
                      <Form.Select value={birthType} onChange={(e) => setBirthType(e.target.value as BirthType)}>
                        <option value="live">Live birth</option>
                        <option value="still">Still birth</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Select From</Form.Label>
                      <Form.Select value={birthFromYear} onChange={(e) => setBirthFromYear(Number(e.target.value))}>
                        {yearOptions.map((year) => (
                          <option key={`birth-from-${year}`} value={year}>
                            {year}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Select To</Form.Label>
                      <Form.Select value={birthToYear} onChange={(e) => setBirthToYear(Number(e.target.value))}>
                        {yearOptions.map((year) => (
                          <option key={`birth-to-${year}`} value={year}>
                            {year}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={2} className="d-grid">
                    <Button type="submit">Submit</Button>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>

          {birthRows.length > 0 && (
            <Card className="border-0 shadow-sm">
              <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                <span className="fw-semibold">Birth Register - Between Years {birthFromYear} and {birthToYear}</span>
                <Button variant="outline-primary" size="sm" onClick={() => window.print()}>
                  Print
                </Button>
              </Card.Header>
              <Card.Body>
                <Table striped bordered hover responsive className="align-middle mb-3">
                  <thead>
                    <tr>
                      <th>S. No</th>
                      <th>Year</th>
                      <th className="text-end">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {birthRows.map((row, index) => (
                      <tr key={`birth-row-${row.year}`}>
                        <td>{index + 1}</td>
                        <td>{row.year}</td>
                        <td className="text-end">{row.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <Badge bg="secondary">Total: {birthTotal}</Badge>
              </Card.Body>
            </Card>
          )}
        </>
      );
    }

    const deliveryTotal = deliveryRows.reduce((sum, row) => sum + row.total, 0);

    return (
      <>
        <Card className="border-0 shadow-sm mb-3">
          <Card.Header className="bg-light fw-semibold">Delivery Register - Between Years</Card.Header>
          <Card.Body>
            <Form onSubmit={handleDeliverySubmit}>
              <Row className="g-3 align-items-end">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Select The Type</Form.Label>
                    <Form.Select value={deliveryType} onChange={(e) => setDeliveryType(e.target.value as DeliveryType)}>
                      <option value="Forceps">Forceps</option>
                      <option value="LSCS">LSCS</option>
                      <option value="Normal">Normal</option>
                      <option value="Vaccum">Vaccum</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>From Year</Form.Label>
                    <Form.Select value={deliveryFromYear} onChange={(e) => setDeliveryFromYear(Number(e.target.value))}>
                      {yearOptions.map((year) => (
                        <option key={`delivery-from-${year}`} value={year}>
                          {year}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>To Year</Form.Label>
                    <Form.Select value={deliveryToYear} onChange={(e) => setDeliveryToYear(Number(e.target.value))}>
                      {yearOptions.map((year) => (
                        <option key={`delivery-to-${year}`} value={year}>
                          {year}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={2} className="d-grid">
                  <Button type="submit">Submit</Button>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>

        {deliveryRows.length > 0 && (
          <Card className="border-0 shadow-sm">
            <Card.Header className="d-flex justify-content-between align-items-center bg-light">
              <span className="fw-semibold">Delivery Register - Between Years ({deliveryType})</span>
              <Button variant="outline-primary" size="sm" onClick={() => window.print()}>
                Print
              </Button>
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover responsive className="align-middle mb-3">
                <thead>
                  <tr>
                    <th>S. No</th>
                    <th>Year</th>
                    <th className="text-end">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveryRows.map((row, index) => (
                    <tr key={`delivery-row-${row.year}`}>
                      <td>{index + 1}</td>
                      <td>{row.year}</td>
                      <td className="text-end">{row.total}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <Badge bg="secondary">Total: {deliveryTotal}</Badge>
            </Card.Body>
          </Card>
        )}
      </>
    );
  };

  const renderBetweenReportContent = () => {
    if (activeBetweenReportTab === 'department-op') {
      return (
        <>
          <Card className="border-0 shadow-sm mb-3">
            <Card.Header className="bg-light fw-semibold">Department [OP] - Between Dates</Card.Header>
            <Card.Body>
              <Form onSubmit={handleBetweenDepartmentOpSubmit}>
                <Row className="g-3 align-items-end">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Department Name</Form.Label>
                      <Form.Select
                        value={betweenDepartmentOpDepartmentId}
                        onChange={(e) => setBetweenDepartmentOpDepartmentId(Number(e.target.value))}
                      >
                        <option value={0}>All</option>
                        {departmentOptions.map((dept) => (
                          <option key={`between-dept-op-${dept.id}`} value={dept.id}>
                            {dept.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>From Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={betweenDepartmentOpFromDate}
                        onChange={(e) => setBetweenDepartmentOpFromDate(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>To Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={betweenDepartmentOpToDate}
                        onChange={(e) => setBetweenDepartmentOpToDate(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2} className="d-grid">
                    <Button type="submit">Submit</Button>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>

          {betweenDepartmentOpVisits.length > 0 && (
            <Card className="border-0 shadow-sm">
              <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                <span className="fw-semibold">
                  Department [OP] - Between Dates [{formatDateLabel(betweenDepartmentOpFromDate)} & {formatDateLabel(betweenDepartmentOpToDate)}]
                </span>
                <Button variant="outline-primary" size="sm" onClick={() => window.print()}>
                  Print
                </Button>
              </Card.Header>
              <Card.Body>
                <Row className="mb-3 g-3">
                  <Col md={6}>
                    <Badge bg="light" text="dark" className="border">
                      Department Name: {selectedBetweenDepartmentOpName}
                    </Badge>
                  </Col>
                  <Col md={6} className="text-md-end">
                    <Badge bg="secondary">Total no of Patient: {betweenDepartmentOpVisits.length}</Badge>
                  </Col>
                </Row>
                <Table striped bordered hover responsive className="align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Sl.No.</th>
                      <th>Patient Number</th>
                      <th>Patient Name</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Token</th>
                    </tr>
                  </thead>
                  <tbody>
                    {betweenDepartmentOpVisits.map((visit, index) => (
                      <tr key={`${visit.patientNumber}-${index}`}>
                        <td>{index + 1}</td>
                        <td>{visit.patientNumber}</td>
                        <td>{visit.patientName}</td>
                        <td>{visit.date}</td>
                        <td>{visit.time}</td>
                        <td>{visit.token}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          )}
        </>
      );
    }

    if (activeBetweenReportTab === 'doctor-op') {
      return (
        <>
          <Card className="border-0 shadow-sm mb-3">
            <Card.Header className="bg-light fw-semibold">Doctor [OP] Between Months</Card.Header>
            <Card.Body>
              <Form onSubmit={handleBetweenDoctorOpSubmit}>
                <Row className="g-3 align-items-end">
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Doctor Name</Form.Label>
                      <Form.Select
                        value={betweenDoctorOpDoctorId}
                        onChange={(e) => setBetweenDoctorOpDoctorId(Number(e.target.value))}
                      >
                        {doctorOptions.map((doctor) => (
                          <option key={`between-doc-op-${doctor.id}`} value={doctor.id}>
                            {doctor.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Select The Year</Form.Label>
                      <Form.Select value={betweenDoctorOpYear} onChange={(e) => setBetweenDoctorOpYear(Number(e.target.value))}>
                        {yearOptions.map((year) => (
                          <option key={`between-doc-op-year-${year}`} value={year}>
                            {year}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>Select From Month</Form.Label>
                      <Form.Select
                        value={betweenDoctorOpFromMonth}
                        onChange={(e) => setBetweenDoctorOpFromMonth(Number(e.target.value))}
                      >
                        {MONTHS.map((month, index) => (
                          <option key={`between-doc-op-from-${month}`} value={index + 1}>
                            {month}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>Select To Month</Form.Label>
                      <Form.Select value={betweenDoctorOpToMonth} onChange={(e) => setBetweenDoctorOpToMonth(Number(e.target.value))}>
                        {MONTHS.map((month, index) => (
                          <option key={`between-doc-op-to-${month}`} value={index + 1}>
                            {month}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={2} className="d-grid">
                    <Button type="submit">Submit</Button>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>

          {betweenDoctorOpRows.length > 0 && (
            <Card className="border-0 shadow-sm">
              <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                <span className="fw-semibold">
                  Doctor [OP] Between Months - Year: {betweenDoctorOpYear} - Doctor: {selectedBetweenDoctorOpName}
                </span>
                <Button variant="outline-primary" size="sm" onClick={() => window.print()}>
                  Print
                </Button>
              </Card.Header>
              <Card.Body>{renderBetweenDailyTable(betweenDoctorOpRows)}</Card.Body>
            </Card>
          )}
        </>
      );
    }

    if (activeBetweenReportTab === 'general-op') {
      const generalTotal = betweenGeneralOpVillageRows.reduce((sum, row) => sum + row.count, 0);

      return (
        <>
          <Card className="border-0 shadow-sm mb-3">
            <Card.Header className="bg-light fw-semibold">General [OP] - Between Dates</Card.Header>
            <Card.Body>
              <Form
                onSubmit={(e) => {
                  if (
                    betweenGeneralOpFromDate === betweenGeneralOpToDate &&
                    betweenGeneralOpFromTime > betweenGeneralOpToTime
                  ) {
                    e.preventDefault();
                    showValidationError('From Time should be less than or equal to To Time for same date');
                    return;
                  }
                  handleBetweenGeneralOpSubmit(e);
                }}
              >
                <Row className="g-3 align-items-end">
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Date From</Form.Label>
                      <Form.Control
                        type="date"
                        value={betweenGeneralOpFromDate}
                        onChange={(e) => setBetweenGeneralOpFromDate(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Time From</Form.Label>
                      <Form.Control
                        type="time"
                        step={1}
                        value={betweenGeneralOpFromTime}
                        onChange={(e) => setBetweenGeneralOpFromTime(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>Date To</Form.Label>
                      <Form.Control
                        type="date"
                        value={betweenGeneralOpToDate}
                        onChange={(e) => setBetweenGeneralOpToDate(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>Time To</Form.Label>
                      <Form.Control
                        type="time"
                        step={1}
                        value={betweenGeneralOpToTime}
                        onChange={(e) => setBetweenGeneralOpToTime(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2} className="d-grid">
                    <Button type="submit">Submit</Button>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>

          {betweenGeneralOpVillageRows.length > 0 && (
            <>
              <Card className="border-0 shadow-sm mb-3">
                <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                  <span className="fw-semibold">Statistics Between The Date</span>
                  <Button variant="outline-primary" size="sm" onClick={() => window.print()}>
                    Print
                  </Button>
                </Card.Header>
                <Card.Body>
                  <Row className="g-3">
                    <Col md={4}>
                      <Badge bg="light" text="dark" className="border w-100 text-start">
                        Total No Of Patients: {generalTotal}
                      </Badge>
                    </Col>
                    <Col md={4}>
                      <Badge bg="light" text="dark" className="border w-100 text-start">
                        From Date: {formatDateLabel(betweenGeneralOpFromDate)} ({betweenGeneralOpFromTime})
                      </Badge>
                    </Col>
                    <Col md={4}>
                      <Badge bg="light" text="dark" className="border w-100 text-start">
                        To Date: {formatDateLabel(betweenGeneralOpToDate)} ({betweenGeneralOpToTime})
                      </Badge>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {renderRatioTable('Village wise Ratio', betweenGeneralOpVillageRows)}
              {renderRatioTable('Post wise Ratio', betweenGeneralOpPostRows)}
              {renderRatioTable('Taluk wise Ratio', betweenGeneralOpTalukRows)}
              {renderRatioTable('District wise Ratio', betweenGeneralOpDistrictRows)}
            </>
          )}
        </>
      );
    }

    if (activeBetweenReportTab === 'department-ip') {
      return (
        <>
          <Card className="border-0 shadow-sm mb-3">
            <Card.Header className="bg-light fw-semibold">Department [IP] - Between Months</Card.Header>
            <Card.Body>
              <Form onSubmit={handleBetweenDepartmentIpSubmit}>
                <Row className="g-3 align-items-end">
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Select Department</Form.Label>
                      <Form.Select
                        value={betweenDepartmentIpDepartmentId}
                        onChange={(e) => setBetweenDepartmentIpDepartmentId(Number(e.target.value))}
                      >
                        {departmentOptions.map((dept) => (
                          <option key={`between-dept-ip-${dept.id}`} value={dept.id}>
                            {dept.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Select The Year</Form.Label>
                      <Form.Select value={betweenDepartmentIpYear} onChange={(e) => setBetweenDepartmentIpYear(Number(e.target.value))}>
                        {yearOptions.map((year) => (
                          <option key={`between-dept-ip-year-${year}`} value={year}>
                            {year}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>Select From Month</Form.Label>
                      <Form.Select
                        value={betweenDepartmentIpFromMonth}
                        onChange={(e) => setBetweenDepartmentIpFromMonth(Number(e.target.value))}
                      >
                        {MONTHS.map((month, index) => (
                          <option key={`between-dept-ip-from-${month}`} value={index + 1}>
                            {month}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>Select To Month</Form.Label>
                      <Form.Select
                        value={betweenDepartmentIpToMonth}
                        onChange={(e) => setBetweenDepartmentIpToMonth(Number(e.target.value))}
                      >
                        {MONTHS.map((month, index) => (
                          <option key={`between-dept-ip-to-${month}`} value={index + 1}>
                            {month}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={2} className="d-grid">
                    <Button type="submit">Submit</Button>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>

          {betweenDepartmentIpRows.length > 0 && (
            <Card className="border-0 shadow-sm">
              <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                <span className="fw-semibold">
                  Department [IP] - Between Months - Year: {betweenDepartmentIpYear} - Department: {selectedBetweenDepartmentIpName}
                </span>
                <Button variant="outline-primary" size="sm" onClick={() => window.print()}>
                  Print
                </Button>
              </Card.Header>
              <Card.Body>{renderBetweenDailyTable(betweenDepartmentIpRows)}</Card.Body>
            </Card>
          )}
        </>
      );
    }

    return (
      <>
        <Card className="border-0 shadow-sm mb-3">
          <Card.Header className="bg-light fw-semibold">Doctor [IP] - Between Months</Card.Header>
          <Card.Body>
            <Form onSubmit={handleBetweenDoctorIpSubmit}>
              <Row className="g-3 align-items-end">
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Select the Consultant</Form.Label>
                    <Form.Select
                      value={betweenDoctorIpDoctorId}
                      onChange={(e) => setBetweenDoctorIpDoctorId(Number(e.target.value))}
                    >
                      {doctorOptions.map((doctor) => (
                        <option key={`between-doc-ip-${doctor.id}`} value={doctor.id}>
                          {doctor.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Select The Year</Form.Label>
                    <Form.Select value={betweenDoctorIpYear} onChange={(e) => setBetweenDoctorIpYear(Number(e.target.value))}>
                      {yearOptions.map((year) => (
                        <option key={`between-doc-ip-year-${year}`} value={year}>
                          {year}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Select From Month</Form.Label>
                    <Form.Select value={betweenDoctorIpFromMonth} onChange={(e) => setBetweenDoctorIpFromMonth(Number(e.target.value))}>
                      {MONTHS.map((month, index) => (
                        <option key={`between-doc-ip-from-${month}`} value={index + 1}>
                          {month}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Select To Month</Form.Label>
                    <Form.Select value={betweenDoctorIpToMonth} onChange={(e) => setBetweenDoctorIpToMonth(Number(e.target.value))}>
                      {MONTHS.map((month, index) => (
                        <option key={`between-doc-ip-to-${month}`} value={index + 1}>
                          {month}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={2} className="d-grid">
                  <Button type="submit">Submit</Button>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>

        {betweenDoctorIpRows.length > 0 && (
          <Card className="border-0 shadow-sm">
            <Card.Header className="d-flex justify-content-between align-items-center bg-light">
              <span className="fw-semibold">
                Doctor [IP] - Between Months - Year: {betweenDoctorIpYear} - Consultant: {selectedBetweenDoctorIpName}
              </span>
              <Button variant="outline-primary" size="sm" onClick={() => window.print()}>
                Print
              </Button>
            </Card.Header>
            <Card.Body>{renderBetweenDailyTable(betweenDoctorIpRows)}</Card.Body>
          </Card>
        )}
      </>
    );
  };

  const renderDateReportContent = () => {
    if (activeDateReportTab === 'department-op') {
      return (
        <>
          <Card className="border-0 shadow-sm mb-3">
            <Card.Header className="bg-light fw-semibold">Department [OP] - Between Dates</Card.Header>
            <Card.Body>
              <Form onSubmit={handleDateDepartmentOpSubmit}>
                <Row className="g-3 align-items-end">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Department Name</Form.Label>
                      <Form.Select value={dateDepartmentOpDepartmentId} onChange={(e) => setDateDepartmentOpDepartmentId(Number(e.target.value))}>
                        <option value={0}>All</option>
                        {departmentOptions.map((dept) => (
                          <option key={`date-dept-op-${dept.id}`} value={dept.id}>
                            {dept.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>From Date</Form.Label>
                      <Form.Control type="date" value={dateDepartmentOpFromDate} onChange={(e) => setDateDepartmentOpFromDate(e.target.value)} />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>To Date</Form.Label>
                      <Form.Control type="date" value={dateDepartmentOpToDate} onChange={(e) => setDateDepartmentOpToDate(e.target.value)} />
                    </Form.Group>
                  </Col>
                  <Col md={2} className="d-grid">
                    <Button type="submit">Submit</Button>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>

          {dateDepartmentOpVisits.length > 0 && (
            <Card className="border-0 shadow-sm">
              <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                <span className="fw-semibold">
                  Department [OP] - Between Dates [{formatDateLabel(dateDepartmentOpFromDate)} & {formatDateLabel(dateDepartmentOpToDate)}]
                </span>
                <Button variant="outline-primary" size="sm" onClick={() => window.print()}>
                  Print
                </Button>
              </Card.Header>
              <Card.Body>
                <Row className="mb-3 g-3">
                  <Col md={6}>
                    <Badge bg="light" text="dark" className="border">Department Name: {selectedDateDepartmentOpName}</Badge>
                  </Col>
                  <Col md={6} className="text-md-end">
                    <Badge bg="secondary">Total no of Patient: {dateDepartmentOpVisits.length}</Badge>
                  </Col>
                </Row>
                <Table striped bordered hover responsive className="align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Sl.No.</th>
                      <th>Patient Number</th>
                      <th>Patient Name</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Token</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dateDepartmentOpVisits.map((visit, index) => (
                      <tr key={`date-dept-op-${visit.patientNumber}-${index}`}>
                        <td>{index + 1}</td>
                        <td>{visit.patientNumber}</td>
                        <td>{visit.patientName}</td>
                        <td>{visit.date}</td>
                        <td>{visit.time}</td>
                        <td>{visit.token}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          )}
        </>
      );
    }

    if (activeDateReportTab === 'doctor-op') {
      return (
        <>
          <Card className="border-0 shadow-sm mb-3">
            <Card.Header className="bg-light fw-semibold">Comparison - Doctor [OP] Between Time</Card.Header>
            <Card.Body>
              <Form onSubmit={handleDateDoctorOpSubmit}>
                <Row className="g-3 align-items-end">
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Doctor Name</Form.Label>
                      <Form.Select value={dateDoctorOpDoctorId} onChange={(e) => setDateDoctorOpDoctorId(Number(e.target.value))}>
                        {doctorOptions.map((doctor) => (
                          <option key={`date-doc-op-${doctor.id}`} value={doctor.id}>
                            {doctor.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Select the Date</Form.Label>
                      <Form.Control type="date" value={dateDoctorOpDate} onChange={(e) => setDateDoctorOpDate(e.target.value)} />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>Time From</Form.Label>
                      <Form.Control type="time" step={1} value={dateDoctorOpFromTime} onChange={(e) => setDateDoctorOpFromTime(e.target.value)} />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>Time To</Form.Label>
                      <Form.Control type="time" step={1} value={dateDoctorOpToTime} onChange={(e) => setDateDoctorOpToTime(e.target.value)} />
                    </Form.Group>
                  </Col>
                  <Col md={2} className="d-grid">
                    <Button type="submit">Submit</Button>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>

          {dateDoctorOpRows.length > 0 && (
            <Card className="border-0 shadow-sm">
              <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                <span className="fw-semibold">Comparison - Doctor [OP] Between Time</span>
                <Button variant="outline-primary" size="sm" onClick={() => window.print()}>
                  Print
                </Button>
              </Card.Header>
              <Card.Body>
                <Row className="mb-3 g-3">
                  <Col md={6}>
                    <Badge bg="light" text="dark" className="border">Doctor Name: {selectedDateDoctorOpName}</Badge>
                  </Col>
                  <Col md={6} className="text-md-end">
                    <Badge bg="secondary">Total no of Patient: {dateDoctorOpRows.length}</Badge>
                  </Col>
                </Row>
                <Table striped bordered hover responsive className="align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Patient Number</th>
                      <th>Patient Name</th>
                      <th>Date</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dateDoctorOpRows.map((row) => (
                      <tr key={`date-doc-op-row-${row.patientNumber}`}>
                        <td>{row.patientNumber}</td>
                        <td>{row.patientName}</td>
                        <td>{row.date}</td>
                        <td>{row.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          )}
        </>
      );
    }

    if (activeDateReportTab === 'general-op') {
      return (
        <>
          <Card className="border-0 shadow-sm mb-3">
            <Card.Header className="bg-light fw-semibold">General [OP] - Date Wise</Card.Header>
            <Card.Body>
              <Form onSubmit={handleDateGeneralOpSubmit}>
                <Row className="g-3 align-items-end">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Select From Date</Form.Label>
                      <Form.Control type="date" value={dateGeneralOpFromDate} onChange={(e) => setDateGeneralOpFromDate(e.target.value)} />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Select To Date</Form.Label>
                      <Form.Control type="date" value={dateGeneralOpToDate} onChange={(e) => setDateGeneralOpToDate(e.target.value)} />
                    </Form.Group>
                  </Col>
                  <Col md={4} className="d-grid">
                    <Button type="submit">Submit</Button>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>

          {dateGeneralOpRows.length > 0 && (
            <Card className="border-0 shadow-sm">
              <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                <span className="fw-semibold">General [OP] - Between Dates</span>
                <Button variant="outline-primary" size="sm" onClick={() => window.print()}>
                  Print
                </Button>
              </Card.Header>
              <Card.Body>
                <Row className="mb-3 g-3">
                  <Col md={6}><Badge bg="light" text="dark" className="border">From Date: {formatDateLabel(dateGeneralOpFromDate)}</Badge></Col>
                  <Col md={6} className="text-md-end"><Badge bg="light" text="dark" className="border">To Date: {formatDateLabel(dateGeneralOpToDate)}</Badge></Col>
                </Row>
                <Table striped bordered hover responsive className="align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Department Name</th>
                      <th className="text-end">No. of Patients</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dateGeneralOpRows.map((row) => (
                      <tr key={`date-gen-op-${row.label}`}>
                        <td>{row.label}</td>
                        <td className="text-end">{row.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          )}
        </>
      );
    }

    if (activeDateReportTab === 'department-ip') {
      return (
        <>
          <Card className="border-0 shadow-sm mb-3">
            <Card.Header className="bg-light fw-semibold">Particular Department [IP] - Between Years</Card.Header>
            <Card.Body>
              <Form onSubmit={handleDateDepartmentIpSubmit}>
                <Row className="g-3 align-items-end">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Select the Department</Form.Label>
                      <Form.Select value={dateDepartmentIpDepartmentId} onChange={(e) => setDateDepartmentIpDepartmentId(Number(e.target.value))}>
                        {departmentOptions.map((dept) => (
                          <option key={`date-dept-ip-${dept.id}`} value={dept.id}>{dept.name}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Select I Year</Form.Label>
                      <Form.Select value={dateDepartmentIpFromYear} onChange={(e) => setDateDepartmentIpFromYear(Number(e.target.value))}>
                        {yearOptions.map((year) => <option key={`date-dept-ip-from-${year}`} value={year}>{year}</option>)}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Select II Year</Form.Label>
                      <Form.Select value={dateDepartmentIpToYear} onChange={(e) => setDateDepartmentIpToYear(Number(e.target.value))}>
                        {yearOptions.map((year) => <option key={`date-dept-ip-to-${year}`} value={year}>{year}</option>)}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={2} className="d-grid"><Button type="submit">Submit</Button></Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>

          {dateDepartmentIpRows.length > 0 && (
            <Card className="border-0 shadow-sm">
              <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                <span className="fw-semibold">Particular Department [IP] - Between Years "{selectedDateDepartmentIpName}"</span>
                <Button variant="outline-primary" size="sm" onClick={() => window.print()}>Print</Button>
              </Card.Header>
              <Card.Body><YearMonthTable rows={dateDepartmentIpRows} showTotalRow={false} /></Card.Body>
            </Card>
          )}
        </>
      );
    }

    if (activeDateReportTab === 'doctor-ip') {
      return (
        <>
          <Card className="border-0 shadow-sm mb-3">
            <Card.Header className="bg-light fw-semibold">Doctor [IP] - Between Dates</Card.Header>
            <Card.Body>
              <Form onSubmit={handleDateDoctorIpSubmit}>
                <Row className="g-3 align-items-end">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Select From Date</Form.Label>
                      <Form.Control type="date" value={dateDoctorIpFromDate} onChange={(e) => setDateDoctorIpFromDate(e.target.value)} />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Select To Date</Form.Label>
                      <Form.Control type="date" value={dateDoctorIpToDate} onChange={(e) => setDateDoctorIpToDate(e.target.value)} />
                    </Form.Group>
                  </Col>
                  <Col md={4} className="d-grid"><Button type="submit">Submit</Button></Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>

          {dateDoctorIpRows.length > 0 && (
            <Card className="border-0 shadow-sm">
              <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                <span className="fw-semibold">Doctor [IP] - Between Dates</span>
                <Button variant="outline-primary" size="sm" onClick={() => window.print()}>Print</Button>
              </Card.Header>
              <Card.Body>
                <Row className="mb-3 g-3">
                  <Col md={6}><Badge bg="light" text="dark" className="border">From Date: {formatDateLabel(dateDoctorIpFromDate)}</Badge></Col>
                  <Col md={6} className="text-md-end"><Badge bg="light" text="dark" className="border">To Date: {formatDateLabel(dateDoctorIpToDate)}</Badge></Col>
                </Row>
                <Table striped bordered hover responsive className="align-middle mb-3">
                  <thead>
                    <tr>
                      <th>Consultant Name</th>
                      <th className="text-end">Total Number of Patients</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dateDoctorIpRows.map((row) => (
                      <tr key={`date-doc-ip-${row.consultantName}`}>
                        <td>{row.consultantName}</td>
                        <td className="text-end">{row.totalPatients}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <Badge bg="secondary">Total: {dateDoctorIpTotal}</Badge>
              </Card.Body>
            </Card>
          )}
        </>
      );
    }

    if (activeDateReportTab === 'general-ip') {
      return (
        <>
          <Card className="border-0 shadow-sm mb-3">
            <Card.Header className="bg-light fw-semibold">General [IP] - Between Years</Card.Header>
            <Card.Body>
              <Form onSubmit={handleDateGeneralIpSubmit}>
                <Row className="g-3 align-items-end">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Select I Year</Form.Label>
                      <Form.Select value={dateGeneralIpFromYear} onChange={(e) => setDateGeneralIpFromYear(Number(e.target.value))}>
                        {yearOptions.map((year) => <option key={`date-gen-ip-from-${year}`} value={year}>{year}</option>)}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Select II Year</Form.Label>
                      <Form.Select value={dateGeneralIpToYear} onChange={(e) => setDateGeneralIpToYear(Number(e.target.value))}>
                        {yearOptions.map((year) => <option key={`date-gen-ip-to-${year}`} value={year}>{year}</option>)}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4} className="d-grid"><Button type="submit">Submit</Button></Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>

          {dateGeneralIpRows.length > 0 && (
            <Card className="border-0 shadow-sm">
              <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                <span className="fw-semibold">General [IP] - Between Years</span>
                <Button variant="outline-primary" size="sm" onClick={() => window.print()}>Print</Button>
              </Card.Header>
              <Card.Body><YearMonthTable rows={dateGeneralIpRows} showTotalRow={false} /></Card.Body>
            </Card>
          )}
        </>
      );
    }

    if (activeDateReportTab === 'date-comparison') {
      return (
        <>
          <Card className="border-0 shadow-sm mb-3">
            <Card.Header className="bg-light fw-semibold">Date Wise Comparison</Card.Header>
            <Card.Body>
              <Form onSubmit={handleDateComparisonSubmit}>
                <Row className="g-3 align-items-end">
                  <Col md={4}><Form.Group><Form.Label>From Date</Form.Label><Form.Control type="date" value={dateComparisonFromDate} onChange={(e) => setDateComparisonFromDate(e.target.value)} /></Form.Group></Col>
                  <Col md={4}><Form.Group><Form.Label>To Date</Form.Label><Form.Control type="date" value={dateComparisonToDate} onChange={(e) => setDateComparisonToDate(e.target.value)} /></Form.Group></Col>
                  <Col md={4} className="d-grid"><Button type="submit">Submit</Button></Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>

          {dateComparisonRun && dateComparisonSummary && (
            <>
              <Card className="border-0 shadow-sm mb-3">
                <Card.Header className="bg-light fw-semibold">Statistics From {formatDateLabel(dateComparisonFromDate)} To {formatDateLabel(dateComparisonToDate)}</Card.Header>
                <Card.Body>
                  <h6 className="fw-semibold">Out-Patients</h6>
                  <Table bordered size="sm" responsive className="mb-3">
                    <tbody>
                      <tr><td>New Registration</td><td className="text-end">{dateComparisonSummary.opNew}</td></tr>
                      <tr><td>Repeat Registration</td><td className="text-end">{dateComparisonSummary.opRepeat}</td></tr>
                      <tr><td>Male</td><td className="text-end">{dateComparisonSummary.opMale}</td></tr>
                      <tr><td>Female</td><td className="text-end">{dateComparisonSummary.opFemale}</td></tr>
                      <tr className="table-light fw-semibold"><td>Total</td><td className="text-end">{dateComparisonSummary.opTotalSex}</td></tr>
                    </tbody>
                  </Table>

                  <h6 className="fw-semibold">Religionwise Distribution (OP)</h6>
                  <Table striped bordered hover responsive className="mb-3">
                    <thead><tr><th>S.No</th><th>Particulars</th><th className="text-end">No of Patients</th></tr></thead>
                    <tbody>
                      {dateComparisonSummary.religions.map((row, index) => (
                        <tr key={`date-comp-op-rel-${row.name}`}><td>{index + 1}</td><td>{row.name}</td><td className="text-end">{row.opCount}</td></tr>
                      ))}
                      <tr className="table-light fw-semibold"><td colSpan={2}>Total</td><td className="text-end">{dateComparisonSummary.opReligionTotal}</td></tr>
                    </tbody>
                  </Table>

                  <h6 className="fw-semibold">Departmentwise Classification (OP)</h6>
                  <Table striped bordered hover responsive className="mb-3">
                    <thead><tr><th>S.No</th><th>Particulars</th><th className="text-end">No of Patients</th></tr></thead>
                    <tbody>
                      {dateComparisonSummary.departments.map((row, index) => (
                        <tr key={`date-comp-op-dept-${row.name}`}><td>{index + 1}</td><td>{row.name}</td><td className="text-end">{row.opCount}</td></tr>
                      ))}
                      <tr className="table-light fw-semibold"><td colSpan={2}>Total</td><td className="text-end">{dateComparisonSummary.opDeptTotal}</td></tr>
                    </tbody>
                  </Table>

                  <h6 className="fw-semibold">In-Patients</h6>
                  <Table bordered size="sm" responsive className="mb-3">
                    <tbody>
                      <tr><td>Male</td><td className="text-end">{dateComparisonSummary.ipMale}</td></tr>
                      <tr><td>Female</td><td className="text-end">{dateComparisonSummary.ipFemale}</td></tr>
                      <tr className="table-light fw-semibold"><td>Total</td><td className="text-end">{dateComparisonSummary.ipTotalSex}</td></tr>
                    </tbody>
                  </Table>

                  <h6 className="fw-semibold">Religionwise Distribution (IP)</h6>
                  <Table striped bordered hover responsive className="mb-3">
                    <thead><tr><th>S.No</th><th>Particulars</th><th className="text-end">No of Patients</th></tr></thead>
                    <tbody>
                      {dateComparisonSummary.religions.map((row, index) => (
                        <tr key={`date-comp-ip-rel-${row.name}`}><td>{index + 1}</td><td>{row.name}</td><td className="text-end">{row.ipCount}</td></tr>
                      ))}
                      <tr className="table-light fw-semibold"><td colSpan={2}>Total</td><td className="text-end">{dateComparisonSummary.ipReligionTotal}</td></tr>
                    </tbody>
                  </Table>

                  <h6 className="fw-semibold">Departmentwise Classification (IP)</h6>
                  <Table striped bordered hover responsive className="mb-0">
                    <thead><tr><th>S.No</th><th>Particulars</th><th className="text-end">No of Patients</th></tr></thead>
                    <tbody>
                      {dateComparisonSummary.departments.map((row, index) => (
                        <tr key={`date-comp-ip-dept-${row.name}`}><td>{index + 1}</td><td>{row.name}</td><td className="text-end">{row.ipCount}</td></tr>
                      ))}
                      <tr className="table-light fw-semibold"><td colSpan={2}>Total</td><td className="text-end">{dateComparisonSummary.ipDeptTotal}</td></tr>
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
              <div className="text-center">
                <Button variant="outline-primary" onClick={() => window.print()}>Print</Button>
              </div>
            </>
          )}
        </>
      );
    }

    return (
      <>
        <Card className="border-0 shadow-sm mb-3">
          <Card.Header className="bg-light fw-semibold">Diagnosis Report</Card.Header>
          <Card.Body>
            <Form onSubmit={handleDiagnosisSubmit}>
              <Row className="g-3 align-items-end">
                <Col md={4}><Form.Group><Form.Label>From Date</Form.Label><Form.Control type="date" value={diagnosisFromDate} onChange={(e) => setDiagnosisFromDate(e.target.value)} /></Form.Group></Col>
                <Col md={4}><Form.Group><Form.Label>To Date</Form.Label><Form.Control type="date" value={diagnosisToDate} onChange={(e) => setDiagnosisToDate(e.target.value)} /></Form.Group></Col>
                <Col md={4} className="d-grid"><Button type="submit">Submit</Button></Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>

        {diagnosisRows.length > 0 && (
          <Card className="border-0 shadow-sm">
            <Card.Header className="d-flex justify-content-between align-items-center bg-light">
              <span className="fw-semibold">Diagnosis Report ({formatDateLabel(diagnosisFromDate)} - {formatDateLabel(diagnosisToDate)})</span>
              <Button variant="outline-primary" size="sm" onClick={() => window.print()}>Print</Button>
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover responsive className="align-middle mb-0">
                <thead><tr><th>Sl.No</th><th>Diagnosis</th><th className="text-end">No of Patients</th></tr></thead>
                <tbody>
                  {diagnosisRows.map((row, index) => (
                    <tr key={`diagnosis-row-${row.diagnosis}`}><td>{index + 1}</td><td>{row.diagnosis}</td><td className="text-end">{row.count}</td></tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        )}
      </>
    );
  };

  return (
    <Container fluid className="py-4">
      <ReportHeader title="Comparison" subtitle="Comparison reports" />

      <Card className="shadow-sm border-0">
        <Card.Body className="pb-0">
          <Nav variant="tabs" activeKey={activeTab}>
            <Nav.Item>
              <Nav.Link eventKey="year" onClick={() => setActiveTab('year')}>
                Year
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                eventKey="between-dates-months"
                onClick={() => setActiveTab('between-dates-months')}
              >
                Between Dates/Months
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="date" onClick={() => setActiveTab('date')}>
                Date
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Card.Body>

        <Card.Body>
          {activeTab === 'year' && (
            <>
              <Nav variant="pills" activeKey={activeYearReportTab} className="mb-3 flex-wrap gap-2">
                <Nav.Item>
                  <Nav.Link eventKey="department-op" onClick={() => setActiveYearReportTab('department-op')}>
                    1. Department [OP]
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="doctor-op" onClick={() => setActiveYearReportTab('doctor-op')}>
                    2. Doctor [OP]
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="general-op" onClick={() => setActiveYearReportTab('general-op')}>
                    3. General [OP]
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="department-ip" onClick={() => setActiveYearReportTab('department-ip')}>
                    4. Department [IP]
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="doctor-ip" onClick={() => setActiveYearReportTab('doctor-ip')}>
                    5. Doctor [IP]
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="general-ip" onClick={() => setActiveYearReportTab('general-ip')}>
                    6. General [IP]
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="year-comparison" onClick={() => setActiveYearReportTab('year-comparison')}>
                    7. Year Comparison
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="birth-report" onClick={() => setActiveYearReportTab('birth-report')}>
                    8. Birth Report
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="deliveries-report" onClick={() => setActiveYearReportTab('deliveries-report')}>
                    9. Deliveries Report
                  </Nav.Link>
                </Nav.Item>
              </Nav>

              {renderYearReportContent()}
            </>
          )}
          {activeTab === 'between-dates-months' && (
            <>
              <Nav variant="pills" activeKey={activeBetweenReportTab} className="mb-3 flex-wrap gap-2">
                <Nav.Item>
                  <Nav.Link eventKey="department-op" onClick={() => setActiveBetweenReportTab('department-op')}>
                    1. Department [OP]
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="doctor-op" onClick={() => setActiveBetweenReportTab('doctor-op')}>
                    2. Doctor [OP]
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="general-op" onClick={() => setActiveBetweenReportTab('general-op')}>
                    3. General [OP]
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="department-ip" onClick={() => setActiveBetweenReportTab('department-ip')}>
                    4. Department [IP]
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="doctor-ip" onClick={() => setActiveBetweenReportTab('doctor-ip')}>
                    5. Doctor [IP]
                  </Nav.Link>
                </Nav.Item>
              </Nav>

              {renderBetweenReportContent()}
            </>
          )}
          {activeTab === 'date' && (
            <>
              <Nav variant="pills" activeKey={activeDateReportTab} className="mb-3 flex-wrap gap-2">
                <Nav.Item>
                  <Nav.Link eventKey="department-op" onClick={() => setActiveDateReportTab('department-op')}>
                    1. Department [OP]
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="doctor-op" onClick={() => setActiveDateReportTab('doctor-op')}>
                    2. Doctor [OP]
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="general-op" onClick={() => setActiveDateReportTab('general-op')}>
                    3. General [OP]
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="department-ip" onClick={() => setActiveDateReportTab('department-ip')}>
                    4. Department [IP]
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="doctor-ip" onClick={() => setActiveDateReportTab('doctor-ip')}>
                    5. Doctor [IP]
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="general-ip" onClick={() => setActiveDateReportTab('general-ip')}>
                    6. General [IP]
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="date-comparison" onClick={() => setActiveDateReportTab('date-comparison')}>
                    7. Date Comparison
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="diagnosis" onClick={() => setActiveDateReportTab('diagnosis')}>
                    8. Diagnosis
                  </Nav.Link>
                </Nav.Item>
              </Nav>

              {renderDateReportContent()}
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
