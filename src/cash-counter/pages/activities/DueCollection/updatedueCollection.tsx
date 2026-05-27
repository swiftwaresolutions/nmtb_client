import React, { useState, useEffect } from "react";
import { Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import { faFileInvoiceDollar } from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import { RootState } from "../../../../state/store";
import PageHeader from "../../../../components/PageHeader";
import { showErrorToast, showSuccessToast, showValidationError } from "../../../../utils/alertUtil";
import { SystemAdminApiService, PatientDetailsItem } from "../../../../api/system-admin/system-admin-api-service";
import { CashCounterApiService } from "../../../../api/cash-counter/cash-counter-api-service";
import { MedicalRecordsApiService } from "../../../../api/medical-records/medical-records-api-service";
import { handleNumberChange, handleNumberBlur, formatNumberDisplay } from "../../../../utils/numberInputUtil";

const systemAdminApi = new SystemAdminApiService();
const cashCounterApi = new CashCounterApiService();
const medicalRecordsApi = new MedicalRecordsApiService();

const UpdateDueCollection: React.FC = () => {
	const loginData = useSelector((state: RootState) => state.loginData);
	const [opNo, setOpNo] = useState("");
	const [loading, setLoading] = useState(false);
	const [patient, setPatient] = useState<PatientDetailsItem | null>(null);
	const [maxAllowedAmount, setMaxAllowedAmount] = useState<number>(0);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [visitId, setVisitId] = useState<number>(0);
	const [ipId, setIpId] = useState<number>(0);
	const [paymentMode, setPaymentMode] = useState<'cash' | 'bank' | 'cash-bank'>('cash');
	const [cashAmount, setCashAmount] = useState<number>(0);
	const [bankAmount, setBankAmount] = useState<number>(0);
	const [bankMode, setBankMode] = useState<string>('');
	const [selectedBank, setSelectedBank] = useState<string>('');
	const [transactionNo, setTransactionNo] = useState<string>('');
	const [banks, setBanks] = useState<any[]>([]);
	const [paymentModes, setPaymentModes] = useState<any[]>([]);

	const handleSearch = async (e?: React.FormEvent) => {
		if (e) e.preventDefault();
		const trimmedOpNo = opNo.trim();
		if (!trimmedOpNo) {
			showValidationError("Please enter OP Number");
			return;
		}
		setLoading(true);
		setPatient(null);
		setCashAmount(0);
		setBankAmount(0);
		setMaxAllowedAmount(0);
		setVisitId(0);
		setIpId(0);
		try {
			const data = await systemAdminApi.fetchPatientDetails(trimmedOpNo);
			const dueResponse = await cashCounterApi.fetchDueDetails(data.patId);
			const dueList: any[] = Array.isArray(dueResponse) ? dueResponse : (dueResponse?.data ?? []);
			const totalDue = dueList.reduce((sum: number, item: any) => sum + (Number(item?.due) || 0), 0);
			const maxAllowed = Math.max(0, (data.dueBalance ?? 0) - totalDue);
			const firstItem = dueList[0];
			setVisitId(Number(firstItem?.visitId || data.lastVisitId || 0));
			setIpId(Number(firstItem?.ipId || 0));
			setPatient(data);
			setMaxAllowedAmount(maxAllowed);
		} catch {
			showErrorToast("Patient not found or failed to fetch details");
		} finally {
			setLoading(false);
		}
	};

	// Reset split amounts when switching payment mode
	useEffect(() => {
		if (paymentMode === 'cash') {
			setBankAmount(0);
		} else if (paymentMode === 'bank') {
			setCashAmount(0);
		}
	}, [paymentMode]);

	// Fetch bank list and payment modes on mount
	useEffect(() => {
		medicalRecordsApi.fetchAllBankDetails().then((res: any[]) => {
			setBanks(res || []);
			const bankOne = (res || []).find((b: any) => b.id === 1);
			if (bankOne) setSelectedBank('1');
		}).catch(() => {});
		medicalRecordsApi.fetchAllPaymentModes().then((modes: any[]) => {
			const active = (modes || []).filter((m: any) => m.isActive === 1);
			setPaymentModes(active);
			if (active.length > 0) setBankMode(String(active[0].id));
		}).catch(() => {});
	}, []);

	const handleSubmit = async () => {
		if (!patient) return;
		const totalPaid = cashAmount + bankAmount;
		if (totalPaid <= 0) {
			showValidationError("Please enter a valid amount");
			return;
		}
		if (totalPaid > maxAllowedAmount) {
			showValidationError(`Amount cannot exceed ₹${maxAllowedAmount.toFixed(2)}`);
			return;
		}
		if ((paymentMode === 'bank' || paymentMode === 'cash-bank') && !selectedBank) {
			showValidationError("Please select a bank");
			return;
		}
		let paymentModeString = "CASH";
		if (paymentMode === 'bank') paymentModeString = "BANK";
		else if (paymentMode === 'cash-bank') paymentModeString = "CASH/BANK";
		setIsSubmitting(true);
		try {
			await cashCounterApi.updateDueBalance({
				orgId: 0,
				patId: patient.patId,
				visitId,
				ipId,
				amount: totalPaid,
				totalDiscount: 0,
				note: "",
				userId: loginData.id,
				systemIp: "0.0.0.0",
				paymentMode: paymentModeString,
				cashPaid: cashAmount,
				bankPaid: bankAmount,
				bankId: selectedBank ? Number(selectedBank) : 0,
				refNo: transactionNo,
				transType: (paymentMode !== 'cash' && bankMode) ? Number(bankMode) : 0,
			});
			showSuccessToast("Due balance updated successfully");
			setOpNo("");
			setPatient(null);
			setCashAmount(0);
			setBankAmount(0);
			setVisitId(0);
			setIpId(0);
			setPaymentMode('cash');
			setTransactionNo('');
		} catch {
			showErrorToast("Failed to update due balance");
			setIsSubmitting(false);
		}
	};

	const handleReset = () => {
		setOpNo("");
		setPatient(null);
		setCashAmount(0);
		setBankAmount(0);
		setMaxAllowedAmount(0);
		setVisitId(0);
		setIpId(0);
		setPaymentMode('cash');
		setTransactionNo('');
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
				icon={faFileInvoiceDollar}
				title="Due Collection"
				subtitle="Search by OP Number and proceed with due collection"
			/>

			<div className="content-body" style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "1.5rem" }}>
				<Container fluid>
					{/* Search strip */}
					<Card className="shadow-sm mb-3" style={{ borderRadius: "10px", border: "1px solid #e2e8f0" }}>
						<Card.Body className="py-3 px-4">
							<Form onSubmit={handleSearch} className="d-flex align-items-end gap-2 flex-wrap">
								<div>
									<Form.Label
										className="text-muted mb-1"
										style={{
											fontSize: "var(--font-size-xs)",
											fontWeight: "var(--font-weight-semibold)",
											textTransform: "uppercase",
											letterSpacing: "0.5px",
										}}
									>
										OP Number
									</Form.Label>
									<Form.Control
										type="text"
										placeholder="Enter OP Number"
										value={opNo}
										onChange={(e) => setOpNo(e.target.value)}
										disabled={loading}
										autoFocus
										style={{ width: "260px" }}
									/>
								</div>
								<Button variant="primary" type="submit" disabled={loading || !opNo.trim()}>
									{loading ? "Searching..." : "Search"}
								</Button>
								<Button variant="outline-secondary" type="button" onClick={handleReset} disabled={loading}>
									Reset
								</Button>
							</Form>
						</Card.Body>
					</Card>

					{/* Patient details + amount */}
					{patient && (
						<Card className="shadow-sm" style={{ borderRadius: "10px", border: "1px solid #e2e8f0" }}>
							<Card.Body className="py-4 px-4">
								<Row className="g-3 align-items-end">
									<Col xs={6} md={3}>
										<div
											className="text-muted mb-1"
											style={{
												fontSize: "var(--font-size-xs)",
												fontWeight: "var(--font-weight-semibold)",
												textTransform: "uppercase",
												letterSpacing: "0.5px",
											}}
										>
											OP No
										</div>
										<div style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-semibold)" }}>
											{patient.displayNumber}
										</div>
									</Col>
									<Col xs={6} md={3}>
										<div
											className="text-muted mb-1"
											style={{
												fontSize: "var(--font-size-xs)",
												fontWeight: "var(--font-weight-semibold)",
												textTransform: "uppercase",
												letterSpacing: "0.5px",
											}}
										>
											Patient Name
										</div>
										<div style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-semibold)" }}>
											{patient.name}
										</div>
									</Col>
									<Col xs={6} md={2}>
										<div
											className="text-muted mb-1"
											style={{
												fontSize: "var(--font-size-xs)",
												fontWeight: "var(--font-weight-semibold)",
												textTransform: "uppercase",
												letterSpacing: "0.5px",
											}}
										>
											Age / Sex
										</div>
										<div style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)" }}>
											{patient.age} / {patient.sex}
										</div>
									</Col>
									<Col xs={6} md={2}>
										<div
											className="text-muted mb-1"
											style={{
												fontSize: "var(--font-size-xs)",
												fontWeight: "var(--font-weight-semibold)",
												textTransform: "uppercase",
												letterSpacing: "0.5px",
											}}
										>
											Due Balance
										</div>
										<div
											style={{
												fontSize: "var(--font-size-sm)",
												fontWeight: "var(--font-weight-bold)",
												color: maxAllowedAmount > 0 ? "var(--danger-color, #dc3545)" : "inherit",
											}}
										>
											&#8377; {maxAllowedAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
										</div>
									</Col>
