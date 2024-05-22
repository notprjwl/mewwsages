import { CreateUsernameResponse, GraphQlContext } from "../../util/types";

const resolvers = {
  Query: {
    searchUsers: () => {},
  },
  Mutation: {
    createUsername: async (_: any, args: { username: string }, context: GraphQlContext): Promise<CreateUsernameResponse> => {
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
        // to check if the existing user with that username
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
        console.log("createUsername error", error);
        return { error: error?.message };
      }
    },
  },
};

export default resolvers;
