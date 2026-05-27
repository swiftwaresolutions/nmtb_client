import React from "react";
import { Container, Card, Row, Col, Table, Button } from "react-bootstrap";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Printer, FileEarmarkText } from "react-bootstrap-icons";
import PageHeader from "../../../components/PageHeader";
import ReportKPICard from "../../../medical-records/components/ReportKPICard";
import { faCube } from "@fortawesome/free-solid-svg-icons";

export default function GRNDetails() {
    const { grnNo } = useParams<{ grnNo: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const grnData = location.state?.grnData;

    if (!grnData) {
        return (
            <Container className="py-1">
                <Card>
                    <Card.Body className="text-center py-5">
                        <h4 className="text-muted">No GRN data found</h4>
                        <Button variant="primary" onClick={() => navigate(-1)} className="mt-3">
                            <ArrowLeft className="me-2" />
                            Go Back
                        </Button>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    const profit = (grnData.totalMRP || 0) - (grnData.totalCost || 0);
    const profitPercent = grnData.totalCost > 0 ? ((profit / grnData.totalCost) * 100) : 0;

    // Sample line items data - This would come from API in real implementation
    const lineItems = [
        {
            slNo: 1,
            medicineName: "FEBUTAZ 40 MG TAB",
            hsnCode: "30049099",
            strips: "20 x 15",
            units: 300,
            free: 0,
            taxFQty: "No",
            batchNo: "SIG2049A",
            cost: 175.72,
            mrp: 230.63,
            disc: "10%",
            discount: 351.44,
            total: 3162.96,
            gstPercent: "5% on Cost",
            gstAmt: 158.15,
            gstOnMRP: 219.65,
            profitPercent: 31.25,
            profitAmt: 54.91,
            netTotal: 3321.11
        }
    ];

    const extraDiscount = 0.00;
    const extraCharge = 0.00;
    const remark = "OK";

    const handlePrint = () => {
        window.print();
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", minHeight: 0, overflow: "hidden" }}>
            <PageHeader
                icon={faCube}
                title={`Goods Receipt Note - ${grnNo}`}
                subtitle="View complete GRN details"
            />
            
            <div className="content-body" style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "1rem" }}>
                <Container fluid>
                    {/* Action Buttons */}
                    <div className="d-flex justify-content-between align-items-center mb-3 p-3 bg-light rounded shadow-sm">
                        <Button variant="outline-primary" onClick={() => navigate(-1)} className="d-flex align-items-center">
                            <ArrowLeft className="me-2" size={18} />
                            <span>Back to Register</span>
                        </Button>
                        <div>
                            <Button variant="primary" onClick={handlePrint} className="d-flex align-items-center">
                                <Printer className="me-2" size={18} />
                                <span>Print</span>
                            </Button>
                        </div>
                    </div>

                    {/* Invoice Information */}
                    <Card className="mb-3 shadow-sm">
                        <Card.Body className="py-2">
                            <Row className="g-3">
                                <Col md={4} sm={6}>
                                    <div><strong>Invoice No:</strong> {grnData.invoiceNo}</div>
                                </Col>
                                <Col md={4} sm={6}>
                                    <div><strong>Invoice Date:</strong> {grnData.invoiceDate}</div>
                                </Col>
                                <Col md={4} sm={6}>
                                    <div><strong>Received Date:</strong> {grnData.receiptDate}</div>
                                </Col>
                                <Col md={4} sm={6}>
                                    <div><strong>PO No:</strong> {grnData.poNo}</div>
                                </Col>
                                <Col md={4} sm={6}>
                                    <div><strong>Supplier Name:</strong> {grnData.supplierName}</div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    {/* Line Items Section */}
                    <Card className="mb-4 shadow">
                        <Card.Body className="p-0">
                            <div style={{ overflowX: "auto" }}>
                                <Table bordered hover size="sm" className="mb-0">
                                    <thead style={{ background: "#e9ecef", position: "sticky", top: 0, zIndex: 1 }}>
                                        <tr>
                                            <th style={{ minWidth: "50px" }}>S.No</th>
                                            <th style={{ minWidth: "200px" }}>Medicine Name</th>
                                            <th style={{ minWidth: "100px" }}>HSN Code</th>
                                            <th style={{ minWidth: "120px" }}>Strips x Units</th>
                                            <th style={{ minWidth: "80px" }}>Units</th>
                                            <th style={{ minWidth: "60px" }}>Free</th>
                                            <th style={{ minWidth: "80px" }}>Tax FQty</th>
                                            <th style={{ minWidth: "100px" }}>Batch No</th>
                                            <th style={{ minWidth: "100px" }}>Cost</th>
                                            <th style={{ minWidth: "100px" }}>MRP</th>
                                            <th style={{ minWidth: "80px" }}>Disc</th>
                                            <th style={{ minWidth: "100px" }}>Discount</th>
                                            <th style={{ minWidth: "100px" }}>Total</th>
                                            <th style={{ minWidth: "100px" }}>GST %</th>
                                            <th style={{ minWidth: "100px" }}>GST Amt</th>
                                            <th style={{ minWidth: "100px" }}>GST on MRP</th>
                                            <th style={{ minWidth: "100px" }}>Profit %</th>
                                            <th style={{ minWidth: "100px" }}>Profit</th>
                                            <th style={{ minWidth: "120px" }}>Net Total</th>
                                        </tr>
                                    </thead>
                                            <tbody>
                                                {lineItems.map((item) => (
                                                    <tr key={item.slNo}>
                                                        <td className="text-center">{item.slNo}</td>
                                                        <td>{item.medicineName}</td>
                                                        <td>{item.hsnCode}</td>
                                                        <td className="text-center">{item.strips}</td>
                                                        <td className="text-end">{item.units}</td>
                                                        <td className="text-end">{item.free}</td>
                                                        <td className="text-center">{item.taxFQty}</td>
                                                        <td>{item.batchNo}</td>
                                                        <td className="text-end">{item.cost.toFixed(2)}</td>
                                                        <td className="text-end">{item.mrp.toFixed(2)}</td>
                                                        <td className="text-center">{item.disc}</td>
                                                        <td className="text-end">{item.discount.toFixed(2)}</td>
                                                        <td className="text-end">{item.total.toFixed(2)}</td>
                                                        <td className="text-center">{item.gstPercent}</td>
                                                        <td className="text-end">{item.gstAmt.toFixed(2)}</td>
                                                        <td className="text-end">{item.gstOnMRP.toFixed(2)}</td>
                                                        <td className="text-end">{item.profitPercent.toFixed(2)}%</td>
                                                        <td className="text-end">{item.profitAmt.toFixed(2)}</td>
                                                        <td className="text-end" style={{ fontWeight: "var(--font-weight-semibold)" }}>
                                                            {item.netTotal.toFixed(2)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr className="sticky-bottom fw-bold text-end">
                                                    <td colSpan={12}>TOTAL</td>
                                                    <td className="text-danger">
                                                        {lineItems.reduce((sum, item) => sum + item.total, 0).toFixed(2)}
                                                    </td>
                                                    <td></td>
                                                    <td className="text-danger">
                                                        {lineItems.reduce((sum, item) => sum + item.gstAmt, 0).toFixed(2)}
                                                    </td>
                                                    <td className="text-danger">
                                                        {lineItems.reduce((sum, item) => sum + item.gstOnMRP, 0).toFixed(2)}
                                                    </td>
                                                    <td></td>
                                                    <td className="text-danger">
                                                        {lineItems.reduce((sum, item) => sum + item.profitAmt, 0).toFixed(2)}
                                                    </td>
                                                    <td className="text-danger">
                                                        {lineItems.reduce((sum, item) => sum + item.netTotal, 0).toFixed(2)}
                                                    </td>
                                                </tr>
                                            </tfoot>
                                </Table>
                            </div>
                        </Card.Body>
                    </Card>
                </Container>
            </div>

            {/* Financial Summary - Bottom Bar */}
            <div style={{ padding: "1rem", background: "#e9ecef", borderTop: "1px solid #dee2e6" }}>
                <Container fluid>
                    <div className="d-flex flex-wrap gap-4 align-items-center justify-content-between" style={{ fontSize: "0.95rem" }}>
                        <div className="d-flex gap-4 flex-wrap">
                            <div>
                                <strong>Total Amount:</strong> <span className="text-danger fw-bold">₹{grnData.totalCost.toFixed(2)}</span>
                            </div>
                            <div>
                                <strong>Extra Discount:</strong> <span className="text-danger fw-bold">₹{extraDiscount.toFixed(2)}</span>
                            </div>
                            <div>
                                <strong>Extra Charge:</strong> <span className="text-danger fw-bold">₹{extraCharge.toFixed(2)}</span>
                            </div>
                            <div>
                                <strong>Final Amount:</strong> <span className="text-danger fw-bold" style={{ fontSize: "1.1rem" }}>₹{(grnData.totalCost - extraDiscount + extraCharge).toFixed(2)}</span>
                            </div>
                        </div>
                        <div>
                            <strong>Remark:</strong> {remark || "OK"}
                        </div>
                    </div>
                </Container>
            </div>
        </div>
    );
}
