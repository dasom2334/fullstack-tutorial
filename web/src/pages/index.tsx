import {
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  IconButton,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import { NavBar } from "../components/NavBar";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import NextLink from "next/link";
import { Layout } from "../components/Layout";
import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { UpdootSection } from "../components/UpdootSection";

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 10,
    offset: 0,
    cursor: null as null | string,
  });
  const [{ data, fetching, error }] = usePostsQuery({
    variables,
  });
  if (!fetching && !data) {
    return <div>You Got Query Failed For Some Reason.</div>;
  }
  return (
    <Layout>
      <>
        <Flex>
          <Heading>LiReddit</Heading>
          <NextLink href="/create-post">
            <Link ml="auto">create post</Link>
          </NextLink>
        </Flex>
        {!data ? (
          <Box>loading...</Box>
        ) : (
          <Stack spacing={8}>
            {data.posts.map((p) => (
              <Flex key={p._id} p={5} shadow="md" borderWidth={1}>
                <UpdootSection post={p} />
                <Box ml={2}>
                  <Heading fontSize="xl">{p.title}</Heading>
                  <Text>posted by {p.creator.username}</Text>
                  <Text mt={4}>{p.textSnippet}</Text>
                </Box>
              </Flex>
            ))}
          </Stack>
        )}
        {data ? (
          <Flex mt={8}>
            <Button
              isLoading={fetching}
              m="auto"
              onClick={() => {
                setVariables({
                  limit: variables.limit,
                  offset: variables.offset + variables.limit,
                  // cursor: data.posts[data.posts.length-1].createdAt
                  cursor: null,
                });
              }}
            >
              Load More
            </Button>
          </Flex>
        ) : null}
      </>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
