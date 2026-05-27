import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Badge,
  InputGroup,
  Modal,
  Table,
} from "react-bootstrap";
import PatientSearchModal, { Patient } from "../../../components/search-modal/PatientSearchModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faUserPlus,
  faUserEdit,
  faSearch,
  faKeyboard,
  faSave,
  faSync,
  faIdCard,
  faMapMarkerAlt,
  faStethoscope,
  faMoneyBillWave,
  faHospital,
  faNotesMedical,
  faCreditCard,
  faCheckCircle,
  faTimes,
  faPrint,
} from "@fortawesome/free-solid-svg-icons";
import "./PatientRegistration.css";
import SearchableSelect from "../../../components/SearchableSelect";
import Swal from "sweetalert2";
import { MedicalRecordsApiService } from "../../../api/medical-records/medical-records-api-service";
import { AppApiService } from "../../../api/app/app-api-service";
import { useSelector } from "react-redux";
import { RootState } from "../../../state/store";
import RegistrationBillPrint from "../../components/RegistrationBillPrint";
import PatientDetailsPrint from "../../components/PatientDetailsPrint";
import ReactToPrint from "react-to-print";
import {
  showSuccessToast,
  showErrorModal,
  showWarningModal,
  showInfoModal,
  showValidationError,
  showSuccessModal,
  showConfirmDialog,
} from "../../../utils/alertUtil";
import {
  handleNumberChange,
  handleNumberBlur,
  formatNumberDisplay,
} from "../../../utils/numberInputUtil";
import { useSidebar } from "../../../context/SidebarContext";

