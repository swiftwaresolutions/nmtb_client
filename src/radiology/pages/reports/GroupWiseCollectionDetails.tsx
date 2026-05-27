import React, { useState, useRef, useEffect } from "react";
import { Container, Card, Button } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import ReportHeader from "../../../medical-records/components/ReportHeader";
import ReportTable from "../../../medical-records/components/ReportTable";
import { 
    searchTableData, 
    sortTableData, 
    exportToExcel, 
    printReport
} from "../../../medical-records/utils/reportUtils";
import "../../../medical-records/styles/reportStyles.css";

interface InvestigationDetail {
    slNo: number;
    name: string;
    opNo: string;
    billNo: string;
    rate: string;
}

const GroupWiseCollectionDetails: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Get study name from navigation state
    const studyName = location.state?.study || "Investigation Details";

    // Sample data - 45 records as provided
    const [tableData] = useState<InvestigationDetail[]>([
        { slNo: 1, name: "MR.PALANI KUMAR", opNo: "526754", billNo: "CA18385", rate: "350.00" },
        { slNo: 2, name: "MRS.JAYA SRI", opNo: "527485", billNo: "CA20166", rate: "350.00" },
        { slNo: 3, name: "J.BOOMIKA SHREE", opNo: "527958", billNo: "CA21266", rate: "350.00" },
        { slNo: 4, name: "SELVI.DHANSIKA", opNo: "493937", billNo: "CA24360", rate: "350.00" },
        { slNo: 5, name: "MR.ANANDHA RAJ", opNo: "529351", billNo: "CA24698", rate: "350.00" },
        { slNo: 6, name: "S.KIRUTHIK", opNo: "530077", billNo: "CA26198", rate: "350.00" },
        { slNo: 7, name: "R.PRANEETHA", opNo: "496934", billNo: "CA28085", rate: "350.00" },
        { slNo: 8, name: "G. RITHIKA", opNo: "531922", billNo: "CA30721", rate: "350.00" },
        { slNo: 9, name: "M. VISHNU DEV", opNo: "533474", billNo: "CA38659", rate: "350.00" },
        { slNo: 10, name: "K. PRITHI", opNo: "537123", billNo: "CA44102", rate: "350.00" },
        { slNo: 11, name: "C.VIKASH", opNo: "537349", billNo: "CA44598", rate: "350.00" },
        { slNo: 12, name: "BABY. HANU DHIVI", opNo: "538219", billNo: "CA46773", rate: "300.00" },
        { slNo: 13, name: "MRS.BACKIYALAKSHMI", opNo: "463269", billNo: "CA47751", rate: "350.00" },
        { slNo: 14, name: "MAS.KAMALESHWAR", opNo: "538678", billNo: "CA47936", rate: "350.00" },
        { slNo: 15, name: "S. SUJA", opNo: "538948", billNo: "CA48712", rate: "350.00" },
        { slNo: 16, name: "B/O.SUDHA", opNo: "540815", billNo: "CA53661", rate: "450.00" },
        { slNo: 17, name: "MR. LAKSHMANAN", opNo: "540942", billNo: "CA53816", rate: "350.00" },
        { slNo: 18, name: "MRS. NANDHINI", opNo: "466904", billNo: "CA56715", rate: "350.00" },
        { slNo: 19, name: "MR.MARUTHAI", opNo: "542579", billNo: "CA60337", rate: "350.00" },
        { slNo: 20, name: "R.INIYA SRI", opNo: "543468", billNo: "CA24", rate: "350.00" },
        { slNo: 21, name: "M. PUGAZHARASAN", opNo: "544418", billNo: "CA2449", rate: "400.00" },
        { slNo: 22, name: "P.PRANITHI", opNo: "506721", billNo: "CA3716", rate: "350.00" },
        { slNo: 23, name: "P.PRANITHI", opNo: "506721", billNo: "CA4107", rate: "350.00" },
        { slNo: 24, name: "S.MAGIZHINI", opNo: "483597", billNo: "CA5344", rate: "350.00" },
        { slNo: 25, name: "S.SRITHIKA", opNo: "514013", billNo: "CA5390", rate: "350.00" },
        { slNo: 26, name: "MR.SATHISHKUMAR", opNo: "510471", billNo: "CA6215", rate: "450.00" },
        { slNo: 27, name: "MRS.RAMYA", opNo: "508042", billNo: "CA13575", rate: "350.00" },
        { slNo: 28, name: "R.HARI HARA SUDHAN", opNo: "548852", billNo: "CA15176", rate: "350.00" },
        { slNo: 29, name: "MRS.PANDIAMMAL", opNo: "521639", billNo: "CA16626", rate: "350.00" },
        { slNo: 30, name: "P.KAVI VARNAN", opNo: "545677", billNo: "CA17273", rate: "350.00" },
        { slNo: 31, name: "MRS. VIJAYALAKSHMI", opNo: "550461", billNo: "CA17938", rate: "350.00" },
        { slNo: 32, name: "R.THISHASHREE", opNo: "550967", billNo: "CA19327", rate: "350.00" },
        { slNo: 33, name: "A.ARIYA DHARSHAN", opNo: "552856", billNo: "CA24050", rate: "350.00" },
        { slNo: 34, name: "A.ARIYA DHARSHAN", opNo: "552856", billNo: "CA24162", rate: "350.00" },
        { slNo: 35, name: "MRS. R. PALANIAMMAL", opNo: "519909", billNo: "CA24627", rate: "350.00" },
        { slNo: 36, name: "BABY.SIDDHANTH", opNo: "475764", billNo: "CA24667", rate: "400.00" },
        { slNo: 37, name: "T. SAKTHI PANDI", opNo: "496880", billNo: "CA25798", rate: "350.00" },
        { slNo: 38, name: "S.VIYAN", opNo: "549568", billNo: "CA27172", rate: "350.00" },
        { slNo: 39, name: "MRS.AKLIANDESHWARI", opNo: "502248", billNo: "CA28874", rate: "350.00" },
        { slNo: 40, name: "R.MAGIZH AATHINI", opNo: "537238", billNo: "CA31125", rate: "400.00" },
        { slNo: 41, name: "D.HARISUDHAN", opNo: "556199", billNo: "CA32723", rate: "350.00" },
        { slNo: 42, name: "P.KUBENDRAN", opNo: "539029", billNo: "CA36295", rate: "350.00" },
        { slNo: 43, name: "P.SASWANTH", opNo: "558078", billNo: "CA37642", rate: "350.00" },
        { slNo: 44, name: "MRS.PONSELVI", opNo: "558161", billNo: "CA41156", rate: "350.00" },
        { slNo: 45, name: "M.HEMANTHAN", opNo: "559493", billNo: "CA41188", rate: "350.00" }
    ]);

    // State for table controls
    const [displayedData, setDisplayedData] = useState<InvestigationDetail[]>(tableData);
    const [searchTerm, setSearchTerm] = useState("");

    // Initialize displayed data
    useEffect(() => {
        updateDisplayedData(tableData, searchTerm);
    }, [tableData]);

    // Update displayed data with search
    const updateDisplayedData = (
        records: InvestigationDetail[], 
        search: string
    ) => {
        let result = records;

        // Apply search
        if (search) {
            result = searchTableData(result, search, ["name", "opNo", "billNo"]);
        }

        setDisplayedData(result);
    };

    // Handle search
    const handleSearch = (value: string) => {
        setSearchTerm(value);
        updateDisplayedData(tableData, value);
    };

    // Handle export
    const handleExport = () => {
        exportToExcel(displayedData, `Investigation_Details_${studyName.replace(/\s+/g, '_')}`);
    };

    // Handle print
    const handlePrint = () => {
        printReport();
    };

    // Handle back button
    const handleBack = () => {
        navigate(-1);
    };

    // Column configuration
    const columns = [
        { 
            key: "slNo" as keyof InvestigationDetail, 
            label: "SLNO", 
            sortable: true 
        },
        { 
            key: "name" as keyof InvestigationDetail, 
            label: "Name", 
            sortable: true 
        },
        { 
            key: "opNo" as keyof InvestigationDetail, 
            label: "OP.No", 
            sortable: true 
        },
        { 
            key: "billNo" as keyof InvestigationDetail, 
            label: "Bill No", 
            sortable: true 
        },
        { 
            key: "rate" as keyof InvestigationDetail, 
            label: "Rate", 
            sortable: true,
            align: "right" as const
        }
    ];

    return (
        <>
            <Container fluid className="px-4 py-3">
                {/* Header */}
                <ReportHeader
                    title={`Investigation Details - ${studyName}`}
                    showSearch={true}
                    onSearch={handleSearch}
                    showExport={true}
                    onExport={handleExport}
                    showPrint={true}
                    onPrint={handlePrint}
                />

                {/* Back Button */}
                <div className="mb-3">
                    <Button 
                        variant="outline-secondary" 
                        size="sm"
                        onClick={handleBack}
                    >
                        <i className="fas fa-arrow-left me-2"></i>
                        Back to Collection Report
                    </Button>
                </div>

                {/* Data Card */}
                {displayedData.length > 0 ? (
                    <Card className="shadow-sm border-0">
                        <Card.Body className="p-0">
                            <ReportTable
                                columns={columns}
                                data={displayedData}
                            />
                        </Card.Body>
                        <Card.Footer className="bg-light text-muted text-end py-2">
                            <small>Total Records: {displayedData.length}</small>
                        </Card.Footer>
                    </Card>
                ) : (
                    <Card className="shadow-sm border-0 text-center py-5">
                        <Card.Body>
                            <div style={{ fontSize: "3rem", color: "#dee2e6" }}>
                                <i className="fas fa-inbox"></i>
                            </div>
                            <h5 className="text-muted mt-3">No Details Available</h5>
                            <p className="text-muted">No investigation details found for this study.</p>
                        </Card.Body>
                    </Card>
                )}
            </Container>
        </>
    );
};

export default GroupWiseCollectionDetails;
