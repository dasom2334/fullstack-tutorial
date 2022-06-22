import React from 'react';
import {Formik, Form, Field} from 'formik';
import {
    FormControl,
    FormLabel,
    FormErrorMessage,
    FormHelperText,
  } from '@chakra-ui/react';
import { Input } from '@chakra-ui/react';
import { Button } from '@chakra-ui/react';
// import {FormControl, FormErrorMessage, FormLabel, Input} from '@chakra-ui/react';
interface registerProps {}

const Register: React.FC<registerProps> = ({}) => {
    function validateName(value) {
        let error
        if (!value) {
        error = 'Name is required'
        } else if (value.toLowerCase() !== 'naruto') {
        error = "Jeez! You're not a fan 😱"
        }
        return error
    }
    
    return (
    <>
        <Formik initialValues = {
            {username : "", password : ""}
        }
        onSubmit = {
            (values) => {
                console.log(values);
            }
        }> 
        {
            ({values, handleChange}) => (
                <Form><FormControl> < FormLabel htmlFor = 'username' > Username</FormLabel> < Input value = {
                    values.username
                }
                onChange = {
                    handleChange
                }
                id = 'username' placeholder = 'username' /> 
                {/* <FormErrorMessage>{form.errors.name}</FormErrorMessage> */
                }</FormControl></Form>
            )
        }
        </Formik>
    </>
    
    )
}

export default Register;
