import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../../state/store';
import { Table, Button, Form, Modal, Container, Row, Col } from 'react-bootstrap';
import { faPrescriptionBottleMedical } from '@fortawesome/free-solid-svg-icons';
import '../../../../../style/commonStyle.css';
import CentralStoresApiService, { ProductResponse, GenericDetailsResponse, CompanyResponse, SaveProductRequest, UpdateProductRequest } from '../../../../../api/central-stores/central-stores-api-service';
import { handleError } from '../../../../../utils/errorUtil';
import { showSuccessToast, showErrorToast, showValidationError, showConfirmDialog } from '../../../../../utils/alertUtil';
import PageHeader, { BadgeInfo } from '../../../../../components/PageHeader';
import { useTableSearch } from '../../../../../hooks/useTableSearch';
import SearchInput from '../../../../../components/SearchInput';

interface Generic {
  id: number;
  name: string;
  scheduled: number;
}

interface Manufacturer {
  id: number;
  name: string;
  code?: string;
}

interface MedicineItem {
  id: number;
  itemCode: string;
  itemName: string;
  genericId: number;
  genericName: string;
  manufacturerId: number;
  manufacturerName: string;
  strength: string;
  dosageForm: string;
  packSize: number;
  unitType: string;
  schedule: string;
  hsnCode: string;
  reorderLevel: number;
  maxLevel: number;
  rackLocation: string;
  mrp: number;
  isActive: boolean;
  createdDate: string;
}

