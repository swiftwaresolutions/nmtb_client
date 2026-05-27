import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Table, Row, Col } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../../state/store';
import PageHeader from '../../../../../components/PageHeader';
import { faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import '../../../../../style/commonStyle.css';
import NonMedicalStoresApiService from '../../../../../api/central-stores/non-medical-stores-api-service';
import {
    showSuccessToast,
    showErrorToast,
    showErrorModal,
    showValidationError,
} from '../../../../../utils/alertUtil';
import {
    PencilSquare,
    Clock,
    CheckCircle,
} from 'react-bootstrap-icons';

interface GroupItem {
    id: number;
    name: string;
    description: string;
    isBlocked: number;
    blockedUid: number;
    blockedDateTime: string;
    dateTime: string;
    storeId: number;
    uid: number;
}


const GroupMaster = () => {
    const apiService = new NonMedicalStoresApiService();
    const loginData = useSelector((state: RootState) => state.loginData);

    // Get sub-module data from session storage
    const [subModuleData, setSubModuleData] = useState<any>(null);

    const [groups, setGroups] = useState<GroupItem[]>([]);
    const [newGroup, setNewGroup] = useState({
        groupName: '',
        description: '',
    });
    const [editingId, setEditingId] = useState<number | null>(null);
    const [showBlocked, setShowBlocked] = useState(false);
    const [loading, setLoading] = useState(false);

    // Fetch sub-module data from session storage
    useEffect(() => {
        const storedData = sessionStorage.getItem('selectedStore');
        if (storedData) {
            setSubModuleData(JSON.parse(storedData));
        }
    }, []);

    // Fetch all groups from API
    const fetchGroups = async () => {
        if (!subModuleData?.masterId) return;

        setLoading(true);
        try {
            const res = await apiService.fetchGroupsByStoreId(subModuleData.masterId);
            setGroups(Array.isArray(res) ? res : []);
        } catch (err) {
            console.error('Error fetching groups:', err);
            showErrorToast('Failed to load groups');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (subModuleData?.masterId) {
            fetchGroups();
        }
        // eslint-disable-next-line
    }, [subModuleData]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setNewGroup({
            ...newGroup,
            [name]: value
        });
    };

    const handleSubmit = async () => {
        if (!newGroup.groupName.trim()) {
            showValidationError('Group name is required.');
            return;
        }

        if (!subModuleData?.masterId) {
            showValidationError('Store information not available');
            return;
        }

        setLoading(true);
        try {
            if (editingId) {
                await apiService.updateGroup(editingId, {
                    name: newGroup.groupName,
                    description: newGroup.description,
                    isBlocked: 0,
                    storeId: subModuleData.masterId,
                    uid: loginData.id,
                });
                showSuccessToast('Group updated successfully!');
                setEditingId(null);
                fetchGroups();
            } else {
                await apiService.saveGroup({
                    name: newGroup.groupName,
                    description: newGroup.description,
                    isBlocked: 0,
                    storeId: subModuleData.masterId,
                    uid: loginData.id,
                });
                showSuccessToast('Group created successfully!');
                fetchGroups();
            }

            setNewGroup({ groupName: '', description: '' });
        } catch (err: any) {
            console.error('Error saving group:', err);
            const errorMsg = err?.response?.data?.error || err?.message || 'Failed to save group. Please try again.';
            showErrorModal(errorMsg, 'Error Saving Group');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (group: GroupItem) => {
        setNewGroup({
            groupName: group.name,
            description: group.description || ''
        });
        setEditingId(group.id);
    };

    const handleCancel = () => {
        setNewGroup({ groupName: '', description: '' });
        setEditingId(null);
    };

    const handleBlock = async (id: number) => {
        try {
            setLoading(true);
            await apiService.blockGroup({ id, blockedUid: loginData.id || 0 });
            fetchGroups();
            showSuccessToast('Group blocked successfully');
        } catch (err) {
            console.error('Error blocking group:', err);
            showErrorToast('Failed to block group');
        } finally {
            setLoading(false);
        }
    };

    const handleUnblock = async (id: number) => {
        try {
            setLoading(true);
            await apiService.unblockGroup({ id, uid: loginData.id || 0 });
            fetchGroups();
            showSuccessToast('Group unblocked successfully');
        } catch (err) {
            console.error('Error unblocking group:', err);
            showErrorToast('Failed to unblock group');
        } finally {
            setLoading(false);
        }
    };

    const filteredGroups = groups.filter((g) => {
        const isGroupBlocked = g.isBlocked === 1;
        return showBlocked ? isGroupBlocked : !isGroupBlocked;
    });

    return (
        <>
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', minHeight: 0, overflow: 'hidden' }}>
                    {/* ---------------- HEADER ---------------- */}
                    <PageHeader
                        icon={faLayerGroup}
                        title={editingId ? 'Edit Group' : 'Add Group'}
                        subtitle={editingId ? 'Modify existing group details' : 'Create a new group for non-medical store'}
                    />

                    {/* ---------------- BODY ---------------- */}
                    <div className="content-body" style={{ flex: 1, overflow: 'auto', padding: '1rem' }}>
                        <Container fluid style={{ maxWidth: '1400px', margin: '0 auto' }}>
                            <Row>
                        {/* -------- Left Side Form -------- */}
                        <Col md={6} style={{ marginBottom: '1rem' }}>
                            <div
                                className="card shadow-sm"
                                style={{
                                    padding: '1.5rem',
                                    background: 'white',
                                    borderRadius: '8px',
                                    height: '100%'
                                }}
                            >
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', textAlign: 'center', marginBottom: '1rem' }}>
                                    {editingId ? 'Edit Group' : 'Add New Group'}
                                </h3>

                                <Form>
                                    <Form.Group className="mb-3">
                                        <Form.Label>
                                            Group Name <span className="text-danger">*</span>
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="groupName"
                                            value={newGroup.groupName}
                                            onChange={handleInputChange}
                                            placeholder="Enter group name"
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Description</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            name="description"
                                            value={newGroup.description}
                                            onChange={handleInputChange}
                                            placeholder="Enter description (optional)"
                                            rows={3}
                                        />
                                    </Form.Group>

                                    <Button
                                        variant="success"
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        style={{ minWidth: '150px', fontWeight: '600', marginRight: '10px' }}
                                    >
                                        {loading ? (
                                            <><Clock /> Saving...</>
                                        ) : editingId ? (
                                            <><PencilSquare /> Update Group</>
                                        ) : (
                                            <><CheckCircle /> Add Group</>
                                        )}
                                    </Button>

                                    {editingId && (
                                        <Button
                                            variant="outline-secondary"
                                            onClick={handleCancel}
                                            disabled={loading}
                                            style={{ minWidth: '100px' }}
                                        >
                                            Cancel
                                        </Button>
                                    )}
                                </Form>
                            </div>
                        </Col>

                        {/* -------- Right Side Table -------- */}
                        <Col md={6} style={{ marginBottom: '1rem' }}>
                            <div
                                className="card shadow-sm"
                                style={{
                                    padding: '1.5rem',
                                    background: 'white',
                                    borderRadius: '8px',
                                    height: '100%'
                                }}
                            >
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>
                                        {showBlocked ? 'Blocked Groups' : 'Active Groups'}
                                    </h3>
                                    <div>
                                        <Button
                                            variant={!showBlocked ? 'primary' : 'outline-primary'}
                                            size="sm"
                                            className="me-2"
                                            onClick={() => setShowBlocked(false)}
                                        >
                                            Active
                                        </Button>
                                        <Button
                                            variant={showBlocked ? 'danger' : 'outline-danger'}
                                            size="sm"
                                            onClick={() => setShowBlocked(true)}
                                        >
                                            Blocked
                                        </Button>
                                    </div>
                                </div>

                                <div className="mb-2 text-end">
                                    <span className="badge bg-secondary">
                                        {filteredGroups.length} Records
                                    </span>
                                </div>

                                {/* Scrollable container */}
                                <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '4px' }}>
                                    <Table striped bordered hover size="sm" style={{ marginBottom: 0 }}>
                                        <thead
                                            style={{
                                                position: 'sticky',
                                                top: 0,
                                                background: 'white',
                                                zIndex: 1,
                                            }}
                                        >
                                            <tr>
                                                <th>#</th>
                                                <th>Group Name</th>
                                                <th>Description</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredGroups.map((group, index) => (
                                                <tr key={group.id} style={{ backgroundColor: editingId === group.id ? "#fff3cd" : "transparent", fontWeight: editingId === group.id ? "600" : "normal", borderLeft: editingId === group.id ? "4px solid #ffc107" : "none" }}>
                                                    <td>{index + 1}</td>
                                                    <td>
                                                        {group.name}
                                                        {editingId === group.id && <span className="ms-2 badge bg-warning text-dark"><i className="fas fa-edit me-1"></i>Editing</span>}
                                                    </td>
                                                    <td>{group.description || '-'}</td>
                                                    <td>
                                                        {!showBlocked ? (
                                                            <>
                                                                {editingId !== group.id ? (
                                                                    <>
                                                                        <Button
                                                                            variant="outline-primary"
                                                                            size="sm"
                                                                            className="me-2"
                                                                            onClick={() => handleEdit(group)}
                                                                            disabled={loading}
                                                                        >
                                                                            Edit
                                                                        </Button>
                                                                        {/* <Button
                                                                            variant="outline-danger"
                                                                            size="sm"
                                                                            onClick={() => handleBlock(group.id)}
                                                                        >
                                                                            Block
                                                                        </Button> */}
                                                                    </>
                                                                ) : (
                                                                    <span className="text-muted fst-italic">Currently editing...</span>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <Button
                                                                variant="outline-success"
                                                                size="sm"
                                                                onClick={() => handleUnblock(group.id)}
                                                            >
                                                                Unblock
                                                            </Button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                            {filteredGroups.length === 0 && (
                                                <tr>
                                                    <td
                                                        colSpan={4}
                                                        className="text-center py-4 text-muted"
                                                    >
                                                        No {showBlocked ? 'blocked' : 'active'} groups found
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </Table>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
        </div>
        </>
    );
};

export default GroupMaster;
