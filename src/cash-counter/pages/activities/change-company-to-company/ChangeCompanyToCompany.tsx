import React, { useEffect, useState } from "react";
import { Row, Col, Card, Form, Table, InputGroup, Button } from "react-bootstrap";
import { Search, XCircle, Check } from "react-bootstrap-icons";
import { faBuilding } from "@fortawesome/free-solid-svg-icons";
import PageHeader from "../../../../components/PageHeader";
import SearchableSelect from "../../../../components/SearchableSelect";
import { CashCounterApiService } from "../../../../api/cash-counter/cash-counter-api-service";
import { showErrorToast, showSuccessToast, showValidationError } from "../../../../utils/alertUtil";

interface AccountHead {
  headId: number;
  headName: string;
}

interface CompanyBillRow {
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
}

const ChangeCompanyToCompany: React.FC = () => {
  const themePrimary = "var(--page-primary-color)";
  const themeSecondary = "var(--page-secondary-color)";

  const cashCounterApi = new CashCounterApiService();

  const [companyList, setCompanyList] = useState<AccountHead[]>([]);
  const [fromCompanyId, setFromCompanyId] = useState<string>("");
  const [toCompanyId, setToCompanyId] = useState<string>("");
  const [loadingCompanies, setLoadingCompanies] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchPerformed, setSearchPerformed] = useState<boolean>(false);
  const [bills, setBills] = useState<CompanyBillRow[]>([]);
  const [opNoFilter, setOpNoFilter] = useState<string>("");
  const [selectedFinalBillId, setSelectedFinalBillId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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
        showErrorToast(
          error?.response?.data?.error || "Failed to load company names"
        );
      } finally {
        setLoadingCompanies(false);
      }
    };

    fetchAccountHeads();
  }, []);

  const handleSearch = async () => {
    if (!fromCompanyId) {
      showValidationError("Please select a From Company");
      return;
    }
    if (!toCompanyId) {
      showValidationError("Please select a To Company");
      return;
    }
    if (fromCompanyId === toCompanyId) {
      showValidationError("From Company and To Company cannot be the same");
      return;
    }

    setSearchPerformed(true);
    setLoading(true);
    setBills([]);
    setSelectedFinalBillId(null);

    try {
      const response = await cashCounterApi.fetchCompanyReceivables(fromCompanyId);
      const mappedData: CompanyBillRow[] = (response || []).map((item: any, index: number) => ({
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
      }));
      setBills(mappedData);

      // Enrich billNo for each row
      mappedData.forEach(async (row) => {
        if (!row.finalBillId) return;
        try {
          const details = await cashCounterApi.fetchPatientDetailsByFinalBillId(row.finalBillId);
          if (details?.billNo) {
            setBills(prev =>
              prev.map(r => r.finalBillId === row.finalBillId ? { ...r, billNo: String(details.billNo) } : r)
            );
          }
        } catch {
          // silently ignore per-row errors
        }
      });
    } catch (error: any) {
      showErrorToast(
        error?.response?.data?.error || "Failed to fetch company bills"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFromCompanyId("");
    setToCompanyId("");
    setSearchPerformed(false);
    setBills([]);
    setOpNoFilter("");
    setSelectedFinalBillId(null);
  };

  const handleSubmit = async () => {
    if (!selectedFinalBillId) {
      showValidationError("Please select a bill to transfer");
      return;
    }
    if (!fromCompanyId || !toCompanyId) {
      showValidationError("Company context is missing");
      return;
    }
    setIsSubmitting(true);
    try {
      const fromName = companyList.find((c) => c.headId === Number(fromCompanyId))?.headName || fromCompanyId;
      const toName = companyList.find((c) => c.headId === Number(toCompanyId))?.headName || toCompanyId;
      await cashCounterApi.updateCompanyHeadByFinalBillId({
        finalBillId: selectedFinalBillId,
        headId: Number(toCompanyId),
        note: `From ${fromName} to ${toName}`,
      });
      showSuccessToast("Bill transferred to company successfully");
      window.location.reload();
    } catch (error: any) {
      showErrorToast(error?.response?.data?.error || "Failed to transfer bill");
      setIsSubmitting(false);
    }
  };

  const filteredBills = bills.filter(
    (item) =>
      !opNoFilter.trim() ||
      item.opNo.toLowerCase().includes(opNoFilter.trim().toLowerCase())
  );

  return (
    <>
      <PageHeader
        title="Change Company to Company"
        icon={faBuilding}
        subtitle="Transfer company bills to another company"
      />

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
              <Col md={5}>
                <Form.Group>
                  <Form.Label
                    style={{
                      fontSize: "var(--font-size-sm)",
                      fontWeight: "var(--font-weight-medium)",
                    }}
                  >
                    From Company <span className="text-danger">*</span>
                  </Form.Label>
                  <SearchableSelect
                    options={companyList.map((company) => ({
                      value: company.headId.toString(),
                      label: company.headName,
                    }))}
                    value={fromCompanyId}
                    onChange={(value) => {
                      setFromCompanyId(value);
                      setBills([]);
                      setSelectedFinalBillId(null);
                      setSearchPerformed(false);
                    }}
                    placeholder="Select From Company"
                    disabled={loadingCompanies || loading}
                  />
                </Form.Group>
              </Col>

              <Col md={5}>
                <Form.Group>
                  <Form.Label
                    style={{
                      fontSize: "var(--font-size-sm)",
                      fontWeight: "var(--font-weight-medium)",
                    }}
                  >
                    To Company <span className="text-danger">*</span>
                  </Form.Label>
                  <SearchableSelect
                    options={companyList.map((company) => ({
                      value: company.headId.toString(),
                      label: company.headName,
                    }))}
                    value={toCompanyId}
                    onChange={(value) => setToCompanyId(value)}
                    placeholder="Select To Company"
                    disabled={loadingCompanies || loading}
                  />
                </Form.Group>
              </Col>

              <Col md={2}>
                <div className="d-flex gap-2 justify-content-md-end">
                  <InputGroup.Text
                    title="Search"
                    onClick={handleSearch}
                    style={{
                      cursor: "pointer",
                      backgroundColor: "var(--page-secondary-color)",
                      color: "var(--page-primary-color)",
                      border: "none",
                    }}
                  >
                    <Check size={18} />
                  </InputGroup.Text>
                  <InputGroup.Text
                    title="Clear"
                    onClick={handleClear}
                    style={{
                      cursor: "pointer",
                      backgroundColor: "var(--page-secondary-color)",
                      color: "var(--page-primary-color)",
                      border: "none",
                    }}
                  >
                    <XCircle size={18} />
                  </InputGroup.Text>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Card
          className="shadow-sm"
          style={{ border: `1px solid ${themePrimary}` }}
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
              <h5
                className="mb-0"
                style={{
                  fontWeight: "var(--font-weight-semibold)",
                  fontSize: "var(--font-size-lg)",
                  whiteSpace: "nowrap",
                }}
              >
                Bills List
              </h5>
              <InputGroup size="sm" style={{ maxWidth: "240px" }}>
                <InputGroup.Text
                  style={{ backgroundColor: themeSecondary, border: "none" }}
                >
                  <Search size={14} color={themePrimary} />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Filter by OP No..."
                  value={opNoFilter}
                  onChange={(e) => setOpNoFilter(e.target.value)}
                  style={{ border: "none" }}
                />
                {opNoFilter && (
                  <InputGroup.Text
                    style={{
                      cursor: "pointer",
                      backgroundColor: themeSecondary,
                      border: "none",
                    }}
                    onClick={() => setOpNoFilter("")}
                  >
                    <XCircle size={14} color={themePrimary} />
                  </InputGroup.Text>
                )}
              </InputGroup>
              <span
                className={`badge ${
                  bills.length > 0
                    ? "theme-badge-primary"
                    : "theme-badge-secondary"
                }`}
              >
                {filteredBills.length} Record(s)
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
                  <th style={{ width: "40px" }}></th>
                  <th>#</th>
                  <th>OP No</th>
                  <th>Patient Name</th>
                  <th>Bill No</th>
                  <th>Bill Date</th>
                  <th className="text-end">Net Amt.</th>
                  <th className="text-end">Pending Amount</th>
                </tr>
              </thead>

              <tbody>
                {filteredBills.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center p-5 text-muted">
                      {loading ? (
                        <div>
                          <div
                            className="spinner-border mb-2"
                            style={{ color: themePrimary }}
                            role="status"
                          >
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          <p className="mb-0">Loading bills...</p>
                        </div>
                      ) : (
                        <div>
                          <Search size={42} className="mb-2" />
                          <p className="mb-0">
                            {searchPerformed
                              ? "No records found for selected company."
                              : "Select From Company and To Company, then search."}
                          </p>
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredBills.map((item, index) => (
                    <tr
                      key={item.id}
                      style={{
                        cursor: "pointer",
                        backgroundColor:
                          selectedFinalBillId === item.finalBillId
                            ? "var(--page-secondary-color)"
                            : undefined,
                      }}
                      onClick={() => setSelectedFinalBillId(item.finalBillId)}
                    >
                      <td className="text-center">
                        <Form.Check
                          type="radio"
                          checked={selectedFinalBillId === item.finalBillId}
                          onChange={() => setSelectedFinalBillId(item.finalBillId)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td>{index + 1}</td>
                      <td>{item.opNo}</td>
                      <td>{item.patientName}</td>
                      <td>
                        {item.billNo.includes(",")
                          ? item.billNo.split(",").pop()?.trim()
                          : item.billNo}
                      </td>
                      <td>{item.billDate}</td>
                      <td className="text-end">{item.netAmt.toFixed(2)}</td>
                      <td className="text-end fw-bold text-dark">
                        ₹{item.pendingAmt.toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>

        {filteredBills.length > 0 && (
          <div className="d-flex justify-content-end" style={{ flexShrink: 0 }}>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedFinalBillId}
              style={{
                backgroundColor: "var(--page-secondary-color)",
                borderColor: "var(--page-secondary-color)",
                color: "var(--page-primary-color)",
                fontSize: "var(--font-size-sm)",
                fontWeight: "var(--font-weight-medium)",
              }}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default ChangeCompanyToCompany;