const MedicineItemMaster: React.FC = () => {
  const navigate = useNavigate();
  const loginData = useSelector((state: RootState) => state.loginData);
  const dispatch = useDispatch();
  const centralStoresApi = new CentralStoresApiService();

  const selectedStoreStr = sessionStorage.getItem('selectedStore');
  const selectedStoreData = selectedStoreStr ? JSON.parse(selectedStoreStr) as { masterId?: number } : null;
  const masterId = Number(selectedStoreData?.masterId ?? 0);
  
  const [medicines, setMedicines] = useState<MedicineItem[]>([]);
  const [generics, setGenerics] = useState<Generic[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<ProductResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [savedMedicineId, setSavedMedicineId] = useState<number | null>(null);
  const [savedMedicineName, setSavedMedicineName] = useState<string>('');
  
  const [formData, setFormData] = useState({
    productName: '',
    goodsType: 'Pharmacy',
    productCode: '',
    medicineType: 'Medical',
    genericId: 0,
    manufacturerId: 0,
    hsnCode: '',
    form: 'Solid',
    group: 'Solid',
    totalStrength: 0,
    strengthUnit: 'mg',
    totalQuantity: 0,
    quantityUnit: 'mg',
    numberPerStrip: 1,
    looseSale: 'Yes',
    dosage: 'children',
    minLevel: 0,
    maxLevel: 0,
    routeI: '',
    routeIDefault: false,
    routeII: '',
    routeIIDefault: false,
    routeIII: '',
    routeIIIDefault: false,
    routeIV: '',
    routeIVDefault: false,
    commonTimingI: '',
    commonTimingIDefault: false,
    commonTimingII: '',
    commonTimingIIDefault: false,
    commonTimingIII: '',
    commonTimingIIIDefault: false,
    commonTimingIV: '',
    commonTimingIVDefault: false,
    highRisks: false,
    lasa: false,
    narcotic: false,
    psychotropic: false,
    scheduledDrugs: false,
    toChoosee: false,
    natamycinEyeDrops: false,
    truleneMesh: false
  });

  const [batchFormData, setBatchFormData] = useState({
    batchNo: '',
    mfgDate: '',
    expiryDate: '',
    cost: '',
    mrp: '',
    disc: '',
    sgstPer: '',
    cgstPer: '',
    igstPer: ''
  });

  const batchIgstValue = parseFloat(batchFormData.igstPer) || 0;
  const batchSgstValue = parseFloat(batchFormData.sgstPer) || 0;
  const batchCgstValue = parseFloat(batchFormData.cgstPer) || 0;
  const isBatchIgstActive = batchIgstValue > 0;
  const isBatchSgstOrCgstActive = batchSgstValue > 0 || batchCgstValue > 0;

  const goodsTypes = ['Pharmacy', 'Non-Pharmacy'];
  const medicineTypes = ['Medical', 'Surgical'];
  const formTypes = ['Solid', 'Liquid', 'Semi-Solid', 'Gas'];
  const groupTypes = ['Solid', 'Liquid', 'Semi-Solid', 'Gas'];
  const strengthUnits = ['mg', 'gm', 'ml', 'mcg', 'IU'];
  const quantityUnits = ['mg', 'gm', 'ml', 'Tablet', 'Capsule'];
  const dosageTypes = ['children', 'adult', 'infant', 'elderly'];
  const routeOptions = ['Select', 'Oral', 'IV', 'IM', 'SC', 'Topical', 'Inhalation', 'Rectal', 'Vaginal'];
  const timingOptions = ['Select', 'Morning', 'Afternoon', 'Evening', 'Night', 'Before Food', 'After Food', 'With Food'];

  // Table search hook
  const { filteredData: filteredMedicines, searchTerm, setSearchTerm, resultCount, totalCount } = useTableSearch({
    data: medicines,
    searchFields: ['itemName', 'itemCode', 'genericName', 'manufacturerName']
  });

  // Mock data
  const mockGenerics: Generic[] = [
    { id: 1, name: 'Paracetamol', scheduled: 0 },
    { id: 2, name: 'Ibuprofen', scheduled: 0 },
    { id: 3, name: 'Amoxicillin', scheduled: 0 },
    { id: 4, name: 'Metformin', scheduled: 0 },
  ];

  const mockManufacturers: Manufacturer[] = [
    { id: 1, name: 'Cipla Ltd' },
    { id: 2, name: 'Sun Pharma' },
    { id: 3, name: 'Dr. Reddys' },
    { id: 4, name: 'Lupin Ltd' },
  ];

  const mockMedicines: MedicineItem[] = [
    { id: 1, itemCode: 'MED001', itemName: 'Paracetamol 500mg Tablet', genericId: 1, genericName: 'Paracetamol', manufacturerId: 1, manufacturerName: 'Cipla Ltd', strength: '500mg', dosageForm: 'Tablet', packSize: 10, unitType: 'Tablet', schedule: 'H', hsnCode: '30049099', reorderLevel: 500, maxLevel: 5000, rackLocation: 'A-12', mrp: 50, isActive: true, createdDate: '2024-02-01' },
    { id: 2, itemCode: 'MED002', itemName: 'Amoxicillin 250mg Capsule', genericId: 3, genericName: 'Amoxicillin', manufacturerId: 2, manufacturerName: 'Sun Pharma', strength: '250mg', dosageForm: 'Capsule', packSize: 10, unitType: 'Capsule', schedule: 'H', hsnCode: '30041090', reorderLevel: 300, maxLevel: 3000, rackLocation: 'B-05', mrp: 80, isActive: true, createdDate: '2024-02-02' },
    { id: 3, itemCode: 'MED003', itemName: 'Metformin 500mg Tablet', genericId: 4, genericName: 'Metformin', manufacturerId: 3, manufacturerName: 'Dr. Reddys', strength: '500mg', dosageForm: 'Tablet', packSize: 15, unitType: 'Tablet', schedule: 'H', hsnCode: '30043900', reorderLevel: 400, maxLevel: 4500, rackLocation: 'C-18', mrp: 75, isActive: true, createdDate: '2024-02-03' },
  ];

  useEffect(() => {
    if (!loginData.authorized) {
      navigate('/login');
      return;
    }
    
    // Load Generics and Manufacturers from API
    const loadMasterData = async () => {
      try {
        // Load Generics from API
        console.log('Fetching generics from API...');
        const genericsData: GenericDetailsResponse[] = await centralStoresApi.fetchAllGenerics();
        console.log('Generics API Response:', genericsData);
        
        const mappedGenerics: Generic[] = genericsData.map(g => ({
          id: g.id,
          name: g.name,
          scheduled: g.scheduled
        }));
        setGenerics(mappedGenerics);
        console.log('✅ Loaded generics:', mappedGenerics.length, mappedGenerics);
      } catch (error) {
        console.error('❌ Error loading generics:', error);
        // Fallback to mock data for generics
        setGenerics(mockGenerics);
      }
      
      // Load Companies from API (or use mock data if API not available)
      try {
        console.log('Fetching companies from API...');
        const companiesData: CompanyResponse[] = await centralStoresApi.fetchAllCompanies();
        console.log('Companies API Response:', companiesData);

        const mappedManufacturers: Manufacturer[] = companiesData.map(c => ({
          id: c.id,
          name: c.name,
          code: c.code
        }));
        setManufacturers(mappedManufacturers);
        console.log('✅ Loaded companies as manufacturers:', mappedManufacturers.length, mappedManufacturers);
      } catch (error) {
        console.warn('⚠️ Companies API not available, using mock data:', error);
        // Fallback to mock data for manufacturers
        setManufacturers(mockManufacturers);
      }
    };
    
    loadMasterData();
  }, []);

  // Fetch products from API (default phModId = 1)
  const loadProducts = async () => {
    try {
      setLoading(true);
      console.log('Fetching products from API at:', `http://localhost:9090/api/v1/central-store/fetchAllProducts/${masterId}`);
      const products: ProductResponse[] = await centralStoresApi.fetchAllProducts(masterId);
        
        console.log('API Response:', products);
        console.log('Products count:', products.length);
        
        if (!Array.isArray(products)) {
          console.error('API did not return an array:', products);
          return;
        }
        
        // Map API response to MedicineItem format
        const mapped: MedicineItem[] = products.map((p) => {
          // Find generic and manufacturer names from loaded data
          const generic = generics.find(g => g.id === p.genericId);
          const manufacturer = manufacturers.find(m => m.id === p.companyId);
          
          // Handle isactive field - can be string, number, or boolean
          let isActiveValue = false;
          if (typeof p.isactive === 'string') {
            isActiveValue = ['y', 'yes', 'true', '1'].includes(p.isactive.toLowerCase());
          } else if (typeof p.isactive === 'number') {
            isActiveValue = p.isactive === 1;
          } else if (typeof p.isactive === 'boolean') {
            isActiveValue = p.isactive;
          }
          
          return {
            id: p.id,
            itemCode: p.medCode || '',
            itemName: p.name || '',
            genericId: p.genericId ?? 0,
            genericName: generic?.name || '',
            manufacturerId: p.companyId ?? 0,
            manufacturerName: manufacturer?.name || '',
            strength: p.strength ? String(p.strength) : '',
            dosageForm: p.formId ? String(p.formId) : '',
            packSize: p.quantity ?? 0,
            unitType: p.unitId || '',
            schedule: p.schedule ? String(p.schedule) : '',
            hsnCode: p.hsnCode || '',
            reorderLevel: p.min ?? 0,
            maxLevel: p.max ?? 0,
            rackLocation: p.rack || '',
            mrp: 0, // Not available in API response
            isActive: isActiveValue,
            createdDate: p.dateTime || ''
          };
        });
        
        console.log('Mapped medicines:', mapped);
        console.log('Mapped count:', mapped.length);
        
        setMedicines(mapped);
      } catch (error) {
        console.error('Error loading products:', error);
        console.error('Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });
        handleError(dispatch as any, error);
        
        // Fallback to mock data on error
        console.log('Using mock data as fallback');
        setMedicines(mockMedicines);
      } finally {
        setLoading(false);
      }
    };
  
  useEffect(() => {
    // Only load products after generics and manufacturers are loaded
    if (generics.length > 0 && manufacturers.length > 0) {
      if (!masterId) {
        showValidationError('Store context is missing. Please reselect the store.');
        navigate('/hims/central-stores', { replace: true });
        return;
      }

      loadProducts();
    }
  }, [generics, manufacturers]);

  // Product name is now manually entered - removed auto-generation

  const handleAdd = () => {
    setIsEdit(false);
    setFormData({
      productName: '',
      goodsType: 'Pharmacy',
      productCode: '',
      medicineType: 'Medical',
      genericId: 0,
      manufacturerId: 0,
      hsnCode: '',
      form: 'Solid',
      group: 'Solid',
      totalStrength: 0,
      strengthUnit: 'mg',
      totalQuantity: 0,
      quantityUnit: 'mg',
      numberPerStrip: 1,
      looseSale: 'Yes',
      dosage: 'children',
      minLevel: 0,
      maxLevel: 0,
      routeI: '',
      routeIDefault: false,
      routeII: '',
      routeIIDefault: false,
      routeIII: '',
      routeIIIDefault: false,
      routeIV: '',
      routeIVDefault: false,
      commonTimingI: '',
      commonTimingIDefault: false,
      commonTimingII: '',
      commonTimingIIDefault: false,
      commonTimingIII: '',
      commonTimingIIIDefault: false,
      commonTimingIV: '',
      commonTimingIVDefault: false,
      highRisks: false,
      lasa: false,
      narcotic: false,
      psychotropic: false,
      scheduledDrugs: false,
      toChoosee: false,
      natamycinEyeDrops: false,
      truleneMesh: false
    });
    setShowModal(true);
  };

  const handleEdit = async (medicine: MedicineItem) => {
    setIsEdit(true);

    if (!masterId) {
      showValidationError('Store context is missing. Please reselect the store.');
      navigate('/hims/central-stores', { replace: true });
      return;
    }
    
    // Fetch the full product details from API to get the ProductResponse object
    try {
      const products: ProductResponse[] = await centralStoresApi.fetchAllProducts(masterId);
      const productToEdit = products.find(p => p.id === medicine.id);
      
      if (productToEdit) {
        setSelectedMedicine(productToEdit);
      }
    } catch (error) {
      console.error('Error fetching product for edit:', error);
    }
    
    setFormData({
      productName: medicine.itemName || '',
      goodsType: 'Pharmacy',
      productCode: medicine.itemCode || '',
      medicineType: 'Medical',
      genericId: medicine.genericId || 0,
      manufacturerId: medicine.manufacturerId || 0,
      hsnCode: medicine.hsnCode || '',
      form: 'Solid',
      group: 'Solid',
      totalStrength: parseFloat(medicine.strength) || 0,
      strengthUnit: 'mg',
      totalQuantity: medicine.packSize || 0,
      quantityUnit: 'mg',
      numberPerStrip: 1,
      looseSale: 'Yes',
      dosage: 'children',
      minLevel: medicine.reorderLevel || 0,
      maxLevel: medicine.maxLevel || 0,
      routeI: '',
      routeIDefault: false,
      routeII: '',
      routeIIDefault: false,
      routeIII: '',
      routeIIIDefault: false,
      routeIV: '',
      routeIVDefault: false,
      commonTimingI: '',
      commonTimingIDefault: false,
      commonTimingII: '',
      commonTimingIIDefault: false,
      commonTimingIII: '',
      commonTimingIIIDefault: false,
      commonTimingIV: '',
      commonTimingIVDefault: false,
      highRisks: false,
      lasa: false,
      narcotic: false,
      psychotropic: false,
      scheduledDrugs: medicine.schedule === '1',
      toChoosee: false,
      natamycinEyeDrops: false,
      truleneMesh: false
    });
    setShowModal(true);
  };

  const handleBlockUnblock = async (medicine: MedicineItem) => {

    if (!masterId) {
      showValidationError('Store context is missing. Please reselect the store.');
      navigate('/hims/central-stores', { replace: true });
      return;
    }
    
    const action = medicine.isActive ? 'block' : 'unblock';
    const actionText = medicine.isActive ? 'Block' : 'Unblock';
    
    const confirmed = await showConfirmDialog(
      actionText + ' Medicine?',
      'Are you sure you want to ' + action + ' ' + medicine.itemName + '?'
    );

    if (confirmed) {
      try {
        const products: ProductResponse[] = await centralStoresApi.fetchAllProducts(masterId);
        const productData = products.find((p) => p.id === medicine.id);
        
        if (!productData) {
          showErrorToast('Product not found. Please refresh and try again.');
          return;
        }

        const updatePayload: UpdateProductRequest = {
          name: productData.name,
          medCode: productData.medCode || '',
          genericId: productData.genericId,
          companyId: productData.companyId,
          description: productData.description || '',
          formId: productData.formId || 0,
          strength: productData.strength || 0,
          unitsId: productData.unitsId || 0,
          shelf: productData.shelf || 0,
          rack: productData.rack || '',
          min: productData.min || 0,
          max: productData.max || 0,
          safe: productData.safe || 0,
          eoq: productData.eoq || 0,
          isNonStockable: productData.isNonStockable || '0',
          ownStock: productData.ownStock || 0,
          isactive: medicine.isActive ? '0' : '1',
          userlog: loginData.id?.toString() || '0',
          categoryId: productData.categoryId || 0,
          action: 'U',
          dosageOral: productData.dosageOral || '',
          dosageIm: productData.dosageIm || '',
          dosageIv: productData.dosageIv || '',
          schedule: productData.schedule || 0,
          strips: productData.strips || '0',
          quantity: productData.quantity || 0,
          unitId: productData.unitId || '0',
          looseSale: productData.looseSale || '0',
          groupId: productData.groupId || 0,
          subDivId: productData.subDivId || 0,
          phModId: masterId,
          hsnCode: productData.hsnCode || '',
          blockUid: loginData.id || 0,
          blockReason: ''
        };

        await centralStoresApi.updateProduct(medicine.id, updatePayload);
        showSuccessToast('Medicine ' + action + 'ed successfully');
        loadProducts();
      } catch (error: any) {
        console.error('Error ' + action + 'ing medicine:', error);
        handleError(dispatch, error);
        showErrorToast(error?.response?.data?.message || 'Failed to ' + action + ' medicine. Please try again.');
      }
    }
  };

  const handleSave = async () => {
    // Validation
    if (!formData.productName || !formData.genericId || !formData.manufacturerId) {
      showValidationError('Product Name, Generic, and Company Name are required!');
      return;
    }

    // Duplicate validation (case-insensitive, exclude current record if editing)
    const duplicateByName = medicines.find(
      (m) => 
        m.itemName.toLowerCase() === formData.productName.toLowerCase() &&
        (!isEdit || m.id !== selectedMedicine?.id)
    );
    
    const duplicateByCode = formData.productCode && medicines.find(
      (m) => 
        m.itemCode.toLowerCase() === formData.productCode.toLowerCase() &&
        (!isEdit || m.id !== selectedMedicine?.id)
    );

    if (duplicateByName) {
      showValidationError(`Medicine with name "${formData.productName}" already exists!`);
      return;
    }
    
    if (duplicateByCode) {
      showValidationError(`Medicine with code "${formData.productCode}" already exists!`);
      return;
    }

    const confirmed = await showConfirmDialog(
      isEdit ? 'Update Medicine?' : 'Add Medicine?',
      formData.productName
    );

    if (confirmed) {
      if (!masterId) {
        showValidationError('Store context is missing. Please reselect the store.');
        navigate('/hims/central-stores', { replace: true });
        return;
      }
      try {
        // Map formData to API payload
        const payload: SaveProductRequest | UpdateProductRequest = {
          name: formData.productName,
          medCode: formData.productCode,
          genericId: formData.genericId,
          companyId: formData.manufacturerId,
          description: formData.dosage,
          formId: formData.form === 'Tablet' ? 1 : formData.form === 'Capsule' ? 2 : formData.form === 'Syrup' ? 3 : formData.form === 'Injection' ? 4 : 0,
          strength: formData.totalStrength,
          unitsId: formData.strengthUnit === 'mg' ? 1 : formData.strengthUnit === 'ml' ? 2 : formData.strengthUnit === 'gm' ? 3 : 0,
          shelf: 0,
          rack: '',
          min: formData.minLevel,
          max: formData.maxLevel,
          safe: 0,
          eoq: 0,
          isNonStockable: '0',
          ownStock: 0,
          isactive: '1',
          userlog: loginData.id?.toString() || '0',
          categoryId: formData.medicineType === 'Allopathy' ? 1 : formData.medicineType === 'Ayurveda' ? 2 : 0,
          action: isEdit ? 'U' : 'A',
          dosageOral: formData.routeIDefault ? formData.routeI : formData.routeIIDefault ? formData.routeII : formData.routeIIIDefault ? formData.routeIII : formData.routeIVDefault ? formData.routeIV : '',
          dosageIm: '',
          dosageIv: '',
          schedule: formData.scheduledDrugs ? 1 : 0,
          strips: formData.numberPerStrip.toString(),
          quantity: formData.totalQuantity,
          unitId: (formData.quantityUnit === 'mg' ? 1 : formData.quantityUnit === 'ml' ? 2 : formData.quantityUnit === 'gm' ? 3 : 0).toString(),
          looseSale: formData.looseSale === 'Yes' ? '1' : '0',
          groupId: formData.group === 'Group A' ? 1 : formData.group === 'Group B' ? 2 : 0,
          subDivId: 0,
          phModId: masterId,
          hsnCode: formData.hsnCode,
          blockUid: 0,
          blockReason: ''
        };

        let response;
        if (isEdit && selectedMedicine) {
          response = await centralStoresApi.updateProduct(selectedMedicine.id, payload as UpdateProductRequest);
        } else {
          response = await centralStoresApi.saveProduct(payload as SaveProductRequest);
        }

        if (response) {
          showSuccessToast(`Medicine ${isEdit ? 'updated' : 'added'} successfully`);
          setShowModal(false);
          loadProducts(); // Refresh the list

          // Ask if user wants to add batch for new medicine
          if (!isEdit) {
            const addBatch = await showConfirmDialog(
              'Add Batch Details?',
              `Would you like to add batch details for ${formData.productName}?`
            );

            if (addBatch) {
              // Store the saved medicine details and open batch modal
              setSavedMedicineId(response.id || null);
              setSavedMedicineName(formData.productName);
              setShowBatchModal(true);
            }
          }
        }
      } catch (error: any) {
        console.error('Error saving medicine:', error);
        handleError(dispatch, error);
        showErrorToast(error?.response?.data?.message || 'Failed to save medicine item. Please try again.');
      }
    }
  };

  const handleBatchSave = async () => {
    // Validation
    if (!batchFormData.batchNo || !batchFormData.mfgDate || !batchFormData.expiryDate) {
      showValidationError('Batch No, Manufacturing Date, and Expiry Date are required!');
      return;
    }

    if (!savedMedicineId) {
      showErrorToast('Medicine ID not found. Please try again.');
      return;
    }

    if (batchIgstValue > 0 && (batchSgstValue > 0 || batchCgstValue > 0)) {
      showValidationError('Use either IGST or SGST/CGST, not both.');
      return;
    }

    if (
      batchIgstValue === 0 &&
      (batchSgstValue > 0 || batchCgstValue > 0) &&
      (batchSgstValue === 0 || batchCgstValue === 0)
    ) {
      showValidationError('Enter both SGST and CGST together, or use IGST only.');
      return;
    }

    const confirmed = await showConfirmDialog(
      'Add Batch?',
      `Batch No: ${batchFormData.batchNo}`
    );

    if (confirmed) {
      try {
        const today = new Date().toISOString().split('T')[0];
        
        const batchPayload = {
          batchNo: batchFormData.batchNo,
          prodsId: savedMedicineId,
          mfgDate: batchFormData.mfgDate,
          expiryDate: batchFormData.expiryDate,
          dateBatchIn: today,
          isActive: 1,
          userLog: loginData.id?.toString() || '0',
          cost: parseFloat(batchFormData.cost) || 0,
          mrp: parseFloat(batchFormData.mrp) || 0,
          disc: parseFloat(batchFormData.disc) || 0,
          salesPrice: parseFloat(batchFormData.mrp) || 0,
          sgstPer: parseFloat(batchFormData.sgstPer) || 0,
          cgstPer: parseFloat(batchFormData.cgstPer) || 0,
          igstPer: parseFloat(batchFormData.igstPer) || 0
        };

        const response = await centralStoresApi.saveBatch(batchPayload);

        if (response) {
          showSuccessToast('Batch details saved successfully');
          setShowBatchModal(false);
          // Reset batch form
          setBatchFormData({
            batchNo: '',
            mfgDate: '',
            expiryDate: '',
            cost: '',
            mrp: '',
            disc: '',
            sgstPer: '',
            cgstPer: '',
            igstPer: ''
          });
        }
      } catch (error: any) {
        console.error('Error saving batch:', error);
        handleError(dispatch, error);
        showErrorToast(error?.response?.data?.message || 'Failed to save batch. Please try again.');
      }
    }
  };

  const badges: BadgeInfo[] = [
    { label: 'Total Medicines', value: totalCount },
    { label: 'Search Results', value: resultCount }
  ];

  return (
    <Container fluid style={{ height: '100vh', display: 'flex', flexDirection: 'column', padding: 0 }}>
      <PageHeader
        icon={faPrescriptionBottleMedical}
        title="Medicine Item Master"
        subtitle="Manage medicine products and inventory"
        badges={badges}
      />

      <Row style={{ flex: 1, margin: 0, overflow: 'hidden' }}>
        <Col style={{ display: 'flex', flexDirection: 'column', padding: '15px', minHeight: 0 }}>
          {/* Search and Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexShrink: 0 }}>
            <SearchInput
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Search by name, code, generic, manufacturer..."
              resultCount={resultCount}
              totalCount={totalCount}
            />
            <Button variant="success" onClick={handleAdd} style={{ marginLeft: '10px' }}>
              <i className="fas fa-plus-circle"></i> Add New
            </Button>
          </div>

          {/* Table Container */}
          <div style={{ flex: 1, overflow: 'auto', background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p style={{ marginTop: '15px', color: '#666' }}>Loading medicine items...</p>
              </div>
            ) : (
              <Table striped bordered hover style={{ margin: 0 }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--table-header-bg)', color: 'var(--table-header-text)' }}>
                  <tr>
                    <th style={{ width: '50px' }}>S.No</th>
                    <th>Item Code</th>
                    <th>Item Name</th>
                    <th>Generic</th>
                    <th>Manufacturer</th>
                    <th style={{ width: '100px' }}>Status</th>
                    <th style={{ width: '150px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMedicines.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center text-muted">
                        <i className="fas fa-inbox" style={{ fontSize: '2rem', opacity: 0.3 }}></i>
                        <p>No records found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredMedicines.map((medicine, index) => (
                      <tr key={medicine.id}>
                        <td>{index + 1}</td>
                        <td><code style={{ background: '#e9ecef', padding: '3px 8px', borderRadius: '4px', fontFamily: 'Courier New, monospace', fontSize: '12px' }}>{medicine.itemCode}</code></td>
                        <td>
                          <strong>{medicine.itemName}</strong>
                          <br/>
                          <small className="text-muted">{medicine.dosageForm} | {medicine.packSize} {medicine.unitType}s</small>
                        </td>
                        <td><span style={{ background: '#d4edda', color: '#155724', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>{medicine.genericName}</span></td>
                        <td><small>{medicine.manufacturerName}</small></td>
                        <td>
                          <span className={`badge ${medicine.isActive ? 'bg-success' : 'bg-danger'}`}>
                            {medicine.isActive ? 'Active' : 'Blocked'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <Button variant="primary" size="sm" title="Edit" onClick={() => handleEdit(medicine)}>
                              <i className="fas fa-edit"></i> Edit
                            </Button>
                            <Button 
                              variant={medicine.isActive ? 'danger' : 'warning'} 
                              size="sm" 
                              title={medicine.isActive ? 'Block' : 'Unblock'}
                              onClick={() => handleBlockUnblock(medicine)}
                            >
                              <i className={`fas fa-${medicine.isActive ? 'ban' : 'check-circle'}`}></i> {medicine.isActive ? 'Block' : 'Unblock'}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            )}
          </div>
        </Col>
      </Row>

      {/* Medicine Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="xl" backdrop="static" keyboard={false}>
        <Modal.Header closeButton style={{ background: 'var(--page-header-bg)', color: 'var(--page-header-text)', padding: '10px 15px' }}>
          <Modal.Title style={{ fontSize: '1.1rem' }}>
            <i className={`fas ${isEdit ? 'fa-edit' : 'fa-plus-circle'}`}></i>
            {' '}ADD PRODUCT DETAILS
          </Modal.Title>
        </Modal.Header>
          <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto', padding: '15px' }}>
            <Form>
              <div className="row">
                {/* LEFT COLUMN - Important Fields */}
                <div className="col-md-6">
                  {/* Product Name */}
                  <div className="row mb-2">
                    <div className="col-md-12">
                      <Form.Group>
                        <Form.Label className="mb-1" style={{ fontSize: '0.875rem', fontWeight: '600' }}>Product Name <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          size="sm"
                          type="text"
                          value={formData.productName}
                          onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                        />
                      </Form.Group>
                    </div>
                  </div>

                  {/* Goods Type & Medicine Type */}
                  <div className="row mb-2">
                    <div className="col-md-6">
                      <Form.Group>
                        <Form.Label className="mb-1" style={{ fontSize: '0.875rem' }}>Goods Type</Form.Label>
                        <Form.Select
                          size="sm"
                          value={formData.goodsType}
                          onChange={(e) => setFormData({ ...formData, goodsType: e.target.value })}
                        >
                          {goodsTypes.map(gt => (
                            <option key={gt} value={gt}>{gt}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </div>
                    <div className="col-md-6">
                      <Form.Group>
                        <Form.Label className="mb-1" style={{ fontSize: '0.875rem' }}>Medicine Type</Form.Label>
                        <Form.Select
                          size="sm"
                          value={formData.medicineType}
                          onChange={(e) => setFormData({ ...formData, medicineType: e.target.value })}
                        >
                          {medicineTypes.map(mt => (
                            <option key={mt} value={mt}>{mt}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </div>
                  </div>

                  {/* Product Code */}
                  <div className="row mb-2">
                    <div className="col-md-12">
                      <Form.Group>
                        <Form.Label className="mb-1" style={{ fontSize: '0.875rem' }}>Product Code</Form.Label>
                        <Form.Control
                          size="sm"
                          type="text"
                          value={formData.productCode}
                          onChange={(e) => setFormData({ ...formData, productCode: e.target.value.toUpperCase() })}
                        />
                      </Form.Group>
                    </div>
                  </div>

                  {/* Generic Name */}
                  <div className="row mb-2">
                    <div className="col-md-12">
                      <Form.Group>
                        <Form.Label className="mb-1" style={{ fontSize: '0.875rem', fontWeight: '600' }}>Generic Name <span className="text-danger">*</span></Form.Label>
                        <Form.Select
                          size="sm"
                          value={formData.genericId}
                          onChange={(e) => setFormData({ ...formData, genericId: parseInt(e.target.value) })}
                        >
                          <option value={0}>-- Select --</option>
                          {generics.map(g => (
                            <option key={g.id} value={g.id}>{g.name} {g.scheduled ? '(Scheduled)' : ''}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </div>
                  </div>

                  {/* Company Name */}
                  <div className="row mb-2">
                    <div className="col-md-12">
                      <Form.Group>
                        <Form.Label className="mb-1" style={{ fontSize: '0.875rem', fontWeight: '600' }}>Company Name <span className="text-danger">*</span></Form.Label>
                        <Form.Select
                          size="sm"
                          value={formData.manufacturerId}
                          onChange={(e) => setFormData({ ...formData, manufacturerId: parseInt(e.target.value) })}
                        >
                          <option value={0}>-- Select --</option>
                          {manufacturers.map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </div>
                  </div>

                  {/* HSN Code, Form, Group */}
                  <div className="row mb-2">
                    <div className="col-md-6">
                      <Form.Group>
                        <Form.Label className="mb-1" style={{ fontSize: '0.875rem' }}>HSN Code</Form.Label>
                        <Form.Control
                          size="sm"
                          type="text"
                          value={formData.hsnCode}
                          onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                        />
                      </Form.Group>
                    </div>
                    <div className="col-md-3">
                      <Form.Group>
                        <Form.Label className="mb-1" style={{ fontSize: '0.875rem' }}>Form</Form.Label>
                        <Form.Select
                          size="sm"
                          value={formData.form}
                          onChange={(e) => setFormData({ ...formData, form: e.target.value })}
                        >
                          {formTypes.map(f => (
                            <option key={f} value={f}>{f}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </div>
                    <div className="col-md-3">
                      <Form.Group>
                        <Form.Label className="mb-1" style={{ fontSize: '0.875rem' }}>Group</Form.Label>
                        <Form.Select
                          size="sm"
                          value={formData.group}
                          onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                        >
                          {groupTypes.map(g => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN - Additional Details */}
                <div className="col-md-6">
                  <div>
                  {/* Total Strength */}
                  <div className="row mb-2">
                    <div className="col-md-6">
                      <Form.Group>
                        <Form.Label className="mb-1" style={{ fontSize: '0.875rem' }}>Total Strength</Form.Label>
                        <Form.Control
                          size="sm"
                          type="number"
                          value={formData.totalStrength}
                          onChange={(e) => setFormData({ ...formData, totalStrength: parseFloat(e.target.value) || 0 })}
                        />
                      </Form.Group>
                    </div>
                    <div className="col-md-6">
                      <Form.Group>
                        <Form.Label className="mb-1" style={{ fontSize: '0.875rem' }}>Unit</Form.Label>
                        <Form.Select
                          size="sm"
                          value={formData.strengthUnit}
                          onChange={(e) => setFormData({ ...formData, strengthUnit: e.target.value })}
                        >
                          {strengthUnits.map(u => (
                            <option key={u} value={u}>{u}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </div>
                  </div>

                  {/* Total Quantity */}
                  <div className="row mb-2">
                    <div className="col-md-6">
                      <Form.Group>
                        <Form.Label className="mb-1" style={{ fontSize: '0.875rem' }}>Total Quantity</Form.Label>
                        <Form.Control
                          size="sm"
                          type="number"
                          value={formData.totalQuantity}
                          onChange={(e) => setFormData({ ...formData, totalQuantity: parseFloat(e.target.value) || 0 })}
                        />
                      </Form.Group>
                    </div>
                    <div className="col-md-6">
                      <Form.Group>
                        <Form.Label className="mb-1" style={{ fontSize: '0.875rem' }}>Unit</Form.Label>
                        <Form.Select
                          size="sm"
                          value={formData.quantityUnit}
                          onChange={(e) => setFormData({ ...formData, quantityUnit: e.target.value })}
                        >
                          {quantityUnits.map(u => (
                            <option key={u} value={u}>{u}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </div>
                  </div>

                  {/* Number Per Strip, Loose Sale, Dosage */}
                  <div className="row mb-2">
                    <div className="col-md-4">
                      <Form.Group>
                        <Form.Label className="mb-1" style={{ fontSize: '0.875rem' }}>Per Strip</Form.Label>
                        <Form.Control
                          size="sm"
                          type="number"
                          value={formData.numberPerStrip}
                          onChange={(e) => setFormData({ ...formData, numberPerStrip: parseInt(e.target.value) || 1 })}
                        />
                      </Form.Group>
                    </div>
                    <div className="col-md-4">
                      <Form.Group>
                        <Form.Label className="mb-1" style={{ fontSize: '0.875rem' }}>Loose Sale</Form.Label>
                        <Form.Select
                          size="sm"
                          value={formData.looseSale}
                          onChange={(e) => setFormData({ ...formData, looseSale: e.target.value })}
                        >
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </Form.Select>
                      </Form.Group>
                    </div>
                    <div className="col-md-4">
                      <Form.Group>
                        <Form.Label className="mb-1" style={{ fontSize: '0.875rem' }}>Dosage</Form.Label>
                        <Form.Select
                          size="sm"
                          value={formData.dosage}
                          onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                        >
                          {dosageTypes.map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </div>
                  </div>

                  {/* Min Level and Max Level */}
                  <div className="row mb-2">
                    <div className="col-md-6">
                      <Form.Group>
                        <Form.Label className="mb-1" style={{ fontSize: '0.875rem' }}>Min Level (Reorder Level)</Form.Label>
                        <Form.Control
                          size="sm"
                          type="number"
                          placeholder="Enter minimum stock level"
                          value={formData.minLevel}
                          onChange={(e) => setFormData({ ...formData, minLevel: parseInt(e.target.value) || 0 })}
                        />
                      </Form.Group>
                    </div>
                    <div className="col-md-6">
                      <Form.Group>
                        <Form.Label className="mb-1" style={{ fontSize: '0.875rem' }}>Max Level</Form.Label>
                        <Form.Control
                          size="sm"
                          type="number"
                          placeholder="Enter maximum stock level"
                          value={formData.maxLevel}
                          onChange={(e) => setFormData({ ...formData, maxLevel: parseInt(e.target.value) || 0 })}
                        />
                      </Form.Group>
                    </div>
                  </div>

                  <div>
                    {/* Routes Section */}
                    <div className="row mb-2">
                    <div className="col-md-12">
                      <Form.Label className="mb-1" style={{ fontSize: '0.875rem', fontWeight: '600' }}>Routes</Form.Label>
                    </div>
                  </div>
                  <div className="row mb-2">
                    <div className="row mb-2">
                      <Form.Group>
                        <Form.Label className="mb-1" style={{ fontSize: '0.8rem' }}>Route I</Form.Label>
                        <div className="d-flex gap-1 align-items-center">
                          <Form.Select
                            size="sm"
                            value={formData.routeI}
                            onChange={(e) => setFormData({ ...formData, routeI: e.target.value })}
                            style={{ flex: 1 }}
                          >
                            {routeOptions.map(r => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </Form.Select>
                          <Form.Check
                            type="radio"
                            name="routeDefault"
                            checked={formData.routeIDefault}
                            onChange={(e) => setFormData({ ...formData, routeIDefault: e.target.checked, routeIIDefault: false, routeIIIDefault: false, routeIVDefault: false })}
                            style={{ fontSize: '0.75rem' }}
                          />
                        </div>
                      </Form.Group>
                    </div>
                    <div className="col-md-6">
                      <Form.Group>
                        <Form.Label className="mb-1" style={{ fontSize: '0.8rem' }}>Route II</Form.Label>
                        <div className="d-flex gap-1 align-items-center">
                          <Form.Select
                            size="sm"
                            value={formData.routeII}
                            onChange={(e) => setFormData({ ...formData, routeII: e.target.value })}
                            style={{ flex: 1 }}
                          >
                            {routeOptions.map(r => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </Form.Select>
                          <Form.Check
                            type="radio"
                            name="routeDefault"
                            checked={formData.routeIIDefault}
                            onChange={(e) => setFormData({ ...formData, routeIDefault: false, routeIIDefault: e.target.checked, routeIIIDefault: false, routeIVDefault: false })}
                            style={{ fontSize: '0.75rem' }}
                          />
                        </div>
                      </Form.Group>
                    </div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-md-6">
                      <Form.Group>
                        <Form.Label className="mb-1" style={{ fontSize: '0.8rem' }}>Route III</Form.Label>
                        <div className="d-flex gap-1 align-items-center">
                          <Form.Select
                            size="sm"
                            value={formData.routeIII}
                            onChange={(e) => setFormData({ ...formData, routeIII: e.target.value })}
                            style={{ flex: 1 }}
                          >
                            {routeOptions.map(r => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </Form.Select>
                          <Form.Check
                            type="radio"
                            name="routeDefault"
                            checked={formData.routeIIIDefault}
                            onChange={(e) => setFormData({ ...formData, routeIDefault: false, routeIIDefault: false, routeIIIDefault: e.target.checked, routeIVDefault: false })}
                            style={{ fontSize: '0.75rem' }}
                          />
                        </div>
                      </Form.Group>
                    </div>
                    <div className="col-md-6">
                      <Form.Group>
                        <Form.Label className="mb-1" style={{ fontSize: '0.8rem' }}>Route IV</Form.Label>
                        <div className="d-flex gap-1 align-items-center">
                          <Form.Select
                            size="sm"
                            value={formData.routeIV}
                            onChange={(e) => setFormData({ ...formData, routeIV: e.target.value })}
                            style={{ flex: 1 }}
                          >
                            {routeOptions.map(r => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </Form.Select>
                          <Form.Check
                            type="radio"
                            name="routeDefault"
                            checked={formData.routeIVDefault}
                            onChange={(e) => setFormData({ ...formData, routeIDefault: false, routeIIDefault: false, routeIIIDefault: false, routeIVDefault: e.target.checked })}
                            style={{ fontSize: '0.75rem' }}
                          />
                        </div>
                      </Form.Group>
                    </div>
                  </div>
                  </div>

                  <div className="row mb-2">
                      <div className="col-md-12">
                      <Form.Label className="mb-1" style={{ fontSize: '0.875rem', fontWeight: '600' }}>Common Timing</Form.Label>
                    </div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-md-6">
                      <Form.Group>
                        <Form.Label className="mb-1" style={{ fontSize: '0.8rem' }}>Timing I</Form.Label>
                        <div className="d-flex gap-1 align-items-center">
                          <Form.Select
                            size="sm"
                            value={formData.commonTimingI}
                            onChange={(e) => setFormData({ ...formData, commonTimingI: e.target.value })}
                            style={{ flex: 1 }}
                          >
                            {timingOptions.map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </Form.Select>
                          <Form.Check
                            type="radio"
                            name="timingDefault"
                            checked={formData.commonTimingIDefault}
                            onChange={(e) => setFormData({ ...formData, commonTimingIDefault: e.target.checked, commonTimingIIDefault: false, commonTimingIIIDefault: false, commonTimingIVDefault: false })}
                            style={{ fontSize: '0.75rem' }}
                          />
                        </div>
                      </Form.Group>
                    </div>
                    <div className="col-md-6">
                      <Form.Group>
                        <Form.Label className="mb-1" style={{ fontSize: '0.8rem' }}>Timing II</Form.Label>
                        <div className="d-flex gap-1 align-items-center">
                          <Form.Select
                            size="sm"
                            value={formData.commonTimingII}
                            onChange={(e) => setFormData({ ...formData, commonTimingII: e.target.value })}
                            style={{ flex: 1 }}
                          >
                            {timingOptions.map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </Form.Select>
                          <Form.Check
                            type="radio"
                            name="timingDefault"
                            checked={formData.commonTimingIIDefault}
                            onChange={(e) => setFormData({ ...formData, commonTimingIDefault: false, commonTimingIIDefault: e.target.checked, commonTimingIIIDefault: false, commonTimingIVDefault: false })}
                            style={{ fontSize: '0.75rem' }}
                          />
                        </div>
                      </Form.Group>
                    </div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-md-6">
                      <Form.Group>
                        <Form.Label className="mb-1" style={{ fontSize: '0.8rem' }}>Timing III</Form.Label>
                        <div className="d-flex gap-1 align-items-center">
                          <Form.Select
                            size="sm"
                            value={formData.commonTimingIII}
                            onChange={(e) => setFormData({ ...formData, commonTimingIII: e.target.value })}
                            style={{ flex: 1 }}
                          >
                            {timingOptions.map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </Form.Select>
                          <Form.Check
                            type="radio"
                            name="timingDefault"
                            checked={formData.commonTimingIIIDefault}
                            onChange={(e) => setFormData({ ...formData, commonTimingIDefault: false, commonTimingIIDefault: false, commonTimingIIIDefault: e.target.checked, commonTimingIVDefault: false })}
                            style={{ fontSize: '0.75rem' }}
                          />
                        </div>
                      </Form.Group>
                    </div>
                    <div className="col-md-6">
                      <Form.Group>
                        <Form.Label className="mb-1" style={{ fontSize: '0.8rem' }}>Timing IV</Form.Label>
                        <div className="d-flex gap-1 align-items-center">
                          <Form.Select
                            size="sm"
                            value={formData.commonTimingIV}
                            onChange={(e) => setFormData({ ...formData, commonTimingIV: e.target.value })}
                            style={{ flex: 1 }}
                          >
                            {timingOptions.map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </Form.Select>
                          <Form.Check
                            type="radio"
                            name="timingDefault"
                            checked={formData.commonTimingIVDefault}
                            onChange={(e) => setFormData({ ...formData, commonTimingIDefault: false, commonTimingIIDefault: false, commonTimingIIIDefault: false, commonTimingIVDefault: e.target.checked })}
                            style={{ fontSize: '0.75rem' }}
                          />
                        </div>
                      </Form.Group>
                    </div>
                  </div>
                  </div>
                </div>
              </div>

              {/* Checkboxes Section - Full Width at Bottom */}
              <div className="row mb-2 mt-3">
                <div className="col-md-12">
                  <Form.Label className="mb-1" style={{ fontSize: '0.875rem', fontWeight: '600' }}>Medication Classifications</Form.Label>
                  <div className="d-flex flex-wrap gap-3" style={{ fontSize: '0.875rem' }}>
                    <Form.Check
                      type="checkbox"
                      id="highRisks"
                      label="High Risks"
                      checked={formData.highRisks}
                      onChange={(e) => setFormData({ ...formData, highRisks: e.target.checked })}
                    />
                    <Form.Check
                      type="checkbox"
                      id="lasa"
                      label="LASA"
                      checked={formData.lasa}
                      onChange={(e) => setFormData({ ...formData, lasa: e.target.checked })}
                    />
                    <Form.Check
                      type="checkbox"
                      id="narcotic"
                      label="Narcotic"
                      checked={formData.narcotic}
                      onChange={(e) => setFormData({ ...formData, narcotic: e.target.checked })}
                    />
                    <Form.Check
                      type="checkbox"
                      id="psychotropic"
                      label="Psychotropic"
                      checked={formData.psychotropic}
                      onChange={(e) => setFormData({ ...formData, psychotropic: e.target.checked })}
                    />
                    <Form.Check
                      type="checkbox"
                      id="scheduledDrugs"
                      label="Scheduled Drugs"
                      checked={formData.scheduledDrugs}
                      onChange={(e) => setFormData({ ...formData, scheduledDrugs: e.target.checked })}
                    />
                    <Form.Check
                      type="checkbox"
                      id="toChoosee"
                      label="to choosee"
                      checked={formData.toChoosee}
                      onChange={(e) => setFormData({ ...formData, toChoosee: e.target.checked })}
                    />
                    <Form.Check
                      type="checkbox"
                      id="natamycinEyeDrops"
                      label="NATAMYCIN EYE DROPS"
                      checked={formData.natamycinEyeDrops}
                      onChange={(e) => setFormData({ ...formData, natamycinEyeDrops: e.target.checked })}
                    />
                    <Form.Check
                      type="checkbox"
                      id="truleneMesh"
                      label="TRULENE MESH 15*15CM"
                      checked={formData.truleneMesh}
                      onChange={(e) => setFormData({ ...formData, truleneMesh: e.target.checked })}
                    />
                  </div>
                </div>
              </div>
            </Form>
          </Modal.Body>
          <Modal.Footer style={{ padding: '10px 15px' }}>
            <Button variant="secondary" onClick={() => setShowModal(false)} size="sm">
              <i className="fas fa-times"></i> Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} size="sm">
              <i className="fas fa-save"></i> {isEdit ? 'Update' : 'Save'}
            </Button>
        </Modal.Footer>
      </Modal>

      {/* Batch Adding Modal */}
      <Modal show={showBatchModal} onHide={() => setShowBatchModal(false)} centered size="lg" backdrop="static" keyboard={false}>
        <Modal.Header closeButton style={{ background: 'var(--page-header-bg)', color: 'var(--page-header-text)', padding: '10px 15px' }}>
          <Modal.Title style={{ fontSize: '16px', fontWeight: '600' }}>
            <i className="fas fa-box"></i> Add Batch Details for {savedMedicineName}
          </Modal.Title>
        </Modal.Header>
          <Modal.Body style={{ padding: '15px', maxHeight: '70vh', overflowY: 'auto' }}>
            <Form>
              <div className="row g-2">
                {/* Batch Number */}
                <div className="col-md-6">
                  <Form.Group>
                    <Form.Label>Batch Number <span style={{ color: 'red' }}>*</span></Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter batch number"
                      value={batchFormData.batchNo}
                      onChange={(e) => setBatchFormData({ ...batchFormData, batchNo: e.target.value })}
                      size="sm"
                    />
                  </Form.Group>
                </div>

                {/* Manufacturing Date */}
                <div className="col-md-6">
                  <Form.Group>
                    <Form.Label>Manufacturing Date <span style={{ color: 'red' }}>*</span></Form.Label>
                    <Form.Control
                      type="date"
                      value={batchFormData.mfgDate}
                      onChange={(e) => setBatchFormData({ ...batchFormData, mfgDate: e.target.value })}
                      size="sm"
                    />
                  </Form.Group>
                </div>

                {/* Expiry Date */}
                <div className="col-md-6">
                  <Form.Group>
                    <Form.Label>Expiry Date <span style={{ color: 'red' }}>*</span></Form.Label>
                    <Form.Control
                      type="date"
                      value={batchFormData.expiryDate}
                      onChange={(e) => setBatchFormData({ ...batchFormData, expiryDate: e.target.value })}
                      size="sm"
                    />
                  </Form.Group>
                </div>

                {/* Cost */}
                <div className="col-md-6">
                  <Form.Group>
                    <Form.Label>Cost</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="Enter cost"
                      value={batchFormData.cost}
                      onChange={(e) => setBatchFormData({ ...batchFormData, cost: e.target.value })}
                      size="sm"
                      step="0.01"
                    />
                  </Form.Group>
                </div>

                {/* MRP */}
                <div className="col-md-6">
                  <Form.Group>
                    <Form.Label>MRP</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="Enter MRP"
                      value={batchFormData.mrp}
                      onChange={(e) => setBatchFormData({ ...batchFormData, mrp: e.target.value })}
                      size="sm"
                      step="0.01"
                    />
                  </Form.Group>
                </div>

                {/* Discount */}
                <div className="col-md-6">
                  <Form.Group>
                    <Form.Label>Discount (%)</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="Enter discount"
                      value={batchFormData.disc}
                      onChange={(e) => setBatchFormData({ ...batchFormData, disc: e.target.value })}
                      size="sm"
                      step="0.01"
                    />
                  </Form.Group>
                </div>

                {/* SGST */}
                <div className="col-md-4">
                  <Form.Group>
                    <Form.Label>SGST (%)</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="SGST"
                      value={batchFormData.sgstPer}
                      onChange={(e) => setBatchFormData({ ...batchFormData, sgstPer: e.target.value, igstPer: '' })}
                      size="sm"
                      step="0.01"
                      disabled={isBatchIgstActive}
                    />
                  </Form.Group>
                </div>

                {/* CGST */}
                <div className="col-md-4">
                  <Form.Group>
                    <Form.Label>CGST (%)</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="CGST"
                      value={batchFormData.cgstPer}
                      onChange={(e) => setBatchFormData({ ...batchFormData, cgstPer: e.target.value, igstPer: '' })}
                      size="sm"
                      step="0.01"
                      disabled={isBatchIgstActive}
                    />
                  </Form.Group>
                </div>

                {/* IGST */}
                <div className="col-md-4">
                  <Form.Group>
                    <Form.Label>IGST (%)</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="IGST"
                      value={batchFormData.igstPer}
                      onChange={(e) => setBatchFormData({ ...batchFormData, igstPer: e.target.value, sgstPer: '', cgstPer: '' })}
                      size="sm"
                      step="0.01"
                      disabled={isBatchSgstOrCgstActive}
                    />
                  </Form.Group>
                </div>
              </div>
            </Form>
          </Modal.Body>
          <Modal.Footer style={{ padding: '10px 15px' }}>
            <Button variant="secondary" onClick={() => setShowBatchModal(false)} size="sm">
              <i className="fas fa-times"></i> Cancel
            </Button>
            <Button variant="primary" onClick={handleBatchSave} size="sm">
              <i className="fas fa-save"></i> Save Batch
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
  );
};

export default MedicineItemMaster;

