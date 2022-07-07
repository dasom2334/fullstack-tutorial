import { Box, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import { InputField } from "../../../components/InputField";
import { Layout } from "../../../components/Layout";
import {
    usePostQuery,
    useUpdatePostMutation
} from "../../../generated/graphql";
import { createUrqlClient } from "../../../utils/createUrqlClient";
import { useGetIntId } from "../../../utils/useGetIntId";

const editPost: React.FC<{}> = ({}) => {
  const intId = useGetIntId();
  //   useIsAuth();
  const router = useRouter();
  const [{ data, error, fetching }] = usePostQuery({
    pause: intId === -1,
    variables: {
      id: intId,
    },
  });;
  const [, updatePost] = useUpdatePostMutation();
  if (fetching) {
    return (
      <Layout>
        <Box>Loading</Box>
      </Layout>
    );
  }
  if (!data?.post) {
    return (
      <Layout>
        <Box>Could Not Find Post.</Box>
      </Layout>
    );
  }
  return (
    <Layout variant="small">
      <Formik
        initialValues={{ title: data.post.title, text: data.post.text }}
        onSubmit={async (values, { setErrors }) => {
          const { error, data } = await updatePost({identifier:intId, input:{...values} });
          if (!error) {
            router.back();
          }
        }}
      >
        {({ isSubmitting, values, handleChange }) => (
          <Form>
            <InputField name="title" placeholder="title" label="title" />
            <Box mt={4}>
              <InputField
                name="text"
                placeholder="text"
                label="text"
                textarea={true}
              />
            </Box>
            <Button
              mt={4}
              type="submit"
              isLoading={isSubmitting}
              bgColor="teal"
              textColor="white"
            >
              Create Post
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};
export default withUrqlClient(createUrqlClient)(editPost);
