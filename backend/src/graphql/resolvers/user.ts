import {GraphQLError} from 'graphql';
import { CreateUsernameResponse, GraphQLContext } from "../../util/types";
import { User } from "@prisma/client";

const resolvers = {
  Query: {
    searchUsers: async (_: any, args: { username: string }, context: GraphQLContext): Promise<Array<User>> => {
      const { username: searchedUsername } = args;
      const { session, prisma } = context;

      if (!session?.user) {
        throw new GraphQLError("Not authorized");
      }
      const {
        user: { username: myUsername },
      } = session;

      try {
        const users = await prisma.user.findMany({
          where: {
            username: {
              contains: searchedUsername,
              not: myUsername,
              mode: "insensitive",
            },
          },
        });
        return users;
      } catch (error: any) {
        console.log("searchUsers error", error);
        throw new GraphQLError("error?.message");
      }
    },
  },
  Mutation: {
    createUsername: async (_: any, args: { username: string }, context: GraphQLContext): Promise<CreateUsernameResponse> => {
      // resolvers can be passed 4 arguments in that order refer resolvers docs
      const { username } = args;
      const { session, prisma } = context;

      if (!session?.user) {
        return {
          error: "Not Authorized",
        };
      }
      const { id: userId } = session.user;

      try {
        /**
         * Check that username is not taken
         */
        // to check if the existing user has that username
        const existingUser = await prisma.user.findUnique({
          where: {
            username,
          },
        });

        if (existingUser) {
          return {
            error: "Username already taken. Try Another",
          };
        }

        /**
         * Update user with that username
         */
        await prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            username,
          },
        });
        return { success: true }; // we are not going to return the updated username because next-auth is going to do for us.
      } catch (error: any) {
        return { error: error?.message };
      }
    },
  },
};

export default resolvers;
