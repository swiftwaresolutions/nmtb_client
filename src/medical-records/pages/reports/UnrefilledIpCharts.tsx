import React, { useEffect, useState } from "react";
import { Card, Container, Badge, Table } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDays } from "@fortawesome/free-solid-svg-icons";
import ReportHeader from "../../components/ReportHeader";
import "../../styles/reportStyles.css";
import { MedicalRecordsApiService, UnRefilledIpChartItem } from "../../../api/medical-records/medical-records-api-service";
import { showErrorToast } from "../../../utils/alertUtil";
import { useTableSearch } from "../../../hooks/useTableSearch";
import SearchInput from "../../../components/SearchInput";

const apiService = new MedicalRecordsApiService();

const UnrefilledIpCharts: React.FC = () => {
    const today = new Date().toLocaleDateString("en-GB");
    const [data, setData] = useState<UnRefilledIpChartItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const { filteredData, searchTerm, setSearchTerm, resultCount, totalCount } = useTableSearch({
        data,
        searchFields: ["opNo", "ipNo", "patientName", "wardBed"],
    });

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const result = await apiService.fetchUnRefilledIpCharts();
                setData(result);
            } catch {
                showErrorToast("Failed to fetch unfilled IP charts");
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    return (
        <div className="content-wrapper">
            <ReportHeader
                title="Un Refilled I.P Charts"
                subtitle="List of IP patients with unfilled charts"
            />

            <Container fluid className="px-3 py-3">
                <Card className="shadow-sm border-0">
                    <Card.Header className="bg-white border-bottom py-3 px-3">
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                            <div>
                                <h6 className="mb-2 fw-bold text-dark">Un Refilled I.P Charts</h6>
                                <small className="text-muted d-block">
                                    <FontAwesomeIcon icon={faCalendarDays} className="me-1" />
                                    Date: <span className="fw-bold text-primary">{today}</span>
                                </small>
                            </div>
                            <div className="d-flex align-items-center gap-3">
                                <SearchInput
                                    searchTerm={searchTerm}
                                    onSearchChange={setSearchTerm}
                                    placeholder="Search by name, OP/IP No..."
                                    resultCount={resultCount}
                                    totalCount={totalCount}
                                />
                                <Badge bg="primary" text="white" className="px-3 py-2">
                                    Total Records: <span className="fw-bold">{filteredData.length}</span>
                                </Badge>
                            </div>
                        </div>
                    </Card.Header>
                    <Card.Body className="p-0">
                        <div style={{ maxHeight: "600px", overflowY: "auto" }}>
                            <Table bordered hover size="sm" className="mb-0">
                                <thead className="table-primary" style={{ position: "sticky", top: 0, zIndex: 1 }}>
                                    <tr>
                                        <th className="text-center" style={{ minWidth: "60px" }}>Sl.NO</th>
                                        <th className="text-center" style={{ minWidth: "110px" }}>OP Number</th>
                                        <th className="text-center" style={{ minWidth: "110px" }}>IP Number</th>
                                        <th style={{ minWidth: "150px" }}>Patient Name</th>
                                        <th style={{ minWidth: "160px" }}>Ward / Bed</th>
                                        <th className="text-center" style={{ minWidth: "140px" }}>Discharged Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-4 text-muted">Loading...</td>
                                        </tr>
                                    ) : filteredData.length > 0 ? (
                                        filteredData.map((item, index) => (
                                            <tr key={index}>
                                                <td className="text-center fw-semibold text-primary">{index + 1}</td>
                                                <td className="text-center">{item.opNo}</td>
                                                <td className="text-center">{item.ipNo}</td>
                                                <td>&nbsp;&nbsp;{item.patientName}</td>
                                                <td>&nbsp;&nbsp;{item.wardBed}</td>
                                                <td className="text-center">{item.dischargeDate}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="text-center py-4 text-muted">No unfilled IP charts found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </div>
                    </Card.Body>
                    <Card.Footer className="bg-light px-3 py-2 text-muted small">
                        Total Unfilled Charts: <span className="fw-bold text-primary">{filteredData.length}</span>
                    </Card.Footer>
                </Card>
            </Container>
        </div>
    );
};

export default UnrefilledIpCharts;
