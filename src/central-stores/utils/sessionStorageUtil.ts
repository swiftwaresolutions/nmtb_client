/**
 * Central Stores Session Storage Utility
 * 
 * Provides standardized functions for reading store context from session storage
 * with dual-key fallback pattern to support both Central Stores and Pharmacy Stores modules.
 * 
 * Session Keys:
 * - 'selectedStore': Central Stores module context
 * - 'pharmacySubModuleData': Pharmacy Stores module context
 */

export interface SubModuleState {
  subModId: number;
  subModName: string;
  modGroupId: number;
  modGroupName: string;
  masterId: number;
}

/**
 * Get store data from session storage with dual-key fallback
 * 
 * Tries 'selectedStore' first, then falls back to 'pharmacySubModuleData'
 * Returns null if neither key contains valid data
 * 
 * @returns SubModuleState or null if no valid data found
 */
export const getStoreData = (): SubModuleState | null => {
  const parseStoreData = (raw: string | null): SubModuleState | null => {
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as SubModuleState;
    } catch {
      return null;
    }
  };

  const centralStoreData = parseStoreData(sessionStorage.getItem('selectedStore'));
  if (centralStoreData) {
    return centralStoreData;
  }

  return parseStoreData(sessionStorage.getItem('pharmacySubModuleData'));
};

/**
 * Get store master ID (storeId/phModId) with validation
 * 
 * Resolves store context and returns the masterId as a positive number
 * Returns 0 if context is missing or invalid
 * 
 * @returns number - masterId if valid, 0 if missing/invalid
 */
export const getStoreId = (): number => {
  const storeData = getStoreData();
  const masterId = Number(storeData?.masterId ?? 0);
  
  // Validate that masterId is a positive number
  if (typeof masterId === 'number' && masterId > 0) {
    return masterId;
  }
  
  return 0;
};

/**
 * Store data type inference helper
 * Returns an object with both masterId and phModId (same value for Central Stores)
 * Useful for APIs that require both parameters
 * 
 * @returns { masterId: number; phModId: number } with fallback to 0
 */
export const getStoreIdPair = (): { masterId: number; phModId: number } => {
  const storeData = getStoreData();
  const masterId = Number(storeData?.masterId ?? 0);
  
  return {
    masterId,
    phModId: masterId,
  };
};

/**
 * Clear store context from session storage
 * Clears BOTH Central Stores and Pharmacy Stores keys
 */
export const clearStoreContext = (): void => {
  sessionStorage.removeItem('selectedStore');
  sessionStorage.removeItem('pharmacySubModuleData');
};

/**
 * Clear only Central Stores context
 */
export const clearCentralStoresContext = (): void => {
  sessionStorage.removeItem('selectedStore');
};

/**
 * Clear only Pharmacy Stores context
 */
export const clearPharmacyStoresContext = (): void => {
  sessionStorage.removeItem('pharmacySubModuleData');
};
