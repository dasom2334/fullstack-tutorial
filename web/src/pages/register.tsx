import React from "react";
import { Formik, Form, Field } from "formik";
import { Box, Button, FormControl, FormLabel, Input } from "@chakra-ui/react";
import { Wrapper } from "../components/Wrapper";
import { InputField } from "../components/InputField";
import { useMutation } from "urql";
// import {FormControl, FormErrorMessage, FormLabel, Input} from '@chakra-ui/react';
interface registerProps {}

const REGISTER_MUT = `
mutation Register($username:String!, $password:String!) {
  register(options: {username:$username, password:$password}) {
    errors {
      field
      message
    }
    user {
      _id
      username
    }
  }
}
`;

const Register: React.FC<registerProps> = ({}) => {
  const [, register] = useMutation(REGISTER_MUT);

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ username: "", password: "" }}
        onSubmit={async (values) => {
          // console.log(values);
          const response = await register(values);
        }}
      >
        {({ isSubmitting, values, handleChange }) => (
          <Form>
            <InputField
              name="username"
              placeholder="username"
              label="Username"
            />
            <Box mt={4}>
            <InputField
              name="password"
              placeholder="password"
              label="Password"
              type="password"
            />
            </Box>
            <Button mt={4} type="submit" isLoading={isSubmitting} bgColor='teal' textColor='white'>
                Register
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default Register;
