import React, { useEffect, useMemo, useState } from "react";
import { Card, Col, Form, Row, Table, Spinner } from "react-bootstrap";
import { faList } from "@fortawesome/free-solid-svg-icons";
import PageHeader from "../../../../components/PageHeader";
import { LaboratoryApiService } from "../../../../api/laboratory/laboratory-api-service";
import {
  showErrorToast,
  showSuccessToast,
} from "../../../../utils/alertUtil";
import { useTableSearch } from "../../../../hooks/useTableSearch";
import SearchInput from "../../../../components/SearchInput";

interface Department {
  id: number;
  deptName: string;
  deptDesc: string;
  shortName: string;
  isActive: number;
}

interface TestField {
  fieldId: number;
  testId: number;
  fieldName: string;
  fieldType: string;
  unit: string;
  testMethod: string;
  machine: string;
  normal: number;
  cutoff: number;
  cutoffGreater: string;
  cutoffLower: string;
  intervalFlag: number;
  interHigher: string;
  interInter: string;
  interLower: string;
  lineType: number;
  isNote: number;
  values: Array<{
    id: number;
    fieldId: number;
    lowerBounds: number;
    upperBounds: number;
    cutoffVal: number;
    rangeFrom: number;
    rangeTo: number;
    note: string;
    reference: string;
    fieldType: string;
    fromAge: number;
    fromAgeType: string;
    toAge: number;
    toAgeType: string;
    sex: string;
  }>;
}

interface TestData {
  id: number;
  name: string;
  deptId: number;
  deptName: string;
  specId: number;
  specName: string;
  rate: number;
  testHrs: number;
  testMin: number;
  methodology: string;
  charity: number;
  privateRate: number;
  privateCharity: number;
  lastValue: number;
  entDateTime: string;
  uid: number;
  blocked: number;
  isCulture: number;
  testCode: string;
  canDoManual: number;
  canDoSemi: number;
  canDoAuto: number;
  comment: number;
  picture: number;
  printIndividual: number;
  isEditable: number;
  isEditPrivate: number;
  isOutside: number;
  fields: TestField[];
  orgCharges: Array<{
    id: number;
    testId: number;
    headId: number;
    headName: string;
    rate: number;
    charity: number;
  }>;
}

interface TableRow {
  slNo: number;
  testName: string;
  testId: number;
  fieldName: string;
  normalValue: string;
  sex: string;
  age: string;
  unit: string;
  testRowSpan?: number;
  isFirstFieldOfTest?: boolean;
}

