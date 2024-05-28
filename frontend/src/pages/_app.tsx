import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import "../../styles/globals.css";
import { ApolloProvider } from "@apollo/client";
import { client } from "../graphql/apollo-client";
import { Toaster } from "react-hot-toast";
import {ChakraProvider} from "@chakra-ui/react";
import { theme } from "../chakra/theme";


const inter = Inter({ subsets: ["latin"] });

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <ApolloProvider client={client}>
      <SessionProvider session={session}>
        <ChakraProvider theme={theme}>
            <Component {...pageProps} />
            <Toaster />
        </ChakraProvider>
      </SessionProvider>
    </ApolloProvider>
  );
}
