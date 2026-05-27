import React from 'react'
import { Button, Col, Container, Row, Toast } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { deleteCurrentError } from './state/error-handle-action'
import { RootState } from '../state/store'

const ErrorView = () => {
    const err = useSelector((s: RootState) => s.errorData)
    const dispatch = useDispatch()
    return (
        <>
            {err.length > 0 && <Row className={`p-1 user-select-none   `}>
                <Col className='max-h-80px overflow-auto rounded border'>
                    {err && err.map((msg, idx) => ({ msg, idx })).sort((a, b) => b.idx - a.idx).map((message, idx: number,arr) => {
                        return (
                            <Row className='m-1 align-items-center fs-12px rounded bg-danger text-white ps-2' key={idx} onClick={() => dispatch(deleteCurrentError(idx))}>
                                <Col className='flex-grow-0 text-nowrap'>{arr.length-idx}.</Col>
                                <Col className='text-center py-1 text-capitalize'>
                                    {message.msg}
                                </Col>
                                <Col className='flex-grow-0 text-center'>
                                    <Button variant='outline-warning' className='py-0' size='sm'>X</Button>
                                </Col>
                            </Row>
                        )
                    })}
                </Col>
            </Row>}
        </>
    )
}

export default ErrorView