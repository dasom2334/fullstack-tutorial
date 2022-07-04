import { Box, Button, Flex, Link } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import { InputField } from "../components/InputField";
import { Wrapper } from "../components/Wrapper";
import { useLoginMutation } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { toErrorMap } from "../utils/toErrorMap";
import NextLink from "next/link";
interface loginProps {}

// const REGISTER_MUT = `
// mutation Login($username:String!, $password:String!) {
//   login(options: {username:$username, password:$password}) {
//     errors {
//       field
//       message
//     }
//     user {
//       _id
//       username
//     }
//   }
// }
// `;

const Login: React.FC<loginProps> = ({}) => {
  // const [, login] = useMutation(REGISTER_MUT);
  const router = useRouter();
  const [, login] = useLoginMutation();

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ usernameOrEmail: "", password: "" }}
        onSubmit={async (values, { setErrors }) => {
          const response = await login(values);
          if (response.data?.login.errors) {
            [{ field: "username", message: "somthing wrong" }];
            setErrors(toErrorMap(response.data.login.errors));
          } else if (response.data?.login.user) {
            if (typeof router.query.next == "string") {
              router.push(router.query.next);
            } else {
              router.push("/");
            }
          }
        }}
      >
        {({ isSubmitting, values, handleChange }) => (
          <Form>
            <InputField
              name="usernameOrEmail"
              placeholder="username Or Email"
              label="Username Or Email"
            />
            <Box mt={4}>
              <InputField
                name="password"
                placeholder="password"
                label="Password"
                type="password"
              />
            </Box>
            <Flex mt={2}>
              <NextLink href="/forgot-password">
                <Link>Forgot Password?</Link>
              </NextLink>
            </Flex>
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

export default withUrqlClient(createUrqlClient, { ssr: true })(Login);
