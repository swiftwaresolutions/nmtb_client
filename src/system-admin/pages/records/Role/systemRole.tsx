import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Table, Tabs, Tab, Badge, Spinner, Alert, Accordion } from 'react-bootstrap';
import { PencilSquare, TrashFill, Save, X, CheckCircle } from 'react-bootstrap-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../state/store';
import { SystemAdminApiService } from '../../../../api/system-admin/system-admin-api-service';
import {
  showSuccessToast,
  showErrorToast,
  showValidationError,
  showConfirmDialog,
} from '../../../../utils/alertUtil';
import SearchInput from '../../../../components/SearchInput';
import { useTableSearch } from '../../../../hooks/useTableSearch';

// Interfaces
interface MenuItemData {
  menuId: number;
  menuName: string;
}

interface HeaderData {
  headerId: number;
  headerName: string;
  menus: MenuItemData[];
}

interface SubModuleData {
  subModId: number;
  subModName: string;
  headers: HeaderData[];
}

interface ModuleData {
  modId: number;
  modName: string;
  modFullName: string;
  subModules: SubModuleData[];
}

interface Role {
  roleId: number;
  roleName: string;
  roleDescription: string;
  roleStatus: number;
}

interface RoleRightAssignment {
  roleId: number;
  uid: number;
  permissions: Array<{
    modId: number;
    subModIds: Array<{
      subModId: number;
      headerIds: Array<{
        headerId: number;
        menuIds: number[];
      }>;
    }>;
  }>;
}

