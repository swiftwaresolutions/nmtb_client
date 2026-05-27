import React, { useEffect, useState } from "react";
import { Row, Col, Card, Form, Table, InputGroup, Button } from "react-bootstrap";
import { Calendar, XCircle, Check, Search } from "react-bootstrap-icons";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import PageHeader from "../../../../components/PageHeader";
import SearchableSelect from "../../../../components/SearchableSelect";
import { CashCounterApiService } from "../../../../api/cash-counter/cash-counter-api-service";
import { RootState } from "../../../../state/store";
import { showErrorToast, showSuccessToast, showValidationError } from "../../../../utils/alertUtil";
import { formatNumberDisplay, handleNumberBlur, handleNumberChange } from "../../../../utils/numberInputUtil";

interface AccountHead {
  headId: number;
  headName: string;
}

interface CompanyReceivableRow {
  id: number;
  comapnyAccountId: number;
  finalBillId: number;
  modId: number;
  patId: number;
  opNo: string;
  billNo: string;
  billDate: string;
  patientName: string;
  netAmt: number;
  pendingAmt: number;
  discountAmt: number;
  paidAmt: number;
  isSelected: boolean;
}

const CompanyReceivables: React.FC = () => {
  const themePrimary = "var(--page-primary-color)";
  const themeSecondary = "var(--page-secondary-color)";

  const cashCounterApi = new CashCounterApiService();
  const loginData = useSelector((state: RootState) => state.loginData);
  const organization = useSelector((state: RootState) => state.appReducer.organization);

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const [companyList, setCompanyList] = useState<AccountHead[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [loadingCompanies, setLoadingCompanies] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchPerformed, setSearchPerformed] = useState<boolean>(false);
  const [receivables, setReceivables] = useState<CompanyReceivableRow[]>([]);
  const [globalDiscount, setGlobalDiscount] = useState<number>(0);
  const [extraAmount, setExtraAmount] = useState<number>(0);
  const [isBank, setIsBank] = useState<number>(0);
  const [chequeNo, setChequeNo] = useState<string>("");
  const [selectedBankId, setSelectedBankId] = useState<string>("");
  const [bankList, setBankList] = useState<{ id: number; name: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [opNoFilter, setOpNoFilter] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const totalPendingAmount = receivables.reduce((sum, item) => sum + item.pendingAmt, 0);
  const selectedTotal = receivables.filter(i => i.isSelected).reduce((sum, i) => sum + i.paidAmt, 0);
  const finalAmount = Math.max(0, selectedTotal + extraAmount - globalDiscount);

  useEffect(() => {
    const fetchAccountHeads = async () => {
      setLoadingCompanies(true);
      try {
        const response = await cashCounterApi.fetchAccountHeads();
        const mappedHeads = (response || [])
          .filter((item: any) => item?.headId && item?.headName)
          .map((item: any) => ({
            headId: Number(item.headId),
            headName: String(item.headName),
          }));
        setCompanyList(mappedHeads);
      } catch (error: any) {
        console.error("Error fetching account heads:", error);
        showErrorToast(
          error?.response?.data?.error || "Failed to load company names"
        );
      } finally {
        setLoadingCompanies(false);
      }
    };

    fetchAccountHeads();

    cashCounterApi.fetchBankNames().then((res: any[]) => {
      setBankList((res || []).map((b: any) => ({ id: Number(b.id), name: String(b.name || "") })));
    }).catch(() => {});
  }, []);

  const handleSearch = async () => {
    if (!selectedCompanyId) {
      showValidationError("Please select a company name");
      return;
    }

    setSearchPerformed(true);
    setLoading(true);

    try {
      const response = await cashCounterApi.fetchCompanyReceivables(selectedCompanyId);
      const mappedData: CompanyReceivableRow[] = (response || []).map((item: any, index: number) => ({
        id: Number(item?.id) || index + 1,
        comapnyAccountId: Number(item?.comapnyAccountId ?? item?.companyAccountId ?? item?.id ?? 0),
        finalBillId: Number(item?.finalBillId ?? 0),
        modId: Number(item?.modId ?? 0),
        patId: Number(item?.patId ?? 0),
        opNo: String(item?.opNo || ""),
        billNo: String(item?.billNo || ""),
        billDate: String(item?.billDateTime || item?.billDate || item?.date || item?.dateTime || "-"),
        patientName: String(item?.patName || ""),
        netAmt: Number(item?.due) || 0,
        pendingAmt: Number(item?.pendingAmt) || 0,
        discountAmt: 0,
        paidAmt: 0,
        isSelected: false,
      }));
      setReceivables(mappedData);

      // Enrich billNo for each row using fetchPatientDetailsByFinalBillId
      mappedData.forEach(async (row) => {
        if (!row.finalBillId) return;
        try {
          const details = await cashCounterApi.fetchPatientDetailsByFinalBillId(row.finalBillId);
          if (details?.billNo) {
            setReceivables(prev =>
              prev.map(r => r.finalBillId === row.finalBillId ? { ...r, billNo: String(details.billNo) } : r)
            );
          }
        } catch {
          // silently ignore per-row errors
        }
      });
      setGlobalDiscount(0);
      setExtraAmount(0);
      setChequeNo("");
      setSelectedBankId("");
    } catch (error: any) {
      console.error("Error fetching company receivables:", error);
      showErrorToast(
        error?.response?.data?.error || "Failed to fetch company receivables"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSelectedCompanyId("");
    setSearchPerformed(false);
    setReceivables([]);
    setGlobalDiscount(0);
    setExtraAmount(0);
    setIsBank(0);
    setChequeNo("");
    setSelectedBankId("");
    setOpNoFilter("");
  };

  const handleRowClick = (id: number) => {
    setReceivables(prev =>
      prev.map(item => {
        if (item.id !== id) return item;
        const selecting = !item.isSelected;
        return { ...item, isSelected: selecting, paidAmt: selecting ? item.pendingAmt : 0 };
      })
    );
  };

  const handlePaidAmtChange = (id: number, value: number) => {
    setReceivables(prev =>
      prev.map(item => {
        if (item.id !== id) return item;
        const sanitized = Math.min(Math.max(value, 0), item.pendingAmt);
        return { ...item, paidAmt: sanitized, isSelected: sanitized > 0 };
      })
    );
  };

  const handleSelectAll = () => {
    setReceivables(prev => prev.map(item => ({ ...item, isSelected: true, paidAmt: item.pendingAmt })));
  };

  const handleRemoveAll = () => {
    setReceivables(prev => prev.map(item => ({ ...item, isSelected: false, paidAmt: 0 })));
  };

  const handleSubmit = async () => {
    const selectedRows = receivables.filter((item) => item.isSelected && item.paidAmt > 0);

    const totalPaidAmount = selectedRows.reduce((sum, item) => sum + item.paidAmt, 0);
    if (totalPaidAmount <= 0 && extraAmount <= 0) {
      showValidationError("Paid amount should be greater than zero");
      return;
    }

    if (extraAmount > 0 && !notes.trim()) {
      showValidationError("Please enter notes when extra amount is provided");
      return;
    }

    const payload = {
      noteNo: "",
      notes: notes.trim(),
      headId: Number(selectedCompanyId) || 0,
      orgId: Number(organization?.id) || 1,
      total: totalPaidAmount,
      additionalAmount: extraAmount,
      isSubmitted: 1,
      discount: globalDiscount,
      finalAmt: finalAmount,
      isBank: isBank,
      chequeNo: chequeNo,
      bankId: Number(selectedBankId) || 0,
      details: selectedRows.map((item) => ({
        comapnyAccountId: item.comapnyAccountId,
        amt: item.paidAmt,
        disc: 0,
        modId: item.modId,
        billId: item.finalBillId,
        billDisplay: item.billNo || item.opNo || "",
        patId: item.patId,
      })),
    };

    setIsSubmitting(true);
    try {
      await cashCounterApi.saveCompanyPayables(payload);
      showSuccessToast("Company payables submitted successfully");
      setGlobalDiscount(0);
      setNotes("");
      await handleSearch();
    } catch (error: any) {
      console.error("Error saving company payables:", error);
      showErrorToast(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Failed to submit company payables"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>

      <div
        className="content-body"
        style={{
          display: "flex",
          flex: 1,
          minHeight: 0,
          flexDirection: "column",
          gap: "1rem",
          overflowY: "auto",
        }}
      >
        <Card className="shadow-sm bg-light" style={{ flexShrink: 0 }}>
          <Card.Body>
            <Row className="align-items-end">
              <Col md={6}>
                <Form.Group>
                  <Form.Label style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)" }}>
                    Company Name <span className="text-danger">*</span>
                  </Form.Label>
                  <SearchableSelect
                    options={companyList.map(company => ({
                      value: company.headId.toString(),
                      label: company.headName
                    }))}
                    value={selectedCompanyId}
                    onChange={(value) => setSelectedCompanyId(value)}
                    placeholder="Select Company"
                    disabled={loadingCompanies || loading}
                  />
                </Form.Group>
              </Col>

              <Col md={2}>
                <div className="d-flex gap-2 justify-content-md-end">
                  <InputGroup.Text
                    title="Search"
                    onClick={handleSearch}
                    style={{ cursor: "pointer", backgroundColor: "var(--page-secondary-color)", color: "var(--page-primary-color)", border: "none" }}
                  >
                    <Check size={18} />
                  </InputGroup.Text>
                  <InputGroup.Text
                    title="Clear"
                    onClick={handleClear}
                    style={{ cursor: "pointer", backgroundColor: "var(--page-secondary-color)", color: "var(--page-primary-color)", border: "none" }}
                  >
                    <XCircle size={18} />
                  </InputGroup.Text>
                </div>
              </Col>

              <Col md={4}>
                <div className="d-flex gap-2 justify-content-md-end">
                  <Button
                    size="sm"
                    style={{ backgroundColor: "var(--page-secondary-color)", color: "var(--page-primary-color)", border: "none" }}
                    onClick={handleSelectAll}
                    disabled={receivables.length === 0}
                  >
                    Select All
                  </Button>
                  <Button
                    size="sm"
                    style={{ backgroundColor: "var(--page-secondary-color)", color: "var(--page-primary-color)", border: "none" }}
                    onClick={handleRemoveAll}
                    disabled={receivables.length === 0}
                  >
                    Remove All
                  </Button>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Card
          className="shadow-sm"
          style={{
            border: `1px solid ${themePrimary}`,
          }}
        >
          <Card.Header
            style={{
              backgroundColor: themePrimary,
              color: themeSecondary,
              borderBottom: `2px solid ${themePrimary}`,
              flexShrink: 0,
            }}
          >
            <div className="d-flex justify-content-between align-items-center gap-3">
              <h5 className="mb-0" style={{ fontWeight: "var(--font-weight-semibold)", fontSize: "var(--font-size-lg)", whiteSpace: "nowrap" }}>
                Company Receivables List
              </h5>
              <InputGroup size="sm" style={{ maxWidth: "240px" }}>
                <InputGroup.Text style={{ backgroundColor: themeSecondary, border: "none" }}><Search size={14} color={themePrimary} /></InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Filter by OP No..."
                  value={opNoFilter}
                  onChange={(e) => setOpNoFilter(e.target.value)}
                  style={{ border: "none" }}
                />
                {opNoFilter && (
                  <InputGroup.Text
                    style={{ cursor: "pointer", backgroundColor: themeSecondary, border: "none" }}
                    onClick={() => setOpNoFilter("")}
                  >
                    <XCircle size={14} color={themePrimary} />
                  </InputGroup.Text>
                )}
              </InputGroup>
              <span
                className={`badge ${
                  receivables.length > 0
                    ? "theme-badge-primary"
                    : "theme-badge-secondary"
                }`}
              >
                {receivables.length} Record(s)
              </span>
            </div>
          </Card.Header>

          <Card.Body style={{ padding: 0 }}>
            <Table striped bordered hover responsive>
              <thead
                style={{
                  position: "sticky",
                  top: 0,
                  backgroundColor: themeSecondary,
                  color: themePrimary,
                  zIndex: 10,
                }}
              >
                <tr>
                  <th className="text-center" style={{ width: "40px" }}></th>
                  <th>#</th>
                  <th>OP No</th>
                  <th>Patient Name</th>
                  <th>Bill No</th>
                  <th>Bill Date</th>
                  <th className="text-end">Net Amt.</th>
                  <th className="text-end">Pending Amount</th>
                  <th className="text-end">Paid</th>
                </tr>
              </thead>

              <tbody>
                {receivables.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center p-5 text-muted">
                      {loading ? (
                        <div>
                          <div
                            className="spinner-border mb-2"
                            style={{ color: themePrimary }}
                            role="status"
                          >
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          <p className="mb-0">Loading receivables...</p>
                        </div>
                      ) : (
                        <div>
                          <Search size={42} className="mb-2" />
                          <p className="mb-0">
                            {searchPerformed
                              ? "No records found for selected company."
                              : "Select company, then search."}
                          </p>
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  receivables.filter(item => !opNoFilter.trim() || item.opNo.toLowerCase().includes(opNoFilter.trim().toLowerCase())).map((item, index) => (
                    <tr
                      key={item.id}
                      onClick={() => handleRowClick(item.id)}
                      style={{
                        cursor: "pointer",
                        backgroundColor: item.isSelected ? "#e8f5e9" : undefined,
                      }}
                    >
                      <td className="text-center" onClick={(e) => e.stopPropagation()}>
                        <Form.Check
                          type="checkbox"
                          checked={item.isSelected}
                          onChange={() => handleRowClick(item.id)}
                        />
                      </td>
                      <td>{index + 1}</td>
                      <td>{item.opNo}</td>
                      <td>{item.patientName}</td>
                      <td>{item.billNo.includes(",") ? item.billNo.split(",").pop()?.trim() : item.billNo}</td>
                      <td>{item.billDate}</td>
                      <td className="text-end">{item.netAmt.toFixed(2)}</td>
                      <td className="text-end fw-bold text-dark">₹{item.pendingAmt.toFixed(2)}</td>
                      <td style={{ minWidth: "130px" }} onClick={(e) => e.stopPropagation()}>
                        {item.isSelected ? (
                          <Form.Control
                            type="number"
                            size="sm"
                            value={formatNumberDisplay(item.paidAmt)}
                            onChange={(e) => handlePaidAmtChange(item.id, handleNumberChange(e.target.value))}
                            onBlur={(e) => handlePaidAmtChange(item.id, handleNumberBlur(e.target.value))}
                            min="0"
                            step="0.01"
                            placeholder="0"
                            className="text-end fw-bold"
                          />
                        ) : (
                          <span className="text-muted d-block text-end">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </Card.Body>

          {receivables.length > 0 && (
          <Card.Footer className="bg-light">
            <div className="d-flex justify-content-end">
              <div
                className="border rounded p-3"
                style={{ minWidth: "260px", backgroundColor: "#fff" }}
              >
                {/* Selected Amount */}
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span style={{ fontWeight: "var(--font-weight-semibold)", color: "#000" }}>Selected Amount</span>
                  <span className="fw-bold text-dark">₹{selectedTotal.toFixed(2)}</span>
                </div>

                {/* Notes */}
                {extraAmount > 0 && (
                  <div className="mb-2">
                    <Form.Label style={{ fontWeight: "var(--font-weight-semibold)", color: "#000", marginBottom: "4px", fontSize: "var(--font-size-sm)" }}>
                      Notes <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      size="sm"
                      placeholder="Enter reason for extra amount"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      style={{ fontSize: "var(--font-size-sm)" }}
                    />
                  </div>
                )}

                {/* Extra Amount */}
                <div className="d-flex justify-content-between align-items-center mb-2 gap-3">
                  <span style={{ fontWeight: "var(--font-weight-semibold)", color: "#000", whiteSpace: "nowrap" }}>Extra Amount</span>
                  <Form.Control
                    type="number"
                    size="sm"
                    value={formatNumberDisplay(extraAmount)}
                    onChange={(e) => setExtraAmount(handleNumberChange(e.target.value))}
                    onBlur={(e) => setExtraAmount(handleNumberBlur(e.target.value))}
                    min="0"
                    step="0.01"
                    placeholder="0"
                    className="text-end fw-bold"
                    style={{ maxWidth: "110px" }}
                  />
                </div>

                {/* Discount */}
                <div className="d-flex justify-content-between align-items-center mb-2 gap-3">
                  <span style={{ fontWeight: "var(--font-weight-semibold)", color: "#000" }}>Discount</span>
                  <Form.Control
                    type="number"
                    size="sm"
                    value={formatNumberDisplay(globalDiscount)}
                    onChange={(e) => setGlobalDiscount(Math.min(handleNumberChange(e.target.value), selectedTotal + extraAmount))}
                    onBlur={(e) => setGlobalDiscount(Math.min(handleNumberBlur(e.target.value), selectedTotal + extraAmount))}
                    min="0"
                    step="0.01"
                    placeholder="0"
                    disabled={selectedTotal === 0 && extraAmount === 0}
                    className="text-end fw-bold"
                    style={{ maxWidth: "110px" }}
                  />
                </div>

                {/* Final Amount */}
                <div className="d-flex justify-content-between align-items-center mb-3 pt-2" style={{ borderTop: "1px solid #dee2e6" }}>
                  <span style={{ fontWeight: "var(--font-weight-bold)", color: "#000" }}>Final Amount</span>
                  <span className="fw-bold text-dark" style={{ fontSize: "var(--font-size-md)" }}>₹{finalAmount.toFixed(2)}</span>
                </div>

                {/* Cash / Bank */}
                <div className="mb-2">
                  <div style={{ fontWeight: "var(--font-weight-semibold)", color: "#000", marginBottom: "6px" }}>Payment Mode</div>
                  <div className="d-flex">
                    <Button
                      size="sm"
                      style={{
                        borderRadius: "4px 0 0 4px",
                        flex: 1,
                        backgroundColor: isBank === 0 ? "var(--page-secondary-color)" : "var(--page-primary-color)",
                        color: isBank === 0 ? "var(--page-primary-color)" : "var(--page-secondary-color)",
                        border: "none",
                        fontWeight: "var(--font-weight-semibold)",
                      }}
                      onClick={() => setIsBank(0)}
                    >
                      Cash
                    </Button>
                    <Button
                      size="sm"
                      style={{
                        borderRadius: "0 4px 4px 0",
                        flex: 1,
                        backgroundColor: isBank === 1 ? "var(--page-secondary-color)" : "var(--page-primary-color)",
                        color: isBank === 1 ? "var(--page-primary-color)" : "var(--page-secondary-color)",
                        border: "none",
                        fontWeight: "var(--font-weight-semibold)",
                      }}
                      onClick={() => setIsBank(1)}
                    >
                      Bank
                    </Button>
                  </div>
                </div>

                {/* Bank fields */}
                {isBank === 1 && (
                  <>
                    <Form.Group className="mb-2">
                      <Form.Label style={{ fontWeight: "var(--font-weight-semibold)", color: "#000", fontSize: "var(--font-size-sm)" }}>
                        Bank Name
                      </Form.Label>
                      <Form.Select
                        size="sm"
                        value={selectedBankId}
                        onChange={(e) => setSelectedBankId(e.target.value)}
                      >
                        <option value="">Select Bank</option>
                        {bankList.map(b => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-2">
                      <Form.Label style={{ fontWeight: "var(--font-weight-semibold)", color: "#000", fontSize: "var(--font-size-sm)" }}>
                        Cheque No
                      </Form.Label>
                      <Form.Control
                        size="sm"
                        type="text"
                        placeholder="Enter cheque number"
                        value={chequeNo}
                        onChange={(e) => setChequeNo(e.target.value)}
                      />
                    </Form.Group>
                  </>
                )}

                {/* Submit */}
                <Button
                  className="w-100 mt-1"
                  style={{
                    backgroundColor: "var(--page-secondary-color)",
                    color: "var(--page-primary-color)",
                    border: "none",
                    fontWeight: "var(--font-weight-bold)",
                  }}
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
              </div>
            </div>
          </Card.Footer>
          )}
        </Card>
      </div>
    </>
  );
};

export default CompanyReceivables;