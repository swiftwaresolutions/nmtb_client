import React, { useState, useEffect, useRef } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Alert,
  Table,
  Form,
} from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../../../state/store";
import { LaboratoryApiService } from "../../../../../api/laboratory/laboratory-api-service";
import { handleError } from "../../../../../utils/errorUtil";
import {
  showSuccessToast,
  showErrorToast,
  showValidationError,
  showConfirmDialog,
} from "../../../../../utils/alertUtil";
import SearchInput from "../../../../../components/SearchInput";
import { useTableSearch } from "../../../../../hooks/useTableSearch";
import {
  Gear,
  ClipboardCheck,
  FileText,
  BarChartFill,
  Bullseye,
  Sliders2,
  PencilSquare,
  PlusCircle,
  XCircle,
  Clock,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ListCheck,
  ShieldX,
  ArrowRepeat,
} from "react-bootstrap-icons";
import PageHeader from "../../../../../components/PageHeader";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

interface LabTest {
  id: number;
  name: string;
  deptId: number;
  deptName: string;
  specId: number;
  specName: string;
  rate: number;
  testHrs: number;
  testMin: number;
  methodology: string;
  charity: number;
  privateRate: number;
  privateCharity: number;
  lastValue: number;
  entDateTime: string;
  uid: number;
  blocked: number;
  isCulture: number;
  testCode: string;
  canDoManual: number;
  canDoSemi: number;
  canDoAuto: number;
  comment: number;
  picture: number;
  printIndividual: number;
  isEditable: number;
  isEditPrivate: number;
  isOutside: number;
  isMaterial: number;
  fields: Array<{
    fieldId: number;
    testId: number;
    fieldName: string;
    fieldType: string;
    unit: string;
    testMethod: string;
    machine: string;
    normal: number;
    cutoff: number;
    cutoffGreater: string;
    cutoffLower: string;
    intervalFlag: number;
    interHigher: string;
    interInter: string;
    interLower: string;
    lineType: number;
    isNote: number;
    values: Array<{
      id: number;
      fieldId: number;
      lowerBounds: number;
      upperBounds: number;
      cutoffVal: number;
      rangeFrom: number;
      rangeTo: number;
      note: string;
      fieldType: string;
      fromAge: number;
      fromAgeType: string;
      toAge: number;
      toAgeType: string;
      sex: string;
    }>;
  }>;
}

const steps = ["Department", "Test Details", "Type & Rate", "Fields"];

