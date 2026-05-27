import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Container, Row, Col, Card, Button, Badge, Modal, Form, Alert, Table, InputGroup, Dropdown, DropdownButton } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBed,
  faUser,
  faCheckCircle,
  faTimesCircle,
  faHospital,
  faCalendarAlt,
  faStethoscope,
  faSearch,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { showErrorModal, showWarningModal, showWarningToast, showInfoModal, showValidationError, showConfirmDialog, showSuccessModal } from '../../../utils/alertUtil';
import ReactToPrint from 'react-to-print';
import { MedicalRecordsApiService } from '../../../api/medical-records/medical-records-api-service';
import { AppApiService } from '../../../api/app/app-api-service';
import AdmissionRecordPrint from '../../components/AdmissionRecordPrint';
import OccupiedBedPatientPrint from '../../components/OccupiedBedPatientPrint';
import { useSelector } from 'react-redux';
import { RootState } from '../../../state/store';

// TODO: Move interfaces to shared types file
interface WardResponse {
  id: number;
  name?: string;
  numberElements?: number;
  numberOccupied?: number;
  isBlocked?: number;
}

interface BedResponse {
  id: number;
  bedNumber: string;
  wardId: number;
  isOccupied: boolean;
  patientName?: string;
  patientId?: string;
  status?: string;
  admissionDate?: string;
}

interface Ward {
  id: number;
  name: string;
  type?: string;
  totalBeds: number;
  availableBeds: number;
  floor?: string;
  isBlocked: number;
}

interface Bed {
  id: number;
  bedNumber: string;
  wardId: number;
  isOccupied: boolean;
  patientName?: string;
  patientId?: string;
  admissionDate?: string;
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  patIdAdmit?: number; // Patient ID for fetching details
  patientDetails?: PatientDetails; // Full patient details
}

interface PatientDetails {
  patId: number;
  displayNumber: string;
  name: string;
  secName: string;
  sex: string;
  age: string;
  dob: string;
  email: string;
  phone: string;
  add1: string;
  add2: string;
  pincode: string;
  gname: string;
  guardianType: string;
  village: string;
  post: string;
  districtId: number;
  district: string;
  state: string;
  country: string;
  govIdType: string;
  govIdNo: string;
  isInOp: boolean;
  isInIp: boolean;
  isActive: boolean;
  isDead: boolean;
  statusMessage: string;
  lastVisitId: number;
  doctorId: number;
  lastVisitDate: string;
  doctorName: string;
  departmentId: number;
  departmentName: string;
  complaintName: string;
  debitId: number;
  debitHead: string;
  accountCategory: string;
  ipId: number;
  ipNo: string;
  wardName: string;
  bedNo: string;
  admitDateTime: string;
  advBalance: number;
  dueBalance: number;
}

interface PatientInfo {
  opNumber: string;
  firstName: string;
  secondName: string;
  guardianName: string;
  phoneNumber: string;
  admissionDate: string;
  admissionTime: string;
  doctorId: number;
  departmentId: number;
  diagnosis: string;
  notes: string;
  patientId?: number;
  opVisitId?: number;
}

