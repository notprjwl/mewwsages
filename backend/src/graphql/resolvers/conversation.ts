import { GraphQlContext } from "../../util/types";

const resolvers = {
  Query: {},
  Mutation: {
    createConversation: async (_: any, args: { participantIds: Array<string> }, context: GraphQlContext ) => {
      console.log("INSIDE CREATE CONVERSATION RESOLVER", args);
    },
  },
};

export default resolvers;
