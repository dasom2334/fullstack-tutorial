import { Box, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import React, { useState } from "react";
import { InputField } from "../components/InputField";
import { Wrapper } from "../components/Wrapper";
import { useForgotPasswordMutation } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

export const forgotPassword: React.FC<{}> = ({}) => {
  const [complete, setCompolete] = useState(false);
  const [, forgotPassword] = useForgotPasswordMutation();
  return (
    <>
      <Wrapper variant="small">
        <Formik
          initialValues={{ email: "" }}
          onSubmit={async (values, { setErrors }) => {
            await forgotPassword(values);
            setCompolete(true);
            // console.log(values);
            // const response = await login(values);
            // if (response.data?.login.errors) {
            //   [{ field: "username", message: "somthing wrong" }];
            //   setErrors(toErrorMap(response.data.login.errors));
            // } else if (response.data?.login.user) {
            //   console.log(response.data.login.user);
            //   router.push("/");
            // }
          }}
        >
          {({ isSubmitting, values, handleChange }) =>
            complete ? (
              <Box>
                If an account with taht email exists, we sent you can email
              </Box>
            ) : (
              <Form>
                <Box mt={4}>
                  <InputField
                    name="email"
                    placeholder="email"
                    label="Email"
                  />
                </Box>
                <Button
                  mt={4}
                  type="submit"
                  isLoading={isSubmitting}
                  bgColor="teal"
                  textColor="white"
                >
                  Forgot Password
                </Button>
              </Form>
            )
          }
        </Formik>
      </Wrapper>
    </>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: false })(forgotPassword);
