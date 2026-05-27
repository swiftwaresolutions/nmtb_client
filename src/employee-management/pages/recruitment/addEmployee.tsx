import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Alert,
  Table,
  InputGroup,
  Card,
  ProgressBar,
  Modal,
} from "react-bootstrap";
import Swal from "sweetalert2";
import { useTableSearch } from "../../../hooks/useTableSearch";
import { ListCheck, ShieldX, ArrowRepeat, Search, X } from "react-bootstrap-icons";
import PageHeader from "../../../components/PageHeader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus } from "@fortawesome/free-solid-svg-icons";

interface Employee {
  id: number;
  // Step 1: Employee Information
  department: string;
  departmentName?: string;
  unit: string;
  unitName?: string;
  category: string;
  categoryName?: string;
  employeeName: string;
  employeeNo: string;
  employeeOPNo: string;
  sex: string;
  employeeType: string;
  contractPeriodFrom: string;
  contractPeriodTo: string;
  trainingPeriodFrom: string;
  trainingPeriodTo: string;
  isProbationary: boolean;
  probationaryPeriodFrom: string;
  probationaryPeriodTo: string;
  position: string;
  positionName?: string;
  joiningDate: string;
  regularized: string;
  regularizedDate: string;
  canCalculateSalary: string;
  
  // Step 2: Personal Details
  dateOfBirth: string;
  maritalStatus: string;
  nationality: string;
  religion: string;
  community: string;
  motherTongue: string;
  fatherGuardianName: string;
  
  // Step 3: Contact Details
  presentAddress: string;
  permanentAddress: string;
  phoneNo: string;
  mobileNo: string;
  email: string;
  
  // Step 4: Education Details
  education: string;
  institution: string;
  registrationNo1: string;
  registrationNo2: string;
  
  isActive: number;
}

const steps = [

  "Employee Information",
  "Personal Details",
  "Contact Details",
  "Education Details"
  
];