const SystemRole: React.FC = () => {
  // Get user ID from Redux
  const userId = useSelector((state: RootState) => state.loginData.id);

  // State Management
  const [activeTab, setActiveTab] = useState<'roles' | 'assign'>('roles');
  const [roles, setRoles] = useState<Role[]>([]);
  const [modules, setModules] = useState<ModuleData[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedModule, setSelectedModule] = useState<ModuleData | null>(null);

  console.log("modules" + modules)

  modules.forEach((module, index) => {
  console.log(`Module ${index}:`, module);
});

  // Form State - Role Management
  const [roleForm, setRoleForm] = useState({
    roleName: '',
    roleDescription: '',
    roleStatus: 1,
  });

  // Rights Assignment State — composite key "subModId_menuId" to scope selections per sub-module
  const [selectedMenuIds, setSelectedMenuIds] = useState<Set<string>>(new Set());

  const menuKey = (subModId: number, menuId: number) => `${subModId}_${menuId}`;

  // Search state
  const {
    filteredData: filteredRoles,
    searchTerm: roleSearchTerm,
    setSearchTerm: setRoleSearchTerm,
    resultCount: roleResultCount,
    totalCount: roleTotalCount,
  } = useTableSearch({
    data: roles,
    searchFields: ['roleName', 'roleDescription'],
  });

  // Load data on mount
  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    setLoading(true);
    try {
      // Fetch roles from API
      const systemAdminApiService = new SystemAdminApiService();
      const rolesResponse = await systemAdminApiService.fetchAllUserRoles();


      if (rolesResponse && Array.isArray(rolesResponse)) {
        const mappedRoles: Role[] = rolesResponse.map((role: any) => ({
          roleId: role.id,
          roleName: role.roleName,
          roleDescription: role.description || '',
          roleStatus: role.isActive,
        }));
        setRoles(mappedRoles);
      }

      // Fetch modules from API
      const modulesResponse = await systemAdminApiService.fetchAllUserModules();

      if (modulesResponse && Array.isArray(modulesResponse)) {
        setModules(modulesResponse);
      }

    } catch (error: any) {
      console.error('Error loading data:', error);
      showErrorToast('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Role Management Handlers
  const handleRoleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setRoleForm((prev) => ({
      ...prev,
      [name]: name === 'roleStatus' ? Number(value) : value,
    }));
  };

  const handleSaveRole = async () => {
    if (!roleForm.roleName.trim()) {
      showValidationError('Permission name is required');
      return;
    }

    setLoading(true);
    try {
      if (editingRoleId) {
        // Update role
        const updatedRoles = roles.map((r) =>
          r.roleId === editingRoleId
            ? { ...r, ...roleForm }
            : r
        );
        setRoles(updatedRoles);
        showSuccessToast('Permission updated successfully');
        setEditingRoleId(null);
      } else {
        // Create new role via API
        const systemAdminApiService = new SystemAdminApiService();
        const response = await systemAdminApiService.saveAdminUserRole({
          roleName: roleForm.roleName.trim(),
        });

        if (response && response.id !== undefined) {
          const newRole: Role = {
            roleId: response.id,
            ...roleForm,
          };
          setRoles([...roles, newRole]);
          showSuccessToast(response.message || 'Permission created successfully');
        } else {
          showSuccessToast('Permission created successfully');
        }
      }

      // Reset form
      setRoleForm({
        roleName: '',
        roleDescription: '',
        roleStatus: 1,
      });
    } catch (error: any) {
      console.error('Error saving Permission:', error);
      showErrorToast('Failed to save Permission');
    } finally {
      setLoading(false);
    }
  };

  const handleEditRole = (role: Role) => {
    setEditingRoleId(role.roleId);
    setRoleForm({
      roleName: role.roleName,
      roleDescription: role.roleDescription,
      roleStatus: role.roleStatus,
    });
  };

  const handleDeleteRole = async (roleId: number) => {
    const result = await showConfirmDialog(
      'Are you sure you want to delete this Permission?',
      'Confirm Delete',
      'Delete',
      'Cancel'
    );

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      setRoles(roles.filter((r) => r.roleId !== roleId));
      showSuccessToast('Permission deleted successfully');
    } catch (error: any) {
      console.error('Error deleting Permission:', error);
      showErrorToast('Failed to delete Permission');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingRoleId(null);
    setRoleForm({
      roleName: '',
      roleDescription: '',
      roleStatus: 1,
    });
  };

  // Rights Assignment Handlers
  const handleRoleSelection = async (role: Role) => {
    setSelectedRole(role);
    // Reset selected menus when role changes
    setSelectedMenuIds(new Set());
    setSelectedModule(null);

    // Fetch pre-assigned menus for this role
    try {
      const systemAdminApiService = new SystemAdminApiService();
      const assignedModules = await systemAdminApiService.fetchAllUserModulesByRoleId(role.roleId);

      if (assignedModules && Array.isArray(assignedModules)) {
        const menuIds = new Set<string>();
        assignedModules.forEach((mod: any) => {
          if (mod.subModIds && Array.isArray(mod.subModIds)) {
            mod.subModIds.forEach((subMod: any) => {
              if (subMod.headerIds && Array.isArray(subMod.headerIds)) {
                subMod.headerIds.forEach((header: any) => {
                  if (header.menuIds && Array.isArray(header.menuIds)) {
                    header.menuIds.forEach((menuId: number) => {
                      menuIds.add(menuKey(subMod.subModId, menuId));
                    });
                  }
                });
              }
            });
          }
        });
        setSelectedMenuIds(menuIds);
      }
    } catch (error: any) {
      console.error('Error fetching role assignments:', error);
      // Continue without pre-selected menus
    }
  };

  const handleModuleSelection = (module: ModuleData) => {
    setSelectedModule(module);
  };

  const handleMenuToggle = (subModId: number, menuId: number) => {
    const key = menuKey(subModId, menuId);
    const newSelectedMenuIds = new Set(selectedMenuIds);
    if (newSelectedMenuIds.has(key)) {
      newSelectedMenuIds.delete(key);
    } else {
      newSelectedMenuIds.add(key);
    }
    setSelectedMenuIds(newSelectedMenuIds);
  };

  const handleSelectAllHeader = (subModId: number, header: HeaderData) => {
    const newSelectedMenuIds = new Set(selectedMenuIds);
    header.menus.forEach((menu) => {
      newSelectedMenuIds.add(menuKey(subModId, menu.menuId));
    });
    setSelectedMenuIds(newSelectedMenuIds);
  };

  const handleDeselectAllHeader = (subModId: number, header: HeaderData) => {
    const newSelectedMenuIds = new Set(selectedMenuIds);
    header.menus.forEach((menu) => {
      newSelectedMenuIds.delete(menuKey(subModId, menu.menuId));
    });
    setSelectedMenuIds(newSelectedMenuIds);
  };

  const handleSelectAllModule = (module: ModuleData) => {
    const newSelectedMenuIds = new Set(selectedMenuIds);
    module.subModules.forEach((subModule) => {
      subModule.headers.forEach((header) => {
        header.menus.forEach((menu) => {
          newSelectedMenuIds.add(menuKey(subModule.subModId, menu.menuId));
        });
      });
    });
    setSelectedMenuIds(newSelectedMenuIds);
  };

  const handleDeselectAllModule = (module: ModuleData) => {
    const newSelectedMenuIds = new Set(selectedMenuIds);
    module.subModules.forEach((subModule) => {
      subModule.headers.forEach((header) => {
        header.menus.forEach((menu) => {
          newSelectedMenuIds.delete(menuKey(subModule.subModId, menu.menuId));
        });
      });
    });
    setSelectedMenuIds(newSelectedMenuIds);
  };

  const handleSaveRoleRights = async () => {
    if (!selectedRole) {
      showValidationError('Please select a role');
      return;
    }

    if (selectedMenuIds.size === 0) {
      showValidationError('Please select at least one menu');
      return;
    }

    setLoading(true);
    try {
      // Build the nested permissions structure from selected menu IDs
      const permissions: RoleRightAssignment['permissions'] = [];

      modules.forEach((module) => {
        const modPermission: RoleRightAssignment['permissions'][0] = {
          modId: module.modId,
          subModIds: [],
        };

        module.subModules.forEach((subModule) => {
          const subModPermission: RoleRightAssignment['permissions'][0]['subModIds'][0] = {
            subModId: subModule.subModId,
            headerIds: [],
          };

          subModule.headers.forEach((header) => {
            const selectedMenusInHeader = header.menus
              .filter((menu) => selectedMenuIds.has(menuKey(subModule.subModId, menu.menuId)))
              .map((menu) => menu.menuId);

            if (selectedMenusInHeader.length > 0) {
              subModPermission.headerIds.push({
                headerId: header.headerId,
                menuIds: selectedMenusInHeader,
              });
            }
          });

          if (subModPermission.headerIds.length > 0) {
            modPermission.subModIds.push(subModPermission);
          }
        });

        if (modPermission.subModIds.length > 0) {
          permissions.push(modPermission);
        }
      });

      // Prepare payload
      const payload: RoleRightAssignment = {
        roleId: selectedRole.roleId,
        uid: userId,
        permissions,
      };

      console.log('Saving role rights:', payload);
      const systemAdminApiService = new SystemAdminApiService();
      await systemAdminApiService.saveUserRoleRights(payload);

      showSuccessToast(
        `Rights assigned to ${selectedRole.roleName} successfully`
      );
      setSelectedRole(null);
      setSelectedModule(null);
      setSelectedMenuIds(new Set());
    } catch (error: any) {
      console.error('Error saving rights:', error);
      showErrorToast('Failed to save rights');
    } finally {
      setLoading(false);
    }
  };

  const getTotalAssignedMenus = () => {
    return selectedMenuIds.size;
  };

  const getModuleMenuCount = (module: ModuleData) => {
    let count = 0;
    module.subModules.forEach((subModule) => {
      subModule.headers.forEach((header) => {
        header.menus.forEach((menu) => {
          if (selectedMenuIds.has(menuKey(subModule.subModId, menu.menuId))) {
            count++;
          }
        });
      });
    });
    return count;
  };

  return (
    <Container fluid className="py-2" style={{ height: 'calc(100vh - 80px)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <Row className="mb-2 flex-shrink-0">
        <Col>
          <h3 className="mb-0">
            <i className="fas fa-shield-alt me-2"></i>
            User Permission
          </h3>
        </Col>
      </Row>

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k as 'roles' | 'assign')}
        className="mb-4"
      >
        {/* Manage Roles Tab */}
        <Tab eventKey="roles" title="Permissions" className="p-3">
          <Row>
            <Col lg={5}>
              <Card className="shadow-sm">
                <Card.Header className="bg-primary text-white">
                  <h5 className="mb-0">
                    {editingRoleId ? 'Edit Permission' : 'Add New Permission'}
                  </h5>
                </Card.Header>
                <Card.Body>
                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Permission Name <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="roleName"
                        value={roleForm.roleName}
                        onChange={handleRoleInputChange}
                        placeholder="Enter role name"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        name="roleDescription"
                        value={roleForm.roleDescription}
                        onChange={handleRoleInputChange}
                        placeholder="Enter role description"
                        rows={3}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Status</Form.Label>
                      <Form.Select
                        name="roleStatus"
                        value={roleForm.roleStatus}
                        onChange={handleRoleInputChange}
                      >
                        <option value={1}>Active</option>
                        <option value={0}>Inactive</option>
                      </Form.Select>
                    </Form.Group>

                    <div className="d-flex gap-2">
                      <Button
                        variant="success"
                        onClick={handleSaveRole}
                        disabled={loading}
                        className="flex-grow-1"
                      >
                        <Save className="me-2" />
                        {editingRoleId ? 'Update' : 'Create'} Permissions
                      </Button>
                      {editingRoleId && (
                        <Button
                          variant="outline-secondary"
                          onClick={handleCancelEdit}
                          disabled={loading}
                        >
                          <X />
                        </Button>
                      )}
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={7}>
              <Card className="shadow-sm">
                <Card.Header className="bg-light">
                  <h5 className="mb-0">
                    <i className="fas fa-list me-2"></i>
                    All Permissions ({filteredRoles.length})
                  </h5>
                </Card.Header>
                <Card.Body>
                  <div className="mb-3">
                    <SearchInput
                      searchTerm={roleSearchTerm}
                      onSearchChange={setRoleSearchTerm}
                      placeholder="Search Permissions..."
                      resultCount={roleResultCount}
                      totalCount={roleTotalCount}
                    />
                  </div>

                  {loading ? (
                    <div className="text-center py-4">
                      <Spinner animation="border" />
                    </div>
                  ) : filteredRoles.length === 0 ? (
                    <Alert variant="info" className="mb-0">
                      No permissions found
                    </Alert>
                  ) : (
                    <Table striped bordered hover responsive>
                      <thead>
                        <tr>
                          <th>*</th>
                          <th>Permission Name</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRoles.map((role: Role, idx: number) => (
                          <tr
                            key={role.roleId}
                            className={
                              editingRoleId === role.roleId ? 'table-warning' : ''
                            }
                          >
                            <td>{idx + 1}</td>
                            <td>
                              <strong>{role.roleName}</strong>
                              <br />
                              <small className="text-muted">
                                {role.roleDescription}
                              </small>
                            </td>
                            <td>
                              <Badge
                                bg={role.roleStatus === 1 ? 'success' : 'danger'}
                              >
                                {role.roleStatus === 1 ? 'Active' : 'Inactive'}
                              </Badge>
                            </td>
                            <td>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="me-2"
                                onClick={() => handleEditRole(role)}
                              >
                                <PencilSquare /> Edit
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDeleteRole(role.roleId)}
                              >
                                <TrashFill /> Delete
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        {/* Assign Rights Tab */}
        <Tab eventKey="assign" title="Permissions Rights" className="p-2" style={{ height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Summary Bar */}
          {selectedRole && (
            <div className="mb-2 p-2 bg-light border rounded d-flex justify-content-between align-items-center flex-shrink-0">
              <div>
                <span className="fw-bold">Permission Rights to: </span>
                <Badge bg="primary" className="me-3 px-2 py-1" style={{ fontSize: '0.9rem' }}>{selectedRole.roleName}</Badge>
                <span className="fw-bold">Selected Menus: </span>
                <Badge bg="info" className="px-2 py-1" style={{ fontSize: '0.9rem' }}>{getTotalAssignedMenus()}</Badge>
              </div>
              <Button
                variant="success"
                onClick={handleSaveRoleRights}
                disabled={loading || selectedMenuIds.size === 0}
              >
                <Save className="me-2" />
                Save Permissions
              </Button>
            </div>
          )}

          <Row className="flex-grow-1" style={{ minHeight: 0, overflow: 'hidden' }}>
            {/* Column 1: Select Role */}
            <Col lg={2} className="d-flex flex-column h-100">
              <Card className="shadow-sm flex-grow-1 d-flex flex-column" style={{ minHeight: 0 }}>
                <Card.Header className="bg-primary text-white flex-shrink-0">
                  <h6 className="mb-0">Select Permission</h6>
                </Card.Header>
                <Card.Body style={{ overflowY: 'auto', flex: 1, minHeight: 0 }} className="p-2">
                  {roles.length === 0 ? (
                    <Alert variant="info" className="mb-0 py-2">No Permissions</Alert>
                  ) : (
                    roles.map((role) => (
                      <Button
                        key={role.roleId}
                        variant={
                          selectedRole?.roleId === role.roleId
                            ? 'primary'
                            : 'outline-primary'
                        }
                        className="w-100 mb-2 text-start py-1"
                        size="sm"
                        onClick={() => handleRoleSelection(role)}
                      >
                        {role.roleName}
                        {selectedRole?.roleId === role.roleId && (
                          <CheckCircle className="float-end" />
                        )}
                      </Button>
                    ))
                  )}
                </Card.Body>
              </Card>
            </Col>

            {/* Column 2: Modules */}
            <Col lg={3} className="d-flex flex-column h-100">
              <Card className="shadow-sm flex-grow-1 d-flex flex-column" style={{ minHeight: 0 }}>
                <Card.Header className="bg-info text-white flex-shrink-0">
                  <h6 className="mb-0">Modules</h6>
                </Card.Header>
                <Card.Body style={{ overflowY: 'auto', flex: 1, minHeight: 0 }} className="p-2">
                  {!selectedRole ? (
                    <Alert variant="warning" className="mb-0 py-2">
                      Select a Permission first
                    </Alert>
                  ) : modules.length === 0 ? (
                    <Alert variant="info" className="mb-0 py-2">No modules</Alert>
                  ) : (
                    modules.map((module) => (
                      <Button
                        key={module.modId}
                        variant={
                          selectedModule?.modId === module.modId
                            ? 'info'
                            : 'outline-info'
                        }
                        className="w-100 mb-2 text-start py-1"
                        size="sm"
                        onClick={() => handleModuleSelection(module)}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <span>{module.modFullName}</span>
                          {getModuleMenuCount(module) > 0 && (
                            <Badge bg="success" className="ms-2 px-2 py-1" style={{ fontSize: '0.85rem' }}>
                              {getModuleMenuCount(module)}
                            </Badge>
                          )}
                        </div>
                        {selectedModule?.modId === module.modId && (
                          <CheckCircle className="float-end mt-1" />
                        )}
                      </Button>
                    ))
                  )}
                </Card.Body>
              </Card>
            </Col>

            {/* Column 3: Menus & Submenus */}
            <Col lg={7} className="d-flex flex-column h-100">
              <Card className="shadow-sm flex-grow-1 d-flex flex-column" style={{ minHeight: 0 }}>
                <Card.Header className="bg-success text-white flex-shrink-0">
                  <div className="d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">
                      {selectedModule ? `Menus - ${selectedModule.modFullName}` : 'Menus'}
                    </h6>
                    {selectedModule && (
                      <div>
                        <Button
                          variant="light"
                          size="sm"
                          className="me-2"
                          onClick={() => handleSelectAllModule(selectedModule)}
                        >
                          Select All
                        </Button>
                        <Button
                          variant="outline-light"
                          size="sm"
                          onClick={() => handleDeselectAllModule(selectedModule)}
                        >
                          Deselect All
                        </Button>
                      </div>
                    )}
                  </div>
                </Card.Header>
                <Card.Body style={{ overflowY: 'auto', flex: 1, minHeight: 0 }}>
                  {!selectedRole ? (
                    <Alert variant="warning">
                      Please select a Permission first
                    </Alert>
                  ) : !selectedModule ? (
                    <Alert variant="info">
                      Please select a module to view menus
                    </Alert>
                  ) : selectedModule.subModules.length === 0 ? (
                    <Alert variant="info">No menus available</Alert>
                  ) : (
                    <Accordion defaultActiveKey={['0']} alwaysOpen>
                      {selectedModule.subModules.map((subModule, subModIndex) => {
                        // Calculate selected menus count for this sub-module
                        const subModuleSelectedCount = subModule.headers.reduce((count, header) => {
                          return count + header.menus.filter(m => selectedMenuIds.has(menuKey(subModule.subModId, m.menuId))).length;
                        }, 0);
                        const subModuleTotalCount = subModule.headers.reduce((count, header) => {
                          return count + header.menus.length;
                        }, 0);

                        return (
                          <Accordion.Item
                            key={subModule.subModId}
                            eventKey={`${subModIndex}`}
                          >
                            <Accordion.Header>
                              <div className="d-flex justify-content-between align-items-center w-100 me-3">
                                <span className="fw-bold text-primary">{subModule.subModName}</span>
                                <Badge bg="primary" className="ms-2 px-2 py-1" style={{ fontSize: '0.85rem' }}>
                                  {subModuleSelectedCount}/{subModuleTotalCount}
                                </Badge>
                              </div>
                            </Accordion.Header>
                            <Accordion.Body className="py-2 px-2">
                              {subModule.headers.length > 0 ? (
                                <Accordion defaultActiveKey={['0']} alwaysOpen>
                                  {subModule.headers.map((header, headerIndex) => (
                                    <Accordion.Item
                                      key={header.headerId}
                                      eventKey={`${headerIndex}`}
                                    >
                                      <Accordion.Header>
                                        <div className="d-flex justify-content-between align-items-center w-100 me-3">
                                          <span className="fw-semibold">{header.headerName}</span>
                                          <Badge bg="secondary" className="ms-2 px-2 py-1" style={{ fontSize: '0.85rem' }}>
                                            {header.menus.filter(m => selectedMenuIds.has(menuKey(subModule.subModId, m.menuId))).length}/{header.menus.length}
                                          </Badge>
                                        </div>
                                      </Accordion.Header>
                                      <Accordion.Body className="py-2">
                                        <div className="mb-2">
                                          <Button
                                            variant="outline-success"
                                            size="sm"
                                            className="me-2"
                                            onClick={() => handleSelectAllHeader(subModule.subModId, header)}
                                          >
                                            Select All
                                          </Button>
                                          <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => handleDeselectAllHeader(subModule.subModId, header)}
                                          >
                                            Deselect All
                                          </Button>
                                        </div>
                                        <Row>
                                          {header.menus.map((menu) => (
                                            <Col md={6} key={menu.menuId} className="mb-1">
                                              <Form.Check
                                                type="checkbox"
                                                id={`menu_${subModule.subModId}_${menu.menuId}`}
                                                label={menu.menuName}
                                                checked={selectedMenuIds.has(menuKey(subModule.subModId, menu.menuId))}
                                                onChange={() => handleMenuToggle(subModule.subModId, menu.menuId)}
                                              />
                                            </Col>
                                          ))}
                                        </Row>
                                      </Accordion.Body>
                                    </Accordion.Item>
                                  ))}
                                </Accordion>
                              ) : (
                                <Alert variant="info" className="mb-0">
                                  No headers available
                                </Alert>
                              )}
                            </Accordion.Body>
                          </Accordion.Item>
                        );
                      })}
                    </Accordion>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default SystemRole;