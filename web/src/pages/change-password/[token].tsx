import { Box, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { NextPage } from "next";
import { InputField } from "../../components/InputField";
import { Wrapper } from "../../components/Wrapper";

const ChangePassword: NextPage<{ token: string }> = ({ token }) => {
  return (
    <>
      <div>{token}</div>

      <Wrapper variant="small">
        <Formik
          initialValues={{ newPassword: "" }}
          onSubmit={async (values, { setErrors }) => {}}
        >
          {({ isSubmitting, values, handleChange }) => (
            <Form>
              <Box mt={4}>
                <InputField
                  name="newPassword"
                  placeholder="newPassword"
                  label="New Password"
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
                Change Password
              </Button>
            </Form>
          )}
        </Formik>
      </Wrapper>
    </>
  );
};

ChangePassword.getInitialProps = ({ query }) => {
  return {
    token: query.token as string,
  };
};

export default ChangePassword;
