export const clearSessionLogoutArtifacts = (): void => {
  const sessionKeys = [
    'token',
    'roleId',
    'selectedStore',
    'selectedMedicalStore',
    'selectedNonMedicalStore',
    'pharmacySubModuleData',
    'prepareOrderViewType',
    'expireTime',
  ];

  sessionKeys.forEach((key) => {
    sessionStorage.removeItem(key);
  });

  const localKeys = ['expireTime', 'pharmacyExpandedMenuId'];
  localKeys.forEach((key) => {
    localStorage.removeItem(key);
  });
};
