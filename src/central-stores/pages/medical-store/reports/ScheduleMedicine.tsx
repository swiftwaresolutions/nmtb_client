import React, { useMemo, useState } from "react";
import { Badge, Card, Col, Form, Row, Table } from "react-bootstrap";
import PageHeader from "../../../../components/PageHeader";
import { faListAlt } from "@fortawesome/free-solid-svg-icons";
import SearchInput from "../../../../components/SearchInput";
import { useTableSearch } from "../../../../hooks/useTableSearch";

interface MedicineItem {
  id: number;
  genericName: string;
  medicineName: string;
  category: string;
  colorGradient: string;
}

interface CategoryOption {
  value: string;
  label: string;
}

const categoryOptions: CategoryOption[] = [
  { value: "ALL", label: "All" },
  { value: "Schedule H", label: "Schedule H" },
  { value: "Schedule H1", label: "Schedule H1" },
  { value: "Narcotic", label: "Narcotic" },
];

const colorLegend = [
  { name: "High Priority", color: "#e74c3c" },
  { name: "Medium Priority", color: "#f1c40f" },
  { name: "Low Priority", color: "#2ecc71" },
];

const medicineData: MedicineItem[] = [
  {
    id: 1,
    genericName: "Acetaminophen",
    medicineName: "Paracetamol 500mg",
    category: "Schedule H",
    colorGradient: "#e74c3c, #f39c12",
  },
  {
    id: 2,
    genericName: "Ascorbic Acid",
    medicineName: "Vitamin C",
    category: "Schedule H1",
    colorGradient: "#2ecc71, #27ae60",
  },
  {
    id: 3,
    genericName: "Amoxicillin Trihydrate",
    medicineName: "Amoxicillin 500mg",
    category: "Schedule H",
    colorGradient: "#3498db, #2980b9",
  },
  {
    id: 4,
    genericName: "Morphine",
    medicineName: "Morphine 10mg",
    category: "Narcotic",
    colorGradient: "#9b59b6, #8e44ad",
  },
];

export default function ScheduleMedicine() {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const filteredByCategory = useMemo(() => {
    if (selectedCategory === "ALL") return medicineData;
    return medicineData.filter((item) => item.category === selectedCategory);
  }, [selectedCategory]);

  const {
    filteredData: filteredMedicines,
    searchTerm,
    setSearchTerm,
    resultCount,
    totalCount,
  } = useTableSearch({
    data: filteredByCategory,
    searchFields: ["genericName", "medicineName", "category"],
  });

  const titleSuffix = useMemo(() => {
    const selected = categoryOptions.find((opt) => opt.value === selectedCategory);
    return selected ? selected.label : "All";
  }, [selectedCategory]);

  return (
    <div style={{ padding: "1.5rem", height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
      <PageHeader
        icon={faListAlt}
        title={`Medicine List for ${titleSuffix} Category`}
        subtitle="Filter medicines by category and search by generic or medicine name"
      />

      <Card className="shadow-sm" style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        <Card.Header>
          <Row className="align-items-center g-3">
            <Col lg={6} md={12}>
              <SearchInput
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                placeholder="Search by generic or medicine name..."
                resultCount={resultCount}
                totalCount={totalCount}
                showResultCount={true}
              />
            </Col>
            <Col lg={6} md={12} className="d-flex align-items-center justify-content-lg-end gap-2">
              <label className="text-danger fw-medium">Choose Category Type:</label>
              <Form.Select
                size="sm"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{ maxWidth: "200px" }}
              >
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col xs={12}>
              <Row className="g-2">
                {colorLegend.map((legend) => (
                  <Col key={legend.name} xs={12} sm={4}>
                    <Badge
                      className="w-100 p-2"
                      style={{ backgroundColor: legend.color, color: "#fff" }}
                    >
                      {legend.name}
                    </Badge>
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
        </Card.Header>
        <Card.Body style={{ flex: 1, minHeight: 0, overflow: "auto", padding: 0 }}>
          <div style={{ overflowX: "auto", height: "100%" }}>
            <Table bordered hover className="mb-0" style={{ fontSize: "0.875rem" }}>
              <thead className="table-primary" style={{ position: "sticky", top: 0, zIndex: 10 }}>
                <tr>
                  <th className="text-center" style={{ width: "80px" }}>Sl.No</th>
                  <th className="text-nowrap">Generic Name</th>
                  <th className="text-nowrap">Medicine Name</th>
                </tr>
              </thead>
              <tbody>
                {filteredMedicines.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center text-danger py-4">
                      No records found for selected Category.
                    </td>
                  </tr>
                ) : (
                  filteredMedicines.map((item, index) => (
                    <tr key={item.id}>
                      <td className="text-center">{index + 1}</td>
                      <td>{item.genericName}</td>
                      <td
                        className="fw-medium"
                        style={{
                          background: `linear-gradient(to right, ${item.colorGradient})`,
                          color: "#fff",
                        }}
                      >
                        {item.medicineName}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
