import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { expressMiddleware } from "@apollo/server/express4";
import express from "express";
import http from "http";
import cors from "cors";
import { json } from "body-parser";
import { makeExecutableSchema } from "@graphql-tools/schema";
import typeDefs from "./graphql/typeDefs";
import resolvers from "./graphql/resolvers";
import { getSession } from "next-auth/react";
import { PrismaClient } from "@prisma/client";
import { PubSub } from "graphql-subscriptions";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import * as dotenv from "dotenv";
import { GraphQLContext, Session, SubscriptionContext } from "./util/types";

async function main() {
  dotenv.config();

  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });

  const app = express();
  const httpServer = http.createServer(app);
  const prisma = new PrismaClient();
  const pubsub = new PubSub();

  // Creating the WebSocket server
  const wsServer = new WebSocketServer({
    // This is the `httpServer` we created in a previous step.
    server: httpServer,
    // Pass a different path here if app.use
    // serves expressMiddleware at a different path
    path: "/graphql/subscriptions",
  });

  // Hand in the schema we just created and have the
  // WebSocketServer start listening.

  /**
   * Context parameters
   */

  const serverCleanup = useServer(
    {
      schema,
      context: async (ctx: SubscriptionContext): Promise<GraphQLContext> => {
        if (ctx.connectionParams && ctx.connectionParams.session) {
          const { session } = ctx.connectionParams;
          return { session, prisma, pubsub };
        }
        return { session: null, prisma, pubsub };
      },
    },
    wsServer
  );

  // const serverCleanup = useServer(
  //   {
  //     schema,
  //     context: async (ctx: SubscriptionContext): Promise<GraphQLContext> => {
  //       if (ctx.connectionParams && ctx.connectionParams.session) {
  //         const { session } = ctx.connectionParams;
  //         return {
  //           session,
  //           prisma,
  //           pubsub,
  //         };
  //       }
  //       return {
  //         session: null,
  //         prisma,
  //         pubsub,
  //       };
  //     },
  //   },
  //   wsServer
  // );

  const server = new ApolloServer({
    schema,
    csrfPrevention: true,
    plugins: [
      // Proper shutdown for the HTTP server.
      ApolloServerPluginDrainHttpServer({ httpServer }),

      // Proper shutdown for the WebSocket server.
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });
  await server.start();

  const allowedOrigins =
    process.env.NODE_ENV === "production"
      ? ["https://mewwsages.vercel.app"]
      : ["http://localhost:3000"];

  const corsOptions = {
    origin: allowedOrigins,
    credentials: true,
  };

  // const corsOptions = {
  //   origin: process.env.CLIENT_ORIGIN,
  //   credentials: true,
  // };

  app.use(
    "/graphql",
    cors<cors.CorsRequest>(corsOptions),
    json(),
    expressMiddleware(server, {
      context: async ({ req }): Promise<GraphQLContext> => {
        const session = await getSession({ req });

        return { session: session as Session, prisma, pubsub };
      },
    })
  );

  const PORT = process.env.PORT || 4000;

  await new Promise<void>((resolve) => httpServer.listen({ port: PORT }, resolve));
  console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
}

// wrapping the entire main in a catch block to see if any error occurs
main().catch((err) => console.log(err));