const AddTest = () => {
  const themePrimary = "var(--page-primary-color)";
  const themeSecondary = "var(--page-secondary-color)";
  const dispatch = useDispatch();
  const loginData = useSelector((state: RootState) => state.loginData);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Refs for input fields to enable focus on validation errors
  const departmentRef = useRef<HTMLSelectElement>(null);
  const testNameRef = useRef<HTMLInputElement>(null);
  const testCodeRef = useRef<HTMLInputElement>(null);
  const specimenNameRef = useRef<HTMLSelectElement>(null);
  const generalRateRef = useRef<HTMLInputElement>(null);
  const privateRateRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    department: "",
    testName: "",
    testCode: "",
    specimenName: "",
    methodology: "",
    timeRequiredH: "1",
    timeRequiredM: "0",
    noOfFields: 1,
    commentAdded: false,
    printIndividually: false,
    pictureInserted: false,
    isCulture: false,
    reference: false,
    outSideTest: false,
    isMaterial: false,
    manual: true,
    semiAutomatic: true,
    fullyAutomatic: true,
    generalRate: 0,
    generalRateEditable: false,
    generalRateCharity: 0,
    privateRate: 0,
    privateRateEditable: false,
    privateRateCharity: 0,
    companyRates: {},
    setGeneralRateAllCompanies: true,
    setPrivateRateAllCompanies: false,
  });
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showBlocked, setShowBlocked] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [specimens, setSpecimens] = useState<any[]>([]);
  const laboratoryApiService = new LaboratoryApiService();
  // Field configuration state
  const [fields, setFields] = useState<any[]>([]);
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(
    null
  );
  const [fieldForm, setFieldForm] = useState({
    fieldName: "",
    fieldType: "heading",
    units: "",
    machine: "",
    method: "",
    singleLine: true,
    addNote: false,
  });

  // Sub-item state for the current field being added
  const [subItems, setSubItems] = useState<any[]>([]);

  // Temporary form for adding a sub-item
  const [subItemForm, setSubItemForm] = useState({
    // Common
    ageFrom: "",
    ageFromUnit: "Hours",
    ageTo: "",
    ageToUnit: "Years",
    sex: "Common", // Male, Female, Common, Baby

    // Note specific
    note: "",

    // Reference Range specific
    referenceRangeFrom: "",
    referenceRangeTo: "",

    // Cutoff specific
    cutoffValue: "",

    // Intermediate specific
    intermediateValueFrom: "",
    intermediateValueTo: "",
  });

  // Field-level global settings (labels)
  const [fieldSettings, setFieldSettings] = useState({
    cutoffGreaterLabel: "Positive",
    cutoffLowerLabel: "Negative",
    intermediateGreaterLabel: "Positive",
    intermediateLowerLabel: "Negative",
    intermediateLabel: "Intermediate",
  });

  // Fetch departments and specimens on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptData, specData] = await Promise.all([
          laboratoryApiService.fetchAllLabDepartments(),
          laboratoryApiService.fetchAllLabSpecimen(),
        ]);
        setDepartments(deptData);
        setSpecimens(specData);
      } catch (error) {
        console.error("Error fetching data:", error);
        showErrorToast(
          "Failed to load departments and specimens.",
          "Data Load Error"
        );
      }
    };
    fetchData();
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const data = await laboratoryApiService.fetchAllLabTestAdd();
      // Store complete API data
      setLabTests(data);
    } catch (error) {
      console.error("Error fetching tests:", error);
      handleError(dispatch, error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const target = e.target;
    const { name, value, type } = target;
    if (name === "setGeneralRateAllCompanies" && type === "checkbox") {
      setForm((prev) => ({
        ...prev,
        setGeneralRateAllCompanies: (target as HTMLInputElement).checked,
        setPrivateRateAllCompanies: !(target as HTMLInputElement).checked
          ? prev.setPrivateRateAllCompanies
          : false,
      }));
    } else if (name === "setPrivateRateAllCompanies" && type === "checkbox") {
      setForm((prev) => ({
        ...prev,
        setPrivateRateAllCompanies: (target as HTMLInputElement).checked,
        setGeneralRateAllCompanies: !(target as HTMLInputElement).checked
          ? prev.setGeneralRateAllCompanies
          : false,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]:
          type === "checkbox" ? (target as HTMLInputElement).checked : value,
      }));
    }
  };

  const handleFieldInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked =
      e.target instanceof HTMLInputElement ? e.target.checked : undefined;
    setFieldForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFieldSettingsChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFieldSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubItemChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setSubItemForm((prev) => {
      const newState = { ...prev, [name]: value };
      if (name === "sex" && value === "Baby") {
        newState.ageFrom = "0";
        newState.ageFromUnit = "Hours";
        newState.ageTo = "1";
        newState.ageToUnit = "Years";
      }
      return newState;
    });
  };

  const handleAddSubItem = () => {
    // Validate based on field type
    if (fieldForm.fieldType === "noComparison" && fieldForm.addNote) {
      if (!subItemForm.note.trim()) {
        showValidationError("Note text is required.");
        return;
      }
      if (!subItemForm.ageFrom.trim()) {
        showValidationError("Age From is required.");
        return;
      }
      if (!subItemForm.ageTo.trim()) {
        showValidationError("Age To is required.");
        return;
      }
    }

    if (fieldForm.fieldType === "referenceRange") {
      if (!subItemForm.referenceRangeFrom.trim()) {
        showValidationError("Range From is required.");
        return;
      }
      if (!subItemForm.referenceRangeTo.trim()) {
        showValidationError("Range To is required.");
        return;
      }
      if (!subItemForm.ageFrom.trim()) {
        showValidationError("Age From is required.");
        return;
      }
      if (!subItemForm.ageTo.trim()) {
        showValidationError("Age To is required.");
        return;
      }
    }

    if (fieldForm.fieldType === "cutoffValue") {
      if (!subItemForm.cutoffValue.trim()) {
        showValidationError("Cutoff Value is required.");
        return;
      }
      if (!subItemForm.ageFrom.trim()) {
        showValidationError("Age From is required.");
        return;
      }
      if (!subItemForm.ageTo.trim()) {
        showValidationError("Age To is required.");
        return;
      }
    }

    if (fieldForm.fieldType === "intermediateValue") {
      if (!subItemForm.intermediateValueFrom.trim()) {
        showValidationError("Intermediate Value From is required.");
        return;
      }
      if (!subItemForm.intermediateValueTo.trim()) {
        showValidationError("Intermediate Value To is required.");
        return;
      }
      if (!subItemForm.ageFrom.trim()) {
        showValidationError("Age From is required.");
        return;
      }
      if (!subItemForm.ageTo.trim()) {
        showValidationError("Age To is required.");
        return;
      }
    }

    // If sex is "Common" or "Baby", add two separate items for Male and Female
    if (subItemForm.sex === "Common" || subItemForm.sex === "Baby") {
      const maleItem = { ...subItemForm, sex: "M" };
      const femaleItem = { ...subItemForm, sex: "F" };
      setSubItems([...subItems, maleItem, femaleItem]);
    } else {
      // For Male, Female - add as is
      setSubItems([...subItems, { ...subItemForm }]);
    }

    setSubItemForm({
      ...subItemForm,
      note: "",
      referenceRangeFrom: "",
      referenceRangeTo: "",
      cutoffValue: "",
      intermediateValueFrom: "",
      intermediateValueTo: "",
    });
  };

  const handleRemoveSubItem = (idx: number) => {
    setSubItems(subItems.filter((_, i) => i !== idx));
  };

  const handleAddField = () => {
    if (!fieldForm.fieldName.trim()) {
      showValidationError("Field name is required.");
      return;
    }

    // Check if units is mandatory for certain field types
    const requiresUnits = [
      "referenceRange",
      "cutoffValue",
      "intermediateValue",
    ].includes(fieldForm.fieldType);

    if (requiresUnits && !fieldForm.units.trim()) {
      showValidationError(
        "Units field is mandatory for Ref. Range, Cutoff, and Intermediate field types."
      );
      return;
    }

    const newField = {
      ...fieldForm,
      subItems: [...subItems],
      settings: { ...fieldSettings },
    };

    if (editingFieldIndex !== null) {
      // Update existing field
      const updatedFields = [...fields];
      updatedFields[editingFieldIndex] = newField;
      setFields(updatedFields);
      setEditingFieldIndex(null);
    } else {
      // Add new field
      setFields([...fields, newField]);
    }

    // Reset Field Form
    setFieldForm({
      fieldName: "",
      fieldType: "heading",
      units: "",
      machine: "",
      method: "",
      singleLine: true,
      addNote: false,
    });
    setSubItems([]);
    setSubItemForm({
      ageFrom: "",
      ageFromUnit: "Hours",
      ageTo: "",
      ageToUnit: "Years",
      sex: "Common",
      note: "",
      referenceRangeFrom: "",
      referenceRangeTo: "",
      cutoffValue: "",
      intermediateValueFrom: "",
      intermediateValueTo: "",
    });
    setFieldSettings({
      cutoffGreaterLabel: "Positive",
      cutoffLowerLabel: "Negative",
      intermediateGreaterLabel: "Positive",
      intermediateLowerLabel: "Negative",
      intermediateLabel: "Intermediate",
    });
  };

  const handleEditField = (index: number) => {
    const field = fields[index];
    setFieldForm({
      fieldName: field.fieldName,
      fieldType: field.fieldType,
      units: field.units,
      machine: field.machine || "",
      method: field.method || "",
      singleLine: field.singleLine,
      addNote: field.addNote,
    });
    setSubItems(field.subItems || []);
    setFieldSettings(
      field.settings || {
        cutoffGreaterLabel: "Positive",
        cutoffLowerLabel: "Negative",
        intermediateGreaterLabel: "Positive",
        intermediateLowerLabel: "Negative",
        intermediateLabel: "Intermediate",
      }
    );
    setEditingFieldIndex(index);
  };

  const handleDeleteField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
    if (editingFieldIndex === index) {
      setEditingFieldIndex(null);
      // Reset form if deleting the field being edited
      setFieldForm({
        fieldName: "",
        fieldType: "heading",
        units: "",
        machine: "",
        method: "",
        singleLine: true,
        addNote: false,
      });
      setSubItems([]);
      setSubItemForm({
        ageFrom: "",
        ageFromUnit: "Hours",
        ageTo: "",
        ageToUnit: "Years",
        sex: "Common",
        note: "",
        referenceRangeFrom: "",
        referenceRangeTo: "",
        cutoffValue: "",
        intermediateValueFrom: "",
        intermediateValueTo: "",
      });
      setFieldSettings({
        cutoffGreaterLabel: "Positive",
        cutoffLowerLabel: "Negative",
        intermediateGreaterLabel: "Positive",
        intermediateLowerLabel: "Negative",
        intermediateLabel: "Intermediate",
      });
    }
  };

  const handleCancelFieldEdit = () => {
    setEditingFieldIndex(null);
    setFieldForm({
      fieldName: "",
      fieldType: "heading",
      units: "",
      machine: "",
      method: "",
      singleLine: true,
      addNote: false,
    });
    setSubItems([]);
    setSubItemForm({
      ageFrom: "",
      ageFromUnit: "Hours",
      ageTo: "",
      ageToUnit: "Years",
      sex: "Common",
      note: "",
      referenceRangeFrom: "",
      referenceRangeTo: "",
      cutoffValue: "",
      intermediateValueFrom: "",
      intermediateValueTo: "",
    });
    setFieldSettings({
      cutoffGreaterLabel: "Positive",
      cutoffLowerLabel: "Negative",
      intermediateGreaterLabel: "Positive",
      intermediateLowerLabel: "Negative",
      intermediateLabel: "Intermediate",
    });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <Form.Group className="mb-3">
            <Form.Label>
              Select Department <span style={{ color: "red" }}>*</span>
            </Form.Label>
            <Form.Control
              as="select"
              name="department"
              value={form.department}
              onChange={handleInputChange}
              ref={departmentRef}
              required
            >
              <option value="">-- Select --</option>
              {departments
                .filter((dept: any) => Number(dept?.isActive) === 1)
                .map((dept: any) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.deptName}
                  </option>
                ))}
            </Form.Control>
          </Form.Group>
        );
      case 1:
        return (
          <>
            <Form.Group className="mb-2">
              <Form.Label>
                Test Name <span style={{ color: "red" }}>*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="testName"
                value={form.testName}
                onChange={handleInputChange}
                ref={testNameRef}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>
                Test Code <span style={{ color: "red" }}>*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="testCode"
                value={form.testCode}
                onChange={handleInputChange}
                ref={testCodeRef}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>
                Specimen Name <span style={{ color: "red" }}>*</span>
              </Form.Label>
              <Form.Control
                as="select"
                name="specimenName"
                value={form.specimenName}
                onChange={handleInputChange}
                ref={specimenNameRef}
                required
              >
                <option value="">-- Select Specimen --</option>
                {specimens
                  .filter((spec: any) => Number(spec?.isBlocked) === 0)
                  .map((spec: any) => (
                  <option key={spec.id} value={spec.id}>
                    {spec.specName}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Methodology</Form.Label>
              <Form.Control
                type="text"
                name="methodology"
                value={form.methodology}
                onChange={handleInputChange}
                placeholder="Enter methodology"
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Time Required</Form.Label>
              <Row>
                <Col md={6}>
                  <Form.Control
                    type="text"
                    name="timeRequiredH"
                    value={form.timeRequiredH}
                    onChange={handleInputChange}
                    placeholder="Hours"
                  />
                </Col>
                <Col md={6}>
                  <Form.Control
                    type="text"
                    name="timeRequiredM"
                    value={form.timeRequiredM}
                    onChange={handleInputChange}
                    placeholder="Minutes"
                  />
                </Col>
              </Row>
            </Form.Group>
            <Form.Check
              type="checkbox"
              id="picture-inserted"
              label="Picture Inserted"
              name="pictureInserted"
              checked={form.pictureInserted}
              onChange={handleInputChange}
            />
            <Form.Group className="mb-2">
              <Form.Label>No of Fields</Form.Label>
              <Form.Control
                type="number"
                name="noOfFields"
                value={form.noOfFields}
                min={1}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Check
              inline
              type="checkbox"
              id="comment-added"
              label="Comment Added"
              name="commentAdded"
              checked={form.commentAdded}
              onChange={handleInputChange}
            />
            <Form.Check
              inline
              type="checkbox"
              id="print-individually"
              label="Print Individually"
              name="printIndividually"
              checked={form.printIndividually}
              onChange={handleInputChange}
            />
            <Form.Check
              inline
              type="checkbox"
              id="is-material"
              label="Is Material"
              name="isMaterial"
              checked={form.isMaterial}
              onChange={handleInputChange}
            />
          </>
        );
      case 2:
        return (
          <div>
            <div className="mb-4">
              <h5 className="mb-3">Test Type</h5>
              <div className="mt-2">
                <div>
                  <Form.Check
                    inline
                    type="checkbox"
                    id="is-culture"
                    label="Is Culture"
                    name="isCulture"
                    checked={form.isCulture}
                    onChange={handleInputChange}
                  />
                  <Form.Check
                    inline
                    type="checkbox"
                    id="reference"
                    label="Reference"
                    name="reference"
                    checked={form.reference}
                    onChange={handleInputChange}
                  />
                  <Form.Check
                    inline
                    type="checkbox"
                    id="out-side-test"
                    label="Out Side test"
                    name="outSideTest"
                    checked={form.outSideTest}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Form.Check
                    inline
                    type="checkbox"
                    id="manual"
                    label="Manual"
                    name="manual"
                    checked={form.manual}
                    onChange={handleInputChange}
                  />
                  <Form.Check
                    inline
                    type="checkbox"
                    id="semi-automatic"
                    label="Semi Automatic"
                    name="semiAutomatic"
                    checked={form.semiAutomatic}
                    onChange={handleInputChange}
                  />
                  <Form.Check
                    inline
                    type="checkbox"
                    id="fully-automatic"
                    label="Fully Automatic"
                    name="fullyAutomatic"
                    checked={form.fullyAutomatic}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
            <hr />
            <div className="mt-4">
              <h5 className="mb-3">Charge Details</h5>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Rate (General) <span style={{ color: "red" }}>*</span>
                    </Form.Label>
                    <Form.Control
                      type="number"
                      name="generalRate"
                      value={form.generalRate}
                      onChange={handleInputChange}
                      ref={generalRateRef}
                      placeholder="Enter general rate"
                      required
                      min="0.01"
                      step="0.01"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      id="general-rate-editable"
                      label="Is Editable"
                      name="generalRateEditable"
                      checked={form.generalRateEditable}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Charity</Form.Label>
                    <Form.Control
                      type="number"
                      name="generalRateCharity"
                      value={form.generalRateCharity}
                      onChange={handleInputChange}
                      placeholder="Enter charity amount"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      id="set-general-rate-all-companies"
                      label="Set general rate values for all companies"
                      name="setGeneralRateAllCompanies"
                      checked={form.setGeneralRateAllCompanies}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Rate (Private) <span style={{ color: "red" }}>*</span>
                    </Form.Label>
                    <Form.Control
                      type="number"
                      name="privateRate"
                      value={form.privateRate}
                      onChange={handleInputChange}
                      ref={privateRateRef}
                      placeholder="Enter private rate"
                      required
                      min="0.01"
                      step="0.01"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      id="private-rate-editable"
                      label="Is Editable"
                      name="privateRateEditable"
                      checked={form.privateRateEditable}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Charity</Form.Label>
                    <Form.Control
                      type="number"
                      name="privateRateCharity"
                      value={form.privateRateCharity}
                      onChange={handleInputChange}
                      placeholder="Enter charity amount"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      id="set-private-rate-all-companies"
                      label="Set private rate values for all companies"
                      name="setPrivateRateAllCompanies"
                      checked={form.setPrivateRateAllCompanies}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <div
              style={{
                marginBottom: "1.5rem",
                paddingBottom: "1rem",
                borderBottom: `2px solid ${themePrimary}`,
              }}
            >
              <h4 style={{ margin: 0, color: "#333", fontWeight: "600" }}>
                <Gear style={{ marginRight: "8px" }} /> Test Field Configuration
              </h4>
              <p
                style={{
                  margin: "0.5rem 0 0",
                  color: "#666",
                  fontSize: "14px",
                }}
              >
                Define the fields that will appear in test results (Max:{" "}
                {form.noOfFields} fields)
              </p>
            </div>
            {fields.length >= Number(form.noOfFields) &&
            editingFieldIndex === null ? (
              <Alert variant="info" className="text-center mb-4">
                <h5>
                  <i className="fas fa-check-circle me-2"></i>
                  Field Limit Reached
                </h5>
                <p className="mb-0">
                  You have added all {form.noOfFields} field
                  {Number(form.noOfFields) !== 1 ? "s" : ""} as specified in
                  Test Details.
                  {fields.length > 0 && (
                    <>
                      <br />
                      <strong className="mt-2 d-inline-block">
                        Click the <i className="fas fa-edit"></i> "Edit" button
                        on any field below to modify it.
                      </strong>
                    </>
                  )}
                </p>
              </Alert>
            ) : (
              <Card
                className="mb-3"
                style={{
                  padding: "1.5rem",
                  background:
                    "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                  borderRadius: "12px",
                  border: "1px solid #dee2e6",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              >
                <Form>
                  <div
                    style={{
                      background: "white",
                      padding: "1.25rem",
                      borderRadius: "8px",
                      marginBottom: "1rem",
                      border: "1px solid #dee2e6",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    }}
                  >
                    <h6
                      style={{
                        marginBottom: "1rem",
                        color: "#495057",
                        fontWeight: "600",
                      }}
                    >
                      <ClipboardCheck style={{ marginRight: "8px" }} /> Basic
                      Information
                    </h6>
                    <Row className="mb-3">
                      <Col md={4}>
                        <Form.Label
                          style={{ fontWeight: "500", fontSize: "14px" }}
                        >
                          Field Name <span style={{ color: "red" }}>*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="fieldName"
                          value={fieldForm.fieldName}
                          onChange={handleFieldInputChange}
                          placeholder="Enter field name"
                        />
                      </Col>
                      <Col md={4}>
                        <Form.Label
                          style={{ fontWeight: "500", fontSize: "14px" }}
                        >
                          Units
                          {[
                            "referenceRange",
                            "cutoffValue",
                            "intermediateValue",
                          ].includes(fieldForm.fieldType) && (
                            <span style={{ color: "red" }}> *</span>
                          )}
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="units"
                          value={fieldForm.units}
                          onChange={handleFieldInputChange}
                          placeholder="e.g., mg/dL, %"
                        />
                      </Col>
                      <Col md={4}>
                        <Form.Label
                          style={{
                            fontWeight: "500",
                            fontSize: "14px",
                            display: "block",
                            marginBottom: "0.5rem",
                          }}
                        >
                          Field Type <span style={{ color: "red" }}>*</span>
                        </Form.Label>
                        <div>
                          <Form.Check
                            inline
                            type="radio"
                            id="field-type-heading"
                            label="Heading"
                            name="fieldType"
                            value="heading"
                            checked={fieldForm.fieldType === "heading"}
                            onChange={handleFieldInputChange}
                          />
                          <Form.Check
                            inline
                            type="radio"
                            id="field-type-no-comparison"
                            label="No Comparison"
                            name="fieldType"
                            value="noComparison"
                            checked={fieldForm.fieldType === "noComparison"}
                            onChange={handleFieldInputChange}
                          />
                          <Form.Check
                            inline
                            type="radio"
                            id="field-type-ref-range"
                            label="Ref. Range"
                            name="fieldType"
                            value="referenceRange"
                            checked={fieldForm.fieldType === "referenceRange"}
                            onChange={handleFieldInputChange}
                          />
                          <Form.Check
                            inline
                            type="radio"
                            id="field-type-cutoff"
                            label="Cutoff"
                            name="fieldType"
                            value="cutoffValue"
                            checked={fieldForm.fieldType === "cutoffValue"}
                            onChange={handleFieldInputChange}
                          />
                          <Form.Check
                            inline
                            type="radio"
                            id="field-type-intermediate"
                            label="Intermediate"
                            name="fieldType"
                            value="intermediateValue"
                            checked={
                              fieldForm.fieldType === "intermediateValue"
                            }
                            onChange={handleFieldInputChange}
                          />
                        </div>
                      </Col>
                    </Row>
                    <Row className="mb-3">
                      <Col md={6}>
                        <Form.Label
                          style={{ fontWeight: "500", fontSize: "14px" }}
                        >
                          Machine
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="machine"
                          value={fieldForm.machine}
                          onChange={handleFieldInputChange}
                          placeholder="Enter machine name"
                        />
                      </Col>
                      <Col md={6}>
                        <Form.Label
                          style={{ fontWeight: "500", fontSize: "14px" }}
                        >
                          Method
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="method"
                          value={fieldForm.method}
                          onChange={handleFieldInputChange}
                          placeholder="Enter method"
                        />
                      </Col>
                    </Row>
                  </div>

                  {/* Dynamic Section based on Field Type */}
                  {fieldForm.fieldType !== "heading" && (
                    <div
                      style={{
                        background: "white",
                        padding: "1.5rem",
                        borderRadius: "8px",
                        border: "1px solid #dee2e6",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                      }}
                    >
                      <h6
                        style={{
                          marginBottom: "1rem",
                          color: "#495057",
                          fontWeight: "600",
                        }}
                      >
                        {fieldForm.fieldType === "noComparison" && (
                          <>
                            <FileText style={{ marginRight: "8px" }} /> No
                            Comparison Configuration
                          </>
                        )}
                        {fieldForm.fieldType === "referenceRange" && (
                          <>
                            <BarChartFill style={{ marginRight: "8px" }} />{" "}
                            Reference Range Configuration
                          </>
                        )}
                        {fieldForm.fieldType === "cutoffValue" && (
                          <>
                            <Bullseye style={{ marginRight: "8px" }} /> Cutoff
                            Value Configuration
                          </>
                        )}
                        {fieldForm.fieldType === "intermediateValue" && (
                          <>
                            <Sliders2 style={{ marginRight: "8px" }} />{" "}
                            Intermediate Value Configuration
                          </>
                        )}
                      </h6>
                      {fieldForm.fieldType === "noComparison" && (
                        <>
                          <div className="mb-3">
                            <Form.Check
                              inline
                              type="radio"
                              id="single-line"
                              label="Single Line"
                              name="singleLine"
                              checked={fieldForm.singleLine}
                              onChange={() =>
                                setFieldForm((f) => ({
                                  ...f,
                                  singleLine: true,
                                }))
                              }
                            />
                            <Form.Check
                              inline
                              type="radio"
                              id="multi-line"
                              label="Multi Line"
                              name="singleLine"
                              checked={!fieldForm.singleLine}
                              onChange={() =>
                                setFieldForm((f) => ({
                                  ...f,
                                  singleLine: false,
                                }))
                              }
                            />
                            <Form.Check
                              inline
                              type="checkbox"
                              id="add-note"
                              label="Add Note"
                              name="addNote"
                              checked={fieldForm.addNote}
                              onChange={handleFieldInputChange}
                            />
                          </div>
                          {fieldForm.addNote && (
                            <div className="mt-2 p-2 border rounded bg-light">
                              <h6>Add Note</h6>
                              <Form.Group className="mb-2">
                                <Form.Label>
                                  Note Text{" "}
                                  <span style={{ color: "red" }}>*</span>
                                </Form.Label>
                                <Form.Control
                                  as="textarea"
                                  name="note"
                                  value={subItemForm.note}
                                  onChange={handleSubItemChange}
                                />
                              </Form.Group>
                              {/* Age/Sex Inputs */}
                              <Row className="mb-2">
                                <Col md={3}>
                                  <Form.Label>
                                    Age From
                                    <span style={{ color: "red" }}>*</span>
                                  </Form.Label>
                                  <div className="d-flex">
                                    <Form.Control
                                      type="number"
                                      name="ageFrom"
                                      value={subItemForm.ageFrom}
                                      onChange={handleSubItemChange}
                                      disabled={subItemForm.sex === "Baby"}
                                    />
                                    <Form.Control
                                      as="select"
                                      name="ageFromUnit"
                                      value={subItemForm.ageFromUnit}
                                      onChange={handleSubItemChange}
                                      disabled={subItemForm.sex === "Baby"}
                                    >
                                      <option>Years</option>
                                      <option>Months</option>
                                      <option>Days</option>
                                      <option>Hours</option>
                                    </Form.Control>
                                  </div>
                                </Col>
                                <Col md={3}>
                                  <Form.Label>
                                    Age To
                                    <span style={{ color: "red" }}>*</span>
                                  </Form.Label>
                                  <div className="d-flex">
                                    <Form.Control
                                      type="number"
                                      name="ageTo"
                                      value={subItemForm.ageTo}
                                      onChange={handleSubItemChange}
                                      disabled={subItemForm.sex === "Baby"}
                                    />
                                    <Form.Control
                                      as="select"
                                      name="ageToUnit"
                                      value={subItemForm.ageToUnit}
                                      onChange={handleSubItemChange}
                                      disabled={subItemForm.sex === "Baby"}
                                    >
                                      <option>Years</option>
                                      <option>Months</option>
                                      <option>Days</option>
                                      <option>Hours</option>
                                    </Form.Control>
                                  </div>
                                </Col>
                                <Col md={3}>
                                  <Form.Label>Sex</Form.Label>
                                  <Form.Control
                                    as="select"
                                    name="sex"
                                    value={subItemForm.sex}
                                    onChange={handleSubItemChange}
                                  >
                                    <option value="Common">Common</option>
                                    <option value="M">Male</option>
                                    <option value="F">Female</option>
                                    <option value="Baby">Baby</option>
                                  </Form.Control>
                                </Col>
                                <Col md={3} className="d-flex align-items-end">
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={handleAddSubItem}
                                  >
                                    Add Note
                                  </Button>
                                </Col>
                              </Row>
                              {/* List of Notes */}
                              <Table size="sm" bordered className="mt-2">
                                <thead>
                                  <tr>
                                    <th>Note</th>
                                    <th>Age/Sex</th>
                                    <th>Action</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {subItems.map((item, idx) => (
                                    <tr key={idx}>
                                      <td>{item.note}</td>
                                      <td>
                                        {item.ageFrom} {item.ageFromUnit} -{" "}
                                        {item.ageTo} {item.ageToUnit} (
                                        {item.sex})
                                      </td>
                                      <td>
                                        <Button
                                          size="sm"
                                          variant="danger"
                                          onClick={() =>
                                            handleRemoveSubItem(idx)
                                          }
                                        >
                                          X
                                        </Button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </Table>
                            </div>
                          )}
                        </>
                      )}

                      {fieldForm.fieldType === "referenceRange" && (
                        <div className="mt-2 p-2 border rounded bg-light">
                          <h6>Add Reference Range</h6>
                          <Row className="mb-2">
                            <Col md={6}>
                              <Form.Label>
                                Range From{" "}
                                <span style={{ color: "red" }}>*</span>
                              </Form.Label>
                              <Form.Control
                                type="number"
                                name="referenceRangeFrom"
                                value={subItemForm.referenceRangeFrom}
                                onChange={handleSubItemChange}
                              />
                            </Col>
                            <Col md={6}>
                              <Form.Label>
                                Range To <span style={{ color: "red" }}>*</span>
                              </Form.Label>
                              <Form.Control
                                type="number"
                                name="referenceRangeTo"
                                value={subItemForm.referenceRangeTo}
                                onChange={handleSubItemChange}
                              />
                            </Col>
                          </Row>
                          {/* Age/Sex Inputs */}
                          <Row className="mb-2">
                            <Col md={3}>
                              <Form.Label>
                                Age From
                                <span style={{ color: "red" }}>*</span>
                              </Form.Label>
                              <div className="d-flex">
                                <Form.Control
                                  type="number"
                                  name="ageFrom"
                                  value={subItemForm.ageFrom}
                                  onChange={handleSubItemChange}
                                  disabled={subItemForm.sex === "Baby"}
                                />
                                <Form.Control
                                  as="select"
                                  name="ageFromUnit"
                                  value={subItemForm.ageFromUnit}
                                  onChange={handleSubItemChange}
                                  disabled={subItemForm.sex === "Baby"}
                                >
                                  <option>Years</option>
                                  <option>Months</option>
                                  <option>Days</option>
                                  <option>Hours</option>
                                </Form.Control>
                              </div>
                            </Col>
                            <Col md={3}>
                              <Form.Label>
                                Age To
                                <span style={{ color: "red" }}>*</span>
                              </Form.Label>
                              <div className="d-flex">
                                <Form.Control
                                  type="number"
                                  name="ageTo"
                                  value={subItemForm.ageTo}
                                  onChange={handleSubItemChange}
                                  disabled={subItemForm.sex === "Baby"}
                                />
                                <Form.Control
                                  as="select"
                                  name="ageToUnit"
                                  value={subItemForm.ageToUnit}
                                  onChange={handleSubItemChange}
                                  disabled={subItemForm.sex === "Baby"}
                                >
                                  <option>Years</option>
                                  <option>Months</option>
                                  <option>Days</option>
                                  <option>Hours</option>
                                </Form.Control>
                              </div>
                            </Col>
                            <Col md={3}>
                              <Form.Label>Sex</Form.Label>
                              <Form.Control
                                as="select"
                                name="sex"
                                value={subItemForm.sex}
                                onChange={handleSubItemChange}
                              >
                                <option value="Common">Common</option>
                                <option value="M">Male</option>
                                <option value="F">Female</option>
                                <option value="Baby">Baby</option>
                              </Form.Control>
                            </Col>
                            <Col md={3} className="d-flex align-items-end">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={handleAddSubItem}
                              >
                                Add Range
                              </Button>
                            </Col>
                          </Row>
                          <Table size="sm" bordered className="mt-2">
                            <thead>
                              <tr>
                                <th>Range</th>
                                <th>Age/Sex</th>
                                <th>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {subItems.map((item, idx) => (
                                <tr key={idx}>
                                  <td>
                                    {item.referenceRangeFrom} -{" "}
                                    {item.referenceRangeTo}
                                  </td>
                                  <td>
                                    {item.ageFrom} {item.ageFromUnit} -{" "}
                                    {item.ageTo} {item.ageToUnit} ({item.sex})
                                  </td>
                                  <td>
                                    <Button
                                      size="sm"
                                      variant="danger"
                                      onClick={() => handleRemoveSubItem(idx)}
                                    >
                                      X
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                      )}

                      {fieldForm.fieldType === "cutoffValue" && (
                        <div className="mt-2 p-2 border rounded bg-light">
                          <h6>Cutoff Configuration</h6>
                          <Row className="mb-2">
                            <Col md={6}>
                              <Form.Label>Greater Label</Form.Label>
                              <Form.Control
                                type="text"
                                name="cutoffGreaterLabel"
                                value={fieldSettings.cutoffGreaterLabel}
                                onChange={handleFieldSettingsChange}
                                readOnly
                              />
                            </Col>
                            <Col md={6}>
                              <Form.Label>Lower Label</Form.Label>
                              <Form.Control
                                type="text"
                                name="cutoffLowerLabel"
                                value={fieldSettings.cutoffLowerLabel}
                                onChange={handleFieldSettingsChange}
                                readOnly
                              />
                            </Col>
                          </Row>
                          <hr />
                          <h6>Add Cutoff Value</h6>
                          <Row className="mb-2">
                            <Col md={12}>
                              <Form.Label>
                                Cutoff Value{" "}
                                <span style={{ color: "red" }}>*</span>
                              </Form.Label>
                              <Form.Control
                                type="number"
                                name="cutoffValue"
                                value={subItemForm.cutoffValue}
                                onChange={handleSubItemChange}
                              />
                            </Col>
                          </Row>
                          {/* Age/Sex Inputs */}
                          <Row className="mb-2">
                            <Col md={3}>
                              <Form.Label>
                                Age From
                                <span style={{ color: "red" }}>*</span>
                              </Form.Label>
                              <div className="d-flex">
                                <Form.Control
                                  type="number"
                                  name="ageFrom"
                                  value={subItemForm.ageFrom}
                                  onChange={handleSubItemChange}
                                  disabled={subItemForm.sex === "Baby"}
                                />
                                <Form.Control
                                  as="select"
                                  name="ageFromUnit"
                                  value={subItemForm.ageFromUnit}
                                  onChange={handleSubItemChange}
                                  disabled={subItemForm.sex === "Baby"}
                                >
                                  <option>Years</option>
                                  <option>Months</option>
                                  <option>Days</option>
                                  <option>Hours</option>
                                </Form.Control>
                              </div>
                            </Col>
                            <Col md={3}>
                              <Form.Label>
                                Age To
                                <span style={{ color: "red" }}>*</span>
                              </Form.Label>
                              <div className="d-flex">
                                <Form.Control
                                  type="number"
                                  name="ageTo"
                                  value={subItemForm.ageTo}
                                  onChange={handleSubItemChange}
                                  disabled={subItemForm.sex === "Baby"}
                                />
                                <Form.Control
                                  as="select"
                                  name="ageToUnit"
                                  value={subItemForm.ageToUnit}
                                  onChange={handleSubItemChange}
                                  disabled={subItemForm.sex === "Baby"}
                                >
                                  <option>Years</option>
                                  <option>Months</option>
                                  <option>Days</option>
                                  <option>Hours</option>
                                </Form.Control>
                              </div>
                            </Col>
                            <Col md={3}>
                              <Form.Label>Sex</Form.Label>
                              <Form.Control
                                as="select"
                                name="sex"
                                value={subItemForm.sex}
                                onChange={handleSubItemChange}
                              >
                                <option value="Common">Common</option>
                                <option value="M">Male</option>
                                <option value="F">Female</option>
                                <option value="Baby">Baby</option>
                              </Form.Control>
                            </Col>
                            <Col md={3} className="d-flex align-items-end">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={handleAddSubItem}
                              >
                                Add Cutoff
                              </Button>
                            </Col>
                          </Row>
                          <Table size="sm" bordered className="mt-2">
                            <thead>
                              <tr>
                                <th>Value</th>
                                <th>Age/Sex</th>
                                <th>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {subItems.map((item, idx) => (
                                <tr key={idx}>
                                  <td>{item.cutoffValue}</td>
                                  <td>
                                    {item.ageFrom} {item.ageFromUnit} -{" "}
                                    {item.ageTo} {item.ageToUnit} ({item.sex})
                                  </td>
                                  <td>
                                    <Button
                                      size="sm"
                                      variant="danger"
                                      onClick={() => handleRemoveSubItem(idx)}
                                    >
                                      X
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                      )}

                      {fieldForm.fieldType === "intermediateValue" && (
                        <div className="mt-2 p-2 border rounded bg-light">
                          <h6>Intermediate Configuration</h6>
                          <Row className="mb-2">
                            <Col md={4}>
                              <Form.Label>Greater Label</Form.Label>
                              <Form.Control
                                type="text"
                                name="intermediateGreaterLabel"
                                value={fieldSettings.intermediateGreaterLabel}
                                onChange={handleFieldSettingsChange}
                                readOnly
                              />
                            </Col>
                            <Col md={4}>
                              <Form.Label>Lower Label</Form.Label>
                              <Form.Control
                                type="text"
                                name="intermediateLowerLabel"
                                value={fieldSettings.intermediateLowerLabel}
                                onChange={handleFieldSettingsChange}
                                readOnly
                              />
                            </Col>
                            <Col md={4}>
                              <Form.Label>Intermediate Label</Form.Label>
                              <Form.Control
                                type="text"
                                name="intermediateLabel"
                                value={fieldSettings.intermediateLabel}
                                onChange={handleFieldSettingsChange}
                                readOnly
                              />
                            </Col>
                          </Row>
                          <hr />
                          <h6>Add Intermediate Range</h6>
                          <Row className="mb-2">
                            <Col md={6}>
                              <Form.Label>
                                From <span style={{ color: "red" }}>*</span>
                              </Form.Label>
                              <Form.Control
                                type="number"
                                name="intermediateValueFrom"
                                value={subItemForm.intermediateValueFrom}
                                onChange={handleSubItemChange}
                              />
                            </Col>
                            <Col md={6}>
                              <Form.Label>
                                To <span style={{ color: "red" }}>*</span>
                              </Form.Label>
                              <Form.Control
                                type="number"
                                name="intermediateValueTo"
                                value={subItemForm.intermediateValueTo}
                                onChange={handleSubItemChange}
                              />
                            </Col>
                          </Row>
                          {/* Age/Sex Inputs */}
                          <Row className="mb-2">
                            <Col md={3}>
                              <Form.Label>
                                Age From
                                <span style={{ color: "red" }}>*</span>
                              </Form.Label>
                              <div className="d-flex">
                                <Form.Control
                                  type="number"
                                  name="ageFrom"
                                  value={subItemForm.ageFrom}
                                  onChange={handleSubItemChange}
                                  disabled={subItemForm.sex === "Baby"}
                                />
                                <Form.Control
                                  as="select"
                                  name="ageFromUnit"
                                  value={subItemForm.ageFromUnit}
                                  onChange={handleSubItemChange}
                                  disabled={subItemForm.sex === "Baby"}
                                >
                                  <option>Years</option>
                                  <option>Months</option>
                                  <option>Days</option>
                                  <option>Hours</option>
                                </Form.Control>
                              </div>
                            </Col>
                            <Col md={3}>
                              <Form.Label>
                                Age To
                                <span style={{ color: "red" }}>*</span>
                              </Form.Label>
                              <div className="d-flex">
                                <Form.Control
                                  type="number"
                                  name="ageTo"
                                  value={subItemForm.ageTo}
                                  onChange={handleSubItemChange}
                                  disabled={subItemForm.sex === "Baby"}
                                />
                                <Form.Control
                                  as="select"
                                  name="ageToUnit"
                                  value={subItemForm.ageToUnit}
                                  onChange={handleSubItemChange}
                                  disabled={subItemForm.sex === "Baby"}
                                >
                                  <option>Years</option>
                                  <option>Months</option>
                                  <option>Days</option>
                                  <option>Hours</option>
                                </Form.Control>
                              </div>
                            </Col>
                            <Col md={3}>
                              <Form.Label>Sex</Form.Label>
                              <Form.Control
                                as="select"
                                name="sex"
                                value={subItemForm.sex}
                                onChange={handleSubItemChange}
                              >
                                <option value="Common">Common</option>
                                <option value="M">Male</option>
                                <option value="F">Female</option>
                                <option value="Baby">Baby</option>
                              </Form.Control>
                            </Col>
                            <Col md={3} className="d-flex align-items-end">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={handleAddSubItem}
                              >
                                Add Intermediate
                              </Button>
                            </Col>
                          </Row>
                          <Table size="sm" bordered className="mt-2">
                            <thead>
                              <tr>
                                <th>Range</th>
                                <th>Age/Sex</th>
                                <th>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {subItems.map((item, idx) => (
                                <tr key={idx}>
                                  <td>
                                    {item.intermediateValueFrom} -{" "}
                                    {item.intermediateValueTo}
                                  </td>
                                  <td>
                                    {item.ageFrom} {item.ageFromUnit} -{" "}
                                    {item.ageTo} {item.ageToUnit} ({item.sex})
                                  </td>
                                  <td>
                                    <Button
                                      size="sm"
                                      variant="danger"
                                      onClick={() => handleRemoveSubItem(idx)}
                                    >
                                      X
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                      )}
                    </div>
                  )}

                  <div
                    className="d-flex justify-content-center mt-3"
                    style={{
                      paddingTop: "1.5rem",
                      borderTop: "1px solid #dee2e6",
                    }}
                  >
                    <Button
                      variant={
                        editingFieldIndex !== null ? "warning" : "success"
                      }
                      size="lg"
                      onClick={handleAddField}
                      className="me-2"
                      style={{
                        minWidth: "180px",
                        fontWeight: "600",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      }}
                    >
                      {editingFieldIndex !== null ? (
                        <>
                          <PencilSquare /> Update Field
                        </>
                      ) : (
                        <>
                          <PlusCircle /> Add Field
                        </>
                      )}
                    </Button>
                    {editingFieldIndex !== null && (
                      <Button
                        variant="outline-secondary"
                        size="lg"
                        onClick={handleCancelFieldEdit}
                        style={{ minWidth: "140px", fontWeight: "500" }}
                      >
                        <XCircle /> Cancel
                      </Button>
                    )}
                  </div>
                </Form>
              </Card>
            )}

            <div
              style={{
                marginTop: "2rem",
                paddingTop: "1.5rem",
                borderTop: `3px solid ${themePrimary}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <h5 style={{ margin: 0, color: "#333", fontWeight: "600" }}>
                  <ClipboardCheck style={{ marginRight: "8px" }} /> Added Fields
                  ({fields.length})
                </h5>
                {fields.length > 0 && (
                  <span
                    style={{
                      fontSize: "14px",
                      color: "#666",
                      background: "#e7f3ff",
                      padding: "4px 12px",
                      borderRadius: "12px",
                    }}
                  >
                    {fields.length} field{fields.length !== 1 ? "s" : ""}{" "}
                    configured
                  </span>
                )}
              </div>
              <Table
                bordered
                hover
                size="sm"
                style={{
                  boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Field Name</th>
                    <th>Type</th>
                    <th>Units</th>
                    <th>Details</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {fields.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center">
                        No fields added yet
                      </td>
                    </tr>
                  ) : (
                    fields.map((f, idx) => (
                      <tr
                        key={idx}
                        style={{
                          backgroundColor:
                            editingFieldIndex === idx
                              ? "#fff3cd"
                              : "transparent",
                        }}
                      >
                        <td>{idx + 1}</td>
                        <td>{f.fieldName}</td>
                        <td>{f.fieldType}</td>
                        <td>{f.units}</td>
                        <td>
                          {f.fieldType === "heading" && "Heading"}
                          {f.fieldType === "noComparison" &&
                            `${f.singleLine ? "Single" : "Multi"} Line, ${
                              f.subItems?.length || 0
                            } Notes`}
                          {f.fieldType === "referenceRange" &&
                            `${f.subItems?.length || 0} Ranges`}
                          {f.fieldType === "cutoffValue" &&
                            `${f.subItems?.length || 0} Cutoffs`}
                          {f.fieldType === "intermediateValue" &&
                            `${f.subItems?.length || 0} Intermediates`}
                        </td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-1"
                            onClick={() => handleEditField(idx)}
                            disabled={editingFieldIndex === idx}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteField(idx)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      setCurrentStep(currentStep + 1);
    }
  };
  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleAddOrUpdate = async () => {
    if (!form.department.trim()) {
      showValidationError("Please select a department.");
      setCurrentStep(0);
      setTimeout(() => departmentRef.current?.focus(), 100);
      return;
    }
    if (!form.testName.trim()) {
      showValidationError("Test name is required.");
      setCurrentStep(1);
      setTimeout(() => testNameRef.current?.focus(), 100);
      return;
    }
    if (!form.testCode.trim()) {
      showValidationError("Test code is required.");
      setCurrentStep(1);
      setTimeout(() => testCodeRef.current?.focus(), 100);
      return;
    }
    if (!form.specimenName.trim()) {
      showValidationError("Specimen name is required.");
      setCurrentStep(1);
      setTimeout(() => specimenNameRef.current?.focus(), 100);
      return;
    }
    if (form.generalRate <= 0) {
      showValidationError(
        "General rate is required and must be greater than 0."
      );
      setCurrentStep(2);
      setTimeout(() => generalRateRef.current?.focus(), 100);
      return;
    }
    if (form.privateRate <= 0) {
      showValidationError(
        "Private rate is required and must be greater than 0."
      );
      setCurrentStep(2);
      setTimeout(() => privateRateRef.current?.focus(), 100);
      return;
    }
    if (fields.length !== Number(form.noOfFields)) {
      showValidationError(
        `Please configure exactly ${form.noOfFields} field${
          Number(form.noOfFields) !== 1 ? "s" : ""
        }. Currently configured: ${fields.length}`
      );
      setCurrentStep(3);
      return;
    }

    setLoading(true);

    try {
      // Transform form data to API payload
      const payload = {
        deptId: Number(form.department),
        name: form.testName,
        testCode: form.testCode,
        specId: Number(form.specimenName),
        rate: form.generalRate,
        testHrs: Number(form.timeRequiredH),
        testMin: Number(form.timeRequiredM),
        methodology: form.methodology,
        charity: form.generalRateCharity,
        privateRate: form.privateRate,
        privateCharity: form.privateRateCharity,
        uid: loginData.id || 0,
        isCulture: form.isCulture ? 1 : 0,
        canDoManual: form.manual ? 1 : 0,
        canDoSemi: form.semiAutomatic ? 1 : 0,
        canDoAuto: form.fullyAutomatic ? 1 : 0,
        comment: form.commentAdded ? 1 : 0,
        picture: form.pictureInserted ? 1 : 0,
        printIndividual: form.printIndividually ? 1 : 0,
        isEditable: form.generalRateEditable ? 1 : 0,
        isEditPrivate: form.privateRateEditable ? 1 : 0,
        setGeneral: form.setGeneralRateAllCompanies ? 1 : 0,
        setPrivate: form.setPrivateRateAllCompanies ? 1 : 0,
        generalRate: form.generalRate,
        generalCharity: form.generalRateCharity,
        isOutside: form.outSideTest ? 1 : 0,
        isMaterial: form.isMaterial ? 1 : 0,
        fields: fields.map((field) => {

          return {
            fieldName: field.fieldName,
            fieldType: field.fieldType,
            unit: field.units || "",
            testMethod: field.method || "",
            machine: field.machine || "",
            normal: field.fieldType === "referenceRange" ? 1 : 0,
            cutoff: field.fieldType === "cutoffValue" ? 1 : 0,
            cutoffGreater: fieldSettings.cutoffGreaterLabel || "",
            cutoffLower: fieldSettings.cutoffLowerLabel || "",
            intervalFlag: field.fieldType === "intermediateValue" ? 1 : 0,
            interHigher: fieldSettings.intermediateGreaterLabel || "",
            interInter: fieldSettings.intermediateLabel || "",
            interLower: fieldSettings.intermediateLowerLabel || "",
            lineType: field.singleLine ? 1 : 2,
            isNote: field.addNote ? 1 : 0,
            values: (field.subItems || []).map((subItem: any) => ({
              lowerBounds: 
                Number(subItem.referenceRangeFrom) || 0,
              upperBounds: 
                Number(subItem.referenceRangeTo) || 0,
              cutoffVal: 
                Number(subItem.cutoffValue) || 0,
              rangeFrom:
                Number(subItem.intermediateValueFrom) || 0,
              rangeTo:
                Number(subItem.intermediateValueTo) || 0,
              note: subItem.note || "",
              fieldType: field.fieldType,
              fromAge: Number(subItem.ageFrom) || 0,
              fromAgeType: subItem.ageFromUnit || "Hours",
              toAge: Number(subItem.ageTo) || 0,
              toAgeType: subItem.ageToUnit || "Years",
              sex: subItem.sex || "Common",
            })),
          };
        }),
      };

      if (editingId !== null) {
        // Update existing test
        await laboratoryApiService.updateLabTestAdd(editingId, payload);

        showSuccessToast("Test updated successfully!");
      } else {
        // Save new test
        await laboratoryApiService.saveLabTestAdd(payload);
        // console.log("Payload to be sent to API:", payload);
        showSuccessToast("Test added successfully!");
      }

      // Reset form
      setForm({
        department: "",
        testName: "",
        testCode: "",
        specimenName: "",
        methodology: "",
        timeRequiredH: "1",
        timeRequiredM: "0",
        noOfFields: 1,
        commentAdded: false,
        printIndividually: false,
        pictureInserted: false,
        isCulture: false,
        reference: false,
        outSideTest: false,
        isMaterial: false,
        manual: true,
        semiAutomatic: true,
        fullyAutomatic: true,
        generalRate: 0,
        generalRateEditable: false,
        generalRateCharity: 0,
        privateRate: 0,
        privateRateEditable: false,
        privateRateCharity: 0,
        companyRates: {},
        setGeneralRateAllCompanies: true,
        setPrivateRateAllCompanies: false,
      });
      setFields([]);
      setEditingId(null);
      setCurrentStep(0);
      setCompletedSteps([]);

      // Refresh test list
      fetchTests();
    } catch (error: any) {
      console.error("Error saving test:", error);
      handleError(dispatch, error);
      showErrorToast(
        error?.response?.data?.error || "Failed to save test. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: number) => {
    const test = labTests.find((t) => t.id === id);
    if (!test) return;

    // Populate form with complete test data
    setForm({
      department: String(test.deptId),
      testName: test.name,
      testCode: test.testCode,
      specimenName: String(test.specId),
      methodology: test.methodology,
      timeRequiredH: String(test.testHrs),
      timeRequiredM: String(test.testMin),
      noOfFields: test.fields?.length || 1,
      commentAdded: test.comment === 1,
      printIndividually: test.printIndividual === 1,
      pictureInserted: test.picture === 1,
      isCulture: test.isCulture === 1,
      reference: false,
      outSideTest: test.isOutside === 1,
      isMaterial: test.isMaterial === 1,
      manual: test.canDoManual === 1,
      semiAutomatic: test.canDoSemi === 1,
      fullyAutomatic: test.canDoAuto === 1,
      generalRate: test.rate,
      generalRateEditable: test.isEditable === 1,
      generalRateCharity: test.charity,
      privateRate: test.privateRate,
      privateRateEditable: test.isEditPrivate === 1,
      privateRateCharity: test.privateCharity,
      companyRates: {},
      setGeneralRateAllCompanies: true,
      setPrivateRateAllCompanies: false,
    });

    // Transform API fields to component format
    const transformedFields = (test.fields || []).map((field) => ({
      fieldName: field.fieldName,
      fieldType: field.fieldType,
      units: field.unit,
      machine: field.machine,
      method: field.testMethod,
      singleLine: field.lineType === 1,
      addNote: field.isNote === 1,
      settings: {
        cutoffGreaterLabel: field.cutoffGreater || "Positive",
        cutoffLowerLabel: field.cutoffLower || "Negative",
        intermediateGreaterLabel: field.interHigher || "Positive",
        intermediateLowerLabel: field.interLower || "Negative",
        intermediateLabel: field.interInter || "Intermediate",
      },
      subItems: (field.values || []).map((val) => ({
        ageFrom: String(val.fromAge),
        ageFromUnit: val.fromAgeType,
        ageTo: String(val.toAge),
        ageToUnit: val.toAgeType,
        sex: val.sex,
        note: val.note || "",
        referenceRangeFrom: val.rangeFrom > 0 ? String(val.rangeFrom) : "",
        referenceRangeTo: val.rangeTo > 0 ? String(val.rangeTo) : "",
        cutoffValue: val.cutoffVal > 0 ? String(val.cutoffVal) : "",
        intermediateValueFrom:
          val.rangeFrom > 0 && field.intervalFlag === 1
            ? String(val.rangeFrom)
            : "",
        intermediateValueTo:
          val.rangeTo > 0 && field.intervalFlag === 1
            ? String(val.rangeTo)
            : "",
      })),
    }));

    setFields(transformedFields);
    setEditingId(id);
    setCurrentStep(0);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({
      department: "",
      testName: "",
      testCode: "",
      specimenName: "",
      methodology: "",
      timeRequiredH: "1",
      timeRequiredM: "0",
      noOfFields: 1,
      commentAdded: false,
      printIndividually: false,
      pictureInserted: false,
      isCulture: false,
      reference: false,
      outSideTest: false,
      isMaterial: false,
      manual: false,
      semiAutomatic: false,
      fullyAutomatic: false,
      generalRate: 0,
      generalRateEditable: false,
      generalRateCharity: 0,
      privateRate: 0,
      privateRateEditable: false,
      privateRateCharity: 0,
      companyRates: {},
      setGeneralRateAllCompanies: false,
      setPrivateRateAllCompanies: false,
    });
    // Clear fields and field-related state
    setFields([]);
    setEditingFieldIndex(null);
    setFieldForm({
      fieldName: "",
      fieldType: "heading",
      units: "",
      machine: "",
      method: "",
      singleLine: true,
      addNote: false,
    });
    setSubItems([]);
    setSubItemForm({
      ageFrom: "",
      ageFromUnit: "Hours",
      ageTo: "",
      ageToUnit: "Years",
      sex: "Common",
      note: "",
      referenceRangeFrom: "",
      referenceRangeTo: "",
      cutoffValue: "",
      intermediateValueFrom: "",
      intermediateValueTo: "",
    });
    setFieldSettings({
      cutoffGreaterLabel: "Positive",
      cutoffLowerLabel: "Negative",
      intermediateGreaterLabel: "Positive",
      intermediateLowerLabel: "Negative",
      intermediateLabel: "Intermediate",
    });
    setCurrentStep(0);
    setCompletedSteps([]);
  };

  const handleBlock = async (id: number) => {
    const result = await showConfirmDialog(
      "Block this test?",
      "Confirm",
      "Block",
      "Cancel"
    );
    if (!result.isConfirmed) return;
    try {
      setLoading(true);
      await laboratoryApiService.blockLabTest(id, { id });
      showSuccessToast("Test blocked successfully");
      fetchTests();
    } catch (error: any) {
      console.error("Error blocking test:", error);
      showErrorToast("Failed to block test");
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (id: number) => {
    try {
      setLoading(true);
      await laboratoryApiService.unBlockLabTest(id, { id });
      showSuccessToast("Test unblocked successfully");
      fetchTests();
    } catch (error: any) {
      console.error("Error unblocking test:", error);
      showErrorToast("Failed to unblock test");
    } finally {
      setLoading(false);
    }
  };

  const activeTests = labTests.filter((t) => t.blocked === 0);
  const blockedTests = labTests.filter((t) => t.blocked === 1);

  // Search functionality for active tests
  const {
    filteredData: filteredActiveTests,
    searchTerm: activeSearchTerm,
    setSearchTerm: setActiveSearchTerm,
    resultCount: activeResultCount,
    totalCount: activeTotalCount,
  } = useTableSearch({
    data: activeTests,
    searchFields: ["name", "deptName"],
  });

  // Search functionality for blocked tests
  const {
    filteredData: filteredBlockedTests,
    searchTerm: blockedSearchTerm,
    setSearchTerm: setBlockedSearchTerm,
    resultCount: blockedResultCount,
    totalCount: blockedTotalCount,
  } = useTableSearch({
    data: blockedTests,
    searchFields: ["name", "deptName"],
  });

  return (
    <>
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", minHeight: 0, overflow: "hidden", color: themePrimary }}>
      <PageHeader icon={faPlus} title={editingId ? "Edit Lab Test Master" : "Add Lab Test Master"} subtitle="" /> 
      <div className="content-body" style={{ display: "flex", flex: 1, minHeight: 0, gap: "1rem", overflowX: "hidden", overflowY: "auto" }}>
        {/* Left: Stepper Form */}
        <div style={{ display: "flex", flex: "0 0 58%", minWidth: 0, flexDirection: "column" }}>
          <Card
            className="shadow-sm"
            style={{
              padding: "2rem",
              borderRadius: "10px",
              display: "flex",
              flexDirection: "column",
              height: "100%",
              minHeight: 0,
            }}
          >
                {/* Progress Stepper */}
                <div
                  className="mb-4"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    position: "relative",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "20px",
                      left: "0",
                      right: "0",
                      height: "2px",
                      background: themeSecondary,
                      zIndex: 0,
                      border: `1px solid ${themePrimary}`,
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        background: themePrimary,
                        width: `${(currentStep / (steps.length - 1)) * 100}%`,
                        transition: "width 0.3s",
                      }}
                    />
                  </div>
                  {steps.map((step, idx) => (
                    <div
                      key={step}
                      style={{
                        flex: 1,
                        textAlign: "center",
                        cursor: "pointer",
                        zIndex: 1,
                      }}
                      onClick={() => setCurrentStep(idx)}
                    >
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          background: completedSteps.includes(idx)
                            ? themePrimary
                            : currentStep === idx
                            ? themePrimary
                            : themeSecondary,
                          color:
                            currentStep === idx || completedSteps.includes(idx)
                              ? themeSecondary
                              : themePrimary,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto 8px",
                          fontWeight: "bold",
                          fontSize: "16px",
                          border:
                            currentStep === idx ? `3px solid ${themePrimary}` : "none",
                          boxShadow:
                            currentStep === idx
                              ? `0 0 0 4px ${themeSecondary}`
                              : "none",
                          transition: "all 0.3s",
                        }}
                      >
                        {completedSteps.includes(idx) ? (
                          <CheckCircle />
                        ) : (
                          idx + 1
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: currentStep === idx ? "bold" : "normal",
                          color: currentStep === idx ? themePrimary : themePrimary,
                        }}
                      >
                        {step}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Scrollable Form Content */}
                <div style={{ flex: 1, minHeight: 0, overflowY: "auto", paddingRight: "8px" }}>
                  <Form>
                    {renderStep()}
                  </Form>
                </div>
                {/* Fixed Navigation Buttons */}
                <div
                  className="d-flex justify-content-between mt-4"
                  style={{
                    paddingTop: "1.5rem",
                    borderTop: `2px solid ${themePrimary}`,
                    flexShrink: 0,
                  }}
                >
                  <Button
                    className="theme-outline-btn-primary"
                    size="sm"
                    onClick={handlePrev}
                    disabled={currentStep === 0}
                    style={{ minWidth: "120px", fontWeight: "500" }}
                  >
                    <ChevronLeft /> Previous
                  </Button>
                  {currentStep < steps.length - 1 ? (
                    <Button
                      className="theme-btn-primary"
                      size="sm"
                      onClick={handleNext}
                      style={{ minWidth: "120px", fontWeight: "500" }}
                    >
                      Next <ChevronRight />
                    </Button>
                  ) : (
                    <>
                      <Button
                        className="theme-btn-primary"
                        size="sm"
                        onClick={handleAddOrUpdate}
                        disabled={loading}
                        style={{
                          marginRight: "10px",
                          minWidth: "150px",
                          fontWeight: "600",
                          fontSize: "16px",
                        }}
                      >
                        {loading ? (
                          <>
                            <Clock /> Saving...
                          </>
                        ) : editingId ? (
                          <>
                            <PencilSquare /> Update Test
                          </>
                        ) : (
                          <>
                            <CheckCircle /> Add Test
                          </>
                        )}
                      </Button>
                      {editingId && (
                        <Button
                          className="theme-outline-btn-primary"
                          size="sm"
                          onClick={handleCancelEdit}
                          disabled={loading}
                          style={{ minWidth: "100px" }}
                        >
                          Cancel
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </Card>
            </div>
            {/* Right: List */}
            <div style={{ display: "flex", flex: "0 0 42%", minWidth: 0, flexDirection: "column" }}>
              <Card
                className="shadow-sm"
                style={{
                  borderRadius: "12px",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  minHeight: 0,
                }}
              >
                {/* Header */}
                <div
                  style={{
                    padding: "1.25rem 1.5rem",
                    backgroundColor: themePrimary,
                    color: themeSecondary,
                    borderTopLeftRadius: "12px",
                    borderTopRightRadius: "12px",
                    flexShrink: 0,
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex align-items-center gap-2">
                      {showBlocked ? (
                        <ShieldX size={22} color={themeSecondary} />
                      ) : (
                        <ListCheck size={22} color={themeSecondary} />
                      )}
                      <h5 className="mb-0" style={{ fontWeight: "600" }}>
                        {showBlocked ? "Blocked Tests" : "Active Tests"}
                      </h5>
                      <span
                        className="badge theme-badge-secondary"
                        style={{
                          fontSize: "11px",
                          padding: "4px 8px",
                        }}
                      >
                        {showBlocked
                          ? filteredBlockedTests.length
                          : filteredActiveTests.length}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowBlocked(!showBlocked)}
                      className={showBlocked ? "theme-btn-secondary is-selected" : "theme-outline-btn-primary"}
                      style={{
                        borderRadius: "20px",
                        padding: "6px 16px",
                        fontWeight: "500",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "0.875rem",
                        lineHeight: 1.5,
                        cursor: "pointer",
                        border: "1px solid",
                      }}
                    >
                      <ArrowRepeat size={16} />
                      {showBlocked ? "Show Active" : "Show Blocked"}
                    </button>
                  </div>

                  {/* Search Input */}
                  <SearchInput
                    searchTerm={
                      showBlocked ? blockedSearchTerm : activeSearchTerm
                    }
                    onSearchChange={
                      showBlocked ? setBlockedSearchTerm : setActiveSearchTerm
                    }
                    placeholder={`Search tests by name or department...`}
                    resultCount={
                      showBlocked ? blockedResultCount : activeResultCount
                    }
                    totalCount={
                      showBlocked ? blockedTotalCount : activeTotalCount
                    }
                    showResultCount={true}
                  />
                </div>

                {/* Scrollable Table Content */}
                <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
                  <Table striped bordered hover>
                    <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      <tr>
                        <th>#</th>
                        <th>Test Name</th>
                        <th>Department</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(showBlocked
                        ? filteredBlockedTests
                        : filteredActiveTests
                      ).length === 0 ? (
                        <tr>
                          <td colSpan={4} style={{ textAlign: "center" }}>
                            {showBlocked
                              ? blockedSearchTerm
                                ? "No blocked tests match your search."
                                : "No blocked tests."
                              : activeSearchTerm
                              ? "No active tests match your search."
                              : "No active tests."}
                          </td>
                        </tr>
                      ) : (
                        (showBlocked
                          ? filteredBlockedTests
                          : filteredActiveTests
                        ).map((t, idx) => (
                          <tr
                            key={t.id}
                            style={{
                              backgroundColor:
                                editingId === t.id ? "#fff3cd" : "transparent",
                              color: themePrimary,
                              fontWeight: editingId === t.id ? "600" : "normal",
                              borderLeft:
                                editingId === t.id
                                  ? `4px solid ${themePrimary}`
                                  : "none",
                            }}
                          >
                            <td>{idx + 1}</td>
                            <td>
                              {t.name}
                              {editingId === t.id && (
                                <span className="ms-2 badge theme-badge-primary">
                                  <i className="fas fa-edit me-1"></i>
                                  Editing
                                </span>
                              )}
                            </td>
                            <td>{t.deptName}</td>
                            <td>
                              {showBlocked ? (
                                <Button
                                  className="theme-outline-btn-primary"
                                  size="sm"
                                  onClick={() => handleUnblock(t.id)}
                                >
                                  Unblock
                                </Button>
                              ) : (
                                <>
                                  {editingId !== t.id ? (
                                    <>
                                      {t.isMaterial !== 1 && (
                                        <Button
                                          className="theme-outline-btn-primary me-2"
                                          size="sm"
                                          onClick={() => handleEdit(t.id)}
                                          disabled={loading}
                                        >
                                          Edit
                                        </Button>
                                      )}
                                      <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => handleBlock(t.id)}
                                      >
                                        Block
                                      </Button>
                                    </>
                                  ) : (
                                    <span className="fst-italic" style={{ color: themePrimary }}>
                                      Currently editing...
                                    </span>
                                  )}
                                </>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddTest;
function setSuccess(arg0: string): void {
  throw new Error("Function not implemented.");
}





