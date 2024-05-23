import { SessionProvider } from "next-auth/react";
import { Theme } from "@radix-ui/themes";
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import "../../styles/globals.css";
import { ApolloProvider } from "@apollo/client";
import { client } from "../graphql/apollo-client";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "../components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <ApolloProvider client={client}>
      <SessionProvider session={session}>
        <ThemeProvider attribute='class' defaultTheme='dark' enableSystem disableTransitionOnChange>
          <Theme appearance='dark'>
            <Component {...pageProps} />
            <Toaster />
          </Theme>
        </ThemeProvider>
      </SessionProvider>
    </ApolloProvider>
  );
}
