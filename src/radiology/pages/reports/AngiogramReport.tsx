import React from "react";
import { Container, Card } from "react-bootstrap";
import PageHeader from "../../../components/PageHeader";
import { faHeart } from "@fortawesome/free-solid-svg-icons";

const AngiogramReport: React.FC = () => {
    return (
        <Container fluid className="p-4">
            <PageHeader
                icon={faHeart}
                title="Angiogram Report"
                subtitle="View angiogram reports"
            />

            <Card className="shadow-sm mt-4">
                <Card.Header className="bg-light">
                    <h5 className="mb-0">Angiogram Report</h5>
                </Card.Header>
                <Card.Body>
                    <p className="text-muted">
                        Content will be implemented here...
                    </p>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default AngiogramReport;
