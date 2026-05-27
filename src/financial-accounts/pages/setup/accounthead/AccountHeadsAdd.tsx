import React, { useEffect, useState } from "react";
import { Card, Row, Col, Button, Table, Form, Badge, InputGroup } from "react-bootstrap";
import { useTableSearch } from "../../../../hooks/useTableSearch";
import SearchInput from "../../../../components/SearchInput";
import { showValidationError, showConfirmDialog, showSuccessToast } from "../../../../utils/alertUtil";
import {
	PlusCircle,
	PencilSquare,
	Trash,
	CheckCircle,
	FolderFill,
	GearFill,
	InfoCircleFill,
	PlusLg,
	Calculator,
	ChevronDown,
	ChevronRight,
	FileEarmarkTextFill,
	FileEarmarkPlusFill,
	Bank,
	Diagram3Fill
} from "react-bootstrap-icons";

type BalanceType = "Dr" | "Cr";

interface AccountHead {
	id: number;
	parentId?: number | null;
	headType: string;
	typeGroup: string;
	name: string;
	code: string;
	description?: string;
	openingBalance: number;
	balanceType: BalanceType;
	isGroupHeader: boolean;
	secure: boolean;
}

const sampleHeads: AccountHead[] = [
    { id: 100, parentId: null, headType: "Assets", typeGroup: "Fixed", name: "FIXED ASSETS", code: "FA", isGroupHeader: true, secure: false, openingBalance: 0, balanceType: "Dr" },
    { id: 101, parentId: 100, headType: "Assets", typeGroup: "Fixed", name: "LAND & BUILDINGS", code: "FA01", isGroupHeader: true, secure: false, openingBalance: 0, balanceType: "Dr" },
    { id: 102, parentId: 101, headType: "Assets", typeGroup: "Fixed", name: "Hospital Building", code: "FA01-01", isGroupHeader: false, secure: false, openingBalance: 5000000, balanceType: "Dr" },
    { id: 103, parentId: 100, headType: "Assets", typeGroup: "Fixed", name: "MEDICAL EQUIPMENT", code: "FA02", isGroupHeader: true, secure: false, openingBalance: 0, balanceType: "Dr" },
    { id: 104, parentId: 103, headType: "Assets", typeGroup: "Fixed", name: "X-Ray Machine", code: "FA02-01", isGroupHeader: false, secure: false, openingBalance: 1200000, balanceType: "Dr" },
    { id: 200, parentId: null, headType: "Assets", typeGroup: "Current", name: "CURRENT ASSETS", code: "CA", isGroupHeader: true, secure: false, openingBalance: 0, balanceType: "Dr" },
    { id: 201, parentId: 200, headType: "Assets", typeGroup: "Bank", name: "BANK ACCOUNTS", code: "CA01", isGroupHeader: true, secure: false, openingBalance: 0, balanceType: "Dr" },
    { id: 202, parentId: 201, headType: "Assets", typeGroup: "Bank", name: "State Bank of India", code: "CA01-01", isGroupHeader: false, secure: true, openingBalance: 125000.5, balanceType: "Dr" },
    { id: 203, parentId: 201, headType: "Assets", typeGroup: "Bank", name: "HDFC Bank", code: "CA01-02", isGroupHeader: false, secure: false, openingBalance: 50000, balanceType: "Dr" },
];

