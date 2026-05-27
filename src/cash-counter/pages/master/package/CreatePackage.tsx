import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Badge, Button, Card, Container, Form, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Typeahead } from 'react-bootstrap-typeahead';
import {
  faBoxesPacking,
  faFlask,
  faPills,
  faRotateLeft,
  faSave,
  faStethoscope,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import PageHeader from '../../../../components/PageHeader';
import CashCounterApiService from '../../../../api/cash-counter/cash-counter-api-service';
import { PharmacyStoresApiService, SubModuleResponse } from '../../../../api/pharmacy-stores/pharmacy-stores-api-service';
import { showErrorToast, showSuccessToast, showWarningToast } from '../../../../utils/alertUtil';

require('react-bootstrap-typeahead/css/Typeahead.css');

type PackageTabKey = 'procedure' | 'pharmacy' | 'lab';

interface ProcedureItem {
  id: number;
  groupName: string;
  procedureName: string;
  unit: number;
  rate: number;
  total: number;
  groupId: number;
  particularId: number;
}

interface PharmacyItem {
  id: number;
  genericName: string;
  medicineName: string;
  unit: number;
  rate: number;
  total: number;
  prodsId: number;
  batchId: number;
  storeId: number;
}

interface LabItem {
  id: number;
  deptName: string;
  testName: string;
  unit: number;
  rate: number;
  total: number;
  testId: number;
  deptId: number;
}

const tabConfig: Array<{
  key: PackageTabKey;
  label: string;
  icon: typeof faStethoscope;
}> = [
  { key: 'procedure', label: 'Procedure', icon: faStethoscope },
  { key: 'pharmacy', label: 'Pharmacy', icon: faPills },
  { key: 'lab', label: 'Lab', icon: faFlask },
];

const CreatePackage: React.FC = () => {
  const [packageName, setPackageName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<PackageTabKey>('procedure');
  const [isOpPackage, setIsOpPackage] = useState(true);

  // Typeahead refs for focus-after-add
  const procedureTypeaheadRef = useRef<any>(null);
  const medicineTypeaheadRef = useRef<any>(null);
  const labTypeaheadRef = useRef<any>(null);

  // API Services
  const cashCounterApi = new CashCounterApiService();
  const pharmacyStoresApi = new PharmacyStoresApiService();

  // Procedure state
  const [procedureItems, setProcedureItems] = useState<ProcedureItem[]>([]);
  const [procedureSearch, setProcedureSearch] = useState('');
  const [procedureSuggestions, setProcedureSuggestions] = useState<any[]>([]);
  const [selectedProcedure, setSelectedProcedure] = useState<any[]>([]);
  const [selectedProcedureIndex, setSelectedProcedureIndex] = useState(-1);
  const [procedureForm, setProcedureForm] = useState({ groupName: '', procedureName: '', unit: 1, rate: 0, groupId: 0, particularId: 0 });
  const procedureSearchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestProcedureSearchRef = useRef('');

  // Pharmacy stores list
  const [pharmacyStores, setPharmacyStores] = useState<SubModuleResponse[]>([]);
  const [selectedPharmacyStoreId, setSelectedPharmacyStoreId] = useState<number>(0);

  // Pharmacy state
  const [pharmacyItems, setPharmacyItems] = useState<PharmacyItem[]>([]);
  const [medicineSearch, setMedicineSearch] = useState('');
  const [medicineSuggestions, setMedicineSuggestions] = useState<any[]>([]);
  const [selectedMedicine, setSelectedMedicine] = useState<any[]>([]);
  const [selectedMedicineIndex, setSelectedMedicineIndex] = useState(-1);
  const [pharmacyForm, setPharmacyForm] = useState({ genericName: '', medicineName: '', unit: 1, rate: 0, prodsId: 0, batchId: 0, storeId: 1 });
  const medicineSearchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestMedicineSearchRef = useRef('');

  // Lab state
  useEffect(() => {
    pharmacyStoresApi.getSubModules(3).then((stores) => {
      const sortedStores = [...stores].sort((a, b) => Number(a.masterId) - Number(b.masterId));
      const uniqueStores = sortedStores.filter(
        (store, index, arr) => index === arr.findIndex((s) => s.masterId === store.masterId)
      );

      setPharmacyStores(uniqueStores);
      if (uniqueStores.length > 0) {
        setSelectedPharmacyStoreId(uniqueStores[0].masterId);
      }
    }).catch(() => {
      showErrorToast('Failed to load pharmacy stores');
    });
  }, []);

  const [labItems, setLabItems] = useState<LabItem[]>([]);
  const [testSearch, setTestSearch] = useState('');
  const [testSuggestions, setTestSuggestions] = useState<any[]>([]);
  const [selectedTest, setSelectedTest] = useState<any[]>([]);
  const [selectedTestIndex, setSelectedTestIndex] = useState(-1);
  const [labForm, setLabForm] = useState({ deptName: '', testName: '', unit: 1, rate: 0, testId: 0, deptId: 0 });
  const labSearchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestLabSearchRef = useRef('');

  useEffect(() => {
    return () => {
      if (procedureSearchDebounceRef.current) {
        clearTimeout(procedureSearchDebounceRef.current);
      }
      if (medicineSearchDebounceRef.current) {
        clearTimeout(medicineSearchDebounceRef.current);
      }
      if (labSearchDebounceRef.current) {
        clearTimeout(labSearchDebounceRef.current);
      }
    };
  }, []);

  // Procedure search
  const handleProcedureSearch = (value: string) => {
    setProcedureSearch(value);
    setProcedureForm((prev) => ({ ...prev, procedureName: value }));

    const selectedOption = selectedProcedure[0] as any;
    if (selectedOption?.procName === value && Number(selectedOption?.particularId ?? 0) > 0) {
      return;
    }

    if (value.length < 2) {
      if (procedureSearchDebounceRef.current) {
        clearTimeout(procedureSearchDebounceRef.current);
      }
      setProcedureSuggestions([]);
      return;
    }

    if (procedureSearchDebounceRef.current) {
      clearTimeout(procedureSearchDebounceRef.current);
    }

    latestProcedureSearchRef.current = value;
    procedureSearchDebounceRef.current = setTimeout(async () => {
      try {
        const procedures = await cashCounterApi.fetchProceduresForBilling(1, value);
        if (latestProcedureSearchRef.current !== value) {
          return;
        }
        setProcedureSuggestions(procedures);
        setSelectedProcedureIndex(-1);
      } catch (error) {
        if (latestProcedureSearchRef.current === value) {
          console.error('Error fetching procedures:', error);
          showErrorToast('Failed to fetch procedures');
        }
      }
    }, 250);
  };

  const handleProcedureSelect = (proc: any) => {
    const resolvedParticularId = Number(proc.particularId || proc.id || proc.procId || proc.procedureId || 0);
    setProcedureForm({
      ...procedureForm,
      groupName: proc.groupName || '',
      procedureName: proc.procName || '',
      rate: proc.rate || 0,
      groupId: proc.groupId || 0,
      particularId: resolvedParticularId,
    });
    setSelectedProcedure([proc]);
    setProcedureSearch(proc.procName || '');
    setSelectedProcedureIndex(-1);
  };

  const getHighlightedOptionIndex = (
    e: React.KeyboardEvent<HTMLElement>,
    optionsLength: number,
    fallbackIndex: number
  ) => {
    const target = e.target as HTMLElement | null;
    const inputElement =
      target?.tagName === 'INPUT'
        ? (target as HTMLInputElement)
        : (e.currentTarget.querySelector('input') as HTMLInputElement | null);

    const activeDescendant = inputElement?.getAttribute('aria-activedescendant') || '';
    const idMatch = activeDescendant.match(/(\d+)$/);
    const parsedIndex = idMatch ? Number(idMatch[1]) : -1;

    if (!Number.isNaN(parsedIndex) && parsedIndex >= 0 && parsedIndex < optionsLength) {
      return parsedIndex;
    }

    return fallbackIndex >= 0 ? fallbackIndex : 0;
  };

  const handleProcedureKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (procedureSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedProcedureIndex((prev) =>
          prev < procedureSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedProcedureIndex((prev) =>
          prev > 0 ? prev - 1 : procedureSuggestions.length - 1
        );
        break;
      case 'Tab':
      case 'Enter': {
        e.preventDefault();
        const optionIndex = getHighlightedOptionIndex(
          e,
          procedureSuggestions.length,
          selectedProcedureIndex
        );
        handleProcedureSelect(procedureSuggestions[optionIndex]);
        break;
      }
      case 'Escape':
        setSelectedProcedureIndex(-1);
        break;
      default:
        break;
    }
  };

  const handleAddProcedure = () => {
    const selectedProcedureOption = selectedProcedure[0] as any;

    if (!selectedProcedureOption && (!procedureForm.procedureName || !procedureForm.particularId)) {
      showWarningToast('Please select a procedure');
      return;
    }

    const procedureRate = Number(procedureForm.rate ?? 0);
    const procedureItem: ProcedureItem = {
      id: Date.now(),
      groupName: selectedProcedureOption?.groupName || procedureForm.groupName,
      procedureName: selectedProcedureOption?.procName || procedureForm.procedureName,
      unit: procedureForm.unit,
      rate: procedureRate,
      total: procedureRate * procedureForm.unit,
      groupId: Number(selectedProcedureOption?.groupId ?? procedureForm.groupId ?? 0),
      particularId: Number(selectedProcedureOption?.particularId ?? procedureForm.particularId ?? 0),
    };

    setProcedureItems((prev) => [...prev, procedureItem]);
    setProcedureForm({ groupName: '', procedureName: '', unit: 1, rate: 0, groupId: 0, particularId: 0 });
    setProcedureSearch('');
    setSelectedProcedure([]);
    setSelectedProcedureIndex(-1);
    setTimeout(() => procedureTypeaheadRef.current?.focus(), 0);
  };

  // Medicine search
  const handleMedicineSearch = (value: string) => {
    setMedicineSearch(value);
    setPharmacyForm((prev) => ({ ...prev, medicineName: value }));

    const selectedOption = selectedMedicine[0] as any;
    if (selectedOption?.prodsName === value && Number(selectedOption?.prodsId ?? 0) > 0) {
      return;
    }

    if (value.length < 2) {
      if (medicineSearchDebounceRef.current) {
        clearTimeout(medicineSearchDebounceRef.current);
      }
      setMedicineSuggestions([]);
      return;
    }

    if (medicineSearchDebounceRef.current) {
      clearTimeout(medicineSearchDebounceRef.current);
    }

    latestMedicineSearchRef.current = value;
    medicineSearchDebounceRef.current = setTimeout(async () => {
      try {
        const medicines = await cashCounterApi.fetchMedicinesForBilling(2, value);
        if (latestMedicineSearchRef.current !== value) {
          return;
        }
        setMedicineSuggestions(medicines);
        setSelectedMedicineIndex(-1);
      } catch (error) {
        if (latestMedicineSearchRef.current === value) {
          console.error('Error fetching medicines:', error);
          showErrorToast('Failed to fetch medicines');
        }
      }
    }, 250);
  };

  const handleMedicineSelect = (med: any) => {
    setPharmacyForm({
      ...pharmacyForm,
      genericName: med.genericName || '',
      medicineName: med.prodsName || '',
      rate: med.salesPrice || 0,
      prodsId: med.prodsId || 0,
      batchId: 0,
      storeId: 1,
    });
    setSelectedMedicine([med]);
    setMedicineSearch(med.prodsName || '');
    setSelectedMedicineIndex(-1);
  };

  const handleMedicineKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (medicineSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedMedicineIndex((prev) =>
          prev < medicineSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedMedicineIndex((prev) =>
          prev > 0 ? prev - 1 : medicineSuggestions.length - 1
        );
        break;
      case 'Tab':
      case 'Enter': {
        e.preventDefault();
        const optionIndex = getHighlightedOptionIndex(
          e,
          medicineSuggestions.length,
          selectedMedicineIndex
        );
        handleMedicineSelect(medicineSuggestions[optionIndex]);
        break;
      }
      case 'Escape':
        setSelectedMedicineIndex(-1);
        break;
      default:
        break;
    }
  };

  const handleAddMedicine = () => {
    if (!selectedPharmacyStoreId) {
      showWarningToast('Please select a store');
      return;
    }

    const selectedMedicineOption = selectedMedicine[0] as any;

    if (!selectedMedicineOption && (!pharmacyForm.medicineName || !pharmacyForm.prodsId)) {
      showWarningToast('Please select a medicine');
      return;
    }

    const medicineRate = Number(selectedMedicineOption?.salesPrice ?? pharmacyForm.rate ?? 0);
    const pharmacyItem: PharmacyItem = {
      id: Date.now(),
      genericName: selectedMedicineOption?.genericName || pharmacyForm.genericName,
      medicineName: selectedMedicineOption?.prodsName || pharmacyForm.medicineName,
      unit: pharmacyForm.unit,
      rate: medicineRate,
      total: medicineRate * pharmacyForm.unit,
      prodsId: Number(selectedMedicineOption?.prodsId ?? pharmacyForm.prodsId ?? 0),
      batchId: Number(pharmacyForm.batchId ?? 0),
      storeId: selectedPharmacyStoreId,
    };

    setPharmacyItems((prev) => [...prev, pharmacyItem]);
    setPharmacyForm({ genericName: '', medicineName: '', unit: 1, rate: 0, prodsId: 0, batchId: 0, storeId: 1 });
    setMedicineSearch('');
    setSelectedMedicine([]);
    setSelectedMedicineIndex(-1);
    setTimeout(() => medicineTypeaheadRef.current?.focus(), 0);
  };

  // Lab search
  const handleLabSearch = async (value: string) => {
    setTestSearch(value);
    setLabForm((prev) => ({ ...prev, testName: value }));

    const selectedOption = selectedTest[0] as any;
    if (selectedOption?.testName === value && Number(selectedOption?.testId ?? 0) > 0) {
      return;
    }

    if (value.length < 2) {
      if (labSearchDebounceRef.current) {
        clearTimeout(labSearchDebounceRef.current);
      }
      setTestSuggestions([]);
      return;
    }

    if (labSearchDebounceRef.current) {
      clearTimeout(labSearchDebounceRef.current);
    }

    latestLabSearchRef.current = value;
    labSearchDebounceRef.current = setTimeout(async () => {
      try {
        const tests = await cashCounterApi.fetchLabTestsForBilling(1, value);
        if (latestLabSearchRef.current !== value) {
          return;
        }
        setTestSuggestions(tests);
        setSelectedTestIndex(-1);
      } catch (error) {
        if (latestLabSearchRef.current === value) {
          console.error('Error fetching lab tests:', error);
          showErrorToast('Failed to fetch lab tests');
        }
      }
    }, 250);
  };

  const handleLabSelect = (test: any) => {
    setLabForm({
      ...labForm,
      deptName: test.deptName || '',
      testName: test.testName || '',
      rate: test.rate || 0,
      testId: test.testId || 0,
      deptId: test.deptId || 0,
    });
    setSelectedTest([test]);
    setTestSearch(test.testName || '');
    setSelectedTestIndex(-1);
  };

  const handleLabKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (testSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedTestIndex((prev) =>
          prev < testSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedTestIndex((prev) =>
          prev > 0 ? prev - 1 : testSuggestions.length - 1
        );
        break;
      case 'Tab':
      case 'Enter': {
        e.preventDefault();
        const optionIndex = getHighlightedOptionIndex(
          e,
          testSuggestions.length,
          selectedTestIndex
        );
        handleLabSelect(testSuggestions[optionIndex]);
        break;
      }
      case 'Escape':
        setSelectedTestIndex(-1);
        break;
      default:
        break;
    }
  };

  const handleAddLab = () => {
    const selectedTestOption = selectedTest[0] as any;

    if (!selectedTestOption && (!labForm.testName || !labForm.testId)) {
      showWarningToast('Please select a lab test');
      return;
    }

    const labRate = Number(labForm.rate ?? 0);
    const labItem: LabItem = {
      id: Date.now(),
      deptName: selectedTestOption?.deptName || labForm.deptName,
      testName: selectedTestOption?.testName || labForm.testName,
      unit: labForm.unit,
      rate: labRate,
      total: labRate * labForm.unit,
      testId: Number(selectedTestOption?.testId ?? labForm.testId ?? 0),
      deptId: Number(selectedTestOption?.deptId ?? labForm.deptId ?? 0),
    };

    setLabItems((prev) => [...prev, labItem]);
    setLabForm({ deptName: '', testName: '', unit: 1, rate: 0, testId: 0, deptId: 0 });
    setTestSearch('');
    setSelectedTest([]);
    setSelectedTestIndex(-1);
    setTimeout(() => labTypeaheadRef.current?.focus(), 0);
  };

  const handleRemoveProcedure = (id: number) => {
    setProcedureItems(procedureItems.filter(item => item.id !== id));
  };

  const handleRemoveMedicine = (id: number) => {
    setPharmacyItems(pharmacyItems.filter(item => item.id !== id));
  };

  const handleRemoveLab = (id: number) => {
    setLabItems(labItems.filter(item => item.id !== id));
  };

  const handleReset = () => {
    setPackageName('');
    setActiveTab('procedure');
    setIsOpPackage(true);
    setProcedureItems([]);
    setPharmacyItems([]);
    setLabItems([]);
    setProcedureForm({ groupName: '', procedureName: '', unit: 1, rate: 0, groupId: 0, particularId: 0 });
    setPharmacyForm({ genericName: '', medicineName: '', unit: 1, rate: 0, prodsId: 0, batchId: 0, storeId: 1 });
    setLabForm({ deptName: '', testName: '', unit: 1, rate: 0, testId: 0, deptId: 0 });
    setSelectedProcedure([]);
    setSelectedMedicine([]);
    setSelectedTest([]);
    setSelectedProcedureIndex(-1);
    setSelectedMedicineIndex(-1);
    setSelectedTestIndex(-1);
    setProcedureSuggestions([]);
    setMedicineSuggestions([]);
    setTestSuggestions([]);
    setProcedureSearch('');
    setMedicineSearch('');
    setTestSearch('');
  };

  const handleSave = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
    if (isSaving) {
      return;
    }

    setIsSaving(true);

    if (!packageName.trim()) {
      showWarningToast('Please enter package name');
      setIsSaving(false);
      return;
    }

    if (procedureItems.length === 0 && pharmacyItems.length === 0 && labItems.length === 0) {
      showWarningToast('Please add at least one package detail item');
      setIsSaving(false);
      return;
    }

    const packageCost =
      procedureItems.reduce((sum, item) => sum + Number(item.total || 0), 0) +
      pharmacyItems.reduce((sum, item) => sum + Number(item.total || 0), 0) +
      labItems.reduce((sum, item) => sum + Number(item.total || 0), 0);

    const savePayload = {
      packageName: packageName.trim(),
      packageDetails: [
        {
          headId: 1, // Assuming headId is fixed for now, can be made dynamic if needed
          isOpPackage: isOpPackage ? 1 : 0,
          isLab: labItems.length > 0 ? 1 : 0,
          noOfTest: labItems.length,
          isProcedure: procedureItems.length > 0 ? 1 : 0,
          noOfProcedure: procedureItems.length,
          packageCost,
          discount: 0,
          packageDays: 0,
          isMedicine: pharmacyItems.length > 0 ? 1 : 0,
          noOfMedicine: pharmacyItems.length,
          storeId: pharmacyItems.length > 0 ? Number(pharmacyItems[0]?.storeId ?? 0) : 0,
          labDetails: labItems.map((item) => ({
            testId: Number(item.testId ?? 0),
            noOfTimes: Number(item.unit ?? 0),
            rate: Number(item.rate ?? 0),
          })),
          procedureDetails: procedureItems.map((item) => ({
            procedureId: Number(item.particularId ?? 0),
            noOfTimes: Number(item.unit ?? 0),
            rate: Number(item.rate ?? 0),
          })),
          medicineDetails: pharmacyItems.map((item) => ({
            prodsId: Number(item.prodsId ?? 0),
            units: Number(item.unit ?? 0),
          })),
        },
      ],
    };

    try {
      await cashCounterApi.savePackageConfiguration(savePayload);
      showSuccessToast('Package configuration saved successfully');
      handleReset();
    } catch (error) {
      console.error('Error saving package configuration:', error);
      showErrorToast('Failed to save package configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const currentTabLabel = useMemo(() => {
    return tabConfig.find((tab) => tab.key === activeTab)?.label ?? 'Procedure';
  }, [activeTab]);

  const tabItemCounts: Record<PackageTabKey, number> = {
    procedure: procedureItems.length,
    pharmacy: pharmacyItems.length,
    lab: labItems.length,
  };

  const lockedTab: PackageTabKey | null =
    tabItemCounts.procedure > 0
      ? 'procedure'
      : tabItemCounts.pharmacy > 0
        ? 'pharmacy'
        : tabItemCounts.lab > 0
          ? 'lab'
          : null;

  const hasAddedDetails = lockedTab !== null;

  const renderTabPanel = () => {
    if (activeTab === 'procedure') {
      return (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="fw-semibold">Procedure Entries</div>
            <Badge className="theme-badge-secondary">{procedureItems.length} items</Badge>
          </div>
          <Card className="bg-light border mb-3">
            <Card.Body className="py-3 px-3">
              <div className="row g-2 align-items-end">
                <div className="col-md-4">
                  <Form.Label className="mb-1">Procedure Name</Form.Label>
                  <Typeahead
                    ref={procedureTypeaheadRef}
                    id="procedure-typeahead"
                    labelKey="procName"
                    options={procedureSuggestions}
                    positionFixed
                    placeholder="Search procedure"
                    selected={selectedProcedure}
                    onInputChange={handleProcedureSearch}
                    onKeyDown={handleProcedureKeyDown}
                    onChange={(selected) => {
                      const selectedProcedureOption = selected[0] as any;
                      if (selectedProcedureOption) {
                        handleProcedureSelect(selectedProcedureOption);
                      } else {
                        setSelectedProcedure([]);
                        setProcedureSearch('');
                        setSelectedProcedureIndex(-1);
                        setProcedureForm({ ...procedureForm, procedureName: '', rate: 0, groupId: 0, particularId: 0 });
                      }
                    }}
                    minLength={2}
                    renderMenuItemChildren={(option: any) => (
                      <div>
                        <div><strong>{option.procName}</strong></div>
                        <small className="text-muted">{option.groupName} | Rate: ₹{option.rate}</small>
                      </div>
                    )}
                  />
                </div>
                <div className="col-md-2">
                  <Form.Label className="mb-1">Unit</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="0"
                    value={procedureForm.unit}
                    onChange={(e) => setProcedureForm({ ...procedureForm, unit: parseInt(e.target.value) || 1 })}
                    min="1"
                  />
                </div>
                <div className="col-md-2">
                  <Form.Label className="mb-1">Rate</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="0.00"
                    value={procedureForm.rate}
                    onChange={(e) => setProcedureForm({ ...procedureForm, rate: parseFloat(e.target.value) || 0 })}
                    step="0.01"
                  />
                </div>
                <div className="col-md-2 d-grid">
                  <Button className="theme-btn-primary" onClick={handleAddProcedure}>
                    Add
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>S.NO</th>
                  <th>Procedure</th>
                  <th>Units</th>
                  <th>Rate</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {procedureItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-4">
                      No procedure entries added yet.
                    </td>
                  </tr>
                ) : (
                  procedureItems.map((item, idx) => (
                    <tr key={item.id}>
                      <td>{idx + 1}</td>
                      <td>{item.procedureName}</td>
                      <td>{item.unit}</td>
                      <td>₹{item.rate.toFixed(2)}</td>
                      <td>₹{item.total.toFixed(2)}</td>
                      <td>
                        <Button
                          variant="link"
                          className="text-danger p-0"
                          onClick={() => handleRemoveProcedure(item.id)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </>
      );
    }

    if (activeTab === 'pharmacy') {
      return (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="fw-semibold">Pharmacy Entries</div>
            <Badge className="theme-badge-secondary">{pharmacyItems.length} items</Badge>
          </div>
          <Card className="bg-light border mb-3">
            <Card.Body className="py-3 px-3">
              <div className="row g-2 align-items-end">
                <div className="col-md-3">
                  <Form.Label className="mb-1">Store</Form.Label>
                  <Form.Select
                    value={selectedPharmacyStoreId}
                    onChange={(e) => setSelectedPharmacyStoreId(Number(e.target.value))}
                  >
                    {pharmacyStores.map((store) => (
                      <option key={store.masterId} value={store.masterId}>
                        {store.subModName}
                      </option>
                    ))}
                  </Form.Select>
                </div>
                <div className="col-md-3">
                  <Form.Label className="mb-1">Medicine</Form.Label>
                  <Typeahead
                    ref={medicineTypeaheadRef}
                    id="medicine-typeahead"
                    labelKey="prodsName"
                    options={medicineSuggestions}
                    positionFixed
                    placeholder="Search medicine"
                    selected={selectedMedicine}
                    onInputChange={handleMedicineSearch}
                    onKeyDown={handleMedicineKeyDown}
                    onChange={(selected) => {
                      const selectedMedicineOption = selected[0] as any;
                      if (selectedMedicineOption) {
                        handleMedicineSelect(selectedMedicineOption);
                      } else {
                        setSelectedMedicine([]);
                        setMedicineSearch('');
                        setSelectedMedicineIndex(-1);
                        setPharmacyForm({ ...pharmacyForm, medicineName: '', rate: 0, prodsId: 0 });
                      }
                    }}
                    minLength={2}
                    renderMenuItemChildren={(option: any) => (
                      <div>
                        <div><strong>{option.prodsName}</strong></div>
                        <small className="text-muted">{option.genericName} | Price: ₹{option.salesPrice}</small>
                      </div>
                    )}
                  />
                </div>
                <div className="col-md-3">
                  <Form.Label className="mb-1">Units</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="0"
                    value={pharmacyForm.unit}
                    onChange={(e) => setPharmacyForm({ ...pharmacyForm, unit: parseInt(e.target.value) || 1 })}
                    min="1"
                  />
                </div>
                <div className="col-md-2 d-grid">
                  <Button className="theme-btn-primary" onClick={handleAddMedicine}>
                    Add
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>S.NO</th>
                  <th>Medicine</th>
                  <th>Units</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pharmacyItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-muted py-4">
                      No pharmacy entries added yet.
                    </td>
                  </tr>
                ) : (
                  pharmacyItems.map((item, idx) => (
                    <tr key={item.id}>
                      <td>{idx + 1}</td>
                      <td>{item.medicineName}</td>
                      <td>{item.unit}</td>
                      <td>₹{item.total.toFixed(2)}</td>
                      <td>
                        <Button
                          variant="link"
                          className="text-danger p-0"
                          onClick={() => handleRemoveMedicine(item.id)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </>
      );
    }

    return (
      <>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="fw-semibold">Lab Entries</div>
          <Badge className="theme-badge-secondary">{labItems.length} items</Badge>
        </div>
        <Card className="bg-light border mb-3">
          <Card.Body className="py-3 px-3">
            <div className="row g-2 align-items-end">
              <div className="col-md-4">
                <Form.Label className="mb-1">Test Name</Form.Label>
                <Typeahead
                  ref={labTypeaheadRef}
                  id="test-typeahead"
                  labelKey="testName"
                  options={testSuggestions}
                  positionFixed
                  placeholder="Search test"
                  selected={selectedTest}
                  onInputChange={handleLabSearch}
                  onKeyDown={handleLabKeyDown}
                  onChange={(selected) => {
                    const selectedTestOption = selected[0] as any;
                    if (selectedTestOption) {
                      handleLabSelect(selectedTestOption);
                    } else {
                      setSelectedTest([]);
                      setTestSearch('');
                      setSelectedTestIndex(-1);
                      setLabForm({ ...labForm, testName: '', rate: 0, testId: 0, deptId: 0 });
                    }
                  }}
                  minLength={2}
                  renderMenuItemChildren={(option: any) => (
                    <div>
                      <div><strong>{option.testName}</strong></div>
                      <small className="text-muted">{option.deptName} | Rate: ₹{option.rate}</small>
                    </div>
                  )}
                />
              </div>
              <div className="col-md-2">
                <Form.Label className="mb-1">Units</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="0"
                  value={labForm.unit}
                  onChange={(e) => setLabForm({ ...labForm, unit: parseInt(e.target.value) || 1 })}
                  min="1"
                />
              </div>
              <div className="col-md-2">
                <Form.Label className="mb-1">Rate</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="0.00"
                  value={labForm.rate}
                  onChange={(e) => setLabForm({ ...labForm, rate: parseFloat(e.target.value) || 0 })}
                  step="0.01"
                />
              </div>
              <div className="col-md-2 d-grid">
                <Button className="theme-btn-primary" onClick={handleAddLab}>
                  Add
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>
        <div className="table-responsive">
          <Table hover className="mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>S.NO</th>
                <th>Department</th>
                <th>Test</th>
                <th>Units</th>
                <th>Rate</th>
                <th>Total</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {labItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-4">
                    No lab entries added yet.
                  </td>
                </tr>
              ) : (
                labItems.map((item, idx) => (
                  <tr key={item.id}>
                    <td>{idx + 1}</td>
                    <td>{item.deptName}</td>
                    <td>{item.testName}</td>
                    <td>{item.unit}</td>
                    <td>₹{item.rate.toFixed(2)}</td>
                    <td>₹{item.total.toFixed(2)}</td>
                    <td>
                      <Button
                        variant="link"
                        className="text-danger p-0"
                        onClick={() => handleRemoveLab(item.id)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </>
    );
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <PageHeader
        icon={faBoxesPacking}
        title="Create Package"
        subtitle="Design package structure for procedure, pharmacy, and lab"
        badges={[{ label: 'Active Tab', value: currentTabLabel }]}
      />

      <div style={{ flex: 1, width: '100%', overflow: 'hidden' }}>
        <Container fluid className="px-3 pb-3 h-100">
          <Card className="neat-card h-100 d-flex flex-column">
            <Card.Body className="p-3 d-flex flex-column" style={{ minHeight: 0 }}>
              <div className="row g-2 align-items-end mb-3">
                <div className="col-md-auto">
                  <Form.Group className="mb-0">
                    <Form.Check
                      type="checkbox"
                      id="isOpPackage"
                      checked={isOpPackage}
                      onChange={(e) => setIsOpPackage(e.target.checked)}
                      label={isOpPackage ? 'OP Package' : 'IP Package'}
                    />
                  </Form.Group>
                </div>
                <div className="col-md">
                  <Form.Group className="mb-0">
                    <Form.Label className="mb-1">Package Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={packageName}
                      onChange={(event) => setPackageName(event.target.value)}
                      placeholder="Enter package name"
                    />
                  </Form.Group>
                </div>
              </div>

              <div className="d-flex flex-wrap gap-2 mb-3">
                {tabConfig.map((tab) => (
                  <Button
                    key={tab.key}
                    type="button"
                    className={activeTab === tab.key ? 'theme-btn-primary' : 'theme-outline-btn-primary'}
                    onClick={() => setActiveTab(tab.key)}
                    disabled={hasAddedDetails && lockedTab !== tab.key}
                    title={hasAddedDetails && lockedTab !== tab.key ? 'Clear added details to switch tabs' : ''}
                  >
                    <FontAwesomeIcon icon={tab.icon} className="me-2" />
                    {tab.label}
                  </Button>
                ))}
              </div>

              <div className="border rounded p-3 flex-grow-1 overflow-auto">{renderTabPanel()}</div>
            </Card.Body>

            <Card.Footer className="bg-light py-3 px-3 d-flex justify-content-end gap-2">
              <Button type="button" className="theme-outline-btn-secondary" onClick={handleReset}>
                <FontAwesomeIcon icon={faRotateLeft} className="me-2" />
                Reset
              </Button>
              <Button type="button" className="theme-btn-primary" onClick={handleSave} disabled={isSaving}>
                <FontAwesomeIcon icon={faSave} className="me-2" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </Card.Footer>
          </Card>
        </Container>
      </div>
    </div>
  );
};

export default CreatePackage;