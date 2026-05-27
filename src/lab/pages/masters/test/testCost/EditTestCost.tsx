import React, { useState, useEffect } from "react";
import {
  Form,
  Button,
  Table,
  Card,
  Spinner,
} from "react-bootstrap";
import { useDispatch } from "react-redux";
import { LaboratoryApiService } from "../../../../../api/laboratory/laboratory-api-service";
import {
  showErrorToast,
  showSuccessToast,
} from "../../../../../utils/alertUtil";
import { handleError } from "../../../../../utils/errorUtil";
import "../../../../../style/commonStyle.css";

interface RateState {
  generalRate: string;
  generalRateCharity: string;
  generalRateEditable: boolean;
  privateRate: string;
  privateRateCharity: string;
  privateRateEditable: boolean;
}

const EditTestCost: React.FC = () => {
  const dispatch = useDispatch();
  const laboratoryApiService = new LaboratoryApiService();

  const [testList, setTestList] = useState<any[]>([]);
  const [selectedTest, setSelectedTest] = useState<number | null>(null);
  const [rates, setRates] = useState<RateState>({
    generalRate: "",
    generalRateCharity: "",
    generalRateEditable: false,
    privateRate: "",
    privateRateCharity: "",
    privateRateEditable: false,
  });
  const [loading, setLoading] = useState(false);

  // Fetch all tests on component mount
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!mounted) return;
      try {
        setLoading(true);
        const data = await laboratoryApiService.fetchAllLabTestAdd();
        if (mounted) setTestList(data);
      } catch (error) {
        if (!mounted) return;
        console.error("Error fetching tests:", error);
        handleError(dispatch, error);
        showErrorToast("Failed to load tests");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const data = await laboratoryApiService.fetchAllLabTestAdd();
      setTestList(data);
    } catch (error) {
      console.error("Error fetching tests:", error);
      handleError(dispatch, error);
      showErrorToast("Failed to load tests");
    } finally {
      setLoading(false);
    }
  };

  const handleTestChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const testId = Number(e.target.value);
    setSelectedTest(testId);
    const test = testList.find((t) => t.id === testId);
    if (test) {
      setRates({
        generalRate: String(test.rate || 0),
        generalRateCharity: String(test.charity || 0),
        generalRateEditable: test.isEditable === 1,
        privateRate: String(test.privateRate || 0),
        privateRateCharity: String(test.privateCharity || 0),
        privateRateEditable: test.isEditPrivate === 1,
      });
    } else {
      setRates({
        generalRate: "",
        generalRateCharity: "",
        generalRateEditable: false,
        privateRate: "",
        privateRateCharity: "",
        privateRateEditable: false,
      });
    }
  };

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setRates((r) => ({
      ...r,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    if (!selectedTest) {
      showErrorToast("Please select a test first");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        generalRate: Number(rates.generalRate),
        privateRate: Number(rates.privateRate),
        generalCharity: Number(rates.generalRateCharity),
        privateCharity: Number(rates.privateRateCharity),
        generalEditable: rates.generalRateEditable ? 1 : 0,
        privateEditable: rates.privateRateEditable ? 1 : 0,
      };

      const response = await laboratoryApiService.updateTestRates(
        selectedTest,
        payload
      );

      // Show API response message
      const responseMessage =
        response?.message ||
        response?.data?.message ||
        "Test rates updated successfully";
      showSuccessToast(responseMessage);

      // Refresh the test list
      await fetchTests();
    } catch (error: any) {
      console.error("Error saving rates:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to save test rates";
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
          Edit Test Cost
        </h3>
      </div>

      {/* ---------------- BODY ---------------- */}
      <div className="content-body" style={{ display: "flex", flex: 1, minHeight: 0, gap: "1rem", padding: "1rem", overflowX: "hidden", overflowY: "auto" }}>
        {/* -------- Left Side Form (58%) -------- */}
        <div style={{ flex: "0 0 58%", minWidth: 0, display: "flex", flexDirection: "column" }}>
          <div
            className="card shadow-sm"
            style={{
              padding: "2rem",
              background: "white",
              borderRadius: "10px",
            }}
          >
            <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>
              Select Test
            </h3>
            {loading && (
              <div className="text-center my-3">
                <Spinner animation="border" size="sm" /> Loading tests...
              </div>
            )}
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>
                  Test Name <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  value={selectedTest ?? ""}
                  onChange={handleTestChange}
                  disabled={loading}
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
          </div>
        </div>

        {/* -------- Right Side Table (42%) -------- */}
        <div style={{ flex: "0 0 42%", minWidth: 0, display: "flex", flexDirection: "column" }}>
          <div
            className="card shadow-sm"
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
              Test Rates
            </h3>
            {selectedTest ? (
              <>
                <div style={{ flex: 1, minHeight: 0, overflowY: "auto", display: "flex", justifyContent: "center" }}>
                  <div style={{ maxWidth: 500, width: "100%" }}>
                    <Table bordered hover>
                      <thead style={{ position: "sticky", top: 0, backgroundColor: "#f8f9fa", zIndex: 10 }}>
                        <tr>
                          <th>Type</th>
                          <th>Rate</th>
                          <th>Charity</th>
                          <th>Editable</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>General</td>
                          <td>
                            <Form.Control
                              type="number"
                              name="generalRate"
                              value={rates.generalRate}
                              min={0}
                              onChange={handleRateChange}
                            />
                          </td>
                          <td>
                            <Form.Control
                              type="number"
                              name="generalRateCharity"
                              value={rates.generalRateCharity}
                              min={0}
                              onChange={handleRateChange}
                            />
                          </td>
                          <td className="text-center">
                            <Form.Check
                              type="checkbox"
                              id="general-rate-editable"
                              name="generalRateEditable"
                              checked={rates.generalRateEditable}
                              onChange={handleRateChange}
                            />
                          </td>
                        </tr>
                        <tr>
                          <td>Private</td>
                          <td>
                            <Form.Control
                              type="number"
                              name="privateRate"
                              value={rates.privateRate}
                              min={0}
                              onChange={handleRateChange}
                            />
                          </td>
                          <td>
                            <Form.Control
                              type="number"
                              name="privateRateCharity"
                              value={rates.privateRateCharity}
                              min={0}
                              onChange={handleRateChange}
                            />
                          </td>
                          <td className="text-center">
                            <Form.Check
                              type="checkbox"
                              id="private-rate-editable"
                              name="privateRateEditable"
                              checked={rates.privateRateEditable}
                              onChange={handleRateChange}
                            />
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                </div>
                <div className="text-end mt-3" style={{ flexShrink: 0 }}>
                  <Button
                    variant="primary"
                    onClick={handleSave}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        Saving...
                      </>
                    ) : (
                      "Save Rates"
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center text-muted py-5">
                Select a test to view/edit rates
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTestCost;