const PatientRegistration: React.FC = () => {
  const apiService = new MedicalRecordsApiService();
  const appApiService = new AppApiService();

  // Redux state
  const organizationState = useSelector((state: RootState) => state.appReducer.organization);

  // Focus management refs
  const firstInputRef = useRef<HTMLInputElement>(null);
  const saveButtonRef = useRef<HTMLButtonElement>(null);
  const resetButtonRef = useRef<HTMLButtonElement>(null);
  const opNumberRef = useRef<HTMLInputElement>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const printTriggerRef = useRef<any>(null);
  const printDetailsRef = useRef<HTMLDivElement>(null);
  const printDetailsTriggerRef = useRef<any>(null);

  // Keyboard navigation state
  const [focusedElement, setFocusedElement] = useState<string>("");

  const { collapsed, mobileOpen, closeMobileSidebar, toggleSidebar } = useSidebar();

  // Help modal state
  const [showKeyboardHelp, setShowKeyboardHelp] = useState<boolean>(false);

  // Patient search modal state
  const [showPatientSearch, setShowPatientSearch] = useState<boolean>(false);

  // Visit History modal state
  const [showVisitHistory, setShowVisitHistory] = useState<boolean>(false);
  const [visitHistoryList, setVisitHistoryList] = useState<any[]>([]);
  const [loadingVisitHistory, setLoadingVisitHistory] = useState<boolean>(false);

  // Keyboard shortcuts handler
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ctrl+Enter to save - just trigger save, it handles everything
    // if (event.ctrlKey && event.key === "Enter") {
    //   event.preventDefault();
    //   handleSave();
    // }
    // F5 or Ctrl+R to reset (prevent default browser refresh)
    if (event.key === "F5" || (event.ctrlKey && event.key === "r")) {
      event.preventDefault();
      handleReset();
    }
    // Escape to clear focus
    if (event.key === "Escape") {
      (document.activeElement as HTMLElement)?.blur();
    }
  }, []);

  // Add keyboard event listeners
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  // Focus first input on mount
  useEffect(() => {
    if (firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, []);

  // Fetch organization details for print
  useEffect(() => {
    const fetchOrgDetails = async () => {
      try {
        const orgResponse = await appApiService.fetchOrganizationDetails();
        setOrgInfo(orgResponse);
      } catch (error) {
        console.error('Error fetching organization details:', error);
      }
    };
    fetchOrgDetails();
  }, []);

  const [visitType, setVisitType] = useState<"new" | "repeat" | "edit">(
    "repeat"
  );

  // Focus OP number when Repeat is selected
  useEffect(() => {
    if (visitType === "repeat" && opNumberRef.current) {
      opNumberRef.current.focus();
    }
  }, [visitType]);
  const [dob, setDob] = useState<string>("");
  const [years, setYears] = useState<number>(0);
  const [months, setMonths] = useState<number>(0);
  const [days, setDays] = useState<number>(0);
  const [isMarried, setIsMarried] = useState<number>(0);
  const [paymentType, setPaymentType] = useState<"cash" | "bank" | "cash/bank">(
    "cash"
  );
  const [caseType, setCaseType] = useState<number>(1);

  // Location data
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [villages, setVillages] = useState<any[]>([]);
  const [filteredDistricts, setFilteredDistricts] = useState<any[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<any[]>([]);
  const [guardianTypes, setGuardianTypes] = useState<any[]>([]);
  const [genders, setGenders] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [consultants, setConsultants] = useState<any[]>([]);
  const [paymentTypes, setPaymentTypes] = useState<any[]>([]);
  const [paymentModes, setPaymentModes] = useState<any[]>([]);
  const [banks, setBanks] = useState<any[]>([]);
  const [accountHeads, setAccountHeads] = useState<any[]>([]);
  const [selectedAccountHead, setSelectedAccountHead] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedPost, setSelectedPost] = useState<string>("");
  const [selectedGuardianType, setSelectedGuardianType] = useState<string>("");
  const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false);
  const [autoSelectTrigger, setAutoSelectTrigger] = useState<number>(0);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [departmentAutoSelected, setDepartmentAutoSelected] =
    useState<boolean>(false);
  const [selectedConsultant, setSelectedConsultant] = useState<string>("");
  const [postSearch, setPostSearch] = useState<string>("");
  const [villageSearch, setVillageSearch] = useState<string>("");
  const [selectedVillageId, setSelectedVillageId] = useState<string>("");
  const [filteredVillages, setFilteredVillages] = useState<any[]>([]);
  const [showVillageDropdown, setShowVillageDropdown] =
    useState<boolean>(false);
  const [villageDropdownPosition, setVillageDropdownPosition] = useState<'bottom' | 'top'>('bottom');
  const [consultationFee, setConsultationFee] = useState<string>("0.00");
  const [registrationFee, setRegistrationFee] = useState<string>("0.00");
  const [discount, setDiscount] = useState<string>("0.00");
  const [paidAmount, setPaidAmount] = useState<string>("0.00");
  const [balance, setBalance] = useState<string>("0.00");
  const [lastVisitDate, setLastVisitDate] = useState<string>("");
  const [lastVisitDoctorId, setLastVisitDoctorId] = useState<number | null>(
    null
  );
  const [lastVisitDepartmentId, setLastVisitDepartmentId] = useState<
    number | null
  >(null);
  const [concessionApplied, setConcessionApplied] = useState<boolean>(false);
  const [concessionAmount, setConcessionAmount] = useState<number>(0);
  const [selectedPaymentType, setSelectedPaymentType] = useState<string>("");
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<string>("");
  const [selectedBank, setSelectedBank] = useState<string>("");
  const [transactionNumber, setTransactionNumber] = useState<string>("");
  const [cashAmount, setCashAmount] = useState<string>("0");
  const [companyPaid, setCompanyPaid] = useState<string>("0");
  const [bankAmount, setBankAmount] = useState<string>("0");
  const [staffCredit, setStaffCredit] = useState<string>("0");
  const [insurance, setInsurance] = useState<string>("0");
  const [noCharge, setNoCharge] = useState<boolean>(false);
  const [consultationFeeRefreshTick, setConsultationFeeRefreshTick] =
    useState<number>(0);
  const [opNumber, setOpNumber] = useState<string>("");
  const [tokenNumber, setTokenNumber] = useState<string>("");
  const [masterTokenNo, setMasterTokenNo] = useState<number>(0);
  const [tokenNoDept, setTokenNoDept] = useState<number>(0);
  const [tokenNoDoctor, setTokenNoDoctor] = useState<number>(0);
  const [todayNewPatients, setTodayNewPatients] = useState<number>(0);
  const [todayRepeatPatients, setTodayRepeatPatients] = useState<number>(0);
  const loginData = useSelector((state: RootState) => state.loginData);

  // Loading states
  const [isLoadingPatient, setIsLoadingPatient] = useState<boolean>(false);
  const [patientDataLoaded, setPatientDataLoaded] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [registeredOpNumber, setRegisteredOpNumber] = useState<string>("");
  const [patientId, setPatientId] = useState<number>(0);
  const [originalIsInOp, setOriginalIsInOp] = useState<boolean>(false);

  // Organization info for print
  const [orgInfo, setOrgInfo] = useState<any>(null);

  // Form data states
  const [firstName, setFirstName] = useState<string>("");
  const [secondName, setSecondName] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [guardianName, setGuardianName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [pincode, setPincode] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [idType, setIdType] = useState<string>("");
  const [idNumber, setIdNumber] = useState<string>("");

  // Validation states
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: boolean;
  }>({});

  // TODO: Remove apiService instantiation
  // const apiService = new MedicalRecordsApiService();

  // Helper function to calculate days between dates
  const calculateDaysDifference = (date1: string, date2: string): number => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Toggle this flag to enable/disable night consultation minimum logic.
  const ENABLE_NIGHT_CONSULTATION_MINIMUM = true;
  const NIGHT_CONSULTATION_MINIMUM_AMOUNT = 300;

  // Configure department IDs that should keep base fee even during night hours.
  const NIGHT_MINIMUM_EXEMPT_DEPARTMENT_IDS: number[] = [37,40];

  // During night hours, consultation base fee should be at least 300.
  const applyNightConsultationMinimum = (baseFee: number, deptId?: number): number => {
    if (!ENABLE_NIGHT_CONSULTATION_MINIMUM) {
      return baseFee;
    }

    if (deptId && NIGHT_MINIMUM_EXEMPT_DEPARTMENT_IDS.includes(deptId)) {
      return baseFee;
    }

    const currentHour = new Date().getHours();
    const isNightHours = currentHour >= 22 || currentHour < 6;
    return isNightHours ? Math.max(baseFee, NIGHT_CONSULTATION_MINIMUM_AMOUNT) : baseFee;
  };

  // Helper function to apply concession to consultation fee
  const applyConcession = async (
    baseFee: number,
    doctId?: number,
    deptId?: number
  ): Promise<number> => {
    console.log("applyConcession called with:", {
      baseFee,
      doctId,
      deptId,
      visitType,
      lastVisitDate,
      lastVisitDoctorId,
      lastVisitDepartmentId,
    });

    if (visitType !== "repeat" || !lastVisitDate) {
      console.log(
        "No concession applied - visitType:",
        visitType,
        "lastVisitDate:",
        lastVisitDate
      );
      setConcessionApplied(false);
      setConcessionAmount(0);
      return baseFee; // No concession for new visits or if no last visit date
    }

    try {
      const today = new Date().toISOString().split("T")[0];
      const daysSinceLastVisit = calculateDaysDifference(lastVisitDate, today);
      console.log("Calculated days since last visit:", daysSinceLastVisit);

      let applicableConcession = 0;

      // Try doctor concession first if doctor is selected AND matches last visited doctor
      if (doctId && lastVisitDoctorId && doctId === lastVisitDoctorId) {
        const doctor = consultants.find((c) => c.id === doctId);
        if (doctor && doctor.days > 0 && doctor.concession > 0) {
          // Check if last visit is within the renewal days period
          if (daysSinceLastVisit <= doctor.days) {
            applicableConcession = doctor.concession;
            console.log("✅ Applied doctor concession:", {
              doctorName: doctor.name,
              daysSinceLastVisit,
              renewalDays: doctor.days,
              concessionAmount: applicableConcession,
            });
          } else {
            console.log("❌ Doctor concession not applicable - outside renewal period:", {
              daysSinceLastVisit,
              renewalDays: doctor.days,
            });
          }
        } else {
          console.log("❌ Doctor has no concession configured:", {
            doctorName: doctor?.name,
            days: doctor?.days,
            concession: doctor?.concession,
          });
        }
      } else if (doctId && lastVisitDoctorId && doctId !== lastVisitDoctorId) {
        console.log(
          "❌ Doctor changed - no doctor concession applied. Selected:",
          doctId,
          "Last visited:",
          lastVisitDoctorId
        );
      }

      // If no doctor concession found, try department concession if selected department matches last visited department
      if (
        applicableConcession === 0 &&
        deptId &&
        lastVisitDepartmentId &&
        deptId === lastVisitDepartmentId
      ) {
        const dept = departments.find((d) => d.id === deptId);
        if (dept && dept.days > 0 && dept.concession > 0) {
          // Check if last visit is within the renewal days period
          if (daysSinceLastVisit <= dept.days) {
            applicableConcession = dept.concession;
            console.log("✅ Applied department concession:", {
              departmentName: dept.name,
              daysSinceLastVisit,
              renewalDays: dept.days,
              concessionAmount: applicableConcession,
            });
          } else {
            console.log("❌ Department concession not applicable - outside renewal period:", {
              daysSinceLastVisit,
              renewalDays: dept.days,
            });
          }
        } else {
          console.log("❌ Department has no concession configured:", {
            departmentName: dept?.name,
            days: dept?.days,
            concession: dept?.concession,
          });
        }
      } else if (
        applicableConcession === 0 &&
        deptId &&
        lastVisitDepartmentId &&
        deptId !== lastVisitDepartmentId
      ) {
        console.log(
          "❌ Department changed - no department concession applied. Selected:",
          deptId,
          "Last visited:",
          lastVisitDepartmentId
        );
      }

      // Apply concession if found
      if (applicableConcession > 0) {
        // Concession is subtracted directly from the base fee (not percentage)
        const finalFee = Math.max(0, baseFee - applicableConcession); // Ensure fee doesn't go negative
        console.log("💰 Concession calculation:", {
          baseFee,
          concessionAmount: applicableConcession,
          finalFee,
          savings: baseFee - finalFee,
        });
        setConcessionApplied(true);
        setConcessionAmount(applicableConcession);
        return finalFee;
      }

      console.log("❌ No concession applied - no matching concession rules found");
      setConcessionApplied(false);
      setConcessionAmount(0);
      return baseFee;
    } catch (error) {
      console.error("❌ Error applying concession:", error);
      setConcessionApplied(false);
      setConcessionAmount(0);
      return baseFee; // Return base fee on error
    }
  };

  // Fetch data on component mount - ensure proper ordering
  useEffect(() => {
    const loadData = async () => {
      setIsDataLoaded(false);
      await fetchCountries(); // Load countries first for India auto-select
      await fetchStates(); // Load states first
      await fetchDistricts(); // Then districts
      // Posts and Villages are loaded lazily when user types >= 2 chars
      await fetchGuardianTypes();
      await fetchGenders();
      // await fetchDepartments(); // Load on demand when dropdown opens
      // await fetchConsultants(); // Load on demand when dropdown opens
      await fetchPaymentConfig();
      setIsDataLoaded(true);
      setAutoSelectTrigger(1);
    };

    loadData();
  }, []);

  // Load patient statistics on component mount
  useEffect(() => {
    const loadStats = async () => {
      try {
        // TODO: Implement new API call
        // const stats = await apiService.getTodayStats();
        const stats = { newPatientCount: 0, repeatPatientCount: 0 };
        setTodayNewPatients(stats.newPatientCount);
        setTodayRepeatPatients(stats.repeatPatientCount);
      } catch (error) {
        console.error("Error loading patient statistics:", error);
        // Don't break UI if stats fail to load
        setTodayNewPatients(0);
        setTodayRepeatPatients(0);
      }
    };

    loadStats();
  }, []);

  // Auto-select India when countries are loaded
  useEffect(() => {
    if (countries.length > 0 && !selectedCountry) {
      const india = countries.find(
        (country: any) => country.name?.toLowerCase() === "india"
      );
      if (india) {
        setSelectedCountry(india.id.toString());
      }
    }
  }, [countries, selectedCountry]);

  // Auto-select Female gender when genders are loaded (default selection)
  useEffect(() => {
    if (genders.length > 0 && !gender) {
      const femaleGender = genders.find(
        (g: any) => g.name?.toLowerCase() === "female"
      );
      if (femaleGender) {
        setGender(femaleGender.id.toString());
      }
    }
  }, [genders, gender]);

  // Auto-select defaults after data is loaded
  useEffect(() => {
    if (
      autoSelectTrigger > 0 &&
      states.length > 0 &&
      districts.length > 0 &&
      guardianTypes.length > 0
    ) {
      // Auto-select Tamil Nadu
      const tamilNadu = states.find(
        (state: any) =>
          state.name?.toLowerCase().trim() === "tamil nadu" ||
          state.name?.toLowerCase().trim() === "tamilnadu"
      );
      if (tamilNadu) {
        setSelectedState(tamilNadu.id.toString());

        // Auto-select Dindigul
        const dindigul = districts.find(
          (district: any) =>
            (district.name?.toLowerCase().trim() === "dindigul" ||
             district.name?.toLowerCase().trim() === "dindigal") &&
            district.stId === tamilNadu.id
        );
        if (dindigul) {
          setSelectedDistrict(dindigul.id.toString());
        }
      }

      // Auto-select Father
      const father = guardianTypes.find(
        (guardianType: any) => guardianType.name?.toLowerCase() === "father"
      );
      if (father) {
        setSelectedGuardianType(father.id.toString());
      }

      // Auto-select village "batlagundu" and taluk "nilakottai"
      const autoSelectVillageAndTaluk = async () => {
        try {
          const villageResponse = await apiService.fetchVillageName("batlagundu");
          const villageData = Array.isArray(villageResponse) ? villageResponse : [];
          const village = villageData.find(
            (v: any) => v.name?.toLowerCase().trim() === "batlagundu"
          );
          if (village) {
            setVillageSearch(village.name);
            setSelectedVillageId(village.id.toString());
            setFilteredVillages(villageData);
          }
        } catch (error) {
          console.error("Error auto-selecting village:", error);
        }

        // Auto-select nilakottai by known ID - bypass API since fetchPostNameLike needs 2+ chars
        const nilakottaiPost = { id: 154831, name: "NILAKOTTAI", code: "624208" };
        setPostSearch(nilakottaiPost.name);
        setSelectedPost(nilakottaiPost.id.toString());
        setPosts((prev) => {
          const exists = prev.some((p: any) => p.id === nilakottaiPost.id);
          return exists ? prev : [...prev, nilakottaiPost];
        });
        setFilteredPosts([nilakottaiPost]);
      };
      autoSelectVillageAndTaluk();
    }
  }, [autoSelectTrigger, states, districts, guardianTypes]);

  // Re-evaluate consultation fee periodically so night/day time rule updates automatically.
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      setConsultationFeeRefreshTick((prev) => prev + 1);
    }, 60000);

    return () => clearInterval(refreshInterval);
  }, []);

  // When consultant is selected, auto-select department and fetch doctor charges
  useEffect(() => {
    const fetchDoctorCharges = async () => {
      if (noCharge) {
        setConsultationFee("0.00");
        return;
      }

      if (selectedConsultant) {
        // If consultants are not loaded, load them first
        let consultantList = consultants;
        if (consultants.length === 0) {
          try {
            consultantList = await apiService.fetchAllConsultants();
            setConsultants(Array.isArray(consultantList) ? consultantList : []);
          } catch (error) {
            console.error("Error fetching consultants:", error);
            return;
          }
        }

        const consultant = consultantList.find(
          (c) => c.id === parseInt(selectedConsultant)
        );

        console.log('🔍 Selected consultant ID:', selectedConsultant);
        console.log('🔍 Found consultant:', consultant);
        console.log('🔍 Consultant deptId:', consultant?.deptId);

        if (consultant) {
          // Auto-select department based on consultant
          const deptId = consultant.deptId;

          console.log('📋 Department ID from consultant:', deptId);

          if (deptId && deptId > 0) {
            // Ensure departments are loaded before setting selected department
            let departmentList: any[] = departments;
            if (departments.length === 0) {
              try {
                departmentList = await apiService.fetchAllDepartments();
                departmentList = Array.isArray(departmentList)
                  ? departmentList
                  : [];
                setDepartments(departmentList);
              } catch (error) {
                console.error(
                  "Error fetching departments for auto-selection:",
                  error
                );
                return;
              }
            }

            // Check if the department exists
            const matchingDept = departmentList.find((d) => d.id === deptId);
            console.log('🔍 Matching department found:', matchingDept);
            if (matchingDept) {
              console.log('✅ Setting department to:', deptId.toString());
              setSelectedDepartment(deptId.toString());
              setDepartmentAutoSelected(true); // Mark as auto-selected
            } else {
              console.log('❌ No matching department found for deptId:', deptId);
              setSelectedDepartment("");
              setDepartmentAutoSelected(false);
            }
          } else {
            console.log('⚠️ No valid deptId or deptId <= 0');
            // Clear department selection if consultant has no valid department
            setSelectedDepartment("");
          }

          // Use charges from consultant API response
          const baseFee =
            visitType === "new"
              ? consultant.newCharges || 0
              : consultant.repeatCharges || 0;
            const adjustedBaseFee = applyNightConsultationMinimum(baseFee, deptId);

          // Apply concession for repeat visits
          const finalFee = await applyConcession(
            adjustedBaseFee,
            consultant.id,
            deptId
          );
          setConsultationFee(finalFee?.toFixed(2) || "0.00");
        }
      } else if (!selectedConsultant && !selectedDepartment) {
        setConsultationFee("0.00");
      }
    };

    fetchDoctorCharges();
  }, [selectedConsultant, consultants, visitType, noCharge, consultationFeeRefreshTick]);

  // When department is changed (with or without consultant), fetch appropriate charges
  useEffect(() => {
    const fetchCharges = async () => {
      if (noCharge) {
        setConsultationFee("0.00");
        return;
      }

      if (selectedDepartment) {
        // If doctor is selected and department is changed, check department charges first, then doctor charges
        if (selectedConsultant) {
          // Only apply department charges if department was manually selected (not auto-selected from doctor)
          if (!departmentAutoSelected) {
            // Get department charges from already loaded data
            const dept = departments.find(
              (d) => d.id === parseInt(selectedDepartment)
            );

            if (dept && (dept.newCharges > 0 || dept.repeatCharges > 0)) {
              const baseFee =
                visitType === "new"
                  ? dept.newCharges || 0
                  : dept.repeatCharges || 0;
                const adjustedBaseFee = applyNightConsultationMinimum(baseFee, parseInt(selectedDepartment));
              const finalFee = await applyConcession(
                adjustedBaseFee,
                undefined,
                parseInt(selectedDepartment)
              );
              setConsultationFee(finalFee?.toFixed(2) || "0.00");
            } else {
              // Fall back to doctor charges if no department charges
              const doctor = consultants.find(
                (c) => c.id === parseInt(selectedConsultant)
              );
              if (doctor) {
                const baseFee =
                  visitType === "new"
                    ? doctor.newCharges || 0
                    : doctor.repeatCharges || 0;
                  const adjustedBaseFee = applyNightConsultationMinimum(baseFee, doctor.deptId || parseInt(selectedDepartment));
                const finalFee = await applyConcession(
                  adjustedBaseFee,
                  parseInt(selectedConsultant)
                );
                setConsultationFee(finalFee?.toFixed(2) || "0.00");
              } else {
                setConsultationFee("0.00");
              }
            }
          } else {
            // Department was auto-selected from doctor, so use doctor charges only
            const doctor = consultants.find(
              (c) => c.id === parseInt(selectedConsultant)
            );
            if (doctor) {
              const baseFee =
                visitType === "new"
                  ? doctor.newCharges || 0
                  : doctor.repeatCharges || 0;
                const adjustedBaseFee = applyNightConsultationMinimum(baseFee, doctor.deptId);
              const finalFee = await applyConcession(
                adjustedBaseFee,
                parseInt(selectedConsultant)
              );
              setConsultationFee(finalFee?.toFixed(2) || "0.00");
            } else {
              setConsultationFee("0.00");
            }
          }
        } else {
          // If no doctor selected, use department charges
          const dept = departments.find(
            (d) => d.id === parseInt(selectedDepartment)
          );
          if (dept) {
            const baseFee =
              visitType === "new"
                ? dept.newCharges || 0
                : dept.repeatCharges || 0;
                const adjustedBaseFee = applyNightConsultationMinimum(baseFee, parseInt(selectedDepartment));
            const finalFee = await applyConcession(
              adjustedBaseFee,
              undefined,
              parseInt(selectedDepartment)
            );
            setConsultationFee(finalFee?.toFixed(2) || "0.00");
          } else {
            setConsultationFee("0.00");
          }
        }
      } else if (!selectedDepartment && !selectedConsultant) {
        setConsultationFee("0.00");
      }
    };

    fetchCharges();
  }, [
    selectedDepartment,
    visitType,
    departmentAutoSelected,
    consultants,
    departments,
    noCharge,
    consultationFeeRefreshTick,
  ]);

  // Auto-calculate Paid Amount when Registration Fee or Consultation Fee changes
  useEffect(() => {
    const regFee = parseFloat(registrationFee) || 0;
    const consFee = parseFloat(consultationFee) || 0;
    const disc = parseFloat(discount) || 0;
    const totalAmount = regFee + consFee - disc;
    setPaidAmount(totalAmount.toFixed(2));
    setBalance("0.00");
  }, [registrationFee, consultationFee, discount]);

  // When Country is selected, filter States
  useEffect(() => {
    if (selectedCountry && countries.length > 0 && states.length > 0) {
      const countryId = parseInt(selectedCountry);
      const filteredStatesByCountry = states.filter(
        (s) => s.countryId === countryId
      );
      // If states are filtered by country, use them; otherwise show all
      if (filteredStatesByCountry.length > 0) {
        // States have countryId - filter them
        // This will trigger the state useEffect which filters districts
      }
    }
  }, [selectedCountry, countries, states]);

  // Cascading filters for location fields
  // When State is selected, filter District, Post, Village
  useEffect(() => {
    if (selectedState && states.length > 0 && districts.length > 0) {
      const stateId = parseInt(selectedState);
      const filtered = districts.filter((d) => d.stId === stateId);
      setFilteredDistricts(filtered);

      // Filter posts based on state
      const filteredPostsByState = posts.filter((p) => p.stId === stateId);
      setFilteredPosts(filteredPostsByState);

      // Don't filter villages here - they should load independently
    } else {
      setFilteredDistricts(districts);
      setFilteredPosts(posts);
    }
  }, [selectedState, states, districts, posts]);

  // When District is selected, filter Post and set State
  useEffect(() => {
    if (selectedDistrict && districts.length > 0) {
      const districtId = parseInt(selectedDistrict);
      const selectedDistrictObj = districts.find((d) => d.id === districtId);

      if (selectedDistrictObj) {
        // Only auto-select state if it's not already correctly set
        const currentStateId = selectedState ? parseInt(selectedState) : null;
        if (currentStateId !== selectedDistrictObj.stId) {
          setSelectedState(selectedDistrictObj.stId.toString());
        }

        // Filter posts based on district
        const filteredPostsByDistrict = posts.filter(
          (p) => p.distId === districtId
        );
        setFilteredPosts(filteredPostsByDistrict);

        // Don't filter villages here - they should load independently
      }
    }
  }, [selectedDistrict, districts, posts]);

  // When Post is selected, set State, District
  useEffect(() => {
    if (selectedPost && posts.length > 0) {
      const postId = parseInt(selectedPost);
      const selectedPostObj = posts.find((p) => p.id === postId);

      if (selectedPostObj) {
        // Only auto-select state/district if they're not already correctly set
        const currentStateId = selectedState ? parseInt(selectedState) : null;
        const currentDistrictId = selectedDistrict
          ? parseInt(selectedDistrict)
          : null;

        if (currentStateId !== selectedPostObj.stId) {
          if (selectedPostObj.stId != null) setSelectedState(selectedPostObj.stId.toString());
        }
        if (currentDistrictId !== selectedPostObj.distId) {
          if (selectedPostObj.distId != null) setSelectedDistrict(selectedPostObj.distId.toString());
        }

        // Auto-fill pincode from post code
        if (selectedPostObj.code) {
          setPincode(selectedPostObj.code);
        }

        // Don't filter villages here - they should load independently
      }
    }
  }, [selectedPost, posts]);

  // Auto-set registration fee based on visit type
  useEffect(() => {
    if (visitType === "new") {
      setRegistrationFee("0.00");
    } else if (visitType === "repeat" || visitType === "edit") {
      setRegistrationFee("0.00");
    }
  }, [visitType]);

  // Auto-populate payment amounts when payment type or fees change
  useEffect(() => {
    // Calculate net payable
    const regFee = parseFloat(registrationFee) || 0;
    const conFee = parseFloat(consultationFee) || 0;
    const disc = parseFloat(discount) || 0;
    const netPayable = regFee + conFee - disc;

    // Only auto-populate if there's a payment type selected and net payable > 0
    if (selectedPaymentType && netPayable > 0 && paymentTypes.length > 0) {
      const currentType = paymentTypes.find(
        (pt) => pt.id === parseInt(selectedPaymentType)
      );

      if (currentType) {
        const typeName = currentType.name.toLowerCase();

        if (typeName === "cash") {
          // Auto-populate cash amount with net payable
          setCashAmount(netPayable.toFixed(2));
          setBankAmount("");
          setInsurance("");
          setStaffCredit("");
          setBalance("0.00");
        } else if (typeName === "bank") {
          // Auto-populate bank amount with net payable
          setBankAmount(netPayable.toFixed(2));
          setCashAmount("");
          setInsurance("");
          setStaffCredit("");
          setBalance("0.00");

          // Also auto-fill default bank selections if not already set
          if (!selectedPaymentMode && paymentModes.length > 0) {
            const upi = paymentModes.find(
              (pm) => pm.name.toLowerCase() === "upi"
            );
            if (upi) setSelectedPaymentMode(upi.id.toString());
          }
          if (!selectedBank && banks.length > 0) {
            const sbi = banks.find(
              (b) => b.name.toLowerCase().includes("sbi") || b.name.toLowerCase().includes("state bank")
            );
            if (sbi) setSelectedBank(sbi.id.toString());
          }
        } else if (typeName === "split") {
          // For split, clear all amounts and set balance to net payable
          setCashAmount("");
          setBankAmount("");
          setInsurance("");
          setStaffCredit("");
          setBalance(netPayable.toFixed(2));
        }
      }
    } else if (selectedPaymentType && netPayable <= 0) {
      // Net payable is zero (full discount) — clear all payment amounts
      setCashAmount("0");
      setBankAmount("");
      setInsurance("");
      setStaffCredit("");
      setBalance("0.00");
    }
  }, [
    selectedPaymentType,
    registrationFee,
    consultationFee,
    discount,
    paymentTypes,
    paymentModes,
    banks,
  ]);

  // Calculate village dropdown position when it opens
  useEffect(() => {
    if (showVillageDropdown) {
      const villageInput = document.getElementById('villageInput');
      if (villageInput) {
        const rect = villageInput.getBoundingClientRect();
        const dropdownHeight = 200; // max-height of dropdown
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;

        // If not enough space below but enough space above, show dropdown above
        if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
          setVillageDropdownPosition('top');
        } else {
          setVillageDropdownPosition('bottom');
        }
      }
    }
  }, [showVillageDropdown]);

  // When Village search/select happens, set State, District, Post, Country
  const handleVillageSelect = async (village: any) => {
    setVillageSearch(village.name);
    setSelectedVillageId(village.id.toString());
    setShowVillageDropdown(false);

    // Load posts first so they can be filtered and displayed
    await ensurePostsLoaded();

    // Auto-select all parent fields based on village
    // Set Post
    if (village.postId) {
      setSelectedPost(village.postId.toString());
    }

    // Set District
    if (village.distId) {
      setSelectedDistrict(village.distId.toString());
    }

    // Set State and Country
    if (village.stId) {
      setSelectedState(village.stId.toString());

      // Find the state's country and auto-select it
      const selectedStateObj = states.find((s) => s.id === village.stId);
      if (selectedStateObj && selectedStateObj.countryId) {
        setSelectedCountry(selectedStateObj.countryId.toString());
      }
    }
  };

  // Handle village blur - logic moved to handleSave
  const handleVillageBlur = async () => {
    // Use setTimeout to allow mouseDown events on options to fire first
    // This prevents the dropdown from closing before an option is selected
    setTimeout(() => {
      setShowVillageDropdown(false);
    }, 150);
  };

  const fetchCountries = async () => {
    try {
      const response = await apiService.fetchAllCountries();
      if (Array.isArray(response)) {
        setCountries(response);
      } else {
        setCountries([]);
      }
    } catch (error) {
      console.error("Error fetching countries:", error);
      setCountries([]);
    }
  };

  const fetchStates = async () => {
    try {
      const response = await apiService.fetchAllStates();
      if (Array.isArray(response)) {
        setStates(response);
      } else {
        setStates([]);
      }
    } catch (error) {
      console.error("Error fetching states:", error);
      setStates([]);
    }
  };
  const fetchDistricts = async () => {
    try {
      const response = await apiService.fetchAllDistricts();
      if (Array.isArray(response)) {
        setDistricts(response);
      } else {
        setDistricts([]);
      }
    } catch (error) {
      console.error("Error fetching districts:", error);
      setDistricts([]);
    }
  };

  // Lazy-load posts when needed (e.g., patient pre-fill or search)
  const ensurePostsLoaded = async (): Promise<any[]> => {
    if (posts.length > 0) return posts;
    try {
      const response = await apiService.fetchAllPosts();
      const data = Array.isArray(response) ? response : [];
      setPosts(data);
      return data;
    } catch (error) {
      console.error("Error fetching posts:", error);
      return [];
    }
  };

  // Called by postOffice SearchableSelect onSearch (min 2 chars)
  const searchPosts = async (searchTerm: string) => {
    setPostSearch(searchTerm);
    if (searchTerm.length >= 2) {
      try {
        const response = await apiService.fetchPostName(searchTerm);
        const data = Array.isArray(response) ? response : [];
        setFilteredPosts(data);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setFilteredPosts([]);
      }
    } else {
      setFilteredPosts([]);
    }
  };

  // Lazy-load villages when needed (e.g., patient pre-fill or search)
  const ensureVillagesLoaded = async (): Promise<any[]> => {
    if (villages.length > 0) return villages;
    try {
      const response = await apiService.fetchAllVillages();
      const data = Array.isArray(response) ? response : [];
      setVillages(data);
      return data;
    } catch (error) {
      console.error("Error fetching villages:", error);
      return [];
    }
  };

  const fetchGuardianTypes = async () => {
    try {
      const response = await apiService.fetchAllGuardianTypes();
      if (Array.isArray(response)) {
        setGuardianTypes(response);
      } else {
        setGuardianTypes([]);
      }
    } catch (error) {
      console.error("Error fetching guardian types:", error);
      setGuardianTypes([]);
    }
  };

  const fetchGenders = async () => {
    try {
      const response = await apiService.fetchAllGenders();
      if (Array.isArray(response)) {
        setGenders(response);
      } else {
        setGenders([]);
      }
    } catch (error) {
      console.error("Error fetching genders:", error);
      setGenders([]);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await apiService.fetchAllDepartments();
      setDepartments(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Error fetching departments:", error);
      setDepartments([]);
    }
  };

  const fetchConsultants = async () => {
    try {
      const response = await apiService.fetchAllConsultants();
      setConsultants(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Error fetching consultants:", error);
      setConsultants([]);
    }
  };

  const fetchPaymentConfig = async () => {
    try {
      const [types, modes, accHeads, bankList] = await Promise.all([
        apiService.fetchAllPaymentTypes(),
        apiService.fetchAllPaymentModes(),
        apiService.fetchAccountHeads(),
        apiService.fetchAllBankDetails(),
      ]);
      setPaymentTypes(Array.isArray(types) ? types : []);
      setPaymentModes(Array.isArray(modes) ? modes : []);
      setAccountHeads(Array.isArray(accHeads) ? accHeads : []);
      setBanks(Array.isArray(bankList) ? bankList : []);
    } catch (error) {
      console.error("Error fetching payment configuration:", error);
    }
  };

  // Search functions for dynamic loading
  const searchConsultants = async (searchTerm: string) => {
    if (searchTerm.length >= 0) {
      try {
        const response = await apiService.fetchAllConsultants();
        setConsultants(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error("Error fetching consultants for search:", error);
        setConsultants([]); // Set empty array on error to prevent UI break
      }
    }
  };

  const searchDepartments = async (searchTerm: string) => {
    if (searchTerm.length >= 0) {
      try {
        const response = await apiService.fetchAllDepartments();
        setDepartments(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error("Error fetching departments:", error);
        setDepartments([]); // Set empty array on error to prevent UI break
      }
    }
  };

  // Fetch patient details by OP number
  const fetchPatientByOpNumber = async (
    opNum: string,
    currentVisitType?: "new" | "repeat" | "edit"
  ) => {
    if (!opNum.trim()) return;

    setIsLoadingPatient(true);
    try {
      const response = await apiService.fetchPatientDetails(opNum.trim());
      const patientData = response?.data || response;

      if (!patientData) {
        showErrorModal(
          "No patient found with this OP number",
          "Patient Not Found"
        );
        setIsLoadingPatient(false);
        return;
      }

      // For REPEAT visits, check patient status
      if (currentVisitType === "repeat") {
        if (patientData.isInOp === true) {
          const opDoctor = patientData.doctorName ? `\nDoctor: ${patientData.doctorName}` : "";
          const opDept = patientData.departmentName ? `\nDepartment: ${patientData.departmentName}` : "";
          const lastVisit = patientData.lastVisitDate
            ? `\nLast Visited: ${new Date(patientData.lastVisitDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`
            : "";
          showWarningModal(
            `This patient is already registered in Outpatient. Cannot create a repeat visit.${opDoctor}${opDept}${lastVisit}`,
            "Patient Already in OP"
          );
          setIsLoadingPatient(false);
          return;
        }
        if (patientData.isInOp === false && patientData.isInIp === true) {
          const ipDoctor = patientData.doctorName ? `\nDoctor: ${patientData.doctorName}` : "";
          const ipDept = patientData.departmentName ? `\nDepartment: ${patientData.departmentName}` : "";
          showWarningModal(
            `This patient is currently admitted in Inpatient department. Cannot create a repeat OP visit.${ipDoctor}${ipDept}`,
            "Patient in IP"
          );
          setIsLoadingPatient(false);
          return;
        }
      }

      // For EDIT: No status validation, load data directly
      // Load patient data into form fields

      // Store patient ID for repeat/edit operations
      if (patientData.patId) {
        setPatientId(patientData.patId);
      }

      // Store original isInOp status for edit operations
      if (patientData.isInOp !== undefined) {
        setOriginalIsInOp(patientData.isInOp);
      }

      setFirstName(patientData.name || "");
      setSecondName(patientData.secName || "");
      setGuardianName(patientData.gname || "");
      setPhoneNumber(patientData.phone || "");
      setAddress(patientData.add1 || "");
      setPincode(patientData.pincode || "");
      setEmail(patientData.email || "");
      setIdType(patientData.govIdType || "");
      setIdNumber(patientData.govIdNo || "");
      setIsMarried(patientData.isMarried === 1 ? 1 : 0);

      // Set gender
      if (patientData.sex) {
        const genderObj = genders.find(
          (g: any) => g.name?.toLowerCase() === patientData.sex.toLowerCase()
        );
        if (genderObj) {
          setGender(genderObj.id.toString());
        }
      }

      // Set DOB
      if (patientData.dob) {
        // API returns dob in YYYY-MM-DD format
        setDob(patientData.dob);
        calculateAgeFromDOB(patientData.dob);
      }

      // Set location fields
      if (patientData.country) {
        const countryObj = countries.find(
          (c: any) =>
            c.name?.toLowerCase() === patientData.country.toLowerCase()
        );
        if (countryObj) {
          setSelectedCountry(countryObj.id.toString());
        }
      }

      if (patientData.state) {
        const stateObj = states.find(
          (s: any) => s.name?.toLowerCase() === patientData.state.toLowerCase()
        );
        if (stateObj) {
          setSelectedState(stateObj.id.toString());
        }
      }

      if (patientData.districtId) {
        setSelectedDistrict(patientData.districtId.toString());
      } else if (patientData.district) {
        const districtObj = districts.find(
          (d: any) =>
            d.name?.toLowerCase() === patientData.district.toLowerCase()
        );
        if (districtObj) {
          setSelectedDistrict(districtObj.id.toString());
        }
      }

      if (patientData.post) {
        setPostSearch(patientData.post);
        // Fetch posts matching the patient's post name
        try {
          const response = await apiService.fetchPostName(patientData.post);
          const postsData = Array.isArray(response) ? response : [];
          const postObj = postsData.find(
            (p: any) => p.name?.toLowerCase() === patientData.post.toLowerCase()
          );
          if (postObj) {
            setSelectedPost(postObj.id.toString());
            setFilteredPosts(postsData);
          }
        } catch (error) {
          console.error('Error fetching post:', error);
        }
      }

      if (patientData.village) {
        setVillageSearch(patientData.village);
        // Fetch villages matching the patient's village name
        try {
          const response = await apiService.fetchVillageName(patientData.village);
          const villagesData = Array.isArray(response) ? response : [];
          const villageObj = villagesData.find(
            (v: any) =>
              v.name?.toLowerCase() === patientData.village.toLowerCase()
          );
          if (villageObj) {
            setSelectedVillageId(villageObj.id.toString());
            setFilteredVillages(villagesData);
          }
        } catch (error) {
          console.error('Error fetching village:', error);
        }
      }

      // Set guardian type
      if (patientData.guardianType) {
        const guardianTypeObj = guardianTypes.find(
          (gt: any) =>
            gt.name?.toLowerCase() === patientData.guardianType.toLowerCase()
        );
        if (guardianTypeObj) {
          setSelectedGuardianType(guardianTypeObj.id.toString());
        }
      }

      // Set last visit information
      if (patientData.lastVisitId) {
        // Use actual last visit date from API
        if (patientData.lastVisitDate) {
          setLastVisitDate(patientData.lastVisitDate);
        }

        if (patientData.doctorId) {
          setLastVisitDoctorId(patientData.doctorId);
          // Load consultants if not loaded yet
          if (consultants.length === 0) {
            await fetchConsultants();
          }
          setSelectedConsultant(patientData.doctorId.toString());
        }

        // Set department using departmentId from API
        if (patientData.departmentId) {
          setSelectedDepartment(patientData.departmentId.toString());
          setLastVisitDepartmentId(patientData.departmentId);
        }


      }

      // Set account head
      if (patientData.debitHead || patientData.accountCategory) {
        const accountHeadName =
          patientData.debitHead || patientData.accountCategory;
        const accountHeadObj = accountHeads.find(
          (ah: any) => ah.name?.toLowerCase() === accountHeadName.toLowerCase()
        );
        if (accountHeadObj) {
          setSelectedAccountHead(accountHeadObj.id.toString());
        }
      }

      setValidationErrors({});
      setPatientDataLoaded(true);

      // Show success notification
      showSuccessToast("Patient details loaded successfully.", "Patient Found");
    } catch (error: any) {
      console.error("Error fetching patient details:", error);
      const errorMsg =
        error.response?.data?.message || error.message || "Invalid OP Number";
      showWarningModal(errorMsg, "Patient Not Found");
    } finally {
      setIsLoadingPatient(false);
    }
  };

  // Search patients
  // Handle patient selection from search results
  const handlePatientSelect = (patient: Patient) => {
    // Set the OP number
    setOpNumber(patient.displayNumber);

    // Directly fetch patient details
    setTimeout(() => {
      fetchPatientByOpNumber(patient.displayNumber, visitType);
    }, 100);
  };

  // Auto-select payment type, mode, and bank
  useEffect(() => {
    if (paymentTypes.length > 0 && !selectedPaymentType) {
      // Auto-select "cash" payment type
      const cashType = paymentTypes.find(
        (type: any) => type.name?.toLowerCase() === "cash"
      );
      if (cashType) {
        setSelectedPaymentType(cashType.id.toString());
      }
    }
  }, [paymentTypes, selectedPaymentType]);

  // Auto-select payment mode and bank when payment type changes to bank
  useEffect(() => {
    if (selectedPaymentType && paymentTypes.length > 0) {
      const selectedType = paymentTypes.find(
        (type: any) => type.id.toString() === selectedPaymentType
      );
      if (selectedType && selectedType.name?.toLowerCase() === "bank") {
        // Auto-select UPI mode
        if (paymentModes.length > 0 && !selectedPaymentMode) {
          const upiMode = paymentModes.find(
            (mode: any) => mode.name?.toLowerCase() === "upi"
          );
          if (upiMode) {
            setSelectedPaymentMode(upiMode.id.toString());
          }
        }
        // Auto-select SBI Bank
        if (banks.length > 0 && !selectedBank) {
          const sbiBank = banks.find((bank: any) =>
            bank.name?.toLowerCase().includes("sbi")
          );
          if (sbiBank) {
            setSelectedBank(sbiBank.id.toString());
          }
        }
      }
    }
  }, [
    selectedPaymentType,
    paymentTypes,
    paymentModes,
    banks,
    selectedPaymentMode,
    selectedBank,
  ]);

  // Auto-select "GENERAL PATIENT ACCOUNT" when account heads are loaded
  useEffect(() => {
    if (accountHeads.length > 0 && !selectedAccountHead) {
      const generalPatientAccount = accountHeads.find(
        (ah: any) =>
          ah.headName?.toLowerCase().includes("general") &&
          ah.headName?.toLowerCase().includes("patient")
      );
      if (generalPatientAccount) {
        setSelectedAccountHead(generalPatientAccount.headId.toString());
      }
    }
  }, [accountHeads, selectedAccountHead]);

  // Validate form
  const validateForm = (
    currentVisitType?: "new" | "repeat" | "edit"
  ): Record<string, boolean> => {
    const errors: { [key: string]: boolean } = {};

    // Use provided visit type or fall back to state
    const typeToValidate = currentVisitType || visitType;

    // Always validate these core fields
    if (typeToValidate !== "edit") {
      if (!selectedAccountHead) errors.accountHead = true;
      if (!selectedConsultant) errors.doctor = true;
      if (!selectedDepartment) errors.department = true;
    }

    // For new patients, validate all required fields
    if (typeToValidate === "new") {
      if (!firstName.trim()) errors.firstName = true;
      if (!gender) errors.gender = true;
      if (!dob) errors.dob = true;
      if (!guardianName.trim()) errors.guardianName = true;
      if (!selectedGuardianType) errors.guardianType = true;
      if (!selectedCountry) errors.nationality = true;
      if (!selectedState) errors.state = true;
      if (!selectedDistrict) errors.district = true;
      // Post validation: allow either selected post ID or typed post name
      if (!selectedPost.trim() && !postSearch.trim()) errors.post = true;
      // Village validation: allow either selected village ID or typed village name
      if (!selectedVillageId.trim() && !villageSearch.trim())
        errors.village = true;
    }
    // For repeat patients, only validate OP number separately (already done above)
    else if (typeToValidate === "repeat") {
      // Could add minimal validation for repeat patients if needed
    }
    // For edit patients, validate OP number separately and basic patient info
    else if (typeToValidate === "edit") {
      if (!firstName.trim()) errors.firstName = true;
      if (!gender) errors.gender = true;
      if (!dob) errors.dob = true;
      if (!guardianName.trim()) errors.guardianName = true;
      if (!selectedGuardianType) errors.guardianType = true;
      if (!selectedCountry) errors.nationality = true;
      if (!selectedState) errors.state = true;
      if (!selectedDistrict) errors.district = true;
      // Post validation: allow either selected post ID or typed post name
      if (!selectedPost.trim() && !postSearch.trim()) errors.post = true;
      // Village validation: allow either selected village ID or typed village name
      if (!selectedVillageId.trim() && !villageSearch.trim())
        errors.village = true;
    }

    setValidationErrors(errors);
    return errors;
  };

  // Clear specific validation error
  const clearValidationError = (field: string) => {
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Handle Save
  const handleSave = async () => {
    // Get the actual current visit type from DOM for reliability
    const newOPRadio = document.getElementById("newOP") as HTMLInputElement;
    const repeatOPRadio = document.getElementById(
      "repeatOP"
    ) as HTMLInputElement;
    const editOPRadio = document.getElementById("editOP") as HTMLInputElement;

    let actualVisitType: "new" | "repeat" | "edit" = visitType;
    if (newOPRadio?.checked) {
      actualVisitType = "new";
    } else if (repeatOPRadio?.checked) {
      actualVisitType = "repeat";
    } else if (editOPRadio?.checked) {
      actualVisitType = "edit";
    }

    // Check if Repeat is selected and OP number is empty
    if (
      (actualVisitType === "repeat" || actualVisitType === "edit") &&
      !opNumber.trim()
    ) {
      await showWarningModal(
        "Please enter OP Number for Repeat/Edit patient.",
        "OP Number Required"
      );
      // Wait a tiny bit for the modal teardown to complete so focus isn't stolen back
      setTimeout(() => {
        const opNumElement = document.getElementById("opNumber");
        if (opNumElement) {
          opNumElement.focus();
          opNumElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return;
    }

    // Check for negative age values (indicates invalid DOB)
    if (years < 0 || months < 0 || days < 0) {
      await showValidationError("Age values are invalid. Please check the Date of Birth.");
      setTimeout(() => {
        const dobElement = document.getElementById("dob");
        if (dobElement) {
          dobElement.focus();
          dobElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return;
    }

    // Check if there's a balance before submitting
    const balanceAmount = parseFloat(balance) || 0;
    if (balanceAmount > 0) {
      const result = await showConfirmDialog(
        `There is a balance of ₹${balanceAmount.toFixed(2)}`,
        "Do you want to continue with this registration?",
        "Yes, Continue",
        "No, Cancel"
      );
      
      if (!result.isConfirmed) {
        return; // User cancelled, don't proceed
      }
    }

    // Validate form with the actual visit type from DOM
    const rawErrors = validateForm(actualVisitType);
    if (Object.keys(rawErrors).length > 0) {
      await showValidationError("Please fill in all required fields marked in red.");

      // Wait a tiny bit for the modal to completely close before applying focus,
      // otherwise SweetAlert2 will steal focus back to the submit button
      setTimeout(() => {
        // Focus the first empty field in visual order
        const focusOrder = [
          { key: "firstName", id: "firstName" },
          { key: "guardianName", id: "guardianName" },
          { key: "guardianType", id: "guardianType" },
          { key: "gender", id: "gender" },
          { key: "dob", id: "dob" },
          { key: "nationality", id: "nationality" },
          { key: "state", id: "state" },
          { key: "district", id: "district" },
          { key: "post", id: "postOffice" },
          { key: "village", id: "villageInput" },
          { key: "phoneNumber", id: "phoneNumber" },
          { key: "accountHead", id: "accountHead" },
          { key: "doctor", id: "doctor" },
          { key: "department", id: "department" }
        ];

        for (const item of focusOrder) {
          if (rawErrors[item.key]) {
            const element = document.getElementById(item.id);
            if (element) {
              element.focus();
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              break;
            }
          }
        }
      }, 100);
      
      return;
    }

    // Handle auto-create post if unknown post is typed
    let postIdToSave = selectedPost;
    
    // Check if what user typed matches an existing post
    if (postSearch.trim() && selectedState && selectedDistrict) {
      const normalizedPostSearch = postSearch.toLowerCase().trim();
      let existingPost = filteredPosts.find(
        (p) => p.name?.toLowerCase().trim() === normalizedPostSearch
      );

      if (!existingPost) {
        try {
          const response = await apiService.fetchPostName(postSearch.trim());
          const fetchedPosts = Array.isArray(response) ? response : [];
          const matchedFetchedPost = fetchedPosts.find(
            (p: any) => p.name?.toLowerCase().trim() === normalizedPostSearch
          );

          if (matchedFetchedPost) {
            existingPost = matchedFetchedPost;
            setFilteredPosts((prev) => {
              const alreadyExists = prev.some(
                (post: any) => post.id === matchedFetchedPost.id
              );
              return alreadyExists ? prev : [...prev, matchedFetchedPost];
            });
          }
        } catch (error) {
          console.error("Error checking post existence:", error);
        }
      }

      // If user typed something that doesn't exist, create it
      if (!existingPost) {
        // Post not found, create new one
        try {
          const loginData = JSON.parse(sessionStorage.getItem('loginData') || '{}');
          const newPostPayload = {
            name: postSearch.trim(),
            code: pincode || '',
            stId: parseInt(selectedState),
            distId: parseInt(selectedDistrict),
            uid: loginData.id || 1,
            isActive: 1,
          };

          const response = await apiService.savePost(newPostPayload);
          const createdPost = response?.data || response;

          if (createdPost && createdPost.id) {
            // Update post list
            setFilteredPosts((prev) => [...prev, createdPost]);
            postIdToSave = createdPost.id.toString();
            setSelectedPost(createdPost.id.toString());
          }
        } catch (error) {
          console.error("Error creating post:", error);
          showErrorModal(
            "Failed to create new post office. Please try again.",
            "Error"
          );
          return;
        }
      } else {
        // Post exists, use its ID
        postIdToSave = existingPost.id.toString();
        setSelectedPost(existingPost.id.toString());
      }
    }

    // Handle auto-create village if unknown village is typed
    let villageIdToSave = selectedVillageId;
    
    // Check if what user typed matches the currently selected village
    if (villageSearch.trim() && selectedState && selectedDistrict && postIdToSave) {
      const existingVillage = filteredVillages.find(
        (v) => v.name?.toLowerCase() === villageSearch.toLowerCase()
      );
      
      // If user typed something that doesn't exist, create it
      if (!existingVillage) {
        // Village not found, create new one
        try {
          const loginData = JSON.parse(sessionStorage.getItem('loginData') || '{}');
          const newVillagePayload = {
            name: villageSearch.trim(),
            code: '',
            villageType: 'R',
            stId: parseInt(selectedState),
            distId: parseInt(selectedDistrict),
            postId: parseInt(postIdToSave),
            uid: loginData.id || 1,
            isActive: 1,
          };

          const response = await apiService.saveVillage(newVillagePayload);
          const createdVillage = response?.data || response;

          if (createdVillage && createdVillage.id) {
            // Update village list
            setFilteredVillages([...filteredVillages, createdVillage]);
            villageIdToSave = createdVillage.id.toString();
            setSelectedVillageId(createdVillage.id.toString());
          }
        } catch (error) {
          console.error("Error creating village:", error);
          showErrorModal(
            "Failed to create new village. Please try again.",
            "Error"
          );
          return;
        }
      } else {
        // Village exists, use its ID
        villageIdToSave = existingVillage.id.toString();
      }
    }

    try {
      // Prepare payload based on visit type
      const visitTypeMap = {
        new: "NEW_OP",
        repeat: "REPEAT_OP",
        edit: "EDIT",
      };

      const payload: any = {
        type: visitTypeMap[actualVisitType],
        patientId:
          actualVisitType === "repeat" || actualVisitType === "edit"
            ? patientId
            : 0,
        name: firstName,
        displayNumber: opNumber || "",
        registeredUser: 1,
        isInOp:
          actualVisitType === "new" || actualVisitType === "repeat"
            ? 1
            : originalIsInOp
            ? 1
            : 0,
        isInIp: 0,
        locId: 0,
        oldOpNo: "",
        blockedReason: "",
        secName: secondName,
        sex: gender,
        dob: dob,
        gtype: selectedGuardianType,
        gname: guardianName,
        govId: idType ? parseInt(idType) : 0,
        govIdNo: idNumber,
        phone: phoneNumber,
        email: email,
        add1: address,
        add2: "",
        pincode: pincode,
        countryId: parseInt(selectedCountry) || 0,
        stateId: parseInt(selectedState) || 0,
        districtId: parseInt(selectedDistrict) || 0,
        postId: parseInt(postIdToSave) || 0,
        villageId: parseInt(villageIdToSave) || 0,
        isMarried: isMarried,
        patCategory: "",
        modifiedUser: "",
        isNewVisit: actualVisitType === "new" ? 1 : 0,
        doctorId: parseInt(selectedConsultant) || 0,
        deptId: parseInt(selectedDepartment) || 0,
        caseType: caseType,
        visitDate: new Date().toISOString().split("T")[0],
        visitTime: new Date().toLocaleTimeString("en-GB", { hour12: false }),
        age: years,
        isOutside: 0,
        complaintId: 1,
        note: "",
        debitId: parseInt(selectedAccountHead) || 0,
        uid: Number(loginData?.id) || 0,
        sysCode: window.location.hostname || "",
        orgId: 0,
        ageId: 0,
        vilId: 0,
        distIdVisit: 0,
        stIdVisit: 0,
        postIdVisit: 0,
        payment: {
          cashPaid: parseFloat(cashAmount) || 0,
          companyPaid: parseInt(selectedAccountHead) !== 1 ? parseFloat(companyPaid) || 0 : 0,
          bankPaid: parseFloat(bankAmount) || 0,
          paymentMode: (() => {
            const mode = paymentModes.find(
              (m: any) => m.id.toString() === selectedPaymentMode
            );
            return mode?.name || "";
          })(),
          paymentModeId: selectedPaymentMode ? parseInt(selectedPaymentMode) : 0,
          bankId: selectedBank ? parseInt(selectedBank) : 0,
          paymentAmount: parseFloat(paidAmount) || 0,
          regCharge: parseFloat(registrationFee) || 0,
          consulCharge: parseFloat(consultationFee) || 0,
          discount: parseFloat(discount) || 0,
          balance: parseFloat(balance) || 0,
          referenceNo: transactionNumber || "",
          debitId: parseInt(selectedAccountHead) || 0,
          discId: 0,
          transId: 0,
          billType: 1,
          refId: 0,
          refNo: "",
        },
      };

      setIsSubmitting(true); // Disable button immediately
      const response = await apiService.savePatientRegistration(payload);

      // Set the OP number and token number in the form (only for new/repeat)
      if (actualVisitType !== "edit") {
        setOpNumber(response.displayNumber);
        setRegisteredOpNumber(response.billDisplay); // Show billDisplay at top
        setMasterTokenNo(response.masterTokenNo);
        setTokenNoDept(response.tokenNoDept);
        setTokenNoDoctor(response.tokenNoDoctor);
        setTokenNumber(
          `Master: ${response.masterTokenNo}, Dept: ${response.tokenNoDept}, Doctor: ${response.tokenNoDoctor}`
        );
        setTodayNewPatients(response.newPatientCount);
        setTodayRepeatPatients(response.repeatPatientCount);
      }

      // Show appropriate success message
      if (actualVisitType === "edit") {
        showSuccessModal(
          "Patient details have been updated.",
          "Patient Updated Successfully!"
        );
      } else {
        showSuccessModal(
          `Patient registered successfully!<br><strong>OP Number: ${response.displayNumber}</strong><br><strong>Master Token: ${response.masterTokenNo}</strong><br><strong>Department Token: ${response.tokenNoDept}</strong><br><strong>Doctor Token: ${response.tokenNoDoctor}</strong>`,
          "Success!"
        );
      }
      
      setIsSubmitting(false); // Stop showing "Processing..." after success
    } catch (error: any) {
      console.error("Error registering patient:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to register patient. Please try again.";
      showErrorModal(errorMessage, "Error!");
      setIsSubmitting(false); // Re-enable button on error
    }
  };

  // Reset form to initial state
  const handleReset = () => {
    setIsSubmitting(false); // Re-enable button on reset
    setRegisteredOpNumber(""); // Clear registered OP number
    setVisitType("repeat");
    setFirstName("");
    setSecondName("");
    setGender("");
    setGuardianName("");
    setPhoneNumber("");
    setAddress("");
    setPincode("");
    setEmail("");
    setIdType("");
    setIdNumber("");
    setDob("");
    setYears(0);
    setMonths(0);
    setDays(0);
    setIsMarried(0);
    setPaymentType("cash");
    setCaseType(1);
    setSelectedPost("");
    setPostSearch("");
    setSelectedDepartment("");
    setDepartmentAutoSelected(false); // Reset auto-selection flag
    setSelectedConsultant("");
    setSelectedAccountHead("");
    setVillageSearch("");
    setSelectedVillageId("");
    setConsultationFee("0.00");
    setRegistrationFee("0.00");
    setDiscount("0.00");
    setPaidAmount("0.00");
    setBalance("0.00");
    setCompanyPaid("0");
    setTransactionNumber("");
    setOpNumber("");
    setTokenNumber("");
    setMasterTokenNo(0);
    setTokenNoDept(0);
    setTokenNoDoctor(0);
    setValidationErrors({});
    setPatientDataLoaded(false);
    setPatientId(0); // Reset patient ID
    setOriginalIsInOp(false); // Reset original OP status
    setLastVisitDate(""); // Reset last visit date
    setLastVisitDoctorId(null); // Reset last visit doctor
    setLastVisitDepartmentId(null); // Reset last visit department
    setConcessionApplied(false); // Reset concession flag
    setConcessionAmount(0); // Reset concession amount

    // Clear filtered options for search-based fields
    setFilteredPosts([]);
    setFilteredVillages([]);
    // Don't clear filtered districts - they will be re-filtered based on auto-selected state
    // setFilteredDistricts([]);

    // Don't clear auto-selected values - just re-trigger auto-selection
    // setSelectedCountry('');  // Don't clear - will auto-select India
    // setSelectedState('');    // Don't clear - will auto-select Tamil Nadu
    // setSelectedDistrict(''); // Don't clear - will auto-select Kanyakumari
    // setSelectedGuardianType(''); // Don't clear - will auto-select Father

    // Re-trigger auto-selection to ensure defaults are set
    setAutoSelectTrigger((prev) => prev + 1);

    // Focus on OP number input after reset
    setTimeout(() => {
      const opNumberInput = document.getElementById("opNumber");
      opNumberInput?.focus();
    }, 0);
  };

  // Handle Print Bill
  const handlePrintBill = () => {
    if (!registeredOpNumber) {
      showWarningModal("No registered patient found. Please register a patient first.", "Print Failed");
      return;
    }
    
    // Trigger print directly
    if (printTriggerRef.current) {
      printTriggerRef.current.click();
    }
  };

  // Handle Print Details
  const handlePrintDetails = () => {
    // if (!registeredOpNumber) {
    //   showWarningModal("No registered patient found. Please register a patient first.", "Print Failed");
    //   return;
    // }
    
    // Trigger print details directly
    if (printDetailsTriggerRef.current) {
      printDetailsTriggerRef.current.click();
    }
  };

  // Calculate age from DOB
  const calculateAgeFromDOB = (dateOfBirth: string) => {
    if (!dateOfBirth) return;
    const birthDate = new Date(dateOfBirth);
    const today = new Date();

    let y = today.getFullYear() - birthDate.getFullYear();
    let m = today.getMonth() - birthDate.getMonth();
    let d = today.getDate() - birthDate.getDate();

    if (d < 0) {
      m--;
      d += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    }
    if (m < 0) {
      y--;
      m += 12;
    }

    setYears(y);
    setMonths(m);
    setDays(d);
  };

  // Calculate DOB from age
  const calculateDOBFromAge = (y: number, m: number, d: number) => {
    const today = new Date();
    const calculatedDate = new Date(
      today.getFullYear() - y,
      today.getMonth() - m,
      today.getDate() - d
    );

    const formattedDate = calculatedDate.toISOString().split("T")[0];
    setDob(formattedDate);
  };

  const handleDOBChange = (value: string) => {
    setDob(value);
    calculateAgeFromDOB(value);
  };

  const handleYearsChange = (value: number) => {
    setYears(value);
    calculateDOBFromAge(value, months, days);
  };

  const handleMonthsChange = (value: number) => {
    setMonths(value);
    calculateDOBFromAge(years, value, days);
  };

  const handleDaysChange = (value: number) => {
    setDays(value);
    calculateDOBFromAge(years, months, value);
  };

  return (
    <div
      className="patient-registration-modern"
      style={{
        backgroundColor: "#f4f6f8",
        height: "100vh",
        overflowY: "auto",
        paddingBottom: "80px",
      }}
    >
      {/* Skip Link */}
      <a href="#main-content" className="sr-only sr-only-focusable">
        Skip to main content
      </a>

      {/* Top Navigation / Header */}
      <div
        className="bg-white shadow-sm sticky-top mb-2"
        style={{ zIndex: 100 }}
      >
        <Container fluid className="py-2">
          <div className="d-flex justify-content-between align-items-center gap-3">
            <div className="d-flex align-items-center gap-2">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{ 
                  width: "32px", 
                  height: "32px", 
                  backgroundColor: 'var(--page-secondary-color)',
                  color: 'var(--page-primary-color)'
                }}
              >
                <FontAwesomeIcon icon={faUserPlus} size="sm" />
              </div>
              <div>
                <h6 className="mb-0 fw-bold text-dark">Registration</h6>
              </div>
            </div>

            {/* Visit Type Selection */}
            <div
              className="d-flex visit-type-container"
              style={{ width: "320px" }}
            >
              <div className="flex-grow-1">
                <input
                  type="radio"
                  className="btn-check"
                  name="visitType"
                  id="newOP"
                  checked={visitType === "new"}
                  onChange={() => {
                    setVisitType("new");
                    setIsSubmitting(false);
                    setRegisteredOpNumber("");
                    setTimeout(
                      () => document.getElementById("firstName")?.focus(),
                      0
                    );
                  }}
                />
                <label
                  className={`btn btn-sm w-100 border-0 visit-type-btn ${
                    visitType === "new" ? "active" : "text-dark"
                  }`}
                  htmlFor="newOP"
                >
                  <FontAwesomeIcon icon={faUserPlus} className="me-1" />
                  New
                </label>
              </div>
              <div className="flex-grow-1">
                <input
                  type="radio"
                  className="btn-check"
                  name="visitType"
                  id="repeatOP"
                  checked={visitType === "repeat"}
                  onChange={() => {
                    setVisitType("repeat");
                    setPatientDataLoaded(false);
                    setIsSubmitting(false);
                    setRegisteredOpNumber("");
                    setTimeout(
                      () => document.getElementById("opNumber")?.focus(),
                      0
                    );
                  }}
                />
                <label
                  className={`btn btn-sm w-100 border-0 visit-type-btn ${
                    visitType === "repeat" ? "active" : "text-dark"
                  }`}
                  htmlFor="repeatOP"
                >
                  <FontAwesomeIcon icon={faSync} className="me-1" />
                  Repeat
                </label>
              </div>
              <div className="flex-grow-1">
                <input
                  type="radio"
                  className="btn-check"
                  name="visitType"
                  id="editOP"
                  checked={visitType === "edit"}
                  onChange={() => {
                    setVisitType("edit");
                    setIsSubmitting(false);
                    setRegisteredOpNumber("");
                    setTimeout(
                      () => document.getElementById("opNumber")?.focus(),
                      0
                    );
                  }}
                />
                <label
                  className={`btn btn-sm w-100 border-0 visit-type-btn ${
                    visitType === "edit" ? "active" : "text-dark"
                  }`}
                  htmlFor="editOP"
                >
                  <FontAwesomeIcon icon={faUserEdit} className="me-1" />
                  Edit
                </label>
              </div>
            </div>

            {/* OP Number Search */}
            <InputGroup style={{ width: "150px" }} className="shadow-sm">
              <Form.Control
                id="opNumber"
                ref={opNumberRef}
                type="text"
                placeholder="Enter OP Number..."
                value={opNumber}
                onChange={(e) => {
                  setOpNumber(e.target.value);
                  clearValidationError("opNumber");
                }}
                // onFocus={() => {
                //     if (mobileOpen) {
                //       closeMobileSidebar();
                //     }
                //     if (!collapsed) {
                //       toggleSidebar();
                //     }
                //   }}
                disabled={
                  visitType === "new" || isLoadingPatient || patientDataLoaded
                }
                readOnly={visitType === "new"}
                className="border border-end-0 ps-3 bg-white fw-bold"
                style={{
                  borderRadius: "4px 0 0 4px",
                  fontSize: "0.9rem",
                  height: "28px",
                  color: 'var(--page-secondary-color)'
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (
                      (visitType === "repeat" || visitType === "edit") &&
                      opNumber.trim()
                    ) {
                      e.preventDefault();
                      fetchPatientByOpNumber(opNumber, visitType);
                    }
                  }
                }}
              />
              <Button
                className="border border-start-0 px-3"
                style={{ 
                  borderRadius: "0 4px 4px 0", 
                  height: "28px",
                  backgroundColor: 'var(--page-primary-color)',
                  borderColor: 'var(--page-primary-color)',
                  color: 'var(--page-secondary-color)'
                }}
                onClick={() => setShowPatientSearch(true)}
                tabIndex={-1}
              >
                <FontAwesomeIcon icon={faSearch} style={{ color: 'var(--page-secondary-color)' }} />
              </Button>
              <Button
                className="border border-start-0 px-3"
                title="View Visit History"
                style={{ 
                  borderRadius: "0 4px 4px 0", 
                  height: "28px",
                  backgroundColor: 'var(--page-primary-color)',
                  borderColor: 'var(--page-primary-color)',
                  color: 'var(--page-secondary-color)',
                  marginLeft: "4px"
                }}
                tabIndex={-1}
                onClick={async () => {
                  if (!opNumber.trim()) return;
                  setLoadingVisitHistory(true);
                  setShowVisitHistory(true);
                  try {
                    const data = await apiService.fetchOpVisitsByOpNo(opNumber.trim());
                    setVisitHistoryList(Array.isArray(data) ? data : []);
                  } catch {
                    setVisitHistoryList([]);
                  } finally {
                    setLoadingVisitHistory(false);
                  }
                }}
              >
                <i className="fas fa-history" style={{ color: 'var(--page-secondary-color)' }}></i>
              </Button>
            </InputGroup>

            {/* Token Numbers */}
            <div className="d-flex gap-2">
              <div className="bg-light px-3 py-1 rounded-pill shadow-sm small d-flex align-items-center border">
                <span
                  className="text-muted me-2"
                  style={{ fontSize: "0.7rem", fontWeight: "var(--font-weight-semibold)" }}
                >
                  MASTER
                </span>
                <span className="fw-bold text-dark">
                  {masterTokenNo || "-"}
                </span>
              </div>
              <div className="bg-light px-3 py-1 rounded-pill shadow-sm small d-flex align-items-center border">
                <span
                  className="text-muted me-2"
                  style={{ fontSize: "0.7rem", fontWeight: "var(--font-weight-semibold)" }}
                >
                  DOCTOR
                </span>
                <span className="fw-bold text-dark">
                  {tokenNoDoctor || "-"}
                </span>
              </div>
            </div>

            <div className="d-flex align-items-center gap-2">
              {registeredOpNumber && (
                <div className="px-4 py-2 rounded-pill shadow-sm border border-success" style={{ backgroundColor: 'var(--page-primary-color)', color: 'var(--page-secondary-color)' }}>
                  <span
                    className="me-2"
                    style={{ fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-semibold)" }}
                  >
                    ✓ Bill No:
                  </span>
                  <span className="fw-bold" style={{ fontSize: "0.9rem" }}>
                    {registeredOpNumber}
                  </span>
                </div>
              )}
              <Button
                variant="light"
                className="border rounded-circle p-1 d-flex align-items-center justify-content-center shadow-sm"
                style={{ width: "32px", height: "32px" }}
                onClick={() => setShowKeyboardHelp(true)}
                title="Keyboard Shortcuts"
                tabIndex={-1}
              >
                <FontAwesomeIcon
                  icon={faKeyboard}
                  className="text-secondary"
                  size="sm"
                />
              </Button>
            </div>
          </div>
        </Container>
      </div>

      <Container fluid className="px-3">
        <Row className="g-2">
          {/* Left Column: Visit & Patient Info */}
          <Col lg={8}>
            {/* Personal Information */}
            <Card className="neat-card mb-3">
              <Card.Header className="neat-card-header border-bottom-0 py-2 px-3">
                <div className="d-flex align-items-center gap-2">
                  <div
                    className="bg-light rounded-circle p-2 d-flex align-items-center justify-content-center"
                    style={{ width: "32px", height: "32px" }}
                  >
                    <FontAwesomeIcon
                      icon={faIdCard}
                      className="text-primary small"
                    />
                  </div>
                  <h6
                    className="fw-bold text-dark mb-0 text-uppercase"
                    style={{ fontSize: "var(--font-size-sm)", letterSpacing: "0.5px" }}
                  >
                    Patient Information
                  </h6>
                </div>
              </Card.Header>
              <Card.Body className="p-3 pt-0">
                <Row className="g-2">
                  <Col md={3}>
                    <Form.Group className="position-relative">
                      <Form.Control
                        size="sm"
                        id="firstName"
                        ref={visitType === "new" ? firstInputRef : undefined}
                        type="text"
                        className=""
                        value={firstName}
                        onChange={(e) => {
                          setFirstName(e.target.value);
                          clearValidationError("firstName");
                        }}
                        isInvalid={validationErrors.firstName}
                        placeholder=" "
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          document.getElementById("secondName")?.focus()
                        }
                      />
                      <Form.Label className="floating-label">
                        First Name <span className="text-danger">*</span>
                      </Form.Label>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="position-relative">
                      <Form.Control
                        size="sm"
                        id="secondName"
                        type="text"
                        className=""
                        value={secondName}
                        onChange={(e) => setSecondName(e.target.value)}
                        placeholder=" "
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          document.getElementById("guardianName")?.focus()
                        }
                      />
                      <Form.Label className="floating-label">
                        Second Name
                      </Form.Label>
                    </Form.Group>
                  </Col>

                  <Col md={3}>
                    <Form.Group className="position-relative">
                      <Form.Control
                        size="sm"
                        id="guardianName"
                        type="text"
                        className=""
                        value={guardianName}
                        onChange={(e) => {
                          setGuardianName(e.target.value);
                          clearValidationError("guardianName");
                        }}
                        isInvalid={validationErrors.guardianName}
                        placeholder=" "
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          document.getElementById("guardianType")?.focus()
                        }
                      />
                      <Form.Label className="floating-label">
                        Guardian Name <span className="text-danger">*</span>
                      </Form.Label>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="position-relative">
                      <div
                        className={
                          validationErrors.guardianType
                            ? "border border-danger rounded-2"
                            : ""
                        }
                      >
                        <SearchableSelect
                          id="guardianType"
                          value={selectedGuardianType}
                          onChange={(val) => {
                            setSelectedGuardianType(val);
                            clearValidationError("guardianType");
                          }}
                          options={guardianTypes.map((gt) => ({
                            value: gt.id,
                            label: gt.name,
                          }))}
                          placeholder=" "
                        />
                      </div>
                      <Form.Label className="floating-label-select">
                        Relation <span className="text-danger">*</span>
                      </Form.Label>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="position-relative">
                      <Form.Select
                        size="sm"
                        id="gender"
                        className=""
                        value={gender}
                        onChange={(e) => {
                          setGender(e.target.value);
                          clearValidationError("gender");
                        }}
                        isInvalid={validationErrors.gender}
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          document.getElementById("dob")?.focus()
                        }
                      >
                        <option value=""></option>
                        {genders.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.name}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Label className="floating-label-select">
                        Gender <span className="text-danger">*</span>
                      </Form.Label>
                    </Form.Group>
                  </Col>

                  <Col md={3}>
                    <Form.Group className="position-relative">
                      <Form.Control
                        size="sm"
                        id="dob"
                        type="date"
                        className=""
                        value={dob}
                        onChange={(e) => {
                          handleDOBChange(e.target.value);
                          clearValidationError("dob");
                        }}
                        isInvalid={validationErrors.dob}
                        placeholder=" "
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          document.getElementById("years")?.focus()
                        }
                      />
                      <Form.Label className="floating-label">
                        DOB <span className="text-danger">*</span>
                      </Form.Label>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Row className="g-1 align-items-center">
                      <Col xs={3}>
                        <Form.Group className="position-relative">
                          <Form.Control
                            id="years"
                            type="number"
                            placeholder=" "
                            value={years}
                            onChange={(e) =>
                              handleYearsChange(Number(e.target.value))
                            }
                            size="sm"
                            onFocus={(e) => e.target.select()}
                            onKeyDown={(e) =>
                              e.key === "Enter" &&
                              document.getElementById("months")?.focus()
                            }
                          />
                          <Form.Label
                            className="floating-label"
                            style={{ fontSize: "var(--font-size-xs)" }}
                          >
                            Y
                          </Form.Label>
                        </Form.Group>
                      </Col>
                      <Col xs={3}>
                        <Form.Group className="position-relative">
                          <Form.Control
                            id="months"
                            type="number"
                            placeholder=" "
                            value={months}
                            onChange={(e) =>
                              handleMonthsChange(Number(e.target.value))
                            }
                            size="sm"
                            onFocus={(e) => e.target.select()}
                            onKeyDown={(e) =>
                              e.key === "Enter" &&
                              document.getElementById("days")?.focus()
                            }
                          />
                          <Form.Label
                            className="floating-label"
                            style={{ fontSize: "var(--font-size-xs)" }}
                          >
                            M
                          </Form.Label>
                        </Form.Group>
                      </Col>
                      <Col xs={3}>
                        <Form.Group className="position-relative">
                          <Form.Control
                            id="days"
                            type="number"
                            placeholder=" "
                            value={days}
                            onChange={(e) =>
                              handleDaysChange(Number(e.target.value))
                            }
                            size="sm"
                            onFocus={(e) => e.target.select()}
                            onKeyDown={(e) =>
                              e.key === "Enter" &&
                              document.getElementById("nationality")?.focus()
                            }
                          />
                          <Form.Label
                            className="floating-label"
                            style={{ fontSize: "var(--font-size-xs)" }}
                          >
                            D
                          </Form.Label>
                        </Form.Group>
                      </Col>
                      
                    </Row>
                    
                  </Col>
                  <Col md={3}>
                        <Form.Check
                          type="checkbox"
                          id="isMarried"
                          label="Married"
                          checked={isMarried === 1}
                          onChange={(e) => setIsMarried(e.target.checked ? 1 : 0)}
                          style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)" }}
                        />
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Address Information */}
            <Card className="neat-card mb-3">
              <Card.Header className="neat-card-header border-bottom-0 py-2 px-3">
                <div className="d-flex align-items-center gap-2">
                  <div
                    className="bg-light rounded-circle p-2 d-flex align-items-center justify-content-center"
                    style={{ width: "32px", height: "32px" }}
                  >
                    <FontAwesomeIcon
                      icon={faMapMarkerAlt}
                      className="text-primary small"
                    />
                  </div>
                  <h6
                    className="fw-bold text-dark mb-0 text-uppercase"
                    style={{ fontSize: "var(--font-size-sm)", letterSpacing: "0.5px" }}
                  >
                    Contact Information{" "}
                  </h6>
                </div>
              </Card.Header>
              <Card.Body className="p-3 pt-0">
                <Row className="g-2">
                  <Col md={3}>
                    <Form.Group className="position-relative">
                      <Form.Control
                        id="phoneNumber"
                        size="sm"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={10}
                        className=""
                        value={phoneNumber}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                          setPhoneNumber(value);
                          clearValidationError("phoneNumber");
                        }}
                        isInvalid={validationErrors.phoneNumber}
                        placeholder=" "
                      />
                      <Form.Label className="floating-label">
                        Phone
                      </Form.Label>
                    </Form.Group>
                  </Col>

                  <Col md={3}>
                    <Form.Group className="position-relative">
                      <Form.Control
                        size="sm"
                        type="text"
                        className=""
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder=" "
                      />
                      <Form.Label className="floating-label">
                        Address
                      </Form.Label>
                    </Form.Group>
                  </Col>

                  <Col md={3}>
                    <Form.Group className="position-relative">
                      <div
                        className={
                          validationErrors.village
                            ? "border border-danger rounded-2"
                            : ""
                        }
                      >
                        <SearchableSelect
                          id="villageInput"
                          size="sm"
                          value={selectedVillageId}
                          keepSearchOnBlur={true}
                          searchValue={villageSearch}
                          onChange={async (val) => {
                            setSelectedVillageId(val);
                            clearValidationError("village");
                            // Cascade location fields from selected village
                            const village = filteredVillages.find((v) => v.id.toString() === val);
                            if (village) {
                              setVillageSearch(village.name);
                              
                              // If village has postId, set it and try to get post name
                              if (village.postId) {
                                setSelectedPost(village.postId.toString());
                                // Check if post is in filteredPosts first
                                let postObj = filteredPosts.find((p: any) => p.id === village.postId);
                                if (postObj) {
                                  setPostSearch(postObj.name);
                                } else {
                                  // Fetch post from all posts or load them
                                  try {
                                    await ensurePostsLoaded();
                                    postObj = posts.find((p: any) => p.id === village.postId);
                                    if (postObj) {
                                      setPostSearch(postObj.name);
                                      // Add the post to filteredPosts so it displays properly
                                      setFilteredPosts([postObj]);
                                    }
                                  } catch (error) {
                                    console.error('Error fetching post:', error);
                                  }
                                }
                              }
                              
                              if (village.distId) setSelectedDistrict(village.distId.toString());
                              if (village.stId) {
                                setSelectedState(village.stId.toString());
                                const stateObj = states.find((s: any) => s.id === village.stId);
                                if (stateObj?.countryId) setSelectedCountry(stateObj.countryId.toString());
                              }
                            }
                          }}
                          options={filteredVillages.map((v) => ({
                            value: v.id,
                            label: v.name,
                          }))}
                          onSearch={async (term) => {
                            setVillageSearch(term);
                            if (term.length >= 2) {
                              try {
                                const response = await apiService.fetchVillageName(term);
                                const data = Array.isArray(response) ? response : [];
                                setFilteredVillages(data);
                              } catch (error) {
                                console.error('Error fetching villages:', error);
                                setFilteredVillages([]);
                              }
                            } else {
                              setFilteredVillages([]);
                            }
                          }}
                          placeholder=""
                        />
                      </div>
                      <Form.Label className="floating-label-select">
                        Village <span className="text-danger">*</span>
                      </Form.Label>
                    </Form.Group>
                  </Col>

                  <Col md={3}>
                    <Form.Group className="position-relative">
                      <div
                        className={
                          validationErrors.post
                            ? "border border-danger rounded-2"
                            : ""
                        }
                      >
                        <SearchableSelect
                          id="postOffice"
                          value={selectedPost}
                          keepSearchOnBlur={true}
                          searchValue={postSearch}
                          onChange={(val) => {
                            setSelectedPost(val);
                            clearValidationError("post");
                            const post = filteredPosts.find((p) => p.id.toString() === val);
                            if (post) {
                              setPostSearch(post.name);
                            }
                          }}
                          options={filteredPosts.map((p) => ({
                            value: p.id,
                            label: p.name,
                          }))}
                          placeholder=""
                          onSearch={searchPosts}
                        />
                      </div>
                      <Form.Label className="floating-label-select">
                        Taluk <span className="text-danger">*</span>
                      </Form.Label>
                    </Form.Group>
                  </Col>

                  <Col md={3}>
                    <Form.Group className="position-relative">
                      <Form.Control
                        size="sm"
                        type="text"
                        maxLength={6}
                        className=""
                        value={pincode}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          if (val.length <= 6) {
                            setPincode(val);
                          }
                        }}
                        placeholder=" "
                      />
                      <Form.Label className="floating-label">
                        Pincode
                      </Form.Label>
                    </Form.Group>
                  </Col>

                  <Col md={3}>
                    <Form.Group className="position-relative">
                      <div
                        className={
                          validationErrors.district
                            ? "border border-danger rounded-2"
                            : ""
                        }
                      >
                        <SearchableSelect
                          id="district"
                          value={selectedDistrict}
                          onChange={(val) => {
                            setSelectedDistrict(val);
                            clearValidationError("district");
                          }}
                          options={filteredDistricts.map((d) => ({
                            value: d.id,
                            label: d.name,
                          }))}
                          placeholder=" "
                          tabIndex={-1}
                        />
                      </div>
                      <Form.Label className="floating-label-select">
                        District <span className="text-danger">*</span>
                      </Form.Label>
                    </Form.Group>
                  </Col>

                  <Col md={3}>
                    <Form.Group className="position-relative">
                      <div
                        className={
                          validationErrors.state
                            ? "border border-danger rounded-2"
                            : ""
                        }
                      >
                        <SearchableSelect
                          id="state"
                          value={selectedState}
                          onChange={(val) => {
                            setSelectedState(val);
                            clearValidationError("state");
                          }}
                          options={states.map((s) => ({
                            value: s.id,
                            label: s.name,
                          }))}
                          placeholder=" "
                          tabIndex={-1}
                        />
                      </div>
                      <Form.Label className="floating-label-select">
                        State <span className="text-danger">*</span>
                      </Form.Label>
                    </Form.Group>
                  </Col>

                  <Col md={3}>
                    <Form.Group className="position-relative">
                      <div
                        className={
                          validationErrors.nationality
                            ? "border border-danger rounded-2"
                            : ""
                        }
                      >
                        <SearchableSelect
                          id="nationality"
                          value={selectedCountry}
                          onChange={(val) => {
                            setSelectedCountry(val);
                            clearValidationError("nationality");
                          }}
                          options={countries.map((c) => ({
                            value: c.id,
                            label: c.name,
                          }))}
                          placeholder=" "
                          tabIndex={-1}
                        />
                      </div>
                      <Form.Label className="floating-label-select">
                        Nationality
                      </Form.Label>
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Registration Information */}
            <Card className="neat-card mb-3">
              <Card.Header className="neat-card-header border-bottom-0 py-2 px-3">
                <div className="d-flex align-items-center gap-2">
                  <div
                    className="bg-light rounded-circle p-2 d-flex align-items-center justify-content-center"
                    style={{ width: "32px", height: "32px" }}
                  >
                    <FontAwesomeIcon
                      icon={faStethoscope}
                      className="text-primary small"
                    />
                  </div>
                  <h6
                    className="fw-bold text-dark mb-0 text-uppercase"
                    style={{ fontSize: "var(--font-size-sm)", letterSpacing: "0.5px" }}
                  >
                    Registration Information
                  </h6>
                </div>
              </Card.Header>
              <Card.Body className="p-3 pt-0">
                {/* Medical Details Section */}
                <Row className="g-2">
                  <Col md={3}>
                    <Form.Group className="position-relative">
                      <div
                        className={
                          validationErrors.accountHead
                            ? "border border-danger rounded-2"
                            : ""
                        }
                      >
                        <SearchableSelect
                          id="accountHead"
                          value={selectedAccountHead}
                          onChange={(val) => {
                            setSelectedAccountHead(val);
                            clearValidationError("accountHead");
                          }}
                          options={accountHeads.map((ah) => ({
                            value: ah.headId,
                            label: ah.headName,
                          }))}
                          placeholder=" "
                          disabled={visitType === "edit"}
                        />
                      </div>
                      <Form.Label className="floating-label-select">
                        Account Head <span className="text-danger">*</span>
                      </Form.Label>
                    </Form.Group>
                  </Col>

                  <Col md={3}>
                    <Form.Group className="position-relative">
                      <div
                        className={
                          validationErrors.doctor
                            ? "border border-danger rounded-2"
                            : ""
                        }
                      >
                        <SearchableSelect
                          id="doctor"
                          value={selectedConsultant}
                          onChange={(val) => {
                            setSelectedConsultant(val);
                            clearValidationError("doctor");
                          }}
                          options={consultants.map((c) => ({
                            value: c.id,
                            label: c.name,
                          }))}
                          placeholder=" "
                          disabled={visitType === "edit"}
                          onSearch={searchConsultants}
                        />
                      </div>
                      <Form.Label className="floating-label-select">
                        Doctor <span className="text-danger">*</span>
                      </Form.Label>
                    </Form.Group>
                  </Col>

                  <Col md={3}>
                    <Form.Group className="position-relative">
                      <div
                        className={
                          validationErrors.department
                            ? "border border-danger rounded-2"
                            : ""
                        }
                      >
                        <SearchableSelect
                          id="department"
                          value={selectedDepartment}
                          onChange={(val) => {
                            setSelectedDepartment(val);
                            setDepartmentAutoSelected(false);
                            clearValidationError("department");
                          }}
                          options={departments.map((d) => ({
                            value: d.id,
                            label: d.name,
                          }))}
                          placeholder=" "
                          disabled={visitType === "edit"}
                          onSearch={searchDepartments}
                        />
                      </div>
                      <Form.Label className="floating-label-select">
                        Department <span className="text-danger">*</span>
                      </Form.Label>
                    </Form.Group>
                  </Col>

                  <Col md={3}>
                    <Form.Group className="position-relative">
                      <Form.Select
                        size="sm"
                        className=""
                        value={caseType}
                        onChange={(e) => setCaseType(parseInt(e.target.value))}
                        disabled={visitType === "edit"}
                      >
                        <option value={1}>Normal</option>
                        <option value={2}>MLC</option>
                      </Form.Select>
                      <Form.Label className="floating-label-select">
                        Case Type
                      </Form.Label>
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          {/* Right Column: Payment */}
          <Col lg={4}>
            <Card className="neat-card mb-3 h-100">
              <Card.Header className="neat-card-header border-bottom-0 py-2 px-3">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <div
                      className="bg-light rounded-circle p-2 d-flex align-items-center justify-content-center"
                      style={{ width: "32px", height: "32px" }}
                    >
                      <FontAwesomeIcon
                        icon={faMoneyBillWave}
                        className="text-primary small"
                      />
                    </div>
                    <h6
                      className="fw-bold text-dark mb-0 text-uppercase"
                      style={{ fontSize: "var(--font-size-sm)", letterSpacing: "0.5px" }}
                    >
                      Payment
                    </h6>
                  </div>
                  <Form.Check
                    type="checkbox"
                    id="noChargeCheckbox"
                    label="No Charge"
                    checked={noCharge}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setNoCharge(checked);
                      if (checked) {
                        // Set all amounts to 0
                        setRegistrationFee("0.00");
                        setConsultationFee("0.00");
                        setDiscount("0.00");
                        setCashAmount("0");
                        setBankAmount("0");
                        setStaffCredit("0");
                        setInsurance("0");
                        setBalance("0.00");
                      } else {
                        // Reset to original values when unchecked
                        // Registration fee is 0 for all visit types
                        setRegistrationFee("0.00");
                        // Consultation fee will be re-fetched based on doctor/department
                      }
                    }}
                    disabled
                    className="fw-bold"
                    style={{ fontSize: "var(--font-size-sm)" }}
                  />
                </div>
              </Card.Header>
              <Card.Body className="p-3 pt-0">
                {/* Payment Summary - Clean Vertical Design */}
                <div className="bg-light rounded-3 p-3 mb-3 border border-light">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span
                      className="text-secondary small text-uppercase fw-bold"
                      style={{ fontSize: "var(--font-size-xs)", letterSpacing: "0.5px" }}
                    >
                      Registration
                    </span>
                    <span className="fw-bold text-dark">
                      ₹{registrationFee}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span
                      className="text-secondary small text-uppercase fw-bold"
                      style={{ fontSize: "var(--font-size-xs)", letterSpacing: "0.5px" }}
                    >
                      Consultation
                    </span>
                    <span className="fw-bold text-dark">
                      ₹{consultationFee}
                    </span>
                  </div>
                  {concessionApplied && visitType === "repeat" && (
                    <div className="mb-2 p-2" style={{ backgroundColor: "rgba(95, 74, 139, 0.1)", borderRadius: "6px", border: "1px solid rgba(95, 74, 139, 0.3)" }}>
                      <div className="d-flex align-items-center gap-1 mb-1">
                        <FontAwesomeIcon icon={faCheckCircle} style={{ color: 'var(--page-primary-color)' }} />
                        <span className="fw-bold" style={{ fontSize: "0.7rem", color: 'var(--page-primary-color)' }}>
                          Repeat Visit Concession Applied
                        </span>
                      </div>
                      <div className="d-flex justify-content-between" style={{ fontSize: "0.7rem", color: "#495057" }}>
                        <span>Last Visited: {lastVisitDate ? new Date(lastVisitDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "N/A"}</span>
                        <span className="fw-bold text-success">- ₹{concessionAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                  <div className="d-flex justify-content-between align-items-center mb-3 pb-2">
                    <span
                      className="text-success small text-uppercase fw-bold"
                      style={{ fontSize: "var(--font-size-xs)", letterSpacing: "0.5px" }}
                    >
                      Discount
                    </span>
                    <Form.Control
                      type="number"
                      size="sm"
                      style={{ width: "100px", textAlign: "right" }}
                      value={formatNumberDisplay(parseFloat(discount) || 0)}
                      onChange={(e) => {
                        const max = (parseFloat(registrationFee) || 0) + (parseFloat(consultationFee) || 0);
                        setDiscount(Math.min(handleNumberChange(e.target.value), max).toString());
                      }}
                      onBlur={(e) => {
                        const max = (parseFloat(registrationFee) || 0) + (parseFloat(consultationFee) || 0);
                        setDiscount(Math.min(handleNumberBlur(e.target.value), max).toString());
                      }}
                      placeholder="0"
                      step="0.01"
                      min="0"
                      disabled={noCharge}
                    />
                  </div>
                  <div className="border-bottom mb-2"></div>

                  <div 
                    className="d-flex justify-content-between align-items-center p-2 rounded"
                    style={{ backgroundColor: 'var(--page-secondary-color)' }}
                  >
                    <span className="fw-bold" style={{ color: 'var(--page-primary-color)' }}>Net Payable</span>
                    <span className="h3 mb-0 fw-bold" style={{ color: 'var(--page-primary-color)' }}>
                      ₹
                      {(
                        (parseFloat(registrationFee) || 0) +
                        (parseFloat(consultationFee) || 0) -
                        (parseFloat(discount) || 0)
                      ).toFixed(2)}
                    </span>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mt-2 pt-2 border-top border-dashed">
                    <span className="text-muted small">Balance Due</span>
                    <span
                      className={`fw-bold ${
                        parseFloat(balance) > 0 ? "text-danger" : "text-success"
                      }`}
                    >
                      ₹{balance}
                    </span>
                  </div>
                </div>

                {/* Payment Input Section */}
                <div className="p-3 mb-3" style={{ 
                  border: "1px solid #dee2e6", 
                  borderRadius: "8px",
                  backgroundColor: "#f8fafc"
                }}>
                  {/* Payment Mode Tabs */}
                  <div className="mb-3">
                    <h6 className="text-muted mb-2" style={{ fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-semibold)", letterSpacing: "0.5px" }}>
                      PAYMENT MODE
                    </h6>
                    <div className="d-flex gap-2 mb-3">
                      {paymentTypes.map((pt) => {
                        const isActive = pt.id.toString() === selectedPaymentType;
                        const typeName = pt.name?.toLowerCase() || "";
                        let icon = "💰";
                        if (typeName === "bank") icon = "🏦";
                        if (typeName === "split") icon = "⟷";
                        
                        return (
                          <Button
                            key={pt.id}
                            size="sm"
                            onClick={() => {
                              if (noCharge) return; // Don't allow changing payment type when no charge is enabled
                              const newType = pt.id.toString();
                              setSelectedPaymentType(newType);
                              
                              // Calculate net payable
                              const netPayable = 
                                (parseFloat(registrationFee) || 0) +
                                (parseFloat(consultationFee) || 0) -
                                (parseFloat(discount) || 0);
                              
                              // Auto-fill defaults for bank mode
                              if (typeName === "bank") {
                                const upiMode = paymentModes.find(
                                  (mode: any) => mode.name?.toLowerCase() === "upi"
                                );
                                if (upiMode) setSelectedPaymentMode(upiMode.id.toString());
                                
                                const sbiBank = banks.find((bank: any) =>
                                  bank.name?.toLowerCase().includes("sbi")
                                );
                                if (sbiBank) setSelectedBank(sbiBank.id.toString());
                                setTransactionNumber("");
                                
                                // Auto-populate bank amount with net payable
                                setBankAmount(netPayable.toString());
                                setCashAmount("");
                                setInsurance("");
                                setStaffCredit("");
                                setBalance("0.00");
                              } else if (typeName === "cash") {
                                setSelectedPaymentMode("");
                                setSelectedBank("");
                                setTransactionNumber("");
                                
                                // Auto-populate cash amount with net payable
                                setCashAmount(netPayable.toString());
                                setBankAmount("");
                                setInsurance("");
                                setStaffCredit("");
                                setBalance("0.00");
                              } else if (typeName === "split") {
                                // Auto-select UPI and SBI for split mode
                                const upiMode = paymentModes.find(
                                  (mode: any) => mode.name?.toLowerCase() === "upi"
                                );
                                if (upiMode) setSelectedPaymentMode(upiMode.id.toString());
                                
                                const sbiBank = banks.find((bank: any) =>
                                  bank.name?.toLowerCase().includes("sbi")
                                );
                                if (sbiBank) setSelectedBank(sbiBank.id.toString());
                                setTransactionNumber("");
                                
                                // Reset all amounts for split mode
                                setCashAmount("");
                                setBankAmount("");
                                setInsurance("");
                                setStaffCredit("");
                                setBalance(netPayable.toFixed(2));
                              }
                            }}
                            disabled={visitType === "edit" || noCharge}
                            style={{
                              flex: 1,
                              borderRadius: "8px",
                              fontWeight: "var(--font-weight-medium)",
                              padding: "8px 16px",
                              backgroundColor: isActive ? 'var(--page-primary-color)' : 'transparent',
                              borderColor: isActive ? 'var(--page-primary-color)' : '#6c757d',
                              border: isActive ? "2px solid var(--page-primary-color)" : "1px solid #dee2e6",
                              color: isActive ? 'var(--page-secondary-color)' : '#6c757d',
                              transition: "all 0.2s ease",
                              opacity: noCharge ? 0.5 : 1,
                            }}
                          >
                            <span style={{ marginRight: "6px" }}>{icon}</span>
                            {pt.name}
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Cash Mode - Show: Cash Amount, Balance */}
                  {selectedPaymentType &&
                    paymentTypes
                      .find((t: any) => t.id.toString() === selectedPaymentType)
                      ?.name?.toLowerCase() === "cash" && (
                      <>
                        <Row className="g-3 mb-3">
                          <Col xs={12}>
                            <Form.Group>
                              <Form.Label
                                style={{
                                  fontSize: "var(--font-size-xs)",
                                  color: "#6c757d",
                                  marginBottom: "4px",
                                  fontWeight: "var(--font-weight-medium)",
                                }}
                              >
                                Cash Amount
                              </Form.Label>
                              <Form.Control
                                type="number"
                                size="sm"
                                step="0.01"
                                min="0"
                                value={formatNumberDisplay(parseFloat(cashAmount) || 0)}
                                onChange={(e) => {
                                  const netPayable =
                                    (parseFloat(registrationFee) || 0) +
                                    (parseFloat(consultationFee) || 0) -
                                    (parseFloat(discount) || 0);
                                  
                                  const inputValue = handleNumberChange(e.target.value);
                                  const validCashAmount = Math.min(Math.max(0, inputValue), Math.max(0, netPayable));
                                  
                                  setCashAmount(validCashAmount.toString());
                                  
                                  const remaining = netPayable - validCashAmount;
                                  setBalance(remaining.toFixed(2));
                                }}
                                onBlur={(e) => {
                                  const value = handleNumberBlur(e.target.value);
                                  setCashAmount(value.toString());
                                }}
                                placeholder="0"
                                style={{ borderRadius: "6px" }}
                                disabled={noCharge}
                              />
                            </Form.Group>
                          </Col>
                        </Row>

                        <Row className="g-3 mb-3">
                          <Col xs={12}>
                            <Form.Group>
                              <Form.Label
                                style={{
                                  fontSize: "var(--font-size-xs)",
                                  color: "#6c757d",
                                  marginBottom: "4px",
                                  fontWeight: "var(--font-weight-medium)",
                                }}
                              >
                                Company Paid
                              </Form.Label>
                              <Form.Control
                                type="number"
                                size="sm"
                                step="0.01"
                                min="0"
                                value={formatNumberDisplay(parseFloat(companyPaid) || 0)}
                                onChange={(e) => {
                                  const netPayable =
                                    (parseFloat(registrationFee) || 0) +
                                    (parseFloat(consultationFee) || 0) -
                                    (parseFloat(discount) || 0);
                                  const company = Math.min(handleNumberChange(e.target.value), Math.max(0, netPayable));
                                  setCompanyPaid(company.toString());
                                  const remaining = Math.max(0, netPayable - company);
                                  setCashAmount(remaining.toString());
                                }}
                                onBlur={(e) => {
                                  const netPayable =
                                    (parseFloat(registrationFee) || 0) +
                                    (parseFloat(consultationFee) || 0) -
                                    (parseFloat(discount) || 0);
                                  const company = Math.min(handleNumberBlur(e.target.value), Math.max(0, netPayable));
                                  setCompanyPaid(company.toString());
                                  const remaining = Math.max(0, netPayable - company);
                                  setCashAmount(remaining.toString());
                                }}
                                placeholder="0"
                                style={{ borderRadius: "6px" }}
                                disabled={noCharge || parseInt(selectedAccountHead) === 1 || !selectedAccountHead}
                              />
                            </Form.Group>
                          </Col>
                        </Row>

                        <Row className="g-3">
                          <Col xs={12}>
                            <Form.Group>
                              <Form.Label
                                style={{
                                  fontSize: "var(--font-size-xs)",
                                  color: "#6c757d",
                                  marginBottom: "4px",
                                  fontWeight: "var(--font-weight-medium)",
                                }}
                              >
                                Balance Amount
                              </Form.Label>
                              <Form.Control
                                type="text"
                                size="sm"
                                value={balance}
                                readOnly
                                className={`fw-bold ${
                                  parseFloat(balance) > 0
                                    ? "text-danger"
                                    : "text-success"
                                }`}
                                style={{
                                  fontSize: "1.1rem",
                                  backgroundColor: "#f8fafc",
                                  borderRadius: "6px",
                                }}
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                      </>
                    )}

                  {/* Bank Mode - Show: Bank Details, Bank Amount, Balance */}
                  {selectedPaymentType &&
                    paymentTypes
                      .find((t: any) => t.id.toString() === selectedPaymentType)
                      ?.name?.toLowerCase() === "bank" && (
                      <>
                        {/* Bank Details Row */}
                        <Row className="g-3 mb-3">
                          <Col xs={4}>
                            <Form.Group>
                              <Form.Label
                                style={{
                                  fontSize: "var(--font-size-xs)",
                                  color: "#6c757d",
                                  marginBottom: "4px",
                                  fontWeight: "var(--font-weight-medium)",
                                }}
                              >
                                Bank Type
                              </Form.Label>
                              <Form.Select
                                size="sm"
                                value={selectedPaymentMode}
                                onChange={(e) => setSelectedPaymentMode(e.target.value)}
                                style={{ borderRadius: "6px" }}
                                disabled={noCharge}
                              >
                                <option value=""></option>
                                {paymentModes.map((pm) => (
                                  <option key={pm.id} value={pm.id}>
                                    {pm.name}
                                  </option>
                                ))}
                              </Form.Select>
                            </Form.Group>
                          </Col>
                          <Col xs={4}>
                            <Form.Group>
                              <Form.Label
                                style={{
                                  fontSize: "var(--font-size-xs)",
                                  color: "#6c757d",
                                  marginBottom: "4px",
                                  fontWeight: "var(--font-weight-medium)",
                                }}
                              >
                                Bank Name
                              </Form.Label>
                              <Form.Select
                                size="sm"
                                value={selectedBank}
                                onChange={(e) => setSelectedBank(e.target.value)}
                                style={{ borderRadius: "6px" }}
                                disabled={noCharge}
                              >
                                <option value=""></option>
                                {banks.map((b) => (
                                  <option key={b.id} value={b.id}>
                                    {b.name}
                                  </option>
                                ))}
                              </Form.Select>
                            </Form.Group>
                          </Col>
                          <Col xs={4}>
                            <Form.Group>
                              <Form.Label
                                style={{
                                  fontSize: "var(--font-size-xs)",
                                  color: "#6c757d",
                                  marginBottom: "4px",
                                  fontWeight: "var(--font-weight-medium)",
                                }}
                              >
                                Trans No
                              </Form.Label>
                              <Form.Control
                                size="sm"
                                type="text"
                                value={transactionNumber}
                                onChange={(e) =>
                                  setTransactionNumber(e.target.value)
                                }
                                style={{ borderRadius: "6px" }}
                                disabled={noCharge}
                              />
                            </Form.Group>
                          </Col>
                        </Row>

                        {/* Bank Amount */}
                        <Row className="g-3 mb-3">
                          <Col xs={12}>
                            <Form.Group>
                              <Form.Label
                                style={{
                                  fontSize: "var(--font-size-xs)",
                                  color: "#6c757d",
                                  marginBottom: "4px",
                                  fontWeight: "var(--font-weight-medium)",
                                }}
                              >
                                Bank Amount
                              </Form.Label>
                              <Form.Control
                                type="number"
                                size="sm"
                                step="0.01"
                                min="0"
                                value={formatNumberDisplay(parseFloat(bankAmount) || 0)}
                                onChange={(e) => {
                                  const inputValue = handleNumberChange(e.target.value);
                                  const netPayable =
                                    (parseFloat(registrationFee) || 0) +
                                    (parseFloat(consultationFee) || 0) -
                                    (parseFloat(discount) || 0);
                                  
                                  // Cap bank amount at net payable
                                  const validBankAmount = Math.min(Math.max(0, inputValue), Math.max(0, netPayable));
                                  
                                  setBankAmount(validBankAmount.toString());
                                  
                                  const remaining = netPayable - validBankAmount;
                                  setBalance(remaining.toFixed(2));
                                }}
                                onBlur={(e) => {
                                  const value = handleNumberBlur(e.target.value);
                                  setBankAmount(value.toString());
                                }}
                                placeholder="0"
                                style={{ borderRadius: "6px" }}
                                disabled={noCharge}
                              />
                            </Form.Group>
                          </Col>
                        </Row>

                        {/* Balance Amount */}
                        <Row className="g-3">
                          <Col xs={12}>
                            <Form.Group>
                              <Form.Label
                                style={{
                                  fontSize: "var(--font-size-xs)",
                                  color: "#6c757d",
                                  marginBottom: "4px",
                                  fontWeight: "var(--font-weight-medium)",
                                }}
                              >
                                Balance Amount
                              </Form.Label>
                              <Form.Control
                                type="text"
                                size="sm"
                                value={balance}
                                readOnly
                                className={`fw-bold ${
                                  parseFloat(balance) > 0
                                    ? "text-danger"
                                    : "text-success"
                                }`}
                                style={{
                                  fontSize: "1.1rem",
                                  backgroundColor: "#f8fafc",
                                  borderRadius: "6px",
                                }}
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                      </>
                    )}

                  {/* Split Mode - Show: Bank Details + All Payment Fields + Balance */}
                  {selectedPaymentType &&
                    paymentTypes
                      .find((t: any) => t.id.toString() === selectedPaymentType)
                      ?.name?.toLowerCase() === "split" && (
                      <>
                        {/* Bank Details Row */}
                        <Row className="g-3 mb-3">
                          <Col xs={4}>
                            <Form.Group>
                              <Form.Label
                                style={{
                                  fontSize: "var(--font-size-xs)",
                                  color: "#6c757d",
                                  marginBottom: "4px",
                                  fontWeight: "var(--font-weight-medium)",
                                }}
                              >
                                Bank Type
                              </Form.Label>
                              <Form.Select
                                size="sm"
                                value={selectedPaymentMode}
                                onChange={(e) => setSelectedPaymentMode(e.target.value)}
                                style={{ borderRadius: "6px" }}
                                disabled={noCharge}
                              >
                                <option value=""></option>
                                {paymentModes.map((pm) => (
                                  <option key={pm.id} value={pm.id}>
                                    {pm.name}
                                  </option>
                                ))}
                              </Form.Select>
                            </Form.Group>
                          </Col>
                          <Col xs={4}>
                            <Form.Group>
                              <Form.Label
                                style={{
                                  fontSize: "var(--font-size-xs)",
                                  color: "#6c757d",
                                  marginBottom: "4px",
                                  fontWeight: "var(--font-weight-medium)",
                                }}
                              >
                                Bank Name
                              </Form.Label>
                              <Form.Select
                                size="sm"
                                value={selectedBank}
                                onChange={(e) => setSelectedBank(e.target.value)}
                                style={{ borderRadius: "6px" }}
                                disabled={noCharge}
                              >
                                <option value=""></option>
                                {banks.map((b) => (
                                  <option key={b.id} value={b.id}>
                                    {b.name}
                                  </option>
                                ))}
                              </Form.Select>
                            </Form.Group>
                          </Col>
                          <Col xs={4}>
                            <Form.Group>
                              <Form.Label
                                style={{
                                  fontSize: "var(--font-size-xs)",
                                  color: "#6c757d",
                                  marginBottom: "4px",
                                  fontWeight: "var(--font-weight-medium)",
                                }}
                              >
                                Trans No
                              </Form.Label>
                              <Form.Control
                                size="sm"
                                type="text"
                                value={transactionNumber}
                                onChange={(e) =>
                                  setTransactionNumber(e.target.value)
                                }
                                style={{ borderRadius: "6px" }}
                                disabled={noCharge}
                              />
                            </Form.Group>
                          </Col>
                        </Row>

                        {/* Payment Amount Fields */}
                        <Row className="g-3 mb-3">
                          <Col xs={6}>
                            <Form.Group>
                              <Form.Label
                                style={{
                                  fontSize: "var(--font-size-xs)",
                                  color: "#6c757d",
                                  marginBottom: "4px",
                                  fontWeight: "var(--font-weight-medium)",
                                }}
                              >
                                Cash Amount
                              </Form.Label>
                              <Form.Control
                                type="number"
                                size="sm"
                                step="0.01"
                                min="0"
                                value={formatNumberDisplay(parseFloat(cashAmount) || 0)}
                                onChange={(e) => {
                                  const netPayable =
                                    (parseFloat(registrationFee) || 0) +
                                    (parseFloat(consultationFee) || 0) -
                                    (parseFloat(discount) || 0);
                                  
                                  const inputValue = handleNumberChange(e.target.value);
                                  const bankPaid = parseFloat(bankAmount) || 0;
                                  
                                  const maxCashAmount = netPayable - bankPaid;
                                  const validCashAmount = Math.min(Math.max(0, inputValue), Math.max(0, maxCashAmount));
                                  
                                  setCashAmount(validCashAmount.toString());
                                  
                                  const totalPaid = validCashAmount + bankPaid;
                                  const remaining = netPayable - totalPaid;
                                  setBalance(remaining.toFixed(2));
                                }}
                                onBlur={(e) => {
                                  const value = handleNumberBlur(e.target.value);
                                  setCashAmount(value.toString());
                                }}
                                placeholder="0"
                                style={{ borderRadius: "6px" }}
                                disabled={noCharge}
                              />
                            </Form.Group>
                          </Col>
                          <Col xs={6}>
                            <Form.Group>
                              <Form.Label
                                style={{
                                  fontSize: "var(--font-size-xs)",
                                  color: "#6c757d",
                                  marginBottom: "4px",
                                  fontWeight: "var(--font-weight-medium)",
                                }}
                              >
                                Bank Amount
                              </Form.Label>
                              <Form.Control
                                type="number"
                                size="sm"
                                step="0.01"
                                min="0"
                                value={formatNumberDisplay(parseFloat(bankAmount) || 0)}
                                onChange={(e) => {
                                  const netPayable =
                                    (parseFloat(registrationFee) || 0) +
                                    (parseFloat(consultationFee) || 0) -
                                    (parseFloat(discount) || 0);
                                  
                                  const inputValue = handleNumberChange(e.target.value);
                                  const cashPaid = parseFloat(cashAmount) || 0;
                                  
                                  const maxBankAmount = netPayable - cashPaid;
                                  const validBankAmount = Math.min(Math.max(0, inputValue), Math.max(0, maxBankAmount));
                                  
                                  setBankAmount(validBankAmount.toString());
                                  
                                  const totalPaid = validBankAmount + cashPaid;
                                  const remaining = netPayable - totalPaid;
                                  setBalance(remaining.toFixed(2));
                                }}
                                onBlur={(e) => {
                                  const value = handleNumberBlur(e.target.value);
                                  setBankAmount(value.toString());
                                }}
                                placeholder="0"
                                style={{ borderRadius: "6px" }}
                                disabled={noCharge}
                              />
                            </Form.Group>
                          </Col>
                        </Row>

                        {/* Balance Amount Display */}
                        <Row className="g-3">
                          <Col xs={12}>
                            <Form.Group>
                              <Form.Label
                                style={{
                                  fontSize: "var(--font-size-xs)",
                                  color: "#6c757d",
                                  marginBottom: "4px",
                                  fontWeight: "var(--font-weight-medium)",
                                }}
                              >
                                Balance Amount
                              </Form.Label>
                              <Form.Control
                                type="text"
                                size="sm"
                                value={balance}
                                readOnly
                                className={`fw-bold ${
                                  parseFloat(balance) > 0
                                    ? "text-danger"
                                    : "text-success"
                                }`}
                                style={{
                                  fontSize: "1.1rem",
                                  backgroundColor: "#f8fafc",
                                  borderRadius: "6px",
                                }}
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                      </>
                    )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Fixed Bottom Action Bar */}
      <div
        className="fixed-bottom bg-white border-top py-2 shadow-lg"
        style={{ zIndex: 1000 }}
      >
        <Container fluid className="px-3">
          <div className="d-flex justify-content-between align-items-center">
            <div className="text-muted small">
              <FontAwesomeIcon icon={faKeyboard} className="me-2" />
              Use <strong>Ctrl+Enter</strong> to Save, <strong>F5</strong> to
              Reset
            </div>
            <div className="d-flex gap-2">
              <Button
                ref={resetButtonRef}
                variant="light"
                size="sm"
                className="px-3 border"
                onClick={handleReset}
              >
                <FontAwesomeIcon icon={faSync} className="me-2" />
                Reset
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="px-3 border"
                onClick={handlePrintDetails}
                disabled={!(registeredOpNumber || ((visitType === "repeat" || visitType === "edit") && patientDataLoaded))}
              >
                <FontAwesomeIcon icon={faPrint} className="me-2" />
                Print Details
              </Button>
              <Button
                size="sm"
                className="px-3 border"
                style={{ backgroundColor: 'var(--page-primary-color)', color: 'var(--page-secondary-color)', opacity: !registeredOpNumber ? 0.5 : 1 }}
                onClick={handlePrintBill}
                disabled={!registeredOpNumber}
              >
                <FontAwesomeIcon icon={faPrint} className="me-2" />
                Print Bill
              </Button>
              <Button
                ref={saveButtonRef}
                size="sm"
                className="px-4 fw-bold shadow-sm"
                style={{
                  backgroundColor: 'var(--page-primary-color)',
                  borderColor: 'var(--page-primary-color)',
                  color: 'var(--page-secondary-color)',
                  opacity: (isSubmitting || !!registeredOpNumber) ? 0.5 : 1
                }}
                onClick={handleSave}
                disabled={isSubmitting || !!registeredOpNumber}
              >
                <FontAwesomeIcon icon={faSave} className="me-2" />
                {isSubmitting ? "Processing..." : (visitType === "edit" ? "Update" : "Register")}
              </Button>
            </div>
          </div>
        </Container>
      </div>

      {/* Modals */}
      <Modal
        show={showKeyboardHelp}
        onHide={() => setShowKeyboardHelp(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="h6 fw-bold">Keyboard Shortcuts</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table size="sm" borderless>
            <tbody>
              <tr>
                <td>
                  <kbd>Ctrl + Enter</kbd>
                </td>
                <td>Save Registration</td>
              </tr>
              <tr>
                <td>
                  <kbd>F5</kbd>
                </td>
                <td>Reset Form</td>
              </tr>
              <tr>
                <td>
                  <kbd>Tab</kbd>
                </td>
                <td>Next Field</td>
              </tr>
              <tr>
                <td>
                  <kbd>F11</kbd>
                </td>
                <td>Full Screen</td>
              </tr>
              <tr>
                <td>
                  <kbd>Shift + Tab</kbd>
                </td>
                <td>Previous Field</td>
              </tr>
            </tbody>
          </Table>
        </Modal.Body>
      </Modal>

      <PatientSearchModal
        show={showPatientSearch}
        onHide={() => setShowPatientSearch(false)}
        onPatientSelect={handlePatientSelect}
      />

      {/* Visit History Modal */}
      <Modal show={showVisitHistory} onHide={() => setShowVisitHistory(false)} centered size="lg">
        <Modal.Header closeButton style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
          <Modal.Title style={{ fontSize: "1rem", fontWeight: 600 }}>
            <i className="fas fa-history me-2 text-primary"></i>
            Visit History
            {opNumber && (
              <span className="ms-2 badge bg-primary" style={{ fontSize: "0.78rem" }}>{opNumber}</span>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: 0 }}>
          {loadingVisitHistory ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
              <div className="mt-2 text-muted small">Loading visit history...</div>
            </div>
          ) : visitHistoryList.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="fas fa-calendar-times opacity-25 mb-3" style={{ fontSize: "2.5rem", display: "block" }}></i>
              <div>No visits found for OP Number: <strong>{opNumber}</strong></div>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <Table className="mb-0" hover>
                <thead style={{ background: "#f8fafc", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748b" }}>
                  <tr>
                    <th className="ps-4 py-2 border-0" style={{ width: "8%" }}>#</th>
                    <th className="py-2 border-0">Visit Date &amp; Time</th>
                    <th className="py-2 border-0">Doctor</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: "0.875rem" }}>
                  {visitHistoryList.map((visit: any, index: number) => (
                    <tr key={visit.opVisitId} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td className="ps-4 py-2 align-middle text-muted">{index + 1}</td>
                      <td className="py-2 align-middle">
                        <i className="fas fa-calendar-alt me-2 text-info opacity-75"></i>
                        {visit.datetime
                          ? new Date(visit.datetime).toLocaleString("en-IN", {
                              day: "2-digit", month: "2-digit", year: "numeric",
                              hour: "2-digit", minute: "2-digit", hour12: true,
                            })
                          : "—"}
                      </td>
                      <td className="py-2 align-middle">
                        <i className="fas fa-user-md me-2 text-primary opacity-75"></i>
                        {visit.doctorName || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer style={{ background: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
          <Button variant="outline-secondary" size="sm" onClick={() => setShowVisitHistory(false)}>
            <i className="fas fa-times me-1"></i>Close
          </Button>
        </Modal.Footer>
      </Modal>

      <style>{`
        .hover-bg-light:hover {
          background-color: #f8f9fa;
        }
        .form-control:focus, .form-select:focus {
          border-color: var(--border-color-input-focus);
          box-shadow: 0 0 0 3px rgba(107, 163, 235, 0.25);
        }
        /* Custom Scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 3px;
        }
        /* Form Label Spacing */
        .form-label {
          padding-left: 0.35rem;
        }
        
        /* Floating Label for Input */
        .floating-label {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: #f8fafc;
          padding: 0 5px;
          color: #5dade2;
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-medium);
          pointer-events: none;
          transition: all 0.2s ease;
          z-index: 5;
        }
        
        .form-control:focus ~ .floating-label,
        .form-control:not(:placeholder-shown) ~ .floating-label {
          top: 0;
          left: 10px;
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-semibold);
          color: var(--border-color-input-focus);
        }
        
        /* Floating Label for Select */
        .floating-label-select {
          position: absolute;
          left: 10px;
          top: -1px;
          background: #f8fafc;
          padding: 0 5px;
          color: var(--border-color-input-focus);
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-semibold);
          pointer-events: none;
          z-index: 5;
        }
        
        .form-select:focus ~ .floating-label-select {
          color: var(--border-color-input-focus);
        }
        
        /* SearchableSelect focused state - change label color */
        .position-relative:focus-within .floating-label-select {
          color: var(--border-color-input-focus);
        }
        
        /* SearchableSelect Height Match */
        .position-relative [class*="control"] {
          min-height: 32px !important;
          border-radius: 0px !important;
          border-color: var(--border-color-input) !important;
        }
        
        .position-relative [class*="-control"] {
          min-height: 32px !important;
        }
        
        .position-relative div[class^="css-"][class*="control"] {
          min-height: 32px !important;
        }
        
        /* Target react-select components directly */
        .position-relative > div > div[class*="control"] {
          min-height: 32px !important;
        }
        
        /* SearchableSelect Text Color Match */
        .position-relative [class*="singleValue"],
        .position-relative [class*="-singleValue"] {
          color: #212529 !important;
        }
        
        .position-relative [class*="placeholder"],
        .position-relative [class*="-placeholder"] {
          color: #6c757d !important;
        }
        
        .position-relative [class*="Input"] input {
          color: #212529 !important;
        }

        /* Neat Design Updates */
        .neat-card {
          border: none !important;
          border-radius: 16px !important;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04) !important;
          background: var(--secondary-color) !important;
        }

        .neat-card-header {
          background: var(--page-primary-color) !important;
          border-radius: 16px 16px 0 0 !important;
        }
        
        .visit-type-container {
          background: #f8fafc;
          border-radius: 50px;
          padding: 4px;
          border: 1px solid #e9ecef;
        }
        
        .visit-type-btn {
          border-radius: 50px !important;
          font-weight: var(--font-weight-semibold);
          font-size: var(--font-size-sm);
          transition: all 0.2s ease;
        }
        
        .visit-type-btn.active {
          background: var(--border-color-input-focus) !important;
          color: white !important;
          box-shadow: 0 2px 4px rgba(107, 163, 235, 0.3);
        }
        
        .payment-summary-box {
          background: #f8fafc;
          border-radius: 12px;
          padding: 8px;
          transition: all 0.2s;
          border: 1px solid transparent;
        }
        
        .payment-summary-box:hover {
          background: #edf2f7;
          border-color: #e2e8f0;
        }

        .form-control, .form-select {
          border-radius: 0px;
          border: var(--border-width) solid var(--border-color-input);
          padding: 0.25rem 0.5rem !important;
          min-height: 32px;
          font-size: var(--font-size-base);
        }

        .input-group .form-control {
           min-height: 32px; /* Reset for search inputs */
           padding-top: 0.25rem !important;
           padding-bottom: 0.25rem !important;
        }
      `}</style>

      {/* Hidden Print Bill Content */}
      <div style={{ display: 'none' }}>
        <div ref={printRef}>
          <RegistrationBillPrint
            organization={{
              name: orgInfo?.name || organizationState.name,
              code: orgInfo?.code || organizationState.code,
              address: orgInfo?.address || organizationState.address,
              phone: orgInfo?.phone || organizationState.phoneNo,
              itNo: orgInfo?.itNo,
              salesTax: orgInfo?.salesTax,
            }}
            billData={{
              tokenNo: masterTokenNo.toString(),
              date: new Date().toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              }),
              patientName: `${firstName} ${secondName}`.trim(),
              age: `${years} Yrs ${months} Mnt ${days} days`,
              sex: (() => {
                const genderObj = genders.find((g: any) => g.id.toString() === gender);
                return genderObj?.name || "";
              })(),
              department: (() => {
                const deptObj = departments.find((d: any) => d.id.toString() === selectedDepartment);
                return deptObj?.name || "";
              })(),
              consultant: (() => {
                const consultantObj = consultants.find((c: any) => c.id.toString() === selectedConsultant);
                return consultantObj?.name || "";
              })(),
              registrationCharge: parseFloat(registrationFee) || 0,
              consultationCharge: parseFloat(consultationFee) || 0,
              payable: (parseFloat(registrationFee) || 0) + (parseFloat(consultationFee) || 0) - (parseFloat(discount) || 0),
              paid: parseFloat(paidAmount) || 0,
            }}
          />
        </div>
      </div>

      {/* Hidden Print Trigger */}
      <ReactToPrint
        trigger={() => (
          <button ref={printTriggerRef} style={{ display: 'none' }}>
            Print
          </button>
        )}
        content={() => printRef.current}
      />

      {/* Hidden Print Patient Details Content */}
      <div style={{ display: 'none' }}>
        <div ref={printDetailsRef}>
          <PatientDetailsPrint
            enableGuardianPrefix={true}
            organization={{
              name: orgInfo?.name || organizationState.name,
              code: orgInfo?.code || organizationState.code,
              address: orgInfo?.address || organizationState.address,
              phone: orgInfo?.phone || organizationState.phoneNo,
              itNo: orgInfo?.itNo,
              salesTax: orgInfo?.salesTax,
            }}
            patientData={{
              opNumber: opNumber || registeredOpNumber,
              tokenNo: masterTokenNo.toString(),
              registrationDate: new Date().toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              }),
              patientName: firstName,
              secondName: secondName,
              age: `${years} Yrs ${months} Mnt ${days} days`,
              sex: (() => {
                const genderObj = genders.find((g: any) => g.id.toString() === gender);
                return genderObj?.name || "";
              })(),
              dob: dob,
              guardianType: (() => {
                const guardianTypeObj = guardianTypes.find((g: any) => g.id.toString() === selectedGuardianType);
                return guardianTypeObj?.name || "Guardian";
              })(),
              guardianName: guardianName,
              phoneNumber: phoneNumber,
              email: email,
              address: address,
              country: (() => {
                const countryObj = countries.find((c: any) => c.id.toString() === selectedCountry);
                return countryObj?.name || "";
              })(),
              state: (() => {
                const stateObj = states.find((s: any) => s.id.toString() === selectedState);
                return stateObj?.name || "";
              })(),
              district: (() => {
                const districtObj = districts.find((d: any) => d.id.toString() === selectedDistrict);
                return districtObj?.name || "";
              })(),
              post: (() => {
                const postObj = posts.find((p: any) => p.id.toString() === selectedPost);
                return postObj?.name || "";
              })(),
              village: villageSearch,
              pincode: pincode,
              idType: (() => {
                const idTypeObj = [
                  { id: "1", name: "Aadhaar Card" },
                  { id: "2", name: "PAN Card" },
                  { id: "3", name: "Voter ID" },
                  { id: "4", name: "Driving License" },
                  { id: "5", name: "Passport" },
                ].find((i: any) => i.id === idType);
                return idTypeObj?.name || "";
              })(),
              idNumber: idNumber,
              department: (() => {
                const deptObj = departments.find((d: any) => d.id.toString() === selectedDepartment);
                return deptObj?.name || "";
              })(),
              consultant: (() => {
                const consultantObj = consultants.find((c: any) => c.id.toString() === selectedConsultant);
                return consultantObj?.name || "";
              })(),
              complaint: "",
              caseType: caseType === 1 ? "General" : caseType === 2 ? "Emergency" : "Accident",
            }}
          />
        </div>
      </div>

      {/* Hidden Print Details Trigger */}
      <ReactToPrint
        trigger={() => (
          <button ref={printDetailsTriggerRef} style={{ display: 'none' }}>
            Print Details
          </button>
        )}
        content={() => printDetailsRef.current}
        pageStyle={`@page { size: 233mm 100mm; margin: 0; }`}
      />
    </div>
  );
};

export default PatientRegistration;
