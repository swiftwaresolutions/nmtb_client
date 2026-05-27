import { Button, Col, Container, Form, Row } from "react-bootstrap";
import ClinicalLayout from "../hims-info/components/ClinicalLayout";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { LoginApiService } from "../api/login/login-api-service";
import { handleError } from "../utils/errorUtil";
import { toastErrorBounceDark, toastSuccessBounceDark } from "../utils/toast";
import { useNavigate } from "react-router-dom";

const ChangePassword = () => {

     const loginService = new LoginApiService()
     const loginData = useSelector((state: any) => state.loginData)
     const dispatch = useDispatch()
     const navigate = useNavigate();
     const [user, setUser] = useState({ userName: "", currentPassword: "", newPassword: "", confirmPassword: "" })

     const handleChange = (e: any) => {
          const { name, value } = e.target
          setUser((pre: any) => ({ ...pre, [name]: value }))
     }

     const changePassword = async (e: any) => {
          e.preventDefault();
          
          if(!user.currentPassword || !user.confirmPassword || !user.newPassword){
               toastErrorBounceDark("Please fill in all fields")
               return;
          }

          if(user.newPassword !== user.confirmPassword){
               toastErrorBounceDark("New password and confirm password do not match");
               return;
          }

          try {
               const res = await loginService.changePassword(user);
               toastSuccessBounceDark("Password Change Successfully!");
               setUser({ userName: "", currentPassword: "", newPassword: "", confirmPassword: "" });
          } catch (error) {
               handleError(dispatch, error)
          }
     };

     return (
          <ClinicalLayout>
               <Container fluid="lg" className='clinical-general-container overflow-auto d-flex h-100 flex-column'>
                    <Row className='align-items-center pb-1 pt-3'>
                         <Col className='fw-bold py-0 text-success text- text-uppercase ps-2 letter-spacing-05px text-decoration-underline link-offset-3 '>
                              Change Password :
                         </Col>
                    </Row>
                    <Row className="d-flex justify-content-center align-items-center pt-4">
                         <Col xs={12} md={6} lg={5}>
                              <Form className='row border shadow p-5' onSubmit={(e) => changePassword(e)}>
                                   <Form.Group className="row align-items-center pb-3">
                                        <Row className='p-0  justify-content-center'>
                                             <Form.Control type="text" placeholder="UserName" name='userName' className='w-75 ps-3' value={loginData?.name} onChange={handleChange} readOnly/>
                                        </Row>
                                   </Form.Group>
                                   <Form.Group className="row align-items-center pb-3" >
                                        <Row className='p-0 justify-content-center'>
                                             <Form.Control type="password" placeholder="Current Password" name='currentPassword' className='w-75 ps-3' value={user?.currentPassword} onChange={handleChange} autoFocus/>
                                        </Row>
                                   </Form.Group>
                                   <Form.Group className="row align-items-center pb-3" >
                                        <Row className='p-0 justify-content-center'>
                                             <Form.Control type="password" placeholder="New Password" name='newPassword' className='w-75 ps-3' value={user?.newPassword} onChange={handleChange} />
                                        </Row>
                                   </Form.Group>
                                   <Form.Group className="row align-items-center pb-3" >
                                        <Row className='p-0 justify-content-center'>
                                             <Form.Control type="password" placeholder="Confirm Password" name='confirmPassword' className='w-75 ps-3' value={user?.confirmPassword} onChange={handleChange} />
                                        </Row>
                                   </Form.Group>
                                   <Row className=' justify-content-center'>
                                        <Col className='pt-3'>
                                             <Row>
                                                  <Col className="text-danger text-center fs-15px"></Col>
                                                  <Col className="flex-grow-0"><Button variant='success' className='px-4' type='submit' >Submit</Button></Col>
                                             </Row>
                                        </Col>
                                   </Row>
                              </Form>
                         </Col>
                    </Row>
               </Container>
          </ClinicalLayout>
     );
}

export default ChangePassword;