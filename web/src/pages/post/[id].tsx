import { Box, Heading } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import React from "react";
import { Layout } from "../../components/Layout";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { useGetPostFromUrl } from "../../utils/useGetPostFromUrl";
import { EditDeletePostButton } from "../../components/editDeletePostButton";

const Post: React.FC<{}> = ({}) => {
  const [{ data, error, fetching }] = useGetPostFromUrl();
  console.log(data, fetching, error);
  if (fetching) {
    return <Heading>Loading...</Heading>;
  }
  if (!data?.post) {
    return <Heading>404 NOt FOUND</Heading>;
  }
  return (
    <Layout>
      <Box>
        <Heading mb={4}>{data?.post.title}</Heading>
        <Box ml="auto">{data?.post?.text}</Box>
        <EditDeletePostButton post={data.post} />
      </Box>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient)(Post);
