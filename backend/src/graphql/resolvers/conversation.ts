import { Prisma } from "@prisma/client";
import { GraphQlContext } from "../../util/types";
import { ApolloError } from "apollo-server-core";

const resolvers = {
  Query: {},
  Mutation: {
    createConversation: async (_: any, args: { participantIds: Array<string> }, context: GraphQlContext): Promise<{ conversationId: string }> => {
      const { session, prisma } = context;
      const { participantIds } = args;

      console.log("PARTICIPANT IDS", participantIds)

      if (!session?.user) {
        throw new ApolloError("NOT AUTHORIZED");
      }

      const {
        user: { id: userId },
      } = session;

      try {
        const conversation = await prisma.conversation.create({
          data: {
            participants: {
              createMany: {
                data: participantIds.map((id) => ({
                  userId: id,
                  hasSeenLatestMessage: id === userId,
                })),
              },
            },
          },
          include: conversationPopulated,
        });

        // ADDING A CONVERSATION CREATE EVENT USING PUBSUB LATER

        return {
          conversationId: conversation.id,
        };
      } catch (error) {
        console.log("CREATE CONVERSATION ERROR", error);
        throw new ApolloError("ERROR CREATING CONVERSATION");
      }
    },
  },
};

export const participantPopulated = Prisma.validator<Prisma.ConversationParticipantInclude>()({
  user: {
    select: {
      id: true,
      username: true,
    },
  },
});

export const conversationPopulated = Prisma.validator<Prisma.ConversationInclude>()({
  participants: {
    include: participantPopulated,
  },
  latestMessage: {
    include: {
      sender: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  },
});

export default resolvers;
