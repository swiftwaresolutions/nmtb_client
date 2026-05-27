import React, { useMemo } from 'react';
import { Button, Col, Modal, Row, Table } from 'react-bootstrap';
import { GoodsReceiptRegisterMedicine, GoodsReceiptRegisterRecord } from '../../../../../../api/central-stores/central-stores-api-service';
import { formatReportDate } from '../../../../../../medical-records/utils/reportUtils';

interface MedicineDetailProps {
	show: boolean;
	onHide: () => void;
	receipt: GoodsReceiptRegisterRecord | null;
	onPrint: () => void;
}

const MedicineDetail: React.FC<MedicineDetailProps> = ({
	show,
	onHide,
	receipt,
	onPrint,
}) => {
	const receiptTotals = useMemo(() => {
		if (!receipt) {
			return { gstAmount: 0, profitAmount: 0, lineTotal: 0 };
		}

		return receipt.medicines.reduce(
			(accumulator, item) => {
				accumulator.gstAmount += item.gstAmt ?? 0;
				accumulator.profitAmount += item.profit ?? 0;
				accumulator.lineTotal += item.totalAmt ?? 0;
				return accumulator;
			},
			{ gstAmount: 0, profitAmount: 0, lineTotal: 0 }
		);
	}, [receipt]);

	const renderUnits = (item: GoodsReceiptRegisterMedicine) => {
		if (item.units) {
			return item.units;
		}
		return String(item.totalUnits ?? 0);
	};

	const renderFree = (item: GoodsReceiptRegisterMedicine) => {
		if (item.free) {
			return item.free;
		}
		return String(item.totalFree ?? 0);
	};

	return (
		<Modal show={show} onHide={onHide} size="xl" centered backdrop="static" keyboard={false}>
			<Modal.Header closeButton className="bg-light border-bottom align-items-start">
				<div className="w-100 pe-4">
					<Modal.Title className="fw-bold">Goods Receipt Details</Modal.Title>
					{receipt && (
						<div className="mt-2 border rounded p-3 bg-light">
							<Row className="g-3">
								<Col xs={12} md={4}>
									<div><strong>{receipt.supplierName || '-'}</strong></div>
									<div><strong>{receipt.supplierAddress || '-'}</strong></div>
									
								</Col>
								<Col xs={12} md={4}>
									<div><strong>G.R. No:</strong> {receipt.grNo || '-'}</div>
									<div><strong>Invoice No:</strong> {receipt.invoiceNo || '-'}</div>
								</Col>
                                <Col xs={12} md={4} className="text-md-end">
									<div>
										<strong>Invoice Date:</strong>{' '}
										{receipt.invoiceDate ? formatReportDate(receipt.invoiceDate, 'DD/MM/YYYY') : '-'}
									</div>
									<div>
										<strong>Received Date:</strong>{' '}
										{receipt.receivedDate ? formatReportDate(receipt.receivedDate, 'DD/MM/YYYY') : '-'}
									</div>
                                    <div>
                                        <strong>User:</strong> {receipt.userName || '-'}
                                    </div>
                                </Col>
								{/* <Col xs={12} md={4} className="text-md-end">
									<div><strong>Total Value:</strong> {(receipt.totalValue ?? 0).toFixed(2)}</div>
									<div><strong>MRP Value:</strong> {(receipt.mrpValue ?? 0).toFixed(2)}</div>
									<div><strong>Items:</strong> {receipt.medicines.length}</div>
								</Col> */}
							</Row>
						</div>
					)}
				</div>
			</Modal.Header>

			<Modal.Body className="p-0 d-flex flex-column">
				{receipt && (
					<>
						<div className="flex-grow-1 overflow-auto" style={{ minHeight: 0 }}>
							<div className="p-3">
								<Table striped bordered hover size="sm" className="mb-0">
									<thead className="bg-light sticky-top" style={{ zIndex: 10 }}>
										<tr>
											<th>S.No</th>
											<th>Medicine Name</th>
											<th>HSN Code</th>
											<th>Units</th>
											<th>Total Units</th>
											<th>Free</th>
											<th>Total Free</th>
											<th>Batch No</th>
											<th>Expiry Date</th>
											<th className="text-end">Cost</th>
											<th className="text-end">MRP</th>
											<th className="text-end">Discount %</th>
											<th className="text-end">Discount</th>
											<th className="text-end">Total</th>
											<th className="text-end">GST %</th>
											<th className="text-end">GST Amt</th>
											<th className="text-end">Profit %</th>
											<th className="text-end">Profit</th>
										</tr>
									</thead>
									<tbody>
										{receipt.medicines.length === 0 ? (
											<tr>
												<td colSpan={15} className="text-center text-muted py-4">
													No medicine items found.
												</td>
											</tr>
										) : (
											receipt.medicines.map((item, index) => (
												<tr key={`${item.batchNo}-${item.medicineName}-${index}`}>
													<td>{index + 1}</td>
													<td>{item.medicineName || '-'}</td>
													<td>{item.hsnCode || '-'}</td>
													<td>{renderUnits(item)}</td>
													<td>{item.totalUnits}</td>
													<td>{renderFree(item)}</td>
													<td>{item.totalFree}</td>
													<td>{item.batchNo || '-'}</td>
													<td>{item.expiryDate ? item.expiryDate : '-'}</td>
													<td className="text-end">{(item.cost ?? 0).toFixed(2)}</td>
													<td className="text-end">{(item.mrp ?? 0).toFixed(2)}</td>
													<td className="text-end">{(item.discountPercentage ?? 0).toFixed(2)}</td>
													<td className="text-end">{(item.discount ?? 0).toFixed(2)}</td>
													<td className="text-end">{(item.totalAmt ?? 0).toFixed(2)}</td>
													<td className="text-end">{(item.gstPer ?? 0).toFixed(2)}</td>
													<td className="text-end">{(item.gstAmt ?? 0).toFixed(2)}</td>
													<td className="text-end">{(item.profitPercentage ?? 0).toFixed(2)}</td>
													<td className="text-end">{(item.profit ?? 0).toFixed(2)}</td>
												</tr>
											))
										)}
									</tbody>
								</Table>
							</div>
						</div>

						<div className="p-3 border-top bg-light">
							<Row className="g-2">
								<Col xs={6} md={3}>
									<div className="small text-muted">Items</div>
									<div className="fw-bold">{receipt.medicines.length}</div>
								</Col>
								<Col xs={6} md={3}>
									<div className="small text-muted">Line Total</div>
									<div className="fw-bold">{receiptTotals.lineTotal.toFixed(2)}</div>
								</Col>
								<Col xs={6} md={3}>
									<div className="small text-muted">GST Amount</div>
									<div className="fw-bold">{receiptTotals.gstAmount.toFixed(2)}</div>
								</Col>
								<Col xs={6} md={3}>
									<div className="small text-muted">Profit</div>
									<div className="fw-bold" style={{ color: 'var(--color-success)' }}>
										{receiptTotals.profitAmount.toFixed(2)}
									</div>
								</Col>
							</Row>
						</div>
					</>
				)}
			</Modal.Body>

			<Modal.Footer className="bg-light border-top py-2 px-3">
				<Button size="sm" onClick={onHide} className="theme-outline-btn-secondary">
					Close
				</Button>
				<Button size="sm" onClick={onPrint} className="fw-bold theme-btn-primary">
					Print
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default MedicineDetail;
