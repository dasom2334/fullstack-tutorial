import { Box, Button, Flex, Heading, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import React from "react";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
  const [{ data, fetching, error }] = useMeQuery({
    // pause: isServer,
  });
  console.log(typeof window, data, fetching, error);

  let body = null;
  if (fetching) {
    body = <Flex>Check Loged in...</Flex>;
  } else if (!data?.me) {
    body = (
      <Box ml={"auto"} my={"auto"}>
        <NextLink href="/login">
          <Link mr={2} textColor="white">
            Login
          </Link>
        </NextLink>
        <NextLink href="/register">
          <Link textColor="white">Register</Link>
        </NextLink>
      </Box>
    );
  } else {
    body = (
      <Box ml={"auto"} my={"auto"}>
        <Link mr={2}>{data.me.username}</Link>
        <Button
          onClick={() => {
            logout();
          }}
          isLoading={logoutFetching}
          variant="link"
        >
          Logout
        </Button>
      </Box>
    );
  }
  return (
    <Flex
      bgColor="tan"
      p={4}
      ml={"auto"}
      position="sticky"
      top={0}
      zIndex={100}
    >
      <Flex w="100%">
        <Box my={"auto"}>
          <NextLink href="/">
            <Link textColor="white">
              <Heading mr="auto">LiReddit</Heading>
            </Link>
          </NextLink>
        </Box>

        {body}
      </Flex>
    </Flex>
  );
};