const AddEmployee: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Refs for validation
  const departmentRef = useRef<HTMLSelectElement>(null);
  const unitRef = useRef<HTMLSelectElement>(null);
  const categoryRef = useRef<HTMLSelectElement>(null);
  const employeeNameRef = useRef<HTMLInputElement>(null);
  const employeeNoRef = useRef<HTMLInputElement>(null);
  const employeeOPNoRef = useRef<HTMLInputElement>(null);
  const sexRef = useRef<HTMLSelectElement>(null);
  const employeeTypeRef = useRef<HTMLSelectElement>(null);
  const positionRef = useRef<HTMLSelectElement>(null);
  const joiningDateRef = useRef<HTMLInputElement>(null);
  const dateOfBirthRef = useRef<HTMLInputElement>(null);
  const mobileNoRef = useRef<HTMLInputElement>(null);

  // Load master data from localStorage
  const [departments, setDepartments] = useState<any[]>(() => {
    const saved = localStorage.getItem('departments');
    return saved ? JSON.parse(saved) : [];
  });

  const [units, setUnits] = useState<any[]>(() => {
    const saved = localStorage.getItem('units');
    return saved ? JSON.parse(saved) : [];
  });

  const [categories, setCategories] = useState<any[]>(() => {
    const saved = localStorage.getItem('categories');
    return saved ? JSON.parse(saved) : [];
  });

  const [positions, setPositions] = useState<any[]>(() => {
    const saved = localStorage.getItem('positions');
    return saved ? JSON.parse(saved) : [];
  });

  // Initialize employees from localStorage
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const savedEmployees = localStorage.getItem('employees');
    return savedEmployees ? JSON.parse(savedEmployees) : [];
  });

  // Save employees to localStorage
  useEffect(() => {
    localStorage.setItem('employees', JSON.stringify(employees));
  }, [employees]);

  const [form, setForm] = useState({
    // Step 1: Employee Information
    department: "",
    unit: "",
    category: "",
    employeeName: "",
    employeeNo: "",
    employeeOPNo: "",
    sex: "",
    employeeType: "",
    contractPeriodFrom: "",
    contractPeriodTo: "",
    trainingPeriodFrom: "",
    trainingPeriodTo: "",
    isProbationary: false,
    probationaryPeriodFrom: "",
    probationaryPeriodTo: "",
    position: "",
    joiningDate: "",
    regularized: "",
    regularizedDate: "",
    canCalculateSalary: "",
    
    // Step 2: Personal Details
    dateOfBirth: "",
    maritalStatus: "",
    nationality: "",
    religion: "",
    community: "",
    motherTongue: "",
    fatherGuardianName: "",
    
    // Step 3: Contact Details
    presentAddress: "",
    permanentAddress: "",
    phoneNo: "",
    mobileNo: "",
    email: "",
    
    // Step 4: Education Details
    education: "",
    institution: "",
    registrationNo1: "",
    registrationNo2: "",
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showBlocked, setShowBlocked] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const target = e.target;
    const { name, value, type } = target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (target as HTMLInputElement).checked : value,
    }));
  };

  // Auto-focus Position when Permanent Employee is selected
  useEffect(() => {
    if (form.employeeType === "Permanent Employee") {
      setTimeout(() => positionRef.current?.focus(), 100);
    }
  }, [form.employeeType]);

  const showValidationError = (message: string) => {
    Swal.fire({
      icon: "error",
      title: "Validation Error",
      text: message,
      confirmButtonColor: "#d33",
    });
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0: // Employee Information
        if (!form.department) {
          showValidationError("Please select a department.");
          setTimeout(() => departmentRef.current?.focus(), 100);
          return false;
        }
        if (!form.unit) {
          showValidationError("Please select a unit.");
          setTimeout(() => unitRef.current?.focus(), 100);
          return false;
        }
        if (!form.category) {
          showValidationError("Please select a category.");
          setTimeout(() => categoryRef.current?.focus(), 100);
          return false;
        }
        if (!form.employeeName.trim()) {
          showValidationError("Employee name is required.");
          setTimeout(() => employeeNameRef.current?.focus(), 100);
          return false;
        }
        if (!form.employeeNo.trim()) {
          showValidationError("Employee number is required.");
          setTimeout(() => employeeNoRef.current?.focus(), 100);
          return false;
        }
       
        if (!form.position) {
          showValidationError("Please select a position.");
          setTimeout(() => positionRef.current?.focus(), 100);
          return false;
        }
       
        return true;

      case 1: // Personal Details
        if (!form.dateOfBirth) {
          showValidationError("Date of birth is required.");
          setTimeout(() => dateOfBirthRef.current?.focus(), 100);
          return false;
        }
        if (!form.maritalStatus) {
          showValidationError("Please select marital status.");
          return false;
        }
        return true;

      case 2: // Contact Details
        if (!form.mobileNo.trim()) {
          showValidationError("Mobile number is required.");
          setTimeout(() => mobileNoRef.current?.focus(), 100);
          return false;
        }
        return true;

      case 3: // Education Details
        // Education details are optional
        return true;

      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    setError("");
    setSuccess("");

    // Get master data names for display
    const dept = departments.find(d => d.id === Number(form.department));
    const unit = units.find(u => u.id === Number(form.unit));
    const cat = categories.find(c => c.id === Number(form.category));
    const pos = positions.find(p => p.id === Number(form.position));

    if (editingId) {
      // Update existing employee
      setEmployees(
        employees.map((emp) =>
          emp.id === editingId
            ? {
                ...emp,
                ...form,
                departmentName: dept?.departmentName,
                unitName: unit?.unitName,
                categoryName: cat?.categoryName,
                positionName: pos?.positionName,
              }
            : emp
        )
      );
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Employee updated successfully!",
        timer: 2000,
        showConfirmButton: false,
      });
    } else {
      // Add new employee
      const newId = Math.max(...employees.map((e) => e.id), 0) + 1;
      setEmployees([
        ...employees,
        {
          id: newId,
          ...form,
          departmentName: dept?.departmentName,
          unitName: unit?.unitName,
          categoryName: cat?.categoryName,
          positionName: pos?.positionName,
          isActive: 1,
        } as Employee,
      ]);
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Employee added successfully!",
        timer: 2000,
        showConfirmButton: false,
      });
    }

    handleReset();
  };

  const handleReset = () => {
    setForm({
      department: "",
      unit: "",
      category: "",
      employeeName: "",
      employeeNo: "",
      employeeOPNo: "",
      sex: "",
      employeeType: "",
      contractPeriodFrom: "",
      contractPeriodTo: "",
      trainingPeriodFrom: "",
      trainingPeriodTo: "",
      isProbationary: false,
      probationaryPeriodFrom: "",
      probationaryPeriodTo: "",
      position: "",
      joiningDate: "",
      regularized: "",
      regularizedDate: "",
      canCalculateSalary: "",
      dateOfBirth: "",
      maritalStatus: "",
      nationality: "",
      religion: "",
      community: "",
      motherTongue: "",
      fatherGuardianName: "",
      presentAddress: "",
      permanentAddress: "",
      phoneNo: "",
      mobileNo: "",
      email: "",
      education: "",
      institution: "",
      registrationNo1: "",
      registrationNo2: "",
    });
    setEditingId(null);
    setCurrentStep(0);
    setCompletedSteps([]);
    setError("");
    setSuccess("");
  };

  const handleEdit = (employee: Employee) => {
    setForm({
      department: String(employee.department),
      unit: String(employee.unit),
      category: String(employee.category),
      employeeName: employee.employeeName,
      employeeNo: employee.employeeNo,
      employeeOPNo: employee.employeeOPNo,
      sex: employee.sex,
      employeeType: employee.employeeType,
      contractPeriodFrom: employee.contractPeriodFrom,
      contractPeriodTo: employee.contractPeriodTo,
      trainingPeriodFrom: employee.trainingPeriodFrom,
      trainingPeriodTo: employee.trainingPeriodTo,
      isProbationary: employee.isProbationary,
      probationaryPeriodFrom: employee.probationaryPeriodFrom,
      probationaryPeriodTo: employee.probationaryPeriodTo,
      position: String(employee.position),
      joiningDate: employee.joiningDate,
      regularized: employee.regularized,
      regularizedDate: employee.regularizedDate,
      canCalculateSalary: employee.canCalculateSalary,
      dateOfBirth: employee.dateOfBirth,
      maritalStatus: employee.maritalStatus,
      nationality: employee.nationality,
      religion: employee.religion,
      community: employee.community,
      motherTongue: employee.motherTongue,
      fatherGuardianName: employee.fatherGuardianName,
      presentAddress: employee.presentAddress,
      permanentAddress: employee.permanentAddress,
      phoneNo: employee.phoneNo,
      mobileNo: employee.mobileNo,
      email: employee.email,
      education: employee.education,
      institution: employee.institution,
      registrationNo1: employee.registrationNo1,
      registrationNo2: employee.registrationNo2,
    });
    setEditingId(employee.id);
    setCurrentStep(0);
    setCompletedSteps([0, 1, 2, 3]);
  };

  const handleBlock = (id: number) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to block this employee?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, block it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setEmployees(
          employees.map((emp) =>
            emp.id === id ? { ...emp, isActive: 0 } : emp
          )
        );
        Swal.fire("Blocked!", "Employee has been blocked.", "success");
      }
    });
  };

  const handleUnblock = (id: number) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to unblock this employee?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#28a745",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, unblock it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setEmployees(
          employees.map((emp) =>
            emp.id === id ? { ...emp, isActive: 1 } : emp
          )
        );
        Swal.fire("Unblocked!", "Employee has been unblocked.", "success");
      }
    });
  };

  // Filter by active/blocked status
  const statusFilteredEmployees = employees.filter((e) => {
    const isActiveValue = Number(e.isActive);
    return showBlocked ? isActiveValue === 0 : isActiveValue === 1;
  });

  // Apply search filter
  const { filteredData: filteredEmployees, searchTerm, setSearchTerm } = useTableSearch({
    data: statusFilteredEmployees,
    searchFields: ['employeeName', 'employeeNo', 'departmentName', 'positionName'],
  });

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Card className="shadow-sm">
            <Card.Body style={{ padding: "2rem", maxHeight: "50vh", overflowY: "auto" }}>
              <h4 className="mb-4 text-center">Employee Information</h4>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Department <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Select
                      ref={departmentRef}
                      name="department"
                      value={form.department}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Department</option>
                      {departments.filter(d => d.isActive === 1).map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.departmentName}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Unit <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Select
                      ref={unitRef}
                      name="unit"
                      value={form.unit}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Unit</option>
                      {units.filter(u => u.isActive === 1).map((unit) => (
                        <option key={unit.id} value={unit.id}>
                          {unit.unitName}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Category <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Select
                      ref={categoryRef}
                      name="category"
                      value={form.category}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Category</option>
                      {categories.filter(c => c.isActive === 1).map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.categoryName}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Employee Name <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      ref={employeeNameRef}
                      type="text"
                      name="employeeName"
                      value={form.employeeName}
                      onChange={handleInputChange}
                      placeholder="Enter Employee Name"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Employee No <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      ref={employeeNoRef}
                      type="text"
                      name="employeeNo"
                      value={form.employeeNo}
                      onChange={handleInputChange}
                      placeholder="Enter Employee No"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Employee OP No <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      ref={employeeOPNoRef}
                      type="text"
                      name="employeeOPNo"
                      value={form.employeeOPNo}
                      onChange={handleInputChange}
                      placeholder="Enter OP No"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Sex <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Select
                      ref={sexRef}
                      name="sex"
                      value={form.sex}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Sex</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Employee Type <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Select
                      ref={employeeTypeRef}
                      name="employeeType"
                      value={form.employeeType}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Employee Type</option>
                      <option value="Bond Employee">Bond Employee</option>
                      <option value="Contract Employee">Contract Employee</option>
                      <option value="Permanent Employee">Permanent Employee</option>
                      <option value="Probationary Employee">Probationary Employee</option>
                      <option value="Trainee Employee">Trainee Employee</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Position <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Select
                      ref={positionRef}
                      name="position"
                      value={form.position}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Position</option>
                      {positions.filter(p => p.isActive === 1).map((pos) => (
                        <option key={pos.id} value={pos.id}>
                          {pos.positionName}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              {form.employeeType === "Contract Employee" && (
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Contract Period From</Form.Label>
                      <Form.Control
                        type="date"
                        name="contractPeriodFrom"
                        value={form.contractPeriodFrom}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Contract Period To</Form.Label>
                      <Form.Control
                        type="date"
                        name="contractPeriodTo"
                        value={form.contractPeriodTo}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              )}

              {form.employeeType === "Trainee Employee" && (
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Training Period From</Form.Label>
                      <Form.Control
                        type="date"
                        name="trainingPeriodFrom"
                        value={form.trainingPeriodFrom}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Training Period To</Form.Label>
                      <Form.Control
                        type="date"
                        name="trainingPeriodTo"
                        value={form.trainingPeriodTo}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              )}

              {form.employeeType === "Probationary Employee" && (
                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        label="Is Probationary"
                        name="isProbationary"
                        checked={form.isProbationary}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              )}

              {form.employeeType === "Probationary Employee" && form.isProbationary && (
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Probationary Period From</Form.Label>
                      <Form.Control
                        type="date"
                        name="probationaryPeriodFrom"
                        value={form.probationaryPeriodFrom}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Probationary Period To</Form.Label>
                      <Form.Control
                        type="date"
                        name="probationaryPeriodTo"
                        value={form.probationaryPeriodTo}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              )}

              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Joining Date <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      ref={joiningDateRef}
                      type="date"
                      name="joiningDate"
                      value={form.joiningDate}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Regularized</Form.Label>
                    <Form.Select
                      name="regularized"
                      value={form.regularized}
                      onChange={handleInputChange}
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Regularized Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="regularizedDate"
                      value={form.regularizedDate}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Can Calculate Salary</Form.Label>
                    <Form.Select
                      name="canCalculateSalary"
                      value={form.canCalculateSalary}
                      onChange={handleInputChange}
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        );

      case 1:
        return (
          <Card className="shadow-sm">
            <Card.Body style={{ padding: "2rem", maxHeight: "50vh", overflowY: "auto" }}>
              <h4 className="mb-4 text-center">Personal Details</h4>
              
              <Row className="mb-3">
                <Col md={4}>
                  <strong>Employee Name:</strong>
                  <div className="text-primary">{form.employeeName || "-"}</div>
                </Col>
                <Col md={4}>
                  <strong>Employee No:</strong>
                  <div className="text-primary">{form.employeeNo || "-"}</div>
                </Col>
                <Col md={4}>
                  <strong>Sex:</strong>
                  <div className="text-primary">{form.sex || "-"}</div>
                </Col>
              </Row>
              <hr />

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Date of Birth <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      ref={dateOfBirthRef}
                      type="date"
                      name="dateOfBirth"
                      value={form.dateOfBirth}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Marital Status <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Select
                      name="maritalStatus"
                      value={form.maritalStatus}
                      onChange={handleInputChange}
                    >
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nationality</Form.Label>
                    <Form.Control
                      type="text"
                      name="nationality"
                      value={form.nationality}
                      onChange={handleInputChange}
                      placeholder="Enter Nationality"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Religion</Form.Label>
                    <Form.Control
                      type="text"
                      name="religion"
                      value={form.religion}
                      onChange={handleInputChange}
                      placeholder="Enter Religion"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Community</Form.Label>
                    <Form.Control
                      type="text"
                      name="community"
                      value={form.community}
                      onChange={handleInputChange}
                      placeholder="Enter Community"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Mother Tongue</Form.Label>
                    <Form.Control
                      type="text"
                      name="motherTongue"
                      value={form.motherTongue}
                      onChange={handleInputChange}
                      placeholder="Enter Mother Tongue"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Father/Guardian Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="fatherGuardianName"
                      value={form.fatherGuardianName}
                      onChange={handleInputChange}
                      placeholder="Enter Father/Guardian Name"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        );

      case 2:
        return (
          <Card className="shadow-sm">
            <Card.Body style={{ padding: "2rem", maxHeight: "50vh", overflowY: "auto" }}>
              <h4 className="mb-4 text-center">Contact Details</h4>
              
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Employee Name:</strong>
                  <div className="text-primary">{form.employeeName || "-"}</div>
                </Col>
                <Col md={6}>
                  <strong>Employee No:</strong>
                  <div className="text-primary">{form.employeeNo || "-"}</div>
                </Col>
              </Row>
              <hr />

              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Present Address</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="presentAddress"
                      value={form.presentAddress}
                      onChange={handleInputChange}
                      placeholder="Enter Present Address"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Permanent Address</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="permanentAddress"
                      value={form.permanentAddress}
                      onChange={handleInputChange}
                      placeholder="Enter Permanent Address"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Phone No</Form.Label>
                    <Form.Control
                      type="text"
                      name="phoneNo"
                      value={form.phoneNo}
                      onChange={handleInputChange}
                      placeholder="Enter Phone No"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Mobile No <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      ref={mobileNoRef}
                      type="text"
                      name="mobileNo"
                      value={form.mobileNo}
                      onChange={handleInputChange}
                      placeholder="Enter Mobile No"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>E-mail (if any)</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleInputChange}
                      placeholder="Enter Email"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        );

      case 3:
        return (
          <Card className="shadow-sm">
            <Card.Body style={{ padding: "2rem", maxHeight: "50vh", overflowY: "auto" }}>
              <h4 className="mb-4 text-center">Education Details</h4>
              
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Employee Name:</strong>
                  <div className="text-primary">{form.employeeName || "-"}</div>
                </Col>
                <Col md={6}>
                  <strong>Employee No:</strong>
                  <div className="text-primary">{form.employeeNo || "-"}</div>
                </Col>
              </Row>
              <hr />

              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Education</Form.Label>
                    <Form.Control
                      type="text"
                      name="education"
                      value={form.education}
                      onChange={handleInputChange}
                      placeholder="Enter Education"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Institution</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="institution"
                      value={form.institution}
                      onChange={handleInputChange}
                      placeholder="Enter Institution"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Registration No 1</Form.Label>
                    <Form.Control
                      type="text"
                      name="registrationNo1"
                      value={form.registrationNo1}
                      onChange={handleInputChange}
                      placeholder="Enter Registration No 1"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Registration No 2</Form.Label>
                    <Form.Control
                      type="text"
                      name="registrationNo2"
                      value={form.registrationNo2}
                      onChange={handleInputChange}
                      placeholder="Enter Registration No 2"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <PageHeader
        icon={faUserPlus} // <-- Pass the icon definition, not the component
        title="Employee Recruitment"
        subtitle="Add and manage employee information"
        badges={[
          { label: "Active", value: employees.filter(e => e.isActive === 1).length },
          { label: "Blocked", value: employees.filter(e => e.isActive === 0).length },
          { label: "Total", value: employees.length },
        ]}
      />
      <div className="content-body">
        <Container fluid>
          <Row>
            {/* Form Section */}
            <Col lg={8}>
              <Card className="shadow-sm mb-4">
                <Card.Body>
                  {/* Progress Steps */}
                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      {steps.map((step, index) => (
                        <div
                          key={index}
                          className="d-flex align-items-center"
                          style={{ flex: 1 }}
                        >
                          <div
                            style={{
                              width: "35px",
                              height: "35px",
                              borderRadius: "50%",
                              background:
                                index === currentStep
                                  ? "#0d6efd"
                                  : completedSteps.includes(index)
                                  ? "#28a745"
                                  : "#e9ecef",
                              color: index === currentStep || completedSteps.includes(index) ? "white" : "#6c757d",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: "bold",
                              fontSize: "14px",
                            }}
                          >
                            {completedSteps.includes(index) ? "✓" : index + 1}
                          </div>
                          {index < steps.length - 1 && (
                            <div
                              style={{
                                flex: 1,
                                height: "2px",
                                background: completedSteps.includes(index) ? "#28a745" : "#e9ecef",
                                margin: "0 10px",
                              }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="d-flex justify-content-between">
                      {steps.map((step, index) => (
                        <div
                          key={index}
                          style={{
                            flex: 1,
                            textAlign: index === 0 ? "left" : index === steps.length - 1 ? "right" : "center",
                            fontSize: "12px",
                            color: index === currentStep ? "#0d6efd" : "#6c757d",
                            fontWeight: index === currentStep ? "bold" : "normal",
                          }}
                        >
                          {step}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Step Content */}
                  {renderStepContent()}

                  {/* Navigation Buttons */}
                  <div className="d-flex justify-content-between mt-4">
                    <Button
                      variant="secondary"
                      onClick={handlePrev}
                      disabled={currentStep === 0}
                    >
                      Previous
                    </Button>
                    <div>
                      {editingId && (
                        <Button
                          variant="warning"
                          onClick={handleReset}
                          className="me-2"
                        >
                          Cancel Edit
                        </Button>
                      )}
                      {currentStep === steps.length - 1 ? (
                        <Button variant="success" onClick={handleSubmit}>
                          {editingId ? "Update Employee" : "Submit"}
                        </Button>
                      ) : (
                        <Button variant="primary" onClick={handleNext}>
                          Next
                        </Button>
                      )}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Employee List Section */}
            <Col lg={4}>
              <Card className="shadow-sm">
                <Card.Body style={{ padding: "1.5rem" }}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex align-items-center gap-2">
                      {showBlocked ? (
                        <ShieldX size={22} color="#dc3545" />
                      ) : (
                        <ListCheck size={22} color="#28a745" />
                      )}
                      <h5 style={{ margin: 0 }}>
                        {showBlocked ? "Blocked List" : "Employee List"}
                      </h5>
                      <span
                        className="badge"
                        style={{
                          background: showBlocked ? "#dc3545" : "#28a745",
                          fontSize: "11px",
                          padding: "4px 8px",
                        }}
                      >
                        {statusFilteredEmployees.length}
                      </span>
                    </div>
                    <Button
                      variant={showBlocked ? "outline-success" : "outline-danger"}
                      size="sm"
                      onClick={() => setShowBlocked(!showBlocked)}
                      style={{
                        borderRadius: "20px",
                        padding: "6px 12px",
                        fontWeight: "500",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <ArrowRepeat size={14} />
                      {showBlocked ? "Active" : "Blocked"}
                    </Button>
                  </div>

                  <div className="mb-3">
                    <InputGroup size="sm">
                      <InputGroup.Text>
                        <Search size={14} />
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder="Search employees..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      {searchTerm && (
                        <Button
                          variant="outline-secondary"
                          onClick={() => setSearchTerm("")}
                          size="sm"
                        >
                          <X size={14} />
                        </Button>
                      )}
                    </InputGroup>
                  </div>

                  <div className="mb-2 text-end">
                    <span className="badge bg-secondary">
                      {filteredEmployees.length} / {statusFilteredEmployees.length} Records
                    </span>
                  </div>

                  <div style={{ maxHeight: "600px", overflowY: "auto" }}>
                    <Table striped bordered hover size="sm">
                      <thead
                        style={{
                          position: "sticky",
                          top: 0,
                          background: "white",
                          zIndex: 1,
                        }}
                      >
                        <tr>
                          <th>#</th>
                          <th>Name</th>
                          <th>Emp No</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredEmployees.map((employee, index) => (
                          <tr key={employee.id}>
                            <td>{index + 1}</td>
                            <td>
                              <div style={{ fontSize: "13px" }}>
                                {employee.employeeName}
                              </div>
                              <div style={{ fontSize: "11px", color: "#6c757d" }}>
                                {employee.departmentName}
                              </div>
                            </td>
                            <td>
                              <span className="badge bg-info">
                                {employee.employeeNo}
                              </span>
                            </td>
                            <td>
                              {!showBlocked ? (
                                <>
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    className="me-1 mb-1"
                                    onClick={() => handleEdit(employee)}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    className="mb-1"
                                    onClick={() => handleBlock(employee.id)}
                                  >
                                    Block
                                  </Button>

                                </>
                              ) : (
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  onClick={() => handleUnblock(employee.id)}
                                >
                                  Unblock
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                        {filteredEmployees.length === 0 && (
                          <tr>
                            <td colSpan={4} className="text-center py-4 text-muted">
                              No {showBlocked ? "blocked" : "active"} employees found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>


    </div>
  );
};

export default AddEmployee;