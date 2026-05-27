import React, { useState, useRef, useEffect } from "react";
import { Card, ListGroup } from "react-bootstrap";
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

interface GroupItem {
    id: number;
    groupName: string;
    itemCount: number;
}

interface ProductItem {
    slNo: number;
    materialName: string;
    stock: string;
    totalValue: string;
}

const GroupWiseReport: React.FC = () => {
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

    // Sample groups data
    const [groupsData] = useState<GroupItem[]>([
        { id: 1, groupName: "PHYSIO", itemCount: 12 },
        { id: 2, groupName: "RADIOLOGY", itemCount: 8 },
        { id: 3, groupName: "SURGICAL", itemCount: 15 },
        { id: 4, groupName: "DENTAL", itemCount: 10 }
    ]);

    // Sample products data for selected group
    const [allProductsData] = useState<{ [key: number]: ProductItem[] }>({
        1: [
            { slNo: 1, materialName: "ABDOMINAL BELT ( MEDIUM )", stock: "26 No(s)", totalValue: "11,908.00" },
            { slNo: 2, materialName: "ABDOMINAL BELT ( L)", stock: "80 Gm", totalValue: "5,500.00" },
            { slNo: 3, materialName: "ASH BRACE", stock: "20 No(s)", totalValue: "3,200.00" },
            { slNo: 1, materialName: "X-RAY FILM 14X17", stock: "150 Nos", totalValue: "45,000.00" },
            { slNo: 2, materialName: "CT CONTRAST MEDIUM", stock: "50 Bottles", totalValue: "75,000.00" },
            { slNo: 1, materialName: "X-RAY FILM 14X17", stock: "150 Nos", totalValue: "45,000.00" },
            { slNo: 2, materialName: "CT CONTRAST MEDIUM", stock: "50 Bottles", totalValue: "75,000.00" },
            { slNo: 1, materialName: "X-RAY FILM 14X17", stock: "150 Nos", totalValue: "45,000.00" },
            { slNo: 2, materialName: "CT CONTRAST MEDIUM", stock: "50 Bottles", totalValue: "75,000.00" },
            { slNo: 1, materialName: "X-RAY FILM 14X17", stock: "150 Nos", totalValue: "45,000.00" },
            { slNo: 1, materialName: "ABDOMINAL BELT ( MEDIUM )", stock: "26 No(s)", totalValue: "11,908.00" },
            { slNo: 2, materialName: "ABDOMINAL BELT ( L)", stock: "80 Gm", totalValue: "5,500.00" },
            { slNo: 3, materialName: "ASH BRACE", stock: "20 No(s)", totalValue: "3,200.00" },
            { slNo: 1, materialName: "X-RAY FILM 14X17", stock: "150 Nos", totalValue: "45,000.00" },
            { slNo: 2, materialName: "CT CONTRAST MEDIUM", stock: "50 Bottles", totalValue: "75,000.00" },
            { slNo: 1, materialName: "X-RAY FILM 14X17", stock: "150 Nos", totalValue: "45,000.00" },
            { slNo: 2, materialName: "CT CONTRAST MEDIUM", stock: "50 Bottles", totalValue: "75,000.00" },
            { slNo: 1, materialName: "X-RAY FILM 14X17", stock: "150 Nos", totalValue: "45,000.00" },
            { slNo: 2, materialName: "CT CONTRAST MEDIUM", stock: "50 Bottles", totalValue: "75,000.00" },
            { slNo: 1, materialName: "X-RAY FILM 14X17", stock: "150 Nos", totalValue: "45,000.00" },

        ],
        2: [
            { slNo: 1, materialName: "X-RAY FILM 14X17", stock: "150 Nos", totalValue: "45,000.00" },
            { slNo: 2, materialName: "CT CONTRAST MEDIUM", stock: "50 Bottles", totalValue: "75,000.00" }
        ],
        3: [
            { slNo: 1, materialName: "SURGICAL GLOVES", stock: "500 Pairs", totalValue: "12,500.00" },
            { slNo: 2, materialName: "SCALPEL BLADE", stock: "200 Nos", totalValue: "4,000.00" }
        ],
        4: [
            { slNo: 1, materialName: "DENTAL FORCEPS", stock: "25 Nos", totalValue: "18,750.00" },
            { slNo: 2, materialName: "DENTAL MIRROR", stock: "40 Nos", totalValue: "6,000.00" }
        ]
    });

    // State
    const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
    const [displayedData, setDisplayedData] = useState<ProductItem[]>([]);

    // Search and sort state
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [sortKey, setSortKey] = useState<keyof ProductItem | "">("");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

    // Update displayed data when group selection, search or sort changes
    React.useEffect(() => {
        if (selectedGroupId !== null) {
            const products = allProductsData[selectedGroupId] || [];
            updateDisplayedData(products, searchTerm, sortKey, sortDirection);
        } else {
            setDisplayedData([]);
        }
    }, [selectedGroupId, searchTerm, sortKey, sortDirection]);

    // Update displayed data with search and sort
    const updateDisplayedData = (
        records: ProductItem[], 
        search: string, 
        sortK: keyof ProductItem | "", 
        sortDir: "asc" | "desc"
    ) => {
        let result = records;

        // Apply search
        if (search) {
            result = searchTableData(result, search, ["materialName"]);
        }

        // Apply sort
        if (sortK) {
            result = sortTableData(result, sortK, sortDir);
        }

        setDisplayedData(result);
    };

    // Handle group selection
    const handleGroupClick = (groupId: number) => {
        setSelectedGroupId(groupId);
        // Reset search and sort when group changes
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
        const typedKey = key as keyof ProductItem;
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
        const selectedGroup = groupsData.find(g => g.id === selectedGroupId);
        const exportData = displayedData.map((record, index) => ({
            "S.No": index + 1,
            "Material Name": record.materialName,
            "Stock": record.stock,
            "Total Value": record.totalValue
        }));

        exportToExcel(
            exportData,
            `Group_Wise_Report_${selectedGroup?.groupName}_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
            "Group Wise Report"
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
        { key: "stock", label: "Stock", sortable: true },
        { 
            key: "totalValue", 
            label: "Total Value", 
            sortable: true,
            render: (value: string) => (
                <div style={{ textAlign: "right" }}>{value}</div>
            )
        }
    ];

    const selectedGroup = groupsData.find(g => g.id === selectedGroupId);

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
            {/* Report Header - Fixed at top */}
            <div className="px-4 pt-3 pb-2 no-print" style={{ flexShrink: 0 }}>
                <ReportHeader
                    title="Group-Wise Report"
                    subtitle={selectedGroup ? `Products under ${selectedGroup.groupName} group` : "Select a group to view products"}
                    onPrint={handlePrint}
                    onExport={handleExport}
                    onSearch={handleSearch}
                    showSearch={selectedGroupId !== null}
                    showSort={false}
                    showPrint={selectedGroupId !== null}
                    showExport={selectedGroupId !== null}
                />
            </div>

            {/* Two Column Layout - Scrollable */}
            <div className="px-4 pb-3" style={{ flex: 1, minHeight: 0, display: "flex", gap: "1rem" }}>
                {/* Left Side - Groups List */}
                <div style={{ flex: "0 0 250px", display: "flex", flexDirection: "column", minHeight: 0 }}>
                    <Card className="shadow-sm" style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
                        <Card.Header className="bg-light" style={{ flexShrink: 0 }}>
                            <h6 className="mb-0">
                                <i className="fas fa-layer-group me-2 text-primary"></i>
                                Groups
                            </h6>
                        </Card.Header>
                        <Card.Body className="p-0" style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
                            <ListGroup variant="flush">
                                {groupsData.map((group) => (
                                    <ListGroup.Item
                                        key={group.id}
                                        action
                                        active={selectedGroupId === group.id}
                                        onClick={() => handleGroupClick(group.id)}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <div className="d-flex justify-content-between align-items-center">
                                            <strong>{group.groupName}</strong>
                                            <span className="badge bg-secondary">{group.itemCount}</span>
                                        </div>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </div>

                {/* Right Side - Products Table */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
                    {/* Data Section - Show only after group selection */}
                    {selectedGroupId !== null && (
                        <Card className="shadow-sm" style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
                            <Card.Header className="bg-light" style={{ flexShrink: 0 }}>
                                <h5 className="mb-0">
                                    <i className="fas fa-box me-2 text-success"></i>
                                    Products under {selectedGroup?.groupName}
                                </h5>
                            </Card.Header>
                            <Card.Body className="p-0" style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
                                <ReportTable
                                    columns={columns}
                                    data={displayedData}
                                    emptyMessage={`No products found under ${selectedGroup?.groupName}`}
                                />
                            </Card.Body>
                            <Card.Footer className="bg-light" style={{ flexShrink: 0 }}>
                                <small className="text-muted">
                                    Showing {displayedData.length} product(s) under {selectedGroup?.groupName}
                                </small>
                            </Card.Footer>
                        </Card>
                    )}

                    {/* Empty State - Show when no group selected */}
                    {selectedGroupId === null && (
                        <Card className="shadow-sm text-center py-5">
                            <Card.Body>
                                <i className="fas fa-hand-pointer fa-3x text-muted mb-3"></i>
                                <h5 className="text-muted">Select a Group</h5>
                                <p className="text-muted mb-0">
                                    Please select a group from the left panel to view products
                                </p>
                            </Card.Body>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GroupWiseReport;
