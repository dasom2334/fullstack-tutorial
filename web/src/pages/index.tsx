import { Link } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import { NavBar } from "../components/NavBar";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import NextLink from 'next/link';
import { Layout } from "../components/Layout";

const Index = () => {
  const [{ data }] = usePostsQuery();
  return (
    <Layout>
      <>
      <NextLink href="/create-post">
        <Link>create post</Link>
      </NextLink>
      <div>Hello World</div>
      <br />
      {!data ? (
        <div>loading...</div>
      ) : (
        data.posts.map((p) => <div key={p._id}>{p.title}</div>)
      )}
      </>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