const InpatientRegistration: React.FC<any> = () => {
  const apiService = new MedicalRecordsApiService();
  const appApiService = new AppApiService();
  const loginData = useSelector((state: RootState) => state.loginData);
  
  const getCurrentLocalDate = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getCurrentLocalTime = (): string => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Refs for print functionality
  const admissionPrintRef = useRef<HTMLDivElement>(null);
  const admissionPrintTriggerRef = useRef<any>(null);
  const occupiedBedPrintRef = useRef<HTMLDivElement>(null);
  const occupiedBedPrintTriggerRef = useRef<any>(null);
  
  // State management
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [selectedBed, setSelectedBed] = useState<Bed | null>(null);
  const [showBedModal, setShowBedModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [patientInfo, setPatientInfo] = useState<PatientInfo>({
    opNumber: '',
    firstName: '',
    secondName: '',
    guardianName: '',
    phoneNumber: '',
    admissionDate: getCurrentLocalDate(),
    admissionTime: getCurrentLocalTime(),
    doctorId: 0,
    departmentId: 0,
    diagnosis: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [searchOpNumber, setSearchOpNumber] = useState('');
  const [wardSearch, setWardSearch] = useState('');
  const [departments, setDepartments] = useState<any[]>([]);
  const [consultants, setConsultants] = useState<any[]>([]);
  const [showPatientDetailsModal, setShowPatientDetailsModal] = useState(false);
  const [selectedPatientDetails, setSelectedPatientDetails] = useState<PatientDetails | null>(null);
  const [admissionPrintData, setAdmissionPrintData] = useState<any>(null);
  const [orgInfo, setOrgInfo] = useState<any>(null);
  const [admittedPatientId, setAdmittedPatientId] = useState<number | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [companies, setCompanies] = useState<any[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Fetch wards from backend
  useEffect(() => {
    const fetchWards = async () => {
      try {
        const response = await apiService.fetchAllWards();
        
        let wardsData: any[] = [];
        if (Array.isArray(response)) {
          wardsData = response;
        }
      
        const normalizedWards: Ward[] = wardsData.map((ward: WardResponse) => {
          const totalBeds = ward.numberElements ?? 0;
          const occupiedBeds = ward.numberOccupied ?? 0;
          const availableBeds = Math.max(totalBeds - occupiedBeds, 0);

          return {
            id: ward.id,
            name: ward.name ?? `Ward ${ward.id}`,
            totalBeds,
            availableBeds,
            isBlocked: ward.isBlocked ?? 0,
          };
        });
        const activeWards = normalizedWards.filter((ward) => ward.isBlocked === 0);
        setWards(activeWards);
      } catch (err) {
        console.error('Error fetching wards:', err);
        setWards([]);
        await showErrorModal('Unable to load wards. Please try again.', 'Error');
      }
    };
    fetchWards();
  }, []);

  // Fetch departments and consultants on mount
  useEffect(() => {
    const fetchDepartmentsAndConsultants = async () => {
      try {
        const [depts, docs] = await Promise.all([
          apiService.fetchAllDepartments(),
          apiService.fetchAllConsultants()
        ]);
        setDepartments(Array.isArray(depts) ? depts : []);
        setConsultants(Array.isArray(docs) ? docs : []);
      } catch (error) {
        console.error('Error fetching departments/consultants:', error);
        await showWarningToast('Failed to load doctors and departments. Please refresh the page.');
      }
    };
    fetchDepartmentsAndConsultants();
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

  // Fetch account heads for Account Head dropdown
  useEffect(() => {
    const fetchAccountHeads = async () => {
      setLoadingCompanies(true);
      try {
        const response = await apiService.fetchAccountHeads();
        setCompanies(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error('Error fetching account heads:', error);
        await showWarningToast('Failed to load account heads. Please refresh the page.');
        setCompanies([]);
      } finally {
        setLoadingCompanies(false);
      }
    };

    fetchAccountHeads();
  }, []);

  // Load beds when ward is selected
  useEffect(() => {
    if (selectedWard) {
      loadBedsForWard(selectedWard.id);
    }
  }, [selectedWard]);

  const loadBedsForWard = async (wardId: number) => {
    setLoading(true);
    try {
      const response = await apiService.fetchRoomBedByWardId(wardId);
      
      let bedsData: any[] = [];
      if (Array.isArray(response)) {
        bedsData = response;
      }
      
      const mappedBeds: Bed[] = bedsData.map((room: any) => {
        // API returns rooms with roomId and name (room name)
        // isOccupied: 1 = occupied, 0 = available
        // patIdAdmit: patient ID if occupied
        // Check if there's a beds array within the room, otherwise treat the room as a bed
        if (room.beds && Array.isArray(room.beds)) {
          // If rooms contain beds array, flatten the structure
          return room.beds.map((bed: any) => {
            const isOccupied = bed.isOccupied === 1;
            return {
              id: bed.bedId || bed.id || room.roomId,
              bedNumber: bed.bedNumber || bed.name || `Bed-${bed.id || room.roomId}`,
              wardId: bed.wardId || room.wardId || wardId,
              isOccupied: isOccupied,
              status: isOccupied ? 'occupied' : 'available' as Bed['status'],
              patientName: bed.patientName ?? undefined,
              patientId: bed.patientId ?? undefined,
              admissionDate: bed.admissionDate ?? undefined,
              patIdAdmit: bed.patIdAdmit ?? undefined
            };
          });
        } else {
          // If no beds array, treat each room as a single bed
          const isOccupied = room.isOccupied === 1;
          return {
            id: room.roomId || room.id,
            bedNumber: room.name || `Room-${room.roomId || room.id}`,
            wardId: room.wardId ?? wardId,
            isOccupied: isOccupied,
            status: isOccupied ? 'occupied' : 'available' as Bed['status'],
            patientName: room.patientName ?? undefined,
            patientId: room.patientId ?? undefined,
            admissionDate: room.admissionDate ?? undefined,
            patIdAdmit: room.patIdAdmit ?? undefined
          };
        }
      }).flat(); // Flatten in case we had nested beds arrays
      
      // Fetch patient details for occupied beds
      const bedsWithDetails = await Promise.all(
        mappedBeds.map(async (bed) => {
          if (bed.patIdAdmit) {
            try {
              const patientDetails = await apiService.fetchPatientDetailsByPatId(bed.patIdAdmit);
              console.log('Patient details for bed', bed.bedNumber, ':', patientDetails);
              return {
                ...bed,
                patientDetails: patientDetails?.data || patientDetails,
                patientName: (patientDetails?.data?.name || patientDetails?.name) || bed.patientName,
                patientId: (patientDetails?.data?.displayNumber || patientDetails?.displayNumber) || bed.patientId
              };
            } catch (error) {
              console.error('Error fetching patient details for patId', bed.patIdAdmit, ':', error);
              return bed;
            }
          }
          return bed;
        })
      );
      
      setBeds(bedsWithDetails);
    } catch (err) {
      console.error('Error loading beds:', err);
      setBeds([]);
      await showErrorModal('Unable to load beds for the selected ward.', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleWardSelect = (ward: Ward) => {
    setSelectedWard(ward);
    setSelectedBed(null);
  };

  const handleBedClick = (bed: Bed) => {
    if (bed.status === 'available') {
      setSelectedBed(bed);
      setShowBedModal(true);
    } else if (bed.status === 'occupied') {
      // Show patient details modal
      if (bed.patientDetails) {
        setSelectedPatientDetails(bed.patientDetails);
        setShowPatientDetailsModal(true);
      } else {
        showInfoModal(`Bed: ${bed.bedNumber}\nPatient: ${bed.patientName || 'N/A'}\nOP Number: ${bed.patientId || 'N/A'}`, 'Bed Occupied');
      }
    }
  };

  const handleOpNumberSearch = async () => {
    if (!searchOpNumber.trim()) {
      await showErrorModal('Please enter OP Number', 'Error');
      return;
    }

    setLoading(true);
    try {
      // Fetch patient details by OP number
      const response = await apiService.fetchPatientDetails(searchOpNumber.trim());
      const patientData = response?.data || response;
      
      if (!patientData) {
        await showErrorModal('Patient not found', 'Error');
        setLoading(false);
        return;
      }

      // Check registration status - convert to number to handle both number and string types
      const isInOp = Number(patientData.isInOp ?? 0);
      const isInIp = Number(patientData.isInIp ?? 0);

      // Validate: rec_patient.isInIp=1 means already registered in IP (not allowed) - CHECK FIRST
      if (isInIp === 1) {
        await showWarningModal('This patient is already registered in IP.', 'Already Registered');
        setLoading(false);
        return;
      }

      // Validate: rec_patient.isInOp=0 means not registered (not allowed)
      if (isInOp === 0) {
        await showWarningModal('This patient is not registered in OP. Please register the patient in OP first.', 'Not Registered');
        setLoading(false);
        return;
      }

      // If validation passes (isInOp=1 and isInIp=0), populate patient info
      setPatientInfo(prev => ({
        ...prev,
        opNumber: patientData.displayNumber || searchOpNumber,
        firstName: patientData.name || '',
        secondName: patientData.secName || '',
        guardianName: patientData.gname || '',
        phoneNumber: patientData.phone || '',
        patientId: patientData.patId,
        opVisitId: patientData.lastVisitId,
        doctorId: patientData.doctorId || 0,
        departmentId: patientData.deptId || patientData.departmentId || 0,
        admissionDate: getCurrentLocalDate(),
        admissionTime: getCurrentLocalTime()
      }));

      // Load account head if available in patient data
      if (patientData.debitId) {
        setSelectedCompany(String(patientData.debitId));
      }
      
      setShowBedModal(false);
      setShowRegistrationModal(true);
      
    } catch (error: any) {
      console.error('Error fetching patient:', error);
      
      // Check if it's a 404 error (patient not found)
      if (error.response?.status === 404) {
        await showWarningModal('The OP Number you entered is invalid or does not exist. Please check and try again.', 'Patient Not Found');
      } else {
        // For other errors, show the error message from backend or a generic message
        const errorMessage = error.response?.data?.message || 'Failed to fetch patient details. Please try again.';
        await showErrorModal(errorMessage, 'Error');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle print admission record
  const handlePrintAdmissionRecord = async (patientId?: number) => {
    const patIdToUse = patientId || admittedPatientId;
    
    console.log('🖨️ Print Admission Record - Patient ID:', patIdToUse);
    
    if (!patIdToUse) {
      console.error('❌ No patient ID available for printing');
      await showErrorModal('No patient admission data available', 'Error');
      return;
    }

    try {
      setLoading(true);
      
      // Fetch patient details
      const patientDetails = await apiService.fetchPatientDetailsByPatId(patIdToUse);
      const patientData = patientDetails?.data || patientDetails;
      

      if (!patientData) {
        console.error('❌ No patient data in response');
        await showErrorModal('Unable to fetch patient details', 'Error');
        return;
      }

      // Prepare admission data for print
      const printData = {
        patientCategory: patientData.accountCategory || 'General',
        ipNo: patientData.ipNo || '',
        opNo: patientData.displayNumber || '',
        patientName: `${patientData.name || ''} ${patientData.secName || ''}`.trim(),
        ageAndSex: `${patientData.age || ''} / ${patientData.sex || ''}`,
        religion: '', // Not available in API
        maritalStatus: '', // Not available in API
        occupation: '', // Not available in API
        telephone: patientData.phone || '',
        guardianName: patientData.gname || '',
        nationality: patientData.country || '',
        address: `${patientData.add1 || ''}, ${patientData.village || ''}, ${patientData.post || ''}, ${patientData.district || ''}, ${patientData.state || ''}`.replace(/, ,/g, ',').replace(/^, |, $/g, ''),
        admissionDate: patientData.admitDateTime || '',
        dischargeDate: '',
        prevAdmissionNo: '',
        hospitalDays: '',
        referredTo: patientData.doctorName || '',
        department: patientData.departmentName || '',
        wardName: patientData.wardName || '',
        wardType: '', // Not available in API
        roomNo: patientData.bedNo || '',
        accountType: patientData.accountCategory,
      };
      
      setAdmissionPrintData(printData);

      // Trigger print
      setTimeout(() => {
        if (admissionPrintTriggerRef.current) {
          admissionPrintTriggerRef.current.click();
        }
        if (admissionPrintTriggerRef.current) {
          admissionPrintTriggerRef.current.click();
        }
      }, 100);

    } catch (error) {
      console.error('❌ Error preparing admission record:', error);
      await showErrorModal('Failed to prepare admission record for printing', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintOccupiedBedPatient = async () => {
    
    if (!selectedPatientDetails) {
      console.error('❌ No patient details available for printing');
      await showErrorModal('No patient details available', 'Error');
      return;
    }

    try {

      // Trigger print
      setTimeout(() => {
        if (occupiedBedPrintTriggerRef.current) {
          occupiedBedPrintTriggerRef.current.click();
        }
      }, 100);

    } catch (error) {
      console.error('❌ Error preparing patient details for printing:', error);
      await showErrorModal('Failed to prepare patient details for printing', 'Error');
    }
  };

  const handleRegistrationSubmit = async () => {
    // Validation
    if (!patientInfo.opNumber || !patientInfo.firstName || !patientInfo.guardianName) {
      await showValidationError('Please Contact Administrator "Required fields are empty"');
      return;
    }

    // Validate admission date and time
    if (!patientInfo.admissionDate) {
      await showValidationError('Please select admission date');
      return;
    }

    if (!patientInfo.admissionTime) {
      await showValidationError('Please select admission time');
      return;
    }

    // Validate doctor
    if (!patientInfo.doctorId || patientInfo.doctorId === 0) {
      await showValidationError('Please select attending doctor');
      return;
    }

    // Validate department
    if (!patientInfo.departmentId || patientInfo.departmentId === 0) {
      await showValidationError('Please select department');
      return;
    }

    // Validate diagnosis
    if (!patientInfo.diagnosis || patientInfo.diagnosis.trim() === '') {
      await showValidationError('Please enter diagnosis/reason for admission');
      return;
    }

    // Proceed with admission
    performAdmission();
  };

  const performAdmission = async () => {
    if (!selectedBed || !selectedWard || !patientInfo.patientId || !patientInfo.opVisitId) {
      await showErrorModal('Missing required information for admission', 'Error');
      return;
    }

    setIsSubmitting(true);
    setLoading(true);
    try {
      // Combine admission date and time into ISO string
      const admitDateTime = `${patientInfo.admissionDate}T${patientInfo.admissionTime}:00.000Z`;

      const admissionPayload = {
        patId: patientInfo.patientId,
        locId: 0, // TODO: Get from context/config if needed
        deptId: patientInfo.departmentId,
        docId: patientInfo.doctorId,
        admitDateTime: admitDateTime,
        diagnosis: patientInfo.diagnosis,
        accHeadId: Number(selectedCompany) || 0,
        admissionWardId: selectedWard.id,
        roomBedId: selectedBed.id,
        noDays: 0, // TODO: Calculate or get from user input if needed
        typeId: 0, // TODO: Get admission type if needed
        chargeType: 0, // TODO: Get charge type if needed
        patType: 0, // TODO: Get patient type if needed
        uid: Number(loginData?.id) || 0
      };

      const response = await apiService.admitPatient(admissionPayload);

      const ipNumber = response?.display || response?.ipNumber || 'N/A';
      const ipVisitId = response?.ipVisitId;
      
      // Store patient ID for print functionality BEFORE showing success dialog
      const currentPatientId = patientInfo.patientId;
      setAdmittedPatientId(currentPatientId || null);
      
      const successMessage = `IP No: ${ipNumber}  |  OP No: ${patientInfo.opNumber}`;
      
      await showSuccessModal(successMessage, 'Admission Successful');

      // Reset form after admission
      setShowRegistrationModal(false);
      setSelectedBed(null);
      setSearchOpNumber('');
      setAdmittedPatientId(null); // Clear after reset
      setSelectedCompany('');
      setPatientInfo({
        opNumber: '',
        firstName: '',
        secondName: '',
        guardianName: '',
        phoneNumber: '',
        admissionDate: getCurrentLocalDate(),
        admissionTime: getCurrentLocalTime(),
        doctorId: 0,
        departmentId: 0,
        diagnosis: '',
        notes: ''
      });
      // Reload beds to reflect the new occupation
      if (selectedWard) {
        loadBedsForWard(selectedWard.id);
      }
    } catch (error: any) {
      console.error('Error during admission:', error);
      const errorMessage = error.response?.data?.message || 'Failed to admit patient. Please try again.';
      await showErrorModal(errorMessage, 'Error');
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const getBedStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'success';
      case 'occupied': return 'danger';
      case 'maintenance': return 'warning';
      case 'reserved': return 'info';
      default: return 'secondary';
    }
  };

  const getBedStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <FontAwesomeIcon icon={faCheckCircle} />;
      case 'occupied': return <FontAwesomeIcon icon={faUser} />;
      case 'maintenance': return <FontAwesomeIcon icon={faTimesCircle} />;
      case 'reserved': return <FontAwesomeIcon icon={faCalendarAlt} />;
      default: return <FontAwesomeIcon icon={faBed} />;
    }
  };

  // Filter wards based on search input
  const filteredWards = wards.filter(ward =>
    ward.name.toLowerCase().includes(wardSearch.toLowerCase()) ||
    ward.type?.toLowerCase().includes(wardSearch.toLowerCase()) ||
    ward.floor?.toLowerCase().includes(wardSearch.toLowerCase())
  );

  return (
    <div className="inpatient-registration" style={{ height: '100vh', overflow: 'hidden', backgroundColor: '#f8f9fa' }}>
      <Container fluid className="h-100 p-0">
        <Row className="h-100 g-0">
          {/* Left Sidebar: Ward List */}
          <Col md={3} lg={2} className="bg-white border-end h-100 d-flex flex-column shadow-sm" style={{ zIndex: 10 }}>
            <div className="p-3 border-bottom bg-white">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold text-dark mb-0">WARDS</h6>
                <Badge className="theme-badge-primary" pill>{wards.length}</Badge>
              </div>
              <InputGroup size="sm">
                <InputGroup.Text className="bg-light border-end-0">
                  <FontAwesomeIcon icon={faSearch} className="text-muted" />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search wards..."
                  value={wardSearch}
                  onChange={(e) => setWardSearch(e.target.value)}
                  className="border-start-0 bg-light"
                />
              </InputGroup>
            </div>
            
            <div className="flex-grow-1 overflow-auto p-2 custom-scrollbar">
              {filteredWards.length === 0 ? (
                <div className="text-center py-4 text-muted small">
                  No wards found
                </div>
              ) : (
                filteredWards.map((ward) => (
                  <div
                    key={ward.id}
                    onClick={() => handleWardSelect(ward)}
                    className={`ward-list-item p-1 mb-2 rounded cursor-pointer ${selectedWard?.id === ward.id ? 'active' : ''}`}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="fw-bold text-truncate" style={{ maxWidth: '70%' }}>{ward.name}</span>
                      {ward.availableBeds > 0 ? (
                        <Badge className="theme-badge-primary rounded-pill" style={{ fontSize: '0.6rem' }}>{ward.availableBeds} Free</Badge>
                      ) : (
                        <Badge className="theme-badge-secondary rounded-pill" style={{ fontSize: '0.6rem' }}>Full</Badge>
                      )}
                    </div>
                    
                  </div>
                ))
              )}
            </div>
          </Col>

          {/* Main Content: Bed Grid */}
          <Col md={9} lg={10} className="h-100 d-flex flex-column bg-light">
            {selectedWard ? (
              <>
                {/* Header */}
                <div className="bg-white border-bottom px-4 py-3 d-flex justify-content-between align-items-center shadow-sm">
                  <div>
                    <div className="d-flex align-items-center gap-3">
                      <h4 className="fw-bold text-dark mb-0">{selectedWard.name}</h4>
                      <Badge className="theme-badge-secondary border">
                        Floor: {selectedWard.floor || 'N/A'}
                      </Badge>
                    </div>
                    <div className="d-flex gap-4 mt-2 text-muted small">
                      <div className="d-flex align-items-center gap-1">
                        <div className="status-dot bg-secondary"></div>
                        <span>Total: <strong>{selectedWard.totalBeds}</strong></span>
                      </div>
                      <div className="d-flex align-items-center gap-1">
                        <div className="status-dot bg-success"></div>
                        <span className="text-success">Available: <strong>{selectedWard.availableBeds}</strong></span>
                      </div>
                      <div className="d-flex align-items-center gap-1">
                        <div className="status-dot bg-danger"></div>
                        <span className="text-danger">Occupied: <strong>{selectedWard.totalBeds - selectedWard.availableBeds}</strong></span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="d-flex gap-3">
                    <div className="d-flex align-items-center gap-2 px-3 py-2 bg-light rounded border">
                      <div className="status-dot bg-success"></div>
                      <small>Available</small>
                    </div>
                    <div className="d-flex align-items-center gap-2 px-3 py-2 bg-light rounded border">
                      <div className="status-dot bg-danger"></div>
                      <small>Occupied</small>
                    </div>
                  </div>
                </div>

                {/* Bed Grid Area */}
                <div className="flex-grow-1 overflow-auto p-4 custom-scrollbar">
                  {loading ? (
                    <div className="d-flex flex-column align-items-center justify-content-center h-100">
                      <div className="spinner-border text-primary" role="status"></div>
                      <p className="mt-3 text-muted">Loading beds...</p>
                    </div>
                  ) : (
                    <div className="bed-grid-container">
                      {beds.map((bed) => (
                        <div
                          key={bed.id}
                          className={`bed-item ${bed.status} ${selectedBed?.id === bed.id ? 'selected' : ''}`}
                          onClick={() => handleBedClick(bed)}
                        >
                          <div className="d-flex justify-content-between mb-1">
                            <span className="bed-number">{bed.bedNumber}</span>
                            {bed.status === 'occupied' ? (
                              <FontAwesomeIcon icon={faUser} className="text-danger opacity-50" style={{ fontSize: '0.7rem' }} />
                            ) : (
                              <FontAwesomeIcon icon={faCheckCircle} className="text-success opacity-50" style={{ fontSize: '0.7rem' }} />
                            )}
                          </div>
                          
                          {bed.status === 'occupied' ? (
                            <div className="patient-info">
                              <div className="fw-bold text-dark text-truncate" style={{ fontSize: '0.7rem' }}>{bed.patientName}</div>
                              <div className="small text-muted" style={{ fontSize: '0.65rem' }}>{bed.patientId}</div>
                            </div>
                          ) : (
                            <div className="available-info mt-auto">
                              <small className="text-success fw-bold" style={{ fontSize: '0.65rem' }}>Available</small>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
                <div className="bg-white p-5 rounded-circle shadow-sm mb-4 d-flex align-items-center justify-content-center" style={{ width: '120px', height: '120px' }}>
                  <FontAwesomeIcon icon={faHospital} size="3x" className="text-secondary opacity-25" />
                </div>
                <h4>Select a Ward</h4>
                <p>Choose a ward from the sidebar to view bed availability</p>
              </div>
            )}
          </Col>
        </Row>

        {/* Bed Selection Modal */}
        <Modal show={showBedModal} onHide={() => setShowBedModal(false)} centered backdrop="static">
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="fw-bold">Assign Patient</Modal.Title>
          </Modal.Header>
          <Modal.Body className="pt-2 pb-4">
            <p className="text-muted mb-4">Assigning patient to <span className="fw-bold text-primary">{selectedBed?.bedNumber}</span> in {selectedWard?.name}</p>
            
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold text-secondary text-uppercase">Patient OP Number</Form.Label>
              <InputGroup size="lg">
                <InputGroup.Text className="bg-light border-end-0">
                  <FontAwesomeIcon icon={faUser} className="text-muted" />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="e.g. 25-0001"
                  value={searchOpNumber}
                  onChange={(e) => setSearchOpNumber(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleOpNumberSearch()}
                  className="border-start-0 bg-light"
                  autoFocus
                />
                <Button className="theme-btn-primary px-4" onClick={handleOpNumberSearch}>
                  Search
                </Button>
              </InputGroup>
            </Form.Group>
          </Modal.Body>
        </Modal>

        {/* Patient Registration Modal */}
        <Modal show={showRegistrationModal} onHide={() => setShowRegistrationModal(false)} size="xl" centered backdrop="static">
          <Modal.Header closeButton className="border-bottom py-3 bg-light">
            <Modal.Title className="h5 fw-bold">
              <FontAwesomeIcon icon={faStethoscope} className="me-2 text-primary" />
              Inpatient Admission
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-0">
            <div className="d-flex">
              {/* Left Sidebar for Patient Summary */}
              <div className="bg-light p-4 border-end" style={{ width: '300px', minWidth: '300px' }}>
                <h6 className="fw-bold text-secondary mb-3 text-uppercase small">Patient Details</h6>
                <div className="mb-4">
                  <label className="small text-muted d-block">OP Number</label>
                  <span className="fw-bold fs-5">{patientInfo.opNumber}</span>
                </div>
                <div className="mb-4">
                  <label className="small text-muted d-block">Full Name</label>
                  <span className="fw-bold">{patientInfo.firstName} {patientInfo.secondName}</span>
                </div>
                <div className="mb-4">
                  <label className="small text-muted d-block">Guardian</label>
                  <span>{patientInfo.guardianName}</span>
                </div>
                
                <hr className="my-4" />
                
                <h6 className="fw-bold text-secondary mb-3 text-uppercase small">Admission Target</h6>
                <div className="card border-0 shadow-sm p-3 mb-2">
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted small">Ward</span>
                    <span className="fw-bold small">{selectedWard?.name}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted small">Bed</span>
                    <span className="fw-bold small text-primary">{selectedBed?.bedNumber}</span>
                  </div>
                </div>
              </div>

              {/* Main Form Area */}
              <div className="p-4 flex-grow-1">
                <h6 className="fw-bold text-primary mb-4">Admission Details</h6>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small fw-bold">Admission Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={patientInfo.admissionDate}
                        onChange={(e) => setPatientInfo({...patientInfo, admissionDate: e.target.value})}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small fw-bold">Admission Time</Form.Label>
                      <Form.Control
                        type="time"
                        value={patientInfo.admissionTime}
                        onChange={(e) => setPatientInfo({...patientInfo, admissionTime: e.target.value})}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small fw-bold">Attending Doctor</Form.Label>
                      <Form.Select
                        value={patientInfo.doctorId}
                        onChange={(e) => {
                          const selectedDoctorId = parseInt(e.target.value);
                          const selectedConsultant = consultants.find(c => c.id === selectedDoctorId);
                          setPatientInfo({
                            ...patientInfo, 
                            doctorId: selectedDoctorId,
                            departmentId: selectedConsultant?.deptId || 0
                          });
                        }}
                      >
                        <option value={0}>Select Doctor...</option>
                        {consultants.map(consultant => (
                          <option key={consultant.id} value={consultant.id}>
                            {consultant.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small fw-bold">Department</Form.Label>
                      <Form.Select
                        value={patientInfo.departmentId}
                        onChange={(e) => setPatientInfo({...patientInfo, departmentId: parseInt(e.target.value)})}
                      >
                        <option value={0}>Select Department...</option>
                        {departments.map(department => (
                          <option key={department.id} value={department.id}>
                            {department.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Label className="small fw-bold">Account Head</Form.Label>
                    <Form.Select
                      value={selectedCompany}
                      onChange={(e) => setSelectedCompany(e.target.value)}
                      disabled={isSubmitting || loadingCompanies}
                    >
                      <option value="">-- Select Company --</option>
                      {companies.map((company) => (
                          <option key={company.headId} value={company.headId}>
                              {company.headName}
                          </option>
                        ))}
                    </Form.Select>
                    {loadingCompanies && (
                      <small className="text-muted mt-1 d-block">
                          <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                          Loading companies...
                      </small>
                    )}
                  </Col>
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label className="small fw-bold">Diagnosis / Reason for Admission</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={patientInfo.diagnosis}
                        onChange={(e) => setPatientInfo({...patientInfo, diagnosis: e.target.value})}
                        placeholder="Enter clinical diagnosis..."
                      />
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label className="small fw-bold">Notes</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        value={patientInfo.notes}
                        onChange={(e) => setPatientInfo({...patientInfo, notes: e.target.value})}
                        placeholder="Any additional instructions..."
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer className="bg-light border-top-0">
            <Button className="theme-outline-btn-secondary text-decoration-none" onClick={() => setShowRegistrationModal(false)}>
              Cancel
            </Button>
            <Button className="theme-btn-primary px-4 fw-bold" onClick={handleRegistrationSubmit}>
              Confirm Admission
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Patient Details Modal */}
        <Modal 
          show={showPatientDetailsModal} 
          onHide={() => setShowPatientDetailsModal(false)} 
          size="xl"
          centered
        >
          <Modal.Header closeButton style={{ borderBottom: "3px solid #2c3e50" }}>
            <Modal.Title style={{ color: "#2c3e50", fontWeight: "var(--font-weight-bold)", display: "flex", alignItems: "center", gap: "10px" }}>
              <FontAwesomeIcon icon={faUser} />
              Patient Details
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ padding: "25px" }}>
            {selectedPatientDetails && (
              <div
                style={{
                  border: "2px solid #2c3e50",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "var(--font-size-sm)",
                  }}
                >
                  <tbody>
                    {/* IP NO and OP NO */}
                    <tr>
                      <td
                        style={{
                          borderBottom: "2px solid #2c3e50",
                          padding: "12px 15px",
                          width: "25%",
                          fontWeight: "var(--font-weight-bold)",
                          color: "#495057",
                          fontSize: "var(--font-size-sm)",
                          backgroundColor: "#f8f9fa",
                        }}
                      >
                        IP NO
                      </td>
                      <td
                        style={{
                          borderBottom: "2px solid #2c3e50",
                          padding: "12px 15px",
                          width: "25%",
                          color: "#2c3e50",
                          fontWeight: "var(--font-weight-semibold)",
                          backgroundColor: "#f8f9fa",
                        }}
                      >
                        {selectedPatientDetails.ipNo || 'N/A'}
                      </td>
                      <td
                        style={{
                          borderBottom: "2px solid #2c3e50",
                          padding: "12px 15px",
                          width: "25%",
                          fontWeight: "var(--font-weight-bold)",
                          color: "#495057",
                          fontSize: "var(--font-size-sm)",
                          backgroundColor: "#f8f9fa",
                        }}
                      >
                        OP NO
                      </td>
                      <td
                        style={{
                          borderBottom: "2px solid #2c3e50",
                          padding: "12px 15px",
                          width: "25%",
                          color: "#2c3e50",
                          fontWeight: "var(--font-weight-semibold)",
                          backgroundColor: "#f8f9fa",
                        }}
                      >
                        {selectedPatientDetails.displayNumber || 'N/A'}
                      </td>
                    </tr>

                    {/* Patient Name and Age/Sex */}
                    <tr>
                      <td
                        style={{
                          borderBottom: "1px solid #dee2e6",
                          padding: "12px 15px",
                          fontWeight: "var(--font-weight-bold)",
                          color: "#495057",
                          fontSize: "var(--font-size-sm)",
                        }}
                      >
                        PATIENT NAME
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid #dee2e6",
                          padding: "12px 15px",
                          color: "#2c3e50",
                          fontWeight: "var(--font-weight-semibold)",
                        }}
                      >
                        {selectedPatientDetails.name || 'N/A'} {selectedPatientDetails.secName || ''}
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid #dee2e6",
                          padding: "12px 15px",
                          fontWeight: "var(--font-weight-bold)",
                          color: "#495057",
                          fontSize: "var(--font-size-sm)",
                        }}
                      >
                        AGE & SEX
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid #dee2e6",
                          padding: "12px 15px",
                          color: "#2c3e50",
                          fontWeight: "var(--font-weight-semibold)",
                        }}
                      >
                        {selectedPatientDetails.age || 'N/A'} / {selectedPatientDetails.sex || 'N/A'}
                      </td>
                    </tr>

                    {/* DOB and Guardian Name */}
                    <tr>
                      <td
                        style={{
                          borderBottom: "1px solid #dee2e6",
                          padding: "12px 15px",
                          fontWeight: "var(--font-weight-bold)",
                          color: "#495057",
                          fontSize: "var(--font-size-sm)",
                        }}
                      >
                        DATE OF BIRTH
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid #dee2e6",
                          padding: "12px 15px",
                          color: "#2c3e50",
                          fontWeight: "var(--font-weight-semibold)",
                        }}
                      >
                        {selectedPatientDetails.dob || 'N/A'}
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid #dee2e6",
                          padding: "12px 15px",
                          fontWeight: "var(--font-weight-bold)",
                          color: "#495057",
                          fontSize: "var(--font-size-sm)",
                        }}
                      >
                        GUARDIAN NAME
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid #dee2e6",
                          padding: "12px 15px",
                          color: "#2c3e50",
                          fontWeight: "var(--font-weight-semibold)",
                        }}
                      >
                        {selectedPatientDetails.gname || 'N/A'} ({selectedPatientDetails.guardianType || 'N/A'})
                      </td>
                    </tr>

                    {/* Phone and Email */}
                    <tr>
                      <td
                        style={{
                          borderBottom: "1px solid #dee2e6",
                          padding: "12px 15px",
                          fontWeight: "var(--font-weight-bold)",
                          color: "#495057",
                          fontSize: "var(--font-size-sm)",
                        }}
                      >
                        PHONE
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid #dee2e6",
                          padding: "12px 15px",
                          color: "#2c3e50",
                          fontWeight: "var(--font-weight-semibold)",
                        }}
                      >
                        {selectedPatientDetails.phone || 'N/A'}
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid #dee2e6",
                          padding: "12px 15px",
                          fontWeight: "var(--font-weight-bold)",
                          color: "#495057",
                          fontSize: "var(--font-size-sm)",
                        }}
                      >
                        EMAIL
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid #dee2e6",
                          padding: "12px 15px",
                          color: "#2c3e50",
                          fontWeight: "var(--font-weight-semibold)",
                        }}
                      >
                        {selectedPatientDetails.email || 'N/A'}
                      </td>
                    </tr>

                    {/* Address */}
                    <tr>
                      <td
                        style={{
                          borderBottom: "1px solid #dee2e6",
                          padding: "12px 15px",
                          fontWeight: "var(--font-weight-bold)",
                          color: "#495057",
                          fontSize: "var(--font-size-sm)",
                        }}
                      >
                        ADDRESS
                      </td>
                      <td
                        colSpan={3}
                        style={{
                          borderBottom: "1px solid #dee2e6",
                          padding: "12px 15px",
                          color: "#2c3e50",
                          fontWeight: "var(--font-weight-semibold)",
                        }}
                      >
                        {[selectedPatientDetails.add1, selectedPatientDetails.add2, selectedPatientDetails.village, selectedPatientDetails.post].filter(Boolean).join(', ') || 'N/A'}
                      </td>
                    </tr>

                    {/* District, State, Pincode */}
                    <tr>
                      <td
                        style={{
                          borderBottom: "1px solid #dee2e6",
                          padding: "12px 15px",
                          fontWeight: "var(--font-weight-bold)",
                          color: "#495057",
                          fontSize: "var(--font-size-sm)",
                        }}
                      >
                        DISTRICT
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid #dee2e6",
                          padding: "12px 15px",
                          color: "#2c3e50",
                          fontWeight: "var(--font-weight-semibold)",
                        }}
                      >
                        {selectedPatientDetails.district || 'N/A'}
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid #dee2e6",
                          padding: "12px 15px",
                          fontWeight: "var(--font-weight-bold)",
                          color: "#495057",
                          fontSize: "var(--font-size-sm)",
                        }}
                      >
                        STATE / PINCODE
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid #dee2e6",
                          padding: "12px 15px",
                          color: "#2c3e50",
                          fontWeight: "var(--font-weight-semibold)",
                        }}
                      >
                        {selectedPatientDetails.state || 'N/A'} / {selectedPatientDetails.pincode || 'N/A'}
                      </td>
                    </tr>

                    {/* Doctor and Department */}
                    <tr>
                      <td
                        style={{
                          borderBottom: "1px solid #dee2e6",
                          padding: "12px 15px",
                          fontWeight: "var(--font-weight-bold)",
                          color: "#495057",
                          fontSize: "var(--font-size-sm)",
                        }}
                      >
                        DOCTOR
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid #dee2e6",
                          padding: "12px 15px",
                          color: "#2c3e50",
                          fontWeight: "var(--font-weight-semibold)",
                        }}
                      >
                        {selectedPatientDetails.doctorName || 'N/A'}
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid #dee2e6",
                          padding: "12px 15px",
                          fontWeight: "var(--font-weight-bold)",
                          color: "#495057",
                          fontSize: "var(--font-size-sm)",
                        }}
                      >
                        DEPARTMENT
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid #dee2e6",
                          padding: "12px 15px",
                          color: "#2c3e50",
                          fontWeight: "var(--font-weight-semibold)",
                        }}
                      >
                        {selectedPatientDetails.departmentName || 'N/A'}
                      </td>
                    </tr>

                    {/* Complaint and Last Visit Date */}
                    <tr>
                      <td
                        style={{
                          borderBottom: "1px solid #dee2e6",
                          padding: "12px 15px",
                          fontWeight: "var(--font-weight-bold)",
                          color: "#495057",
                          fontSize: "var(--font-size-sm)",
                        }}
                      >
                        COMPLAINT
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid #dee2e6",
                          padding: "12px 15px",
                          color: "#2c3e50",
                          fontWeight: "var(--font-weight-semibold)",
                        }}
                      >
                        {selectedPatientDetails.complaintName || 'N/A'}
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid #dee2e6",
                          padding: "12px 15px",
                          fontWeight: "var(--font-weight-bold)",
                          color: "#495057",
                          fontSize: "var(--font-size-sm)",
                        }}
                      >
                        LAST VISIT DATE
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid #dee2e6",
                          padding: "12px 15px",
                          color: "#2c3e50",
                          fontWeight: "var(--font-weight-semibold)",
                        }}
                      >
                        {selectedPatientDetails.lastVisitDate || 'N/A'}
                      </td>
                    </tr>

                    {/* Admission Date & Time and Ward */}
                    <tr>
                      <td
                        style={{
                          borderBottom: "1px solid #dee2e6",
                          padding: "12px 15px",
                          fontWeight: "var(--font-weight-bold)",
                          color: "#495057",
                          fontSize: "var(--font-size-sm)",
                        }}
                      >
                        ADMISSION DATE & TIME
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid #dee2e6",
                          padding: "12px 15px",
                          color: "#2c3e50",
                          fontWeight: "var(--font-weight-semibold)",
                        }}
                      >
                        {selectedPatientDetails.admitDateTime || 'N/A'}
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid #dee2e6",
                          padding: "12px 15px",
                          fontWeight: "var(--font-weight-bold)",
                          color: "#495057",
                          fontSize: "var(--font-size-sm)",
                        }}
                      >
                        WARD
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid #dee2e6",
                          padding: "12px 15px",
                          color: "#2c3e50",
                          fontWeight: "var(--font-weight-semibold)",
                        }}
                      >
                        {selectedPatientDetails.wardName || 'N/A'}
                      </td>
                    </tr>

                    {/* Bed Number and Account Category */}
                    <tr>
                      <td
                        style={{
                          borderBottom: "1px solid #dee2e6",
                          padding: "12px 15px",
                          fontWeight: "var(--font-weight-bold)",
                          color: "#495057",
                          fontSize: "var(--font-size-sm)",
                        }}
                      >
                        BED NUMBER
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid #dee2e6",
                          padding: "12px 15px",
                          color: "#2c3e50",
                          fontWeight: "var(--font-weight-semibold)",
                        }}
                      >
                        {selectedPatientDetails.bedNo || 'N/A'}
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid #dee2e6",
                          padding: "12px 15px",
                          fontWeight: "var(--font-weight-bold)",
                          color: "#495057",
                          fontSize: "var(--font-size-sm)",
                        }}
                      >
                        ACCOUNT CATEGORY
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid #dee2e6",
                          padding: "12px 15px",
                          color: "#2c3e50",
                          fontWeight: "var(--font-weight-semibold)",
                        }}
                      >
                        {selectedPatientDetails.accountCategory || 'N/A'}
                      </td>
                    </tr>

                    {/* Debit Head and Advance Balance */}
                    <tr>
                      <td
                        style={{
                          borderBottom: "1px solid #dee2e6",
                          padding: "12px 15px",
                          fontWeight: "var(--font-weight-bold)",
                          color: "#495057",
                          fontSize: "var(--font-size-sm)",
                        }}
                      >
                        ACCOUNT HEAD
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid #dee2e6",
                          padding: "12px 15px",
                          color: "#2c3e50",
                          fontWeight: "var(--font-weight-semibold)",
                        }}
                      >
                        {selectedPatientDetails.debitHead || 'N/A'}
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid #dee2e6",
                          padding: "12px 15px",
                          fontWeight: "var(--font-weight-bold)",
                          color: "#495057",
                          fontSize: "var(--font-size-sm)",
                        }}
                      >
                        ADVANCE BALANCE
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid #dee2e6",
                          padding: "12px 15px",
                          color: "#2c3e50",
                          fontWeight: "var(--font-weight-semibold)",
                        }}
                      >
                        <span style={{ color: "#28a745" }}>₹{selectedPatientDetails.advBalance?.toFixed(2) || '0.00'}</span>
                      </td>
                    </tr>

                    {/* Due Balance and Government ID */}
                    <tr>
                      <td
                        style={{
                          padding: "12px 15px",
                          fontWeight: "var(--font-weight-bold)",
                          color: "#495057",
                          fontSize: "var(--font-size-sm)",
                        }}
                      >
                        DUE BALANCE
                      </td>
                      <td
                        style={{
                          padding: "12px 15px",
                          color: "#2c3e50",
                          fontWeight: "var(--font-weight-semibold)",
                        }}
                      >
                        <span style={{ color: "#dc3545" }}>₹{selectedPatientDetails.dueBalance?.toFixed(2) || '0.00'}</span>
                      </td>
                      <td
                        style={{
                          padding: "12px 15px",
                          fontWeight: "var(--font-weight-bold)",
                          color: "#495057",
                          fontSize: "var(--font-size-sm)",
                        }}
                      >
                        {selectedPatientDetails.govIdType ? 'GOVERNMENT ID' : ''}
                      </td>
                      <td
                        style={{
                          padding: "12px 15px",
                          color: "#2c3e50",
                          fontWeight: "var(--font-weight-semibold)",
                        }}
                      >
                        {selectedPatientDetails.govIdType ? `${selectedPatientDetails.govIdType}: ${selectedPatientDetails.govIdNo || 'N/A'}` : ''}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer style={{ borderTop: "3px solid #2c3e50" }}>
            <Button
              className="theme-btn-primary"
              onClick={handlePrintOccupiedBedPatient}
              style={{
                fontWeight: "var(--font-weight-semibold)",
              }}
            >
              <i className="fas fa-print me-2"></i>
              Print
            </Button>
            <Button className="theme-outline-btn-primary" onClick={() => setShowPatientDetailsModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a0aec0;
        }

        .ward-list-item {
          transition: all 0.2s ease;
          border: 1px solid transparent;
        }
        .ward-list-item:hover {
          background-color: #f7fafc;
          border-color: #e2e8f0;
        }
        .ward-list-item.active {
          background-color: #ebf8ff;
          border-color: #3182ce;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .cursor-pointer {
          cursor: pointer;
        }

        .bed-grid-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
          gap: 8px;
        }
        .bed-item {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          min-height: 65px;
          display: flex;
          flex-direction: column;
        }
        .bed-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border-color: #cbd5e0;
        }
        .bed-item.available {
          border-top: 3px solid #48bb78;
        }
        .bed-item.occupied {
          border-top: 3px solid #f56565;
          background-color: #fff5f5;
        }
        .bed-item.selected {
          ring: 2px solid #3182ce;
          border-color: #3182ce;
          transform: scale(0.98);
        }
        .bed-number {
          font-weight: var(--font-weight-bold);
          color: #1a202c;
          font-size: var(--font-size-md);
        }
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
        }
      `}</style>

      {/* Hidden Print Admission Record Content */}
      {admissionPrintData && orgInfo && (
        <div style={{ display: 'none' }}>
          <div ref={admissionPrintRef}>
            <AdmissionRecordPrint
              organization={{
                name: orgInfo?.name || "Hospital Name",
                code: orgInfo?.code || "",
                address: orgInfo?.address || "",
                phone: orgInfo?.phone || "",
                itNo: orgInfo?.itNo || "",
                salesTax: orgInfo?.salesTax || "",
              }}
              admissionData={admissionPrintData}
            />
          </div>
        </div>
      )}

      {/* ReactToPrint for Admission Record */}
      <ReactToPrint
        trigger={() => (
          <button ref={admissionPrintTriggerRef} style={{ display: 'none' }}>
            Print
          </button>
        )}
        content={() => admissionPrintRef.current}
      />

      {/* Hidden Print Occupied Bed Patient Content */}
      {selectedPatientDetails && orgInfo && (
        <div style={{ display: 'none' }}>
          <div ref={occupiedBedPrintRef}>
            <OccupiedBedPatientPrint
              organization={{
                name: orgInfo?.name || "Hospital Name",
                code: orgInfo?.code || "",
                address: orgInfo?.address || "",
                phone: orgInfo?.phone || "",
                itNo: orgInfo?.itNo || "",
                salesTax: orgInfo?.salesTax || "",
              }}
              patientDetails={selectedPatientDetails}
            />
          </div>
        </div>
      )}

      {/* ReactToPrint for Occupied Bed Patient */}
      <ReactToPrint
        trigger={() => (
          <button ref={occupiedBedPrintTriggerRef} style={{ display: 'none' }}>
            Print
          </button>
        )}
        content={() => occupiedBedPrintRef.current}
      />
    </div>
  );
};

export default InpatientRegistration;
