import React, { useState } from "react";
import { Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import { faFileInvoiceDollar } from "@fortawesome/free-solid-svg-icons";
import PageHeader from "../../../../components/PageHeader";
import { showErrorToast, showSuccessToast, showValidationError } from "../../../../utils/alertUtil";
import { SystemAdminApiService, PatientDetailsItem } from "../../../../api/system-admin/system-admin-api-service";
import { CashCounterApiService } from "../../../../api/cash-counter/cash-counter-api-service";
import { handleNumberChange, handleNumberBlur, formatNumberDisplay } from "../../../../utils/numberInputUtil";

const systemAdminApi = new SystemAdminApiService();
const cashCounterApi = new CashCounterApiService();

const UpdateDueCollection: React.FC = () => {
	const [opNo, setOpNo] = useState("");
	const [loading, setLoading] = useState(false);
	const [patient, setPatient] = useState<PatientDetailsItem | null>(null);
	const [amount, setAmount] = useState<number>(0);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSearch = async (e?: React.FormEvent) => {
		if (e) e.preventDefault();
		const trimmedOpNo = opNo.trim();
		if (!trimmedOpNo) {
			showValidationError("Please enter OP Number");
			return;
		}
		setLoading(true);
		setPatient(null);
		setAmount(0);
		try {
			const data = await systemAdminApi.fetchPatientDetails(trimmedOpNo);
			setPatient(data);
		} catch {
			showErrorToast("Patient not found or failed to fetch details");
		} finally {
			setLoading(false);
		}
	};

	const handleSubmit = async () => {
		if (!patient) return;
		if (!amount || amount <= 0) {
			showValidationError("Please enter a valid amount");
			return;
		}
		setIsSubmitting(true);
		try {
			await cashCounterApi.updateDueBalance({
				orgId: 0,
				patId: patient.patId,
				visitId: 0,
				ipId: 0,
				amount,
				totalDiscount: 0,
				note: "",
				userId: 0,
				systemIp: "0.0.0.0",
				paymentMode: "CASH",
				cashPaid: amount,
				bankPaid: 0,
				bankId: 0,
				refNo: "",
				transType: 0,
			});
			showSuccessToast("Due balance updated successfully");
			setOpNo("");
			setPatient(null);
			setAmount(0);
		} catch {
			showErrorToast("Failed to update due balance");
			setIsSubmitting(false);
		}
	};

	const handleReset = () => {
		setOpNo("");
		setPatient(null);
		setAmount(0);
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
												color: patient.dueBalance > 0 ? "var(--danger-color, #dc3545)" : "inherit",
											}}
										>
											&#8377; {patient.dueBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
										</div>
									</Col>
									<Col xs={12} md={2}>
										<Form.Label
											className="text-muted mb-1"
											style={{
												fontSize: "var(--font-size-xs)",
												fontWeight: "var(--font-weight-semibold)",
												textTransform: "uppercase",
												letterSpacing: "0.5px",
											}}
										>
											Amount
										</Form.Label>
										<Form.Control
											type="number"
											placeholder="0"
											min="0"
											step="0.01"
											value={formatNumberDisplay(amount)}
											onChange={(e) => setAmount(handleNumberChange(e.target.value))}
											onBlur={(e) => setAmount(handleNumberBlur(e.target.value))}
										disabled={isSubmitting}
									/>
								</Col>
								<Col xs={12} className="d-flex justify-content-end mt-2">
									<Button
										variant="success"
										onClick={handleSubmit}
										disabled={isSubmitting || amount <= 0}
									>
										{isSubmitting ? "Submitting..." : "Submit"}
									</Button>
									</Col>
								</Row>
							</Card.Body>
						</Card>
					)}
				</Container>
			</div>
		</div>
	);
};

export default UpdateDueCollection;
