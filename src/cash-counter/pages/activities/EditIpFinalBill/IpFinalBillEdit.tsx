import React, { useEffect, useMemo, useState } from "react";
import { Button, Card, Form, Modal, Spinner, Table } from "react-bootstrap";
import { faFileInvoice } from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import PageHeader from "../../../../components/PageHeader";
import { MedicalRecordsApiService } from "../../../../api/medical-records/medical-records-api-service";
import CashCounterApiService from "../../../../api/cash-counter/cash-counter-api-service";
import { showErrorToast, showSuccessToast } from "../../../../utils/alertUtil";
import { useTableSearch } from "../../../../hooks/useTableSearch";
import SearchInput from "../../../../components/SearchInput";
import { RootState } from "../../../../state/store";
import {
	handleNumberBlur,
	handleNumberChange,
	formatNumberDisplay,
} from "../../../../utils/numberInputUtil";

interface ActiveIpPatientRow {
	ipId: number;
	patId: number;
	opNo: string;
	ipNo: string;
	patientName: string;
	age: string;
	gender: string;
	admittedWard: string;
	roomBed: string;
	admissionDateTime: string;
	hasOrderDetails: boolean;
	orderDetailsCount: number;
	orderDetails: Record<string, unknown>[];
}

interface EditableOrderDetail {
	particulars: string;
	amt: number;
	accHeadId: number;
	headAmt: number;
	numberOfDays: number;
}

const medicalRecordsApi = new MedicalRecordsApiService();
const cashCounterApi = new CashCounterApiService();

const extractArrayResponse = (response: unknown): Record<string, unknown>[] => {
	if (Array.isArray(response)) {
		return response as Record<string, unknown>[];
	}

	if (
		response &&
		typeof response === "object" &&
		"data" in response &&
		Array.isArray((response as { data?: unknown }).data)
	) {
		return (response as { data: Record<string, unknown>[] }).data;
	}

	return [];
};

const formatCellValue = (value: unknown) => {
	if (value === null || value === undefined || value === "") {
		return "-";
	}

	if (typeof value === "boolean") {
		return value ? "Yes" : "No";
	}

	if (typeof value === "object") {
		return JSON.stringify(value);
	}

	return String(value);
};

const getFieldValue = (detail: Record<string, unknown>, aliases: string[]) => {
	for (const alias of aliases) {
		if (detail[alias] !== undefined && detail[alias] !== null && detail[alias] !== "") {
			return detail[alias];
		}
	}

	return "";
};

const toNumber = (value: unknown, fallback: number = 0) => {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : fallback;
};

const mapEditableOrderDetail = (detail: Record<string, unknown>): EditableOrderDetail => ({
	particulars: String(getFieldValue(detail, ["particulars", "chargeName", "name"]) || "-"),
	amt: toNumber(getFieldValue(detail, ["amt", "amount"]), 0),
	accHeadId: toNumber(getFieldValue(detail, ["accHeadId", "headId"]), 0),
	headAmt: toNumber(getFieldValue(detail, ["headAmt", "headAmount"]), 0),
	numberOfDays: toNumber(getFieldValue(detail, ["numberOfDays", "days"]), 0),
});

