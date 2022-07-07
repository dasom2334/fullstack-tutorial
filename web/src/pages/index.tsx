import {
  Box,
  Button,
  Flex,
  Heading,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import { useState } from "react";
import { EditDeletePostButton } from "../components/editDeletePostButton";
import { Layout } from "../components/Layout";
import { UpdootSection } from "../components/UpdootSection";
import { useMeQuery, usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 10,
    offset: 0,
    cursor: null as null | string,
  });
  const [{ data: meData }] = useMeQuery();
  const [{ data, fetching, error }] = usePostsQuery({
    variables,
    // pause: isServer,
  });
  if (!fetching && !data) {
    return <div>You Got Query Failed For Some Reason.</div>;
  }
  // console.log(error);
  return (
    <Layout>
      <>
        <Flex>
          <Heading>LiReddit</Heading>
          <NextLink href="/create-post">
            <Link ml="auto">create post</Link>
          </NextLink>
        </Flex>
        {!data?.posts ? (
          <Box>loading...</Box>
        ) : (
          <Box>
            <Stack spacing={8}>
              {data!.posts.map((p) =>
                !p ? null : (
                  <Flex key={p._id} p={5} shadow="md" borderWidth={1}>
                    <UpdootSection post={p} />
                    <Box ml={2} w="100%">
                      <Heading fontSize="xl">
                        <NextLink href={`/post/${p._id}`}>{p.title}</NextLink>
                      </Heading>
                      <Text>posted by {p.creator?.username}</Text>
                      <Text flex={1} mt={4}>
                        {p.textSnippet}
                      </Text>
                      {p.creator!._id == meData?.me?._id ? (
                        <Flex pl="auto">
                          <EditDeletePostButton post={p} />
                        </Flex>
                      ) : null}
                    </Box>
                  </Flex>
                )
              )}
            </Stack>
          </Box>
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
