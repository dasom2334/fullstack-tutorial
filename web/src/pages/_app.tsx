import { ChakraProvider } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";

import { AppProps } from "next/app";
import theme from "../theme";
import { createUrqlClient } from "../utils/createUrqlClient";


function MyApp({ Component, pageProps }: AppProps) {
  return (
      <ChakraProvider resetCSS theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
  );
}

export default MyApp;
