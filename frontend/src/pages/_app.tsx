import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import "../../styles/globals.css";
import { ApolloProvider } from "@apollo/client";
import { client } from "../graphql/apollo-client";
import { Toaster } from "react-hot-toast";
import { ChakraProvider } from "@chakra-ui/react";
import { theme } from "../chakra/theme";


export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <ApolloProvider client={client}>
      <SessionProvider session={session}>
        <ChakraProvider theme={theme}>
          <Component {...pageProps} />
          <Toaster position='top-right' reverseOrder={true} />
        </ChakraProvider>
      </SessionProvider>
    </ApolloProvider>
  );
}