// Tree Item Component for Hierarchical View
const TreeItem: React.FC<{
	head: AccountHead;
	level: number;
	allHeads: AccountHead[];
	selectedHeadId?: number;
	onSelect: (h: AccountHead) => void;
	onAddSub: (parent: AccountHead) => void;
}> = ({ head, level, allHeads, selectedHeadId, onSelect, onAddSub }) => {
	const [isOpen, setIsOpen] = React.useState(true);
	const children = allHeads.filter(h => h.parentId === head.id);
	const hasChildren = children.length > 0;
	const isSelected = selectedHeadId === head.id;

	return (
		<div className="tree-item-container">
			<div 
				className={`d-flex align-items-center py-2 px-3 transition-all ${isSelected ? 'bg-primary-light text-primary' : 'hover-bg-light'}`}
				style={{ 
					paddingLeft: `${level * 20 + 16}px`,
					cursor: 'pointer',
					borderLeft: isSelected ? "4px solid #0d6efd" : "4px solid transparent",
					background: isSelected ? "#ebf5ff" : "transparent",
					fontSize: "13px"
				}}
				onClick={() => onSelect(head)}
			>
				<span 
					className="me-2 text-muted d-flex align-items-center justify-content-center" 
					style={{ width: "20px" }}
					onClick={(e) => { 
						if(head.isGroupHeader) {
							e.stopPropagation(); 
							setIsOpen(!isOpen); 
						}
					}}
				>
					{head.isGroupHeader ? (
						isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />
					) : (
						<div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#ced4da" }} />
					)}
				</span>
				
				<span className="me-2 d-flex align-items-center">
					{head.isGroupHeader ? (
						<FolderFill className={isSelected ? "text-primary" : "text-warning"} size={16} />
					) : (
						<FileEarmarkTextFill className="text-secondary opacity-50" size={16} />
					)}
				</span>

				<span className={`flex-grow-1 ${isSelected ? 'fw-bold' : 'fw-medium'}`} style={{ color: isSelected ? "#0d6efd" : "#495057" }}>
					{head.name}
				</span>
				
				{head.isGroupHeader && (
					<Button 
						size="sm" 
						variant="link" 
						className="p-0 ms-2 text-success opacity-50 hover-opacity-100 d-flex align-items-center" 
						onClick={(e) => { e.stopPropagation(); onAddSub(head); }}
						title="Add Sub-item"
					>
						<FileEarmarkPlusFill size={14} />
					</Button>
				)}
			</div>
			{isOpen && hasChildren && (
				<div className="tree-children-container">
					{children.map(child => (
						<TreeItem 
							key={child.id} 
							head={child} 
							level={level + 1} 
							allHeads={allHeads}
							selectedHeadId={selectedHeadId}
							onSelect={onSelect}
							onAddSub={onAddSub}
						/>
					))}
				</div>
			)}
		</div>
	);
};

