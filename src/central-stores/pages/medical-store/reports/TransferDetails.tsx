import React, { useState } from "react";
import { Badge, Button, Card, Col, Form, Row, Spinner, Table } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExchangeAlt, faSearch, faSyncAlt } from "@fortawesome/free-solid-svg-icons";
import PageHeader from "../../../../components/PageHeader";
import SearchInput from "../../../../components/SearchInput";
import { useTableSearch } from "../../../../hooks/useTableSearch";
import { showErrorToast, showValidationError } from "../../../../utils/alertUtil";
import CentralStoresApiService, {
  TransferRegisterStoreDetailsRow,
  TransferRegisterRow,
  TransferDetailsRow,
} from "../../../../api/central-stores/central-stores-api-service";

const centralStoresApi = new CentralStoresApiService();
const today = new Date().toISOString().split("T")[0];

// Search helper row — one entry per store group for filtering
interface StoreSearchRow {
  storeId: number;
  storeName: string;
  transfers: TransferRegisterRow[];
}

export default function TransferDetails() {
  const [fromDate, setFromDate] = useState<string>(today);
  const [toDate, setToDate] = useState<string>(today);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [storeGroups, setStoreGroups] = useState<TransferRegisterStoreDetailsRow[]>([]);

  // Flatten to store-level rows for search
  const storeSearchRows: StoreSearchRow[] = storeGroups.map((g) => ({
    storeId: g.toStoreId,
    storeName: g.toStoreName,
    transfers: g.transfers,
  }));

  const { filteredData, searchTerm, setSearchTerm, resultCount, totalCount } =
    useTableSearch({
      data: storeSearchRows,
      searchFields: ["storeName"],
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromDate || !toDate) {
      showValidationError("Please select both From and To dates.");
      return;
    }
    if (fromDate > toDate) {
      showValidationError("From date cannot be later than To date.");
      return;
    }

    const selectedStoreRaw = sessionStorage.getItem("selectedStore");
    const masterId = selectedStoreRaw
      ? Number((JSON.parse(selectedStoreRaw) as { masterId?: number }).masterId ?? 0)
      : 0;

    if (!masterId) {
      showValidationError("Store context is missing. Please reselect the store.");
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    setStoreGroups([]);

    try {
      const data = await centralStoresApi.fetchTransferRegistertDetails(masterId, fromDate, toDate);
      setStoreGroups(Array.isArray(data) ? data : []);
    } catch {
      showErrorToast("Failed to fetch transfer details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFromDate(today);
    setToDate(today);
    setHasSearched(false);
    setStoreGroups([]);
    setSearchTerm("");
  };

  const totalTransfers = storeGroups.reduce((sum, g) => sum + (g.transfers?.length ?? 0), 0);

  return (
    <div>
      <PageHeader
        icon={faExchangeAlt}
        title="Transfer Details"
        subtitle="View product transfer details for a selected date range"
      />

      <Card className="shadow-sm">
        {/* ── Header: filters + search ── */}
        <Card.Header className="bg-white">
          <Form onSubmit={handleSubmit}>
            <Row className="g-3 align-items-end">
              <Col md={3}>
                <Form.Group>
                  <Form.Label
                    style={{
                      fontSize: "var(--font-size-sm)",
                      fontWeight: "var(--font-weight-medium)",
                    }}
                  >
                    Date From
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    max={today}
                    style={{ fontSize: "var(--font-size-sm)" }}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label
                    style={{
                      fontSize: "var(--font-size-sm)",
                      fontWeight: "var(--font-weight-medium)",
                    }}
                  >
                    Date To
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    max={today}
                    style={{ fontSize: "var(--font-size-sm)" }}
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    background: "var(--btn-primary)",
                    border: "none",
                    fontSize: "var(--font-size-sm)",
                    width: "100%",
                  }}
                >
                  {isLoading ? (
                    <><Spinner size="sm" animation="border" className="me-1" />Loading...</>
                  ) : (
                    <><FontAwesomeIcon icon={faSearch} className="me-1" />Submit</>
                  )}
                </Button>
              </Col>
              <Col md={2}>
                <Button
                  type="button"
                  variant="outline-secondary"
                  onClick={handleReset}
                  style={{ fontSize: "var(--font-size-sm)", width: "100%" }}
                >
                  <FontAwesomeIcon icon={faSyncAlt} className="me-1" />
                  Reset
                </Button>
              </Col>
              {hasSearched && !isLoading && storeGroups.length > 0 && (
                <Col md={2} className="d-flex justify-content-end">
                  <SearchInput
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    placeholder="Search by store name..."
                    resultCount={resultCount}
                    totalCount={totalCount}
                  />
                </Col>
              )}
            </Row>
          </Form>
        </Card.Header>

        {/* ── Body: results ── */}
        <Card.Body className="p-0">
          {!hasSearched ? (
            <div
              className="text-center py-5"
              style={{ color: "var(--color-muted)", fontSize: "var(--font-size-sm)" }}
            >
              Select a date range and click Submit to view transfer details.
            </div>
          ) : isLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
              <div className="mt-2" style={{ fontSize: "var(--font-size-sm)", color: "var(--color-muted)" }}>
                Loading transfer details...
              </div>
            </div>
          ) : filteredData.length === 0 ? (
            <div
              className="text-center py-5"
              style={{ color: "var(--color-muted)", fontSize: "var(--font-size-sm)" }}
            >
              No transfers found for the selected date range.
            </div>
          ) : (
            <div style={{ padding: "16px", maxHeight: "60vh", overflowY: "auto" }}>
              {filteredData.map((storeGroup) => (
                <div
                  key={storeGroup.storeId}
                  style={{
                    marginBottom: "24px",
                    borderRadius: "var(--border-radius-sm)",
                    border: "1px solid var(--bs-border-color, #dee2e6)",
                    overflow: "hidden",
                  }}
                >
                  {/* ── Store-level header ── */}
                  <div
                    style={{
                      background: "var(--page-secondary-color)",
                      color: "var(--color-white, #fff)",
                      padding: "12px 16px",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      boxShadow: "var(--shadow-sm)",
                    }}
                  >
                    <FontAwesomeIcon icon={faExchangeAlt} />
                    <span
                      style={{
                        fontSize: "var(--font-size-sm)",
                        fontWeight: "var(--font-weight-bold)",
                      }}
                    >
                      To Store: {storeGroup.storeName}
                    </span>
                    <Badge
                      className="theme-badge-primary"
                      style={{
                        fontSize: "var(--font-size-xs)",
                        marginLeft: "auto",
                        fontWeight: "var(--font-weight-semibold)",
                      }}
                    >
                      {storeGroup.transfers?.length ?? 0} Transfer{(storeGroup.transfers?.length ?? 0) !== 1 ? "s" : ""}
                    </Badge>
                  </div>

                  {/* ── Transfers inside this store ── */}
                  {(storeGroup.transfers ?? []).map((transfer: TransferRegisterRow, tIdx: number) => (
                    <div
                      key={transfer.id}
                      style={{
                        borderTop: "1px solid var(--bs-border-color, #dee2e6)",
                      }}
                    >
                      {/* Transfer sub-header */}
                      <div
                        style={{
                          background: "rgba(0,0,0,0.03)",
                          padding: "8px 16px",
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "20px",
                          alignItems: "center",
                          fontSize: "var(--font-size-sm)",
                          borderBottom: "1px solid var(--bs-border-color, #dee2e6)",
                        }}
                      >
                        <span style={{ fontWeight: "var(--font-weight-semibold)" }}>
                          #{tIdx + 1} &nbsp; Transfer No: {transfer.transferNo}
                        </span>
                        <span>
                          From: <strong>{transfer.fromStoreName}</strong>
                        </span>
                        <span>
                          Transferred By: <strong>{transfer.userName}</strong>
                        </span>
                        <span>
                          Date: <strong>{transfer.dateTimeApprove}</strong>
                        </span>
                        <Badge
                          style={{
                            background: "var(--color-success, #198754)",
                            fontSize: "var(--font-size-xs)",
                            marginLeft: "auto",
                          }}
                        >
                          {transfer.details?.length ?? 0} item{(transfer.details?.length ?? 0) !== 1 ? "s" : ""}
                        </Badge>
                      </div>

                      {/* Items table */}
                      <div className="table-responsive">
                        <Table bordered size="sm" className="mb-0" style={{ fontSize: "var(--font-size-sm)" }}>
                          <thead>
                            <tr
                              style={{
                                background: "var(--bs-light, #f8f9fa)",
                                fontWeight: "var(--font-weight-semibold)",
                              }}
                            >
                              <th style={{ width: "55px" }} className="text-center">Sl.No</th>
                              <th>Product Name</th>
                              <th style={{ width: "110px" }}>Batch No</th>
                              <th style={{ width: "75px" }} className="text-center">Quantity</th>
                              <th style={{ width: "110px" }} className="text-center">Expiry Date</th>
                              <th style={{ width: "90px" }} className="text-end">MRP</th>
                              <th style={{ width: "100px" }} className="text-end">Sales Price</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(transfer.details ?? []).length === 0 ? (
                              <tr>
                                <td colSpan={7} className="text-center text-muted py-3">
                                  No items.
                                </td>
                              </tr>
                            ) : (
                              (transfer.details ?? []).map((item: TransferDetailsRow, idx: number) => (
                                <tr key={`${item.batchId}-${idx}`}>
                                  <td className="text-center">{idx + 1}</td>
                                  <td style={{ fontWeight: "var(--font-weight-medium)" }}>{item.medicineName}</td>
                                  <td>{item.batchNo}</td>
                                  <td className="text-center">{item.quantity}</td>
                                  <td className="text-center">{item.expiryDate}</td>
                                  <td className="text-end">{item.mrp.toFixed(2)}</td>
                                  <td className="text-end">{item.salesPrice.toFixed(2)}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </Table>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </Card.Body>

        {/* ── Footer: summary ── */}
        {hasSearched && !isLoading && storeGroups.length > 0 && (
          <Card.Footer className="bg-white">
            <Row className="g-2 align-items-center">
              <Col xs="auto">
                <div
                  style={{
                    background: "var(--table-header-bg)",
                    color: "var(--table-header-text)",
                    borderRadius: "var(--border-radius-sm)",
                    padding: "4px 14px",
                    fontSize: "var(--font-size-sm)",
                    fontWeight: "var(--font-weight-semibold)",
                  }}
                >
                  {storeGroups.length} Store{storeGroups.length !== 1 ? "s" : ""}
                </div>
              </Col>
              <Col xs="auto">
                <div
                  style={{
                    background: "var(--table-header-bg)",
                    color: "var(--table-header-text)",
                    borderRadius: "var(--border-radius-sm)",
                    padding: "4px 14px",
                    fontSize: "var(--font-size-sm)",
                    fontWeight: "var(--font-weight-semibold)",
                  }}
                >
                  {totalTransfers} Transfer{totalTransfers !== 1 ? "s" : ""}
                </div>
              </Col>
            </Row>
          </Card.Footer>
        )}
      </Card>
    </div>
  );
}
