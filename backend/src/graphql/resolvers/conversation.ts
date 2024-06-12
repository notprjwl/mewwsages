import { Prisma } from "@prisma/client";
import { ConversationPopulated, GraphQlContext } from "../../util/types";
import { ApolloError } from "apollo-server-core";

const resolvers = {
  Query: {
    conversations: async (_: any, __: any, context: GraphQlContext):Promise<Array<ConversationPopulated>> => {
      const { session, prisma } = context;

      if (!session?.user) {
        throw new ApolloError("NOT AUTHORIZED");
      }
      const {
        user: { id: userId },
      } = session;

      // using prisma to query all of the conversations
      try {
        /**
         * Find all conversation that the user is part of
         */
        const conversations = await prisma.conversation.findMany({
          where: {
            participants: {
              some: {
                userId: {
                  equals: userId,
                },
              },
            },
          },
          include: conversationPopulated,
        });
        return conversations;
        // return conversations.filter((conversation) => !!conversation.participants.find((p) => p.userId === userId));
      } catch (error: any) {
        console.log("CONVERSATIONS ERROR", error);
        throw new ApolloError(error?.message);
      }
    },
  },
  Mutation: {
    createConversation: async (_: any, args: { participantIds: Array<string> }, context: GraphQlContext): Promise<{ conversationId: string }> => {
      const { session, prisma } = context;
      const { participantIds } = args;

      console.log("PARTICIPANT IDS", participantIds);

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
