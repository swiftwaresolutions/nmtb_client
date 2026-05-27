import React, { useState, useRef, useEffect } from "react";
import { Container, Card, Button, Form, Col } from "react-bootstrap";
import ReportHeader from "../../../medical-records/components/ReportHeader";
import ReportTable from "../../../medical-records/components/ReportTable";
import { 
    searchTableData, 
    sortTableData, 
    exportToExcel, 
    printReport, 
    formatReportDate 
} from "../../../medical-records/utils/reportUtils";
import "../../../medical-records/styles/reportStyles.css";

interface StockItem {
    slNo: number;
    materialName: string;
    groupName: string;
    stock: string;
    costValue: string;
}

const StockRegister: React.FC = () => {
    // Reference for search input (for click-outside handler)
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Click outside handler to collapse search
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
                // Optional: Add logic to collapse search dropdown if needed
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const [selectedLetter, setSelectedLetter] = useState<string>("A");

    // Sample data - replace with API data
    const [tableData] = useState<StockItem[]>([
        {
            slNo: 1,
            materialName: "ABDOMINAL BELT ( MEDIUM )",
            groupName: "PHYSIO",
            stock: "26 No(s)",
            costValue: "11,908.00"
        },
        {
            slNo: 2,
            materialName: "ABDOMINAL BELT ( L)",
            groupName: "PHYSIO",
            stock: "80 Gm",
            costValue: "00.00"
        }
    ]);

    // Data state
    const [filteredByLetter, setFilteredByLetter] = useState<StockItem[]>([]);
    const [displayedData, setDisplayedData] = useState<StockItem[]>([]);

    // Search and sort state
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [sortKey, setSortKey] = useState<keyof StockItem | "">("");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

    // On mount or when letter changes, filter data by selected letter
    React.useEffect(() => {
        const filtered = tableData.filter(item => 
            item.materialName.toUpperCase().startsWith(selectedLetter)
        );
        setFilteredByLetter(filtered);
        updateDisplayedData(filtered, searchTerm, sortKey, sortDirection);
    }, [selectedLetter, tableData]);

    // Update displayed data when search or sort changes
    React.useEffect(() => {
        updateDisplayedData(filteredByLetter, searchTerm, sortKey, sortDirection);
    }, [searchTerm, sortKey, sortDirection, filteredByLetter]);

    // Update displayed data with search and sort
    const updateDisplayedData = (
        records: StockItem[], 
        search: string, 
        sortK: keyof StockItem | "", 
        sortDir: "asc" | "desc"
    ) => {
        let result = records;

        // Apply search
        if (search) {
            result = searchTableData(result, search, ["materialName", "groupName"]);
        }

        // Apply sort
        if (sortK) {
            result = sortTableData(result, sortK, sortDir);
        }

        setDisplayedData(result);
    };

    const handleLetterClick = (letter: string) => {
        setSelectedLetter(letter);
        // Reset search when letter changes
        setSearchTerm("");
        setSortKey("");
        setSortDirection("asc");
    };

    // Handle search
    const handleSearch = (term: string) => {
        setSearchTerm(term);
    };

    // Handle sort
    const handleSort = (key: string) => {
        const typedKey = key as keyof StockItem;
        if (sortKey === typedKey) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortKey(typedKey);
            setSortDirection("asc");
        }
    };

    // Handle print
    const handlePrint = () => {
        printReport();
    };

    // Handle export
    const handleExport = () => {
        const exportData = displayedData.map((record, index) => ({
            "S.No": index + 1,
            "Material Name": record.materialName,
            "Group Name": record.groupName,
            "Stock": record.stock,
            "Cost Value": record.costValue
        }));

        exportToExcel(
            exportData,
            `Stock_Register_${selectedLetter}_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
            "Stock Register"
        );
    };

    // Table columns configuration
    const columns = [
        { 
            key: "slNo", 
            label: "S. No", 
            sortable: false, 
            render: (_: any, __: any, idx: number) => idx + 1 
        },
        { key: "materialName", label: "Material Name", sortable: true },
        { key: "groupName", label: "Group Name", sortable: true },
        { key: "stock", label: "Stock", sortable: true },
        { 
            key: "costValue", 
            label: "Cost Value", 
            sortable: true,
            render: (value: string) => (
                <div style={{ textAlign: "right" }}>{value}</div>
            )
        }
    ];

    return (
        <Container fluid className="p-4">

            {/* Report Header with Search, Sort, Print, Export */}
            <ReportHeader
                title={`Stock Register - Letter '${selectedLetter}'`}
                subtitle={`Materials starting with '${selectedLetter}'`}
                onPrint={handlePrint}
                onExport={handleExport}
                onSearch={handleSearch}
                showSearch={true}
                showSort={false}
                showPrint={true}
                showExport={true}
            />

            {/* Alphabetical Filter Card */}
            <Card className="shadow-sm mb-3">
                <Card.Body>
                    <div className="d-flex flex-wrap gap-2 justify-content-center">
                        {alphabet.map((letter) => (
                            <Button
                                key={letter}
                                variant={selectedLetter === letter ? "primary" : "outline-primary"}
                                size="sm"
                                onClick={() => handleLetterClick(letter)}
                                style={{
                                    width: "40px",
                                    height: "40px",
                                    fontWeight: "var(--font-weight-semibold)"
                                }}
                            >
                                {letter}
                            </Button>
                        ))}
                    </div>
                </Card.Body>
            </Card>

            {/* Stock Data Card */}
            <Card className="shadow-sm">
                <Card.Body>
                    <ReportTable
                        columns={columns}
                        data={displayedData}
                        emptyMessage={`No materials found starting with '${selectedLetter}'`}
                    />

                    {/* Summary Footer */}
                    {displayedData.length > 0 && (
                        <div className="mt-3 text-end">
                            <small className="text-muted">
                                Showing {displayedData.length} item(s) for letter '{selectedLetter}'
                            </small>
                        </div>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
};

export default StockRegister;
