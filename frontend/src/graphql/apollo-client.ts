import { ApolloClient, HttpLink, InMemoryCache, split } from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import { createClient } from "graphql-ws";
import { getSession } from "next-auth/react";

const httpLink = new HttpLink({
  uri: "http://localhost:4000/graphql", // every endpoints store in graphql
  credentials: "include",
});

// WebSockets are used for real-time, event-driven communication between clients and servers.
// We are using this for the real time conversations
/**
 * The `wsLink` variable is conditionally created based on whether the
 * code is running in a browser environment or not. If it is running in a
 * browser environment, a `GraphQLWsLink` instance is created using the
 * `createClient` function from the `graphql-ws` library. This link is
 * configured to use a WebSocket connection with the URL "ws://localhost:4000/graphql/subscriptions".
 *
 * If the code is not running in a browser environment, `wsLink` is set to `null`.
 * This means that no WebSocket connection will be used.
 * refer apollo docs https://www.apollographql.com/docs/react/data/subscriptions
 */

const wsLink =
  typeof window !== "undefined"
    ? new GraphQLWsLink(
        createClient({
          url: "ws://localhost:4000/graphql/subscriptions",
          connectionParams: async () => ({
            session: await getSession,
          }),
        })
      )
    : null;

const link =
  typeof window !== "undefined" && wsLink != null
    ? split(
        ({ query }) => {
          const definition = getMainDefinition(query);
          return definition.kind === "OperationDefinition" && definition.operation === "subscription";
        },
        wsLink,
        httpLink
      )
    : httpLink;

// new apollo client
export const client = new ApolloClient({
  link,
  cache: new InMemoryCache(), // it provides an option to store in the cache
});