const IpFinalBillEdit: React.FC = () => {
	const loginData = useSelector((state: RootState) => state.loginData);
	const [patients, setPatients] = useState<ActiveIpPatientRow[]>([]);
	const [loadingPatients, setLoadingPatients] = useState(false);
	const [checkingOrders, setCheckingOrders] = useState(false);
	const [selectedPatient, setSelectedPatient] = useState<ActiveIpPatientRow | null>(null);
	const [showDetailsModal, setShowDetailsModal] = useState(false);
	const [showOnlyOrdered, setShowOnlyOrdered] = useState(true);
	const [editableOrderDetails, setEditableOrderDetails] = useState<EditableOrderDetail[]>([]);
	const [isUpdating, setIsUpdating] = useState(false);

	const patientsToDisplay = useMemo(
		() => (showOnlyOrdered ? patients.filter((p) => p.hasOrderDetails) : patients),
		[patients, showOnlyOrdered]
	);

	const {
		filteredData: filteredPatients,
		searchTerm,
		setSearchTerm,
		resultCount,
		totalCount,
	} = useTableSearch({
		data: patientsToDisplay,
		searchFields: ["opNo", "patientName", "ipNo", "admittedWard", "roomBed"],
	});

	const actionablePatientsCount = useMemo(
		() => patients.filter((patient) => patient.hasOrderDetails).length,
		[patients]
	);

	useEffect(() => {
		loadPatientsWithOrderStatus();
	}, []);

	const loadPatientsWithOrderStatus = async () => {
		setLoadingPatients(true);

		try {
			const response = await medicalRecordsApi.fetchActiveIpPatients();
			const data = extractArrayResponse(response);

			const mappedPatients: ActiveIpPatientRow[] = data.map((patient) => ({
				ipId: Number(patient.ipId ?? 0),
				patId: Number(patient.patId ?? 0),
				opNo: String(patient.opNo ?? "-"),
				ipNo: String(patient.ipNo ?? "-"),
				patientName: String(patient.patientName ?? "-"),
				age: String(patient.age ?? "-"),
				gender: String(patient.gender ?? "-"),
				admittedWard: String(patient.admittedWard ?? "-"),
				roomBed: String(patient.roomBed ?? "-"),
				admissionDateTime: String(patient.admitDate ?? "-"),
				hasOrderDetails: false,
				orderDetailsCount: 0,
				orderDetails: [],
			}));

			setPatients(mappedPatients);

			if (mappedPatients.length === 0) {
				return;
			}

			setCheckingOrders(true);

			const patientsWithOrders = await Promise.all(
				mappedPatients.map(async (patient) => {
					if (!patient.patId || !patient.ipId) {
						return patient;
					}

					try {
						const orderResponse = await cashCounterApi.fetchIpBillOrderDetails(
							patient.patId,
							patient.ipId
						);
						const orderDetails = extractArrayResponse(orderResponse);

						return {
							...patient,
							hasOrderDetails: orderDetails.length > 0,
							orderDetailsCount: orderDetails.length,
							orderDetails,
						};
					} catch (error) {
						return {
							...patient,
							hasOrderDetails: false,
							orderDetailsCount: 0,
							orderDetails: [],
						};
					}
				})
			);

			setPatients(patientsWithOrders);
		} catch (error: any) {
			console.error("Error loading active IP patients:", error);
			showErrorToast(error?.response?.data?.error || "Failed to load active IP patients");
			setPatients([]);
		} finally {
			setLoadingPatients(false);
			setCheckingOrders(false);
		}
	};

	const handleOpenDetails = (patient: ActiveIpPatientRow) => {
		if (!patient.hasOrderDetails) {
			return;
		}

		setEditableOrderDetails(patient.orderDetails.map((detail) => mapEditableOrderDetail(detail)));
		setSelectedPatient(patient);
		setShowDetailsModal(true);
	};

	const handleCloseDetails = () => {
		setShowDetailsModal(false);
		setSelectedPatient(null);
		setEditableOrderDetails([]);
	};

	const selectedPatientKeyPrefix = selectedPatient
		? `${selectedPatient.patId}-${selectedPatient.ipId}`
		: "selected-patient";

	const handleEditableDetailChange = (
		index: number,
		field: "amt" | "numberOfDays",
		value: number
	) => {
		setEditableOrderDetails((prev) =>
			prev.map((detail, i) => (i === index ? { ...detail, [field]: value } : detail))
		);
	};

	const handleUpdateOrder = async () => {
		if (!selectedPatient) {
			showErrorToast("No patient selected for update.");
			return;
		}

		const firstDetail = selectedPatient.orderDetails[0] || {};
		const billId = toNumber(getFieldValue(firstDetail, ["billId", "finalBillId", "id"]), 0);
		const uid = toNumber(loginData?.id, 0);

		if (!billId) {
			showErrorToast("Bill ID is missing. Unable to update this order.");
			return;
		}

		if (!uid) {
			showErrorToast("User session is missing. Please login again.");
			return;
		}

		const detailsPayload = editableOrderDetails.map((item) => ({
			particulars: item.particulars,
			amt: toNumber(item.amt, 0),
			accHeadId: toNumber(item.accHeadId, 0),
			headAmt: toNumber(item.headAmt, 0),
			numberOfDays: toNumber(item.numberOfDays, 0),
		}));

		const payload = {
			billId,
			amt: detailsPayload.reduce((sum, item) => sum + item.amt, 0),
			discount: toNumber(getFieldValue(firstDetail, ["discount", "disc"]), 0),
			advance: toNumber(getFieldValue(firstDetail, ["advance"]), 0),
			prevBalance: toNumber(
				getFieldValue(firstDetail, ["prevBalance", "previousBalance", "balance"]),
				0
			),
			uid,
			isFinal: toNumber(getFieldValue(firstDetail, ["isFinal"]), 1),
			isConstantChargesCalculated: toNumber(
				getFieldValue(firstDetail, ["isConstantChargesCalculated"]),
				1
			),
			headId: toNumber(getFieldValue(firstDetail, ["headId", "accHeadId"]), 0),
			details: detailsPayload,
		};

		try {
			setIsUpdating(true);
			await cashCounterApi.updateIpBillOrder(payload);
			showSuccessToast("IP bill order updated successfully.");

			const refreshed = await cashCounterApi.fetchIpBillOrderDetails(
				selectedPatient.patId,
				selectedPatient.ipId
			);
			const refreshedDetails = extractArrayResponse(refreshed);

			setPatients((prev) =>
				prev.map((patient) =>
					patient.patId === selectedPatient.patId && patient.ipId === selectedPatient.ipId
						? {
								...patient,
								hasOrderDetails: refreshedDetails.length > 0,
								orderDetailsCount: refreshedDetails.length,
								orderDetails: refreshedDetails,
						  }
						: patient
				)
			);

			setSelectedPatient((prev) =>
				prev
					? {
							...prev,
							hasOrderDetails: refreshedDetails.length > 0,
							orderDetailsCount: refreshedDetails.length,
							orderDetails: refreshedDetails,
					  }
					: null
			);

			setEditableOrderDetails(refreshedDetails.map((detail) => mapEditableOrderDetail(detail)));
		} catch (error: any) {
			console.error("Error updating IP bill order:", error);
			showErrorToast(error?.response?.data?.error || "Failed to update IP bill order.");
		} finally {
			setIsUpdating(false);
		}
	};

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				height: "100%",
				width: "100%",
				minHeight: 0,
				overflow: "hidden",
			}}
		>
			<PageHeader
				icon={faFileInvoice}
				title="Edit IP Final Bill"
				subtitle="Load active IP patients and identify rows with existing IP bill order details"
				badges={[
					{ label: "Active IP", value: patients.length },
					{ label: "Action Ready", value: actionablePatientsCount },
				]}
			/>

			<div
				className="content-body"
				style={{
					flex: 1,
					minHeight: 0,
					display: "flex",
					flexDirection: "column",
					overflow: "hidden",
					padding: "1.5rem",
					background: "var(--bg-main)",
					gap: "1rem",
				}}
			>
				{/* Header Controls - Not Scrollable */}
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: "0.75rem",
					}}
				>
					<div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-start gap-3">
						<div>
							<h5
								className="mb-1"
								style={{
									color: "var(--text-dark)",
									fontSize: "var(--font-size-xl)",
									fontWeight: "var(--font-weight-semibold)",
								}}
							>
								Active IP Final Bill Queue  (WORK IN PROGRESS - DO NOT USE)
							</h5>
							<p
								className="mb-0"
								style={{
									color: "var(--text-muted)",
									fontSize: "var(--font-size-sm)",
								}}
							>
								The action button appears only when fetchIpBillOrderDetails returns one or more rows.
							</p>
						</div>
						<div className="d-flex gap-2 flex-wrap">
							<Button
								size="sm"
								variant={showOnlyOrdered ? "primary" : "outline-primary"}
								onClick={() => setShowOnlyOrdered(!showOnlyOrdered)}
							>
								{showOnlyOrdered ? "✓" : ""} Ordered
							</Button>
							<Button
								className="theme-outline-btn-primary"
								onClick={loadPatientsWithOrderStatus}
								disabled={loadingPatients || checkingOrders}
								size="sm"
							>
								{loadingPatients || checkingOrders ? "Refreshing..." : "Refresh List"}
							</Button>
						</div>
					</div>

					<SearchInput
						searchTerm={searchTerm}
						onSearchChange={setSearchTerm}
						placeholder="Search by OP No, patient name, IP No, ward, or bed..."
						resultCount={resultCount}
						totalCount={totalCount}
						showResultCount={true}
					/>

					{checkingOrders && !loadingPatients && (
						<div
							className="d-flex align-items-center gap-2"
							style={{
								color: "var(--text-muted)",
								fontSize: "var(--font-size-sm)",
							}}
						>
							<Spinner animation="border" size="sm" />
							<span>Checking IP bill order details for each active patient...</span>
						</div>
					)}
				</div>

				{/* Table Card - Scrollable */}
				<Card
					className="shadow-sm border-0 flex-grow-1"
					style={{
						background: "var(--bg-white)",
						border: "1px solid var(--border-color)",
						display: "flex",
						flexDirection: "column",
						minHeight: 0,
					}}
				>
					<Card.Body
						className="p-0"
						style={{
							display: "flex",
							flexDirection: "column",
							minHeight: 0,
						}}
					>
						<div style={{ overflowX: "auto", overflowY: "auto", flex: 1, minHeight: 0 }}>
							<Table striped bordered hover responsive className="align-middle mb-0">
								<thead>
									<tr>
										<th>OP No</th>
										<th>Patient Name</th>
										<th>Age / Gender</th>
										<th>IP No</th>
										<th>Ward / Bed</th>
										<th>Admission Date</th>
										<th className="text-center">Action</th>
									</tr>
								</thead>
								<tbody>
									{loadingPatients ? (
										<tr>
											<td colSpan={7} className="text-center py-5">
												<Spinner animation="border" variant="primary" />
												<div
													className="mt-2"
													style={{
														color: "var(--text-muted)",
														fontSize: "var(--font-size-sm)",
													}}
												>
													Loading active IP patients...
												</div>
											</td>
										</tr>
									) : filteredPatients.length === 0 ? (
										<tr>
											<td colSpan={7} className="text-center py-5">
												<div
													style={{
														color: "var(--text-muted)",
														fontSize: "var(--font-size-base)",
													}}
												>
													{searchTerm
														? `No patients found matching "${searchTerm}".`
														: showOnlyOrdered
														? "No patients with IP bill orders."
														: "No active IP patients available."}
												</div>
											</td>
										</tr>
									) : (
										filteredPatients.map((patient) => (
											<tr key={`${patient.patId}-${patient.ipId}`}>
												<td>{patient.opNo}</td>
												<td>{patient.patientName}</td>
												<td>
													{patient.age} / {patient.gender}
												</td>
												<td>{patient.ipNo}</td>
												<td>
													<span>{patient.admittedWard} / </span>
													<span
														style={{
															color: "var(--text-muted)",
															fontSize: "var(--font-size-xs)",
														}}
													>
														{patient.roomBed}
													</span>
												</td>
												<td>{patient.admissionDateTime}</td>
												<td className="text-center">
													{patient.hasOrderDetails ? (
														<Button
															size="sm"
															className="theme-btn-primary"
															onClick={() => handleOpenDetails(patient)}
														>
															Action
														</Button>
													) : (
														<span
															style={{
																color: "var(--text-secondary)",
																fontSize: "var(--font-size-xs)",
															}}
														>
															-
														</span>
													)}
												</td>
											</tr>
										))
									)}
								</tbody>
							</Table>
						</div>
					</Card.Body>
				</Card>
			</div>

			{/* Order Details Modal */}
			<Modal show={showDetailsModal} onHide={handleCloseDetails} centered size="lg">
				<Modal.Header closeButton>
					<Modal.Title>
						{selectedPatient?.patientName} [{selectedPatient?.opNo}] IP Order Details
					</Modal.Title>
				</Modal.Header>
				<Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
					{editableOrderDetails.length ? (
						<Table striped bordered hover responsive className="mb-0 align-middle">
							<thead>
								<tr>
									<th style={{ width: "70px" }}>S.No</th>
									<th>Particulars</th>
									<th style={{ width: "180px" }}>Number Of Days</th>
									<th style={{ width: "180px" }}>Amount</th>
								</tr>
							</thead>
							<tbody>
								{editableOrderDetails.map((detail, index) => {
									return (
										<tr key={`${selectedPatientKeyPrefix}-${index}`}>
											<td>{index + 1}</td>
											<td>{formatCellValue(detail.particulars)}</td>
											<td>
												<Form.Control
													type="number"
													value={formatNumberDisplay(detail.numberOfDays)}
													onChange={(e) =>
														handleEditableDetailChange(
															index,
															"numberOfDays",
															handleNumberChange(e.target.value)
														)
													}
													onBlur={(e) =>
														handleEditableDetailChange(
															index,
															"numberOfDays",
															handleNumberBlur(e.target.value)
														)
													}
													size="sm"
													min="0"
													step="1"
													placeholder="0"
												/>
											</td>
											<td>
												<Form.Control
													type="number"
													value={formatNumberDisplay(detail.amt)}
													onChange={(e) =>
														handleEditableDetailChange(
															index,
															"amt",
															handleNumberChange(e.target.value)
														)
													}
													onBlur={(e) =>
														handleEditableDetailChange(
															index,
															"amt",
															handleNumberBlur(e.target.value)
														)
													}
													size="sm"
													min="0"
													step="0.01"
													placeholder="0"
												/>
											</td>
										</tr>
									);
								})}
							</tbody>
						</Table>
					) : (
						<div
							className="text-center py-4"
							style={{
								color: "var(--text-muted)",
								fontSize: "var(--font-size-base)",
							}}
						>
							No IP bill order details available.
						</div>
					)}
				</Modal.Body>
				<Modal.Footer>
					<Button
						className="theme-btn-primary"
						onClick={handleUpdateOrder}
						disabled={isUpdating || editableOrderDetails.length === 0}
					>
						{isUpdating ? "Updating..." : "Update"}
					</Button>
					<Button variant="secondary" onClick={handleCloseDetails}>
						Close
					</Button>
				</Modal.Footer>
			</Modal>
		</div>
	);
};

export default IpFinalBillEdit;
