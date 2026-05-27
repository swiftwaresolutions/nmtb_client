import React from 'react'
import { Button, Col, Row } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'

const UserTokenExpiry = () => {
    const navigate = useNavigate()
    return (
        <Row className='vh-100 justify-content-center align-items-center bg-primary'>
            <Col xs="5" className='bg-primary vh-40 rounded bg-white' >
                <Row className=' align-items-center h-100'>
                    <Col >
                        <Row className='row-cols-1'>
                            <Col className='text-center fs-3 pb-3'>Your Session has Expired</Col>
                            <Col className='text-center'><Button onClick={()=>navigate('/')}>Go To Login Page</Button></Col>
                        </Row>
                    </Col>
                </Row>
            </Col>
        </Row>
    )
}

export default UserTokenExpiry