const AccountHeadsAdd: React.FC = () => {
	const [accountHeads, setAccountHeads] = useState<AccountHead[]>([]);
	const [selectedHead, setSelectedHead] = useState<AccountHead | null>(null);
	const [editingHead, setEditingHead] = useState<AccountHead | null>(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		setLoading(true);
		// Simulate API call
		setTimeout(() => {
			setAccountHeads(sampleHeads);
			setLoading(false);
		}, 120);
	}, []);

	// Search logic for the tree view
	const {
		filteredData: filteredHeads,
		searchTerm,
		setSearchTerm,
		resultCount,
		totalCount,
	} = useTableSearch<AccountHead>({
		data: accountHeads,
		searchFields: ["name", "code"],
	});

	const handleSelectHead = (h: AccountHead) => {
		setSelectedHead(h);
		setEditingHead(null);
	};

	const handleEditHead = (h: AccountHead) => {
		setEditingHead({ ...h });
	};

	const handleAddSubAccount = (parent: AccountHead) => {
		setSelectedHead(parent);
		setEditingHead({
			id: 0,
			parentId: parent.id,
			headType: parent.headType,
			typeGroup: parent.typeGroup,
			name: "",
			code: "",
			description: "",
			openingBalance: 0,
			balanceType: parent.balanceType,
			isGroupHeader: false,
			secure: false,
		});
	};

	const handleAddRootGroup = () => {
		setSelectedHead(null);
		setEditingHead({
			id: 0,
			parentId: null,
			headType: "Assets",
			typeGroup: "Fixed",
			name: "",
			code: "",
			description: "",
			openingBalance: 0,
			balanceType: "Dr",
			isGroupHeader: true,
			secure: false,
		});
	};

	const clearForm = () => {
		setEditingHead(null);
	};

	const handleDeleteHead = async (id: number) => {
		const result = await showConfirmDialog(
			"Delete this account head and all its sub-accounts?",
			"Confirm Delete",
			"Delete",
			"Cancel"
		);
		if (result.isConfirmed) {
			// In a real app, this would be a recursive API call or handled by DB cascade
			setAccountHeads((prev) => prev.filter((h) => h.id !== id && h.parentId !== id));
			showSuccessToast("Account head deleted");
			if (selectedHead?.id === id) setSelectedHead(null);
		}
	};

	const handleSaveHead = (e?: React.FormEvent) => {
		e?.preventDefault();
		if (!editingHead) return;

		// Basic validation
		if (!editingHead.name.trim()) {
			showValidationError("Head Name is required");
			return;
		}

		if (editingHead.id) {
			// Update existing
			setAccountHeads((s) => s.map((x) => (x.id === editingHead.id ? { ...editingHead } : x)));
			showSuccessToast("Account head updated");
		} else {
			// Create new
			const nextId = accountHeads.length ? Math.max(...accountHeads.map((a) => a.id)) + 1 : 1;
			setAccountHeads((s) => [{ ...editingHead, id: nextId }, ...s]);
			showSuccessToast("New account head created");
		}
		clearForm();
	};

	return (
		<div style={{ padding: "24px", background: "#f8f9fa", minHeight: "100vh" }}>
			<div className="mb-4 d-flex justify-content-between align-items-center">
				<div>
					<h2
						style={{
							fontWeight: 800,
							color: "#1a1a1a",
							margin: 0,
							textTransform: "uppercase",
							letterSpacing: "1px",
							fontSize: "24px",
						}}
					>
						Chart of Accounts
					</h2>
					<p className="text-muted mb-0">Manage hospital account hierarchies and financial structure</p>
				</div>
				<Button
					variant="primary"
					className="d-flex align-items-center gap-2 shadow-sm px-4 py-2"
					style={{ borderRadius: "8px", fontWeight: "600" }}
					onClick={handleAddRootGroup}
				>
					<PlusLg /> Add Root Group
				</Button>
			</div>

			<Row className="g-4">
				{/* Left Section: Account Hierarchy Tree */}
				<Col lg={4} md={5}>
					<Card className="border-0 shadow-sm overflow-hidden" style={{ borderRadius: "12px", height: "calc(100vh - 180px)" }}>
						<Card.Header className="bg-white border-0 py-3 px-4">
							<div className="d-flex align-items-center gap-2 mb-3">
								<Diagram3Fill className="text-primary" size={20} />
								<h5 className="mb-0" style={{ fontWeight: 700, fontSize: "16px" }}>NAVIGATOR</h5>
								<Badge bg="primary" pill className="ms-auto" style={{ fontSize: "11px", padding: "5px 10px" }}>
									{totalCount} Total
								</Badge>
							</div>
							<SearchInput
								searchTerm={searchTerm}
								onSearchChange={setSearchTerm}
								placeholder="Search accounts..."
								className="w-100"
								showResultCount={false}
							/>
						</Card.Header>
						<Card.Body className="p-0" style={{ overflowY: "auto" }}>
							{loading ? (
								<div className="p-4 text-center">
									<div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
									<span className="text-muted">Loading...</span>
								</div>
							) : filteredHeads.length === 0 ? (
								<div className="p-5 text-center text-muted">
									<InfoCircleFill size={32} className="mb-3 opacity-25" />
									<p className="small mb-0">No matching accounts found</p>
								</div>
							) : (
								<div className="py-2">
									{/* Render only Root nodes (parentId is null) */}
									{filteredHeads
										.filter((h) => h.parentId === null)
										.map((head) => (
											<TreeItem
												key={head.id}
												head={head}
												level={0}
												allHeads={filteredHeads}
												selectedHeadId={selectedHead?.id}
												onSelect={handleSelectHead}
												onAddSub={handleAddSubAccount}
											/>
										))}
								</div>
							)}
						</Card.Body>
					</Card>
				</Col>

				{/* Right Section: Form and Details */}
				<Col lg={8} md={7}>
					{!selectedHead && !editingHead ? (
						<Card className="border-0 shadow-sm p-5 text-center h-100 d-flex align-items-center justify-content-center" style={{ borderRadius: "12px", background: "#fff" }}>
							<Card.Body>
								<div style={{ padding: "40px 0" }}>
									<div style={{ 
										width: "100px", 
										height: "100px", 
										background: "#f8f9fa", 
										borderRadius: "50%", 
										display: "inline-flex", 
										alignItems: "center", 
										justifyContent: "center",
										marginBottom: "24px",
										color: "#dee2e6"
									}}>
										<Calculator size={48} />
									</div>
									<h4 className="text-dark fw-bold">Chart of Accounts Navigator</h4>
									<p className="text-muted mx-auto" style={{ maxWidth: "400px" }}>
										Select an account from the tree structure to view details, or click "Add Root Group" to create a new top-level category.
									</p>
									<div className="mt-4 pt-2">
										<Badge bg="light" text="dark" className="border px-3 py-2 fw-normal">
											<GearFill className="me-2 text-secondary" /> Use Navigator to drill down into sub-accounts
										</Badge>
									</div>
								</div>
							</Card.Body>
						</Card>
					) : (
						<div className="d-flex flex-column gap-4">
							{/* Form Section */}
							{editingHead && (
								<Card className="border-0 shadow-sm" style={{ borderRadius: "12px" }}>
									<Card.Header className="bg-white border-0 pt-4 px-4 pb-2">
										<div className="d-flex align-items-center gap-2">
											<div className={`p-2 rounded-3 ${editingHead.id ? "bg-warning-light" : "bg-success-light"}`}>
												{editingHead.id ? <PencilSquare className="text-warning" size={20} /> : <PlusCircle className="text-success" size={20} />}
											</div>
											<div>
												<h5 className="mb-0" style={{ fontWeight: 700, fontSize: "18px" }}>
													{editingHead.id ? "EDIT ACCOUNT" : "NEW ACCOUNT"}
												</h5>
												<small className="text-muted">
													{editingHead.parentId 
														? `Adding sub-account under: ${accountHeads.find(h => h.id === editingHead.parentId)?.name}` 
														: "Top-level account group"}
												</small>
											</div>
										</div>
									</Card.Header>
									<Card.Body className="p-4">
										<Form onSubmit={handleSaveHead}>
											<Row className="g-3">
												<Col md={12}>
													<Form.Group>
														<Form.Label className="small fw-bold text-uppercase text-muted">Account Name</Form.Label>
														<Form.Control 
															placeholder="e.g. Hospital Main Building"
															value={editingHead.name} 
															onChange={(e)=>setEditingHead({ ...editingHead, name: e.target.value })} 
															required
															className="bg-light border-0 py-2 fs-5"
															style={{ fontWeight: "500" }}
														/>
													</Form.Group>
												</Col>
												<Col md={4}>
													<Form.Group>
														<Form.Label className="small fw-bold text-uppercase text-muted">Account Code</Form.Label>
														<Form.Control 
															placeholder="e.g. FA-001"
															value={editingHead.code} 
															onChange={(e)=>setEditingHead({ ...editingHead, code: e.target.value })} 
															className="bg-light border-0 py-2"
														/>
													</Form.Group>
												</Col>
												<Col md={4}>
													<Form.Group>
														<Form.Label className="small fw-bold text-uppercase text-muted">Head Type</Form.Label>
														<Form.Select 
															value={editingHead.headType} 
															onChange={(e)=>setEditingHead({ ...editingHead, headType: e.target.value })}
															required
															className="bg-light border-0 py-2"
														>
															<option>Assets</option>
															<option>Liabilities</option>
															<option>Income</option>
															<option>Expense</option>
														</Form.Select>
													</Form.Group>
												</Col>
												<Col md={4}>
													<Form.Group>
														<Form.Label className="small fw-bold text-uppercase text-muted">Type Group</Form.Label>
														<Form.Select 
															value={editingHead.typeGroup} 
															onChange={(e)=>setEditingHead({ ...editingHead, typeGroup: e.target.value })}
															className="bg-light border-0 py-2"
														>
															<option>Fixed</option>
															<option>Current</option>
															<option>Bank</option>
															<option>Cash</option>
														</Form.Select>
													</Form.Group>
												</Col>
												<Col md={8}>
													<Form.Group>
														<Form.Label className="small fw-bold text-uppercase text-muted">Opening Balance</Form.Label>
														<InputGroup>
															<Form.Control 
																type="number" 
																step="0.01" 
																value={editingHead.openingBalance} 
																onChange={(e)=>setEditingHead({ ...editingHead, openingBalance: Number(e.target.value) })} 
																className="bg-light border-0 text-end py-2"
															/>
															<Form.Select 
																value={editingHead.balanceType} 
																onChange={(e)=>setEditingHead({ ...editingHead, balanceType: e.target.value as BalanceType })} 
																style={{ maxWidth: "80px" }}
																className="bg-secondary text-white border-0"
															>
																<option value="Dr">Dr</option>
																<option value="Cr">Cr</option>
															</Form.Select>
														</InputGroup>
													</Form.Group>
												</Col>
												<Col md={4}>
													<Form.Group className="h-100 d-flex align-items-end pb-1">
														<Form.Check 
															type="switch" 
															id="is-group-header-switch" 
															label="Is Group Header" 
															className="fw-bold"
															checked={editingHead.isGroupHeader} 
															onChange={(e)=>setEditingHead({ ...editingHead, isGroupHeader: e.target.checked })} 
														/>
													</Form.Group>
												</Col>
											</Row>

											<div className="d-flex gap-2 mt-4 pt-2">
												<Button 
													type="submit" 
													variant={editingHead.id ? "warning" : "success"} 
													className="px-4 py-2 fw-bold d-flex align-items-center gap-2"
													style={{ borderRadius: "8px" }}
												>
													{editingHead.id ? <CheckCircle /> : <PlusCircle />}
													{editingHead.id ? 'UPDATE ACCOUNT' : 'SAVE ACCOUNT'}
												</Button>
												<Button 
													variant="light" 
													className="px-4 py-2 border"
													style={{ borderRadius: "8px" }}
													onClick={clearForm}
												>
													Cancel
												</Button>
											</div>
										</Form>
									</Card.Body>
								</Card>
							)}

							{/* Detail View Section */}
							{selectedHead && !editingHead && (
								<Card className="border-0 shadow-sm" style={{ borderRadius: "12px" }}>
									<Card.Body className="p-4">
										<div className="d-flex justify-content-between align-items-start mb-4">
											<div className="d-flex align-items-center gap-3">
												<div className={`p-3 rounded-circle ${selectedHead.isGroupHeader ? "bg-warning-light" : "bg-primary-light"}`}>
													{selectedHead.isGroupHeader ? <FolderFill size={32} className="text-warning" /> : <Bank size={32} className="text-primary" />}
												</div>
												<div>
													<Badge bg={selectedHead.isGroupHeader ? "warning" : "primary"} className="mb-1 text-uppercase">
														{selectedHead.isGroupHeader ? "Group" : "Account"}
													</Badge>
													<h3 className="mb-0 fw-bold">{selectedHead.name}</h3>
													<div className="text-muted small">Code: {selectedHead.code || "N/A"} | Type: {selectedHead.headType}</div>
												</div>
											</div>
											<div className="d-flex gap-2">
												<Button variant="outline-primary" size="sm" className="d-flex align-items-center gap-2" onClick={() => handleEditHead(selectedHead)}>
													<PencilSquare /> Edit
												</Button>
												<Button variant="outline-danger" size="sm" className="d-flex align-items-center gap-2" onClick={() => handleDeleteHead(selectedHead.id)}>
													<Trash /> Delete
												</Button>
											</div>
										</div>

										<Row className="g-4 mb-4">
											<Col sm={4}>
												<div className="p-3 bg-light rounded-3 text-center border">
													<div className="small text-muted text-uppercase fw-bold mb-1">Opening Balance</div>
													<div className={`h4 mb-0 fw-bold ${selectedHead.balanceType === "Dr" ? "text-primary" : "text-danger"}`}>
														{selectedHead.openingBalance.toLocaleString()} <small>{selectedHead.balanceType}</small>
													</div>
												</div>
											</Col>
											<Col sm={4}>
												<div className="p-3 bg-light rounded-3 text-center border">
													<div className="small text-muted text-uppercase fw-bold mb-1">Type Group</div>
													<div className="h4 mb-0 fw-bold">{selectedHead.typeGroup}</div>
												</div>
											</Col>
											<Col sm={4}>
												<div className="p-3 bg-light rounded-3 text-center border">
													<div className="small text-muted text-uppercase fw-bold mb-1">Sub-Accounts</div>
													<div className="h4 mb-0 fw-bold">{accountHeads.filter(h => h.parentId === selectedHead.id).length}</div>
												</div>
											</Col>
										</Row>

										{selectedHead.isGroupHeader && (
											<div className="mt-2 text-center p-4 dashed-border rounded-3 bg-light-gray">
												<p className="text-muted mb-3">You can add nested entries under this group</p>
												<Button variant="success" size="sm" className="rounded-pill px-4" onClick={() => handleAddSubAccount(selectedHead)}>
													<PlusLg className="me-1" /> Add Sub-Account
												</Button>
											</div>
										)}
									</Card.Body>
								</Card>
							)}
						</div>
					)}
				</Col>
			</Row>

			<style>{`
				.bg-primary-light { background: #e7f1ff; }
				.bg-success-light { background: #e1f6e5; }
				.bg-warning-light { background: #fff9e6; }
				.bg-light-gray { background: #fdfdfd; }
				.dashed-border { border: 2px dashed #dee2e6; }
				.transition-all { transition: all 0.2s ease; }
				.hover-bg-light:hover { background: #f8f9fa !important; }
				.hover-opacity-100:hover { opacity: 1 !important; }
			`}</style>
		</div>
	);
};

export default AccountHeadsAdd;

