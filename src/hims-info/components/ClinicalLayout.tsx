import React from 'react'
import { Container, Row, Col, Card, FormLabel, Tabs, Tab, Button } from 'react-bootstrap'
import ErrorView from '../../error/ErrorView'

interface Props {
    children: React.ReactNode
}

const ClinicalLayout: React.FunctionComponent<Props> = (props: Props) => {
    return (
        <Row className='h-100 '>
            <Col className='mx-auto py-1 h-100'>
                <Card className='h-100 shadow px-1'>
                    <ErrorView />
                    {props.children}
                </Card>
            </Col>
        </Row>
    )
}

export default ClinicalLayout