</Row>

								{/* Payment Mode */}
								<Row className="g-3 mt-2">
									<Col xs={12}>
										<div
											className="text-muted mb-2"
											style={{
												fontSize: "var(--font-size-xs)",
												fontWeight: "var(--font-weight-semibold)",
												textTransform: "uppercase",
												letterSpacing: "0.5px",
											}}
										>
											Payment Mode
										</div>
										<div className="d-flex gap-2 flex-wrap">
											{(['cash', 'bank', 'cash-bank'] as const).map((mode) => (
												<Button
													key={mode}
													size="sm"
													onClick={() => setPaymentMode(mode)}
													disabled={isSubmitting}
													style={paymentMode === mode ? {
														backgroundColor: "var(--page-secondary-color)",
														borderColor: "var(--page-secondary-color)",
														color: "var(--page-primary-color)",
													} : {
														backgroundColor: "var(--page-primary-color)",
														borderColor: "var(--page-primary-color)",
														color: "var(--page-secondary-color)",
													}}
												>
													{mode === 'cash' ? 'Cash' : mode === 'bank' ? 'Bank' : 'Cash + Bank'}
												</Button>
											))}
										</div>
									</Col>
								</Row>

{/* Payment Inputs */}
							<Row className="g-3 mt-1 align-items-end">
								{(paymentMode === 'cash' || paymentMode === 'cash-bank') && (
									<Col xs={6} md={2}>
										<Form.Label className="text-muted mb-1" style={{ fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-semibold)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
											Cash Paid
										</Form.Label>
										<Form.Control
											type="number"
											placeholder="0"
											min="0"
											step="0.01"
											value={formatNumberDisplay(cashAmount)}
											onChange={(e) => setCashAmount(handleNumberChange(e.target.value))}
											onBlur={(e) => setCashAmount(handleNumberBlur(e.target.value))}
											disabled={isSubmitting}
										/>
									</Col>
								)}
								{(paymentMode === 'bank' || paymentMode === 'cash-bank') && (
									<Col xs={6} md={2}>
										<Form.Label className="text-muted mb-1" style={{ fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-semibold)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
											Bank Paid
										</Form.Label>
										<Form.Control
											type="number"
											placeholder="0"
											min="0"
											step="0.01"
											value={formatNumberDisplay(bankAmount)}
											onChange={(e) => setBankAmount(handleNumberChange(e.target.value))}
											onBlur={(e) => setBankAmount(handleNumberBlur(e.target.value))}
											disabled={isSubmitting}
										/>
									</Col>
								)}
								{(paymentMode === 'bank' || paymentMode === 'cash-bank') && (
									<>
										<Col xs={6} md={2}>
											<Form.Label className="text-muted mb-1" style={{ fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-semibold)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
												Bank Type
											</Form.Label>
											<Form.Select
												value={bankMode}
												onChange={(e) => setBankMode(e.target.value)}
												disabled={isSubmitting}
											>
												{paymentModes.map((m: any) => (
													<option key={m.id} value={m.id}>{m.name}</option>
												))}
											</Form.Select>
										</Col>
										<Col xs={6} md={3}>
											<Form.Label className="text-muted mb-1" style={{ fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-semibold)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
												Bank Name
											</Form.Label>
											<Form.Select
												value={selectedBank}
												onChange={(e) => setSelectedBank(e.target.value)}
												disabled={isSubmitting}
											>
												<option value="">Select Bank</option>
												{banks.filter((b: any) => b.isActive === 1).map((b: any) => (
													<option key={b.id} value={b.id}>{b.name}</option>
												))}
											</Form.Select>
										</Col>
										<Col xs={6} md={3}>
											<Form.Label className="text-muted mb-1" style={{ fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-semibold)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
												Reference No
											</Form.Label>
											<Form.Control
												type="text"
												placeholder="Transaction / Ref No"
												value={transactionNo}
												onChange={(e) => setTransactionNo(e.target.value)}
												disabled={isSubmitting}
											/>
										</Col>
									</>
								)}
							</Row>

								<Col xs={12} className="d-flex justify-content-end mt-3">
									<Button
										variant="success"
										onClick={handleSubmit}
										disabled={isSubmitting || (cashAmount + bankAmount) <= 0}
									>
										{isSubmitting ? "Submitting..." : "Submit"}
									</Button>
								</Col>
							</Card.Body>
						</Card>
					)}
				</Container>
			</div>
		</div>
	);
};

export default UpdateDueCollection;
