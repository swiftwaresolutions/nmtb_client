import React, { useState, useEffect } from "react";
import {
  Form,
  Button,
  Table,
  Card,
} from "react-bootstrap";
import { useDispatch } from "react-redux";
import { LaboratoryApiService } from "../../../../../api/laboratory/laboratory-api-service";
import {
  showErrorToast,
  showSuccessToast,
} from "../../../../../utils/alertUtil";
import { handleError } from "../../../../../utils/errorUtil";
import "../../../../../style/commonStyle.css";

const EditCompanyRates: React.FC = () => {
  const dispatch = useDispatch();
  const laboratoryApiService = new LaboratoryApiService();

  const [testList, setTestList] = useState<any[]>([]);
  const [selectedTest, setSelectedTest] = useState<number | null>(null);
  const [companyRates, setCompanyRates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch all tests on component mount
  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const data = await laboratoryApiService.fetchAllLabTestAdd();
      setTestList(data);
    } catch (error) {
      console.error("Error fetching tests:", error);
      handleError(dispatch, error);
      showErrorToast("Failed to load tests");
    }
  };

  const fetchCompanyRates = async (testId: number) => {
    try {
      setLoading(true);
      const data = await laboratoryApiService.fetchOrgCompanyCharges(testId);
      setCompanyRates(data);
    } catch (error) {
      console.error("Error fetching company rates:", error);
      handleError(dispatch, error);
      showErrorToast("Failed to load company rates");
      setCompanyRates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTestChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const testId = Number(e.target.value);
    setSelectedTest(testId);

    if (testId) {
      fetchCompanyRates(testId);
    } else {
      setCompanyRates([]);
    }
  };

  const handleRateChange = (index: number, value: string) => {
    setCompanyRates((rates) =>
      rates.map((r, idx) => (idx === index ? { ...r, rate: Number(value) } : r))
    );
  };

  const handleCharityChange = (index: number, value: string) => {
    setCompanyRates((rates) =>
      rates.map((r, idx) =>
        idx === index ? { ...r, charity: Number(value) } : r
      )
    );
  };

  const handleSave = async () => {
    if (!selectedTest) {
      showErrorToast("Please select a test first");
      return;
    }

    if (companyRates.length === 0) {
      showErrorToast("No company rates to save");
      return;
    }

    try {
      setLoading(true);

      // Prepare charges array
      const charges = companyRates.map((company) => ({
        headId: company.headId,
        rate: company.rate,
        charity: company.charity,
      }));

      // Send all charges in a single API call
      const response = await laboratoryApiService.updateLabCompanyRates(
        selectedTest,
        { charges }
      );

      // Show API response
      const responseMessage =
        response?.message ||
        response?.data?.message ||
        `Successfully updated rates for ${companyRates.length} companies`;

      showSuccessToast(responseMessage);

      // Refresh the data after successful save
      await fetchCompanyRates(selectedTest);
    } catch (error: any) {
      console.error("Error saving rates:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to save company rates";
      showErrorToast(errorMessage);
      handleError(dispatch, error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", minHeight: 0, overflow: "hidden" }}>
      {/* ---------------- HEADER ---------------- */}
      <div className="content-header" style={{ flexShrink: 0 }}>
        <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>
          Edit Company Rates
        </h3>
      </div>

      {/* ---------------- BODY ---------------- */}
      <div className="content-body" style={{ display: "flex", flex: 1, minHeight: 0, gap: "1rem", overflowX: "hidden", overflowY: "auto" }}>
        {/* -------- Left Side Form -------- */}
        <div style={{ display: "flex", flex: "0 0 58%", minWidth: 0, flexDirection: "column" }}>
          <Card
            className="shadow-sm"
            style={{
              padding: "2rem",
              background: "white",
              borderRadius: "10px",
            }}
          >
            <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>
              Select Test
            </h3>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>
                  Test Name <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  value={selectedTest ?? ""}
                  onChange={handleTestChange}
                >
                  <option value="">-- Select Test --</option>
                  {testList
                    .filter((test) => test.blocked === 0)
                    .map((test) => (
                      <option key={test.id} value={test.id}>
                        {test.name}
                      </option>
                    ))}
                </Form.Select>
              </Form.Group>
            </Form>
          </Card>
        </div>

        {/* -------- Right Side Table -------- */}
        <div style={{ display: "flex", flex: "0 0 42%", minWidth: 0, flexDirection: "column" }}>
          <Card
            className="shadow-sm"
            style={{
              padding: "2rem",
              background: "white",
              borderRadius: "10px",
              display: "flex",
              flexDirection: "column",
              height: "100%",
              minHeight: 0,
            }}
          >
            <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>
              Company Rates
            </h3>
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 text-muted">Loading company rates...</p>
              </div>
            ) : selectedTest ? (
              <>
                <div
                  style={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: "auto",
                    marginBottom: "1rem",
                  }}
                >
                  <Table striped bordered hover size="sm">
                    <thead
                      style={{
                        position: "sticky",
                        top: 0,
                        background: "white",
                        zIndex: 1,
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      }}
                    >
                      <tr>
                        <th>#</th>
                        <th>Company</th>
                        <th>Rate</th>
                        <th>Charity</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {companyRates.length > 0 ? (
                        companyRates.map((company, idx) => (
                          <tr
                            key={idx}
                            style={{
                              backgroundColor: company.isMapped
                                ? "transparent"
                                : "#fff3cd",
                            }}
                          >
                            <td>{idx + 1}</td>
                            <td>
                              {company.headName || "N/A"}
                              {!company.isMapped && (
                                <span
                                  className="badge bg-warning text-dark ms-2"
                                  style={{ fontSize: "0.7rem" }}
                                >
                                  Not Mapped
                                </span>
                              )}
                            </td>
                            <td>
                              <Form.Control
                                type="number"
                                value={company.rate || ""}
                                min={0}
                                size="sm"
                                onChange={(e) =>
                                  handleRateChange(idx, e.target.value)
                                }
                                placeholder="Enter rate"
                              />
                            </td>
                            <td>
                              <Form.Control
                                type="number"
                                value={company.charity || ""}
                                min={0}
                                size="sm"
                                onChange={(e) =>
                                  handleCharityChange(idx, e.target.value)
                                }
                                placeholder="Enter charity"
                              />
                            </td>
                            <td>
                              {company.isMapped ? (
                                <span className="badge bg-success">
                                  Mapped
                                </span>
                              ) : (
                                <span className="badge bg-secondary">
                                  New
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={5}
                            className="text-center py-4 text-muted"
                          >
                            No company rates found for this test
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
                <div className="text-end mt-3" style={{ flexShrink: 0 }}>
                  <Button
                    variant="primary"
                    onClick={handleSave}
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save Rates"}
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center text-muted py-5">
                Select a test to view/edit company rates
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EditCompanyRates;