const TestList: React.FC = () => {
  const laboratoryApiService = new LaboratoryApiService();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string>("");
  const [testData, setTestData] = useState<TestData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  // Flatten test data for search
  const flattenedTableData = useMemo(() => {
    const rows: TableRow[] = [];
    let slNo = 1;

    testData.forEach((test) => {
      if (test.fields && test.fields.length > 0) {
        test.fields.forEach((field, fieldIndex) => {
          const normalValue =
            field.values && field.values.length > 0
              ? field.values
                  .map((v) => {
                    let range = "";
                    if (v.rangeFrom && v.rangeTo) {
                      range = `${v.rangeFrom} - ${v.rangeTo}`;
                    } else if (v.lowerBounds !== undefined && v.upperBounds !== undefined) {
                      range = `${v.lowerBounds} - ${v.upperBounds}`;
                    }
                    return range || v.reference || "-";
                  })
                  .join(", ")
              : "-";

          const ageRange =
            field.values && field.values.length > 0
              ? field.values
                  .map((v) => {
                    const fromAge = v.fromAge ? `${v.fromAge} ${v.fromAgeType}` : "";
                    const toAge = v.toAge ? `${v.toAge} ${v.toAgeType}` : "";
                    if (fromAge && toAge) return `${fromAge} - ${toAge}`;
                    if (fromAge) return fromAge;
                    if (toAge) return toAge;
                    return "";
                  })
                  .filter(Boolean)
                  .join(", ")
              : "-";

          rows.push({
            slNo: slNo++,
            testName: test.name,
            testId: test.id,
            fieldName: field.fieldName,
            normalValue,
            sex: field.values?.[0]?.sex || "-",
            age: ageRange,
            unit: field.unit || "-",
            testRowSpan: test.fields.length,
            isFirstFieldOfTest: fieldIndex === 0,
          });
        });
      } else {
        // If no fields, add test with empty field row
        rows.push({
          slNo: slNo++,
          testName: test.name,
          testId: test.id,
          fieldName: "-",
          normalValue: "-",
          sex: "-",
          age: "-",
          unit: "-",
          testRowSpan: 1,
          isFirstFieldOfTest: true,
        });
      }
    });

    return rows;
  }, [testData]);

  // Search hook
  const { filteredData, searchTerm, setSearchTerm, resultCount, totalCount } =
    useTableSearch({
      data: flattenedTableData,
      searchFields: ["testName", "fieldName", "unit"],
    });

  // Fetch departments on mount
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await laboratoryApiService.fetchAllLabDepartments();
        if (mounted) setDepartments(data);
      } catch (error: any) {
        if (!mounted) return;
        console.error("Error fetching departments:", error);
        showErrorToast("Failed to fetch departments");
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const fetchDepartments = async () => {
    try {
      const data = await laboratoryApiService.fetchAllLabDepartments();
      setDepartments(data);
    } catch (error: any) {
      console.error("Error fetching departments:", error);
      showErrorToast("Failed to fetch departments");
    }
  };

  const handleDepartmentChange = async (deptId: string) => {
    setSelectedDeptId(deptId);
    setTestData([]);
    setHasSearched(false);
    setSearchTerm("");

    if (!deptId) {
      return;
    }

    setLoading(true);
    try {
      const data = await laboratoryApiService.fetchLabTestForMasterList(deptId);
      setTestData(data);
      setHasSearched(true);
      showSuccessToast(`Loaded ${data.length} test(s)`);
    } catch (error: any) {
      console.error("Error fetching test data:", error);
      showErrorToast(
        error?.response?.data?.error || "Failed to fetch test data"
      );
      setTestData([]);
    } finally {
      setLoading(false);
    }
  };

  const selectedDept = departments.find((d) => d.id === parseInt(selectedDeptId));

  return (
    <>
      <PageHeader icon={faList} title="Lab Test Master" subtitle="" />
      <div
        style={{
          display: "flex",
          flex: 1,
          minHeight: 0,
          flexDirection: "column",
          gap: "1rem",
          overflowY: "auto",
          padding: "0.5rem",
        }}
      >
        {/* Department Selection Card */}
        <Card className="shadow-sm" style={{ flexShrink: 0 }}>
          <Card.Body>
            <Row className="align-items-end">
              <Col md={4}>
                <Form.Group>
                  <Form.Label style={{ fontWeight: "500", fontSize: "14px" }}>
                    Select Department <span style={{ color: "red" }}>*</span>
                  </Form.Label>
                  <Form.Select
                    value={selectedDeptId}
                    onChange={(e) => handleDepartmentChange(e.target.value)}
                    disabled={loading}
                    style={{ fontSize: "14px" }}
                  >
                    <option value="">-- Choose Department --</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.deptName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              {/* Search Card */}
              {hasSearched && (
                <Col md={4}>
                  <SearchInput
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    placeholder="Search by test name, field name, unit..."
                    resultCount={resultCount}
                    totalCount={totalCount}
                  />
                </Col>
              )}
            </Row>
          </Card.Body>
        </Card>

        {/* Results Card */}
        <Card
          className="shadow-sm"
          style={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {selectedDept && (
            <Card.Header style={{ background: "#f8f9fa", flexShrink: 0 }}>
              <div style={{ fontWeight: "600", fontSize: "14px", color: "#495057" }}>
                DEPARTMENT: {selectedDept.deptName}
              </div>
            </Card.Header>
          )}

          <Card.Body
            style={{
              flex: 1,
              minHeight: 0,
              padding: 0,
              overflow: "auto",
            }}
          >
            {loading ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 300,
                }}
              >
                <Spinner animation="border" role="status" className="text-primary">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
            ) : !hasSearched ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 300,
                  color: "#6c757d",
                }}
              >
                <p className="mb-0">Select a department to view tests.</p>
              </div>
            ) : filteredData.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 300,
                  color: "#6c757d",
                }}
              >
                <p className="mb-0">No tests found.</p>
              </div>
            ) : (
              <Table bordered responsive style={{ marginBottom: 0 }}>
                <thead
                  style={{
                    position: "sticky",
                    top: 0,
                    backgroundColor: "var(--page-primary-color)",
                    color: "var(--page-secondary-color)",
                    zIndex: 10,
                  }}
                >
                  <tr>
                    <th style={{ minWidth: 60, textAlign: "center" }}>SL.NO</th>
                    <th style={{ minWidth: 150 }}>TEST NAME</th>
                    <th style={{ minWidth: 180 }}>FIELD NAME</th>
                    <th style={{ minWidth: 150 }}>NORMAL VALUE</th>
                    <th style={{ minWidth: 80, textAlign: "center" }}>SEX</th>
                    <th style={{ minWidth: 200 }}>AGE</th>
                    <th style={{ minWidth: 100 }}>UNIT</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((row: TableRow, index: number) => (
                    <tr key={index}>
                      <td style={{ textAlign: "center", fontWeight: "500" }}>
                        {row.slNo}
                      </td>
                      {row.isFirstFieldOfTest && (
                        <td
                          rowSpan={row.testRowSpan}
                          style={{ fontSize: "13px", verticalAlign: "middle" }}
                        >
                          {row.testName}
                        </td>
                      )}
                      <td style={{ fontSize: "13px" }}>{row.fieldName}</td>
                      <td style={{ fontSize: "13px" }}>{row.normalValue}</td>
                      <td style={{ textAlign: "center", fontSize: "13px" }}>
                        {row.sex}
                      </td>
                      <td style={{ fontSize: "13px" }}>{row.age}</td>
                      <td style={{ fontSize: "13px" }}>{row.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      </div>
    </>
  );
};

export default TestList;