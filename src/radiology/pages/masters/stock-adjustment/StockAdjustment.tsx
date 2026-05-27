import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Container,
    Card,
    Button,
    Table,
} from "react-bootstrap";
import { useSelector } from "react-redux";
import { RootState } from "../../../../state/store";
import SearchInput from "../../../../components/SearchInput";
import { useTableSearch } from "../../../../hooks/useTableSearch";
import { ListCheck } from "react-bootstrap-icons";
import PageHeader from "../../../../components/PageHeader";
import { faBalanceScale } from "@fortawesome/free-solid-svg-icons";

interface Material {
    id: number;
    materialName: string;
    groupName: string;
    companyName: string;
}

const StockAdjustment = () => {
    const navigate = useNavigate();
    const loginData = useSelector((state: RootState) => state.loginData);
    const [selectedLetter, setSelectedLetter] = useState<string>("All");

    // Sample materials
    const [materials] = useState<Material[]>([
        {
            id: 1,
            materialName: "arm sling",
            groupName: "ORTHOPEDIC",
            companyName: "COMPANY",
        },
        {
            id: 2,
            materialName: "11X14",
            groupName: "X-RAY",
            companyName: "COMPANY",
        },
        {
            id: 3,
            materialName: "CT Contrast Media",
            groupName: "CONTRAST",
            companyName: "COMPANY",
        },
        {
            id: 4,
            materialName: "Ultrasound Gel",
            groupName: "CONSUMABLES",
            companyName: "COMPANY",
        },
        {
            id: 5,
            materialName: "Lead Apron",
            groupName: "PROTECTION",
            companyName: "COMPANY",
        },
    ]);

    // Filter by alphabet
    const alphabetFilteredMaterials = selectedLetter === "All" 
        ? materials 
        : materials.filter(m => m.materialName.toUpperCase().startsWith(selectedLetter));

    // Search functionality
    const {
        filteredData: filteredMaterials,
        searchTerm,
        setSearchTerm,
        resultCount,
        totalCount,
    } = useTableSearch({
        data: alphabetFilteredMaterials,
        searchFields: ["materialName", "groupName", "companyName"],
    });

    // Navigate to Material Code Details page
    const handleMaterialClick = (material: Material) => {
        navigate("/hims/radiology/masters/stock-adjustment/material-code-details", {
            state: { material },
        });
    };


    return (
        <Container fluid className="p-4">
            <PageHeader
                icon={faBalanceScale}
                title="Stock Adjustment - Material List"
                subtitle="View and manage material inventory adjustments"
                badges={[
                    { label: "Total Materials", value: materials.length },
                ]}
            />

            {/* Alphabet Filter */}
            <Card className="shadow-sm mt-4">
                <Card.Body className="p-3">
                    <div className="d-flex flex-wrap gap-2 align-items-center">
                        <strong className="me-2">Filter by:</strong>
                        <Button
                            variant={selectedLetter === "All" ? "primary" : "outline-primary"}
                            size="sm"
                            onClick={() => setSelectedLetter("All")}
                        >
                            All
                        </Button>
                        {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => (
                            <Button
                                key={letter}
                                variant={selectedLetter === letter ? "primary" : "outline-primary"}
                                size="sm"
                                onClick={() => setSelectedLetter(letter)}
                                style={{ minWidth: "40px" }}
                            >
                                {letter}
                            </Button>
                        ))}
                    </div>
                </Card.Body>
            </Card>

            <Card className="shadow-sm mt-3">
                <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                        <ListCheck size={22} className="me-2" />
                        Materials
                    </h5>
                    <SearchInput
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        placeholder="Search by material, group, or company..."
                        resultCount={resultCount}
                        totalCount={totalCount}
                        showResultCount={true}
                    />
                </Card.Header>
                <Card.Body>
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th style={{ width: "80px" }}>S.No</th>
                                <th>Material Name</th>
                                <th>Group Name</th>
                                <th>Company Name</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMaterials.length === 0 ? (
                                <tr>
                                    <td colSpan={4} style={{ textAlign: "center" }}>
                                        {searchTerm
                                            ? "No materials match your search."
                                            : "No materials available."}
                                    </td>
                                </tr>
                            ) : (
                                filteredMaterials.map((material, idx) => (
                                    <tr key={material.id}>
                                        <td>{idx + 1}</td>
                                        <td>
                                            <Button
                                                variant="link"
                                                className="p-0 text-start"
                                                style={{
                                                    textDecoration: "none",
                                                    fontWeight: "var(--font-weight-semibold)",
                                                    color: "#0d6efd",
                                                }}
                                                onClick={() => handleMaterialClick(material)}
                                            >
                                                {material.materialName}
                                            </Button>
                                        </td>
                                        <td>{material.groupName}</td>
                                        <td>{material.companyName}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default StockAdjustment;
