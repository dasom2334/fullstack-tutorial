import React from "react";
import { Formik, Form, Field } from "formik";
import { Box, Button, FormControl, FormLabel, Input } from "@chakra-ui/react";
import { Wrapper } from "../components/Wrapper";
import { InputField } from "../components/InputField";
import { useMutation } from "urql";
import { useLoginMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { useRouter } from "next/router";
// import {FormControl, FormErrorMessage, FormLabel, Input} from '@chakra-ui/react';
interface loginProps {}

const REGISTER_MUT = `
mutation Login($username:String!, $password:String!) {
  login(options: {username:$username, password:$password}) {
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

const Login: React.FC<loginProps> = ({}) => {
  // const [, login] = useMutation(REGISTER_MUT);
  const router = useRouter();
  const [, login] = useLoginMutation();

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ username: "", password: "" }}
        onSubmit={async (values, { setErrors }) => {
          // console.log(values);
          const response = await login({options:values});
          if (response.data?.login.errors) {
            [{ field: "username", message: "somthing wrong" }];
            setErrors(toErrorMap(response.data.login.errors));
          } else if (response.data?.login.user) {
            console.log(response.data.login.user)
            router.push("/");
          }
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
            <Button
              mt={4}
              type="submit"
              isLoading={isSubmitting}
              bgColor="teal"
              textColor="white"
            >
              Login
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default Login;
