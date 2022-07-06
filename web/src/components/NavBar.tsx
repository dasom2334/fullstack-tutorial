import { Box, Button, Flex, Link } from "@chakra-ui/react";
import React from "react";
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
  const [{ data, fetching, error }] = useMeQuery({
    pause: isServer,
  });
  console.log(typeof window, data, fetching, error);

  let body = null;
  if (fetching || isServer) {
    body = (<Flex>Check Loged in...</Flex>)
  } else if (!data?.me) {
    body = (
      <Flex>
        <NextLink href="/login">
          <Link mr={2} textColor="white">
            Login
          </Link>
        </NextLink>
        <NextLink href="/register">
          <Link textColor="white">Register</Link>
        </NextLink>
      </Flex>
    );
  } else {
    body = (
      <Flex>
        <Box mr={2}>{data.me.username}</Box>
        <Button
          onClick={() => {
            logout();
          }}
          isLoading={logoutFetching}
          variant="link"
        >
          Logout
        </Button>
      </Flex>
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
      <Box ml={"auto"}>{body}</Box>
    </Flex>
  );
};
